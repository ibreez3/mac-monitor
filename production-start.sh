#!/bin/bash

echo "🚀 Starting MacBook System Monitor (Production)..."

# Check if build exists
if [ ! -d "client/dist" ]; then
    echo "📦 Building client..."
    cd client && npm run build && cd ..
fi

# Kill any existing process on port 3001
echo "🧹 Stopping existing services..."
lsof -ti:3001 | xargs kill -9 2>/dev/null
sleep 1

# Start server in production mode
echo "🔧 Starting production server on port 3001..."
cd server
NODE_ENV=production npm start

echo ""
echo "✅ MacBook System Monitor is running!"
echo "   Access at: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop"
