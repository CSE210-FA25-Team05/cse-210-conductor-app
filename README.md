# Conductor

Monorepo containing the full-stack web application with a **JavaScript/HTML/CSS frontend** and a **Node.js + Fastify backend**.

---

## Quick Start (Local Development)

```bash
npm run install:all
npm run dev
```

* **Frontend:** [http://localhost:5173](http://localhost:5173)
* **Backend API:** [http://localhost:3001](http://localhost:3001)

See **specs/SETUP.md** for full setup instructions.

---

## Running Servers (Node-based Development)

### Run Both (Recommended)

```bash
npm run dev
```

### Run Only Frontend

```bash
npm run dev:frontend
```

Opens on:
➡ [http://localhost:5173](http://localhost:5173)

### Run Only Backend

```bash
npm run dev:backend
```

Opens on:
➡ [http://localhost:3001](http://localhost:3001)

---

# 🐳 Docker Deployment (Full-Stack)

The project includes a full Docker environment with:

* **PostgreSQL 16** database
* **Fastify backend** running on `3001`
* **Vite frontend** running on `5173`
* **Shared docker-compose** that wires everything together
* **Persistent database volume** so data survives restarts

### Start Everything with Docker

```bash
docker compose up --build
```

After it finishes:

* **Frontend:** [http://localhost:5173](http://localhost:5173)
* **Backend API:** [http://localhost:3001](http://localhost:3001)
* **Postgres:** localhost:5432 (internal service name: `db`)

### Stop Containers

```bash
docker compose down
```

### Database Volume (Optional Reset)

To reset database data:

```bash
docker compose down -v
```

---

# Technology Versions

### Runtime

* **Node.js:** v22.12.0
* **npm:** 8.19.4
* **PostgreSQL:** 16
* **Docker Compose:** v2+

---

# Development Tools

### Nodemon (Backend Auto-Reload)

The backend uses **nodemon** for development. It reloads the server automatically when you save changes.

**With nodemon:**

* Edit file → Backend auto-restarts → Changes appear instantly

**Commands:**

* `npm run dev` — Dev mode with auto-restart
* `npm start` — Production mode using plain Node.js
