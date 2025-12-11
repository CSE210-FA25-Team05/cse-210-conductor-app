import {
  getCachedCourses,
  getCourseId,
  getUserRole,
} from '/src/js/utils/cache-utils.js';

import '/src/components/modal/modal.js';
import '/src/components/dropdown.js';
import '/src/components/forms/create-course.js';
import '/src/components/forms/join-course.js';

/**
 * Custom element for a course selection dropdown with course management actions.
 * Displays a list of user's courses and provides modals for creating and joining courses.
 * Shows different options based on user role (professors can create courses, all users can join).
 * @extends HTMLElement
 * 
 * @example
 * <course-dropdown></course-dropdown>
 */
class CourseDropdown extends HTMLElement {
  /**
   * Creates an instance of CourseDropdown.
   * Binds event handler methods to the instance context.
   */
  constructor() {
    super();

    this.boundedHandleNewCourseOpen = this.handleNewCourseOpen.bind(this);
    this.boundedHandleJoinCourseOpen = this.handleJoinCourseOpen.bind(this);
  }

  /**
   * Lifecycle callback invoked when the element is connected to the DOM.
   * Initializes the dropdown with user's courses, creates modals for course creation
   * and joining, and sets up the dropdown structure with appropriate buttons based on user role.
   * @returns {void}
   */
  connectedCallback() {
    this.role = getUserRole();
    this.courseId = parseInt(getCourseId());
    this.courses = getCachedCourses();

    // Course Dropdown
    this.courseDropdown = document.createElement('conductor-dropdown');
    const details = document.createElement('details');
    this.label = document.createElement('summary');
    this.ul = document.createElement('ul');

    // Create course modal trigger button
    this.newCourseButton = document.createElement('button');
    this.newCourseButton.innerHTML = 'Create Course<i>add</i>';
    // Create course modal
    const newCourseModal = document.createElement('modal-component');
    newCourseModal.setAttribute('footer', 'none');
    newCourseModal.setAttribute('button-align', 'end');
    const modalHeader = document.createElement('h4');
    modalHeader.setAttribute('slot', 'header');
    modalHeader.innerText = 'Create Course';
    const modalContent = document.createElement('create-course-form');
    modalContent.setAttribute('slot', 'content');
    newCourseModal.appendChild(modalHeader);
    newCourseModal.appendChild(modalContent);
    this.newCourseButton.addEventListener(
      'click',
      this.boundedHandleNewCourseOpen
    );
    this.newCourseModal = newCourseModal;

    // modal trigger button
    this.joinCourseButton = document.createElement('button');
    this.joinCourseButton.innerHTML = 'Join Course<i>add</i>';
    // modal
    const joinCourseModal = document.createElement('modal-component');
    joinCourseModal.setAttribute('footer', 'none');
    joinCourseModal.setAttribute('button-align', 'end');
    const joinCourseHeader = document.createElement('h4');
    joinCourseHeader.setAttribute('slot', 'header');
    joinCourseHeader.innerText = 'Join Course';
    const joinCourseContent = document.createElement('join-course-form');
    joinCourseContent.setAttribute('slot', 'content');
    joinCourseModal.appendChild(joinCourseHeader);
    joinCourseModal.appendChild(joinCourseContent);
    this.joinCourseButton.addEventListener(
      'click',
      this.boundedHandleJoinCourseOpen
    );
    this.joinCourseModal = joinCourseModal;

    details.appendChild(this.label);
    details.appendChild(this.ul);
    details.appendChild(this.newCourseModal);
    details.appendChild(this.joinCourseModal);
    this.courseDropdown.appendChild(details);
    this.appendChild(this.courseDropdown);

    this.renderCourseDropdown();
  }

  /**
   * Handles the join course button click event.
   * Opens the join course modal.
   * @returns {void}
   */
  handleJoinCourseOpen() {
    this.joinCourseModal.open();
  }

  /**
   * Handles the new course button click event.
   * Opens the create course modal.
   * @returns {void}
   */
  handleNewCourseOpen() {
    this.newCourseModal.open();
  }

  /**
   * Updates the dropdown label to display the current course code.
   * Shows the first 7 characters of the current course code, or "Course" if no course is selected.
   * @returns {void}
   */
  updateCourseDropdownLabel() {
    if (!this.label) return;

    if (this.courseId) {
      const currentCourse = this.courses.find(
        (course) => course.id === this.courseId
      );
      if (currentCourse) {
        this.label.textContent = currentCourse.course_code.slice(0, 7);
        return;
      }
    }

    this.label.textContent = 'Course';
  }

  /**
   * Renders the course dropdown list with all available courses.
   * Displays course links, a separator, and action buttons (Create/Join Course).
   * Professors see the "Create Course" button, while all users see "Join Course".
   * Shows "No courses found" message if the user has no courses.
   * @returns {void}
   */
  renderCourseDropdown() {
    if (!this.ul) return;

    this.ul.innerHTML = '';

    if (this.courses.length === 0) {
      const li = document.createElement('li');
      const span = document.createElement('span');
      span.innerText = 'No courses found';
      li.appendChild(span);
      this.ul.appendChild(li);
      return;
    }

    this.courses.forEach((course) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `/course/${course.id}/dashboard`;
      a.textContent = `${course.course_code}: ${course.course_name}`;
      li.appendChild(a);
      this.ul.appendChild(li);
    });

    // Add visual separator
    const li = document.createElement('li');
    li.setAttribute('data-state', 'off');
    const hr = document.createElement('hr');
    li.appendChild(hr);
    this.ul.appendChild(li);

    // Add action buttons at the end
    if (this.role === 'professor') {
      const createLi = document.createElement('li');
      createLi.appendChild(this.newCourseButton);
      this.ul.appendChild(createLi);
    }

    const joinLi = document.createElement('li');
    joinLi.appendChild(this.joinCourseButton);
    this.ul.appendChild(joinLi);

    this.updateCourseDropdownLabel();
  }
}

customElements.define('course-dropdown', CourseDropdown);