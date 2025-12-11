import { getUserRole, getCourseId } from '/src/js/utils/cache-utils.js';
import { activateAttendance, getLectures } from '/src/js/api/lecture.js';

export class ProfAttendance extends HTMLElement {
  constructor() {
    super();
  }

  async connectedCallback() {
    const role = getUserRole();
    if (role === 'professor' || role === 'ta') {
      this.createProfView();
    }
  }

  async startHandler() {
    try {
      this.courseId = parseInt(getCourseId());
      this.lectures = await getLectures(this.courseId);
      this.lectureId = parseInt(this.getAttribute('lecture-id'));
      this.today = new Date().toLocaleDateString('en-CA');
    } catch (e) {
      this.errorMsg.textContent = `Error activating attendance: ${e.message}</p>`;
      console.error(e);
      return;
    }

    let attendance;
    try {
      attendance = await activateAttendance(this.courseId, this.lectureId);
    } catch (e) {
      this.errorMsg.style = 'display:block; color:red;';
      this.errorMsg.textContent = `Error activating attendance: ${e.message}`;
      return;
    }
    // more saftey checks
    if (!attendance) {
      this.errorMsg.style = 'display:block; color:red;';
      this.errorMsg.textContent =
        'Error activating attendance: activateAttendance API failed.';
      return;
    }

    this.buttonRow.style = 'display:none;';
    this.codeState.style = 'display:none;';
    this.codeRow.style = 'display:block;';
    this.codeVal.textContent = attendance.code;

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
    this.lectureId = parseInt(this.getAttribute('lecture-id'));

    try {
      this.courseId = parseInt(getCourseId());
      this.lectures = await getLectures(this.courseId);
      this.lectureId = parseInt(this.getAttribute('lecture-id'));
      this.today = new Date().toLocaleDateString('en-CA');
    } catch (e) {
      console.error(e);
      return;
    }

    let currentLecture = null;
    for (const lec of this.lectures) {
      if (lec.id === this.lectureId) {
        currentLecture = lec;
        break;
      }
    }
    // if there is no lecture scheduled for today
    const lecDate = new Date(currentLecture.lecture_date).toLocaleDateString(
      'en-CA'
    );
    if (lecDate === this.today) {
      this.profView.innerHTML = `
            <article>
                <div id="button-row">
                    <button id="start-btn">Start Attendance</button>
                </div>
                <div id="code-row" style="display:none;">
                    <strong>Attendance Code: </strong><span id="code-val"></span>
                </div>
                <div id="timer-row" style="display:none;">
                    <span id="expiration">00:00</span>
                </div>
                <p id="error-msg" style="display:none, color: red;"></div>
                <div id="code-state">
                    <strong>Status: </strong><span>Not active</span>
                </div>
            </article>
        `;
      this.appendChild(this.profView);
      this.buttonRow = this.profView.querySelector('#button-row');
      this.startBtn = this.profView.querySelector('#start-btn');
      this.stopBtn = this.profView.querySelector('#stop-btn');
      this.codeRow = this.profView.querySelector('#code-row');
      this.codeVal = this.profView.querySelector('#code-val');
      this.codeState = this.profView.querySelector('#code-state');
      this.timerRow = this.profView.querySelector('#timer-row');
      this.expiration = this.profView.querySelector('#expiration');
      this.errorMsg = this.profView.querySelector('#error-msg');

      this.startBtn.addEventListener('click', () => this.startHandler());
    } else {
      this.profView.innerHTML = `
            <p id="error-msg">No lecture today</p>
        `;
      this.appendChild(this.profView);
    }
  }
}

customElements.define('prof-attendance', ProfAttendance);
