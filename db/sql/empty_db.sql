TRUNCATE TABLE
    attendances,
    lectures,
    ta_teams,
    enrollments,
    teams,
    courses,
    oauth_accounts,
    credentials,
    users
RESTART IDENTITY CASCADE;
