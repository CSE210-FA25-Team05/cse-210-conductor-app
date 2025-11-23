'use strict';

/**
 * Lectures Permissions
 *
 * Provides basic permission check helpers for lecture resource access.
 * This module only provides atomic state queries (canViewLectures, canModifyLectures, etc.).
 * Business logic for combining these checks should be handled in the service layer.
 */

class LecturesPermissions {
  constructor(lecturesRepo) {
    this.lecturesRepo = lecturesRepo;
  }

  /**
   * Get user's role in a course.
   *
   * @param {number} userId - ID of the user
   * @param {number} courseId - ID of the course
   * @returns {Promise<string|null>} Role ('professor', 'ta', 'student') or null if not enrolled
   */
  async getUserCourseRole(userId, courseId) {
    return await this.lecturesRepo.getUserCourseRole(userId, courseId);
  }

  /**
   * Check if a user can view lectures in a course.
   * Anyone enrolled in the course (professor, TA, or student) can view lectures.
   *
   * @param {number} userId - ID of the user
   * @param {number} courseId - ID of the course
   * @returns {Promise<boolean>} True if user can view lectures, false otherwise
   */
  async canViewLectures(userId, courseId) {
    const role = await this.getUserCourseRole(userId, courseId);
    return role !== null;
  }

  /**
   * Check if a user can modify lectures in a course.
   * Only professors and TAs can create, update, or delete lectures.
   *
   * @param {number} userId - ID of the user
   * @param {number} courseId - ID of the course
   * @returns {Promise<boolean>} True if user can modify lectures, false otherwise
   */
  async canModifyLectures(userId, courseId) {
    const role = await this.getUserCourseRole(userId, courseId);
    return role === 'professor' || role === 'ta';
  }
}

module.exports = LecturesPermissions;
