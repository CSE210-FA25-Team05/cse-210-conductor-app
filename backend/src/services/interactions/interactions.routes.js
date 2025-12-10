'use strict';

/**
 * Interactions Routes
 *
 * Endpoints implemented:
 * - GET  /courses/:course_id/interactions/config     - Get interaction config for a course
 * - PATCH /courses/:course_id/interactions/config    - Update interaction config (professor/TA only)
 * - POST /courses/:course_id/interactions            - Submit an interaction (authenticated student)
 */

const { mapAndReply } = require('../../utils/error-map');
const InteractionRepo = require('./interactions.repo');
const InteractionService = require('./interactions.service');
const interactionSchemas = require('./interactions.schemas');
const InteractionPermissions = require('./interactions.permissions');
const CourseRepo = require('../course/course.repo');

async function routes(fastify) {
  const courseRepo = new CourseRepo(fastify.db);
  const interactionRepo = new InteractionRepo(fastify.db);
  const interactionPermissions = new InteractionPermissions(interactionRepo);
  const interactionService = new InteractionService(
    interactionRepo,
    courseRepo
  );

  // Get interaction config for a course
  fastify.get(
    '/courses/:course_id/interactions/config',
    {
      preHandler: [fastify.loadCourse, fastify.requireEnrolledInCourse],
      schema: interactionSchemas.GetInteractionConfigSchema,
    },
    async (req, reply) => {
      try {
        const course = req.course;
        const cfg = await interactionService.getConfig(course);
        if (!cfg) {
          return reply.notFound(
            'Interaction configuration not found for course'
          );
        }
        return reply.code(200).send(cfg);
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  // Update interaction config (professor/TA only)
  fastify.patch(
    '/courses/:course_id/interactions/config',
    {
      preHandler: [fastify.loadCourse, fastify.requireProfessorInCourse],
      schema: interactionSchemas.UpdateInteractionConfigSchema,
    },
    async (req, reply) => {
      try {
        const course = req.course;
        const configObj = req.body;

        const saved = await interactionService.upsertConfig(course, configObj);
        return reply.code(200).send(saved);
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  // Submit an interaction
  fastify.post(
    '/courses/:course_id/interactions',
    {
      preHandler: [fastify.loadCourse, fastify.requireEnrolledInCourse],
      schema: interactionSchemas.CreateInteractionSchema,
    },
    async (req, reply) => {
      try {
        const course = req.course;
        const user = req.user;
        const enrollment = req.enrollment;

        const option = req.body.option.trim();
        const description = req.body.description?.trim() || null;
        const participants = req.body.participants;

        const created = await interactionService.submitInteraction(
          course,
          user,
          enrollment,
          {
            selectedOption: option,
            description,
            participants,
          }
        );

        return reply.code(201).send(created);
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  // Get interactions for a user in a course - TODO: pagination
  fastify.get(
    '/courses/:course_id/interactions',
    {
      preHandler: [fastify.loadCourse, fastify.requireEnrolledInCourse],
      schema: interactionSchemas.GetInteractionsSchema,
    },
    async (req, reply) => {
      try {
        const course = req.course;
        const filters = interactionService.buildFiltersFromQuery(
          req.query,
          req.user
        );

        if (
          !interactionPermissions.canViewInteractions(
            req.user,
            req.enrollment,
            filters
          )
        ) {
          return reply.forbidden(
            'You do not have permission to view these interaction records'
          );
        }

        const interactions = await interactionService.getInteractions(
          course,
          filters
        );

        return reply.send(interactions);
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  fastify.patch(
    '/courses/:course_id/interactions/:interaction_id',
    {
      preHandler: [fastify.loadCourse, fastify.requireEnrolledInCourse],
      schema: interactionSchemas.UpdateInteractionSchema,
    },
    async (req, reply) => {
      try {
        const course = req.course;
        const user = req.user;
        const enrollment = req.enrollment;
        const interactionId = parseInt(req.params.interaction_id, 10);
        const updateData = req.body;

        const interaction = await interactionRepo.getInteractionById(
          course.id,
          interactionId
        );

        if (!interaction) {
          const e = new Error('Interaction not found');
          e.code = 'NOT_FOUND';
          throw e;
        }

        if (
          !interactionPermissions.canUpdateInteraction(
            user,
            enrollment,
            interaction
          )
        ) {
          return reply.forbidden(
            'You do not have permission to update this interaction'
          );
        }

        const updatedInteraction = await interactionService.updateInteraction(
          course,
          interaction,
          updateData
        );

        return reply.send(updatedInteraction);
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  fastify.delete(
    '/courses/:course_id/interactions/:interaction_id',
    {
      preHandler: [fastify.loadCourse, fastify.requireEnrolledInCourse],
      schema: interactionSchemas.DeleteInteractionSchema,
    },
    async (req, reply) => {
      try {
        const course = req.course;
        const user = req.user;
        const enrollment = req.enrollment;
        const interactionId = parseInt(req.params.interaction_id, 10);

        const interaction = await interactionRepo.getInteractionById(
          course.id,
          interactionId
        );

        if (!interaction) {
          const e = new Error('Interaction not found');
          e.code = 'NOT_FOUND';
          throw e;
        }

        if (
          !interactionPermissions.canDeleteInteraction(
            user,
            enrollment,
            interaction
          )
        ) {
          return reply.forbidden(
            'You do not have permission to delete this interaction'
          );
        }

        await interactionService.deleteInteraction(course, interaction);

        return reply.code(204).send();
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  fastify.get(
    '/courses/:course_id/interactions/stats',
    {
      preHandler: [fastify.loadCourse, fastify.requireTAOrProfessorInCourse],
      schema: interactionSchemas.GetInteractionStatsSchema,
    },
    async (req, reply) => {
      try {
        const stats = await interactionService.getAggregatedStats(
          req.course,
          interactionService.buildFiltersFromQuery(req.query, req.user)
        );
        return reply.send({ stats });
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );
}

module.exports = routes;
