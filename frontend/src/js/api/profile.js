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
 * @property { string } global_role -User's role in the class, which determines permissions.
 * @property { boolean } is_profile_complete - Indicates if the user has filled in their profile with all the appropriate information.
 */

const BACKEND_URL = 'http://localhost:3001';

/**
 * @description Get the current user's profile information.
 * @returns { ProfileInfo } Current user's profile information.
 */
export async function getProfile() {
  let response = await getWrapper(BACKEND_URL + '/api/me/profile');
  if (!response.ok) {
    throw new Error(response.error);
  }
  return response.data;
}
