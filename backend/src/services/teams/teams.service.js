// backend/src/services/teams/teams.service.js
'use strict';

/**
 * Teams Service
 *
 * Business logic for team operations.
 */

const {
  mapUserAndEnrollmentToCourseUser,
  mapUserAndTaTeamToTaAssignment,
} = require('../shared/shared.mappers');

class TeamsService {
  constructor(teamsRepo, teamsPermissions) {
    this.teamsRepo = teamsRepo;
    this.teamsPermissions = teamsPermissions;
  }

  async assertCanView(user, course, enrollment) {
    const canView = this.teamsPermissions.canViewTeams(enrollment);
    if (!canView) {
      const e = new Error('You are not enrolled in this course');
      e.code = 'FORBIDDEN';
      throw e;
    }
  }

  async assertCanModify(user, course, enrollment, action) {
    const canModify = this.teamsPermissions.canModifyTeams(enrollment);
    if (!canModify) {
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
   *
   * Returns an array of flattened course-user objects using
   * mapUserAndEnrollmentToCourseUser.
   */
  async getTeamMembers(user, course, enrollment, teamId) {
    await this.getTeam(user, course, enrollment, teamId); // checks view + existence

    const rawMembers = await this.teamsRepo.getTeamMembers(course.id, teamId);
    const members = rawMembers.map((row) =>
      mapUserAndEnrollmentToCourseUser(row.users, row)
    );

    return members;
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

    // Repo handles validation + creation.
    const team = await this.teamsRepo.createTeam(course.id, {
      name,
      description,
    });

    if (Array.isArray(members) && members.length > 0) {
      // Secondary path; main enrollment validation is in addMembers().
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
   * Delete a team from the course.
   * Clears team_id from enrollments and soft-deletes the team.
   */
  async deleteTeam(user, course, enrollment, teamId) {
    await this.assertCanModify(
      user,
      course,
      enrollment,
      'Only professors and TAs can delete teams'
    );
    await this.teamsRepo.deleteTeam(course.id, teamId);
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

  // ============================================================
  // TA ↔ Team assignment logic
  // ============================================================

  /**
   * Get all TAs assigned to a team.
   *
   * Returns an array of flattened TA assignment objects using
   * mapUserAndTaTeamToTaAssignment.
   */
  async getTeamTAs(user, course, enrollment, teamId) {
    // Reuse getTeam to ensure course membership + team existence
    await this.getTeam(user, course, enrollment, teamId);

    const rawAssignments = await this.teamsRepo.getTeamTAs(course.id, teamId);
    const tas = rawAssignments.map((row) =>
      mapUserAndTaTeamToTaAssignment(row.users, row)
    );

    return tas;
  }

  /**
   * Assign one or more TAs to a team.
   *
   * Body shape: { ids: [ta_user_id, ...] }
   * Validates that each user is a TA in this course (enrollments.role === 'ta').
   */
  async assignTeamTAs(user, course, enrollment, teamId, body) {
    await this.assertCanModify(
      user,
      course,
      enrollment,
      'Only professors and TAs can assign TAs to teams'
    );
    await this.getTeam(user, course, enrollment, teamId);

    const idsRaw = body && body.ids;
    const taUserIds = Array.isArray(idsRaw) ? idsRaw : [];

    if (taUserIds.length === 0) {
      return;
    }

    const enrollments = await this.teamsRepo.getEnrollmentsForUsers(
      course.id,
      taUserIds
    );

    const taEnrollments = enrollments.filter((e) => e.role === 'ta');
    const validTaIds = new Set(taEnrollments.map((e) => e.user_id));

    const invalidIds = taUserIds.filter((id) => !validTaIds.has(id));

    if (invalidIds.length > 0) {
      const e = new Error(
        `Some users are not TAs in this course: ${invalidIds.join(', ')}`
      );
      e.code = 'BAD_REQUEST';
      throw e;
    }

    await this.teamsRepo.assignTAsToTeam(course.id, teamId, taUserIds);
  }

  /**
   * Remove (soft-delete) one or more TAs from a team.
   *
   * Body shape: { ids: [ta_user_id, ...] }
   */
  async removeTeamTAs(user, course, enrollment, teamId, body) {
    await this.assertCanModify(
      user,
      course,
      enrollment,
      'Only professors and TAs can remove TAs from teams'
    );
    await this.getTeam(user, course, enrollment, teamId);

    const idsRaw = body && body.ids;
    const taUserIds = Array.isArray(idsRaw) ? idsRaw : [];

    if (taUserIds.length === 0) {
      return;
    }

    await this.teamsRepo.removeTAsFromTeam(course.id, teamId, taUserIds);
  }

  /**
   * Get all teams in a course that a given TA is assigned to.
   */
  async getTeamsForTA(user, course, enrollment, taUserId) {
    await this.assertCanView(user, course, enrollment);

    // Optional safety: ensure the TA is enrolled in this course.
    const enrollments = await this.teamsRepo.getEnrollmentsForUsers(course.id, [
      taUserId,
    ]);
    if (!enrollments || enrollments.length === 0) {
      const e = new Error('TA user is not enrolled in this course');
      e.code = 'BAD_REQUEST';
      throw e;
    }

    return this.teamsRepo.getTeamsForTA(course.id, taUserId);
  }
}

module.exports = TeamsService;
