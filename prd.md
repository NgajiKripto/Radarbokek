# Product Requirements Document (PRD)
## RADAR BOKEK — Platform Hyperlocal PWA untuk Pedagang Keliling
> "Menghubungkan Perut Lapar dengan Roda UMKM secara Real-Time[span_0](start_span)"[span_0](end_span)
Dokumen ini menetapkan spesifikasi produk, kebutuhan teknis, arsitektur data, perilaku aplikasi, dan peta jalan pengembangan untuk platform **Radar Bokek**[span_1](start_span)[span_1](end_span). Aplikasi ini dirancang sebagai *Progressive Web App (PWA)* yang ringan guna menjembatani kesenjangan mobilitas antara pedagang keliling dan calon pembeli di sekitar radius terdekat menggunakan teknologi pemetaan open-source yang efisien[span_2](start_span)[span_2](end_span).

| Metadata | Deskripsi |
| :--- | :--- |
| **Nama Produk** | Radar Bokek[span_3](start_span)[span_3](end_span) |
| **Jenis Aplikasi** | Progressive Web App (PWA)[span_4](start_span)[span_4](end_span) |
| **Versi Dokumen** | 1.0 (Initial Specifications)[span_5](start_span)[span_5](end_span) |
| **Tanggal Pembaruan** | Juli 2026[span_6](start_span)[span_6](end_span) |
| **Teknologi Utama** | Vanilla JS / React + Leaflet.js + CartoDB Positron Tile Layer + Service Workers[span_7](start_span)[span_7](end_span) |
| **Target Utama** | Pedagang Keliling (Gerobak/Motor) & Pembeli Berorientasi Nilai/Hemat[span_8](start_span)[span_8](end_span) |

---
## 1. Ringkasan Eksekutif (Executive Summary)
Radar Bokek adalah platform berbasis PWA hyperlocal yang bertujuan membantu mobilitas pedagang keliling (seperti pedagang bakso, sol sepatu, es krim, tahu bulat, dll.) agar dapat ditemukan secara instan oleh pembeli terdekat[span_9](start_span)[span_9](end_span). Masalah mendasar UMKM keliling adalah ketidakpastian rute jualan dan inefisiensi waktu tunggu[span_10](start_span)[span_10](end_span). Di sisi lain, pembeli seringkali kesulitan mendeteksi keberadaan pedagang keliling yang melintas di sekitar pemukiman atau perkantoran mereka[span_11](start_span)[span_11](end_span).
Dengan memanfaatkan arsitektur web modern yang sangat hemat data, Radar Bokek mengeliminasi kebutuhan instalasi aplikasi native yang berat[span_12](start_span)[span_12](end_span). Menggunakan pustaka pemetaan Leaflet.js dan skema rendering peta minimalis, aplikasi ini menjamin performa tinggi pada perangkat kelas bawah (*low-end smartphones*) tanpa membebani kuota data pengguna secara berlebihan[span_13](start_span)[span_13](end_span).
---
## 2. Pernyataan Masalah (Problem Statement)
* **Inefisiensi Rute Pedagang Keliling:** Pedagang keliling menghabiskan banyak bahan bakar dan tenaga tanpa mengetahui titik konsentrasi pembeli aktif pada jam tertentu, mengandalkan keberuntungan secara konvensional[span_14](start_span)[span_14](end_span).
* **Kebutuhan Pembeli yang Bersifat Spontan:** Pembeli lokal seringkali ingin membeli makanan/jasa dari pedagang keliling namun tidak tahu kapan pedagang tersebut akan lewat, atau apakah mereka sudah terlewat dari areanya[span_15](start_span)[span_15](end_span).
* **Hambatan Adopsi Teknologi Native:** Mayoritas pedagang kecil memiliki penyimpanan ponsel yang terbatas dan sensitif terhadap pemakaian kuota internet[span_16](start_span)[span_16](end_span). Aplikasi native berbasis Google Maps API cenderung berat dan boros biaya operasional token/API bagi penyedia platform[span_17](start_span)[span_17](end_span).
---
## 3. Profil Pengguna Target (Target Users)
### 3.1 Pedagang Keliling (Sisi Penjual)
* **Karakteristik:** Berjualan menggunakan gerobak, sepeda, motor, atau pick-up[span_18](start_span)[span_18](end_span). Menggunakan smartphone dengan spesifikasi entry-level[span_19](start_span)[span_19](end_span). Terbiasa dengan transaksi harian konvensional dan mulai mengadopsi QRIS perbankan[span_20](start_span)[span_20](end_span).
* **Kebutuhan Utama:** Visibilitas instan kepada pembeli di radius terdekat tanpa proses pendaftaran menu yang rumit[span_21](start_span)[span_21](end_span).
### 3.2 Pembeli Lokal (Sisi Konsumen)
* **Karakteristik:** Konsumen perumahan, anak kos, atau karyawan kantor yang mencari alternatif makanan/jasa terjangkau ("bokek")[span_22](start_span)[span_22](end_span).
* **Kebutuhan Utama:** Peta sebaran pedagang secara real-time yang akurat, informasi harga dasar, metode pembayaran, serta status pergerakan pedagang tanpa harus mengunduh aplikasi di App Store/Play Store[span_23](start_span)[span_23](end_span).
> **Prinsip Inti Desain:** Seluruh alur antarmuka dirancang seringkas mungkin[span_24](start_span)[span_24](end_span). Pedagang tidak dituntut mengetik inventaris secara detail, melainkan cukup memilih kategori dan mengunggah satu foto papan menu/gerobak untuk mempercepat orientasi operasional[span_25](start_span)[span_25](end_span).
---
## 4. Spesifikasi Fitur Utama (Core Features)
### 4.1 Sisi Halaman Utama Pedagang (Merchant Dashboard)
Halaman khusus pedagang yang berfokus pada manajemen visibilitas lokasi dan kendali status kuota tampil[span_26](start_span)[span_26](end_span). Fitur mencakup:
* **Indikator Sisa Kuota Tampil:** Menampilkan sisa waktu (jam/menit) visibilitas aktif di peta pembeli pada hari berjalan[span_27](start_span)[span_27](end_span).
* **Tombol Kendali "Mulai/Berhenti Berkeliling" (Toggle Switch):** Mekanisme manual bagi pedagang untuk menyalakan/mematikan pembaruan lokasi secara sadar guna menghemat kuota harian[span_28](start_span)[span_28](end_span).
* **Tombol Status Operasional:** Pilihan status dinamis yang akan dirender langsung di penanda peta (*marker*) pembeli:
  * **"Lagi Jalan":** Menandakan pedagang sedang aktif bergerak/berpindah tempat[span_29](start_span)[span_29](end_span).
  * **"Lagi Mangkal/Ngetem":** Menandakan pedagang berhenti di titik tertentu dan siap didatangi pembeli[span_30](start_span)[span_30](end_span).
* **Pendaftaran Produk Kilat:** Form input minimalis berupa Nama Dagangan, Kategori Utama (Dropdown: Bakso/Mie, Siomay/Batagor, Minuman, Jasa Keliling, dll.), Metode Pembayaran (Cash / QRIS Pedagang Sendiri), dan Unggah Foto Spanduk Menu[span_31](start_span)[span_31](end_span).
### 4.2 Sisi Halaman Utama Pembeli (Buyer Discovery Page)
Halaman peta interaktif Leaflet.js yang langsung memuat koordinat pembeli dan menampilkan sebaran pedagang aktif dalam radius default 2 kilometer[span_32](start_span)[span_32](end_span). List informasi pada kartu informasi pedagang wajib menyajikan data sebagai berikut:

| Komponen Data | Deskripsi Perilaku Sistem | Ketentuan Tampilan |
| :--- | :--- | :--- |
| **Nama & Kategori** | Nama dagangan beserta ikon visual representatif kategori[span_33](start_span)[span_33](end_span). | Maksimal 40 karakter, teks tebal[span_34](start_span)[span_34](end_span). |
| **Reputasi** | Skor akumulasi jempol/bintang dari penilaian pembeli nyata[span_35](start_span)[span_35](end_span). | Format: ★ 4.8 (50 Ulasan)[span_36](start_span)[span_36](end_span). |
| **Barang & Harga** | Daftar harga dasar minimum atau foto menu terlampir[span_37](start_span)[span_37](end_span). | Contoh: "Mulai dari Rp10.000[span_38](start_span)"[span_38](end_span). |
| **Metode Bayar** | Label opsi pembayaran yang didukung pedagang[span_39](start_span)[span_39](end_span). | Tagging warna: Hijau untuk QRIS, Biru untuk Cash[span_40](start_span)[span_40](end_span). |
| **Estimasi Jarak** | Jarak langsung berbasis perhitungan matematis client-side[span_41](start_span)[span_41](end_span). | Satuan meter (m) atau kilometer (km)[span_42](start_span)[span_42](end_span). |

---
## 5. Model Bisnis & Skema Monetisasi (Freemium Token System)
Guna meminimalisasi friksi transaksi harian yang memberatkan pedagang jika harus membayar nominal kecil setiap hari via QRIS, Radar Bokek mengimplementasikan sistem **Top-Up Dompet/Koin Digital**[span_43](start_span)[span_43](end_span). Pedagang melakukan isi ulang saldo dalam jumlah paket tertentu secara fleksibel, dan saldo tersebut hanya dipotong ketika fitur "Mode Premium 24 Jam" diaktifkan secara manual[span_44](start_span)[span_44](end_span).
### 5.1 Tiering Paket Layanan
Sistem membagi akses layanan ke dalam tiga tingkatan operasional:
1. **Tier Free (Kuota Harian Gratis):**
   * Durasi tampil maksimal di halaman pembeli terdekat: 3 jam per hari[span_45](start_span)[span_45](end_span).
   * Mekanisme konsumsi: Waktu dihitung berkurang hanya saat tombol radar berstatus aktif[span_46](start_span)[span_46](end_span). Dapat dijeda secara fleksibel sepanjang hari[span_47](start_span)[span_47](end_span).
   * Fitur: Peta dasar, jarak standar, nama dagangan standar tanpa badge pro[span_48](start_span)[span_48](end_span).
2. **Tier Standard (Dahulu Paket Musiman):**
   * Biaya konsumsi saldo harian: Rp1.500 / 24 jam[span_49](start_span)[span_49](end_span).
   * Durasi tampil: Penuh selama 24 jam sejak aktivasi saldo di hari bersangkutan[span_50](start_span)[span_50](end_span).
   * Fitur tambahan: Prioritas rendering marker di peta pembeli di atas pengguna tier gratis[span_51](start_span)[span_51](end_span).
3. **Tier Premium/Pro (Dahulu Paket Tetap):**
   * Biaya konsumsi saldo harian: Rp2.500 / 24 jam[span_52](start_span)[span_52](end_span).
   * Durasi tampil: Penuh selama 24 jam[span_53](start_span)[span_53](end_span).
   * Fitur eksklusif pro:
     * **Sistem Reputasi & Ulasan:** Membuka hak akses akumulasi rating positif dari pembeli untuk meningkatkan kepercayaan konsumen terdekat[span_54](start_span)[span_54](end_span).
     * **Fitur Tip QRIS Mandiri:** Pembeli dapat memindai atau dialihkan langsung ke QRIS personal milik pedagang untuk memberikan tip/dana apresiasi tanpa potongan platform[span_55](start_span)[span_55](end_span).
     * Badge penanda khusus ("Penjual Terverifikasi Pro") di peta pembeli[span_56](start_span)[span_56](end_span).
### 5.2 Alur Pembayaran Menggunakan QRIS Radar Bokek
> **Arsitektur Transaksi:** Platform menyediakan QRIS Dinamis/Statis milik entitas *Radar Bokek* di halaman top-up akun pedagang[span_57](start_span)[span_57](end_span). Pedagang dapat membeli saldo koin dengan nominal minimum Rp10.000 (setara untuk penggunaan Paket Pro selama 4 hari atau Paket Standard selama ~6 hari) untuk mengeliminasi kerepotan pembayaran eceran harian[span_58](start_span)[span_58](end_span).
---
## 6. Arsitektur Teknis & Pengoptimalan Performa
Sebagai PWA yang menargetkan efisiensi tinggi pada ekosistem seluler yang dinamis, arsitektur teknis harus menghemat daya komputasi perangkat penjual dan konsumsi transfer data server[span_59](start_span)[span_59](end_span).
### 6.1 Mekanisme Pelacakan Lokasi (Live Geolocation API)
Sistem memanfaatkan native browser API `navigator.geolocation.watchPosition()` pada sisi perangkat pedagang[span_60](start_span)[span_60](end_span). Untuk menghindari pembekuan proses pelacakan oleh sistem operasi saat ponsel berada di dalam saku pedagang, PWA mengintegrasikan **Screen Wake Lock API**[span_61](start_span)[span_61](end_span).
Saat status "Mulai Berkeliling" diaktifkan, modul JavaScript meminta kunci visibilitas layar[span_62](start_span)[span_62](end_span):
```javascript
// Implementasi Pengunci Layar untuk Pelacakan Latar Belakang
let wakeLock = null;
async function requestWakeLock() {
  try {
    wakeLock = await navigator.wakeLock.request('screen');
  } catch (err) { 
    console.error(`${err.name}, ${err.message}`); 
  }
}
```
### 6.2 Sinkronisasi Real-Time Menggunakan Server-Sent Events (SSE)
Guna menghindari beban koneksi HTTP Polling konvensional yang merusak skalabilitas server, pembaruan lokasi pedagang dikirimkan ke server via HTTP POST terkompresi setiap kali terjadi perpindahan jarak > 15 meter. Server kemudian menyiarkan koordinat baru tersebut ke sisi pembeli yang aktif menggunakan koneksi satu arah **Server-Sent Events (SSE)** atau WebSockets yang difilter secara geografis pada layer backend (Geo-hashing).
### 6.3 Optimasi Peta Menggunakan Leaflet.js & Jarak Haversine
Beban komputasi pencarian rute jalan raya (*routing engine*) ditiadakan. Jarak antara pembeli dan pedagang dihitung langsung di sisi browser pembeli menggunakan **Formula Haversine** untuk menghitung jarak lingkaran besar (garis lurus):
```text
dLat = lat2 - lat1
dLon = lon2 - lon1
a = sin^2(dLat/2) + cos(lat1) * cos(lat2) * sin^2(dLon/2)
c = 2 * atan2(sqrt(a), sqrt(1-a))
Jarak (d) = R * c  (dimana R = 6371 km)
```
Metode ini dieksekusi instan lewat fungsi bawaan Leaflet map.distance(posisi_pembeli, posisi_pedagang) secara lokal, memastikan biaya sewa API peta bernilai **nol rupiah**. Komponen visual peta menggunakan tile server dari **CartoDB Positron**, yang memiliki desain minimalis, kontras tinggi, dan ukuran aset gambar yang sangat kecil sehingga mempercepat rendering di jaringan seluler 3G/4G.
## 7. Keamanan, Validasi Data, & Batasan Sistem
### 7.1 Sanitasi Input & Batasan Panjang Karakter
Semua form input data di sisi pedagang wajib melalui fungsi pembersihan karat (sanitasi) untuk mencegah injeksi kode berbahaya (*Cross-Site Scripting*). Aturan validasi ketat diterapkan sebelum data disimpan ke database:
 * **Nama Dagangan:** Wajib diisi, minimum 3 karakter, maksimum 40 karakter. Semua tag HTML akan dienkode.
 * **Harga Mulai:** Wajib berupa angka numerik positif, rentang Rp0 hingga Rp1.000.000.
 * **Deskripsi Singkat / Menu unggulan:** Maksimum 200 karakter untuk mencegah penumpukan teks di UI pembeli.
### 7.2 Pembatasan Frekuensi Pembaruan Lokasi (Rate Limiting)
Guna mencegah serangan spamming koordinat palsu yang dapat membebani basis data, sistem menerapkan pembatasan frekuensi unggah lokasi (*throttling*):
 * Perangkat pedagang hanya diizinkan mengirim pembaruan lokasi maksimal sekali setiap 10 detik, kecuali mendeteksi perpindahan jarak yang signifikan secara mendadak (> 50 meter).
 * Pemberian ulasan/reputasi dari sisi pembeli dibatasi 1 kali per pembeli per pedagang dalam jendela waktu 2 jam untuk menghindari kecurangan penggelembungan reputasi (*rating manipulation*).
### 7.3 Penanganan Kehilangan Sinyal Jaringan (Offline Resilience)
> **Prosedur Pengecualian Jaringan:** Jika perangkat pedagang keliling kehilangan koneksi internet (*blank spot*), Service Worker PWA akan menyimpan koordinat terakhir yang gagal dikirim ke dalam IndexedDB lokal. Begitu koneksi internet pulih, aplikasi secara otomatis melakukan *background sync* untuk memperbarui status terakhir ke server. Jika pedagang offline lebih dari 15 menit secara berturut-turut, server secara otomatis menyembunyikan penanda pedagang tersebut dari peta pembeli guna menjaga keakuratan informasi.
> 
## 8. Struktur Navigasi Halaman PWA (Routing Architecture)
Aplikasi dirancang dengan struktur rute linear yang ringkas:
 * / : Halaman Landing & Pemilihan Peran (Pedagang / Pembeli).
 * /map : Halaman Utama Pembeli (Peta Leaflet + List Pedagang Terdekat).
 * /merchant/dashboard : Halaman Utama Pedagang (Kendali Kuota, Status Jalan/Mangkal, Sisa Saldo).
 * /merchant/profile : Pengaturan Profil Dagangan, Unggah Spanduk Menu, & Tautan QRIS Tip.
 * /merchant/topup : Halaman Transaksi Pembelian Koin via QRIS Radar Bokek.
## 9. Parameter Sistem Desain (Design System Tokens)
Palet warna didesain menggunakan kontras tinggi agar layar smartphone pedagang keliling tetap terlihat jelas di bawah terik sinar matahari siang hari (*outdoor usability*).

| Token Desain | Nilai Heksadesimal | Tujuan Penggunaan Antarmuka |
| :--- | :--- | :--- |
| **Primary Accent** | #0f766e (Deep Teal) | Warna identitas, tombol aksi utama, header aplikasi. |
| **Secondary Color** | #334155 (Slate Blue) | Teks utama, nama menu, informasi jarak. |
| **Highlight Accent** | #d97706 (Warm Amber) | Marker pedagang premium, badge tier pro, notifikasi penting. |
| **Success / Active** | #16a34a (Green) | Status "Lagi Mangkal", indikator kuota aktif, opsi QRIS. |
| **Background Page** | #fafaf9 (Warm Cream) | Warna dasar halaman untuk mengurangi kelelahan mata. |

## 10. Peta Jalan Pengembangan & Rencana Rilis (Roadmap)
### Fase 1: Minimum Viable Product (MVP)
 * Implementasi modul PWA dasar dengan caching Service Worker untuk mempercepat load time awal.
 * Integrasi peta Leaflet.js dengan Tile Layer CartoDB Positron tanpa backend geohash yang rumit (spatial queries via PostgreSQL / Supabase PostGIS).
 * Sistem kuota gratis 3 jam per hari dengan kendali manual start/stop.
### Fase 2: Komersialisasi & Fitur Pro
 * Peluncuran sistem isi ulang saldo koin digital via integrasi gerbang pembayaran QRIS pihak ketiga.
 * Aktivasi Tier Standard dan Tier Premium beserta fitur penyematan QRIS Tip mandiri untuk pedagang keliling.
 * Penerapan Screen Wake Lock API untuk stabilitas pelacakan di latar belakang pada perangkat Android.
### Fase 3: Skalabilitas & Otomatisasi
 * Pengembangan algoritma prediksi rute pintar yang memberikan rekomendasi wilayah ramai pembeli kepada pedagang berbasis data historis transaksi pembeli yang membuka aplikasi.
 * Optimalisasi kompresi gambar spanduk menu otomatis di sisi klien sebelum diunggah untuk menghemat transmisi data.
## 11. Analisis Risiko & Strategi Mitigasi (Risks & Mitigations)
### 11.1 Konsumsi Baterai Perangkat Pedagang Tinggi
 * **Risiko:** Penggunaan GPS konvensional secara terus menerus ditambah dengan Screen Wake Lock API yang menjaga layar tetap menyala berpotensi menghabiskan daya baterai smartphone pedagang dalam waktu 4-5 jam operasional.
 * **Mitigasi:** Menambahkan fitur "Mode Hemat Baterai" di dalam aplikasi pedagang. Jika diaktifkan, frekuensi pembaruan GPS diturunkan menjadi setiap 45 detik atau jarak perpindahan minimum dinaikkan menjadi 40 meter, serta merekomendasikan penggunaan piranti pengisian daya portabel (*powerbank*) atau *car charger* gerobak.
### 11.2 Keakuratan Posisi Pedagang Keliling yang Bergerak Cepat
 * **Risiko:** Pembeli mengejar posisi pedagang bakso motor yang melaju cepat di jalan raya, berujung kekecewaan karena marker di peta mengalami keterlambatan (*delay*) render.
 * **Mitigasi:** Apabila kecepatan gerak pedagang terdeteksi > 20 km/jam melalui akselerometer native browser, sistem secara otomatis mengubah warna marker menjadi abu-abu pudar dengan keterangan teks status: "Sedang Melaju Cepat". Fitur ini memberikan sinyal peringatan kepada pembeli agar tidak mengejar hingga pedagang mengubah statusnya menjadi "Lagi Mangkal".
### 11.3 Regulasi dan Kepatuhan Transaksi
 * **Risiko:** Skema top-up saldo koin berpotensi bersinggungan dengan regulasi e-money Bank Indonesia jika dana mengendap di platform dikelola secara ilegal.
 * **Mitigasi:** Saldo koin di dalam Radar Bokek diposisikan murni sebagai poin komoditas internal aplikasi yang tidak dapat diuangkan kembali (*non-refundable token*) oleh pedagang, melainkan hanya habis dikonsumsi untuk membeli hak tayang iklan visibilitas pemetaan hyperlocal platform.
## 12. Kesimpulan Dokumen
Rancangan produk **Radar Bokek** ini menyajikan pendekatan arsitektur teknologi PWA + Leaflet.js yang sangat berorientasi pada efisiensi biaya operasional bagi pengembang dan kemudahan akses bagi segmentasi masyarakat ekonomi mikro. Dengan mengadopsi skema koin top-up harian yang adaptif serta fitur proteksi performa perangkat keras, platform ini siap untuk divalidasi ke fase pengembangan kode produksi.
```
