# HiveWave.ai Interview Platform - Backend

AI-powered asynchronous interview platform built with FastAPI.

## 🚀 Quick Start (3 Steps)

### 1️⃣ Install uv (if not installed)

```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows (PowerShell)
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### 2️⃣ Setup Environment

**⚠️ Important: All commands must be run from the `backend` directory**

```bash
# Navigate to backend directory
cd backend

# Create virtual environment and install dependencies
uv sync

# Activate virtual environment
# macOS/Linux:
source .venv/bin/activate

# Windows:
.venv\Scripts\activate
```

**Note:**
- The `.env` file is already provided with database credentials
- The cloud PostgreSQL database is already set up and configured
- **No database setup needed** - just use the credentials in `.env`

### 3️⃣ Run the Application

**⚠️ Make sure you're in the `backend` directory before running these commands**

**Method 1: Using uvicorn (Recommended)**
```bash
# From backend directory:
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Method 2: Using Python directly (Alternative)**
```bash
# From backend directory, set PYTHONPATH first:
# macOS/Linux:
export PYTHONPATH=$(pwd)

# Windows:
set PYTHONPATH=%cd%

# Then run:
python app/main.py
```

**That's it!** The API is now running at:
- **API**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

---

## 📋 What You Need

- **Python 3.13** (required - newer versions may have compatibility issues)
- **uv** (package manager - installed in step 1)
- **.env file** (already provided with database credentials)

---

## 🛠️ Development Workflow

### Adding New Dependencies

```bash
# ✅ CORRECT - Use uv add (updates pyproject.toml)
uv add package-name

# After pulling new code from git
uv sync
```

**Important:** Never use `pip install` - always use `uv add` to ensure dependencies are tracked.

### Running Tests

```bash
pytest
```

### Code Formatting

```bash
# Format code
black app/

# Lint code
ruff check app/
```

---

## 📚 Project Structure

```
backend/
├── app/
│   ├── api/endpoints/      # API routes (auth, jobs, candidates, etc.)
│   ├── core/               # Config, security, JWT
│   ├── models/             # Database models (SQLAlchemy)
│   ├── schemas/            # Request/response schemas (Pydantic)
│   ├── services/           # Business logic (AI, email, storage)
│   └── main.py            # FastAPI app entry point
├── tests/                  # Test suite
├── pyproject.toml         # Dependencies (managed by uv)
├── .env                   # Environment variables (provided)
└── README.md              # This file
```

---

## 🔑 API Endpoints

Once running, visit http://localhost:8000/api/docs for interactive documentation.

### Main Features

- **Authentication**: Register, login, JWT tokens
- **Jobs**: Create and manage job postings (HR only)
- **Candidates**: Track applicants through interview pipeline
- **Interviews**: Candidates take interviews via unique tokens
- **AI Analysis**: Automatic resume parsing and interview scoring
- **Practice**: AI-powered practice interview sessions
- **Dashboard**: Analytics for HR and candidates

---

## 🧪 Tech Stack

- **Framework**: FastAPI (async)
- **Database**: PostgreSQL (Neon cloud)
- **ORM**: SQLAlchemy 2.0 (async)
- **AI**: OpenAI GPT-4, Anthropic Claude, Google Gemini
- **Package Manager**: uv
- **Python**: 3.13

---

## 💡 Common Commands

```bash
# First time setup
uv sync                                  # Install all dependencies
source .venv/bin/activate                # Activate venv (macOS/Linux)

# Start server (Method 1 - Recommended)
uvicorn app.main:app --reload --port 8000

# Start server (Method 2 - Alternative)
export PYTHONPATH=$(pwd)                 # Set PYTHONPATH
python app/main.py                       # Run with Python

# Add new package
uv add requests

# Run tests
pytest

# Update dependencies
uv sync
```

---

## 🔧 Environment Variables

The `.env` file is **already provided and configured** with:
- ✅ **Database credentials** - Cloud PostgreSQL (Neon) connection string
- ✅ **Secret keys** - JWT secret for authentication
- ✅ **AI API keys** - OpenAI, Google Gemini, Anthropic Claude
- ✅ **Storage** - AWS S3 credentials for file uploads
- ✅ **Email** - SendGrid API key for notifications

**⚠️ Important:**
- The database is **already set up** with tables and data
- **DO NOT run** `schema.sql` or `seed.sql` scripts
- Just use the provided `.env` file as-is
- Everything is pre-configured and ready to use!

---

## ❓ Troubleshooting

### "ModuleNotFoundError" when running

```bash
# Make sure you activated the virtual environment
source .venv/bin/activate  # macOS/Linux
.venv\Scripts\activate     # Windows

# And installed dependencies
uv sync
```

### "Command not found: uvicorn"

```bash
# Make sure dependencies are installed
uv sync

# And virtual environment is activated
source .venv/bin/activate

# Alternative: Run using Python directly
export PYTHONPATH=$(pwd)  # Set to current directory
python app/main.py
```

### Port 8000 already in use

```bash
# Kill the process
lsof -ti:8000 | xargs kill

# Or use a different port
uvicorn app.main:app --reload --port 8001
```

---

## 📖 Documentation

For detailed API documentation, visit:
- **CLAUDE.md** - Development guide for AI assistants
- **Swagger UI** - http://localhost:8000/api/docs
- **ReDoc** - http://localhost:8000/api/redoc
- **OpenAPI YAML** - http://localhost:8000/api/openapi.yaml

---

## 👥 Team

**HiveWave.ai** - AI-powered hiring platform

- GitHub: https://github.com/just-ravina/soft-engg-project-sept-2025-se-SEP-15
- License: MIT

---

## 🆘 Need Help?

1. Check the Swagger docs at http://localhost:8000/api/docs
2. Read CLAUDE.md for detailed development info
3. Open an issue on GitHub
