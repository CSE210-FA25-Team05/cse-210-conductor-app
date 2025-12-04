import '/src/components/modal/modal.js';
import '/src/components/dropdown.js';

class CourseDropdown extends HTMLElement {
  constructor() {
    super();

    this.courses = [];
  }

  connectedCallback() {
    // Course Dropdown
    this.courseDropdown = document.createElement('conductor-dropdown');
    const details = document.createElement('details');
    this.label = document.createElement('summary');
    this.ul = document.createElement('ul');

    details.appendChild(this.label);
    details.appendChild(this.ul);
    this.courseDropdown.appendChild(details);
    this.appendChild(this.courseDropdown);

    this.fetchCourses();
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
      a.textContent = course.course_name;
      li.appendChild(a);
      this.ul.appendChild(li);
    });

    // Add action buttons at the end
    const createLi = document.createElement('li');
    const createButton = document.createElement('button');
    createButton.textContent = 'Create Course';
    createButton.addEventListener('click', () => {
      // Handle create course action
      console.log('Create course clicked');
    });
    createLi.appendChild(createButton);
    this.ul.appendChild(createLi);

    const joinLi = document.createElement('li');
    const joinButton = document.createElement('button');
    joinButton.textContent = 'Join Course';
    joinButton.addEventListener('click', () => {
      // Handle join course action
      console.log('Join course clicked');
    });
    joinLi.appendChild(joinButton);
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
