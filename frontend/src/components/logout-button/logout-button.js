class LogoutButton extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
        <button style="width: 100%"> 
            Log Out
        </button>
        `;

    this.querySelector('button').addEventListener('click', this.handleClick);
  }

  disconnectedCallback() {
    this.querySelector('button').removeEventListener('click', this.handleClick);
  }

  async handleClick() {
    try {
      const response = await fetch('/auth/logout', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      window.location.replace('/login');
    } catch (error) {
      console.error(error.message);
    }
  }
}

customElements.define('logout-button', LogoutButton);

export default LogoutButton;
