'use strict';

/**
 * Journal Service Plugin
 *
 * This plugin wires the journal routes into the Fastify instance.
 */

const journalRoutes = require('./journal.routes');

// eslint-disable-next-line no-unused-vars
module.exports = async function journalServicePlugin(fastify, opts) {
  // Journal routes are nested under a course context
  fastify.register(journalRoutes, { prefix: '/api/courses/:course_id' });
};
