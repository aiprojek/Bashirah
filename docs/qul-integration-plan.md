# QUL Integration Plan for Bashirah

This document maps Quranic Universal Library (QUL) resources to Bashirah's current architecture and proposes a practical rollout path.

## Goal

Integrate QUL data into Bashirah in a way that:

- works offline after download
- keeps the app lightweight by default
- reuses existing IndexedDB patterns
- fits the current Surah, word, and topic UI model

## Relevant QUL Resources

Based on the public QUL resources portal and repository, the most relevant datasets are:

- Quran Fonts
- Quran script: Unicode and Images
- Surah information
- Topics and concepts in the Quran
- Ayah theme
- Similar ayahs
- Mutashabihat ul Quran
- Quranic Grammar and Morphology

## Bashirah Current State

The current app already has useful integration points:

- IndexedDB storage in [services/db.ts](/home/abdullah-home/Documents/GitHub/Bashirah/services/db.ts)
- word-level modal in [components/WordDetailModal.tsx](/home/abdullah-home/Documents/GitHub/Bashirah/components/WordDetailModal.tsx)
- word metadata shape in [types.ts](/home/abdullah-home/Documents/GitHub/Bashirah/types.ts)
- surah info offline store in [services/db.ts](/home/abdullah-home/Documents/GitHub/Bashirah/services/db.ts)
- static topic page in [pages/TopicIndexPage.tsx](/home/abdullah-home/Documents/GitHub/Bashirah/pages/TopicIndexPage.tsx)

This means Bashirah does not need a large architecture rewrite. It mostly needs:

- new IndexedDB stores
- import/download adapters
- richer modal/page components

## Feature Mapping

### 1. Font and Script Selection

Feasibility: High

Use QUL font and script resources to add:

- selectable Quran font families
- optional script variants if text compatibility is good
- heading fonts for surah titles and ornaments

Suggested implementation:

- add `quran_font_family` and `quran_script_id` in `user_settings`
- extend [types.ts](/home/abdullah-home/Documents/GitHub/Bashirah/types.ts) with `QuranFontOption`
- add a small curated set first, not all available QUL fonts

Notes:

- script switching is more invasive than font switching because word boundaries, tajweed rendering, and ornaments may differ
- font switching should be phase 1, script switching phase 2

### 2. Full Offline Surah Info / Asbabun Nuzul

Feasibility: Medium

QUL clearly exposes `Surah information`. That is a strong fit for Bashirah's existing `surah_info` store.

Suggested implementation:

- replace or enrich current surah info downloader with QUL source data
- treat this as `surah background info`, not necessarily full ayah-level asbabun nuzul

Important caution:

- do not assume QUL publicly ships complete ayah-by-ayah asbabun nuzul for all verses
- the safe product wording is `Info Surat`, `Latar Turun Surat`, `Tema Utama`, or similar until dataset scope is verified

### 3. Grammar and Morphology on Word Click

Feasibility: Very High

This is the best fit for the current app.

Bashirah already has:

- clickable words
- `WordDetailModal`
- `Word` type with `root` and `lemma`

Suggested implementation:

- add a new IndexedDB store such as `word_morphology`
- key by `surahId_verseId_wordPosition` or a stable QUL word id
- enrich [components/WordDetailModal.tsx](/home/abdullah-home/Documents/GitHub/Bashirah/components/WordDetailModal.tsx) with:
  - part of speech
  - root
  - lemma
  - stem
  - morphology tags
  - optional grammar explanation in plain language

Recommended UX:

- section 1: word basics
- section 2: grammar and morphology
- section 3: concordance and occurrences

### 4. Similar Ayahs and Ayah Theme

Feasibility: High

This can power two useful user experiences:

- `Ayat Serupa`
- `Tema Ayat`

Suggested implementation:

- add IndexedDB stores:
  - `ayah_similarities`
  - `ayah_themes`
- add verse-level actions or tabs in verse modal
- from a verse action, open a modal with:
  - list of similar ayahs
  - theme badges
  - topic links

Recommended UX:

- keep it verse-focused first
- do not mix this into the current static topic index immediately
- later, enrich [pages/TopicIndexPage.tsx](/home/abdullah-home/Documents/GitHub/Bashirah/pages/TopicIndexPage.tsx) with dynamic topic data

### 5. Mutashabihat ul Quran

Feasibility: High

This should become a separate feature, not hidden inside `similar ayahs`.

Suggested implementation:

- add IndexedDB store `mutashabihat`
- create a dedicated modal or page:
  - `Ayat Mirip`
  - grouped by phrase match or context match
- optionally add an entry in verse action menu and a future standalone page for huffaz

Recommended UX:

- verse action: `Lihat Mutashabihat`
- standalone future page: filtered study mode for memorization

## Data Model Proposal

Add new stores in [services/db.ts](/home/abdullah-home/Documents/GitHub/Bashirah/services/db.ts):

- `word_morphology`
- `ayah_similarities`
- `ayah_themes`
- `mutashabihat`
- `quran_fonts`
- optionally `surah_info_qul` if you want to preserve old and new sources separately

Suggested keys:

- `word_morphology`: `surahId_verseId_wordPosition`
- `ayah_similarities`: `surahId_verseId`
- `ayah_themes`: `surahId_verseId`
- `mutashabihat`: `surahId_verseId`

Suggested value shape:

- keep each store normalized and small
- avoid duplicating full verse text if it can be resolved from existing Quran data
- store references and labels, not full heavy payloads where possible

## Offline Strategy

Use the same model Bashirah already uses for translations and tafsir:

- default app stays light
- user downloads optional packs
- feature button remains visible but explains when a pack is missing

Suggested downloadable packs:

- `grammar-pack`
- `similar-ayah-pack`
- `mutashabihat-pack`
- `advanced-surah-info-pack`
- `font-pack`

## Recommended Implementation Order

### Phase 1

- Grammar and morphology on word click
- QUL-backed surah information enrichment

Why:

- smallest UI change
- highest user value
- lowest architecture risk

### Phase 2

- Similar ayahs
- Ayah themes

Why:

- natural extension of verse actions
- easy to explain in UX

### Phase 3

- Mutashabihat ul Quran

Why:

- valuable but should be designed properly for memorization workflows

### Phase 4

- Font selection
- optional script selection

Why:

- good enhancement, but lower immediate value than study features
- script compatibility may need more QA

## Risks and Constraints

### Data Size

Morphology and verse relation datasets can become large. Do not bundle them by default.

### Word Alignment

Word-level matching must use a stable identifier strategy. If QUL word indexing differs from current word-by-word API data, an adapter layer will be needed.

### Terminology Risk

If the QUL surah information resource is not full asbabun nuzul, avoid promising that wording in UI until validated.

### Topic Model Mismatch

The current topic page is hand-curated and simple. QUL topics are likely broader and more relational. Merging them directly into the existing page without a redesign may produce noisy UX.

## Concrete Repo Changes Needed

1. Extend [services/db.ts](/home/abdullah-home/Documents/GitHub/Bashirah/services/db.ts) with new stores and migration version.
2. Extend [types.ts](/home/abdullah-home/Documents/GitHub/Bashirah/types.ts) with:
   - morphology types
   - similar ayah types
   - ayah theme types
   - mutashabihat types
   - font option types
3. Add a new service, likely `services/qulService.ts`, to import and query QUL-derived datasets.
4. Upgrade [components/WordDetailModal.tsx](/home/abdullah-home/Documents/GitHub/Bashirah/components/WordDetailModal.tsx) for grammar and morphology.
5. Add verse-level action entries for:
   - `Tema Ayat`
   - `Ayat Serupa`
   - `Mutashabihat`
6. Add settings/download UI for optional QUL packs.

## Recommendation

Start with grammar and morphology first.

It has the best balance of:

- high value
- existing UI hook already available
- relatively contained implementation scope
- strong offline usefulness

After that, move to similar ayahs plus ayah theme as the next package.
