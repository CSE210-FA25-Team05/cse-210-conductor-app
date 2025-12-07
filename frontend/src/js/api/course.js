import {
  getWrapper,
  postWrapper,
  patchWrapper,
  deleteWrapper,
} from '/src/js/fetch-wrapper.js';

/**
 * @typedef Course
 * @type { object }
 * @property { number } id - Course ID number.
 * @property { string } course_code - Course code.
 * @property { string } course_name - Course name.
 * @property { string } term - School term the course takes course in.
 * @property { string } section - Course section.
 * @property { string } join_code - Code for enrolling in the course. Must be exactly 6 characters long.
 * @property { string } start_date - Date the course begins on, in YYYY-MM-DD format.
 * @property { string } end_date - Date the course ends on, in YYYY-MM-DD format.
 */

/**
 * @typedef UserInfo
 * @type { object }
 * @property { number } id - ID in database.
 * @property { string } user_id - User's ID number.
 * @property { string } course_id - Course ID number.
 * @property { string } team_id - Team ID number.
 * @property { string } role - User's role in the course.
 * @property { string } created_at - Timestamp of when the user was added to the course.
 */

/**
 * @description Get a list of all the courses with their information.
 * @returns { Course[] } List of all the courses with their information.
 */
export async function getAllCourses() {
  let response = await getWrapper('/api/courses');
  if (!response.ok) {
    throw new Error(response.error);
  }
  return response.data;
}

/**
 * @description Create a new course.
 * @param { object } newCourse - An object containing the new course's information.
 * @param { string } newCourse.course_code - Course code.
 * @param { string } newCourse.course_name - Course name.
 * @param { string } newCourse.term - School term the course takes course in.
 * @param { string } newCourse.section - Course section.
 * @param { string } newCourse.join_code - Code for enrolling in the course.
 * @param { string } newCourse.start_date - Date the course begins on, in YYYY-MM-DD
 * @param { string } newCourse.end_date - Date the course ends on, in YYYY-MM-DD format.
 * @returns { Course } Created course with its information.
 */
export async function createCourse(newCourse) {
  let response = await postWrapper('/api/courses', newCourse);
  if (!response.ok) {
    throw new Error(response.error);
  }
  return response.data;
}

/**
 * @description Use course ID to get a specific course's information.
 * @param { number } courseID - ID of the course you want to view.
 * @returns { Course } Requested course with its information.
 */
export async function getCourse(courseID) {
  let response = await getWrapper(`/api/courses/${courseID}`);
  if (!response.ok) {
    throw new Error(response.error);
  }
  return response.data;
}

/**
 * @description Update a specific course.
 * @param { number } courseID - ID of the course you want to update.
 * @param { object } updatedCourse - An object containing the information you want to change for the course.
 * @param { string } [updatedCourse.course_code] - Course code.
 * @param { string } [updatedCourse.course_name] - Course name.
 * @param { string } [updatedCourse.term] - School term the course takes course in.
 * @param { string } [updatedCourse.section] - Course section.
 * @param { string } [updatedCourse.join_code] - Code for enrolling in the course.
 * @param { string } [updatedCourse.start_date] - Date the course begins on, in YYYY-MM-DD
 * @param { string } [updatedCourse.end_date] - Date the course ends on, in YYYY-MM-DD format.
 * @returns { Course } Updated course with its information.
 */
export async function updateCourse(courseID, updatedCourseInfo) {
  let response = await patchWrapper(
    `/api/courses/${courseID}`,
    updatedCourseInfo
  );
  if (!response.ok) {
    throw new Error(response.error);
  }
  return response.data;
}

/**
 * @description Delete a specific course.
 * @param { number } courseID - ID of the course you want to delete.
 */
export async function deleteCourse(courseID) {
  let response = await deleteWrapper(`/api/courses/${courseID}`);
  if (!response.ok) {
    throw new Error(response.error);
  }
}

/**
 * @description Get a list of all the users currently enrolled in a course, along with their information.
 * @param { number } courseID - ID of the course whose users you want to view.
 * @return { UserInfo[] } List of all the users in the course, with their information.
 */
export async function getAllUsersInCourse(courseID) {
  let response = await getWrapper(`/api/courses/${courseID}/users`);
  if (!response.ok) {
    throw new Error(response.error);
  }
  return response.data;
}

/**
 * @description Enroll a user into a course.
 * @param {*} courseID — ID of the course to add the user to.
 * @param { object } user - An object containing user information
 * @param { string } user.id - User ID
 */
export async function addUserInCourse(courseID, user) {
  let response = await postWrapper(`/api/courses/${courseID}/users`, {
    user_id: user.id,
  });
  if (!response.ok) {
    throw new Error(response.error);
  }
}

/**
 * @description Get a user's information in a specific course.
 * @param { number } courseID - ID of the course to get the user from.
 * @param { number } userID - ID of the user to get information for.
 * @returns { UserInfo } Requested user's information in the course.
 */
export async function getUserInCourse(courseID, userID) {
  let response = await getWrapper(`/api/courses/${courseID}/users/${userID}`);
  if (!response.ok) {
    throw new Error(response.error);
  }
  return response.data;
}

/**
 * Update a user's enrollment role in a specific course.
 * @param {*} courseID — ID of the course to update the user in.
 * @param {*} userID User ID of the user to be updated.
 * @param { object } user - An object containing user information
 * @param { string } user.role - User role
 */
export async function updateUserEnrollmentInCourse(courseID, userID, user) {
  let response = await patchWrapper(
    `/api/courses/${courseID}/users/${userID}`,
    { role: user.role }
  );
  if (!response.ok) {
    throw new Error(response.error);
  }
}

/**
 * Remove a user from a specific course.
 * @param {*} courseID — ID of the course to remove the user from.
 * @param {*} userID User ID of the user to be removed from the course.
 */
export async function removeUserFromCourse(courseID, userID) {
  let response = await deleteWrapper(
    `/api/courses/${courseID}/users/${userID}`
  );
  if (!response.ok) {
    throw new Error(response.error);
  }
}

/**
 * @description Join a course using a join code.
 * @param { number } courseID - ID of the course to join.
 * @param { object } joinAndUser - An object containing the userID and join code.
 * @param { string } joinAndUser.user_id - User ID of the user joining the course.
 * @param { string } joinAndUser.join_code - Code for enrolling in the course.
 */
export async function joinCourseWithCode(joinAndUser) {
  console.log(joinAndUser);
  let response = await postWrapper(`/api/courses/join`, {
    join_code: joinAndUser.join_code,
    user_id: joinAndUser.user_id,
  });
  if (!response.ok) {
    throw new Error(response.error);
  }
}
