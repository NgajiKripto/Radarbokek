# Requirements Specification (Requirements.md)
## RADAR BOKEK — Platform Hyperlocal PWA untuk Pedagang Keliling
> Versi Dokumen: 1.0 (Production-Ready) | Pembaruan: Juli 2026[span_2](start_span)[span_2](end_span)

Dokumen ini mendefinisikan seluruh kebutuhan fungsional, batasan performa, dan skenario pengujian minimum yang wajib dipenuhi oleh sistem **Radar Bokek**[span_3](start_span)[span_3](end_span). Berkas ini ditulis sebagai panduan teknis langsung untuk implementasi kode dan audit kelayakan sistem.

---

## 1. Kebutuhan Fungsional Global (Global Functional Requirements)

### 1.1 App Shell & Navigasi Utama
* **R-1.01:** Sistem wajib berjalan sebagai *Progressive Web App (PWA)* yang responsif pada resolusi seluler minimum 320px hingga 480px tanpa *horizontal scroll*[span_4](start_span)[span_4](end_span).
* **R-1.02:** Navigasi bawah (*Bottom Navigation Bar*) wajib terpasang secara permanen (*fixed*) pada bagian bawah *viewport*[span_5](start_span)[span_5](end_span).
* **R-1.03:** Navigasi wajib menyediakan tiga slot rute fungsional: `/map` (Cari Jajanan), `/merchant/dashboard` (Mulai Jualan), dan `/merchant/profile` (Profil Saya)[span_6](start_span)[span_6](end_span).

### 1.2 Autentikasi & Pemisahan Peran (Role Segmentation)
* **R-1.04:** Halaman utama (`/`) wajib menyediakan gerbang pilihan peran: "Saya Pembeli" dan "Saya Pedagang[span_7](start_span)"[span_7](end_span).
* **R-1.05:** Pengguna yang memilih peran "Pembeli" dapat mengakses peta sebaran tanpa wajib melakukan registrasi akun (Akses Publik Anonim)[span_8](start_span)[span_8](end_span).
* **R-1.06:** Pengguna yang memilih peran "Pedagang" wajib melakukan registrasi dan masuk log sebelum dapat mengaktifkan fungsi pemetaan lokasi[span_9](start_span)[span_9](end_span).

---

## 2. Spesifikasi Sisi Pembeli (Buyer Module Requirements)

### 2.1 Peta Discovery (`/map`)
* **R-2.01:** Peta wajib merender layer berbasis *Leaflet.js* dengan menggunakan *Tile Layer* dari *CartoDB Positron* secara lokal[span_10](start_span)[span_10](end_span).
* **R-2.02:** Sistem wajib meminta izin sensor GPS perangkat pembeli saat halaman peta pertama kali dimuat[span_11](start_span)[span_11](end_span).
* **R-2.03:** Radius default pencarian pedagang aktif dibatasi maksimal 2 kilometer dari titik koordinat pembeli[span_12](start_span)[span_12](end_span).
* **R-2.04:** Peta wajib merender tiga jenis penanda (*marker*) pedagang secara dinamis:
  * Tier Gratis / Standard[span_13](start_span)[span_13](end_span).
  * Tier Premium/Pro (dengan kerangka visual animasi berdenyut)[span_14](start_span)[span_14](end_span).
  * Pedagang dalam status melaju kencang (> 20 km/jam)[span_15](start_span)[span_15](end_span).

### 2.2 Komponen Informasi Pedagang (Bottom Sheet Card)
* **R-2.05:** Kartu informasi wajib merender data aktual pedagang keliling secara *real-time*: Nama Dagangan, Kategori Jajanan, Foto Spanduk Menu, dan Label Kisaran Harga Dasar[span_16](start_span)[span_16](end_span).
* **R-2.06:** Perhitungan estimasi jarak wajib diproses di sisi klien (*client-side*) menggunakan rumus matematika *Haversine* tanpa memanggil API *routing* eksternal[span_17](start_span)[span_17](end_span).
* **R-2.07:** Kartu wajib menampilkan indikator metode pembayaran berupa tag penanda yang jelas (`[QRIS]` atau `[CASH]`)[span_18](start_span)[span_18](end_span).

---

## 3. Spesifikasi Sisi Pedagang (Merchant Module Requirements)

### 3.1 Dasbor Utama & Kendali Visibilitas (`/merchant/dashboard`)
* **R-3.01:** Dasbor wajib menyediakan *Toggle Switch* manual bertuliskan "MULAI BERKELILING" untuk mengontrol status penyiaran lokasi[span_19](start_span)[span_19](end_span).
* **R-3.02:** Waktu hitung mundur sisa kuota tampil harian (Tier Gratis: 3 jam) wajib dikurangi hanya saat *Toggle* berstatus aktif[span_20](start_span)[span_20](end_span).
* **R-3.03:** Dasbor wajib menyediakan tombol pemilih status operasional harian: "🚴 Lagi Jalan" atau "🛑 Lagi Mangkal[span_21](start_span)"[span_21](end_span).
* **R-3.04:** Sistem wajib mengunci layar agar tidak mati selama radar aktif menggunakan *Screen Wake Lock API* untuk menjamin pelacakan GPS di latar belakang[span_22](start_span)[span_22](end_span).

### 3.2 Profil Jualan & Pengaturan Menu (`/merchant/profile`)
* **R-3.05:** Form profil wajib menyediakan input: Nama Dagangan (maksimal 40 karakter), Dropdown Kategori, Harga Mulai Dasar, dan slot unggah Foto Spanduk Menu[span_23](start_span)[span_23](end_span).
* **R-3.06:** Untuk akun Premium/Pro, wajib disediakan kolom input teks khusus untuk menempelkan tautan/string gambar QRIS Tip personal pedagang[span_24](start_span)[span_24](end_span).

### 3.3 Top-Up Saldo Koin (`/merchant/topup`)
* **R-3.07:** Halaman wajib menampilkan gambar QRIS statis/dinamis milik platform *Radar Bokek* untuk transaksi pengisian saldo harian pedagang[span_25](start_span)[span_25](end_span).
* **R-3.08:** Batas minimum isi ulang saldo ditetapkan sebesar Rp10.000 (setara penggunaan 4 hari tier Pro)[span_26](start_span)[span_26](end_span).
* **R-3.09:** Saldo koin yang telah dibeli didefinisikan secara mutlak sebagai *non-refundable token* (tidak dapat diuangkan kembali)[span_27](start_span)[span_27](end_span).

---

## 4. Kebutuhan Non-Fungsional & Keamanan (Non-Functional Requirements)

### 4.1 Sinkronisasi & Pembaruan Data Real-Time
* **R-4.01:** Koordinat GPS pedagang dikirim ke server via HTTP POST terkompresi hanya jika terjadi perubahan jarak perpindahan > 15 meter dari titik terakhir[span_28](start_span)[span_28](end_span).
* **R-4.02:** Penyiaran koordinat pedagang ke sisi browser pembeli yang aktif wajib memanfaatkan arsitektur *Server-Sent Events* (SSE) atau WebSockets yang difilter berbasis *geohashing* lokal[span_29](start_span)[span_29](end_span).
* **R-4.03:** Unggah data lokasi dari perangkat pedagang dibatasi (*throttling*) maksimal sekali setiap 10 detik untuk mencegah banjir data pada server[span_30](start_span)[span_30](end_span).

### 4.2 Ketahanan Jaringan & Logika Offline (Offline Resilience)
* **R-4.04:** Jika koneksi internet terputus, *Service Worker* wajib menyimpan data koordinat terakhir ke dalam *IndexedDB* lokal perangkat[span_31](start_span)[span_31](end_span).
* **R-4.05:** Aplikasi wajib melakukan *Background Sync* untuk mengirimkan data lokasi yang tertunda segera setelah mendeteksi sinyal internet pulih[span_32](start_span)[span_32](end_span).
* **R-4.06:** Jika perangkat pedagang tidak mengirimkan data pembaruan lokasi secara berturut-turut selama lebih dari 15 menit, server wajib menyembunyikan penanda pedagang tersebut dari peta pembeli secara otomatis[span_33](start_span)[span_33](end_span).

### 4.3 Deteksi Kecepatan Kendaraan (Velocity Alert)
* **R-4.07:** Jika akselerometer native browser mendeteksi kecepatan gerak pedagang melebihi batas > 20 km/jam, sistem dasbor pedagang wajib menampilkan bar peringatan "Melaju Terlalu Cepat[span_34](start_span)"[span_34](end_span).
* **R-4.08:** Di saat yang sama, status pedagang di peta pembeli wajib diubah secara otomatis menjadi penanda kabur dengan opasitas 40% dan label teks "Sedang Melaju Cepat[span_35](start_span)"[span_35](end_span).

### 4.4 Validasi Data & Proteksi Kecurangan
* **R-4.09:** Semua form input wajib melewati fungsi sanitasi data ketat untuk mencegah serangan *Cross-Site Scripting* (XSS) sebelum disimpan ke basis data[span_36](start_span)[span_36](end_span).
* **R-4.10:** Pemberian ulasan/reputasi dari satu akun pembeli ke satu akun pedagang dibatasi (*rate limiting*) maksimal 1 kali dalam jendela waktu 2 jam untuk mencegah manipulasi rating[span_37](start_span)[span_37](end_span).

---

## 5. Kriteria Penerimaan Minimum (Minimum Acceptance Criteria)

1. **Pengujian Peta Tanpa Biaya:** Jarak pembeli dan pedagang berhasil dikalkulasi secara instan di sisi browser pembeli dengan deviasi akurasi formula Haversine di bawah 5 meter tanpa memicu *invoice* API eksternal[span_38](start_span)[span_38](end_span).
2. **Pengujian Saku (Screen Off Tracking):** Penyiaran koordinat GPS pedagang keliling tetap berjalan stabil ke server minimal selama 1 jam tanpa terputus ketika aplikasi berada dalam kondisi layar HP mati/redup di saku celana[span_39](start_span)[span_39](end_span).
3. **Pengujian Jeda Kuota:** Durasi kuota tampil 3 jam harian terbukti berkurang tepat waktu per detik saat radar aktif, dan benar-benar berhenti berkurang (*freeze*) saat *Toggle* dinonaktifkan pedagang[span_40](start_span)[span_40](end_span).
4. **Responsivitas Tanpa Slop:** Aplikasi memuat data di bawah 3 detik pada jaringan seluler 3G/4G, tidak menampilkan teks terpotong (*no text overlapping*), dan bebas dari *horizontal scroll bar* pada perangkat seluler terkecil (lebar 320px)[span_41](start_span)[span_41](end_span).
