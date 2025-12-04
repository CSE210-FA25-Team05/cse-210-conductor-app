import '/src/components/modal/modal.js';
import '/src/components/dropdown.js';

class CourseDropdown extends HTMLElement {
  constructor() {
    super();

    this.boundedHandleNewCourseClose = this.handleNewCourseClose.bind(this);
    this.boundedHandleNewCourseOpen = this.handleNewCourseOpen.bind(this);
    this.boundedHandleJoinCourseClose = this.handleJoinCourseClose.bind(this);
    this.boundedHandleJoinCourseOpen = this.handleJoinCourseOpen.bind(this);

    this.courses = [];
  }

  connectedCallback() {
    // Course Dropdown
    this.courseDropdown = document.createElement('conductor-dropdown');
    const details = document.createElement('details');
    this.label = document.createElement('summary');
    this.ul = document.createElement('ul');

    // modal trigger button
    this.newCourseButton = document.createElement('button');
    this.newCourseButton.innerHTML = 'Create Course<i>add</i>';
    // modal
    const newCourseModal = document.createElement('modal-component');
    newCourseModal.setAttribute('button-align', 'end');
    const modalHeader = document.createElement('h2');
    modalHeader.setAttribute('slot', 'header');
    modalHeader.innerText = 'Create Course';
    const modalContent = document.createElement('p');
    modalContent.setAttribute('slot', 'content');
    modalContent.innerText = 'Add Form to create a course here.';
    const submitNewCourseButton = document.createElement('button');
    submitNewCourseButton.setAttribute('slot', 'buttons');
    submitNewCourseButton.innerText = 'Create';
    newCourseModal.appendChild(modalHeader);
    newCourseModal.appendChild(modalContent);
    newCourseModal.appendChild(submitNewCourseButton);
    submitNewCourseButton.addEventListener(
      'click',
      this.boundedHandleNewCourseClose
    );
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
    joinCourseModal.setAttribute('button-align', 'end');
    const joinCourseHeader = document.createElement('h2');
    joinCourseHeader.setAttribute('slot', 'header');
    joinCourseHeader.innerText = 'Join Course';
    const joinCourseContent = document.createElement('p');
    joinCourseContent.setAttribute('slot', 'content');
    joinCourseContent.innerText = 'Add Form to join a course here.';
    const submitJoinCourseButton = document.createElement('button');
    submitJoinCourseButton.setAttribute('slot', 'buttons');
    submitJoinCourseButton.innerText = 'Join';
    joinCourseModal.appendChild(joinCourseHeader);
    joinCourseModal.appendChild(joinCourseContent);
    joinCourseModal.appendChild(submitJoinCourseButton);
    submitJoinCourseButton.addEventListener(
      'click',
      this.boundedHandleJoinCourseClose
    );
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

    this.fetchCourses();
  }

  handleJoinCourseClose() {
    this.joinCourseModal.close();
  }

  handleJoinCourseOpen() {
    this.joinCourseModal.open();
  }

  handleNewCourseClose() {
    this.newCourseModal.close();
  }

  handleNewCourseOpen() {
    this.newCourseModal.open();
  }

  async fetchCourses() {
    try {
      const response = await fetch('/api/courses', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const courses = await response.json();
      this.courses = courses;
      this.renderCourseDropdown();
    } catch (error) {
      console.error('Error fetching courses:', error);
      this.renderCourseError();
    }
  }

  getCurrentCourseId() {
    // Get course ID from URL pattern /course/{course_id}/page
    const pathParts = window.location.pathname.split('/');
    const courseIndex = pathParts.indexOf('course');
    if (courseIndex !== -1 && pathParts[courseIndex + 1]) {
      return parseInt(pathParts[courseIndex + 1], 10);
    }
    return null;
  }

  updateCourseDropdownLabel() {
    const currentCourseId = this.getCurrentCourseId();

    if (!this.label) return;

    if (currentCourseId) {
      const currentCourse = this.courses.find(
        (course) => course.id === currentCourseId
      );
      if (currentCourse) {
        this.label.textContent = currentCourse.course_code;
        return;
      }
    }

    this.label.textContent = 'Course';
  }

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
    const createLi = document.createElement('li');
    createLi.appendChild(this.newCourseButton);
    this.ul.appendChild(createLi);

    const joinLi = document.createElement('li');
    joinLi.appendChild(this.joinCourseButton);
    this.ul.appendChild(joinLi);

    this.updateCourseDropdownLabel();
  }

  renderCourseError() {
    if (!this.ul) return;
    this.ul.innerHTML = `
      <li><span style="color: var(--color-error);">Error loading courses</span></li>
      <li><button onclick="this.closest('conductor-nav').fetchCourses()">Retry</button></li>
    `;
  }
}

customElements.define('course-dropdown', CourseDropdown);
