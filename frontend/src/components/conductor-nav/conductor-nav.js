import styles from './conductor-nav.css?inline';
import logoutButton from '../logout-button/logout-button.js'; // IMP

class ConductorNav extends HTMLElement {
  constructor() {
    super();

    this.paths = {
      // Display name -> href
      Dashboard: 'dashboard.html',
      Signals: 'signals.html',
      Interactions: 'interactions.html',
      Atoms: 'atoms.html',
      Journals: 'journals.html',
    };
  }

  connectedCallback() {
    this.attachShadow({ mode: 'open' }); // Attach Shadow DOM

    const nav = document.createElement('nav');
    const ul = document.createElement('ul');
    const bottom = document.createElement('div');
    const style = document.createElement('style');
    const logoutButtonInstance = document.createElement('logout-button');

    style.textContent = styles;

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

    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(nav);
  }
}

customElements.define('conductor-nav', ConductorNav);
