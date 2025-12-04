'use strict';

const fp = require('fastify-plugin');
const AuthRepo = require('../services/auth/auth.repo');

/**
 * Global authentication hook.
 *
 * Resolves the current user from the session cookie and attaches it to req.user.
 * Public routes are whitelisted so they can be accessed without authentication.
 */
module.exports = fp(async function authenticateHook(fastify) {
  const authRepo = new AuthRepo(fastify.db);

  const publicPaths = new Set([
    '/',
    '/api/health',
    '/auth/logout',
    '/auth/oauth/google',
    '/auth/oauth/google/add_token',
    '/auth/oauth/google/callback',
  ]);

  fastify.addHook('preHandler', async (req, reply) => {
    const url = req.raw.url.split('?')[0];

    // Allow swagger UI assets and any explicitly whitelisted path
    if (publicPaths.has(url) || url.startsWith('/docs')) {
      return;
    }

    const isTestMode =
      process.env.NODE_ENV === 'development' &&
      process.env.TEST_MODE === 'true';

    if (isTestMode) {
      try {
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
          testUser = await fastify.db.users.findFirst({
            where: { deleted_at: null },
            orderBy: { id: 'asc' },
          });
        }

        if (testUser) {
          req.user = testUser;
          fastify.log.info(
            { testMode: true, userId: testUser.id },
            'authenticateHook: test user injected'
          );
          return;
        }
      } catch (error) {
        fastify.log.error(
          { error },
          'authenticateHook: test mode failed, falling back to normal auth'
        );
      }
    }

    const sessionId = req.cookies?.sid;
    if (!sessionId) {
      return reply.code(401).send({ statusCode: 401, error: 'Not authenticated' });
    }

    const user = await authRepo.getUserBySessionId(sessionId);
    if (!user) {
      return reply.code(401).send({ statusCode: 401, error: 'Session expired or invalid' });
    }

    req.user = user;
  });
});
