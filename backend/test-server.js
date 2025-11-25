// scripts/test-create-course.js
/* eslint-disable no-console */
const BASE_URL = process.env.BASE_URL || 'http://localhost:3001/api';
const AUTH = process.env.AUTH_TOKEN || ''; // optional, if you have auth

function headers() {
  const h = { 'Content-Type': 'application/json' };
  if (AUTH) h['Authorization'] = AUTH;
  return h;
}

async function addCourseTest() {
  const course = {
    course_code: 'CSE291',
    course_name: 'AI Agent',
    term: 'SP25',
    section: 'A00',
    start_date: '2025-03-31T00:00:00.000Z',
    end_date: '2025-06-15T00:00:00.000Z',
  };

  console.log('Creating new course...');
  const res = await fetch(`${BASE_URL}/courses`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(course),
  });

  console.log('Status:', res.status);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  console.log('Response:', data);

  if (res.ok) {
    console.log(`Course created successfully (id=${data.id})`);
  } else {
    console.error('Course creation failed');
    process.exit(1);
  }
}

// delete course by id
async function deleteCourse(courseId) {
  console.log(`Deleting course id=${courseId}...`);
  const res = await fetch(`${BASE_URL}/courses/${courseId}`, {
    method: 'DELETE',
    headers: headers(),
    body: JSON.stringify({}),
  });

  console.log('Status:', res.status);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  console.log('Response:', data);

  if (res.ok) {
    console.log(`Course id=${courseId} deleted successfully`);
  } else {
    console.error(`Failed to delete course id=${courseId}`);
  }
}

// update course test
async function updateCourseTest(courseId, updateData) {
  console.log(`Updating course id=${courseId}...`);
  const res = await fetch(`${BASE_URL}/courses/${courseId}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(updateData),
  });

  console.log('Status:', res.status);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  console.log('Response:', data);

  if (res.ok) {
    console.log(`Course id=${courseId} updated successfully`);
  } else {
    console.error(`Failed to update course id=${courseId}`);
  }
}

// get all courses test
async function getAllCoursesTest() {
  console.log('Fetching all courses...');
  const res = await fetch(`${BASE_URL}/courses`, {
    method: 'GET',
    headers: headers(),
  });

  console.log('Status:', res.status);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  console.log('Response:', data);

  if (res.ok) {
    console.log(`Fetched ${data.length} courses successfully`);
  } else {
    console.error('Failed to fetch courses');
  }
}

// get all user in a course test
async function getAllUsersInCourseTest(courseId) {
  console.log(`Fetching all users in course id=${courseId}...`);
  const res = await fetch(`${BASE_URL}/courses/${courseId}/users`, {
    method: 'GET',
    headers: headers(),
  });

  console.log('Status:', res.status);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  console.log('Response:', data);

  if (res.ok) {
    console.log(
      `Fetched ${data.length} users in course id=${courseId} successfully`
    );
  } else {
    console.error(`Failed to fetch users in course id=${courseId}`);
  }
}

//get specific user in a course test
async function getUserDetailsInCourseTest(courseId, userId) {
  console.log(`Fetching user id=${userId} in course id=${courseId}...`);
  const res = await fetch(`${BASE_URL}/courses/${courseId}/users/${userId}`, {
    method: 'GET',
    headers: headers(),
  });

  console.log('Status:', res.status);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  console.log('Response:', data);

  if (res.ok) {
    console.log(
      `Fetched user id=${userId} in course id=${courseId} successfully`
    );
  } else {
    console.error(`Failed to fetch user id=${userId} in course id=${courseId}`);
  }
}

// add user to course test
async function addUserToCourseTest(courseId, userId) {
  console.log('Adding user to course...');
  const res = await fetch(`${BASE_URL}/courses/${courseId}/users`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ user_id: userId }),
  });

  console.log('Status:', res.status);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  console.log('Response:', data);

  if (res.ok) {
    console.log(`User added to course successfully`);
  } else {
    console.error(`Failed to add user to course`);
  }
}

// join course test
async function joinCourseTest(courseId, userId, joinCode) {
  console.log('Joining course...');
  const res = await fetch(`${BASE_URL}/courses/${courseId}/join`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ join_code: joinCode, user_id: userId }),
  });
  console.log('Status:', res.status);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  console.log('Response:', data);

  if (res.ok) {
    console.log(`Joined course successfully`);
  } else {
    console.error(`Failed to join course`);
  }
}

async function updateRoleTest(courseId, userId, role) {
  console.log('Updating user role in course...');
  const res = await fetch(`${BASE_URL}/courses/${courseId}/users/${userId}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ role }),
  });
  console.log('Status:', res.status);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  console.log('Response:', data);

  if (res.ok) {
    console.log(`Updated user role in course successfully`);
  } else {
    console.error(`Failed to update user role in course`);
  }
}

async function removeUserFromCourseTest(courseId, userId) {
  console.log('Removing user from course...');
  const res = await fetch(`${BASE_URL}/courses/${courseId}/users/${userId}`, {
    method: 'DELETE',
    headers: headers(),
    body: JSON.stringify({}),
  });
  console.log('Status:', res.status);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  console.log('Response:', data);

  if (res.ok) {
    console.log(`Removed user from course successfully`);
  } else {
    console.error(`Failed to remove user from course`);
  }
}

// ============================================
// LECTURES TESTS
// ============================================

// Get all lectures for a course
async function getAllLecturesTest(courseId) {
  console.log(`Fetching all lectures for course id=${courseId}...`);
  const res = await fetch(`${BASE_URL}/courses/${courseId}/lectures`, {
    method: 'GET',
    headers: headers(),
  });

  console.log('Status:', res.status);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  console.log('Response:', data);

  if (res.ok) {
    console.log(
      `Fetched ${data.lectures?.length || 0} lectures for course id=${courseId} successfully`
    );
  } else {
    console.error(`Failed to fetch lectures for course id=${courseId}`);
  }
}

// Get a single lecture
async function getLectureTest(courseId, lectureId) {
  console.log(`Fetching lecture id=${lectureId} in course id=${courseId}...`);
  const res = await fetch(
    `${BASE_URL}/courses/${courseId}/lectures/${lectureId}`,
    {
      method: 'GET',
      headers: headers(),
    }
  );

  console.log('Status:', res.status);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  console.log('Response:', data);

  if (res.ok) {
    console.log(
      `Fetched lecture id=${lectureId} in course id=${courseId} successfully`
    );
  } else {
    console.error(
      `Failed to fetch lecture id=${lectureId} in course id=${courseId}`
    );
  }
}

// Create a new lecture
async function createLectureTest(courseId, lectureData) {
  console.log(`Creating new lecture for course id=${courseId}...`);
  const res = await fetch(`${BASE_URL}/courses/${courseId}/lectures`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(lectureData),
  });

  console.log('Status:', res.status);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  console.log('Response:', data);

  if (res.ok) {
    console.log(
      `Lecture created successfully (id=${data.lecture?.id || 'unknown'})`
    );
    return data.lecture;
  } else {
    console.error('Lecture creation failed');
    return null;
  }
}

// Update a lecture
async function updateLectureTest(courseId, lectureId, updateData) {
  console.log(`Updating lecture id=${lectureId} in course id=${courseId}...`);
  const res = await fetch(
    `${BASE_URL}/courses/${courseId}/lectures/${lectureId}`,
    {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify(updateData),
    }
  );

  console.log('Status:', res.status);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  console.log('Response:', data);

  if (res.ok) {
    console.log(`Lecture id=${lectureId} updated successfully`);
  } else {
    console.error(`Failed to update lecture id=${lectureId}`);
  }
}

// Delete a lecture
async function deleteLectureTest(courseId, lectureId) {
  console.log(`Deleting lecture id=${lectureId} in course id=${courseId}...`);
  const res = await fetch(
    `${BASE_URL}/courses/${courseId}/lectures/${lectureId}`,
    {
      method: 'DELETE',
      headers: headers(),
    }
  );

  console.log('Status:', res.status);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  console.log('Response:', data);

  if (res.ok) {
    console.log(`Lecture id=${lectureId} deleted successfully`);
  } else {
    console.error(`Failed to delete lecture id=${lectureId}`);
  }
}

// ============================================
// TEAMS TESTS
// ============================================

// Get all teams for a course
async function getAllTeamsTest(courseId) {
  console.log(`→ Fetching all teams for course id=${courseId}...`);
  const res = await fetch(`${BASE_URL}/courses/${courseId}/teams`, {
    method: 'GET',
    headers: headers(),
  });

  console.log('Status:', res.status);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  console.log('Response:', data);

  if (res.ok && Array.isArray(data)) {
    console.log(
      `✅ Fetched ${data.length} teams for course id=${courseId} successfully`
    );
  } else if (res.ok) {
    console.log('✅ Fetched teams successfully');
  } else {
    console.error(`❌ Failed to fetch teams for course id=${courseId}`);
  }
}

// Get a single team
async function getTeamTest(courseId, teamId) {
  console.log(`→ Fetching team id=${teamId} in course id=${courseId}...`);
  const res = await fetch(
    `${BASE_URL}/courses/${courseId}/teams/${teamId}`,
    {
      method: 'GET',
      headers: headers(),
    }
  );

  console.log('Status:', res.status);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  console.log('Response:', data);

  if (res.ok) {
    console.log(
      `✅ Fetched team id=${teamId} in course id=${courseId} successfully`
    );
  } else {
    console.error(
      `❌ Failed to fetch team id=${teamId} in course id=${courseId}`
    );
  }
}

// Get members of a team
async function getTeamMembersTest(courseId, teamId) {
  console.log(
    `→ Fetching members of team id=${teamId} in course id=${courseId}...`
  );
  const res = await fetch(
    `${BASE_URL}/courses/${courseId}/teams/${teamId}/members`,
    {
      method: 'GET',
      headers: headers(),
    }
  );

  console.log('Status:', res.status);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  console.log('Response:', data);

  if (res.ok && Array.isArray(data)) {
    console.log(
      `✅ Fetched ${data.length} members of team id=${teamId} in course id=${courseId} successfully`
    );
  } else if (res.ok) {
    console.log(
      `✅ Fetched members of team id=${teamId} in course id=${courseId} successfully`
    );
  } else {
    console.error(
      `❌ Failed to fetch members of team id=${teamId} in course id=${courseId}`
    );
  }
}

// Create a new team
async function createTeamTest(courseId, teamData) {
  console.log(`→ Creating new team for course id=${courseId}...`);
  const res = await fetch(`${BASE_URL}/courses/${courseId}/teams`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(teamData),
  });

  console.log('Status:', res.status);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  console.log('Response:', data);

  if (res.ok) {
    console.log(`✅ Team created successfully (id=${data.id || 'unknown'})`);
    return data;
  } else {
    console.error('❌ Team creation failed');
    return null;
  }
}

// Add members to a team
async function addMembersToTeamTest(courseId, teamId, members) {
  console.log(
    `→ Adding members to team id=${teamId} in course id=${courseId}...`
  );
  const res = await fetch(
    `${BASE_URL}/courses/${courseId}/teams/${teamId}/add_members`,
    {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(members),
    }
  );

  console.log('Status:', res.status);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  console.log('Response:', data);

  if (res.ok) {
    console.log(
      `✅ Members added to team id=${teamId} in course id=${courseId} successfully`
    );
  } else {
    console.error(
      `❌ Failed to add members to team id=${teamId} in course id=${courseId}`
    );
  }
}

// Update team info
async function updateTeamTest(courseId, teamId, updateData) {
  console.log(`→ Updating team id=${teamId} in course id=${courseId}...`);
  const res = await fetch(
    `${BASE_URL}/courses/${courseId}/teams/${teamId}`,
    {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify(updateData),
    }
  );

  console.log('Status:', res.status);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  console.log('Response:', data);

  if (res.ok) {
    console.log(`✅ Team id=${teamId} updated successfully`);
  } else {
    console.error(`❌ Failed to update team id=${teamId}`);
  }
}

// Update member roles in a team
async function updateTeamMembersTest(courseId, teamId, members) {
  console.log(
    `→ Updating member roles in team id=${teamId} in course id=${courseId}...`
  );
  const res = await fetch(
    `${BASE_URL}/courses/${courseId}/teams/${teamId}/update_members`,
    {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify(members),
    }
  );

  console.log('Status:', res.status);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  console.log('Response:', data);

  if (res.ok) {
    console.log(
      `✅ Member roles updated in team id=${teamId} in course id=${courseId} successfully`
    );
  } else {
    console.error(
      `❌ Failed to update member roles in team id=${teamId} in course id=${courseId}`
    );
  }
}

// Remove members from a team
async function removeTeamMembersTest(courseId, teamId, memberIds) {
  console.log(
    `→ Removing members from team id=${teamId} in course id=${courseId}...`
  );
  const res = await fetch(
    `${BASE_URL}/courses/${courseId}/teams/${teamId}/remove_members`,
    {
      method: 'DELETE',
      headers: headers(),
      body: JSON.stringify({ ids: memberIds }),
    }
  );

  console.log('Status:', res.status);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  console.log('Response:', data);

  if (res.ok) {
    console.log(
      `✅ Removed members from team id=${teamId} in course id=${courseId} successfully`
    );
  } else {
    console.error(
      `❌ Failed to remove members from team id=${teamId} in course id=${courseId}`
    );
  }
}

// Run tests

// COURSE TESTS
// COURSE TESTS
// addCourseTest();
// updateCourseTest(16, {
//   course_code: 'CSE291',
//   course_name: 'AI Agent Updated',
//   term: 'SP25',
//   section: 'A00',
//   start_date: '2025-03-31T00:00:00.000Z',
//   end_date: '2025-06-15T00:00:00.000Z',
// });
// getAllCoursesTest();
// deleteCourse(16);
// getAllUsersInCourseTest(14);
// getUserDetailsInCourseTest(14, 8);
// addUserToCourseTest(17, 16);
// joinCourseTest(17, 16, 'ABCDEF');
// updateRoleTest(17, 16, 'TA');
// removeUserFromCourseTest(17, 16);

// LECTURES TESTS
// Note: Use course_id=1 (test user is enrolled as professor in course 1)
// Course 1 has lectures with IDs 1 and 2
// getAllLecturesTest(1);
// getLectureTest(1, 1);
// createLectureTest(1, {
//   lecture_date: '2025-11-20',
//   code: 'TEST-L1',
// });
// updateLectureTest(1, 1, {
//   lecture_date: '2025-11-21',
//   code: 'UPDATED-L1',
// });
// deleteLectureTest(1, 2);

// TEAMS TESTS (uncomment and adjust IDs as needed)
// Example flow:
//
// 1. Create a team in an existing course (e.g., course_id = 1)
createTeamTest(1, {
  name: 'Team Alpha',
  description: 'Test team for course 1',
  // optional initial members if they are enrolled in course 1:
  // members: [{ id: 8, role: 'student' }]
});
//
// 2. List all teams
getAllTeamsTest(1);
//
// 3. Get a specific team (use the ID returned from createTeamTest or a known one)
getTeamTest(1, 1);
//
// 4. Add members to the team (user IDs must be enrolled in the course)
addMembersToTeamTest(1, 1, [
  { id: 8, role: 'student' },
  { id: 9, role: 'student' },
]);

// 5. Get team members
getTeamMembersTest(1, 1);
//
// 6. Update team info
updateTeamTest(1, 1, {
  name: 'Team Alpha Updated',
  description: 'Updated description',
});
//
// 7. Update member roles
updateTeamMembersTest(1, 1, [
  { id: 8, role: 'TA' },
  { id: 9, role: 'student' },
]);
//
// 8. Remove members
removeTeamMembersTest(1, 1, [8, 9]);
