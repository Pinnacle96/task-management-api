# Task Management API Implementation

Production-ready REST API for task management with JWT authentication, user-owned tasks, categories, filtering, search, validation, database migrations, and Swagger documentation.

## Tech Stack

- Node.js, NestJS, TypeScript
- PostgreSQL
- Prisma ORM and migrations
- JWT authentication with Passport
- Argon2 password hashing
- class-validator/class-transformer validation
- Jest unit tests
- Swagger/OpenAPI documentation

## Features

- Register, log in, and fetch the current user profile
- Create, read, update, and delete tasks
- Assign tasks to user-owned categories
- Filter tasks by status, priority, and category
- Search tasks by title
- Enforce task and category ownership per authenticated user
- Consistent error responses and HTTP status codes

## Requirements

- Node.js 20+
- npm
- PostgreSQL 14+

## Environment Variables

Copy the example file and update values for your machine:

```bash
cp .env.example .env
```

| Variable | Description | Example |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string used by Prisma | `postgresql://postgres:postgres@localhost:5432/task_management?schema=public` |
| `JWT_SECRET` | Secret used to sign JWT access tokens | `replace-with-a-long-random-secret` |
| `JWT_EXPIRES_IN` | Access token lifetime | `1h` |
| `PORT` | HTTP server port | `3000` |

## Setup

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

Start the development server:

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

## Testing

Run the unit test suite:

```bash
npm test
```

Run coverage:

```bash
npm run test:cov
```

## API Overview

All task and category routes require:

```txt
Authorization: Bearer <accessToken>
```

### Auth

`POST /api/auth/register`

```json
{
  "email": "ada@example.com",
  "password": "correct horse battery staple",
  "name": "Ada Lovelace"
}
```

`POST /api/auth/login`

```json
{
  "email": "ada@example.com",
  "password": "correct horse battery staple"
}
```

`GET /api/auth/me`

### Tasks

`POST /api/tasks`

```json
{
  "title": "Prepare API submission",
  "description": "Finish auth, task CRUD, tests, and documentation.",
  "status": "pending",
  "priority": "high",
  "dueDate": "2026-07-20T12:00:00.000Z",
  "categoryId": "4f20b1f9-22fb-41b6-a14d-1c6d7295a7f4"
}
```

`GET /api/tasks`

Supported query params:

- `status=pending|in_progress|completed`
- `priority=low|medium|high`
- `categoryId=<uuid>`
- `search=<title keyword>`

`GET /api/tasks/:id`

`PUT /api/tasks/:id`

`DELETE /api/tasks/:id`

### Categories

`POST /api/categories`

```json
{
  "name": "Work"
}
```

`GET /api/categories`

`PATCH /api/categories/:id`

`DELETE /api/categories/:id`

## Error Format

```json
{
  "statusCode": 400,
  "message": ["title must be shorter than or equal to 160 characters"],
  "error": "Bad Request",
  "timestamp": "2026-07-14T08:00:00.000Z",
  "path": "/api/tasks"
}
```

## Database Design

The Prisma schema defines:

- `User`: owns tasks and categories
- `Task`: belongs to a user and optionally to a category
- `Category`: belongs to a user and can be assigned to tasks

Important indexes:

- `tasks(userId, status)`
- `tasks(userId, priority)`
- `tasks(userId, dueDate)`
- `tasks(userId, categoryId)`
- unique `categories(userId, name)`
