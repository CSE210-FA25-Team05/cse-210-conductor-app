class PulsePermissions {
  constructor(pulseRepo) {
    this.pulseRepo = pulseRepo;
  }

  canViewPulses(user, enrollment, filters) {
    // Professors and TAs can view all pulses
    if (enrollment.role === 'professor' || enrollment.role === 'ta') {
      return true;
    }

    // Team leads can view pulses of their team members
    if (filters.team_id != null) {
      if (
        enrollment.role === 'team_lead' &&
        filters.team_id === enrollment.team_id
      ) {
        return true;
      }
    }

    // Students can only view their own pulses
    if (enrollment.role === 'student') {
      if (filters.user_id != null) {
        return filters.user_id === user.id;
      }
    }

    return false;
  }
}

module.exports = PulsePermissions;
