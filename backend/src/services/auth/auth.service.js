'use strict';

/**
 * Auth Service
 *
 * Responsibilities:
 * - Build Google OAuth login URL and set CSRF state cookie
 * - Exchange authorization code for tokens
 * - Verify Google ID token and email rules
 * - Create a session (UUID) and store it in the repository
 * - Handle logout and profile-related logic
 */

const { randomUUID } = require('crypto');
const { OAuth2Client } = require('google-auth-library');

// Configuration from environment variables
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ||
  'http://localhost:3001/auth/oauth/google/callback';

// Only allow UCSD emails by default; can be overridden via env.
const ALLOWED_EMAIL_SUFFIXES = (
  process.env.ALLOWED_EMAIL_SUFFIXES || '@ucsd.edu'
)
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

// Session lifetime in milliseconds (7 days)
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// OAuth2 client
const oauthClient = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

class AuthService {
  constructor(authRepo) {
    this.authRepo = authRepo;
  }

  /**
   * Build the Google OAuth login URL and set the CSRF state cookie.
   * @param {fastify.FastifyReply} reply
   * @returns {string} Google OAuth consent screen URL
   */
  buildGoogleLoginUrl(reply) {
    const state = randomUUID();

    // Store state in an HttpOnly cookie to mitigate CSRF.
    reply.setCookie('oauth_state', state, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 10 * 60, // 10 minutes
    });

    const authUrl = oauthClient.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['openid', 'email', 'profile'],
      state,
      redirect_uri: GOOGLE_REDIRECT_URI,
    });

    return authUrl;
  }

  /**
   * Find or create a user based on the Google payload and UCSD/non-UCSD rules.
   *
   * - UCSD email:
   *    - existing user → return it
   *    - no user       → auto-create via upsertUser()
   * - non-UCSD email:
   *    - existing user → return it (allowed to log in)
   *    - no user       → throw error (must be added by professor first)
   *
   * @param {object} payload - Google ID token payload
   * @returns {Promise<object>} user
   */
  async resolveUserFromGooglePayload(payload) {
    const email = (payload.email || '').toLowerCase();
    if (!email) {
      throw new Error('Google payload does not contain an email');
    }

    if (!payload.email_verified) {
      throw new Error('Google email is not verified');
    }

    // see if a user already exists
    const existing = await this.authRepo.getUserByEmail(email);

    if (existing) {
      return existing;
    }

    // decide by UCSD vs non-UCSD
    if (this.isUcsdEmail(email)) {
      // ucsd email → auto-create if needed (upsert keeps us race-safe)
      return await this.authRepo.upsertUser(
        this.buildUpsertUserInputFromGooglePayload(payload)
      );
    }

    // non-UCSD + no existing user in DB → reject login
    throw new Error(
      'Your email is not registered in the system. Please ask your professor to add you to a class first.'
    );
  }

  /**
   * Build the input object for upsertUser() from a Google ID token payload.
   *
   * @param {object} payload - Google ID token payload
   * @returns {object} upsertUser params
   */
  buildUpsertUserInputFromGooglePayload(payload) {
    const email = (payload.email || '').toLowerCase();
    if (!email) {
      throw new Error('Google payload does not contain an email');
    }

    return {
      email,
      first_name: payload.given_name || null,
      last_name: payload.family_name || null,
      last_login: new Date(),
    };
  }

  /**
   * Exchange an authorization code for tokens.
   * @param {string} code
   * @returns {Promise<object>} tokens
   */
  async exchangeCodeForTokens(code) {
    const { tokens } = await oauthClient.getToken({
      code,
      redirect_uri: GOOGLE_REDIRECT_URI,
    });
    if (!tokens || !tokens.id_token) {
      throw new Error('Failed to retrieve tokens from Google');
    }
    return tokens;
  }

  /**
   * Verify the ID token and return the payload.
   * @param {string} idToken
   * @returns {Promise<object>} payload
   */
  async verifyIdToken(idToken) {
    const ticket = await oauthClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Google ID token payload is empty');
    }
    return payload;
  }

  /**
   * Create a new session for this user.
   * @param {object} user
   * @returns {Promise<string>} sessionId
   */
  async createSessionForUser(user) {
    const sessionId = randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    await this.authRepo.createSession(sessionId, user.id, expiresAt);
    return sessionId;
  }

  /**
   * Handle the standard OAuth callback flow (query string).
   * @param {fastify.FastifyRequest} req
   * @returns {Promise<string>} sessionId to be stored in cookie
   */
  async handleGoogleCallback(req) {
    const { code, state } = req.query;

    if (!code || typeof code !== 'string') {
      throw new Error('Missing authorization code');
    }
    if (!state || typeof state !== 'string') {
      throw new Error('Missing OAuth state');
    }

    const stateCookie = req.cookies?.oauth_state;
    if (!stateCookie || stateCookie !== state) {
      throw new Error('Invalid OAuth state (possible CSRF)');
    }

    const tokens = await this.exchangeCodeForTokens(code);
    const payload = await this.verifyIdToken(tokens.id_token);

    const user = await this.resolveUserFromGooglePayload(payload);
    const sessionId = await this.createSessionForUser(user);

    return sessionId;
  }

  /**
   * Logout: delete the session record (if any).
   * Route is responsible for clearing the cookie.
   *
   * @param {string | undefined} sessionId
   * @param {object} logger - fastify logger (req.log)
   */
  async logout(sessionId, logger) {
    if (!sessionId) {
      return;
    }

    try {
      await this.authRepo.deleteSession(sessionId);
    } catch (e) {
      // Do not block logout if session deletion fails.
      logger?.error(e, 'Failed to delete session during logout');
    }
  }

  /**
   * Build a standardized profile response object from a user record.
   * @param {object} user
   * @returns {object}
   */
  buildProfileResponse(user) {
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      pronouns: user.pronouns,
      global_role: user.global_role,
      is_profile_complete: user.is_profile_complete,
    };
  }

  /**
   * Update current user's profile (supports partial updates).
   * Only fields explicitly provided in the request body will be updated.
   * @param {object} user - current user (from req.user)
   * @param {object} body - request body with profile fields (first_name?, last_name?, pronouns?)
   * @returns {Promise<object>} normalized profile response
   */
  async updateCurrentUserProfile(user, body) {
    const { first_name, last_name, pronouns } = body || {};

    // Build profile data object, only including fields that are explicitly provided
    const profileData = {};
    if (first_name !== undefined) {
      profileData.first_name = first_name;
    }
    if (last_name !== undefined) {
      profileData.last_name = last_name;
    }
    if (pronouns !== undefined) {
      profileData.pronouns = pronouns;
    }

    // Determine whether profile should be marked complete after this update.
    const finalFirstName =
      first_name !== undefined ? first_name : user.first_name || '';
    const finalLastName =
      last_name !== undefined ? last_name : user.last_name || '';

    const hasFirstName =
      typeof finalFirstName === 'string' && finalFirstName.trim().length > 0;
    const hasLastName =
      typeof finalLastName === 'string' && finalLastName.trim().length > 0;

    const isProfileComplete = hasFirstName && hasLastName;

    const updated = await this.authRepo.updateUserProfile(
      user.id,
      profileData,
      isProfileComplete
    );

    return this.buildProfileResponse(updated);
  }

  /**
   * Check whether an email belongs to the "UCSD student" group.
   * By default we treat emails with allowed suffixes as UCSD.
   *
   * @param {string} email
   * @returns {boolean}
   */
  isUcsdEmail(email) {
    const lower = (email || '').toLowerCase();
    return ALLOWED_EMAIL_SUFFIXES.some((suffix) => lower.endsWith(suffix));
  }
}

// module.exports = {
//   buildGoogleLoginUrl,
//   handleGoogleCallback,
//   logout,
//   buildProfileResponse,
//   updateCurrentUserProfile,
//   oauthClient, // Exposed for unit testing
// };

module.exports = AuthService;
