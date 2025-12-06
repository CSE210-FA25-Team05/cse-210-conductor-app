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
        id: 'pulses',
        type: 'radio-group',
        options: [
          { label: 'Happy', value: 'happy', color: 'green', id: 'happy' },
          {
            label: 'Stressed',
            value: 'stressed',
            color: 'red',
            id: 'stressed',
          },
          { label: 'Neutral', value: 'neutral', color: 'gray', id: 'neutral' },
        ],
      },
      {
        label: 'Description',
        id: 'pulse-description',
        name: 'puluse_description',
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
  }
}

customElements.define('pulse-form', PulseForm);
