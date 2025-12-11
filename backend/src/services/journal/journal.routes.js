'use strict';

const { mapAndReply } = require('../../utils/error-map');

/**
 * Journal Routes Plugin
 * GET
 * /courses/:course_id/journals - get journals for a course. Supports filters.
 * /courses/:course_id/journals/:journal_id - get specific journal entry
 * /courses/:course_id/journals/user/:user_id - get journals of the authenticated user (deprecated - Use user_id filter in /journals instead)
 *
 * POST
 * /courses/:course_id/journals - create a new journal entry
 *
 * PATCH
 * /courses/:course_id/journals/:journal_id - update a journal entry
 *
 * DELETE
 * /courses/:course_id/journals/:journal_id - delete a journal entry
 */

const JournalRepo = require('./journal.repo');
const JournalService = require('./journal.service');
const JournalPermissions = require('./journal.permissions');
const journalSchemas = require('./journal.schemas');

module.exports = async function journalRoutes(fastify, options) {
  const journalRepo = new JournalRepo(fastify.db);
  const journalPermissions = new JournalPermissions(fastify.db);
  const journalService = new JournalService(journalRepo, journalPermissions);
  fastify.get(
    '/journals',
    {
      preHandler: [fastify.loadCourse],
      schema: journalSchemas.GetJournalByCourseSchema,
    },
    async (request, reply) => {
      try {
        const user = request.user;
        const course = request.course;
        const enrollment = request.enrollment;
        const query = request.query;
        const res = await journalService.getJournals(
          course,
          user,
          enrollment,
          query
        );
        return res;
      } catch (error) {
        console.error(error);
        return mapAndReply(error, reply);
      }
    }
  );

  fastify.get(
    '/journals/user/:user_id',
    {
      preHandler: [fastify.requireTAOrProfessorInCourse],
      schema: journalSchemas.GetJournalsByUserSchema,
    },
    async (request, reply) => {
      try {
        const user_id = request.params.user_id;
        const course_id = request.params.course_id;
        const res = await journalService.getJournalsByUserIdAndCourseId(
          user_id,
          course_id
        );
        return res;
      } catch (error) {
        console.error(error);
        return mapAndReply(error, reply);
      }
    }
  );

  fastify.get(
    '/journals/:journal_id',
    {
      preHandler: [fastify.requireJournalAccess],
      schema: journalSchemas.GetJournalByIdSchema,
    },
    async (request, reply) => {
      try {
        const journal_id = request.params.journal_id;
        const res = await journalService.getJournalById(journal_id);
        if (!res) {
          return reply.code(404).send({
            statusCode: 404,
            error: 'Not Found',
            message: 'Journal entry not found',
          });
        }
        return res;
      } catch (error) {
        console.error(error);
        return mapAndReply(error, reply);
      }
    }
  );

  fastify.post(
    '/journals',
    {
      prehandler: [fastify.requireEnrolledInCourse],
      schema: journalSchemas.CreateJournalSchema,
    },
    async (request, reply) => {
      try {
        const course_id = parseInt(request.params.course_id, 10);
        const user_id = request.user.id;
        const { title, content } = request.body;
        const res = await journalService.createJournalEntry(
          user_id,
          course_id,
          title,
          content
        );
        return res;
      } catch (error) {
        console.error(error);
        return mapAndReply(error, reply);
      }
    }
  );
  fastify.patch(
    '/journals/:journal_id',
    {
      preHandler: [fastify.requireJournalUpdate],
      schema: journalSchemas.UpdateJournalSchema,
    },
    async (request, reply) => {
      try {
        const journal_id = request.params.journal_id;
        const { title, content } = request.body;
        const res = await journalService.updateJournalEntry(
          journal_id,
          title,
          content
        );
        return res;
      } catch (error) {
        console.error(error);
        return mapAndReply(error, reply);
      }
    }
  );
  fastify.delete(
    '/journals/:journal_id',
    {
      preHandler: [fastify.requireJournalDelete],
      schema: journalSchemas.DeleteJournalSchema,
    },
    async (request, reply) => {
      try {
        const journal_id = request.params.journal_id;
        const res = await journalService.deleteJournalEntry(journal_id);
        return res;
      } catch (error) {
        console.error(error);
        return mapAndReply(error, reply);
      }
    }
  );
};
