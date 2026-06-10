# Google OAuth Integration Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Configuration](#configuration)
4. [OAuth 2.0 Flow](#oauth-20-flow)
5. [Security](#security)
6. [API Endpoints](#api-endpoints)
7. [Database Integration](#database-integration)
8. [Usage Examples](#usage-examples)
9. [Troubleshooting](#troubleshooting)

## Overview

The application supports Google OAuth 2.0 for quick authentication. Users can log in using their Google account, and the system will automatically register them if they don't exist in the database.

### Key Features

- **Auto-registration**: Users are automatically registered if they don't exist
- **Role-based registration**: Users can be registered as admin or adopter
- **JWT token generation**: OAuth users receive JWT tokens for session management
- **Secure OAuth flow**: Uses OAuth 2.0 and OpenID Connect (OIDC) protocols
- **Email validation**: Google validates user email addresses

## Architecture

### File Structure

```
backend/app/
├── utils/
│   └── oauth/
│       ├── __init__.py
│       ├── oauth_config.py    # OAuth configuration using pydantic_settings
│       └── google_oauth.py    # Google OAuth client configuration
├── routes/
│   └── auth_routes.py         # OAuth endpoints (/auth/login/google, /auth/google/callback)
└── services/
    └── auth_service.py        # OAuth login/registration logic (oauth_login_or_register)
```

### OAuth Configuration

The OAuth configuration follows the same pattern as JWT configuration, using pydantic_settings to load environment variables from the `.env` file.

## Configuration

### Environment Variables

Add these variables to your `.env` (based on the `.env.example` from your project):

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Obtaining Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URI: `http://localhost:8000/auth/google/callback` (for local development)
6. For production, add your production domain: `https://your-domain.com/auth/google/callback`
7. Copy the Client ID and Client Secret

### Authorized Redirect URIs

- **Local Development**: `http://localhost:8000/auth/google/callback`
- **Production**: `https://your-domain.com/auth/google/callback`

### Authorized JavaScript Origins

- **Local Development**: `http://localhost:3000`
- **Production**: `https://your-domain.com`

## OAuth 2.0 Flow

### Step-by-Step Flow

1. **User initiates OAuth**
   - Frontend calls `GET /auth/login/google?role=adopter`
   - Backend generates authorization URL with client_id and state

2. **Google Authentication**
   - User is redirected to Google's consent screen
   - User authorizes the application
   - Google validates user identity

3. **Authorization Code**
   - Google redirects to `GET /auth/google/callback?code=...&role=adopter`
   - Backend receives temporary authorization code

4. **Token Exchange**
   - Backend exchanges authorization code for access_token with Google
   - Exchange happens via HTTPS using client_secret
   - Google validates code and returns access_token + user info

5. **User Information**
   - Backend uses access_token to get user info from Google
   - Google returns: email, given_name, family_name, etc.

6. **Database Integration**
   - Backend calls service layer (oauth_login_or_register) to handle database operations
   - Service layer searches for email in database
   - **If user exists**: Generate JWT token, return "Login successful"
   - **If user doesn't exist**: Auto-register with Google info, generate JWT token, return "Registration successful"

7. **JWT Token Generation**
   - Backend generates JWT token for session management
   - Token contains user email, role, expiration
   - Token is returned to frontend

### Flow Diagram

```
User → Frontend → Backend → Google (authentication)
                              ↓
                         Google (validation)
                              ↓
                         Google (redirect with code)
                              ↓
User → Frontend → Backend (receives code)
                              ↓
                         Backend (exchanges code for token)
                              ↓
                         Google (validates code, returns token + user info)
                              ↓
                         Backend (receives validated user info)
                              ↓
                         Backend (searches email in database)
                              ↓
                    If exists → Generate JWT token
                    If NOT exists → Auto-register + Generate JWT token
                              ↓
                         Backend (returns JWT token to frontend)
```

## Security

### OAuth 2.0 Security Features

1. **Google Identity Validation**: Google validates user identity
2. **HTTPS Required**: All OAuth communications use HTTPS
3. **Client Secret**: Only backend knows client_secret, frontend never sees it
4. **Single-Use Code**: Authorization code is single-use and expires quickly
5. **Email Validation**: Email comes from Google, already verified
6. **State Parameter**: Prevents CSRF attacks (implemented by authlib)

### Backend Security Features

1. **Password Hash**: OAuth users get a default password hash for model integrity
2. **JWT Tokens**: Backend generates its own JWT tokens for internal sessions
3. **Email as Identifier**: Google email is the unique identifier
4. **Role-Based Access**: OAuth users respect role-based authorization

### Security Considerations

- **Never expose client_secret** in frontend code
- **Always use HTTPS** in production
- **Validate redirect URIs** in Google Cloud Console
- **Monitor OAuth activity** for suspicious behavior
- **Implement rate limiting** on OAuth endpoints

## API Endpoints

### GET /auth/login/google

Redirects to Google OAuth login page.

**Request:**
```http
GET /auth/login/google?role=adopter
```

**Query Parameters:**
- `role` (optional): Role for auto-registration if user doesn't exist (default: "adopter")
  - Valid values: "adopter", "admin"

**Response:** Redirect to Google OAuth consent screen

**Example:**
```bash
curl -X GET "http://localhost:8000/auth/login/google?role=adopter"
```

### GET /auth/google/callback

Handles the OAuth callback from Google. Automatically registers users if they don't exist.

**Request:**
```http
GET /auth/google/callback?code=...&role=adopter
```

**Query Parameters:**
- `code` (required): Authorization code from Google
- `role` (optional): Role for auto-registration (default: "adopter")

**Response (200 OK) - Existing User:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "message": "Login successful",
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@gmail.com",
  "role": "adopter",
  "created_at": "2026-06-05T12:00:00Z"
}
```

**Response (200 OK) - New User (Auto-registered):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "message": "Registration successful",
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@gmail.com",
  "role": "adopter",
  "created_at": "2026-06-05T12:00:00Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Google authentication failed

**Example:**
```bash
# This endpoint is called automatically by Google after user authorization
# You don't need to call it manually
```

## Database Integration

### User Registration Process

When a user logs in with Google OAuth and doesn't exist in the database:

1. **Extract User Info from Google:**
   - `email`: User's Google email (validated by Google)
   - `first_name`: User's given name from Google
   - `last_name`: User's family name from Google

2. **Generate Default Password:**
   - A default password hash is generated using bcrypt
   - This maintains model integrity for OAuth users
   - OAuth users cannot use password login

3. **Create User Based on Role:**
   - If `role=adopter`: Create Adopter model instance
   - If `role=admin`: Create Admin model instance

4. **Save to Database:**
   - User is added to database with Google information
   - User receives a JWT token for session management

### User Data Consistency

**If user already exists:**
- Backend ignores Google's name data
- Uses existing data from database
- Only generates new JWT token
- Maintains data consistency

**If user doesn't exist:**
- Backend uses Google's name data
- Creates new user with Google information
- Generates JWT token
- User can immediately access the system

### Database Schema

OAuth users are stored the same way as regular users:

```sql
-- Base user table
CREATE TABLE user (
    user_id SERIAL PRIMARY KEY,
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    phone_number VARCHAR,
    password_hash VARCHAR NOT NULL,
    type VARCHAR(50)
);

-- Adopter table (inherits from user)
CREATE TABLE adopter (
    user_id INTEGER PRIMARY KEY REFERENCES user(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin table (inherits from user)
CREATE TABLE admin (
    user_id INTEGER PRIMARY KEY REFERENCES user(user_id) ON DELETE CASCADE
);
```

## Usage Examples

### Frontend Integration Example

```javascript
// Redirect to Google OAuth
const loginWithGoogle = (role = 'adopter') => {
  window.location.href = `http://localhost:8000/auth/login/google?role=${role}`;
};

// Handle OAuth callback (Google redirects here automatically)
// The backend will return the JWT token in the response
```

### Testing with Postman

1. **Initiate OAuth:**
   - Create a GET request to `http://localhost:8000/auth/login/google?role=adopter`
   - Postman will redirect to Google's consent screen
   - Authorize the application

2. **Receive Token:**
   - Google will redirect to the callback URL
   - The backend will return the JWT token in the response
   - Copy the `access_token` for subsequent requests

3. **Use Token:**
   ```bash
   curl -X GET "http://localhost:8000/adopter/home" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```

### Testing with cURL

```bash
# Initiate OAuth (opens browser)
curl -X GET "http://localhost:8000/auth/login/google?role=adopter" -L

# After authorization, you'll receive the JWT token
# Use the token for authenticated requests
```

## Troubleshooting

### Common Issues

**Issue: "Google authentication failed" error**
- **Cause**: Invalid client_id or client_secret
- **Solution**: Verify environment variables are correct

**Issue: Redirect URI mismatch**
- **Cause**: Redirect URI not configured in Google Cloud Console
- **Solution**: Add correct redirect URI in Google Cloud Console

**Issue: "User not found" error**
- **Cause**: This should not happen with auto-registration enabled
- **Solution**: Check if auto-registration logic is working correctly

**Issue: CORS errors**
- **Cause**: Frontend domain not in allowed origins
- **Solution**: Add frontend domain to CORS middleware configuration

**Issue: Invalid JWT token**
- **Cause**: Token expired or invalid
- **Solution**: User needs to re-authenticate with Google OAuth

### Debugging Tips

1. **Check environment variables:**
   ```bash
   echo $GOOGLE_CLIENT_ID
   echo $GOOGLE_CLIENT_SECRET
   ```

2. **Verify Google Cloud Console configuration:**
   - Check that OAuth consent screen is configured
   - Verify redirect URIs are correct
   - Ensure application is published (not in testing mode)

3. **Check backend logs:**
   - Look for OAuth-related errors
   - Verify that authlib is working correctly

4. **Test with different browsers:**
   - Some browsers may have caching issues
   - Try incognito/private mode

