'use strict';

/**
 * Auth decorators
 *
 * - fastify.requireGlobalProfessor(req, reply)
 *      Checks if the authenticated user has global_role 'professor'.
 *      Sends 403 if not authorized.
 */

const fp = require('fastify-plugin');
const AuthRepo = require('../services/auth/auth.repo');
const AuthPermissions = require('../services/auth/auth.permissions');

// eslint-disable-next-line no-unused-vars
module.exports = fp(async function authDecorators(fastify, _opts) {
  const authRepo = new AuthRepo(fastify.db);
  const authPermissions = new AuthPermissions(authRepo);
  fastify.decorate('requireGlobalProfessor', async function (req, reply) {
    if (!req.user) {
      return reply.code(401).send({ error: 'Not authenticated' });
    }

    const isProfessor = await authPermissions.isProfessor(req.user.id);
    if (!isProfessor) {
      return reply.code(403).send({
        error: 'Forbidden',
        message: 'Only professors can perform this action',
      });
    }
  });
});
