'use strict';

/**
 * Auth Service Plugin
 *
 * This plugin wires the auth routes into the Fastify instance.
 */

const authRoutes = require('./auth.routes');

module.exports = async function authServicePlugin(fastify) {
  fastify.register(authRoutes);
};
