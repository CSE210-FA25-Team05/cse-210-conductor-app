'use strict';

/**
 * Attendances Repository
 *
 * This module provides data access methods for attendance-related operations.
 */

class AttendancesRepo {
  constructor(db) {
    this.db = db;
  }

  /**
   * Get attendance by ID.
   * Verifies the attendance belongs to the specified course and lecture.
   *
   * @param {number} attendanceId - ID of the attendance
   * @param {number} courseId - Course ID for validation
   * @param {number} lectureId - Lecture ID for validation
   * @returns {Promise<Object|null>} Attendance object or null if not found
   */
  async getAttendanceById(attendanceId, courseId, lectureId) {
    return this.db.attendances.findFirst({
      where: {
        id: attendanceId,
        course_id: courseId,
        lecture_id: lectureId,
        deleted_at: null,
      },
    });
  }

  /**
   * Get attendance by user and lecture.
   *
   * @param {number} userId - ID of the user
   * @param {number} lectureId - ID of the lecture
   * @returns {Promise<Object|null>} Attendance object or null if not found
   */
  async getAttendanceByStudentAndLecture(userId, lectureId) {
    return this.db.attendances.findFirst({
      where: {
        user_id: userId,
        lecture_id: lectureId,
        deleted_at: null,
      },
    });
  }

  /**
   * Get all attendances for a lecture.
   *
   * @param {number} lectureId - ID of the lecture
   * @returns {Promise<Array>} List of attendances
   */
  async getAttendancesByLectureId(lectureId) {
    return this.db.attendances.findMany({
      where: {
        lecture_id: lectureId,
        deleted_at: null,
      },
      orderBy: {
        created_at: 'asc',
      },
    });
  }

  /**
   * Create a new attendance record.
   *
   * @param {Object} data - Attendance data
   * @param {number} data.course_id - ID of the course
   * @param {number} data.lecture_id - ID of the lecture
   * @param {number} data.user_id - ID of the user
   * @param {number|null} data.updated_by - ID of the user who updated (optional)
   * @param {string|null} data.update_reason - Reason for update (optional)
   * @returns {Promise<Object>} Created attendance object
   */
  async createAttendance(data) {
    return this.db.attendances.create({
      data: {
        course_id: data.course_id,
        lecture_id: data.lecture_id,
        user_id: data.user_id,
        updated_by: data.updated_by || null,
        update_reason: data.update_reason || null,
      },
    });
  }

  /**
   * Update an existing attendance record.
   * Conditions on course_id and lecture_id to ensure proper nesting validation.
   *
   * @param {number} attendanceId - ID of the attendance to update
   * @param {number} courseId - Course ID for validation
   * @param {number} lectureId - Lecture ID for validation
   * @param {Object} data - Update data
   * @param {number|null} data.updated_by - ID of the user who updated
   * @param {string|null} data.update_reason - Reason for update
   * @returns {Promise<Object>} Updated attendance object
   */
  async updateAttendance(attendanceId, courseId, lectureId, data) {
    const updateData = {
      updated_at: new Date(),
    };

    if (data.updated_by !== undefined) {
      updateData.updated_by = data.updated_by;
    }

    if (data.update_reason !== undefined) {
      updateData.update_reason = data.update_reason;
    }

    return this.db.attendances.update({
      where: {
        id: attendanceId,
        course_id: courseId,
        lecture_id: lectureId,
      },
      data: updateData,
    });
  }

  /**
   * Soft delete an attendance record by setting deleted_at timestamp.
   * Conditions on course_id and lecture_id to ensure proper nesting validation.
   *
   * @param {number} attendanceId - ID of the attendance to delete
   * @param {number} courseId - Course ID for validation
   * @param {number} lectureId - Lecture ID for validation
   * @returns {Promise<Object>} Updated attendance object
   */
  async deleteAttendance(attendanceId, courseId, lectureId) {
    return this.db.attendances.update({
      where: {
        id: attendanceId,
        course_id: courseId,
        lecture_id: lectureId,
      },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  /**
   * Check if a user is enrolled in a course.
   *
   * @param {number} userId - ID of the user
   * @param {number} courseId - ID of the course
   * @returns {Promise<boolean>} True if enrolled, false otherwise
   */
  async isUserEnrolledInCourse(userId, courseId) {
    const enrollment = await this.db.enrollments.findFirst({
      where: {
        user_id: userId,
        course_id: courseId,
        deleted_at: null,
      },
    });
    return !!enrollment;
  }

  /**
   * Get attendance statistics for a lecture.
   * Returns total enrolled students, total present, and attendance percentage.
   *
   * @param {number} lectureId - ID of the lecture
   * @param {number} courseId - ID of the course
   * @returns {Promise<Object>} Statistics object with total_enrolled, total_present, attendance_percentage
   */
  async getAttendanceStats(lectureId, courseId) {
    // Get total enrolled students in the course (including team_lead)
    const totalEnrolled = await this.db.enrollments.count({
      where: {
        course_id: courseId,
        role: {
          in: ['student', 'team_lead'], // Include both student and team_lead roles
        },
        deleted_at: null,
      },
    });

    // Get total present (attendances for this lecture)
    const totalPresent = await this.db.attendances.count({
      where: {
        lecture_id: lectureId,
        course_id: courseId,
        deleted_at: null,
      },
    });

    // Calculate attendance percentage
    const attendancePercentage =
      totalEnrolled > 0 ? (totalPresent / totalEnrolled) * 100 : 0;

    return {
      total_enrolled: totalEnrolled,
      total_present: totalPresent,
      attendance_percentage: Math.round(attendancePercentage * 100) / 100, // Round to 2 decimal places
    };
  }

  /**
   * Get completed lectures for a course (where attendance was activated and window has closed).
   * Only includes lectures where:
   * - Attendance was activated (code_expires_at is not null)
   * - Attendance window has closed (code_expires_at is in the past)
   *
   * @param {number} courseId - ID of the course
   * @param {Date|null} startTime - Optional start date filter for lecture_date
   * @param {Date|null} endTime - Optional end date filter for lecture_date
   * @returns {Promise<Array>} List of completed lectures
   */
  async getCompletedLectures(courseId, startTime = null, endTime = null) {
    const now = new Date();
    const where = {
      course_id: courseId,
      deleted_at: null,
      // Only include lectures where attendance was activated
      code_expires_at: {
        not: null,
        // And attendance window has closed (expired)
        lt: now,
      },
    };

    // Optional: Filter by lecture_date range
    if (startTime || endTime) {
      where.lecture_date = {};
      if (startTime) {
        where.lecture_date.gte = startTime;
      }
      if (endTime) {
        where.lecture_date.lte = endTime;
      }
    }

    return this.db.lectures.findMany({
      where,
      orderBy: {
        lecture_date: 'desc', // Newest first
      },
    });
  }

  /**
   * Get user's attendances for specific lectures.
   *
   * @param {number} userId - ID of the user
   * @param {Array<number>} lectureIds - Array of lecture IDs
   * @returns {Promise<Array>} List of attendances
   */
  async getUserAttendancesForLectures(userId, lectureIds) {
    if (!lectureIds || lectureIds.length === 0) {
      return [];
    }

    return this.db.attendances.findMany({
      where: {
        user_id: userId,
        lecture_id: {
          in: lectureIds,
        },
        deleted_at: null,
      },
    });
  }
}

module.exports = AttendancesRepo;
