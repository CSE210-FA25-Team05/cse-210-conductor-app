# Attendance System Updates

## New Features

### Code-based Attendance Endpoint
- **POST** `/courses/:course_id/attendances` - Students can mark attendance with just a code
- Request: `{ "code": "ABC123" }`
- Errors: `404` (invalid code), `410` (expired code), `409` (already exists)

### Attendance Stats API
- **GET** `/courses/:course_id/attendances/stats` - Role-based statistics
- Query params: `start_time`, `end_time` (optional, ISO date format)
- **Students**: Returns personal stats (total/present/absent/percentage) + lecture breakdown
- **Professors/TAs**: Returns class-wide stats (enrollment, attendance trends) + per-lecture trend data

## Fixes

- Added `team_lead` role support in attendance counts and permissions
- Moved business logic from repository to service layer (`lectures`, `course`)
- Removed duplicate `generateJoinCode()` - now uses shared `generateCode()` utility

## Testing

- Refactored attendance tests into `tests/attendance.js`
- Added stats API tests
- Run: `npm run test:attendance`

## Technical Details

- Only counts completed lectures (where `code_expires_at < now`)
- Error codes: `404` (invalid), `410` (expired), `400` (bad request), `403` (forbidden), `409` (conflict)
- Date range filtering by `lecture_date`
- Unified code generation via `utils/code-generator.js`
