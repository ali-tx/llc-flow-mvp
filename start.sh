#!/bin/bash

# This script starts both the backend and frontend development servers.

# Function to handle cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    # Kill all background jobs started by this script
    kill $(jobs -p) 2>/dev/null
    exit
}

# Trap Ctrl+C (SIGINT) and SIGTERM
trap cleanup SIGINT SIGTERM

echo "🚀 Starting LLC-Flow Services..."
echo "--------------------------------"

# Start Backend Server
echo "📡 [Backend] Starting on http://localhost:3001..."
(cd server && npm run dev) &

# Wait a moment for server to initialize
sleep 2

# Start Frontend Client
echo "💻 [Frontend] Starting on http://localhost:5173..."
(cd client && npm run dev) &

echo "--------------------------------"
echo "✅ Both servers are running!"
echo "Press Ctrl+C to stop both."
echo "--------------------------------"

# Keep the script running and waiting for background jobs
wait
