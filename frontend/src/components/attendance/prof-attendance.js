import { getUserRole, getCourseId } from '/src/js/utils/cache-utils.js';
import { activateAttendance, getLecture } from '/src/js/api/lecture.js';

/**
 * Custom element for managing professor/TA attendance activation and display.
 * Shows attendance code status and provides activation controls for lectures.
 * @extends HTMLElement
 */
export class ProfAttendance extends HTMLElement {
  /**
   * Creates an instance of ProfAttendance.
   * Binds the startHandler method to the instance context.
   */
  constructor() {
    super();
    this.startHandler = this.startHandler.bind(this);
  }

  /**
   * Lifecycle callback invoked when the element is connected to the DOM.
   * Retrieves lecture and course IDs, checks user role, and renders the component
   * if the user is a professor or TA.
   * @async
   * @returns {Promise<void>}
   */
  async connectedCallback() {
    this.lectureId = this.getAttribute('lecture-id');
    this.courseId = getCourseId();
    this.role = getUserRole();
    if (this.role === 'professor' || this.role === 'ta') {
      await this.render();
    }
  }

  /**
   * Renders the attendance UI based on the current lecture status.
   * Determines if attendance is ongoing, expired, or not yet generated and
   * displays appropriate controls and status messages.
   *
   * Status values:
   * - returns -1 if the lecture has expired
   * - returns 0 if the lecture attendance is ongoing
   * - returns 1 if the lecture attendance code has not been gnerated
   *
   * @async
   * @returns {Promise<void>}
   */
  async render() {
    try {
      this.courseId = getCourseId();
      this.lecture = await getLecture(this.courseId, this.lectureId);
    } catch (e) {
      console.error(e);
      return;
    }

    const now = new Date();
    const generated_time = new Date(this.lecture.code_generated_at);
    const expires_time = new Date(this.lecture.code_expires_at);
    const isGeneratedValid =
      this.lecture.code_generated_at && !isNaN(generated_time.getTime());
    const isExpiresValid =
      this.lecture.code_expires_at && !isNaN(expires_time.getTime());
    let status = 0; // ongoing
    if (isExpiresValid && expires_time < now) {
      status = -1; // expired
    } else if (!isGeneratedValid && !isExpiresValid) {
      status = 1; // not generated yet
    }

    // Render
    this.startButton = document.createElement('button');
    this.startButton.innerText = 'Activate';
    this.startButton.style.marginBottom = '0';
    this.status = document.createElement('p');
    console.log(this.lecture, status);

    if (status === 0) {
      // Ongoing
      this.status.innerHTML = `${this.lecture.code}`;
      this.status.style.color = 'blue';
      this.appendChild(this.status);
    } else if (status === 1) {
      // Not Generated Yet
      this.appendChild(this.startButton);
      this.appendChild(this.status);
      this.startButton.addEventListener('click', this.startHandler);
    } else {
      // Expired
      this.status.innerHTML = 'Attendance Expired';
      this.appendChild(this.status);
    }
  }

  /**
   * Handles the activation of attendance when the activate button is clicked.
   * Calls the API to generate an attendance code and updates the UI to display it.
   * @async
   * @returns {Promise<void>}
   */
  async startHandler() {
    try {
      const attendance = await activateAttendance(
        this.courseId,
        this.lectureId
      );
      if (attendance?.code) {
        this.startButton.style.display = 'none';
        this.status.innerText = attendance.code;
        this.status.style.color = 'blue';
      }
    } catch (e) {
      return;
    }
  }
}

customElements.define('prof-attendance', ProfAttendance);
