import { addTeamMembers } from '/src/js/api/team.js';
import { getAllUsersInCourse } from '/src/js/api/course.js';
import { getCachedCourseId } from '/src/js/utils/cache-utils.js';

/**
 * AssignMembersForm Web Component
 * ------------------------------
 * A form for assigning members to a team.
 *
 * @extends HTMLElement
 *
 * @example
 * <assign-members-form></assign-members-form>
 */
class AssignMembersForm extends HTMLElement {
  constructor() {
    super();
    this.courseId = null;
    this.teams = [];
    this.members = [];
    this.selectedTeamId = null;
  }

  connectedCallback() {
    this.courseId = getCachedCourseId();
    this.render();
    this.loadData();
  }

  async loadData() {
    try {
      // Load all users in course for member selection
      this.members = await getAllUsersInCourse(this.courseId);
      // Render after loading members (teams may already be set)
      this.render();
    } catch (error) {
      console.error('Error loading members:', error);
      this.displayError(error.message);
    }
  }

  setTeams(teams) {
    this.teams = teams || [];
    // Only render if we have courseId (form is initialized)
    if (this.courseId) {
      this.render();
    }
  }
  
  setTeamId(teamId) {
    this.selectedTeamId = teamId;
    if (this.courseId) {
      this.render();
    }
  }
  
  setTeamName(teamName) {
    this.selectedTeamName = teamName;
  }

  displayError(message) {
    const errorDiv = this.querySelector('.error-message');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
    }
  }

  render() {
    if (!this.courseId) return;

    this.innerHTML = `
      <div class="error-message" style="display: none; color: var(--color-error); margin-bottom: var(--spacing-medium); padding: var(--spacing-small); background-color: var(--color-error-light); border-radius: var(--border-radius);"></div>
      <form id="assign-members-form-internal">
        ${this.selectedTeamId ? `
          <div style="margin-bottom: var(--spacing-medium); padding: var(--spacing-small); background-color: var(--color-bg-light); border-radius: var(--border-radius);">
            <strong>Team:</strong> ${this.selectedTeamName || `Team ${this.selectedTeamId}`}
          </div>
          <input type="hidden" name="team_id" value="${this.selectedTeamId}" />
        ` : `
          <label for="team-select">
            Select Team
            <select id="team-select" name="team_id" required style="width: 100%; padding: var(--spacing-small); margin-top: var(--spacing-small); border: var(--border-form); border-radius: var(--border-radius); background-color: var(--color-bg-white);">
              <option value="">-- Select a team --</option>
              ${this.teams.length > 0 ? this.teams.map(team => `
                <option value="${team.id}">${team.name}</option>
              `).join('') : '<option value="" disabled>No teams available</option>'}
            </select>
          </label>
        `}
        <label style="margin-top: var(--spacing-medium);">
          Select Members
          <div id="members-list" style="max-height: 300px; overflow-y: auto; border: var(--border-form); border-radius: var(--border-radius); padding: var(--spacing-small); margin-top: var(--spacing-small); background-color: var(--color-bg-white);">
            ${this.members.length > 0 ? this.members.map(member => `
              <label style="display: block; padding: var(--spacing-small); ${member.team_id ? 'opacity: 0.6;' : ''} cursor: ${member.team_id ? 'not-allowed' : 'pointer'}; border-radius: var(--border-radius);">
                <input type="checkbox" name="member_ids" value="${member.id}" ${member.team_id ? 'disabled' : ''} style="margin-right: var(--spacing-small);" />
                ${member.user_first_name} ${member.user_last_name} <span style="color: var(--color-text-secondary);">(${member.user_email})</span>
                ${member.team_id ? `<span style="color: var(--color-text-secondary); font-size: var(--fs-50);"> - Already assigned to a team</span>` : ''}
              </label>
            `).join('') : '<p style="color: var(--color-text-secondary); padding: var(--spacing-small);">Loading members...</p>'}
          </div>
        </label>
        <button type="submit" style="margin-top: var(--spacing-medium);">Assign Members</button>
      </form>
    `;

    // Attach event listener to the form
    const form = this.querySelector('#assign-members-form-internal');
    if (form) {
      // Remove old listener if it exists
      form.removeEventListener('submit', this.handleSubmit);
      // Add new listener
      form.addEventListener('submit', this.handleSubmit.bind(this));
    }
  }

  async handleSubmit(e) {
    e.preventDefault();
    const form = e.target.closest('form') || e.target;
    const formData = new FormData(form);
    // Use selectedTeamId if set, otherwise get from form
    const teamId = this.selectedTeamId || parseInt(formData.get('team_id'));
    const memberIds = formData.getAll('member_ids').map(id => parseInt(id));

    if (!teamId) {
      this.displayError('Please select a team');
      return;
    }

    if (memberIds.length === 0) {
      this.displayError('Please select at least one member');
      return;
    }

    try {
      // Format members as {id, role} array
      // Note: memberIds are enrollment IDs, but API expects user_id
      const members = memberIds.map(enrollmentId => {
        const member = this.members.find(m => m.id === enrollmentId);
        if (!member) {
          throw new Error(`Member with enrollment ID ${enrollmentId} not found`);
        }
        return {
          id: member.user_id, // API expects user_id, not enrollment id
          role: member.role || null
        };
      });

      await addTeamMembers(this.courseId, teamId, members);
      form.reset();
      this.displayError(''); // Clear error
      // Clear selected team after successful assignment
      this.selectedTeamId = null;
      this.selectedTeamName = null;
      // Close modal if parent is a modal
      const modal = this.closest('modal-component');
      if (modal) {
        modal.close();
      }
      // Dispatch event to refresh teams list
      this.dispatchEvent(new CustomEvent('members-assigned', { bubbles: true }));
    } catch (error) {
      console.error('Error assigning members:', error);
      this.displayError(error.message || 'Failed to assign members');
    }
  }
}

customElements.define('assign-members-form', AssignMembersForm);

