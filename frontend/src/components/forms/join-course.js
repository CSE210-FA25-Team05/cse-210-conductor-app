import { ConductorForm } from '/src/components/forms/conductor-form.js';
import { cacheCourses, getUserId } from '/src/js/utils/cache-utils.js';
import { joinCourseWithCode } from '/src/js/api/course.js';

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
 * @extends ConductorForm
 *
 * @example
 * <join-course-form></join-course-form>
 */
class JoinCourseForm extends ConductorForm {
  get fields() {
    return [
      {
        label: 'Join Code',
        id: 'join-course-code',
        name: 'join_code',
        min_length: 6,
        max_length: 6,
      },
    ];
  }

  get submitLabel() {
    return 'Join Course';
  }

  async onSubmit(values) {
    const result = await joinCourseWithCode({
      user_id: getUserId(),
      join_code: values.join_code,
    });

    // Update cache
    await cacheCourses();

    // Redirect to the course dashboard using the course_id from the response
    if (result && result.course_id) {
      window.location.href = `/course/${result.course_id}/dashboard`;
    } else {
      // Fallback: refresh the page to show the new course in the list
      window.location.href = '/courses';
    }
  }
}

customElements.define('join-course-form', JoinCourseForm);
