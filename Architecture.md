```markdown
# Technical Architecture Specification (Architecture.md)
## RADAR BOKEK — Platform Hyperlocal PWA untuk Pedagang Keliling
> Versi Dokumen: 1.0 (Production-Ready) | Pembaruan: Juli 2026

Dokumen ini mendefinisikan arsitektur sistem, aliran data geolokasi, strategi *offline-first*, dan topologi infrastruktur platform **Radar Bokek**[span_1](start_span)[span_1](end_span). Desain ini memprioritaskan efisiensi biaya operational server ($0 API Maps fee) dan keandalan tinggi pada perangkat seluler kelas bawah[span_2](start_span)[span_2](end_span).

---

## 1. Arsitektur Komponen Sistem (High-Level Architecture)

Radar Bokek menggunakan arsitektur decoupled berbasis **PWA (Client-Side Heavy)** dan **Event-Driven Backend Engine**.


```
┌────────────────────────────────────────────────────────────────────────┐
│                          CLIENT-SIDE (PWA)                             │
│                                                                        │
│   ┌─────────────────────────┐               ┌──────────────────────┐   │
│   │    Buyer Discovery      │               │  Merchant Dashboard  │   │
│   │  (Leaflet.js Rendering) │               │ (Screen Wake Lock)   │   │
│   └────────────▲────────────┘               └──────────┬───────────┘   │
│                │                                       │               │
│      Server-Sent Events (SSE)                    HTTP POST             │
│      (Real-time Live Stream)               (Throttled Deltas >15m)     │
│                │                                       │               │
└────────────────┼───────────────────────────────────────┼───────────────┘
│                                       │
┌────────────────┼───────────────────────────────────────▼───────────────┐
│                          BACKEND CORE SERVICES                         │
│                                                                        │
│   ┌─────────────────────────┐               ┌──────────────────────┐   │
│   │    Event Broadcast      │               │   Ingress Gateway    │   │
│   │     (Geo-Streaming)     │               │ (Validation/Throttle)│   │
│   └────────────▲────────────┘               └──────────┬───────────┘   │
│                │                                       │               │
│                └─────────────────┬─────────────────────┘               │
│                                  │                                     │
│                        Spatial Query Engine                            │
│                                  │                                     │
│                        ┌─────────▼─────────┐                           │
│                        │ PostgreSQL/PostGIS│                           │
│                        └───────────────────┘                           │
└────────────────────────────────────────────────────────────────────────┘
```

### 1.1 Layer Frontend (Client PWA)
* **PWA Engine:** Berbasis SPA (React/Vanilla JS) dengan manifestasi PWA penuh untuk kapabilitas *standalone install*[span_3](start_span)[span_3](end_span).
* **Service Worker:** Bertanggung jawab atas strategi *caching* aset statis (`Cache-First`) dan manajemen antrean sinkronisasi latar belakang (`Background Sync API`)[span_4](start_span)[span_4](end_span).
* **Mapping Engine (Leaflet.js):** Memanfaatkan Leaflet library (40 KB) untuk mengunduh raster tiles terkompresi dari *CartoDB Positron* secara asinkron[span_5](start_span)[span_5](end_span).
* **Local Storage Layer:** Menggunakan *IndexedDB* untuk penyimpanan antrean lokasi saat luring (*offline*)[span_6](start_span)[span_6](end_span).

### 1.2 Layer Backend (Server Engine)
* **Ingress API Gateway:** Menangani sanitasi data input, rate limiting, validasi JWT token, dan manajemen sesi[span_7](start_span)[span_7](end_span).
* **Spatial Processing Unit:** Layer yang bertugas mengonversi koordinat mentah menjadi tipe data PostGIS `GEOGRAPHY(Point, 4326)` sebelum disimpan[span_8](start_span)[span_8](end_span).
* **Event Broker / Broadcast Stream:** Membuka koneksi persisten satu arah menggunakan *Server-Sent Events* (SSE) untuk menyiarkan koordinat baru pedagang ke pembeli terdekat tanpa overhead protokol WebSockets[span_9](start_span)[span_9](end_span).

---

## 2. Aliran Data Geolokasi (Geolocation Data Flow)

Sistem memotong beban komputasi server dengan membagi tugas perhitungan jarak ke sisi klien[span_10](start_span)[span_10](end_span).


```
[Pedagang Bergerak]
│
▼
[navigator.geolocation.watchPosition()]
│
▼
[Evaluasi Delta Jarak Lokal] ────(Jarak < 15 meter)────► [Abaikan / Dropped]
│
(Jarak > 15 meter)
│
▼
[HTTP POST /api/v1/merchant/radar/ping]
│
▼
[Backend: Update Posisi & Cek Quota]
│
▼
[PostgreSQL: PostGIS Upsert & Indexing GIST]
│
▼
[SSE Server: Broadcast ke Pembeli Aktif di Radius 2 KM]
│
▼
[Pembeli Browser: map.distance() (Haversine Lokal)] ──► [Render di Peta Leaflet]
```

### 2.1 Efisiensi Biaya Komputasi ($0 Maps API Strategy)
1. **Peta Gratis:** Menggunakan OpenStreetMap via CartoDB Positron, mengeliminasi biaya lisensi rendering Google Maps per seribu *load*[span_11](start_span)[span_11](end_span).
2. **Kalkulasi Jarak Lokal:** Server **tidak pernah** menghitung jarak berbelok-belok jalan raya menggunakan API *routing*[span_12](start_span)[span_12](end_span). Server hanya bertugas melempar koordinat mentah[span_13](start_span)[span_13](end_span). Browser pembeli bertugas menghitung jarak garis lurus secara instan menggunakan fungsi bawaan Leaflet `map.distance()` berbasis **Formula Haversine**[span_14](start_span)[span_14](end_span).

---

## 3. Strategi Ketahanan Jaringan (Offline-First Architecture)

Menghadapi masalah *blank spot* sinyal seluler pedagang keliling di jalan raya, arsitektur ini menerapkan ketahanan berlapis[span_15](start_span)[span_15](end_span):


```
┌─────────────────────────┐
│ Perangkat Kirim Lokasi  │
└────────────┬────────────┘
│
[Cek Sinyal Internet]
│
┌────────────────┴────────────────┐
(Online)                           (Offline)
│                                 │
▼                                 ▼
[Kirim Langsung ke API]              [Simpan di IndexedDB]
│                                 │
▼                                 ▼
[Respons Sukses]                 [Daftarkan Background Sync]
│
[Internet Pulih Kembali]
│
▼
[Service Worker Menguras]
[IndexedDB ke Backend]
```

* **Mekanisme Heartbeat:** Server memantau timestamp `last_updated_at` pada tabel koordinat[span_16](start_span)[span_16](end_span). Jika dalam waktu 15 menit berturut-turut tidak ada ping masuk dari perangkat pedagang, *Cron Job* backend akan otomatis menandai status radar menjadi `is_radar_active = FALSE` agar pembeli tidak melihat data usang di peta[span_17](start_span)[span_17](end_span).

---

## 4. Keamanan & Efisiensi Hardware (Device Level Architecture)

### 4.1 Screen Wake Lock API Integration
Untuk mencegah sistem operasi perangkat seluler (terutama Android/iOS manajemen daya agresif) mematikan *thread* JavaScript saat layar mati di dalam saku pedagang, arsitektur aplikasi menggunakan interaksi siklus hidup berikut[span_18](start_span)[span_18](end_span):
1. Pedagang menekan **Toggle "Mulai Berkeliling"**[span_19](start_span)[span_19](end_span).
2. Aplikasi meminta klaim `wakeLock = await navigator.wakeLock.request('screen')`[span_20](start_span)[span_20](end_span).
3. Layar dijaga dalam kondisi *low-brightness dim state* (tidak terkunci otomatis)[span_21](start_span)[span_21](end_span).
4. Frekuensi bacaan GPS dibatasi (*throttling*) maksimal 10 detik per siklus untuk mencegah disipasi panas baterai perangkat[span_22](start_span)[span_22](end_span).

### 4.2 Proteksi API & Database (Throttling Layer)
Backend Gateway mengimplementasikan token bucket algorithm:
* Endpoint `POST /merchant/radar/ping` dikunci dengan aturan *soft-throttle*[span_23](start_span)[span_23](end_span). Jika sebuah perangkat mengirimkan koordinat baru kurang dari 10 sec dari request sebelumnya, gateway akan merespons dengan `202 Accepted` tetapi membuang (*discard*) penulisan ke database PostGIS, kecuali parameter akselerometer mendeteksi perubahan kecepatan ekstrem[span_24](start_span)[span_24](end_span).

---

## 5. Komponen Infrastruktur (Deployment Architecture)


```
[ Calon Pengguna (PWA) ]
│
▼
[ Reverse Proxy / Nginx ]
(Gzip, Cache-Control Header)
│
┌──────────────┴──────────────┐
▼                             ▼
[ Aset Statis PWA CDN ]        [ API Gateway Backend ]
(HTML, JS, Leaflet Aset)      (Node.js / Go Runtime)
│
▼
[ PostgreSQL + PostGIS ]
(GIST Spatial Index)
```

* **Layer Caching:** Aset Leaflet.js dan penanda peta dikonfigurasi menggunakan header `Cache-Control: public, max-age=31536000, immutable` pada tingkat *Reverse Proxy* untuk meminimalkan beban transfer data PWA pembeli[span_25](start_span)[span_25](end_span).

```
