import React, { useState, useEffect, useMemo } from 'react';
import { AyahMorphology, Word, WordMorphology } from '../types';
import { Search, Loader2, ArrowRight, Languages, BookOpen, Layers } from 'lucide-react';
import { findOccurrences, fetchWordByWordForSurah, getSpecificVerses } from '../services/quranService';
import { getAyahMorphologyDetails, getWordMorphologyDetails } from '../services/qulService';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import UnifiedModal from './UnifiedModal';

interface WordDetailModalProps {
  word: Word;
  surahId: number;
  verseId: number;
  isOpen: boolean;
  onClose: () => void;
}

const WordDetailModal: React.FC<WordDetailModalProps> = ({ word, surahId, verseId, isOpen, onClose }) => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [occurrences, setOccurrences] = useState<{ surahId: number; verseId: number; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Morphology State
  const [morphology, setMorphology] = useState<WordMorphology | null>(null);
  const [ayahMorphology, setAyahMorphology] = useState<AyahMorphology | null>(null);
  const [morphologyLoading, setMorphologyLoading] = useState(false);

  // Resolved Word Translation & Transliteration
  const [wordTranslation, setWordTranslation] = useState<string>('');
  const [wordTransliteration, setWordTransliteration] = useState<string>('');
  const [wordDataLoading, setWordDataLoading] = useState(false);

  // Verse (Sentence) Context State
  const [verseContext, setVerseContext] = useState<{
    text: string;
    translation: string;
    surahName: string;
  } | null>(null);
  const [verseLoading, setVerseLoading] = useState(false);

  // Reset states on open/change
  useEffect(() => {
    setOccurrences([]);
    setHasSearched(false);
    setLoading(false);
    setMorphology(null);
    setAyahMorphology(null);
    setVerseContext(null);

    // Initial word strings from props if present
    const initTrans = typeof word?.translation === 'object' ? word.translation?.text : (typeof word?.translation === 'string' ? word.translation : '');
    const initLatin = typeof word?.transliteration === 'object' ? word.transliteration?.text : (typeof word?.transliteration === 'string' ? word.transliteration : '');
    setWordTranslation(initTrans || '');
    setWordTransliteration(initLatin || '');
  }, [isOpen, word, surahId, verseId]);

  // Load Word details (WBW), morphology, and verse sentence context
  useEffect(() => {
    if (!isOpen || !word) return;

    let isMounted = true;

    const loadAllDetails = async () => {
      // 1. Fetch word morphology & ayah morphology
      setMorphologyLoading(true);
      try {
        const [morphRes, ayahMorphRes] = await Promise.all([
          word.position ? getWordMorphologyDetails(surahId, verseId, word.position) : Promise.resolve(undefined),
          getAyahMorphologyDetails(surahId, verseId),
        ]);
        if (isMounted) {
          setMorphology(morphRes || null);
          setAyahMorphology(ayahMorphRes || null);
        }
      } catch (e) {
        console.warn('Failed to load morphology details:', e);
      } finally {
        if (isMounted) setMorphologyLoading(false);
      }

      // 2. If word translation is missing, fetch from WBW pack
      const existingTrans = typeof word?.translation === 'object' ? word.translation?.text : (typeof word?.translation === 'string' ? word.translation : '');
      if (!existingTrans) {
        setWordDataLoading(true);
        try {
          const wbwMap = await fetchWordByWordForSurah(surahId);
          const verseWords = wbwMap[verseId] || [];
          const pos = word.position || 1;
          const found = verseWords.find(w => w.position === pos) || verseWords[pos - 1];
          if (isMounted && found) {
            const trans = typeof found.translation === 'object' ? found.translation?.text : (typeof found.translation === 'string' ? found.translation : '');
            const latin = typeof found.transliteration === 'object' ? found.transliteration?.text : (typeof found.transliteration === 'string' ? found.transliteration : '');
            if (trans) setWordTranslation(trans);
            if (latin) setWordTransliteration(latin);
          }
        } catch (e) {
          console.warn('Failed to fetch word-by-word data:', e);
        } finally {
          if (isMounted) setWordDataLoading(false);
        }
      }

      // 3. Load verse context (Sentence / Kalimat)
      setVerseLoading(true);
      try {
        const transId = language === 'en' ? 'en.sahih' : 'id.indonesian';
        const specific = await getSpecificVerses([{ surah: surahId, verse: verseId }], transId);
        if (isMounted && specific && specific.length > 0) {
          setVerseContext({
            text: specific[0].text,
            translation: specific[0].translation,
            surahName: specific[0].surah?.transliteration || `Surah ${surahId}`,
          });
        }
      } catch (e) {
        console.warn('Failed to load verse sentence context:', e);
      } finally {
        if (isMounted) setVerseLoading(false);
      }
    };

    loadAllDetails();

    return () => {
      isMounted = false;
    };
  }, [isOpen, word, surahId, verseId, language]);

  // Translate Part of Speech (POS) codes to readable human text
  const humanPartOfSpeech = useMemo(() => {
    const raw = morphology?.partOfSpeech?.trim();
    if (!raw) return null;
    const lower = raw.toLowerCase();
    if (lower === 'n' || lower === 'noun') return t('pos_noun');
    if (lower === 'v' || lower === 'verb') return t('pos_verb');
    if (lower === 'p' || lower === 'particle' || lower === 'prep') return t('pos_particle');
    if (lower === 'pron' || lower === 'pronoun') return t('pos_pronoun');
    if (lower === 'adj' || lower === 'adjective') return t('pos_adjective');
    if (lower === 'adv' || lower === 'adverb') return t('pos_adverb');
    if (lower === 'pn' || lower === 'propn') return t('pos_proper_noun');
    return raw;
  }, [morphology?.partOfSpeech, t]);

  // Translate Grammar form (avoid showing raw "word-level")
  const humanGrammar = useMemo(() => {
    const raw = morphology?.grammar || morphology?.morphology;
    if (!raw) return null;
    if (raw === 'word-level' || raw === 'word_level') {
      return t('grammar_base_form');
    }
    return raw;
  }, [morphology?.grammar, morphology?.morphology, t]);

  // Derive root, lemma, stem if missing from morphology
  const derivedTokens = useMemo(() => {
    const pos = (word.position || 1) - 1;
    const splitTokens = (text?: string) => (text ? text.trim().split(/\s+/) : []);
    const roots = splitTokens(ayahMorphology?.rootText);
    const lemmas = splitTokens(ayahMorphology?.lemmaText);
    const stems = splitTokens(ayahMorphology?.stemText);

    const root = morphology?.root || word.root || (roots[pos] && roots[pos] !== '-' ? roots[pos] : undefined);
    const lemma = morphology?.lemma || word.lemma || (lemmas[pos] && lemmas[pos] !== '-' ? lemmas[pos] : undefined);
    const stem = morphology?.stem || (stems[pos] && stems[pos] !== '-' ? stems[pos] : undefined);

    return { root, lemma, stem };
  }, [morphology, word, ayahMorphology]);

  if (!isOpen) return null;

  const handleVerseClick = (targetSurahId: number, targetVerseId: number) => {
    onClose();
    navigate(`/surah/${targetSurahId}#verse-${targetVerseId}`);
  };

  const handleSearch = () => {
    setLoading(true);
    setHasSearched(true);

    let searchTerm = '';
    let type: 'root' | 'text' = 'text';

    if (derivedTokens.root) {
      searchTerm = derivedTokens.root;
      type = 'root';
    } else if (derivedTokens.lemma) {
      searchTerm = derivedTokens.lemma;
      type = 'text';
    } else {
      searchTerm = word.text_uthmani;
      type = 'text';
    }

    findOccurrences(searchTerm, type).then(results => {
      setOccurrences(results);
      setLoading(false);
    });
  };

  return (
    <UnifiedModal
      isOpen={isOpen}
      onClose={onClose}
      badge={`QS ${surahId}:${verseId} • #${word.position || 1}`}
      title={t('word_detail_grammar_title')}
      subtitle={verseContext ? `QS. ${verseContext.surahName} (${surahId}:${verseId})` : t('word_detail_word_badge')}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {/* HERO WORD CARD: Arabic Calligraphy & Translation */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-stone-200/80 dark:border-slate-700/80 shadow-sm text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern-overlay opacity-30 dark:opacity-5 pointer-events-none" />

          <p className="font-arabic text-5xl sm:text-6xl text-quran-dark dark:text-white leading-relaxed drop-shadow-sm py-2" dir="rtl">
            {word.text_uthmani}
          </p>

          <div className="mt-3 space-y-1">
            {wordDataLoading ? (
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400 py-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-quran-gold" />
                <span>Memuat terjemah...</span>
              </div>
            ) : wordTranslation ? (
              <p className="font-serif text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 leading-snug">
                {wordTranslation}
              </p>
            ) : null}

            {wordTransliteration && (
              <p className="font-sans text-xs sm:text-sm text-gray-500 dark:text-gray-400 italic">
                {wordTransliteration}
              </p>
            )}
          </div>
        </div>

        {/* SENTENCE / AYAH CONTEXT CARD (Konteks Kalimat / Ayat) */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-stone-200/80 dark:border-slate-700/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-quran-gold uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>{t('word_detail_context_title')}</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300">
              QS {surahId}:{verseId}
            </span>
          </div>

          {verseLoading ? (
            <div className="flex items-center justify-center py-4 gap-2 text-xs text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin text-quran-gold" />
              <span>{t('word_detail_loading_sentence')}</span>
            </div>
          ) : verseContext ? (
            <div className="space-y-3 pt-1">
              <p className="font-arabic text-xl sm:text-2xl text-right text-gray-800 dark:text-gray-100 leading-loose" dir="rtl">
                {verseContext.text}
              </p>
              <div className="border-t border-stone-100 dark:border-slate-700/80 pt-3">
                <p className="text-xs sm:text-sm font-serif text-gray-600 dark:text-gray-300 leading-relaxed">
                  {verseContext.translation}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {/* GRAMMAR & MORPHOLOGY BREAKDOWN */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-stone-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-quran-gold uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>{t('word_detail_grammar_title')}</span>
          </div>

          {morphologyLoading ? (
            <div className="flex items-center gap-2 py-3 text-xs text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin text-quran-gold" />
              <span>{t('word_detail_grammar_loading')}</span>
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              {/* Part of Speech & Grammar Form */}
              {(humanPartOfSpeech || humanGrammar) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {humanPartOfSpeech && (
                    <div className="rounded-xl bg-stone-50 dark:bg-slate-700/40 border border-stone-200/60 dark:border-slate-700 p-3">
                      <div className="text-[10px] uppercase font-bold tracking-widest text-gray-400 dark:text-gray-400">
                        {t('word_detail_part_of_speech')}
                      </div>
                      <div className="mt-1 font-semibold text-gray-800 dark:text-gray-200 text-sm">
                        {humanPartOfSpeech}
                      </div>
                    </div>
                  )}
                  {humanGrammar && (
                    <div className="rounded-xl bg-stone-50 dark:bg-slate-700/40 border border-stone-200/60 dark:border-slate-700 p-3">
                      <div className="text-[10px] uppercase font-bold tracking-widest text-gray-400 dark:text-gray-400">
                        {t('word_detail_grammar')}
                      </div>
                      <div className="mt-1 font-semibold text-gray-800 dark:text-gray-200 text-sm">
                        {humanGrammar}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Root, Lemma, Stem Cards */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-stone-50 dark:bg-slate-700/40 border border-stone-200/60 dark:border-slate-700 p-3 text-center">
                  <div className="text-[10px] uppercase font-bold tracking-widest text-gray-400 dark:text-gray-400">
                    {t('word_detail_root')}
                  </div>
                  <div className="mt-1.5 font-arabic text-base sm:text-lg font-bold text-quran-dark dark:text-quran-gold" dir="rtl">
                    {derivedTokens.root || '-'}
                  </div>
                </div>

                <div className="rounded-xl bg-stone-50 dark:bg-slate-700/40 border border-stone-200/60 dark:border-slate-700 p-3 text-center">
                  <div className="text-[10px] uppercase font-bold tracking-widest text-gray-400 dark:text-gray-400">
                    {t('word_detail_lemma')}
                  </div>
                  <div className="mt-1.5 font-arabic text-base sm:text-lg font-bold text-quran-dark dark:text-quran-gold" dir="rtl">
                    {derivedTokens.lemma || '-'}
                  </div>
                </div>

                <div className="rounded-xl bg-stone-50 dark:bg-slate-700/40 border border-stone-200/60 dark:border-slate-700 p-3 text-center">
                  <div className="text-[10px] uppercase font-bold tracking-widest text-gray-400 dark:text-gray-400">
                    {t('word_detail_stem')}
                  </div>
                  <div className="mt-1.5 font-arabic text-base sm:text-lg font-bold text-quran-dark dark:text-quran-gold" dir="rtl">
                    {derivedTokens.stem || '-'}
                  </div>
                </div>
              </div>

              {morphology?.description && (
                <div className="rounded-xl bg-stone-50 dark:bg-slate-700/40 border border-stone-200/60 dark:border-slate-700 p-3 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  {morphology.description}
                </div>
              )}
            </div>
          )}
        </div>

        {/* CONCORDANCE & EXPLORATION */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-stone-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-quran-gold uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <Search className="w-4 h-4" />
              <span>{t('word_detail_explore_title')}</span>
            </div>
            {hasSearched && !loading && (
              <span className="bg-quran-gold/15 text-quran-gold dark:text-quran-gold px-2 py-0.5 rounded text-[10px]">
                {occurrences.length > 49 ? '50+' : occurrences.length} {t('word_detail_verses_found')}
              </span>
            )}
          </div>

          {!hasSearched ? (
            <div className="py-4 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 px-4 leading-relaxed">
                {t('word_detail_explore_desc')}
              </p>
              <button
                onClick={handleSearch}
                className="px-5 py-2.5 bg-quran-dark dark:bg-quran-gold text-white dark:text-quran-dark rounded-xl font-bold text-xs uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all shadow-md inline-flex items-center gap-2"
              >
                {t('word_detail_search_btn')}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : loading ? (
            <div className="py-8 flex flex-col items-center justify-center text-gray-400 gap-2">
              <Loader2 className="w-6 h-6 text-quran-gold animate-spin" />
              <span className="text-xs font-medium">{t('word_detail_scanning')}</span>
            </div>
          ) : occurrences.length > 0 ? (
            <div className="space-y-2.5 max-h-60 overflow-y-auto custom-scrollbar pr-1">
              {occurrences.map((occ, idx) => (
                <button
                  key={idx}
                  onClick={() => handleVerseClick(occ.surahId, occ.verseId)}
                  className="w-full text-right p-3.5 bg-stone-50/70 dark:bg-slate-700/40 hover:bg-stone-100 dark:hover:bg-slate-700 rounded-xl border border-stone-200/60 dark:border-slate-700 transition-all group"
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-bold text-quran-gold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>{t('word_detail_open')}</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                    <span className="text-[10px] font-bold bg-white dark:bg-slate-800 text-stone-600 dark:text-gray-300 px-2 py-0.5 rounded border border-stone-200 dark:border-slate-600">
                      QS {occ.surahId}:{occ.verseId}
                    </span>
                  </div>
                  <p className="font-arabic text-base text-gray-700 dark:text-gray-200 leading-loose line-clamp-2" dir="rtl">
                    {occ.text}
                  </p>
                </button>
              ))}
              {occurrences.length >= 50 && (
                <p className="text-center text-[11px] text-gray-400 italic pt-2">
                  {t('word_detail_showing_first_50')}
                </p>
              )}
            </div>
          ) : (
            <div className="py-6 text-center rounded-xl border border-dashed border-stone-200 dark:border-slate-700">
              <p className="text-gray-400 text-xs italic">{t('word_detail_no_verses')}</p>
            </div>
          )}
        </div>
      </div>
    </UnifiedModal>
  );
};

export default WordDetailModal;
