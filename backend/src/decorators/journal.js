// backend/src/decorators/journal.js
'use strict';

const fp = require('fastify-plugin');
const JournalRepo = require('../services/journal/journal.repo');
const JournalPermissions = require('../services/journal/journal.permissions');
const AuthRepo = require('../services/auth/auth.repo');

module.exports = fp(async function journalPermissionDecorators(fastify) {
  const journalRepo = new JournalRepo(fastify.db);
  const authRepo = new AuthRepo(fastify.db);
  const journalPermissions = new JournalPermissions(journalRepo, authRepo);

  fastify.decorate('requireJournalAccess', async function (req, reply) {
    if (!req.user) {
      return reply.code(401).send({ error: 'Not authenticated' });
    }

    const journalId = parseInt(req.params.journal_id, 10);
    const canAccess = await journalPermissions.canAccessJournalEntry(
      req.user.id,
      journalId
    );

    if (!canAccess) {
      return reply.code(403).send({
        error: 'Forbidden',
        message: 'You do not have permission to access this journal entry',
      });
    }
  });

  fastify.decorate('requireJournalUpdate', async function (req, reply) {
    if (!req.user) {
      return reply.code(401).send({ error: 'Not authenticated' });
    }

    const journalId = parseInt(req.params.journal_id, 10);
    const canUpdate = await journalPermissions.canUpdateJournalEntry(
      req.user.id,
      journalId
    );

    if (!canUpdate) {
      return reply.code(403).send({
        error: 'Forbidden',
        message: 'Only the journal owner can update this entry',
      });
    }
  });

  fastify.decorate('requireJournalDelete', async function (req, reply) {
    if (!req.user) {
      return reply.code(401).send({ error: 'Not authenticated' });
    }

    const journalId = parseInt(req.params.journal_id, 10);
    const canDelete = await journalPermissions.canDeleteJournalEntry(
      req.user.id,
      journalId
    );

    if (!canDelete) {
      return reply.code(403).send({
        error: 'Forbidden',
        message:
          'Only the journal owner, TA, or professor can delete this entry',
      });
    }
  });
});
