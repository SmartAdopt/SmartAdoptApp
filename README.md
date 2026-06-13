# SmartAdoptApp

## Introduction

SmartAdopt is a responsive web application designed to revolutionize the operational efficiency of animal rescue foundations in Quito, Ecuador. The project addresses the administrative overload and inefficient manual processes that hinder pet adoptions, which often leave shelters operating at maximum capacity.

## Table of Contents

- [Architecture / Stack](#architecture--stack)
- [Project Structure](#project-structure)
- [Local development (Docker Compose)](#local-development-docker-compose)
  - [Prerequisites (Local)](#prerequisites-local)
  - [Environment file (.env) (Local)](#environment-Local)
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
│   │   ├── config.py        # Application configuration using pydantic_settings
│   │   ├── main.py          # FastAPI application entry point
│   │   ├── database/        # Database configurations (PostgreSQL, MongoDB, Redis)
│   │   │   ├── postgres/    # PostgreSQL configuration
│   │   │   │   └── postgres_db.py # SQLAlchemy configuration (Base, Session)
│   │   │   └── redis/       # Redis configuration for token management
│   │   │       └── redis_db.py    # Redis client configuration
│   │   ├── models/          # SQLAlchemy ORM models (User, Admin, Adopter)
│   │   ├── routes/          # API endpoints (auth, admin, adopter)
│   │   │   ├── auth_routes.py     # Authentication endpoints
│   │   │   ├── admin_routes.py    # Admin-protected endpoints
│   │   │   └── adopter_routes.py  # Adopter-protected endpoints
│   │   ├── schemas/         # Pydantic schemas for validation
│   │   ├── services/        # Business logic layer
│   │   │   └── auth_service.py    # Authentication services
│   │   └── utils/           # Utility functions
│   │       ├── jwt/         # JWT authentication utilities
│   │       │   └── jwt_utils.py   # JWT token creation, verification, and blacklist management
│   │       └── oauth/       # OAuth 2.0 utilities
│   │       │   └── google_oauth.py     # Google OAuth integration
│   ├── docs/               # Documentation
│   │   ├── README_JWT.md    # Complete JWT documentation
│   │   └── README_OAUTH.md  # Complete OAuth documentation
│   ├── tests/              # Backend tests
│   │   ├── conftest.py      # Test configuration
│   │   ├── test_auth.py     # Authentication tests
│   │   ├── test_google_oauth.py  # Google OAuth tests
│   │   └── test_main.py     # Main endpoint tests
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
├── .github/workflows/          # Pipelines de CI/CD (deploy-qa.yml, deploy-production.yml)
├── nginx/                      # Reverse Proxy Configurations (QA y production)
│   ├── nginx-qa.conf
│   ├── nginx-prod.conf
│   └── prod-common.conf        # Shared safety and compression rules
├── docker-compose-local.yml    # Local development compose
├── docker-compose-qa.yml       # QA environment compose
├── docker-compose-production.yml # Production environment compose
├── .env.example               # Environment variables template
└── .env                    # Environment variables (not committed)
```

## Local development (Docker Compose)

This project includes a local compose file: `docker-compose-local.yml`.

### Prerequisites (Local)

- Docker + Docker Compose (Compose V2, i.e. `docker compose ...`)
- From a terminal, run everything **from the repository root**

## Environment Local

Create a `.env` file at the project root. Refer to `.env.example` for the required variables:

```env
# PostgreSQL
POSTGRES_HOST=host_name_or_ip
POSTGRES_PORT=database_port
POSTGRES_DB=database_name
POSTGRES_USER=database_user
POSTGRES_PASSWORD=database_password
POSTGRES_HOST_PORT=host_port

# JWT
SECRET_KEY=secret_key_string
ALGORITHM=algorithm_name
ACCESS_TOKEN_EXPIRE_MINUTES=expiration_minutes

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# MongoDB
MONGO_HOST=mongo_host
MONGO_PORT=mongo_port
MONGO_DB=mongo_database_name
MONGO_USER=mongo_user
MONGO_PASSWORD=mongo_password

# Docker & Ports
BACKEND_INTERNAL_PORT=backend_internal_port
BACKEND_EXTERNAL_PORT=backend_external_port
FRONTEND_INTERNAL_PORT=frontend_internal_port
FRONTEND_EXTERNAL_PORT=frontend_external_port
MONGO_EXTERNAL_PORT=mongo_external_port

# API URLs
VITE_API_URL=api_url
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

The application uses JWT (JSON Web Token) authentication with role-based authorization:
- **Admin:** Full access to dashboard and management features
- **Adopter:** Access to adoption features and pet browsing

**Current Implementation:**
- Access tokens with 10-minute expiration
- Refresh tokens with configurable expiration (default: 7 days)
- Role-based authorization (admin, adopter)
- Token type checking (access/refresh)
- Token blacklist for immediate revocation
- Protected endpoints with role verification
- Redis-based token storage and management
- HTTP-Only cookies for refresh token security

**Token Blacklist:**
- When a user logs out, their access token is added to a blacklist in Redis
- Blacklisted tokens are rejected even if they haven't expired
- Blacklisted tokens automatically expire from Redis when the original token would have expired
- All protected endpoints check the blacklist before accepting a token
- This provides immediate security by allowing token revocation without waiting for natural expiration

**Note:** Only admin and adopter roles receive JWT tokens. Regular users receive empty tokens. For complete JWT documentation, refer to `backend/docs/README_JWT.md`.

### Ports (Local)

Based on `docker-compose-local.yml`:

- **Frontend:** http://localhost (container port 80 → host port **80**)
- **Backend API:** http://localhost:8000 (container port 9090 → host port **8000**)
- **PostgreSQL:** `localhost:5432`
- **MongoDB:** `localhost:27017`

### Why Nginx locally?

The current `frontend/Dockerfile` builds the React app and serves it using **Nginx** (multi-stage build). This mirrors the production-like setup where the frontend runs as static assets behind a web server.

If you prefer a more developer-friendly setup, you can create a dedicated development Dockerfile (for example `Dockerfile.dev`) and run Vite in dev mode.

### Deployment Architecture (Nginx Proxy)
In QA and Production environments, the application does not expose service ports directly to the outside world. A Nginx container is used as the primary gateway (Reverse Proxy) on port 80.

Intelligent Routing: Requests to /api/ are routed to the backend container (internal port 9090). All other static web traffic is routed to the frontend container (internal port 80).

Rate Limiting: Request limiting zones (limit_req zone=api_prod burst=20 nodelay) are implemented to protect the API against denial-of-service (DDoS) attacks or flooding.

Security Headers: Strict header injection (X-Frame-Options, X-XSS-Protection, Referrer-Policy) mitigates common vulnerabilities.

Network Isolation: The databases (postgres and mongo) and the backend operate exclusively on an internal Docker network (smartadopt-qa / smartadopt-prod), without exposing ports to the host.

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
set -euo pipefail
cd ~/SmartAdoptApp
PREV_BACKEND=$(docker inspect --format='{{.Image}}' smart-adopt-backend-qa 2>/dev/null || echo "none")
PREV_FRONTEND=$(docker inspect --format='{{.Image}}' smart-adopt-frontend-qa 2>/dev/null || echo "none")
cat > .env << 'EOF'
...  
done  
docker image prune -f
echo "QA deploy complete ✓ (sha: ${{ steps.vars.outputs.sha7 }})"       
```

### Production pipeline

Workflow: `.github/workflows/deploy-production.yml`

- **Trigger:** `push` to the `main` branch
- **Build & push images to Docker Hub:**
  - `${DOCKER_USERNAME}/backend:latest`
  - `${DOCKER_USERNAME}/frontend:latest`
- **Deploy to Production EC2 via SSH:** runs (on the instance):

```bash
set -euo pipefail
cd ~/SmartAdoptApp
PREV_BACKEND=$(docker inspect --format='{{.Image}}' smart-adopt-backend-prod 2>/dev/null || echo "none")
PREV_FRONTEND=$(docker inspect --format='{{.Image}}' smart-adopt-frontend-prod 2>/dev/null || echo "none")
cat > .env << 'ENVEOF'
... 
done
docker image prune -f
echo "Production deploy complete ✓ (sha: ${{ steps.vars.outputs.sha7 }})"
```

## Environment variables by environment (.env)

All environments expect a `.env` file at the **repository root**. The `.env` file is read by Docker Compose and must exist on:
- your machine (local)
- each EC2 instance (QA / Production)

> This README only shows **templates**. Never publish real credentials.


### QA (.env)

```env
# ─── Docker Hub ───────────────────────────────────────
DOCKER_USERNAME=tuusuario

# ─── PostgreSQL ───────────────────────────────────────
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=smartadopt_qa
POSTGRES_USER=qa_db_user
POSTGRES_PASSWORD=change_me_qa
POSTGRES_HOST_PORT=5432

# ─── MongoDB ──────────────────────────────────────────
MONGO_HOST=mongo
MONGO_PORT=27017
MONGO_DB=smartadopt_qa
MONGO_USER=qa_mongo_user
MONGO_PASSWORD=change_me_qa
MONGO_EXTERNAL_PORT=27017

# ─── JWT (FastAPI) ─────────────────────────────────────
SECRET_KEY=tu_secreto_jwt_qa
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10

# ─── Google OAuth ─────────────────────────────────────
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# ─── Docker & Ports ───────────────────────────────────
BACKEND_INTERNAL_PORT=9090
BACKEND_EXTERNAL_PORT=8000
FRONTEND_INTERNAL_PORT=80
FRONTEND_EXTERNAL_PORT=8080


# ─── API URLs ─────────────────────────────────────────
VITE_API_URL=http://localhost:8000
```
### PRODUCTION (.env)
```
# ─── Docker Hub ───────────────────────────────────────
DOCKER_USERNAME=tuusuario

# ─── PostgreSQL ───────────────────────────────────────
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=smartadopt_prod
POSTGRES_USER=prod_db_user
POSTGRES_PASSWORD=change_me_prod

# ─── MongoDB ──────────────────────────────────────────
MONGO_HOST=mongo
MONGO_PORT=27017
MONGO_DB=smartadopt_prod
MONGO_USER=prod_mongo_user
MONGO_PASSWORD=change_me_prod

# ─── JWT (FastAPI) ─────────────────────────────────────
SECRET_KEY=tu_secreto_jwt_prod_seguro
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# ─── Google OAuth ─────────────────────────────────────
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# ─── Docker & Ports ───────────────────────────────────
BACKEND_INTERNAL_PORT=9090
BACKEND_EXTERNAL_PORT=8000
FRONTEND_INTERNAL_PORT=80
FRONTEND_EXTERNAL_PORT=8080
MONGO_EXTERNAL_PORT=27017

# ─── API URLs ─────────────────────────────────────────
VITE_API_URL=http://localhost:8000
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

The CI/CD workflows deploy via SSH and expect the EC2 instances to be fully provisioned to run Docker Compose environments.

### Prerequisites (EC2)

On each target instance (QA and Production), ensure the following are installed:- Docker installed
- Docker Engine
- Docker Compose V2 (docker compose)
- Git

### Repository location on the instance

Both workflows run:

```bash
cd ~/SmartAdoptApp
```

The repository must be cloned at that exact path for the SSH user prior to the first automated deployment:
```bash
cd ~
git clone <your-repo-url> SmartAdoptApp
```

Note on environment variables: Unlike local setups, you do not need to manually create the .env file on the servers. 
The GitHub Actions workflows dynamically generate and inject the .env file using your configured repository secrets during the deployment process.

### Security Group recommendations

With the implementation of the Nginx Reverse Proxy, the external attack surface is significantly reduced. Configure your AWS Security Groups with the following inbound rules:
- Open to Public (0.0.0.0/0): * Port 80 (HTTP): Required for all incoming web and API traffic, which is managed and routed internally by Nginx.
Restricted Access:

- Port 22 (SSH): Limit access strictly to your administrators' IPs and GitHub Actions runners.

Strictly Closed to Public (Internal VPC Only):

- Port 9090: Backend API (accessed internally by Nginx).

- Port 5432: PostgreSQL Database.

- Port 27017: MongoDB Database.

These services communicate exclusively through the isolated Docker networks (smartadopt-qa / smartadopt-prod).

### SSH key setup (for GitHub Actions)

The workflows authenticate using an SSH private key stored in GitHub Secrets (QA_EC2_SSH_KEY / PROD_EC2_SSH_KEY). 
The corresponding public key must be appended to the target user’s ~/.ssh/authorized_keys file on each EC2 instance to grant access.
## Troubleshooting

- **Containers don’t start:**
  - Check logs: `docker compose -f docker-compose-production.yml logs -f`
  - Check running containers: `docker ps`
- **For isolated service debugging (e.g., Backend health check failures):**
- `docker logs smart-adopt-backend-prod -f`

- **CI deploy fails on EC2:**
  - Verify that all required GitHub Secrets are correctly populated; a missing secret will result in an incomplete .env file generation.
- Disk space issues:
- Automated deployments can accumulate dangling images. 
- The CI/CD pipelines run docker image prune -f automatically, but if the EBS volume fills up, perform a deep clean:
- `docker system prune -af --volumes`