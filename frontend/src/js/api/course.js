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
 * @property { string } start_date - Date the course begins on.
 * @property { string } end_date - Date the course ends on.
 */

const BACKEND_URL = 'http://localhost:3001';

/**
 * @description Get a list of all the courses.
 * @returns { Course[] } List of all the courses.
 */
export async function getCourses() {
  let response = await getWrapper(BACKEND_URL + '/api/courses');
  if (!response.ok) {
    throw new Error(response.error);
  }
  return response.data;
}
