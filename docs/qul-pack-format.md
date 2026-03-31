# QUL Pack Format

These are the local JSON pack formats expected by Bashirah phase 1 integration.

## 1. Word Morphology Pack

Default local path:

`/public/qul/word-morphology-pack.json`

Expected JSON:

```json
[
  {
    "surahId": 1,
    "verseId": 1,
    "wordPosition": 1,
    "token": "بِسْمِ",
    "partOfSpeech": "Noun",
    "grammar": "Genitive noun",
    "morphology": "ism majrur",
    "root": "اسم",
    "lemma": "اسم",
    "stem": "بسم",
    "description": "Kata pembuka yang menunjukkan permulaan dengan nama Allah.",
    "source": "QUL"
  }
]
```

## 2. Surah Info Pack

Default local path:

`/public/qul/surah-info-pack.json`

Expected JSON:

```json
[
  {
    "surahId": 1,
    "text": "<p>Teks utama info surat.</p>",
    "source": "QUL",
    "short_text": "Ringkasan singkat",
    "summary": "Ikhtisar kandungan surat.",
    "revelation_background": "Latar turunnya surat.",
    "main_themes": ["Tauhid", "Doa", "Ibadah"],
    "key_topics": ["Pembukaan Quran", "Petunjuk", "Rahmat"],
    "language": "id"
  }
]
```

## Notes

- `wordPosition` should match the word order used by Bashirah word-by-word data.
- `text` in surah info can contain trusted HTML.
- packs are optional and safe to omit; the UI will fall back gracefully.
