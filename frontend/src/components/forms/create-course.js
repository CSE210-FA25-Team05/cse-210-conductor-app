import { ConductorForm } from '/src/components/forms/conductor-form.js';

class CreateCourseForm extends ConductorForm {
  get fields() {
    return [
      { label: 'Course Code', id: 'course-code', name: 'course_code' },
      { label: 'Course Name', id: 'course-name', name: 'course_name' },
      { label: 'Term', id: 'term', name: 'term' },
      { label: 'Section', id: 'section', name: 'section', value: '1' },
      {
        label: 'Join Code',
        id: 'join',
        name: 'join_code',
        min_length: 6,
        max_length: 6,
      },
      { label: 'Start Date', id: 'start', name: 'start_date', type: 'date' },
      { label: 'End Date', id: 'end', name: 'end_date', type: 'date' },
    ];
  }

  get submitLabel() {
    return 'Create Course';
  }

  async onSubmit(values) {
    const response = await fetch(`/api/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message);

    window.location.href = `/course/${result.id}/dashboard`;
  }
}

customElements.define('create-course-form', CreateCourseForm);
