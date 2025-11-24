# PrepLounge Environment Configuration Guide

## Overview
PrepLounge now uses `.env` files for all environment configuration, making it compatible with both local development and production deployments (including Docker and CI/CD pipelines).

## Database Architecture

PrepLounge uses **TWO separate databases**:

1. **loaning.ai Remote API** - For ALL user data
   - User profiles (academic scores, extracurriculars, etc.)
   - User favorites
   - OAuth authentication
   - Accessed via `LOANING_API_BASE_URL` environment variable

2. **Local PostgreSQL** - For session management ONLY
   - Express session storage (login tokens)
   - Maintains logged-in state between requests
   - Accessed via `DATABASE_URL` environment variable
   - **NOT used for any user data**

## Required Environment Variables

### Core Configuration
- `NODE_ENV` - Set to `production` for Docker deployments
- `PORT` - Server port (default: 5000)
- `SESSION_SECRET` - Secure random string for session encryption

### Loaning.ai API (User Data Storage)
- `LOANING_API_BASE_URL` - Base URL for loaning.ai API
  - Default: `https://api-dev.loaning.ai/v1`
  - All user data (profiles, favorites, auth) goes here

### Session Store (Login State Only)
- `DATABASE_URL` - PostgreSQL connection string for session storage only
  - Example: `postgresql://user:pass@host:port/dbname`
  - In Replit, this is auto-populated

### OAuth Credentials
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `KAKAO_CLIENT_ID` - Kakao OAuth client ID
- `KAKAO_CLIENT_SECRET` - Kakao OAuth client secret

### AI Integration
- `OPEN_AI_KEY` - OpenAI API key for profile analysis

## Setup Instructions

### For Replit Development
1. Go to **Tools → Secrets** in the left sidebar
2. Click **"Edit as .env"** at the bottom
3. Copy all secrets and paste into your local `.env` file
4. The workflow will automatically restart

### For Production Deployment
1. Copy `.env.example` to `.env`
2. Fill in all required values (remove placeholder text)
3. Set `NODE_ENV=production`
4. Set `LOANING_API_BASE_URL` to your production loaning.ai URL
5. Ensure `DATABASE_URL` points to your production PostgreSQL instance

## File Structure
- `.env` - Your actual secrets (NEVER commit to Git)
- `.env.example` - Template with explanations (safe to commit)
- `.gitignore` - Configured to exclude `.env` files

## Security Notes
- All `.env` files are in `.gitignore` to prevent accidental commits
- `LOANING_API_BASE_URL` is configurable per environment (dev/staging/prod)
- All hardcoded loaning.ai URLs have been replaced with the environment variable
- Session secrets should be unique random strings in production

## Migration from Replit Secrets
The codebase now loads environment variables from `.env` files via `dotenv/config`.
Replit Secrets will still work as a fallback, but `.env` files take priority.

## Updated Files
- `server.js` - Now imports `dotenv/config` at the top
- `routes/profile.js` - Uses `LOANING_API_BASE_URL` environment variable
- `routes/favorites.js` - Uses `LOANING_API_BASE_URL` environment variable
- `routes/auth.js` - Uses `LOANING_API_BASE_URL` environment variable
- `.env.example` - Updated with all required variables and clear documentation
- `.gitignore` - Configured to exclude `.env` files
