'use strict';

/**
 * Attendances Service
 *
 * This module provides business logic for attendance-related operations.
 */

class AttendancesService {
  constructor(attendancesRepo, attendancesPermissions, lecturesRepo = null) {
    this.attendancesRepo = attendancesRepo;
    this.attendancesPermissions = attendancesPermissions;
    this.lecturesRepo = lecturesRepo;
  }

  /**
   * Create a new attendance record with permission check.
   *
   * @param {Object} user - Current user object
   * @param {Object} course - Course object (from req.course)
   * @param {Object|null} enrollment - Enrollment object (from req.enrollment, null if not enrolled)
   * @param {Object} lecture - Lecture object (from req.lecture)
   * @param {Object} attendanceData - Attendance data
   * @param {number} attendanceData.user_id - ID of the user (student)
   * @param {string|null} attendanceData.code - Attendance code (required for students)
   * @param {string|null} attendanceData.update_reason - Reason for update (optional)
   * @returns {Promise<Object>} Created attendance object
   */
  async createAttendance(user, course, enrollment, lecture, attendanceData) {
    // Check if attendance already exists
    const existingAttendance =
      await this.attendancesRepo.getAttendanceByStudentAndLecture(
        attendanceData.user_id,
        lecture.id
      );
    if (existingAttendance) {
      const error = new Error(
        'Attendance already exists for this user and lecture'
      );
      error.code = 'CONFLICT';
      throw error;
    }

    // Check permissions
    const canCreate = await this.attendancesPermissions.canCreateAttendance(
      user,
      course,
      enrollment,
      attendanceData.user_id
    );
    if (!canCreate) {
      const error = new Error(
        'You do not have permission to create this attendance'
      );
      error.code = 'FORBIDDEN';
      throw error;
    }

    // Ensure the target user is enrolled in this course
    const targetEnrolled = await this.attendancesRepo.isUserEnrolledInCourse(
      attendanceData.user_id,
      course.id
    );
    if (!targetEnrolled) {
      const error = new Error(
        'Target user is not enrolled in this course for attendance'
      );
      error.code = 'BAD_REQUEST';
      throw error;
    }

    // For students: verify code is correct and still valid (5 minutes expiration)
    // Professors/TAs can create attendance even if code is expired (manual attendance)
    // Note: team_lead is treated as a student for attendance purposes
    const isStudent =
      enrollment === null ||
      enrollment.role === 'student' ||
      enrollment.role === 'team_lead';
    if (isStudent) {
      // Students can only create their own attendance
      if (user.id !== attendanceData.user_id) {
        const error = new Error(
          'Students can only create attendance for themselves'
        );
        error.code = 'FORBIDDEN';
        throw error;
      }

      // Check if code exists and hasn't expired
      if (!lecture.code || !lecture.code_expires_at) {
        const error = new Error(
          'No valid attendance code available for this lecture'
        );
        error.code = 'EXPIRED';
        throw error;
      }

      // Verify the code matches
      if (!attendanceData.code || attendanceData.code !== lecture.code) {
        const error = new Error('Invalid attendance code');
        error.code = 'BAD_REQUEST';
        throw error;
      }

      // Check if code has expired
      const now = new Date();
      const expiresAt = new Date(lecture.code_expires_at);
      if (isNaN(expiresAt.getTime())) {
        const error = new Error('Invalid expiration date for attendance code');
        error.code = 'BAD_REQUEST';
        throw error;
      }
      if (now > expiresAt) {
        const error = new Error(
          'Attendance code has expired. Please contact your instructor if you were present.'
        );
        error.code = 'EXPIRED';
        throw error;
      }
    }

    return await this.attendancesRepo.createAttendance({
      course_id: course.id,
      lecture_id: lecture.id,
      user_id: attendanceData.user_id,
      updated_by: user.id,
      update_reason: attendanceData.update_reason || null,
    });
  }

  /**
   * Update an attendance record with permission check.
   *
   * @param {Object} user - Current user object
   * @param {Object} course - Course object (from req.course)
   * @param {Object|null} enrollment - Enrollment object (from req.enrollment, null if not enrolled)
   * @param {Object} lecture - Lecture object (from req.lecture)
   * @param {number} attendanceId - ID of the attendance
   * @param {Object} updateData - Update data
   * @param {string|null} updateData.update_reason - Reason for update
   * @returns {Promise<Object>} Updated attendance object
   */
  async updateAttendance(
    user,
    course,
    enrollment,
    lecture,
    attendanceId,
    updateData
  ) {
    // Check if attendance exists
    const attendance = await this.attendancesRepo.getAttendanceById(
      attendanceId,
      course.id,
      lecture.id
    );
    if (!attendance) {
      const error = new Error('Attendance not found');
      error.code = 'NOT_FOUND';
      throw error;
    }

    // Check permissions
    const canModify = await this.attendancesPermissions.canModifyAttendance(
      user,
      course,
      enrollment,
      attendance
    );
    if (!canModify) {
      const error = new Error(
        'You do not have permission to modify this attendance'
      );
      error.code = 'FORBIDDEN';
      throw error;
    }

    return await this.attendancesRepo.updateAttendance(
      attendanceId,
      course.id,
      lecture.id,
      {
        updated_by: user.id,
        update_reason: updateData.update_reason || null,
      }
    );
  }

  /**
   * Delete an attendance record with permission check.
   *
   * @param {Object} user - Current user object
   * @param {Object} course - Course object (from req.course)
   * @param {Object|null} enrollment - Enrollment object (from req.enrollment, null if not enrolled)
   * @param {Object} lecture - Lecture object (from req.lecture)
   * @param {number} attendanceId - ID of the attendance
   * @returns {Promise<void>}
   */
  async deleteAttendance(user, course, enrollment, lecture, attendanceId) {
    // Check if attendance exists
    const attendance = await this.attendancesRepo.getAttendanceById(
      attendanceId,
      course.id,
      lecture.id
    );
    if (!attendance) {
      const error = new Error('Attendance not found');
      error.code = 'NOT_FOUND';
      throw error;
    }

    // Check permissions
    const canModify = await this.attendancesPermissions.canModifyAttendance(
      user,
      course,
      enrollment,
      attendance
    );
    if (!canModify) {
      const error = new Error(
        'You do not have permission to delete this attendance'
      );
      error.code = 'FORBIDDEN';
      throw error;
    }

    await this.attendancesRepo.deleteAttendance(
      attendanceId,
      course.id,
      lecture.id
    );
  }

  /**
   * Get all attendances for a lecture with permission check.
   *
   * @param {Object} user - Current user object
   * @param {Object} course - Course object (from req.course)
   * @param {Object|null} enrollment - Enrollment object (from req.enrollment, null if not enrolled)
   * @param {Object} lecture - Lecture object (from req.lecture)
   * @returns {Promise<Array>} List of attendances
   */
  async getAttendancesByLecture(user, course, enrollment, lecture) {
    // Check permissions - must be enrolled to view attendances
    if (enrollment === null) {
      const error = new Error('You are not enrolled in this course');
      error.code = 'FORBIDDEN';
      throw error;
    }

    return await this.attendancesRepo.getAttendancesByLectureId(lecture.id);
  }

  /**
   * Get attendance statistics for a lecture.
   * Returns total enrolled students, total present, and attendance percentage.
   *
   * @param {Object} user - Current user object
   * @param {Object} course - Course object (from req.course)
   * @param {Object|null} enrollment - Enrollment object (from req.enrollment, null if not enrolled)
   * @param {Object} lecture - Lecture object (from req.lecture)
   * @returns {Promise<Object>} Statistics object
   */
  async getAttendanceStats(user, course, enrollment, lecture) {
    // Check permissions - must be enrolled to view stats
    if (enrollment === null) {
      const error = new Error('You are not enrolled in this course');
      error.code = 'FORBIDDEN';
      throw error;
    }

    return await this.attendancesRepo.getAttendanceStats(lecture.id, course.id);
  }

  /**
   * Create attendance by code.
   * Finds the lecture by code and creates attendance for the current user.
   * This is the simplified flow for students who only have a code.
   *
   * @param {Object} user - Current user object
   * @param {Object} course - Course object (from req.course)
   * @param {Object|null} enrollment - Enrollment object (from req.enrollment, null if not enrolled)
   * @param {string} code - Attendance code
   * @returns {Promise<Object>} Created attendance object
   */
  async createAttendanceByCode(user, course, enrollment, code) {
    if (!this.lecturesRepo) {
      const error = new Error('Lectures repository not available');
      error.code = 'INTERNAL_SERVER_ERROR';
      throw error;
    }

    // Find lecture by code (only active codes)
    const lecture = await this.lecturesRepo.getLectureByCode(course.id, code);
    if (!lecture) {
      // Check if code exists but expired for more specific error message
      const expiredLecture = await this.lecturesRepo.getLectureByCodeAnyStatus(
        course.id,
        code
      );
      if (expiredLecture) {
        // Code exists but expired
        const error = new Error(
          'Attendance code has expired. Please contact your instructor if you were present.'
        );
        error.code = 'EXPIRED';
        throw error;
      }

      // Code doesn't exist at all (or code was never activated)
      const error = new Error(
        'Invalid attendance code. Please check the code and try again.'
      );
      error.code = 'NOT_FOUND';
      throw error;
    }

    // Use existing createAttendance logic with the found lecture
    // (createAttendance will verify the code matches and handle all validations)
    return await this.createAttendance(user, course, enrollment, lecture, {
      user_id: user.id,
      code: code,
      update_reason: null,
    });
  }

  /**
   * Get attendance statistics for a student.
   * Returns summary stats and detailed lecture-by-lecture attendance.
   * Students can only view their own stats.
   *
   * @param {Object} user - Current user object
   * @param {Object} course - Course object (from req.course)
   * @param {Object|null} enrollment - Enrollment object (from req.enrollment, null if not enrolled)
   * @param {Date|null} startTime - Optional start date filter
   * @param {Date|null} endTime - Optional end date filter
   * @returns {Promise<Object>} Statistics object with summary and lectures array
   */
  async getStudentAttendanceStats(
    user,
    course,
    enrollment,
    startTime = null,
    endTime = null
  ) {
    // Check permissions - must be enrolled to view stats
    if (enrollment === null) {
      const error = new Error('You are not enrolled in this course');
      error.code = 'FORBIDDEN';
      throw error;
    }

    // Students can only view their own stats
    // (Professors/TAs can view any student's stats via user_id param in future)
    const userId = user.id;

    // Get only completed lectures (where attendance was activated and window has closed)
    // This ensures we only count lectures where attendance was actually taken
    const lectures = await this.attendancesRepo.getActivatedLectures(
      course.id,
      startTime,
      endTime
    );

    if (lectures.length === 0) {
      return {
        summary: {
          total_lectures: 0,
          present: 0,
          absent: 0,
          attendance_percentage: 0,
        },
        lectures: [],
      };
    }

    // Get user's attendances for those lectures
    const lectureIds = lectures.map((l) => l.id);
    const attendances =
      await this.attendancesRepo.getUserAttendancesForLectures(
        userId,
        lectureIds
      );

    // Create a map of lecture_id -> attendance for quick lookup
    const attendanceMap = new Map();
    attendances.forEach((attendance) => {
      attendanceMap.set(attendance.lecture_id, attendance);
    });

    // Build lectures array with attendance status
    let presentCount = 0;
    const lecturesWithAttendance = lectures.map((lecture) => {
      const attendance = attendanceMap.get(lecture.id);
      const attended = !!attendance;

      if (attended) {
        presentCount++;
      }

      return {
        lecture_id: lecture.id,
        lecture_date: lecture.lecture_date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        attended: attended,
        attendance_id: attendance?.id || null,
        attendance_created_at: attendance?.created_at
          ? attendance.created_at.toISOString()
          : null,
      };
    });

    // Calculate summary
    const totalLectures = lectures.length;
    const absentCount = totalLectures - presentCount;
    const attendancePercentage =
      totalLectures > 0
        ? Math.round((presentCount / totalLectures) * 100 * 100) / 100
        : 0;

    return {
      summary: {
        total_lectures: totalLectures,
        present: presentCount,
        absent: absentCount,
        attendance_percentage: attendancePercentage,
      },
      lectures: lecturesWithAttendance,
    };
  }

  /**
   * Get class-wide attendance statistics for professors/TAs.
   * Returns overall summary and per-lecture trend data.
   *
   * @param {Object} user - Current user object
   * @param {Object} course - Course object (from req.course)
   * @param {Object|null} enrollment - Enrollment object (from req.enrollment, null if not enrolled)
   * @param {Date|null} startTime - Optional start date filter for lecture_date
   * @param {Date|null} endTime - Optional end date filter for lecture_date
   * @returns {Promise<Object>} Statistics object with summary and trend array
   */
  async getClassAttendanceStats(
    user,
    course,
    enrollment,
    startTime = null,
    endTime = null
  ) {
    // Check permissions - must be enrolled to view stats
    if (enrollment === null) {
      const error = new Error('You are not enrolled in this course');
      error.code = 'FORBIDDEN';
      throw error;
    }

    // Only professors and TAs can view class-wide stats
    if (enrollment.role !== 'professor' && enrollment.role !== 'ta') {
      const error = new Error(
        'Only professors and TAs can view class-wide attendance statistics'
      );
      error.code = 'FORBIDDEN';
      throw error;
    }

    // Get total enrolled students
    const totalEnrolled = await this.attendancesRepo.getTotalEnrolledStudents(
      course.id
    );

    // Get only completed lectures (where attendance was activated and window has closed)
    const lectures = await this.attendancesRepo.getActivatedLectures(
      course.id,
      startTime,
      endTime
    );

    if (lectures.length === 0) {
      return {
        summary: {
          total_lectures: 0,
          total_enrolled: totalEnrolled,
          total_attendances: 0,
          total_possible_attendances: 0,
          overall_attendance_percentage: 0,
          average_lecture_attendance: 0,
        },
        trend: [],
      };
    }

    // Get all attendances for those lectures
    const lectureIds = lectures.map((l) => l.id);
    const allAttendances = await this.attendancesRepo.getAttendancesForLectures(
      lectureIds,
      course.id
    );

    // Create a map of lecture_id -> attendance count
    const attendanceCountMap = new Map();
    allAttendances.forEach((attendance) => {
      const count = attendanceCountMap.get(attendance.lecture_id) || 0;
      attendanceCountMap.set(attendance.lecture_id, count + 1);
    });

    // Build trend array with per-lecture stats
    let totalAttendances = 0;
    let sumOfPercentages = 0;

    const trend = lectures.map((lecture) => {
      const presentCount = attendanceCountMap.get(lecture.id) || 0;
      totalAttendances += presentCount;

      const attendancePercentage =
        totalEnrolled > 0
          ? Math.round((presentCount / totalEnrolled) * 100 * 100) / 100
          : 0;
      sumOfPercentages += attendancePercentage;

      return {
        lecture_id: lecture.id,
        lecture_date: lecture.lecture_date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        total_enrolled: totalEnrolled,
        total_present: presentCount,
        attendance_percentage: attendancePercentage,
      };
    });

    // Calculate summary
    const totalLectures = lectures.length;
    const totalPossibleAttendances = totalLectures * totalEnrolled;
    const overallAttendancePercentage =
      totalPossibleAttendances > 0
        ? Math.round(
            (totalAttendances / totalPossibleAttendances) * 100 * 100
          ) / 100
        : 0;
    const averageLectureAttendance =
      totalLectures > 0
        ? Math.round((totalAttendances / totalLectures) * 100) / 100
        : 0;

    return {
      summary: {
        total_lectures: totalLectures,
        total_enrolled: totalEnrolled,
        total_attendances: totalAttendances,
        total_possible_attendances: totalPossibleAttendances,
        overall_attendance_percentage: overallAttendancePercentage,
        average_lecture_attendance: averageLectureAttendance,
      },
      trend: trend,
    };
  }
}

module.exports = AttendancesService;
