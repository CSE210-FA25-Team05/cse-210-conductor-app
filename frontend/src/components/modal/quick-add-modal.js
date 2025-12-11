import { FormModal } from '/src/components/modal/form-modal.js';
import { getUserRole } from '/src/js/utils/cache-utils.js';
import '/src/components/forms/pulse-form.js';
import '/src/components/forms/interaction-form.js';
import '/src/components/forms/create-lecture-form.js';
import '/src/components/forms/journal-form.js';

/**
 * QuickAddModal Web Component
 * -----------------------
 * A reusable modal interface that wraps formModal. It adds forms for
 * Interactions, Pulses,
 *
 * Structure:
 *  - Wraps `<form-modal>`.
 *
 * Behavior:
 *  - `open()` opens the modal.
 *  - `close()` closes the modal.
 *
 * @extends FormModal
 *
 * @example
 * <quick-add-modal></quick-add-modal>
 *
 */
class QuickAddModal extends FormModal {
  constructor() {
    super();
  }

  connectedCallback() {
    // Get user role to conditionally show lecture form
    const role = getUserRole();
    const isStudent = role === 'student' || role === 'team_lead';

    //Lectures - only show for professors and TAs
    if (!isStudent) {
      const lectureSection = document.createElement('form-section');
      const lectureForm = document.createElement('create-lecture-form');
      lectureSection.setAttribute('tag', 'New Lecture');
      lectureSection.appendChild(lectureForm);
      this.appendChild(lectureSection);
    }

    // Pulse
    const pulseSection = document.createElement('form-section');
    const pulseForm = document.createElement('pulse-form');
    pulseSection.setAttribute('tag', 'New Pulse');
    pulseSection.appendChild(pulseForm);

    // Interactions
    const interactionSection = document.createElement('form-section');
    const interactionForm = document.createElement('interaction-form');
    interactionSection.setAttribute('tag', 'New Interaction');
    interactionSection.appendChild(interactionForm);

    // Journal
    const journalSection = document.createElement('form-section');
    const journalForm = document.createElement('journal-form');
    journalSection.setAttribute('tag', 'New Journal');
    journalSection.appendChild(journalForm);

    this.appendChild(pulseSection);
    this.appendChild(interactionSection);
    this.appendChild(journalSection);

    super.connectedCallback();
  }
}

customElements.define('quick-add-modal', QuickAddModal);
