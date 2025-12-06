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

module.exports = {
  mapUserAndEnrollmentToCourseUser,
};
