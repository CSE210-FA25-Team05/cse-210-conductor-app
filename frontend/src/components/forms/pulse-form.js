import { ConductorForm } from '/src/components/forms/conductor-form.js';
import { createPulseInCourse } from '/src/js/api/pulse.js';
import {
  getCachedCourseId,
  getCachedPulseConfig,
} from '/src/js/utils/cache-utils.js';

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
  get fields() {
    // Build fields dynamically from config
    const fields = [];
    const config = getCachedPulseConfig(getCachedCourseId());
    const options = config?.config?.options;
    if (options) {
      let fieldOptions = [];
      for (const opt of options) {
        fieldOptions.push({
          label: opt.value,
          value: opt.value,
          color: opt.color,
          id: opt.value,
        });
      }

      fields.push({
        label: 'How do you feel?',
        name: 'pulse',
        id: 'pulse',
        type: 'radio-group',
        options: fieldOptions,
      });
    } else {
      // Fallback if no config
      fields.push({
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
      });
    }

    fields.push({
      label: 'Description:',
      id: 'pulse-description',
      name: 'pulse_description',
      type: 'textarea',
    });

    return fields;
  }

  async onSubmit(values) {
    const body = {
      option: values.pulse,
      description: values.pulse_description,
    };

    createPulseInCourse(getCachedCourseId(), body);
    this.form.reset();
  }
}

customElements.define('pulse-form', PulseForm);
