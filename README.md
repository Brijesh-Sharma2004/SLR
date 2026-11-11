# Smart Learning Resource (SLR)

A full-stack learning-resource platform for university courses. Students browse
courses, drill into subjects, search for notes and question papers, play video
lectures, create an account, and send contact messages.

- **Frontend:** Next.js 16 App Router, React 19, Tailwind CSS 4
- **Backend:** NestJS 12, Mongoose 9, MongoDB Atlas
- **Auth:** JWT in an httpOnly cookie, bcrypt password hashing

## Repository layout

```text
SLR/
├── backend/                 NestJS API
│   ├── src/
│   │   ├── auth/            register, login, logout, JWT guard
│   │   ├── users/           /users/me profile endpoints
│   │   ├── courses/         course catalog
│   │   ├── subjects/        subjects and nested resources
│   │   ├── resources/       resource catalog and filters
│   │   ├── search/          grouped course/subject/resource search
│   │   ├── contact/         contact-message submission
│   │   ├── database/        Mongoose schemas and connection
│   │   ├── seed/            idempotent seed script
│   │   └── health/          liveness and readiness checks
│   └── test/                Jest + Supertest E2E tests
├── frontend/                Next.js application
│   └── src/
│       ├── app/             routes (catalog, search, auth, contact)
│       ├── components/      shared UI
│       ├── context/         cookie-session auth context
│       └── lib/             API clients and error helpers
└── docs/
    └── DEPLOYMENT.md        production deployment playbook
```

## Architecture

```text
Browser
  │
  ├── page requests ──────────────► Next.js server
  │                                   │
  │                                   ├── server components ──► NestJS API (API_URL)
  │                                   │
  └── /api/v1/* requests ───────────► Next.js rewrite ────────► NestJS API
                                                                     │
                                                                     ▼
                                                              MongoDB Atlas
```

- Catalog pages fetch on the server with `cache: "no-store"` inside Suspense
  boundaries, so fresh data is streamed at request time.
- Browser auth and contact requests go to the same-origin `/api/v1` path. The
  Next.js rewrite proxies them to NestJS, which keeps the httpOnly login cookie
  first-party for the frontend origin.
- The rewrite destination is compiled into the Next.js build. Set `API_URL`
  before `npm run build` **and** keep it available at runtime for server-side
  fetches.

## Prerequisites

- Node.js 24+ and npm 11+
- A MongoDB Atlas cluster (or another MongoDB instance)
- Two free local ports: `3001` for the API and `3000` for the frontend

## Quick start

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

On PowerShell, use `Copy-Item .env.example .env` instead of `cp`.

Edit `backend/.env` and set at least:

```dotenv
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/slr?retryWrites=true&w=majority
MONGODB_DB_NAME=slr
JWT_SECRET=<a random string of at least 32 characters>
```

Then seed and start:

```bash
npm run seed
npm run start:dev
```

- API: <http://localhost:3001/api/v1>
- Swagger UI: <http://localhost:3001/api/docs>
- Readiness: <http://localhost:3001/api/v1/health/ready>

The seed is idempotent and creates 2 courses, 6 subjects, and 4 resources.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

On PowerShell, use `Copy-Item .env.example .env.local` instead of `cp`.

Open <http://localhost:3000>. `frontend/.env.example` sets:

```dotenv
API_URL=http://localhost:3001
```

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Default | Notes |
| --- | --- | --- | --- |
| `NODE_ENV` | yes | `development` | `development`, `production`, or `test` |
| `PORT` | yes | `3001` | API port |
| `CORS_ORIGIN` | yes | `http://localhost:3000` | Comma-separated allowed origins |
| `JWT_SECRET` | yes | — | Minimum 32 characters |
| `JWT_EXPIRES_IN` | yes | `7d` | Token and cookie lifetime |
| `COOKIE_NAME` | yes | `slr_access_token` | httpOnly cookie name |
| `COOKIE_SECURE` | yes | `false` | Set `true` behind HTTPS |
| `TRUST_PROXY` | no | `0` | Trusted reverse-proxy hops; set `1` behind one proxy |
| `BCRYPT_SALT_ROUNDS` | yes | `12` | Allowed range: 10–15 |
| `THROTTLE_TTL_MS` | yes | `60000` | Global rate-limit window |
| `THROTTLE_LIMIT` | yes | `100` | Requests per window |
| `MONGODB_URI` | yes | — | Must start with `mongodb://` or `mongodb+srv://` |
| `MONGODB_DB_NAME` | yes | `slr` | Database name used by Mongoose |

### Frontend (`frontend/.env.local`)

| Variable | Required | Default | Notes |
| --- | --- | --- | --- |
| `API_URL` | yes | `http://localhost:3001` | Backend origin used by rewrites and server fetches |

`frontend/.env.example` is committed; real `.env*` files are ignored.

## API reference

Base URL: `http://localhost:3001/api/v1`

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | no | API liveness |
| `GET` | `/health/ready` | no | API + MongoDB readiness |
| `POST` | `/auth/register` | no | Create account and start session |
| `POST` | `/auth/login` | no | Start session |
| `POST` | `/auth/logout` | no | Clear session cookie |
| `GET` | `/users/me` | cookie | Current user profile |
| `PATCH` | `/users/me` | cookie | Update current user name |
| `GET` | `/courses?page=&limit=` | no | Paginated courses with subject counts |
| `GET` | `/courses/:slug` | no | Course detail with subjects |
| `GET` | `/subjects?course=&page=&limit=` | no | Paginated subjects, filter by course slug |
| `GET` | `/subjects/:slug` | no | Subject detail with resources |
| `GET` | `/resources?subject=&type=&q=&page=&limit=` | no | Paginated resources with filters |
| `GET` | `/resources/:idOrSlug` | no | Resource by Mongo ID or slug |
| `GET` | `/search?q=&limit=` | no | Grouped course/subject/resource search |
| `POST` | `/contact` | no | Store a contact message |

`limit` is capped at 100 for pagination and 20 for search. `type` is `PDF` or
`VIDEO`. Swagger at `/api/docs` is the source of truth for request schemas.

### Response format

Single resources:

```json
{ "data": { "id": "...", "slug": "..." } }
```

Paginated lists:

```json
{
  "data": [],
  "meta": { "page": 1, "limit": 20, "total": 0, "totalPages": 0 }
}
```

Search:

```json
{
  "data": { "courses": [], "subjects": [], "resources": [] },
  "meta": { "query": "dbms", "limit": 5, "total": 0 }
}
```

Errors:

```json
{
  "statusCode": 400,
  "message": ["email must be an email"],
  "error": "Bad Request",
  "path": "/api/v1/contact",
  "timestamp": "2026-11-09T00:00:00.000Z"
}
```

## Authentication flow

1. `POST /auth/register` or `POST /auth/login` returns the public user and sets
   `slr_access_token` as an httpOnly, `SameSite=Lax` cookie.
2. The browser calls same-origin `/api/v1/users/me`; the Next.js proxy forwards
   the cookie to NestJS.
3. `POST /auth/logout` clears the cookie, and the client clears local user state.
4. Protected API routes accept the cookie or an `Authorization: Bearer <token>`
   header.

Cookies are not scoped by port, but they are scoped by site. The same-origin
proxy is what keeps the session first-party in production. Do not point the
browser directly at a different backend origin unless you also change cookie
settings (`SameSite=None; Secure`) and CORS.

## Testing and quality

### Backend

```bash
cd backend
npm run lint
npm test          # unit tests
npm run test:e2e  # API integration tests
npm run build
```

E2E tests use `mongodb-memory-server`, so they do not need Atlas. The first run
downloads a `mongod` binary and can take longer than later runs.

Current coverage includes health, auth/session lifecycle, users, catalog,
search, and contact validation.

### Frontend

```bash
cd frontend
npm run lint
npm run build
```

## Deployment

The production playbook is in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). In short:

1. Create the Atlas database, allow network access from the API host, and keep
   the connection string in the API host's secret store.
2. Build and run the backend with `NODE_ENV=production`, a strong
   `JWT_SECRET`, `COOKIE_SECURE=true`, and `CORS_ORIGIN` set to the frontend
   origin.
3. Run `npm run seed` once against the production database.
4. Build the frontend with `API_URL` set to the backend origin, then run
   `npm run start` (or deploy to Vercel with the same build-time variable).
5. Verify `/api/v1/health/ready` and the login/logout flow after deployment.

## Troubleshooting

**Atlas connection errors**

- Confirm the cluster's IP access list includes the API host.
- Confirm `MONGODB_URI`, the database user password, and `MONGODB_DB_NAME`.
- Check `/api/v1/health/ready`; it pings MongoDB.

**Frontend shows 500 or empty catalog**

- Confirm the backend is running and `API_URL` points to it.
- Rebuild the frontend after changing `API_URL`; rewrites are compiled at build.
- Confirm the catalog was seeded with `npm run seed`.

**Login succeeds but `/users/me` returns 401**

- Confirm requests go through the same-origin `/api/v1` proxy.
- In production, confirm `COOKIE_SECURE=true` and the site is served over HTTPS.
- Check that `CORS_ORIGIN` matches the frontend origin exactly.

**Port already in use**

- Change `PORT` in `backend/.env`, or stop the process using the port.
- For the frontend, run `npm run dev -- -p 3002` and update `CORS_ORIGIN`.

**E2E tests time out on first run**

- The memory server is downloading `mongod`. Re-run once the download finishes.
- The test app uses a 60-second launch timeout and a smaller WiredTiger cache.

## Known limitations

- Catalog data is managed by the seed script; there is no admin CRUD UI.
- Profile editing is read-only in the UI; course selection is not implemented.
- Contact messages are stored, but there is no admin inbox or email notification.
- Uploaded resources are served from `frontend/public/resources`; no object
  storage or upload pipeline is implemented.
- There are no refresh tokens; the session is a single seven-day JWT cookie.

## License

Private project. Add a license before distributing.
