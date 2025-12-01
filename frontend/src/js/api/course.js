import { getWrapper } from '/src/js/fetch-wrapper.js';
import { postWrapper } from '/src/js/fetch-wrapper.js';

/**
 * @typedef Course
 * @type { object }
 * @property { number } id - Course ID number.
 * @property { string } course_code - Course code.
 * @property { string } course_name - Course name.
 * @property { string } term - School term the course takes course in.
 * @property { string } section - Course section.
 * @property { string } join_code - Code for enrolling in the course.
 * @property { string } start_date - Date the course begins on, in YYYY-MM-DD format.
 * @property { string } end_date - Date the course ends on, in YYYY-MM-DD format.
 */

const BACKEND_URL = 'http://localhost:3001';

/**
 * @description Get a list of all the courses with their information.
 * @returns { Course[] } List of all the courses with their information.
 */
export async function getCourses() {
  let response = await getWrapper(BACKEND_URL + '/api/courses');
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
  let response = await postWrapper(BACKEND_URL + '/api/courses', newCourse);
  if (!response.ok) {
    throw new Error(response.error);
  }
  return response.data;
}

/**
 * @description Get a specific course's information by its course ID.
 * @param { number } courseID - ID of the course you want to view.
 * @returns { Course } Requested course with its information.
 */
export async function getCourseWithID(courseID) {
  let response = await getWrapper(BACKEND_URL + '/api/courses/' + courseID);
  if (!response.ok) {
    throw new Error(response.error);
  }
  return response.data;
}
