import { getWrapper } from '/src/js/fetch-wrapper.js';
import { postWrapper } from '/src/js/fetch-wrapper.js';

/**
 * @typedef ProfileInfo
 * @type { object }
 * @property { number } id - User's ID number.
 * @property { string } email - User's email address.
 * @property { string } first_name - User's first name.
 * @property { string } last_name - User's last name.
 * @property { string } pronouns - User's preferred pronouns.
 * @property { string } global_role - User's role in the class, which determines permissions.
 * @property { boolean } is_profile_complete - Indicates if the user has filled in their profile with all the appropriate information.
 */

/**
 * @description Get the current user's profile information.
 * @returns { ProfileInfo } Current user's profile information.
 */
export async function getProfile() {
  let response = await getWrapper('/api/me/profile');
  if (!response.ok) {
    throw new Error(response.error);
  }
  return response.data;
}

/**
 * @description Update the current user's profile information.
 * @param { object } newValues - An object containing new values to update the current user's profile with.
 * @param { string } [newValues.first_name] - Current user's first name.
 * @param { string } [newValues.last_name] - Current user's last name.
 * @param { string } [newValues.pronouns] - Current user's preferred pronouns.
 * @returns { ProfileInfo } Current user's updated profile information.
 */
export async function updateProfile(newValues) {
  let response = await postWrapper('/api/me/profile', newValues);
  if (!response.ok) {
    throw new Error(response.error);
  }
  return response.data;
}

/**
 * @description Gets a requested user's profile information. Requires certain role permissions.
 * @param { number } userID - ID of the user whose profile you want to view.
 * @returns { ProfileInfo } Requested user's profile information.
 */
export async function getUserProfile(userID) {
  let response = await getWrapper(`/api/users/${userID}/profile`);
  if (!response.ok) {
    throw new Error(response.error);
  }
  return response.data;
}
