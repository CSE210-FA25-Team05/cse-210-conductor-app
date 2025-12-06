import { ConductorForm } from '/src/components/forms/conductor-form.js';

/**
 * NewInteractionForm Web Component
 * --------------------------------
 * A form for logging a new interaction, including:
 *  - emotion_marker (radio buttons: Positive, Neutral, Negative)
 *  - participants (search bar)
 *  - description (textarea)
 *
 * On submission:
 *  1. Sends POST /api/interactions with form data
 *  2. Optionally resets form or handles navigation
 *
 * @extends ConductorForm
 *
 * @example
 * <new-interaction-form></new-interaction-form>
 */
class CreateLectureForm extends ConductorForm {
  get fields() {
    return [
      {
        label: 'Emotion Marker',
        id: 'emotion-marker',
        name: 'emotion_marker',
        type: 'radio-group',
        options: [
          { label: 'Positive', value: 'positive' },
          { label: 'Neutral', value: 'neutral' },
          { label: 'Negative', value: 'negative' },
        ],
      },
    ];
  }

  get submitLabel() {
    return 'Submit';
  }

  async onSubmit(values) {
    console.log('HERE', values);
  }
}

customElements.define('create-lecture-form', CreateLectureForm);
