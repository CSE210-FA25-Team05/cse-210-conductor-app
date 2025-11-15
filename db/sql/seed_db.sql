-- Seed users
INSERT INTO users (first_name, last_name, email, pronouns, global_role) VALUES
    ('Professor', 'Mathematics', 'mathprof@ucsd.edu', 'She/Her/Hers', 'professor'),
    ('TA',        'Genius',      'genius_ta@ucsd.edu', 'He/Him/His',   'student'),
    ('John',      'Doe',         'jdoe@ucsd.edu',      'He/Him/His',   'student'),
    ('Jane',      'Doe',         'jd563@ucsd.edu',     'She/Her/Hers', 'student');

-- Seed courses
INSERT INTO courses (course_code, course_name, term, section, start_date, end_date) VALUES
    ('CSE210', 'Software Engineering',  'FA25', 'A00', '2025-09-23', '2025-12-12'),
    ('CSE110', 'Intro to Programming',  'FA25', 'A00', '2025-09-23', '2025-12-12');

INSERT INTO teams (course_id, name, description) VALUES
    (1, 'Team 1',     'Project Team 1 for CSE210'),
    (1, 'Team 2',     'Project Team 2 for CSE210'),
    (1, 'Team 3',     'Project Team 3 for CSE210'),
    (2, 'Lab Team A', 'Lab team A for CSE110'),
    (2, 'Lab Team B', 'Lab team B for CSE110');

-- Professor enrollments 
INSERT INTO enrollments (user_id, course_id, role) VALUES
    (1, 1, 'professor'),
    (1, 2, 'professor');

-- TA enrollments 
INSERT INTO enrollments (user_id, course_id, role) VALUES
    (2, 1, 'ta'),
    (2, 2, 'ta');

-- Student enrollments for CSE210 
INSERT INTO enrollments (user_id, course_id, team_id, role) VALUES
    (3, 1, 1, 'student'),  
    (4, 1, 2, 'student');  

-- Student enrollments for CSE110 
INSERT INTO enrollments (user_id, course_id, team_id, role) VALUES
    (3, 2, 4, 'student'),  
    (4, 2, 5, 'student');  

-- TA team assignments
INSERT INTO ta_teams (ta_user_id, course_id, team_id) VALUES
    (2, 1, 1),
    (2, 1, 2),
    (2, 2, 4);

-- Seed lectures
INSERT INTO lectures (course_id, lecture_date, code) VALUES
    (1, '2025-10-01', 'CSE210-L1'),
    (1, '2025-10-03', 'CSE210-L2'),
    (2, '2025-10-02', 'CSE110-L1');

-- CSE210 Lecture 1: both students present
INSERT INTO attendances (course_id, lecture_id, student_id, updated_by, update_reason) VALUES
    (1, 1, 3, 1, 'Initial attendance import'),
    (1, 1, 4, 1, 'Initial attendance import');

-- CSE210 Lecture 2: only John present
INSERT INTO attendances (course_id, lecture_id, student_id, updated_by, update_reason) VALUES
    (1, 2, 3, 2, 'Marked by TA during class');

-- CSE110 Lecture 1: both students present
INSERT INTO attendances (course_id, lecture_id, student_id, updated_by, update_reason) VALUES
    (2, 3, 3, 2, 'First lab session'),
    (2, 3, 4, 2, 'First lab session');
