'use strict';

const { mapAndReply } = require('../../utils/error-map');

/**
 * Course Routes Plugin
 * GET
 * /api/courses - get all courses
 * /api/courses/:course_id - get specific course data
 * /api/courses/:course_id/users - get all users in class
 * /api/courses/:course_id/users/:user_id - get specific user details in context of course
 *
 * POST
 * /api/courses - create a new course
 *
 * PATCH
 * /api/courses/:course_id - update course details
 *
 * DELETE
 * /api/courses/:course_id - delete a course
 *
 * POST
 * /api/courses/:course_id/users - enroll a user into a course
 * /api/courses/:course_id/join - join a course with join code
 *
 *
 */

const CourseRepo = require('./course.repo');
const courseSchemas = require('./course.schemas');
const CourseService = require('./course.service');

module.exports = async function courseRoutes(fastify, options) {
  const courseRepo = new CourseRepo(fastify.db);
  const courseService = new CourseService(courseRepo);

  fastify.get(
    '/courses',
    {
      schema: courseSchemas.GetAllCoursesSchema,
    },
    async (request, reply) => {
      try {
        const res = await courseRepo.getAllCourse();
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
        return res;
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  fastify.get(
    '/courses/:course_id/users',
    {
      schema: courseSchemas.GetCourseUsersSchema,
    },
    async (request, reply) => {
      try {
        const res = await courseRepo.getUsersInCourse(
          parseInt(request.params.course_id, 10)
        );
        return res;
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  fastify.get(
    '/courses/:course_id/users/:user_id',
    {
      schema: courseSchemas.GetCourseUserSchema,
    },
    async (request, reply) => {
      try {
        const res = await courseRepo.getUserDetailsInCourse(
          parseInt(request.params.course_id, 10),
          parseInt(request.params.user_id, 10)
        );
        return res;
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  fastify.post(
    '/courses',
    {
      schema: courseSchemas.CreateCourseSchema,
    },
    async (request, reply) => {
      try {
        const course = await courseRepo.addCourse(request.body);
        reply.code(201).send(course);
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  fastify.patch(
    '/courses/:course_id',
    {
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
      schema: courseSchemas.AddUserInCourseSchema,
    },
    async (request, reply) => {
      try {
        await courseRepo.addEnrollment(
          parseInt(request.params.course_id, 10),
          request.body.user_id
        );
        reply.code(201).send();
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  fastify.post(
    '/courses/:course_id/join',
    {
      schema: courseSchemas.JoinCourseSchema,
    },
    async (request, reply) => {
      try {
        const isValid = await courseService.checkCourseJoinCode(
          parseInt(request.params.course_id, 10),
          request.body.join_code
        );
        if (!isValid) {
          return reply.code(400).send({ error: 'Invalid join code' });
        }
        await courseRepo.addEnrollment(
          parseInt(request.params.course_id, 10),
          request.body.user_id
        );
        reply.code(201).send();
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  fastify.patch(
    '/courses/:course_id/users/:user_id',
    {
      schema: courseSchemas.UpdateUserInCourseSchema,
    },
    async (request, reply) => {
      try {
        await courseRepo.updateEnrollmentRole(
          parseInt(request.params.course_id, 10),
          parseInt(request.params.user_id, 10),
          request.body.role
        );
        reply.send();
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  fastify.delete(
    '/courses/:course_id/users/:user_id',
    {
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
