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

  if (res.ok && Array.isArray(data.teams)) {
    console.log(
      `✅ Fetched ${data.teams.length} teams for course id=${courseId} successfully`
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
  const res = await fetch(`${BASE_URL}/courses/${courseId}/teams/${teamId}`, {
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

  if (res.ok && Array.isArray(data.members)) {
    console.log(
      `✅ Fetched ${data.members.length} members of team id=${teamId} in course id=${courseId} successfully`
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
  const res = await fetch(`${BASE_URL}/courses/${courseId}/teams/${teamId}`, {
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

// ============================================
// TEAMS TESTS – orchestrated flow for course 3
// ============================================

async function runTeamsFlow() {
  // Course 3 is the seeded CSE210 course where:
  // - user 5 is professor
  // - user 6 is ta
  // - users 7 and 8 are students
  const courseId = 3;

  console.log('=== TEAMS FLOW START ===');

  // Use a unique team name each run to avoid unique constraint conflicts
  const teamName = `Team Alpha ${Date.now()}`;

  // 1. Create a new team in course 3
  const created = await createTeamTest(courseId, {
    name: teamName,
    description: `Test team '${teamName}' for course ${courseId}`,
  });

  if (!created || !created.id) {
    console.error('❌ Could not create team, aborting flow');
    return;
  }

  const teamId = created.id;
  console.log(`→ Using teamId=${teamId} for the rest of the flow`);

  // 2. List all teams in the course
  await getAllTeamsTest(courseId);

  // 3. Get the specific team we just created
  await getTeamTest(courseId, teamId);

  // 4. Add members to the team (must be enrolled in course 3)
  //    From your DB: user_ids 7 and 8 are students in course 3.
  await addMembersToTeamTest(courseId, teamId, [
    { id: 7, role: 'student' },
    { id: 8, role: 'student' },
  ]);

  // 5. Get team members
  await getTeamMembersTest(courseId, teamId);

  // 6. Update team info
  await updateTeamTest(courseId, teamId, {
    name: `${teamName} (Updated)`,
    description: 'Updated description for Team Alpha test team',
  });

  // 7. Update member roles
  //    Your enrollments use lowercase 'ta', so we keep that here.
  await updateTeamMembersTest(courseId, teamId, [
    { id: 7, role: 'ta' },
    { id: 8, role: 'student' },
  ]);

  // 8. Remove members
  await removeTeamMembersTest(courseId, teamId, [7, 8]);

  console.log('=== TEAMS FLOW END ===');
}

// Kick off the Teams flow when this script is executed
runTeamsFlow().catch((err) => {
  console.error('❌ Error in runTeamsFlow:', err);
});
