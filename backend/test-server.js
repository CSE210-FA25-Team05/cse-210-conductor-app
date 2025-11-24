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

  console.log('→ Creating new course...');
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
    console.log(`✅ Course created successfully (id=${data.id})`);
  } else {
    console.error('❌ Course creation failed');
    process.exit(1);
  }
}

// delete course by id
async function deleteCourse(courseId) {
  console.log(`→ Deleting course id=${courseId}...`);
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
    console.log(`✅ Course id=${courseId} deleted successfully`);
  } else {
    console.error(`❌ Failed to delete course id=${courseId}`);
  }
}

// update course test
async function updateCourseTest(courseId, updateData) {
  console.log(`→ Updating course id=${courseId}...`);
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
    console.log(`✅ Course id=${courseId} updated successfully`);
  } else {
    console.error(`❌ Failed to update course id=${courseId}`);
  }
}

// get all courses test
async function getAllCoursesTest() {
  console.log('→ Fetching all courses...');
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
    console.log(`✅ Fetched ${data.length} courses successfully`);
  } else {
    console.error('❌ Failed to fetch courses');
  }
}

// get all user in a course test
async function getAllUsersInCourseTest(courseId) {
  console.log(`→ Fetching all users in course id=${courseId}...`);
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
      `✅ Fetched ${data.length} users in course id=${courseId} successfully`
    );
  } else {
    console.error(`❌ Failed to fetch users in course id=${courseId}`);
  }
}

//get specific user in a course test
async function getUserDetailsInCourseTest(courseId, userId) {
  console.log(`→ Fetching user id=${userId} in course id=${courseId}...`);
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
      `✅ Fetched user id=${userId} in course id=${courseId} successfully`
    );
  } else {
    console.error(
      `❌ Failed to fetch user id=${userId} in course id=${courseId}`
    );
  }
}

// add user to course test
async function addUserToCourseTest(courseId, userId) {
  console.log('→ Adding user to course...');
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
    console.log(`✅ User added to course successfully`);
  } else {
    console.error(`❌ Failed to add user to course`);
  }
}

// join course test
async function joinCourseTest(courseId, userId, joinCode) {
  console.log('→ Joining course...');
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
    console.log(`✅ Joined course successfully`);
  } else {
    console.error(`❌ Failed to join course`);
  }
}

async function updateRoleTest(courseId, userId, role) {
  console.log('→ Updating user role in course...');
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
    console.log(`✅ Updated user role in course successfully`);
  } else {
    console.error(`❌ Failed to update user role in course`);
  }
}

async function removeUserFromCourseTest(courseId, userId) {
  console.log('→ Removing user from course...');
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
    console.log(`✅ Removed user from course successfully`);
  } else {
    console.error(`❌ Failed to remove user from course`);
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
// Run tests

// addCourseTest();
// updateCourseTest(16, {
//     course_code: 'CSE291',
//     course_name: 'AI Agent Updated',
//     term: 'SP25',
//     section: 'A00',
//     start_date: '2025-03-31T00:00:00.000Z',
//     end_date: '2025-06-15T00:00:00.000Z',
//   });
// getAllCoursesTest()
// deleteCourse(16)
// getAllUsersInCourseTest(14);
// getUserDetailsInCourseTest(14, 8);
// addUserToCourseTest(17, 16);
// joinCourseTest(17, 16, 'ABCDEF');
// updateRoleTest(17,16,'TA');
// removeUserFromCourseTest(17,16);
await createJournalEntryTest(17, {
  student_id: 17,
  content: 'This is my first journal entry.',
  title: 'First Entry',
});
await updateJournalEntryTest(17, 4, {
  content: 'This is my updated journal entry content.',
  title: 'Updated Entry',
});
await getJournalEntriesTest(17, 17);
// deleteJournalEntryTest(17,4);
