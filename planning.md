# RADAR BOKEK — Implementation Plan

> PWA hyperlocal untuk pedagang keliling & pembeli
> Stack: **Vanilla JS + Tailwind CSS + Leaflet.js + Node.js (Express/Fastify) + PostgreSQL/PostGIS + SSE**

---

## Phase 0: Project Scaffolding

**Goal:** Struktur folder, config, build tool, PWA manifest

```
radarbokek/
├── public/
│   ├── index.html
│   ├── manifest.json
│   ├── sw.js                    (Service Worker)
│   ├── icons/                   (PWA icons 192px, 512px)
│   └── assets/
├── src/
│   ├── app.js                   (Router SPA + entry)
│   ├── styles/
│   │   ├── tokens.css           (Design tokens dari design.md)
│   │   ├── base.css             (Reset + global)
│   │   └── components.css
│   ├── pages/
│   │   ├── landing.js           (/)
│   │   ├── map.js               (/map)
│   │   ├── dashboard.js         (/merchant/dashboard)
│   │   ├── profile.js           (/merchant/profile)
│   │   └── topup.js             (/merchant/topup)
│   ├── components/
│   │   ├── bottom-nav.js
│   │   ├── top-app-bar.js
│   │   ├── vendor-card.js
│   │   ├── vendor-marker.js
│   │   ├── search-bar.js
│   │   ├── filter-capsules.js
│   │   └── offline-banner.js
│   ├── lib/
│   │   ├── router.js            (SPA router hash-based)
│   │   ├── geolocation.js       (watchPosition wrapper)
│   │   ├── haversine.js         (Distance calc)
│   │   ├── wake-lock.js         (Screen Wake Lock API)
│   │   ├── sse-client.js        (SSE consumer)
│   │   ├── offline-queue.js     (IndexedDB queue)
│   │   ├── auth.js              (JWT storage + refresh)
│   │   └── sanitizer.js         (Input sanitization)
│   └── config/
│       └── constants.js         (API base URL, radius, quota)
├── server/
│   ├── index.js                 (Express/Fastify entry)
│   ├── routes/
│   │   ├── auth.js              (POST /auth/register, /auth/login)
│   │   ├── buyer.js             (GET /buyer/radar, POST /buyer/review)
│   │   ├── merchant.js          (POST /merchant/radar/ping, PUT /merchant/radar/toggle, PUT /merchant/profile)
│   │   ├── wallet.js            (POST /merchant/wallet/topup)
│   │   └── webhook.js           (POST /webhooks/payment/qris-callback)
│   ├── middleware/
│   │   ├── auth.js              (JWT verify)
│   │   ├── throttle.js          (Rate limiter 10s per ping)
│   │   ├── sanitize.js          (XSS prevention)
│   │   └── cors.js
│   ├── services/
│   │   ├── sse-broadcast.js     (SSE hub + geo-filter)
│   │   ├── quota-manager.js     (Free 3h countdown logic)
│   │   └── heartbeat-monitor.js (15min timeout auto-hide)
│   ├── db/
│   │   ├── pool.js              (pg Pool connection)
│   │   ├── migrations/          (SQL schema files)
│   │   └── queries/
│   │       ├── spatial.sql      (ST_DWithin query)
│   │       └── upsert-location.sql
│   └── config/
│       └── env.js
├── package.json
├── vite.config.js               (Build tool)
└── .env.example
```

---

## Phase 1: MVP — Fitur Inti (~44-57 jam)

### 1.1 Database Setup (PostgreSQL + PostGIS) — 4-6h
- [ ] Install PostGIS extension
- [ ] Create tables: `users`, `merchants`, `merchant_radar_signals`, `reviews`
- [ ] Create GIST spatial index on `current_location`
- [ ] Create composite index on `is_radar_active`
- [ ] Implement RLS policies
- [ ] Seed sample data

### 1.2 Auth Module — 4-5h
- [ ] `POST /auth/register` — email + password (bcrypt) + role
- [ ] `POST /auth/login` — return JWT token
- [ ] Frontend: localStorage token, role-based redirect
- [ ] Input sanitization: email validation, password min 8 char

### 1.3 Landing Page (`/`) — 3-4h
- [ ] Role selection: "Saya Pembeli" → `/map`, "Saya Pedagang" → auth check → dashboard
- [ ] Design: Modern Brutalism, asymmetric card layout (buyer 65% / merchant 35%)
- [ ] Bottom nav: 3 slots (Cari, Jualan, Profil)

### 1.4 Buyer Discovery Map (`/map`) — 8-10h
- [ ] Leaflet.js init with CartoDB Positron tile layer
- [ ] `navigator.geolocation.getCurrentPosition()` → center map
- [ ] `GET /buyer/radar?lat=&lon=` → fetch vendors within 2km
- [ ] Render custom markers (3 types: free/standard, pro with pulse, muted for fast-moving)
- [ ] Bottom sheet vendor card: name, category, rating, distance (Haversine), price, payment tags
- [ ] Search bar + filter capsules (Semua, Bisa QRIS, Lagi Mangkal, Terdekat)

### 1.5 Merchant Dashboard (`/merchant/dashboard`) — 8-10h
- [ ] Toggle switch "MULAI BERKELILING" → `PUT /merchant/radar/toggle`
- [ ] Countdown timer: free tier 3h quota, decrements only when active
- [ ] Status buttons: "🚴 Lagi Jalan" / "🛑 Lagi Mangkal"
- [ ] Wake Lock API integration on toggle ON
- [ ] `watchPosition()` → delta > 15m → `POST /merchant/radar/ping` (throttled 10s)

### 1.6 Merchant Profile (`/merchant/profile`) — 4-5h
- [ ] Form: business_name (max 40), category dropdown, price_baseline, menu_spanduk_url upload
- [ ] `PUT /merchant/profile`
- [ ] XSS sanitization on all inputs

### 1.7 Real-Time SSE Broadcast — 6-8h
- [ ] Server: SSE endpoint `/api/v1/events/radar?lat=&lon=`
- [ ] On merchant ping → PostGIS upsert → broadcast to active buyers in 2km radius
- [ ] Client: `EventSource` connection, update markers in real-time
- [ ] Geo-hashing filter: only send to relevant buyers

### 1.8 Offline Resilience — 5-6h
- [ ] Service Worker: Cache-First for static assets
- [ ] IndexedDB queue for failed location pings
- [ ] Background Sync API: flush queue on reconnect
- [ ] Offline banner component for merchant
- [ ] Server: heartbeat monitor, auto-hide after 15min no ping

### 1.9 PWA Manifest + Service Worker — 2-3h
- [ ] `manifest.json`: name, icons, theme_color, display: standalone
- [ ] `sw.js`: precache app shell, runtime cache for tiles

---

## Phase 2: Komersialisasi (~20-25 jam) ✅ COMPLETE

### 2.1 Review System — 4-5h ✅
- [x] `POST /buyer/review` — rating 1-5 + comment (max 200 char)
- [x] Rate limit: 1 review per buyer per merchant per 2 hours (DB query check, not generic throttle)
- [x] Display: ★ 4.8 (50 Ulasan) on vendor card (Pro tier only)

### 2.2 Coin/Token Wallet System — 5-6h ✅
- [x] `merchants.coin_balance` field (in schema)
- [x] Tier activation: Free (3h free), Standard (Rp1.500/24h), Pro (Rp2.500/24h)
- [x] Auto-deduct on tier activation (POST /merchant/tier/activate)
- [x] Non-refundable token logic (warning in dashboard + topup page)

### 2.3 QRIS Top-Up Page (`/merchant/topup`) — 5-6h ✅
- [x] Display QRIS Radar Bokek via qrserver.com API
- [x] `POST /merchant/wallet/topup` → save pending transaction to DB
- [x] `POST /webhooks/payment/qris-callback` → verify → update coin_balance (1 koin = Rp1.000)
- [x] Minimum Rp10.000

### 2.4 Pro Features — 3-4h ✅
- [x] QRIS Tip personal field on profile
- [x] Verified Pro badge on marker (red marker + "PRO" label overlay)
- [x] Priority rendering (Pro > Standard > Free in query ORDER BY)

### 2.5 Velocity Alert — 3-4h ✅
- [x] Detect speed > 20km/h from GPS `speed` property
- [x] Merchant: warning bar "Melaju terlalu cepat (&gt;20 km/jam)!"
- [x] Server: update `status_gerak = 'melaju_cepat'` on ping
- [x] Buyer: marker opacity 40% + label "Melaju Cepat"

### Additional Phase 2 additions:
- [x] `GET /merchant/dashboard` — return coin_balance, tier, quota, radar state
- [x] `POST /merchant/tier/activate` — deduct coins, set tier
- [x] `POST /merchant/tier/downgrade` — return to free
- [x] `payment_transactions` table (migration 002)
- [x] Webhook credits coin_balance with 1:1000 conversion
- [x] Heartbeat monitor auto-starts on server boot
- [x] SSE route integrated with sse-broadcast geo-filter

---

## Phase 3: Skalabilitas (~15-22 jam) ✅ COMPLETE

### 3.1 Image Compression Client-Side — 3-4h ✅
- [x] Compress menu spanduk before upload (Canvas API → WebP, max 800px, quality 0.7)
- [x] Client-side validation: file type, max 5MB
- [x] Preview with compression stats (savings %, dimensions)
- [x] `POST /merchant/upload` — multer-based image upload endpoint

### 3.2 Battery Saver Mode — 2-3h ✅
- [x] Reduce GPS frequency to 45s, distance threshold to 40m
- [x] Toggle in merchant dashboard (persists to localStorage)
- [x] GeolocationTracker API: `setBatterySaver(bool)`, auto-restarts watcher
- [x] Lower accuracy mode (enableHighAccuracy: false) when battery saver active

### 3.3 Predictive Route Suggestions — 10-15h ✅
- [x] `buyer_search_heatmap` table (migration 003) with spatial + time indexes
- [x] `POST /buyer/search-event` — anonymous search tracking (fire-and-forget from /map)
- [x] `GET /merchant/suggestions?lat=&lon=` — top 5 zones by time-of-day within 5km
- [x] Fallback to all-hours data when current hour has < 3 zones
- [x] `heatmap-suggestions.js` component — ranked zone cards with nav buttons
- [x] Integrated into merchant dashboard, loads after state fetch

---

## Security Checklist

| Area | Action |
|------|--------|
| SQL Injection | Parameterized queries (`$1`, `$2`) di semua query |
| XSS | Sanitize semua input, encode output, CSP header |
| IDOR | Cek ownership di setiap endpoint merchant |
| CSRF | SameSite cookie + Origin validation |
| JWT | Enforce RS256, validate `aud`, `iss`, `exp` |
| Rate Limit | 10s throttle per ping, 60 req/min public |
| File Upload | Allowlist ext (jpg/png), UUID filename, max 5MB |
| Headers | CSP, X-Frame-Options, HSTS, X-Content-Type-Options |
| Input | Max length enforcement, type validation |

---

## Design System Tokens

```css
:root {
  --color-primary: #FF5733;      /* Chili Red */
  --color-secondary: #FFE156;    /* Radar Yellow */
  --color-teal: #46A29F;         /* Teal Fresh */
  --color-ink: #1A1A1A;
  --color-surface: #F8F7F4;
  --font-display: 'Space Grotesk';
  --font-mono: 'JetBrains Mono';
}
```

- Font: **Space Grotesk** (headline + body), **JetBrains Mono** (label + data)
- Icon: **Material Symbols Outlined**
- Style: **Modern Brutalism** — 2px border-ink, hard shadow (4px 4px #1A1A1A)

---

## Execution Order

1. **Scaffold** — folder structure, vite config, tailwind, tokens CSS
2. **Database** — schema + migrations + seed data
3. **Auth** — register + login + JWT
4. **Landing** — role selection page
5. **Map (buyer)** — Leaflet + fetch vendors + markers + bottom sheet
6. **Dashboard (merchant)** — toggle + GPS + quota timer
7. **Profile** — form + upload
8. **SSE** — real-time broadcast
9. **Offline** — SW + IndexedDB + background sync
10. **Topup + Coins** — wallet + QRIS
11. **Reviews** — rating system
12. **Velocity Alert** — speed detection
13. **Polish** — PWA manifest, icons, testing

---

## API Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/register` | Public | Register user |
| POST | `/api/v1/auth/login` | Public | Login, get JWT |
| GET | `/api/v1/buyer/radar` | Public | Get nearby merchants (2km) |
| POST | `/api/v1/buyer/review` | Public* | Submit review (rate limited) |
| POST | `/api/v1/merchant/radar/ping` | Protected | Update merchant location |
| PUT | `/api/v1/merchant/radar/toggle` | Protected | Start/stop radar |
| PUT | `/api/v1/merchant/profile` | Protected | Update business profile |
| POST | `/api/v1/merchant/wallet/topup` | Protected | Request QRIS top-up |
| GET | `/api/v1/events/radar` | Public | SSE stream for buyers |
| POST | `/api/v1/webhooks/payment/qris-callback` | Server | Payment confirmation |

---

## Database Schema (Quick Reference)

```
users (id, email, password_hash, role, created_at)
merchants (id, business_name, category, price_baseline, menu_spanduk_url, qris_tip_destination, coin_balance, current_tier)
merchant_radar_signals (merchant_id, is_radar_active, current_location GEOGRAPHY, status_gerak, remaining_free_quota, last_updated_at)
reviews (id, merchant_id, buyer_id, rating, comment, created_at)
```

---

## Routes

| Route | Page | Access |
|-------|------|--------|
| `/` | Landing & role selection | Public |
| `/map` | Buyer discovery map | Public (anon) |
| `/merchant/dashboard` | Merchant control center | Protected |
| `/merchant/profile` | Business profile form | Protected |
| `/merchant/topup` | Coin top-up via QRIS | Protected |
