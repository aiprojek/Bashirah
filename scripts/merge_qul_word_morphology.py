#!/usr/bin/env python3
"""
Merge QUL word-level root, lemma, and stem SQLite databases into one Bashirah pack.
"""

from __future__ import annotations

import json
import sqlite3
from pathlib import Path


def load_word_map(db_path: Path, words_table: str, value_table: str, fk_col: str, value_col: str) -> dict[str, str]:
    conn = sqlite3.connect(str(db_path))
    try:
        rows = conn.execute(
            f"""
            SELECT w.word_location, v."{value_col}"
            FROM "{words_table}" w
            LEFT JOIN "{value_table}" v ON w."{fk_col}" = v.id
            """
        ).fetchall()
        return {str(word_location): text for word_location, text in rows if word_location}
    finally:
        conn.close()


def parse_word_location(word_location: str) -> tuple[int, int, int]:
    surah_id, verse_id, word_position = word_location.split(":")
    return int(surah_id), int(verse_id), int(word_position)


def main() -> int:
    root_db = Path("public/qul/morphology/word-root.db")
    lemma_db = Path("public/qul/morphology/word-lemma.db")
    stem_db = Path("public/qul/morphology/word-stem.db")
    output_path = Path("public/qul/word-morphology-pack.json")

    for db_path in (root_db, lemma_db, stem_db):
        if not db_path.exists():
            raise FileNotFoundError(f"Missing database: {db_path}")

    root_map = load_word_map(root_db, "root_words", "roots", "root_id", "arabic_trilateral")
    lemma_map = load_word_map(lemma_db, "lemma_words", "lemmas", "lemma_id", "text")
    stem_map = load_word_map(stem_db, "stem_words", "stems", "stem_id", "text")

    all_locations = sorted(set(root_map) | set(lemma_map) | set(stem_map), key=lambda item: tuple(int(part) for part in item.split(":")))

    result = []
    for location in all_locations:
        surah_id, verse_id, word_position = parse_word_location(location)
        result.append(
            {
                "surahId": surah_id,
                "verseId": verse_id,
                "wordPosition": word_position,
                "token": None,
                "partOfSpeech": None,
                "grammar": None,
                "morphology": "word-level",
                "root": root_map.get(location),
                "lemma": lemma_map.get(location),
                "stem": stem_map.get(location),
                "description": None,
                "source": "QUL",
            }
        )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {len(result)} entries to {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
