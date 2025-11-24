-- Remove all data from tables while keeping the schema intact.
-- Order matters: child tables must be truncated before parent tables.

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
