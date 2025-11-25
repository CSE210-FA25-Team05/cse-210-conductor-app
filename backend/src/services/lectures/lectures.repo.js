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
   * Generate a random 6-character code.
   * Uses the same pattern as course join codes.
   *
   * @returns {string} Generated code
   */
  generateCode() {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let generatedCode = '';
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      generatedCode += characters.charAt(randomIndex);
    }
    return generatedCode;
  }

  /**
   * Generate a unique code for a course.
   * Ensures the code doesn't already exist in the course.
   * Uses the same pattern as course join code generation.
   *
   * @param {number} courseId - ID of the course
   * @returns {Promise<string>} Unique 6-character code
   */
  async generateUniqueCode(courseId) {
    let uniqueCode;
    let exists;
    do {
      uniqueCode = this.generateCode();
      exists = await this.db.lectures.findFirst({
        where: {
          course_id: courseId,
          code: uniqueCode,
          deleted_at: null,
        },
      });
    } while (exists);
    return uniqueCode;
  }

  /**
   * Create a new lecture in the database.
   *
   * @param {Object} data - Lecture data
   * @param {number} data.course_id - ID of the course
   * @param {Date|string} data.lecture_date - Date of the lecture
   * @param {string|null} data.code - Optional lecture code (if not provided, will be auto-generated)
   * @returns {Promise<Object>} Created lecture object
   */
  async createLecture(data) {
    // Convert date string to Date object if needed
    const lectureDate =
      data.lecture_date instanceof Date
        ? data.lecture_date
        : new Date(data.lecture_date);

    // Auto-generate code if not provided
    let code = data.code;
    let codeGeneratedAt = null;
    let codeExpiresAt = null;

    if (!code) {
      code = await this.generateUniqueCode(data.course_id);
      // Set expiration timestamps: code valid for 5 minutes
      codeGeneratedAt = new Date();
      codeExpiresAt = new Date(codeGeneratedAt.getTime() + 5 * 60 * 1000); // 5 minutes
    }

    return this.db.lectures.create({
      data: {
        course_id: data.course_id,
        lecture_date: lectureDate,
        code: code,
        code_generated_at: codeGeneratedAt,
        code_expires_at: codeExpiresAt,
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
   * @param {boolean} data.regenerate_code - Whether to regenerate the code
   * @param {number} data.course_id - Course ID (required if regenerating code)
   * @returns {Promise<Object>} Updated lecture object
   */
  async updateLecture(lectureId, data) {
    const updateData = {
      updated_at: new Date(),
    };

    // Convert date string to Date object if provided
    if (data.lecture_date !== undefined) {
      updateData.lecture_date =
        data.lecture_date instanceof Date
          ? data.lecture_date
          : new Date(data.lecture_date);
    }

    // Handle code regeneration
    if (data.regenerate_code === true && data.course_id) {
      const newCode = await this.generateUniqueCode(data.course_id);
      updateData.code = newCode;
      // Set expiration timestamps: code valid for 5 minutes
      updateData.code_generated_at = new Date();
      updateData.code_expires_at = new Date(
        updateData.code_generated_at.getTime() + 5 * 60 * 1000
      ); // 5 minutes
    } else if (data.code !== undefined) {
      updateData.code = data.code;
      // If manually setting code, clear expiration timestamps
      updateData.code_generated_at = null;
      updateData.code_expires_at = null;
    }

    return this.db.lectures.update({
      where: { id: lectureId },
      data: updateData,
    });
  }

  /**
   * Check if a lecture code is still valid (not expired).
   *
   * @param {Object} lecture - Lecture object
   * @returns {boolean} True if code is valid, false if expired or no code
   */
  isCodeValid(lecture) {
    if (!lecture.code || !lecture.code_expires_at) {
      return false;
    }
    const now = new Date();
    return now <= new Date(lecture.code_expires_at);
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
}

module.exports = LecturesRepo;
