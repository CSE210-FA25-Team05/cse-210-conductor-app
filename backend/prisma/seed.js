require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log('Clearing existing data...');
  await prisma.interaction_participants.deleteMany();
  await prisma.interactions.deleteMany();
  await prisma.interaction_configs.deleteMany();
  await prisma.pulses.deleteMany();
  await prisma.pulse_configs.deleteMany();
  await prisma.attendances.deleteMany();
  await prisma.lectures.deleteMany();
  await prisma.ta_teams.deleteMany();
  await prisma.enrollments.deleteMany();
  // remove journals before deleting courses/users to avoid FK constraint issues
  await prisma.journals.deleteMany();
  await prisma.teams.deleteMany();
  await prisma.courses.deleteMany();
  await prisma.credentials.deleteMany();
  await prisma.oauth_accounts.deleteMany();
  await prisma.users.deleteMany();

  // Seed users
  console.log('Creating users...');
  const professor = await prisma.users.create({
    data: {
      first_name: 'Professor',
      last_name: 'Mathematics',
      email: 'mathprof@ucsd.edu',
      pronouns: 'She/Her/Hers',
      global_role: 'professor',
    },
  });

  const ta = await prisma.users.create({
    data: {
      first_name: 'TA',
      last_name: 'Genius',
      email: 'genius_ta@ucsd.edu',
      pronouns: 'He/Him/His',
      global_role: 'student',
    },
  });

  const john = await prisma.users.create({
    data: {
      first_name: 'John',
      last_name: 'Doe',
      email: 'jdoe@ucsd.edu',
      pronouns: 'He/Him/His',
      global_role: 'student',
    },
  });

  const jane = await prisma.users.create({
    data: {
      first_name: 'Jane',
      last_name: 'Doe',
      email: 'jd563@ucsd.edu',
      pronouns: 'She/Her/Hers',
      global_role: 'student',
    },
  });

  // Seed courses
  console.log('Creating courses...');
  const cse210 = await prisma.courses.create({
    data: {
      course_code: 'CSE210',
      course_name: 'Software Engineering',
      term: 'FA25',
      section: 'A00',
      start_date: new Date('2025-09-23'),
      end_date: new Date('2025-12-12'),
      join_code: 'ABCDEF',
    },
  });

  const cse110 = await prisma.courses.create({
    data: {
      course_code: 'CSE110',
      course_name: 'Intro to Programming',
      term: 'FA25',
      section: 'A00',
      start_date: new Date('2025-09-23'),
      end_date: new Date('2025-12-12'),
      join_code: 'HIJKLM',
    },
  });

  // Seed teams
  console.log('Creating teams...');
  const team1 = await prisma.teams.create({
    data: {
      course_id: cse210.id,
      name: 'Team 1',
      description: 'Project Team 1 for CSE210',
    },
  });

  const team2 = await prisma.teams.create({
    data: {
      course_id: cse210.id,
      name: 'Team 2',
      description: 'Project Team 2 for CSE210',
    },
  });

  const team3 = await prisma.teams.create({
    data: {
      course_id: cse210.id,
      name: 'Team 3',
      description: 'Project Team 3 for CSE210',
    },
  });

  const team4 = await prisma.teams.create({
    data: {
      course_id: cse110.id,
      name: 'Lab Team A',
      description: 'Lab team A for CSE110',
    },
  });

  const team5 = await prisma.teams.create({
    data: {
      course_id: cse110.id,
      name: 'Lab Team B',
      description: 'Lab team B for CSE110',
    },
  });

  // Seed enrollments
  console.log('Creating enrollments...');
  await prisma.enrollments.create({
    data: {
      user_id: professor.id,
      course_id: cse210.id,
      role: 'professor',
    },
  });

  await prisma.enrollments.create({
    data: {
      user_id: professor.id,
      course_id: cse110.id,
      role: 'professor',
    },
  });

  await prisma.enrollments.create({
    data: {
      user_id: ta.id,
      course_id: cse210.id,
      role: 'ta',
    },
  });

  await prisma.enrollments.create({
    data: {
      user_id: ta.id,
      course_id: cse110.id,
      role: 'ta',
    },
  });

  await prisma.enrollments.create({
    data: {
      user_id: john.id,
      course_id: cse210.id,
      team_id: team1.id,
      role: 'student',
    },
  });

  await prisma.enrollments.create({
    data: {
      user_id: jane.id,
      course_id: cse210.id,
      team_id: team2.id,
      role: 'student',
    },
  });

  await prisma.enrollments.create({
    data: {
      user_id: john.id,
      course_id: cse110.id,
      team_id: team4.id,
      role: 'student',
    },
  });

  await prisma.enrollments.create({
    data: {
      user_id: jane.id,
      course_id: cse110.id,
      team_id: team5.id,
      role: 'student',
    },
  });

  // Seed TA team assignments
  console.log('Creating TA team assignments...');
  await prisma.ta_teams.create({
    data: {
      ta_user_id: ta.id,
      course_id: cse210.id,
      team_id: team1.id,
    },
  });

  await prisma.ta_teams.create({
    data: {
      ta_user_id: ta.id,
      course_id: cse210.id,
      team_id: team2.id,
    },
  });

  await prisma.ta_teams.create({
    data: {
      ta_user_id: ta.id,
      course_id: cse110.id,
      team_id: team4.id,
    },
  });

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
        text: 'How are you feeling about the progress of your team project?',
        options: [
          { value: 'Happy', color: 'rgb(0, 255, 0)' },
          { value: 'Tired', color: 'rgb(255, 243, 21)' },
          { value: 'Concerned', color: 'rgba(255, 153, 0, 1)' },
          { value: 'Worried', color: 'rgb(255, 0, 0)' },
          { value: 'Sad', color: 'rgb(0, 0, 255)' },
        ],
      },
      is_editable: false,
    },
  });

  await prisma.pulse_configs.create({
    data: {
      course_id: cse110.id,
      config: {
        text: 'What do you think about the course so far?',
        options: [
          { value: 'Good', color: 'rgb(0, 255, 0)' },
          { value: 'Neutral', color: 'rgb(0, 0, 255)' },
          { value: 'Bad', color: 'rgb(255, 0, 0)' },
        ],
      },
      is_editable: true,
    },
  });

  console.log('Creating pulses...');
  await prisma.pulses.create({
    data: {
      course_id: cse210.id,
      user_id: john.id,
      pulse_config_id: cse210_pulse_config.id,
      value: 'Happy',
      description: 'Feeling good about our project progress!',
      created_at: new Date('2025-10-01T09:00:00Z'),
    },
  });

  await prisma.pulses.create({
    data: {
      course_id: cse210.id,
      user_id: jane.id,
      pulse_config_id: cse210_pulse_config.id,
      value: 'Tired',
      description: 'A bit overwhelmed with the workload.',
      created_at: new Date('2025-10-01T09:05:00Z'),
    },
  });

  await prisma.pulses.create({
    data: {
      course_id: cse210.id,
      user_id: john.id,
      pulse_config_id: cse210_pulse_config.id,
      value: 'Concerned',
      created_at: new Date('2025-10-08T09:00:00Z'),
    },
  });

  await prisma.pulses.create({
    data: {
      course_id: cse210.id,
      user_id: ta.id,
      pulse_config_id: cse210_pulse_config.id,
      value: 'Worried',
      description:
        'Concerned about the upcoming deadlines and progress of team 5.',
      created_at: new Date('2025-10-08T09:10:00Z'),
    },
  });

  console.log('Creating interaction configs...');
  const cse210_interaction_config = await prisma.interaction_configs.create({
    data: {
      course_id: cse210.id,
      config: {
        text: 'Record an interaction with students',
        options: ['positive', 'negative', 'neutral'],
      },
    },
  });

  const cse110_interaction_config = await prisma.interaction_configs.create({
    data: {
      course_id: cse110.id,
      config: {
        text: 'Record an interaction with students',
        options: ['positive', 'negative', 'neutral'],
      },
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
