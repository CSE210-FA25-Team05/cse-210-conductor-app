'use strict';

const {
  isValidEnumValue,
  CourseRoles,
  hasHigherOrEqualPrivilege,
  hasStrictlyHigherPrivilege,
} = require('../shared/shared.enums');

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

  /**
   * Update a user's role in a course.
   * Only Prof/TA can update roles, and they can only update to lower-level roles.
   * @param {number} courseId - ID of the course
   * @param {number} userId - ID of the user whose role is being updated
   * @param {object} updateData - Update data containing the new role
   * @param {number} currentUserId - ID of the user performing the update
   * @returns {Promise<Object>} Updated enrollment object
   */
  async updateUserInCourse(courseId, userId, updateData, currentUserId) {
    const updatedRole = updateData.role;
    if (!isValidEnumValue(CourseRoles, updatedRole)) {
      const e = new Error(
        `Invalid course role: ${updatedRole}. Must be one of ${Object.values(CourseRoles).join(', ')}`
      );
      e.code = 'BAD_REQUEST';
      throw e;
    }

    // Get current user's role in the course
    const currentUserEnrollment =
      await this.courseRepo.getEnrollmentByUserAndCourse(
        currentUserId,
        courseId
      );
    if (!currentUserEnrollment) {
      const e = new Error('You are not enrolled in this course');
      e.code = 'FORBIDDEN';
      throw e;
    }

    const currentUserRole = currentUserEnrollment.role;

    // Get target user's current enrollment
    const targetUserEnrollment =
      await this.courseRepo.getEnrollmentByUserAndCourse(userId, courseId);
    if (!targetUserEnrollment) {
      const e = new Error('Target user is not enrolled in this course');
      e.code = 'NOT_FOUND';
      throw e;
    }

    // Check if the new role is strictly higher than the current user's role
    // Users can only update to roles that are strictly higher in hierarchy than their own
    if (!hasStrictlyHigherPrivilege(currentUserRole, updatedRole)) {
      const e = new Error(
        `You cannot assign a role (${updatedRole}) that is higher than or equal to your own role (${currentUserRole})`
      );
      e.code = 'FORBIDDEN';
      throw e;
    }

    // Prevent assigning professor role (only global professors can be professors)
    if (updatedRole === CourseRoles.PROFESSOR) {
      const e = new Error(
        'Professor role cannot be assigned through this endpoint'
      );
      e.code = 'FORBIDDEN';
      throw e;
    }

    return await this.courseRepo.updateEnrollmentRole(
      parseInt(courseId, 10),
      parseInt(userId, 10),
      updatedRole
    );
  }

  /**
   * Add a user to a course by email.
   * If user exists, add enrollment. If user doesn't exist, create user stub and add enrollment.
   * @param {number} courseId - ID of the course
   * @param {string} email - Email of the user
   * @param {string} role - Role for the enrollment (default: 'student')
   * @returns {Promise<Object>} Created enrollment object
   */
  async addUserToCourseByEmail(courseId, email, role = CourseRoles.STUDENT) {
    // Validate role if provided
    if (role && !isValidEnumValue(CourseRoles, role)) {
      const e = new Error(
        `Invalid role: ${role}. Valid roles are: ${Object.values(CourseRoles).join(', ')}`
      );
      e.code = 'BAD_REQUEST';
      throw e;
    }

    if (role === CourseRoles.PROFESSOR) {
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
