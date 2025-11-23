'use strict';

/**
 * Auth Routes
 *
 * - GET  /auth/oauth/google
 *       → Redirect to Google with CSRF state cookie
 * - GET  /auth/oauth/google/callback
 *       → Server-side exchange, create session, set "sid" cookie
 * - POST /auth/oauth/google/add_token
 *       → Optional SPA/PKCE flow, same behavior as callback
 * - POST /auth/logout
 *       → Delete session + clear session cookie
 * - GET  /me/profile
 *       → Get current user's profile
 * - POST /me/profile
 *       → Update current user's profile and mark it complete
 */

const authSchemas = require('./auth.schemas');
const AuthRepo = require('./auth.repo');
const AuthService = require('./auth.service');
const AuthPermissions = require('./auth.permissions');

async function routes(fastify) {
  const authRepo = new AuthRepo(fastify.db);
  const authService = new AuthService(authRepo);
  const authPermissions = new AuthPermissions(authRepo);

  // Redirect user to Google's consent screen
  fastify.get(
    '/auth/oauth/google',
    {
      schema: authSchemas.GoogleOAuthSchema,
    },
    async (req, reply) => {
      const url = authService.buildGoogleLoginUrl(reply);
      req.log.info({ authUrl: url }, 'OAuth authorize URL');
      return reply.redirect(url);
    }
  );

  // Google redirect target (server-side exchange with query params)
  fastify.get(
    '/auth/oauth/google/callback',
    {
      schema: authSchemas.GoogleOAuthCallbackSchema,
    },
    async (req, reply) => {
      try {
        const sessionId = await authService.handleGoogleCallback(req);

        // Set sid cookie (sessionId → userId is stored in auth.repo)
        reply.setCookie('sid', sessionId, {
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          path: '/',
          maxAge: 7 * 24 * 60 * 60, // 7 days
        });

        reply.clearCookie('oauth_state', { path: '/' });
        reply.redirect(process.env.FRONTEND_URL || 'http://localhost:3000/');
      } catch (e) {
        req.log.error(e);
        reply.redirect(
          `${process.env.FRONTEND_URL || 'http://localhost:3000/index.html'}?error=${encodeURIComponent(
            e.message
          )}`
        );
      }
    }
  );

  // Logout: delete session + clear cookie
  fastify.post(
    '/auth/logout',
    {
      schema: authSchemas.LogoutSchema,
    },
    async (req, reply) => {
      const sessionId = req.cookies?.sid;

      await authService.logout(sessionId, req.log);

      reply.clearCookie('sid', { path: '/' });
      reply.send({ ok: true });
    }
  );

  // Get current user's profile
  fastify.get(
    '/me/profile',
    {
      preHandler: fastify.authenticate,
      schema: authSchemas.GetUserProfileSchema,
    },
    async (req) => {
      const profile = authService.buildProfileResponse(req.user);
      return profile;
    }
  );

  // Get another user's profile
  fastify.get(
    '/users/:user_id/profile',
    {
      preHandler: fastify.authenticate,
      schema: authSchemas.GetUserProfileByIdSchema,
    },
    async (req, reply) => {
      const targetUserId = parseInt(req.params.user_id, 10);
      const actorUserId = req.user.id;

      // Check permission: users can view their own profile, or professors can view any profile
      let canView = false;
      if (actorUserId === targetUserId) {
        canView = true;
      } else {
        canView = await authPermissions.isProfessor(actorUserId);
      }

      if (!canView) {
        return reply.code(403).send({
          error: 'Forbidden',
          message: 'You do not have permission to view this user profile',
        });
      }

      // If allowed, fetch and return the profile
      const targetUser = await authRepo.getUserById(targetUserId);
      if (!targetUser) {
        return reply.code(404).send({ error: 'User not found' });
      }

      return authService.buildProfileResponse(targetUser);
    }
  );

  // Set current user's profile
  fastify.post(
    '/me/profile',
    {
      preHandler: fastify.authenticate,
      schema: authSchemas.UpdateUserProfileSchema,
    },
    async (req, reply) => {
      const user = req.user;
      const body = req.body;

      // Validate request body format
      if (!body || typeof body !== 'object') {
        return reply.code(400).send({
          error: 'Invalid request body. Expected JSON object.',
        });
      }

      const updatedProfile = await authService.updateCurrentUserProfile(
        user,
        body
      );

      return {
        ok: true,
        user: updatedProfile,
      };
    }
  );
}

module.exports = routes;
