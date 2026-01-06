# Development Instructions for Store Management System

## Project Overview
A retail store management system with Spring Boot backend and PostgreSQL database.
- **Group ID**: org.pwr
- **Artifact ID**: store
- **Java Version**: 21
- **Build Tool**: Maven
- **Database**: PostgreSQL 16

## Implementation Plan

### Phase 1: Foundation & Core Setup ✅
- [x] Initialize Spring Boot project with Maven
- [x] Set up PostgreSQL with Docker Compose
- [x] Configure environment variables (.env, .env.example)
- [x] Create database schema with ENUMs
- [x] Set up 3-layer architecture (Controller → Service → Repository)
- [x] Configure Spring Security basics

### Phase 2: Authentication & User Management ✅
- [x] Implement domain-based routing (employee.store.com vs store.com)
- [x] Create Employee authentication endpoints
- [x] Create Customer authentication endpoints
- [x] Implement JWT token generation and validation
- [x] Add password hashing with BCrypt
- [x] Create user role-based access control (KIEROWNIK, SPRZEDAWCA, MAGAZYNIER)

### Phase 3: Product & Inventory Management ✅
- [x] CRUD operations for Categories
- [x] CRUD operations for Products
- [x] Product inventory tracking (ProductItems)
- [x] Product status management (NA_STANIE → SPRZEDANY flow)
- [x] Stock availability checks per store

### Phase 4: Delivery Management ✅
- [x] Create Delivery records
- [x] Add DeliveryLines (products in delivery)
- [x] Generate ProductItems from deliveries
- [x] Simple delivery acceptance workflow

### Phase 5: Customer Orders (Online/Phone)
- [ ] Create CustomerOrder with OrderLines
- [ ] Order status workflow (NOWE → ZAKONCZONE)
- [ ] Cross-store product availability check
- [ ] Reserve products for orders
- [ ] Calculate order totals

### Phase 6: Transactions & Sales
- [ ] Create Transaction (PARAGON/FAKTURA)
- [ ] Link specific ProductItems to transactions
- [ ] Update product status to SPRZEDANY
- [ ] Link online order pickup to transaction
- [ ] Calculate transaction totals

### Phase 7: Returns Management
- [ ] Create Return requests
- [ ] Add ReturnItems with condition checks
- [ ] Return status workflow
- [ ] Update ProductItem status after return (NA_STANIE/USZKODZONY)

### Phase 8: Store Management
- [ ] CRUD operations for Stores
- [ ] Assign employees to stores
- [ ] View inventory per store

## Technical Guidelines

### Architecture
- **Controllers**: Handle HTTP requests, validate input, return DTOs
- **Services**: Business logic, transaction management
- **Repositories**: JPA data access layer
- **DTOs**: Use when entity structure doesn't match API needs (keep minimal)

### Naming Conventions
- Entities: Singular nouns (Store, Employee, Product)
- Repositories: EntityRepository (StoreRepository)
- Services: EntityService (StoreService)
- Controllers: EntityController (StoreController)
- DTOs: EntityDTO, CreateEntityRequest, UpdateEntityRequest

### Database
- Use JPA entities with proper relationships
- Leverage PostgreSQL ENUMs (product_status, user_role, order_status)
- Use SERIAL for auto-increment primary keys
- Apply proper foreign key constraints

### Security
- Keep authentication simple
- Use BCrypt for password hashing
- JWT tokens for stateless authentication
- Separate customer and employee authentication domains

### Code Quality
- Keep code minimal and clean
- Avoid over-engineering
- Write self-documenting code
- Comment only when necessary
- Validate inputs at controller level
- Handle exceptions gracefully

## Environment Setup

### Prerequisites
- Java 21 JDK
- Docker & Docker Compose
- Maven 3.9+
- Git

### Running the Project
1. Copy `.env.example` to `.env`
2. Start PostgreSQL: `docker-compose up -d`
3. Run application: `./mvnw spring-boot:run`
4. API available at: `http://localhost:8080`

### Database Access
- Container: `docker exec -it store-postgres psql -U storeuser -d store`
- Apply schema: `psql -U storeuser -d store -f database/schema.sql`

## Features Implemented

### ✅ Phase 1 - Foundation (2026-01-06)
- Spring Boot 3.2.x project initialized with Maven
- PostgreSQL 16 Docker container configuration
- Environment variables setup (.env, .gitignore)
- Database schema with PostgreSQL ENUMs:
  - `product_status`: 7 states (NA_STANIE → SPRZEDANY)
  - `user_role`: 3 roles (KIEROWNIK, SPRZEDAWCA, MAGAZYNIER)
  - `order_status`: 5 states (NOWE → ZAKONCZONE)
- 3-layer architecture scaffolding
- Spring Security dependencies configured
- Project documentation (README, INSTRUCTIONS)

### ✅ Phase 2 - Authentication & User Management (2026-01-06)
- JPA Entities created:
  - `Employee` (with UserRole enum)
  - `Customer` (with auto-registration date)
  - `Store`
- Repositories for data access:
  - `EmployeeRepository` (findByLogin)
  - `CustomerRepository` (findByEmail)
  - `StoreRepository`
- JWT Authentication:
  - `JwtUtil` for token generation/validation
  - `JwtAuthenticationFilter` for request filtering
  - Tokens include userType and role
- Authentication Services:
  - `EmployeeAuthService` (login with position verification)
  - `CustomerAuthService` (register + login)
- REST Controllers:
  - `POST /api/auth/employee/login`
  - `POST /api/auth/customer/register`
  - `POST /api/auth/customer/login`
- Security Configuration:
  - BCrypt password encoding
  - Stateless session management
  - JWT-based authentication
  - Role-based authorization ready
- Exception Handling:
  - Global exception handler
  - Custom exceptions (AuthenticationException, ResourceAlreadyExistsException)
  - Consistent error responses
- Test data with sample stores, employees, customers, categories, and products

### ✅ Phase 3 - Product & Category Management (2026-01-06)
- JPA Entities:
  - `Product` (with category relationship)
  - `Category` (product categories)
  - `ProductItem` (individual product instances with status)
- Repositories:
  - `ProductRepository` (search, filter by category)
  - `CategoryRepository` (find by name)
  - `ProductItemRepository` (availability queries)
- Services:
  - `ProductService` (CRUD + search + availability)
  - `CategoryService` (CRUD with validation)
- REST Controllers:
  - Category Management (GET, POST, PUT, DELETE)
  - Product Management (GET with pagination, POST, PUT, DELETE)
  - Product Search & Filtering
  - Product Availability per Store
- DTOs:
  - `ProductDTO`, `CreateProductRequest`, `UpdateProductRequest`
  - `CategoryDTO`, `CreateCategoryRequest`
  - `ProductAvailabilityDTO`
- Role-Based Access:
  - `@PreAuthorize("hasRole('KIEROWNIK')")` on create/update/delete
  - Public read access for products and categories
- Features:
  - Pagination & sorting on product lists
  - Full-text search by name/description
  - Filter products by category
  - Check product availability across stores
  - Method-level security enabled

## Business Rules

### Product Ordering
- Customers can order from any store
- If product unavailable in chosen store, suggest other stores
- Orders are picked up at specified store

### Deliveries
- Simplified: items arrive when manager requests
- DeliveryLines track what was ordered
- ProductItems created upon delivery acceptance

### Returns
- Must reference original transaction
- Condition check required
- Status update: ROZPATRYWANY → PRZYJETY/ODRZUCONY
- ProductItem status updated after acceptance

## API Design Principles
- RESTful endpoints
- JSON request/response
- HTTP status codes: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 404 (Not Found), 500 (Server Error)
- Consistent error response format
- Pagination for list endpoints (default: 20 items)
- Filtering and sorting support

## Next Steps
1. Set up domain-based authentication
2. Implement employee and customer login
3. Start with product catalog management
4. Then implement order workflow
