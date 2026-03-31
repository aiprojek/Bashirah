# Riset Mapping Glyph QCF

Sumber yang diperiksa:
- `public/qul/fonts/QCF_SurahHeader_COLOR-Regular.ttf`
- `public/qul/fonts/surah_names.ttf`

Metode yang dipakai:
- `fc-query` lokal untuk membaca `charset` dan metadata font

## Temuan Inti

### 1. `QCF_SurahHeader_COLOR-Regular.ttf`
- family: `QCF_SurahHeader_COLOR`
- tipe: color font (`COLR`)
- jumlah codepoint non-spasi: `114`

Ini adalah temuan paling penting. Karena jumlah glyph non-spasi tepat `114`, ada indikasi sangat kuat bahwa:

`surah 1..114 -> glyph 1..114 secara berurutan`

Artinya font header ini sangat mungkin dipakai dengan mapping praktis:
- surat 1 = codepoint pertama
- surat 2 = codepoint kedua
- ...
- surat 114 = codepoint ke-114

### 2. `surah_names.ttf`
- family: `QCF_FullSurah_HD_COLOR-v1`
- tipe: color font (`CPAL`)
- jumlah codepoint non-spasi: `162`

Font ini berisi:
- `114` codepoint awal yang sama dengan font header
- `48` codepoint tambahan

Implikasinya:
- `114 glyph` awal kemungkinan besar mengikuti urutan surat yang sama
- `48 glyph` sisanya kemungkinan besar adalah variasi dekoratif / bentuk tambahan / glyph pendukung

## Codepoint Set Praktis

### Shared base set
Kedua font berbagi urutan awal yang sama:

- mulai dari `0xFB51`
- berlanjut melalui blok `FBxx`
- lalu masuk ke blok `FCxx`
- berakhir di `0xFC64` untuk font header

### Extra set pada `surah_names.ttf`
Tambahan hanya ada di:

- `0xFC8A` sampai `0xFCB9`

## Kesimpulan Praktis

### Yang sudah cukup aman dipakai
- `QCF_SurahHeader_COLOR-Regular.ttf` bisa dianggap punya mapping langsung `surahId -> glyph index`

### Yang masih butuh verifikasi visual
- `surah_names.ttf`
- alasan:
  - punya `48 glyph` tambahan
  - belum ada bukti lokal bahwa glyph ke-1..114 mewakili “full surah name” final yang memang kita inginkan di UI

## Rekomendasi Implementasi

### Tahap 1
Pakai font header QCF lebih dulu:
- buat helper `getQcfSurahHeaderGlyph(surahId)`
- render dengan `String.fromCodePoint(...)`
- font family: `QCF_SurahHeader_COLOR`

### Tahap 2
Uji visual `surah_names.ttf`:
- bandingkan glyph `1..114`
- cek apakah setiap glyph memang lebih cocok untuk “nama surat penuh”
- cek apakah glyph tambahan `FC8A..FCB9` diperlukan

## Artefak Kode

Helper riset yang sudah dibuat:
- [constants/qcfGlyphs.ts](/home/abdullah-home/Documents/GitHub/Bashirah/constants/qcfGlyphs.ts)

Helper itu menyediakan:
- `QCF_SURAH_HEADER_CODEPOINTS`
- `QCF_SURAH_NAME_CODEPOINTS`
- `getQcfSurahHeaderGlyph(surahId)`
- `getQcfSurahNameGlyphCandidate(surahId)`

## Catatan Penting

Font ini bukan font Arab biasa untuk string teks umum.

Jadi pendekatannya bukan:
- ganti `font-family` pada teks Arab biasa

Tetapi:
- pakai glyph yang sudah dipetakan per surat
- render glyph spesifik hasil mapping
