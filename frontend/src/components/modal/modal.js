/**
 * Custom modal dialog component with shadow DOM.
 * Provides a reusable modal with header, content, and footer slots, backdrop click handling,
 * and keyboard escape support. Uses the native <dialog> element for accessibility.
 * @extends HTMLElement
 *
 * @example
 * <modal-component open button-align="end">
 *   <span slot="header">Modal Title</span>
 *   <div slot="content">Modal content goes here</div>
 *   <button slot="buttons">Confirm</button>
 * </modal-component>
 */
export class Modal extends HTMLElement {
  /**
   * Creates an instance of Modal.
   * Binds event handler methods to the instance context.
   */
  constructor() {
    super();
    this.handleBackdropClick = this.handleBackdropClick.bind(this);
    this.handleCloseClick = this.handleCloseClick.bind(this);
    this.handleDialogCancel = this.handleDialogCancel.bind(this);
  }

  /**
   * Lifecycle callback invoked when the element is connected to the DOM.
   * Creates the shadow DOM structure with dialog, slots for content,
   * and sets up event listeners for modal interactions.
   * @returns {void}
   */
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    const footerAttr = this.getAttribute('footer');

    const dialog = document.createElement('dialog');
    const article = document.createElement('article');
    const header = document.createElement('header');
    const footer = document.createElement('footer');
    const closeButton = document.createElement('button');
    const closeIcon = document.createElement('i');

    // Create the slots
    const backSlot = document.createElement('slot');
    backSlot.name = 'back';

    const headerSlot = document.createElement('slot');
    headerSlot.name = 'header';

    const contentSlot = document.createElement('slot');
    contentSlot.name = 'content';

    const buttonsSlot = document.createElement('slot');
    buttonsSlot.name = 'buttons';

    closeButton.classList = ['icon-only'];
    article.classList = ['border'];
    closeIcon.innerText = 'close'; // Set to close icon

    // Header: header slot + close button
    closeButton.appendChild(closeIcon);
    header.appendChild(backSlot);
    header.appendChild(headerSlot);
    header.appendChild(closeButton);

    // Footer: buttons slot
    footer.appendChild(buttonsSlot);

    // Article: header + content slot + footer
    article.appendChild(header);
    article.appendChild(contentSlot);
    if (footerAttr !== 'none') {
      article.appendChild(footer);
    }

    dialog.appendChild(article);

    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', '/src/styles/styles.css');

    // Append to shadow root
    this.shadowRoot.appendChild(link);
    this.shadowRoot.appendChild(dialog);

    // Add event listeners
    closeButton.addEventListener('click', this.handleCloseClick);
    dialog.addEventListener('click', this.handleBackdropClick);
    dialog.addEventListener('cancel', this.handleDialogCancel);

    this.dialog = dialog;
    this.footer = footer;
    this.closeBtn = closeButton;

    this.updateButtonAlignment();
  }

  /**
   * Specifies which attributes to observe for changes.
   * @static
   * @returns {string[]} Array of attribute names to observe.
   */
  static get observedAttributes() {
    return ['open', 'button-align'];
  }

  /**
   * Lifecycle callback invoked when an observed attribute changes.
   * Handles opening/closing the modal and updating button alignment.
   * Manages body scroll behavior when modal is open.
   * @param {string} name - The name of the attribute that changed.
   * @param {string|null} oldValue - The previous value of the attribute.
   * @param {string|null} newValue - The new value of the attribute.
   * @returns {void}
   */
  attributeChangedCallback(name, oldValue, newValue) {
    // Only process if the value actually changed
    if (oldValue === newValue) return;

    if (name === 'open') {
      // Prevent body scroll when modal is open
      if (this.hasAttribute('open')) {
        document.body.style.overflow = 'hidden';
        if (this.dialog) {
          this.dialog.showModal();
        }
      } else {
        document.body.style.overflow = '';
        if (this.dialog) {
          this.dialog.close();
        }
      }
    }
    if (name === 'button-align') {
      this.updateButtonAlignment();
    }
  }

  /**
   * Lifecycle callback invoked when the element is disconnected from the DOM.
   * Cleans up event listeners and restores body scroll behavior.
   * @returns {void}
   */
  disconnectedCallback() {
    document.body.style.overflow = '';
    this.closeBtn.removeEventListener('click', this.handleCloseClick);
    this.dialog.removeEventListener('click', this.handleBackdropClick);
    this.dialog.removeEventListener('cancel', this.handleDialogCancel);
  }

  /**
   * Updates the footer button alignment based on the button-align attribute.
   * Sets flex justification to either flex-start or flex-end.
   * @returns {void}
   */
  updateButtonAlignment() {
    if (!this.footer) return;
    const align = this.getAttribute('button-align') || 'end';
    this.footer.style.justifyContent =
      align === 'start' ? 'flex-start' : 'flex-end';
  }

  /**
   * Opens the modal by setting the open attribute.
   * @returns {void}
   */
  open() {
    this.setAttribute('open', '');
  }

  /**
   * Closes the modal by removing the open attribute.
   * @returns {void}
   */
  close() {
    this.removeAttribute('open');
  }

  /**
   * Handles clicks on the modal backdrop.
   * Closes the modal if the click occurs outside the dialog boundaries.
   * @param {MouseEvent} event - The click event object.
   * @returns {void}
   */
  handleBackdropClick(event) {
    const rect = this.dialog.getBoundingClientRect();
    const clickX = event.clientX;
    const clickY = event.clientY;

    // Check if click is outside the dialog bounding box
    if (
      clickX < rect.left ||
      clickX > rect.right ||
      clickY < rect.top ||
      clickY > rect.bottom
    ) {
      this.close();
    }
  }

  /**
   * Handles the dialog cancel event (typically triggered by the Escape key).
   * Prevents the default behavior and closes the modal.
   * @param {Event} event - The cancel event object.
   * @returns {void}
   */
  handleDialogCancel(event) {
    event.preventDefault();
    this.close();
  }

  /**
   * Handles clicks on the close button.
   * Stops event propagation and closes the modal.
   * @param {MouseEvent} event - The click event object.
   * @returns {void}
   */
  handleCloseClick(event) {
    event.stopPropagation();
    this.close();
  }
}

customElements.define('modal-component', Modal);
