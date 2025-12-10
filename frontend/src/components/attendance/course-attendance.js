import {
  getUserRole,
  getCourseId,
  getUserId,
} from '/src/js/utils/cache-utils.js';
import { activateAttendance, getLectures } from '/src/js/api/lecture.js';
import {
  createAttendanceSimplified,
  getAttendanceStats,
} from '/src/js/api/attendance.js';

export class CourseAttendance extends HTMLElement {
  constructor() {
    super();
  }

  async connectedCallback() {
    const role = getUserRole();
    if (role === 'professor' || role === 'ta') {
      this.createProfView();
    } else {
      this.createStudentView();
    }
  }

  async startHandler() {
    try {
      this.courseId = parseInt(getCourseId());
      this.lectures = await getLectures(this.courseId);
      this.today = new Date().toISOString().split('T')[0];
    } catch (e) {
      this.errorMsg.textContent = `Error activating attendance: ${e.message}</p>`;
      console.error(e);
      return;
    }

    let todaysLecture = null;
    for (const lec of this.lectures) {
      if (lec.lecture_date === this.today) {
        todaysLecture = lec;
        break;
      }
    }
    // if there is no lecture scheduled for today
    if (!todaysLecture) {
      this.errorMsg.style = 'display:block; color:red;';
      this.errorMsg.textContent = 'No lecture scheduled for today.';
      return;
    }

    let attendance;
    try {
      attendance = await activateAttendance(this.courseId, todaysLecture.id);
    } catch (e) {
      this.errorMsg.style = 'display:block; color:red;';
      this.errorMsg.textContent = `Error activating attendance: ${e.message}`;
      return;
    }
    // more saftey checks
    if (!attendance) {
      this.errorMsg.style = 'display:block; color:red;';
      this.errorMsg.textContent = 'Error activating attendance: activateAttendance API failed.';
      return;
    }

    this.codeState.textContent = attendance.code;
    this.timerRow.style = 'display:block;';
    const d = new Date(attendance.code_expires_at);
    const expireTime = d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    this.expiration.textContent = `Code expires at: ${expireTime}`;
  }

  async createProfView() {
    this.profView = document.createElement('div');
    if (this.profView.innerHTML.trim() !== null) {
      this.profView.innerHTML = `
        <h3>Professor Attendance Control</h3>
        <div>
          <button id="start-btn">Start Attendance</button>
          <button id="stop-btn" style="display:none;">Stop Attendance</button>
        </div>
        <div id="code-row" style="display:none;">
          <strong>Attendance Code: </strong><span id="code-val"></span>
        </div>
        <div>
          <strong>Status: </strong><span id="code-state">Not active</span>
        </div>
        <div id="timer-row" style="display:none;">
          <strong>Expires At: </strong><span id="expiration">00:00</span>
        </div>
        <p id="error-msg" style="display:none, color: red;"></div>
      `;
    }
    this.appendChild(this.profView);
    this.startBtn = this.profView.querySelector('#start-btn');
    this.stopBtn = this.profView.querySelector('#stop-btn');
    this.codeRow = this.profView.querySelector('#code-row');
    this.codeVal = this.profView.querySelector('#code-val');
    this.codeState = this.profView.querySelector('#code-state');
    this.timerRow = this.profView.querySelector('#timer-row');
    this.expiration = this.profView.querySelector('#expiration');
    this.errorMsg = this.profView.querySelector('#error-msg');

    this.startBtn.addEventListener('click', () => this.startHandler());
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
      this.lectures = await getLectures(this.courseId);
      this.today = new Date().toISOString().split('T')[0];

      let todaysLecture = null;
      for (const lec of this.lectures) {
        if (lec.lecture_date === this.today) {
          todaysLecture = lec;
          break;
        }
      }

      if (!todaysLecture) {
        this.studentMsg.style = 'display:block; color:red;';
        this.studentMsg.textContent = 'No lecture scheduled for today.';
        return;
      }

      if (!todaysLecture.code) {
        this.studentMsg.style = 'display:block; color:red;';
        this.studentMsg.textContent =
          "No attendance code for today's lecture yet.";
        return;
      }

      // --> bugged right now when user tries to input the attendance code multiple times before attendance closes
      // const userAttendance = await getAttendanceStats(this.courseId);
      // console.log(userAttendance);
      // if (userAttendance) {
      //   for (const att of userAttendance.lectures) {
      //     if (att.lecture_id === todaysLecture.id) {
      //       this.studentMsg.style = "display:block; color:green;";
      //       this.studentMsg.textContent = "You have already gotten credit for attendance today.";
      //       return;
      //     }
      //   }
      // }

      if (todaysLecture.code === inputCode) {
        const now = new Date();
        const d = new Date(todaysLecture.code_expires_at);
        if (now < d) {
          const output = await createAttendanceSimplified(this.courseId, {
            code: inputCode,
          });
          if (output.user_id == getUserId()) {
            this.studentMsg.style = 'display:block; color:green;';
            this.studentMsg.textContent = 'Code accepted!';
            this.querySelector('#code-input').value = '';
          } else {
            this.studentMsg.style = 'display:block; color:red;';
            this.studentMsg.textContent = 'Wrong attendance code!';
          }
        }
      }
    } catch (e) {
      this.studentMsg.style = 'display:block; color:red;';
      this.studentMsg.textContent =
        'Error logging attendance. Please try again.';
      console.log(`Error logging attendance: ${e}`);
    }
  }

  async createStudentView() {
    this.studentView = document.createElement('div');
    this.studentView.innerHTML = `
      <h3>Student Attendance Submission</h3>
      <div>
        <label for="code-input">Enter Attendance Code: </label>
        <input type="text" id="code-input" maxlength="6" />
        <button id="submit-btn">Submit</button>
      </div>
      <div>
        <strong>Status: </strong><span id="student-state">No active code</span>
      </div>
      <div id="student-timer-row" style="display:none;">
        <strong>Expires At: </strong><span id="student-expiration">00:00</span>
      </div>
      <p id="student-msg" style="display:none;"></p>
    `;
    this.appendChild(this.studentView);
    this.codeInput = this.studentView.querySelector('#code-input');
    this.submitBtn = this.studentView.querySelector('#submit-btn');
    this.studentState = this.studentView.querySelector('#student-state');
    this.studentTimerRow = this.studentView.querySelector('#student-timer-row');
    this.studentExpiration = this.studentView.querySelector(
      '#student-expiration'
    );
    this.studentMsg = this.studentView.querySelector('#student-msg');
    this.submitBtn.addEventListener('click', () => this.submitHandler());

    // dynamic scripts
    // check if code is active
    try {
      this.courseId = parseInt(getCourseId());
      this.lectures = await getLectures(this.courseId);
      this.today = new Date().toISOString().split('T')[0];

      let todaysLecture = null;
      for (const lec of this.lectures) {
        if (lec.lecture_date === this.today) {
          todaysLecture = lec;
          break;
        }
      }

      if (!todaysLecture) {
        return;
      }
      const userAttendance = await getAttendanceStats(this.courseId);
      if (userAttendance.lectures) {
        for (const att of userAttendance.lectures) {
          if (att.lecture_id == todaysLecture.id) {
            this.studentMsg.style = 'display:block; color:green;';
            this.studentMsg.textContent =
              'You have already gotten credit for attendance today.';
            return;
          }
        }
      }
      if (todaysLecture.code) {
        const now = new Date();
        const d = new Date(todaysLecture.code_expires_at);
        if (now < d) {
          this.studentState.textContent = 'Code active!';
          this.studentTimerRow.style = 'display: block;';
          const expireTime = d.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });
          this.studentExpiration.textContent = `Code expires at: ${expireTime}`;
        } else {
          this.studentState.textContent = 'Code expired.';
        }
      }
    } catch (e) {
      console.error(e);
      return;
    }
  }
}

customElements.define('course-attendance', CourseAttendance);
