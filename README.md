# Backend Engineer - Skill Verification Case Study

## Role
Backend Engineer

## Title
Task Management API with Authentication

## Brief
Build a RESTful API for a task management system with user authentication, CRUD operations, and proper error handling. The API should demonstrate your understanding of backend architecture, database design, authentication, and API best practices.

## Description

### Objective
Create a production-ready Task Management API that allows users to:
- Register and authenticate
- Create, read, update, and delete tasks
- Assign tasks to categories
- Filter and search tasks
- Implement proper authorization (users can only manage their own tasks)

### Technical Requirements

#### 1. Authentication & Authorization
- Implement JWT-based authentication
- Secure password storage (hashing with bcrypt or argon2)
- Protected routes requiring authentication
- Users can only access/modify their own tasks

#### 2. Core Features
- **User Management**
  - User registration (POST /api/auth/register)
  - User login (POST /api/auth/login)
  - Get current user profile (GET /api/auth/me)

- Task Management
  - Create task (POST /api/tasks)
  - Get all user's tasks (GET /api/tasks)
  - Get single task (GET /api/tasks/:id)
  - Update task (PUT /api/tasks/:id)
  - Delete task (DELETE /api/tasks/:id)
  - Filter tasks by status (GET /api/tasks?status=completed)
  - Search tasks by title (GET /api/tasks?search=keyword)

- Task Schema
  ```json
  {
    "id": "uuid",
    "title": "string (required)",
    "description": "string (optional)",
    "status": "pending | in_progress | completed",
    "priority": "low | medium | high",
    "dueDate": "ISO date string",
    "userId": "uuid (foreign key)",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
  ```

#### 3. Database
- Use PostgreSQL, MySQL, or MongoDB
- Proper database schema design
- Migrations (if applicable)
- Indexing for performance

#### 4. Validation
- Input validation on all endpoints
- Proper error messages
- Sanitize user input

#### 5. Error Handling
- Proper HTTP status codes
- Consistent error response format
- Handle edge cases gracefully

#### 6. Code Quality
- Clean, readable code
- Proper project structure
- Environment variable configuration
- RESTful API conventions
- Comments where necessary

#### 7. Testing (Bonus)
- Unit tests for business logic
- Integration tests for API endpoints
- Test coverage > 70%

#### 8. Documentation
- README with setup instructions
- API documentation (endpoints, request/response examples)
- Environment variables documentation

### Technology Stack (Choose one)
- **Node.js**: Express/NestJS + TypeScript/JavaScript
- **Python**: FastAPI/Django + PostgreSQL
- **Java**: Spring Boot + PostgreSQL
- **Go**: Gin/Echo + PostgreSQL

### Deliverables
1. Complete source code in GitHub repository
2. README with:
   - Setup instructions
   - Environment variables
   - How to run the application
   - How to run tests
3. API documentation
4. Database schema/migrations
5. Pull Request with your implementation

### Evaluation Criteria
Your submission will be evaluated based on:
1. **Functionality** (25%) - Does it work as specified?
2. **Code Quality** (25%) - Clean, maintainable, well-structured code
3. **Security** (20%) - Proper authentication, authorization, input validation
4. **Database Design** (15%) - Schema design, migrations, indexing
5. **Error Handling** (10%) - Proper error messages and status codes
6. **Documentation** (5%) - Clear README and API docs

### Time Limit
72 hours from repository access

### Tips
- Start with authentication before implementing task features
- Use environment variables for sensitive data
- Write clean, self-documenting code
- Handle edge cases (e.g., task not found, unauthorized access)
- Follow REST conventions for API design
- Commit frequently with meaningful messages

# Submission Instructions
1. Clone the template repository,
2. Checkout to a new branch and complete the case study requirements,
3. Push your changes and create a Pull Request to the `main` branch,
4. Your submission will be evaluated and you will receive feedback via email,

Good luck!

---

## Implementation Documentation

This repository implements the case study using NestJS, TypeScript, PostgreSQL, Prisma, JWT authentication, and Argon2 password hashing.

Full API examples and database notes are documented in [IMPLEMENTATION.md](./IMPLEMENTATION.md).

### Implemented Features

- Register and authenticate users
- Create, read, update, and delete tasks
- Assign tasks to user-owned categories
- Filter tasks by status, priority, category, and title search
- Protect routes with JWT authentication
- Enforce authorization so users can only manage their own tasks and categories
- Validate request payloads and query parameters
- Return consistent error responses
- Provide Swagger/OpenAPI documentation

### Environment Variables

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Required variables:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/task_management?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN="1h"
PORT=3000
```

### Setup

Install dependencies:

```bash
npm install
```

Start PostgreSQL with Docker:

```bash
docker compose up -d
```

Generate the Prisma client:

```bash
npm run prisma:generate
```

Run database migrations:

```bash
npm run prisma:migrate
```

### Run

Start the API in development mode:

```bash
npm run start:dev
```

The API runs at:

```txt
http://localhost:3000/api
```

Swagger documentation is available at:

```txt
http://localhost:3000/api/docs
```

### Tests

Run the test suite:

```bash
npm test
```

Run test coverage:

```bash
npm run test:cov
```

### Database

The Prisma schema is located at:

```txt
prisma/schema.prisma
```

The initial migration is located at:

```txt
prisma/migrations/20260714000000_init/migration.sql
```
