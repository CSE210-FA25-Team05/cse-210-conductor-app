'use strict';

class PulseService {
  constructor(pulseRepo) {
    this.pulseRepo = pulseRepo;
  }

  // Get the pulse config for a course (may be null)
  async getConfig(course) {
    return this.pulseRepo.getConfig(course.id);
  }

  // Update the pulse config. If the existing config is not editable, throws.
  // `configObj` is expected to be JSON-serializable (e.g., { options: [...] } or an array)
  async upsertConfig(course, configObj) {
    const existing = await this.pulseRepo.getConfig(course.id);
    if (!existing) {
      return this.pulseRepo.createConfig(course.id, configObj, true);
    }

    if (!existing.is_editable) {
      const e = new Error('Pulse configuration is locked and cannot be edited');
      e.code = 'UNPROCESSABLE_ENTITY';
      throw e;
    }

    return this.pulseRepo.updateConfig(course.id, existing.id, configObj);
  }

  // Submit a pulse atomically: validate option against config JSON, create pulse,
  // and flip is_editable -> false if it was true (performed in same transaction).
  async submitPulse(course, user, config, { optionKey, description = null }) {
    const created = await this.pulseRepo.db.$transaction(async (tx) => {
      const cfg = config.is_editable
        ? await this.pulseRepo.getConfig(course.id, tx)
        : config;
      if (!cfg) {
        const e = new Error('Pulse configuration not found for course');
        e.code = 'NOT_FOUND';
        throw e;
      }

      // Resolve options array in multiple possible shapes
      let opts = [];
      if (Array.isArray(cfg.config)) opts = cfg.config;
      else if (cfg.config && Array.isArray(cfg.config.options))
        opts = cfg.config.options;
      else if (Array.isArray(cfg.options)) opts = cfg.options;

      if (!Array.isArray(opts) || opts.length === 0) {
        const e = new Error('Pulse configuration options are empty or invalid');
        e.code = 'BAD_REQUEST';
        throw e;
      }

      const option = opts.find((o) => {
        if (!o) return false;
        if (o.key && String(o.key) === String(optionKey)) return true;
        if (o.idx != null && String(o.idx) === String(optionKey)) return true;
        return false;
      });

      if (!option) {
        const e = new Error('Invalid pulse option');
        e.code = 'BAD_REQUEST';
        throw e;
      }

      const optionKeyResolved = option.key
        ? String(option.key)
        : String(option.idx);

      const pulseData = {
        courseId: course.id,
        configId: cfg.id,
        studentId: user.id,
        value: optionKeyResolved,
        description,
      };
      const createdPulse = await this.pulseRepo.createPulse(pulseData, tx);

      if (cfg.is_editable) {
        await this.pulseRepo.lockConfigIfEditable(course.id, tx);
      }

      return this.mapPulseToResponse(createdPulse);
    });

    return created;
  }

  async getPulses(course, filters = {}) {
    const pulses = await this.pulseRepo.getPulses(
      course.id,
      this.mapFiltersToWhereClause(filters)
    );
    return pulses.map(this.mapPulseToResponse);
  }

  buildFiltersFromQuery(query, loggedInUser) {
    const filters = {};
    if (query.entire_class === true || query.entire_class === 'true') {
      return filters;
    } else if (query.team_id != null) {
      const teamId = parseInt(query.team_id, 10);
      if (!isNaN(teamId)) {
        filters.team_id = teamId;
      }
    } else if (query.user_id != null) {
      const userId = parseInt(query.user_id, 10);
      if (!isNaN(userId)) {
        filters.user_id = userId;
      }
    }

    // Filter by logged in user's id by default if no filters provided
    if (filters.team_id == null && filters.user_id == null) {
      filters.user_id = loggedInUser.id;
    }

    return filters;
  }

  mapFiltersToWhereClause(filters = {}) {
    const where = {};

    if (filters.team_id != null) {
      where.users = {
        enrollments: {
          some: {
            team_id: filters.team_id,
          },
        },
      };
    } else if (filters.user_id != null) {
      where.user_id = filters.user_id;
    }
    return where;
  }

  mapPulseToResponse(pulse) {
    return {
      id: pulse.id,
      course_id: pulse.course_id,
      user_id: pulse.user_id,
      user_first_name: pulse.users?.first_name || null,
      user_last_name: pulse.users?.last_name || null,
      pulse_config_id: pulse.pulse_config_id,
      value: pulse.value,
      description: pulse.description,
      created_at: pulse.created_at,
    };
  }
}

module.exports = PulseService;
