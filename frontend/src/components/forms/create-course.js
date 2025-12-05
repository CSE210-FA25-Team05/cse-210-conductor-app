class CreateCourseForm extends HTMLElement {
  constructor() {
    super();
    this.boundedHandleSubmit = this.handleSubmit.bind(this);
  }

  connectedCallback() {
    const form = document.createElement('form');
    form.id = 'createCourseForm';

    const fields = [
      {
        label: 'Course Code',
        id: 'course-code',
        name: 'course_code',
      },
      {
        label: 'Course Name',
        id: 'course-name',
        name: 'course_name',
      },
      { label: 'Term', id: 'term', name: 'term' },
      {
        label: 'Section',
        id: 'section',
        name: 'section',
        value: '1',
      },
      {
        label: 'Join Code',
        id: 'create-join-code',
        name: 'join_code',
        min_length: '6',
        max_length: '6',
      },
      {
        label: 'Start Date',
        id: 'start-date',
        name: 'start_date',
        type: 'date',
      },
      {
        label: 'End Date',
        id: 'end-date',
        name: 'end_date',
        type: 'date',
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
      if (field.min_length) input.setAttribute('minlength', field.min_length);
      if (field.max_length) input.setAttribute('maxlength', field.max_length);
      input.setAttribute('required', '');

      label.appendChild(input);
      form.appendChild(label);
    });

    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.slot = 'buttons';
    submitButton.innerText = 'Create Course';

    form.appendChild(submitButton);
    this.appendChild(form);

    this.form = form;
    this.form.addEventListener('submit', this.boundedHandleSubmit);
  }

  getFormValues() {
    const inputs = this.form.querySelectorAll('input');
    const values = {};
    inputs.forEach((input) => {
      values[input.name] = input.value;
    });
    return values;
  }

  async handleSubmit(event) {
    event.preventDefault();

    try {
      const formValues = this.getFormValues();

      const response = await fetch(`/api/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formValues),
      });

      if (!response.ok || response.status != 201) {
        return;
      }

      const result = await response.json();
      window.location.href = `/course/${result.id}/dashboard`;

    } catch (err) {
      console.log('Error: ' + err.message);
    }
  }

  disconnectedCallback() {
    this.form.removeEventListener('submit', this.boundedHandleSubmit);
  }
}

customElements.define('create-course-form', CreateCourseForm);
