# 📋 Catatan Rilis Bashirah — v1.1.0

Catatan rilis ini disusun secara tematik berdasarkan setiap fitur, arahan perbaikan, dan penambahan yang dilakukan:

---

### 1. 🔍 Peningkatan Bilah Pencarian (Search Bar)
* **Pencarian Dwimode (Surat & Ayat Global):** Bilah pencarian kini dilengkapi *scope switcher* instan untuk memilih pencarian nama surat/nomor surat atau penelusuran kata kunci terjemahan ayat di seluruh Al-Qur'an.
* **Indikator Kesiapan Offline:** Tampilan status *badge* yang mengonfirmasi apakah database terjemahan sudah tersimpan di perangkat sehingga pencarian dapat berjalan seketika tanpa koneksi internet.
* **Highlight Kata Kunci & Tautan Cepat:** Hasil pencarian ayat menampilkan penyorotan (*highlighting*) kata kunci yang dicari, cuplikan nomor ayat, dan navigasi langsung ke posisi ayat di surah terkait.
* **Optimasi Input & Tombol Hapus Cepat:** Responsivitas pengetikan dengan *debouncing* halus dan tombol hapus teks (*clear*) satu ketukan.

---

### 2. 🎧 Perbaikan Tata Letak Audio Player & Sidebar
* **Penyesuaian Layering Z-Index:** Memperbaiki masalah Audio Player yang sebelumnya menutupi menu navigasi sidebar. Panel sidebar kini ditempatkan pada layer prioritas (`z-[70]` dengan backdrop `z-[60]`), sedangkan Audio Player berada di bawahnya (`z-[50]`), sehingga seluruh tombol menu samping dapat diakses dengan leluasa tanpa tertutup pemutar audio.
* **Pemberian Ruang Aman di Tampilan Mushaf:** Penyesuaian *safe padding* di bagian bawah halaman (`pb-36 sm:pb-40`) saat audio sedang aktif, memastikan ayat-ayat terbawah tidak tertutup oleh bilah kontrol pemutar murottal.

---

### 3. 🕌 Jadwal Waktu Salat Otomatis & Pengaturan Lokasi
* **Pencarian Lokasi dengan Ketik Manual:** Pengguna kini dapat mengetik nama kota, kabupaten, kecamatan, hingga wilayah internasional secara langsung dengan dukungan *auto-complete* instan (50+ preset kota Indonesia secara offline + pencarian geocoding global).
* **Input Koordinat Manual (Lintang & Bujur):** Tersedia tab khusus untuk memasukkan titik koordinat desimal (*Latitude* & *Longitude*), nama lokasi spesifik (misal: pesantren/desa), serta opsi zona waktu (WIB, WITA, WIT, atau UTC kustom), lengkap dengan tombol pintas *"Isi Dari GPS"*.
* **Penyimpanan Lokasi Permanen:** Lokasi yang dipilih otomatis tersimpan di perangkat (`localStorage`) sehingga jadwal tetap aktif tanpa perlu mengatur ulang saat membuka aplikasi kembali.
* **Perbaikan Tampilan Tanggal di Ponsel:** *Badge* tanggal Hijriah kini dikunci dengan `whitespace-nowrap` agar tidak patah canggung (seperti huruf "H" yang turun sendiri ke baris baru), serta tanggal Masehi tertata rapi di bawahnya.
* **Kepastian Hisab 100% Offline:** Jadwal dihitung murni di perangkat menggunakan hisab astronomis matahari standar Kementerian Agama RI tanpa ketergantungan API jadwal eksternal harian.

---

### 4. 💰 Kalkulator Zakat Syar'i (Fokus Zakat Maal & Fitrah)
* **Penghapusan Zakat Penghasilan (Profesi):** Dihapus secara menyeluruh untuk menghindari perkara *khilafiyah* sesuai kesepakatan.
* **Fokus Fiqih Sesuai Jumhur 4 Mazhab:** Perhitungan difokuskan murni pada:
  - **Zakat Maal:** Harta simpanan, emas, dan tabungan dengan syarat nisab setara 85 gram emas serta kepemilikan genap 1 tahun (haul).
  - **Zakat Fitrah:** Makanan pokok 2,5 kg/jiwa atau konversi nilai rupiah.
* **Panduan Fiqih & Asnaf:** Disertai penjelasan rujukan dalil dan daftar 8 golongan penerima zakat (*asnaf*).

---

### 5. 🧭 Pemisahan Navigasi & Halaman (Jadwal Salat & Zakat)
* **Pemisahan Halaman Mandiri:** Jadwal Salat (`/prayer-times`) dan Kalkulator Zakat (`/zakat`) kini menjadi dua halaman terpisah dengan menu masing-masing di sidebar, menggantikan sistem tab sebelumnya yang kurang nyaman di perangkat mobile.
* **Tata Letak Kartu Tautan Responsif:** Pada layar ponsel, tombol aksi navigasi pada kartu rujukan di bagian bawah otomatis turun ke baris bawah selebar kartu (*full-width*), sehingga teks judul dan deskripsi tidak lagi terhimpit sempit.

---

### 6. 📖 Panduan Tanda Waqaf & Perbaikan Mushaf
* **Panduan Waqaf Interaktif Langsung di Mushaf:** Mengetuk tanda waqaf pada teks ayat langsung memunculkan jendela panduan berisi nama tanda, hukum bacaan, riwayat riwayat, dan contoh ayat.
* **Pembersihan False Positive (Kata Terditeksi Waqaf):** Menghapus karakter `\u06E2` (nun iqlab) dan pencocokan longgar pada data waqaf. Lafaz seperti `ٱلصِّرَٲطَ` dan `صِرَٲطَ` kini murni dirender sebagai kata biasa tanpa tanda waqaf keliru.
* **Perbaikan Galat React DOM Nesting:** Memperbaiki peringatan `<button>` di dalam `<button>` pada `VerseItem` dan `MushafTextView` dengan merender tombol kata dan tombol waqaf berdampingan secara rapi (*sibling elements*).
* **Pewarnaan & Sakelar Tajwid:** Penyesuaian 17 kaidah hukum tajwid sesuai warna mushaf standar dengan tombol sakelar cepat *"Warna Tajwid"* di bilah atas surah.

---

### 7. ⭐ Surat-Surat Pilihan di Beranda (Featured Surahs)
* **Tombol Ringkas di Layar Ponsel:** Tombol *Lihat Keutamaan & Dalil* pada deretan surat pilihan di halaman utama kini otomatis menjadi tombol *badge* ringkas **"Keutamaan >"** pada ponsel, mencegah teks patah menjadi dua baris dan menjaga kerapian *header*.
