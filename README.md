
# Basirah - Aplikasi Al-Quran Digital & Tadabbur

![Basirah App Banner](https://images.unsplash.com/photo-1609599006353-e629aaabfeae?q=80&w=1200&auto=format&fit=crop)

**Basirah** adalah aplikasi Al-Quran web modern (Progressive Web App) yang dirancang untuk memberikan pengalaman membaca, mendengar, dan mentadabburi Al-Quran yang nyaman, estetik, dan kaya fitur.

Aplikasi ini dibangun dengan fokus pada performa, aksesibilitas offline, dan desain antarmuka yang menenangkan jiwa.

## ✨ Fitur Utama

### 📖 Membaca & Belajar
*   **Al-Quran 30 Juz**: Teks Rasm Utsmani yang jelas dan mudah dibaca.
*   **Terjemahan & Tafsir**: Mendukung berbagai bahasa dan tafsir (Jalalayn, Kemenag RI, dll).
*   **Mode Mushaf**: Tampilan per halaman layaknya membaca Al-Quran cetak fisik.
*   **Tajwid Berwarna**: Membantu membaca dengan hukum tajwid yang benar.
*   **Terjemahan Perkata**: Memahami arti setiap kata dalam ayat.

### 🎧 Audio & Murottal
*   **Audio Player Canggih**: Pemutaran gapless (tanpa jeda) antar ayat.
*   **Pilihan Qari**: Beragam Qari ternama (Mishary Rashid, Sudais, Al-Ghamdi, dll).
*   **Mode Muraja'ah**: Fitur pengulangan (loop) per ayat atau rentang ayat untuk hafalan.
*   **Download Manager**: Unduh audio per surat atau full 30 juz untuk didengarkan offline.

### 🧠 Tadabbur & Refleksi
*   **Jurnal Tadabbur**: Tulis dan simpan catatan refleksi pribadi Anda untuk setiap ayat.
*   **Ayat Pelipur Lara**: Temukan ayat-ayat penenang berdasarkan emosi (Sedih, Cemas, Marah, dll).
*   **Indeks Topik**: Jelajahi ayat berdasarkan tema kehidupan (Keluarga, Rezeki, Sabar, dll).
*   **Kuis Al-Quran**: Uji wawasan Anda tentang Al-Quran dengan cara yang menyenangkan.

### 🛠️ Produktivitas
*   **Target Khatam**: Hitung target bacaan harian untuk mencapai khatam dalam waktu tertentu.
*   **Statistik Ibadah**: Heatmap visual untuk memantau konsistensi membaca setiap hari.
*   **Bookmark & Catatan**: Tandai ayat terakhir dibaca dan simpan catatan penting.
*   **Pencarian Cerdas**: Cari surat, ayat, atau terjemahan dengan cepat.

### ⚡ Teknis
*   **PWA (Progressive Web App)**: Dapat diinstal di HP/Desktop dan berjalan offline.
*   **Offline First**: Cache cerdas untuk gambar mushaf dan data teks menggunakan IndexedDB.
*   **Responsive Design**: Tampilan optimal di semua ukuran layar.

---

## 🛠️ Teknologi yang Digunakan

Aplikasi ini dibangun menggunakan stack teknologi modern:

*   **Frontend Framework**: [React](https://reactjs.org/) (TypeScript)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **State Management**: React Context API & Hooks
*   **Storage**: 
    *   `idb` (IndexedDB Wrapper) untuk data ayat dan konten besar.
    *   `Cache API` untuk gambar mushaf dan file audio.
    *   `LocalStorage` untuk preferensi pengguna sederhana.
*   **Fitur Khusus**: 
    *   `html2canvas` untuk fitur berbagi "Ayat Harian" sebagai gambar.

---

## 🚀 Cara Menjalankan (Development)

Pastikan Anda sudah menginstal [Node.js](https://nodejs.org/) di komputer Anda.

1.  **Clone repositori ini**
    ```bash
    git clone https://github.com/username/basirah-quran-app.git
    cd basirah-quran-app
    ```

2.  **Instal dependensi**
    ```bash
    npm install
    ```

3.  **Jalankan server development**
    ```bash
    npm run dev
    ```

4.  **Buka di browser**
    Akses `http://localhost:5173` (atau port yang ditampilkan di terminal).

---

## 📦 Build untuk Produksi

Untuk membuat versi produksi yang dioptimalkan:

```bash
npm run build
```

Hasil build akan berada di folder `dist`. Anda bisa men-deploy folder ini ke hosting statis seperti Vercel, Netlify, atau GitHub Pages.

---

## 📚 Sumber Data & Kredit

Aplikasi ini menggunakan data dan API terbuka dari komunitas pengembang Muslim:

*   **Teks Al-Quran & Metadata**: [Quran.com API](https://quran.com/api) & [Al-Quran Cloud](https://alquran.cloud/).
*   **Audio Murottal**: [EveryAyah.com](https://everyayah.com/).
*   **Gambar Mushaf**: [Quran.com Android Data](https://android.quran.com/).
*   **Font Arab**: Amiri (Google Fonts).

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah **GNU General Public License v3.0 (GPLv3)**. Lihat file `LICENSE` untuk detail selengkapnya.

Dibuat dengan ❤️ untuk umat. Semoga menjadi amal jariyah.
