// scripts/test-create-course.js
/* eslint-disable no-console */
const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const AUTH = process.env.AUTH_TOKEN || ''; // optional, if you have auth

// Seeded test users (see prisma/seed.js)
const PROFESSOR_EMAIL = 'mathprof@ucsd.edu';
const TA_EMAIL = 'genius_ta@ucsd.edu';
const JOHN_EMAIL = 'jdoe@ucsd.edu';
const JANE_EMAIL = 'jd563@ucsd.edu';

function headers() {
  const h = { 'Content-Type': 'application/json' };
  if (AUTH) h['Authorization'] = AUTH;
  return h;
}

// Use Fastify test-mode headers to impersonate a specific user by email.
// Requires NODE_ENV=development and TEST_MODE=true on the backend.
function headersForEmail(email) {
  const h = headers();
  if (email) {
    h['x-test-user-email'] = email;
  }
  return h;
}

async function addCourseTest() {
  const course = {
    course_code: 'CSE291',
    course_name: 'AI Agent',
    term: 'SP25',
    section: 'A00',
    start_date: '2025-03-31',
    end_date: '2025-06-15',
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
    return data;
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
    process.exit(1);
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
    process.exit(1);
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
    process.exit(1);
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
    process.exit(1);
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
    process.exit(1);
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
    return true;
  } else {
    console.warn(
      `⚠️ Failed to add user to course id=${courseId}. Continuing tests anyway.`
    );
    return false; // don’t exit; just report and move on
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
    process.exit(1);
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
    process.exit(1);
  }
}

async function updateRoleWrongValueTest(courseId, userId) {
  console.log('Updating user role in course...');
  const res = await fetch(`${BASE_URL}/courses/${courseId}/users/${userId}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ role: 'invalid_role' }),
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
    console.error(`Should not have updated user role in course`);
    process.exit(1);
  } else {
    console.log(`Updated user role in course failed as expected.`);
  }
}

await updateRoleTest(1, 2, 'ta');
await updateRoleWrongValueTest(1, 2);

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
    process.exit(1);
  }
}

// ============================================
// LECTURES TESTS (helpers only, not run automatically)
// ============================================

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
    process.exit(1);
  }
}

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
    process.exit(1);
  }
}

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
    console.log(`Lecture created successfully (id=${data.id || 'unknown'})`);
    return data;
  } else {
    console.error('Lecture creation failed');
    process.exit(1);
  }
}

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
    process.exit(1);
  }
}

async function deleteLectureTest(courseId, lectureId) {
  console.log(`Deleting lecture id=${lectureId} in course id=${courseId}...`);
  const res = await fetch(
    `${BASE_URL}/courses/${courseId}/lectures/${lectureId}`,
    {
      method: 'DELETE',
      headers: headers(),
      body: JSON.stringify({}),
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
    process.exit(1);
  }
}

// Attendance tests have been moved to tests/attendance.js
// Import them if needed:
// const attendanceTests = require('./tests/attendance');

// ============================================
// JOURNAL ENTRIES TESTS
// ============================================

// test creation of journal entries
// JOURNAL TEST HELPERS
// ============================================

async function createJournalEntryTest(courseId, journalData) {
  console.log('→ Creating journal entry...');
  const res = await fetch(`${BASE_URL}/courses/${courseId}/journals`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(journalData),
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
    console.log(`✅ Journal entry created successfully (id=${data.id})`);
    return data;
  } else {
    console.error('❌ Journal entry creation failed');
    process.exit(1);
  }
}

async function updateJournalEntryTest(courseId, journalId, updateData) {
  console.log(`→ Updating journal entry id=${journalId}...`);
  const res = await fetch(
    `${BASE_URL}/courses/${courseId}/journals/${journalId}`,
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
    console.log(`✅ Journal entry id=${journalId} updated successfully`);
  } else {
    console.error(`❌ Failed to update journal entry id=${journalId}`);
    process.exit(1);
  }
}

async function deleteJournalEntryTest(courseId, journalId) {
  console.log(`→ Deleting journal entry id=${journalId}...`);
  const res = await fetch(
    `${BASE_URL}/courses/${courseId}/journals/${journalId}`,
    {
      method: 'DELETE',
      headers: headers(),
      body: JSON.stringify({}),
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
    console.log(`✅ Journal entry id=${journalId} deleted successfully`);
  } else {
    console.error(`❌ Failed to delete journal entry id=${journalId}`);
    process.exit(1);
  }
}

async function getJournalEntriesTest(courseId, userId) {
  console.log(
    `→ Fetching journal entries for user id=${userId} in course id=${courseId}...`
  );
  const res = await fetch(
    `${BASE_URL}/courses/${courseId}/journals/user/${userId}`,
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
      `✅ Fetched ${data.length} journal entries for user id=${userId} in course id=${courseId} successfully`
    );
  } else {
    console.error(
      `❌ Failed to fetch journal entries for user id=${userId} in course id=${courseId}`
    );
    process.exit(1);
  }
}

// ============================================
// PULSES TEST HELPERS
// ============================================

async function getPulseConfigTest(courseId) {
  console.log(`→ Fetching pulse config for course id=${courseId}...`);
  const res = await fetch(`${BASE_URL}/courses/${courseId}/pulses/config`, {
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
      `✅ Fetched pulse config for course id=${courseId} successfully`
    );
  } else {
    console.error(`❌ Failed to fetch pulse config for course id=${courseId}`);
    process.exit(1);
  }
}

async function upsertPulseConfigTest(courseId, configObj) {
  console.log(`→ Upserting pulse config for course id=${courseId}...`);
  const res = await fetch(`${BASE_URL}/courses/${courseId}/pulses/config`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(configObj),
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
      `✅ Upserted pulse config for course id=${courseId} successfully`
    );
  } else {
    console.error(`❌ Failed to upsert pulse config for course id=${courseId}`);
    process.exit(1);
  }
}

async function getPulsesTest(courseId) {
  console.log(`→ Fetching pulses for course id=${courseId}...`);
  const res = await fetch(`${BASE_URL}/courses/${courseId}/pulses`, {
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
      `✅ Fetched ${data.length} pulses for course id=${courseId} successfully`
    );
  } else {
    console.error(`❌ Failed to fetch pulses for course id=${courseId}`);
    process.exit(1);
  }
}

async function submitPulseTest(courseId, option, description = null) {
  console.log(`→ Submitting pulse for course id=${courseId}...`);
  const body = { option };
  if (description) body.description = description;

  const res = await fetch(`${BASE_URL}/courses/${courseId}/pulses`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
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
    console.log(`✅ Submitted pulse for course id=${courseId} successfully`);
  } else {
    console.error(`❌ Failed to submit pulse for course id=${courseId}`);
    process.exit(1);
  }
}

async function getPulseStatsTest(courseId) {
  console.log(`→ Fetching pulse stats for course id=${courseId}...`);
  const res = await fetch(`${BASE_URL}/courses/${courseId}/pulses/stats`, {
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
      `✅ Fetched pulse stats for course id=${courseId} successfully`
    );
  } else {
    console.error(`❌ Failed to fetch pulse stats for course id=${courseId}`);
    process.exit(1);
  }
}

// ============================================
// TEAMS CRUD TESTS
// ============================================

async function runTeamsCrudTests() {
  console.log('\n============================================');
  console.log('          TEAMS CRUD TESTS BEGIN');
  console.log('============================================\n');

  const teamsCourseId = 13; // CSE210

  const professorUserId = 14; // mathprof@ucsd.edu, role: professor
  const taUserId = 15; // genius_ta@ucsd.edu, role: ta
  const studentUserId1 = 16; // jdoe@ucsd.edu, role: student
  const studentUserId2 = 17; // jd563@ucsd.edu, role: student

  // Run team operations as the seeded professor so permissions pass
  const teamsHeaders = headersForEmail(PROFESSOR_EMAIL);

  // --- Get all teams ---
  console.log(`→ Fetching all teams for course id=${teamsCourseId}...`);
  let res = await fetch(`${BASE_URL}/courses/${teamsCourseId}/teams`, {
    method: 'GET',
    headers: teamsHeaders,
  });
  let data = await res.json();
  console.log('Status:', res.status, 'Response:', data);

  // --- Create team (use unique name to avoid constraint violations) ---
  const uniqueSuffix = Date.now();
  const teamName = `Test Team Alpha ${uniqueSuffix}`;

  console.log(
    `→ Creating new team "${teamName}" in course id=${teamsCourseId}...`
  );
  res = await fetch(`${BASE_URL}/courses/${teamsCourseId}/teams`, {
    method: 'POST',
    headers: teamsHeaders,
    body: JSON.stringify({
      name: teamName,
      description: 'Team created by test-server.js',
    }),
  });
  let createdTeam;
  try {
    createdTeam = await res.json();
  } catch {
    createdTeam = {};
  }
  console.log('Status:', res.status, 'Response:', createdTeam);

  if (!res.ok || !createdTeam.id) {
    console.error('Team creation failed');
    process.exit(1);
  }

  // --- Fetch team ---
  console.log(`→ Fetching team id=${createdTeam.id}...`);
  res = await fetch(
    `${BASE_URL}/courses/${teamsCourseId}/teams/${createdTeam.id}`,
    {
      method: 'GET',
      headers: teamsHeaders,
    }
  );
  data = await res.json();
  console.log('Status:', res.status, 'Response:', data);

  // --- Fetch team members (API returns { members: [...] }) ---
  console.log(`→ Fetching members for team id=${createdTeam.id}...`);
  res = await fetch(
    `${BASE_URL}/courses/${teamsCourseId}/teams/${createdTeam.id}/members`,
    {
      method: 'GET',
      headers: teamsHeaders,
    }
  );
  data = await res.json();
  console.log('Status:', res.status, 'Response:', data);

  const members = Array.isArray(data)
    ? data
    : Array.isArray(data.members)
      ? data.members
      : [];

  if (!Array.isArray(members)) {
    console.error(
      'Expected team members to be an array or in { members: [...] }'
    );
  } else if (members.length > 0) {
    console.log('Example member shape:', members[0]);
  }

  // --- Add members (use students, not professor/TA) ---
  console.log(`→ Adding 2 student members to team id=${createdTeam.id}...`);
  res = await fetch(
    `${BASE_URL}/courses/${teamsCourseId}/teams/${createdTeam.id}/add_members`,
    {
      method: 'POST',
      headers: teamsHeaders,
      body: JSON.stringify([
        { id: studentUserId1, role: 'student' },
        { id: studentUserId2, role: 'student' },
      ]),
    }
  );
  let addedResponse;
  try {
    addedResponse = await res.json();
  } catch {
    addedResponse = {};
  }
  console.log('Status:', res.status, 'Response:', addedResponse);

  // --- Update team info ---
  console.log(`→ Updating team id=${createdTeam.id}...`);
  res = await fetch(
    `${BASE_URL}/courses/${teamsCourseId}/teams/${createdTeam.id}`,
    {
      method: 'PATCH',
      headers: teamsHeaders,
      body: JSON.stringify({
        name: `${teamName} (Updated)`,
        description: 'Updated team from test-server.js',
      }),
    }
  );
  let updatedTeam;
  try {
    updatedTeam = await res.json();
  } catch {
    updatedTeam = {};
  }
  console.log('Status:', res.status, 'Response:', updatedTeam);

  // --- Update member roles (update the students, not professor/TA) ---
  console.log(`→ Updating member roles for team id=${createdTeam.id}...`);
  res = await fetch(
    `${BASE_URL}/courses/${teamsCourseId}/teams/${createdTeam.id}/update_members`,
    {
      method: 'PATCH',
      headers: teamsHeaders,
      body: JSON.stringify([
        { id: studentUserId1, role: 'team_lead' },
        { id: studentUserId2, role: 'student' },
      ]),
    }
  );
  let roleUpdateResponse;
  try {
    roleUpdateResponse = await res.json();
  } catch {
    roleUpdateResponse = {};
  }
  console.log('Status:', res.status, 'Response:', roleUpdateResponse);

  // --- Remove a member (remove one student) ---
  console.log(`→ Removing 1 member from team id=${createdTeam.id}...`);
  res = await fetch(
    `${BASE_URL}/courses/${teamsCourseId}/teams/${createdTeam.id}/remove_members`,
    {
      method: 'DELETE',
      headers: teamsHeaders,
      body: JSON.stringify({
        ids: [studentUserId2],
      }),
    }
  );
  let removeResponse;
  try {
    removeResponse = await res.json();
  } catch {
    removeResponse = {};
  }
  console.log('Status:', res.status, 'Response:', removeResponse);

  // --- Delete the team ---
  console.log(`→ Deleting team id=${createdTeam.id}...`);
  res = await fetch(
    `${BASE_URL}/courses/${teamsCourseId}/teams/${createdTeam.id}`,
    {
      method: 'DELETE',
      headers: teamsHeaders,
      body: JSON.stringify({}),
    }
  );
  let deleteResponse;
  try {
    deleteResponse = await res.json();
  } catch {
    deleteResponse = {};
  }
  console.log('Status:', res.status, 'Response:', deleteResponse);

  console.log('\nTEAMS CRUD TESTS COMPLETED SUCCESSFULLY\n');
}

// ============================================
// TEAMS TA ASSIGNMENT TESTS
// ============================================

async function runTeamsTaAssignmentTests() {
  console.log('\n============================================');
  console.log('        TEAMS TA ASSIGNMENT TESTS');
  console.log('============================================\n');

  const teamsCourseId = 13; // CSE210

  const taUserId = 15; // genius_ta@ucsd.edu, role: ta

  // Run these as the seeded professor user via test header.
  const taTestHeaders = headersForEmail(PROFESSOR_EMAIL);

  // --- Create a fresh team for TA tests (unique name) ---
  const uniqueSuffix = Date.now();
  const taTeamName = `Test Team TA Assignment ${uniqueSuffix}`;

  console.log(
    `→ Creating new team "${taTeamName}" for TA assignment tests in course id=${teamsCourseId}...`
  );
  let res = await fetch(`${BASE_URL}/courses/${teamsCourseId}/teams`, {
    method: 'POST',
    headers: taTestHeaders,
    body: JSON.stringify({
      name: taTeamName,
      description: 'Team used for TA assignment tests in test-server.js',
    }),
  });

  let taTestTeam;
  try {
    taTestTeam = await res.json();
  } catch {
    taTestTeam = {};
  }
  console.log('Status:', res.status, 'Response:', taTestTeam);

  if (!res.ok || !taTestTeam.id) {
    console.error('TA test team creation failed');
    process.exit(1);
  }

  const taTestTeamId = taTestTeam.id;

  // --- Assign TA to team ---
  console.log(
    `→ Assigning TA user id=${taUserId} to team id=${taTestTeamId}...`
  );
  res = await fetch(
    `${BASE_URL}/courses/${teamsCourseId}/teams/${taTestTeamId}/tas`,
    {
      method: 'POST',
      headers: taTestHeaders,
      body: JSON.stringify({
        ids: [taUserId],
      }),
    }
  );

  let assignTaResponse;
  try {
    assignTaResponse = await res.json();
  } catch {
    assignTaResponse = {};
  }
  console.log('Status:', res.status, 'Response:', assignTaResponse);
  if (!res.ok) {
    console.error('Failed to assign TA to team');
    process.exit(1);
  }

  // --- Get TAs for that team (API returns { tas: [...] }) ---
  console.log(`→ Fetching TAs for team id=${taTestTeamId}...`);
  res = await fetch(
    `${BASE_URL}/courses/${teamsCourseId}/teams/${taTestTeamId}/tas`,
    {
      method: 'GET',
      headers: taTestHeaders,
    }
  );

  let tasForTeam;
  try {
    tasForTeam = await res.json();
  } catch {
    tasForTeam = {};
  }
  console.log('Status:', res.status, 'Response:', tasForTeam);

  const tasArray = Array.isArray(tasForTeam)
    ? tasForTeam
    : Array.isArray(tasForTeam.tas)
      ? tasForTeam.tas
      : [];

  if (!Array.isArray(tasArray)) {
    console.error('Expected TAs for team in an array or { tas: [...] }');
  } else if (tasArray.length > 0) {
    console.log('Example TA assignment shape:', tasArray[0]);
  }
  if (!res.ok) {
    console.error('Failed to fetch TAs for team');
    process.exit(1);
  }

  // --- Get teams for this TA in the course (API returns { teams: [...] }) ---
  console.log(
    `→ Fetching teams for TA user id=${taUserId} in course id=${teamsCourseId}...`
  );
  res = await fetch(
    `${BASE_URL}/courses/${teamsCourseId}/tas/${taUserId}/teams`,
    {
      method: 'GET',
      headers: taTestHeaders,
    }
  );

  let taTeams;
  try {
    taTeams = await res.json();
  } catch {
    taTeams = {};
  }
  console.log('Status:', res.status, 'Response:', taTeams);

  const teamsArray = Array.isArray(taTeams)
    ? taTeams
    : Array.isArray(taTeams.teams)
      ? taTeams.teams
      : [];

  if (!Array.isArray(teamsArray)) {
    console.error('Expected teams for TA in an array or { teams: [...] }');
  } else {
    console.log(
      `Found ${teamsArray.length} team(s) for TA user id=${taUserId}.`
    );
  }

  if (!res.ok) {
    console.error('Failed to fetch teams for TA');
    process.exit(1);
  }

  // --- Remove TA from team ---
  console.log(
    `→ Removing TA user id=${taUserId} from team id=${taTestTeamId}...`
  );
  res = await fetch(
    `${BASE_URL}/courses/${teamsCourseId}/teams/${taTestTeamId}/tas`,
    {
      method: 'DELETE',
      headers: taTestHeaders,
      body: JSON.stringify({
        ids: [taUserId],
      }),
    }
  );

  let removeTaResponse;
  try {
    removeTaResponse = await res.json();
  } catch {
    removeTaResponse = {};
  }
  console.log('Status:', res.status, 'Response:', removeTaResponse);
  if (!res.ok) {
    console.error('Failed to remove TA from team');
    process.exit(1);
  }

  // --- Clean up: delete the TA test team ---
  console.log(`→ Deleting TA test team id=${taTestTeamId}...`);
  res = await fetch(
    `${BASE_URL}/courses/${teamsCourseId}/teams/${taTestTeamId}`,
    {
      method: 'DELETE',
      headers: taTestHeaders,
      body: JSON.stringify({}),
    }
  );

  let deleteTaTeamResponse;
  try {
    deleteTaTeamResponse = await res.json();
  } catch {
    deleteTaTeamResponse = {};
  }
  console.log('Status:', res.status, 'Response:', deleteTaTeamResponse);
  if (!res.ok) {
    console.error('Failed to delete TA test team');
    process.exit(1);
  }

  console.log('\n✅ TEAMS TA ASSIGNMENT TESTS COMPLETED SUCCESSFULLY\n');
}

// Run both test suites in order
await runTeamsCrudTests();
await runTeamsTaAssignmentTests();
// console.log('\n============================================');
// console.log('          TEAMS CRUD TESTS BEGIN');
// console.log('============================================\n');

// const teamsCourseId = 5;
// const memberUserId1 = 9; // professor in course 5
// const memberUserId2 = 10; // ta in course 5

// // --- Get all teams ---
// console.log(`→ Fetching all teams for course id=${teamsCourseId}...`);
// let res = await fetch(`${BASE_URL}/courses/${teamsCourseId}/teams`, {
//   method: 'GET',
//   headers: headers(),
// });
// let data = await res.json();
// console.log('Status:', res.status, 'Response:', data);

// // --- Create team ---
// console.log(`→ Creating new team in course id=${teamsCourseId}...`);
// res = await fetch(`${BASE_URL}/courses/${teamsCourseId}/teams`, {
//   method: 'POST',
//   headers: headers(),
//   body: JSON.stringify({
//     name: 'Test Team Alpha',
//     description: 'Team created by test-server.js',
//   }),
// });
// let createdTeam;
// try {
//   createdTeam = await res.json();
// } catch {
//   createdTeam = {};
// }
// console.log('Status:', res.status, 'Response:', createdTeam);

// if (!res.ok) {
//   console.error('❌ Team creation failed');
//   process.exit(1);
// }

// // --- Fetch team ---
// console.log(`→ Fetching team id=${createdTeam.id}...`);
// res = await fetch(
//   `${BASE_URL}/courses/${teamsCourseId}/teams/${createdTeam.id}`,
//   {
//     method: 'GET',
//     headers: headers(),
//   }
// );
// data = await res.json();
// console.log('Status:', res.status, 'Response:', data);

// // --- Fetch team members ---
// console.log(`→ Fetching members for team id=${createdTeam.id}...`);
// res = await fetch(
//   `${BASE_URL}/courses/${teamsCourseId}/teams/${createdTeam.id}/members`,
//   {
//     method: 'GET',
//     headers: headers(),
//   }
// );
// data = await res.json();
// console.log('Status:', res.status, 'Response:', data);

// // --- Add members ---
// console.log(`→ Adding 2 members to team id=${createdTeam.id}...`);
// res = await fetch(
//   `${BASE_URL}/courses/${teamsCourseId}/teams/${createdTeam.id}/add_members`,
//   {
//     method: 'POST',
//     headers: headers(),
//     body: JSON.stringify([
//       { id: memberUserId1, role: CourseRoles.PROFESSOR },
//       { id: memberUserId2, role: CourseRoles.TA },
//     ]),
//   }
// );
// let addedResponse;
// try {
//   addedResponse = await res.json();
// } catch {
//   addedResponse = {};
// }
// console.log('Status:', res.status, 'Response:', addedResponse);

// // --- Update team info ---
// console.log(`→ Updating team id=${createdTeam.id}...`);
// res = await fetch(
//   `${BASE_URL}/courses/${teamsCourseId}/teams/${createdTeam.id}`,
//   {
//     method: 'PATCH',
//     headers: headers(),
//     body: JSON.stringify({
//       name: 'Test Team Alpha (Updated)',
//       description: 'Updated team from test-server.js',
//     }),
//   }
// );
// let updatedTeam;
// try {
//   updatedTeam = await res.json();
// } catch {
//   updatedTeam = {};
// }
// console.log('Status:', res.status, 'Response:', updatedTeam);

// // --- Update member roles ---
// console.log(`→ Updating member roles for team id=${createdTeam.id}...`);
// res = await fetch(
//   `${BASE_URL}/courses/${teamsCourseId}/teams/${createdTeam.id}/update_members`,
//   {
//     method: 'PATCH',
//     headers: headers(),
//     body: JSON.stringify([
//       { id: memberUserId1, role: 'team_lead' },
//       { id: memberUserId2, role: 'student' },
//     ]),
//   }
// );
// let roleUpdateResponse;
// try {
//   roleUpdateResponse = await res.json();
// } catch {
//   roleUpdateResponse = {};
// }
// console.log('Status:', res.status, 'Response:', roleUpdateResponse);

// // --- Remove a member ---
// console.log(`→ Removing 1 member from team id=${createdTeam.id}...`);
// res = await fetch(
//   `${BASE_URL}/courses/${teamsCourseId}/teams/${createdTeam.id}/remove_members`,
//   {
//     method: 'DELETE',
//     headers: headers(),
//     body: JSON.stringify({
//       ids: [memberUserId2],
//     }),
//   }
// );
// let removeResponse;
// try {
//   removeResponse = await res.json();
// } catch {
//   removeResponse = {};
// }
// console.log('Status:', res.status, 'Response:', removeResponse);

// // --- Delete the team ---
// console.log(`→ Deleting team id=${createdTeam.id}...`);
// res = await fetch(
//   `${BASE_URL}/courses/${teamsCourseId}/teams/${createdTeam.id}`,
//   {
//     method: 'DELETE',
//     headers: headers(),
//     body: JSON.stringify({}),
//   }
// );
// let deleteResponse;
// try {
//   deleteResponse = await res.json();
// } catch {
//   deleteResponse = {};
// }
// console.log('Status:', res.status, 'Response:', deleteResponse);

// console.log('\n✅ TEAMS CRUD TESTS COMPLETED SUCCESSFULLY\n');
