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

  constructor() {
    super();
  }
  get fields() {
    return [
      {
        label: 'Title',
        id: 'journal-title',
        name: 'journal_title',
        type: 'text',
      }, 
      {
        label: 'Content',
        id: 'journal-content',
        name: 'journal_content',
        type: 'textarea',
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
