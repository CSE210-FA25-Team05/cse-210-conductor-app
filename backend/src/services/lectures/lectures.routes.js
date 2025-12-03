'use strict';

/**
 * Lectures Routes
 *
 * GET    /api/courses/:course_id/lectures           - Get all lectures for a course
 * GET    /api/courses/:course_id/lectures/:lecture_id - Get one specific lecture
 * POST   /api/courses/:course_id/lectures           - Create a new lecture (professor/TA only)
 * PATCH  /api/courses/:course_id/lectures/:lecture_id - Update a lecture (professor/TA only)
 * DELETE /api/courses/:course_id/lectures/:lecture_id - Delete a lecture (professor/TA only)
 */

const { mapAndReply } = require('../../utils/error-map');
const LecturesRepo = require('./lectures.repo');
const LecturesService = require('./lectures.service');
const LecturesPermissions = require('./lectures.permissions');
const lecturesSchemas = require('./lectures.schemas');

async function routes(fastify) {
  const lecturesRepo = new LecturesRepo(fastify.db);
  const lecturesPermissions = new LecturesPermissions(lecturesRepo);
  const lecturesService = new LecturesService(
    lecturesRepo,
    lecturesPermissions
  );

  // Get all lectures for a course
  fastify.get(
    '/api/courses/:course_id/lectures',
    {
      preHandler: fastify.loadCourse,
      schema: lecturesSchemas.GetAllLecturesSchema,
    },
    async (req, reply) => {
      try {
        const lectures = await lecturesService.getAllLectures(
          req.user,
          req.course,
          req.enrollment
        );
        return reply.send({ lectures });
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  // Get a single lecture
  fastify.get(
    '/api/courses/:course_id/lectures/:lecture_id',
    {
      preHandler: fastify.loadCourse,
      schema: lecturesSchemas.GetLectureSchema,
    },
    async (req, reply) => {
      try {
        const lectureId = parseInt(req.params.lecture_id, 10);
        const lecture = await lecturesService.getLecture(
          req.user,
          req.course,
          req.enrollment,
          lectureId
        );
        return reply.send(lecture);
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  // Create a new lecture
  fastify.post(
    '/api/courses/:course_id/lectures',
    {
      preHandler: fastify.loadCourse,
      schema: lecturesSchemas.CreateLectureSchema,
    },
    async (req, reply) => {
      try {
        const lecture = await lecturesService.createLecture(
          req.user,
          req.course,
          req.enrollment,
          req.body
        );
        return reply.code(201).send(lecture);
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  // Update a lecture
  fastify.patch(
    '/api/courses/:course_id/lectures/:lecture_id',
    {
      preHandler: fastify.loadCourse,
      schema: lecturesSchemas.UpdateLectureSchema,
    },
    async (req, reply) => {
      try {
        const lectureId = parseInt(req.params.lecture_id, 10);
        const lecture = await lecturesService.updateLecture(
          req.user,
          req.course,
          req.enrollment,
          lectureId,
          req.body
        );
        return reply.send(lecture);
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  // Delete a lecture
  fastify.delete(
    '/api/courses/:course_id/lectures/:lecture_id',
    {
      preHandler: fastify.loadCourse,
      schema: lecturesSchemas.DeleteLectureSchema,
    },
    async (req, reply) => {
      try {
        fastify.log.info(
          { courseId: req.params.course_id, lectureId: req.params.lecture_id },
          'DELETE lecture handler called'
        );
        const lectureId = parseInt(req.params.lecture_id, 10);
        await lecturesService.deleteLecture(
          req.user,
          req.course,
          req.enrollment,
          lectureId
        );
        return reply.send({ message: 'Lecture deleted successfully' });
      } catch (error) {
        fastify.log.error({ error }, 'DELETE lecture error');
        return mapAndReply(error, reply);
      }
    }
  );

  // Activate attendance for a lecture (generate code and start 5-minute timer)
  fastify.post(
    '/api/courses/:course_id/lectures/:lecture_id/activate-attendance',
    {
      preHandler: [
        fastify.loadCourse,
        fastify.loadLecture,
        fastify.requireTAOrProfessorInCourse,
      ],
      schema: lecturesSchemas.ActivateAttendanceSchema,
    },
    async (req, reply) => {
      try {
        const lectureId = parseInt(req.params.lecture_id, 10);
        const lecture = await lecturesService.activateAttendance(
          req.user,
          req.course,
          req.enrollment,
          lectureId
        );
        return reply.send(lecture);
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );
}

module.exports = routes;
