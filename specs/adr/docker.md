# ADR: Docker-Based Deployment and Development Environment

**Date:** 2025-11-15  
**Author:** Zhirui Xia  
**Reviewer(s):** TBD  
**Status:** Pending Review

---

## 1. Context

The full-stack web application **Conductor** is a student–professor portal that allows users to view grades, assignments, announcements, and other course-related information. The stack includes:

- **Backend:** Node.js + Fastify  
- **Frontend:** Vite-based JavaScript app  
- **Database:** PostgreSQL

Before Docker, local setup required each developer to:

- Install and configure PostgreSQL manually
- Install the correct Node.js version and dependencies
- Keep environment variables and tools in sync
- Run backend and frontend separately with `npm run dev`

This led to:

- “Works on my machine” bugs due to differing local environments
- Extra time onboarding new team members
- Drift between local environments and the CI environment

We need a way to:

- Standardize the runtime environment (Node, Postgres, OS)
- Run the full stack (db + backend + frontend) with a single command
- Align local development with what runs in CI
- Provide a simple story for professor and TAs to run the project

Given these needs, we evaluated host-only setup, Docker for only the database, and full Docker Compose for all services. We decided to adopt **Docker + Docker Compose** for local development and CI.

---

## 2. Decision

We will use **Docker** and **Docker Compose** to run the Conductor stack, and integrate Docker images into CI:

- Define a `docker-compose.yml` at the repo root that starts:
  - A `postgres:16` container for the database
  - A `conductor-backend` container for the Fastify API
  - A `conductor-frontend` container for the Vite app
- Add `backend/Dockerfile` and `frontend/Dockerfile` to build images for the backend and frontend
- Use a named volume (`db_data`) to persist PostgreSQL data
- Add a GitHub Actions workflow (`.github/workflows/docker-ci.yml`) that builds the Docker images and runs backend tests in a container

---

## 3. Rationale

### 3.1 Consistent, Reproducible Environment

Docker gives every developer and the CI environment the same:

- Node.js version
- OS and system libraries
- PostgreSQL version and configuration

This reduces environment-specific bugs and makes “it works locally but not in CI” less likely.

With Docker Compose:

- `docker compose up` starts the database, backend, and frontend together
- New teammates do not need to install Postgres or worry about version mismatches
- Professor and TAs can run the full stack with one command

### 3.2 Alignment with CI and Future Deployment

The same Docker images used locally are also used in CI:

- GitHub Actions builds `conductor-backend` from `backend/Dockerfile`
- CI runs `npm test` inside the backend container, using a Postgres service
- Frontend Docker build in CI catches build/asset issues early

This makes CI a more accurate simulation of a real deployment and prepares the project for future container-based deployment (e.g., on a cloud provider or container platform).

---

## 4. Alternatives

### 4.1 Host-Only Setup (No Docker)

**Description:**  
Developers install Node.js and PostgreSQL directly on their machine and run `npm run dev` for frontend and backend.

**Pros:**

- No extra tooling beyond Node and Postgres
- Faster startup after initial install for some developers

**Cons:**

- Higher onboarding cost (manual Postgres + Node setup for each developer)
- Different OS / Node / Postgres versions across team
- CI must be configured separately and may not match local environments
- Harder for professor and TAs to run the full stack reliably

### 4.2 Docker Only for PostgreSQL

**Description:**  
Run Postgres in Docker, but run backend and frontend directly on the host.

**Pros:**

- Standardized database environment
- Slightly simpler Docker configuration

**Cons:**

- Node.js environment still varies between developers
- Backend tests may behave differently in CI vs local
- Does not fully solve “works on my machine” issues for the application services

---

## 5. Consequences

### Positive Outcomes

- **Simpler onboarding:**  
  New developers can run the full stack with `docker compose up` once they have Docker installed.

- **Consistent environments:**  
  Same versions of Node.js and PostgreSQL across local machines and CI.

- **Better CI validation:**  
  CI builds Docker images and runs backend tests inside containers, catching issues before merging to `main`.

- **Persistence with isolation:**  
  Postgres data persists in a Docker volume (`db_data`) but does not pollute the host system.

- **Clear story for professor/TAs:**  
  One documented way to start everything (Docker) and one way to verify health (`/api/health`).

### Negative Outcomes / Trade-offs

- **Docker required:**  
  Contributors must install and run Docker Desktop, which has a learning curve and resource cost.

- **Longer initial builds:**  
  The first `docker compose build` can be slow while pulling base images and installing dependencies.

- **Two workflows to understand:**  
  Developers can still use host-based `npm run dev`, so the team must understand both host and Docker workflows.

---

## 6. Implementation

- Add Docker configuration files:
  - `docker-compose.yml` in the repo root defining `db`, `backend`, and `frontend` services
  - `backend/Dockerfile` to build the Fastify backend image
  - `frontend/Dockerfile` to build the Vite frontend image

- Wire up environment variables:
  - Backend uses `DATABASE_URL=postgres://conductor:conductor@db:5432/conductor_db`
  - Backend uses `FRONTEND_URL=http://localhost:5173` for CORS
  - Frontend uses `VITE_BACKEND_URL=http://localhost:3001` to talk to the API

- Add CI workflow:
  - `.github/workflows/docker-ci.yml`:
    - Builds backend and frontend images
    - Starts Postgres as a service
    - Runs backend tests (`npm test`) inside the backend container

- Update `README.md`:
  - Add a short “Run with Docker” section with:
    - `docker compose build`
    - `docker compose up`
    - URLs for frontend and backend health checks
