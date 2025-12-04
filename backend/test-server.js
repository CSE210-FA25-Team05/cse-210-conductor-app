// scripts/test-create-course.js
/* eslint-disable no-console */
const BASE_URL = process.env.BASE_URL || 'http://localhost:3001/api';
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

// test creation of journal entries
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
  } else {
    console.error('❌ Journal entry creation failed');
    process.exit(1);
  }
}

// update journal entry test
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
  }
}
// delete journal entry test
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
  }
}
// get journal entries test
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
  }
}

// ============================================
// JOURNAL PERMISSIONS TESTS
// ============================================

async function getCourseIdByCode(courseCode) {
  console.log(`→ Resolving course id for course_code=${courseCode}...`);
  const res = await fetch(`${BASE_URL}/courses`, {
    method: 'GET',
    headers: headersForEmail(PROFESSOR_EMAIL),
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Failed to parse /courses response: ${text}`);
  }
  // Depending on implementation, /courses may return an array or an object wrapper.
  const courses = Array.isArray(data) ? data : data.courses;
  if (!Array.isArray(courses)) {
    throw new Error(
      `Unexpected /courses response shape. Expected array or { courses: [...] }, got: ${JSON.stringify(
        data
      )}`
    );
  }

  const course = courses.find((c) => c.course_code === courseCode);
  if (!course) {
    throw new Error(`Course with course_code=${courseCode} not found`);
  }
  console.log(`   Resolved course_code=${courseCode} → id=${course.id}`);
  return course.id;
}

async function getUserProfileByEmail(email) {
  console.log(`→ Resolving user profile for email=${email}...`);
  const res = await fetch(`${BASE_URL}/me/profile`, {
    method: 'GET',
    headers: headersForEmail(email),
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Failed to parse /me/profile response: ${text}`);
  }
  if (!res.ok) {
    throw new Error(
      `Failed to resolve profile for ${email}. Status=${res.status}, body=${text}`
    );
  }
  console.log(`   Resolved email=${email} → id=${data.id}`);
  return data;
}

async function findJournalForUser(courseId, userId, { isPrivate }) {
  console.log(
    `→ Looking for ${isPrivate ? 'private' : 'public'} journal for user_id=${userId} in course_id=${courseId}...`
  );
  const res = await fetch(
    `${BASE_URL}/courses/${courseId}/journals`,
    {
      method: 'GET',
      headers: headersForEmail(PROFESSOR_EMAIL),
    }
  );
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Failed to parse journals list response: ${text}`);
  }
  if (!res.ok) {
    throw new Error(
      `Failed to fetch journals list. Status=${res.status}, body=${text}`
    );
  }

  const journal = data.find(
    (j) => j.user_id === userId && j.is_private === !!isPrivate
  );
  if (!journal) {
    throw new Error(
      `No ${isPrivate ? 'private' : 'public'} journal found for user_id=${userId} in course_id=${courseId}`
    );
  }
  console.log(`   Found journal id=${journal.id}`);
  return journal;
}

async function assertStatus(label, promise, expectedStatus) {
  const res = await promise;
  const ok = res.status === expectedStatus;
  console.log(
    `${ok ? '✅' : '❌'} ${label} → status=${res.status}, expected=${expectedStatus}`
  );
  if (!ok) {
    const bodyText = await res.text();
    console.error('   Response body:', bodyText);
    process.exit(1);
  }
}

async function testJournalAccessPermissions() {
  console.log('==============================');
  console.log('Journal Access Permission Tests');
  console.log('==============================');

  const courseId = await getCourseIdByCode('CSE210');
  const johnProfile = await getUserProfileByEmail(JOHN_EMAIL);
  const janeProfile = await getUserProfileByEmail(JANE_EMAIL);

  // Use seeded fixtures:
  // - John has public journals in CSE210
  // - Jane has private journals in CSE210
  const johnPublicJournal = await findJournalForUser(courseId, johnProfile.id, {
    isPrivate: false,
  });
  const janePrivateJournal = await findJournalForUser(
    courseId,
    janeProfile.id,
    { isPrivate: true }
  );

  // Private journal: only owner (Jane) can access
  await assertStatus(
    'Owner (Jane) can view her private journal',
    fetch(
      `${BASE_URL}/courses/${courseId}/journals/${janePrivateJournal.id}`,
      {
        method: 'GET',
        headers: headersForEmail(JANE_EMAIL),
      }
    ),
    200
  );

  await assertStatus(
    'Other student (John) cannot view Jane\'s private journal',
    fetch(
      `${BASE_URL}/courses/${courseId}/journals/${janePrivateJournal.id}`,
      {
        method: 'GET',
        headers: headersForEmail(JOHN_EMAIL),
      }
    ),
    403
  );

  await assertStatus(
    'TA cannot view Jane\'s private journal',
    fetch(
      `${BASE_URL}/courses/${courseId}/journals/${janePrivateJournal.id}`,
      {
        method: 'GET',
        headers: headersForEmail(TA_EMAIL),
      }
    ),
    403
  );

  // Public journal: owner and TA managing the team can access, other-student (different team) cannot
  await assertStatus(
    'Owner (John) can view his public journal',
    fetch(
      `${BASE_URL}/courses/${courseId}/journals/${johnPublicJournal.id}`,
      {
        method: 'GET',
        headers: headersForEmail(JOHN_EMAIL),
      }
    ),
    200
  );

  await assertStatus(
    'Other student (Jane, different team) cannot view John\'s public journal',
    fetch(
      `${BASE_URL}/courses/${courseId}/journals/${johnPublicJournal.id}`,
      {
        method: 'GET',
        headers: headersForEmail(JANE_EMAIL),
      }
    ),
    403
  );

  await assertStatus(
    'TA managing John\'s team can view John\'s public journal',
    fetch(
      `${BASE_URL}/courses/${courseId}/journals/${johnPublicJournal.id}`,
      {
        method: 'GET',
        headers: headersForEmail(TA_EMAIL),
      }
    ),
    200
  );
}

async function testJournalUpdateDeletePermissions() {
  console.log('====================================');
  console.log('Journal Update/Delete Permission Tests');
  console.log('====================================');

  const courseId = await getCourseIdByCode('CSE210');
  const johnProfile = await getUserProfileByEmail(JOHN_EMAIL);

  const johnPublicJournal = await findJournalForUser(courseId, johnProfile.id, {
    isPrivate: false,
  });

  // Update: only owner (John) can update
  await assertStatus(
    'Owner (John) can update his journal',
    fetch(
      `${BASE_URL}/courses/${courseId}/journals/${johnPublicJournal.id}`,
      {
        method: 'PATCH',
        headers: headersForEmail(JOHN_EMAIL),
        body: JSON.stringify({
          title: johnPublicJournal.title,
          content: `${johnPublicJournal.content}\n[Updated in test]`,
        }),
      }
    ),
    200
  );

  await assertStatus(
    'TA cannot update John\'s journal',
    fetch(
      `${BASE_URL}/courses/${courseId}/journals/${johnPublicJournal.id}`,
      {
        method: 'PATCH',
        headers: headersForEmail(TA_EMAIL),
        body: JSON.stringify({
          title: johnPublicJournal.title,
          content: `${johnPublicJournal.content}\n[TA illegal update]`,
        }),
      }
    ),
    403
  );

  // Delete: owner, TA, or professor can delete
  await assertStatus(
    'TA can delete John\'s journal',
    fetch(
      `${BASE_URL}/courses/${courseId}/journals/${johnPublicJournal.id}`,
      {
        method: 'DELETE',
        headers: headersForEmail(TA_EMAIL),
        body: JSON.stringify({}),
      }
    ),
    200
  );
}

// Run tests

const courseId = 6; // change as needed
const userId = 7; // change as needed
const journalId = 11; // change as needed

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

// await getJournalEntriesTest(courseId, userId);
// await createJournalEntryTest(courseId, {
//   user_id: userId,
//   title: 'Test Journal Entry',
//   content: 'This is a test journal entry.',
// });
// await updateJournalEntryTest(courseId, journalId, {
//   content: 'This is an updated test journal entry.',
// });
// await deleteJournalEntryTest(courseId, journalId);
// In backend/test-server.js, near the bottom:
// (inside an async IIFE, or run from node REPL)

(async () => {
  await testJournalAccessPermissions();
  await testJournalUpdateDeletePermissions();
})();