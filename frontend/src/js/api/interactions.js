import {
  getWrapper,
  postWrapper,
  patchWrapper,
  deleteWrapper,
} from '/src/js/fetch-wrapper.js';

/**
 * @typedef InteractionConfig
 * @type { object }
 * @property { number } id - Interaction configuration ID.
 * @property { number } course_id - Associated course ID.
 * @property { object } config - Configuration object.
 * @property { Array<{value: string, color: string}> } config.options - Available interaction options.
 * @property { boolean } is_editable - Whether the configuration is editable.
 * @property { string } created_at - Creation timestamp.
 * @property { string } updated_at - Last update timestamp.
 */

/**
 * @typedef Participant
 * @type { object }
 * @property { number } user_id - User ID of the participant.
 * @property { string } first_name - First name of the participant.
 * @property { string } last_name - Last name of the participant.
 */

/**
 * @typedef InteractionRecord
 * @type { object }
 * @property { number } id - Interaction record ID.
 * @property { number } course_id - Associated course ID.
 * @property { number } author_id - ID of the user who created the interaction.
 * @property { string } author_first_name - First name of the author.
 * @property { string } author_last_name - Last name of the author.
 * @property { number } interaction_config_id - Associated interaction configuration ID.
 * @property { string } value - The interaction option value.
 * @property { string } description - Description of the interaction.
 * @property { Participant[] } participants - List of participants in the interaction.
 * @property { string } created_at - Creation timestamp.
 */

/**
 * @typedef InteractionStats
 * @type { object }
 * @property { Array<{bucket: string, value: string, count: number}> } stats - Interaction statistics grouped by bucket.
 */

/**
 * @description Get the interaction configuration for a course.
 * @param { number } courseID - ID of the course.
 * @returns { InteractionConfig } The interaction configuration.
 */
export async function getInteractionConfig(courseID) {
  const response = await getWrapper(
    `/api/courses/${courseID}/interactions/config`
  );
  if (!response.ok) {
    throw new Error(response.error);
  }
  return response.data;
}

/**
 * @description Update the interaction configuration for a course.
 * @param { number } courseID - ID of the course.
 * @param { object } configUpdate - Configuration update.
 * @param { Array<{value: string, color: string}> } configUpdate.options - Updated interaction options.
 * @returns { InteractionConfig } Updated interaction configuration.
 */
export async function updateInteractionConfig(courseID, configUpdate) {
  const response = await patchWrapper(
    `/api/courses/${courseID}/interactions/config`,
    configUpdate
  );
  if (!response.ok) {
    throw new Error(response.error);
  }
  return response.data;
}

/**
 * @description Create a new interaction record for a course.
 * @param { number } courseID - ID of the course.
 * @param { object } newInteraction - Interaction information.
 * @param { string } newInteraction.option - The interaction option value.
 * @param { string } newInteraction.description - Description of the interaction.
 * @param { number[] } newInteraction.participants - Array of participant user IDs.
 * @returns { InteractionRecord } Created interaction record.
 */
export async function createInteraction(courseID, newInteraction) {
  const response = await postWrapper(
    `/api/courses/${courseID}/interactions`,
    newInteraction
  );
  if (!response.ok) {
    throw new Error(response.error);
  }
  return response.data;
}

/**
 * @description Get interaction records for a course with optional filters.
 * @param { number } courseID - ID of the course.
 * @param { object } filters - Optional filters.
 * @param { number } [filters.author_id] - Filter by author ID.
 * @param { boolean } [filters.entire_class] - Filter for entire class interactions.
 * @param { string[] } [filters.values] - Filter by interaction values.
 * @param { string } [filters.start_date] - Filter by start date (ISO 8601 format).
 * @param { string } [filters.end_date] - Filter by end date (ISO 8601 format).
 * @returns { InteractionRecord[] } List of interaction records.
 */
export async function getInteractions(courseID, filters = {}) {
  const url = new URL(
    `/api/courses/${courseID}/interactions`,
    window.location.origin
  );

  if (filters.author_id) {
    url.searchParams.set('author_id', filters.author_id);
  }
  if (filters.entire_class !== undefined) {
    url.searchParams.set('entire_class', filters.entire_class);
  }
  if (filters.values && filters.values.length > 0) {
    filters.values.forEach((value) => {
      url.searchParams.append('values', value);
    });
  }
  if (filters.start_date) {
    url.searchParams.set('start_date', encodeURIComponent(filters.start_date));
  }
  if (filters.end_date) {
    url.searchParams.set('end_date', encodeURIComponent(filters.end_date));
  }

  const response = await getWrapper(url.toString());

  if (!response.ok) {
    throw new Error(response.error);
  }

  return response.data;
}

/**
 * @description Update an existing interaction record.
 * @param { number } courseID - ID of the course.
 * @param { number } interactionID - ID of the interaction record.
 * @param { object } updatedInteraction - Object containing updates to the interaction record.
 * @param { string } [updatedInteraction.option] - Updated interaction option value.
 * @param { string } [updatedInteraction.description] - Updated description.
 * @param { number[] } [updatedInteraction.participants] - Updated array of participant user IDs.
 * @returns { InteractionRecord } Updated interaction record.
 */
export async function updateInteraction(
  courseID,
  interactionID,
  updatedInteraction
) {
  const response = await patchWrapper(
    `/api/courses/${courseID}/interactions/${interactionID}`,
    updatedInteraction
  );
  if (!response.ok) {
    throw new Error(response.error);
  }
  return response.data;
}

/**
 * @description Delete a specific interaction record.
 * @param { number } courseID - ID of the course.
 * @param { number } interactionID - ID of the interaction record to delete.
 * @returns { void }
 */
export async function deleteInteraction(courseID, interactionID) {
  const response = await deleteWrapper(
    `/api/courses/${courseID}/interactions/${interactionID}`
  );
  if (!response.ok) {
    throw new Error(response.error);
  }
  // 204 No Content response
}

/**
 * @description Get interaction statistics for a course with optional filters and bucketing.
 * @param { number } courseID - ID of the course.
 * @param { object } filters - Optional filters and bucketing.
 * @param { number } [filters.author_id] - Filter by author ID.
 * @param { boolean } [filters.entire_class] - Filter for entire class interactions.
 * @param { string[] } [filters.values] - Filter by interaction values.
 * @param { string } [filters.start_date] - Filter by start date (ISO 8601 format).
 * @param { string } [filters.end_date] - Filter by end date (ISO 8601 format).
 * @param { 'hour'|'day'|'week'|'month' } [filters.bucket] - Time bucket for grouping stats.
 * @returns { InteractionStats } Interaction statistics.
 */
export async function getInteractionStats(courseID, filters = {}) {
  const url = new URL(
    `/api/courses/${courseID}/interactions/stats`,
    window.location.origin
  );

  if (filters.author_id) {
    url.searchParams.set('author_id', filters.author_id);
  }
  if (filters.entire_class !== undefined) {
    url.searchParams.set('entire_class', filters.entire_class);
  }
  if (filters.values && filters.values.length > 0) {
    filters.values.forEach((value) => {
      url.searchParams.append('values', value);
    });
  }
  if (filters.start_date) {
    url.searchParams.set('start_date', encodeURIComponent(filters.start_date));
  }
  if (filters.end_date) {
    url.searchParams.set('end_date', encodeURIComponent(filters.end_date));
  }
  if (filters.bucket) {
    url.searchParams.set('bucket', filters.bucket);
  }

  const response = await getWrapper(url.toString());

  if (!response.ok) {
    throw new Error(response.error);
  }

  return response.data;
}
