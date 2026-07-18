```markdown
# Database Schema Specification (Database.md)
## RADAR BOKEK — Platform Hyperlocal PWA untuk Pedagang Keliling
> Versi Dokumen: 1.0 (Production-Ready) | Pembaruan: Juli 2026
Dokumen ini mendefinisikan arsitektur data, relasi antar tabel, tipe data, tingkat keamanan baris (Row Level Security), dan indeks spasial yang diperlukan untuk mendukung pelacakan real-time pedagang keliling pada platform **Radar Bokek**[span_1](start_span)[span_1](end_span).
---
## 1. Ekstensi & Tipe Data Kustom (Extensions & Custom Types)
Sistem memanfaatkan ekstensi **PostGIS** untuk kalkulasi koordinat dan tipe data enumerasi (`ENUM`) untuk mengunci status operasional agar terhindar dari anomali data.
```sql
-- Mengaktifkan ekstensi pencarian spasial/geografis
CREATE EXTENSION IF NOT EXISTS postgis;
-- Tipe data kustom untuk status langganan pedagang
CREATE TYPE tier_level AS ENUM ('free', 'standard', 'pro');
-- Tipe data kustom untuk status pergerakan fisik pedagang
CREATE TYPE movement_status AS ENUM ('jalan', 'mangkal', 'melaju_cepat');
```
## 2. Definisi Tabel (Table Schemas)
### 2.1 Tabel users
Menyimpan data dasar autentikasi untuk semua pengguna (pembeli opsional, pedagang wajib).

| Nama Kolom | Tipe Data | Aturan / Kekangan | Deskripsi |
| :--- | :--- | :--- | :--- |
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | ID unik pengguna |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Alamat email terverifikasi |
| password_hash | VARCHAR(255) | NOT NULL | Hasil *hash* sandi aman |
| role | VARCHAR(50) | NOT NULL, CHECK (role IN ('buyer', 'merchant')) | Peran dalam sistem |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Waktu pendaftaran akun | <br> ### 2.2 Tabel merchants <br> Menyimpan profil produk kilat dan status finansial token/koin milik pedagang keliling.
| Nama Kolom | Tipe Data | Aturan / Kekangan | Deskripsi |
| :--- | :--- | :--- | :--- |
| id | UUID | PRIMARY KEY, REFERENCES users(id) ON DELETE CASCADE | ID relasi ke tabel users |
| business_name | VARCHAR(40) | NOT NULL | Nama dagangan (Maks 40 karakter) |
| category | VARCHAR(50) | NOT NULL | Kategori (Dropdown: Bakso, Siomay, dll.) |
| price_baseline | NUMERIC(10,2) | NOT NULL, DEFAULT 0.00 | Kisaran harga dasar minimum |
| menu_spanduk_url | TEXT | NULL | Tautan gambar spanduk/papan menu |
| qris_tip_destination | TEXT | NULL | Tautan/string QRIS tip personal (Khusus Pro) |
| coin_balance | INT | NOT NULL, DEFAULT 0, CHECK (coin_balance >= 0) | Sisa saldo koin digital (Min Rp10.000) |
| current_tier | tier_level | NOT NULL, DEFAULT 'free' | Tingkat layanan aktif (Free/Standard/Pro) | <br> ### 2.3 Tabel merchant_radar_signals <br> Tabel performa tinggi (*high-throughput*) khusus untuk mencatat lokasi real-time, status gerak, dan sisa kuota tampil.
| Nama Kolom | Tipe Data | Aturan / Kekangan | Deskripsi |
| :--- | :--- | :--- | :--- |
| merchant_id | UUID | PRIMARY KEY, REFERENCES merchants(id) ON DELETE CASCADE | ID relasi ke tabel merchants |
| is_radar_active | BOOLEAN | NOT NULL, DEFAULT FALSE | Status switch kontrol "Mulai Berkeliling" |
| current_location | GEOGRAPHY(Point, 4326) | NULL | Koordinat bumi terkini (Latitude, Longitude) |
| status_gerak | movement_status | NOT NULL, DEFAULT 'jalan' | Status fisik (Jalan / Mangkal / Cepat) |
| remaining_free_quota | INTERVAL | NOT NULL, DEFAULT '03:00:00' | Sisa durasi kuota gratis hari berjalan |
| last_updated_at | TIMESTAMPTZ | DEFAULT NOW() | Waktu pembaruan lokasi terakhir | <br> ### 2.4 Tabel reviews <br> Menyimpan riwayat ulasan untuk kalkulasi sistem reputasi pedagang Tier Premium/Pro.
| Nama Kolom | Tipe Data | Aturan / Kekangan | Deskripsi |
| :--- | :--- | :--- | :--- |
| id | BIGSERIAL | PRIMARY KEY | ID unik ulasan |
| merchant_id | UUID | NOT NULL, REFERENCES merchants(id) ON DELETE CASCADE | Target pedagang yang diulas |
| buyer_id | UUID | NULL, REFERENCES users(id) ON DELETE SET NULL | Pemberi ulasan (bisa opsional/anonim) |
| rating | INT | NOT NULL, CHECK (rating BETWEEN 1 AND 5) | Skor bintang 1 sampai 5 |
| comment | VARCHAR(200) | NULL | Teks ulasan singkat (Maks 200 karakter) |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Waktu ulasan dikirim |

## 3. Strategi Pengindeksan Spasial (Indexing Strategy)
Pencarian pedagang terdekat berbasis radius 2 kilometer wajib dieksekusi dalam waktu di bawah 50 milidetik. Oleh karena itu, indeks spasial **GIST (Generalized Search Tree)** wajib dipasang pada kolom koordinat geografis.
```sql
-- Indeks Spasial untuk pencarian hyperlocal cepat berdasarkan radius
CREATE INDEX IF NOT EXISTS idx_merchants_location ON merchant_radar_signals USING GIST (current_location);
-- Indeks komposit untuk mempercepat pemfilteran pedagang aktif & tier layanan
CREATE INDEX IF NOT EXISTS idx_active_radar ON merchant_radar_signals (is_radar_active) WHERE is_radar_active = TRUE;
```
## 4. Query Inti Hyperlocal (Core Spatial Queries)
### 4.1 Pencarian Pedagang Terdekat dalam Radius 2 KM (Sisi Pembeli)
Query ini digunakan untuk memuat data di halaman /map menggunakan fungsi ST_DWithin bawaan PostGIS yang gratis dan hemat daya server.
```sql
SELECT 
    m.id, 
    m.business_name, 
    m.category, 
    m.price_baseline, 
    m.menu_spanduk_url, 
    m.current_tier,
    s.status_gerak,
    -- Menghitung jarak garis lurus (Haversine) antara pembeli dan pedagang dalam satuan meter
    ST_Distance(s.current_location, ST_MakePoint(:buyer_longitude, :buyer_latitude)::geography) AS estimasi_jarak
FROM merchant_radar_signals s
JOIN merchants m ON s.merchant_id = m.id
WHERE 
    s.is_radar_active = TRUE 
    AND s.status_gerak != 'melaju_cepat' -- Sembunyikan atau bedakan jika melaju kencang[span_22](start_span)[span_22](end_span)
    AND ST_DWithin(s.current_location, ST_MakePoint(:buyer_longitude, :buyer_latitude)::geography, 2000)
ORDER BY 
    CASE WHEN m.current_tier = 'pro' THEN 1 WHEN m.current_tier = 'standard' THEN 2 ELSE 3 END, -- Prioritas rendering tier[span_23](start_span)[span_23](end_span)
    estimasi_jarak ASC;
```
## 5. Keamanan Data & Kebijakan Akses (Row Level Security)
Sistem wajib melindungi data transaksi dan koin pedagang kecil agar tidak dapat dimanipulasi oleh pengguna luar.
```sql
-- Mengaktifkan RLS pada tabel finansial pedagang
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_radar_signals ENABLE ROW LEVEL SECURITY;
-- Kebijakan: Pedagang hanya bisa melihat dan mengubah data milik mereka sendiri
CREATE POLICY merchant_own_profile_policy ON merchants
    FOR ALL
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
-- Kebijakan: Pembeli hanya bisa melihat data radar jika status radar tersebut AKTIF
CREATE POLICY buyer_view_active_radar_policy ON merchant_radar_signals
    FOR SELECT
    USING (is_radar_active = TRUE OR auth.uid() = merchant_id);
```
