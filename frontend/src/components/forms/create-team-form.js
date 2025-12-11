import { ConductorForm } from '/src/components/forms/conductor-form.js';
import { createTeam } from '/src/js/api/team.js';
import { getCachedCourseId } from '/src/js/utils/cache-utils.js';

/**
 * CreateTeamForm Web Component
 * ------------------------------
 * A form for creating a new team in a course.
 *
 * On submission, the component performs:
 *  1. POST /api/courses/:course_id/teams
 *
 * @extends ConductorForm
 *
 * @example
 * <create-team-form></create-team-form>
 */
class CreateTeamForm extends ConductorForm {
  get fields() {
    return [
      {
        label: 'Team Name',
        id: 'team-name',
        name: 'name',
        type: 'text',
      },
      {
        label: 'Description',
        id: 'team-description',
        name: 'description',
        type: 'textarea',
      },
    ];
  }

  get submitLabel() {
    return 'Create Team';
  }

  async onSubmit(values) {
    const courseId = getCachedCourseId();
    await createTeam(courseId, {
      name: values.name,
      description: values.description || null,
    });
    this.form.reset();
    // Close modal if parent is a modal
    const modal = this.closest('modal-component');
    if (modal) {
      modal.close();
    }
    // Dispatch event to refresh teams list
    this.dispatchEvent(new CustomEvent('team-created', { bubbles: true }));
  }
}

customElements.define('create-team-form', CreateTeamForm);
