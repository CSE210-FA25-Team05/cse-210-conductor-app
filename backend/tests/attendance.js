// Attendance Tests
/* eslint-disable no-console */
const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const AUTH = process.env.AUTH_TOKEN || ''; // optional, if you have auth

// Seeded test users (see prisma/seed.js)
const JOHN_EMAIL = 'jdoe@ucsd.edu';

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

// Helper function to create a lecture (needed for attendance tests)
async function createLectureTest(courseId, lectureData) {
  console.log(
    `Creating lecture for course id=${courseId} with data:`,
    lectureData
  );
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
    console.log(`Lecture created successfully (id=${data.id})`);
    return data;
  } else {
    console.error(`Failed to create lecture for course id=${courseId}`);
    return null;
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
// CODE-BASED ATTENDANCE TESTS (NEW ENDPOINT)
// ============================================
// Tests for POST /courses/:course_id/attendances endpoint
// Usage: Call runCodeBasedAttendanceTests() to run all tests
// Example: await runCodeBasedAttendanceTests();

// Create attendance by code (simplified flow - POST /courses/:course_id/attendances)
async function createAttendanceByCodeTest(courseId, code, userEmail) {
  console.log(
    `Creating attendance by code for course id=${courseId} with code="${code}"...`
  );
  const res = await fetch(`${BASE_URL}/courses/${courseId}/attendances`, {
    method: 'POST',
    headers: headersForEmail(userEmail),
    body: JSON.stringify({ code }),
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
      `Attendance created successfully by code (id=${data.id}) for user ${userEmail}`
    );
    return data;
  } else {
    console.error(`Failed to create attendance by code for user ${userEmail}`);
    return null;
  }
}

// Test: Create attendance with expired code (should fail with 410)
async function createAttendanceExpiredCodeTest(
  courseId,
  expiredCode,
  userEmail
) {
  console.log(
    `Testing attendance with expired code for course id=${courseId}...`
  );
  const res = await fetch(`${BASE_URL}/courses/${courseId}/attendances`, {
    method: 'POST',
    headers: headersForEmail(userEmail),
    body: JSON.stringify({ code: expiredCode }),
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

  if (res.status === 410) {
    console.log('Correctly rejected expired code (expected 410)');
    return true;
  } else {
    console.error(`Expected 410 for expired code, got ${res.status}`);
    return false;
  }
}

// Test: Create attendance with invalid code (should fail with 404)
async function createAttendanceInvalidCodeTest(
  courseId,
  invalidCode,
  userEmail
) {
  console.log(
    `Testing attendance with invalid code for course id=${courseId}...`
  );
  const res = await fetch(`${BASE_URL}/courses/${courseId}/attendances`, {
    method: 'POST',
    headers: headersForEmail(userEmail),
    body: JSON.stringify({ code: invalidCode }),
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

  if (res.status === 404) {
    console.log('Correctly rejected invalid code (expected 404)');
    return true;
  } else {
    console.error(`Expected 404 for invalid code, got ${res.status}`);
    return false;
  }
}

// Run code-based attendance tests
async function runCodeBasedAttendanceTests() {
  console.log('\n=== CODE-BASED ATTENDANCE TESTS ===\n');

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
        course_code: 'TEST102',
        course_name: 'Test Course for Code-Based Attendance',
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

  // Get a student user email
  console.log('\nStep 0.5: Fetching users in course to find a student...');
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
  // Find a student user
  const studentEnrollment = users.find((u) => u.role === 'student') || users[0];
  const studentEmail = studentEnrollment.email || JOHN_EMAIL; // Fallback to seeded user
  console.log(
    `Using student email ${studentEmail} for code-based attendance tests.`
  );

  // 1. Create a lecture
  console.log('\nStep 1: Creating lecture...');
  const today = new Date().toISOString().split('T')[0];
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

  // 3. Test: Student marks attendance with code (success case)
  console.log('\nStep 3: Student marking attendance by code (success case)...');
  const attendance = await createAttendanceByCodeTest(
    courseId,
    attendanceCode,
    studentEmail
  );

  if (attendance) {
    // 4. Test: Try to mark attendance again with same code (should fail - duplicate)
    console.log(
      '\nStep 4: Testing duplicate attendance by code (should fail)...'
    );
    await createAttendanceByCodeTest(courseId, attendanceCode, studentEmail);

    // 5. Test: Invalid code (should fail with 404)
    console.log('\nStep 5: Testing invalid code (should fail with 404)...');
    await createAttendanceInvalidCodeTest(courseId, 'INVALID', studentEmail);

    // 6. Test: Expired code
    // To test expired code, we need to wait 5+ minutes or create a new lecture
    // and manually set an expired code. For now, we'll test with a non-existent code
    // that looks like it might be expired
    console.log(
      '\nStep 6: Testing expired code scenario (using non-existent code)...'
    );
    console.log(
      'Note: To fully test expired codes, wait 5+ minutes after activation or manually set expired code in DB'
    );
    // This will return 404 (not found) since we can't easily simulate expired codes
    await createAttendanceInvalidCodeTest(courseId, 'EXPIRED', studentEmail);

    // 7. Test: Code from different course (should fail with 404)
    console.log('\nStep 7: Testing code from different course...');
    // Get a different course or create one
    const otherCoursesRes = await fetch(`${BASE_URL}/courses`, {
      method: 'GET',
      headers: headers(),
    });
    if (otherCoursesRes.ok) {
      const allCourses = await otherCoursesRes.json();
      const otherCourse = allCourses.find((c) => c.id !== courseId);
      if (otherCourse) {
        // Create lecture in other course and activate
        const otherLecture = await createLectureTest(otherCourse.id, {
          lecture_date: today,
        });
        if (otherLecture) {
          const otherActivated = await activateAttendanceTest(
            otherCourse.id,
            otherLecture.id
          );
          if (otherActivated) {
            // Try to use code from other course in current course
            console.log(
              `Testing with code from course ${otherCourse.id} in course ${courseId}...`
            );
            await createAttendanceInvalidCodeTest(
              courseId,
              otherActivated.code,
              studentEmail
            );
          }
        }
      }
    }
  }

  console.log('\n=== CODE-BASED ATTENDANCE TESTS COMPLETE ===\n');
}

// ============================================
// ATTENDANCE STATS TESTS
// ============================================

// Get student attendance statistics
async function getStudentAttendanceStatsTest(courseId, userEmail) {
  console.log(
    `Getting student attendance stats for course id=${courseId} for user ${userEmail}...`
  );
  const res = await fetch(`${BASE_URL}/courses/${courseId}/attendances/stats`, {
    method: 'GET',
    headers: headersForEmail(userEmail),
  });

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
    console.log('Student attendance stats retrieved successfully');
    console.log(
      `Summary: ${data.summary.total_lectures} lectures, ${data.summary.present} present, ${data.summary.absent} absent`
    );
    return data;
  } else {
    console.error(
      `Failed to get student attendance stats: ${data.error || data.message || 'Unknown error'}`
    );
    return null;
  }
}

// Get class-wide attendance statistics (professor/TA)
async function getClassAttendanceStatsTest(courseId, userEmail) {
  console.log(
    `Getting class-wide attendance stats for course id=${courseId} for user ${userEmail}...`
  );
  const res = await fetch(`${BASE_URL}/courses/${courseId}/attendances/stats`, {
    method: 'GET',
    headers: headersForEmail(userEmail),
  });

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
    console.log('Class attendance stats retrieved successfully');
    console.log(
      `Summary: ${data.summary.total_lectures} lectures, ${data.summary.total_enrolled} enrolled, ${data.summary.total_attendances} attendances`
    );
    console.log(`Trend: ${data.trend.length} lecture entries`);
    return data;
  } else {
    console.error(
      `Failed to get class attendance stats: ${data.error || data.message || 'Unknown error'}`
    );
    return null;
  }
}

// Get attendance stats with date filters
async function getAttendanceStatsWithDateRangeTest(
  courseId,
  userEmail,
  startTime,
  endTime,
  isProfessor = false
) {
  console.log(
    `Getting attendance stats with date range for course id=${courseId}...`
  );
  const url = new URL(`${BASE_URL}/courses/${courseId}/attendances/stats`);
  if (startTime) url.searchParams.append('start_time', startTime);
  if (endTime) url.searchParams.append('end_time', endTime);

  const res = await fetch(url, {
    method: 'GET',
    headers: headersForEmail(userEmail),
  });

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
    if (isProfessor) {
      console.log(
        'Class attendance stats with date range retrieved successfully'
      );
    } else {
      console.log(
        'Student attendance stats with date range retrieved successfully'
      );
    }
    return data;
  } else {
    console.error(
      `Failed to get attendance stats with date range: ${data.error || data.message || 'Unknown error'}`
    );
    return null;
  }
}

// Run attendance stats tests
async function runAttendanceStatsTests() {
  console.log('\n=== ATTENDANCE STATS TESTS ===\n');

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
        course_code: 'TEST103',
        course_name: 'Test Course for Attendance Stats',
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

  // Get users in course
  console.log('\nStep 0.5: Fetching users in course...');
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

  // Find a student and professor/TA
  const studentEnrollment = users.find((u) => u.role === 'student') || users[0];
  const studentEmail = studentEnrollment.email || JOHN_EMAIL;
  const professorEnrollment = users.find(
    (u) => u.role === 'professor' || u.role === 'ta'
  );
  const professorEmail = professorEnrollment
    ? professorEnrollment.email
    : 'mathprof@ucsd.edu'; // Fallback to seeded professor

  console.log(`Using student email: ${studentEmail}`);
  console.log(`Using professor/TA email: ${professorEmail}`);

  // 1. Test: Student gets their own stats
  console.log('\nStep 1: Testing student attendance stats...');
  const studentStats = await getStudentAttendanceStatsTest(
    courseId,
    studentEmail
  );

  if (studentStats) {
    console.log('✓ Student stats test passed');
    console.log(`  - Total lectures: ${studentStats.summary.total_lectures}`);
    console.log(`  - Present: ${studentStats.summary.present}`);
    console.log(`  - Absent: ${studentStats.summary.absent}`);
    console.log(
      `  - Percentage: ${studentStats.summary.attendance_percentage}%`
    );
    console.log(`  - Lectures array length: ${studentStats.lectures.length}`);
  } else {
    console.error('✗ Student stats test failed');
  }

  // 2. Test: Professor/TA gets class-wide stats
  console.log('\nStep 2: Testing professor/TA class-wide stats...');
  const classStats = await getClassAttendanceStatsTest(
    courseId,
    professorEmail
  );

  if (classStats) {
    console.log('✓ Class stats test passed');
    console.log(`  - Total lectures: ${classStats.summary.total_lectures}`);
    console.log(`  - Total enrolled: ${classStats.summary.total_enrolled}`);
    console.log(
      `  - Total attendances: ${classStats.summary.total_attendances}`
    );
    console.log(
      `  - Overall percentage: ${classStats.summary.overall_attendance_percentage}%`
    );
    console.log(`  - Trend array length: ${classStats.trend.length}`);
  } else {
    console.error('✗ Class stats test failed');
  }

  // 3. Test: Stats with date range (student)
  console.log('\nStep 3: Testing student stats with date range...');
  const today = new Date();
  const startDate = new Date(today);
  startDate.setMonth(startDate.getMonth() - 1); // 1 month ago
  const endDate = new Date(today);
  endDate.setMonth(endDate.getMonth() + 1); // 1 month from now

  const studentStatsWithRange = await getAttendanceStatsWithDateRangeTest(
    courseId,
    studentEmail,
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0],
    false
  );

  if (studentStatsWithRange) {
    console.log('✓ Student stats with date range test passed');
  } else {
    console.error('✗ Student stats with date range test failed');
  }

  // 4. Test: Stats with date range (professor)
  console.log('\nStep 4: Testing professor stats with date range...');
  const classStatsWithRange = await getAttendanceStatsWithDateRangeTest(
    courseId,
    professorEmail,
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0],
    true
  );

  if (classStatsWithRange) {
    console.log('✓ Class stats with date range test passed');
  } else {
    console.error('✗ Class stats with date range test failed');
  }

  // 5. Test: Student trying to access class stats (should get their own stats, not class stats)
  console.log(
    '\nStep 5: Testing student accessing stats (should get own stats, not class stats)...'
  );
  const studentStatsCheck = await getStudentAttendanceStatsTest(
    courseId,
    studentEmail
  );

  if (
    studentStatsCheck &&
    studentStatsCheck.summary &&
    'present' in studentStatsCheck.summary
  ) {
    console.log('✓ Student correctly gets their own stats (not class stats)');
  } else {
    console.error('✗ Student stats format incorrect');
  }

  console.log('\n=== ATTENDANCE STATS TESTS COMPLETE ===\n');
}

// Export functions for use in other test files
module.exports = {
  activateAttendanceTest,
  createAttendanceTest,
  createAttendanceManualTest,
  createAttendanceWrongCodeTest,
  updateAttendanceTest,
  deleteAttendanceTest,
  runAttendanceTests,
  createAttendanceByCodeTest,
  createAttendanceExpiredCodeTest,
  createAttendanceInvalidCodeTest,
  runCodeBasedAttendanceTests,
  getStudentAttendanceStatsTest,
  getClassAttendanceStatsTest,
  getAttendanceStatsWithDateRangeTest,
  runAttendanceStatsTests,
  createLectureTest, // Export helper function
};

// Run tests if executed directly
if (require.main === module) {
  (async function main() {
    console.log('Starting Attendance Tests...\n');
    console.log('Make sure the server is running with:');
    console.log('  NODE_ENV=development TEST_MODE=true npm run dev\n');

    try {
      // Run regular attendance tests
      await runAttendanceTests();

      // Run code-based attendance tests
      await runCodeBasedAttendanceTests();

      // Run attendance stats tests
      await runAttendanceStatsTests();

      console.log('\nAll attendance tests completed!');
      process.exit(0);
    } catch (error) {
      console.error('\nTest execution failed:', error);
      process.exit(1);
    }
  })();
}
