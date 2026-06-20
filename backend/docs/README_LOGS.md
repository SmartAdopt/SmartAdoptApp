# Logs Documentation

## Table of Contents

- [Overview](#overview)
- [What is Used](#what-is-used)
- [Configuration](#configuration)
- [Log Levels](#log-levels)
- [Usage](#usage)
- [Logging in the Application](#logging-in-the-application)
- [Log Format](#log-format)
- [Viewing Logs](#viewing-logs)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [Configuration File](#configuration-file)

## Overview

The SmartAdopt backend uses **Loguru** as its logging library. Loguru is a powerful and intuitive logging library for Python that provides structured logging with color-coded console output, file-based persistent logging, and advanced features like log rotation and retention.

## What is Used

The logging system uses the following technologies:

- **Loguru**: Python logging library for structured logging
- **Python sys**: For stdout output
- **File system**: For persistent log storage

**Why Loguru?**
- Simple and intuitive API
- Built-in color-coded console output
- Automatic log rotation and retention
- Structured logging with context
- No external configuration files needed
- Better than Python's built-in logging module

## Configuration

The logging system is configured in `app/utils/logger/logger_config.py`.

### Console Handler

The console handler outputs logs to stdout with the following features:

- **Color-coded output**: Entire log lines are colored based on log level
  - DEBUG: Default terminal color
  - INFO: Green
  - WARNING: Yellow
  - ERROR: Red
- **Format**: `{timestamp} | {level} | {name}:{function}:{line} - {message}`
- **Level**: INFO and above (DEBUG logs are ignored in standard logs to reduce noise but can be enabled for diagnostics)

### File Handlers

Two file handlers are configured for persistent logging:

#### App Log (`logs/app.log`)
- **Level**: INFO and above
- **Rotation**: 500 MB
- **Retention**: 10 days
- **Format**: `{timestamp} | {level} | {name}:{function}:{line} - {message}`

#### Error Log (`logs/error.log`)
- **Level**: ERROR and above
- **Rotation**: 500 MB
- **Retention**: 30 days
- **Format**: `{timestamp} | {level} | {name}:{function}:{line} - {message}`

## Log Levels

The application uses four log levels to classify events:

- **DEBUG**: Fine-grained informational events useful to debug the application. Crucially, Pydantic field validation starts and successful checks are logged as `DEBUG` to keep standard outputs clean.
- **INFO**: General operational messages highlighting application flow (e.g. successful user/pet registration, successful logins, route triggers).
- **WARNING**: Client-side bad requests, input validation failures, or expected business logic failures (e.g. invalid password complexity, email already registered, missing required pet image URL).
- **ERROR**: Internal server errors, database failures, or external service failure events (e.g. failed to insert into MongoDB, failed to generate BLIP description, Redis failures).

## Usage

### Importing the Logger

```python
from app.utils.logger.logger_config import logger
```

### Basic Logging

```python
# Log at different levels
logger.debug("Validating email field: user@example.com")
logger.info("User registered successfully")
logger.warning("Registration failed - Email already registered")
logger.error("Failed to connect to PostgreSQL database")
```

### Logging with Context

```python
# Log with additional context
logger.info(f"User {user_id} logged in from {ip_address}")
logger.error(f"Failed to process payment for order {order_id}", extra={"order_id": order_id})
```

## Logging in the Application

### Application Initialization

The application logs important events during initialization:

```python
logger.info("Initializing FastAPI application")
logger.info("Session middleware configured")
logger.info("CORS middleware configured")
logger.info("Authentication routes registered")
logger.info("Admin routes registered")
logger.info("Adopter routes registered")
logger.info("Backblaze routes registered")
logger.info("FastAPI application initialized successfully")
```

### Authentication Events

The authentication system logs important events:

```python
# Registration
logger.info(f"POST /auth/register - Registration request for email: {user_data.email}")
logger.info(f"Registration successful for user ID: {new_user.user_id}, email: {user_data.email}")
logger.warning(f"Registration failed - Email already registered: {user_data.email}")

# Login
logger.info(f"POST /auth/login - Login request for email: {login_data.email}")
logger.info(f"Login successful for user ID: {user_response['id']}, email: {login_data.email}")
logger.warning(f"Login failed - Invalid credentials for email: {login_data.email}")

# OAuth
logger.info(f"GET /auth/login/google - OAuth login request with role: {role}")
logger.info(f"OAuth callback successful for user ID: {user_response.get('id')}")

# Token Refresh
logger.info("POST /auth/refresh - Token refresh request")
logger.info("Token refresh successful")
logger.warning("Token refresh failed - No active session found")

# Logout
logger.info("POST /auth/logout - Logout request")
logger.info("Logout successful")
logger.warning("Logout failed - No active session found")
```

### Protected Endpoints

Protected endpoints log access and authorization events:

```python
# Admin Dashboard
logger.info(f"GET /admin/dashboard - Request from user: {token_payload.get('sub')}")
logger.info(f"Admin dashboard accessed successfully by user: {token_payload.get('sub')}")
logger.warning(f"Access denied for user: {token_payload.get('sub')} - role: {user_role}")

# Adopter Home
logger.info(f"GET /adopter/home - Request from user: {token_payload.get('sub')}")
logger.info(f"Adopter home accessed successfully by user: {token_payload.get('sub')}")
logger.warning(f"Access denied for user: {token_payload.get('sub')} - role: {user_role}")
```

### Backblaze Image Upload

The Backblaze service logs upload events:

```python
logger.info(f"POST /backblaze/upload - Image upload request from user: {token_payload.get('sub')}")
logger.info(f"Image uploaded successfully: {file.filename} -> {image_url}")
logger.warning(f"Image upload denied for user: {token_payload.get('sub')} - role: {user_role}")
logger.error("Image upload failed - Backblaze bucket not found")
```

### Documentation Access

The application includes a middleware that logs when users access the FastAPI documentation:

```python
# Middleware in main.py
class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Log specifically when accessing /docs
        if request.url.path == "/docs":
            logger.info(f"User accessing FastAPI documentation")
        response = await call_next(request)
        return response
```

## Log Format

### Console Format

Console logs use color-coded output with the following format:

```
{timestamp} | {level: <8} | {name}:{function}:{line} - {message}
```

Example:
```
2026-06-13 21:45:00 | INFO     | app.main:main:13 - Initializing FastAPI application
2026-06-13 21:45:01 | WARNING  | app.routes.auth_routes:register:35 - Registration failed - Email already registered
2026-06-13 21:45:02 | ERROR    | app.services.backblaze_service:get_b2_api:33 - Failed to authorize with Backblaze
```

### File Format

File logs use the same format without color codes:

```
{timestamp} | {level: <8} | {name}:{function}:{line} - {message}
```

## Viewing Logs

### Console Logs

Console logs are displayed in the terminal when running the application locally or in Docker containers.

### Docker Logs

When running with Docker Compose, you can view logs using:

```bash
# View all logs
docker-compose -f docker-compose-local.yml logs

# View backend logs only
docker-compose -f docker-compose-local.yml logs backend

# Follow logs in real-time
docker-compose -f docker-compose-local.yml logs -f backend
```

### Dozzle

The application includes Dozzle, a web-based log viewer. Access it at:

```
http://localhost:8080
```

Dozzle provides a clean web interface to view and filter logs from all containers.

### Environment Variables

The application uses the following port-related environment variables (defined in `.env.example`):

- **DOZZLE_PORT**: Dozzle log viewer port (internal)
- **DOZZLE_EXTERNAL_PORT**: Dozzle port exposed to host (default: 8888)

### File Logs

File logs are stored in the `logs/` directory:

```bash
# View app logs
tail -f backend/logs/app.log

# View error logs
tail -f backend/logs/error.log
```

## Best Practices

### 1. Use Appropriate Log Levels

- **INFO**: General information about application flow (production)
- **WARNING**: Potentially harmful situations that don't prevent the application from running
- **ERROR**: Error events that might still allow the application to continue

### 2. Include Context in Log Messages

```python
# Good
logger.info(f"User {user_id} logged in from {ip_address}")

# Bad
logger.info("User logged in")
```

### 3. Log Important Events

- Application startup/shutdown
- User authentication events (login, logout, registration)
- Authorization failures
- API errors
- External service failures
- Data validation errors

### 4. Avoid Logging Sensitive Information

```python
# Bad - logs password
logger.info(f"User login: {email}, {password}")

# Good - logs only email
logger.info(f"User login attempt: {email}")
```

### 5. Use Structured Logging for Complex Events

```python
logger.info(
    "Payment processed",
    extra={
        "order_id": order_id,
        "amount": amount,
        "currency": currency,
        "status": status
    }
)
```

## Troubleshooting

### Logs Not Appearing

If logs are not appearing:

1. Check that the logger is imported correctly
2. Verify the log level is set appropriately
3. Ensure the handler is configured correctly
4. Check file permissions for log files

### Log Files Not Rotating

If log files are not rotating:

1. Check the rotation size configuration
2. Verify disk space availability
3. Check file permissions

### Color Codes Not Working

If color codes are not working in the console:

1. Ensure `colorize=True` is set in the handler configuration
2. Check that the terminal supports ANSI color codes
3. Verify that the log level colors are configured correctly

## Configuration File

The logging configuration is located at:

```
backend/app/utils/logger/logger_config.py
```

To modify the logging behavior, edit this file and restart the application.
