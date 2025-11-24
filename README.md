# Conductor

Monorepo containing the full-stack web application with a **JavaScript/HTML/CSS frontend** and a **Node.js + Fastify backend**.

## Prerequisites & Setup

### 1. Package Installation

Make sure to have the latest packages across root, frontend, and backend directories.

Run this in terminal:
```bash
npm run install:all
```

### 2. Environment Files (.env)

Before running the application, you need to set up `.env` files in **two locations**:

- **Root `.env`**: Only contains shared, non-sensitive Docker Compose configuration. This file is safe to track in version control.

- **Backend `backend/.env`**: Contains all secrets (Google OAuth keys, tokens, passwords, etc.). This file is **gitignored** and scoped only to the backend container. Never add secrets to the root `.env` — Docker Compose passes it to all services, creating a security risk.

Example files are provided as `.env.example` in both locations. Copy them and rename them to `.env` on your local machine.

Do this in terminal:

```bash
cp .env.example .env
```

Or `ctrl + c, ctrl + v` the .example files and rename.

### 3. Configure Backend Environment (backend/.env)

To use Google OAuth, `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` must have valid values.


Example in `backend/.env`:

```bash
# OAuth config (fill with real values on each dev machine)
GOOGLE_CLIENT_ID=<YOUR_GOOGLE_CLIENT_ID>
GOOGLE_CLIENT_SECRET=<YOUR_GOOGLE_CLIENT_SECRET>
```

**⚠️ IMPORTANT: Do NOT share these with anyone!**

If you need access, reach out to a Team 05 developer.

### 4. Start dev server with Docker

```bash
docker compose up --build
```

After it finishes:

* **Frontend:** [http://localhost:5173](http://localhost:5173)
* **Backend API:** [http://localhost:3001](http://localhost:3001)
* **Postgres:** localhost:5432 (internal service name: `db`)

### 5. Stop Containers

```bash
docker compose down
```

To reset database data:

```bash
docker compose down -v
```

### 6. Troubleshooting

1. **Verify `.env` files exist** in both root and `backend/` directories
2. **Rebuild containers**, make sure to `docker compose down` before running again to pick up environment changes:

## Development Tips

### Frontend Development

- **Hot reload enabled**: Changes to frontend code are reflected immediately at [http://localhost:5173](http://localhost:5173)
- **SvelteKit**: The frontend uses SvelteKit for routing and components
- **Frontend code**: Located in `frontend/src/`

### Backend Development

- **Fastify server**: Running on port 3001
- **Database migrations**: Prisma migrations are in `backend/prisma/migrations/`
- **Database seed**: Run seed with `npm run prisma:seed`
- **Backend code**: Located in `backend/src/`

### Database

- **PostgreSQL**: Running in a Docker container
- **Schema**: Defined in `backend/prisma/schema.prisma`
- **Connect to database directly**:
  ```bash
  psql postgresql://conductor:conductor@localhost:5432/conductor_db
  ```

### Authentication

- Uses **Google OAuth 2.0** for login
- Requires valid `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `backend/.env`

# Technology Versions

* **Node.js:** v22.12.0
* **npm:** 8.19.4
* **PostgreSQL:** 16
* **Docker Compose:** v2+
