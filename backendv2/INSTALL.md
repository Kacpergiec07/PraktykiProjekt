# Installation Guide

This guide provides detailed instructions for setting up and running the Pharmacy API.

## Prerequisites

Before you begin, make sure you have the following installed:

- Node.js (v16 or higher)
- npm (v8 or higher)
- Git

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/pharmacy-api.git
cd pharmacy-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory by copying the example file:

```bash
cp .env.example .env
```

Update the `.env` file with your own values:

```
# Application
NODE_ENV=development
PORT=5000
API_PREFIX=/api

# Database
DATABASE_URL="file:./dev.db"

# Authentication
JWT_ACCESS_SECRET=your_jwt_access_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:3000
```

### 4. Database Setup

The project uses SQLite, which doesn't require a separate database server. The database file will be created automatically when running the migrations.

Run the Prisma migrations to create the database schema:

```bash
npm run prisma:migrate
```

Generate the Prisma client:

```bash
npm run prisma:generate
```

### 5. Start the Development Server

```bash
npm run dev
```

The API will be available at http://localhost:5000.
The API documentation will be available at http://localhost:5000/api-docs.

## Using Docker

If you prefer to use Docker, you can use the provided Docker Compose configuration.

### 1. Install Docker and Docker Compose

Follow the official installation guides:

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### 2. Environment Setup

Create a `.env` file in the root directory by copying the example file:

```bash
cp .env.example .env
```

Update the `.env` file for Docker:

```
# Application
NODE_ENV=production
PORT=5000
API_PREFIX=/api

# Database
DATABASE_URL="file:./dev.db"

# Authentication
JWT_ACCESS_SECRET=your_jwt_access_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:3000
```

### 3. Build and Start the Containers

```bash
docker-compose up -d
```

The API will be available at http://localhost:5000.

### 4. Stop the Containers

```bash
docker-compose down
```

## Production Deployment

For production deployment, follow these additional steps:

### 1. Build the Application

```bash
npm run build
```

### 2. Configure Environment

Update the `.env` file with production values:

```
NODE_ENV=production
JWT_ACCESS_SECRET=long_random_string
JWT_REFRESH_SECRET=another_long_random_string
```

Use strong, randomly generated secrets for JWT tokens in production.

### 3. Start the Production Server

```bash
npm start
```

## Common Issues and Troubleshooting

### Database Connection Issues

- Make sure the `DATABASE_URL` in your `.env` file is correct
- Ensure that the SQLite database file is writable
- Check that the directory where the database is stored exists and is writable

### JWT Token Issues

- If you get authentication errors, check that your JWT secrets in `.env` match what was used to issue the tokens

### Port Conflicts

- If port 5000 is already in use, you can change the port in the `.env` file
