/**
 * Custom element for a dropdown component with enhanced accessibility and interaction handling.
 * Manages dropdown open/close state, handles click-outside and escape key behavior,
 * and ensures only one dropdown is open at a time across the application.
 * @extends HTMLElement
 * 
 * @example
 * <conductor-dropdown>
 *   <details>
 *     <summary>Dropdown Label</summary>
 *     <ul>
 *       <li><a href="#">Option 1</a></li>
 *       <li><a href="#">Option 2</a></li>
 *     </ul>
 *   </details>
 * </conductor-dropdown>
 */
class ConductorDropdown extends HTMLElement {
  /**
   * Creates an instance of ConductorDropdown.
   * Binds event handler methods to the instance context.
   */
  constructor() {
    super();
    this.boundHandleClickOutside = this.handleClickOutside.bind(this);
    this.boundHandleEscape = this.handleEscape.bind(this);
    this.boundHandleClick = this.handleClick.bind(this);
    this.boundHandleToggle = this.handleToggle.bind(this);
  }

  /**
   * Lifecycle callback invoked when the element is connected to the DOM.
   * Sets up event listeners for the details and summary elements to handle
   * dropdown toggle and click events.
   * @returns {void}
   */
  connectedCallback() {
    this.details = this.querySelector('details');
    this.summary = this.querySelector('summary');

    if (!this.details || !this.summary) return;

    this.details.addEventListener('toggle', this.boundHandleToggle);
    this.summary.addEventListener('click', this.boundHandleClick);
  }

  /**
   * Handles clicks on the dropdown summary element.
   * Closes all other open dropdowns when this dropdown is about to open.
   * @returns {void}
   */
  handleClick() {
    if (!this.details.open) {
      this.closeAllOtherDropdowns();
    }
  }

  /**
   * Handles the toggle event when the dropdown opens or closes.
   * Calls onOpen or onClose methods based on the dropdown state.
   * @returns {void}
   */
  handleToggle() {
    if (this.details.open) {
      this.onOpen();
    } else {
      this.onClose();
    }
  }

  /**
   * Called when the dropdown opens.
   * Adds event listeners for click-outside and escape key handling.
   * @returns {void}
   */
  onOpen() {
    document.addEventListener('click', this.boundHandleClickOutside);
    document.addEventListener('keydown', this.boundHandleEscape);
  }

  /**
   * Called when the dropdown closes.
   * Removes event listeners for click-outside and escape key handling.
   * @returns {void}
   */
  onClose() {
    document.removeEventListener('click', this.boundHandleClickOutside);
    document.removeEventListener('keydown', this.boundHandleEscape);
  }

  /**
   * Handles clicks outside the dropdown.
   * Closes the dropdown if the click target is not contained within the dropdown element.
   * @param {MouseEvent} event - The click event object.
   * @returns {void}
   */
  handleClickOutside(event) {
    if (!this.contains(event.target)) {
      this.details.removeAttribute('open');
    }
  }

  /**
   * Handles the Escape key press.
   * Closes the dropdown and returns focus to the summary element.
   * @param {KeyboardEvent} event - The keyboard event object.
   * @returns {void}
   */
  handleEscape(event) {
    if (event.key === 'Escape') {
      this.details.removeAttribute('open');
      this.summary.focus();
    }
  }

  /**
   * Closes all other open dropdowns in the document.
   * Ensures only one dropdown is open at a time for better user experience.
   * @returns {void}
   */
  closeAllOtherDropdowns() {
    const allDropdowns = document.querySelectorAll(
      'conductor-dropdown details[open]'
    );
    allDropdowns.forEach((details) => {
      if (details !== this.details) {
        details.removeAttribute('open');
      }
    });
  }
}

customElements.define('conductor-dropdown', ConductorDropdown);