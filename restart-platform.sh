#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the script directory (project root)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "${YELLOW}=== Restarting HireWave.AI ===${NC}\n"

# Kill backend (port 8000)
echo -e "${YELLOW}Stopping backend...${NC}"
lsof -ti:8000 | xargs kill -9 2>/dev/null && echo -e "${GREEN}✓ Backend stopped${NC}" || echo -e "${YELLOW}No backend process found${NC}"

# Kill frontend (port 3000)
echo -e "${YELLOW}Stopping frontend...${NC}"
lsof -ti:3000 | xargs kill -9 2>/dev/null && echo -e "${GREEN}✓ Frontend stopped${NC}" || echo -e "${YELLOW}No frontend process found${NC}"

# Wait for ports to be fully released
sleep 2

# Clear Python cache
echo -e "\n${YELLOW}Clearing Python cache...${NC}"
find backend -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
find backend -name "*.pyc" -delete 2>/dev/null || true
echo -e "${GREEN}✓ Python cache cleared${NC}"

# Start backend
echo -e "\n${YELLOW}Starting backend...${NC}"
cd backend
source .venv/bin/activate
nohup uvicorn app.main:app --reload --port 8000 > ../backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
cd ..

# Wait for backend to start
echo -e "${YELLOW}Waiting for backend to initialize...${NC}"
sleep 3

# Start frontend
echo -e "\n${YELLOW}Starting frontend...${NC}"
cd frontend
nohup npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"
cd ..

# Wait a bit for services to start
sleep 2

# Check if both services are running
echo -e "\n${YELLOW}Checking services...${NC}"
if lsof -ti:8000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is running on port 8000${NC}"
else
    echo -e "${RED}✗ Backend failed to start${NC}"
fi

if lsof -ti:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend is running on port 3000${NC}"
else
    echo -e "${RED}✗ Frontend failed to start${NC}"
fi

# Show backend logs
echo -e "\n${YELLOW}=== Backend Logs (last 30 lines) ===${NC}\n"
tail -30 backend.log

echo -e "\n${YELLOW}=== Monitoring backend logs (Ctrl+C to stop) ===${NC}\n"
tail -f backend.log
