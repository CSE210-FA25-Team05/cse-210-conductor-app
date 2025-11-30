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
      ZingGrid: '/zinggrid'
    };
  }

  connectedCallback() {
    const nav = document.createElement('nav');
    const ul = document.createElement('ul');
    const bottom = document.createElement('div');
    const logoutButtonInstance = document.createElement('logout-button');

    for (const displayName of Object.keys(this.paths)) {
      const li = document.createElement('li');
      const a = document.createElement('a');

      a.href = this.paths[displayName];
      a.textContent = displayName;

      li.appendChild(a);
      ul.appendChild(li);
    }

    // modal trigger button
    const modalButton = document.createElement('button');
    modalButton.textContent = 'Add Signal';
    modalButton.addEventListener('click', () => {
      const modal = document.getElementById('navModal');
      if (modal) {
        modal.open();
      }
    });

    nav.appendChild(modalButton);
    bottom.appendChild(logoutButtonInstance);

    nav.appendChild(ul);
    nav.appendChild(bottom);

    this.appendChild(nav);
  }
}

customElements.define('conductor-nav', ConductorNav);
