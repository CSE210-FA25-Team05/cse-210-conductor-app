require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const {
  CourseRoles,
  GlobalRoles,
} = require('../src/services/shared/shared.enums');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log('Clearing existing data...');
  // await prisma.interaction_participants.deleteMany();
  // await prisma.interactions.deleteMany();
  // await prisma.interaction_configs.deleteMany();
  // await prisma.pulses.deleteMany();
  // await prisma.pulse_configs.deleteMany();
  // await prisma.attendances.deleteMany();
  // await prisma.lectures.deleteMany();
  // await prisma.ta_teams.deleteMany();
  // await prisma.enrollments.deleteMany();
  // // remove journals before deleting courses/users to avoid FK constraint issues
  // await prisma.journals.deleteMany();
  // await prisma.teams.deleteMany();
  // await prisma.courses.deleteMany();
  // await prisma.credentials.deleteMany();
  // await prisma.oauth_accounts.deleteMany();
  // await prisma.users.deleteMany();

  // Cascade will lead to truncation of all other dependent tables
  // Everything depends on either users or courses
  await prisma.$executeRaw`TRUNCATE TABLE users, courses RESTART IDENTITY CASCADE;`;

  // Seed users (5 professors + 45 students)
  console.log('Creating 50 users (5 professors + 45 students)...');

  const firstNames = [
    'John',
    'Jane',
    'Sam',
    'Alex',
    'Emma',
    'Michael',
    'Sarah',
    'David',
    'Lisa',
    'James',
    'Mary',
    'Robert',
    'Jennifer',
    'William',
    'Patricia',
    'Richard',
    'Jessica',
    'Joseph',
    'Karen',
    'Thomas',
    'Nancy',
    'Charles',
    'Betty',
    'Christopher',
    'Margaret',
    'Daniel',
    'Susan',
    'Matthew',
    'Dorothy',
    'Anthony',
    'Carol',
    'Mark',
    'Melissa',
    'Donald',
    'Deborah',
    'Steven',
    'Stephanie',
    'Paul',
    'Rebecca',
    'Andrew',
    'Sharon',
    'Joshua',
    'Laura',
    'Kenneth',
    'Cynthia',
    'Kevin',
    'Kathleen',
    'Brian',
    'Shirley',
    'George',
  ];

  const lastNames = [
    'Smith',
    'Johnson',
    'Williams',
    'Brown',
    'Jones',
    'Garcia',
    'Miller',
    'Davis',
    'Rodriguez',
    'Martinez',
    'Hernandez',
    'Lopez',
    'Gonzalez',
    'Wilson',
    'Anderson',
    'Thomas',
    'Taylor',
    'Moore',
    'Jackson',
    'Martin',
    'Lee',
    'Perez',
    'Thompson',
    'White',
    'Harris',
    'Sanchez',
    'Clark',
    'Ramirez',
    'Lewis',
    'Robinson',
  ];

  const pronouns = [
    'He/Him/His',
    'She/Her/Hers',
    'They/Them',
    'He/They',
    'She/They',
  ];

  const professorsData = [];
  const studentsData = [];

  // Create 5 professors
  for (let i = 1; i <= 5; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    professorsData.push({
      first_name: firstName,
      last_name: lastName,
      email: `prof${i}@ucsd.edu`,
      pronouns: pronouns[Math.floor(Math.random() * pronouns.length)],
      global_role: GlobalRoles.PROFESSOR,
      is_profile_complete: true,
    });
  }

  // Create 45 students (5% incomplete = ~2-3 students)
  for (let i = 1; i <= 45; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const isIncomplete = Math.random() < 0.05; // 5% incomplete

    studentsData.push({
      first_name: isIncomplete ? null : firstName,
      last_name: isIncomplete ? null : lastName,
      email: `student${i}@ucsd.edu`,
      pronouns: isIncomplete
        ? null
        : pronouns[Math.floor(Math.random() * pronouns.length)],
      global_role: GlobalRoles.STUDENT,
      is_profile_complete: !isIncomplete,
    });
  }

  // Batch create all users
  const allUsersData = [...professorsData, ...studentsData];
  const _createdUsers = await prisma.users.createMany({
    data: allUsersData,
  });

  // Fetch all created users to get their IDs
  const professors = await prisma.users.findMany({
    where: { global_role: GlobalRoles.PROFESSOR },
    take: 5,
  });

  const allStudents = await prisma.users.findMany({
    where: { global_role: GlobalRoles.STUDENT },
  });

  // Rename first few students for easier reference in tests
  const professor = professors[0];
  const ta = allStudents[0];
  const john = allStudents[1];
  const jane = allStudents[2];
  const incompleteUser =
    allStudents.find((s) => !s.is_profile_complete) || allStudents[3];
  const sam = allStudents[4];
  const alex = allStudents[5];

  // Seed courses (10 courses total, 2 per professor)
  console.log('Creating 10 courses...');
  const courseCodes = [
    'CSE110',
    'CSE111',
    'CSE210',
    'CSE211',
    'CSE212',
    'CSE310',
    'CSE311',
    'CSE312',
    'CSE411',
    'CSE412',
  ];
  const courseNames = [
    'Intro to Programming',
    'Intro to Programming II',
    'Software Engineering',
    'Software Engineering II',
    'Advanced Software Engineering',
    'Data Structures & Algorithms',
    'Database Systems',
    'Operating Systems',
    'Machine Learning',
    'Artificial Intelligence',
  ];

  const courses = [];

  for (let i = 0; i < 10; i++) {
    const course = await prisma.courses.create({
      data: {
        course_code: courseCodes[i],
        course_name: courseNames[i],
        term: 'FA25',
        section: 'A00',
        start_date: new Date('2025-09-23'),
        end_date: new Date('2025-12-12'),
        join_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        // Nested creation: assign a professor to teach this course
        enrollments: {
          create: {
            user_id: professors[Math.floor(i / 2) % professors.length].id, // Each professor teaches 2 courses
            role: CourseRoles.PROFESSOR,
          },
        },
      },
    });
    courses.push(course);
  }

  // Use first two courses for main seeding (references to old cse210 and cse110)
  const cse210 = courses[2];
  const cse110 = courses[0];

  // Seed enrollments (2-5 TAs and 20-30 students per course)
  console.log('Creating enrollments for courses...');

  const enrollmentData = [];

  // For each course, enroll TAs and students
  for (const course of courses) {
    // Enroll 2-5 random TAs per course
    const numTAs = Math.floor(Math.random() * 4) + 2; // 2-5 TAs
    const selectedTAs = new Set();

    while (selectedTAs.size < numTAs) {
      const randomTAIndex = Math.floor(Math.random() * allStudents.length);
      selectedTAs.add(randomTAIndex);
    }

    for (const taIndex of selectedTAs) {
      enrollmentData.push({
        user_id: allStudents[taIndex].id,
        course_id: course.id,
        role: CourseRoles.TA,
      });
    }

    // Enroll 20-30 random students per course
    const numStudents = Math.floor(Math.random() * 11) + 20; // 20-30 students
    const selectedStudents = new Set();

    while (selectedStudents.size < numStudents) {
      const randomStudentIndex = Math.floor(Math.random() * allStudents.length);
      if (selectedTAs.has(randomStudentIndex)) continue; // Avoid enrolling TAs as students too
      selectedStudents.add(randomStudentIndex);
    }

    for (const studentIndex of selectedStudents) {
      enrollmentData.push({
        user_id: allStudents[studentIndex].id,
        course_id: course.id,
        role: CourseRoles.STUDENT,
      });
    }
  }

  // Batch create all enrollments
  await prisma.enrollments.createMany({
    data: enrollmentData,
    skipDuplicates: true, // Skip if user is already enrolled in course
  });

  console.log(`Created enrollments for ${courses.length} courses.`);

  // Seed teams (create teams in 60% of courses)
  console.log('Creating teams in selected courses...');
  const teamNames = [
    'Team Alpha',
    'Team Beta',
    'Team Gamma',
    'Team Delta',
    'Team Epsilon',
    'Lab Group A',
    'Lab Group B',
    'Lab Group C',
    'Project Team 1',
    'Project Team 2',
  ];

  const teamsData = [];
  const courseTeamsMap = {}; // Map course ID to list of teams

  for (const course of courses) {
    // 60% chance a course will have teams
    if (Math.random() < 0.6) {
      // Create 2-4 teams per course
      const numTeams = Math.floor(Math.random() * 3) + 2;
      courseTeamsMap[course.id] = [];

      for (let i = 0; i < numTeams; i++) {
        teamsData.push({
          course_id: course.id,
          name: `${teamNames[i % teamNames.length]} ${i + 1}`,
          description: `Project team for ${course.course_code}`,
        });
      }
    }
  }

  // Batch create all teams
  const createdTeams = await prisma.teams.createMany({
    data: teamsData,
  });

  // Fetch created teams grouped by course
  const allTeams = await prisma.teams.findMany({
    where: {
      course_id: {
        in: courses.map((c) => c.id),
      },
    },
  });

  // Group teams by course ID
  for (const team of allTeams) {
    if (!courseTeamsMap[team.course_id]) {
      courseTeamsMap[team.course_id] = [];
    }
    courseTeamsMap[team.course_id].push(team);
  }

  // Seed TA team assignments
  console.log('Assigning TAs to teams...');
  const tATeamAssignments = [];

  // For each course with teams, assign TAs to teams
  for (const course of courses) {
    if (courseTeamsMap[course.id] && courseTeamsMap[course.id].length > 0) {
      // Get all TAs enrolled in this course
      const taEnrollments = await prisma.enrollments.findMany({
        where: {
          course_id: course.id,
          role: CourseRoles.TA,
        },
      });

      // Distribute TAs across teams
      const teams = courseTeamsMap[course.id];
      for (const team of teams) {
        const taToAssign = Math.floor(Math.random() * taEnrollments.length);
        tATeamAssignments.push({
          ta_user_id: taEnrollments[taToAssign].user_id,
          course_id: course.id,
          team_id: team.id,
        });
      }
    }
  }

  // Batch create all TA team assignments
  if (tATeamAssignments.length > 0) {
    await prisma.ta_teams.createMany({
      data: tATeamAssignments,
      skipDuplicates: true,
    });
  }

  console.log(
    `Created teams in ${Object.keys(courseTeamsMap).length} courses and assigned TAs.`
  );

  // Reference teams from CSE210 for remaining seeding tasks
  const team1 = courseTeamsMap[cse210.id]?.[0];
  const team2 = courseTeamsMap[cse210.id]?.[1];
  const team3 = courseTeamsMap[cse210.id]?.[2];
  const team4 = courseTeamsMap[cse110.id]?.[0];
  const team5 = courseTeamsMap[cse110.id]?.[1];

  // Update student enrollments to assign them to teams
  console.log('Assigning students to teams...');
  
  for (const course of courses) {
    if (courseTeamsMap[course.id] && courseTeamsMap[course.id].length > 0) {
      // Get all student enrollments in this course
      const studentEnrollments = await prisma.enrollments.findMany({
        where: {
          course_id: course.id,
          role: CourseRoles.STUDENT,
        },
      });

      // Distribute students across teams
      const teams = courseTeamsMap[course.id];
      const teamLeads = [];
      const numLeads = Math.random() < 0.25 ? 1 : 2;
      for (const studentEnrollment of studentEnrollments) {
        // Each student can be on 1 team (or no team if we wanted to randomize)
        const randomTeamIndex = Math.floor(Math.random() * teams.length);
        const teamId = teams[randomTeamIndex].id;

        // Randomly assign some students as team leads
        if (teamLeads.length < numLeads && Math.random() < 0.2) {
          teamLeads.push(studentEnrollment.user_id);
          // Update the enrollment to set is_team_lead
          await prisma.enrollments.update({
            where: { id: studentEnrollment.id },
            data: { role: CourseRoles.TEAM_LEAD, team_id: teamId },
          });
        } else{
          // Update the enrollment to assign the student to a team
          await prisma.enrollments.update({
            where: { id: studentEnrollment.id },
            data: { team_id: teamId },
          });
        }

      }
    }
  }

  console.log('Student team assignments completed.');

  // Seed lectures
  console.log('Creating lectures...');
  const lecture1 = await prisma.lectures.create({
    data: {
      course_id: cse210.id,
      lecture_date: new Date('2025-10-01'),
      code: 'CSE210-L1',
    },
  });

  const lecture2 = await prisma.lectures.create({
    data: {
      course_id: cse210.id,
      lecture_date: new Date('2025-10-03'),
      code: 'CSE210-L2',
    },
  });

  const lecture3 = await prisma.lectures.create({
    data: {
      course_id: cse110.id,
      lecture_date: new Date('2025-10-02'),
      code: 'CSE110-L1',
    },
  });

  // Seed attendances
  console.log('Creating attendances...');
  await prisma.attendances.create({
    data: {
      course_id: cse210.id,
      lecture_id: lecture1.id,
      user_id: john.id,
      updated_by: professor.id,
      update_reason: 'Initial attendance import',
    },
  });

  await prisma.attendances.create({
    data: {
      course_id: cse210.id,
      lecture_id: lecture1.id,
      user_id: jane.id,
      updated_by: professor.id,
      update_reason: 'Initial attendance import',
    },
  });

  await prisma.attendances.create({
    data: {
      course_id: cse210.id,
      lecture_id: lecture2.id,
      user_id: john.id,
      updated_by: ta.id,
      update_reason: 'Marked by TA during class',
    },
  });

  await prisma.attendances.create({
    data: {
      course_id: cse110.id,
      lecture_id: lecture3.id,
      user_id: john.id,
      updated_by: ta.id,
      update_reason: 'First lab session',
    },
  });

  await prisma.attendances.create({
    data: {
      course_id: cse110.id,
      lecture_id: lecture3.id,
      user_id: jane.id,
      updated_by: ta.id,
      update_reason: 'First lab session',
    },
  });

  console.log('Creating journals...');
  await prisma.journals.create({
    data: {
      course_id: cse210.id,
      user_id: john.id,
      title: 'Reflection on Lecture 1',
      content:
        'Today we covered the project structure and responsibilities. I need to finish the README and set up CI.',
      is_private: false,
    },
  });

  await prisma.journals.create({
    data: {
      course_id: cse210.id,
      user_id: john.id,
      title: 'Project brainstorming',
      content:
        'Thinking about using a microservice architecture for the project; need to evaluate complexity.',
      is_private: false,
      created_at: new Date('2025-10-01T12:00:00Z'),
      updated_at: new Date('2025-10-06T16:20:00Z'), // edited later
    },
  });

  await prisma.journals.create({
    data: {
      course_id: cse110.id,
      user_id: john.id,
      title: 'Extra lab observations',
      content:
        'Encountered a bug in exercise 2; solved by adjusting index logic.',
      is_private: true,
      created_at: new Date('2025-10-02T15:00:00Z'),
      updated_at: new Date('2025-10-02T18:30:00Z'), // edited same day
    },
  });

  await prisma.journals.create({
    data: {
      course_id: cse110.id,
      user_id: john.id,
      title: 'Lab thoughts',
      content:
        'Lab 1 was straightforward. Need to review arrays and loops for next lab.',
      is_private: false,
    },
  });

  await prisma.journals.create({
    data: {
      course_id: cse210.id,
      user_id: jane.id,
      title: 'Notes about teammates',
      content:
        'Team 2 agreed on weekly meetings. I will own the documentation.',
      is_private: true,
      created_at: new Date('2025-10-03T10:45:00Z'),
      updated_at: new Date('2025-10-03T10:45:00Z'),
    },
  });
  await prisma.journals.create({
    data: {
      course_id: cse110.id,
      user_id: jane.id,
      title: 'Lab tips',
      content:
        'Remember to run tests after each change; the CI pipeline flags style issues.',
      is_private: false,
      created_at: new Date('2025-10-02T11:20:00Z'),
      updated_at: new Date('2025-10-02T11:20:00Z'),
    },
  });

  await prisma.journals.create({
    data: {
      course_id: cse210.id,
      user_id: jane.id,
      title: 'Team formation notes',
      content:
        'Met with Team 2; we will use GitHub Projects to track tasks and meet twice a week.',
      is_private: true,
    },
  });

  // Example instructor note (attached to course but authored by professor)
  await prisma.journals.create({
    data: {
      course_id: cse210.id,
      user_id: professor.id,
      title: 'Course announcement draft',
      content:
        'Reminder: project proposals due next Friday. Office hours moved to Wednesday.',
      is_private: true,
    },
  });

  await prisma.journals.create({
    data: {
      course_id: cse210.id,
      user_id: ta.id,
      title: 'TA notes on lab grading',
      content:
        'Grading rubric seems fair. I will prepare solutions and gradebook entries this weekend.',
      is_private: false,
      created_at: new Date('2025-10-04T09:00:00Z'),
      updated_at: new Date('2025-10-04T09:00:00Z'),
    },
  });

  await prisma.journals.create({
    data: {
      course_id: cse210.id,
      user_id: ta.id,
      title: 'TA private reminder',
      content: 'Remember to finalize office hours and announce in Slack.',
      is_private: true,
      created_at: new Date('2025-10-05T08:30:00Z'),
      updated_at: new Date('2025-10-07T14:15:00Z'), // edited later
    },
  });

  console.log('Creating pulse configs...');
  const cse210_pulse_config = await prisma.pulse_configs.create({
    data: {
      course_id: cse210.id,
      config: {
        options: [
          { value: 'Happy', color: 'green' },
          { value: 'Tired', color: 'yellow' },
          { value: 'Concerned', color: 'orange' },
          { value: 'Worried', color: 'red' },
          { value: 'Sad', color: 'blue' },
        ],
      },
      is_editable: false,
    },
  });

  await prisma.pulse_configs.create({
    data: {
      course_id: cse110.id,
      config: {
        options: [
          { value: 'Good', color: 'green' },
          { value: 'Neutral', color: 'blue' },
          { value: 'Bad', color: 'red' },
        ],
      },
      is_editable: true,
    },
  });

  console.log('Creating pulses...');
  // Pulse options for CSE210
  const pulseOptions = ['Happy', 'Tired', 'Concerned', 'Worried', 'Sad'];
  const descriptions = [
    'Feeling good about our project progress!',
    'A bit overwhelmed with the workload.',
    'Need to catch up on readings.',
    'Team meeting went well today.',
    'Struggling with the latest assignment.',
    'Excited about the new project phase.',
    'Feeling confident about the exam.',
    'Need help with debugging.',
    'Great collaboration with teammates.',
    'Concerned about the upcoming deadlines.',
  ];

  // Generate hundreds of pulse records spread over multiple days
  const numPulses = 500; // Generate 500 pulses
  const students = [professor, ta, john, jane, incompleteUser]; // Students who can submit pulses
  const teamsMap = {
    [john.id]: team1,
    [jane.id]: team2,
  };
  const courseStartDate = new Date('2025-09-23');
  const courseEndDate = new Date('2025-12-12');
  const daysDiff =
    Math.floor((courseEndDate - courseStartDate) / (1000 * 60 * 60 * 24)) + 1;

  const pulseData = [];

  for (let i = 0; i < numPulses; i++) {
    // Random date within course period
    const randomDay = Math.floor(Math.random() * daysDiff);
    const randomDate = new Date(courseStartDate);
    randomDate.setDate(randomDate.getDate() + randomDay);

    // Random time during the day (between 8 AM and 6 PM)
    const randomHour = 8 + Math.floor(Math.random() * 10);
    const randomMinute = Math.floor(Math.random() * 60);
    randomDate.setHours(randomHour, randomMinute, 0, 0);

    // Random student
    const randomStudent = students[Math.floor(Math.random() * students.length)];

    // Random team (some pulses might not have a team)
    const team = teamsMap[randomStudent.id];

    // Random pulse value
    const randomValue =
      pulseOptions[Math.floor(Math.random() * pulseOptions.length)];

    // Only 30% of pulses have descriptions
    const hasDescription = Math.random() < 0.3;
    const randomDescription = hasDescription
      ? descriptions[Math.floor(Math.random() * descriptions.length)]
      : null;

    pulseData.push({
      course_id: cse210.id,
      user_id: randomStudent.id,
      team_id: team ? team.id : null,
      pulse_config_id: cse210_pulse_config.id,
      value: randomValue,
      description: randomDescription,
      created_at: randomDate,
    });
  }

  // Batch insert pulses (Prisma supports createMany)
  await prisma.pulses.createMany({
    data: pulseData,
  });

  console.log(`Created ${numPulses} pulse records for testing.`);

  console.log('Creating interaction configs...');
  const cse210_interaction_config = await prisma.interaction_configs.create({
    data: {
      course_id: cse210.id,
      config: {
        options: [
          { value: 'positive', color: 'rgb(0, 255, 0)' },
          { value: 'negative', color: 'rgb(255, 0, 0)' },
          { value: 'neutral', color: 'rgb(128, 128, 128)' },
        ],
      },
      is_editable: false,
    },
  });

  const cse110_interaction_config = await prisma.interaction_configs.create({
    data: {
      course_id: cse110.id,
      config: {
        options: [
          { value: 'positive', color: 'rgb(0, 255, 0)' },
          { value: 'negative', color: 'rgb(255, 0, 0)' },
          { value: 'neutral', color: 'rgb(128, 128, 128)' },
        ],
      },
      is_editable: true,
    },
  });

  console.log('Creating interactions...');
  const interaction1 = await prisma.interactions.create({
    data: {
      course_id: cse210.id,
      author_id: professor.id,
      interaction_config_id: cse210_interaction_config.id,
      value: 'positive',
      description:
        'John answered a question about design patterns during lecture. Great explanation!',
      created_at: new Date('2025-10-01T10:30:00Z'),
    },
  });

  const interaction2 = await prisma.interactions.create({
    data: {
      course_id: cse210.id,
      author_id: ta.id,
      interaction_config_id: cse210_interaction_config.id,
      value: 'positive',
      description:
        'Jane came to office hours and asked thoughtful questions about the project requirements.',
      created_at: new Date('2025-10-02T14:00:00Z'),
    },
  });

  const interaction3 = await prisma.interactions.create({
    data: {
      course_id: cse210.id,
      author_id: professor.id,
      interaction_config_id: cse210_interaction_config.id,
      value: 'neutral',
      description:
        'Team discussion during class about project scope. Need to follow up.',
      created_at: new Date('2025-10-03T11:15:00Z'),
    },
  });

  const interaction4 = await prisma.interactions.create({
    data: {
      course_id: cse110.id,
      author_id: ta.id,
      interaction_config_id: cse110_interaction_config.id,
      value: 'positive',
      description:
        'John helped another student debug their code during lab. Great teamwork!',
      created_at: new Date('2025-10-02T15:30:00Z'),
    },
  });

  const interaction5 = await prisma.interactions.create({
    data: {
      course_id: cse110.id,
      author_id: professor.id,
      interaction_config_id: cse110_interaction_config.id,
      value: 'negative',
      description:
        'Student missed multiple office hours appointments without notice.',
      created_at: new Date('2025-10-02T09:45:00Z'),
    },
  });

  const interaction6 = await prisma.interactions.create({
    data: {
      course_id: cse210.id,
      author_id: ta.id,
      interaction_config_id: cse210_interaction_config.id,
      value: 'negative',
      description:
        'Sam submitted the assignment late without requesting an extension.',
      created_at: new Date('2025-10-05T12:15:00Z'),
    },
  });

  const interaction7 = await prisma.interactions.create({
    data: {
      course_id: cse210.id,
      author_id: professor.id,
      interaction_config_id: cse210_interaction_config.id,
      value: 'positive',
      description:
        'Alex led the team stand-up and ensured everyone stayed on track.',
      created_at: new Date('2025-10-06T16:45:00Z'),
    },
  });

  const interaction8 = await prisma.interactions.create({
    data: {
      course_id: cse210.id,
      author_id: ta.id,
      interaction_config_id: cse210_interaction_config.id,
      value: 'neutral',
      description:
        'In-class peer review — several students shared partial solutions.',
      created_at: new Date('2025-10-07T09:20:00Z'),
    },
  });

  const interaction9 = await prisma.interactions.create({
    data: {
      course_id: cse110.id,
      author_id: professor.id,
      interaction_config_id: cse110_interaction_config.id,
      value: 'positive',
      description:
        'Sam and Jane paired up in lab and finished the exercise early.',
      created_at: new Date('2025-10-03T13:10:00Z'),
    },
  });

  const interaction10 = await prisma.interactions.create({
    data: {
      course_id: cse110.id,
      author_id: ta.id,
      interaction_config_id: cse110_interaction_config.id,
      value: 'neutral',
      description:
        'General reminder about the upcoming quiz — several students stayed back to ask clarifying questions.',
      created_at: new Date('2025-10-04T10:00:00Z'),
    },
  });

  console.log('Creating interaction participants...');
  // Interaction 1: John participated
  await prisma.interaction_participants.create({
    data: {
      interaction_id: interaction1.id,
      user_id: john.id,
    },
  });

  // Interaction 2: Jane participated
  await prisma.interaction_participants.create({
    data: {
      interaction_id: interaction2.id,
      user_id: jane.id,
    },
  });

  // Interaction 3: Both John and Jane participated in team discussion
  await prisma.interaction_participants.create({
    data: {
      interaction_id: interaction3.id,
      user_id: john.id,
    },
  });

  await prisma.interaction_participants.create({
    data: {
      interaction_id: interaction3.id,
      user_id: jane.id,
    },
  });

  // Interaction 4: John participated
  await prisma.interaction_participants.create({
    data: {
      interaction_id: interaction4.id,
      user_id: john.id,
    },
  });

  // Interaction 5: Jane participated
  await prisma.interaction_participants.create({
    data: {
      interaction_id: interaction5.id,
      user_id: jane.id,
    },
  });

  // Interaction 6 – Sam
  await prisma.interaction_participants.create({
    data: {
      interaction_id: interaction6.id,
      user_id: sam.id,
    },
  });

  // Interaction 7 – Alex
  await prisma.interaction_participants.create({
    data: {
      interaction_id: interaction7.id,
      user_id: alex.id,
    },
  });

  // Interaction 8 – group: John, Jane, Sam, Alex
  await prisma.interaction_participants.create({
    data: { interaction_id: interaction8.id, user_id: john.id },
  });
  await prisma.interaction_participants.create({
    data: { interaction_id: interaction8.id, user_id: jane.id },
  });
  await prisma.interaction_participants.create({
    data: { interaction_id: interaction8.id, user_id: sam.id },
  });
  await prisma.interaction_participants.create({
    data: { interaction_id: interaction8.id, user_id: alex.id },
  });

  // Interaction 9 – Sam + Jane
  await prisma.interaction_participants.create({
    data: { interaction_id: interaction9.id, user_id: sam.id },
  });
  await prisma.interaction_participants.create({
    data: { interaction_id: interaction9.id, user_id: jane.id },
  });

  // Interaction 10 – all four
  await prisma.interaction_participants.create({
    data: { interaction_id: interaction10.id, user_id: john.id },
  });
  await prisma.interaction_participants.create({
    data: { interaction_id: interaction10.id, user_id: jane.id },
  });
  await prisma.interaction_participants.create({
    data: { interaction_id: interaction10.id, user_id: sam.id },
  });
  await prisma.interaction_participants.create({
    data: { interaction_id: interaction10.id, user_id: alex.id },
  });

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
