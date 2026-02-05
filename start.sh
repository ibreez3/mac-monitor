#!/bin/bash

echo "🚀 Starting MacBook System Monitor..."

# Check if node_modules exists, if not install dependencies
if [ ! -d "server/node_modules" ]; then
    echo "📦 Installing server dependencies..."
    cd server && npm install && cd ..
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing client dependencies..."
    cd client && npm install && cd ..
fi

# Start server and client
echo "🔧 Starting server on port 3001..."
cd server && npm start &
SERVER_PID=$!

echo "🎨 Starting client on port 3000..."
cd ../client && npm run dev &
CLIENT_PID=$!

echo ""
echo "✅ MacBook System Monitor is running!"
echo "   Web UI: http://localhost:3000"
echo "   API: http://localhost:3001/api"
echo ""
echo "Press Ctrl+C to stop all services"

# Handle Ctrl+C
trap "echo ''; echo '🛑 Stopping services...'; kill $SERVER_PID $CLIENT_PID; exit" INT

# Wait for any process to exit
wait
