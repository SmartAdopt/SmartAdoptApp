# SmartAdoptApp

## Introduction

SmartAdopt is a responsive web application designed to revolutionize the operational efficiency of animal rescue foundations in Quito, Ecuador. The project addresses the administrative overload and inefficient manual processes that hinder pet adoptions, which often leave shelters operating at maximum capacity.

## Table of Contents

- [Architecture / Stack](#architecture--stack)
- [Project Structure](#project-structure)
- [Local development (Docker Compose)](#local-development-docker-compose)
  - [Prerequisites (Local)](#prerequisites-local)
  - [Environment file (.env) (Local)](#environment-file-env-local)
  - [Start / re-run / stop (Local)](#start--re-run--stop-local)
  - [Ports (Local)](#ports-local)
  - [Why Nginx locally?](#why-nginx-locally)
  - [Optional: frontend hot reload (Vite)](#optional-frontend-hot-reload-vite)
- [CI/CD (GitHub Actions)](#cicd-github-actions)
  - [QA pipeline](#qa-pipeline)
  - [Production pipeline](#production-pipeline)
- [Environment variables by environment (.env)](#environment-variables-by-environment-env)
  - [Local (.env)](#local-env)
  - [QA (.env)](#qa-env)
  - [Production (.env)](#production-env)
- [GitHub Secrets (required)](#github-secrets-required)
- [EC2 setup (QA/Production)](#ec2-setup-qaproduction)
  - [Prerequisites (EC2)](#prerequisites-ec2)
  - [Repository location on the instance](#repository-location-on-the-instance)
  - [Security Group recommendations](#security-group-recommendations)
  - [SSH key setup (for GitHub Actions)](#ssh-key-setup-for-github-actions)
- [Troubleshooting](#troubleshooting)

## Architecture / Stack

- **Frontend:** React 18 + TypeScript + Vite (built and served as static assets)
- **Web server (frontend container):** Nginx
- **Backend:** FastAPI + Python 3.12
- **Databases:** PostgreSQL + MongoDB
- **ORM:** SQLAlchemy
- **Authentication:** Bcrypt (password hashing)
- **Validation:** Pydantic
- **Orchestration:** Docker Compose
- **CI/CD:** GitHub Actions → Docker Hub → EC2 (SSH deploy)

## Project Structure

```
SmartAdoptApp/
├── backend/                 # FastAPI backend application
│   ├── app/
│   │   ├── database/       # Database configurations (PostgreSQL, MongoDB)
│   │   ├── models/         # SQLAlchemy ORM models (User, Admin, Adopter)
│   │   ├── routes/         # API endpoints (auth, etc.)
│   │   ├── schemas/        # Pydantic schemas for validation
│   │   ├── services/       # Business logic layer
│   │   └── utils/          # Utility functions
│   ├── docs/               # Documentation
│   ├── tests/              # Backend tests
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile          # Backend container configuration
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components (HomePage, AdminDashboardPage)
│   │   ├── services/       # API service layer
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   ├── tests/              # Frontend tests
│   ├── package.json        # Node.js dependencies
│   ├── vite.config.ts      # Vite configuration
│   └── Dockerfile          # Frontend container configuration
├── .github/                # GitHub Actions workflows
├── docker-compose-local.yml    # Local development compose
├── docker-compose-qa.yml       # QA environment compose
├── docker-compose-production.yml # Production environment compose
└── .env                    # Environment variables (not committed)
```

## Local development (Docker Compose)

This project includes a local compose file: `docker-compose-local.yml`.

### Prerequisites (Local)

- Docker + Docker Compose (Compose V2, i.e. `docker compose ...`)
- From a terminal, run everything **from the repository root**

### Environment Variables

Create a `.env` file at the project root with the following variables:

```env
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=smartadopt_dev
POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_HOST_PORT=5432
```

> Notes
> - Local MongoDB does **not** require credentials in `docker-compose-local.yml`.
> - `.env` is already ignored by git in this repo.

### Start / re-run / stop (Local)

1) Go to the project root:

```bash
cd <project-root>
```

2) Start the local environment:

```bash
docker compose -f docker-compose-local.yml up -d
```

3) If you need to run it again (recommended when services changed or you removed containers):

```bash
docker compose -f docker-compose-local.yml up -d --remove-orphans
```

4) Stop everything:

```bash
docker compose -f docker-compose-local.yml down
```

5) Start only backend services (without frontend):

```bash
docker compose -f docker-compose-local.yml up backend postgres mongo
```

This starts only the backend, PostgreSQL, and MongoDB containers, which is useful for backend development without running the frontend.

### Authentication

The application uses role-based authentication:
- **Admin:** Full access to dashboard and management features
- **Adopter:** Access to adoption features and pet browsing

**Note:** JWT token implementation is planned for future development. Currently, `access_token` is empty in the login response.

### Ports (Local)

Based on `docker-compose-local.yml`:

- **Frontend:** http://localhost (container port 80 → host port **80**)
- **Backend API:** http://localhost:8000 (container port 9090 → host port **8000**)
- **PostgreSQL:** `localhost:5432`
- **MongoDB:** `localhost:27017`

### Why Nginx locally?

The current `frontend/Dockerfile` builds the React app and serves it using **Nginx** (multi-stage build). This mirrors the production-like setup where the frontend runs as static assets behind a web server.

If you prefer a more developer-friendly setup, you can create a dedicated development Dockerfile (for example `Dockerfile.dev`) and run Vite in dev mode.

### Optional: frontend hot reload (Vite)

This is **optional** and **not included** in the repository by default (there is no `frontend/Dockerfile.dev` today). It is useful if a frontend developer wants hot reload.

Example `docker-compose-local.yml` frontend service (snippet):

```yml
# docker-compose-local.yml (example snippet for local dev)
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev    # uses a dev Dockerfile you create
    container_name: smart-adopt-frontend-dev
    ports:
      - "3000:5173"                 # Vite default port
    volumes:
      - ./frontend:/frontend        # hot reload
      - /frontend/node_modules      # avoid overwriting node_modules
    depends_on:
      - backend
    restart: unless-stopped
```

## CI/CD (GitHub Actions)

Deployments are automated via GitHub Actions workflows located in `.github/workflows/`.

### QA pipeline

Workflow: `.github/workflows/deploy-qa.yml`

- **Trigger:** `push` to the `qa` branch
- **Build & push images to Docker Hub:**
  - `${DOCKER_USERNAME}/backend-qa:qa`
  - `${DOCKER_USERNAME}/frontend-qa:qa`
- **Deploy to QA EC2 via SSH:** runs (on the instance):

```bash
cd ~/SmartAdoptApp
git pull origin qa
docker compose -f docker-compose-qa.yml pull
docker compose -f docker-compose-qa.yml up -d --remove-orphans
docker image prune -f
```

### Production pipeline

Workflow: `.github/workflows/deploy-production.yml`

- **Trigger:** `push` to the `main` branch
- **Build & push images to Docker Hub:**
  - `${DOCKER_USERNAME}/backend:latest`
  - `${DOCKER_USERNAME}/frontend:latest`
- **Deploy to Production EC2 via SSH:** runs (on the instance):

```bash
cd ~/SmartAdoptApp
git pull origin main
docker compose -f docker-compose-production.yml pull
docker compose -f docker-compose-production.yml up -d --remove-orphans
docker image prune -f
```

## Environment variables by environment (.env)

All environments expect a `.env` file at the **repository root**. The `.env` file is read by Docker Compose and must exist on:
- your machine (local)
- each EC2 instance (QA / Production)

> This README only shows **templates**. Never publish real credentials.

### Local (.env)

```env
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=smartadopt_dev
POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_HOST_PORT=5432
```

### QA (.env)

```env
# ─── Docker Hub ───────────────────────────────────────
DOCKER_USERNAME=tuusuario

# ─── PostgreSQL ───────────────────────────────────────
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=smartadopt_qa
POSTGRES_USER=admin
POSTGRES_PASSWORD=change_me_qa

# ─── MongoDB ──────────────────────────────────────────
MONGO_HOST=mongodb
MONGO_PORT=27017
MONGO_DB=smartadopt_qa
MONGO_USER=admin
MONGO_PASSWORD=change_me_qa
```

### Production (.env)

```env
# ─── Docker Hub ───────────────────────────────────────
DOCKER_USERNAME=tuusuario

# ─── PostgreSQL ───────────────────────────────────────
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=smartadopt_prod
POSTGRES_USER=admin
POSTGRES_PASSWORD=change_me_prod

# ─── MongoDB ──────────────────────────────────────────
MONGO_HOST=mongodb
MONGO_PORT=27017
MONGO_DB=smartadopt_prod
MONGO_USER=admin
MONGO_PASSWORD=change_me_prod
```

## GitHub Secrets (required)

These secrets must be configured in the GitHub repository settings (Actions secrets). **8 secrets total**:

| Secret name | Used by | Purpose |
|---|---|---|
| `DOCKER_USERNAME` | QA + Production | Docker Hub username for build/push |
| `DOCKER_PASSWORD` | QA + Production | Docker Hub password/token for build/push |
| `QA_EC2_HOST` | QA | QA EC2 public IP / hostname |
| `QA_EC2_USER` | QA | SSH user for QA instance |
| `QA_EC2_SSH_KEY` | QA | Private SSH key for QA instance |
| `PROD_EC2_HOST` | Production | Production EC2 public IP / hostname |
| `PROD_EC2_USER` | Production | SSH user for production instance |
| `PROD_EC2_SSH_KEY` | Production | Private SSH key for production instance |

## EC2 setup (QA/Production)

The workflows deploy via SSH and expect the EC2 instances to be ready to run Docker Compose.

### Prerequisites (EC2)

On each instance (QA and Production), you should have:
- Docker installed
- Docker Compose V2 available (`docker compose`)
- Git installed

### Repository location on the instance

Both workflows run:

```bash
cd ~/SmartAdoptApp
```

So the repository must be cloned at that path for the SSH user, for example:

```bash
cd ~
git clone <your-repo-url> SmartAdoptApp
```

Also make sure the instance has the correct branch available (`qa` or `main`) and that a `.env` file exists at the repo root with the corresponding template shown above.

### Security Group recommendations

The compose files expose ports for databases and services. For a safer setup:
- Publicly expose **80** (frontend)
- Expose **8000** (backend API) only if you need direct API access from outside (otherwise keep it private)
- Keep **5432** (PostgreSQL) and **27017** (MongoDB) restricted to the instance/VPC (not public)

### SSH key setup (for GitHub Actions)

The workflows use an SSH private key stored in GitHub Secrets (`QA_EC2_SSH_KEY` / `PROD_EC2_SSH_KEY`). The matching **public** key must be added to the target user’s `~/.ssh/authorized_keys` on each EC2 instance.

## Troubleshooting

- **Containers don’t start:**
  - Check logs: `docker compose -f docker-compose-local.yml logs -f`
  - Check running containers: `docker ps`
- **Changes not reflected locally:**
  - The local frontend runs behind Nginx (static build). Rebuild if needed:
    - `docker compose -f docker-compose-local.yml up -d --build --remove-orphans`
- **CI deploy fails on EC2:**
  - Confirm the repo exists at `~/SmartAdoptApp` and has the correct branch.
  - Confirm `.env` exists on the instance and contains required variables for that environment.
