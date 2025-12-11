import { postWrapper } from '/src/js/fetch-wrapper.js';

class LogoutButton extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
        <button style="width: 100%"> 
            <i>logout</i> Log Out
        </button>
        `;

    this.querySelector('button').addEventListener('click', this.handleClick);
  }

  disconnectedCallback() {
    this.querySelector('button').removeEventListener('click', this.handleClick);
  }

  async handleClick() {
    postWrapper('/auth/logout');
    window.location.replace('/login');
  }
}

customElements.define('logout-button', LogoutButton);

export default LogoutButton;
