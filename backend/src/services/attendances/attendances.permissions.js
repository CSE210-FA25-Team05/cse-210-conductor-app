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
   * @param {number} userId - ID of the user for the attendance
   * @returns {Promise<boolean>} True if user can create attendance, false otherwise
   */
  async canCreateAttendance(user, course, enrollment, userId) {
    // Must be enrolled in the course to create attendance
    if (enrollment === null) {
      return false;
    }

    // Professors and TAs can create any attendance
    if (enrollment.role === 'professor' || enrollment.role === 'ta') {
      return true;
    }

    // Students can only create their own attendance
    return user.id === userId;
  }

  /**
   * Check if a user can modify (update/delete) an attendance.
   * - Only professors and TAs can modify attendance
   * - Students cannot modify attendance (updates are for course staff only)
   *
   * @param {Object} user - User object
   * @param {Object} course - Course object
   * @param {Object|null} enrollment - Enrollment object (null if not enrolled)
   * @param {Object} attendance - Attendance object
   * @returns {Promise<boolean>} True if user can modify attendance, false otherwise
   */
  async canModifyAttendance(user, course, enrollment, attendance) {
    // Must be enrolled in the course to modify attendance
    if (enrollment === null) {
      return false;
    }

    // Only professors and TAs can modify attendance
    return enrollment.role === 'professor' || enrollment.role === 'ta';
  }
}

module.exports = AttendancesPermissions;
