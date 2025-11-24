'use strict';

const fp = require('fastify-plugin');
const prisma = require('./prisma-client');

module.exports = fp(async function prismaPlugin(fastify) {
  // Establish connection
  await prisma.$connect();

  // Attach to fastify instance
  fastify.decorate('db', prisma);

  // Managed disconnection by Fastify lifecycle
  fastify.addHook('onClose', async (app) => {
    await app.db.$disconnect();
  });
});
