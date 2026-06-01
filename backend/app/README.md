# 🚀 SMARTADOPT - Backend

Welcome to the official backend repository of **SmartAdopt**, an intelligent platform designed to optimize the pet adoption process through artificial intelligence and a highly scalable modular architecture.

---

# 📑 Table of Contents

* [Technologies Used](#️-technologies-used)
* [Project Architecture](#️-project-architecture)

  * [Directory Structure](#-directory-structure)
  * [Responsibility Table](#-responsibility-table)
* [Docker Infrastructure](#-docker-infrastructure)
* [Development Rules (SA-28)](#-development-rules-sa-28)

  * [Golden Rule](#-golden-rule)
* [Security](#-security)
* [Artificial Intelligence Integration](#-artificial-intelligence-integration)

  * [BLIP](#-blip)
  * [Llama 3](#-llama-3)
* [Testing](#-testing)
* [Documentation](#-documentation)
* [Development Team](#-development-team)

---

# 🛠️ Technologies Used

* **Framework:** FastAPI (Python)

* **Persistence:**

  * PostgreSQL (SQLAlchemy)
  * MongoDB (Beanie ODM)

* **Database Versioning:**

  * Liquibase (PostgreSQL)
  * Mongock (MongoDB)

* **Artificial Intelligence:**

  * BLIP (Computer Vision)
  * Llama 3 (NLP)

* **Infrastructure:** Docker and Docker Compose

* **Security:** Firebase Authentication + JWT

---

# 🏗️ Project Architecture

This project adheres to **Clean Architecture** principles to ensure modularity and decoupling, facilitating the seamless integration of AI models and external services.

---

## 📂 Directory Structure

This structure is the mandatory standard. Any new file must be placed following this hierarchy:

```text
SMARTADOPT-BACKEND/
├── app/                        # Source Code Root
│   ├── database/               # Client configuration (PostgreSQL, MongoDB, Firebase Admin)
│   ├── models/                 # Entity definitions (SQLAlchemy / Beanie)
│   ├── routes/                 # Presentation layer (API Endpoints, WebSockets)
│   ├── schemas/                # Data Transfer Objects (Pydantic validation)
│   ├── services/               # Business logic & AI (BLIP, Llama 3 models)
│   ├── utils/                  # Support tools (Security, Firebase Auth)
│   │   └── security.py         # Token management and identity validation
│   └── main.py                 # FastAPI orchestrator, middlewares, app lifecycle
│
├── docker/                     # Infrastructure as Code
│   ├── docker-compose.yml      # Container orchestration
│   ├── db-init/                # Base initialization scripts
│   └── db-versions/            # Database versioning (Liquibase / Mongock)
│       ├── postgres/           # PostgreSQL versioning scripts
│       └── mongodb/            # MongoDB versioning scripts
│
├── tests/                      # Unit testing and SAST suite
├── .dockerignore               # Build exclusions
├── .env                        # Environment variables
├── .gitignore                  # Git exclusions
├── Dockerfile                  # Container manifest
└── requirements.txt            # Python dependencies
```

---

## 📋 Responsibility Table

| Folder / File           | Description                                                                    |
| ----------------------- | ------------------------------------------------------------------------------ |
| `app/routes/`           | Handles incoming HTTP requests, validation triggering, and API responses.      |
| `app/services/`         | Core business logic, AI algorithms, adoption flows, and external integrations. |
| `app/models/`           | SQLAlchemy and Beanie entities representing database structures.               |
| `app/schemas/`          | Pydantic DTOs for request and response validation.                             |
| `app/database/`         | Database connection pools and persistence clients.                             |
| `app/utils/security.py` | Firebase Auth validation and JWT session handling.                             |
| `docker/db-init/`       | Base database initialization scripts.                                          |
| `docker/db-versions/`   | Liquibase and Mongock database versioning scripts.                             |
| `Dockerfile`            | Production-ready backend container configuration.                              |

---

# 🐳 Docker Infrastructure

Docker Compose orchestration is currently under integration.

The goal is to run the entire environment using:

```bash
docker-compose up -d --build
```

---

# 📐 Development Rules 

Since this backend uses a layered architecture, data communication must always flow unidirectionally.

---

## 🔄 Permitted Flow

1. **Frontend**

   * Sends an HTTP request containing a JSON payload.

2. **Schemas (Validation)**

   * Validates incoming data using Pydantic models.

3. **Routes**

   * Receives validated data and delegates processing to services.

4. **Services**

   * Executes business logic, AI processing, and workflows.

5. **Models**

   * Represents persistence entities and database mappings.

6. **Database**

   * Executes physical persistence operations.

```text
[Frontend] ──> [Schemas] ──> [Routes] ──> [Services] ──> [Models] ──> [Database]
```

---

## ✅ Golden Rule

The `routes` layer is strictly forbidden from performing direct database operations.

All persistence logic must pass through the `services` layer.

---

# 🔐 Security

All identity validation and authentication are centralized in:

```text
app/utils/security.py
```

Security stack:

* Firebase Authentication
* JWT Token Validation
* Middleware-based authorization

---

# 🧠 Artificial Intelligence Integration

AI integration is designed within `app/services/`.

---

## 📸 BLIP

Transforms images and additional data into enriched and emotionally expressive pet profiles.

---

## 📝 Llama 3

Acts as the expert evaluator.

It analyzes generated profiles, compares them against adopter requirements, and provides recommendations and adoption guidance.

---

# 🧪 Testing

System tests are centralized in:

```text
/tests
```

Including:

* Unit Testing
* SAST (Static Application Security Testing)

---

# 📝 Documentation

This repository implements the official architectural design of the SmartAdopt project.

For additional technical and functional information, consult:

* Project Confluence
* UML Diagrams
* API Documentation (Swagger/OpenAPI)

---

# 👥 Development Team

Developed by the **SmartAdopt Team**
Central University of Ecuador
