// backend/src/services/teams/teams.permissions.js
'use strict';

/**
 * Teams Permissions
 *
 * Provides basic permission helpers for team access based on enrollment.
 * Business logic for how these are used lives in the service layer.
 */

class TeamsPermissions {
  constructor(teamsRepo) {
    // We keep a reference to teamsRepo in case we need it later,
    // but current checks only rely on the pre-loaded `enrollment`.
    this.teamsRepo = teamsRepo;
  }

  /**
   * Anyone enrolled in the course can view teams and team membership.
   *
   * @param {object|null} enrollment - enrollment row for the user in this course
   * @returns {boolean}
   */
  canViewTeams(enrollment) {
    return enrollment != null;
  }

  /**
   * Only professors and TAs can create/update teams or manage membership.
   *
   * @param {object|null} enrollment - enrollment row for the user in this course
   * @returns {boolean}
   */
  canModifyTeams(enrollment) {
    if (!enrollment) return false;
    const role = enrollment.role;
    return role === 'professor' || role === 'ta';
  }
}

module.exports = TeamsPermissions;
