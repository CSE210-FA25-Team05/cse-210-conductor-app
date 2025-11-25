'use strict';

const { mapAndReply } = require('../../utils/error-map');
const TeamsRepo = require('./teams.repo');
const TeamsService = require('./teams.service');

/**
 * Teams Routes Plugin
 *
 * GET
 * /api/courses/:course_id/teams
 * /api/courses/:course_id/teams/:team_id
 * /api/courses/:course_id/teams/:team_id/members
 *
 * POST
 * /api/courses/:course_id/teams
 * /api/courses/:course_id/teams/:team_id/add_members
 *
 * PATCH
 * /api/courses/:course_id/teams/:team_id
 * /api/courses/:course_id/teams/:team_id/update_members
 *
 * DELETE
 * /api/courses/:course_id/teams/:team_id/remove_members
 */

module.exports = async function teamsRoutes(fastify, options) {
  // Instantiate repo + service once per Fastify instance,
  // following the same pattern as AuthRepo/AuthService.
  const teamsRepo = new TeamsRepo(fastify.db);
  const teamsService = new TeamsService(teamsRepo);

  // GET /courses/:course_id/teams
  fastify.get(
    '/courses/:course_id/teams',
    async (request, reply) => {
      try {
        const courseId = parseInt(request.params.course_id, 10);
        const teams = await teamsService.listTeams(courseId);
        return teams;
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  // GET /courses/:course_id/teams/:team_id
  fastify.get(
    '/courses/:course_id/teams/:team_id',
    async (request, reply) => {
      try {
        const courseId = parseInt(request.params.course_id, 10);
        const teamId = parseInt(request.params.team_id, 10);

        const team = await teamsService.getTeam(courseId, teamId);
        return team;
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  // GET /courses/:course_id/teams/:team_id/members
  fastify.get(
    '/courses/:course_id/teams/:team_id/members',
    async (request, reply) => {
      try {
        const courseId = parseInt(request.params.course_id, 10);
        const teamId = parseInt(request.params.team_id, 10);

        const members = await teamsService.getTeamMembers(courseId, teamId);
        return members;
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  // POST /courses/:course_id/teams
  // body: { name, description?, members?: [{ id, role }] }
  fastify.post(
    '/courses/:course_id/teams',
    async (request, reply) => {
      try {
        const courseId = parseInt(request.params.course_id, 10);

        const team = await teamsService.createTeam(courseId, request.body);
        reply.code(201).send(team);
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  // POST /courses/:course_id/teams/:team_id/add_members
  // body: { id, role } OR [{ id, role }]
  fastify.post(
    '/courses/:course_id/teams/:team_id/add_members',
    async (request, reply) => {
      try {
        const courseId = parseInt(request.params.course_id, 10);
        const teamId = parseInt(request.params.team_id, 10);

        await teamsService.addMembers(courseId, teamId, request.body);
        reply.code(204).send();
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  // PATCH /courses/:course_id/teams/:team_id
  // body: { name?, description? }
  fastify.patch(
    '/courses/:course_id/teams/:team_id',
    async (request, reply) => {
      try {
        const courseId = parseInt(request.params.course_id, 10);
        const teamId = parseInt(request.params.team_id, 10);

        const updated = await teamsService.updateTeam(
          courseId,
          teamId,
          request.body
        );
        reply.send(updated);
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  // PATCH /courses/:course_id/teams/:team_id/update_members
  // body: [{ id, role }]
  fastify.patch(
    '/courses/:course_id/teams/:team_id/update_members',
    async (request, reply) => {
      try {
        const courseId = parseInt(request.params.course_id, 10);
        const teamId = parseInt(request.params.team_id, 10);

        await teamsService.updateMembers(courseId, teamId, request.body);
        reply.code(204).send();
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );

  // DELETE /courses/:course_id/teams/:team_id/remove_members
  // body: { ids: [userId1, userId2, ...] }
  fastify.delete(
    '/courses/:course_id/teams/:team_id/remove_members',
    async (request, reply) => {
      try {
        const courseId = parseInt(request.params.course_id, 10);
        const teamId = parseInt(request.params.team_id, 10);

        const memberIds = (request.body && request.body.ids) || [];
        await teamsService.removeMembers(courseId, teamId, memberIds);
        reply.code(204).send();
      } catch (error) {
        return mapAndReply(error, reply);
      }
    }
  );
};
