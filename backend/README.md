# Backend

Fastify server.

## Install Dependencies

Run this command to ensure all the dependencies are installed for the backend.
```bash
npm install
```

## Database Setup Instructions

Choose the setup path based on your environment:

### Local Development Setup

#### Step 1 - Install Postgres

Install Postgres on your system by following the instructions [here](https://neon.com/postgresql/postgresql-getting-started).

Ensure that you have set up a password for the `postgres` user and are able to connect to the (default) `postgres` database as that user:

```bash
psql -U postgres -d postgres

# If you get a peer authentication failed error, try this command instead
# sudo -u postgres psql -d postgres
```

#### Step 2 - Create a new database

```bash
createdb -U postgres conductor
```

This creates a dedicated database to keep all our tables in one place, making it easier to reset without affecting other databases.

#### Step 3 - Add Environment Variables

Create a `.env` file in the backend directory (see `.env.example` for required format). The database URL should look like:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/conductor"
```

#### Step 4 - Apply database migrations

```bash
npm run prisma:migrate
```

This command:
- Creates/applies migrations from `prisma/migrations/`
- Generates the Prisma Client
- May prompt for confirmation if data loss will occur

#### Step 5 - Populate with seed data (Optional)

```bash
npm run prisma:seed
```

### Docker/Production Setup

When running in Docker or CI/CD environments:

#### Step 1 - Configure environment variables

Set these in your `docker-compose.yml` or environment:

```yaml
DATABASE_URL: "postgresql://user:password@db:5432/conductor"
DATABASE_SEED: "true"  # Optional: auto-seed on startup
NODE_ENV: "production"
```

#### Step 2 - Migrations apply automatically

The `docker-entrypoint.sh` script automatically runs:

```bash
npx prisma migrate deploy
```

This command:
- ✅ Non-interactive (no manual confirmation needed)
- ✅ Applies only pending migrations from `prisma/migrations/`
- ✅ Safe for production
- ❌ Requires migrations to be committed to source control

#### Step 3 - Seeding (Optional)

If `DATABASE_SEED=true`, the seed script runs automatically after migrations.

### Database Commands Reference

| Command | Use Case | Interactive? | Generates Migrations? | Safe for Production? |
|---------|----------|--------------|----------------------|---------------------|
| `npm run prisma:migrate` | Local development | ✅ Yes | ✅ Yes | ❌ No |
| `npm run prisma:push` | Quick prototyping | ❌ No | ❌ No | ⚠️ Use with caution |
| `npm run prisma:rebuild` | Reset database | ✅ Yes | ❌ No (drops DB) | ❌ No |
| `npx prisma migrate deploy` | Docker/CI/Production | ❌ No | ❌ No | ✅ Yes |

**Key Differences:**
- **`prisma migrate dev`**: Creates migrations based on schema changes, applies them, prompts if data loss occurs
- **`prisma migrate deploy`**: Only applies existing migrations from `prisma/migrations/`, never prompts (used in Docker)
- **`prisma db push`**: Syncs schema directly without creating migrations (useful for rapid iteration)
- **`prisma migrate reset`**: Drops database, applies all migrations, and seeds (destructive)

## Note

If we need to set up a new database for a test environment, we can do so by creating a new database named `test_conductor` as in Step 2 and then simply follow the rest of the steps.

## Run the dev server

```bash
npm run dev
```

> Runs at **[http://localhost:3001](http://localhost:3001/)**

## API Documentation

We have OpenAI Swagger documentation available for our project which can be accesses at
**[http://localhost:3001/docs](http://localhost:3001/docs)**.