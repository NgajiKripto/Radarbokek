<div align="center">

# 🛞 Radar Bokek

### Platform Hyperlocal untuk Pedagang Keliling

**Hubungkan perut lapar dengan roda UMKM**

[Lihat Demo](https://radarbokek.vercel.app) · [Report Bug](https://github.com/NgajiKripto/Radarbokek/issues) · [Request Feature](https://github.com/NgajiKripto/Radarbokek/issues)

---

![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=for-the-badge)
![Built with](https://img.shields.io/badge/built_with-Vite-646CFF?style=for-the-badge&logo=vite)
![PWA Ready](https://img.shields.io/badge/PWA-ready-5A0FC8?style=for-the-badge)

</div>

---

## 🎯 Apa itu Radar Bokek?

**Radar Bokek** adalah platform hyperlocal PWA yang menghubungkan **pembeli** dengan **pedagang keliling** di sekitar mereka secara real-time.

Bayangkan: kamu lapar, tapi tidak tahu gerobak bakso langganan ada di mana. Atau kamu pedagang keliling yang butuh jangkauan pembeli lebih luas. **Radar Bokek menyelesaikan masalah ini.**

> *"Hubungkan perut lapar dengan roda UMKM"*

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| 🗺️ **Peta Real-time** | Pantau lokasi pedagang keliling secara live di peta interaktif |
| 📱 **PWA** | Tanpa install, langsung dari browser — ringan & cepat |
| 👥 **Dual Role** | Mode **Buyer** (pembeli) & **Merchant** (pedagang) dalam satu platform |
| ⚡ **SSE Streaming** | Update lokasi real-time tanpa perlu refresh halaman |
| 🔥 **Heatmap** | Rekomendasi lokasi ramai berdasarkan data pedagang |
| 💰 **Wallet Digital** | Top-up & transaksi cashless untuk kemudahan bertransaksi |
| 📴 **Offline Support** | Tetap bisa akses data tanpa koneksi internet |
| 🔒 **Autentikasi Aman** | JWT + bcrypt + CSRF protection |

---

## 🖼️ Screenshot

<div align="center">

| Landing Page | Peta Real-time | Dashboard Pedagang |
|:------------:|:--------------:|:------------------:|
| ![Landing](https://via.placeholder.com/300x500/1a1a1a/terakota?text=Landing+Page) | ![Map](https://via.placeholder.com/300x500/1a1a1a/terakota?text=Peta+Real-time) | ![Dashboard](https://via.placeholder.com/300x500/1a1a1a/terakota?text=Dashboard) |

</div>

---

## 🛠️ Tech Stack

<div align="center">

| Layer | Technology |
|:-----:|------------|
| **Frontend** | Vanilla JavaScript, Vite, Tailwind CSS |
| **Backend** | Express.js 5, PostgreSQL + PostGIS |
| **Real-time** | Server-Sent Events (SSE) |
| **Auth** | JWT + bcrypt + CSRF |
| **PWA** | Service Worker, Web App Manifest |
| **Deploy** | Vercel (Frontend) · VPS + PM2 (Backend) |

</div>

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- PostgreSQL dengan PostGIS extension
- npm atau yarn

### Installation

```bash
# 1. Clone repo
git clone https://github.com/NgajiKripto/Radarbokek.git
cd Radarbokek

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env dengan kredensial database kamu

# 4. Jalankan migrasi database
npm run migrate

# 5. Start development server
npm run dev      # Frontend → http://localhost:5173
npm run server   # Backend → http://localhost:3000
```

---

## ⚙️ Environment Variables

| Variable | Deskripsi | Contoh |
|----------|-----------|--------|
| `DATABASE_URL` | Koneksi PostgreSQL | `postgresql://user:pass@localhost:5432/radarbokek` |
| `JWT_SECRET` | Secret key untuk JWT (min 32 chars) | `your-random-secret-key-here` |
| `JWT_EXPIRES_IN` | Masa berlaku token | `7d` |
| `WEBHOOK_SECRET` | Secret untuk payment gateway | `your-webhook-secret` |
| `PORT` | Port backend | `3000` |
| `CORS_ORIGIN` | Origin yang diizinkan | `http://localhost:5173` |

---

## 📁 Struktur Project

```
radarbokek/
├── 📂 public/              # Static assets
│   ├── icons/              # App icons (PWA)
│   ├── uploads/            # User uploads
│   ├── manifest.json       # PWA manifest
│   └── sw.js               # Service Worker
│
├── 📂 server/              # Backend API
│   ├── routes/             # API endpoints
│   ├── middleware/          # Auth, CSRF, sanitasi
│   ├── db/                 # Database & migrasi
│   └── services/           # SSE, heartbeat, quota
│
├── 📂 src/                 # Frontend source
│   ├── components/         # UI components
│   ├── pages/              # Halaman
│   ├── lib/                # Utilities
│   ├── styles/             # CSS (Tailwind + custom)
│   └── config/             # Constants
│
├── 📄 index.html           # Entry point
├── 📄 vite.config.js       # Vite config
├── 📄 tailwind.config.js   # Tailwind config
└── 📄 package.json
```

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/api/auth/register` | Registrasi user baru |
| `POST` | `/api/auth/login` | Login |
| `GET` | `/api/auth/me` | Get current user |

### Buyer
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/buyer/vendors` | List vendor terdekat |
| `GET` | `/api/buyer/heatmap` | Data heatmap |
| `POST` | `/api/buyer/topup` | Top-up wallet |

### Merchant
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/api/merchant/location` | Update lokasi |
| `PUT` | `/api/merchant/profile` | Update profil |
| `GET` | `/api/merchant/stats` | Statistik penjualan |

### Real-time
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/sse/stream` | SSE stream lokasi vendor |

---

## 🚢 Deploy

### Frontend → Vercel

1. Push kode ke GitHub
2. Connect repo di [vercel.com](https://vercel.com)
3. Settings:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Deploy!

### Backend → VPS

```bash
# Install PM2
npm install -g pm2

# Jalankan server
pm2 start server/index.js --name radarbokek

# Auto-start saat reboot
pm2 startup
pm2 save

# Monitor
pm2 monit
```

**Nginx reverse proxy:**
```nginx
server {
    listen 80;
    server_name api.radarbokek.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```

---

## 🤝 Kontribusi

Kontribusi sangat dipersilakan! 

1. Fork repo ini
2. Buat branch baru (`git checkout -b feature/amazing-feature`)
3. Commit perubahan (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Buka Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">

### Dibuat dengan ❤️ untuk UMKM Indonesia

**[radarbokek.vercel.app](https://radarbokek.vercel.app)**

---

⭐ Star repo ini jika kamu merasa terbantu!

</div>
