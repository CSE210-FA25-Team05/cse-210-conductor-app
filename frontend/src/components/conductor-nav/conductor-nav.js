import '/src/components/logout-button/logout-button.js';
import '/src/components/dropdown.js';
import '/src/components/course-dropdown.js';
import '/src/components/modal/quick-add-modal.js';

class ConductorNav extends HTMLElement {
  constructor() {
    super();

    this.paths = {
      // Display name -> href
      Dashboard: '/course/dashboard',
      Pulses: '/course/signals',
      Interactions: '/course/interactions',
      Lectures: '/course/lecture',
      Journals: '/course/journals',
      Directory: '/course/directory',
    };
    this.courses = [];
    this.boundedHandleMenuToggleClick = this.handleMenuToggleClick.bind(this);
    this.boundedHandleResize = this.handleResize.bind(this);
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
    const courseDropdown = document.createElement('course-dropdown');

    for (const displayName of Object.keys(this.paths)) {
      const li = document.createElement('li');
      const a = document.createElement('a');

      a.href = this.paths[displayName];
      a.textContent = displayName;

      a.style.padding = 'var(--button-padding)';
      li.style.padding = '0';
      li.classList.add('state-layer');

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
    const modal = document.createElement('quick-add-modal');
    modalButton.addEventListener('click', this.boundedHandleOpenModal);
    this.modal = modal;

    // Profile button
    const profileButton = document.createElement('button');
    profileButton.innerText = 'Profile';
    profileButton.style.width = '100%';
    profileButton.onclick = function () {
      window.location.replace('/profile');
    }
    profileButton.style.marginBottom = "5%";

    header.appendChild(menuToggle);
    header.appendChild(courseDropdown);
    header.appendChild(modalButton);
    nav.appendChild(ul);
    footer.appendChild(profileButton);
    footer.appendChild(logoutButtonInstance);

    this.appendChild(header);
    this.appendChild(nav);
    this.appendChild(footer);
    this.appendChild(modal);
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

  disconnectedCallback() {
    if (this.boundedHandleResize) {
      window.removeEventListener('resize', this.boundedHandleResize);
    }
  }
}

customElements.define('conductor-nav', ConductorNav);
