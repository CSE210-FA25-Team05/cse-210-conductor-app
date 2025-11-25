'use strict';

/**
 * Course Permissions
 *
 * Provides basic permission check helpers for course resource access.
 * This module only provides atomic state queries (isProfessor, isTA, etc.).
 * Business logic for combining these checks should be handled in the service layer.
 */

class CoursePermissions {
  constructor(courseRepo, authRepo) {
    this.courseRepo = courseRepo;
    this.authRepo = authRepo;
  }

  /**
   * Get user's enrollment in a course.
   * @param {number} userId
   * @param {number} courseId
   * @returns {Promise<object|null>} enrollment record or null if not enrolled
   */
  async getEnrollment(userId, courseId) {
    return await this.courseRepo.getEnrollmentByUserAndCourse(userId, courseId);
  }

  /**
   * Get user's role in a course.
   * @param {number} userId
   * @param {number} courseId
   * @returns {Promise<string|null>} role ('professor', 'ta', 'student') or null if not enrolled
   */
  async getEnrollmentRole(userId, courseId) {
    const enrollment = await this.getEnrollment(userId, courseId);
    return enrollment ? enrollment.role : null;
  }

  /**
   * Check if a user is enrolled in a course.
   * @param {number} userId
   * @param {number} courseId
   * @returns {Promise<boolean>}
   */
  async isEnrolledInCourse(userId, courseId) {
    const enrollment = await this.getEnrollment(userId, courseId);
    return enrollment !== null;
  }

  /**
   * Check if a user is a professor in a course.
   * @param {number} userId
   * @param {number} courseId
   * @returns {Promise<boolean>}
   */
  async isProfessorInCourse(userId, courseId) {
    const role = await this.getEnrollmentRole(userId, courseId);
    return role === 'professor';
  }

  /**
   * Check if a user is a TA in a course.
   * @param {number} userId
   * @param {number} courseId
   * @returns {Promise<boolean>}
   */
  async isTAInCourse(userId, courseId) {
    const role = await this.getEnrollmentRole(userId, courseId);
    return role === 'ta';
  }

  /**
   * Check if a user is a student in a course.
   * @param {number} userId
   * @param {number} courseId
   * @returns {Promise<boolean>}
   */
  async isStudentInCourse(userId, courseId) {
    const role = await this.getEnrollmentRole(userId, courseId);
    return role === 'student';
  }
}

module.exports = CoursePermissions;
