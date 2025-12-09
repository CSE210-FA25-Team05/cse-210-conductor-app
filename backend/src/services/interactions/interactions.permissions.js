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

    // Team leads can view interactions of their team members
    // Note: interactions don't have team_id, so this would need participant filtering

    // Anyone can only view their own interactions
    if (filters.author_id != null) {
      return filters.author_id === user.id;
    }

    return false;
  }
}

module.exports = InteractionPermissions;
