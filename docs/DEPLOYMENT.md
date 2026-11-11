# Production deployment playbook

This document describes a safe deployment of the SLR frontend and backend. It
is platform-agnostic, with notes for common hosts. The architecture expects:

- One publicly reachable **Next.js** server that serves pages and proxies
  `/api/v1/*` to the API.
- One **NestJS** process that talks to MongoDB Atlas.
- No direct browser-to-API traffic. The same-origin proxy keeps the login
  cookie first-party.

## 1. Pre-deployment checklist

- [ ] Node.js 24+ is available in the build and runtime environments.
- [ ] MongoDB Atlas cluster exists and a database user can read/write the app
      database.
- [ ] A production `JWT_SECRET` of at least 32 random characters is generated.
- [ ] A production `API_URL` value is chosen (the backend origin reachable from
      the frontend server).
- [ ] DNS and TLS certificates are ready for both public hostnames.
- [ ] Secrets are stored in the platform's secret manager, not in Git.

Generate a JWT secret locally, for example:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

## 2. MongoDB Atlas

1. Create the cluster and database (for example `slr`).
2. Create a dedicated database user with read/write access to that database.
3. Add network access:
   - For a backend with static egress IPs, allow only those IPs.
   - For serverless or dynamically addressed hosts, use the narrowest range
     that works. Atlas `0.0.0.0/0` is common for prototypes but should be paired
     with strong credentials and monitoring.
4. Copy the SRV connection string. It must start with `mongodb+srv://`.
5. Keep `MONGODB_DB_NAME` set to the database name (for example `slr`). The app
   passes it explicitly to Mongoose.

## 3. Backend deployment

### Build and run commands

Use the backend directory as the project root:

```bash
npm ci
npm run build
npm run seed        # run once per environment, idempotent
npm run start:prod  # node dist/main.js
```

`npm run seed` builds again before running the seed script. If your platform
runs build and release phases separately, run the seed as a one-off job after
the first successful deployment.

### Required production environment

```dotenv
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://app.example.com
JWT_SECRET=<at-least-32-random-characters>
JWT_EXPIRES_IN=7d
COOKIE_NAME=slr_access_token
COOKIE_SECURE=true
TRUST_PROXY=1
BCRYPT_SALT_ROUNDS=12
THROTTLE_TTL_MS=60000
THROTTLE_LIMIT=100
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/slr?retryWrites=true&w=majority
MONGODB_DB_NAME=slr
```

Notes:

- `CORS_ORIGIN` accepts a comma-separated list. Include every frontend origin
  that talks to the API, including preview domains if needed.
- `COOKIE_SECURE=true` is required for HTTPS. The browser receives the cookie
  from the HTTPS frontend proxy, so the internal API-to-proxy hop may still be
  HTTP.
- Changing `JWT_SECRET` invalidates all existing sessions.
- Set `TRUST_PROXY` to the number of trusted proxy hops in front of the API
  (usually `1`) so rate limiting uses the real client IP. Leave it at `0` when
  the API is directly exposed.
- The global rate limit is 100 requests/minute; register, login, and contact
  have a stricter 10 requests/minute limit.

### Health checks

- Liveness: `GET /api/v1/health`
- Readiness: `GET /api/v1/health/ready` (pings MongoDB)

Configure the platform health check to use `/api/v1/health/ready`.

### Render example

- Environment: Node
- Root directory: `backend`
- Build command: `npm ci && npm run build`
- Start command: `npm run start:prod`
- Health check path: `/api/v1/health/ready`
- Add all environment variables above in the Render dashboard.
- Run `npm run seed` once from a shell/job after the first deploy.

### Railway / Fly.io / VM

The same build and start commands apply. On a VM, run the API under a process
manager (systemd, PM2, or a container) and put a TLS reverse proxy in front of
the frontend only. If the API is also public, terminate TLS there and keep
`COOKIE_SECURE=true`.

## 4. Frontend deployment

### Build and run commands

Use the frontend directory as the project root:

```bash
npm ci
API_URL=https://api.example.com npm run build
API_URL=https://api.example.com npm run start
```

On PowerShell:

```powershell
$env:API_URL = "https://api.example.com"
npm ci
npm run build
npm run start
```

The frontend listens on `3000` by default.

### Why `API_URL` matters twice

`frontend/next.config.mjs` compiles the rewrite destination into the build:

```text
/api/v1/:path*  ->  ${API_URL}/api/v1/:path*
```

Server components also read `process.env.API_URL` at request time. Therefore:

- Set `API_URL` **when building** so the proxy points at the right backend.
- Keep the same `API_URL` **in the runtime environment** for server-side data
  fetching.
- Rebuild after changing `API_URL`.

### Vercel example

- Import the repository and set the project root to `frontend`.
- Framework preset: Next.js.
- Build command: `npm run build`.
- Add `API_URL` to Production and Preview environments before building.
- The backend must be reachable from Vercel's servers over the public internet.
- If the backend cold-starts, the first proxied request can be slow.

### Self-hosted Node example

```bash
cd frontend
npm ci
API_URL=https://api.example.com npm run build
PORT=3000 API_URL=https://api.example.com npm run start
```

Put Nginx, Caddy, or another TLS terminator in front of port 3000. The public
hostname must match the origin placed in the backend `CORS_ORIGIN`.

## 5. Deploy order

1. Configure Atlas and network access.
2. Deploy the backend with production environment variables.
3. Verify `/api/v1/health/ready`.
4. Run the seed job once.
5. Build and deploy the frontend with `API_URL` pointing at the backend.
6. Verify the catalog pages load.
7. Verify register, login, `/users/me`, logout, and contact submission.
8. Point DNS at the frontend and confirm HTTPS.

## 6. Post-deployment smoke tests

Replace the hostnames with real values.

```bash
curl -fsS https://api.example.com/api/v1/health
curl -fsS https://api.example.com/api/v1/health/ready
curl -fsS "https://api.example.com/api/v1/courses?limit=100"
curl -fsS "https://api.example.com/api/v1/search?q=dbms"
```

Through the frontend proxy:

```bash
curl -fsS "https://app.example.com/api/v1/courses?limit=100"
curl -fsS "https://app.example.com/explore"
```

Auth flow:

```bash
curl -i -c cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"name":"Smoke Test","email":"smoke@example.com","password":"StrongPass123!"}' \
  https://app.example.com/api/v1/auth/register

curl -i -b cookies.txt https://app.example.com/api/v1/users/me
curl -i -b cookies.txt -X POST https://app.example.com/api/v1/auth/logout
curl -i -b cookies.txt https://app.example.com/api/v1/users/me   # expect 401
```

Remove smoke-test accounts and contact messages from the production database
when finished.

## 7. Security checklist

- [ ] `NODE_ENV=production`.
- [ ] `JWT_SECRET` is random, at least 32 characters, and stored as a secret.
- [ ] `COOKIE_SECURE=true` and the frontend is served over HTTPS.
- [ ] `CORS_ORIGIN` lists only trusted frontend origins.
- [ ] Atlas network access is as narrow as practical.
- [ ] Database user has least privilege.
- [ ] Helmet, validation, and rate limiting remain enabled.
- [ ] Dependencies are audited before release (`npm audit --omit=dev` for the
      backend).
- [ ] Logs do not contain passwords, tokens, cookies, or connection strings.
- [ ] Atlas backups are enabled.

## 8. CI commands

A minimal pipeline can run these jobs independently.

Backend:

```bash
cd backend
npm ci
npm run lint
npm test
npm run build
```

E2E is optional in CI. It downloads a `mongod` binary on first run and can add a
minute or two:

```bash
npm run test:e2e
```

Frontend:

```bash
cd frontend
npm ci
npm run lint
API_URL=https://api.example.com npm run build
```

No CI configuration files are committed in this repository; wire these commands
into the provider of your choice.

## 9. Rollback

- Backend: redeploy the previous release and restart. The schema is managed by
  Mongoose, so there are no migration files to reverse.
- Frontend: redeploy the previous build. If the backend origin changed, rebuild
  with the previous `API_URL`.
- Seed: the seed uses upserts keyed by slug, so re-running it is safe and does
  not duplicate catalog records.
- Sessions: rotating `JWT_SECRET` logs every user out immediately.

## 10. Known production gaps

- No admin CRUD for catalog data; use the seed or database tooling.
- No object storage or upload pipeline for resources.
- Contact messages are stored only; add an admin inbox or email notification if
  needed.
- No refresh-token rotation; the JWT cookie is the session lifetime.
- No structured log shipping or tracing; add NestJS Observe or your provider's
  telemetry before operating at scale.
