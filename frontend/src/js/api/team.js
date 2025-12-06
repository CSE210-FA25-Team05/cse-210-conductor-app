import {
  getWrapper,
  postWrapper,
  patchWrapper,
  deleteWrapper,
} from '/src/js/fetch-wrapper.js';

/**
 * @typedef Team
 * @type { object }
 * @property { number } id - Team's ID number.
 * @property { number } course_id - ID number of the course the team is in.
 * @property { string } name - Team name.
 * @property { string } description - Short description of the team.
 */

/**
 * @typedef TeamMemberSimple
 * @type { object }
 * @property { number } id - Member ID number.
 * @property { string } role - Member's role in the class, which determines permissions.
 */

/**
 * @typedef TeamMemberComplex
 * @type { object }
 * @property { number } id - Member ID number.
 * @property { number } user_id - Member's user ID number (different from member ID).
 * @property { number } course_id - Course ID number.
 * @property { string } user_email - Member's email address.
 * @property { string } user_first_name - Member's first name.
 * @property { string } user_last_name - Member's last name.
 * @property { number } team_id - Team ID number.
 * @property { string } role - Member's role in the class, which determines permissions.
 * @property { string } created_at - Date and time when member was added to the course.
 */

/**
 * @description Get a list of all the teams in a specific course.
 * @param { number } courseID - ID of the course.
 * @returns { Team[] } List of all the teams with their information.
 */
export async function getAllTeams(courseID) {
  let response = await getWrapper(`/api/courses/${courseID}/teams`);
  if (!response.ok) {
    throw new Error(response.error);
  }
  return response.data.teams; // Need this extra .teams since we receive an object with the team list stored in .teams
}

/**
 * @description Create a new team in a specific course.
 * @param { number } courseID - ID of the course.
 * @param { object } newTeam - And object containing the new team's information.
 * @param { string } newTeam.name - Team name.
 * @param { string } newTeam.description - Short description of the team.
 * @param { TeamMemberSimple[] } newTeam.members - List of all the team's members.
 * @returns { Team } Created team with its information.
 */
export async function createTeam(courseID, newTeam) {
  let response = await postWrapper(`/api/courses/${courseID}/teams`, newTeam);
  if (!response.ok) {
    throw new Error(response.error);
  }
  return response.data;
}

/**
 * @description Get a specific team in a specific course.
 * @param { number } courseID - ID of the course.
 * @param { number } teamID - ID of the team.
 * @returns { Team } Requested team with its information.
 */
export async function getTeam(courseID, teamID) {
  let response = await getWrapper(`/api/courses/${courseID}/teams/${teamID}`);
  if (!response.ok) {
    throw new Error(response.error);
  }
  return response.data;
}

/**
 * @description Delete a specific team in a specific course.
 * @param { number } courseID - ID of the course.
 * @param { number } teamID - ID of the team.
 */
export async function deleteTeam(courseID, teamID) {
  let response = await deleteWrapper(
    `/api/courses/${courseID}/teams/${teamID}`
  );
  if (!response.ok) {
    throw new Error(response.error);
  }
}

/**
 * @description Update a specific team in a specific course.
 * @param { number } courseID - ID of the course.
 * @param { number } teamID - ID of the team.
 * @param { object } updatedTeam - An object containing the information you want to change for the team.
 * @param { string } [updatedTeam.name] - Team name.
 * @param { string } [updatedTeam.description] - Short description of the team.
 * @returns { Team } Updated team with its information.
 */
export async function updateTeam(courseID, teamID, updatedTeam) {
  let response = await patchWrapper(
    `/api/courses/${courseID}/teams/${teamID}`,
    updatedTeam
  );
  if (!response.ok) {
    throw new Error(response.error);
  }
  return response.data;
}

/**
 * @description Get a list of all the team members from a specific team in a specific course.
 * @param { number } courseID - ID of the course.
 * @param { number } teamID - ID of the team.
 * @returns { TeamMemberComplex[] } List of all the team members with their information.
 */
export async function getTeamMembers(courseID, teamID) {
  let response = await getWrapper(
    `/api/courses/${courseID}/teams/${teamID}/members`
  );
  if (!response.ok) {
    throw new Error(response.error);
  }
  return response.data.members; // Need this extra .members since we receive an object with the team list stored in .members
}

/**
 * @description Add new members to a specific team in a specific course.
 * @param { number } courseID - ID of the course.
 * @param { number } teamID - ID of the team.
 * @param { TeamMemberSimple[] } newMembers - List of the new members getting added to the team.
 */
export async function addTeamMembers(courseID, teamID, newMembers) {
  let response = await postWrapper(
    `/api/courses/${courseID}/teams/${teamID}/add_members`,
    newMembers
  );
  if (!response.ok) {
    throw new Error(response.error);
  }
}

/**
 * @description Update the roles of members in a specific team in a specific course.
 * @param { number } courseID - ID of the course.
 * @param { number } teamID - ID of the team.
 * @param { TeamMemberSimple[] } updatedMembers - List of members with new roles.
 */
export async function updateTeamMembers(courseID, teamID, updatedMembers) {
  let response = await patchWrapper(
    `/api/courses/${courseID}/teams/${teamID}/update_members`,
    updatedMembers
  );
  if (!response.ok) {
    throw new Error(response.error);
  }
}

/**
 * @description Remove members from a specific team in a specific course.
 * @param { number } courseID - ID of the course.
 * @param { number } teamID - ID of the team.
 * @param { number[] } memberIDs - List of IDs of the team members to remove.
 */
export async function removeTeamMembers(courseID, teamID, memberIDs) {
  let response = await deleteWrapper(
    `/api/courses/${courseID}/teams/${teamID}/remove_members`,
    { ids: memberIDs }
  );
  if (!response.ok) {
    throw new Error(response.error);
  }
}
