# Swagger UI Quick Start

## 🚀 Access Swagger UI

Once the backend is running, open your browser:
```
http://localhost:8080/swagger-ui.html
```

Or use the alternative URL:
```
http://localhost:8080/swagger-ui/index.html
```

## 🎯 Quick Testing Guide

### Test Public Endpoints (No Auth Required)
1. Find "Products" section
2. Click on `GET /api/products`
3. Click "Try it out"
4. Click "Execute"
5. View the response

### Test Protected Endpoints (Auth Required)

**1. Login First:**
- Expand "Customer Authentication"
- Click `POST /api/auth/customer/login`
- Click "Try it out"
- Enter:
  ```json
  {
    "email": "newuser@example.com",
    "password": "test123"
  }
  ```
- Click "Execute"
- **Copy the token** from the response

**2. Authorize:**
- Click the 🔒 **Authorize** button (top right)
- Paste your token in the "Value" field
- Click "Authorize"
- Click "Close"

**3. Test Protected Endpoints:**
- Now all requests will include your token
- Try creating an order, viewing your orders, etc.

## 📱 Available Endpoints

### Public (No Auth Required)
- `GET /api/products` - List all products
- `GET /api/products/search` - Search products
- `GET /api/products/{id}` - Get product details
- `GET /api/categories` - List categories
- `POST /api/auth/customer/register` - Register new customer
- `POST /api/auth/customer/login` - Customer login
- `POST /api/auth/employee/login` - Employee login

### Protected (Auth Required)
- `POST /api/products` - Create product (Manager only)
- `PUT /api/products/{id}` - Update product (Manager only)
- `DELETE /api/products/{id}` - Delete product (Manager only)
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order
- `GET /api/orders/{id}` - Get order details
- `PUT /api/orders/{id}/status` - Update order status
- `POST /api/transactions` - Create transaction
- `POST /api/returns` - Create return
- And more...

## 💡 Tips

### Pagination
Most list endpoints support pagination:
```
page=0      # First page (0-indexed)
size=20     # Items per page
sortBy=productId   # Sort field
sortDir=ASC # Sort direction (ASC/DESC)
```

### Search
Use the search endpoints to find products:
```
GET /api/products/search?query=laptop
```

### Filtering
Filter products by category:
```
GET /api/products/category/1
```

### Response Codes
- **200 OK** - Success
- **201 Created** - Resource created
- **204 No Content** - Delete successful
- **400 Bad Request** - Invalid input
- **401 Unauthorized** - Not logged in
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found

## 🎯 Common Tasks

### Register a New Customer
```
POST /api/auth/customer/register
{
  "email": "john.doe@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+48123456789"
}
```

### Login as Customer
```
POST /api/auth/customer/login
{
  "email": "john.doe@example.com",
  "password": "SecurePass123"
}
```

### List Products
```
GET /api/products?page=0&size=20
```

### Get Product by ID
```
GET /api/products/1
```

### Search Products
```
GET /api/products/search?query=laptop&page=0&size=10
```

### Check Product Availability
```
GET /api/products/1/availability
```

### Create Order (Requires Auth)
```
POST /api/orders
{
  "customerId": 1,
  "storeId": 1,
  "orderLines": [
    {
      "productId": 1,
      "quantity": 2,
      "unitPrice": 99.99
    }
  ]
}
```

### View My Orders (Requires Auth)
```
GET /api/orders/customer/1
```

## 🔐 User Roles

The system has different user roles:

### KLIENT (Customer)
- Browse products
- Place orders
- View order history
- Submit returns

### SPRZEDAWCA (Salesperson)
- Everything KLIENT can do
- Process sales
- Fulfill orders
- Handle returns

### MAGAZYNIER (Warehouse Worker)
- View orders
- Update order status
- Manage inventory

### KIEROWNIK (Manager)
- Everything above
- Create/update/delete products
- Manage categories
- View all transactions
- Access reports

## 🐛 Troubleshooting

### "401 Unauthorized"
- Make sure you've clicked "Authorize" and entered your token
- Check if your token is still valid (24h expiration)
- Try logging in again

### "403 Forbidden"
- You don't have permission for this operation
- Some endpoints require Manager role (KIEROWNIK)
- Login with an employee account with sufficient privileges

### "404 Not Found"
- Check the resource ID exists
- For products: Use `GET /api/products` to see available IDs
- For stores: Use `GET /api/stores` to see available IDs

### Can't See Any Data
- Make sure the database is initialized with sample data
- Check `database/schema.sql` has been executed
- Use `docker exec -it store-postgres psql -U storeuser -d store` to check

## 📚 More Information

- Full Documentation: [SWAGGER_DOCUMENTATION.md](./SWAGGER_DOCUMENTATION.md)
- API Testing Guide: [API_TESTING.md](./API_TESTING.md)
- Main README: [README.md](./README.md)

## 🎉 Have Fun Testing!

Swagger UI makes it easy to explore and test the API. Don't be afraid to experiment!
