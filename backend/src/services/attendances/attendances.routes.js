'use strict';

/**
 * Attendances Routes
 *
 * POST   /courses/:course_id/attendances - Create attendance by code (simplified flow for students)
 * GET    /courses/:course_id/lectures/:lecture_id/attendances - Get all attendances for a lecture
 * GET    /courses/:course_id/lectures/:lecture_id/attendances/stats - Get attendance statistics
 * POST   /courses/:course_id/lectures/:lecture_id/attendances - Create a new attendance record
 * PATCH  /courses/:course_id/lectures/:lecture_id/attendances/:attendance_id - Update an attendance record
 * DELETE /courses/:course_id/lectures/:lecture_id/attendances/:attendance_id - Delete an attendance record
 */

const { mapAndReply } = require('../../utils/error-map');
const AttendancesRepo = require('./attendances.repo');
const AttendancesService = require('./attendances.service');
const AttendancesPermissions = require('./attendances.permissions');
const LecturesRepo = require('../lectures/lectures.repo');
const attendancesSchemas = require('./attendances.schemas');

async function routes(fastify) {
  const attendancesRepo = new AttendancesRepo(fastify.db);
  const lecturesRepo = new LecturesRepo(fastify.db);
  const attendancesPermissions = new AttendancesPermissions(attendancesRepo);
  const attendancesService = new AttendancesService(
    attendancesRepo,
    attendancesPermissions,
    lecturesRepo
  );

  // Create attendance by code (simplified flow for students)
  fastify.post(
    '/courses/:course_id/attendances',
    {
      preHandler: fastify.loadCourse,
      schema: attendancesSchemas.CreateAttendanceByCodeSchema,
    },
    async (req, reply) => {
      try {
        const attendance = await attendancesService.createAttendanceByCode(
          req.user,
          req.course,
          req.enrollment,
          req.body.code
        );
        return reply.code(201).send(attendance);
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  // Get all attendances for a lecture
  fastify.get(
    '/courses/:course_id/lectures/:lecture_id/attendances',
    {
      preHandler: [fastify.loadCourse, fastify.loadLecture],
      schema: attendancesSchemas.GetAttendancesSchema,
    },
    async (req, reply) => {
      try {
        const attendances = await attendancesService.getAttendancesByLecture(
          req.user,
          req.course,
          req.enrollment,
          req.lecture
        );
        return reply.send({ attendances });
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  // Get attendance statistics for a lecture
  fastify.get(
    '/courses/:course_id/lectures/:lecture_id/attendances/stats',
    {
      preHandler: [fastify.loadCourse, fastify.loadLecture],
      schema: attendancesSchemas.GetAttendanceStatsSchema,
    },
    async (req, reply) => {
      try {
        const stats = await attendancesService.getAttendanceStats(
          req.user,
          req.course,
          req.enrollment,
          req.lecture
        );
        return reply.send(stats);
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  // Create a new attendance record
  fastify.post(
    '/courses/:course_id/lectures/:lecture_id/attendances',
    {
      preHandler: [fastify.loadCourse, fastify.loadLecture],
      schema: attendancesSchemas.CreateAttendanceSchema,
    },
    async (req, reply) => {
      try {
        const attendance = await attendancesService.createAttendance(
          req.user,
          req.course,
          req.enrollment,
          req.lecture,
          req.body
        );
        return reply.code(201).send(attendance);
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  // Update an attendance record
  fastify.patch(
    '/courses/:course_id/lectures/:lecture_id/attendances/:attendance_id',
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
    '/courses/:course_id/lectures/:lecture_id/attendances/:attendance_id',
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
