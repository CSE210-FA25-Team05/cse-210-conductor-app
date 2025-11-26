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
      where: { course_id: courseId },
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
      },
      include: {
        users: true,
      },
    });
    return members;
  }

  /**
   * Create a new team in a course.
   * @param {number} courseId
   * @param {{ name: string, description?: string|null }} data
   * @returns {Promise<Object>}
   */
  async createTeam(courseId, data) {
    const { name, description = null } = data || {};

    if (!name) {
      const e = new Error('name is required');
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

    const updated = await this.db.teams.update({
      where: { id: teamId },
      data,
    });

    return updated;
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
      },
      data: {
        team_id: null,
      },
    });
  }

  /**
   * Check if a course exists in the database.
   *
   * @param {number} courseId - ID of the course
   * @returns {Promise<boolean>} True if course exists, false otherwise
   */
  async courseExists(courseId) {
    const course = await this.db.courses.findFirst({
      where: {
        id: courseId,
        deleted_at: null,
      },
    });
    return !!course;
  }

  /**
   * Get user's role in a specific course.
   *
   * @param {number} userId - ID of the user
   * @param {number} courseId - ID of the course
   * @returns {Promise<string|null>} Role ('professor', 'ta', 'student') or null if not enrolled
   */
  async getUserCourseRole(userId, courseId) {
    const enrollment = await this.db.enrollments.findFirst({
      where: {
        user_id: userId,
        course_id: courseId,
        deleted_at: null,
      },
    });

    return enrollment ? enrollment.role : null;
  }
}

module.exports = TeamsRepo;
