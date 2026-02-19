
# Bashirah - Aplikasi Al-Quran Digital & Tadabbur

![Basirah App Banner](https://images.unsplash.com/photo-1609599006353-e629aaabfeae?q=80&w=1200&auto=format&fit=crop)

**Bashirah** adalah aplikasi Al-Quran web modern (Progressive Web App / PWA) dan Native (Android/Desktop) yang dirancang untuk memberikan pengalaman membaca, mendengar, dan mentadabburi Al-Quran yang nyaman, estetik, dan menenangkan jiwa.

Aplikasi ini dibangun dengan teknologi web, mendukung penggunaan offline (setelah unduh data), dan memiliki antarmuka responsif yang optimal.

## 📥 Unduh Aplikasi

Dapatkan versi terbaru untuk perangkat Anda (Android APK, Windows, macOS, Linux) di halaman Rilis:

[**🔗 Unduh Bashirah (GitHub Releases)**](https://github.com/aiprojek/Bashirah/releases)

---

## ✨ Fitur Utama

### 📖 Membaca & Belajar
*   **Al-Quran 30 Juz**: Teks Rasm Utsmani yang jelas.
*   **Terjemahan & Tafsir**: Mendukung berbagai bahasa dan tafsir (Jalalayn, Kemenag RI, Ibnu Katsir, dll).
*   **Mode Mushaf**: Tampilan per halaman layaknya membaca Al-Quran cetak fisik dengan dukungan berbagai riwayat (Madani, IndoPak, Warsh, Qaloon, dll).
*   **Tajwid Berwarna**: Membantu membaca dengan hukum tajwid yang benar.
*   **Terjemahan Perkata**: Memahami arti setiap kata dalam ayat.

### 🎧 Audio & Murottal
*   **Audio Player Canggih**: Pemutaran gapless (tanpa jeda).
*   **Pilihan Qari**: Beragam Qari ternama (Mishary Rashid, Sudais, dll).
*   **Mode Muraja'ah**: Fitur pengulangan (loop) per ayat atau rentang ayat untuk hafalan.
*   **Download Manager**: Unduh audio per surat atau full 30 juz untuk didengarkan offline.

### 🧠 Tadabbur & Refleksi
*   **Jurnal Tadabbur**: Tulis dan simpan catatan refleksi pribadi Anda.
*   **Ayat Pelipur Lara**: Temukan ayat-ayat penenang berdasarkan emosi (Sedih, Cemas, Marah, dll).
*   **Indeks Topik**: Jelajahi ayat berdasarkan tema kehidupan.
*   **Kuis Al-Quran**: Uji wawasan Anda tentang Al-Quran.
*   **Asmaul Husna**: Pelajari 99 nama Allah yang indah.

### 🛠️ Produktivitas & Teknis
*   **Target Khatam**: Hitung target bacaan harian dan pantau progres.
*   **Statistik Ibadah**: Heatmap visual untuk memantau konsistensi membaca.
*   **Backup & Restore**: Amankan data catatan dan bookmark Anda ke dalam file JSON.
*   **Multi-Platform**: Tersedia sebagai PWA (Web), Android, dan Desktop.

---

## 🛠️ Teknologi

*   **Frontend**: React, TypeScript, Vite
*   **Styling**: Tailwind CSS
*   **Icons**: Lucide React
*   **Storage**: IndexedDB (`idb`), Cache API (untuk Audio & Gambar Mushaf)
*   **Build System**: Tauri v2 (untuk Native Apps)

---

## 🚀 Cara Menjalankan (Development)

1.  **Clone repositori**
    ```bash
    git clone https://github.com/aiprojek/basirah.git
    cd basirah
    ```

2.  **Instal dependensi**
    ```bash
    npm install
    ```

3.  **Jalankan server development**
    ```bash
    npm run dev
    ```
    Untuk mode desktop (Tauri):
    ```bash
    npm run tauri dev
    ```

4.  **Build untuk Produksi**
    ```bash
    npm run tauri build
    ```

---

## 📚 Sumber Data

*   **Teks Al-Quran & Metadata**: [github.com/risan/quran-json](https://github.com/risan/quran-json).
*   **Audio Murottal & Gambar Mushaf**: [Al-Quran Cloud](https://alquran.cloud/api).

Dibuat dengan ❤️ untuk umat.
