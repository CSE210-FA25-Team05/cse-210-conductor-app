import { ConductorForm } from '/src/components/forms/conductor-form.js';

/**
 * NewInteractionForm Web Component
 * --------------------------------
 * A form for logging a new interaction
 *
 * On submission:
 *  1. Sends POST /api/{TODO: NotImplemented}
 *
 * @extends ConductorForm
 *
 * @example
 * <new-interaction-form></new-interaction-form>
 */
class InteractionForm extends ConductorForm {
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
    console.log('Submit interaction', values);
  }
}

customElements.define('interaction-form', InteractionForm);
