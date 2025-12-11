import { getUserRole, getCourseId } from '/src/js/utils/cache-utils.js';
import { getLectures } from '/src/js/api/lecture.js';
import { getAttendanceStats } from '/src/js/api/attendance.js';

/**
 * Custom element for displaying a student's attendance status for a specific lecture.
 * Shows whether the student has attended or not attended the lecture.
 * @extends HTMLElement
 */
export class StudentLectureAttendance extends HTMLElement {
  /**
   * Creates an instance of StudentLectureAttendance.
   */
  constructor() {
    super();
  }

  /**
   * Lifecycle callback invoked when the element is connected to the DOM.
   * Checks the user role and creates the lecture attendance view for students.
   * @async
   * @returns {Promise<void>}
   */
  async connectedCallback() {
    const role = getUserRole();
    if (role !== 'professor' && role !== 'ta') {
      this.createLectureAttendance();
    }
  }

  /**
   * Creates and renders the lecture attendance status view.
   * Fetches the student's attendance records and displays whether they attended
   * the specified lecture. Shows "Attended" in green if present, "Not attended" otherwise.
   * @async
   * @returns {Promise<void>}
   */
  async createLectureAttendance() {
    this.lectureView = document.createElement('div');
    try {
      this.courseId = parseInt(getCourseId());
      this.lectures = await getLectures(this.courseId);
      this.lectureId = parseInt(this.getAttribute('lecture-id'));

      const userAttendance = await getAttendanceStats(this.courseId);
      const attendedLectures = userAttendance.lectures
        ? userAttendance.lectures.map((l) => l.lecture_id)
        : [];
      const attendedSet = new Set(attendedLectures);

      if (attendedSet.has(this.lectureId)) {
        this.lectureView.innerHTML = `
          <p id="student-msg" style="color:green;">Attended</p>
        `;
      } else {
        this.lectureView.innerHTML = `
          <p id="student-msg";">Not attended</p>
        `;
      }
      this.appendChild(this.lectureView);
    } catch (e) {
      console.log(e);
      return;
    }
  }
}

customElements.define('student-lecture-attendance', StudentLectureAttendance);