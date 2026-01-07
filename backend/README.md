# Store Management System

A comprehensive retail store management system built with Spring Boot and PostgreSQL.

## 🏗️ Technology Stack

- **Backend**: Spring Boot 3.2.1
- **Language**: Java 21
- **Database**: PostgreSQL 16
- **Build Tool**: Maven
- **Security**: Spring Security + JWT
- **ORM**: Spring Data JPA / Hibernate

## 📋 Prerequisites

Before running this project, make sure you have:

- **Java 21 JDK** installed ([Download](https://adoptium.net/))
- **Docker & Docker Compose** installed ([Download](https://www.docker.com/get-started))
- **Git** installed

To verify installations:
```bash
java --version    # Should show Java 21
docker --version  # Should show Docker version
docker-compose --version
```

## 🚀 Quick Start Guide

### 1. Clone the Repository

```bash
git clone https://github.com/perepilka/sem5-bazy-danych-projekt-store.git
cd sem5-bazy-danych-projekt-store/backend
```

### 2. Configure Environment Variables

Copy the example environment file and customize it if needed:

```bash
cp .env.example .env
```

**Important**: The `.env` file contains database credentials. Default values:
- Database: `store`
- Username: `storeuser`
- Password: `changeme`
- Port: `5432`

⚠️ **For production**: Change the `DB_PASSWORD` and `JWT_SECRET` values!

### 3. Start PostgreSQL Database

Start the PostgreSQL container using Docker Compose:

```bash
docker-compose up -d
```

This will:
- Download PostgreSQL 16 image (if not already downloaded)
- Create a container named `store-postgres`
- Initialize the database with the schema from `database/schema.sql`
- Expose the database on port `5432`

**Verify database is running:**
```bash
docker ps | grep store-postgres
```

**View database logs:**
```bash
docker-compose logs -f postgres
```

### 4. Build the Application

Build the project using Maven wrapper (no Maven installation required):

```bash
./mvnw clean install
```

On Windows:
```cmd
mvnw.cmd clean install
```

### 5. Run the Application

Start the Spring Boot application:

```bash
./mvnw spring-boot:run
```

The application will start on `http://localhost:8080`

You should see output like:
```
Started StoreApplication in X.XXX seconds
```

## 📚 API Documentation (Swagger UI)

The API is documented using **Swagger UI** (OpenAPI 3.0).

### Access Swagger UI

Once the application is running, open your browser and navigate to:

```
http://localhost:8080/swagger-ui.html
```

### Features

- **Interactive API Documentation** - View all endpoints with detailed descriptions
- **Try It Out** - Test endpoints directly from the browser
- **JWT Authentication** - Authenticate and test protected endpoints
- **Request/Response Examples** - See schema definitions and examples
- **Organized by Tags** - Endpoints grouped by functionality

### Quick Start with Swagger

1. **Open Swagger UI**: `http://localhost:8080/swagger-ui.html`
2. **Login** to get JWT token:
   - Expand `Customer Authentication` or `Employee Authentication`
   - Use `/api/auth/customer/login` endpoint
   - Click "Try it out"
   - Enter credentials and click "Execute"
   - Copy the `token` from the response
3. **Authorize**:
   - Click the **Authorize** button (🔒) at the top right
   - Paste your token
   - Click "Authorize"
4. **Test Endpoints**:
   - Now you can test protected endpoints
   - Click any endpoint → "Try it out" → Fill parameters → "Execute"

### OpenAPI Specification

Raw OpenAPI JSON available at:
```
http://localhost:8080/v3/api-docs
```

📖 **Detailed Swagger Documentation**: See [SWAGGER_DOCUMENTATION.md](./SWAGGER_DOCUMENTATION.md) for complete guide.

## 🗄️ Database Access

### Using Docker

Connect to PostgreSQL directly from the container:

```bash
docker exec -it store-postgres psql -U storeuser -d store
```

Once inside PostgreSQL:
```sql
-- List all tables
\dt

-- View table structure
\d "Stores"

-- Query data
SELECT * FROM "Stores";

-- Exit
\q
```

### Using pgAdmin or DBeaver

- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `store`
- **Username**: `storeuser`
- **Password**: `changeme` (or your custom password from `.env`)

## 📁 Project Structure

```
sem5-bazy-danych-projekt-store/
├── .github/
│   └── INSTRUCTIONS.md          # Developer instructions & implementation plan
├── database/
│   └── schema.sql               # PostgreSQL database schema
├── src/
│   ├── main/
│   │   ├── java/org/pwr/store/
│   │   │   ├── controller/      # REST API controllers
│   │   │   ├── service/         # Business logic
│   │   │   ├── repository/      # Data access layer
│   │   │   ├── model/           # JPA entities
│   │   │   ├── dto/             # Data transfer objects
│   │   │   ├── config/          # Configuration classes
│   │   │   └── StoreApplication.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/                    # Unit and integration tests
├── .env.example                 # Example environment variables
├── .gitignore                   # Git ignore rules
├── docker-compose.yml           # Docker services configuration
├── pom.xml                      # Maven dependencies
└── README.md                    # This file
```

## 🔧 Development Commands

### Database Operations

**Stop database:**
```bash
docker-compose down
```

**Restart database (keeps data):**
```bash
docker-compose restart
```

**Reset database (deletes all data):**
```bash
docker-compose down -v
docker-compose up -d
```

**Backup database:**
```bash
docker exec store-postgres pg_dump -U storeuser store > backup.sql
```

**Restore database:**
```bash
cat backup.sql | docker exec -i store-postgres psql -U storeuser -d store
```

### Application Operations

**Run tests:**
```bash
./mvnw test
```

**Build JAR file:**
```bash
./mvnw clean package
```

**Run built JAR:**
```bash
java -jar target/store-0.0.1-SNAPSHOT.jar
```

**Run with specific profile:**
```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

## 🔐 Authentication

The system supports two types of users:

### Customer Login
- **Endpoint**: `http://store.com/api/auth/login` (or `http://localhost:8080/api/auth/login`)
- **Users**: Regular customers shopping online or in-store

### Employee Login
- **Endpoint**: `http://employee.store.com/api/auth/login` (requires DNS setup)
- **Roles**: 
  - `KIEROWNIK` (Manager)
  - `SPRZEDAWCA` (Salesperson)
  - `MAGAZYNIER` (Warehouse worker)

For local development, you can use request headers to simulate subdomain routing.

## 📊 Database Schema Overview

The system includes these main entities:

- **Stores**: Physical store locations
- **Employees**: Staff members with roles
- **Customers**: Registered customers
- **Categories**: Product categories
- **Products**: Product catalog
- **ProductItems**: Individual product instances with status tracking
- **Deliveries** & **DeliveryLines**: Inventory deliveries
- **CustomerOrders** & **OrderLines**: Online/phone orders
- **Transactions** & **TransactionItems**: Sales (receipts/invoices)
- **Returns** & **ReturnItems**: Product returns

### Product Status Flow
```
NA_STANIE → NA_EKSPOZYCJI → ZAREZERWOWANY → OCZEKUJE_NA_ODBIOR → SPRZEDANY
                                ↓
                            USZKODZONY → ZLIKWIDOWANY
```

## 🐛 Troubleshooting

### Database connection issues

**Error**: `Connection refused` or `FATAL: password authentication failed`

**Solution**:
1. Verify database is running: `docker ps`
2. Check `.env` file has correct credentials
3. Restart application: `./mvnw spring-boot:run`

### Port already in use

**Error**: `Port 8080 is already in use`

**Solution**:
```bash
# Change port in .env file
SERVER_PORT=8081

# Or kill the process using port 8080
# Linux/Mac:
lsof -ti:8080 | xargs kill -9
# Windows:
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### Maven wrapper permission denied

**Error**: `Permission denied: ./mvnw`

**Solution**:
```bash
chmod +x mvnw
```

## 👥 For Team Members

1. **Always pull latest changes** before starting work:
   ```bash
   git pull origin main
   ```

2. **Never commit** the `.env` file (it's in `.gitignore`)

3. **Database changes**: If you modify `database/schema.sql`, notify the team and recreate the database:
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

4. **Check implementation plan** in `.github/INSTRUCTIONS.md` before starting new features

5. **Run tests** before committing:
   ```bash
   ./mvnw test
   ```

## 📝 API Documentation

API documentation will be available at:
- Swagger UI: `http://localhost:8080/swagger-ui.html` (coming soon)
- API Docs: `http://localhost:8080/v3/api-docs` (coming soon)

## 📖 Further Reading

- [Spring Boot Documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [Spring Data JPA](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Project Instructions](.github/INSTRUCTIONS.md)

## 📄 License

This is a university project for PWR (Politechnika Wrocławska).

## 🤝 Contributing

This is a university project. Contact the team lead before making changes.

---

**Project Repository**: https://github.com/perepilka/sem5-bazy-danych-projekt-store
