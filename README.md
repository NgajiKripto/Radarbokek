# Radar Bokek

Platform Hyperlocal PWA untuk Pedagang Keliling. Lacak pedagang keliling di sekitarmu secara real-time.

## Fitur

- **Peta Real-time** — Pantau lokasi pedagang keliling secara live
- **PWA** — Tanpa install, langsung dari browser
- **Dual Role** — Buyer (pembeli) & Merchant (pedagang)
- **SSE Streaming** — Update lokasi real-time tanpa refresh
- **Heatmap** — Rekomendasi lokasi ramai pedagang
- **Wallet** — Top-up & transaksi digital
- **Offline Support** — Tetap bisa akses tanpa koneksi

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Vanilla JS, Vite, Tailwind CSS |
| Backend | Express.js, PostgreSQL + PostGIS |
| Real-time | Server-Sent Events (SSE) |
| Auth | JWT + bcrypt |
| Deploy | Vercel (frontend), VPS (backend) |

## Setup

```bash
# Install dependencies
npm install

# Setup database
cp .env.example .env
# Edit .env dengan kredensial database
npm run migrate

# Jalankan development
npm run dev      # Frontend (port 5173)
npm run server   # Backend (port 3000)
```

## Environment Variables

Lihat `.env.example` untuk konfigurasi yang dibutuhkan.

## Struktur Project

```
├── public/           # Static assets (icons, manifest)
├── server/           # Backend API
│   ├── routes/       # API endpoints
│   ├── middleware/    # Auth, CSRF, sanitasi
│   ├── db/           # Database & migrasi
│   └── services/     # SSE, heartbeat, quota
├── src/              # Frontend
│   ├── components/   # UI components
│   ├── pages/        # Halaman
│   ├── lib/          # Utilities
│   ├── styles/       # CSS
│   └── config/       # Constants
└── vite.config.js
```

## Deploy

### Vercel (Frontend)
1. Connect repo GitHub ke Vercel
2. Build command: `npm run build`
3. Output directory: `dist`

### VPS (Backend)
```bash
# Install PM2
npm install -g pm2

# Jalankan server
pm2 start server/index.js --name radarbokek

# Setup reverse proxy (Nginx)
# Point domain ke port 3000
```

## License

MIT
