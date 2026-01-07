# Quick Setup Guide - Backend with Swagger UI

## Prerequisites
- Java 21
- Docker and Docker Compose
- Git

## Setup Steps

### 1. Clone the Repository
```bash
git clone https://github.com/perepilka/sem5-bazy-danych-projekt-store.git
cd sem5-bazy-danych-projekt-store/backend
```

### 2. Create .env File
Copy the example file:
```bash
cp .env.example .env
```

The default values in `.env` are ready to use:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=store
DB_USERNAME=storeuser
DB_PASSWORD=changeme
```

### 3. Start PostgreSQL Database
```bash
docker-compose up -d
```

Wait a few seconds for the database to initialize.

### 4. Run the Backend
```bash
./mvnw spring-boot:run
```

Wait until you see: `Started StoreApplication in X seconds`

### 5. Open Swagger UI
Open your browser and go to:
```
http://localhost:8080/swagger-ui.html
```

## Using Swagger UI

### Test a Public Endpoint
1. Find **"Products"** section
2. Click `GET /api/products`
3. Click **"Try it out"**
4. Click **"Execute"**
5. See the results!

### Test a Protected Endpoint (requires login)

**Step 1: Login**
1. Find **"Customer Authentication"**
2. Click `POST /api/auth/customer/login`
3. Click **"Try it out"**
4. Enter this JSON:
```json
{
  "username": "newuser@example.com",
  "password": "test123"
}
```
5. Click **"Execute"**
6. Copy the **token** from the response

**Step 2: Authorize**
1. Click the **🔒 Authorize** button (top right)
2. Paste your token
3. Click **"Authorize"**
4. Click **"Close"**

**Step 3: Test Protected Endpoints**
Now you can test any endpoint! Try creating an order or viewing order history.

## Stop the Backend

Press `Ctrl+C` in the terminal where the backend is running.

To stop the database:
```bash
docker-compose down
```

## Troubleshooting

**Port 8080 already in use:**
```bash
# Find and stop the process using port 8080
lsof -i :8080
kill <PID>
```

**Database connection error:**
```bash
# Restart the database
docker-compose down
docker-compose up -d
```

**Maven permission denied:**
```bash
chmod +x mvnw
```

## Need Help?

Check these files for more details:
- `README.md` - Complete documentation
- `SWAGGER_DOCUMENTATION.md` - Detailed Swagger guide
- `API_TESTING.md` - API examples
