# RetroNotes

A retro-styled note-taking application with an 8-bit UI theme.

## 🚀 Quick Start with Docker

### Prerequisites
- Docker Desktop installed
- Docker Compose installed

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd RetroNotes/Bolivar-43eaac
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update the values (especially `JWT_SECRET` for production).

3. **Start all services**
   ```bash
   docker-compose up
   ```
   
   Or run in detached mode:
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - Database: localhost:5432

### 🛠️ Development Commands

```bash
# Start all services
npm run docker:up

# Stop all services
npm run docker:down

# View logs
docker-compose logs -f

# Rebuild containers
docker-compose up --build

# Run database migrations/seeds
docker-compose exec api-server npm run seed
```

## 📁 Project Structure

```
RetroNotes/
├── apps/
│   ├── api-server/     # NestJS backend
│   └── web-app/        # React + Vite frontend
├── packages/           # Shared packages
├── docker-compose.yml  # Docker orchestration
└── .env               # Environment variables
```

## 🔧 Local Development (Without Docker)

If you prefer to run services locally:

1. **Install dependencies**
   ```bash
   npm run install:all
   ```

2. **Start PostgreSQL** (manually or via Docker)
   ```bash
   npm run docker:db
   ```

3. **Run backend**
   ```bash
   npm run dev:api
   ```

4. **Run frontend** (in another terminal)
   ```bash
   npm run dev:web
   ```

## 🎨 Features

- 8-bit retro UI design
- Note creation and management
- Category organization
- Archive functionality
- User authentication with JWT
- PostgreSQL database

## 🐛 Troubleshooting

### Port already in use
If you see port conflicts, check what's running on ports 3000, 5173, or 5432:
```bash
# Windows
netstat -ano | findstr :3000

# Stop Docker services and try again
docker-compose down
```

### Database connection issues
```bash
# Check database health
docker-compose ps

# View database logs
docker-compose logs db
```

### Frontend not connecting to backend
Make sure `VITE_API_URL` in `.env` matches your backend URL.
