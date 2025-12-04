import '/src/components/logout-button/logout-button.js';
import '/src/components/modal/modal.js';
import '/src/components/dropdown.js';

class ConductorNav extends HTMLElement {
  constructor() {
    super();

    this.paths = {
      // Display name -> href
      Dashboard: '/course/dashboard',
      Signals: '/course/signals',
      Interactions: '/course/interactions',
      Atoms: '/course/atoms',
      Journals: '/course/journals',
      ZingGrid: '/course/zinggrid',
    };
    this.courses = [];
    this.boundedHandleMenuToggleClick = this.handleMenuToggleClick.bind(this);
    this.boundedHandleResize = this.handleResize.bind(this);
    this.boundedHandleCloseModal = this.handleCloseModal.bind(this);
    this.boundedHandleOpenModal = this.handleOpenModal.bind(this);
    this.parentAside = this.parentElement;

    this.boundedHandleResize();
    window.addEventListener('resize', this.boundedHandleResize);
  }

  connectedCallback() {
    const nav = document.createElement('nav');
    const ul = document.createElement('ul');
    const header = document.createElement('header');
    const footer = document.createElement('footer');
    const logoutButtonInstance = document.createElement('logout-button');

    for (const displayName of Object.keys(this.paths)) {
      const li = document.createElement('li');
      const a = document.createElement('a');

      a.href = this.paths[displayName];
      a.textContent = displayName;

      li.appendChild(a);
      ul.appendChild(li);
    }

    // Menu 0pen/close toggle button
    const menuToggle = document.createElement('button');
    const icon = document.createElement('i');
    menuToggle.classList = 'icon-only';
    menuToggle.id = 'menu-toggle';
    icon.innerText = 'menu';
    menuToggle.appendChild(icon);
    menuToggle.addEventListener('click', this.boundedHandleMenuToggleClick);

    // modal trigger button
    const modalButton = document.createElement('button');
    modalButton.id = 'new-button';
    modalButton.innerHTML = 'New<i>add</i>';
    // modal
    const modal = document.createElement('modal-component');
    modal.setAttribute('button-align', 'end');
    const modalHeader = document.createElement('h2');
    modalHeader.setAttribute('slot', 'header');
    modalHeader.innerText = 'New Entry';
    const modalContent = document.createElement('p');
    modalContent.setAttribute('slot', 'content');
    modalContent.innerText =
      'Create a new entry for a Signal, Interaction, Meeting, etc here!';
    const modalFooter = document.createElement('button');
    modalFooter.setAttribute('slot', 'buttons');
    modalFooter.innerText = 'Submit';
    modal.appendChild(modalHeader);
    modal.appendChild(modalContent);
    modal.appendChild(modalFooter);
    modalFooter.addEventListener('click', this.boundedHandleCloseModal);
    modalButton.addEventListener('click', this.boundedHandleOpenModal);
    this.modal = modal;

    // Course Dropdown
    this.courseDropdown = document.createElement('conductor-dropdown');
    this.courseDropdown.innerHTML = `
       <details class="dropdown" name="course-dropdown">
           <summary>Course</summary>
           <ul id="course-list">
               <li><a href="#loading">Loading...</a></li>
           </ul>
       </details>
    `;

    header.appendChild(menuToggle);
    header.appendChild(this.courseDropdown);
    header.appendChild(modalButton);
    nav.appendChild(ul);
    footer.appendChild(logoutButtonInstance);

    this.appendChild(header);
    this.appendChild(nav);
    this.appendChild(footer);
    this.appendChild(modal);

    // Fetch courses after component is mounted
    this.fetchCourses();
  }

  handleMenuToggleClick() {
    document.body.classList.toggle('menu-closed');
  }

  handleResize() {
    if (window.innerWidth < 600) {
      document.body.classList.add('menu-closed');
    } else {
      document.body.classList.remove('menu-closed');
    }
  }

  handleOpenModal() {
    this.modal.open();
  }

  handleCloseModal() {
    this.modal.close();
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

  renderCourseDropdown() {
    const courseList = this.querySelector('#course-list');
    if (!courseList) return;

    courseList.innerHTML = '';

    if (this.courses.length === 0) {
      const li = document.createElement('li');
      const span = document.createElement('span');
      span.innerText = 'No courses found';
      li.appendChild(span);
      courseList.appendChild(li);
      return;
    }

    this.courses.forEach(course => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `/course/${course.id}/dashboard`;
      a.textContent = course.course_name || course.course_code || `Course ${course.id}`;
      li.appendChild(a);
      courseList.appendChild(li);
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
    courseList.appendChild(createLi);

    const joinLi = document.createElement('li');
    const joinButton = document.createElement('button');
    joinButton.textContent = 'Join Course';
    joinButton.addEventListener('click', () => {
      // Handle join course action
      console.log('Join course clicked');
    });
    joinLi.appendChild(joinButton);
    courseList.appendChild(joinLi);
  }

  renderCourseError() {
    const courseList = this.querySelector('#course-list');
    if (!courseList) return;

    courseList.innerHTML = `
      <li><span style="color: var(--color-error);">Error loading courses</span></li>
      <li><button onclick="this.closest('conductor-nav').fetchCourses()">Retry</button></li>
    `;
  }
}

customElements.define('conductor-nav', ConductorNav);
