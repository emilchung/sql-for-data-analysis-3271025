# Calorie Snap

A mobile-friendly PWA for logging daily food intake by photo. Snap a picture of
your meal, Claude identifies the food items and estimates portion sizes, the
USDA FoodData Central database supplies calorie data, and everything is
tallied into a running daily total. All logs stay on your device (IndexedDB) —
there is no account and no server-side storage.

## How it works

1. **Client** (`client/`) — a Vite + React PWA. Take/upload a photo, review
   the identified items (editable portion sizes, manual calorie entry for
   anything the database can't match), then save the entry to your local log.
2. **Server** (`server/`) — a thin Express proxy with one endpoint,
   `POST /api/analyze`. It sends your photo to Claude (vision) to identify
   food items and estimate grams, then looks up calories per 100g for each
   item from USDA FoodData Central. No image or log data is stored server-side.

## Setup

### 1. Server

```bash
cd server
cp .env.example .env
# edit .env and set ANTHROPIC_API_KEY (required)
# USDA_API_KEY is optional — falls back to the rate-limited public DEMO_KEY
npm install
npm run dev
```

Runs on `http://localhost:3001`.

### 2. Client

```bash
cd client
npm install
npm run dev
```

Runs on `http://localhost:5173` and proxies `/api/*` to the server. Open it
on your phone (same Wi-Fi network, use your machine's LAN IP) to test the
camera capture flow, or use `npm run build && npm run preview` to try the
installable PWA build.

### Installing on your phone

Once the client is deployed somewhere reachable from your phone (over HTTPS —
required for camera access and PWA install), open it in your mobile browser
and choose "Add to Home Screen" (iOS Safari) or "Install app" (Android
Chrome). It will then launch full-screen like a native app.

## Notes / next steps

- Calorie estimates are approximate — they depend on Claude's visual portion
  estimate and the closest USDA database match. Treat them as a helpful
  ballpark, not medical-grade accuracy.
- Logs are stored only in the browser's IndexedDB, so they don't sync across
  devices or survive clearing site data. Swapping in a backend (e.g.
  Supabase) later would just mean replacing `client/src/db.js`.
- Deploying the server exposes your `ANTHROPIC_API_KEY`/`USDA_API_KEY` only
  to your own backend, never to the client — keep it that way if you host
  this publicly.
