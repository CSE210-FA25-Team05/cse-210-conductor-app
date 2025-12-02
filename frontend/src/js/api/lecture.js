// GET    /api/courses/{course_id}/lectures
// POST   /api/courses/{course_id}/lectures
// GET    /api/courses/{course_id}/lectures/{lecture_id}
// PATCH  /api/courses/{course_id}/lectures/{lecture_id}
// DELETE /api/courses/{course_id}/lectures/{lecture_id}

import {
  getWrapper,
  postWrapper,
  patchWrapper,
  deleteWrapper,
} from '/src/js/fetch-wrapper.js';

/**
 * @typedef Lecture
 * @typedef {Object} FetchResult
 * @property {boolean} ok - Whether the request was successful.
 * @property {number} status - HTTP status code of the response.
 * @property {any} [data] - Parsed response data (JSON or text) when the request succeeds.
 * @property {string} [error] - Error message when the request fails.
 */

/**
 * @typedef {Object} LectureContent
 * @property {number} id - Unique identifier of the lecture.
 * @property {string} [title] - Title of the lecture.
 * @property {string} [description] - Description or summary of the lecture.
 * @property {string} [date] - ISO 8601 date string for when the lecture occurs.
 * @property {string} [slidesUrl] - Optional URL to lecture slides/resources.
 * @property {string} [recordingUrl] - Optional URL to lecture recording.
 */

const BACKEND_URL = 'http://localhost:3001';
