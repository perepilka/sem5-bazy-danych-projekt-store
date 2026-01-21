#!/bin/bash

echo "Stopping servers..."

# Stop backend
echo "Stopping Backend..."
BACKEND_PIDS=$(pgrep -f "spring-boot:run")
if [ -n "$BACKEND_PIDS" ]; then
    pkill -f "spring-boot:run"
    echo "✅ Backend stopped (PIDs: $BACKEND_PIDS)"
else
    echo "ℹ️  Backend is not running"
fi

# Stop frontend
echo "Stopping Frontend..."
FRONTEND_PIDS=$(pgrep -f "npm run dev")
if [ -n "$FRONTEND_PIDS" ]; then
    pkill -f "npm run dev"
    pkill -f "vite"
    echo "✅ Frontend stopped (PIDs: $FRONTEND_PIDS)"
else
    echo "ℹ️  Frontend is not running"
fi

echo ""
echo "========================================="
echo "All servers stopped!"
echo "========================================="
