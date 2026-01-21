#!/bin/bash

echo "Checking database initialization..."
cd backend

# Check if database has tables
TABLE_COUNT=$(docker exec store-postgres psql -U storeuser -d store -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | xargs)

if [ "$TABLE_COUNT" -eq "0" ] || [ -z "$TABLE_COUNT" ]; then
    echo "Database is empty. Initializing schema..."
    docker exec -i store-postgres psql -U storeuser -d store < database/schema.sql
    echo "Schema created successfully!"
    
    echo "Loading test data..."
    docker exec -i store-postgres psql -U storeuser -d store < database/test-data.sql 2>&1 | grep -v "ERROR" || true
    echo "Test data loaded!"
else
    echo "Database already initialized ($TABLE_COUNT tables found)"
fi

echo "Starting Backend..."
./mvnw spring-boot:run > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

cd ..

echo "Waiting for backend to start..."
sleep 30

echo "Starting Frontend..."
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend started with PID: $FRONTEND_PID"

cd ..

echo ""
echo "========================================="
echo "Servers Started Successfully!"
echo "========================================="
echo "Backend:  http://localhost:8080"
echo "Frontend: http://localhost:5173"
echo ""
echo "Backend PID:  $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "To stop servers, run:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "Logs available at:"
echo "  - backend.log"
echo "  - frontend.log"
echo "========================================="
