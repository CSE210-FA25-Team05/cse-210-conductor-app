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

/**
 * Custom element for managing student attendance submission and status display.
 * Allows students to submit attendance codes and view their attendance status.
 * @extends HTMLElement
 */
export class StudentAttendance extends HTMLElement {
  /**
   * Creates an instance of StudentAttendance.
   * Binds the submitHandler method to the instance context.
   */
  constructor() {
    super();
    this.submitHandler = this.submitHandler.bind(this);
  }

  /**
   * Lifecycle callback invoked when the element is connected to the DOM.
   * Determines the attendance status and renders the appropriate UI based on
   * user role and attendance availability.
   * @async
   * @returns {Promise<void>}
   */
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
    if (this.role !== 'professor' && this.role !== 'ta' && status === 1) {
      this.createForm();
    } else if (
      this.role !== 'professor' &&
      this.role !== 'ta' &&
      status === 0
    ) {
      this.displayStatusSuccess();
    } else {
      this.displayStatusNotAvailable();
    }
  }

  /**
   * Displays a message indicating that attendance is not available.
   * @returns {void}
   */
  displayStatusNotAvailable() {
    this.status = document.createElement('p');
    this.status.innerText = 'Not Available';
    this.appendChild(this.status);
  }

  /**
   * Displays a success message indicating that attendance has been recorded.
   * Hides the attendance form if it exists.
   * @returns {void}
   */
  displayStatusSuccess() {
    if (this.form) {
      this.form.style.display = 'none';
    }
    this.status = document.createElement('p');
    this.status.innerText = 'Attended';
    this.status.style.color = 'green';
    this.appendChild(this.status);
  }

  /**
   * Creates and renders the attendance code submission form.
   * Sets up the input field, label, and submit button with appropriate styling and event listeners.
   * @returns {void}
   */
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

  /**
   * Retrieves the current attendance status for the user.
   * Checks if the user has already submitted attendance, if the attendance window is open,
   * or if the attendance period has expired.
   *
   * @async
   * @returns {Promise<number|string>} Returns 0 if already attended, 1 if attendance is open,
   * -1 if expired, or 'Lecture Not Found' if the lecture doesn't exist.
   */
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
    const now = new Date();
    const start = new Date(this.lecture.code_generated_at);
    const end = new Date(this.lecture.code_expires_at);

    if (attendance?.course_id == this.courseId) {
      // already did attendance
      return 0;
    }
    if (now >= start && now <= end) {
      // attendance code open
      return 1;
    } else {
      return -1;
    }
  }

  /**
   * Handles the form submission when a student submits an attendance code.
   * Prevents page reload, submits the code to the API, and displays success status
   * if the submission is valid.
   * @async
   * @param {Event} event - The form submission event.
   * @returns {Promise<void>}
   */
  async submitHandler(event) {
    event.preventDefault(); // <-- stops page reload

    try {
      const output = await createAttendanceSimplified(this.courseId, {
        code: this.input.value,
      });
      console.log(parseInt(output.course_id), parseInt(this.courseId));
      if (parseInt(output.course_id) === parseInt(this.courseId)) {
        this.displayStatusSuccess();
      }
    } catch (e) {
      console.log(e);
    }
  }
}

customElements.define('student-attendance', StudentAttendance);
