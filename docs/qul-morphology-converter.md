# QUL Morphology Converter

QUL morphology may be distributed as SQLite, while Bashirah expects a JSON pack.

This converter turns a SQLite table into:

`public/qul/word-morphology-pack.json`

## Script

Use:

`python3 scripts/convert_qul_morphology.py`

Helper npm scripts:

- `npm run qul:morphology:inspect -- <db-path>`
- `npm run qul:morphology:convert -- <db-path> <output-path> --table <table-name> ...`

## Step 1: Inspect the database

```bash
npm run qul:morphology:inspect -- /path/to/qul-morphology.sqlite
```

This prints all tables and columns.

## Step 2: Convert the correct table

Example:

```bash
npm run qul:morphology:convert -- \
  /path/to/qul-morphology.sqlite \
  public/qul/word-morphology-pack.json \
  --table morphology_words \
  --surah-col surah_id \
  --verse-col verse_id \
  --position-col word_position \
  --token-col token \
  --pos-col part_of_speech \
  --grammar-col grammar \
  --morphology-col morphology \
  --root-col root \
  --lemma-col lemma \
  --stem-col stem \
  --description-col description
```

## Required fields

The converter must be able to resolve:

- `surahId`
- `verseId`
- `wordPosition`

These can be auto-detected if the column names are conventional. If not, pass them explicitly.

## After conversion

Once the file exists at:

`public/qul/word-morphology-pack.json`

the Bashirah Settings page can load it using the `Unduh Pack` button.

## Notes

- The script uses Python's built-in `sqlite3` module, so no extra Python package is needed.
- If QUL schema changes, re-run `inspect` and update the column flags.
