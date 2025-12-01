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
   *
   * @param {number} attendanceId - ID of the attendance to update
   * @param {Object} data - Update data
   * @param {number|null} data.updated_by - ID of the user who updated
   * @param {string|null} data.update_reason - Reason for update
   * @returns {Promise<Object>} Updated attendance object
   */
  async updateAttendance(attendanceId, data) {
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
      where: { id: attendanceId },
      data: updateData,
    });
  }

  /**
   * Soft delete an attendance record by setting deleted_at timestamp.
   *
   * @param {number} attendanceId - ID of the attendance to delete
   * @returns {Promise<Object>} Updated attendance object
   */
  async deleteAttendance(attendanceId) {
    return this.db.attendances.update({
      where: { id: attendanceId },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  /**
   * Check if a lecture exists and belongs to the course.
   *
   * @param {number} lectureId - ID of the lecture
   * @param {number} courseId - ID of the course
   * @returns {Promise<boolean>} True if lecture exists and belongs to course, false otherwise
   */
  async lectureExists(lectureId, courseId) {
    const lecture = await this.db.lectures.findFirst({
      where: {
        id: lectureId,
        course_id: courseId,
        deleted_at: null,
      },
    });
    return !!lecture;
  }
}

module.exports = AttendancesRepo;

