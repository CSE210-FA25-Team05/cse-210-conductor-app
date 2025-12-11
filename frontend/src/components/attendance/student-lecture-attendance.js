import { getUserRole, getCourseId } from '/src/js/utils/cache-utils.js';
import { getLectures } from '/src/js/api/lecture.js';
import { getAttendanceStats } from '/src/js/api/attendance.js';

export class StudentLectureAttendance extends HTMLElement {
  constructor() {
    super();
  }

  async connectedCallback() {
    const role = getUserRole();
    if (role !== 'professor' && role !== 'ta') {
      this.createLectureAttendance();
    }
  }

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
