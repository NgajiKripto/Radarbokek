```markdown
# User Flow Specification (User_Flow.md)
## RADAR BOKEK — Platform Hyperlocal PWA untuk Pedagang Keliling
> Versi Dokumen: 1.0 (Production-Ready) | Pembaruan: Juli 2026

Dokumen ini memetakan seluruh alur perjalanan pengguna (*User Flow*) di dalam platform **Radar Bokek**, mencakup interaksi linier sisi Pembeli Lokal dan Sisi Pedagang Keliling, serta penanganan kondisi pengecualian sistem (*exception states*)[span_3](start_span)[span_3](end_span).

---

## 1. Alur Masuk & Pemilihan Peran (Onboarding Route `/`)

Alur awal ketika pengguna pertama kali membuka PWA Radar Bokek via browser seluler[span_4](start_span)[span_4](end_span).


```
[ Pengguna Membuka PWA: Rute "/" ]
│
▼
[ Halaman Landing & Judul Utama ]
│
┌──────────────┴──────────────┐
▼                             ▼
[ Tombol: "Saya Pembeli" ]     [ Tombol: "Saya Pedagang" ]
│                             │
▼                             ▼
( Pindah ke Rute "/map" )     ( Cek Status Autentikasi )
│
┌───────┴───────┐
(Belum Login)    (Sudah Login)
│               │
▼               ▼
[ Rute "/auth" ]  ( Rute "/merchant/dashboard" )
```

---

## 2. Alur Pengguna: Sisi Pembeli Lokal (Rute `/map`)

Memetakan perjalanan pembeli anonim/terautentikasi untuk mendeteksi, mencari, dan mengulas pedagang keliling di sekitarnya[span_5](start_span)[span_5](end_span).

### 2.1 Alur Eksplorasi Peta & Informasi Pedagang
1. **Masuk ke Peta:** Pembeli diarahkan ke halaman `/map`[span_6](start_span)[span_6](end_span).
2. **Izin GPS:** Browser memicu permintaan *native location access*[span_7](start_span)[span_7](end_span).
   * *Jika Diberikan:* Peta Leaflet berpusat pada posisi pembeli dan memuat penanda pedagang aktif dalam radius 2 KM[span_8](start_span)[span_8](end_span).
   * *Jika Ditolak:* Sistem memblokir layar dan menampilkan *Permission Denied Fallback*[span_9](start_span)[span_9](end_span).
3. **Pemfilteran & Pencarian:** Pembeli mengetik kata kunci pada *Search Bar* atau mengetuk tombol kapsul filter (`[Bisa QRIS]`, `[Lagi Mangkal]`)[span_10](start_span)[span_10](end_span).
4. **Melihat Detail:** Pembeli mengetuk penanda pedagang di peta atau kartu pada *Bottom Sheet*[span_11](start_span)[span_11](end_span).
5. **Aksi Kartu:** Sistem menyajikan metadata (Nama, Kategori, Foto Menu, Estimasi Jarak, Rating, Badge Pembayaran)[span_12](start_span)[span_12](end_span).
   * *Aksi Tambahan (Khusus Tier Pro):* Pembeli mengetuk tag `[QRIS]` -> Sistem menampilkan *Overlay QRIS Tip Mandiri* pedagang[span_13](start_span)[span_13](end_span).

### 2.2 Alur Pemberian Ulasan (Rating System)
1. Pembeli mengetuk baris reputasi (`★ 4.8`) pada kartu pedagang[span_14](start_span)[span_14](end_span).
2. Sistem membuka *Review & Rating Modal Overlay*[span_15](start_span)[span_15](end_span).
3. Pembeli memilih jumlah bintang (1-5) dan menulis komentar singkat (maksimal 200 karakter)[span_16](start_span)[span_16](end_span).
4. Pembeli menekan tombol "Kirim Ulasan[span_17](start_span)"[span_17](end_span).
5. Sistem memproses validasi *rate limiting* (2 jam per ulasan)[span_18](start_span)[span_18](end_span), menyimpan data, memperbarui rata-rata rating secara *real-time*, lalu menutup modal (*Silent Success*)[span_19](start_span)[span_19](end_span).

---

## 3. Alur Pengguna: Sisi Pedagang Keliling

Memetakan perjalanan operasional pedagang mulai dari pendaftaran data, aktivasi radar, hingga manajemen koin harian[span_20](start_span)[span_20](end_span).

### 3.1 Alur Registrasi Profil Jualan Kilat (Rute `/merchant/profile`)
1. Pedagang berhasil masuk akun dan diarahkan ke form profil jualan[span_21](start_span)[span_21](end_span).
2. Pedagang memasukkan data wajib: Nama Dagangan (Maks 40 karakter), Kategori Jajanan, dan Harga Mulai Dasar[span_22](start_span)[span_22](end_span).
3. Pedagang mengetuk area unggah media untuk mengambil/memilih **Foto Spanduk Menu**[span_23](start_span)[span_23](end_span).
4. *(Opsional - Khusus Akun Pro):* Pedagang menempelkan tautan/string gambar QRIS personal mereka ke kolom "QRIS Tip Mandiri[span_24](start_span)"[span_24](end_span).
5. Pedagang menekan tombol "Simpan Profil". Data diverifikasi dan disimpan ke tabel `merchants`[span_25](start_span)[span_25](end_span).

### 3.2 Alur Operasional Berkeliling (Rute `/merchant/dashboard`)
1. Pedagang membuka *Merchant Dashboard* dan melihat sisa saldo koin serta kuota tampil harian[span_26](start_span)[span_26](end_span).
2. Pedagang menggeser sakelar raksasa **"MULAI BERKELILING"** ke posisi aktif (*ON*)[span_27](start_span)[span_27](end_span).
3. **Pemicu Sistem:** 
   * Aplikasi mengklaim *Screen Wake Lock API* agar layar tetap menyala di saku[span_28](start_span)[span_28](end_span).
   * Hitung mundur sisa kuota tampil mulai berjalan per detik[span_29](start_span)[span_29](end_span).
   * `watchPosition()` mulai memantau pergerakan GPS perangkat[span_30](start_span)[span_30](end_span).
4. Pedagang memilih status taktis di bawah sakelar: `[🚴 Lagi Jalan]` atau `[🛑 Lagi Mangkal]`[span_31](start_span)[span_31](end_span).
5. **Ketika Berjualan:** Setiap pedagang berpindah tempat > 15 meter, koordinat otomatis dikirim ke server via HTTP POST untuk disiarkan ke pembeli terdekat via SSE[span_32](start_span)[span_32](end_span).
6. **Selesai Berjualan:** Pedagang menggeser kembali sakelar ke posisi *OFF*. Sistem melepas kunci *Wake Lock*, menghentikan pembaruan GPS, dan membekukan sisa kuota harian[span_33](start_span)[span_33](end_span).

### 3.3 Alur Isi Ulang Saldo Koin (Rute `/merchant/topup`)
1. Pedagang mendapati saldo koin menipis atau ingin meningkatkan tier ke Premium/Pro[span_34](start_span)[span_34](end_span).
2. Pedagang membuka menu rute `/merchant/topup` dan memilih nominal isi ulang (Minimum Rp10.000)[span_35](start_span)[span_35](end_span).
3. Sistem memunculkan **QRIS Engine Radar Bokek** di layar[span_36](start_span)[span_36](end_span).
4. Pedagang melakukan pembayaran menggunakan aplikasi M-Banking atau E-Wallet pihak ketiga dengan memindai kode tersebut[span_37](start_span)[span_37](end_span).
5. *Payment Gateway* mengirimkan *Callback Webhook* sukses ke server[span_38](start_span)[span_38](end_span).
6. Server memperbarui kolom `coin_balance` pedagang[span_39](start_span)[span_39](end_span). Halaman PWA secara otomatis memperbarui jumlah koin tanpa perlu *refresh* manual (*Reactive Balance Update*).

---

## 4. Alur Penanganan Pengecualian Jaringan (Exception Handling Flow)

### 4.1 Logika Kehilangan Sinyal Jaringan (Pedagang Offline)
1. Perangkat pedagang mendeteksi bendera `navigator.onLine == false` saat sedang berkeliling[span_40](start_span)[span_40](end_span).
2. **Respons UI:** PWA memunculkan *Sticky Offline Banner* di batas paling atas layar perangkat pedagang[span_41](start_span)[span_41](end_span).
3. **Logika Data:** Setiap koordinat baru dari GPS gagal dikirim ke server, *Service Worker* langsung mengalihkannya untuk disimpan ke dalam antrean *IndexedDB* lokal[span_42](start_span)[span_42](end_span).
4. Sinyal seluler pulih kembali (`navigator.onLine == true`).
5. *Background Sync API* terpicu, menguras seluruh antrean data lokasi di *IndexedDB*, mengirimkannya secara beruntun (*batch upload*) ke server, lalu menyembunyikan kembali banner offline[span_43](start_span)[span_43](end_span).

### 4.2 Logika Peringatan Kecepatan Tinggi (Velocity Alert)
1. Akselerometer perangkat mendeteksi kecepatan gerak gerobak/motor pedagang > 20 km/jam saat status radar AKTIF[span_44](start_span)[span_44](end_span).
2. **Sisi Pedagang:** Dasbor memunculkan bar peringatan *"Anda melaju terlalu cepat..."*[span_45](start_span)[span_45](end_span).
3. **Sisi Backend:** Server otomatis mengubah kolom `status_gerak` menjadi `melaju_cepat`[span_46](start_span)[span_46](end_span).
4. **Sisi Pembeli:** Penanda pedagang di peta Leaflet secara otomatis berubah menjadi pudar (opasitas 40%), dan label status di kartu pembeli berubah menjadi teks tegas: "Sedang Melaju Cepat[span_47](start_span)"[span_47](end_span). Pembeli mengetahui secara visual untuk tidak mengejar pedagang hingga ia berhenti dan berstatus "Lagi Mangkal[span_48](start_span)"[span_48](end_span).

``'
