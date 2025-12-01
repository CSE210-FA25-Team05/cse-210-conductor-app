'use strict';

/**
 * Attendances Service Plugin
 *
 * This plugin wires the attendances routes into the Fastify instance.
 */

const attendancesRoutes = require('./attendances.routes');

// eslint-disable-next-line no-unused-vars
module.exports = async function attendancesServicePlugin(fastify, _opts) {
  fastify.register(attendancesRoutes);
};
