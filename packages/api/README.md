# Permit Management System - Backend API

A comprehensive NestJS backend API for the Permit Management System, providing robust functionality for managing permit packages across all 67 Florida counties.

## Features

### Core API Features
- ✅ **Authentication & Authorization**: JWT-based authentication with role-based access control
- ✅ **User Management**: Complete CRUD operations for user accounts
- ✅ **Customer Management**: Store and manage customer information with addresses
- ✅ **Contractor Management**: Track contractors with license information
- ✅ **County Management**: All 67 Florida counties with customizable checklist templates
- ✅ **Permit Package Management**: Comprehensive package lifecycle tracking
- ✅ **Document Management**: File upload, storage, and retrieval with MinIO
- ✅ **Real-time Features**: WebSocket integration for live updates
- ✅ **Email Notifications**: Automated email notifications for status changes

### Technical Features
- ✅ **Fastify Adapter**: High-performance HTTP server
- ✅ **Prisma ORM**: Type-safe database operations with PostgreSQL
- ✅ **MinIO Integration**: S3-compatible file storage
- ✅ **WebSocket Gateway**: Real-time communication with Socket.IO
- ✅ **Rate Limiting**: Built-in request throttling
- ✅ **Caching**: Redis-based caching for improved performance
- ✅ **Validation**: Comprehensive input validation with class-validator
- ✅ **Swagger Documentation**: Auto-generated API documentation
- ✅ **Security**: Helmet, CORS, and JWT security measures

## Technology Stack

- **Framework**: NestJS 10 with Fastify adapter
- **Database**: PostgreSQL with Prisma ORM
- **File Storage**: MinIO (S3-compatible)
- **Caching**: Redis
- **Real-time**: Socket.IO
- **Authentication**: JWT with Passport
- **Validation**: class-validator with class-transformer
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest with Supertest

## Project Structure

```
src/
├── auth/                    # Authentication module
│   ├── dto/                # Data transfer objects
│   ├── guards/             # Authentication guards
│   ├── strategies/         # Passport strategies
│   ├── auth.controller.ts  # Auth endpoints
│   ├── auth.service.ts     # Auth business logic
│   └── auth.module.ts      # Auth module
├── users/                  # User management
├── customers/              # Customer management
├── contractors/            # Contractor management
├── counties/               # County management
├── packages/               # Permit package management
├── documents/              # Document management
├── pdf/                    # PDF operations
├── file-storage/           # MinIO file storage
├── websocket/              # Real-time features
├── email/                  # Email notifications
├── prisma/                 # Database service
├── app.module.ts           # Main application module
└── main.ts                 # Application entry point
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- MinIO (or S3-compatible storage)

### Installation

1. **Install dependencies**
   ```bash
   cd packages/api
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run prisma:generate
   
   # Run database migrations
   npm run prisma:migrate
   
   # Seed the database
   npm run prisma:seed
   ```

4. **Start Development Server**
   ```bash
   npm run start:dev
   ```

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/permit_management"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="24h"

# MinIO (S3-compatible storage)
MINIO_ENDPOINT="localhost"
MINIO_PORT="9000"
MINIO_USE_SSL="false"
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_BUCKET="permit-documents"

# Redis
REDIS_URL="redis://localhost:6379"

# Email (SMTP)
SMTP_HOST="localhost"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@example.com"
SMTP_PASS="your-email-password"
SMTP_FROM="noreply@permitmanagement.com"

# Application
PORT="3001"
NODE_ENV="development"
CORS_ORIGIN="http://localhost:3000"
FRONTEND_URL="http://localhost:3000"
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `GET /api/v1/auth/profile` - Get user profile

### Users (Admin Only)
- `GET /api/v1/users` - Get all users
- `POST /api/v1/users` - Create user
- `GET /api/v1/users/:id` - Get user by ID
- `PATCH /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Customers
- `GET /api/v1/customers` - Get all customers
- `POST /api/v1/customers` - Create customer
- `GET /api/v1/customers/:id` - Get customer by ID
- `PATCH /api/v1/customers/:id` - Update customer
- `DELETE /api/v1/customers/:id` - Delete customer

### Contractors
- `GET /api/v1/contractors` - Get all contractors
- `POST /api/v1/contractors` - Create contractor
- `GET /api/v1/contractors/:id` - Get contractor by ID
- `PATCH /api/v1/contractors/:id` - Update contractor
- `DELETE /api/v1/contractors/:id` - Delete contractor

### Counties
- `GET /api/v1/counties` - Get all counties
- `GET /api/v1/counties/:id` - Get county by ID
- `GET /api/v1/counties/:id/templates` - Get county templates
- `POST /api/v1/counties/:id/templates` - Create template (Admin)
- `PATCH /api/v1/counties/:id/templates/:itemId` - Update template (Admin)
- `DELETE /api/v1/counties/:id/templates/:itemId` - Delete template (Admin)

### Permit Packages
- `GET /api/v1/packages` - Get all packages
- `POST /api/v1/packages` - Create package
- `GET /api/v1/packages/:id` - Get package by ID
- `PATCH /api/v1/packages/:id` - Update package
- `DELETE /api/v1/packages/:id` - Delete package

### Documents
- `GET /api/v1/documents` - Get all documents
- `POST /api/v1/documents` - Upload document
- `GET /api/v1/documents/:id` - Get document by ID
- `DELETE /api/v1/documents/:id` - Delete document

### PDF Operations
- `POST /api/v1/pdf/fill` - Fill PDF with data
- `POST /api/v1/pdf/extract-fields` - Extract form fields from PDF

## WebSocket Events

### Client to Server
- `join-package` - Join a package room
- `leave-package` - Leave a package room
- `toggle-checklist-item` - Toggle checklist item completion
- `update-status` - Update package status

### Server to Client
- `joined-package` - Confirmation of joining package room
- `left-package` - Confirmation of leaving package room
- `presence` - User presence updates
- `checklist-updated` - Checklist item updates
- `status-updated` - Package status updates

## Database Schema

The application uses Prisma with PostgreSQL and includes the following main entities:

- **User**: Authentication and user management
- **Customer**: Customer information and addresses
- **Contractor**: Contractor information and licenses
- **County**: Florida counties with checklist templates
- **PermitPackage**: Main permit package entity
- **Document**: File storage and management
- **StatusLog**: Package status history
- **Signature**: Digital signatures

## Development

### Available Scripts

```bash
# Development
npm run start:dev          # Start development server
npm run start:debug        # Start with debug mode
npm run build              # Build for production
npm run start:prod         # Start production server

# Database
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run migrations
npm run prisma:studio      # Open Prisma Studio
npm run prisma:seed        # Seed database

# Testing
npm run test               # Run tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run tests with coverage
npm run test:e2e           # Run end-to-end tests

# Linting
npm run lint               # Run ESLint
npm run format             # Format code with Prettier
```

### Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Deploy migrations to production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

## Deployment

### Docker Deployment

```bash
# Build the image
docker build -t permit-management-api .

# Run with Docker Compose
docker-compose up -d
```

### Production Considerations

1. **Environment Variables**: Use strong JWT secrets and secure database credentials
2. **SSL/TLS**: Enable HTTPS in production
3. **Rate Limiting**: Adjust rate limits based on expected traffic
4. **Caching**: Configure Redis for optimal performance
5. **Monitoring**: Set up logging and monitoring
6. **Backup**: Implement database backup strategies

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Admin and User roles
- **Input Validation**: Comprehensive validation with class-validator
- **Rate Limiting**: Built-in request throttling
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet**: Security headers
- **SQL Injection Protection**: Prisma ORM prevents SQL injection

## Performance Optimizations

- **Fastify Adapter**: High-performance HTTP server
- **Redis Caching**: Caching frequently accessed data
- **Database Indexing**: Optimized database queries
- **File Streaming**: Efficient file upload/download
- **Connection Pooling**: Database connection optimization

## API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:3001/api/docs`
- **API JSON**: `http://localhost:3001/api/docs-json`

## Default Admin User

After running the seed script, you can login with:
- **Email**: `admin@permitmanagement.com`
- **Password**: `admin123`

**Important**: Change the default password in production!

## Support

For issues and questions:
- Check the API documentation at `/api/docs`
- Review the Prisma schema in `prisma/schema.prisma`
- Check the logs for detailed error information
