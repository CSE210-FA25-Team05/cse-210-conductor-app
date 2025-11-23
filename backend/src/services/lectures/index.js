'use strict';

/**
 * Lectures Service Plugin
 *
 * This plugin wires the lectures routes into the Fastify instance.
 */

const lecturesRoutes = require('./lectures.routes');

// eslint-disable-next-line no-unused-vars
module.exports = async function lecturesServicePlugin(fastify, opts) {
  fastify.register(lecturesRoutes);
};
