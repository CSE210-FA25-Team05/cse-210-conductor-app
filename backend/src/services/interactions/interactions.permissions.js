const { CourseRoles } = require('../shared/shared.enums');

class InteractionPermissions {
  constructor(interactionRepo) {
    this.interactionRepo = interactionRepo;
  }

  canViewInteractions(user, enrollment, filters) {
    // Professors and TAs can view all interactions
    if (
      enrollment.role === CourseRoles.PROFESSOR ||
      enrollment.role === CourseRoles.TA
    ) {
      return true;
    }

    // Anyone can only view their own interactions
    if (filters.author_id != null) {
      return filters.author_id === user.id;
    }

    return false;
  }

  canUpdateInteraction(user, _enrollment, interaction) {
    // Authors can update their own interactions
    if (interaction.author_id === user.id) {
      return true;
    }

    return false;
  }

  canDeleteInteraction(user, _enrollment, interaction) {
    // Authors can delete their own interactions
    if (interaction.author_id === user.id) {
      return true;
    }

    return false;
  }
}

module.exports = InteractionPermissions;
