'use strict';

/**
 * Course Permission Decorators
 *
 * Provides preHandler functions for course-related permission checks:
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

module.exports = fp(async function coursePermissionDecorators(fastify, opts) {
  const courseRepo = new CourseRepo(fastify.db);
  const authRepo = new AuthRepo(fastify.db);
  const coursePermissions = new CoursePermissions(courseRepo, authRepo);

  /**
   * Require user to be a professor in the course
   */
  fastify.decorate('requireProfessorInCourse', async function (req, reply) {
    if (!req.user) {
      return reply.code(401).send({ error: 'Not authenticated' });
    }

    const courseId = parseInt(req.params.course_id, 10);
    const isProfessor = await coursePermissions.isProfessorInCourse(
      req.user.id,
      courseId
    );

    if (!isProfessor) {
      return reply.code(403).send({
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
      return reply.code(401).send({ error: 'Not authenticated' });
    }

    const courseId = parseInt(req.params.course_id, 10);
    const isProfessor = await coursePermissions.isProfessorInCourse(
      req.user.id,
      courseId
    );
    const isTA = await coursePermissions.isTAInCourse(req.user.id, courseId);

    if (!isProfessor && !isTA) {
      return reply.code(403).send({
        error: 'Forbidden',
        message: 'Only professors or TAs can perform this action',
      });
    }
  });

  /**
   * Require user to be enrolled in the course
   */
  fastify.decorate('requireEnrolledInCourse', async function (req, reply) {
    if (!req.user) {
      return reply.code(401).send({ error: 'Not authenticated' });
    }

    const courseId = parseInt(req.params.course_id, 10);
    const isEnrolled = await coursePermissions.isEnrolledInCourse(
      req.user.id,
      courseId
    );

    if (!isEnrolled) {
      return reply.code(403).send({
        error: 'Forbidden',
        message: 'You must be enrolled in this course to perform this action',
      });
    }
  });
});
