'use strict';

/**
 * Lectures Service
 *
 * This module provides business logic for lecture-related operations.
 */

class LecturesService {
  constructor(lecturesRepo) {
    this.lecturesRepo = lecturesRepo;
  }

  /**
   * Validate lecture data before saving.
   *
   * @param {Object} data - Lecture data to validate
   * @param {Date|string} data.lecture_date - Lecture date
   * @param {string|null} data.code - Optional lecture code
   * @returns {Object} Validation result with { valid: boolean, error?: string }
   */
  validateLectureData(data) {
    if (!data.lecture_date) {
      return { valid: false, error: 'lecture_date is required' };
    }

    const lectureDate = new Date(data.lecture_date);
    if (isNaN(lectureDate.getTime())) {
      return { valid: false, error: 'lecture_date must be a valid date' };
    }

    return { valid: true };
  }
}

module.exports = LecturesService;
