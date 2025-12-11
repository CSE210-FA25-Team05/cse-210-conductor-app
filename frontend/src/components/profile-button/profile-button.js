class ProfileButton extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
        <button style="width: 100%"> 
            <i>account_circle</i> Profile
        </button>
        `;

    this.querySelector('button').addEventListener('click', this.handleClick);
  }

  disconnectedCallback() {
    this.querySelector('button').removeEventListener('click', this.handleClick);
  }

  async handleClick() {
    window.location.replace('/profile');
  }
}

customElements.define('profile-button', ProfileButton);

export default ProfileButton;
