# Voice Over System - Docker Setup Guide

## Prerequisites
- Docker installed
- Docker Compose installed
- Environment variables configured

## Environment Variables

Create a `.env` file in the root directory:

```env
# ElevenLabs Configuration
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Azure Speech Configuration (optional, for cartoon voices)
AZURE_SPEECH_KEY=your_azure_speech_key_here
AZURE_SPEECH_REGION=your_region_here

# Application
NODE_ENV=production
PORT=5001
```

## Quick Start

### 1. Build and Start Containers

```bash
# Build the Docker image
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f voice-over-app
```

### 2. Access the Application

- **App**: http://localhost:5001
- **API Health**: http://localhost:5001/api/health

### 3. Check Service Status

```bash
# See running containers
docker-compose ps

# View detailed logs
docker-compose logs voice-over-app

# Check health
curl http://localhost:5001/api/health
```

## Stop Services

```bash
# Stop containers (keep data)
docker-compose down

# Stop and remove everything
docker-compose down -v
```

## Volume Mounts

- `./uploads` - Generated audio files
- `./projects` - User projects
- `redis-data` - Redis cache data

## Services

### voice-over-app (Main Application)
- **Image**: Local build from Dockerfile
- **Port**: 5001
- **Health Check**: Every 30 seconds
- **Restart**: Automatic unless stopped

### redis (Caching - Optional)
- **Image**: redis:7-alpine
- **Port**: 6379
- **Health Check**: Every 10 seconds
- **Restart**: Automatic unless stopped

## Building for Production

```bash
# Build optimized image
docker-compose build --no-cache

# Tag for registry
docker tag voice-over-system:latest your-registry/voice-over-system:latest

# Push to registry
docker push your-registry/voice-over-system:latest
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs voice-over-app

# Rebuild
docker-compose build --no-cache
docker-compose up
```

### Health check failing
```bash
# Verify API is responding
curl http://localhost:5001/api/health

# Check ElevenLabs key
docker-compose logs voice-over-app | grep "API Key"
```

### Out of disk space
```bash
# Clean up old images and containers
docker system prune -a

# Remove specific volume
docker volume rm voice-over-system_redis-data
```

## Production Deployment

For production, consider:
1. Using a proper database (PostgreSQL) instead of file-based storage
2. Adding Nginx reverse proxy
3. Using environment-specific .env files
4. Setting up CI/CD with GitHub Actions
5. Using managed cloud services (AWS ECS, Azure Container Instances, etc.)

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/voiceover/voices` - List all voices
- `GET /api/voiceover/emotions` - Available emotions
- `POST /api/voiceover/generate` - Generate voiceover
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project

## Support

For issues with:
- **ElevenLabs**: https://elevenlabs.io/docs
- **Azure Speech**: https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/
- **Docker**: https://docs.docker.com/
