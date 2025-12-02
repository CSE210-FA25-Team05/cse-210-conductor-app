// Get the course_id from the path /course/{course_id}/page_name
const courseId = location.pathname.split('/')[2];

// Set cookie to remember last visited course
document.cookie = `last_course_id=${courseId}; path=/; SameSite=Lax`;

/**
 * Retrieves the `last_course_id` value from the browser's cookies.
 *
 * @function lastCourseId
 * @returns {string|null} The course ID stored in the `last_course_id` cookie, or `null` if the cookie DNE.
 */
export function lastCourseId() {
  const match = document.cookie.match(/(?:^|; )last_course_id=([^;]*)/);
  const courseId = match ? decodeURIComponent(match[1]) : null;
  return courseId;
}
