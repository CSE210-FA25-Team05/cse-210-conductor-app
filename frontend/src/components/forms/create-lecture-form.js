import { ConductorForm } from '/src/components/forms/conductor-form.js';

/**
 * CreateLectureForm Web Component
 * --------------------------------
 * A form for creating a new form, including:
 *
 * On submission:
 *  1. Sends POST /api/course/course_id/lectures
 *
 * @extends ConductorForm
 *
 * @example
 * <create-lecture-form></create-lecture-form>
 */
class CreateLectureForm extends ConductorForm {
  get fields() {
    return [
      {
        label: 'Lecture Date',
        id: 'lecture-date',
        name: 'lecture_date',
        type: 'date',
      },
    ];
  }

  get submitLabel() {
    return 'Submit';
  }

  async onSubmit(values) {
    console.log('HERE', values);
    this.form.reset();
  }
}

customElements.define('create-lecture-form', CreateLectureForm);
