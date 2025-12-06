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
  // TODO: Build fields dynamically from config
  get fields() {
    return [
      {
        label: 'How do you feel?',
        name: 'pulse',
        id: 'pulse',
        type: 'radio-group',
        options: [
          { label: 'Happy', value: 'Happy', color: 'green', id: 'happy' },
          {
            label: 'Stressed',
            value: 'Stressed',
            color: 'red',
            id: 'stressed',
          },
          { label: 'Neutral', value: 'Neutral', color: 'gray', id: 'neutral' },
        ],
      },
      {
        label: 'Description:',
        id: 'pulse-description',
        name: 'pulse_description',
        type: 'textarea',
      },
    ];
  }

  async onSubmit(values) {
    const body = {
      option: values.pulse,
      description: values.pulse_description,
    };
    console.log('BODY: ', body);

    const response = await fetch(`/api/courses/${getCachedCourseId()}/pulses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message);
    this.form.reset();
  }
}

customElements.define('pulse-form', PulseForm);
