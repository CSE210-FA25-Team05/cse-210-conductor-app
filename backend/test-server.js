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

// ============================================
// ATTENDANCE TESTS
// ============================================

// Activate attendance for a lecture (generate code and start 5-minute timer)
async function activateAttendanceTest(courseId, lectureId) {
  console.log(
    `Activating attendance for lecture id=${lectureId} in course id=${courseId}...`
  );
  const res = await fetch(
    `${BASE_URL}/courses/${courseId}/lectures/${lectureId}/activate-attendance`,
    {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({}), // Send empty JSON body to satisfy Fastify's content-type requirement
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
  console.log('Response:', JSON.stringify(data, null, 2));

  if (res.ok) {
    console.log(
      `Attendance activated successfully. Code: ${data.code}, Expires at: ${data.code_expires_at}`
    );
    return data;
  } else {
    console.error(`Failed to activate attendance for lecture id=${lectureId}`);
    console.error(`Full error details:`, data);
    return null;
  }
}

// Create attendance record (student marking their own attendance with code)
async function createAttendanceTest(
  courseId,
  lectureId,
  userId,
  code,
  updateReason
) {
  console.log(
    `Creating attendance for user id=${userId} in lecture id=${lectureId}...`
  );
  const body = {
    user_id: userId,
    code: code,
    update_reason: updateReason || null,
  };

  const res = await fetch(
    `${BASE_URL}/courses/${courseId}/lectures/${lectureId}/attendances`,
    {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body),
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
      `Attendance created successfully (id=${data.id}) for user id=${userId}`
    );
    return data;
  } else {
    console.error(
      `Failed to create attendance for user id=${userId} in lecture id=${lectureId}`
    );
    return null;
  }
}

// Create attendance record (professor/TA manually marking attendance - no code needed)
async function createAttendanceManualTest(
  courseId,
  lectureId,
  userId,
  updateReason
) {
  console.log(
    `Creating manual attendance for user id=${userId} in lecture id=${lectureId}...`
  );
  const body = {
    user_id: userId,
    update_reason: updateReason || 'Manual attendance by professor/TA',
  };

  const res = await fetch(
    `${BASE_URL}/courses/${courseId}/lectures/${lectureId}/attendances`,
    {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body),
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
      `Manual attendance created successfully (id=${data.id}) for user id=${userId}`
    );
    return data;
  } else {
    console.error(
      `Failed to create manual attendance for user id=${userId} in lecture id=${lectureId}`
    );
    return null;
  }
}

// Test: Create attendance with wrong code (should fail)
async function createAttendanceWrongCodeTest(courseId, lectureId, userId) {
  console.log(
    `Testing attendance with wrong code for user id=${userId} in lecture id=${lectureId}...`
  );
  const body = {
    user_id: userId,
    code: 'WRONGCODE',
    update_reason: 'Testing wrong code',
  };

  const res = await fetch(
    `${BASE_URL}/courses/${courseId}/lectures/${lectureId}/attendances`,
    {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body),
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

  if (!res.ok) {
    console.log(
      `✓ Correctly rejected attendance with wrong code (expected failure)`
    );
  } else {
    console.error(`✗ Should have rejected attendance with wrong code`);
  }
}

// Update attendance record
async function updateAttendanceTest(
  courseId,
  lectureId,
  attendanceId,
  updateReason
) {
  console.log(
    `Updating attendance id=${attendanceId} in lecture id=${lectureId}...`
  );
  const body = {
    update_reason: updateReason || 'Updated attendance record',
  };

  const res = await fetch(
    `${BASE_URL}/courses/${courseId}/lectures/${lectureId}/attendances/${attendanceId}`,
    {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify(body),
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
    console.log(`Attendance id=${attendanceId} updated successfully`);
    return data;
  } else {
    console.error(`Failed to update attendance id=${attendanceId}`);
    return null;
  }
}

// Delete attendance record
async function deleteAttendanceTest(courseId, lectureId, attendanceId) {
  console.log(
    `Deleting attendance id=${attendanceId} in lecture id=${lectureId}...`
  );
  const res = await fetch(
    `${BASE_URL}/courses/${courseId}/lectures/${lectureId}/attendances/${attendanceId}`,
    {
      method: 'DELETE',
      headers: headers(),
      body: JSON.stringify({}), // send empty JSON body to satisfy Fastify when using application/json
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
    console.log(`Attendance id=${attendanceId} deleted successfully`);
  } else {
    console.error(`Failed to delete attendance id=${attendanceId}`);
  }
}

// Example test flow:
async function runAttendanceTests() {
  console.log('\n=== ATTENDANCE TESTS ===\n');

  // 0. Get or create a course
  console.log('Step 0: Getting existing courses...');
  const coursesRes = await fetch(`${BASE_URL}/courses`, {
    method: 'GET',
    headers: headers(),
  });
  let courseId;
  if (coursesRes.ok) {
    const courses = await coursesRes.json();
    if (courses && courses.length > 0) {
      courseId = courses[0].id;
      console.log(
        `Using existing course id=${courseId} (${courses[0].course_code})`
      );
    } else {
      console.log('No courses found. Creating a new course...');
      const newCourse = {
        course_code: 'TEST101',
        course_name: 'Test Course for Attendance',
        term: 'FA25',
        section: 'A00',
        start_date: '2025-09-01',
        end_date: '2025-12-15',
      };
      const createRes = await fetch(`${BASE_URL}/courses`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(newCourse),
      });
      if (createRes.ok) {
        const course = await createRes.json();
        courseId = course.id;
        console.log(`Created new course id=${courseId}`);
      } else {
        console.error('Failed to create course. Aborting tests.');
        return;
      }
    }
  } else {
    console.error('Failed to fetch courses. Aborting tests.');
    return;
  }

  // Get a student user ID from this course (to satisfy foreign key constraint)
  console.log('\nStep 0.5: Fetching users in course to find a student user...');
  const usersRes = await fetch(`${BASE_URL}/courses/${courseId}/users`, {
    method: 'GET',
    headers: headers(),
  });
  if (!usersRes.ok) {
    console.error('Failed to fetch users for course. Aborting tests.');
    return;
  }
  const users = await usersRes.json();
  if (!Array.isArray(users) || users.length === 0) {
    console.error('No users found in course. Aborting tests.');
    return;
  }
  // Prefer a student; fallback to the first user if roles are not available
  const student = users.find((u) => u.role === 'student') || users[0];
  // API returns enrollment rows; user id is in user_id field, not id
  const studentUserId = student.user_id;
  console.log(`Using student user id=${studentUserId} for attendance tests.`);

  // Try to pick a different user for manual attendance (to avoid duplicate constraint)
  const otherEnrollment =
    users.find((u) => u.user_id !== studentUserId) || null;
  const manualUserId = otherEnrollment ? otherEnrollment.user_id : null;

  // 1. Create a lecture first
  console.log('\nStep 1: Creating lecture...');
  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
  const lecture = await createLectureTest(courseId, {
    lecture_date: today,
  });
  if (!lecture) {
    console.error('Failed to create lecture. Aborting tests.');
    return;
  }
  const newLectureId = lecture.id;

  // 2. Activate attendance (generate code)
  console.log('\nStep 2: Activating attendance...');
  const activatedLecture = await activateAttendanceTest(courseId, newLectureId);
  if (!activatedLecture) {
    console.error('Failed to activate attendance. Aborting tests.');
    return;
  }
  const attendanceCode = activatedLecture.code;
  console.log(`Generated code: ${attendanceCode}`);

  // 3. Student marks attendance with correct code
  console.log('\nStep 3: Student marking attendance with correct code...');
  const attendance = await createAttendanceTest(
    courseId,
    newLectureId,
    studentUserId,
    attendanceCode,
    'Marked by student with code'
  );

  if (attendance) {
    const attendanceId = attendance.id;

    // 4. Test: Try to mark attendance again (should fail - duplicate)
    console.log('\nStep 4: Testing duplicate attendance (should fail)...');
    await createAttendanceTest(
      courseId,
      newLectureId,
      studentUserId,
      attendanceCode,
      'Duplicate attempt'
    );

    // 5. Test: Try with wrong code (should fail)
    console.log('\nStep 5: Testing wrong code (should fail)...');
    await createAttendanceWrongCodeTest(courseId, newLectureId, studentUserId);

    // 6. Update attendance
    console.log('\nStep 6: Updating attendance...');
    await updateAttendanceTest(
      courseId,
      newLectureId,
      attendanceId,
      'Updated reason'
    );

    // 7. Delete attendance
    console.log('\nStep 7: Deleting attendance...');
    await deleteAttendanceTest(courseId, newLectureId, attendanceId);

    // 8. Manual attendance (professor/TA marking without code)
    if (manualUserId && manualUserId !== studentUserId) {
      console.log(
        '\nStep 8: Manual attendance (professor/TA) for another user...'
      );
      await createAttendanceManualTest(
        courseId,
        newLectureId,
        manualUserId,
        'Manual attendance by professor'
      );
    } else {
      console.log(
        '\nStep 8: Skipping manual attendance test (no second user available in course).'
      );
    }
  }

  console.log('\n=== ATTENDANCE TESTS COMPLETE ===\n');
}
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
//       { id: memberUserId1, role: 'professor' },
//       { id: memberUserId2, role: 'ta' },
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
