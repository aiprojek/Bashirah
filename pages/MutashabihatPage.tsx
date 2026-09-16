import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Repeat, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  ChevronRight, 
  Sparkles, 
  Layers,
  ArrowRight,
  Filter,
  ExternalLink
} from 'lucide-react';
import { 
  getAllTopPhrases, 
  MutashabihatPhrase, 
  loadPhrases,
  loadQuranText
} from '../services/mutashabihatService';
import { getAllSurahs } from '../services/quranService';
import { Surah } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import Loading from '../components/Loading';

type FilterRepetition = 'all' | 'high' | 'medium' | 'moderate' | 'low';

const MutashabihatPage: React.FC = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [phrases, setPhrases] = useState<MutashabihatPhrase[]>([]);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRepetition, setFilterRepetition] = useState<FilterRepetition>('all');
  const [expandedPhraseId, setExpandedPhraseId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 25;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [allPhrases, surahList] = await Promise.all([
          getAllTopPhrases(820, 2),
          getAllSurahs(language),
        ]);
        setPhrases(allPhrases);
        setSurahs(surahList);
      } catch (err) {
        console.error('Failed to load mutashabihat data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [language]);

  const surahMap = useMemo(() => {
    const map = new Map<number, Surah>();
    surahs.forEach((s) => map.set(s.id, s));
    return map;
  }, [surahs]);

  // Filter phrases based on query & repetition
  const filteredPhrases = useMemo(() => {
    return phrases.filter((phrase) => {
      // Repetition filter
      if (filterRepetition === 'high' && phrase.occurrencesCount < 30) return false;
      if (filterRepetition === 'medium' && (phrase.occurrencesCount < 10 || phrase.occurrencesCount >= 30)) return false;
      if (filterRepetition === 'moderate' && (phrase.occurrencesCount < 5 || phrase.occurrencesCount >= 10)) return false;
      if (filterRepetition === 'low' && phrase.occurrencesCount >= 5) return false;

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();

      // Check Arabic text
      if (phrase.arabicText.toLowerCase().includes(q)) return true;

      // Check source key (e.g. "2:23")
      if (phrase.sourceKey.includes(q)) return true;

      // Check matched surah names
      const matchedSurahName = phrase.matchedAyahKeys.some((key) => {
        const sId = parseInt(key.split(':')[0], 10);
        const sMeta = surahMap.get(sId);
        return sMeta?.transliteration.toLowerCase().includes(q) || sMeta?.name.includes(q);
      });

      return matchedSurahName;
    });
  }, [phrases, searchQuery, filterRepetition, surahMap]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery, filterRepetition]);

  const totalPages = Math.ceil(filteredPhrases.length / ITEMS_PER_PAGE) || 1;
  const paginatedPhrases = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredPhrases.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPhrases, page]);

  const toggleExpand = (id: string) => {
    setExpandedPhraseId((prev) => (prev === id ? null : id));
  };

  const getSurahLabel = (sId: number) => {
    const s = surahMap.get(sId);
    return s ? `QS. ${s.transliteration} (${sId})` : `QS. ${sId}`;
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in pb-24 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-block p-3 bg-quran-gold/10 dark:bg-quran-gold/20 rounded-full mb-3 ring-1 ring-quran-gold/20 text-quran-gold">
          <Repeat className="w-8 h-8 text-quran-gold" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-quran-dark dark:text-gray-100 font-serif mb-2">
          {language === 'en' ? 'Mutashabihat & Recurring Phrases' : 'Ayat Mutasyabihat & Frasa Berulang'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-sm sm:text-base font-serif italic">
          {language === 'en'
            ? 'Explore 814 recurring phrases and identical sentence structures across the Quran to deepen your understanding and master verse memorization (Tahfizh).'
            : 'Eksplorasi 814 frasa dan susunan kalimat yang berulang antar surat untuk mengokohkan hafalan Al-Qur\'an (Tahfizh) dan mengenali keunikan lafadz pada setiap surat.'}
        </p>

        {/* Subtitle badge stats */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-stone-200 dark:border-slate-700">
            <span className="w-2 h-2 rounded-full bg-quran-gold" />
            <span>{phrases.length} {language === 'en' ? 'Total Phrases' : 'Total Frasa Terdata'}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-stone-200 dark:border-slate-700">
            <Repeat className="w-3.5 h-3.5 text-quran-gold" />
            <span>{language === 'en' ? 'Cross-Surah Repetition' : 'Lafadz Identik Antar Surat'}</span>
          </span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 border border-stone-200 dark:border-slate-700 shadow-sm space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === 'en'
                ? 'Search Arabic phrase, surah name or number (e.g. دون الله, Al-Baqarah)...'
                : 'Cari lafadz Arab, nama surat atau nomor surat (misal: دون الله, Al-Baqarah)...'
            }
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 dark:border-slate-600 bg-stone-50 dark:bg-slate-700/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-quran-gold/50 focus:border-quran-gold text-sm"
          />
        </div>

        {/* Repetition Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-gray-400 shrink-0 font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            {language === 'en' ? 'Repetition:' : 'Frekuensi:'}
          </span>

          {[
            { key: 'all', labelId: 'Semua (814)', labelEn: 'All (814)' },
            { key: 'high', labelId: 'Sangat Sering (≥ 30x)', labelEn: 'High (≥ 30x)' },
            { key: 'medium', labelId: 'Sering (10-29x)', labelEn: 'Medium (10-29x)' },
            { key: 'moderate', labelId: 'Sedang (5-9x)', labelEn: 'Moderate (5-9x)' },
            { key: 'low', labelId: 'Spesifik (2-4x)', labelEn: 'Specific (2-4x)' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilterRepetition(item.key as FilterRepetition)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                filterRepetition === item.key
                  ? 'bg-quran-dark text-white dark:bg-quran-gold dark:text-slate-900 shadow-sm'
                  : 'bg-stone-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-stone-200 dark:hover:bg-slate-600'
              }`}
            >
              {language === 'en' ? item.labelEn : item.labelId}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1 text-xs text-gray-500 dark:text-gray-400">
        <span>
          {language === 'en'
            ? `Showing ${filteredPhrases.length} matching phrases`
            : `Menampilkan ${filteredPhrases.length} frasa cocok`}
        </span>
        <span>
          {language === 'en' ? `Page ${page} of ${totalPages}` : `Halaman ${page} dari ${totalPages}`}
        </span>
      </div>

      {/* Phrase Cards */}
      <div className="space-y-4">
        {paginatedPhrases.map((phrase) => {
          const isExpanded = expandedPhraseId === phrase.id;
          const [srcSIdStr, srcVIdStr] = phrase.sourceKey.split(':');
          const srcSId = parseInt(srcSIdStr, 10);
          const srcVId = parseInt(srcVIdStr, 10);
          const srcSurah = surahMap.get(srcSId);

          return (
            <div
              key={phrase.id}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-stone-200 dark:border-slate-700 shadow-sm hover:border-quran-gold/40 dark:hover:border-quran-gold/40 hover:shadow-md transition-all overflow-hidden"
            >
              <div className="p-4 sm:p-5 space-y-4">
                {/* Header row: badge & source */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-quran-gold/10 text-quran-gold dark:text-quran-gold font-bold border border-quran-gold/20">
                      {phrase.occurrencesCount}x {language === 'en' ? 'in' : 'di'} {phrase.ayahsCount} {language === 'en' ? 'ayahs' : 'ayat'}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500 dark:text-gray-400 font-medium">
                      {phrase.surahsCount} {language === 'en' ? 'Surahs' : 'Surat'}
                    </span>
                  </div>

                  <span className="text-gray-500 dark:text-gray-400 text-[11px]">
                    {language === 'en' ? 'Source:' : 'Rujukan Awal:'}{' '}
                    <button
                      onClick={() => navigate(`/surah/${srcSId}#verse-${srcVId}`)}
                      className="font-semibold text-quran-dark dark:text-gray-100 hover:text-quran-gold dark:hover:text-quran-gold hover:underline inline-flex items-center gap-1"
                    >
                      {srcSurah ? srcSurah.transliteration : `QS. ${srcSId}`}:{srcVId}
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </span>
                </div>

                {/* Big Arabic Text */}
                <div className="p-4 bg-stone-50 dark:bg-slate-900/50 rounded-xl flex items-center justify-end">
                  <p 
                    className="font-arabic text-2xl sm:text-3xl text-right leading-loose text-gray-900 dark:text-gray-100 select-all"
                    dir="rtl"
                  >
                    {phrase.arabicText}
                  </p>
                </div>

                {/* Quick Info & Expand Toggle */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {language === 'en'
                      ? `Found across ${phrase.matchedAyahKeys.length} distinct Quranic verses`
                      : `Ditemukan pada ${phrase.matchedAyahKeys.length} ayat Al-Qur'an`}
                  </span>

                  <button
                    onClick={() => toggleExpand(phrase.id)}
                    className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-slate-700 hover:bg-quran-dark hover:text-white dark:hover:bg-quran-gold dark:hover:text-slate-900 text-xs font-bold text-gray-700 dark:text-gray-200 transition-colors flex items-center gap-1.5"
                  >
                    <span>
                      {isExpanded
                        ? (language === 'en' ? 'Hide Verses' : 'Tutup Daftar')
                        : (language === 'en' ? `View All ${phrase.matchedAyahKeys.length} Verses` : `Lihat Semua ${phrase.matchedAyahKeys.length} Ayat`)}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expandable Verses List */}
              {isExpanded && (
                <div className="border-t border-stone-200 dark:border-slate-700/80 bg-stone-50/50 dark:bg-slate-900/30 p-4 sm:p-5 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {language === 'en' ? 'Matching Verses List:' : 'Daftar Seluruh Ayat Terkait:'}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {phrase.matchedAyahKeys.map((key) => {
                      const [sIdStr, vIdStr] = key.split(':');
                      const sId = parseInt(sIdStr, 10);
                      const vId = parseInt(vIdStr, 10);
                      const sMeta = surahMap.get(sId);
                      const ranges = phrase.ayahPositions[key] || [];

                      return (
                        <div
                          key={key}
                          className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-stone-200 dark:border-slate-700 flex items-center justify-between group hover:border-quran-gold/50 transition-all"
                        >
                          <div className="space-y-0.5">
                            <span className="font-bold text-xs text-gray-900 dark:text-gray-100 group-hover:text-quran-gold dark:group-hover:text-quran-gold transition-colors">
                              {sMeta ? sMeta.transliteration : `QS. ${sId}`} : Ayat {vId}
                            </span>
                            <div className="text-[10px] text-gray-400">
                              {ranges.length > 0
                                ? `${language === 'en' ? 'Word' : 'Kata'} ${ranges.map((r) => `${r[0]}-${r[1]}`).join(', ')}`
                                : `QS. ${key}`}
                            </div>
                          </div>

                          <button
                            onClick={() => navigate(`/surah/${sId}#verse-${vId}`)}
                            title={language === 'en' ? 'Open Verse' : 'Buka Ayat'}
                            className="p-1.5 rounded-lg bg-stone-100 dark:bg-slate-700 group-hover:bg-quran-dark group-hover:text-white dark:group-hover:bg-quran-gold dark:group-hover:text-slate-900 text-gray-500 dark:text-gray-300 transition-colors"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredPhrases.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center text-gray-400 border border-stone-200 dark:border-slate-700 space-y-2">
            <Repeat className="w-8 h-8 mx-auto text-gray-300" />
            <p className="font-semibold text-sm">
              {language === 'en' ? 'No matching phrases found' : 'Tidak ada frasa yang sesuai pencarian'}
            </p>
            <p className="text-xs">
              {language === 'en' ? 'Try changing your search term or filter' : 'Coba gunakan kata kunci atau filter lain'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-xs font-bold disabled:opacity-40 hover:bg-stone-50 dark:hover:bg-slate-700 transition-colors"
          >
            {language === 'en' ? 'Previous' : 'Sebelumnya'}
          </button>

          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 px-3">
            {page} / {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-xs font-bold disabled:opacity-40 hover:bg-stone-50 dark:hover:bg-slate-700 transition-colors"
          >
            {language === 'en' ? 'Next' : 'Berikutnya'}
          </button>
        </div>
      )}
    </div>
  );
};

export default MutashabihatPage;
