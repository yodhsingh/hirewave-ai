#!/bin/bash

# Setup script for GenAI Interview Platform Backend

set -e

echo "🚀 Setting up GenAI Interview Platform Backend..."

# Check if uv is installed
if ! command -v uv &> /dev/null; then
    echo "📦 Installing uv..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    export PATH="$HOME/.cargo/bin:$PATH"
fi

# Create virtual environment
echo "🐍 Creating virtual environment..."
uv venv

# Activate virtual environment
echo "✅ Activating virtual environment..."
source .venv/bin/activate

# Install dependencies
echo "📚 Installing dependencies..."
uv pip install -e ".[dev]"

# Copy .env.example to .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please update .env with your configuration"
fi

# Check if PostgreSQL is running
if command -v psql &> /dev/null; then
    echo "🗄️  PostgreSQL found"
else
    echo "⚠️  PostgreSQL not found. Please install PostgreSQL 15+"
fi

# Check if Redis is running
if command -v redis-cli &> /dev/null; then
    if redis-cli ping &> /dev/null; then
        echo "📦 Redis is running"
    else
        echo "⚠️  Redis is not running. Starting Redis..."
        redis-server --daemonize yes
    fi
else
    echo "⚠️  Redis not found. Please install Redis 7+"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your configuration"
echo "2. Create PostgreSQL database: createdb interview_db"
echo "3. Run migrations: alembic upgrade head"
echo "4. Start the server: uvicorn app.main:app --reload"
echo ""
echo "Or use Docker:"
echo "  docker-compose up -d"
echo ""
