import {
  getUserRole,
  getCourseId,
  getUserId,
} from '/src/js/utils/cache-utils.js';
import { getLecture } from '/src/js/api/lecture.js';
import {
  createAttendanceSimplified,
  getUserAttendance,
} from '/src/js/api/attendance.js';

export class StudentAttendance extends HTMLElement {
  constructor() {
    super();
    this.submitHandler = this.submitHandler.bind(this);
  }

  async connectedCallback() {
    this.role = getUserRole();
    this.courseId = getCourseId();
    this.lectureId = this.getAttribute('lecture-id');
    let status;
    try {
      status = await this.getStatus();
    } catch (e) {
      console.log(e);
    }
    if (this.role !== 'professor' && this.role !== 'ta' && status) {
      this.createForm();
    } else {
      this.displayStatus();
    }
  }

  displayStatus() {
    this.status = document.createElement('p');
    this.status.innerText = 'Not Availabile';
    this.appendChild(this.status);
  }

  createForm() {
    this.form = document.createElement('form');
    this.form.style =
      'display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 1em';
    this.label = document.createElement('label');
    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.style = 'margin: 0';
    this.input.placeholder = 'Attendance Code';
    this.input.id = 'code-input';
    this.input.maxlength = '6';
    this.input.minlength = '6';
    this.submitButton = document.createElement('input');
    this.submitButton.style.marginBottom = '0';
    this.submitButton.type = 'submit';

    this.form.appendChild(this.input);
    this.form.appendChild(this.label);
    this.form.appendChild(this.submitButton);

    this.appendChild(this.label);
    this.appendChild(this.form);

    this.form.addEventListener('submit', this.submitHandler);
  }

  async getStatus() {
    this.lecture = await getLecture(this.courseId, this.lectureId);
    if (!this.lecture) {
      return 'Lecture Not Found';
    }
    this.userId = getUserId();

    const attendance = await getUserAttendance(
      this.courseId,
      this.lectureId,
      this.userId
    );
    console.log('ATTENDANCE: ', attendance);
    console.log('stats: ', attendance, this.userId);
    const now = new Date();
    const start = new Date(this.lecture.code_generated_at);
    const end = new Date(this.lecture.code_expires_at);

    return now >= start && now <= end;
  }

  async submitHandler(event) {
    event.preventDefault(); // <-- stops page reload
    console.log('submit attendance form');

    try {
      console.log(this.input.value, this.courseId);
      const output = await createAttendanceSimplified(this.courseId, {
        code: this.input.value,
      });
      console.log('OUTPUT', output);
    } catch (e) {
      console.log(e);
    }
  }
}

customElements.define('student-attendance', StudentAttendance);
