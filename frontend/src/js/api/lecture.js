// GET    /api/courses/{course_id}/lectures
// POST   /api/courses/{course_id}/lectures
// GET    /api/courses/{course_id}/lectures/{lecture_id}
// PATCH  /api/courses/{course_id}/lectures/{lecture_id}
// DELETE /api/courses/{course_id}/lectures/{lecture_id}

import { getWrapper } from '/src/js/fetch-wrapper.js';
import { postWrapper } from '/src/js/fetch-wrapper.js';
import { patchWrapper } from '/src/js/fetch-wrapper.js';
import { deleteWrapper } from '/src/js/fetch-wrapper.js';

/**
 * @typedef Lecture
 * @type { object }
 * @property { number } id - Lecture ID.
 * @property { number } course_id - course ID.
 * @property { string } [title] - Title of the lecture.
 * @property { string } [description] - Description or summary of the lecture.
 * @property { string } [date] - ISO 8601 date string for when the lecture occurs.
 * @property { string } [slidesUrl] - Optional URL to lecture slides/resources.
 * @property { string } [recordingUrl] - Optional URL to lecture recording.
 */

/**
 * @typedef LecturePayload
 * @type { object }
 * @property { string } [title] - Title of the lecture.
 * @property { string } [description] - Description or summary of the lecture.
 * @property { string } [date] - ISO 8601 date string for when the lecture occurs.
 * @property { string } [slidesUrl] - Optional URL to lecture slides/resources.
 * @property { string } [recordingUrl] - Optional URL to lecture recording.
 */

/**
 * @description Get all lectures for a course. Wraps `GET /api/courses/{course_id}/lectures`.
 * @param {number|string} courseId - Unique identifier of the course.
 * @returns { Lecture[] } List of lectures for the course.
 */
export async function getLectures(courseId) {
  const response = await getWrapper(`/api/courses/${courseId}/lectures`);
  if (!response.ok) {
    throw new Error(response.error);
  }
  return response.data.lectures ?? response.data;
}

/**
 * @description Get a single lecture. Wraps `GET /api/courses/{course_id}/lectures/{lecture_id}`.
 * @param {number|string} courseId - Unique identifier of the course.
 * @param {number|string} lectureId - Unique identifier of the lecture.
 * @returns { Lecture } The requested lecture.
 */
export async function getLecture(courseId, lectureId) {
  const response = await getWrapper(
    `/api/courses/${courseId}/lectures/${lectureId}`
  );
  if (!response.ok) {
    throw new Error(response.error);
  }
  return response.data;
}

/**
 * @description Create a new lecture. Wraps `POST /api/courses/{course_id}/lectures`.
 * @param {number|string} courseId - Unique identifier of the course.
 * @param {LecturePayload} lectureBody - Fields for the new lecture.
 * @returns { Lecture } Created lecture with its information.
 */
export async function createLecture(courseId, lectureBody) {
  const response = await postWrapper(
    `/api/courses/${courseId}/lectures`,
    lectureBody
  );
  if (!response.ok) {
    throw new Error(response.error);
  }
  return response.data;
}

/**
 * @description Update an existing lecture. Wraps `PATCH /api/courses/{course_id}/lectures/{lecture_id}`.
 * @param {number|string} courseId - Unique identifier of the course.
 * @param {number|string} lectureId - Unique identifier of the lecture to update.
 * @param {LecturePayload} lectureBody - Fields to update on the lecture.
 * @returns { Lecture } Updated lecture object.
 */
export async function updateLecture(courseId, lectureId, lectureBody) {
  const response = await patchWrapper(
    `/api/courses/${courseId}/lectures/${lectureId}`,
    lectureBody
  );
  if (!response.ok) {
    throw new Error(response.error);
  }
  return response.data;
}

/**
 * @description Delete a lecture. Wraps `DELETE /api/courses/{course_id}/lectures/{lecture_id}`.
 * @param {number|string} courseId - Unique identifier of the course.
 * @param {number|string} lectureId - Unique identifier of the lecture to delete.
 * @returns {{ message: string }} Confirmation message.
 */
export async function deleteLecture(courseId, lectureId) {
  const response = await deleteWrapper(
    `/api/courses/${courseId}/lectures/${lectureId}`
  );
  if (!response.ok) {
    throw new Error(response.error);
  }
  return response.data;
}
