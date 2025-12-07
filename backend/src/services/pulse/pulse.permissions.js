const { CourseRoles } = require('../shared/shared.enums');

class PulsePermissions {
  constructor(pulseRepo) {
    this.pulseRepo = pulseRepo;
  }

  canViewPulses(user, enrollment, filters) {
    // Professors and TAs can view all pulses
    if (
      enrollment.role === CourseRoles.PROFESSOR ||
      enrollment.role === CourseRoles.TA
    ) {
      return true;
    }

    // Team leads can view pulses of their team members
    if (filters.team_id != null) {
      if (
        enrollment.role === CourseRoles.TEAM_LEAD &&
        filters.team_id === enrollment.team_id
      ) {
        return true;
      }
    }

    // Anyone can only view their own pulses
    if (filters.user_id != null) {
      return filters.user_id === user.id;
    }

    return false;
  }
}

module.exports = PulsePermissions;
