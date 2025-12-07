'use strict';

/**
 * Course Service Plugin
 *
 * This plugin wires the course routes into the Fastify instance.
 */

const courseRoutes = require('./course.routes');

// eslint-disable-next-line no-unused-vars
module.exports = async function courseServicePlugin(fastify, opts) {
  fastify.register(courseRoutes);
};
