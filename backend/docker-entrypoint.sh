#!/bin/sh
set -e

echo "🔧 [entrypoint] Environment check"
echo "  DATABASE_URL=$DATABASE_URL"
echo "  NODE_ENV=$NODE_ENV"

echo "📦 [entrypoint] Running prisma generate..."
npx prisma generate

echo "🗄️ [entrypoint] Waiting for database and applying migrations..."
# Retry until migrations succeed (DB might not be up immediately)
until npx prisma migrate deploy; do
  echo "   prisma migrate deploy failed (db not ready yet?), retrying in 5 seconds..."
  sleep 5
done

if [ "$DOCKER_DATABASE_SEED" = "true" ]; then
  echo "🌱 [entrypoint] Seeding database..."
  if npm run prisma:seed; then
    echo "✅ [entrypoint] Database seeded successfully"
  else
    echo "❌ [entrypoint] Database seeding failed"
  fi
else
  echo "⏭️  [entrypoint] Skipping database seed (DATABASE_SEED not set to 'true')"
fi

echo "🚀 [entrypoint] Starting Fastify dev server..."
npm run dev
