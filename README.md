# Bashirah - Aplikasi Al-Quran Digital & Tadabbur

![Basirah App Banner](https://images.unsplash.com/photo-1609599006353-e629aaabfeae?q=80&w=1200&auto=format&fit=crop)

**Bashirah** adalah aplikasi Al-Quran web modern (Progressive Web App / PWA) dan Native (Android/Desktop) yang dirancang untuk memberikan pengalaman membaca, mendengar, dan mentadabburi Al-Quran yang nyaman, estetik, dan menenangkan jiwa.

Aplikasi ini dibangun dengan teknologi web terbaru, mendukung penggunaan offline (setelah unduh data), dan memiliki antarmuka responsif yang optimal.

## 🆕 Release Notes (Versi 20260309)

Rilis ini fokus pada tiga hal: **offline-first**, **kenyamanan mobile**, dan **keandalan native Android**.

### 1) Offline & Data

- Penanda **Halaman, Juz, Hizb, dan Ruku** sekarang siap offline dari awal (tanpa menunggu cache jaringan).
- Strategi data dioptimalkan ke **offline-first** pada alur penting (mushaf/page verses, pencarian, fallback konten).
- Pencarian offline ditingkatkan: tetap bisa mencari ayat walau data terjemahan belum diunduh (fallback teks Arab lokal).

### 2) Unduhan & Resume

- Ditambahkan penyimpanan task unduhan (`download_tasks`) di IndexedDB.
- Unduhan audio dan mushaf kini mendukung **resume** dari progres terakhir.
- Pengaturan kini punya panel **Unduhan Tertunda** untuk lanjut 1 klik.
- Ditambahkan panel **Status Kesiapan Offline** untuk memantau kelengkapan data offline.

### 3) UX Mobile & Navigasi

- Banyak komponen mobile dipoles (touch target, wrapping, spacing) agar lebih nyaman.
- Mode mushaf mendapat animasi ganti halaman dengan kesan lembar buku.
- Gesture sentuh:
  - Swipe antar halaman di mode mushaf.
  - Swipe antar surat di mode list.
  - Diperketat jadi **edge swipe only** agar tidak mudah kepicu saat scroll.
- Tombol back Android kini mengikuti pola native:
  - kembali ke halaman sebelumnya,
  - double-back untuk keluar dari beranda.

### 4) Ringkasan Dampak ke Pengguna

- Aplikasi lebih siap dipakai saat koneksi lambat atau tanpa internet.
- Pengalaman baca di ponsel jadi lebih natural dan minim salah sentuh.
- Pengguna tidak perlu mengulang unduhan dari awal ketika proses terputus.

## 📥 Unduh Aplikasi

Dapatkan versi terbaru untuk perangkat Anda (Android APK, Windows, macOS, Linux) di halaman Rilis:

[**🔗 Unduh Bashirah (GitHub Releases)**](https://github.com/aiprojek/Bashirah/releases)

---

## ✨ Fitur Utama

### 📖 Membaca & Belajar

- **Al-Quran 30 Juz**: Teks Rasm Utsmani yang jelas.
- **Terjemahan & Tafsir**: Mendukung berbagai bahasa dan tafsir (Jalalayn, Kemenag RI, Ibnu Katsir, dll).
- **Mode Mushaf**: Tampilan per halaman layaknya membaca Al-Quran cetak fisik dengan dukungan berbagai riwayat (Madani, IndoPak, Warsh, Qaloon, dll).
- **Tajwid Berwarna**: Membantu membaca dengan hukum tajwid yang benar.
- **Terjemahan Perkata**: Memahami arti setiap kata dalam ayat.

### 🎧 Audio & Murottal

- **Audio Player Canggih**: Pemutaran gapless (tanpa jeda).
- **Pilihan Qari**: Beragam Qari ternama (Mishary Rashid, Sudais, dll).
- **Mode Muraja'ah**: Fitur pengulangan (loop) per ayat atau rentang ayat untuk hafalan.
- **Download Manager**: Unduh audio per surat atau full 30 juz untuk didengarkan offline.

### 🧠 Tadabbur & Refleksi

- **Jurnal Tadabbur**: Tulis dan simpan catatan refleksi pribadi Anda.
- **Ayat Pelipur Lara**: Temukan ayat-ayat penenang berdasarkan emosi (Sedih, Cemas, Marah, dll).
- **Indeks Topik**: Jelajahi ayat berdasarkan tema kehidupan.
- **Kuis Al-Quran**: Uji wawasan Anda tentang Al-Quran.
- **Asmaul Husna**: Pelajari 99 nama Allah yang indah.

### 🛠️ Produktivitas & Teknis

- **Target Khatam**: Hitung target bacaan harian dan pantau progres.
- **Statistik Ibadah**: Heatmap visual untuk memantau konsistensi membaca.
- **Backup & Restore**: Amankan data catatan dan bookmark Anda ke dalam file JSON.
- **Resume Download**: Lanjutkan unduhan audio/mushaf yang terputus.
- **Multi-Platform**: Tersedia sebagai PWA (Web), Android, dan Desktop.

---

## 🛠️ Teknologi

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Storage**: IndexedDB (`idb`), Cache API (untuk Audio & Gambar Mushaf)
- **Runtime Native**:
  - Android: Capacitor
  - Desktop: Electron

---

## 🔄 Migrasi Teknologi

- **Local Storage ➜ IndexedDB**  
  Migrasi data user (bookmark, catatan, history, pengaturan) untuk stabilitas dan skala data yang lebih baik.

- **Cache Audio/Mushaf v1 ➜ v2**  
  Diterapkan versioning cache yang lebih ketat dengan kompatibilitas data lama.

- **Online-first ➜ Offline-first**  
  Jalur data penting kini memprioritaskan data lokal agar aplikasi cepat dan stabil di koneksi lemah.

- **Unduhan stateless ➜ task-based resume**  
  Progress unduhan kini persist di IndexedDB, dapat dilanjutkan tanpa mengulang dari nol.

---

## 🗺️ Roadmap Singkat

### Berikutnya (Near-term)

- Penyempurnaan animasi transisi mushaf agar tetap halus di perangkat low-end.
- Optimasi performa daftar surat panjang (virtualized rendering yang lebih agresif).
- Pemerataan polish komponen mobile (tombol, jarak, dan state loading/error).

### Menengah (Mid-term)

- Smart prefetch data ayat/audio berdasarkan pola baca pengguna.
- Paket offline per tema (mis. “paket hafalan”, “paket tafsir ringkas”).
- Observabilitas lokal untuk mendeteksi kegagalan unduhan/cache lebih dini.

---

## 🚀 Cara Menjalankan (Development)

1.  **Clone repositori**

    ```bash
    git clone https://github.com/aiprojek/Bashirah.git
    cd Bashirah
    ```

2.  **Instal dependensi**

    ```bash
    npm install
    ```

3.  **Jalankan server development**

    ```bash
    npm run dev
    ```

    Untuk Android (Capacitor):

    ```bash
    npm run android
    ```

    Untuk build desktop (Electron):

    ```bash
    npm run electron:build
    ```

4.  **Build untuk Produksi**
    ```bash
    npm run build
    ```

---

## 📚 Sumber Data

- **Teks Al-Quran & Metadata**: [Github Risan](https://github.com/risan/quran-json).
- **Audio Murottal, Gambar Mushaf, Audio, Tajwid**: [Al-Quran Cloud](https://alquran.cloud/api).

---

## 🤖 Bantuan AI dalam Pengembangan

Pengembangan Bashirah dibantu oleh beberapa asisten AI untuk riset, refactor, validasi logika, dan percepatan iterasi:

- **Gemini**
- **GPT Codex**
- **Antigravity**

Barakallahu fiikum.
