/**
 * Custom element for a profile button that navigates to the user's profile page.
 * Displays a button with an account icon and text that redirects to the profile route.
 * @extends HTMLElement
 *
 * @example
 * <profile-button></profile-button>
 */
class ProfileButton extends HTMLElement {
  /**
   * Creates an instance of ProfileButton.
   */
  constructor() {
    super();
  }

  /**
   * Lifecycle callback invoked when the element is connected to the DOM.
   * Renders the profile button and attaches the click event listener.
   * @returns {void}
   */
  connectedCallback() {
    this.innerHTML = `
        <button style="width: 100%"> 
            <i>account_circle</i> Profile
        </button>
        `;

    this.querySelector('button').addEventListener('click', this.handleClick);
  }

  /**
   * Lifecycle callback invoked when the element is disconnected from the DOM.
   * Removes the click event listener to prevent memory leaks.
   * @returns {void}
   */
  disconnectedCallback() {
    this.querySelector('button').removeEventListener('click', this.handleClick);
  }

  /**
   * Handles the profile button click event.
   * Redirects the user to the profile page.
   * @async
   * @returns {Promise<void>}
   */
  async handleClick() {
    window.location.replace('/profile');
  }
}

customElements.define('profile-button', ProfileButton);

export default ProfileButton;
