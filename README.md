
# Bashirah - Aplikasi Al-Quran Digital & Tadabbur

![Basirah App Banner](https://images.unsplash.com/photo-1609599006353-e629aaabfeae?q=80&w=1200&auto=format&fit=crop)

**Bashirah** adalah aplikasi Al-Quran web modern (Progressive Web App / PWA) yang dirancang untuk memberikan pengalaman membaca, mendengar, dan mentadabburi Al-Quran yang nyaman, estetik, dan menenangkan jiwa.

Aplikasi ini dibangun dengan teknologi web terbaru, mendukung penggunaan offline (setelah unduh data), dan memiliki antarmuka responsif yang optimal di Ponsel, Tablet, maupun Desktop.

## ✨ Fitur Utama

### 📖 Membaca & Belajar
*   **Al-Quran 30 Juz**: Teks Rasm Utsmani yang jelas.
*   **Terjemahan & Tafsir**: Mendukung berbagai bahasa dan tafsir (Jalalayn, Kemenag RI, dll).
*   **Mode Mushaf**: Tampilan per halaman layaknya membaca Al-Quran cetak fisik (Madani, IndoPak).
*   **Tajwid Berwarna**: Membantu membaca dengan hukum tajwid yang benar.
*   **Terjemahan Perkata**: Memahami arti setiap kata dalam ayat.

### 🎧 Audio & Murottal
*   **Audio Player Canggih**: Pemutaran gapless (tanpa jeda).
*   **Pilihan Qari**: Beragam Qari ternama (Mishary Rashid, Sudais, dll).
*   **Mode Muraja'ah**: Fitur pengulangan (loop) per ayat atau rentang ayat.
*   **Download Manager**: Unduh audio per surat atau full 30 juz untuk didengarkan offline.

### 🧠 Tadabbur & Refleksi
*   **Jurnal Tadabbur**: Tulis dan simpan catatan refleksi pribadi Anda.
*   **Ayat Pelipur Lara**: Temukan ayat-ayat penenang berdasarkan emosi (Sedih, Cemas, Marah).
*   **Indeks Topik**: Jelajahi ayat berdasarkan tema kehidupan.
*   **Kuis Al-Quran**: Uji wawasan Anda tentang Al-Quran.

### 🛠️ Produktivitas & Teknis
*   **Target Khatam**: Hitung target bacaan harian.
*   **Statistik Ibadah**: Heatmap visual untuk memantau konsistensi.
*   **PWA (Offline Ready)**: Dapat diinstal di HP/Desktop dan data berat (Audio/Gambar) disimpan di Cache browser secara eksplisit agar hemat kuota.

---

## 🛠️ Teknologi

*   **Frontend**: React, TypeScript, Vite
*   **Styling**: Tailwind CSS
*   **Icons**: Lucide React
*   **Storage**: IndexedDB (`idb`), Cache API (untuk Audio & Gambar Mushaf)
*   **PWA**: `vite-plugin-pwa`

---

## 🚀 Cara Menjalankan

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

4.  **Build untuk Produksi**
    ```bash
    npm run build
    ```

---

## 📚 Sumber Data

*   **Teks Al-Quran & Metadata**: [Quran.com API](https://quran.com/api) & [Al-Quran Cloud](https://alquran.cloud/).
*   **Audio Murottal**: [EveryAyah.com](https://everyayah.com/).
*   **Gambar Mushaf**: [Quran.com Android Data](https://android.quran.com/).

Dibuat dengan ❤️ untuk umat.