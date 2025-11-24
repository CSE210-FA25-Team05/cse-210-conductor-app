'use strict';

/**
 * Pulses Routes
 *
 * Endpoints implemented:
 * - GET  /api/courses/:course_id/pulses/config     - Get pulse config for a course
 * - PATCH /api/courses/:course_id/pulses/config    - Update pulse config (professor/TA only)
 * - POST /api/courses/:course_id/pulses            - Submit a pulse (authenticated student)
 */

const { mapAndReply } = require('../../utils/error-map');
const PulseRepo = require('./pulse.repo');
const PulseService = require('./pulse.service');

async function routes(fastify) {
  const pulseRepo = new PulseRepo(fastify.db);
  const pulseService = new PulseService(pulseRepo);

  // Get pulse config for a course
  fastify.get(
    '/api/courses/:course_id/pulses/config',
    {
      preHandler: [fastify.loadCourse, fastify.requireEnrolledInCourse],
    },
    async (req, reply) => {
      try {
        const course = req.course;
        const cfg = await pulseService.getConfig(course);
        if (!cfg) return reply.send({ config: null, is_editable: true });
        return reply.send(cfg);
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  // Update pulse config (professor/TA only)
  fastify.patch(
    '/api/courses/:course_id/pulses/config',
    {
      preHandler: [fastify.loadCourse, fastify.requireTAOrProfessorInCourse],
    },
    async (req, reply) => {
      try {
        const course = req.course;

        const configObj =
          req.body && req.body.config ? req.body.config : req.body;
        if (!configObj) {
          return reply.code(400).send({
            error: 'BAD_REQUEST',
            message: 'Missing config in request body',
          });
        }

        const saved = await pulseService.upsertConfig(course, configObj);
        return reply.code(200).send(saved);
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  // Submit a pulse
  fastify.post(
    '/api/courses/:course_id/pulses',
    {
      preHandler: [fastify.loadCourse, fastify.requireEnrolledInCourse],
    },
    async (req, reply) => {
      try {
        const course = req.course;
        const student = req.user;

        const option =
          req.body &&
          (req.body.option || req.body.value || req.body.option_key);
        if (!option)
          return reply.code(400).send({
            error: 'BAD_REQUEST',
            message: 'Missing option in request body',
          });

        const description = req.body?.description || null;

        const created = await pulseService.submitPulse({
          course,
          student,
          optionKey: option,
          description,
        });

        return reply.code(201).send(created);
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );
}

module.exports = routes;
