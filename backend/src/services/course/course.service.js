'use strict';

const { isValidEnumValue, CourseRoles } = require('../shared/shared.enums');

/**
 * Course Service
 *
 * This module provides business logic for course-related operations.
 */

class CourseService {
  constructor(courseRepo, authRepo) {
    this.courseRepo = courseRepo;
    this.authRepo = authRepo;
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
    joinCode = joinCode.toUpperCase();
    return this.courseRepo.enrollByJoinCode(joinCode, userId);
  }

  async updateUserInCourse(courseId, userId, updateData) {
    const updatedRole = updateData.role;
    if (!isValidEnumValue(CourseRoles, updatedRole)) {
      const e = new Error(
        `Invalid course role: ${updatedRole}. Must be one of ${Object.values(CourseRoles).join(', ')}`
      );
      e.code = 'BAD_REQUEST';
      throw e;
    }

    return await this.courseRepo.updateEnrollmentRole(
      parseInt(courseId, 10),
      parseInt(userId, 10),
      updatedRole
    );
  }

  /**
   * Validate role value.
   * @param {string} role - Role to validate
   * @returns {boolean} True if role is valid
   */
  isValidRole(role) {
    const validRoles = ['student', 'ta', 'professor'];
    return validRoles.includes(role);
  }

  /**
   * Add a user to a course by email.
   * If user exists, add enrollment. If user doesn't exist, create user stub and add enrollment.
   * @param {number} courseId - ID of the course
   * @param {string} email - Email of the user
   * @param {string} role - Role for the enrollment (default: 'student')
   * @returns {Promise<Object>} Created enrollment object
   */
  async addUserToCourseByEmail(courseId, email, role = 'student') {
    // Validate role if provided
    if (role && !this.isValidRole(role)) {
      const e = new Error(
        `Invalid role: ${role}. Valid roles are: student, ta, professor`
      );
      e.code = 'BAD_REQUEST';
      throw e;
    }

    if (role === 'professor') {
      const e = new Error(
        `Professor role is not allowed to be added to a course`
      );
      e.code = 'BAD_REQUEST';
      throw e;
    }

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    let user = await this.authRepo.getUserByEmail(normalizedEmail);

    // If user doesn't exist, create a user stub
    if (!user) {
      user = await this.authRepo.upsertUser({
        email: normalizedEmail,
        first_name: null,
        last_name: null,
        last_login: null,
      });
      if (!user) {
        const e = new Error(`Failed to create user: ${normalizedEmail}`);
        e.code = 'INTERNAL_SERVER_ERROR';
        throw e;
      }
    }

    // Check if user is already enrolled in this course
    const existingEnrollment =
      await this.courseRepo.getEnrollmentByUserAndCourse(user.id, courseId);

    if (existingEnrollment) {
      const e = new Error(
        `User ${normalizedEmail} is already enrolled in this course with role: ${existingEnrollment.role}`
      );
      e.code = 'CONFLICT';
      throw e;
    }

    // Add enrollment
    const enrollment = await this.courseRepo.addEnrollment(
      courseId,
      user.id,
      role
    );

    return enrollment;
  }
}

module.exports = CourseService;
