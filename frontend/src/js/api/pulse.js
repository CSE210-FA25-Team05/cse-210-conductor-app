import { getWrapper, postWrapper, patchWrapper } from '/src/js/fetch-wrapper.js';

/**
 * @typedef PulseConfigInfo
 * @type { object }
 * @property { number } id - ID of current pulse
 * @property { string } course_id - Course ID
 * @property { object } config - Object holding all pulses for a given course
 * @property { boolean } is_editable - Flag whether pulses in current course are editable
 * @property { string } created_at - Timestamp of creation
 * @property { string } updated_at - Timestamp of last updated
 */

/**
 * @typedef PulseInfo
 * @type { object }
 * @property { number } id - ID of the user-pulse object
 * @property { number } course_id - ID of the course that the pulse is in
 * @property { number } user_id - ID of the user that created the pulse
 * @property { number } team_id - ID of the team that the pulse is associated with
 * @property { string } user_first_name - First name of the user that created the pulse
 * @property { string } user_last_name - Last name of the user that created the pulse
 * @property { number } pulse_config_id - ID of the pulse configuration
 * @property { string } value - Value of the pulse
 * @property { string } description - Description of the pulse
 * @property { string } created_at - Timestamp of when the pulse was created
 */

/**
 * @typedef StatInfo
 * @type { object }
 * @property { string } bucket - Time bucket for the statistic
 * @property { string } value - Pulse value
 * @property { number } count - Count of pulses in the bucket
 */

/**
 * @description Get the pulse configs of a given course
 * @param { number } courseID - ID of the course.
 * @returns { PulseConfigInfo } Pulse configs of the given course
 */
export async function getPulseConfigs(courseID) {
  let response = await getWrapper(`/api/courses/${courseID}/pulses/config`);
  if (!response.ok) {
    throw new Error(response.error);
  }
  return response.data;
}

/**
 * @description Update pulse configs in a course
 * @param { number } courseID - ID of the course you want to update.
 * @param { object } pulseConfigs - An object containing the pulses configs to update.
 * @param { Array<{ value: string, color: string }> } [pulseConfigs.options] - Array holding the different configs.
 * @returns { PulseConfigInfo } Pulse configs of given course
 */
export async function updatePulseConfigs(courseID, pulseConfigs) {
  let response = await patchWrapper(`/api/courses/${courseID}/pulses/config`, pulseConfigs);
  if (!response.ok) {
    throw new Error(response.error);
  }
  return response.data;
}

/**
 * @description Creates a pulse in a course
 * @param { number } courseID - ID of the course.
 * @param { object } pulse - A pulse object containing info for a single pulse
 * @param { string } pulse.option - The pulse value of the pulse
 * @param { description } pulse.description - The description of the pulse.
 * @returns { PulseInfo } Pulse info of the given pulse
 */
export async function createPulseInCourse(courseID, pulse) {
    let response = await postWrapper(`/api/courses/${courseID}/pulses`, pulse);
    if (!response.ok) {
        throw new Error(response.error);
    }
}

/**
 * @description Get pulse records given parameters
 * @param { number } courseID Course ID of the course
 * @param { object } params Query parameters to filter pulse records
 * @param { number } [params.team_id] - Team ID to filter pulse records by
 * @param { number } [params.user_id] - User ID to filter pulse records by
 * @param { boolean } [params.entire_class] - Whether to get pulse records for the entire class
 * @param { string } [params.start_date] - Start date to filter pulse records from (ISO 8601 format)
 * @param { string } [params.end_date] - End date to filter pulse records to (ISO 8601 format)
 * @param { string } [params.bucket] - Bucket size for aggregating pulse records (e.g., 'day', 'week', 'month')
 * @returns { [PulseInfo] } Array of pulse records
 */
export async function getPulseRecords( courseID, params = {} ) {
    let queryString = new URLSearchParams(params).toString();
    let response = await getWrapper(`/api/courses/${courseID}/pulses?${queryString}`);
    if (!response.ok) {
        throw new Error(response.error);
    }
    return response.data;
}

/**
 * @description Gets pulse statistics given parameters
 * @param { number } courseID Course ID of the course
 * @param { object } params Query parameters to filter pulse records
 * @param { number } [params.team_id] - Team ID to filter pulse records by
 * @param { number } [params.user_id] - User ID to filter pulse records by
 * @param { boolean } [params.entire_class] - Whether to get pulse records for the entire class
 * @param { string } [params.start_date] - Start date to filter pulse records from (ISO 8601 format)
 * @param { string } [params.end_date] - End date to filter pulse records to (ISO 8601 format)
 * @param { string } [params.bucket] - Bucket size for aggregating pulse records (e.g., 'day', 'week', 'month')
 * @returns { [StatInfo] } Array of pulse statistics
 */
export async function getPulseStats( courseID, params = {} ) {
    let queryString = new URLSearchParams(params).toString();
    let response = await getWrapper(`/api/courses/${courseID}/pulses/stats?${queryString}`);
    if (!response.ok) {
        throw new Error(response.error);
    }
    return response.data;
}
