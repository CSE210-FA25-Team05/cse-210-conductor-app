'use strict';

/**
 * Auth decorators
 *
 * - fastify.authenticate(req, reply)
 *      Reads the "sid" cookie, resolves the current user from the session
 *      repository, and attaches it to req.user. Sends 401 if unauthenticated.
 *
 * - fastify.requireGlobalProfessor(req, reply)
 *      Checks if the authenticated user has global_role 'professor'.
 *      Sends 403 if not authorized.
 */

const fp = require('fastify-plugin');
const AuthRepo = require('../services/auth/auth.repo');
const AuthPermissions = require('../services/auth/auth.permissions');

module.exports = fp(async function authDecorators(fastify, opts) {
  const authRepo = new AuthRepo(fastify.db);
  const authPermissions = new AuthPermissions(authRepo);

  fastify.decorate('authenticate', async function (req, reply) {
    const sessionId = req.cookies?.sid;
    if (!sessionId) {
      return reply.code(401).send({ error: 'Not authenticated' });
    }

    const user = await authRepo.getUserBySessionId(sessionId);
    if (!user) {
      return reply.code(401).send({ error: 'Session expired or invalid' });
    }

    req.user = user;
  });

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
