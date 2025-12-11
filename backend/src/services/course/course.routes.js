'use strict';

const { mapAndReply } = require('../../utils/error-map');
const {
  mapUserAndEnrollmentToCourseUser,
} = require('../shared/shared.mappers');

/**
 * Course Routes Plugin
 * GET
 * /courses - get all courses
 * /courses/:course_id - get specific course data
 * /courses/:course_id/users - get all users in class
 * /courses/:course_id/users/:user_id - get specific user details in context of course
 *
 * POST
 * /courses - create a new course
 *
 * PATCH
 * /courses/:course_id - update course details
 *
 * DELETE
 * /courses/:course_id - delete a course
 *
 * POST
 * /courses/:course_id/users - enroll a user into a course
 * /courses/:course_id/join - join a course with join code
 *
 *
 */

const CourseRepo = require('./course.repo');
const CourseService = require('./course.service');
const AuthRepo = require('../auth/auth.repo');
const courseSchemas = require('./course.schemas');

// eslint-disable-next-line no-unused-vars
module.exports = async function courseRoutes(fastify, options) {
  const courseRepo = new CourseRepo(fastify.db);
  const authRepo = new AuthRepo(fastify.db);
  const courseService = new CourseService(courseRepo, authRepo);

  fastify.get(
    '/courses',
    {
      schema: courseSchemas.GetAllCoursesSchema,
    },
    async (request, reply) => {
      try {
        // Return only courses the authenticated user is enrolled in / associated with
        const res = await courseService.getCoursesForUser(request.user.id);
        return res;
      } catch (error) {
        console.error(error);
        return mapAndReply(error, reply);
      }
    }
  );

  fastify.get(
    '/courses/:course_id',
    {
      schema: courseSchemas.GetCourseSchema,
    },
    async (request, reply) => {
      try {
        const res = await courseRepo.getCourseById(
          parseInt(request.params.course_id, 10)
        );
        if (!res) {
          return reply.code(404).send({
            statusCode: 404,
            error: 'Not Found',
            message: 'Course not found',
          });
        }
        return res;
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  fastify.get(
    '/courses/:course_id/users',
    {
      preHandler: [fastify.requireEnrolledInCourse],
      schema: courseSchemas.GetCourseUsersSchema,
    },
    async (request, reply) => {
      try {
        const res = await courseRepo.getUsersInCourse(
          parseInt(request.params.course_id, 10)
        );
        return res.map((enrollment) =>
          mapUserAndEnrollmentToCourseUser(enrollment.users, enrollment)
        );
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  fastify.get(
    '/courses/:course_id/users/:user_id',
    {
      preHandler: [fastify.requireEnrolledInCourse],
      schema: courseSchemas.GetCourseUserSchema,
    },
    async (request, reply) => {
      try {
        const res = await courseRepo.getEnrollmentByUserAndCourse(
          parseInt(request.params.user_id, 10),
          parseInt(request.params.course_id, 10)
        );
        if (!res) {
          return reply.code(404).send({
            statusCode: 404,
            error: 'Not Found',
            message: 'User enrollment not found in this course',
          });
        }
        return mapUserAndEnrollmentToCourseUser(res.users, res);
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  fastify.post(
    '/courses',
    {
      preHandler: [fastify.requireGlobalProfessor],
      schema: courseSchemas.CreateCourseSchema,
    },
    async (request, reply) => {
      try {
        const course = await courseRepo.addCourse(request.user, request.body);
        reply.code(201).send(course);
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  fastify.patch(
    '/courses/:course_id',
    {
      preHandler: [fastify.requireProfessorInCourse],
      schema: courseSchemas.UpdateCourseSchema,
    },
    async (request, reply) => {
      try {
        await courseRepo.updateCourse(
          parseInt(request.params.course_id, 10),
          request.body
        );
        reply.send();
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  fastify.delete(
    '/courses/:course_id',
    {
      preHandler: [fastify.requireProfessorInCourse],
      schema: courseSchemas.DeleteCourseSchema,
    },
    async (request, reply) => {
      try {
        await courseRepo.deleteCourse(parseInt(request.params.course_id, 10));
        reply.code(204).send();
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  fastify.post(
    '/courses/:course_id/users',
    {
      preHandler: [fastify.requireProfessorInCourse],
      schema: courseSchemas.AddUserInCourseSchema,
    },
    async (request, reply) => {
      try {
        const courseId = parseInt(request.params.course_id, 10);
        const { email, role = 'student' } = request.body;
        const res = await courseService.addUserToCourseByEmail(
          courseId,
          email,
          role
        );
        reply.code(201).send(mapUserAndEnrollmentToCourseUser(res.users, res));
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  fastify.post(
    '/courses/join',
    {
      schema: courseSchemas.JoinCourseSchema,
    },
    async (request, reply) => {
      try {
        const res = await courseService.enrollByJoinCode(
          request.body.join_code,
          request.user.id
        );
        if (!res) {
          return reply.code(404).send({ error: 'Join code not found' });
        }
        reply.code(201).send(mapUserAndEnrollmentToCourseUser(res.users, res));
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  fastify.patch(
    '/courses/:course_id/users/:user_id',
    {
      preHandler: [fastify.requireTAOrProfessorInCourse],
      schema: courseSchemas.UpdateUserInCourseSchema,
    },
    async (request, reply) => {
      try {
        const res = await courseService.updateUserInCourse(
          parseInt(request.params.course_id, 10),
          parseInt(request.params.user_id, 10),
          request.body,
          request.user.id
        );
        reply.send(mapUserAndEnrollmentToCourseUser(res.users, res));
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  fastify.delete(
    '/courses/:course_id/users/:user_id',
    {
      preHandler: [fastify.requireProfessorInCourse],
      schema: courseSchemas.RemoveUserFromCourseSchema,
    },
    async (request, reply) => {
      try {
        await courseRepo.deleteEnrollment(
          parseInt(request.params.course_id, 10),
          parseInt(request.params.user_id, 10)
        );
        reply.code(204).send();
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );
};
