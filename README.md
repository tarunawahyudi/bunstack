# BunStack

BunStack is a modular backend starter built with [Bun](https://bun.sh), [Elysia](https://elysiajs.com), TypeScript, TypeORM, PostgreSQL, and dependency injection through `tsyringe`.

The project is designed as a practical foundation for production-oriented APIs. It includes a clean module structure, centralized configuration, standardized responses, centralized exception handling, daily file logging, startup branding, Swagger documentation, Docker support for PostgreSQL, and a PlantUML-based documentation generator.

## Features

- Bun runtime with TypeScript-first development.
- Elysia HTTP server with global middleware registration.
- TypeORM PostgreSQL datasource.
- Modular architecture using route, controller, service, repository, entity, and DTO layers.
- Dependency injection with `tsyringe` and `reflect-metadata`.
- YAML-based application configuration with environment variable interpolation.
- Startup banner and application metadata log.
- Standard success and error response shapes.
- CSV-backed error dictionary with generated ticket codes.
- JWT authentication with access and refresh tokens.
- Protected user read endpoints.
- Health check endpoint with database connectivity check.
- Daily application logs under `resources/logs`.
- Swagger/OpenAPI documentation.
- CORS configuration through `application.yaml`.
- PlantUML diagram generator for use-case, sequence, entity, and other UML categories.
- Docker Compose setup for local PostgreSQL.
- ESLint and Prettier-ready development workflow.

## Tech Stack

| Area | Technology |
| --- | --- |
| Runtime | Bun |
| Framework | Elysia |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | TypeORM |
| Dependency Injection | tsyringe |
| API Docs | `@elysiajs/swagger` |
| Configuration | YAML + environment variables |
| Logging | Custom file/console logger, Chalk |
| Observability ready | Axiom and Sentry dependencies/configuration |
| UML Documentation | PlantUML through `node-plantuml` |
| Container Support | Docker and Docker Compose |

## Project Structure

```text
.
|-- application.yaml              # Main application configuration
|-- infrastructure/
|   |-- docker/                   # Dockerfile and PostgreSQL compose file
|   `-- http/                     # Example HTTP requests
|-- docs/
|   `-- uml/                      # PlantUML source files and generated diagrams
|-- resources/
|   |-- branding/                 # Startup banner
|   |-- dictionary/               # Error dictionary CSV
|   `-- logs/                     # Runtime log output
|-- src/
|   |-- app.ts                    # Application entry point
|   |-- app/
|   |   |-- core/                 # Startup, config, DI container, middleware, exceptions
|   |   |-- lib/                  # External library clients and datasource
|   |   |-- module/               # Feature modules
|   |   `-- shared/               # Shared constants, types, and utilities
|   `-- script/
|       `-- generator/            # UML generator script
|-- package.json
|-- tsconfig.json
`-- bun.lock
```

## Architecture Overview

The application starts from `src/app.ts`.

Startup flow:

1. `setupContainer()` initializes TypeORM and registers application modules.
2. A new Elysia app is created.
3. Global middleware is registered:
   - request logger
   - CORS
   - Swagger
   - error handler
4. Feature routes are registered.
5. Startup metadata and banner are printed.
6. The HTTP server starts on `APP_PORT`.

The current user module follows this structure:

```text
route -> controller -> DTO mapper -> service -> repository -> TypeORM entity
```

This keeps HTTP concerns, request/response shapes, business logic, persistence logic, and database mapping separated.

## Requirements

- Bun
- PostgreSQL
- Docker and Docker Compose, optional but recommended for local database setup
- Graphviz, required only when generating UML diagrams

## Getting Started

Install dependencies:

```bash
bun install
```

Create your local environment file:

```bash
cp .env.example .env
```

Update the environment values for your machine.

Minimum local environment variables:

```env
APP_ENV=dev
APP_PORT=3000
APP_BASE_URL=http://localhost:3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=root
DB_PASS=password
DB_NAME=postgres

JWT_SECRET=your_jwt_secret
```

Start PostgreSQL with Docker Compose:

```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d
```

Run the development server:

```bash
bun run dev
```

The API will be available at:

```text
http://localhost:3000
```

Swagger UI will be available at:

```text
http://localhost:3000/docs
```

## Available Scripts

| Script | Description |
| --- | --- |
| `bun run dev` | Starts the Elysia server in watch mode using `src/app.ts`. |
| `bun run start` | Runs the configured start command from `package.json`. |
| `bun run lint` | Runs ESLint for the project. |
| `bun run uml:gen` | Generates all UML diagrams under `docs/uml`. |
| `bun run uml:gen:category <category>` | Generates all diagrams from one UML category. |
| `bun run uml:gen:file <category> <file.puml>` | Generates one diagram from one category. |

Note: the current development entry point is `src/app.ts`.

## Configuration

Application configuration is defined in `application.yaml`.

Environment placeholders use this format:

```yaml
app:
  environment: ${APP_ENV}
  port: ${APP_PORT}
```

At runtime, `src/app/core/config/index.ts` loads `application.yaml` and replaces placeholders with values from `process.env`.

Important configuration sections:

| Section | Purpose |
| --- | --- |
| `app` | Application name, version, environment, port, and base URL. |
| `database` | Database configuration values for the application profile. |
| `resources` | Paths for banner and error dictionary resources. |
| `logger` | Log path, log level, and observability settings. |
| `swagger` | Swagger path, provider, title, version, and description. |
| `api` | API prefix, timeout, and rate-limit configuration values. |
| `auth` | JWT and token expiration configuration. |
| `cors` | CORS enablement and allowed origins. |
| `services` | External service placeholders such as email and Redis. |
| `features` | Feature flags. |
| `misc` | Miscellaneous application settings. |

The TypeORM datasource in `src/app/lib/datasource.ts` reads database settings from the resolved application config:

```text
application.yaml -> config loader -> config.database -> TypeORM DataSource
```

The database section is still environment-driven through YAML placeholders:

```yaml
database:
  client: postgresql
  host: ${DB_HOST}
  port: ${DB_PORT}
  username: ${DB_USER}
  password: ${DB_PASS}
  database: ${DB_NAME}
```

For local development, `synchronize: true` is enabled. Disable it and use migrations before running production workloads.

## Database

The starter uses PostgreSQL with TypeORM.

The Docker Compose file starts a PostgreSQL 16 container:

```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d
```

Default Docker database values:

| Value | Default |
| --- | --- |
| Host | `localhost` |
| Port | `5432` |
| User | `root` |
| Password | `password` |
| Database | `postgres` |

The sample `User` entity maps to the `users` table:

```ts
@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ unique: true })
  email!: string

  @Column()
  password!: string
}
```

For production applications, hash passwords before persistence and avoid returning sensitive fields from API responses.

## API Documentation

Swagger is registered through `src/app/core/config/swagger.config.ts`.

Default documentation URL:

```text
/docs
```

The Swagger metadata is configured from `application.yaml`:

```yaml
swagger:
  path: /docs
  provider: swagger-ui
  title: BunStack API Documentation
```

## Current API Endpoints

Routes are currently mounted directly under `/users`.

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/users` | Create a new user. |
| `GET` | `/users` | Get all users. Requires Bearer access token. |
| `GET` | `/users/:email` | Get a user by email. Requires Bearer access token. |

Example request:

```http
POST http://localhost:3000/users
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Successful response shape:

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 1,
    "email": "user@example.com"
  },
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

User responses are mapped through `src/app/module/user/dto/user.response.dto.ts`, so sensitive fields such as `password` are not returned by create, get by email, or get all endpoints.

The `api.prefix` value exists in configuration, but the current route registration does not automatically prepend it.

## Authentication

Authentication is implemented in the `auth` module using JWT access and refresh tokens.

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/auth/login` | Login with email and password. |
| `POST` | `/auth/refresh` | Issue a new token pair from a refresh token. |
| `GET` | `/auth/me` | Get the authenticated user. Requires Bearer access token. |

Login request:

```http
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Login response:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "tokenType": "Bearer",
    "accessToken": "<jwt-access-token>",
    "refreshToken": "<jwt-refresh-token>",
    "expiresIn": 3600,
    "user": {
      "id": 1,
      "email": "user@example.com"
    }
  },
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

Protected endpoints require this header:

```http
Authorization: Bearer <jwt-access-token>
```

User passwords are hashed before being stored. Existing rows created before this behavior was added should be recreated or migrated before login will work for those users.

## Health Check

The health endpoint checks the application process and database connectivity.

```http
GET http://localhost:3000/health
```

Successful response:

```json
{
  "success": true,
  "message": "Health check passed",
  "data": {
    "status": "ok",
    "uptime": 120.5,
    "timestamp": "2026-01-01T00:00:00.000Z",
    "database": {
      "status": "ok"
    }
  },
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

## Error Handling

Application errors are represented by `AppException`.

Error definitions are stored in:

```text
resources/dictionary/errors.csv
```

Example:

```csv
code,module,message,logLevel,httpStatus
USER-001,USER,Email already exists,warn,400
USER-002,USER,User not found,warn,404
```

When an `AppException` is thrown, the global error middleware returns a standardized response:

```json
{
  "success": false,
  "code": "USER-002",
  "message": "User not found",
  "ticket": "018F0000-0000-7000-8000-000000000000",
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

The generated ticket code helps correlate API failures with logs.

## Logging

The logger writes colored console logs and daily log files.

Default log directory:

```text
resources/logs
```

Daily log files use this format:

```text
application-YYYYMMDD.log
```

Log level is controlled by:

```yaml
logger:
  level: info
```

Supported levels:

- `error`
- `warn`
- `info`
- `debug`

## Startup Banner

On startup, the app reads and prints:

```text
resources/branding/banner.txt
```

After the banner, the app prints service metadata such as service name, tech stack, start time, listening URL, Swagger URL, and runtime mode.

If the banner file is missing, startup continues and a warning is printed.

## UML Diagram Generator

The project includes a PlantUML generator at:

```text
src/script/generator/generate-uml.ts
```

UML sources are stored under:

```text
docs/uml
```

Example categories:

- `use-case`
- `sequence`
- `entity`

Generate all diagrams:

```bash
bun run uml:gen
```

Generate one category:

```bash
bun run uml:gen:category use-case
```

Generate one file:

```bash
bun run uml:gen:file use-case use-case-auth-sign-in.puml
```

Generated PNG files are written to an `out` folder inside each category:

```text
docs/uml/use-case/out/use-case-auth-sign-in.png
```

Graphviz is required by PlantUML. Verify your installation with:

```bash
dot -V
```

See `docs/uml/instruction.md` for more UML generator details.

## Docker

The project includes Docker files under:

```text
infrastructure/docker
```

Start PostgreSQL:

```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d
```

Stop PostgreSQL:

```bash
docker compose -f infrastructure/docker/docker-compose.yml down
```

Build the application image:

```bash
docker build -f infrastructure/docker/Dockerfile -t bunstack .
```

Run the application container:

```bash
docker run --env-file .env -p 3000:3000 bunstack
```

## Development Guidelines

When adding a new module, follow the existing module layout:

```text
src/app/module/<module-name>/
|-- <module-name>.route.ts
|-- <module-name>.container.ts
|-- controller/
|-- dto/
|-- service/
|-- repository/
`-- entity/
```

Recommended flow:

1. Create request and response DTOs for external API payloads.
2. Create the TypeORM entity for persistence.
3. Create the repository interface and implementation.
4. Create the service interface and implementation.
5. Create the controller interface and implementation.
6. Map entities to response DTOs before returning data from controllers.
7. Register dependencies in the module container.
8. Register routes in the module route file.
9. Add the module registration to `setupContainer()`.
10. Add the route registration to `src/app.ts`.
11. Add error codes to `resources/dictionary/errors.csv`.
12. Add or update UML diagrams when the feature affects documented flows.

## Path Aliases

TypeScript aliases are configured in `tsconfig.json`:

| Alias | Target |
| --- | --- |
| `@core/*` | `src/app/core/*` |
| `@module/*` | `src/app/module/*` |
| `@shared/*` | `src/app/shared/*` |
| `@lib/*` | `src/app/lib/*` |

Use these aliases for internal imports to keep module paths readable.

## Production Checklist

Before using this starter in production, review these items:

- Disable TypeORM `synchronize` and introduce migrations.
- Hash passwords before saving users.
- Avoid returning password fields or other sensitive data in API responses.
- Validate and sanitize all request payloads.
- Review CORS origins.
- Set strong secrets for JWT and external service credentials.
- Configure real observability providers if using Axiom or Sentry.
- Add authentication and authorization middleware.
- Add automated tests for controllers, services, repositories, and error handling.
- Configure CI for linting, type checking, tests, and image builds.
- Review Docker image and runtime environment for production hardening.

## License

No license has been defined yet. Add a `LICENSE` file before publishing or distributing this project.
