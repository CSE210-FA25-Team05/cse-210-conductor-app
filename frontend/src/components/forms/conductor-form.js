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
    queueMicrotask(() => {
      if (this.form) return;
      this.form = document.createElement('form');
      this.renderFields();
      this.renderErrorCard();
      this.renderSubmit();
      this.appendChild(this.form);
      this.form.addEventListener('submit', this.handleSubmit);
    });
  }

  disconnectedCallback() {
    if (this.form) {
      this.form.removeEventListener('submit', this.handleSubmit);
    }
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
      switch (field.type) {
        case 'radio-group':
          this.renderRadioGroup(field);
          break;
        case 'textarea':
          this.renderTextarea(field);
          break;
        default:
          this.renderInput(field);
      }
    });
  }

  renderInput(field) {
    const label = document.createElement('label');
    label.innerText = field.label;
    label.setAttribute('for', field.id);

    const input = document.createElement('input');
    input.id = field.id;
    input.name = field.name;
    input.type = field.type || 'text';
    if (field.value) input.value = field.value;
    input.required = field.required !== false;
    label.appendChild(input);

    this.form.appendChild(label);
  }

  renderTextarea(field) {
    const label = document.createElement('label');
    label.innerText = field.label;
    label.setAttribute('for', field.id);

    const input = document.createElement('textarea');
    input.id = field.id;
    input.name = field.name;
    input.required = field.required !== false;
    label.appendChild(input);

    this.form.appendChild(label);
  }

  // Radio group
  renderRadioGroup(field) {
    const wrapper = document.createElement('div');
    wrapper.role = 'group';

    for (const opt of field.options || []) {
      const label = document.createElement('label');

      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.id = opt.id;
      radio.name = field.name;
      radio.value = opt.value;

      // Store option color for later, only apply when selected
      if (opt.color) {
        label.dataset.color = opt.color;
      }

      label.appendChild(radio);
      label.appendChild(document.createTextNode(opt.label || opt.value));
      wrapper.appendChild(label);
    }

    this.form.appendChild(wrapper);
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
    this.errorCard.style.removeProperty('display');
  }

  renderSubmit() {
    const btn = document.createElement('button');
    btn.type = 'submit';
    btn.innerText = this.submitLabel;
    this.form.appendChild(btn);
  }

  getFormValues() {
    const values = {};
    for (const field of this.fields) {
      switch (field.type) {
        case 'radio-group': {
          const selected = this.form.querySelector(
            `input[name="${field.name}"]:checked`
          );
          values[field.name] = selected ? selected.value : null;
          break;
        }
        default: {
          const input = this.form.querySelector(`[name="${field.name}"]`);
          if (input) values[field.name] = input.value;
        }
      }
    }
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
