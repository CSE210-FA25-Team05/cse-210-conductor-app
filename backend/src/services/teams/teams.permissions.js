// backend/src/teams/teams.permissions.js
'use strict';

/**
 * Teams Permissions
 *
 * Provides basic permission helpers for team access.
 * Business logic for combining these checks lives in the service layer.
 */

class TeamsPermissions {
  constructor(teamsRepo) {
    this.teamsRepo = teamsRepo;
  }

  /**
   * Get user's role in a course.
   *
   * @param {number} userId - ID of the user
   * @param {number} courseId - ID of the course
   * @returns {Promise<string|null>} Role ('professor', 'ta', 'student') or null if not enrolled
   */
  async getUserCourseRole(userId, courseId) {
    return this.teamsRepo.getUserCourseRole(userId, courseId);
  }

  /**
   * Anyone enrolled in the course can view teams and team membership.
   *
   * @param {number} userId
   * @param {number} courseId
   * @returns {Promise<boolean>}
   */
  async canViewTeams(userId, courseId) {
    const role = await this.getUserCourseRole(userId, courseId);
    return role !== null;
  }

  /**
   * Only professors and TAs can create/update teams or manage membership.
   *
   * @param {number} userId
   * @param {number} courseId
   * @returns {Promise<boolean>}
   */
  async canModifyTeams(userId, courseId) {
    const role = await this.getUserCourseRole(userId, courseId);
    return role === 'professor' || role === 'ta';
  }
}

module.exports = TeamsPermissions;
