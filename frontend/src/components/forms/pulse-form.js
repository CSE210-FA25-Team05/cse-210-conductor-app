import { ConductorForm } from '/src/components/forms/conductor-form.js';
import { getCachedCourseId } from '/src/js/utils/cache-utils.js';

/**
 * PulseForm Web Component
 * ------------------------------
 * A form for creating a new Pulse.
 *
 * First, calls GET /api/courses/course_id/pulses/config
 * to get the pulse config. Then, dynamically sets the
 * form elements.
 *
 * On submission, the component performs:
 *  1. POST /api/courses_id/pulses
 *
 * @extends ConductorForm
 *
 * @example
 * <pulse-form></pulse-form>
 */
class PulseForm extends ConductorForm {
  constructor() {
    super();
    this.config = null;
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  // TODO: Build fields dynamically from config
  get fields() {
    return [
      {
        label: 'How do you feel?',
        name: 'pulses',
        type: 'radio-group',
        options: [
          { label: 'Happy', value: 'happy', color: 'green' },
          { label: 'Stressed', value: 'stressed', color: 'red' },
          { label: 'Neutral', value: 'neutral', color: 'gray' },
        ],
      },
      {
        label: 'Description',
        id: 'description',
        name: 'description',
        type: 'textarea',
      },
    ];
  }

  get submitLabel() {
    return 'Submit';
  }

  async onSubmit(values) {
    console.log('Submit pulse', values);

    const body = {
      option: values.option,
      description: values.description,
    };

    alert('Body:', values, body);
  }

  getFormValues() {
    const values = super.getFormValues();
    if (this.description) values.description = this.description.value;
    alert(values);
    return values;
  }
}

customElements.define('pulse-form', PulseForm);
