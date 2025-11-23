class LogoutButton extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.attachShadow({ mode: 'open' });

    this.shadowRoot.innerHTML = `
        <button> 
            Log Out
        </button>
        `;

    this.shadowRoot
      .querySelector('button')
      .addEventListener('click', this.handleClick);
  }

  disconnectedCallback() {
    this.shadowRoot
      .querySelector('button')
      .removeEventListener('click', this.handleClick);
  }

  async handleClick() {
    try {
      const response = await fetch('http://localhost:3001/auth/logout', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data);
      window.location.href = 'login.html';
    } catch (error) {
      console.error(error.message);
    }
  }
}

customElements.define('logout-button', LogoutButton);

export default LogoutButton;
