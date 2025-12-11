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

// Role hierarchy: higher index = higher privilege
const CourseRoleHierarchy = [
  CourseRoles.STUDENT,
  CourseRoles.TEAM_LEAD,
  CourseRoles.TUTOR,
  CourseRoles.TA,
  CourseRoles.PROFESSOR,
];

/**
 * Check if role1 has higher or equal privilege than role2.
 * @param {string} role1 - First role
 * @param {string} role2 - Second role
 * @returns {boolean} True if role1 >= role2 in hierarchy
 */
function hasHigherOrEqualPrivilege(role1, role2) {
  const index1 = CourseRoleHierarchy.indexOf(role1);
  const index2 = CourseRoleHierarchy.indexOf(role2);
  if (index1 === -1 || index2 === -1) {
    throw new Error(`Invalid role for comparison: ${role1} or ${role2}`);
  }
  return index1 - index2 >= 0;
}

function hasStrictlyHigherPrivilege(role1, role2) {
  const index1 = CourseRoleHierarchy.indexOf(role1);
  const index2 = CourseRoleHierarchy.indexOf(role2);
  if (index1 === -1 || index2 === -1) {
    throw new Error(`Invalid role for comparison: ${role1} or ${role2}`);
  }
  return index1 - index2 > 0;
}

function isValidEnumValue(enumObj, value) {
  return Object.values(enumObj).includes(value);
}

module.exports = {
  GlobalRoles,
  CourseRoles,
  isValidEnumValue,
  hasHigherOrEqualPrivilege,
  hasStrictlyHigherPrivilege,
};
