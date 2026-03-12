# SmarterStub MVP

SmarterStub is a polished mock MVP for a ticket comparison startup. Users can search once and compare event pricing across major marketplaces with fee-aware totals, trust cues, and best-value logic.

## What the app includes

- Landing page at `/` with hero search, featured events, provider trust section, how-it-works flow, waitlist capture, and FAQ
- Search results page at `/search` with sorting, filter chips, empty state, and realistic event cards
- Event detail page at `/event/[id]` with price comparison table, best-deal callouts, value logic, and seating-map placeholder

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Data + provider architecture

- Fallback catalog and provider metadata: [src/lib/fallback-data.ts](/Users/murguia/ticket-comparison/src/lib/fallback-data.ts)
- Smart ranking and scoring utilities: [src/lib/scoring.ts](/Users/murguia/ticket-comparison/src/lib/scoring.ts)
- Provider connectors: [src/lib/providers](/Users/murguia/ticket-comparison/src/lib/providers)
- Unified server-side orchestration: [src/lib/ticket-service.ts](/Users/murguia/ticket-comparison/src/lib/ticket-service.ts)
- Shared types: [src/types/index.ts](/Users/murguia/ticket-comparison/src/types/index.ts)

The app now uses a real provider integration architecture with mock fallbacks when providers are unavailable or credentials are missing.

## API routes

- `/api/search?q=`: server-side provider aggregation and normalized event search
- `/api/event?id=`: normalized event detail lookup by SmarterStub event id

Secrets remain server-side only. The UI routes do not receive provider credentials directly.

## Environment variables

Create `.env.local` from `.env.example` and set:

```bash
TICKETMASTER_API_KEY=your_ticketmaster_key
```

Optional future provider placeholders are already scaffolded:

```bash
SEATGEEK_CLIENT_ID=
SEATGEEK_CLIENT_SECRET=
STUBHUB_CLIENT_ID=
STUBHUB_CLIENT_SECRET=
```

Current connector status:

- `Ticketmaster`: implemented server-side search/detail connector using `TICKETMASTER_API_KEY`
- `SeatGeek`: scaffolded with TODOs for credentials/auth and normalization
- `StubHub`: scaffolded with TODOs for credentials/auth and normalization

If a provider is not configured or fails, SmarterStub falls back gracefully to the curated local catalog so the current UI keeps working.

## Deploy to Vercel

SmarterStub is ready to deploy on Vercel as a standard Next.js app.

### 1. Push the repo

Push this project to GitHub, GitLab, or Bitbucket. Vercel will import from there.

### 2. Create the Vercel project

In Vercel:

- Click `Add New...` -> `Project`
- Import this repository
- Keep the detected framework preset as `Next.js`

The default commands are correct:

- Install command: `npm install`
- Build command: `npm run build`
- Output directory: leave blank

### 3. Add environment variables

In `Project Settings` -> `Environment Variables`, add:

```bash
TICKETMASTER_API_KEY=your_ticketmaster_key
```

Optional placeholders for future connectors:

```bash
SEATGEEK_CLIENT_ID=
SEATGEEK_CLIENT_SECRET=
STUBHUB_CLIENT_ID=
STUBHUB_CLIENT_SECRET=
```

If `TICKETMASTER_API_KEY` is missing, the site still deploys and runs, but it will use fallback catalog data instead of Ticketmaster live data.

### 4. Deploy

Trigger the first production deployment from Vercel. After deployment:

- `/` should render statically
- `/search` and `/event/[id]` should work normally
- `/api/search` and `/api/event` will run as Vercel serverless functions

### 5. Recommended repo cleanup

This repo currently has generated directories tracked in Git, including `.next` and `node_modules`. They are now ignored, but if you want a clean deployment repo, untrack them before your next commit:

```bash
git rm -r --cached .next node_modules
git commit -m "Remove generated files from repository"
```

That cleanup is recommended, but not required for Vercel to build successfully.

## Future integration path

1. Replace synthetic listing generation with real marketplace inventory and fee payloads as provider access expands.
2. Add SeatGeek and StubHub auth flows and normalize their raw APIs into the shared `Event` and `Listing` model.
3. Persist saved searches, alerts, and favorites in a database and expose them through server actions or API routes.
4. Add background refresh jobs, cache invalidation, and alert triggers on normalized inventory changes.
