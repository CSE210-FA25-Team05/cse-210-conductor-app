class JoinCourseForm extends HTMLElement {
  constructor() {
    super();
    this.boundedHandleSubmit = this.handleSubmit.bind(this);
  }

  connectedCallback() {
    const form = document.createElement('form');
    form.id = 'createCourseForm';

    const fields = [
      {
        label: 'Course ID',
        id: 'course-id',
        name: 'course_id',
      },
      {
        label: 'Course Code',
        id: 'course-code',
        name: 'course_code',
      },
    ];

    fields.forEach((field) => {
      const label = document.createElement('label');
      label.setAttribute('for', field.id);
      label.innerText = field.label;

      const input = document.createElement('input');
      input.id = field.id;
      input.type = field.type || 'text';
      input.name = field.name;
      if (field.value) input.value = field.value;
      input.setAttribute('required', '');

      label.appendChild(input);
      form.appendChild(label);
    });

    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.slot = 'buttons';
    submitButton.innerText = 'Join Course';

    form.appendChild(submitButton);
    this.appendChild(form);

    this.form = form;
    this.form.addEventListener('submit', this.boundedHandleSubmit);
  }

  handleSubmit(event) {
    event.preventDefault();
  }

  disconnectedCallback() {
    this.form.removeEventListener('submit', this.boundedHandleSubmit);
  }
}

customElements.define('join-course-form', JoinCourseForm);
