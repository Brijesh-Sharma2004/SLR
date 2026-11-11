# SLR Backend

NestJS 12 API for the Smart Learning Resource platform. It serves the course
catalog, search, authentication, user profiles, contact messages, and health
checks, and persists data to MongoDB with Mongoose.

The full-stack overview, API summary, and local setup live in
[`../README.md`](../README.md). Production deployment is covered in
[`../docs/DEPLOYMENT.md`](../docs/DEPLOYMENT.md).

## Requirements

- Node.js 24+
- npm 11+
- MongoDB Atlas or another MongoDB instance

## Local setup

```bash
npm install
cp .env.example .env
```

On PowerShell, use `Copy-Item .env.example .env`.

Set the following in `.env`:

```dotenv
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/slr?retryWrites=true&w=majority
MONGODB_DB_NAME=slr
JWT_SECRET=<at-least-32-random-characters>
```

Then seed and run:

```bash
npm run seed
npm run start:dev
```

- API: <http://localhost:3001/api/v1>
- Swagger: <http://localhost:3001/api/docs>
- Readiness: <http://localhost:3001/api/v1/health/ready>

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run start` | Start once |
| `npm run start:dev` | Start with watch mode |
| `npm run start:prod` | Run the compiled `dist/main.js` |
| `npm run build` | Compile with Nest CLI |
| `npm run seed` | Build and run the idempotent seed |
| `npm run lint` | Lint `src` and `test` |
| `npm test` | Unit tests |
| `npm run test:e2e` | E2E tests with an in-memory MongoDB |
| `npm run test:cov` | Unit test coverage |

## Environment variables

All variables are validated at startup by `src/config/env.validation.ts`.

| Variable | Required | Notes |
| --- | --- | --- |
| `NODE_ENV` | yes | `development`, `production`, or `test` |
| `PORT` | yes | API port, default `3001` |
| `CORS_ORIGIN` | yes | Comma-separated allowed origins |
| `JWT_SECRET` | yes | Minimum 32 characters |
| `JWT_EXPIRES_IN` | yes | Example: `7d` |
| `COOKIE_NAME` | yes | Default `slr_access_token` |
| `COOKIE_SECURE` | yes | `true` behind HTTPS |
| `TRUST_PROXY` | no | Trusted proxy hops; `0` disables |
| `BCRYPT_SALT_ROUNDS` | yes | 10–15 |
| `THROTTLE_TTL_MS` | yes | Global rate-limit window |
| `THROTTLE_LIMIT` | yes | Requests per window |
| `MONGODB_URI` | yes | `mongodb://` or `mongodb+srv://` |
| `MONGODB_DB_NAME` | yes | Database name |

## API modules

| Module | Routes |
| --- | --- |
| `health` | `GET /health`, `GET /health/ready` |
| `auth` | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout` |
| `users` | `GET /users/me`, `PATCH /users/me` |
| `courses` | `GET /courses`, `GET /courses/:slug` |
| `subjects` | `GET /subjects`, `GET /subjects/:slug` |
| `resources` | `GET /resources`, `GET /resources/:idOrSlug` |
| `search` | `GET /search` |
| `contact` | `POST /contact` |

All routes are prefixed with `/api/v1`. Successful responses are wrapped in
`{ "data": ... }`; paginated responses add a `meta` object. Errors use the
global exception filter shape documented in the root README.

## Source layout

```text
src/
├── auth/           JWT cookie auth, guards, DTOs
├── users/          profile service and controller
├── courses/        course queries and aggregation
├── subjects/       subject queries and nested resources
├── resources/      resource filters and lookup
├── search/         grouped search
├── contact/        contact-message module
├── database/       Mongoose schemas and connection
├── seed/           seed module and CLI
├── health/         Terminus health checks
├── config/         environment validation
└── common/         filters, interceptors, shared DTOs/utilities
```

## Testing

```bash
npm run lint
npm test
npm run test:e2e
npm run build
```

E2E tests create the app with `test/utils/create-e2e-app.ts`, start a
`mongodb-memory-server` instance, and seed it before running. The first run
downloads a `mongod` binary, so it can be slower than subsequent runs.

## Production

```bash
npm ci
npm run build
npm run seed
npm run start:prod
```

Set `NODE_ENV=production`, `COOKIE_SECURE=true`, and a strong `JWT_SECRET`.
Configure the platform health check to use `/api/v1/health/ready`. See
[`../docs/DEPLOYMENT.md`](../docs/DEPLOYMENT.md) for Atlas, host, and security
details.
