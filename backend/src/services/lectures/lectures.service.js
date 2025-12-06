'use strict';

/**
 * Lectures Service
 *
 * This module provides business logic for lecture-related operations.
 */

class LecturesService {
  constructor(lecturesRepo, lecturesPermissions) {
    this.lecturesRepo = lecturesRepo;
    this.lecturesPermissions = lecturesPermissions;
  }

  /**
   * Get all lectures for a course with permission check.
   *
   * @param {Object} user - Current user object
   * @param {Object} course - Course object (from req.course)
   * @param {Object|null} enrollment - Enrollment object (from req.enrollment, null if not enrolled)
   * @returns {Promise<Array>} List of lectures
   */
  async getAllLectures(user, course, enrollment) {
    const canView = await this.lecturesPermissions.canViewLectures(
      user,
      course,
      enrollment
    );
    if (!canView) {
      const error = new Error('You are not enrolled in this course');
      error.code = 'FORBIDDEN';
      throw error;
    }

    return await this.lecturesRepo.getLecturesByCourseId(course.id);
  }

  /**
   * Get a single lecture with permission check.
   *
   * @param {Object} user - Current user object
   * @param {Object} course - Course object (from req.course)
   * @param {Object|null} enrollment - Enrollment object (from req.enrollment, null if not enrolled)
   * @param {number} lectureId - ID of the lecture
   * @returns {Promise<Object>} Lecture object
   */
  async getLecture(user, course, enrollment, lectureId) {
    const canView = await this.lecturesPermissions.canViewLectures(
      user,
      course,
      enrollment
    );
    if (!canView) {
      const error = new Error('You are not enrolled in this course');
      error.code = 'FORBIDDEN';
      throw error;
    }

    const lecture = await this.lecturesRepo.getLectureById(
      lectureId,
      course.id
    );
    if (!lecture) {
      const error = new Error('Lecture not found');
      error.code = 'NOT_FOUND';
      throw error;
    }

    return lecture;
  }

  /**
   * Create a new lecture with permission check.
   *
   * @param {Object} user - Current user object
   * @param {Object} course - Course object (from req.course)
   * @param {Object|null} enrollment - Enrollment object (from req.enrollment, null if not enrolled)
   * @param {Object} lectureData - Lecture data
   * @returns {Promise<Object>} Created lecture object
   */
  async createLecture(user, course, enrollment, lectureData) {
    const canModify = await this.lecturesPermissions.canModifyLectures(
      user,
      course,
      enrollment
    );
    if (!canModify) {
      const error = new Error('Only professors and TAs can create lectures');
      error.code = 'FORBIDDEN';
      throw error;
    }

    // Code is NOT auto-generated - use activateAttendance endpoint to generate code
    return await this.lecturesRepo.createLecture({
      course_id: course.id,
      lecture_date: lectureData.lecture_date,
    });
  }

  /**
   * Update a lecture with permission check.
   *
   * @param {Object} user - Current user object
   * @param {Object} course - Course object (from req.course)
   * @param {Object|null} enrollment - Enrollment object (from req.enrollment, null if not enrolled)
   * @param {number} lectureId - ID of the lecture
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated lecture object
   */
  async updateLecture(user, course, enrollment, lectureId, updateData) {
    const canModify = await this.lecturesPermissions.canModifyLectures(
      user,
      course,
      enrollment
    );
    if (!canModify) {
      const error = new Error('Only professors and TAs can update lectures');
      error.code = 'FORBIDDEN';
      throw error;
    }

    const existingLecture = await this.lecturesRepo.getLectureById(
      lectureId,
      course.id
    );
    if (!existingLecture) {
      const error = new Error('Lecture not found');
      error.code = 'NOT_FOUND';
      throw error;
    }

    if (!updateData.lecture_date) {
      return existingLecture;
    }

    return await this.lecturesRepo.updateLecture(
      lectureId,
      course.id,
      updateData
    );
  }

  /**
   * Delete a lecture with permission check.
   *
   * @param {Object} user - Current user object
   * @param {Object} course - Course object (from req.course)
   * @param {Object|null} enrollment - Enrollment object (from req.enrollment, null if not enrolled)
   * @param {number} lectureId - ID of the lecture
   * @returns {Promise<void>}
   */
  async deleteLecture(user, course, enrollment, lectureId) {
    const canModify = await this.lecturesPermissions.canModifyLectures(
      user,
      course,
      enrollment
    );
    if (!canModify) {
      const error = new Error('Only professors and TAs can delete lectures');
      error.code = 'FORBIDDEN';
      throw error;
    }

    const existingLecture = await this.lecturesRepo.getLectureById(
      lectureId,
      course.id
    );
    if (!existingLecture) {
      const error = new Error('Lecture not found');
      error.code = 'NOT_FOUND';
      throw error;
    }

    await this.lecturesRepo.deleteLecture(lectureId, course.id);
  }

  /**
   * Activate attendance for a lecture by generating a code and starting the 5-minute timer.
   * Only professors and TAs can activate attendance.
   * If a code already exists and is still valid, returns the existing lecture without generating a new code.
   * Once attendance has been activated for a lecture, it cannot be reactivated (one activation per lecture).
   *
   * @param {Object} user - Current user object
   * @param {Object} course - Course object (from req.course)
   * @param {Object|null} enrollment - Enrollment object (from req.enrollment, null if not enrolled)
   * @param {number} lectureId - ID of the lecture
   * @returns {Promise<Object>} Updated lecture object with code and expiration timestamps
   */
  async activateAttendance(user, course, enrollment, lectureId) {
    const canModify = await this.lecturesPermissions.canModifyLectures(
      user,
      course,
      enrollment
    );
    if (!canModify) {
      const error = new Error(
        'Only professors and TAs can activate attendance'
      );
      error.code = 'FORBIDDEN';
      throw error;
    }

    // Check if lecture exists and belongs to the course
    const existingLecture = await this.lecturesRepo.getLectureById(
      lectureId,
      course.id
    );
    if (!existingLecture) {
      const error = new Error('Lecture not found');
      error.code = 'NOT_FOUND';
      throw error;
    }

    // If code already exists and is still valid, return existing lecture
    if (this.lecturesRepo.isCodeValid(existingLecture)) {
      return existingLecture;
    }

    // If attendance was already activated (code_expires_at was set), prevent reactivation
    if (existingLecture.code_expires_at !== null) {
      const error = new Error(
        'Attendance has already been activated for this lecture and cannot be reactivated'
      );
      error.code = 'BAD_REQUEST';
      throw error;
    }

    // Generate new code (first activation only)
    return await this.lecturesRepo.activateAttendance(lectureId, course.id);
  }
}

module.exports = LecturesService;
