'use strict';

class PulseService {
  constructor(pulseRepo) {
    this.pulseRepo = pulseRepo;
  }

  // Update the pulse config. If the existing config is not editable, throws.
  // `configObj` is expected to be JSON-serializable (e.g., { options: [...] } or an array)
  async upsertConfig(course, configObj) {
    const existing = await this.pulseRepo.getConfig(course);
    if (!existing) {
      return this.pulseRepo.createConfig(course, configObj, true);
    }

    if (!existing.is_editable) {
      const e = new Error('Pulse configuration is locked and cannot be edited');
      e.code = 'FORBIDDEN';
      throw e;
    }

    return this.pulseRepo.updateConfig(course, existing, configObj);
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

      return createdPulse;
    });

    return created;
  }
}

module.exports = PulseService;
