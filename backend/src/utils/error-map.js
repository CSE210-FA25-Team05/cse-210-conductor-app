'use strict';

function mapAndReply(e, reply) {
  // Prisma common error code: https://www.prisma.io/docs/reference/api-reference/error-reference
  if (e.code === 'NOT_FOUND') return reply.notFound(e.message || 'Not found');
  if (e.code === 'BAD_REQUEST')
    return reply.badRequest(e.message || 'Bad request');
  if (e.code === 'FORBIDDEN') return reply.forbidden(e.message || 'Forbidden');
  if (e.code === 'UNAUTHORIZED')
    return reply.unauthorized(e.message || 'Unauthorized');

  // Prisma unique constraint violation
  if (e.code === 'P2002') return reply.conflict('Unique constraint violation');

  // Prisma foreign key constraint violation
  if (e.code === 'P2003')
    return reply.badRequest('Invalid relation (foreign key)');

  // Fallback for other errors
  console.error(e);
  reply.internalServerError();
}

module.exports = { mapAndReply };
