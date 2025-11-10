# GenAI Interview Platform - Backend

FastAPI backend for an AI-powered asynchronous interview platform.

## 🚀 Quick Start

**Setup:**
```bash
# 1. Create virtual environment with UV
uv venv && source .venv/bin/activate

# 2. Install dependencies
uv pip install -e .

# 3. Set up database (PostgreSQL) (dont do that on production, use migrations instead)
#psql $DATABASE_URL -f scripts/sql/schema.sql
#psql $DATABASE_URL -f scripts/sql/seed.sql

# 4. Start server
uvicorn app.main:app --reload --port 8000
```

**Login Credentials:**
- See seed data in `scripts/sql/seed.sql` for test users
- Default password for all seed users: `password123`

Visit: http://localhost:8000/api/docs

---

## Features

- **RESTful API** with FastAPI
- **Async/Await** throughout for high performance
- **PostgreSQL** database with SQLAlchemy 2.0
- **JWT Authentication** with role-based access control
- **AI-Powered Interview Analysis** using OpenAI GPT-4
- **Background Job Processing** with Celery
- **Video Upload & Storage** with AWS S3
- **Email Notifications** via SendGrid
- **Simple SQL Schema** with manual migrations

## Architecture

```
backend/
├── app/
│   ├── api/
│   │   ├── dependencies/     # Shared dependencies (auth, etc.)
│   │   └── endpoints/        # API route handlers
│   ├── core/                 # Core functionality (config, security)
│   ├── db/                   # Database setup
│   ├── models/               # SQLAlchemy models
│   ├── schemas/              # Pydantic schemas
│   ├── services/             # Business logic services
│   ├── tasks/                # Celery background tasks
│   ├── utils/                # Utility functions
│   └── main.py               # FastAPI application
├── scripts/
│   └── sql/                  # Database schema and seed data
│       ├── schema.sql        # Database DDL
│       ├── seed.sql          # Sample data (all-in-one)
│       └── README.md         # SQL setup guide
├── tests/                    # Test suite
├── pyproject.toml            # Dependencies (uv)
└── .env                      # Environment variables
```

## Tech Stack

- **Framework**: FastAPI 0.109+
- **Python**: 3.11+
- **Database**: PostgreSQL 15+ with AsyncPG
- **ORM**: SQLAlchemy 2.0 (async)
- **Task Queue**: Celery + Redis
- **AI/ML**: OpenAI GPT-4, Whisper API
- **Storage**: AWS S3
- **Email**: SendGrid
- **Package Manager**: uv

## Getting Started

### Prerequisites

- **Python 3.13** (required - Python 3.14 has compatibility issues with greenlet/SQLAlchemy)
- PostgreSQL 15+ (using Neon cloud database)
- Redis 7+ (using Redis Cloud)
- uv package manager
- Optional: AWS S3 account, OpenAI API key, SendGrid API key

### Installation

1. **Install uv** (if not already installed):
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

2. **Clone the repository** and navigate to backend:
```bash
cd backend
```

3. **Create virtual environment with Python 3.13 and install dependencies**:
```bash
uv venv --python 3.13
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uv pip install -e .
```

4. **Set up environment variables**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Set up the database**:
```bash
# Set DATABASE_URL in your .env file first
# Then run:
psql $DATABASE_URL -f scripts/sql/schema.sql
psql $DATABASE_URL -f scripts/sql/seed.sql

# Or with local PostgreSQL
createdb interview_db
export DATABASE_URL="postgresql://localhost/interview_db"
psql $DATABASE_URL -f scripts/sql/schema.sql
psql $DATABASE_URL -f scripts/sql/seed.sql
```

6. **Start Redis** (if not running):
```bash
redis-server
```

### Running the Application

#### Development Mode

**Terminal 1 - API Server:**
```bash
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Celery Worker:**
```bash
celery -A app.tasks.celery_app worker --loglevel=info
```

**Terminal 3 - Celery Beat (optional, for scheduled tasks):**
```bash
celery -A app.tasks.celery_app beat --loglevel=info
```

#### Production Mode

```bash
# Using uvicorn directly
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4

# Or using gunicorn with uvicorn workers
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

### API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user

### Jobs (HR Only)
- `POST /api/v1/jobs` - Create job posting
- `GET /api/v1/jobs` - List all jobs
- `GET /api/v1/jobs/{job_id}` - Get job details
- `PATCH /api/v1/jobs/{job_id}` - Update job
- `DELETE /api/v1/jobs/{job_id}` - Delete job

### Candidates (HR Only)
- `GET /api/v1/candidates/{candidate_id}` - Get candidate details
- `PATCH /api/v1/candidates/{candidate_id}` - Update candidate status
- `POST /api/v1/candidates/{job_id}/invites` - Send bulk invites
- `GET /api/v1/candidates/{job_id}/candidates` - Get job candidates

### Interviews (Public)
- `GET /api/v1/interviews/{token}` - Get interview questions
- `POST /api/v1/interviews/{token}/responses` - Save response
- `POST /api/v1/interviews/{token}/submit` - Submit interview
- `POST /api/v1/interviews/upload/video` - Upload video file

### Applicant Dashboard 
- `GET /api/v1/dashboard/applicant` - get applicant dashboard data 

## Environment Variables

See `.env.example` for all required environment variables:

### Required
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `SECRET_KEY` - JWT secret key (generate with `openssl rand -hex 32`)
- `OPENAI_API_KEY` - OpenAI API key
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `S3_BUCKET` - S3 bucket name
- `SENDGRID_API_KEY` - SendGrid API key

### Optional
- `ANTHROPIC_API_KEY` - Alternative AI provider
- `SENTRY_DSN` - Error monitoring
- `FRONTEND_URL` - Frontend URL for email links

## Database Schema Management

The project uses manual SQL migrations for simplicity and transparency.

### Setting Up the Database

```bash
# 1. Create schema (tables, enums, constraints)
psql $DATABASE_URL -f scripts/sql/schema.sql

# 2. Load seed data (users, jobs, candidates, etc.)
psql $DATABASE_URL -f scripts/sql/seed.sql
```

### Making Schema Changes

1. Edit `scripts/sql/schema.sql` to add/modify tables
2. Document changes in `scripts/sql/README.md`
3. For existing databases, create a new migration file (e.g., `migration_001.sql`)
4. Test thoroughly before applying to production

### Database Reset (Development Only)

```bash
# WARNING: Deletes all data!
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
psql $DATABASE_URL -f scripts/sql/schema.sql
psql $DATABASE_URL -f scripts/sql/seed.sql
```

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run with verbose output
pytest -v
```

## Background Tasks

The application uses Celery for background processing:

### Tasks

1. **Interview Processing** (`process_interview_submission`)
   - Triggered when candidate submits interview
   - Transcribes video/audio responses
   - Runs AI analysis
   - Calculates scores and rankings
   - Updates candidate status

2. **Interview Reminders** (`send_interview_reminders`)
   - Scheduled task (runs daily)
   - Sends reminders to candidates who haven't completed interview

### Monitoring Celery

```bash
# View active tasks
celery -A app.tasks.celery_app inspect active

# View scheduled tasks
celery -A app.tasks.celery_app inspect scheduled

# View registered tasks
celery -A app.tasks.celery_app inspect registered

# Flower - Web-based monitoring (optional)
pip install flower
celery -A app.tasks.celery_app flower
# Visit http://localhost:5555
```

## AI Services

### Interview Scoring

The AI service analyzes interview responses and provides:
- **Overall Score** (0-100)
- **Competency Breakdown** (communication, technical skills, problem solving, culture fit, experience)
- **AI Insights** (summary, strengths, weaknesses, red flags, recommendations)
- **Skills Extraction** (technical, soft, domain skills with proficiency levels)
- **Percentile Ranking** (compared to other candidates)

### Practice Feedback

For practice mode, the AI provides:
- Communication analysis (clarity, pace, filler words)
- Content analysis (key points covered/missed)
- Actionable improvement tips
- Model answer examples

## Code Quality

```bash
# Format code with black
black app/

# Lint with ruff
ruff check app/

# Type checking with mypy
mypy app/
```

## Project Structure Details

### Models
- `User` - System users (HR, candidates, admins)
- `Job` - Job postings with questions
- `Question` - Interview questions (video, text, code, etc.)
- `Candidate` - Job applicants
- `InterviewResponse` - Individual question responses
- `CandidateScore` - AI-generated scores and insights
- `Invite` - Interview invitation tracking

### Services
- `AIService` - OpenAI integration for scoring and feedback
- `StorageService` - S3 file upload/download
- `EmailService` - SendGrid email sending

### Status Flow

**Candidate Status Pipeline:**
1. `invited` → Email sent
2. `started` → Opened interview link
3. `in_progress` → Answering questions
4. `submitted` → Completed all questions
5. `scored` → AI analysis complete
6. `shortlisted` / `rejected` → HR decision
7. `hired` → Final outcome

## Security Best Practices

- ✅ JWT tokens with expiry
- ✅ Password hashing with bcrypt
- ✅ CORS configuration
- ✅ SQL injection prevention (SQLAlchemy)
- ✅ Input validation (Pydantic)
- ✅ Signed URLs for video access (1-hour expiry)
- ✅ Role-based access control
- ✅ Rate limiting (TODO: implement)

## Deployment

### Docker (Recommended)

```bash
# Build image
docker build -t genai-interview-backend .

# Run container
docker run -p 8000:8000 --env-file .env genai-interview-backend
```

### Heroku

```bash
heroku create your-app-name
heroku addons:create heroku-postgresql:hobby-dev
heroku addons:create heroku-redis:hobby-dev
heroku config:set $(cat .env | grep -v '^#' | xargs)
git push heroku main
```

### AWS / GCP / Azure

Deploy using your preferred cloud provider with:
- EC2/VM instance running uvicorn
- Managed PostgreSQL (RDS, Cloud SQL, etc.)
- Managed Redis (ElastiCache, Memorystore, etc.)
- S3 for storage
- Load balancer for scaling

## Performance Optimization

- Use connection pooling for database
- Enable Redis caching for frequently accessed data
- Use CDN for serving video content
- Implement rate limiting
- Monitor with Sentry/DataDog
- Scale Celery workers horizontally

## Troubleshooting

### Common Issues

1. **Database connection errors**
   - Check PostgreSQL is running
   - Verify DATABASE_URL in .env
   - Ensure database exists

2. **Celery tasks not running**
   - Check Redis is running
   - Verify CELERY_BROKER_URL
   - Ensure Celery worker is running

3. **Video upload failures**
   - Check AWS credentials
   - Verify S3 bucket permissions
   - Check file size limits

4. **AI scoring not working**
   - Verify OPENAI_API_KEY
   - Check API quota/limits
   - Review Celery worker logs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run tests and linters
6. Submit a pull request

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.
