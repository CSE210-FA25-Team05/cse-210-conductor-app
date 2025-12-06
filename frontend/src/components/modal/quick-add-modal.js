import { FormModal } from '/src/components/modal/form-modal.js';
import '/src/components/forms/pulse-form.js';
import '/src/components/forms/interaction-form.js';
import '/src/components/forms/create-lecture-form.js';

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
    //Lectures
    const lectureSection = document.createElement('form-section');
    const lectureForm = document.createElement('create-lecture-form');
    lectureSection.setAttribute('tag', 'New Lecture');
    lectureSection.appendChild(lectureForm);

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

    this.appendChild(lectureSection);
    this.appendChild(pulseSection);
    this.appendChild(interactionSection);

    super.connectedCallback();
  }
}

customElements.define('quick-add-modal', QuickAddModal);
