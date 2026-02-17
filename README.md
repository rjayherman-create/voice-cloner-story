# 🎙️ Voice Over System

A professional-grade voice-over generation platform built with **ElevenLabs** and **Azure Text-to-Speech** (coming soon). Perfect for creating cartoon character voices, professional narrations, and animated voiceovers.

## ✨ Features

### 🎤 Voice Options
- **24+ Professional Voices** from ElevenLabs (high-quality narration)
- **50+ Cartoon Character Voices** from Azure (coming soon)
- **7 Emotion Settings** - Neutral, Happy, Sad, Angry, Excited, Calm, Serious
- **Real-time Voice Preview** - Listen before generating
- **Advanced Filters** - Filter by Gender, Accent, Style, and more

### 📁 Project Management
- Create and organize voice projects
- Save generated voiceovers
- Download MP3 files
- Track project history

### 🎨 Modern UI
- Beautiful React frontend
- Responsive design (mobile, tablet, desktop)
- Real-time voice library browsing
- Audio player with download capability

### 🐳 Docker Ready
- Production-ready Docker containers
- Redis caching for performance
- Easy deployment to cloud services
- Includes health checks

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- ElevenLabs API key (free tier available)
- Azure Speech Service key (optional, for cartoon voices)

### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/voice-over-system.git
cd voice-over-system
```

### 2. Set Environment Variables
```bash
# Copy template
cp .env.example .env

# Edit .env with your API keys
ELEVENLABS_API_KEY=sk_your_key_here
AZURE_SPEECH_KEY=your_azure_key_here
AZURE_SPEECH_REGION=eastus
```

### 3. Start with Docker
```bash
# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f voice-over-app
```

### 4. Access Application
- **Web App**: http://localhost:5001
- **API Health**: http://localhost:5001/api/health

## 📋 API Endpoints

### Voices
- `GET /api/voiceover/voices` - Get all available voices
- `GET /api/voiceover/emotions` - Get emotion options
- `GET /api/voiceover/status` - Check service status

### Generation
- `POST /api/voiceover/generate` - Generate voiceover
  ```json
  {
    "script": "Hello world",
    "voice": "voice_id",
    "emotion": "happy"
  }
  ```
- `POST /api/voiceover/tts` - Direct TTS conversion

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/:id/voiceovers` - List project voiceovers
- `POST /api/projects/:id/voiceovers` - Save voiceover

## 🛠️ Development

### Local Setup (Without Docker)

```bash
# Install dependencies
npm install

# Build frontend
cd frontend && npm run build

# Start backend
npm start
```

### Project Structure
```
voice-over-system/
├── backend/
│   ├── server.js                 # Express server
│   ├── services/
│   │   ├── elevenlab-service.js # ElevenLabs integration
│   │   └── azure-service.js     # Azure integration (coming)
│   └── routes/
│       ├── voiceover.js         # Voice generation routes
│       ├── projects.js          # Project management
│       └── voice-library.js     # Voice library
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── VoiceOverStudio.jsx
│   │   │   ├── VoiceBrowser.jsx
│   │   │   └── VoiceLibrary.jsx
│   │   └── App.jsx
│   └── dist/                    # Production build
├── Dockerfile                   # Docker image
├── docker-compose.yml           # Multi-container setup
└── .env.example                 # Environment template
```

## 🔑 Getting API Keys

### ElevenLabs
1. Go to https://elevenlabs.io
2. Sign up for free account
3. Navigate to Account → API Key
4. Copy your API key (starts with `sk_`)

### Azure Text-to-Speech (for cartoon voices)
1. Go to https://portal.azure.com
2. Create a free account ($200 credit)
3. Create "Speech" resource
4. Copy Key 1 and Region
5. Set `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION` in `.env`

## 📊 Features Roadmap

- [ ] Azure cartoon character voices (50+)
- [ ] Custom voice cloning
- [ ] Batch voiceover generation
- [ ] Video synchronization
- [ ] Audio effects (EQ, compression, reverb)
- [ ] Voice analytics and metrics
- [ ] Team collaboration
- [ ] Cloud storage integration
- [ ] Advanced scheduling

## 🐛 Troubleshooting

### Port already in use
```bash
# Change port in docker-compose.yml
# Or kill process using port 5001
lsof -i :5001
kill -9 <PID>
```

### API key not working
```bash
# Verify environment variables are loaded
docker-compose exec voice-over-app env | grep ELEVENLABS

# Restart containers
docker-compose restart voice-over-app
```

### Build fails
```bash
# Rebuild without cache
docker-compose build --no-cache
docker-compose up -d
```

## 📚 Documentation

- [Docker Setup Guide](./DOCKER_SETUP.md)
- [Docker Running Guide](./DOCKER_RUNNING.md)
- [API Documentation](./docs/API.md) (coming)
- [Deployment Guide](./docs/DEPLOYMENT.md) (coming)

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: support@voiceoversystem.com

## 🙏 Acknowledgments

- [ElevenLabs](https://elevenlabs.io) - Professional voice synthesis
- [Azure Cognitive Services](https://azure.microsoft.com/en-us/services/cognitive-services/speech-to-text/) - Cartoon character voices
- [React](https://reactjs.org) - Frontend framework
- [Express](https://expressjs.com) - Backend framework
- [Docker](https://www.docker.com) - Containerization

---

**Made with ❤️ for creators, animators, and developers**

🌟 If you find this useful, please give it a star! ⭐
