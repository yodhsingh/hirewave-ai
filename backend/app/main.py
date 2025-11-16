from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from contextlib import asynccontextmanager
import logging
import yaml

from app.core.config import settings
from app.api.endpoints import auth, jobs, candidates, interviews, dashboard, ai, practice

# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    yield
    logger.info("Shutting down application")


# Create FastAPI application with comprehensive API documentation
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
# HiveWave.ai Interview Platform API

An AI-powered asynchronous interview platform by **HiveWave.ai** that helps HR teams efficiently screen candidates.

## Features

* **Authentication** - JWT-based authentication with role-based access control
* **Job Management** - Create, manage, and track job postings
* **Candidate Pipeline** - Track candidates through the interview process
* **AI Scoring** - Automatic interview analysis with GPT-4, Claude, and Gemini
* **Video Interviews** - Upload and process video responses
* **Practice Sessions** - AI-powered interview practice with consolidated insights
* **Email Notifications** - Automated candidate communications

## Authentication

Most endpoints require authentication using JWT Bearer tokens:

```
Authorization: Bearer <your_token>
```

Get your token by calling `/api/v1/auth/login` or `/api/v1/auth/register`.

## About HiveWave.ai

HiveWave.ai revolutionizes the hiring process by leveraging cutting-edge AI technology to provide
comprehensive candidate evaluation, reduce time-to-hire, and improve hiring quality.
    """,
    lifespan=lifespan,
    docs_url="/api/docs",  # Always show Swagger UI
    redoc_url="/api/redoc",  # Always show ReDoc
    openapi_url="/api/openapi.json",  # OpenAPI JSON spec
    openapi_tags=[
        {
            "name": "Authentication",
            "description": "User authentication, registration, and JWT token management. "
                          "Supports role-based access (HR, CANDIDATE, ADMIN)."
        },
        {
            "name": "Jobs",
            "description": "Job posting management for HR teams. Create, update, and manage job "
                          "listings with embedded interview questions."
        },
        {
            "name": "Candidates",
            "description": "Candidate management and tracking. Handle candidate invitations, "
                          "monitor interview progress, and manage the hiring pipeline."
        },
        {
            "name": "Interviews",
            "description": "Interview process endpoints. Candidates access questions, submit "
                          "responses, and complete interviews using unique invitation tokens."
        },
        {
            "name": "Dashboard",
            "description": "Dashboard analytics and insights. View application statistics, "
                          "recent activity, and performance metrics for HR and candidates."
        },
        {
            "name": "AI",
            "description": "AI-powered features. Resume parsing with Gemini, interview report "
                          "generation with transcription and AI evaluation."
        },
        {
            "name": "Practice",
            "description": "Interview practice system. AI-generated practice questions, "
                          "real-time feedback, and consolidated insights to improve interview skills."
        }
    ],
    contact={
        "name": "HiveWave.ai",
        "url": "https://github.com/just-ravina/soft-engg-project-sept-2025-se-SEP-15",
        "email": "support@hivewave.ai",
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
    terms_of_service="https://github.com/just-ravina/soft-engg-project-sept-2025-se-SEP-15/blob/main/README.md",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return JSONResponse(
        content={
            "status": "healthy",
            "app": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "environment": settings.ENVIRONMENT,
        }
    )


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint - Welcome to HiveWave.ai"""
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "company": "HiveWave.ai",
        "version": settings.APP_VERSION,
        "docs": "/api/docs" if settings.DEBUG else None,
        "github": "https://github.com/just-ravina/soft-engg-project-sept-2025-se-SEP-15",
    }


# OpenAPI YAML endpoint
@app.get("/api/openapi.yaml")
async def get_openapi_yaml():
    """Get OpenAPI specification in YAML format"""
    openapi_schema = app.openapi()
    yaml_content = yaml.dump(openapi_schema, sort_keys=False, default_flow_style=False)
    return Response(content=yaml_content, media_type="application/x-yaml")


# Include routers
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(jobs.router, prefix=settings.API_V1_PREFIX)
app.include_router(candidates.router, prefix=settings.API_V1_PREFIX)
app.include_router(interviews.router, prefix=settings.API_V1_PREFIX)
app.include_router(dashboard.router, prefix=settings.API_V1_PREFIX)
app.include_router(ai.router, prefix=settings.API_V1_PREFIX)
app.include_router(practice.router, prefix=settings.API_V1_PREFIX)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred",
                "details": str(exc) if settings.DEBUG else None,
            },
        },
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="debug" if settings.DEBUG else "info",
    )
