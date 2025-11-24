#!/bin/sh
set -e

echo "🔧 [entrypoint] Environment check"
echo "  DATABASE_URL=$DATABASE_URL"
echo "  NODE_ENV=$NODE_ENV"

echo "📦 [entrypoint] Running prisma generate..."
npx prisma generate

echo "🗄️ [entrypoint] Waiting for database and pushing schema..."
# Retry until db push succeeds (DB might not be up immediately)
until npx prisma db push; do
  echo "   prisma db push failed (db not ready yet?), retrying in 5 seconds..."
  sleep 5
done

echo "🚀 [entrypoint] Starting Fastify dev server..."
npm run dev
