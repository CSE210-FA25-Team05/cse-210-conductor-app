'use strict';

/**
 * Interaction Service Plugin
 *
 * This plugin wires the interaction routes into the Fastify instance.
 */

const interactionRoutes = require('./interactions.routes');

module.exports = async function interactionServicePlugin(fastify) {
  fastify.register(interactionRoutes);
};
