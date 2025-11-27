// backend/src/teams/index.js (or wherever lectures/index.js lives)
'use strict';

/**
 * Teams Service Plugin
 *
 * This plugin wires the teams routes into the Fastify instance.
 */

const teamsRoutes = require('./teams.routes');

// eslint-disable-next-line no-unused-vars
module.exports = async function teamsServicePlugin(fastify, opts) {
  fastify.register(teamsRoutes);
};
