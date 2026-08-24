# HireWave.ai Backend

The backend for HireWave.ai, an AI powered asynchronous interview platform built with FastAPI.

It connects the application frontend, database, and AI services to support the complete interview workflow from job creation and candidate management to AI assisted evaluation.

## What It Does

The backend provides

* User authentication and authorization
* Job and candidate management
* Asynchronous interview workflows
* AI assisted resume and interview analysis
* AI powered practice interviews
* HR and candidate dashboards
* Database and file management
* API based integration between application services

## Technology

Python 3.13
FastAPI
PostgreSQL
SQLAlchemy
Pydantic
OpenAI
Google Gemini
Anthropic Claude
uv

## Architecture

```text
Frontend
    |
    v
FastAPI Backend
    |
    +-------------+
    |             |
    v             v
PostgreSQL     AI Services
               OpenAI
               Gemini
               Claude
```

## Project Structure

```text
backend/
├── app/
│   ├── api/endpoints
│   ├── core
│   ├── models
│   ├── schemas
│   ├── services
│   └── main.py
├── tests
├── pyproject.toml
└── README.md
```

## Getting Started

Requirements

Python 3.13 and uv

Install dependencies from the backend directory

```bash
uv sync
source .venv/bin/activate
```

For Windows

```bash
.venv\Scripts\activate
```

Start the development server

```bash
uvicorn app.main:app --reload --port 8000
```

The API runs at

```text
http://localhost:8000
```

API documentation is available at

```text
http://localhost:8000/api/docs
```

## Development

Add a dependency

```bash
uv add package-name
```

Run tests

```bash
pytest
```

Format code

```bash
black app/
```

Check code quality

```bash
ruff check app/
```

## Environment

The application uses environment variables for database access, authentication, AI services, storage, and email services.

Keep credentials and API keys private and never commit them to the repository.

## Project Story

HireWave.ai was developed as a collaborative Software Engineering project at IIT Madras.

The project explores how generative AI can be integrated into a practical hiring workflow rather than used as a standalone model.

The backend provides the application layer that brings together users, candidates, interviews, data, and AI services into one working system.

My focus in this project has been on full stack development, AI integration, system design, and connecting different components into an end to end application.
