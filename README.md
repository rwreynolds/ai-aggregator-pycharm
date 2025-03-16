# AI Services Aggregator

A full-stack application that serves as a unified interface for various AI services and models. Users can interact with multiple AI models from different providers within the context of a single conversation thread.

## Features

- **Multiple AI Services**: Connect to OpenAI, Anthropic Claude, Grok, and potentially other AI providers
- **Unified Conversation**: Maintain a single conversation thread across different AI services and models
- **Custom Settings**: Adjust parameters like temperature and max tokens for each request
- **User Authentication**: Secure signup and login system
- **Responsive Design**: Works well on both desktop and mobile devices

## Tech Stack

### Frontend
- Next.js 13+ with App Router
- TypeScript
- Tailwind CSS
- NextAuth.js for authentication

### Backend
- Flask (Python)
- JWT authentication
- PostgreSQL (user accounts and settings)
- MongoDB (conversation history)

### Infrastructure
- Docker and Docker Compose
- Nginx for routing
- Digital Ocean for deployment

## Project Structure

```
ai-aggregator/
├── backend/                 # Flask API
│   ├── app/                 # Flask application
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # AI service integrations
│   │   └── utils/           # Utility functions
│   ├── Dockerfile           # Container setup for Flask
│   └── requirements.txt     # Python dependencies
├── frontend/                # Next.js frontend
│   ├── app/                 # Next.js App Router
│   ├── components/          # React components
│   ├── services/            # API services
│   ├── types/               # TypeScript type definitions
│   └── Dockerfile           # Container setup for Next.js
├── docker/                  # Docker configuration files
│   ├── nginx/               # Nginx configuration
│   └── docker-compose.yml   # Multi-container Docker setup
└── .env                     # Environment variables
```

## Getting Started

See the [SETUP.md](SETUP.md) file for detailed installation and setup instructions.

### Quick Start with Docker

1. Clone the repository
2. Copy `.env.example` to `.env` and set your environment variables
3. Run `docker-compose up -d`
4. Access the application at `http://localhost`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create a new user account
- `POST /api/auth/login` - Authenticate and get JWT token
- `GET /api/auth/user` - Get current user information

### Chat
- `GET /api/messages` - Get conversation history
- `GET /api/threads` - Get conversation threads
- `POST /api/chat` - Send a message to an AI service

### Settings
- `GET /api/settings` - Get user settings
- `POST /api/settings` - Update user settings
- `GET /api/services` - Get available AI services
- `GET /api/assistants` - Get available OpenAI assistants

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [OpenAI](https://openai.com/) for their GPT API
- [Anthropic](https://www.anthropic.com/) for their Claude API
- [Next.js](https://nextjs.org/) and [Flask](https://flask.palletsprojects.com/) for the frameworks
- [Tailwind CSS](https://tailwindcss.com/) for the styling