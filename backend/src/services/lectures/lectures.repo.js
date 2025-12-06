'use strict';

/**
 * Lectures Repository
 *
 * This module provides data access methods for lecture-related operations.
 */

const { generateCode } = require('../../utils/code-generator');

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
   * Get a lecture by its attendance code (only active codes).
   * Only returns lectures with active (non-expired) codes.
   *
   * @param {number} courseId - ID of the course
   * @param {string} code - Attendance code
   * @returns {Promise<Object|null>} Lecture object or null if not found
   */
  async getLectureByCode(courseId, code) {
    return this.db.lectures.findFirst({
      where: {
        course_id: courseId,
        code: code,
        deleted_at: null,
        code_expires_at: {
          gte: new Date(), // Only active (non-expired) codes
        },
      },
    });
  }

  /**
   * Get a lecture by code regardless of expiration status.
   * Used to check if code exists but expired (for better error messages).
   *
   * @param {number} courseId - ID of the course
   * @param {string} code - Attendance code
   * @returns {Promise<Object|null>} Lecture object or null if not found
   */
  async getLectureByCodeAnyStatus(courseId, code) {
    return this.db.lectures.findFirst({
      where: {
        course_id: courseId,
        code: code,
        deleted_at: null,
      },
    });
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
      uniqueCode = generateCode();
      exists = await this.db.lectures.findFirst({
        where: {
          course_id: courseId,
          code: uniqueCode,
          deleted_at: null,
          // Only check codes that are currently active (not expired)
          code_expires_at: {
            gte: new Date(),
          },
        },
      });
    } while (exists);
    return uniqueCode;
  }

  /**
   * Create a new lecture in the database.
   * Note: Attendance code is NOT auto-generated. Use activateAttendance() to generate code.
   *
   * @param {Object} data - Lecture data
   * @param {number} data.course_id - ID of the course
   * @param {Date|string} data.lecture_date - Date of the lecture
   * @returns {Promise<Object>} Created lecture object
   */
  async createLecture(data) {
    // Convert date string to Date object if needed
    const lectureDate =
      data.lecture_date instanceof Date
        ? data.lecture_date
        : new Date(data.lecture_date);

    // Do NOT auto-generate code - code will be generated when attendance is activated
    return this.db.lectures.create({
      data: {
        course_id: data.course_id,
        lecture_date: lectureDate,
        code: null,
        code_generated_at: null,
        code_expires_at: null,
      },
    });
  }

  /**
   * Update an existing lecture.
   * Note: Code management is handled by activateAttendance endpoint.
   * This method only updates lecture_date.
   *
   * @param {number} lectureId - ID of the lecture to update
   * @param {number} courseId - Course ID for validation
   * @param {Object} data - Update data
   * @param {Date|string} data.lecture_date - New lecture date
   * @returns {Promise<Object>} Updated lecture object
   */
  async updateLecture(lectureId, courseId, data) {
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

    return this.db.lectures.update({
      where: {
        id: lectureId,
        course_id: courseId,
      },
      data: updateData,
    });
  }

  /**
   * Generate and set attendance code for a lecture.
   * This is a simple data access method - business logic should be in the service layer.
   *
   * @param {number} lectureId - ID of the lecture
   * @param {number} courseId - ID of the course (for generating unique code and validation)
   * @returns {Promise<Object>} Updated lecture object with code and expiration timestamps
   */
  async activateAttendance(lectureId, courseId) {
    // Generate new code
    const code = await this.generateUniqueCode(courseId);
    const codeGeneratedAt = new Date();
    const codeExpiresAt = new Date(codeGeneratedAt.getTime() + 5 * 60 * 1000); // 5 minutes

    return this.db.lectures.update({
      where: {
        id: lectureId,
        course_id: courseId,
      },
      data: {
        code: code,
        code_generated_at: codeGeneratedAt,
        code_expires_at: codeExpiresAt,
        updated_at: new Date(),
      },
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
   * Conditions on course_id to ensure proper nesting validation.
   *
   * @param {number} lectureId - ID of the lecture to delete
   * @param {number} courseId - Course ID for validation
   * @returns {Promise<Object>} Updated lecture object
   */
  async deleteLecture(lectureId, courseId) {
    return this.db.lectures.update({
      where: {
        id: lectureId,
        course_id: courseId,
      },
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
