#!/usr/bin/env python3
"""
Merge QUL ayah-level root, lemma, and stem SQLite databases into one Bashirah pack.
"""

from __future__ import annotations

import json
import sqlite3
from pathlib import Path


def load_ayah_map(db_path: Path, table_name: str) -> dict[str, str]:
    conn = sqlite3.connect(str(db_path))
    try:
        rows = conn.execute(f'SELECT verse_key, text FROM "{table_name}"').fetchall()
        return {str(verse_key): text for verse_key, text in rows if verse_key}
    finally:
        conn.close()


def parse_verse_key(verse_key: str) -> tuple[int, int]:
    surah_id, verse_id = verse_key.split(":")
    return int(surah_id), int(verse_id)


def main() -> int:
    root_db = Path("public/qul/morphology/ayah-root.db")
    lemma_db = Path("public/qul/morphology/ayah-lemma.db")
    stem_db = Path("public/qul/morphology/ayah-stem.db")
    output_path = Path("public/qul/ayah-morphology-pack.json")

    for db_path in (root_db, lemma_db, stem_db):
      if not db_path.exists():
        raise FileNotFoundError(f"Missing database: {db_path}")

    root_map = load_ayah_map(root_db, "roots")
    lemma_map = load_ayah_map(lemma_db, "lemmas")
    stem_map = load_ayah_map(stem_db, "stems")

    all_keys = sorted(set(root_map) | set(lemma_map) | set(stem_map), key=lambda item: tuple(int(part) for part in item.split(":")))

    result = []
    for verse_key in all_keys:
        surah_id, verse_id = parse_verse_key(verse_key)
        result.append(
            {
                "surahId": surah_id,
                "verseId": verse_id,
                "rootText": root_map.get(verse_key),
                "lemmaText": lemma_map.get(verse_key),
                "stemText": stem_map.get(verse_key),
                "source": "QUL",
            }
        )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {len(result)} entries to {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
