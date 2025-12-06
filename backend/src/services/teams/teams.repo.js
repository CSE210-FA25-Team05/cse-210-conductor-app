// backend/src/services/teams/teams.repo.js
'use strict';

/**
 * Teams Repository
 *
 * Data access methods for team-related operations.
 */

class TeamsRepo {
  constructor(db) {
    this.db = db;
  }

  /**
   * Get all teams in a course.
   * @param {number} courseId
   * @returns {Promise<Array>}
   */
  async getTeamsInCourse(courseId) {
    const teams = await this.db.teams.findMany({
      where: {
        course_id: courseId,
        deleted_at: null,
      },
      orderBy: { id: 'asc' },
    });
    return teams;
  }

  /**
   * Get a single team by ID within a course.
   * @param {number} courseId
   * @param {number} teamId
   * @returns {Promise<Object|null>}
   */
  async getTeamById(courseId, teamId) {
    const team = await this.db.teams.findFirst({
      where: {
        id: teamId,
        course_id: courseId,
        deleted_at: null,
      },
    });
    return team;
  }

  /**
   * Get members of a team (enrollments + user details).
   * @param {number} courseId
   * @param {number} teamId
   * @returns {Promise<Array>}
   */
  async getTeamMembers(courseId, teamId) {
    const members = await this.db.enrollments.findMany({
      where: {
        course_id: courseId,
        team_id: teamId,
        deleted_at: null,
      },
      include: {
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
    });
    return members;
  }

  /**
   * Fetch enrollments for a list of user IDs in a given course.
   *
   * Used to validate that all requested members are actually enrolled
   * before adding them to a team.
   *
   * @param {number} courseId
   * @param {number[]} userIds
   * @returns {Promise<Array>}
   */
  async getEnrollmentsForUsers(courseId, userIds) {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return [];
    }

    return this.db.enrollments.findMany({
      where: {
        course_id: courseId,
        user_id: { in: userIds },
        deleted_at: null,
      },
    });
  }

  /**
   * Create a new team in a course.
   * @param {number} courseId
   * @param {{ name: string, description?: string|null }} data
   * @returns {Promise<Object>}
   */
  async createTeam(courseId, data) {
    let { name, description = null } = data || {};

    if (!name) {
      const e = new Error('name is required');
      e.code = 'BAD_REQUEST';
      throw e;
    }

    name = name.trim();
    if (description != null) {
      description = description.trim();
      if (description.length === 0) {
        description = null;
      }
    }

    if (name.length === 0) {
      const e = new Error('name must not be empty');
      e.code = 'BAD_REQUEST';
      throw e;
    }

    const team = await this.db.teams.create({
      data: {
        course_id: courseId,
        name,
        description,
      },
    });

    return team;
  }

  /**
   * Update team info (name, description, etc.).
   * @param {number} courseId
   * @param {number} teamId
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async updateTeam(courseId, teamId, data) {
    const existing = await this.getTeamById(courseId, teamId);
    if (!existing) {
      const e = new Error('Team not found');
      e.code = 'NOT_FOUND';
      throw e;
    }

    const updateData = { ...data };

    if (typeof updateData.name === 'string') {
      updateData.name = updateData.name.trim();
      if (updateData.name.length === 0) {
        const e = new Error('name must not be empty');
        e.code = 'BAD_REQUEST';
        throw e;
      }
    }

    if (typeof updateData.description === 'string') {
      const trimmed = updateData.description.trim();
      updateData.description = trimmed.length > 0 ? trimmed : null;
    }

    const updated = await this.db.teams.update({
      where: { id: teamId },
      data: updateData,
    });

    return updated;
  }

  /**
   * Delete a team from a course.
   *
   * - Clears team_id on related enrollments
   * - Soft-deletes the team (sets deleted_at)
   *
   * @param {number} courseId
   * @param {number} teamId
   * @returns {Promise<void>}
   */
  async deleteTeam(courseId, teamId) {
    const existing = await this.getTeamById(courseId, teamId);
    if (!existing) {
      const e = new Error('Team not found');
      e.code = 'NOT_FOUND';
      throw e;
    }

    const now = new Date();

    await this.db.$transaction([
      this.db.enrollments.updateMany({
        where: {
          course_id: courseId,
          team_id: teamId,
          deleted_at: null,
        },
        data: {
          team_id: null,
        },
      }),
      this.db.teams.update({
        where: { id: teamId },
        data: {
          deleted_at: now,
        },
      }),
    ]);
  }

  /**
   * Add members to a team.
   * Expects members: [{ id, role }]
   * Assumes users are already enrolled in the course.
   * @param {number} courseId
   * @param {number} teamId
   * @param {Array<{id: number, role?: string}>} members
   * @returns {Promise<void>}
   */
  async addMembersToTeam(courseId, teamId, members) {
    if (!Array.isArray(members) || members.length === 0) {
      return;
    }

    await this.db.$transaction(
      members.map((m) =>
        this.db.enrollments.updateMany({
          where: {
            course_id: courseId,
            user_id: m.id,
            deleted_at: null,
          },
          data: {
            team_id: teamId,
            role: m.role || 'student',
          },
        })
      )
    );
  }

  /**
   * Update roles for members in a team.
   * Expects members: [{ id, role }]
   * @param {number} courseId
   * @param {number} teamId
   * @param {Array<{id: number, role: string}>} members
   * @returns {Promise<void>}
   */
  async updateMemberRoles(courseId, teamId, members) {
    if (!Array.isArray(members) || members.length === 0) {
      return;
    }

    await this.db.$transaction(
      members.map((m) =>
        this.db.enrollments.updateMany({
          where: {
            course_id: courseId,
            team_id: teamId,
            user_id: m.id,
            deleted_at: null,
          },
          data: {
            role: m.role,
          },
        })
      )
    );
  }

  /**
   * Remove members from a team (keeps enrollment, clears team_id).
   * Expects memberIds: number[]
   * @param {number} courseId
   * @param {number} teamId
   * @param {number[]} memberIds
   * @returns {Promise<void>}
   */
  async removeMembersFromTeam(courseId, teamId, memberIds) {
    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return;
    }

    await this.db.enrollments.updateMany({
      where: {
        course_id: courseId,
        team_id: teamId,
        user_id: { in: memberIds },
        deleted_at: null,
      },
      data: {
        team_id: null,
      },
    });
  }

  // ============================================================
  // TA ↔ Team assignment helpers (using ta_teams join table)
  // ============================================================

  /**
   * Get all TAs assigned to a team (with user details).
   * @param {number} courseId
   * @param {number} teamId
   * @returns {Promise<Array>}
   */
  async getTeamTAs(courseId, teamId) {
    const records = await this.db.ta_teams.findMany({
      where: {
        course_id: courseId,
        team_id: teamId,
        deleted_at: null,
      },
      include: {
        users: true, // TA user record
      },
      orderBy: { id: 'asc' },
    });

    return records;
  }

  /**
   * Assign one or more TAs to a team.
   * Idempotent due to unique constraint + skipDuplicates.
   *
   * @param {number} courseId
   * @param {number} teamId
   * @param {number[]} taUserIds
   * @returns {Promise<void>}
   */
  async assignTAsToTeam(courseId, teamId, taUserIds) {
    if (!Array.isArray(taUserIds) || taUserIds.length === 0) {
      return;
    }

    const data = taUserIds.map((taUserId) => ({
      ta_user_id: taUserId,
      course_id: courseId,
      team_id: teamId,
    }));

    await this.db.ta_teams.createMany({
      data,
      skipDuplicates: true, // respects @@unique([ta_user_id, course_id, team_id])
    });
  }

  /**
   * Remove (soft-delete) one or more TAs from a team.
   *
   * @param {number} courseId
   * @param {number} teamId
   * @param {number[]} taUserIds
   * @returns {Promise<void>}
   */
  async removeTAsFromTeam(courseId, teamId, taUserIds) {
    if (!Array.isArray(taUserIds) || taUserIds.length === 0) {
      return;
    }

    const now = new Date();

    await this.db.ta_teams.updateMany({
      where: {
        course_id: courseId,
        team_id: teamId,
        ta_user_id: { in: taUserIds },
        deleted_at: null,
      },
      data: {
        deleted_at: now,
      },
    });
  }

  /**
   * Get all teams in a course that a given TA is assigned to.
   *
   * @param {number} courseId
   * @param {number} taUserId
   * @returns {Promise<Array>}
   */
  async getTeamsForTA(courseId, taUserId) {
    const teams = await this.db.teams.findMany({
      where: {
        course_id: courseId,
        deleted_at: null,
        ta_teams: {
          some: {
            ta_user_id: taUserId,
            deleted_at: null,
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    return teams;
  }
}

module.exports = TeamsRepo;
