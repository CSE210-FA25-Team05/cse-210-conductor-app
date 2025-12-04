'use strict';

class JournalPermissions {
  constructor(journalRepo, authRepo, coursePermissions) {
    this.journalRepo = journalRepo;
    this.authRepo = authRepo;
    this.coursePermissions = coursePermissions;
  }

  /**
   * Check if a user can access a journal entry.
   * - If journal is private: only the owner can access
   * - If journal is not private: owner, students in same team, and TAs managing that team can access
   * @param {number} userId - ID of the user trying to access
   * @param {number} journalId - ID of the journal entry
   * @returns {Promise<boolean>} true if user can access the journal
   */
  async canAccessJournalEntry(userId, journalId) {
    const journal = await this.journalRepo.getJournalById(journalId);
    if (!journal) {
      return false;
    }

    // Owner can always access their own journal
    if (journal.user_id === userId) {
      return true;
    }

    // If journal is private, only owner can access
    if (journal.is_private === true) {
      return false;
    }

    // Journal is not private, check if user is in same team or is a TA managing that team
    const journalOwnerTeam = await this.journalRepo.getJournalOwnerTeam(journalId);
    
    // If journal owner is not in a team, only owner can access (already checked above)
    if (!journalOwnerTeam) {
      return false;
    }

    // Check if user is in the same team
    const userTeam = await this.journalRepo.getTeamIdByUserId(userId, journal.course_id);
    if (userTeam === journalOwnerTeam) {
      return true;
    }

    // Check if user is a TA managing the journal owner's team
    const isTA = await this.coursePermissions.isTAInCourse(userId, journal.course_id);
    if (isTA) {
      const isTAManagingTeam = await this.journalRepo.isJournalCreatorInTAManagedTeam(userId, journalId);
      if (isTAManagingTeam) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if a user can update a journal entry.
   * Only the owner can update their journal.
   * @param {number} userId - ID of the user trying to update
   * @param {number} journalId - ID of the journal entry
   * @returns {Promise<boolean>} true if user can update the journal
   */
  async canUpdateJournalEntry(userId, journalId) {
    const journal = await this.journalRepo.getJournalById(journalId);
    if (!journal) {
      return false;
    }

    // Only owner can update
    return journal.user_id === userId;
  }

  /**
   * Check if a user can delete a journal entry.
   * Owner, TA, or professor in the course can delete journals.
   * @param {number} userId - ID of the user trying to delete
   * @param {number} journalId - ID of the journal entry
   * @returns {Promise<boolean>} true if user can delete the journal
   */
  async canDeleteJournalEntry(userId, journalId) {
    const journal = await this.journalRepo.getJournalById(journalId);
    if (!journal) {
      return false;
    }

    // Owner can always delete their own journal
    if (journal.user_id === userId) {
      return true;
    }

    // Check if user is a professor in the course
    const isProfessor = await this.coursePermissions.isProfessorInCourse(
      userId,
      journal.course_id
    );
    if (isProfessor) {
      return true;
    }

    // Check if user is a TA in the course
    const isTA = await this.coursePermissions.isTAInCourse(
      userId,
      journal.course_id
    );
    if (isTA) {
      return true;
    }

    return false;
  }

}

module.exports = JournalPermissions;