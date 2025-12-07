# ADR: Docker-Based Deployment and Development Environment

**Date:** 2025-11-15  
**Status:** Accepted

---

## 1. Context

The **Conductor** web application uses:

* Node.js + Fastify
* PostgreSQL with Prisma ORM
* A JavaScript frontend (Vite in dev, static in prod-like runs)

Before Docker, local setup required each developer to:

* Install and configure PostgreSQL manually
* Install the correct Node.js version
* Keep environment variables and Prisma state in sync
* Run services separately with `npm run dev` and manual Prisma commands

This caused:

* “Works on my machine” differences (Node/Postgres/Prisma versions, OS)
* Slow onboarding
* Drift between local, CI, and any production-like setup

We need a standard, reproducible way to run the entire stack (DB + API + UI), both in **development** and **production-like** modes, and to ensure Prisma + database schema are always in sync.

---

## 2. Decision

We adopt **Docker + Docker Compose** as the primary way to run the stack, with two compose files:

* `docker-compose.yml` (development)

  * Services:

    * `db`: `postgres:16`
    * `backend`: Node dev server (nodemon), connected to `db`
    * `frontend`: Vite dev server
  * `backend` uses a `docker-entrypoint.sh` that:

    * Runs `prisma generate`
    * Runs `prisma db push`
    * Starts the dev server

* `docker-compose.prod.yml` (production-like)

  * Services:

    * `db`: `postgres:16`
    * `migrate`: one-shot Prisma migration runner
    * `backend`: Node server (`node src/server.js`), depends on `migrate`
    * `frontend`: Nginx serving the built frontend bundle
  * Uses the same `DATABASE_URL` pattern as dev but with Docker host (`db`)

We standardize configuration via:

* `.env.example` at repo root and `backend/.env.example`
* `backend/.env` (git-ignored) for local secrets used by both host and Docker

We integrate Docker into CI by adding a workflow that builds the backend image and runs tests inside a container.

---

## 3. Rationale

### 3.1 Consistent, Reproducible Environments

Docker guarantees consistent versions of:

* Node.js
* PostgreSQL
* OS and system libraries

across local machines and CI. This significantly reduces environment-specific bugs.

With Compose, a single command:

* Dev: `docker compose up --build`
* Prod-like: `docker compose -f docker-compose.prod.yml up --build`

brings up the entire stack (DB + backend + frontend), which simplifies onboarding and gives professor/TAs a single, documented way to run the app.

### 3.2 Prisma and Database Bootstrapping

Prisma previously relied on developers remembering to run `prisma generate` and `prisma db push/migrate`, which often caused schema and client mismatches.

We now:

* In **dev**: run `prisma generate` and `prisma db push` from `backend/docker-entrypoint.sh` before the dev server starts.
* In **prod-like**: run `prisma migrate deploy` (or equivalent) from a dedicated `migrate` service; `backend` depends on `migrate` and starts only after migrations succeed.

This ensures that:

* The schema is always applied to the database
* The Prisma client is always regenerated when the schema changes
* The backend never starts against an uninitialized DB in Docker workflows

### 3.3 Alignment with CI and Future Deployment

CI builds the same backend Docker image we use locally and runs tests inside it, with a Postgres service. This:

* Makes CI a better approximation of real deployment
* Reduces surprises when moving from dev → CI → future hosted environments

The Docker-based design also keeps the door open for deploying the same images to container platforms later.

---

## 4. Alternatives

### 4.1 Host-Only Setup (No Docker)

* **Pros:** No Docker dependency; familiar `npm run dev` workflow.
* **Cons:** Manual Postgres + Node setup; environment differences; manual Prisma steps; CI and local can easily diverge.

### 4.2 Docker Only for PostgreSQL

* **Pros:** Standardized DB; simpler Docker usage.
* **Cons:** Node environment still varies; Prisma remains manual; doesn’t fully solve “works on my machine” issues.

Given our goals (consistent environments, easy onboarding, and production-like runs), both alternatives were rejected in favor of full-stack Docker Compose.

---

## 5. Consequences
* One-command startup for the full stack in dev and prod-like modes
* Consistent Node/Postgres/Prisma versions across local and CI
* Automatic DB schema and Prisma client sync via entrypoint/migrate services
* Clear instructions for non-developers (professor/TAs) to run the app
---

## 6. Implementation Summary

* Add and maintain:

  * `docker-compose.yml` (dev)
  * `docker-compose.prod.yml` (prod-like)
  * `backend/docker-entrypoint.sh` for dev bootstrapping
  * Dockerfiles for backend and frontend
  * `.env.example` and `backend/.env.example` templates
* Document common commands:

  ```bash
  # Dev
  docker compose down -v && docker compose up --build

  # Prod-like
  docker compose -f docker-compose.prod.yml down -v \
    && docker compose -f docker-compose.prod.yml up --build
  ```
