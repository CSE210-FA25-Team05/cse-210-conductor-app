'use strict';

/**
 * Attendances Permissions
 *
 * Provides permission check helpers for attendance resource access.
 */

class AttendancesPermissions {
  constructor(attendancesRepo) {
    this.attendancesRepo = attendancesRepo;
  }

  /**
   * Check if a user can create attendance.
   * - Students can create their own attendance
   * - Professors and TAs can create any attendance
   *
   * @param {Object} user - User object
   * @param {Object} course - Course object
   * @param {Object|null} enrollment - Enrollment object (null if not enrolled)
   * @param {number} studentId - ID of the student for the attendance
   * @returns {Promise<boolean>} True if user can create attendance, false otherwise
   */
  async canCreateAttendance(user, course, enrollment, studentId) {
    // Professors and TAs can create any attendance
    if (enrollment !== null) {
      if (enrollment.role === 'professor' || enrollment.role === 'ta') {
        return true;
      }
    }

    // Students can only create their own attendance
    return user.id === studentId;
  }

  /**
   * Check if a user can modify (update/delete) an attendance.
   * - Students can modify their own attendance
   * - Professors and TAs can modify any attendance
   *
   * @param {Object} user - User object
   * @param {Object} course - Course object
   * @param {Object|null} enrollment - Enrollment object (null if not enrolled)
   * @param {Object} attendance - Attendance object
   * @returns {Promise<boolean>} True if user can modify attendance, false otherwise
   */
  async canModifyAttendance(user, course, enrollment, attendance) {
    // Professors and TAs can modify any attendance
    if (enrollment !== null) {
      if (enrollment.role === 'professor' || enrollment.role === 'ta') {
        return true;
      }
    }

    // Students can only modify their own attendance
    return user.id === attendance.student_id;
  }
}

module.exports = AttendancesPermissions;

