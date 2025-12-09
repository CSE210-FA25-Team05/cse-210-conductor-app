'use strict';

const { Prisma } = require('@prisma/client');
class InteractionService {
  constructor(interactionRepo) {
    this.interactionRepo = interactionRepo;
  }

  // Get the interaction config for a course (may be null)
  async getConfig(course) {
    return this.interactionRepo.getConfig(course.id);
  }

  sanitizeConfig(config) {
    // Add any sanitization logic here if needed
    config.options.forEach((option) => {
      option.value = option.value.trim();
      option.color = option.color.trim();
    });

    return config;
  }

  isConfigValid(configObj) {
    const options = configObj.options;

    // Ensure configObj has at least 2 options
    if (!Array.isArray(options) || options.length < 2) {
      return false;
    }

    // Ensure values are unique
    const seenValues = new Set();
    for (const option of options) {
      if (option.value.length === 0 || seenValues.has(option.value)) {
        return false;
      }
      seenValues.add(option.value);
    }

    // Ensure colors are unique
    const seenColors = new Set();
    for (const option of options) {
      if (option.color.length === 0 || seenColors.has(option.color)) {
        return false;
      }
      seenColors.add(option.color);
    }

    return true;
  }

  // Update the interaction config. If the existing config is not editable, throws.
  // `configObj` is expected to be JSON-serializable (e.g., { options: [...] } or an array)
  async upsertConfig(course, configObj) {
    configObj = this.sanitizeConfig(configObj);
    if (!this.isConfigValid(configObj)) {
      const e = new Error(
        'Invalid interaction configuration: must have at least 2 options with non-empty, unique values and colors'
      );
      e.code = 'BAD_REQUEST';
      throw e;
    }

    const existing = await this.interactionRepo.getConfig(course.id);
    if (!existing) {
      return this.interactionRepo.createConfig(course.id, configObj, true);
    }

    if (!existing.is_editable) {
      const e = new Error(
        'Interaction configuration is locked and cannot be edited'
      );
      e.code = 'UNPROCESSABLE_ENTITY';
      throw e;
    }

    return this.interactionRepo.updateConfig(course.id, existing.id, configObj);
  }

  // Submit an interaction atomically: validate option against config JSON, create interaction,
  // and flip is_editable -> false if it was true (performed in same transaction).
  async submitInteraction(
    course,
    user,
    enrollment,
    { selectedOption, description = null }
  ) {
    const created = await this.interactionRepo.db.$transaction(async (tx) => {
      const cfg = await this.interactionRepo.getConfig(course.id, tx);
      if (!cfg) {
        const e = new Error('Interaction configuration not found for course');
        e.code = 'NOT_FOUND';
        throw e;
      }

      // Resolve options array in multiple possible shapes
      let opts = cfg.config.options;

      const option = opts.find((o) => o.value === selectedOption);

      if (!option) {
        const e = new Error('Invalid interaction option');
        e.code = 'BAD_REQUEST';
        throw e;
      }

      const optionKeyResolved = option.value;

      const interactionData = {
        courseId: course.id,
        configId: cfg.id,
        userId: user.id,
        teamId: enrollment.team_id,
        value: optionKeyResolved,
        description,
      };
      const createdInteraction = await this.interactionRepo.createInteraction(
        interactionData,
        tx
      );

      if (cfg.is_editable) {
        await this.interactionRepo.lockConfigIfEditable(course.id, tx);
      }

      return this.mapInteractionToResponse(createdInteraction);
    });

    return created;
  }

  async getInteractions(course, filters = {}) {
    const interactions = await this.interactionRepo.getInteractions(
      course.id,
      this.mapFiltersToWhereClause(filters)
    );
    return interactions.map(this.mapInteractionToResponse);
  }

  async getAggregatedStats(course, filters = {}) {
    const { start_date, end_date, bucket = 'week', author_id } = filters;

    // WHITELIST bucket to prevent SQL injection (can't parameterize function names)
    const validBuckets = ['hour', 'day', 'week', 'month'];
    if (!validBuckets.includes(bucket)) {
      const e = new Error(
        `Invalid bucket parameter. Must be one of: ${validBuckets.join(', ')}`
      );
      e.code = 'BAD_REQUEST';
      throw e;
    }

    // Build WHERE conditions safely with Prisma.sql
    const conditions = [Prisma.sql`course_id = ${course.id}`];

    if (author_id != null) {
      conditions.push(Prisma.sql`author_id = ${author_id}`);
    }

    if (filters.values != null && filters.values.length > 0) {
      conditions.push(Prisma.sql`value IN (${Prisma.join(filters.values)})`);
    }

    if (start_date) {
      conditions.push(Prisma.sql`created_at >= ${start_date}`);
    }

    if (end_date) {
      conditions.push(Prisma.sql`created_at < ${end_date}`);
    }

    // Combine WHERE clauses safely
    const whereClause = Prisma.join(conditions, ' AND ');

    // Build safe query (bucket is whitelisted, all values are parameterized)
    const query = Prisma.sql`
      SELECT 
        DATE_TRUNC(${bucket}, created_at) as bucket,
        value,
        COUNT(*)::int as count
      FROM interactions
      WHERE ${whereClause}
      GROUP BY bucket, value
      ORDER BY bucket ASC, value ASC
    `;

    const results = await this.interactionRepo.db.$queryRaw(query);

    return results.map((r) => ({
      bucket: r.bucket,
      value: r.value,
      count: r.count,
    }));
  }

  buildFiltersFromQuery(query, loggedInUser) {
    const filters = {};

    // Interaction Ownership Filtering
    let useDefaultUserFilter = true;
    if (query.entire_class === true || query.entire_class === 'true') {
      useDefaultUserFilter = false;
    } else if (query.author_id != null) {
      const authorId = parseInt(query.author_id, 10);
      if (!isNaN(authorId)) {
        filters.author_id = authorId;
        useDefaultUserFilter = false;
      }
    }
    // Filter by logged in user's id by default if no ownership filters provided
    if (useDefaultUserFilter) {
      filters.author_id = loggedInUser.id;
    }

    if (query.values != null && query.values.length > 0) {
      filters.values = query.values;
    }

    if (query.start_date) {
      const startDate = new Date(query.start_date);
      if (!isNaN(startDate.getTime())) {
        filters.start_date = startDate;
      }
    }

    if (query.end_date) {
      const endDate = new Date(query.end_date);
      if (!isNaN(endDate.getTime())) {
        filters.end_date = endDate;
      }
    }

    if (query.bucket) {
      filters.bucket = query.bucket;
    }

    return filters;
  }

  mapFiltersToWhereClause(filters = {}) {
    const where = {};

    if (filters.author_id != null) {
      where.author_id = filters.author_id;
    }

    if (filters.values != null) {
      where.value = { in: filters.values };
    }

    return where;
  }

  mapInteractionToResponse(interaction) {
    return {
      id: interaction.id,
      course_id: interaction.course_id,
      author_id: interaction.author_id,
      author_first_name: interaction.authors?.first_name || null,
      author_last_name: interaction.authors?.last_name || null,
      interaction_config_id: interaction.interaction_config_id,
      value: interaction.value,
      description: interaction.description,
      created_at: interaction.created_at,
    };
  }
}

module.exports = InteractionService;
