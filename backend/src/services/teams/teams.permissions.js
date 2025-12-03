'use strict';

/**
 * Teams Permissions
 *
 * Provides basic permission helpers for team access.
 * Logic here works off the enrollment object already loaded in preHandlers.
 */

class TeamsPermissions {
  constructor(/* teamsRepo */) {
    // We keep the constructor signature flexible so routes can still
    // pass a repo instance if needed, but we don't rely on it anymore.
  }

  /**
   * Anyone enrolled in the course can view teams and team membership.
   *
   * @param {object|null} enrollment
   * @returns {boolean}
   */
  canViewTeams(enrollment) {
    return !!enrollment;
  }

  /**
   * Only professors and TAs can create/update teams or manage membership.
   *
   * @param {object|null} enrollment
   * @returns {boolean}
   */
  canModifyTeams(enrollment) {
    if (!enrollment) return false;
    return enrollment.role === 'professor' || enrollment.role === 'ta';
  }
}

module.exports = TeamsPermissions;
