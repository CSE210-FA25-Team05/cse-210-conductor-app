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
    const courseDropdown = document.createElement('conductor-dropdown');
    courseDropdown.classList = 'lg';
    courseDropdown.innerHTML = `
       <details class="dropdown" name="course-dropdown">
           <summary>Course</summary>
           <ul>
               <li><a href="#cards">Cards</a></li>
               <li><a href="#typography">Typography</a></li>
               <li><a href="#components">Components</a></li>
               <li><a href="#buttons">Buttons</a></li>
               <li><button>Create Course</button></li>
               <li><button>Join Course</button></li>
           </ul>
       </details>
    `

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
}

customElements.define('conductor-nav', ConductorNav);
