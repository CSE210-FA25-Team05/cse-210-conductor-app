'use strict';

/**
 * Teams Service
 *
 * Business logic for team operations.
 */

class TeamsService {
  constructor(teamsRepo, teamsPermissions) {
    this.teamsRepo = teamsRepo;
    this.teamsPermissions = teamsPermissions;
  }

  async assertCanView(user, course, enrollment) {
    if (enrollment === null) {
      const canView = await this.teamsPermissions.canViewTeams(
        user.id,
        course.id
      );
      if (!canView) {
        const e = new Error('You are not enrolled in this course');
        e.code = 'FORBIDDEN';
        throw e;
      }
    }
  }

  async assertCanModify(user, course, enrollment, action) {
    if (enrollment === null) {
      const canModify = await this.teamsPermissions.canModifyTeams(
        user.id,
        course.id
      );
      if (!canModify) {
        const e = new Error(
          action ||
            'Only professors and TAs can create or update teams / membership'
        );
        e.code = 'FORBIDDEN';
        throw e;
      }
    } else if (enrollment.role !== 'professor' && enrollment.role !== 'ta') {
      const e = new Error(
        action ||
          'Only professors and TAs can create or update teams / membership'
      );
      e.code = 'FORBIDDEN';
      throw e;
    }
  }

  /**
   * List all teams in a course.
   */
  async listTeams(user, course, enrollment) {
    await this.assertCanView(user, course, enrollment);
    return this.teamsRepo.getTeamsInCourse(course.id);
  }

  /**
   * Get a single team in a course.
   */
  async getTeam(user, course, enrollment, teamId) {
    await this.assertCanView(user, course, enrollment);
    const team = await this.teamsRepo.getTeamById(course.id, teamId);
    if (!team) {
      const e = new Error('Team not found');
      e.code = 'NOT_FOUND';
      throw e;
    }
    return team;
  }

  /**
   * Get members of a team.
   */
  async getTeamMembers(user, course, enrollment, teamId) {
    await this.getTeam(user, course, enrollment, teamId); // checks view + existence
    return this.teamsRepo.getTeamMembers(course.id, teamId);
  }

  /**
   * Create a team (optionally with initial members).
   */
  async createTeam(user, course, enrollment, payload) {
    await this.assertCanModify(
      user,
      course,
      enrollment,
      'Only professors and TAs can create teams'
    );

    const { name, description, members } = payload || {};
    const team = await this.teamsRepo.createTeam(course.id, {
      name,
      description,
    });

    if (Array.isArray(members) && members.length > 0) {
      await this.teamsRepo.addMembersToTeam(course.id, team.id, members);
    }

    return team;
  }

  /**
   * Update team info (name, description, etc.).
   */
  async updateTeam(user, course, enrollment, teamId, data) {
    await this.assertCanModify(
      user,
      course,
      enrollment,
      'Only professors and TAs can update teams'
    );
    return this.teamsRepo.updateTeam(course.id, teamId, data || {});
  }

  /**
   * Add members to a team.
   *
   * Enforces that all provided user IDs are actually enrolled in the course
   * before updating their team_id. If any are not enrolled, we throw
   * BAD_REQUEST and do not perform any updates.
   */
  async addMembers(user, course, enrollment, teamId, membersRaw) {
    await this.assertCanModify(
      user,
      course,
      enrollment,
      'Only professors and TAs can add members to teams'
    );
    await this.getTeam(user, course, enrollment, teamId);

    const members = Array.isArray(membersRaw)
      ? membersRaw
      : membersRaw
        ? [membersRaw]
        : [];

    if (members.length === 0) {
      return;
    }

    const memberIds = members.map((m) => m.id);

    const enrollments = await this.teamsRepo.getEnrollmentsForUsers(
      course.id,
      memberIds
    );
    const enrolledIds = new Set(enrollments.map((e) => e.user_id));
    const missingIds = memberIds.filter((id) => !enrolledIds.has(id));

    if (missingIds.length > 0) {
      const e = new Error(
        `Some users are not enrolled in this course: ${missingIds.join(', ')}`
      );
      e.code = 'BAD_REQUEST';
      throw e;
    }

    await this.teamsRepo.addMembersToTeam(course.id, teamId, members);
  }

  /**
   * Update roles of existing team members.
   */
  async updateMembers(user, course, enrollment, teamId, members) {
    await this.assertCanModify(
      user,
      course,
      enrollment,
      'Only professors and TAs can update team member roles'
    );
    await this.getTeam(user, course, enrollment, teamId);
    await this.teamsRepo.updateMemberRoles(course.id, teamId, members || []);
  }

  /**
   * Remove members from a team (clear team_id on enrollments).
   */
  async removeMembers(user, course, enrollment, teamId, memberIds) {
    await this.assertCanModify(
      user,
      course,
      enrollment,
      'Only professors and TAs can remove team members'
    );
    await this.getTeam(user, course, enrollment, teamId);
    await this.teamsRepo.removeMembersFromTeam(
      course.id,
      teamId,
      memberIds || []
    );
  }
}

module.exports = TeamsService;
