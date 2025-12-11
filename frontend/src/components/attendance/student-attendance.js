import {
  getUserRole,
  getCourseId,
  getUserId,
} from '/src/js/utils/cache-utils.js';
import { getLectures } from '/src/js/api/lecture.js';
import {
  createAttendanceSimplified,
  getAttendanceStats,
} from '/src/js/api/attendance.js';

export class StudentAttendance extends HTMLElement {
  constructor() {
    super();
  }

  async connectedCallback() {
    const role = getUserRole();
    if (role !== 'professor' && role !== 'ta') {
      this.createStudentView();
    }
  }

  async submitHandler() {
    try {
      const inputCode = this.querySelector('#code-input').value;
      if (inputCode === null || inputCode === '') {
        this.studentMsg.style = 'display:block; color:red;';
        this.studentMsg.textContent = 'Input a valid code.';
        return;
      }
      this.courseId = parseInt(getCourseId());

      const output = await createAttendanceSimplified(this.courseId, {
        code: inputCode,
      });
      this.studentMsg.style = 'display:block; color:green;';
      this.studentMsg.textContent = 'Code accepted!';
      this.querySelector('#code-input').value = '';
    } catch (e) {
      this.studentMsg.style = 'display:block; color:red;';
      this.studentMsg.textContent = e;
    }
  }

  async createStudentView() {
    this.studentView = document.createElement('div');
    this.studentView.innerHTML = `
      <article>
          <header>
              <h3>Student Attendance Submission</h3>
          </header>
          <form id="attendance-code-form">
            <label for="code-input">Enter Attendance Code: 
                <input type="text" id="code-input" maxlength="6" />
            </label>
            <button type="button" id="submit-btn">Submit</button>
          </form>
          <div id="student-timer-row" style="display:none;">
            <strong>Expires At: </strong><span id="student-expiration">00:00</span>
          </div>
          <p id="student-msg" style="display:none;"></p>
          <footer>
              <div>
                  <strong>Status: </strong><span id="student-state">No active code</span>
              </div>
          </footer>
      </article>
    `;
    this.appendChild(this.studentView);
    this.codeInput = this.studentView.querySelector('#code-input');
    this.attendanceForm = this.studentView.querySelector(
      '#attendance-code-form'
    );
    this.submitBtn = this.studentView.querySelector('#submit-btn');
    this.studentState = this.studentView.querySelector('#student-state');
    this.studentTimerRow = this.studentView.querySelector('#student-timer-row');
    this.studentExpiration = this.studentView.querySelector(
      '#student-expiration'
    );
    this.studentMsg = this.studentView.querySelector('#student-msg');
    this.submitBtn.addEventListener('click', () => this.submitHandler());
  }
}

customElements.define('student-attendance', StudentAttendance);
