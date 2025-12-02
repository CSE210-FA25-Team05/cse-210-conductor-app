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

const BACKEND_URL = 'http://localhost:3001';
