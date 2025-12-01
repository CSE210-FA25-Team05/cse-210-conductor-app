'use strict';

/**
 * Pulse Repository
 *
 * - Pulse Config and Pulse record storage (Prisma / PostgreSQL)
 */

class PulseRepo {
  constructor(db) {
    this.db = db;
  }

  // Return the pulse config row (may be null)
  async getConfig(courseId, db = this.db) {
    return db.pulse_configs.findFirst({ where: { course_id: courseId } });
  }

  async createConfig(courseId, configObj, is_editable = true, db = this.db) {
    return db.pulse_configs.create({
      data: { course_id: courseId, config: configObj, is_editable },
    });
  }

  async updateConfig(courseId, configId, configObj, db = this.db) {
    return db.pulse_configs.update({
      where: { id: configId, course_id: courseId },
      data: { config: configObj },
    });
  }

  async createPulse(pulseData, db = this.db) {
    const {
      courseId,
      configId,
      userId,
      teamId = null,
      value,
      description = null,
    } = pulseData;
    return db.pulses.create({
      data: {
        course_id: courseId,
        user_id: userId,
        team_id: teamId,
        pulse_config_id: configId,
        value,
        description,
      },
      include: {
        users: {
          select: { first_name: true, last_name: true },
        },
      },
    });
  }

  async lockConfigIfEditable(courseId, db = this.db) {
    return db.pulse_configs.updateMany({
      where: { course_id: courseId, is_editable: true },
      data: { is_editable: false },
    });
  }

  async getPulses(courseId, filters = {}, db = this.db) {
    return db.pulses.findMany({
      where: { course_id: courseId, ...filters },
      orderBy: { created_at: 'desc' },
      include: {
        users: {
          select: { first_name: true, last_name: true },
        },
      },
    });
  }
}

module.exports = PulseRepo;
