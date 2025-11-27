class ConductorDropdown extends HTMLElement {
  constructor() {
    super();
    this.boundHandleClickOutside = this.handleClickOutside.bind(this);
    this.boundHandleEscape = this.handleEscape.bind(this);
    this.boundHandleClick = this.handleClick.bind(this);
    this.boundHandleToggle = this.handleToggle.bind(this);
  }

  connectedCallback() {
    this.details = this.querySelector('details');
    this.summary = this.querySelector('summary');

    if (!this.details || !this.summary) return;

    this.details.addEventListener('toggle', this.boundHandleToggle);
    this.summary.addEventListener('click', this.boundHandleClick);
  }

  handleClick() {
    if (!this.details.open) {
      this.closeAllOtherDropdowns();
    }
  }

  handleToggle() {
    if (this.details.open) {
      this.onOpen();
    } else {
      this.onClose();
    }
  }

  onOpen() {
    document.addEventListener('click', this.boundHandleClickOutside);
    document.addEventListener('keydown', this.boundHandleEscape);
  }

  onClose() {
    document.removeEventListener('click', this.boundHandleClickOutside);
    document.removeEventListener('keydown', this.boundHandleEscape);
  }

  handleClickOutside(event) {
    if (!this.contains(event.target)) {
      this.details.removeAttribute('open');
    }
  }

  handleEscape(event) {
    if (event.key === 'Escape') {
      this.details.removeAttribute('open');
      this.summary.focus();
    }
  }

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
