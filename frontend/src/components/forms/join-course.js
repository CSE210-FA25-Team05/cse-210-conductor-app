import { ConductorForm } from '/src/components/forms/conductor-form.js';
import { cacheCourses, getUserId } from '/src/js/utils/cache-utils.js';

/**
 * JoinCourseForm Web Component
 * ----------------------------
 * A form for joining an existing course. Extends BaseForm and handles:
 *
 * Fields:
 *  - course_id
 *  - course_code (the join code)
 *
 * Submission flow:
 *  1. GET /api/me/profile to determine the current user ID
 *  2. POST /api/courses/:id/join with the user's ID and join code
 *  3. Redirects to /course/:id/dashboard on success
 *
 * @extends BaseForm
 *
 * @example
 * <join-course-form></join-course-form>
 */
class JoinCourseForm extends ConductorForm {
  get fields() {
    return [
      { label: 'Course ID', id: 'join-course-id', name: 'course_id' },
      {
        label: 'Join Code',
        id: 'join-course-code',
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
    const joinRes = await fetch(`/api/courses/${values.course_id}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: getUserId(),
        join_code: values.course_code,
      }),
    });

    let result = {};
    const text = await joinRes.text();
    if (text) {
      result = JSON.parse(text);
    }

    if (!joinRes.ok) throw new Error(result.message);

    cacheCourses(); // Update cache
    window.location.href = `/course/${values.course_id}/dashboard`;
  }
}

customElements.define('join-course-form', JoinCourseForm);
