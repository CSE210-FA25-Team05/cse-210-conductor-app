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
   * Check the join code for a course.
   * @param {number} courseId - ID of the course
   * @param {string} joinCode - Join code to verify
   * @returns {Promise<boolean>} True if join code matches, false otherwise
   */
  async checkCourseJoinCode(courseId, joinCode) {
    const storedJoinCode = await this.courseRepo.getCourseJoinCode(courseId);
    return storedJoinCode === joinCode;
  }
}

module.exports = CourseService;
