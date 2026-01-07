# Swagger UI Integration

This document describes the Swagger UI integration added to the Store Management System backend.

## What is Swagger UI?

Swagger UI provides interactive API documentation where you can:
- View all available endpoints
- See request/response schemas
- Test API endpoints directly from the browser
- Authenticate with JWT tokens
- View detailed parameter descriptions

## Accessing Swagger UI

Once the application is running, access Swagger UI at:

```
http://localhost:8080/swagger-ui.html
```

Alternative URL:
```
http://localhost:8080/swagger-ui/index.html
```

## OpenAPI Documentation

The raw OpenAPI specification (JSON format) is available at:
```
http://localhost:8080/v3/api-docs
```

## Features

### 1. JWT Authentication Support
- Click the **Authorize** button in the top right
- Enter your JWT token in the format: `Bearer <your-token>`
- The token will be included in all subsequent requests

### 2. Authentication Flow

1. **Register a Customer** (if needed):
   - POST `/api/auth/customer/register`
   - Provide email, password, first name, last name, phone

2. **Login**:
   - POST `/api/auth/customer/login` (for customers)
   - POST `/api/auth/employee/login` (for employees)
   - Copy the `token` from the response

3. **Authorize**:
   - Click **Authorize** button
   - Paste the token
   - Click **Authorize**

4. **Make Authenticated Requests**:
   - All protected endpoints will now include your JWT token

### 3. API Groups

The API is organized into logical groups:

- **Customer Authentication** - Registration and login for customers
- **Employee Authentication** - Login for employees
- **Products** - Product management (CRUD operations)
- **Categories** - Category management
- **Orders** - Order management
- **Stores** - Store management
- **Deliveries** - Delivery management
- **Transactions** - Transaction records
- **Returns** - Return management

### 4. Try It Out

For each endpoint:
1. Click to expand the endpoint
2. Click **Try it out**
3. Fill in the required parameters
4. Click **Execute**
5. View the response below

## Configuration

The Swagger configuration is located in:
```
src/main/java/org/pwr/store/config/OpenApiConfig.java
```

Key settings in `application.properties`:
```properties
springdoc.api-docs.path=/v3/api-docs
springdoc.swagger-ui.path=/swagger-ui.html
springdoc.swagger-ui.enabled=true
springdoc.swagger-ui.operationsSorter=method
springdoc.swagger-ui.tagsSorter=alpha
```

## Security Configuration

Swagger endpoints are publicly accessible (no authentication required):
```java
.requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
```

This is configured in `SecurityConfig.java`.

## Example: Testing Product Endpoints

### 1. List All Products (Public - No Auth)
```
GET /api/products
Parameters:
- page: 0
- size: 20
- sortBy: productId
- sortDir: ASC
```

### 2. Create Product (Requires Manager Role)
```
POST /api/products
Authorization: Bearer <token>
Body:
{
  "name": "New Product",
  "description": "Product description",
  "price": 99.99,
  "categoryId": 1
}
```

### 3. Search Products (Public)
```
GET /api/products/search
Parameters:
- query: "laptop"
- page: 0
- size: 20
```

## Annotations Used

The following OpenAPI annotations enhance the documentation:

- `@Tag` - Groups related endpoints
- `@Operation` - Describes endpoint purpose
- `@ApiResponse` / `@ApiResponses` - Documents response codes
- `@Parameter` - Describes request parameters
- `@SecurityRequirement` - Indicates authentication needed

## Comparing with Requirements

Based on the functional requirements (wymagania funkcjonalne) from etap2.docx, the backend provides:

### ✅ Implemented Features:

1. **Customer Module (Użytkownik)**:
   - Add to cart functionality
   - Order placement
   - Order history viewing
   - Returns/complaints

2. **Warehouse Module (Magazyn)**:
   - Order browsing
   - Order packing/status updates

3. **Sales Module (Sala sprzedażowa)**:
   - Sales registration
   - Order fulfillment
   - Product information viewing
   - Return processing
   - Product display management
   - Receipt generation

### API Endpoints Map to Use Cases:

- **PU "Dodanie produktu do koszyka"** → `POST /api/orders` (order lines)
- **PU "Złożenie zamówienia"** → `POST /api/orders`
- **PU "Podgląd historii zamówień"** → `GET /api/orders/customer/{customerId}`
- **PU "Składanie reklamacji"** → `POST /api/returns`
- **PU "Przeglądanie zamówień"** → `GET /api/orders`
- **PU "Pakowanie zamówienia"** → `PUT /api/orders/{id}/status`
- **PU "Rejestracja sprzedaży"** → `POST /api/transactions`
- **PU "Wydawanie zamówień"** → `PUT /api/orders/{id}/status` + `POST /api/transactions`

## Dependencies

The Swagger UI integration uses:

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.3.0</version>
</dependency>
```

This library provides:
- Swagger UI web interface
- OpenAPI 3.0 specification generation
- Automatic endpoint discovery
- Integration with Spring Security

## Benefits

1. **Documentation** - Always up-to-date API documentation
2. **Testing** - Test endpoints without external tools
3. **Development** - Faster development and debugging
4. **Integration** - Easier for frontend developers to integrate
5. **Validation** - Request/response schema validation

## Next Steps

To further enhance the API documentation:

1. Add more detailed descriptions to DTOs
2. Document error responses with examples
3. Add request/response examples
4. Create custom tags for better organization
5. Add API versioning information

## Troubleshooting

### Swagger UI not loading
- Check that the application is running on port 8080
- Verify the URL: `http://localhost:8080/swagger-ui.html`
- Check browser console for errors

### 401 Unauthorized errors
- Make sure you've clicked **Authorize** and entered a valid JWT token
- Token format should be just the token (the "Bearer " prefix is added automatically)
- Check that your token hasn't expired (24 hours by default)

### Can't test protected endpoints
- First login via `/api/auth/customer/login` or `/api/auth/employee/login`
- Copy the token from the response
- Click **Authorize** and paste the token
- For manager-only endpoints, make sure you login as an employee with KIEROWNIK role

## Summary

Swagger UI has been successfully integrated into the Store Management System backend. All endpoints are documented and testable through an interactive web interface at `http://localhost:8080/swagger-ui.html`.
