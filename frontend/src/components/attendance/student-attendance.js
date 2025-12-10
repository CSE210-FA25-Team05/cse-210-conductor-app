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

  // async submitHandler() {
  //   try {
  //     const inputCode = this.querySelector('#code-input').value;
  //     if (inputCode === null || inputCode === '') {
  //       this.studentMsg.style = 'display:block; color:red;';
  //       this.studentMsg.textContent = 'Input a valid code.';
  //       return;
  //     }

  //     this.courseId = parseInt(getCourseId());
  //     this.lectures = await getLectures(this.courseId);

  //     this.today = new Date().toISOString().split('T')[0];

  //     let todaysLecture = null;
  //     for (const lec of this.lectures) {
  //       if (lec.lecture_date === this.today) {
  //         todaysLecture = lec;
  //         break;
  //       }
  //     }

  //     if (!todaysLecture) {
  //       this.studentMsg.style = 'display:block; color:red;';
  //       this.studentMsg.textContent = 'No lecture scheduled for today.';
  //       return;
  //     }

  //     if (!todaysLecture.code) {
  //       this.studentMsg.style = 'display:block; color:red;';
  //       this.studentMsg.textContent =
  //         "No attendance code for today's lecture yet.";
  //       return;
  //     }

  //     if (todaysLecture.code === inputCode) {
  //       const now = new Date().toLocaleDateString('en-CA');
  //       const d = new Date(todaysLecture.code_expires_at).toLocaleDateString(
  //         'en-CA'
  //       );
  //       if (now < d) {
  //         const output = await createAttendanceSimplified(this.courseId, {
  //           code: inputCode,
  //         });
  //         if (output.user_id == getUserId()) {
  //           this.studentMsg.style = 'display:block; color:green;';
  //           this.studentMsg.textContent = 'Code accepted!';
  //           this.querySelector('#code-input').value = '';
  //         } else {
  //           this.studentMsg.style = 'display:block; color:red;';
  //           this.studentMsg.textContent = 'Wrong attendance code!';
  //         }
  //       }
  //     }
  //   } catch (e) {
  //     this.studentMsg.style = 'display:block; color:red;';
  //     this.studentMsg.textContent =
  //       'Error logging attendance. Please try again.';
  //     console.log(`Error logging attendance: ${e}`);
  //   }
  // }

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

    // // dynamic scripts
    // // check if code is active
    // try {
    //   this.courseId = parseInt(getCourseId());
    //   this.lectures = await getLectures(this.courseId);
    //   this.today = new Date().toLocaleDateString('en-CA');
    //   let todaysLecture = null;
    //   for (const lec of this.lectures) {
    //     if (lec.lecture_date === this.today) {
    //       todaysLecture = lec;
    //       break;
    //     }
    //   }

    //   if (!todaysLecture) {
    //     return;
    //   }
    //   const userAttendance = await getAttendanceStats(this.courseId);
    //   if (userAttendance.lectures) {
    //     for (const att of userAttendance.lectures) {
    //       if (att.lecture_id == todaysLecture.id) {
    //         this.attendanceForm.style.display = 'none';
    //         this.studentMsg.style = 'display:block; color:green;';
    //         this.studentMsg.textContent =
    //           'You have already gotten credit for attendance today.';
    //         return;
    //       }
    //     }
    //   }
    //   if (todaysLecture.code) {
    //     const now = new Date();
    //     const d = new Date(todaysLecture.code_expires_at);
    //     if (now < d) {
    //       this.studentState.textContent = 'Code active!';
    //       this.studentTimerRow.style = 'display: block;';
    //       const expireTime = d.toLocaleTimeString([], {
    //         hour: '2-digit',
    //         minute: '2-digit',
    //       });
    //       this.studentExpiration.textContent = `Code expires at: ${expireTime}`;
    //     } else {
    //       this.studentState.textContent = 'Code expired.';
    //     }
    //   }
    // } catch (e) {
    //   console.error(e);
    //   return;
    // }
  }
}

customElements.define('student-attendance', StudentAttendance);
