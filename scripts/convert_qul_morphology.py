#!/usr/bin/env python3
"""
Convert a QUL morphology SQLite database into Bashirah's JSON pack format.

The script is intentionally flexible because QUL SQLite schemas may evolve.
You can inspect available tables/columns, then map the relevant columns to the
output structure Bashirah expects.
"""

from __future__ import annotations

import argparse
import json
import sqlite3
import sys
from pathlib import Path
from typing import Dict, Iterable, List, Optional


def get_tables(conn: sqlite3.Connection) -> List[str]:
    rows = conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    ).fetchall()
    return [row[0] for row in rows]


def get_columns(conn: sqlite3.Connection, table: str) -> List[str]:
    rows = conn.execute(f"PRAGMA table_info({table})").fetchall()
    return [row[1] for row in rows]


def pick_column(columns: Iterable[str], explicit: Optional[str], candidates: List[str]) -> Optional[str]:
    if explicit:
        return explicit
    lowered = {col.lower(): col for col in columns}
    for candidate in candidates:
        if candidate.lower() in lowered:
            return lowered[candidate.lower()]
    return None


def build_select(columns: Dict[str, Optional[str]]) -> str:
    parts = []
    for alias, column in columns.items():
        if column:
            parts.append(f'"{column}" AS "{alias}"')
        else:
            parts.append(f"NULL AS \"{alias}\"")
    return ", ".join(parts)


def main() -> int:
    parser = argparse.ArgumentParser(description="Convert QUL morphology SQLite to Bashirah JSON pack")
    parser.add_argument("db_path", help="Path to QUL SQLite file")
    parser.add_argument("output_path", help="Path for output JSON pack")
    parser.add_argument("--table", help="Source table name")
    parser.add_argument("--where", help="Optional SQL WHERE clause without the WHERE keyword")
    parser.add_argument("--list-tables", action="store_true", help="List tables and columns, then exit")
    parser.add_argument("--source", default="QUL", help="Value for source field in output")

    parser.add_argument("--surah-col")
    parser.add_argument("--verse-col")
    parser.add_argument("--position-col")
    parser.add_argument("--token-col")
    parser.add_argument("--pos-col")
    parser.add_argument("--grammar-col")
    parser.add_argument("--morphology-col")
    parser.add_argument("--root-col")
    parser.add_argument("--lemma-col")
    parser.add_argument("--stem-col")
    parser.add_argument("--description-col")
    parser.add_argument("--word-location-col")
    parser.add_argument("--root-id-col")
    parser.add_argument("--root-join-table")
    parser.add_argument("--root-table-id-col")
    parser.add_argument("--root-arabic-col")
    parser.add_argument("--root-english-col")

    args = parser.parse_args()

    db_path = Path(args.db_path)
    if not db_path.exists():
        print(f"Database not found: {db_path}", file=sys.stderr)
        return 1

    output_path = Path(args.output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row

    try:
        tables = get_tables(conn)
        if args.list_tables:
            for table in tables:
                cols = ", ".join(get_columns(conn, table))
                print(f"{table}: {cols}")
            return 0

        if not args.table:
            print("You must provide --table or use --list-tables first.", file=sys.stderr)
            return 1

        if args.table not in tables:
            print(f"Table not found: {args.table}", file=sys.stderr)
            return 1

        available_columns = get_columns(conn, args.table)

        # Special mode for root mapping databases that store word positions in a compact field
        lowered_columns = [c.lower() for c in available_columns]
        if "word_location" in lowered_columns:
            root_join_table = args.root_join_table or "roots"
            if root_join_table not in tables:
                print(f"Root join table not found: {root_join_table}", file=sys.stderr)
                return 1

            root_join_columns = get_columns(conn, root_join_table)
            word_location_col = pick_column(available_columns, args.word_location_col, ["word_location"])
            root_id_col = pick_column(available_columns, args.root_id_col, ["root_id"])
            root_table_id_col = pick_column(root_join_columns, args.root_table_id_col, ["id"])
            root_arabic_col = pick_column(root_join_columns, args.root_arabic_col, ["arabic_trilateral"])
            root_english_col = pick_column(root_join_columns, args.root_english_col, ["english_trilateral"])

            if not word_location_col or not root_id_col or not root_table_id_col:
                print("Root-word mode requires word_location, root_id, and root table id mapping.", file=sys.stderr)
                return 1

            select_parts = [
                f'w."{word_location_col}" AS "word_location"',
                f'w."{root_id_col}" AS "root_id"',
            ]
            if root_arabic_col:
                select_parts.append(f'r."{root_arabic_col}" AS "root_arabic"')
            else:
                select_parts.append('NULL AS "root_arabic"')
            if root_english_col:
                select_parts.append(f'r."{root_english_col}" AS "root_english"')
            else:
                select_parts.append('NULL AS "root_english"')

            sql = (
                f'SELECT {", ".join(select_parts)} '
                f'FROM "{args.table}" w '
                f'LEFT JOIN "{root_join_table}" r ON w."{root_id_col}" = r."{root_table_id_col}"'
            )
            if args.where:
                sql += f" WHERE {args.where}"

            rows = conn.execute(sql).fetchall()
            result = []
            for row in rows:
                if not row["word_location"]:
                    continue
                try:
                    surah_id_str, verse_id_str, word_position_str = str(row["word_location"]).split(":")
                except ValueError:
                    continue
                result.append(
                    {
                        "surahId": int(surah_id_str),
                        "verseId": int(verse_id_str),
                        "wordPosition": int(word_position_str),
                        "token": None,
                        "partOfSpeech": None,
                        "grammar": None,
                        "morphology": "root-mapping",
                        "root": row["root_arabic"],
                        "lemma": row["root_english"],
                        "stem": None,
                        "description": None,
                        "source": args.source,
                    }
                )

            output_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
            print(f"Wrote {len(result)} entries to {output_path}")
            return 0

        mapping = {
            "surahId": pick_column(available_columns, args.surah_col, ["surah_id", "surah", "chapter_id", "chapter_number"]),
            "verseId": pick_column(available_columns, args.verse_col, ["verse_id", "ayah_id", "ayah", "verse_number", "ayah_number"]),
            "wordPosition": pick_column(available_columns, args.position_col, ["word_position", "position", "word_index", "token_index"]),
            "token": pick_column(available_columns, args.token_col, ["token", "text_uthmani", "text", "word"]),
            "partOfSpeech": pick_column(available_columns, args.pos_col, ["part_of_speech", "pos", "pos_tag"]),
            "grammar": pick_column(available_columns, args.grammar_col, ["grammar", "grammar_tag"]),
            "morphology": pick_column(available_columns, args.morphology_col, ["morphology", "morphology_tag"]),
            "root": pick_column(available_columns, args.root_col, ["root", "root_ar"]),
            "lemma": pick_column(available_columns, args.lemma_col, ["lemma", "lemma_ar"]),
            "stem": pick_column(available_columns, args.stem_col, ["stem", "stem_ar"]),
            "description": pick_column(available_columns, args.description_col, ["description", "meaning", "explanation"]),
        }

        missing_required = [key for key in ("surahId", "verseId", "wordPosition") if not mapping[key]]
        if missing_required:
            print(
                "Missing required column mapping for: " + ", ".join(missing_required) + ". "
                "Use --list-tables and pass explicit --surah-col/--verse-col/--position-col.",
                file=sys.stderr,
            )
            return 1

        select_clause = build_select(mapping)
        sql = f"SELECT {select_clause} FROM \"{args.table}\""
        if args.where:
            sql += f" WHERE {args.where}"

        rows = conn.execute(sql).fetchall()
        result = []
        for row in rows:
            if row["surahId"] is None or row["verseId"] is None or row["wordPosition"] is None:
                continue
            result.append(
                {
                    "surahId": int(row["surahId"]),
                    "verseId": int(row["verseId"]),
                    "wordPosition": int(row["wordPosition"]),
                    "token": row["token"],
                    "partOfSpeech": row["partOfSpeech"],
                    "grammar": row["grammar"],
                    "morphology": row["morphology"],
                    "root": row["root"],
                    "lemma": row["lemma"],
                    "stem": row["stem"],
                    "description": row["description"],
                    "source": args.source,
                }
            )

        output_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"Wrote {len(result)} entries to {output_path}")
        return 0
    finally:
        conn.close()


if __name__ == "__main__":
    raise SystemExit(main())
