-- PostgreSQL initialization script

-- Create necessary extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user table (base table)
CREATE TABLE IF NOT EXISTS "user" (
    user_id SERIAL PRIMARY KEY,
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    phone_number VARCHAR,
    password_hash VARCHAR NOT NULL,
    type VARCHAR(50)
);

-- Create indexes for user
CREATE INDEX IF NOT EXISTS ix_user_user_id ON "user"(user_id);
CREATE INDEX IF NOT EXISTS ix_user_email ON "user"(email);

-- Create admin table
CREATE TABLE IF NOT EXISTS admin (
    user_id INTEGER PRIMARY KEY REFERENCES "user"(user_id) ON DELETE CASCADE
);

-- Create adopter table
CREATE TABLE IF NOT EXISTS adopter (
    user_id INTEGER PRIMARY KEY REFERENCES "user"(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);