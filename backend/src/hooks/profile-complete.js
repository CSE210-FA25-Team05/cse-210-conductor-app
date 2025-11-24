'use strict';

const fp = require('fastify-plugin');

/**
 * Profile completion guard.
 *
 * Runs after authentication (so req.user is populated) and enforces that
 * users with incomplete profiles can only access a small set of allowed routes
 * (OAuth endpoints, profile setup endpoints, etc.).
 */
module.exports = fp(async function profileCompleteHook(fastify) {
  fastify.addHook('preHandler', async (req, reply) => {
    req.log.info(
      { url: req.raw.url },
      'profileCompleteHook: preHandler reached'
    );

    // If the request is unauthenticated, let other logic handle it (e.g., the auth decorator or route-level auth requirements)
    const user = req.user;
    if (!user) {
      req.log.info('profileCompleteHook: no user, skipping');
      return;
    }

    // Extract the path (ignore querystring)
    const url = req.raw.url.split('?')[0];

    // Whitelisted routes that incomplete-profile users are allowed to access
    const allowedPaths = new Set([
      '/auth/oauth/google',
      '/auth/oauth/google/callback',
      '/auth/logout',
      '/me/profile', // retrieve/submit profile data
      '/health', // health check endpoint (if your project has one)
      '/', // root path (optional, keep/remove depending on use case)
    ]);

    if (allowedPaths.has(url)) {
      req.log.info(`profileCompleteHook: allowed path: ${url}`);
      return;
    }

    // Block all other requests if the user’s profile is incomplete
    if (!user.is_profile_complete) {
      req.log.warn(
        `profileCompleteHook: blocked due to incomplete profile: ${user.email}`
      );
      return reply.code(403).send({
        error: 'PROFILE_INCOMPLETE',
      });
    }
  });
});
