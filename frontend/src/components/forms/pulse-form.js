import { ConductorForm } from '/src/components/forms/conductor-form.js';

/**
 * CreateCourseForm Web Component
 * ------------------------------
 * A form for creating a new course. Extends BaseForm and defines
 * all fields required to create a course.
 *
 * Fields include:
 *  - course_code
 *  - course_name
 *  - term
 *  - section
 *  - join_code
 *  - start_date
 *  - end_date
 *
 * On submission, the component performs:
 *  1. POST /api/courses with the collected form data
 *  2. Redirects to /course/:id/dashboard on success
 *
 * @extends ConductorForm
 *
 * @example
 * <create-course-form></create-course-form>
 */
class PulseForm extends ConductorForm {
  get fields() {
    return [{ label: 'Course Code', id: 'course-code', name: 'course_code' }];
  }

  get submitLabel() {
    return 'Submit';
  }

  async onSubmit(values) {
    console.log('Submit pulse', values);
  }
}

customElements.define('pulse-form', PulseForm);
