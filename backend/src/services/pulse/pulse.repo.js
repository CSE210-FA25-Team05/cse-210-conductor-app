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

  async updateConfig(course, configId, configObj, db = this.db) {
    return db.pulse_configs.update({
      where: { id: configId, course_id: course.id },
      data: { config: configObj },
    });
  }

  async createPulse(pulseData, db = this.db) {
    const {
      courseId,
      configId,
      studentId,
      value,
      description = null,
    } = pulseData;
    return db.pulses.create({
      data: {
        course_id: courseId,
        user_id: studentId,
        pulse_config_id: configId,
        value,
        description,
      },
    });
  }

  // Atomically set is_editable = false if currently true
  async lockConfigIfEditable(courseId, db = this.db) {
    return db.pulse_configs.updateMany({
      where: { course_id: courseId, is_editable: true },
      data: { is_editable: false },
    });
  }
}

module.exports = PulseRepo;
