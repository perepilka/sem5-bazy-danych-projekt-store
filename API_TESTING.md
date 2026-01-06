# API Testing Guide

## Setup

1. **Start the database:**
   ```bash
   docker-compose up -d
   ```

2. **Apply schema:**
   ```bash
   cat database/schema.sql | docker exec -i store-postgres psql -U storeuser -d store
   ```

3. **Load test data:**
   ```bash
   cat database/test-data.sql | docker exec -i store-postgres psql -U storeuser -d store
   ```

4. **Start the application:**
   ```bash
   ./mvnw spring-boot:run
   ```

## Authentication Endpoints

### Customer Registration

**Endpoint:** `POST /api/auth/customer/register`

**Request:**
```bash
curl -X POST http://localhost:8080/api/auth/customer/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+48123456789",
    "password": "securePassword123"
  }'
```

**Success Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "userType": "CUSTOMER",
  "username": "john.doe@example.com",
  "role": null
}
```

**Error Response (409 Conflict) - Email already exists:**
```json
{
  "timestamp": "2026-01-06T16:34:03.441",
  "status": 409,
  "error": "Conflict",
  "message": "Email already registered",
  "path": "/api/auth/customer/register"
}
```

**Validation Errors (400 Bad Request):**
```json
{
  "timestamp": "2026-01-06T16:34:03.441",
  "status": 400,
  "error": "Bad Request",
  "message": "email: Email must be valid",
  "path": "/api/auth/customer/register"
}
```

---

### Customer Login

**Endpoint:** `POST /api/auth/customer/login`

**Request:**
```bash
curl -X POST http://localhost:8080/api/auth/customer/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john.doe@example.com",
    "password": "securePassword123"
  }'
```

**Success Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "userType": "CUSTOMER",
  "username": "john.doe@example.com",
  "role": null
}
```

**Error Response (401 Unauthorized):**
```json
{
  "timestamp": "2026-01-06T16:34:03.441",
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid credentials",
  "path": "/api/auth/customer/login"
}
```

---

### Employee Login

**Endpoint:** `POST /api/auth/employee/login`

**Request:**
```bash
curl -X POST http://localhost:8080/api/auth/employee/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jan.kowalski",
    "password": "password123"
  }'
```

**Success Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "userType": "EMPLOYEE",
  "username": "jan.kowalski",
  "role": "KIEROWNIK"
}
```

**Employee Roles:**
- `KIEROWNIK` - Manager
- `SPRZEDAWCA` - Salesperson
- `MAGAZYNIER` - Warehouse worker

**Error Response (401 Unauthorized) - Inactive account:**
```json
{
  "timestamp": "2026-01-06T16:34:03.441",
  "status": 401,
  "error": "Unauthorized",
  "message": "Employee account is inactive",
  "path": "/api/auth/employee/login"
}
```

---

## Using JWT Tokens

After successful authentication, use the returned token in the `Authorization` header:

```bash
curl -X GET http://localhost:8080/api/protected-endpoint \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Token Structure:**
- Contains: `username`, `userType` (CUSTOMER/EMPLOYEE), `role` (for employees)
- Expiration: 24 hours (86400000ms)
- Algorithm: HS256

---

## Test Data

### Test Stores
1. Wrocław - ul. Główna 1
2. Kraków - ul. Rynek 10
3. Warszawa - ul. Marszałkowska 5

### Test Employees

| Login | Password | Role | Store |
|-------|----------|------|-------|
| jan.kowalski | password123 | KIEROWNIK | Wrocław |
| anna.nowak | password123 | SPRZEDAWCA | Wrocław |
| piotr.wisniewski | password123 | MAGAZYNIER | Kraków |

⚠️ **Note:** The test passwords in `database/test-data.sql` use a sample BCrypt hash. To create working test data, you need to:
1. Register a new employee through your application
2. Or generate proper BCrypt hashes for passwords

### Test Customer

| Email | Password | Name |
|-------|----------|------|
| tomasz.lewandowski@example.com | password123 | Tomasz Lewandowski |

⚠️ **Note:** Same password issue as employees. Register new customers via API.

### Test Categories
- Elektronika
- AGD
- Komputery

### Test Products
- Smartphone XYZ (1999.99 PLN)
- Telewizor 55" (2499.99 PLN)
- Lodówka (1899.99 PLN)
- Laptop ABC (3499.99 PLN)

---

## Postman Collection

You can import this JSON into Postman:

```json
{
  "info": {
    "name": "Store Management API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Customer Register",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"firstName\": \"John\",\n  \"lastName\": \"Doe\",\n  \"email\": \"john.doe@example.com\",\n  \"phoneNumber\": \"+48123456789\",\n  \"password\": \"securePassword123\"\n}"
            },
            "url": {"raw": "http://localhost:8080/api/auth/customer/register"}
          }
        },
        {
          "name": "Customer Login",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"john.doe@example.com\",\n  \"password\": \"securePassword123\"\n}"
            },
            "url": {"raw": "http://localhost:8080/api/auth/customer/login"}
          }
        },
        {
          "name": "Employee Login",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"jan.kowalski\",\n  \"password\": \"password123\"\n}"
            },
            "url": {"raw": "http://localhost:8080/api/auth/employee/login"}
          }
        }
      ]
    }
  ]
}
```

---

## Common Issues

### 401 Unauthorized - "Invalid credentials"
- Check username/email spelling
- Verify password is correct
- For test data: passwords may need to be re-hashed

### 409 Conflict - "Email already registered"
- Customer with this email already exists
- Use a different email or login instead

### 400 Bad Request - Validation errors
- Check all required fields are present
- Email must be valid format
- Password must be at least 6 characters
- Phone number must not exceed 20 characters

### 500 Internal Server Error
- Check database is running: `docker ps | grep store-postgres`
- Check application logs for details
- Verify database schema is applied

---

## Next Steps

After authentication is working:
1. Test protected endpoints with JWT tokens
2. Implement product catalog endpoints
3. Add order management
4. Add transaction processing
