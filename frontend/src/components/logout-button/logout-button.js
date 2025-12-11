import { postWrapper } from '/src/js/fetch-wrapper.js';

/**
 * Custom element for a logout button that handles user logout functionality.
 * Displays a button with an icon and text, sends a logout request to the server,
 * and redirects the user to the login page.
 * @extends HTMLElement
 */
class LogoutButton extends HTMLElement {
  /**
   * Creates an instance of LogoutButton.
   */
  constructor() {
    super();
  }

  /**
   * Lifecycle callback invoked when the element is connected to the DOM.
   * Renders the logout button and attaches the click event listener.
   * @returns {void}
   */
  connectedCallback() {
    this.innerHTML = `
        <button style="width: 100%; margin-top: var(--spacing-extra-small); margin-bottom: var(--spacing-extra-small);"> 
            <i>logout</i> Log Out
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
   * Handles the logout button click event.
   * Sends a POST request to the logout endpoint and redirects to the login page.
   * @async
   * @returns {Promise<void>}
   */
  async handleClick() {
    postWrapper('/auth/logout');
    window.location.replace('/login');
  }
}

customElements.define('logout-button', LogoutButton);

export default LogoutButton;
