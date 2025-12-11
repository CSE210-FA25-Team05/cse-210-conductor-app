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
  /**
   * Defines the form fields for the add user form.
   * @returns {Array<Object>} Array containing the email field configuration.
   */
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

  /**
   * Handles form submission by adding a user to the current course.
   * Calls the API to add the user and resets the form after submission.
   * @async
   * @param {Object} values - The form values containing the user's email.
   * @param {string} values.user_email - The email address of the user to add.
   * @returns {Promise<void>}
   */
  async onSubmit(values) {
    addUserInCourse(getCachedCourseId(), { user_email: values.user_email });
    this.form.reset();
  }
}

customElements.define('add-user-form', AddUserForm);
