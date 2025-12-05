import { ConductorForm } from '/src/components/forms/conductor-form.js';

class JoinCourseForm extends ConductorForm {
  get fields() {
    return [
      { label: 'Course ID', id: 'course-id', name: 'course_id' },
      {
        label: 'Join Code',
        id: 'course-code',
        name: 'course_code',
        min_length: 6,
        max_length: 6,
      },
    ];
  }

  get submitLabel() {
    return 'Join Course';
  }

  async onSubmit(values) {
    const profileRes = await fetch(`/api/me/profile`, {
      method: 'GET',
      credentials: 'include',
    });
    const profile = await profileRes.json();

    const joinRes = await fetch(`/api/courses/${values.course_id}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: profile.id,
        join_code: values.course_code,
      }),
    });

    const result = await joinRes.json();
    if (!joinRes.ok) throw new Error(result.message);

    window.location.href = `/course/${values.course_id}/dashboard`;
  }
}

customElements.define('join-course-form', JoinCourseForm);
