'use strict';

/**
 * Lectures Repository
 *
 * This module provides data access methods for lecture-related operations.
 */

class LecturesRepo {
  constructor(db) {
    this.db = db;
  }

  /**
   * Get all lectures for a specific course.
   * Only returns lectures that haven't been deleted (deleted_at is null).
   * Sorted by date so the earliest lecture comes first.
   *
   * @param {number} courseId - ID of the course
   * @returns {Promise<Array>} List of lectures
   */
  async getLecturesByCourseId(courseId) {
    return this.db.lectures.findMany({
      where: {
        course_id: courseId,
        deleted_at: null,
      },
      orderBy: {
        lecture_date: 'asc',
      },
    });
  }

  /**
   * Get one specific lecture by its ID.
   * If courseId is provided, verifies the lecture belongs to that course.
   *
   * @param {number} lectureId - ID of the lecture
   * @param {number|null} courseId - Optional course ID for validation
   * @returns {Promise<Object|null>} Lecture object or null if not found
   */
  async getLectureById(lectureId, courseId = null) {
    const where = {
      id: lectureId,
      deleted_at: null,
    };

    if (courseId !== null) {
      where.course_id = courseId;
    }

    return this.db.lectures.findFirst({
      where,
    });
  }

  /**
   * Create a new lecture in the database.
   *
   * @param {Object} data - Lecture data
   * @param {number} data.course_id - ID of the course
   * @param {Date|string} data.lecture_date - Date of the lecture
   * @param {string|null} data.code - Optional lecture code
   * @returns {Promise<Object>} Created lecture object
   */
  async createLecture(data) {
    return this.db.lectures.create({
      data: {
        course_id: data.course_id,
        lecture_date: data.lecture_date,
        code: data.code || null,
      },
    });
  }

  /**
   * Update an existing lecture.
   *
   * @param {number} lectureId - ID of the lecture to update
   * @param {Object} data - Update data
   * @param {Date|string} data.lecture_date - New lecture date
   * @param {string|null} data.code - New lecture code
   * @returns {Promise<Object>} Updated lecture object
   */
  async updateLecture(lectureId, data) {
    return this.db.lectures.update({
      where: { id: lectureId },
      data: {
        lecture_date: data.lecture_date,
        code: data.code,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Soft delete a lecture by setting deleted_at timestamp.
   *
   * @param {number} lectureId - ID of the lecture to delete
   * @returns {Promise<Object>} Updated lecture object
   */
  async deleteLecture(lectureId) {
    return this.db.lectures.update({
      where: { id: lectureId },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  /**
   * Check if a course exists in the database.
   *
   * @param {number} courseId - ID of the course
   * @returns {Promise<boolean>} True if course exists, false otherwise
   */
  async courseExists(courseId) {
    const course = await this.db.courses.findFirst({
      where: {
        id: courseId,
        deleted_at: null,
      },
    });
    return !!course;
  }

  /**
   * Get user's role in a specific course.
   *
   * @param {number} userId - ID of the user
   * @param {number} courseId - ID of the course
   * @returns {Promise<string|null>} Role ('professor', 'ta', 'student') or null if not enrolled
   */
  async getUserCourseRole(userId, courseId) {
    const enrollment = await this.db.enrollments.findFirst({
      where: {
        user_id: userId,
        course_id: courseId,
        deleted_at: null,
      },
    });

    return enrollment ? enrollment.role : null;
  }

  /**
   * Get user ID by email address.
   *
   * @param {string} email - Email address
   * @returns {Promise<number|null>} User ID or null if not found
   */
  async getUserIdByEmail(email) {
    const user = await this.db.users.findUnique({
      where: {
        email: email.toLowerCase(),
        deleted_at: null,
      },
    });

    return user ? user.id : null;
  }
}

module.exports = LecturesRepo;
