import { ConductorForm } from '/src/components/forms/conductor-form.js';
import { updateUserEnrollmentInCourse } from '/src/js/api/course.js';
import {
  getCachedCourseId,
  getCachedUsers,
  cacheUsersInCourse,
} from '/src/js/utils/cache-utils.js';

class EditUserForm extends ConductorForm {
  get fields() {
    return [
      {
        label: 'Email',
        name: 'email',
        id: 'email',
        type: 'email',
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
    let students = await cacheUsersInCourse(getCachedCourseId());
    let user_id;
    for (let i = 0; i < students.length; i++) {
      if (students[i].user_email === values.email) {
        user_id = students[i].user_id;
        break;
      }
    }

    updateUserEnrollmentInCourse(getCachedCourseId(), user_id, {
      role: values.role.trim().toLowerCase(),
    });
    this.form.reset();
    window.location.reload();
  }
}

customElements.define('edit-user-form', EditUserForm);
