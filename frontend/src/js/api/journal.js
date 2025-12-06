import {
  getWrapper,
  postWrapper,
  patchWrapper,
  deleteWrapper,
} from '/src/js/fetch-wrapper.js';

/**
 * @typedef JournalEntryInfo
 * @type { object }
 * @property { number } id - Journal entry ID number.
 * @property { number } user_id - User ID number.
 * @property { number } course_id - Course ID number.
 * @property { string } title - Title of the journal entry.
 * @property { string } content - Content of the journal entry.
 * @property { string } created_at - Timestamp of when the journal entry was created.
 * @property { string } updated_at - Timestamp of when the journal entry was last updated.
 */

/**
 * @description Get all journal entries for a course
 * @param { number } courseID - ID of the course.
 * @returns { [JournalEntryInfo] } Array of Journal Entries
 */
export async function getJournals(courseID) {
  let response = await getWrapper(`/api/courses/${courseID}/journals`);
  if (!response.ok) {
    throw new Error(response.error);
  }
  return response.data;
}

/**
 * @description Creates a new journal entry for a course
 * @param { number } courseID - ID of the course.
 * @param { object } newJournalEntry - An object containing the new journal entry's information.
 * @param { string } newJournalEntry.title - Title of the journal entry.
 * @param { string } newJournalEntry.content - Content of the journal entry.
 * @param { number } newJournalEntry.user_id - User ID number.
 * @returns { JournalEntryInfo } Created journal entry with its information.
 */
export async function createJournalEntry(courseID, newJournalEntry) {
  let response = await postWrapper(
    `/api/courses/${courseID}/journals`,
    newJournalEntry
  );
  if (!response.ok) {
    throw new Error(response.error);
  }
  return response.data;
}

/**
 * @description Get journal entries for a specific user in a course
 * @param { number } userID - ID of the user.
 * @param { number } courseID - ID of the course.
 * @returns { [JournalEntryInfo] } Array of journal entries from the specified user in a course
 */
export async function getJournalsByUser(userID, courseID) {
  let response = await getWrapper(
    `/api/courses/${courseID}/journals/user/${userID}`
  );
  if (!response.ok) {
    throw new Error(response.error);
  }
  return response.data;
}

/**
 * @description Get a specific journal entry by its ID in a course
 * @param { number } courseID - ID of the course.
 * @param { number } journalID - ID of the journal entry.
 * @returns { JournalEntryInfo } Requested journal entry information.
 */
export async function getJournalById(courseID, journalID) {
  let response = await getWrapper(
    `/api/courses/${courseID}/journals/${journalID}`
  );
  if (!response.ok) {
    throw new Error(response.error);
  }
  return response.data;
}

/**
 * @description Update a specific journal entry in a course
 * @param { number } courseID - ID of the course.
 * @param { number } journalID - ID of the journal entry to be updated.
 * @param { object } updatedJournal - An object containing the updated journal entry's information.
 * @param { string } [updatedJournal.title] - Updated title of the journal entry.
 * @param { string } [updatedJournal.content] - Updated content of the journal entry.
 * @returns { JournalEntryInfo } Updated journal entry information.
 */
export async function updateJournalEntry(courseID, journalID, updatedJournal) {
  let response = await patchWrapper(
    `/api/courses/${courseID}/journals/${journalID}`,
    updatedJournal
  );
  if (!response.ok) {
    throw new Error(response.error);
  }
  return response.data;
}

export async function deleteJournalEntry(courseID, journalID) {
  let response = await deleteWrapper(
    `/api/courses/${courseID}/journals/${journalID}`
  );
  if (!response.ok) {
    throw new Error(response.error);
  }
}
