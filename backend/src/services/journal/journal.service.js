'use strict';

/**
 * Journal Service
 *
 * This module provides business logic for journal-related operations.
 * It acts as an intermediary between the routes layer and the repository layer.
 */

class JournalService {
  constructor(journalRepo, journalPermissions) {
    this.journalRepo = journalRepo;
    this.journalPermissions = journalPermissions;
  }

  buildFiltersFromQuery(query, loggedInUser) {
    const filters = {};

    // Journal Ownership Filtering
    let useDefaultUserFilter = true;
    if (query.entire_class === true || query.entire_class === 'true') {
      useDefaultUserFilter = false;
    } else if (query.team_id != null) {
      const teamId = parseInt(query.team_id, 10);
      if (!isNaN(teamId)) {
        filters.team_id = teamId;
        useDefaultUserFilter = false;
      }
    } else if (query.user_id != null) {
      const userId = parseInt(query.user_id, 10);
      if (!isNaN(userId)) {
        filters.user_id = userId;
        useDefaultUserFilter = false;
      }
    }
    // Filter by logged in user's id by default if no ownership filters provided
    if (useDefaultUserFilter) {
      filters.user_id = loggedInUser.id;
    }

    if (query.start_date) {
      const startDate = new Date(query.start_date);
      if (!isNaN(startDate.getTime())) {
        filters.start_date = startDate;
      }
    }

    if (query.end_date) {
      const endDate = new Date(query.end_date);
      if (!isNaN(endDate.getTime())) {
        filters.end_date = endDate;
      }
    }

    return filters;
  }

  mapFiltersToWhereClause(filters = {}) {
    const where = {};

    if (filters.user_id != null) {
      where.user_id = filters.user_id;
    }

    if (filters.start_date != null) {
      where.created_at = {};
      where.created_at = { gte: filters.start_date }
    }

    if (filters.end_date != null) {
      where.created_at = {};
      where.created_at = { lte: filters.end_date }
    }

    return where;
  }

  /**
   * Get all journal entries for a specific course.
   * @param {number} courseId
   * @returns {Promise<Array>} list of journal entries
   */
  async getJournals(course, user, enrollment, query) {
    const filters = this.buildFiltersFromQuery(query, user);

    if (!await this.journalPermissions.canViewJournals(user, enrollment, filters)) {
      const e = new Error("User does not have permission to view these journals");
      e.code = 'FORBIDDEN';
      throw e;
    }

    return await this.journalRepo.getJournals(course.id, this.mapFiltersToWhereClause(filters));
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
