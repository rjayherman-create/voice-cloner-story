# Voice Over System - Docker Deployment Complete ✅

## Containers Running

Both containers are successfully running:

```
NAME                IMAGE                            PORTS
voice-over-system   voiceoversystem-voice-over-app   0.0.0.0:5001->5001/tcp
voice-over-redis    redis:7-alpine                   0.0.0.0:6379->6379/tcp
```

## Access Your App

- **Web Application**: http://localhost:5001
- **API Health**: http://localhost:5001/api/health
- **Redis Cache**: localhost:6379

## Next Steps: Add Azure for Cartoon Voices

To enable cartoon voices, you need an Azure Speech Service API key:

### 1. Get Azure Credentials (5 minutes)

1. Go to https://portal.azure.com
2. Create a free account or sign in
3. Click "+ Create a resource"
4. Search for "Speech"
5. Click "Speech" → Create
6. Fill in the details and click Create
7. Once deployed, go to "Keys and Endpoint"
8. Copy your **Key 1** and **Region**

### 2. Add Credentials to .env

Create `.env` file in the root directory:

```env
ELEVENLABS_API_KEY=cf09ada5db1aa161f9872c9eb567e1aa5cecffbcc7bb2fe69421dbdf41f2ac29
AZURE_SPEECH_KEY=your_azure_key_here
AZURE_SPEECH_REGION=eastus
NODE_ENV=production
PORT=5001
```

### 3. Restart Containers

```bash
docker-compose restart voice-over-system
```

### 4. Verify Azure is Connected

```bash
curl http://localhost:5001/api/voiceover/status
```

Response should show:
```json
{
  "service": "voiceover",
  "elevenLabsConfigured": true,
  "azureConfigured": true,
  "totalVoices": 74
}
```

## Docker Commands

### View Logs
```bash
# View app logs
docker-compose logs -f voice-over-app

# View Redis logs
docker-compose logs -f redis

# View all logs
docker-compose logs -f
```

### Stop/Start Services
```bash
# Stop all containers
docker-compose down

# Start all containers
docker-compose up -d

# Restart a specific service
docker-compose restart voice-over-app
```

### Clean Up
```bash
# Remove containers and volumes
docker-compose down -v

# Remove all unused Docker resources
docker system prune -a
```

## File Structure

```
voice over system/
├── Dockerfile                 # Docker image configuration
├── docker-compose.yml         # Multi-container setup
├── .env                       # Your API keys (create this)
├── .env.example               # Template for .env
├── .dockerignore              # Files to exclude from Docker
├── package.json               # Node dependencies
├── backend/                   # Express server
│   ├── server.js
│   ├── services/              # API integrations
│   │   ├── elevenlab-service.js
│   │   └── azure-service.js   # (Coming next)
│   └── routes/
├── frontend/                  # React app
│   └── dist/                  # Built frontend
└── uploads/                   # Generated audio files
```

## Volumes (Data Persistence)

- **./uploads** - Audio files persist between restarts
- **./projects** - User projects persist
- **redis-data** - Redis cache data
- **.env** - Your API keys

## Health Checks

Docker automatically checks if containers are healthy:

```bash
# Check container health
docker ps

# Manual health check
curl http://localhost:5001/api/health
curl http://localhost:5001/api/voiceover/status
```

## Production Notes

For production deployment:

1. Use a reverse proxy (Nginx)
2. Add SSL/TLS certificates
3. Use environment-specific configs
4. Set up database backup
5. Use Docker registry (Docker Hub, ECR, etc.)
6. Enable auto-scaling

## API Endpoints (All Available)

```
GET  /api/health                    - Health status
GET  /api/voiceover/status          - Service status
GET  /api/voiceover/voices          - Get all voices (ElevenLabs + Azure)
GET  /api/voiceover/emotions        - Available emotions
POST /api/voiceover/generate        - Generate audio
GET  /api/projects                  - List projects
POST /api/projects                  - Create project
GET  /api/projects/:id              - Get project details
```

## Troubleshooting

### Port 5001 already in use
```bash
# Kill the process using port 5001
lsof -i :5001
kill -9 <PID>

# Or use a different port in docker-compose.yml
# Change: "5001:5001" to "8080:5001"
```

### Container won't start
```bash
docker-compose logs voice-over-app

# Rebuild and restart
docker-compose build --no-cache
docker-compose up -d
```

### API keys not working
```bash
# Verify .env is loaded
docker-compose exec voice-over-app env | grep ELEVENLABS

# Restart with new .env
docker-compose down
docker-compose up -d
```

---

**Your Voice Over System is now running in Docker!** 🎉

Next: Add Azure Speech Service for 50+ cartoon character voices.
