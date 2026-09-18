# 📖 Bashirah — Al-Quran Digital & Tadabbur

![Bashirah App Banner](https://images.unsplash.com/photo-1609599006353-e629aaabfeae?q=80&w=1200&auto=format&fit=crop)

> Aplikasi Al-Quran modern, estetik, dan berorientasi *offline-first* yang dirancang untuk menghadirkan pengalaman membaca, mendengar murottal, dan mentadabburi firman Allah SWT dengan nyaman, tenang, dan tanpa gangguan.

---

## 📌 Daftar Isi

- [Tentang Bashirah](#-tentang-bashirah)
- [Fitur Utama](#-fitur-utama)
  - [Membaca & Belajar](#-membaca--belajar)
  - [Audio & Muraja'ah](#-audio--murottal)
  - [Tadabbur & Ibadah](#-tadabbur--refleksi)
  - [Produktivitas & Kesiapan Offline](#-produktivitas--kesiapan-offline)
- [Unduh Aplikasi](#-unduh-aplikasi)
- [Teknologi & Arsitektur](#-teknologi--arsitektur)
- [Panduan Pengembang (Development)](#-panduan-pengembang-development)
  - [Prasyarat](#prasyarat)
  - [Menjalankan Lokal](#menjalankan-lokal)
  - [Target Platform (Android & Desktop)](#target-platform-android--desktop)
- [Sumber Data & Atribusi](#-sumber-data--atribusi)
- [Dukungan & Donasi](#-dukungan--donasi)
- [Lisensi & Perjanjian Pengguna](#-lisensi--perjanjian-pengguna)
- [Ucapan Terima Kasih](#-ucapan-terima-kasih)

---

## 🌿 Tentang Bashirah

**Bashirah** adalah aplikasi Al-Quran multi-platform yang dapat dijalankan sebagai **Progressive Web App (PWA)** di peramban, aplikasi **Android Native** melalui Capacitor, maupun aplikasi **Desktop (Windows/macOS/Linux)** melalui Electron.

Fokus utama Bashirah adalah:
1. **Offline-First**: Semua data esensial (teks ayat, tajwid, navigasi halaman/juz/hizb, dan catatan) dapat diakses tanpa koneksi internet.
2. **Kenyamanan Visual & Tipografi**: Dilengkapi pilihan font mushaf klasik hingga modern (Uthmani Hafs, IndoPak, Nastaleeq, ME Quran) serta ukuran teks yang dapat disesuaikan.
3. **Mendalam**: Tidak hanya sekadar membaca, melainkan memfasilitasi tadabbur ayat, tafsir, pemahaman per kata, hingga murottal berulang (hifz/muraja'ah).

---

## ✨ Fitur Utama

### 📖 Membaca & Belajar
- **Al-Quran 30 Juz (114 Surat)**: Teks Rasm Utsmani dan IndoPak yang jernih dan nyaman di mata.
- **Mode Mushaf Halaman**: Tampilan per halaman fisik menyerupai mushaf cetak dengan pilihan riwayat (Madani, IndoPak, Warsh, Qaloon).
- **Tajwid Berwarna**: Pewarnaan tajwid interaktif dengan panduan kaidah bacaan untuk memfasilitasi tilawah yang tartil.
- **Terjemahan & Tafsir Lengkap**: Terjemahan bahasa Indonesia & Inggris, dilengkapi tafsir terpercaya (Kemenag RI, Jalalayn, Ibnu Katsir).
- **Terjemahan Per Kata (Word-by-Word)**: Dilengkapi morfologi akar kata (root words) dan frekuensi kemunculan lafaz di dalam Al-Quran.

### 🎧 Audio & Murottal
- **Gapless Audio Player**: Pemutaran audio ayat berkesinambungan tanpa jeda yang mengganggu.
- **Pilihan Qari Internasional**: Murottal dari para syaikh terkemuka (Ali Huthaify, Abdurrahman As-Sudais, dll.).
- **Mode Muraja'ah & Hifz**: Pengulangan fleksibel (per ayat atau rentang ayat) dengan hitungan pengulangan kustom atau tanpa batas (*infinite loop*).
- **Manajer Unduhan Offline**: Unduh audio per surat atau seluruh juz dengan dukungan *task-based resume* jika koneksi terputus.

### 🧠 Tadabbur & Refleksi
- **Jurnal Tadabbur Pribadi**: Catat perenungan dan hikmah ayat langsung ke ruang catatan yang terenkripsi lokal.
- **Ayat Pelipur Lara (Kondisi Hati)**: Temukan bimbingan dan penawar dari Al-Quran saat merasakan sedih, cemas, ragu, atau bersyukur.
- **Indeks Tematik**: Telusuri ayat-ayat pilihan berdasarkan tema ibadah, akhlak, muamalah, akidah, dan kisah para nabi.
- **Asmaul Husna**: 99 Nama Allah lengkap dengan makna, dalil ayat rujukan, dan penjelasan.
- **Kuis Al-Quran**: Asah dan uji wawasan seputar isi dan sejarah Al-Quran secara interaktif.

### 🛠️ Produktivitas & Kesiapan Offline
- **Target Khatam Terukur**: Kalkulasi target halaman harian, estimasi tanggal khatam, dan tren kecepatan tilawah.
- **Heatmap Aktivitas Ibadah**: Visualisasi kalender tilawah harian untuk menjaga konsistensi (*istiqamah*).
- **Mode Hafalan**: Sembunyikan sebagian atau seluruh lafaz ayat (blur, ghost, first & last word) untuk menguji kekuatan hafalan.
- **Pencarian Cepat & Global**: Cari surat, nama surat, nomor ayat, atau kata kunci terjemahan secara instan.
- **Cadangkan & Pulihkan (Backup/Restore)**: Ekspor dan impor catatan, bookmark, serta progres khatam dalam format JSON.

---

## 📥 Unduh Aplikasi

Bashirah dapat digunakan langsung di web atau dipasang ke perangkat Anda:

| Platform | Distribusi | Keterangan |
| :--- | :--- | :--- |
| **Web / PWA** | [Buka di Browser](https://bashirah.aiprojek01.my.id) | Klik tombol *"Install App"* / *"Add to Home Screen"* |
| **Android** | APK Installer | Tersedia pada halaman rilis repositori |
| **Desktop** | Windows / macOS / Linux | Paket installer installer mandiri (Electron) |

> 🔗 Kunjungi halaman rilis untuk mengunduh versi biner terbaru:  
> [**GitHub Releases — Bashirah**](https://github.com/aiprojek/Bashirah/releases)

---

## 🛠️ Teknologi & Arsitektur

Bashirah dirancang dengan prinsip modularitas tinggi, pemisahan dependensi yang bersih, dan skalabilitas data:

- **Frontend Core**: [React](https://react.dev/) 18, [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Styling & UI**: [Tailwind CSS](https://tailwindcss.com/), [Lucide React Icons](https://lucide.dev/)
- **Penyimpanan Lokal (Persistence)**:
  - `IndexedDB` (via `idb`) untuk profil pengguna, bookmark, catatan tadabbur, task unduhan, riwayat khatam, dan cache teks.
  - `Cache API` untuk berkas audio murottal dan halaman gambar mushaf.
- **Runtimes Native**:
  - **Android**: [@capacitor/core](https://capacitorjs.com/) & Capacitor CLI
  - **Desktop**: [Electron](https://www.electronjs.org/)

---

## 🚀 Panduan Pengembang (Development)

### Prasyarat
- [Node.js](https://nodejs.org/) versi 18.x atau 20.x LTS
- Manajer paket `npm` (atau `pnpm` / `yarn`)

### Menjalankan Lokal

1. **Kloning Repositori**:
   ```bash
   git clone https://github.com/aiprojek/Bashirah.git
   cd Bashirah
   ```

2. **Pasang Dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan Server Development**:
   ```bash
   npm run dev
   ```
   Buka peramban di `http://localhost:3000` (atau port yang tertera pada konsol).

4. **Kompilasi / Build Produksi**:
   ```bash
   npm run build
   ```

### Target Platform (Android & Desktop)

- **Menjalankan Target Android (Capacitor)**:
  ```bash
  npm run android
  ```
- **Membangun Paket Desktop (Electron)**:
  ```bash
  npm run electron:build
  ```

---

## 📚 Sumber Data & Atribusi

Kami berterima kasih kepada penyedia data terbuka Al-Quran yang memungkinkan aplikasi ini terwujud:

- **Teks Al-Quran**: [quran-json oleh Risan](https://github.com/risan/quran-json).
- **Murottal Audio, Lembar Mushaf, & Tajwid**: [Al-Quran Cloud API](https://alquran.cloud/api).
- **Morfologi & Data Pengayaan Quran**: [Quranic Universal Library (QUL)](https://qul.tarteel.ai/) oleh Tarteel.

---

## 💖 Dukungan & Donasi

Bagi Anda yang ingin mendukung keberlangsungan pengembangan, pemeliharaan server, dan penambahan fitur-fitur baru aplikasi Bashirah, Anda dapat menyalurkan donasi dukungan melalui tautan berikut:

👉 [**Donasi Dukungan Pengembangan Aplikasi (Lynk.id)**](https://lynk.id/aiprojek/s/bvBJvdA)

Dukungan Anda sangat berarti untuk memajukan inovasi teknologi Al-Quran terbuka bagi umat. *Jazakumullahu khairan katsiran.*

---

## 📜 Lisensi & Perjanjian Pengguna

Aplikasi ini didistribusikan di bawah lisensi terbuka [GNU General Public License v3.0 (GPL-3.0)](https://www.gnu.org/licenses/gpl-3.0.html).

Anda bebas menggunakan, memodifikasi, dan mendistribusikan aplikasi ini dengan tetap menyertakan atribusi sumber terbuka dan lisensi yang sama.

---

## 🤲 Ucapan Terima Kasih

Pengembangan Bashirah didukung oleh riset pustaka Islam terbuka dan bantuan model AI generatif (Gemini, Codex, Antigravity, dan AI Studio) untuk refaktorisasi kode, optimasi algoritma data offline, serta penajaman desain antarmuka.

Semoga aplikasi ini dapat menjadi amal jariyah dan memberikan manfaat luas bagi kaum muslimin di mana pun berada.  
*Barakallahu fiikum.*
