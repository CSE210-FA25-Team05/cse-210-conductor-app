'use strict';

/**
 * Auth Permissions
 *
 * Provides basic permission check helpers for user resource access.
 * This module only provides atomic state queries (isProfessor, isStudent, etc.).
 * Business logic for combining these checks should be handled in the service layer.
 */

class AuthPermissions {
  constructor(authRepo) {
    this.authRepo = authRepo;
  }

  /**
   * Check if a user has a specific global role.
   *
   * @param {number} userId - ID of the user
   * @param {string} role - Role to check (e.g., 'professor', 'student', 'admin')
   * @returns {Promise<boolean>} true if user has the role, false otherwise
   */
  async isGlobalRole(userId, role) {
    const user = await this.authRepo.getUserById(userId, {
      select: { global_role: true },
    });

    if (!user) {
      return false;
    }

    return user.global_role === role;
  }

  /**
   * Check if a user is a professor.
   *
   * @param {number} userId - ID of the user
   * @returns {Promise<boolean>} true if user is a professor, false otherwise
   */
  async isProfessor(userId) {
    return this.isGlobalRole(userId, 'professor');
  }

  /**
   * Check if a user is a student.
   *
   * @param {number} userId - ID of the user
   * @returns {Promise<boolean>} true if user is a student, false otherwise
   */
  async isStudent(userId) {
    return this.isGlobalRole(userId, 'student');
  }
}

module.exports = AuthPermissions;
