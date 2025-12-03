'use strict';

/**
 * Pulse Service Plugin
 *
 * This plugin wires the pulse routes into the Fastify instance.
 */

const pulseRoutes = require('./pulse.routes');

module.exports = async function pulseServicePlugin(fastify) {
  fastify.register(pulseRoutes);
};
