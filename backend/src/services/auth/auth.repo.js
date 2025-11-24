'use strict';

/**
 * Auth Repository
 *
 * - User storage (Prisma / PostgreSQL)
 * - Session storage
 */

class AuthRepo {
  constructor(db) {
    this.db = db;
  }

  /**
   * Upsert (create or update) a user record by email.
   *
   * @param {object} params
   * @param {string} params.email
   * @param {string|null} params.first_name
   * @param {string|null} params.last_name
   * @param {Date} params.last_login
   * @returns {Promise<object>} user - Prisma users record
   */
  async upsertUser({ email, first_name, last_name, last_login }) {
    if (!email) {
      throw new Error('Email is required for upsertUser');
    }

    const user = await this.db.users.upsert({
      where: { email },
      create: {
        email,
        first_name,
        last_name,
        last_login,
        // global_role and is_profile_complete use DB defaults
      },
      update: {
        first_name,
        last_name,
        last_login,
      },
    });

    return user;
  }

  /**
   * Create a new session for a given user id.
   * Sessions are stored in the `sessions` table.
   *
   * @param {string} sessionId - randomly generated UUID
   * @param {number} userId - id of the authenticated user (users.id)
   * @param {Date}   expiresAt - session expiration time
   * @returns {Promise<object>} session record
   */
  async createSession(sessionId, userId, expiresAt) {
    const session = await this.db.sessions.create({
      data: {
        session_id: sessionId,
        user_id: userId,
        expires_at: expiresAt,
      },
    });
    return session;
  }

  /**
   * Get a user by email.
   *
   * @param {string} email
   * @returns {Promise<object|null>} user or null if not found
   */
  async getUserByEmail(email) {
    if (!email) {
      return null;
    }

    return await this.db.users.findUnique({
      where: { email },
    });
  }

  /**
   * Get a user by ID.
   *
   * @param {number} userId
   * @param {object} options - Optional select fields
   * @param {object} options.select - Fields to select (e.g., { id: true, global_role: true })
   * @returns {Promise<object|null>} user or null if not found
   */
  async getUserById(userId, options = {}) {
    if (!userId) {
      return null;
    }

    const queryOptions = options.select
      ? { where: { id: userId }, select: options.select }
      : { where: { id: userId } };

    return await this.db.users.findUnique(queryOptions);
  }

  /**
   * Look up the current user by session id.
   * Returns null if the session is missing, expired, or the user no longer exists.
   *
   * @param {string} sessionId
   * @returns {Promise<object|null>} user or null if not found/expired
   */
  async getUserBySessionId(sessionId) {
    const session = await this.db.sessions.findUnique({
      where: { session_id: sessionId },
    });

    if (!session) {
      return null;
    }

    const now = new Date();
    if (session.expires_at && session.expires_at <= now) {
      // Session expired, clean it up.
      await this.db.sessions.delete({
        where: { session_id: sessionId },
      });
      return null;
    }

    // Resolve the user associated with this session from the database.
    const user = await this.db.users.findUnique({
      where: { id: session.user_id },
    });

    if (!user) {
      // If the user row was deleted, also clean up the session.
      await this.db.sessions.delete({
        where: { session_id: sessionId },
      });
      return null;
    }

    return user;
  }

  /**
   * Invalidate a session, e.g. on logout.
   *
   * @param {string} sessionId
   * @returns {Promise<void>}
   */
  async deleteSession(sessionId) {
    await this.db.sessions.deleteMany({
      where: { session_id: sessionId },
    });
  }

  /**
   * Update user profile fields (partial update supported).
   * Only updates fields that are explicitly provided (not undefined).
   *
   * @param {number} userId
   * @param {object} profileData - { first_name?, last_name?, pronouns? }
   * @param {boolean|undefined} isProfileComplete - optional flag to explicitly set profile completion
   * @returns {Promise<object>} updated user
   */
  async updateUserProfile(userId, profileData, isProfileComplete) {
    const { first_name, last_name, pronouns } = profileData;

    // Build update data object, only including fields that are explicitly provided
    const updateData = {};

    if (first_name !== undefined) {
      updateData.first_name = first_name;
    }
    if (last_name !== undefined) {
      updateData.last_name = last_name;
    }
    if (pronouns !== undefined) {
      updateData.pronouns = pronouns;
    }
    if (isProfileComplete !== undefined) {
      updateData.is_profile_complete = isProfileComplete;
    }
    const user = await this.db.users.update({
      where: { id: userId },
      data: updateData,
    });

    return user;
  }
}

// module.exports = {
//   upsertUser,
//   createSession,
//   getUserByEmail,
//   getUserBySessionId,
//   deleteSession,
//   updateUserProfile,
// };

module.exports = AuthRepo;
