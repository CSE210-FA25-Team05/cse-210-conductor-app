'use strict';

/**
 * Course Repository
 *
 * This module provides data access methods for course-related operations.
 */

class CourseRepo {
  constructor(db) {
    this.db = db;
  }

  /**
   * Get all courses.
   * @returns {Promise<Array>} List of all courses
   */
  async getAllCourse() {
    const courses = await this.db.courses.findMany();
    return courses;
  }

  /**
   * Get a course by ID.
   * @param {number} courseId
   * @returns {Promise<Object|null>} Course object or null if not found
   */
  async getCourseById(courseId) {
    const course = await this.db.courses.findUnique({
      where: { id: courseId },
    });
    return course;
  }

  /**
   * Get users in a course.
   * @param {number} courseId
   * @returns {Promise<Array>} List of enrollments in the course
   */
  async getUsersInCourse(courseId) {
    const users = await this.db.enrollments.findMany({
      where: { course_id: courseId },
    });
    return users;
  }

  /**
   * Get user details in a course.
   * @param {number} courseId
   * @param {number} userId
   * @returns {Promise<Object|null>} Enrollment object or null if not found
   */
  async getUserDetailsInCourse(courseId, userId) {
    const user = await this.db.enrollments.findFirst({
      where: {
        user_id: userId,
        course_id: courseId,
      },
    });
    return user;
  }

  /**
   * Get enrollment by user and course.
   * Used for permission checks.
   * @param {number} userId - ID of the user
   * @param {number} courseId - ID of the course
   * @returns {Promise<Object|null>} Enrollment object or null if not found
   */
  async getEnrollmentByUserAndCourse(userId, courseId) {
    const enrollment = await this.db.enrollments.findFirst({
      where: {
        user_id: userId,
        course_id: courseId,
      },
    });
    return enrollment;
  }

  /**
   * Add a new course.
   * @param {Object} courseData - Data for the new course
   * @returns {Promise<Object>} Created course object
   */
  async addCourse(courseData) {
    const {
      course_code,
      course_name,
      term,
      section = null,
      start_date = null,
      end_date = null,
      join_code = null,
    } = courseData || {};

    // Validate required fields first
    if (!course_code || !course_name || !term) {
      const e = new Error('course_code, course_name, term are required');
      e.code = 'BAD_REQUEST';
      throw e;
    }

    // Ensure a unique join code exists on courseData
    let finalJoinCode = join_code;
    if (finalJoinCode == null) {
      // Generate a random 6-character join code
      let uniqueCode;
      let exists;
      do {
        uniqueCode = await this.generateJoinCode();
        exists = await this.db.courses.findFirst({
          where: { join_code: uniqueCode },
        });
      } while (exists);
      finalJoinCode = uniqueCode;
    }

    const created = await this.db.courses.create({
      data: {
        course_code,
        course_name,
        term,
        section,
        start_date: start_date ? new Date(start_date) : null,
        end_date: end_date ? new Date(end_date) : null,
        join_code: finalJoinCode,
      },
    });
    return created;
  }

  /**
   * Update course details.
   * @param {number} courseId - ID of the course to update
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated course object
   */
  async updateCourse(courseId, updateData) {
    const updatedCourse = await this.db.courses.update({
      where: { id: courseId },
      data: updateData,
    });
    return updatedCourse;
  }

  /**
   * Delete a course.
   * @param {number} courseId - ID of the course to delete
   * @returns {Promise<Object>} Deleted course object
   */
  async deleteCourse(courseId) {
    const deletedCourse = await this.db.courses.delete({
      where: { id: courseId },
    });
    return deletedCourse;
  }

  /**
   * Get the join code for a course.
   * @param {number} courseId - ID of the course
   * @returns {Promise<string|null>} Join code of the course or null if not found
   */
  async getCourseJoinCode(courseId) {
    const course = await this.db.courses.findUnique({
      where: { id: courseId },
      select: { join_code: true },
    });
    return course ? course.join_code : null;
  }

  /**
   * Add an enrollment of a user into a course.
   * @param {number} courseId - ID of the course
   * @param {number} userId - ID of the user
   * @returns {Promise<Object>} Created enrollment object
   */
  async addEnrollment(courseId, userId) {
    const enrollment = await this.db.enrollments.create({
      data: {
        course_id: courseId,
        user_id: userId,
      },
    });
    return enrollment;
  }

  /**
   * Update the role of a user in a course enrollment.
   * @param {number} courseId - ID of the course
   * @param {number} userId - ID of the user
   * @param {string} role - New role to assign
   * @returns {Promise<Object>} Updated enrollment object
   */
  async updateEnrollmentRole(courseId, userId, role) {
    const updatedEnrollment = await this.db.enrollments.updateMany({
      where: {
        course_id: courseId,
        user_id: userId,
      },
      data: {
        role: role,
      },
    });
    return updatedEnrollment;
  }

  /**
   * Delete an enrollment of a user from a course.
   * @param {number} courseId - ID of the course
   * @param {number} userId - ID of the user
   * @returns {Promise<Object>} Deleted enrollment object
   */
  async deleteEnrollment(courseId, userId) {
    const deletedEnrollment = await this.db.enrollments.deleteMany({
      where: {
        course_id: courseId,
        user_id: userId,
      },
    });
    return deletedEnrollment;
  }

  /**
   * Generate a random 6-character join code.
   * @returns {Promise<string>} Generated join code
   */
  async generateJoinCode() {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let generatedCode = '';
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      generatedCode += characters.charAt(randomIndex);
    }
    return generatedCode;
  }
}

module.exports = CourseRepo;
