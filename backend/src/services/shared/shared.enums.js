const GlobalRoles = {
  ADMIN: 'admin',
  PROFESSOR: 'professor',
  STUDENT: 'student',
};

const CourseRoles = {
  PROFESSOR: 'professor',
  TA: 'ta',
  TUTOR: 'tutor',
  TEAM_LEAD: 'team_lead',
  STUDENT: 'student',
};

function isValidEnumValue(enumObj, value) {
  return Object.values(enumObj).includes(value);
}

module.exports = {
  GlobalRoles,
  CourseRoles,
  isValidEnumValue,
};
