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
  const lecturesService = new LecturesService(lecturesRepo);
  const lecturesPermissions = new LecturesPermissions(lecturesRepo);

  // Get all lectures for a course
  fastify.get(
    '/api/courses/:course_id/lectures',
    {
      preHandler: fastify.authenticate,
      schema: lecturesSchemas.GetAllLecturesSchema,
    },
    async (req, reply) => {
      try {
        const courseId = parseInt(req.params.course_id, 10);
        if (isNaN(courseId)) {
          return reply.code(400).send({ error: 'Invalid course_id' });
        }

        const userId = req.user.id;

        // Check if user can view lectures
        const canView = await lecturesPermissions.canViewLectures(
          userId,
          courseId
        );
        if (!canView) {
          return reply.code(403).send({
            error: 'Forbidden',
            message: 'You are not enrolled in this course',
          });
        }

        // Check if course exists
        const courseExists = await lecturesRepo.courseExists(courseId);
        if (!courseExists) {
          return reply.code(404).send({ error: 'Course not found' });
        }

        // Get all lectures
        const lectures = await lecturesRepo.getLecturesByCourseId(courseId);
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
      preHandler: fastify.authenticate,
      schema: lecturesSchemas.GetLectureSchema,
    },
    async (req, reply) => {
      try {
        const courseId = parseInt(req.params.course_id, 10);
        const lectureId = parseInt(req.params.lecture_id, 10);

        if (isNaN(courseId) || isNaN(lectureId)) {
          return reply.code(400).send({
            error: 'Invalid course_id or lecture_id',
          });
        }

        const userId = req.user.id;

        // Check if user can view lectures
        const canView = await lecturesPermissions.canViewLectures(
          userId,
          courseId
        );
        if (!canView) {
          return reply.code(403).send({
            error: 'Forbidden',
            message: 'You are not enrolled in this course',
          });
        }

        // Get lecture
        const lecture = await lecturesRepo.getLectureById(lectureId, courseId);
        if (!lecture) {
          return reply.code(404).send({ error: 'Lecture not found' });
        }

        return reply.send({ lecture });
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  // Create a new lecture
  fastify.post(
    '/api/courses/:course_id/lectures',
    {
      preHandler: fastify.authenticate,
      schema: lecturesSchemas.CreateLectureSchema,
    },
    async (req, reply) => {
      try {
        const courseId = parseInt(req.params.course_id, 10);
        if (isNaN(courseId)) {
          return reply.code(400).send({ error: 'Invalid course_id' });
        }

        const userId = req.user.id;

        // Check if user can modify lectures
        const canModify = await lecturesPermissions.canModifyLectures(
          userId,
          courseId
        );
        if (!canModify) {
          return reply.code(403).send({
            error: 'Forbidden',
            message: 'Only professors and TAs can create lectures',
          });
        }

        // Check if course exists
        const courseExists = await lecturesRepo.courseExists(courseId);
        if (!courseExists) {
          return reply.code(404).send({ error: 'Course not found' });
        }

        // Validate lecture data
        const validation = lecturesService.validateLectureData(req.body);
        if (!validation.valid) {
          return reply.code(400).send({ error: validation.error });
        }

        // Create lecture
        const lecture = await lecturesRepo.createLecture({
          course_id: courseId,
          lecture_date: req.body.lecture_date,
          code: req.body.code || null,
        });

        return reply.code(201).send({ lecture });
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  // Update a lecture
  fastify.patch(
    '/api/courses/:course_id/lectures/:lecture_id',
    {
      preHandler: fastify.authenticate,
      schema: lecturesSchemas.UpdateLectureSchema,
    },
    async (req, reply) => {
      try {
        const courseId = parseInt(req.params.course_id, 10);
        const lectureId = parseInt(req.params.lecture_id, 10);

        if (isNaN(courseId) || isNaN(lectureId)) {
          return reply.code(400).send({
            error: 'Invalid course_id or lecture_id',
          });
        }

        const userId = req.user.id;

        // Check if user can modify lectures
        const canModify = await lecturesPermissions.canModifyLectures(
          userId,
          courseId
        );
        if (!canModify) {
          return reply.code(403).send({
            error: 'Forbidden',
            message: 'Only professors and TAs can update lectures',
          });
        }

        // Check if lecture exists
        const existingLecture = await lecturesRepo.getLectureById(
          lectureId,
          courseId
        );
        if (!existingLecture) {
          return reply.code(404).send({ error: 'Lecture not found' });
        }

        // Validate update data if provided
        if (req.body.lecture_date || req.body.code !== undefined) {
          const updateData = {
            lecture_date: req.body.lecture_date || existingLecture.lecture_date,
            code:
              req.body.code !== undefined
                ? req.body.code
                : existingLecture.code,
          };

          const validation = lecturesService.validateLectureData(updateData);
          if (!validation.valid) {
            return reply.code(400).send({ error: validation.error });
          }

          const lecture = await lecturesRepo.updateLecture(
            lectureId,
            updateData
          );
          return reply.send({ lecture });
        }

        // No fields to update
        return reply.send({ lecture: existingLecture });
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  // Delete a lecture
  fastify.delete(
    '/api/courses/:course_id/lectures/:lecture_id',
    {
      preHandler: fastify.authenticate,
      schema: lecturesSchemas.DeleteLectureSchema,
    },
    async (req, reply) => {
      try {
        const courseId = parseInt(req.params.course_id, 10);
        const lectureId = parseInt(req.params.lecture_id, 10);

        if (isNaN(courseId) || isNaN(lectureId)) {
          return reply.code(400).send({
            error: 'Invalid course_id or lecture_id',
          });
        }

        const userId = req.user.id;

        // Check if user can modify lectures
        const canModify = await lecturesPermissions.canModifyLectures(
          userId,
          courseId
        );
        if (!canModify) {
          return reply.code(403).send({
            error: 'Forbidden',
            message: 'Only professors and TAs can delete lectures',
          });
        }

        // Check if lecture exists
        const existingLecture = await lecturesRepo.getLectureById(
          lectureId,
          courseId
        );
        if (!existingLecture) {
          return reply.code(404).send({ error: 'Lecture not found' });
        }

        await lecturesRepo.deleteLecture(lectureId);
        return reply.send({ message: 'Lecture deleted successfully' });
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );
}

module.exports = routes;
