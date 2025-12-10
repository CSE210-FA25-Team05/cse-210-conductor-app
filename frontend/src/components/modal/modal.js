export class Modal extends HTMLElement {
  constructor() {
    super();
    this.handleBackdropClick = this.handleBackdropClick.bind(this);
    this.handleCloseClick = this.handleCloseClick.bind(this);
    this.handleDialogCancel = this.handleDialogCancel.bind(this);
  }

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

  static get observedAttributes() {
    return ['open', 'button-align'];
  }

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

  disconnectedCallback() {
    document.body.style.overflow = '';
    this.closeBtn.removeEventListener('click', this.handleCloseClick);
    this.dialog.removeEventListener('click', this.handleBackdropClick);
    this.dialog.removeEventListener('cancel', this.handleDialogCancel);
  }

  updateButtonAlignment() {
    if (!this.footer) return;
    const align = this.getAttribute('button-align') || 'end';
    this.footer.style.justifyContent =
      align === 'start' ? 'flex-start' : 'flex-end';
  }

  open() {
    this.setAttribute('open', '');
  }

  close() {
    this.removeAttribute('open');
  }

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

  handleDialogCancel(event) {
    event.preventDefault();
    this.close();
  }

  handleCloseClick(event) {
    event.stopPropagation();
    this.close();
  }
}

customElements.define('modal-component', Modal);
