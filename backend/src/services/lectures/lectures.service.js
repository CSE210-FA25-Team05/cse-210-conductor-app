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
    // Check if user is enrolled (use enrollment if provided, otherwise query)
    if (enrollment === null) {
      const canView = await this.lecturesPermissions.canViewLectures(
        user.id,
        course.id
      );
      if (!canView) {
        const error = new Error('You are not enrolled in this course');
        error.code = 'FORBIDDEN';
        throw error;
      }
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
    // Check if user is enrolled (use enrollment if provided, otherwise query)
    if (enrollment === null) {
      const canView = await this.lecturesPermissions.canViewLectures(
        user.id,
        course.id
      );
      if (!canView) {
        const error = new Error('You are not enrolled in this course');
        error.code = 'FORBIDDEN';
        throw error;
      }
    }

    const lecture = await this.lecturesRepo.getLectureById(lectureId, course.id);
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
    // Check permissions (use enrollment if provided, otherwise query)
    if (enrollment === null) {
      const canModify = await this.lecturesPermissions.canModifyLectures(
        user.id,
        course.id
      );
      if (!canModify) {
        const error = new Error('Only professors and TAs can create lectures');
        error.code = 'FORBIDDEN';
        throw error;
      }
    } else {
      // Use enrollment role directly
      if (enrollment.role !== 'professor' && enrollment.role !== 'ta') {
        const error = new Error('Only professors and TAs can create lectures');
        error.code = 'FORBIDDEN';
        throw error;
      }
    }

    return await this.lecturesRepo.createLecture({
      course_id: course.id,
      lecture_date: lectureData.lecture_date,
      code: lectureData.code || null,
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
    // Check permissions (use enrollment if provided, otherwise query)
    if (enrollment === null) {
      const canModify = await this.lecturesPermissions.canModifyLectures(
        user.id,
        course.id
      );
      if (!canModify) {
        const error = new Error('Only professors and TAs can update lectures');
        error.code = 'FORBIDDEN';
        throw error;
      }
    } else {
      // Use enrollment role directly
      if (enrollment.role !== 'professor' && enrollment.role !== 'ta') {
        const error = new Error('Only professors and TAs can update lectures');
        error.code = 'FORBIDDEN';
        throw error;
      }
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

    if (!updateData.lecture_date && updateData.code === undefined) {
      return existingLecture;
    }

    const finalUpdateData = {
      lecture_date:
        updateData.lecture_date || existingLecture.lecture_date,
      code:
        updateData.code !== undefined
          ? updateData.code
          : existingLecture.code,
    };

    return await this.lecturesRepo.updateLecture(lectureId, finalUpdateData);
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
    // Check permissions (use enrollment if provided, otherwise query)
    if (enrollment === null) {
      const canModify = await this.lecturesPermissions.canModifyLectures(
        user.id,
        course.id
      );
      if (!canModify) {
        const error = new Error('Only professors and TAs can delete lectures');
        error.code = 'FORBIDDEN';
        throw error;
      }
    } else {
      // Use enrollment role directly
      if (enrollment.role !== 'professor' && enrollment.role !== 'ta') {
        const error = new Error('Only professors and TAs can delete lectures');
        error.code = 'FORBIDDEN';
        throw error;
      }
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

    await this.lecturesRepo.deleteLecture(lectureId);
  }
}

module.exports = LecturesService;
