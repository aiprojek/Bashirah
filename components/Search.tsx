import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, ArrowRight, Loader2, Wifi, Download, Zap, Globe, X, BookOpen, Sparkles } from 'lucide-react';
import { searchGlobalVerses } from '../services/quranService';
import { isEditionDownloaded } from '../services/db';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export type SearchScope = 'surah' | 'verse';

interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  translationId: string;
  scope?: SearchScope;
  onScopeChange?: (scope: SearchScope) => void;
  surahResultCount?: number;
  onClear?: () => void;
}

// Helper to escape regex characters for text highlighting
const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const Search: React.FC<SearchProps> = ({
  value,
  onChange,
  translationId,
  scope: controlledScope,
  onScopeChange,
  surahResultCount = 0,
  onClear,
}) => {
  const { language, t } = useLanguage();
  const [internalScope, setInternalScope] = useState<SearchScope>('surah');
  const [isFocused, setIsFocused] = useState(false);
  const [verseResults, setVerseResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDeepSearching, setIsDeepSearching] = useState(false);
  const [isOfflineReady, setIsOfflineReady] = useState(false);
  const navigate = useNavigate();

  const currentScope = controlledScope !== undefined ? controlledScope : internalScope;

  const handleSetScope = (newScope: SearchScope) => {
    if (onScopeChange) {
      onScopeChange(newScope);
    } else {
      setInternalScope(newScope);
    }
  };

  // Check if translation is downloaded whenever translationId changes
  useEffect(() => {
    const checkStatus = async () => {
      const downloaded = await isEditionDownloaded(translationId);
      setIsOfflineReady(downloaded);
    };
    checkStatus();
  }, [translationId]);

  const performVerseSearch = async (query: string, deep: boolean = false) => {
    if (!query || query.trim().length < 2) {
      setVerseResults([]);
      return;
    }
    if (deep) setIsDeepSearching(true);
    else setIsSearching(true);

    try {
      const results = await searchGlobalVerses(query.trim(), translationId, deep);
      setVerseResults(results);
    } catch (e) {
      console.error('Pencarian ayat gagal:', e);
    } finally {
      setIsSearching(false);
      setIsDeepSearching(false);
    }
  };

  // Only run verse search when in 'verse' scope and query length >= 2
  useEffect(() => {
    if (currentScope !== 'verse') return;

    if (!value || value.trim().length < 2) {
      setVerseResults([]);
      return;
    }

    const timer = setTimeout(() => {
      performVerseSearch(value, false);
    }, 450);

    return () => clearTimeout(timer);
  }, [value, translationId, currentScope]);

  const handleDeepSearch = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    performVerseSearch(value, true);
  };

  const handleResultClick = (surahId: number, verseId: number) => {
    navigate(`/surah/${surahId}#verse-${verseId}`);
  };

  const handleGoToSettings = () => {
    navigate('/settings');
  };

  const handleClear = () => {
    onChange('');
    handleSetScope('surah');
    setVerseResults([]);
    if (onClear) onClear();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (currentScope === 'surah' && surahResultCount === 0 && value.trim().length >= 2) {
        handleSetScope('verse');
      } else if (currentScope === 'verse' && value.trim().length >= 2) {
        performVerseSearch(value, true);
      }
    }
  };

  const hasSearchValue = value.trim().length > 0;

  return (
    <div className="relative max-w-2xl mx-auto mb-8 z-20">
      {/* Search Input Box */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <SearchIcon className={`h-5 w-5 transition-colors ${isFocused ? 'text-quran-gold' : 'text-gray-400'}`} />
        </div>
        <input
          type="text"
          className={`block w-full pl-11 pr-11 py-4 bg-white dark:bg-slate-800 border rounded-2xl leading-5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-quran-gold/50 focus:border-quran-gold text-sm shadow-xs transition-all text-gray-800 dark:text-white ${
            isFocused ? 'border-quran-gold ring-2 ring-quran-gold/20' : 'border-stone-200 dark:border-slate-700'
          }`}
          placeholder={
            language === 'en'
              ? "Search surah name or verses (e.g. 'Al-Kahf', 'patience', 'fasting')..."
              : "Cari nama surat atau ayat (contoh: 'Al-Kahfi', 'sabar', 'puasa')..."
          }
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
        />
        {hasSearchValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            title={language === 'en' ? 'Clear search' : 'Hapus pencarian'}
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Scope Switcher Tabs (In-place, non-floating, clean UX) */}
      {hasSearchValue && (
        <div className="flex items-center justify-center gap-2 mt-3 animate-fade-in">
          <button
            type="button"
            onClick={() => handleSetScope('surah')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentScope === 'surah'
                ? 'bg-quran-dark dark:bg-quran-gold text-white dark:text-slate-900 shadow-xs ring-1 ring-quran-dark/10 dark:ring-white/10'
                : 'bg-stone-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-stone-200 dark:hover:bg-slate-700'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Surah Names' : 'Nama Surat'}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                currentScope === 'surah'
                  ? 'bg-white/20 dark:bg-black/20 text-white dark:text-slate-900'
                  : 'bg-stone-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {surahResultCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              handleSetScope('verse');
              if (value.trim().length >= 2 && verseResults.length === 0) {
                performVerseSearch(value, false);
              }
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentScope === 'verse'
                ? 'bg-quran-dark dark:bg-quran-gold text-white dark:text-slate-900 shadow-xs ring-1 ring-quran-dark/10 dark:ring-white/10'
                : 'bg-stone-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-stone-200 dark:hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Search in Verses' : 'Isi Ayat & Terjemahan'}</span>
            {verseResults.length > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  currentScope === 'verse'
                    ? 'bg-white/20 dark:bg-black/20 text-white dark:text-slate-900'
                    : 'bg-stone-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {verseResults.length}
              </span>
            )}
            {(isSearching || isDeepSearching) && currentScope === 'verse' && (
              <Loader2 className="w-3 h-3 animate-spin text-quran-gold" />
            )}
          </button>
        </div>
      )}

      {/* Helpful Hint when 0 surahs match */}
      {hasSearchValue && currentScope === 'surah' && surahResultCount === 0 && (
        <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25 text-center flex flex-col items-center gap-2 animate-fade-in">
          <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300">
            {language === 'en'
              ? `No surahs match "${value}". Would you like to search across all Quranic verses?`
              : `Tidak ditemukan surat bernama "${value}". Ingin mencari kata ini di seluruh ayat & terjemahan?`}
          </p>
          <button
            type="button"
            onClick={() => {
              handleSetScope('verse');
              performVerseSearch(value, false);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-quran-dark dark:bg-quran-gold text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Search Across Verses' : 'Cari di Seluruh Ayat →'}</span>
          </button>
        </div>
      )}

      {/* VERSE SEARCH RESULTS (IN-PLACE, in normal document flow - NOT floating/absolute) */}
      {hasSearchValue && currentScope === 'verse' && (
        <div className="mt-4 bg-white dark:bg-slate-800/95 rounded-2xl shadow-sm border border-stone-200/80 dark:border-slate-700/80 overflow-hidden animate-fade-in">
          {/* OFFLINE STATUS NOTIFICATION */}
          {!isOfflineReady && (
            <div className="bg-blue-50 dark:bg-blue-900/30 border-b border-blue-100 dark:border-blue-900 p-3.5 flex items-start gap-3">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-800 rounded-full text-blue-600 dark:text-blue-300 mt-0.5 shrink-0">
                <Wifi className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-blue-800 dark:text-blue-300">
                  {language === 'en' ? 'Basic Offline Search Active' : 'Pencarian Offline Dasar Aktif'}
                </p>
                <p className="text-[11px] text-blue-600 dark:text-blue-400 leading-relaxed mt-0.5">
                  {language === 'en'
                    ? 'Translation data is not downloaded yet. Offline search works for Arabic text, but translation results will be more complete once downloaded.'
                    : 'Data terjemahan belum diunduh. Pencarian offline tetap bisa untuk teks Arab, namun hasil terjemahan lebih lengkap jika data diunduh.'}
                </p>
                <button
                  type="button"
                  onClick={handleGoToSettings}
                  className="mt-2 text-[10px] font-bold bg-blue-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-blue-700 transition-colors w-fit"
                >
                  <Download className="w-3 h-3" />
                  <span>{language === 'en' ? 'Download Offline Data' : 'Unduh Data Offline'}</span>
                </button>
              </div>
            </div>
          )}

          {/* RESULTS HEADER */}
          <div className="flex items-center justify-between px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-stone-100 dark:border-slate-700 bg-stone-50/70 dark:bg-slate-800/80">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-quran-gold" />
              <span>{language === 'en' ? 'Verse Search Results' : 'Hasil Pencarian Ayat'}</span>
              {verseResults.length > 0 && (
                <span className="text-[10px] bg-stone-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full lowercase font-bold">
                  {verseResults.length} {language === 'en' ? (verseResults.length === 1 ? 'result' : 'results') : 'hasil'}
                </span>
              )}
            </div>
            {(isSearching || isDeepSearching) && <Loader2 className="w-3.5 h-3.5 animate-spin text-quran-gold" />}
          </div>

          {/* DEEP SEARCH TRIGGER */}
          {!isDeepSearching && value.trim().length >= 2 && (
            <div className="px-4 py-2.5 border-b border-stone-100 dark:border-slate-700/60 bg-quran-gold/5 dark:bg-quran-gold/10">
              <button
                type="button"
                onClick={handleDeepSearch}
                className="w-full flex items-center justify-between gap-3 text-xs group cursor-pointer"
              >
                <div className="flex items-center gap-2 text-quran-dark dark:text-quran-gold font-bold">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>{language === 'en' ? 'Deep Search (Online)' : 'Pencarian Mendalam (Online)'}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-400 group-hover:text-quran-gold transition-colors text-[11px]">
                  <span>{language === 'en' ? 'Scan full Quran text & tafsir' : 'Pindai teks lengkap & tafsir'}</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            </div>
          )}

          {/* RESULTS BODY */}
          <div className="p-3 divide-y divide-stone-100 dark:divide-slate-700/60">
            {isSearching && !isDeepSearching && (
              <div className="py-12 text-center flex flex-col items-center gap-2 text-stone-400">
                <Loader2 className="w-6 h-6 text-quran-gold animate-spin" />
                <p className="text-xs">{language === 'en' ? 'Searching verses...' : 'Mencari ayat yang cocok...'}</p>
              </div>
            )}

            {isDeepSearching && (
              <div className="py-12 text-center flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-quran-gold animate-spin" />
                <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                  {language === 'en' ? 'Searching entire Quran database...' : 'Mencari di seluruh database Al-Qur\'an...'}
                </p>
                <p className="text-[11px] text-gray-400">
                  {language === 'en'
                    ? 'Deep search scans every verse and translation.'
                    : 'Pencarian mendalam memindai setiap ayat dan terjemahan.'}
                </p>
              </div>
            )}

            {!isSearching && !isDeepSearching && verseResults.length === 0 && (
              <div className="p-8 text-center text-gray-400">
                <p className="text-sm italic mb-3">
                  {language === 'en'
                    ? `No verses found matching "${value}".`
                    : `Tidak ditemukan ayat dengan kata kunci "${value}".`}
                </p>
                <button
                  type="button"
                  onClick={handleDeepSearch}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-quran-dark dark:bg-quran-gold text-white dark:text-slate-900 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity shadow-xs"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Try Deep Search' : 'Coba Pencarian Mendalam'}</span>
                </button>
              </div>
            )}

            {!isSearching &&
              !isDeepSearching &&
              verseResults.map((res, idx) => (
                <button
                  key={`${res.surah.number}-${res.verseId}-${idx}`}
                  type="button"
                  onClick={() => handleResultClick(res.surah.number, res.verseId)}
                  className="w-full text-left p-3.5 hover:bg-stone-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors group cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-quran-gold uppercase tracking-wider bg-quran-gold/10 px-2 py-0.5 rounded-md">
                        {t('surah')} {res.surah.englishName}
                      </span>
                      <span className="text-xs font-bold text-quran-dark dark:text-gray-200">
                        {t('verse')} {res.verseId}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-500 group-hover:text-quran-gold group-hover:translate-x-0.5 transition-all" />
                  </div>
                  {res.text && res.text !== res.translation && (
                    <p className="font-arabic text-right text-lg text-quran-dark/80 dark:text-white/80 mb-2 line-clamp-2 leading-relaxed" dir="rtl">
                      {res.text}
                    </p>
                  )}
                  <p
                    className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: res.translation.replace(
                        new RegExp(`(${escapeRegExp(value)})`, 'gi'),
                        '<mark class="bg-amber-200 dark:bg-amber-500/40 text-gray-900 dark:text-white rounded px-1 font-semibold">$1</mark>'
                      ),
                    }}
                  />
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
