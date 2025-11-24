'use strict';

class JournalRepo {
  constructor(db) {
    this.db = db;
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
    // check if content is smaller than 1GB
    if (Buffer.byteLength(content, 'utf8') > 1e9) {
      throw new Error('Content size exceeds 1GB limit');
    }
    const entry = await this.db.journals.create({
      data: {
        student_id: userId,
        course_id: courseId,
        title: title,
        content: content,
      },
    });
    return entry;
  }

  /**
   * get all journal entries for a specific course.
   * @param {number} courseId
   * @returns {Promise<Array>} list of journal entries
   */
  async getJournalsByCourseId(courseId) {
    const entries = await this.db.journals.findMany({
      where: {
        course_id: courseId,
        deleted_at: null,
      },
    });
    return entries;
  }

  /**
   * Get a journal entry by its ID.
   * @param {number} journalId
   * @returns {Promise<object>} journal entry
   */
  async getJournalById(journalId) {
    const entry = await this.db.journals.findFirst({
      where: {
        id: journalId,
        deleted_at: null,
      },
    });
    return entry;
  }

  /**
   * get journals by course id + user id
   * @param {number} userId
   * @param {number} courseId
   * @returns {Promise<Array>} list of journal entries
   */
  async getJournalsByUserIdAndCourseId(userId, courseId) {
    const entries = await this.db.journals.findMany({
      where: {
        student_id: userId,
        course_id: courseId,
        deleted_at: null,
      },
    });
    return entries;
  }

  /**
   * Update the latest journal entry for a user.
   * @param {number} journal_id
   * @param {string} title
   * @param {string} content
   * @returns {Promise<object>} updated journal entry
   */
  async updateJournalEntry(journal_id, title, content) {
    const entry = await this.db.journals.updateMany({
      where: {
        id: journal_id,
        deleted_at: null,
      },
      data: {
        title: title,
        content: content,
        updated_at: new Date(),
      },
    });
    return entry;
  }

  /**
   * Delete a journal entry by marking it as deleted.
   * @param {number} journalId
   * @returns {Promise<object>} deleted journal entry
   */
  async deleteJournalEntry(journalId) {
    const entry = await this.db.journals.updateMany({
      where: {
        id: journalId,
        deleted_at: null,
      },
      data: {
        deleted_at: new Date(),
      },
    });
    return entry;
  }
}
module.exports = JournalRepo;
