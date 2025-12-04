'use strict';

/**
 * Course Permission Decorators
 *
 * Provides preHandler functions for course-related operations:
 * - fastify.loadCourse(req, reply)
 *      Loads the course object and user's enrollment data from course_id param.
 *      Attaches course to req.course and enrollment to req.enrollment.
 *      Sends 404 if course not found. Requires authentication.
 *
 * - fastify.loadLecture(req, reply)
 *      Loads the lecture object from lecture_id param.
 *      Verifies the lecture belongs to req.course.
 *      Attaches lecture to req.lecture.
 *      Sends 404 if lecture not found. Requires loadCourse to be called first.
 *
 * - fastify.requireProfessorInCourse(req, reply)
 *      Checks if the authenticated user is a professor in the course.
 *      Sends 403 if not authorized.
 *
 * - fastify.requireTAOrProfessorInCourse(req, reply)
 *      Checks if the authenticated user is a TA or professor in the course.
 *      Sends 403 if not authorized.
 *
 * - fastify.requireEnrolledInCourse(req, reply)
 *      Checks if the authenticated user is enrolled in the course.
 *      Sends 403 if not enrolled.
 */

const fp = require('fastify-plugin');
const CourseRepo = require('../services/course/course.repo');
const AuthRepo = require('../services/auth/auth.repo');
const CoursePermissions = require('../services/course/course.permissions');
const LecturesRepo = require('../services/lectures/lectures.repo');

// eslint-disable-next-line no-unused-vars
module.exports = fp(async function coursePermissionDecorators(fastify, _opts) {
  const courseRepo = new CourseRepo(fastify.db);
  const authRepo = new AuthRepo(fastify.db);
  const coursePermissions = new CoursePermissions(courseRepo, authRepo);
  const lecturesRepo = new LecturesRepo(fastify.db);

  /**
   * Load course and user enrollment data.
   * Attaches course to req.course and enrollment to req.enrollment.
   * Requires authentication.
   */
  fastify.decorate('loadCourse', async function (req, reply) {
    // Authentication is already checked by authenticate hook/decorator
    // Parse course_id (schema validation ensures it's a valid integer, but params are still strings)
    const courseId = parseInt(req.params.course_id, 10);

    // Load course
    const course = await courseRepo.getCourseById(courseId);
    if (!course || course.deleted_at !== null) {
      return reply
        .code(404)
        .send({ statusCode: 404, error: 'Course not found' });
    }

    // Load user's enrollment in this course
    const enrollment = await courseRepo.getEnrollmentByUserAndCourse(
      req.user.id,
      courseId
    );

    // Attach to request object
    req.course = course;
    req.enrollment = enrollment; // null if not enrolled

    return;
  });

  /**
   * Load lecture data.
   * Verifies the lecture belongs to req.course.
   * Attaches lecture to req.lecture.
   * Requires loadCourse to be called first.
   */
  fastify.decorate('loadLecture', async function (req, reply) {
    // Require course to be loaded first
    if (!req.course) {
      return reply
        .code(500)
        .send({ error: 'Course must be loaded before lecture' });
    }

    // Parse lecture_id (schema validation ensures it's a valid integer, but params are still strings)
    const lectureId = parseInt(req.params.lecture_id, 10);

    // Load lecture and verify it belongs to the course
    const lecture = await lecturesRepo.getLectureById(lectureId, req.course.id);
    if (!lecture) {
      return reply.code(404).send({ error: 'Lecture not found' });
    }

    // Attach to request object
    req.lecture = lecture;

    return;
  });

  /**
   * Require user to be a professor in the course
   */
  fastify.decorate('requireProfessorInCourse', async function (req, reply) {
    if (!req.user) {
      return reply
        .code(401)
        .send({ statusCode: 401, error: 'Not authenticated' });
    }

    const courseId = parseInt(req.params.course_id, 10);
    const isProfessor = await coursePermissions.isProfessorInCourse(
      req.user.id,
      courseId
    );

    if (!isProfessor) {
      return reply.code(403).send({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Only professors can perform this action',
      });
    }
  });

  /**
   * Require user to be a TA or professor in the course
   */
  fastify.decorate('requireTAOrProfessorInCourse', async function (req, reply) {
    if (!req.user) {
      return reply
        .code(401)
        .send({ statusCode: 401, error: 'Not authenticated' });
    }

    const courseId = parseInt(req.params.course_id, 10);
    const isProfessor = await coursePermissions.isProfessorInCourse(
      req.user.id,
      courseId
    );
    const isTA = await coursePermissions.isTAInCourse(req.user.id, courseId);

    if (!isProfessor && !isTA) {
      return reply.code(403).send({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Only professors and TAs can perform this action',
      });
    }
  });

  /**
   * Require user to be enrolled in the course
   */
  fastify.decorate('requireEnrolledInCourse', async function (req, reply) {
    if (!req.user) {
      return reply
        .code(401)
        .send({ statusCode: 401, error: 'Not authenticated' });
    }

    const courseId = parseInt(req.params.course_id, 10);
    const isEnrolled = await coursePermissions.isEnrolledInCourse(
      req.user.id,
      courseId
    );

    if (!isEnrolled) {
      return reply.code(403).send({
        statusCode: 403,
        error: 'Forbidden',
        message: 'You must be enrolled in this course to perform this action',
      });
    }
  });
});
