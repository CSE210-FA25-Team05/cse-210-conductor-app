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
        user_id: userId,
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
        user_id: userId,
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
    const entry = await this.db.journals.update({
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
    const entry = await this.db.journals.update({
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

  /**
   * Get the team_id of the journal owner (creator) in the journal's course.
   * @param {number} journalId - ID of the journal entry
   * @returns {Promise<number|null>} team_id of the journal owner, or null if not found or not in a team
   */
  async getJournalOwnerTeam(journalId) {
    const journal = await this.getJournalById(journalId);
    if (!journal) {
      return null;
    }
    const enrollment = await this.db.enrollments.findFirst({
      where: {
        user_id: journal.user_id,
        course_id: journal.course_id,
        deleted_at: null,
      },
    });
    return enrollment ? enrollment.team_id : null;
  }

  /**
   * Get the team_id for a user in a specific course.
   * @param {number} userId - ID of the user
   * @param {number} courseId - ID of the course
   * @returns {Promise<number|null>} team_id of the user in the course, or null if not found or not in a team
   */
  async getTeamIdByUserId(userId, courseId) {
    const enrollment = await this.db.enrollments.findFirst({
      where: {
        user_id: userId,
        course_id: courseId,
        deleted_at: null,
      },
    });
    return enrollment ? enrollment.team_id : null;
  }

  /**
   * Get the enrollment role for a user in a specific course.
   * @param {number} userId - ID of the user
   * @param {number} courseId - ID of the course
   * @returns {Promise<string|null>} role ('professor', 'ta', 'student') or null if not enrolled
   */
  async getEnrollmentRole(userId, courseId) {
    const enrollment = await this.db.enrollments.findFirst({
      where: {
        user_id: userId,
        course_id: courseId,
        deleted_at: null,
      },
    });
    return enrollment ? enrollment.role : null;
  }

  /**
   * Check if the journal creator is in a team managed by the given TA user.
   * @param {number} taUserId - ID of the TA user
   * @param {number} journalId - ID of the journal entry
   * @returns {Promise<boolean>} true if journal creator is in a team managed by the TA
   */
  async isJournalCreatorInTAManagedTeam(taUserId, journalId) {
    const journal = await this.getJournalById(journalId);
    if (!journal) {
      return false;
    }

    // Get the journal creator's enrollment to find their team_id
    const creatorEnrollment = await this.db.enrollments.findFirst({
      where: {
        user_id: journal.user_id,
        course_id: journal.course_id,
        deleted_at: null,
      },
    });

    if (!creatorEnrollment || !creatorEnrollment.team_id) {
      return false;
    }

    // Check if the TA manages this team in this course
    const taTeam = await this.db.ta_teams.findFirst({
      where: {
        ta_user_id: taUserId,
        course_id: journal.course_id,
        team_id: creatorEnrollment.team_id,
        deleted_at: null,
      },
    });

    return taTeam !== null;
  }
}
module.exports = JournalRepo;
