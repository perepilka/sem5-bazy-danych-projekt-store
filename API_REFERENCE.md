# API Reference - Store Management System

Base URL: `http://localhost:8080/api`

---

## 🔐 Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

### Customer Login
```http
POST /api/auth/customer/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}

Response 200:
{
  "token": "string",
  "userType": "CUSTOMER",
  "username": "string",
  "role": null
}
```

### Employee Login
```http
POST /api/auth/employee/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}

Response 200:
{
  "token": "string",
  "userType": "EMPLOYEE",
  "username": "string",
  "role": "KIEROWNIK" | "SPRZEDAWCA" | "MAGAZYNIER"
}
```

### Customer Registration
```http
POST /api/auth/customer/register
Content-Type: application/json

{
  "firstName": "string (max 50)",
  "lastName": "string (max 50)",
  "email": "string (max 100)",
  "phoneNumber": "string (max 20)",
  "password": "string (min 6)"
}

Response 200:
{
  "token": "string",
  "userType": "CUSTOMER",
  "username": "string",
  "role": null
}
```

---

## 🏪 Stores

### List All Stores
```http
GET /api/stores?page=0&size=20
Authorization: Bearer <token>

Response 200: PageResponse<StoreDTO>
{
  "content": [
    {
      "storeId": 1,
      "name": "Store Name",
      "city": "Wrocław",
      "street": "ul. Example 1",
      "zipCode": "50-000",
      "phoneNumber": "+48123456789",
      "openHour": "08:00:00",
      "closeHour": "20:00:00",
      "isActive": true
    }
  ],
  "totalPages": 1,
  "totalElements": 5,
  "size": 20,
  "number": 0,
  "first": true,
  "last": true,
  "empty": false
}
```

### Get Store by ID
```http
GET /api/stores/{id}
Authorization: Bearer <token>

Response 200: StoreDTO
```

### Search Stores
```http
GET /api/stores/search?query=Wrocław&page=0&size=20
Authorization: Bearer <token>

Response 200: PageResponse<StoreDTO>
```

### Get Stores by City
```http
GET /api/stores/city/{city}?page=0&size=20
Authorization: Bearer <token>

Response 200: PageResponse<StoreDTO>
```

### Get Store Inventory
```http
GET /api/stores/{id}/inventory
Authorization: Bearer <token>

Response 200: StoreInventoryDTO[]
[
  {
    "productId": 1,
    "productName": "Product Name",
    "categoryName": "Category",
    "availableCount": 10,
    "onDisplayCount": 5,
    "reservedCount": 2,
    "totalCount": 17
  }
]
```

---

## 📦 Products

### List All Products
```http
GET /api/products?page=0&size=20
Authorization: Bearer <token>

Response 200: PageResponse<ProductDTO>
{
  "content": [
    {
      "productId": 1,
      "categoryId": 1,
      "categoryName": "Electronics",
      "name": "Product Name",
      "description": "Product description",
      "basePrice": 299.99,
      "isActive": true
    }
  ]
}
```

### Get Product by ID
```http
GET /api/products/{id}
Authorization: Bearer <token>

Response 200: ProductDTO
```

### Search Products
```http
GET /api/products/search?query=laptop&page=0&size=20
Authorization: Bearer <token>

Response 200: PageResponse<ProductDTO>
```

### Get Products by Category
```http
GET /api/products/category/{categoryId}?page=0&size=20
Authorization: Bearer <token>

Response 200: PageResponse<ProductDTO>
```

### Check Product Availability
```http
GET /api/products/{id}/availability
Authorization: Bearer <token>

Response 200: ProductAvailabilityDTO
{
  "productId": 1,
  "productName": "Product Name",
  "storeAvailability": {
    "1": {
      "storeId": 1,
      "storeName": "Store 1",
      "city": "Wrocław",
      "availableCount": 5
    },
    "2": {
      "storeId": 2,
      "storeName": "Store 2",
      "city": "Warszawa",
      "availableCount": 3
    }
  }
}
```

### Create Product (Employee: KIEROWNIK)
```http
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "categoryId": 1,
  "name": "Product Name (max 150)",
  "description": "Description (max 1000)",
  "basePrice": 299.99
}

Response 200: ProductDTO
```

---

## 📂 Categories

### List All Categories
```http
GET /api/categories?page=0&size=20
Authorization: Bearer <token>

Response 200: PageResponse<CategoryDTO>
{
  "content": [
    {
      "categoryId": 1,
      "name": "Electronics",
      "description": "Electronic devices"
    }
  ]
}
```

### Get Category by ID
```http
GET /api/categories/{id}
Authorization: Bearer <token>

Response 200: CategoryDTO
```

---

## 🛒 Orders

### Check Order Availability
```http
POST /api/orders/check-availability
Authorization: Bearer <token>
Content-Type: application/json

{
  "pickupStoreId": 1,
  "lines": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 2,
      "quantity": 1
    }
  ]
}

Response 200: OrderAvailabilityDTO
{
  "products": [
    {
      "productId": 1,
      "productName": "Product 1",
      "requestedQuantity": 2,
      "availableInPickupStore": 2,
      "alternativeStores": {},
      "available": true
    }
  ],
  "allAvailable": true,
  "message": "All products are available"
}
```

### Create Order (Customer)
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "pickupStoreId": 1,
  "lines": [
    {
      "productId": 1,
      "quantity": 2
    }
  ]
}

Response 200: OrderDTO
```

### Get My Orders (Customer)
```http
GET /api/orders/my?page=0&size=20
Authorization: Bearer <token>

Response 200: PageResponse<OrderDTO>
{
  "content": [
    {
      "orderId": 1,
      "customerId": 1,
      "customerName": "John Doe",
      "pickupStoreId": 1,
      "pickupStoreName": "Store 1",
      "pickupStoreCity": "Wrocław",
      "orderDate": "2026-01-18T10:30:00",
      "status": "ZATWIERDZONY",
      "totalAmount": 599.98,
      "lines": [
        {
          "orderLineId": 1,
          "productId": 1,
          "productName": "Product Name",
          "quantity": 2,
          "priceAtOrder": 299.99,
          "lineTotal": 599.98
        }
      ]
    }
  ]
}
```

### Get All Orders (Employee)
```http
GET /api/orders?page=0&size=20
Authorization: Bearer <token>

Response 200: PageResponse<OrderDTO>
```

### Get Order by ID
```http
GET /api/orders/{id}
Authorization: Bearer <token>

Response 200: OrderDTO
```

### Update Order Status (Employee: SPRZEDAWCA, KIEROWNIK)
```http
PATCH /api/orders/{id}/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "ZATWIERDZONY" | "ANULOWANY" | "GOTOWY_DO_ODBIORU" | "ODEBRANY"
}

Response 200: OrderDTO
```

---

## 🚚 Deliveries

### List All Deliveries (Employee)
```http
GET /api/deliveries?page=0&size=20
Authorization: Bearer <token>

Response 200: PageResponse<DeliveryDTO>
{
  "content": [
    {
      "deliveryId": 1,
      "supplierName": "Supplier XYZ",
      "deliveryDate": "2026-01-20",
      "status": "ZREALIZOWANA",
      "lines": [
        {
          "deliveryLineId": 1,
          "productId": 1,
          "productName": "Product Name",
          "quantity": 50,
          "purchasePrice": 199.99,
          "totalPrice": 9999.50
        }
      ]
    }
  ]
}
```

### Create Delivery (Employee: MAGAZYNIER, KIEROWNIK)
```http
POST /api/deliveries
Authorization: Bearer <token>
Content-Type: application/json

{
  "supplierName": "Supplier Name (max 100)",
  "deliveryDate": "2026-01-20",
  "lines": [
    {
      "productId": 1,
      "quantity": 50,
      "purchasePrice": 199.99,
      "storeId": 1
    }
  ]
}

Response 200: DeliveryDTO
```

### Get Delivery by ID
```http
GET /api/deliveries/{id}
Authorization: Bearer <token>

Response 200: DeliveryDTO
```

### Update Delivery Status (Employee: MAGAZYNIER, KIEROWNIK)
```http
PATCH /api/deliveries/{id}/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "W_TRAKCIE" | "ZREALIZOWANA" | "ANULOWANA"
}

Response 200: DeliveryDTO
```

---

## 💳 Transactions

### List All Transactions (Employee)
```http
GET /api/transactions?page=0&size=20
Authorization: Bearer <token>

Response 200: PageResponse<TransactionDTO>
{
  "content": [
    {
      "transactionId": 1,
      "storeId": 1,
      "storeName": "Store 1",
      "employeeId": 1,
      "employeeName": "Jane Smith",
      "customerId": 1,
      "customerName": "John Doe",
      "transactionDate": "2026-01-18T14:30:00",
      "totalAmount": 599.98,
      "transactionType": "PARAGON",
      "items": [
        {
          "transactionItemId": 1,
          "itemId": 123,
          "productId": 1,
          "productName": "Product Name",
          "price": 299.99
        }
      ]
    }
  ]
}
```

### Get Transaction by ID
```http
GET /api/transactions/{id}
Authorization: Bearer <token>

Response 200: TransactionDTO
```

---

## 🔄 Returns

### List All Returns (Employee)
```http
GET /api/returns?page=0&size=20
Authorization: Bearer <token>

Response 200: PageResponse<ReturnDTO>
{
  "content": [
    {
      "returnId": 1,
      "transactionId": 1,
      "returnDate": "2026-01-19T10:00:00",
      "reason": "Defective product",
      "status": "ROZPATRYWANY",
      "items": [
        {
          "returnItemId": 1,
          "itemId": 123,
          "productId": 1,
          "productName": "Product Name",
          "conditionCheck": "Uszkodzony"
        }
      ]
    }
  ]
}
```

### Get Return by ID
```http
GET /api/returns/{id}
Authorization: Bearer <token>

Response 200: ReturnDTO
```

### Update Return Status (Employee: SPRZEDAWCA, KIEROWNIK)
```http
PATCH /api/returns/{id}/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "ROZPATRYWANY" | "PRZYJETY" | "ODRZUCONY"
}

Response 200: ReturnDTO
```

---

## 📄 Pagination

All paginated endpoints accept these query parameters:
- `page`: Page number (default: 0)
- `size`: Page size (default: 20, max: 100)

Standard pagination response format:
```typescript
{
  content: T[],          // Array of items
  totalPages: number,    // Total number of pages
  totalElements: number, // Total number of items
  size: number,          // Page size
  number: number,        // Current page number
  first: boolean,        // Is first page
  last: boolean,         // Is last page
  empty: boolean         // Is empty page
}
```

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "timestamp": "2026-01-18T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/orders"
}
```

### 401 Unauthorized
```json
{
  "timestamp": "2026-01-18T10:30:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid or expired token",
  "path": "/api/orders"
}
```

### 403 Forbidden
```json
{
  "timestamp": "2026-01-18T10:30:00",
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied",
  "path": "/api/deliveries"
}
```

### 404 Not Found
```json
{
  "timestamp": "2026-01-18T10:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Product not found with id: 999",
  "path": "/api/products/999"
}
```

---

## 🔑 Role-Based Access Control

| Endpoint | Customer | SPRZEDAWCA | MAGAZYNIER | KIEROWNIK |
|----------|----------|------------|------------|-----------|
| **Products** |
| GET /api/products | ✅ | ✅ | ✅ | ✅ |
| POST /api/products | ❌ | ❌ | ❌ | ✅ |
| **Orders** |
| POST /api/orders | ✅ | ❌ | ❌ | ❌ |
| GET /api/orders/my | ✅ | ❌ | ❌ | ❌ |
| GET /api/orders | ❌ | ✅ | ❌ | ✅ |
| PATCH /api/orders/{id}/status | ❌ | ✅ | ❌ | ✅ |
| **Deliveries** |
| GET /api/deliveries | ❌ | ❌ | ✅ | ✅ |
| POST /api/deliveries | ❌ | ❌ | ✅ | ✅ |
| PATCH /api/deliveries/{id}/status | ❌ | ❌ | ✅ | ✅ |
| **Transactions** |
| GET /api/transactions | ❌ | ✅ | ✅ | ✅ |
| **Returns** |
| GET /api/returns | ❌ | ✅ | ❌ | ✅ |
| PATCH /api/returns/{id}/status | ❌ | ✅ | ❌ | ✅ |
| **Stores** |
| GET /api/stores | ✅ | ✅ | ✅ | ✅ |
| GET /api/stores/{id}/inventory | ❌ | ✅ | ✅ | ✅ |

---

**Base URL**: `http://localhost:8080/api`
**Swagger UI**: `http://localhost:8080/swagger-ui/index.html`
**OpenAPI Spec**: `http://localhost:8080/v3/api-docs`

**Last Updated**: 2026-01-18
