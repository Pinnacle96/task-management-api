# Task Management API

Production-ready REST API for managing user-owned tasks with JWT authentication, categories, filtering, search, validation, PostgreSQL persistence, Prisma migrations, and Swagger/OpenAPI documentation.

This project is an implementation of the Backend Engineer skill verification case study. The original assignment brief is preserved at the bottom of this README for reviewer context.

## Tech Stack

- Node.js
- NestJS
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT authentication with Passport
- Argon2 password hashing
- class-validator and class-transformer
- Jest
- Swagger/OpenAPI

## Features

- User registration and login
- JWT-protected authenticated routes
- Current user profile endpoint
- Task create, read, update, and delete
- User-owned categories
- Task assignment to categories
- Task filtering by status, priority, and category
- Task search by title
- Ownership enforcement so users can only manage their own tasks and categories
- Request validation on DTOs and query parameters
- Consistent error response format
- PostgreSQL schema, migration, and indexes
- Swagger documentation at `/api/docs`

## Requirements

- Node.js 20+
- npm
- PostgreSQL 14+ or Docker

## Environment Variables

Create a local `.env` file from the example:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description | Example |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string used by Prisma | `postgresql://postgres:postgres@localhost:5432/task_management?schema=public` |
| `JWT_SECRET` | Secret used to sign JWT access tokens | `replace-with-a-long-random-secret` |
| `JWT_EXPIRES_IN` | Access token lifetime | `1h` |
| `PORT` | HTTP server port | `3000` |

Never commit `.env`. It is ignored by Git. Commit only `.env.example`.

## Setup

Install dependencies:

```bash
npm install
```

Start PostgreSQL with Docker:

```bash
docker compose up -d
```

Generate Prisma client:

```bash
npm run prisma:generate
```

Run database migrations:

```bash
npm run prisma:migrate
```

Start the application:

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

## API Usage

Use Swagger at `/api/docs` for interactive testing.

All task and category endpoints require:

```txt
Authorization: Bearer <accessToken>
```

### Auth

Register:

```http
POST /api/auth/register
```

```json
{
  "email": "ada@example.com",
  "password": "correct horse battery staple",
  "name": "Ada Lovelace"
}
```

Login:

```http
POST /api/auth/login
```

```json
{
  "email": "ada@example.com",
  "password": "correct horse battery staple"
}
```

Current user:

```http
GET /api/auth/me
```

### Tasks

Create task:

```http
POST /api/tasks
```

```json
{
  "title": "Prepare API submission",
  "description": "Finish auth, task CRUD, tests, and documentation.",
  "status": "pending",
  "priority": "high",
  "dueDate": "2026-07-20T12:00:00.000Z"
}
```

List current user's tasks:

```http
GET /api/tasks
```

Supported query parameters:

- `status=pending|in_progress|completed`
- `priority=low|medium|high`
- `categoryId=<uuid>`
- `search=<title keyword>`

Examples:

```http
GET /api/tasks?status=completed
GET /api/tasks?search=submission
```

Single task:

```http
GET /api/tasks/:id
```

Update task:

```http
PUT /api/tasks/:id
```

Delete task:

```http
DELETE /api/tasks/:id
```

### Categories

Create category:

```http
POST /api/categories
```

```json
{
  "name": "Work"
}
```

List categories:

```http
GET /api/categories
```

Update category:

```http
PATCH /api/categories/:id
```

Delete category:

```http
DELETE /api/categories/:id
```

## Validation

The API validates request bodies and query parameters using DTOs with `class-validator`.

Validation includes:

- Required task title
- Email format
- Password length
- UUID format for IDs
- Supported task statuses: `pending`, `in_progress`, `completed`
- Supported priorities: `low`, `medium`, `high`
- Maximum text lengths
- ISO date strings for due dates
- Rejection of unknown request fields through global whitelist validation

Input strings used for persisted names/titles/descriptions are trimmed before storage.

## Error Handling

Errors use a consistent JSON response format:

```json
{
  "statusCode": 400,
  "message": ["title must be shorter than or equal to 160 characters"],
  "error": "Bad Request",
  "timestamp": "2026-07-14T08:00:00.000Z",
  "path": "/api/tasks"
}
```

Handled cases include:

- Duplicate email
- Invalid login credentials
- Missing or invalid JWT
- Task not found
- Category not found
- Attempting to use another user's task/category
- Invalid request body or query params
- Duplicate category name per user

## Database

Prisma schema:

```txt
prisma/schema.prisma
```

Initial migration:

```txt
prisma/migrations/20260714000000_init/migration.sql
```

Main models:

- `User`
- `Task`
- `Category`

Important indexes:

- `tasks(userId, status)`
- `tasks(userId, priority)`
- `tasks(userId, dueDate)`
- `tasks(userId, categoryId)`
- `categories(userId)`
- unique `categories(userId, name)`

## Testing

Run tests:

```bash
npm test
```

Run coverage:

```bash
npm run test:cov
```

Current tests cover business logic in auth, users, categories, and tasks services. Service-level coverage is above the requested 70% bonus threshold.

Note: Unit tests are implemented for business logic. Integration tests for API endpoints are a listed bonus item in the original brief and can be added as a further improvement.

## Useful Commands

```bash
npm run build
npm run start:dev
npm test
npm run test:cov
npm run lint
npm run prisma:generate
npm run prisma:migrate
npm run prisma:deploy
npm run prisma:studio
```

## Documentation

- Interactive API documentation: `http://localhost:3000/api/docs`
- Additional implementation notes: [IMPLEMENTATION.md](./IMPLEMENTATION.md)

## Assignment Brief

### Role
Backend Engineer

### Title
Task Management API with Authentication

### Brief
Build a RESTful API for a task management system with user authentication, CRUD operations, and proper error handling. The API should demonstrate your understanding of backend architecture, database design, authentication, and API best practices.

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

- User registration (`POST /api/auth/register`)
- User login (`POST /api/auth/login`)
- Get current user profile (`GET /api/auth/me`)
- Create task (`POST /api/tasks`)
- Get all user's tasks (`GET /api/tasks`)
- Get single task (`GET /api/tasks/:id`)
- Update task (`PUT /api/tasks/:id`)
- Delete task (`DELETE /api/tasks/:id`)
- Filter tasks by status (`GET /api/tasks?status=completed`)
- Search tasks by title (`GET /api/tasks?search=keyword`)

#### 3. Database

- Use PostgreSQL, MySQL, or MongoDB
- Proper database schema design
- Migrations
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

#### 7. Testing

- Unit tests for business logic
- Integration tests for API endpoints
- Test coverage > 70%

#### 8. Documentation

- README with setup instructions
- API documentation
- Environment variables documentation

### Deliverables

1. Complete source code in GitHub repository
2. README with setup instructions, environment variables, run instructions, and test instructions
3. API documentation
4. Database schema/migrations
5. Pull Request with your implementation
