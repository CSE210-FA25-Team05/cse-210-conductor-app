function mapUserAndEnrollmentToCourseUser(user, enrollment) {
  return {
    id: enrollment.id,
    user_id: user.id,
    course_id: enrollment.course_id,
    user_email: user.email,
    user_first_name: user.first_name,
    user_last_name: user.last_name,
    team_id: enrollment.team_id,
    role: enrollment.role,
    created_at: enrollment.created_at,
  };
}

/**
 * Map a TA user + ta_teams row into a flat TA assignment object.
 *
 * Mirrors the pattern of mapUserAndEnrollmentToCourseUser.
 *
 * @param {Object} user   - TA user row (from users table)
 * @param {Object} taTeam - ta_teams row
 */
function mapUserAndTaTeamToTaAssignment(user, taTeam) {
  return {
    id: taTeam.id,
    course_id: taTeam.course_id,
    team_id: taTeam.team_id,
    user_id: user.id,
    user_email: user.email,
    user_first_name: user.first_name,
    user_last_name: user.last_name,
    assigned_at: taTeam.created_at,
  };
}

module.exports = {
  mapUserAndEnrollmentToCourseUser,
  mapUserAndTaTeamToTaAssignment,
};
