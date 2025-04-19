# Pharmacy API - Detailed Documentation

This document provides detailed instructions on how to use the Pharmacy API, including examples for each endpoint.

## Table of Contents

1. [Authentication](#authentication)
2. [Drug Management](#drug-management)
3. [Order Management](#order-management)
4. [Admin Functions](#admin-functions)
5. [Postman Collection](#postman-collection)
6. [Development Guide](#development-guide)

## Authentication

### User Registration

Register a new user in the system.

**Endpoint:** `POST /api/auth/register`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1...",
    "refreshToken": "eyJhbGciOiJIUzI1...",
    "user": {
      "id": "12345",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "CUSTOMER"
    }
  }
}
```

### User Login

Authenticate a user and get access and refresh tokens.

**Endpoint:** `POST /api/auth/login`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1...",
    "refreshToken": "eyJhbGciOiJIUzI1...",
    "user": {
      "id": "12345",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "CUSTOMER"
    }
  }
}
```

### Refresh Token

Obtain a new access token using a refresh token.

**Endpoint:** `POST /api/auth/refresh-token`

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1..."
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1..."
  }
}
```

### Get Current User

Get information about the currently authenticated user.

**Endpoint:** `GET /api/auth/me`

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1...
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "id": "12345",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "CUSTOMER"
  }
}
```

## Drug Management

### Get All Drugs

Retrieve a paginated list of drugs with optional filtering.

**Endpoint:** `GET /api/drugs`

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1...
```

**Query Parameters:**

- `page`: Page number (default: 0)
- `limit`: Items per page (default: 15, max: 100)
- `name`: Filter by drug name
- `companyName`: Filter by manufacturer
- `type`: Filter by drug type
- `minPrice`: Minimum price
- `maxPrice`: Maximum price
- `sortBy`: Field to sort by (name, price, companyName, amount, createdAt)
- `sortOrder`: Sort direction (asc, desc)

**Response:**

```json
{
  "status": "success",
  "data": [
    {
      "id": "12345",
      "name": "Paracetamol",
      "dose": 500,
      "price": 5.99,
      "type": "tablet",
      "companyName": "Pharma Co.",
      "amount": 100,
      "createdAt": "2023-01-01T12:00:00.000Z",
      "updatedAt": "2023-01-01T12:00:00.000Z"
    }
    // More drugs...
  ],
  "meta": {
    "total": 50,
    "page": 0,
    "limit": 15,
    "totalPages": 4
  }
}
```

### Get Drug by ID

Retrieve a specific drug by its ID.

**Endpoint:** `GET /api/drugs/:id`

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1...
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "id": "12345",
    "name": "Paracetamol",
    "dose": 500,
    "price": 5.99,
    "type": "tablet",
    "companyName": "Pharma Co.",
    "amount": 100,
    "createdAt": "2023-01-01T12:00:00.000Z",
    "updatedAt": "2023-01-01T12:00:00.000Z"
  }
}
```

### Create Drug

Create a new drug in the system (requires PHARMACIST or ADMIN role).

**Endpoint:** `POST /api/drugs`

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1...
```

**Request Body:**

```json
{
  "name": "Amoxicillin",
  "dose": 250,
  "price": 12.99,
  "type": "capsule",
  "companyName": "BioMed",
  "amount": 30
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "id": "67890",
    "name": "Amoxicillin",
    "dose": 250,
    "price": 12.99,
    "type": "capsule",
    "companyName": "BioMed",
    "amount": 30,
    "createdAt": "2023-01-01T12:00:00.000Z",
    "updatedAt": "2023-01-01T12:00:00.000Z"
  }
}
```

### Update Drug

Update an existing drug (requires PHARMACIST or ADMIN role).

**Endpoint:** `PATCH /api/drugs/:id`

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1...
```

**Request Body:**

```json
{
  "price": 13.99,
  "amount": 50
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "id": "67890",
    "name": "Amoxicillin",
    "dose": 250,
    "price": 13.99,
    "type": "capsule",
    "companyName": "BioMed",
    "amount": 50,
    "createdAt": "2023-01-01T12:00:00.000Z",
    "updatedAt": "2023-01-01T12:30:00.000Z"
  }
}
```

### Delete Drug

Delete a drug from the system (requires PHARMACIST or ADMIN role).

**Endpoint:** `DELETE /api/drugs/:id`

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1...
```

**Response:**

```
Status: 204 No Content
```

## Order Management

### Create Order

Place a new order for drugs.

**Endpoint:** `POST /api/orders`

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1...
```

**Request Body:**

```json
{
  "items": [
    {
      "drugId": "12345",
      "quantity": 2
    },
    {
      "drugId": "67890",
      "quantity": 1
    }
  ]
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "id": "order123",
    "userId": "user123",
    "orderDate": "2023-01-02T10:00:00.000Z",
    "status": "PENDING",
    "createdAt": "2023-01-02T10:00:00.000Z",
    "updatedAt": "2023-01-02T10:00:00.000Z",
    "orderItems": [
      {
        "id": "item1",
        "orderId": "order123",
        "drugId": "12345",
        "quantity": 2,
        "price": 5.99,
        "drug": {
          "id": "12345",
          "name": "Paracetamol",
          "companyName": "Pharma Co.",
          "price": 5.99
        }
      },
      {
        "id": "item2",
        "orderId": "order123",
        "drugId": "67890",
        "quantity": 1,
        "price": 13.99,
        "drug": {
          "id": "67890",
          "name": "Amoxicillin",
          "companyName": "BioMed",
          "price": 13.99
        }
      }
    ],
    "user": {
      "id": "user123",
      "firstName": "John",
      "lastName": "Doe",
      "email": "user@example.com"
    }
  }
}
```

### Get User Orders

Retrieve a paginated list of orders for the current user.

**Endpoint:** `GET /api/orders`

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1...
```

**Query Parameters:**

- `page`: Page number (default: 0)
- `limit`: Items per page (default: 15, max: 100)
- `status`: Filter by order status (PENDING, COMPLETED, CANCELLED)
- `fromDate`: Filter orders from this date
- `toDate`: Filter orders until this date
- `sortBy`: Field to sort by (orderDate, status, createdAt)
- `sortOrder`: Sort direction (asc, desc)

**Response:**

```json
{
  "status": "success",
  "data": [
    {
      "id": "order123",
      "userId": "user123",
      "orderDate": "2023-01-02T10:00:00.000Z",
      "status": "PENDING",
      "createdAt": "2023-01-02T10:00:00.000Z",
      "updatedAt": "2023-01-02T10:00:00.000Z",
      "orderItems": [
        {
          "id": "item1",
          "orderId": "order123",
          "drugId": "12345",
          "quantity": 2,
          "price": 5.99,
          "drug": {
            "id": "12345",
            "name": "Paracetamol",
            "companyName": "Pharma Co.",
            "price": 5.99
          }
        },
        {
          "id": "item2",
          "orderId": "order123",
          "drugId": "67890",
          "quantity": 1,
          "price": 13.99,
          "drug": {
            "id": "67890",
            "name": "Amoxicillin",
            "companyName": "BioMed",
            "price": 13.99
          }
        }
      ],
      "user": {
        "id": "user123",
        "firstName": "John",
        "lastName": "Doe",
        "email": "user@example.com"
      }
    }
    // More orders...
  ],
  "meta": {
    "total": 5,
    "page": 0,
    "limit": 15,
    "totalPages": 1
  }
}
```

### Get Order by ID

Retrieve a specific order by its ID.

**Endpoint:** `GET /api/orders/:id`

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1...
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "id": "order123",
    "userId": "user123",
    "orderDate": "2023-01-02T10:00:00.000Z",
    "status": "PENDING",
    "createdAt": "2023-01-02T10:00:00.000Z",
    "updatedAt": "2023-01-02T10:00:00.000Z",
    "orderItems": [
      {
        "id": "item1",
        "orderId": "order123",
        "drugId": "12345",
        "quantity": 2,
        "price": 5.99,
        "drug": {
          "id": "12345",
          "name": "Paracetamol",
          "companyName": "Pharma Co.",
          "price": 5.99
        }
      },
      {
        "id": "item2",
        "orderId": "order123",
        "drugId": "67890",
        "quantity": 1,
        "price": 13.99,
        "drug": {
          "id": "67890",
          "name": "Amoxicillin",
          "companyName": "BioMed",
          "price": 13.99
        }
      }
    ],
    "user": {
      "id": "user123",
      "firstName": "John",
      "lastName": "Doe",
      "email": "user@example.com"
    }
  }
}
```

### Cancel Order

Cancel a pending order.

**Endpoint:** `POST /api/orders/:id/cancel`

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1...
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "id": "order123",
    "userId": "user123",
    "orderDate": "2023-01-02T10:00:00.000Z",
    "status": "CANCELLED",
    "createdAt": "2023-01-02T10:00:00.000Z",
    "updatedAt": "2023-01-02T11:00:00.000Z"
  }
}
```

## Admin Functions

### Get All Orders

Retrieve all orders in the system (requires EMPLOYEE, PHARMACIST, or ADMIN role).

**Endpoint:** `GET /api/admin/orders`

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1...
```

**Query Parameters:**

- `page`: Page number (default: 0)
- `limit`: Items per page (default: 15, max: 100)
- `status`: Filter by order status (PENDING, COMPLETED, CANCELLED)
- `fromDate`: Filter orders from this date
- `toDate`: Filter orders until this date
- `sortBy`: Field to sort by (orderDate, status, createdAt)
- `sortOrder`: Sort direction (asc, desc)

**Response:**

```json
{
  "status": "success",
  "data": [
    // Order objects (similar to user orders response)
  ],
  "meta": {
    "total": 50,
    "page": 0,
    "limit": 15,
    "totalPages": 4
  }
}
```

### Update Order Status

Change the status of an order (requires EMPLOYEE, PHARMACIST, or ADMIN role).

**Endpoint:** `PATCH /api/admin/orders/:id/status`

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1...
```

**Request Body:**

```json
{
  "status": "COMPLETED"
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "id": "order123",
    "userId": "user123",
    "orderDate": "2023-01-02T10:00:00.000Z",
    "status": "COMPLETED",
    "createdAt": "2023-01-02T10:00:00.000Z",
    "updatedAt": "2023-01-02T12:00:00.000Z"
  }
}
```

### Get Revenue Statistics

Get total revenue statistics (requires EMPLOYEE, PHARMACIST, or ADMIN role).

**Endpoint:** `GET /api/admin/orders/stats/revenue`

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1...
```

**Query Parameters:**

- `fromDate`: Calculate revenue from this date
- `toDate`: Calculate revenue until this date

**Response:**

```json
{
  "status": "success",
  "data": {
    "totalRevenue": 1245.67
  }
}
```

## Postman Collection

To easily test the API, import the provided Postman collection:

1. Download [Postman](https://www.postman.com/downloads/)
2. Import the `Pharmacy_API.postman_collection.json` file
3. Set up environment variables:
   - `baseUrl`: API base URL (e.g., `http://localhost:5000/api`)
   - `accessToken`: Store your access token here
   - `refreshToken`: Store your refresh token here

## Development Guide

### Project Structure

```
/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Route handlers
│   ├── middlewares/      # Express middlewares
│   ├── models/           # Prisma models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   ├── validations/      # Validation schemas
│   └── app.ts            # Main application file
├── prisma/
│   └── schema.prisma     # Database schema
├── tests/                # Tests
├── docs/                 # Documentation
└── docker/               # Docker configuration
```

### Adding a New Feature

1. **Define the schema**:

   - Update `prisma/schema.prisma` with any new models
   - Run `npm run prisma:migrate` to create a migration
   - Run `npm run prisma:generate` to update the Prisma client

2. **Create validation schemas**:

   - Add validation schemas in `src/validations/`

3. **Implement the service**:

   - Create or update a service in `src/services/`

4. **Create the controller**:

   - Implement route handlers in `src/controllers/`

5. **Define the routes**:

   - Add routes in `src/routes/`
   - Register the router in `src/app.ts`

6. **Write tests**:
   - Add tests in the `tests/` directory
   - Run `npm test` to execute the tests

### Common Tasks

- **Start development server**: `npm run dev`
- **Build for production**: `npm run build`
- **Start production server**: `npm start`
- **Run migrations**: `npm run prisma:migrate`
- **Open Prisma Studio**: `npm run prisma:studio`
- **Generate Prisma client**: `npm run prisma:generate`
- **Run tests**: `npm test`
- **Seed the database**: `npm run seed`
