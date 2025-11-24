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

// eslint-disable-next-line no-unused-vars
module.exports = fp(async function authDecorators(fastify, _opts) {
  const authRepo = new AuthRepo(fastify.db);
  const authPermissions = new AuthPermissions(authRepo);

  fastify.decorate('authenticate', async function (req, reply) {
    // Test mode: bypass authentication in development
    const isTestMode =
      process.env.NODE_ENV === 'development' &&
      process.env.TEST_MODE === 'true';

    if (isTestMode) {
      try {
        // Support custom test user via header (x-test-user-id or x-test-user-email)
        const testUserId = req.headers['x-test-user-id'];
        const testUserEmail = req.headers['x-test-user-email'];

        let testUser;
        if (testUserId) {
          testUser = await fastify.db.users.findUnique({
            where: { id: parseInt(testUserId, 10) },
          });
        } else if (testUserEmail) {
          testUser = await fastify.db.users.findUnique({
            where: { email: testUserEmail.toLowerCase() },
          });
        } else {
          // Default: use first user from database
          testUser = await fastify.db.users.findFirst({
            where: { deleted_at: null },
            orderBy: { id: 'asc' },
          });
        }

        if (testUser) {
          req.user = testUser;
          fastify.log.info(
            { testMode: true, userId: testUser.id },
            'Test mode: using test user'
          );
          return; // Skip real authentication
        }
      } catch (error) {
        fastify.log.error(
          { error },
          'Test mode failed, falling back to normal auth'
        );
      }
    }

    // Normal authentication flow
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
