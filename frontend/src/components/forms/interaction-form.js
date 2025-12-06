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
        label: 'How was this interaction?',
        name: 'interaction',
        id: 'interaction',
        type: 'radio-group',
        options: [
          {
            label: 'Negative',
            value: 'Negative',
            color: 'red',
            id: 'negative',
          },
          { label: 'Neutral', value: 'Neutral', color: 'gray', id: 'neutral' },
          {
            label: 'Positive',
            value: 'Positive',
            color: 'green',
            id: 'positive',
          },
        ],
      },
      {
        label: 'Description:',
        id: 'interaction-description',
        name: 'interaction_description',
        type: 'textarea',
      },
    ];
  }

  get submitLabel() {
    return 'Submit';
  }

  async onSubmit(values) {
    console.log('Submit interaction', values);
    this.form.reset();
  }
}

customElements.define('interaction-form', InteractionForm);
