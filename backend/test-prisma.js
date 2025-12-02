// backend/test-prisma.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔌 Testing Prisma connection...');
  console.log('   DATABASE_URL =', process.env.DATABASE_URL);

  // This should exist on a PrismaClient instance
  await prisma.$connect();
  console.log('✅ prisma.$connect() OK');

  // List tables as a safe sanity check
  const rows = await prisma.$queryRaw`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `;
  console.log('📋 Tables in public schema:');
  for (const row of rows) {
    console.log('  -', row.table_name);
  }
}

main()
  .catch((err) => {
    console.error('❌ Error:', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
