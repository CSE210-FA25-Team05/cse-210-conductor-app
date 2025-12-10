/**
 * FormModal Web Component
 * -----------------------
 * A reusable modal interface that organizes multiple `<form-section>` elements into
 * a single, navigable modal window.
 *
 * Structure:
 *  - Uses an internal `<modal-component>` for the actual modal display.
 *  - Moves all child `<form-section>` elements inside the modal content area.
 *  - Automatically builds menu buttons from each `<form-section>`’s `tag` attribute.
 *
 * Behavior:
 *  - `open()` opens the modal and shows the main menu.
 *  - `showForm(tag)` displays the form associated with a given tag.
 *  - `showMenu()` returns to the main menu view.
 *  - `close()` closes the modal.
 *
 * @extends HTMLElement
 *
 * @example
 * <form-modal>
 *   <form-section tag="Customer Form">...</form-section>
 *   <form-section tag="Order Form">...</form-section>
 * </form-modal>
 *
 * <script>
 *   const modal = document.querySelector('form-modal');
 *   modal.open(); // opens with the menu view
 * </script>
 */
export class FormModal extends HTMLElement {
  constructor() {
    super();
    this.forms = [];
    this.boundedShowMenu = this.showMenu.bind(this);
    this.boundedOnMenuClick = this.onMenuClick.bind(this);
    this.boundedOnBackClick = this.onBackClick.bind(this);
  }

  connectedCallback() {
    this.modal = document.createElement('modal-component');
    this.modal.setAttribute('footer', 'none');

    this.backButton = document.createElement('button');
    const backIcon = document.createElement('i');
    backIcon.innerText = 'arrow_back';
    this.backButton.classList = ['icon-only'];
    this.backButton.slot = 'back';
    this.backButton.style.display = 'none';
    this.backButton.appendChild(backIcon);

    this.header = document.createElement('h4');
    this.header.slot = 'header';
    this.header.innerText = 'Quick Add';

    this.content = document.createElement('article');
    this.content.slot = 'content';
    this.content.classList = ['form-modal-content'];

    this.menu = document.createElement('div');
    this.menu.style =
      'display: flex; flex-wrap: wrap; gap: var(--spacing-medium)';
    this.content.appendChild(this.menu);

    this.modal.append(this.backButton, this.header, this.content);
    this.appendChild(this.modal);

    this.forms = Array.from(this.querySelectorAll('form-section'));
    for (const form of this.forms) {
      form.style.display = 'none';
      this.content.appendChild(form);
    }

    for (const form of this.forms) {
      const button = document.createElement('button');
      const tag = form.getAttribute('tag');
      button.dataset.tag = tag;
      button.innerText = tag;
      button.style = 'flex-grow: 1;';
      this.menu.appendChild(button);
    }

    this.menu.addEventListener('click', this.boundedOnMenuClick);
    this.backButton.addEventListener('click', this.boundedOnBackClick);

    this.showMenu();
  }

  onMenuClick(e) {
    if (e.target.dataset.tag) {
      this.showForm(e.target.dataset.tag);
    }
  }

  onBackClick(e) {
    e.stopPropagation();
    this.showMenu();
  }

  showForm(tag) {
    for (const form of this.forms) {
      form.style.display = form.getAttribute('tag') === tag ? 'block' : 'none';
    }
    this.header.innerText = tag;
    this.menu.style.display = 'none';
    this.backButton.style.display = 'inline-block';
  }

  showMenu() {
    for (const form of this.forms) form.style.display = 'none';
    this.backButton.style.display = 'none';
    this.menu.style.display = 'flex';
  }

  open() {
    this.modal.open();
    this.showMenu();
  }

  close() {
    this.modal.close();
  }

  disconnectedCallback() {
    // Remove event listeners
    if (this.menu) this.menu.removeEventListener('click', this.onMenuClick);
    if (this.backButton)
      this.backButton.removeEventListener('click', this.onBackClick);

    // Clear references
    this.forms = [];
    this.modal = null;
    this.menu = null;
    this.backButton = null;
    this.header = null;
    this.content = null;
  }
}

customElements.define('form-modal', FormModal);
customElements.define('form-section', class extends HTMLElement {});
