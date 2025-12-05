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
        min_length: '6',
        max_length: '6',
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
    submitButton.innerText = 'Join Course';

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

      let response = await fetch(`/api/me/profile`, {
        method: 'GET',
        credentials: 'include',
      });
      const json = await response.json();
      const userId = json.id;

      response = await fetch(`/api/courses/${formValues.course_id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: parseInt(userId),
          join_code: formValues.course_code,
        }),
      });

      if (!response.ok || response.status != 201) {
        return;
      }

      window.location.href = `/course/${formValues.course_id}/dashboard`;
    } catch (err) {
      console.log('Error: ' + err.message);
    }
  }

  disconnectedCallback() {
    this.form.removeEventListener('submit', this.boundedHandleSubmit);
  }
}

customElements.define('join-course-form', JoinCourseForm);
