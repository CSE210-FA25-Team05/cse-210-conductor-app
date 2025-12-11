import { ConductorForm } from '/src/components/forms/conductor-form.js';
import { addUserInCourse } from '/src/js/api/course.js';
import { getCachedCourseId } from '/src/js/utils/cache-utils.js';

/**
 * AddUserForm Web Component
 * ------------------------------
 * A form for adding a user to a course.
 *
 * On submission, the component performs:
 *  1. POST /api/courses/courses_id/user
 *
 * @extends ConductorForm
 *
 * @example
 * <add-user-form></add-user-form>
 */
class AddUserForm extends ConductorForm {
  get fields() {
    return [
      {
        label: 'Email',
        name: 'user_email',
        id: 'user-email',
        type: 'email',
      },
    ];
  }

  async onSubmit(values) {
    addUserInCourse(getCachedCourseId(), { user_email: values.user_email });
    this.form.reset();
  }
}

customElements.define('add-user-form', AddUserForm);
