'use strict';

/**
 * Backdoor Routes Plugin
 *
 * ⚠️ WARNING: These routes bypass all authentication and authorization checks.
 * DO NOT use these in production!
 *
 * This plugin registers development-only backdoor endpoints.
 */

const fp = require('fastify-plugin');
const backdoorRoutes = require('./backdoor.routes');

// eslint-disable-next-line no-unused-vars
module.exports = fp(async function backdoorPlugin(fastify, opts) {
  fastify.log.warn(
    '  DEVELOPMENT BACKDOOR ROUTES ENABLED - NO AUTHENTICATION REQUIRED '
  );

  // Register backdoor routes (routes already have /backdoor prefix)
  fastify.register(backdoorRoutes);
});

