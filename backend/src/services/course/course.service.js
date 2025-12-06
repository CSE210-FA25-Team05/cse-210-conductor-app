'use strict';

/**
 * Course Service
 *
 * This module provides business logic for course-related operations.
 */

class CourseService {
  constructor(courseRepo) {
    this.courseRepo = courseRepo;
  }

  /**
   * Get all courses for a specific user (by enrollment).
   * only sees courses they are enrolled in / associated with.
   * @param {number} userId - ID of the user
   * @returns {Promise<Array>} List of courses the user is enrolled in
   */
  async getCoursesForUser(userId) {
    return this.courseRepo.getCoursesForUser(userId);
  }

  /**
   * Check the join code for a course.
   * @param {number} courseId - ID of the course
   * @param {string} joinCode - Join code to verify
   * @returns {Promise<boolean>} True if join code matches, false otherwise
   */
  async enrollByJoinCode(joinCode, userId) {
    if (!joinCode) {
      throw new Error('Join code is required');
    }
    joinCode = joinCode.toUpperCase();
    return this.courseRepo.enrollByJoinCode(joinCode, userId);
  }
}

module.exports = CourseService;
