// backend/src/services/teams/teams.routes.js
'use strict';

const { mapAndReply } = require('../../utils/error-map');
const TeamsRepo = require('./teams.repo');
const TeamsService = require('./teams.service');
const TeamsPermissions = require('./teams.permissions');
const teamsSchemas = require('./teams.schemas');

/**
 * Teams Routes Plugin
 *
 * Registered in server.js with prefix '/api', so all paths here are relative to '/api'.
 */

module.exports = async function teamsRoutes(fastify) {
  const teamsRepo = new TeamsRepo(fastify.db);
  const teamsPermissions = new TeamsPermissions(teamsRepo);
  const teamsService = new TeamsService(teamsRepo, teamsPermissions);

  // GET /api/courses/:course_id/teams
  fastify.get(
    '/courses/:course_id/teams',
    {
      preHandler: fastify.loadCourse,
      schema: teamsSchemas.ListTeamsSchema,
    },
    async (req, reply) => {
      try {
        const teams = await teamsService.listTeams(
          req.user,
          req.course,
          req.enrollment
        );
        return reply.send({ teams });
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  // GET /api/courses/:course_id/teams/:team_id
  fastify.get(
    '/courses/:course_id/teams/:team_id',
    {
      preHandler: fastify.loadCourse,
      schema: teamsSchemas.GetTeamSchema,
    },
    async (req, reply) => {
      try {
        const teamId = parseInt(req.params.team_id, 10);
        const team = await teamsService.getTeam(
          req.user,
          req.course,
          req.enrollment,
          teamId
        );
        return reply.send(team);
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  // GET /api/courses/:course_id/teams/:team_id/members
  fastify.get(
    '/courses/:course_id/teams/:team_id/members',
    {
      preHandler: fastify.loadCourse,
      schema: teamsSchemas.GetTeamMembersSchema,
    },
    async (req, reply) => {
      try {
        const teamId = parseInt(req.params.team_id, 10);
        const members = await teamsService.getTeamMembers(
          req.user,
          req.course,
          req.enrollment,
          teamId
        );
        return reply.send({ members });
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  // POST /api/courses/:course_id/teams
  fastify.post(
    '/courses/:course_id/teams',
    {
      preHandler: fastify.loadCourse,
      schema: teamsSchemas.CreateTeamSchema,
    },
    async (req, reply) => {
      try {
        const team = await teamsService.createTeam(
          req.user,
          req.course,
          req.enrollment,
          req.body
        );
        return reply.code(201).send(team);
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  // POST /api/courses/:course_id/teams/:team_id/add_members
  fastify.post(
    '/courses/:course_id/teams/:team_id/add_members',
    {
      preHandler: fastify.loadCourse,
      schema: teamsSchemas.AddMembersSchema,
    },
    async (req, reply) => {
      try {
        const teamId = parseInt(req.params.team_id, 10);
        await teamsService.addMembers(
          req.user,
          req.course,
          req.enrollment,
          teamId,
          req.body
        );
        return reply.code(204).send();
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  // PATCH /api/courses/:course_id/teams/:team_id
  fastify.patch(
    '/courses/:course_id/teams/:team_id',
    {
      preHandler: fastify.loadCourse,
      schema: teamsSchemas.UpdateTeamSchema,
    },
    async (req, reply) => {
      try {
        const teamId = parseInt(req.params.team_id, 10);
        const updated = await teamsService.updateTeam(
          req.user,
          req.course,
          req.enrollment,
          teamId,
          req.body
        );
        return reply.send(updated);
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  // PATCH /api/courses/:course_id/teams/:team_id/update_members
  // Returns updated members list
  fastify.patch(
    '/courses/:course_id/teams/:team_id/update_members',
    {
      preHandler: fastify.loadCourse,
      schema: teamsSchemas.UpdateMembersSchema,
    },
    async (req, reply) => {
      try {
        const teamId = parseInt(req.params.team_id, 10);
        const members = await teamsService.updateMembers(
          req.user,
          req.course,
          req.enrollment,
          teamId,
          req.body
        );
        return reply.code(200).send({ members });
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  // DELETE /api/courses/:course_id/teams/:team_id/remove_members
  fastify.delete(
    '/courses/:course_id/teams/:team_id/remove_members',
    {
      preHandler: fastify.loadCourse,
      schema: teamsSchemas.RemoveMembersSchema,
    },
    async (req, reply) => {
      try {
        const teamId = parseInt(req.params.team_id, 10);
        const memberIds = (req.body && req.body.ids) || [];
        await teamsService.removeMembers(
          req.user,
          req.course,
          req.enrollment,
          teamId,
          memberIds
        );
        return reply.code(204).send();
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );
};
