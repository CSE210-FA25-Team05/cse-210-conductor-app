/**
 * ConductorForm Web Component
 * ----------------------
 * A reusable Web Component for building form-based UI elements.
 *
 * This component handles:
 *  - Rendering form fields from the `fields` getter
 *  - Automatic label + input creation
 *  - Submit handling and value extraction
 *  - Centralized error display
 *  - Lifecycle event binding/unbinding
 *
 * Child classes should override:
 *  - `get fields()` to define form structure
 *  - `get submitLabel()` to define button label
 *  - `async onSubmit(values)` to define submit behavior
 *
 * @extends HTMLElement
 *
 * @example
 * class MyForm extends BaseForm {
 *   get fields() { 
 *     return [{ label: "Username", id: "user", name: "username" }]; 
 *   }
 *   async onSubmit(values) { console.log(values); }
 * }
 *
 * @property {HTMLFormElement} form - Internal form element
 * @property {HTMLElement} errorCard - Error message container
 */
export class ConductorForm extends HTMLElement {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  connectedCallback() {
    this.form = document.createElement('form');
    this.renderFields();
    this.renderErrorCard();
    this.renderSubmit();
    this.appendChild(this.form);

    this.form.addEventListener('submit', this.handleSubmit);
  }

  disconnectedCallback() {
    this.form.removeEventListener('submit', this.handleSubmit);
  }

  // OVERRIDE BELOW
  get fields() {
    return [];
  }
  get submitLabel() {
    return 'Submit';
  }
  async onSubmit(values) {}
  // OVERRIDE ABOVE

  renderFields() {
    this.fields.forEach((field) => {
      const label = document.createElement('label');
      label.innerText = field.label;
      label.setAttribute('for', field.id);

      const input = document.createElement('input');
      input.id = field.id;
      input.name = field.name;
      input.type = field.type || 'text';
      if (field.min_length) input.minLength = field.min_length;
      if (field.max_length) input.maxLength = field.max_length;
      if (field.value) input.value = field.value;
      input.required = field.required !== false;

      label.appendChild(input);
      this.form.appendChild(label);
    });
  }

  renderErrorCard() {
    const card = document.createElement('article');
    card.classList = 'error';
    card.style.display = 'none';
    this.errorCard = card;
    this.form.appendChild(card);
  }

  displayError(msg) {
    this.errorCard.innerHTML = `<p>Error: ${msg}</p>`;
    this.errorCard.style.display = '';
  }

  renderSubmit() {
    const btn = document.createElement('button');
    btn.type = 'submit';
    btn.innerText = this.submitLabel;
    this.form.appendChild(btn);
  }

  getFormValues() {
    const values = {};
    this.form.querySelectorAll('input').forEach((i) => {
      values[i.name] = i.value;
    });
    return values;
  }

  async handleSubmit(e) {
    e.preventDefault();
    try {
      const values = this.getFormValues();
      await this.onSubmit(values);
    } catch (err) {
      this.displayError(err.message);
    }
  }
}

customElements.define('conductor-form', ConductorForm);
