#!/bin/bash

echo "🔄 Stopping all Next.js/React processes..."

# Kill all Next.js dev server processes
pkill -f "next dev" 2>/dev/null
pkill -f "next start" 2>/dev/null
pkill -f "node.*next" 2>/dev/null
pkill -f "react-scripts" 2>/dev/null

# Kill any processes on port 3000 and 3001
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null

echo "✅ All processes stopped"

# Wait for ports to be released
sleep 2

# Clear Next.js cache
echo "🗑️  Clearing Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

echo "🚀 Starting development server..."
npm run dev