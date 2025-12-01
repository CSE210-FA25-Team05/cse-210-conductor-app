'use strict';

/**
 * Attendances Routes
 *
 * POST   /api/courses/:course_id/lectures/:lecture_id/attendances - Create a new attendance record
 * PATCH  /api/courses/:course_id/lectures/:lecture_id/attendances/:attendance_id - Update an attendance record
 * DELETE /api/courses/:course_id/lectures/:lecture_id/attendances/:attendance_id - Delete an attendance record
 */

const { mapAndReply } = require('../../utils/error-map');
const AttendancesRepo = require('./attendances.repo');
const AttendancesService = require('./attendances.service');
const AttendancesPermissions = require('./attendances.permissions');
const attendancesSchemas = require('./attendances.schemas');

async function routes(fastify) {
  const attendancesRepo = new AttendancesRepo(fastify.db);
  const attendancesPermissions = new AttendancesPermissions(attendancesRepo);
  const attendancesService = new AttendancesService(
    attendancesRepo,
    attendancesPermissions
  );

  // Create a new attendance record
  fastify.post(
    '/api/courses/:course_id/lectures/:lecture_id/attendances',
    {
      preHandler: [fastify.loadCourse, fastify.loadLecture],
      schema: attendancesSchemas.CreateAttendanceSchema,
    },
    async (req, reply) => {
      try {
        fastify.log.info(
          { 
            body: req.body, 
            lecture: req.lecture,
            user: req.user?.id 
          }, 
          'Creating attendance'
        );
        const attendance = await attendancesService.createAttendance(
          req.user,
          req.course,
          req.enrollment,
          req.lecture,
          req.body
        );
        return reply.code(201).send(attendance);
      } catch (error) {
        fastify.log.error(
          { 
            error: error.message, 
            stack: error.stack,
            code: error.code,
            body: req.body 
          }, 
          'Error creating attendance'
        );
        return mapAndReply(error, reply);
      }
    }
  );

  // Update an attendance record
  fastify.patch(
    '/api/courses/:course_id/lectures/:lecture_id/attendances/:attendance_id',
    {
      preHandler: [fastify.loadCourse, fastify.loadLecture],
      schema: attendancesSchemas.UpdateAttendanceSchema,
    },
    async (req, reply) => {
      try {
        const attendanceId = parseInt(req.params.attendance_id, 10);
        const attendance = await attendancesService.updateAttendance(
          req.user,
          req.course,
          req.enrollment,
          req.lecture,
          attendanceId,
          req.body
        );
        return reply.send(attendance);
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  // Delete an attendance record
  fastify.delete(
    '/api/courses/:course_id/lectures/:lecture_id/attendances/:attendance_id',
    {
      preHandler: [fastify.loadCourse, fastify.loadLecture],
      schema: attendancesSchemas.DeleteAttendanceSchema,
    },
    async (req, reply) => {
      try {
        const attendanceId = parseInt(req.params.attendance_id, 10);
        await attendancesService.deleteAttendance(
          req.user,
          req.course,
          req.enrollment,
          req.lecture,
          attendanceId
        );
        return reply.send({ message: 'Attendance deleted successfully' });
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );
}

module.exports = routes;

