import { Modal } from '/src/components/modal/modal.js';

class BlockingModal extends Modal {
  constructor() {
    super();
    this.handleEscape - this.handleEscape.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();

    // Remove event listeners to prevent
    this.dialog.removeEventListener('click', this.handleBackdropClick);
    this.closeBtn.removeEventListener('click', this.handleCloseClick);
    this.closeBtn.removeEventListener('cancel', this.handleDialogCancel);

    this.closeBtn.style.display = 'none';
  }

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
