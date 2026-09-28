# 📊 InternBPS (Intern Hub) — Personal Daily Activity & Internship Tracker

[![React](https://img.shields.io/badge/React-19.0-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-black?style=flat-square&logo=express)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-LibSQL-003B57?style=flat-square&logo=sqlite)](https://github.com/tursodatabase/libsql-client-ts)
[![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Windows%20Desktop-0078d7?style=flat-square&logo=windows)](https://microsoft.com)

Aplikasi manajemen, pelaporan, dan pelacakan aktivitas harian komprehensif yang dirancang secara khusus untuk memfasilitasi kebutuhan peserta magang di lingkungan **Badan Pusat Statistik (BPS)**. Menggabungkan kemudahan antarmuka modern berbasis web, keandalan basis data lokal SQLite, generator dokumen laporan kedinasan siap cetak (A4/Letter), serta *launcher* desktop mandiri berbasis System Tray Windows.

---

> ⚠️ **CATATAN PENTING / DISCLAIMER**  
> Repositori dan sistem ini dikembangkan **khusus untuk memenuhi kebutuhan operasional selama pelaksanaan program magang (internship project) di Badan Pusat Statistik (BPS)**. Aplikasi ini difungsikan sebagai sistem manajemen mandiri untuk mencatat presensi kehadiran harian, menyusun logbook aktivitas pekerjaan, mengelola tugas (task management), mengarsipkan dokumen kedinasan, serta mengotomasi penyusunan dokumen rekapitulasi resmi dan ekspor Excel berstandar kedinasan BPS untuk keperluan sidang dan laporan pertanggungjawaban akhir magang.

---

## 🌟 Fitur-Fitur Utama

### 1. 📈 Dashboard Eksekutif & Smart Countdown
- **Internship Progress Tracker**: Menghitung hari yang telah berjalan (*elapsed*), sisa hari magang (*remaining*), dan total durasi kalender secara *real-time* berdasarkan periode magang pada profil.
- **Kartu Metrik & Statistik Kinerja**: Ringkasan akumulasi jam kerja, jumlah logbook selesai vs draf, total tugas aktif, serta jumlah tugas mendesak (*High Priority*).
- **Sebaran Kategori Aktivitas**: Visualisasi distribusi aktivitas pekerjaan (Pengolahan Data, Survei Lapangan, IT/Sistem, Analisis Statistik, Rapat/Koordinasi, dsb.).
- **Quick Attendance Widget**: Widget presensi instan langsung dari beranda untuk melakukan *Clock In* atau *Clock Out* harian tanpa harus berpindah halaman.

### 2. ⏱️ Presensi & Kehadiran (Attendance Tracking)
- **Live Digital Clock**: Penunjuk waktu digital presisi dengan pembaruan detik langsung.
- **1-Click Clock In & Clock Out**: Pencatatan waktu masuk dan waktu pulang dengan satu kali klik.
- **Fleksibilitas Status & Lokasi Kerja**: Mendukung pilihan status kehadiran lengkap:
  - `Hadir (WFO)` — Kantor BPS
  - `Hadir (WFH)` — Bekerja dari Rumah / Lokasi Tertentu
  - `Dinas Luar` — Tugas Survei / Monitoring Lapangan
  - `Izin` / `Sakit` (dengan kolom catatan keterangan)
- **Kompatibilitas Format Waktu 24 Jam**: Dilengkapi komponen pemilih waktu kustom (`TimeInput24`) yang mendukung entri jam manual, tombol *stepper*, dan validasi batas waktu.
- **Tabel Riwayat & Filter Bulan**: Log kehadiran historis yang dapat difilter per bulan atau per status, dengan opsi edit manual dan hapus.

### 3. 📝 Logbook Aktivitas Harian (Daily Activity Log)
- **Dual View Mode**:
  - **Tampilan Tabel (Table View)**: Menyajikan daftar aktivitas kronologis dengan pencarian kata kunci dan filter multi-kategori.
  - **Tampilan Kalender (Calendar View)**: Menampilkan kalender visual interaktif bulanan dengan penanda tanggal aktivitas yang telah tercatat.
- **Struktur Entri Komprehensif**:
  - Tanggal aktivitas & Judul pekerjaan
  - Kategori penugasan (Pengolahan Data, IT & Sistem, Survei Lapangan, Manajemen Dokumen, dsb.)
  - Durasi jam kerja (*Hours Spent*)
  - Status pengerjaan (*Selesai* / *Dalam Proses* / *Draft*)
  - Uraian detail kegiatan (*Description*)
  - Hasil / Luaran kerja fisik maupun digital (*Output*)
  - Catatan pembimbing atau catatan refleksi pribadi (*Notes*)

### 4. 📋 Manajemen Tugas (Kanban Board & List View)
- **Kanban Board 4 Tahapan**: Mengatur alur penugasan dengan kolom alur kerja: `Todo`, `In Progress`, `Review`, dan `Completed`.
- **Tingkat Prioritas (Priority Flags)**: Label prioritas visual bertingkat (`High` / `Medium` / `Low`) dengan penanda visual warna khusus.
- **Tenggat Waktu (Due Date Tracker)**: Pencatatan batas waktu penyelesaian tugas dengan indikator jatuh tempo.
- **Tagging & Kategori Tugas**: Pemberian tag label pada setiap kartu tugas untuk memudahkan pengelompokan.
- **Quick Status Move**: Tombol pintas untuk memindahkan status tugas secara instan tanpa perlu membuka dialog edit.

### 5. 🖨️ Rekapitulasi & Generator Laporan Resmi BPS (Print-Ready & Excel Export)
- **Cetak Laporan Logbook Aktivitas**: Format dokumen cetak resmi A4/Letter yang disesuaikan dengan standar penulisan logbook BPS, mencakup:
  - Kop dokumen resmi laporan magang
  - Identitas mahasiswa (Nama, NIM, Universitas/Institut, Divisi/Subdirektorat BPS)
  - Tabel rekapitulasi kegiatan, jam kerja, luaran, dan status
  - Kolom tanda tangan Pembimbing Lapangan BPS (lengkap dengan NIP) dan Mahasiswa bersangkutan
- **Cetak Rekapitulasi Presensi**: Format dokumen rekap presensi kehadiran siap cetak untuk lampiran absensi resmi.
- **Dukungan Layout Dinamis**: Opsi orientasi cetak *Portrait* maupun *Landscape*.
- **Ekspor Excel (.xlsx)**: Pembuatan file spreadsheet Excel asli dari server menggunakan SheetJS untuk seluruh data logbook dan absensi sesuai rentang tanggal yang dipilih.

### 6. 📚 Bank Pengetahuan & SOP BPS (Knowledge Base)
- Penyimpanan catatan teknis, pedoman wawancara, standar kode wilayah administrasi (Kode Wilayah BPS), pedoman *cleansing data*, dan SOP lingkungan kerja statistik.
- Pembagian kategori pedoman dengan fitur pencarian teks instan dan salin konten ke papan klip (*copy-to-clipboard*).

### 7. 📁 Manajemen Dokumen & Arsip Magang (Documents Repository)
- Media pengarsipan file dan dokumen digital terkait program magang (Surat Tugas, Surat Keputusan, Berita Acara, Sertifikat, Bahan Paparan, Form Penilaian).
- Mendukung berbagai format file (PDF, DOCX, XLSX, JPG, PNG) dengan batas ukuran hingga 25MB.
- Manajemen file aman dengan pratinjau (*preview*) langsung di peramban dan pengunduhan lokal.

### 8. 🎨 Desain Antarmuka Eksklusif (Dual Luxury Aesthetic)
- **Tema Warm Cream**: Palet warna bernuansa kertas arsip mewah, hangat, bersih, dan berstandar tipografi tinggi (*Plus Jakarta Sans*, *Outfit*, dan *Playfair Display*).
- **Tema Dark Espresso**: Mode gelap bernuansa abu-abu arang dan kopi pekat yang nyaman di mata untuk penggunaan jangka panjang di malam hari.
- Dilengkapi animasi mikro halus (*fade-in*, *smooth hover*, perayaan *confetti* saat penyelesaian target).

### 9. 🔒 Keamanan & Penyimpanan Lokal SQLite (Privacy-First)
- Seluruh riwayat presensi, catatan kerja, dan profil disimpan 100% secara lokal pada basis data **SQLite** (`laporan_bps.sqlite`) via `@libsql/client`.
- Inisialisasi otomatis: Skema basis data akan secara otomatis dibuat saat server pertama kali dijalankan tanpa membutuhkan konfigurasi database manual yang rumit.
- Dilengkapi fitur **Backup Database** (unduh salinan berkas `.sqlite`) dan **Reset Database** di menu Pengaturan.

### 10. 🖥️ Desktop Native Launcher & Paket Portable Mandiri
- Dilengkapi *native launcher* **C# Windows Forms** (`launcher/InternBPS.cs`) yang dapat dikompilasi menjadi `InternBPS.exe`.
- Terintegrasi dengan **System Tray Windows** (ikon tray di bilah tugas, minimize, buka aplikasi, dan exit).
- Mekanisme **Single-Instance Mutex** untuk mencegah aplikasi berjalan ganda.
- Tersedia skrip otomasi pembuatan bundel **Standalone Portable ZIP** (`scripts/build-portable-zip.ps1`) yang mengemas Node.js runtime, server backend, dan aset frontend ke dalam satu paket arsip portabel siap pakai di PC manapun.

---

## 🏗️ Arsitektur & Teknologi

```text
Intern-Hub/
├── index.html                # Dokumen HTML utama & pemanggilan font eksternal
├── vite.config.js            # Konfigurasi bundler Vite
├── package.json              # Definisi dependensi dan skrip proyek
├── launcher/
│   ├── InternBPS.cs          # Kode sumber launcher desktop C# Windows Forms
│   └── app.ico               # Ikon aplikasi desktop
├── scripts/
│   ├── build-exe.ps1         # Skrip PowerShell untuk kompilasi InternBPS.exe
│   ├── build-portable-zip.ps1# Skrip PowerShell untuk memaketkan ZIP Portable mandiri
│   └── create-clean-db.cjs   # Generator basis data bersih untuk paket distribusi
├── server/
│   ├── index.cjs             # REST API Express.js (Profile, Logs, Tasks, Export, Attendance)
│   ├── db.cjs                # Abstraksi koneksi LibSQL / SQLite dan inisialisasi tabel
│   └── inspect_db.cjs        # Skrip utilitas audit isi database lokal
└── src/
    ├── App.jsx               # Root component & orkestrasi state global
    ├── components/           # Komponen UI (Navbar, Sidebar, Modal, TimeInput24, Print, Export)
    ├── pages/                # Halaman modul (Dashboard, Attendance, DailyLogs, Tasks, Recap, dll.)
    ├── styles/               # Definisi token desain CSS & tema
    └── utils/                # HTTP client API & fungsi pemformat tanggal / badge
```

| Komponen | Teknologi yang Digunakan |
|---|---|
| **Frontend Framework** | [React 19](https://react.dev/) + [Vite 6](https://vitejs.dev/) |
| **Ikonografi** | [Lucide React](https://lucide.dev/) |
| **Animasi & Efek** | Canvas Confetti |
| **Backend API** | [Express.js](https://expressjs.com/) (Node.js) |
| **Basis Data** | [LibSQL Client](https://github.com/tursodatabase/libsql-client-ts) / [SQLite3](https://sqlite.org/) |
| **Ekspor Dokumen** | [SheetJS (XLSX)](https://sheetjs.com/) + Native CSS Print Media Queries |
| **Upload Handler** | [Multer](https://github.com/expressjs/multer) |
| **Desktop Launcher** | C# .NET Framework WinForms (`csc.exe`) |
| **Build Automation** | PowerShell Scripting |

---

## 🚀 Panduan Memulai (Getting Started)

### 1. Prasyarat Sistem
- **Node.js**: Versi 18.0.0 atau lebih baru ([Unduh Node.js](https://nodejs.org/))
- **NPM**: Bawaan dari instalasi Node.js
- **OS**: Windows 10/11 (direkomendasikan untuk memanfaatkan *desktop launcher* dan *PowerShell build scripts*)

### 2. Pemasangan & Menjalankan Proyek

1. **Clone repositori**:
   ```bash
   git clone https://github.com/salmonxz/Intern-Hub.git
   cd Intern-Hub
   ```

2. **Pasang dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan aplikasi (Mode Development)**:
   ```bash
   npm run dev
   ```
   *Perintah ini akan menjalankan server Express (port 3001) dan client Vite (port 5173) secara bersamaan melalui `concurrently`.*

4. **Buka di peramban**:
   Akses antarmuka aplikasi melalui:
   ```
   http://localhost:5173
   ```
   *(Backend API beroperasi di `http://localhost:3001`)*

---

## 📦 Pembangunan & Distribusi (Build & Production)

### 1. Build Web Production Bundle
Untuk mengompilasi bundel statis React:
```bash
npm run build
```
Hasil kompilasi akan tersimpan di dalam direktori `dist/`.

### 2. Kompilasi Desktop Launcher (`InternBPS.exe`)
Untuk menghasilkan file executable mandiri Windows dengan ikon kustom:
```bash
npm run build:exe
```
Skrip ini akan secara otomatis:
1. Membangun bundle frontend Vite ke folder `dist/`.
2. Mengompilasi `launcher/InternBPS.cs` menggunakan *C# Compiler* bawaan Windows (`csc.exe`).
3. Membuat shortcut `InternBPS.lnk` di Desktop pengguna.

### 3. Pembuatan Paket Portable Standalone (`InternBPS-Portable.zip`)
Untuk membuat paket aplikasi portabel yang tidak memerlukan setup Node.js terpisah pada komputer target:
```bash
npm run build:portable
```
Hasil paket `.zip` siap pakai akan digenerate ke direktori utama proyek serta desktop pengguna.

---

## 🔒 Privasi Data & Pengaturan .gitignore

Repositori ini secara ketat mengabaikan file yang memuat data pribadi magang atau dependensi biner berukuran besar:
- `laporan_bps.sqlite` dan file basis data lokal (`*.sqlite`, `*.db`) tidak disertakan dalam pelacakan Git demi menjaga kerahasiaan data aktivitas pengguna. Skema tabel akan digenerate secara otomatis dan bersih saat pertama kali dijalankan.
- File dokumen yang diunggah ke direktori `uploads/` dikecualikan secara otomatis dari *version control*.
- File binary hasil build (`/dist/`, `/dist-portable/`, `*.exe`, `*.zip`) dikecualikan dari repositori untuk menjaga repositori tetap ramping dan efisien.

---

## 👤 Profil Penulis & Pengembang

Dikembangkan oleh **Reyhan Alfiansyah** ([@salmonxz](https://github.com/salmonxz))  
Program Magang / Praktik Kerja Lapangan — **Badan Pusat Statistik (BPS)**  
Tahun Pelaksanaan: **2026**
