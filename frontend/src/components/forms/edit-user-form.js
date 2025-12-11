import { ConductorForm } from '/src/components/forms/conductor-form.js';
import { updateUserEnrollmentInCourse } from '/src/js/api/course.js';
import { getCachedCourseId } from '/src/js/utils/cache-utils.js';

class EditUserForm extends ConductorForm {
  get fields() {
    return [
      {
        label: 'User ID',
        name: 'user_id',
        id: 'user_id',
        type: 'number',
      },
      {
        label: 'Role',
        name: 'role',
        id: 'role',
        type: 'text',
      },
    ];
  }

  async onSubmit(values) {
    updateUserEnrollmentInCourse(
      getCachedCourseId(),
      parseInt(values.user_id),
      { role: values.role }
    );
    this.form.reset();
  }
}

customElements.define('edit-user-form', EditUserForm);
