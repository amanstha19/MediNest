# MediNest API Design

## 🌐 REST API Architecture

### API Base URL Structure

```
Production: https://api.medinest.com/v1/
Development: http://localhost:8000/api/v1/
```

### Authentication Endpoints

#### POST /api/v1/auth/register

**Purpose**: Register new user account

```json
Request Body:
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+977-9841234567",
  "city": "Kathmandu",
  "country": "Nepal"
}

Response:
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### POST /api/v1/auth/login

**Purpose**: User authentication and token generation

```json
Request Body:
{
  "username": "john_doe",
  "password": "securepassword"
}

Response:
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

#### POST /api/v1/auth/refresh

**Purpose**: Refresh access token

```json
Request Body:
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}

Response:
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### POST /api/v1/auth/logout

**Purpose**: Invalidate refresh token

```json
Request Body:
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}

Response:
{
  "message": "Successfully logged out"
}
```

### Product Management Endpoints

#### GET /api/v1/products

**Purpose**: Get all products with pagination and filtering

```json
Query Parameters:
- page: int (default: 1)
- limit: int (default: 20, max: 100)
- category: string (OTC, RX, SUP, WOM, MEN, PED, HERB, DIAG, FIRST)
- search: string (search in name, generic_name, description)
- prescription_required: boolean
- min_price: decimal
- max_price: decimal
- sort: string (price_asc, price_desc, name_asc, name_desc, created_desc)

Response:
{
  "products": [
    {
      "id": 1,
      "generic_name": "Paracetamol",
      "name": "Panadol 500mg",
      "category": "OTC",
      "description": "Pain relief and fever reduction",
      "price": "50.00",
      "stock": 100,
      "prescription_required": false,
      "image": "/media/products/panadol.jpg",
      "created_at": "2025-01-20T10:00:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_items": 100,
    "items_per_page": 20
  }
}
```

#### GET /api/v1/products/{id}

**Purpose**: Get single product details

```json
Response:
{
  "id": 1,
  "generic_name": "Paracetamol",
  "name": "Panadol 500mg",
  "category": "OTC",
  "description": "Pain relief and fever reduction",
  "price": "50.00",
  "stock": 100,
  "prescription_required": false,
  "image": "/media/products/panadol.jpg",
  "created_at": "2025-01-20T10:00:00Z",
  "updated_at": "2025-01-20T10:00:00Z"
}
```

### Cart Management Endpoints

#### GET /api/v1/cart

**Purpose**: Get user's current cart

```json
Response:
{
  "cart_items": [
    {
      "id": 1,
      "product_id": 1,
      "name": "Panadol 500mg",
      "quantity": 2,
      "price": "50.00",
      "total_item_price": "100.00",
      "image": "/media/products/panadol.jpg",
      "prescription": null
    }
  ],
  "total_price": "100.00"
}
```

#### POST /api/v1/cart/add

**Purpose**: Add product to cart

```json
Request Body:
{
  "product_id": 1,
  "quantity": 2,
  "prescription": null
}

Response:
{
  "cart_items": [...],
  "total_price": "100.00"
}
```

#### DELETE /api/v1/cart/remove/{product_id}

**Purpose**: Remove product from cart

```json
Response:
{
  "cart_items": [...],
  "total_price": "50.00"
}
```

#### POST /api/v1/cart/update-quantity

**Purpose**: Update cart item quantity

```json
Request Body:
{
  "product_id": 1,
  "action": "increase" // or "decrease"
}

Response:
{
  "cart_items": [...],
  "total_price": "150.00"
}
```

### Order Management Endpoints

#### POST /api/v1/orders/checkout

**Purpose**: Create order from cart

```json
Request Body:
{
  "address": "123 Main St, Kathmandu, Nepal",
  "prescription": null // File upload
}

Response:
{
  "message": "Checkout complete, your cart is now empty.",
  "order_id": 123,
  "total_price": "150.00"
}
```

#### POST /api/v1/orders/place

**Purpose**: Place order with inventory check

```json
Request Body:
{
  "cart_items": "[{\"id\": 1, \"quantity\": 2}]",
  "address": "123 Main St, Kathmandu, Nepal",
  "payment_method": "online" // or "cash_on_delivery"
}

Response:
{
  "order_id": 123,
  "message": "Proceed to eSewa payment",
  "total_price": "150.00"
}
```

#### GET /api/v1/orders/{id}

**Purpose**: Get order details

```json
Response:
{
  "id": 123,
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  },
  "total_price": "150.00",
  "status": "pending",
  "address": "123 Main St, Kathmandu, Nepal",
  "cart_items": [
    {
      "product_id": 1,
      "product_name": "Panadol 500mg",
      "quantity": 2,
      "price": "50.00",
      "total_price": "100.00"
    }
  ],
  "created_at": "2025-01-20T10:00:00Z"
}
```

#### GET /api/v1/orders/user/{user_id}

**Purpose**: Get user's order history

```json
Response:
{
  "orders": [...],
  "total_orders": 5
}
```

#### PATCH /api/v1/orders/{id}/status

**Purpose**: Update order status (Admin only)

```json
Request Body:
{
  "status": "shipped" // pending, shipped, delivered
}

Response:
{
  "message": "Order status updated successfully.",
  "order_id": 123
}
```

### Payment Integration Endpoints

#### POST /api/v1/payments/process

**Purpose**: Initialize eSewa payment

```json
Request Body:
{
  "amount": "150.00",
  "tax_amount": "13.50",
  "transaction_uuid": "unique_transaction_id"
}

Response:
{
  "amount": "150.00",
  "tax_amount": "13.50",
  "total_amount": "163.50",
  "transaction_uuid": "unique_transaction_id",
  "product_code": "EPAYTEST",
  "signature": "base64_encoded_signature",
  "success_url": "https://medinest.com/payment-success",
  "failure_url": "https://medinest.com/payment-failure"
}
```

#### POST /api/v1/payments/callback

**Purpose**: Handle eSewa payment callback

```json
Request Body:
{
  "transaction_uuid": "unique_transaction_id",
  "status": "SUCCESS",
  "transaction_code": "ESC123456"
}

Response:
{
  "message": "Payment successful",
  "transaction_uuid": "unique_transaction_id"
}
```

### User Profile Endpoints

#### GET /api/v1/users/profile

**Purpose**: Get user profile with order history

```json
Response:
{
  "username": "john_doe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "orders": [
    {
      "order_id": 123,
      "total_price": "150.00",
      "status": "delivered",
      "cart_items": [...]
    }
  ]
}
```

### Admin Endpoints

#### GET /api/v1/admin/verify

**Purpose**: Verify admin access

```json
Response:
{
  "is_admin": true,
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@medinest.com",
    "is_staff": true,
    "is_superuser": true
  }
}
```

#### GET /api/v1/admin/products

**Purpose**: Admin product management

```json
Response:
{
  "products": [...],
  "total_products": 500
}
```

#### POST /api/v1/admin/products

**Purpose**: Create new product (Admin)

```json
Request Body:
{
  "name": "New Medicine",
  "generic_name": "Generic Name",
  "category": "RX",
  "description": "Description",
  "price": "100.00",
  "stock": 50,
  "prescription_required": true
}
```

#### PATCH /api/v1/admin/products/{id}

**Purpose**: Update product (Admin)

```json
Request Body:
{
  "name": "Updated Name",
  "price": "120.00",
  "stock": 75
}
```

### Search and Filtering

#### GET /api/v1/products/search

**Purpose**: Advanced product search

```json
Query Parameters:
- q: string (search query)
- category: string
- prescription_required: boolean
- min_price: decimal
- max_price: decimal
- in_stock: boolean

Response:
{
  "products": [...],
  "total_results": 25,
  "search_time": "0.045s"
}
```

## 🔐 Authentication & Authorization

### JWT Token Structure

```json
Header:
{
  "typ": "JWT",
  "alg": "HS256"
}

Payload:
{
  "user_id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "is_staff": false,
  "exp": 1735689600,
  "iat": 1735686000
}
```

### Token Expiration

- **Access Token**: 15 minutes
- **Refresh Token**: 7 days
- **Admin Token**: 30 minutes (shorter for security)

### Role-Based Access Control

- **Public**: Product browsing, search
- **Authenticated**: Cart, orders, profile
- **Admin**: Product management, order management, user management

## 📊 API Rate Limiting

### Rate Limits

- **Authentication**: 5 requests per minute per IP
- **Product Search**: 100 requests per minute per user
- **General API**: 1000 requests per minute per user
- **Admin API**: 500 requests per minute per admin

### Rate Limit Headers

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1735689600
```

## 🚨 Error Handling

### Standard Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The provided data is invalid",
    "details": {
      "field": "email",
      "issue": "Email already exists"
    }
  },
  "timestamp": "2025-01-20T10:00:00Z",
  "request_id": "req_123456789"
}
```

### HTTP Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **409**: Conflict
- **422**: Validation Error
- **429**: Rate Limited
- **500**: Internal Server Error

### Error Codes

- `AUTHENTICATION_REQUIRED`: User must be logged in
- `INSUFFICIENT_PERMISSIONS`: Admin access required
- `VALIDATION_ERROR`: Invalid input data
- `RESOURCE_NOT_FOUND`: Requested resource doesn't exist
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `PAYMENT_FAILED`: Payment processing error
- `INSUFFICIENT_STOCK`: Product out of stock
