# MediNest System Flow Diagrams

## 🔄 User Registration Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant DB as Database
    participant E as Email Service

    U->>F: Fill Registration Form
    F->>B: POST /api/v1/auth/register
    B->>B: Validate Input Data
    B->>DB: Check Email Uniqueness
    DB-->>B: Email Exists? (Yes/No)
    alt Email Already Exists
        B-->>F: 409 Conflict Error
        F-->>U: Display Error Message
    else Email Available
        B->>DB: Create User Record
        DB-->>B: User Created Successfully
        B->>B: Generate JWT Tokens
        B->>E: Send Welcome Email
        B-->>F: Success Response with Tokens
        F->>F: Store Tokens in httpOnly Cookies
        F->>F: Update Auth Context
        F-->>U: Redirect to Dashboard
    end
```

## 🛒 E-commerce Order Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant DB as Database
    participant P as Payment Gateway (eSewa)
    participant I as Inventory Service

    U->>F: Browse Products
    F->>B: GET /api/v1/products
    B->>DB: Fetch Products
    DB-->>B: Products List
    B-->>F: Products Response
    F-->>U: Display Products

    U->>F: Add to Cart
    F->>B: POST /api/v1/cart/add
    B->>DB: Save Cart Item
    DB-->>B: Cart Updated
    B-->>F: Updated Cart
    F-->>U: Show Cart with Total

    U->>F: Proceed to Checkout
    F->>F: Collect Address & Payment Method
    F->>B: POST /api/v1/orders/place
    B->>DB: Create Order
    B->>I: Check Stock Availability
    I-->>B: Stock Available
    B->>DB: Update Order Status
    B-->>F: Order Created Response

    alt Online Payment
        F->>B: POST /api/v1/payments/process
        B->>P: Initialize eSewa Payment
        P-->>B: Payment URL
        B-->>F: Payment URL
        F-->>U: Redirect to eSewa

        U->>P: Complete Payment
        P->>B: Payment Callback
        B->>DB: Update Payment Status
        B->>I: Adjust Inventory
        B->>F: Payment Success
        F-->>U: Order Confirmation
    else Cash on Delivery
        B-->>F: Order Placed
        F-->>U: Order Confirmation
    end
```

## 📋 Admin Product Management Flow

```mermaid
sequenceDiagram
    participant A as Admin
    participant F as Frontend
    participant B as Backend
    participant DB as Database
    participant S as Storage

    A->>F: Login as Admin
    F->>B: POST /api/v1/auth/login
    B-->>F: JWT Tokens + Admin Status
    F-->>A: Redirect to Admin Panel

    A->>F: Access Product Management
    F->>B: GET /api/v1/admin/verify
    B->>B: Check Admin Permissions
    B-->>F: Admin Verified
    F-->>A: Show Product Management Interface

    A->>F: Create New Product
    F->>B: POST /api/v1/admin/products
    B->>B: Validate Product Data
    B->>DB: Create Product Record
    DB-->>B: Product Created
    B-->>F: Product Created Successfully
    F-->>A: Display Success Message

    alt Upload Product Image
        A->>F: Select Image File
        F->>B: POST /api/v1/admin/products/{id}/image
        B->>S: Store Image File
        S-->>B: Image URL
        B->>DB: Update Product with Image
        DB-->>B: Updated Successfully
        B-->>F: Image Uploaded
        F-->>A: Show Updated Product
    end
```

## 💳 Payment Processing Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant E as eSewa
    participant DB as Database

    U->>F: Click "Pay Now"
    F->>B: POST /api/v1/payments/process
    Note over B: Generate Transaction UUID
    B->>B: Calculate Total with Tax
    B->>B: Generate HMAC Signature
    B-->>F: Payment Data for eSewa
    F->>E: Redirect to eSewa with Payment Data

    U->>E: Complete Payment (Success/Failed)
    E->>B: Payment Callback (POST)
    B->>B: Verify eSewa Signature
    B->>DB: Update Payment Record

    alt Payment Success
        B->>DB: Update Order Status to "Paid"
        B->>F: Success Response
        F-->>U: Show Success Page
    else Payment Failed
        B->>DB: Update Payment Status to "Failed"
        B->>F: Failure Response
        F-->>U: Show Failure Page
    end
```

## 📱 Prescription Upload Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant S as File Storage
    participant OCR as Google Vision API

    U->>F: Upload Prescription File
    F->>B: POST /api/v1/orders/prescription
    B->>B: Validate File Type & Size
    B->>S: Store Prescription File
    S-->>B: File URL
    B->>OCR: Send for OCR Processing (Optional)

    alt OCR Processing
        OCR-->>B: Extracted Text
        B->>B: Parse Medicine Names
        B->>B: Validate Against Drug Database
        B->>DB: Save Prescription with OCR Data
    else Manual Review
        B->>DB: Save Prescription File Reference
    end

    B-->>F: Prescription Uploaded
    F-->>U: Show Upload Confirmation

    Note over B: Admin Review Process
    B->>B: Flag for Admin Review
    B->>F: Send Notification to Admin
```

## 🔄 Cart Synchronization Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant R as Redis Cache
    participant DB as Database

    U->>F: Add Item to Cart
    F->>B: POST /api/v1/cart/add
    B->>R: Update Cart in Redis Cache
    R-->>B: Cart Updated
    B->>DB: Persist Cart Item
    DB-->>B: Saved Successfully
    B-->>F: Updated Cart Response
    F-->>U: Show Updated Cart

    U->>F: Change Device/Browser
    F->>B: GET /api/v1/cart
    B->>R: Check Redis Cache First
    alt Cart in Cache
        R-->>B: Return Cached Cart
    else Cart Not in Cache
        B->>DB: Fetch from Database
        DB-->>B: Cart Items
        B->>R: Update Redis Cache
    end
    B-->>F: Cart Data
    F-->>U: Show Cart Items
```

## 🔐 Authentication Token Refresh Flow

```mermaid
sequenceDiagram
    participant F as Frontend
    participant B as Backend
    participant U as User

    U->>F: Perform Action Requiring Auth
    F->>B: API Request with Expired Token
    B->>B: Check Token Expiration
    B-->>F: 401 Unauthorized
    F->>F: Check for Refresh Token
    F->>B: POST /api/v1/auth/refresh
    B->>B: Validate Refresh Token

    alt Refresh Token Valid
        B->>B: Generate New Access Token
        B-->>F: New Access Token
        F->>F: Update Token Storage
        F->>B: Retry Original Request
        B-->>F: API Response
        F-->>U: Show Updated Data
    else Refresh Token Invalid
        B-->>F: 401 Unauthorized
        F->>F: Clear All Tokens
        F-->>U: Redirect to Login
    end
```

## 📊 Data Flow Architecture

```mermaid
graph LR
    subgraph "Client Layer"
        Web[Web Browser]
        Mobile[Mobile App]
    end

    subgraph "API Gateway"
        Gateway[Load Balancer]
        Auth[Authentication Middleware]
    end

    subgraph "Application Layer"
        ProductService[Product Service]
        OrderService[Order Service]
        PaymentService[Payment Service]
        UserService[User Service]
    end

    subgraph "Data Layer"
        PostgreSQL[(PostgreSQL)]
        Redis[(Redis Cache)]
        FileStorage[(File Storage)]
    end

    subgraph "External Services"
        eSewa[Payment Gateway]
        Email[Email Service]
        SMS[SMS Service]
        OCR[OCR Service]
    end

    Web --> Gateway
    Mobile --> Gateway
    Gateway --> Auth
    Auth --> ProductService
    Auth --> OrderService
    Auth --> PaymentService
    Auth --> UserService

    ProductService --> PostgreSQL
    OrderService --> PostgreSQL
    PaymentService --> PostgreSQL
    UserService --> PostgreSQL

    ProductService --> Redis
    OrderService --> Redis
    UserService --> Redis

    PaymentService --> eSewa
    OrderService --> Email
    OrderService --> SMS
    UserService --> OCR

    ProductService --> FileStorage
    OrderService --> FileStorage
```

## 🚨 Error Handling Flow

```mermaid
flowchart TD
    A[API Request] --> B{Authentication Check}
    B -->|Invalid Token| C[401 Unauthorized]
    B -->|Valid Token| D{Route Validation}

    D -->|Invalid Route| E[404 Not Found]
    D -->|Valid Route| F{Input Validation}

    F -->|Invalid Input| G[422 Validation Error]
    F -->|Valid Input| H{Business Logic}

    H -->|Business Rule Violation| I[400 Bad Request]
    H -->|Logic Success| J[Database Operation]

    J -->|Database Error| K[500 Internal Server Error]
    J -->|Operation Success| L[200 OK]

    C --> M[Log Error]
    E --> M
    G --> M
    I --> M
    K --> M

    M --> N[Return Error Response]

    style C fill:#ffcccc
    style E fill:#ffcccc
    style G fill:#ffcccc
    style I fill:#ffcccc
    style K fill:#ffcccc
    style L fill:#ccffcc
```

## 📈 System Monitoring Flow

```mermaid
sequenceDiagram
    participant App as Application
    participant Monitor as Monitoring Service
    participant DB as Database
    participant Cache as Redis

    App->>Monitor: Log API Request
    Monitor->>Monitor: Parse Request Details
    Monitor->>Monitor: Check Response Time

    alt Response Time > Threshold
        Monitor->>Monitor: Flag Slow Response
        Monitor->>Monitor: Generate Alert
        Monitor->>Admin: Send Alert Notification
    end

    App->>DB: Database Query
    DB-->>App: Query Result

    App->>Cache: Cache Operation
    Cache-->>App: Cache Response

    Note over Monitor: Aggregate Metrics
    Monitor->>Monitor: Calculate Success Rate
    Monitor->>Monitor: Track Error Rate
    Monitor->>Monitor: Monitor Resource Usage

    alt Error Rate > Threshold
        Monitor->>Admin: Send Critical Alert
    end

    Monitor->>Dashboard: Update Metrics
```
