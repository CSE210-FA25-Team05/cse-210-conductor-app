'use strict';

/**
 * Journal Service
 *
 * This module provides business logic for journal-related operations.
 * It acts as an intermediary between the routes layer and the repository layer.
 */

class JournalService {
  constructor(journalRepo) {
    this.journalRepo = journalRepo;
  }

  /**
   * Get all journal entries for a specific course.
   * @param {number} courseId
   * @returns {Promise<Array>} list of journal entries
   */
  async getJournalsByCourseId(courseId) {
    return await this.journalRepo.getJournalsByCourseId(courseId);
  }

  /**
   * Get a journal entry by its ID.
   * @param {number} journalId
   * @returns {Promise<object|null>} journal entry or null if not found
   */
  async getJournalById(journalId) {
    return await this.journalRepo.getJournalById(journalId);
  }

  /**
   * Get journal entries for a specific user in a course.
   * @param {number} userId
   * @param {number} courseId
   * @returns {Promise<Array>} list of journal entries
   */
  async getJournalsByUserIdAndCourseId(userId, courseId) {
    return await this.journalRepo.getJournalsByUserIdAndCourseId(
      userId,
      courseId
    );
  }

  /**
   * Create a new journal entry for a user.
   * @param {number} userId
   * @param {number} courseId
   * @param {string} title
   * @param {string} content
   * @returns {Promise<object>} created journal entry
   */
  async createJournalEntry(userId, courseId, title, content) {
    return await this.journalRepo.createJournalEntry(
      userId,
      courseId,
      title,
      content
    );
  }

  /**
   * Update an existing journal entry.
   * @param {number} journalId
   * @param {string} title
   * @param {string} content
   * @returns {Promise<object>} updated journal entry
   */
  async updateJournalEntry(journalId, title, content) {
    return await this.journalRepo.updateJournalEntry(journalId, title, content);
  }

  /**
   * Delete a journal entry by marking it as deleted.
   * @param {number} journalId
   * @returns {Promise<object>} deletion result
   */
  async deleteJournalEntry(journalId) {
    return await this.journalRepo.deleteJournalEntry(journalId);
  }
}

module.exports = JournalService;
