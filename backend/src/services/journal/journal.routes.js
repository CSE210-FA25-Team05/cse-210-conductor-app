'use strict';

const { mapAndReply } = require('../../utils/error-map');

/**
 * Journal Routes Plugin
 * GET
 * /api/courses/:course_id/journals - get all journals of a course
 * /api/courses/:course_id/journals/entry/:journal_id - get specific journal entry
 * /api/courses/:course_id/journals/user/:user_id - get journals of the authenticated user
 *
 * POST
 * /api/courses/:course_id/journals - create a new journal entry
 *
 * PATCH
 * /api/courses/:course_id/journals/:journal_id - update a journal entry
 *
 * DELETE
 * /api/courses/:course_id/journals/:journal_id - delete a journal entry
 */

const JournalRepo = require('./journal.repo');
const journalSchemas = require('./journal.schemas');

module.exports = async function journalRoutes(fastify, options) {
  const journalRepo = new JournalRepo(fastify.db);

  fastify.get(
    '/journals',
    {
      schema: journalSchemas.GetJournalByCourseSchema,
    },
    async (request, reply) => {
      try {
        const course_id = request.params.course_id;
        const res = await journalRepo.getJournalsByCourseId(course_id);
        return res;
      } catch (error) {
        console.error(error);
        return mapAndReply(error, reply);
      }
    }
  );
  fastify.get(
    '/journals/entry/:journal_id',
    {
      schema: journalSchemas.GetJournalByIdSchema,
    },
    async (request, reply) => {
      try {
        const journal_id = request.params.journal_id;
        const res = await journalRepo.getJournalById(journal_id);
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
      schema: journalSchemas.GetJournalsByUserSchema,
    },
    async (request, reply) => {
      try {
        const user_id = request.params.user_id;
        const course_id = request.params.course_id;
        const res = await journalRepo.getJournalsByUserIdAndCourseId(
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
  fastify.post(
    '/journals',
    {
      schema: journalSchemas.CreateJournalSchema,
    },
    async (request, reply) => {
      try {
        const course_id = request.params.course_id;
        const { title, content, student_id } = request.body;
        const res = await journalRepo.createJournalEntry(
          student_id,
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
      schema: journalSchemas.UpdateJournalSchema,
    },
    async (request, reply) => {
      try {
        const journal_id = request.params.journal_id;
        const { title, content } = request.body;
        const res = await journalRepo.updateJournalEntry(
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
      schema: journalSchemas.DeleteJournalSchema,
    },
    async (request, reply) => {
      try {
        const journal_id = request.params.journal_id;
        const res = await journalRepo.deleteJournalEntry(journal_id);
        return res;
      } catch (error) {
        console.error(error);
        return mapAndReply(error, reply);
      }
    }
  );
};
