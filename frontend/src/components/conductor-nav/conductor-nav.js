import '/src/components/logout-button/logout-button.js';
import '/src/components/dropdown.js';
import '/src/components/course-dropdown.js';
import '/src/components/modal/quick-add-modal.js';
import '/src/components/profile-button/profile-button.js';

/**
 * Custom element for the main navigation sidebar in the Conductor application.
 * Provides navigation links, course dropdown, profile button, logout functionality,
 * and a quick-add modal. Handles responsive behavior for mobile and desktop views.
 * @extends HTMLElement
 */
class ConductorNav extends HTMLElement {
  /**
   * Creates an instance of ConductorNav.
   * Initializes navigation paths, binds event handlers, and sets up responsive behavior.
   */
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

  /**
   * Lifecycle callback invoked when the element is connected to the DOM.
   * Creates and renders the navigation structure including header, navigation links,
   * footer with profile/logout buttons, and the quick-add modal.
   * @returns {void}
   */
  connectedCallback() {
    const nav = document.createElement('nav');
    const ul = document.createElement('ul');
    const header = document.createElement('header');
    const footer = document.createElement('footer');
    const logoutButtonInstance = document.createElement('logout-button');
    const courseDropdown = document.createElement('course-dropdown');
    const profileButton = document.createElement('profile-button');

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

  /**
   * Handles the menu toggle button click event.
   * Toggles the 'menu-closed' class on the body element to show/hide the navigation menu.
   * @returns {void}
   */
  handleMenuToggleClick() {
    document.body.classList.toggle('menu-closed');
  }

  /**
   * Handles window resize events to manage responsive navigation behavior.
   * Automatically closes the menu on mobile viewports (< 600px width) and
   * opens it on larger viewports.
   * @returns {void}
   */
  handleResize() {
    if (window.innerWidth < 600) {
      document.body.classList.add('menu-closed');
    } else {
      document.body.classList.remove('menu-closed');
    }
  }

  /**
   * Handles the quick-add button click event.
   * Opens the quick-add modal for creating new items.
   * @returns {void}
   */
  handleOpenModal() {
    this.modal.open();
  }

  /**
   * Lifecycle callback invoked when the element is disconnected from the DOM.
   * Cleans up the resize event listener to prevent memory leaks.
   * @returns {void}
   */
  disconnectedCallback() {
    if (this.boundedHandleResize) {
      window.removeEventListener('resize', this.boundedHandleResize);
    }
  }
}

customElements.define('conductor-nav', ConductorNav);