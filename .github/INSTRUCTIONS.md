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

### Phase 2: Authentication & User Management
- [ ] Implement domain-based routing (employee.store.com vs store.com)
- [ ] Create Employee authentication endpoints
- [ ] Create Customer authentication endpoints
- [ ] Implement JWT token generation and validation
- [ ] Add password hashing with BCrypt
- [ ] Create user role-based access control (KIEROWNIK, SPRZEDAWCA, MAGAZYNIER)

### Phase 3: Product & Inventory Management
- [ ] CRUD operations for Categories
- [ ] CRUD operations for Products
- [ ] Product inventory tracking (ProductItems)
- [ ] Product status management (NA_STANIE → SPRZEDANY flow)
- [ ] Stock availability checks per store

### Phase 4: Delivery Management
- [ ] Create Delivery records
- [ ] Add DeliveryLines (products in delivery)
- [ ] Generate ProductItems from deliveries
- [ ] Simple delivery acceptance workflow

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
