import {
  getWrapper,
  postWrapper,
  patchWrapper,
  deleteWrapper,
} from '/src/js/fetch-wrapper.js';

/**
 * @typedef Attendance
 * @type { object }
 * @property { number } id - Attendance record ID.
 * @property { number } course_id - Associated course ID.
 * @property { number } lecture_id - Associated lecture ID.
 * @property { number } user_id - ID of the user for this attendance record.
 * @property { number } updated_by - ID of the user who last updated the attendance.
 * @property { string } update_reason - Reason for the last update.
 */

/**
 * @typedef AttendanceStats
 * @type { object }
 * @property { number } total_enrolled - Total number of students enrolled.
 * @property { number } total_present - Number of students present.
 * @property { number } attendance_percentage - Percentage of attendance.
 */

/**
 * @description Get all attendance records for a given lecture.
 * @param { number } courseID - ID of the course.
 * @param { number } lectureID - ID of the lecture.
 * @returns { Attendance[] } List of all attendance records for the given lecture.
 */
export async function getAllAttendances(courseID, lectureID) {
  const response = await getWrapper(
    `/api/courses/${courseID}/lectures/${lectureID}/attendances`
  );
  if (!response.ok) {
    throw new Error(response.error);
  }
  return response.data.attendances;
}

/**
 * @description Create a new attendance record for a user in a lecture (simplified).
 * @param { number } courseID - ID of the course.
 * @param { object } codeInfo - Code information.
 * @param { string } codeInfo.code - Attendance code or identifier.
 * @returns { Attendance } Created attendance record.
 */
export async function createAttendanceSimplified(courseID, codeInfo) {
  const response = await postWrapper(
    `/api/courses/${courseID}/attendances`,
    codeInfo
  );
  if (!response.ok) {
    throw new Error(response.error);
  }
  return response.data;
}

/**
 * @description Create a new attendance record for a user in a lecture.
 * @param { number } courseID - ID of the course.
 * @param { number } lectureID - ID of the lecture.
 * @param { object } newAttendance - Attendance information.
 * @param { number } newAttendance.user_id - ID of the user being marked.
 * @param { string } newAttendance.code - Attendance code or identifier.
 * @param { string } newAttendance.update_reason - Reason for marking attendance.
 * @returns { Attendance } Created attendance record.
 */
export async function createAttendance(courseID, lectureID, newAttendance) {
  const response = await postWrapper(
    `/api/courses/${courseID}/lectures/${lectureID}/attendances`,
    newAttendance
  );
  if (!response.ok) {
    throw new Error(response.error);
  }
  return response.data;
}

/**
 * @description Update an existing attendance record.
 * @param { number } courseID - ID of the course.
 * @param { number } lectureID - ID of the lecture.
 * @param { number } attendanceID - ID of the attendance record.
 * @param { object } updatedAttendance - Object containing updates to the attendance record.
 * @param { string } updatedAttendance.update_reason - Reason for updating attendance.
 * @returns { Attendance } Updated attendance record.
 */
export async function updateAttendance(
  courseID,
  lectureID,
  attendanceID,
  updatedAttendance
) {
  const response = await patchWrapper(
    `/api/courses/${courseID}/lectures/${lectureID}/attendances/${attendanceID}`,
    updatedAttendance
  );
  if (!response.ok) {
    throw new Error(response.error);
  }
  return response.data;
}

/**
 * @description Get attendance statistics for a user.
 * @param {number} courseID - ID of the course.
 * @param {string|null} start_time - Start time of a specific lecture.
 * @param {string|null} end_time - End time of a specific lecture.
 * @returns {object} { AttendanceStats, Attendance[] }
 */
export async function getAttendanceStats(
  courseID,
  start_time = null,
  end_time = null
) {
  const url = new URL(
    `/api/courses/${courseID}/attendances/stats`,
    window.location.origin
  );

  if (start_time) {
    url.searchParams.set('start_time', encodeURIComponent(start_time));
  }
  if (end_time) {
    url.searchParams.set('end_time', encodeURIComponent(end_time));
  }

  const response = await getWrapper(url.toString());

  if (!response.ok) {
    throw new Error(response.error);
  }

  return response.data;
}

/**
 * @description Get attendance statistics for a lecture (total enrolled, present, attendance percentage).
 * @param { number } courseID - ID of the course.
 * @param { number } lectureID - ID of the lecture.
 * @returns { AttendanceStats } Attendance statistics for that lecture.
 */
export async function getAttendanceStatsForLecture(courseID, lectureID) {
  const response = await getWrapper(
    `/api/courses/${courseID}/lectures/${lectureID}/attendances/stats`
  );
  if (!response.ok) {
    throw new Error(response.error);
  }
  return response.data;
}

/**
 * @description Delete a specific attendance record from a lecture.
 * @param { number } courseID - ID of the course.
 * @param { number } lectureID - ID of the lecture.
 * @param { number } attendanceID - ID of the attendance record to delete.
 * @returns { string } Confirmation message from the server.
 */
export async function deleteAttendance(courseID, lectureID, attendanceID) {
  const response = await deleteWrapper(
    `/api/courses/${courseID}/lectures/${lectureID}/attendances/${attendanceID}`
  );
  if (!response.ok) {
    throw new Error(response.error);
  }
  return response.data.message;
}