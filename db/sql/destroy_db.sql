-- Drop all tables and fully remove their schema.
-- CASCADE ensures dependent objects are also removed.

DROP TABLE IF EXISTS attendances   CASCADE;
DROP TABLE IF EXISTS lectures      CASCADE;
DROP TABLE IF EXISTS ta_teams      CASCADE;
DROP TABLE IF EXISTS enrollments   CASCADE;
DROP TABLE IF EXISTS teams         CASCADE;
DROP TABLE IF EXISTS courses       CASCADE;
DROP TABLE IF EXISTS oauth_accounts CASCADE;
DROP TABLE IF EXISTS credentials    CASCADE;
DROP TABLE IF EXISTS users          CASCADE;
