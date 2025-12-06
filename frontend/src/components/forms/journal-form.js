import { ConductorForm } from '/src/components/forms/conductor-form.js';

/**
 * JournalForm Web Component
 * --------------------------------
 * A form for logging a new journal entry:
 *
 * On submission:
 *  1. Sends POST /{NotImplementedError}
 *
 * @extends ConductorForm
 *
 * @example
 * <journal-form></journal-form>
 */
class JournalForm extends ConductorForm {
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
    console.log('Submit journal', values);
  }
}

customElements.define('journal-form', JournalForm);
