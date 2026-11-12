# CampusCare — Sistem Pelaporan dan Penanganan Kerusakan Fasilitas Kampus

CampusCare adalah prototipe aplikasi web untuk demonstrasi pipeline pengembangan perangkat lunak berbantuan AI Hero Agent Skills. Aplikasi ini dibuat menggunakan HTML, CSS, dan JavaScript murni; tidak memerlukan instalasi framework atau server database.

## 1. Cara menjalankan
1. Ekstrak file ZIP.
2. Buka folder `CampusCare`.
3. Klik dua kali `index.html` atau buka melalui browser (Chrome, Edge, Firefox).
4. Masuk menggunakan salah satu akun demo di bawah.

> Koneksi internet hanya dibutuhkan untuk memuat font Google Fonts. Aplikasi dan data tetap dapat digunakan secara lokal tanpa koneksi internet.

## 2. Akun demonstrasi

Semua akun menggunakan kata sandi `campus123`.

| Peran | Email |
|---|---|
| Pelapor | pelapor@campuscare.id |
| Petugas Fasilitas | petugas@campuscare.id |
| Administrator | admin@campuscare.id |

Gunakan tombol akun demo di halaman login untuk mengisi email secara otomatis.

## 3. Fitur

### Pelapor
- Melihat dashboard dan laporan miliknya.
- Membuat laporan kerusakan fasilitas.
- Memilih kategori, lokasi, prioritas, dan deskripsi.
- Melihat detail, status, catatan petugas, dan riwayat.
- Mengubah atau menghapus laporan selama status masih `Diajukan`.

### Petugas Fasilitas
- Melihat seluruh laporan.
- Mencari dan memfilter laporan.
- Melihat detail dan riwayat.
- Memperbarui status menjadi Diverifikasi, Dalam Penanganan, Selesai, atau Ditolak.
- Menambahkan catatan tindak lanjut.

### Administrator
- Memiliki akses pemantauan seluruh laporan.
- Mengelola kategori laporan.
- Melihat daftar akun dan matriks hak akses.
- Melihat serta membersihkan log aktivitas.
- Mengekspor laporan ke CSV.

### Fitur umum
- Dashboard statistik.
- Pencarian dan filter.
- Desain responsif untuk desktop dan ponsel.
- Penyimpanan data menggunakan `localStorage`.

## 4. Alur status laporan

`Diajukan → Diverifikasi → Dalam Penanganan → Selesai`

Petugas juga dapat mengubah status menjadi `Ditolak` jika laporan tidak dapat ditindaklanjuti. Prototipe ini tidak menerapkan aturan transisi status yang kaku agar demonstrasi lebih mudah.

## 5. Struktur folder

```text
CampusCare/
├── index.html
├── styles.css
├── app.js
└── README.md
```

## 6. Penyimpanan dan reset data

Data disimpan di browser yang digunakan melalui `localStorage` dengan key `campuscare_v1`. Data tidak otomatis tersinkron antarperangkat atau antar-browser.

Untuk mengembalikan data contoh:
1. Buka CampusCare.
2. Tekan `F12` untuk membuka Developer Tools.
3. Pilih tab Console.
4. Jalankan:

```javascript
localStorage.removeItem("campuscare_v1");
sessionStorage.removeItem("campuscare_user");
location.reload();
```

## 7. Batasan prototipe

Aplikasi ini adalah demonstrasi front-end, bukan sistem produksi. Akun dan kata sandi demo ditanam di JavaScript, pergantian peran hanya untuk simulasi, dan `localStorage` tidak menyediakan keamanan maupun kontrol akses server. Jangan gunakan data pribadi atau data operasional kampus yang sebenarnya.

Jika dikembangkan menjadi sistem nyata, diperlukan:
- Backend/API dan database.
- Autentikasi dan otorisasi server-side.
- Penyimpanan bukti foto yang aman.
- Validasi dan sanitasi input di server.
- Audit log yang tidak dapat dimodifikasi pengguna.
- Pengujian keamanan, backup, dan deployment.

## 8. Kaitan dengan pipeline Matt Pocock Agent Skills

Gunakan proyek ini sebagai studi kasus untuk membuktikan tahapan:
1. **Setup** — repository, panduan agen, aturan kontribusi, branching.
2. **Grill With Docs** — klarifikasi kebutuhan dan keputusan.
3. **To Spec** — spesifikasi fitur, aturan bisnis, acceptance criteria.
4. **To Tickets** — pemecahan spesifikasi menjadi issue.
5. **Implement + TDD** — implementasi bertahap dan test.
6. **Code Review** — pemeriksaan perubahan terhadap requirement dan test.
7. **Retro** — evaluasi proses dan rencana perbaikan.

Kode yang tersedia merupakan prototipe demonstrasi. Untuk tugas pipeline, dokumentasikan bagaimana setiap artefak dihasilkan dan diperiksa; jangan mengklaim bahwa seluruh tahapan skill dijalankan jika belum ada bukti pelaksanaannya.
