# KPN Assessment Frontend
---
Aplikasi ini adalah bagian *frontend* dari KPN Assessment. Aplikasi ini bertanggung jawab untuk menampilkan data kepada pengguna dan memungkinkan interaksi melalui antarmuka yang intuitif. Data diambil dan dikirimkan ke *backend* menggunakan RESTful API yang berlokasi di repositori terpisah.

---

## Persyaratan Sistem

Pastikan developer memiliki semua yang dibutuhkan sebelum memulai.

- [Node.js](https://nodejs.org/) (versi disarankan: 18.x atau lebih baru)
- [npm](https://www.npmjs.com/) atau [Yarn](https://yarnpkg.com/) (npm direkomendasikan karena Vite default menggunakan npm)
- Koneksi internet untuk mengunduh dependensi
- **Backend API yang sedang berjalan:** Sebutkan di mana repositori backend-nya dan bagaimana cara menjalankannya. Contoh: "Aplikasi ini membutuhkan *backend API* dari repositori [backend](https://github.com/developerkpn/kpn-assessment-be.git). Pastikan *backend* sudah berjalan sebelum Anda menjalankan *frontend* ini."

---

## Instalasi
Langkah-langkah untuk menginstal dependensi proyek.

1. **Clone repositori ini:**
   ```bash
   git clone https://github.com/developerkpn/kpn-assessment-fe.git
   cd kpn-assessment-fe
2. **Install dependensi:**
   ```bash
   npm install
   
## Struktur Project
```bash
kpn-assessment-fe
├── public/                         # File statis 
│   ├── external_assessee.xlsx      # Template untuk assessee eksternal
│   ├── internal_assessee.xlsx      # Template untuk assessee internal
│   └── kpn-logo.png                # Logo KPN
├── src/
│   ├── assets/                     # Berkas aset seperti gambar, ikon, dll.  
│   ├── components                  # Komponen UI yang dapat digunakan kembali    
│   │   ├── batch/                  # Komponen terkait halaman batch
│   │   ├── common/                 # Komponen umum yang digunakan di berbagai tempat 
│   │   ├── forms/                  # Komponen berkaitan dengan pengisian form 
│   │   ├── question/               # Komponen terkait question
│   │   ├── report/                 # Komponen terkait halaman report
│   │   ├── subtest/                # Komponen terkait halaman subtest   
│   │   └── ...                     # Komponen lainnya
│   ├── error/                      # Komponen untuk menangani error
│   │   └── ErrorFallback.tsx
│   ├── hooks/                      # Custom hooks untuk logika bisnis
│   │   ├── useAPI.tsx              # Hook untuk berkomunikasi dengan API (e.g. post, put, delete, etc.)
│   │   ├── useDialog.tsx           # Hook untuk mengelola komponen dialog
│   │   ├── useFetch.tsx            # Hook untuk mengambil data dari API
│   │   └── ...                     # Hook lainnya
│   ├── loader                      # Komponen untuk memuat data
│   │   └── Loading.tsx
│   ├── pages/                      # Folder untuk halaman-halaman aplikasi
│   │   ├── client/                 # Halaman terkait assessee (e.g. halaman pengerjaan soal, proctoring, dll.)
│   │   ├── master-data/            # Halaman untuk mengelola data master (e.g. question, subtest, batch, dll.)
│   │   ├── report/                 # Halaman untuk membuat atau melihat report
│   │   └── ...                     # Halaman lainnya
│   ├── protector/                  # Komponen untuk melindungi rute aplikasi
│   │   └── RouteProtector.tsx
│   ├── providers/                  # Provider untuk mengelola state global
│   │   ├── LoadingProvider.tsx
│   │   └── SnackbarProvider.tsx
│   ├── types/                      # Definisi tipe TypeScript untuk berbagai entitas
│   ├── utils/                      # Berkas utilitas untuk fungsi umum
│   │   ├── api.ts                  # Fungsi untuk berkomunikasi dengan API
│   │   └── ...                     # Fungsi utilitas lainnya
│   ├── worker/                     # Berkas terkait worker untuk PDF rendering (gak lagi digunakan karena pdf dirender di server)
│   ├── App.tsx                     # Komponen utama aplikasi termasuk routing
│   ├── main.tsx                    # Titik masuk aplikasi
│   └── theme.tsx                   # Tema aplikasi (e.g. warna, font, dll.)
├── .env                            # Variabel lingkungan untuk konfigurasi API dari backend
├── package.json                    # Daftar dependensi dan skrip proyek
├── README.md                       # File ini!
└── vite.config.ts                  # Konfigurasi Vite untuk build dan pengembangan aplikasi      
```
## Script yang digunakan
* ```npm run dev```: Menjalankan aplikasi dalam mode pengembangan dengan hot-reloading.
* ```npm run build```: Membangun aplikasi untuk produksi ke folder ```dist/```. Pada file ```vite.config.ts``` hasil build akan diarahkan ke "../kpn-assessment-be/dist/public/build" hal tersebut perlu disesuaikan dengan penamaan dan lokasi folder project mu

untuk deployment bisa di baca pada repositori [backend](https://github.com/developerkpn/kpn-assessment-be.git)

