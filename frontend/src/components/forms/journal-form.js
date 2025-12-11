import { ConductorForm } from '/src/components/forms/conductor-form.js';
import { getCachedCourseId, getUserId } from '/src/js/utils/cache-utils.js';
import { createJournalEntry } from '/src/js/api/journal.js';

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
    const body = {
      title: values.journal_title,
      content: values.journal_content,
      user_id: getUserId(),
    };
    createJournalEntry(getCachedCourseId(), body);
    this.form.reset();
  }
}

customElements.define('journal-form', JournalForm);
