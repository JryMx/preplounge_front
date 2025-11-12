# PrepLounge Deployment Guide

## Docker Deployment Instructions

### Prerequisites
- Docker and Docker Compose installed on your server
- Domain names configured: `dev.preplounge.ai` and `preplounge.ai`
- Environment variables ready (see `.env.example`)

---

## Deployment Steps

### 1. Clone or Export the Repository
Transfer your code to your Docker server.

### 2. Configure Environment Variables

Create `.env` files for each environment:

#### Development (.env.development)
```env
NODE_ENV=development
PORT=5000
SESSION_SECRET=your-dev-session-secret-here
OAUTH_CLIENT_ID=your-dev-client-id
OAUTH_CLIENT_SECRET=your-dev-client-secret
OAUTH_CALLBACK_URL=https://dev.preplounge.ai/api/auth/callback
FRONTEND_URL=https://dev.preplounge.ai
DATABASE_URL=postgresql://username:password@host:port/database
OPEN_AI_KEY=your-openai-api-key
```

#### Production (.env.production)
```env
NODE_ENV=production
PORT=5000
SESSION_SECRET=your-production-session-secret-here
OAUTH_CLIENT_ID=your-prod-client-id
OAUTH_CLIENT_SECRET=your-prod-client-secret
OAUTH_CALLBACK_URL=https://preplounge.ai/api/auth/callback
FRONTEND_URL=https://preplounge.ai
DATABASE_URL=postgresql://username:password@host:port/database
OPEN_AI_KEY=your-openai-api-key
```

### 3. Build the Docker Image

```bash
# For development
docker build -t prep-lounge:dev .

# For production
docker build -t prep-lounge:prod .
```

### 4. Run with Docker Compose

```bash
# Development
docker-compose --env-file .env.development up -d

# Production
docker-compose --env-file .env.production up -d
```

### 5. Verify Deployment

```bash
# Check if container is running
docker ps

# View logs
docker logs prep-lounge

# Test the application
curl https://dev.preplounge.ai/api/health
curl https://preplounge.ai/api/health
```

---

## Manual Docker Run (Alternative)

If not using Docker Compose:

```bash
docker run -d \
  --name prep-lounge \
  -p 5000:5000 \
  --env-file .env.production \
  prep-lounge:prod
```

---

## Building Locally (Without Docker)

If you need to build the application locally:

```bash
# Install dependencies
npm install

# Build the frontend
npm run build

# The built files will be in ./dist directory
```

---

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment mode (development/production) | Yes |
| `PORT` | Server port (default: 5000) | No |
| `SESSION_SECRET` | Secret key for session encryption | Yes |
| `OAUTH_CLIENT_ID` | OAuth client ID from loaning.ai | Yes |
| `OAUTH_CLIENT_SECRET` | OAuth client secret from loaning.ai | Yes |
| `OAUTH_CALLBACK_URL` | OAuth callback URL | Yes |
| `FRONTEND_URL` | Frontend domain URL | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Optional* |
| `OPEN_AI_KEY` | OpenAI API key for profile analysis | Yes |

*Required if using local database instead of loaning.ai remote database

---

## Domain Configuration

Your domains should point to the Docker containers:

- **dev.preplounge.ai** → Development Docker container (port 5000)
- **preplounge.ai** → Production Docker container (port 5000)

Make sure your reverse proxy (nginx, etc.) is configured to forward traffic to the containers.

---

## Nginx Configuration Example

```nginx
# Development
server {
    listen 80;
    server_name dev.preplounge.ai;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Production
server {
    listen 80;
    server_name preplounge.ai;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Updating the Application

```bash
# Pull latest code
git pull

# Rebuild the Docker image
docker build -t prep-lounge:prod .

# Stop and remove old container
docker stop prep-lounge
docker rm prep-lounge

# Start new container
docker-compose --env-file .env.production up -d

# Or with docker run
docker run -d \
  --name prep-lounge \
  -p 5000:5000 \
  --env-file .env.production \
  prep-lounge:prod
```

---

## Troubleshooting

### Container won't start
```bash
# Check logs
docker logs prep-lounge

# Common issues:
# - Missing SESSION_SECRET
# - Invalid OAuth credentials
# - Port 5000 already in use
```

### Application not accessible
```bash
# Check if container is running
docker ps

# Check port mapping
docker port prep-lounge

# Check nginx/reverse proxy configuration
```

### Database connection issues
```bash
# Verify DATABASE_URL in .env file
# Check if database server is accessible from Docker container
# Try connecting manually with psql
```

---

## Security Checklist

- [ ] Strong SESSION_SECRET generated (use `openssl rand -base64 32`)
- [ ] HTTPS enabled with SSL certificates
- [ ] OAuth credentials kept secret
- [ ] Database credentials secured
- [ ] Firewall configured to only allow necessary ports
- [ ] Regular security updates applied
- [ ] Container running as non-root user

---

## Monitoring

```bash
# View container stats
docker stats prep-lounge

# View logs in real-time
docker logs -f prep-lounge

# Check application health
curl https://preplounge.ai/api/health
```
