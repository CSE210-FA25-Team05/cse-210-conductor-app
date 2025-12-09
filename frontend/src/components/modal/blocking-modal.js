import { Modal } from '/src/components/modal/modal.js';

/**
 * BlockingModal Web Component
 *
 * A modal dialog that cannot be closed by clicking the backdrop, pressing the
 * Escape key, or using the close button.
 *
 * This component extends the base `Modal` class but overrides certain behavior
 * to make the modal truly "blocking".
 *
 * @example
 * // Wait until the custom element is defined, then use it
 * customElements.whenDefined('blocking-modal').then(() => {
 *   const modal = document.createElement('blocking-modal');
 *   document.body.appendChild(modal);
 *   modal.open();
 * });
 *
 * @extends Modal
 */
class BlockingModal extends Modal {
  constructor() {
    super();
    this.handleEscape = this.handleEscape.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();

    // Disable modal closing interactions
    this.dialog.removeEventListener('click', this.handleBackdropClick);
    this.closeBtn.removeEventListener('click', this.handleCloseClick);
    this.closeBtn.removeEventListener('cancel', this.handleDialogCancel);

    this.closeBtn.style.display = 'none';
  }

  /**
   * Prevents modal from closing when the user presses the Escape key.
   */
  handleEscape(event) {
    if (event.key === 'Escape') {
      event.stopPropagation();
      event.preventDefault();
    }
  }

  open() {
    document.addEventListener('keydown', this.handleEscape, true);
    super.open();
  }

  close() {
    document.removeEventListener('keydown', this.handleEscape, true);
    super.close();
  }
}

customElements.define('blocking-modal', BlockingModal);
