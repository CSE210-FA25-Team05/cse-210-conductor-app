import '/src/components/logout-button/logout-button.js';
import '/src/components/modal/modal.js';
import '/src/components/dropdown.js';
import '/src/components/course-dropdown.js';

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
      Profile: '/profile',
      ChartsJS: '/course/chartsjs',
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
    const courseDropdown = document.createElement('course-dropdown');

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

    header.appendChild(menuToggle);
    header.appendChild(courseDropdown);
    header.appendChild(modalButton);
    nav.appendChild(ul);
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

  handleCloseModal() {
    this.modal.close();
  }

  disconnectedCallback() {
    if (this.boundedHandleResize) {
      window.removeEventListener('resize', this.boundedHandleResize);
    }
  }
}

customElements.define('conductor-nav', ConductorNav);
