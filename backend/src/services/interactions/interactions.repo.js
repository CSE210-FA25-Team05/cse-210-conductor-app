'use strict';

/**
 * Interaction Repository
 *
 * - Interaction Config and Interaction record storage (Prisma / PostgreSQL)
 */

class InteractionRepo {
  constructor(db) {
    this.db = db;
  }

  // Return the interaction config row (may be null)
  async getConfig(courseId, db = this.db) {
    return db.interaction_configs.findFirst({ where: { course_id: courseId } });
  }

  async createConfig(courseId, configObj, is_editable = true, db = this.db) {
    return db.interaction_configs.create({
      data: { course_id: courseId, config: configObj, is_editable },
    });
  }

  async updateConfig(courseId, configId, configObj, db = this.db) {
    return db.interaction_configs.update({
      where: { id: configId, course_id: courseId },
      data: { config: configObj },
    });
  }

  async createInteraction(courseId, interactionData, db = this.db) {
    const {
      configId,
      userId,
      value,
      description = null,
      participants = [],
    } = interactionData;
    return db.interactions.create({
      data: {
        course_id: courseId,
        author_id: userId,
        interaction_config_id: configId,
        value,
        description,
        participants: {
          create: participants.map((pid) => ({ user_id: pid })),
        },
      },
      include: {
        authors: {
          select: { first_name: true, last_name: true },
        },
        participants: {
          include: {
            users: {
              select: { id: true, first_name: true, last_name: true },
            },
          },
        },
      },
    });
  }

  async updateInteraction(courseId, interactionId, updateData, db = this.db) {
    return db.interactions.update({
      where: { id: interactionId, course_id: courseId },
      data: updateData,
      include: {
        authors: {
          select: { first_name: true, last_name: true },
        },
        participants: {
          include: {
            users: {
              select: { id: true, first_name: true, last_name: true },
            },
          },
        },
      },
    });
  }

  async deleteInteraction(courseId, interactionId, db = this.db) {
    return db.interactions.delete({
      where: { id: interactionId, course_id: courseId },
    });
  }

  async lockConfigIfEditable(courseId, db = this.db) {
    return db.interaction_configs.updateMany({
      where: { course_id: courseId, is_editable: true },
      data: { is_editable: false },
    });
  }

  async getInteractionById(courseId, interactionId, db = this.db) {
    const interactions = await this.getInteractions(
      courseId,
      { id: interactionId },
      db
    );
    return interactions.length > 0 ? interactions[0] : null;
  }

  async getInteractions(courseId, filters = {}, db = this.db) {
    return db.interactions.findMany({
      where: { course_id: courseId, ...filters },
      orderBy: { created_at: 'desc' },
      include: {
        authors: {
          select: { first_name: true, last_name: true },
        },
        participants: {
          include: {
            users: {
              select: { id: true, first_name: true, last_name: true },
            },
          },
        },
      },
    });
  }
}

module.exports = InteractionRepo;
