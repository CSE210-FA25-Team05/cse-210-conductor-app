'use strict';

/**
 * Teams Service
 *
 * Business logic for team operations.
 * Works with a TeamsRepo instance (class-based, similar to AuthService/AuthRepo).
 */

class TeamsService {
  constructor(teamsRepo) {
    this.teamsRepo = teamsRepo;
  }

  /**
   * List all teams in a course.
   * @param {number} courseId
   */
  async listTeams(courseId) {
    return this.teamsRepo.getTeamsInCourse(courseId);
  }

  /**
   * Get a single team in a course.
   * @param {number} courseId
   * @param {number} teamId
   */
  async getTeam(courseId, teamId) {
    const team = await this.teamsRepo.getTeamById(courseId, teamId);
    if (!team) {
      const e = new Error('Team not found');
      e.code = 'NOT_FOUND';
      throw e;
    }
    return team;
  }

  /**
   * Get members of a team.
   * @param {number} courseId
   * @param {number} teamId
   */
  async getTeamMembers(courseId, teamId) {
    // Ensure team exists
    await this.getTeam(courseId, teamId);
    return this.teamsRepo.getTeamMembers(courseId, teamId);
  }

  /**
   * Create a team (optionally with initial members).
   * @param {number} courseId
   * @param {object} payload - { name, description?, members?: [{id, role}] }
   */
  async createTeam(courseId, payload) {
    const { name, description, members } = payload || {};

    const team = await this.teamsRepo.createTeam(courseId, {
      name,
      description,
    });

    if (Array.isArray(members) && members.length > 0) {
      await this.teamsRepo.addMembersToTeam(courseId, team.id, members);
    }

    return team;
  }

  /**
   * Update team info (name, description, etc.).
   * @param {number} courseId
   * @param {number} teamId
   * @param {object} data
   */
  async updateTeam(courseId, teamId, data) {
    return this.teamsRepo.updateTeam(courseId, teamId, data || {});
  }

  /**
   * Add members to a team.
   * Accepts either a single {id, role} object or an array of them.
   * @param {number} courseId
   * @param {number} teamId
   * @param {object|Array} membersRaw
   */
  async addMembers(courseId, teamId, membersRaw) {
    await this.getTeam(courseId, teamId);

    const members = Array.isArray(membersRaw)
      ? membersRaw
      : membersRaw
        ? [membersRaw]
        : [];

    if (members.length === 0) {
      return;
    }

    await this.teamsRepo.addMembersToTeam(courseId, teamId, members);
  }

  /**
   * Update roles of existing team members.
   * @param {number} courseId
   * @param {number} teamId
   * @param {Array<{id, role}>} members
   */
  async updateMembers(courseId, teamId, members) {
    await this.getTeam(courseId, teamId);
    await this.teamsRepo.updateMemberRoles(courseId, teamId, members || []);
  }

  /**
   * Remove members from a team (clear team_id on enrollments).
   * @param {number} courseId
   * @param {number} teamId
   * @param {number[]} memberIds
   */
  async removeMembers(courseId, teamId, memberIds) {
    await this.getTeam(courseId, teamId);
    await this.teamsRepo.removeMembersFromTeam(
      courseId,
      teamId,
      memberIds || []
    );
  }
}

module.exports = TeamsService;
