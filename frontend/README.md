# SLR Frontend

Next.js 16 App Router frontend for the Smart Learning Resource platform. It
renders the course catalog, subject pages, search results, authentication
screens, profile, and contact form.

The full-stack overview and API summary live in [`../README.md`](../README.md).
Production deployment is covered in
[`../docs/DEPLOYMENT.md`](../docs/DEPLOYMENT.md).

## Requirements

- Node.js 24+
- npm 11+
- The backend API running (default <http://localhost:3001>)

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

On PowerShell, use `Copy-Item .env.example .env.local`.

Open <http://localhost:3000>.

`.env.example` contains:

```dotenv
API_URL=http://localhost:3001
```

The backend must be seeded and running before catalog pages can return data.

## How the frontend talks to the API

- Server components call the backend directly through `src/lib/server-api.js`
  using `process.env.API_URL`.
- Browser requests use the same-origin path `/api/v1/*`.
- `next.config.mjs` rewrites `/api/v1/*` to `${API_URL}/api/v1/*`.
- The rewrite destination is built into the Next.js build. Set `API_URL`
  before `npm run build`, and keep the same value available at runtime.

Catalog pages fetch with `cache: "no-store"` inside Suspense boundaries, so the
data is streamed at request time. The app has Cache Components and partial
prefetching enabled.

## Routes

| Route | Description |
| --- | --- |
| `/` | Landing page with search |
| `/explore` | Course catalog |
| `/courses/[courseId]` | Course detail and subjects (slug) |
| `/subjects/[subjectId]` | Subject detail and resources (slug) |
| `/search?q=` | Grouped course/subject/resource results |
| `/login` | Login form |
| `/register` | Registration form |
| `/profile` | Protected profile page |
| `/contact` | Contact form |
| `/how-it-works` | Product walkthrough |

Course and subject links use backend slugs, not Mongo IDs.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

## API helpers

- `src/lib/api.js` — browser client using same-origin `/api/v1` with
  `credentials: "include"`.
- `src/lib/server-api.js` — server-only fetcher using `API_URL` and
  `cache: "no-store"`.
- `src/lib/api-errors.js` — shared `ApiError` and message helper.
- `src/context/AuthContext.jsx` — restores the cookie session via `/users/me`
  and exposes `login`, `register`, and `logout`.

## Testing and quality

```bash
npm run lint
npm run build
```

The build should pass without a running backend because catalog reads are
dynamic. If you change `API_URL`, rebuild before verifying the proxy.

## Deployment

```bash
npm ci
API_URL=https://api.example.com npm run build
API_URL=https://api.example.com npm run start
```

For Vercel, set the project root to `frontend` and add `API_URL` to the
Production and Preview environments before building. See
[`../docs/DEPLOYMENT.md`](../docs/DEPLOYMENT.md) for the full checklist,
including cookies, CORS, and Atlas networking.
