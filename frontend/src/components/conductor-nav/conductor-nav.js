import '/src/components/logout-button/logout-button.js'; // IMP

class ConductorNav extends HTMLElement {
  constructor() {
    super();

    this.paths = {
      // Display name -> href
      Dashboard: '/dashboard',
      Signals: '/signals',
      Interactions: '/interactions',
      Atoms: '/atoms',
      Journals: '/journals',
      ZingGrid: '/zinggrid',
    };
    this.boundedHandleMenuToggleClick = this.handleMenuToggleClick.bind(this);
    this.parentAside = this.parentElement;
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
    modalButton.textContent = 'Add Signal';
    modalButton.addEventListener('click', () => {
      const modal = document.getElementById('navModal');
      if (modal) {
        modal.open();
      }
    });

    header.appendChild(menuToggle);
    header.appendChild(modalButton);
    nav.appendChild(ul);
    footer.appendChild(logoutButtonInstance);

    this.appendChild(header);
    this.appendChild(nav);
    this.appendChild(footer);
  }

  handleMenuToggleClick() {
    document.body.classList.toggle('menu-closed');
  }
}

customElements.define('conductor-nav', ConductorNav);
