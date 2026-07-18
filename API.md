```markdown
# API Endpoint Specification (API.md)
## RADAR BOKEK — Platform Hyperlocal PWA untuk Pedagang Keliling
> Versi Dokumen: 1.0 (Production-Ready) | Pembaruan: Juli 2026

Dokumen ini mendefinisikan seluruh kontrak antarmuka API (Application Programming Interface) yang digunakan untuk komunikasi data antara frontend PWA dan server backend pada platform **Radar Bokek**[span_1](start_span)[span_1](end_span).

---

## 1. Standar Global API & Error Handling

* **Base URL:** `/api/v1`
* **Content-Type:** `application/json`
* **Authentication:** `Authorization: Bearer <JWT_TOKEN>` (Hanya untuk *protected endpoints*)[span_2](start_span)[span_2](end_span)
* **Rate Limiting:** Maksimal 60 request/menit per IP untuk endpoint publik. Khusus pelacakan lokasi pedagang, berlaku aturan *throttling* internal[span_3](start_span)[span_3](end_span).

### Format Respons Error Standar (RFC 7807)
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Detail pesan error spesifik dari sanitasi sistem."
}

```
## 2. Autentikasi & Akun Endpoints (Public)
### 2.1 Pendaftaran Pengguna Baru
 * **Endpoint:** POST /auth/register
 * **Deskripsi:** Mendaftarkan akun baru sebagai pembeli atau pedagang.
 * **Payload:**
```json
{
  "email": "pedagang.bakso@example.com",
  "password": "SecurePassword123!",
  "role": "merchant"
}

```
 * **Respons (201 Created):**
```json
{
  "success": true,
  "message": "Registrasi berhasil.",
  "user_id": "d3b07384-d113-4ec6-a5d7-e00666666666"
}

```
### 2.2 Masuk Log (Login)
 * **Endpoint:** POST /auth/login
 * **Payload:**
```json
{
  "email": "pedagang.bakso@example.com",
  "password": "SecurePassword123!"
}

```
 * **Respons (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "role": "merchant"
}

```
## 3. Modul Pembeli / Discovery Endpoints (Public)
### 3.1 Mendapatkan Daftar Pedagang Terdekat (Radius 2 KM)
 * **Endpoint:** GET /buyer/radar
 * **Deskripsi:** Mengambil data sebaran pedagang aktif di sekitar lokasi pembeli berbasis formula Haversine/PostGIS.
 * **Query Parameters:**
   * lat (float, required): Latitude pembeli.
   * lon (float, required): Longitude pembeli.
   * search (string, optional): Kata kunci pencarian produk (e.g., "bakso").
   * filter (string, optional): Opsi penyaringan (qris, mangkal).
 * **Respons (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "merchant_id": "d3b07384-d113-4ec6-a5d7-e00666666666",
      "business_name": "Bakso Pak Kumis Keliling",
      "category": "Bakso/Mie",
      "price_baseline": 10000.00,
      "menu_spanduk_url": "[https://cdn.radarbokek.com/menu/bakso.jpg](https://cdn.radarbokek.com/menu/bakso.jpg)",
      "current_tier": "pro",
      "status_gerak": "mangkal",
      "estimasi_jarak_meter": 150,
      "reputasi": {
        "rating_rata_rata": 4.8,
        "total_ulasan": 50
      },
      "metode_pembayaran": ["CASH", "QRIS"]
    }
  ]
}

```
### 3.2 Mengirimkan Ulasan & Rating Pedagang
 * **Endpoint:** POST /buyer/review
 * **Constraint:** Rate limiting 1 ulasan per pembeli per pedagang per 2 jam.
 * **Payload:**
```json
{
  "merchant_id": "d3b07384-d113-4ec6-a5d7-e00666666666",
  "rating": 5,
  "comment": "Baksonya enak, porsi banyak, dan gerobaknya bersih!"
}

```
 * **Respons (201 Created):**
```json
{
  "success": true,
  "message": "Ulasan berhasil disimpan."
}

```
## 4. Modul Pedagang / Merchant Endpoints (Protected)
### 4.1 Sinkronisasi Lokasi Real-Time (Throttled)
 * **Endpoint:** POST /merchant/radar/ping
 * **Deskripsi:** Mengirim koordinat lokasi dari watchPosition() dan status gerak pedagang.
 * **Payload:**
```json
{
  "latitude": -7.2575,
  "longitude": 112.7521,
  "status_gerak": "mangkal",
  "speed_kmh": 0.0
}

```
 * **Respons (200 OK):**
```json
{
  "success": true,
  "is_radar_active": true,
  "remaining_free_quota": "02:45:00",
  "coin_balance": 12500
}

```
### 4.2 Mengubah Status Aktivasi Radar (Toggle Switch)
 * **Endpoint:** PUT /merchant/radar/toggle
 * **Deskripsi:** Mengaktifkan atau menjeda siaran radar (start/stop kuota).
 * **Payload:**
```json
{
  "is_radar_active": true
}

```
 * **Respons (200 OK):**
```json
{
  "success": true,
  "is_radar_active": true,
  "message": "Radar diaktifkan. Sisa kuota gratis Anda mulai berjalan."
}

```
### 4.3 Memperbarui Profil Produk Kilat
 * **Endpoint:** PUT /merchant/profile
 * **Payload:**
```json
{
  "business_name": "Bakso Pak Kumis Keliling",
  "category": "Bakso/Mie",
  "price_baseline": 10000,
  "menu_spanduk_url": "[https://cdn.radarbokek.com/menu/bakso.jpg](https://cdn.radarbokek.com/menu/bakso.jpg)",
  "qris_tip_destination": "00020101021126570022ID..."
}

```
 * **Respons (200 OK):**
```json
{
  "success": true,
  "message": "Profil berhasil diperbarui."
}

```
## 5. Modul Transaksi & Finansial Token (Protected)
### 5.1 Request QRIS Top-Up Saldo Koin
 * **Endpoint:** POST /merchant/wallet/topup
 * **Deskripsi:** Menghasilkan kode QRIS statis/dinamis dari sistem pusat Radar Bokek untuk pembelian koin.
 * **Payload:**
```json
{
  "amount_rupiah": 10000
}

```
 * **Respons (200 OK):**
```json
{
  "success": true,
  "transaction_id": "tx-992831",
  "qris_string": "00020101021226640014org.radarbokek...",
  "message": "Silakan pindai QRIS untuk mengisi saldo koin (Min. Rp10.000)."
}

```
## 6. Skenario Khusus Webhook (Server-to-Server)
### 6.1 Payment Gateway Webhook (Konfirmasi Pengisian Koin)
 * **Endpoint:** POST /webhooks/payment/qris-callback
 * **Deskripsi:** Menerima konfirmasi sukses pembayaran dari sistem QRIS pihak ketiga untuk menambahkan saldo koin pedagang.
 * **Payload:**
```json
{
  "transaction_id": "tx-992831",
  "status": "PAID",
  "amount_received": 10000,
  "signature": "8fa3c812c8bdfc73c24..."
}

```
 * **Respons (200 OK):**
```json
{
  "status": "COMPLETED"
}

```
```
