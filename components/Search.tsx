
import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, ArrowRight, Loader2, Wifi, Download, Settings, Zap, Globe } from 'lucide-react';
import { searchGlobalVerses } from '../services/quranService';
import { isEditionDownloaded } from '../services/db'; // Import DB check
import { useNavigate } from 'react-router-dom';

interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  translationId: string; // Need this to check if data exists
}

// Helper to escape regex characters
const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const Search: React.FC<SearchProps> = ({ value, onChange, translationId }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [verseResults, setVerseResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDeepSearching, setIsDeepSearching] = useState(false);
  const [isOfflineReady, setIsOfflineReady] = useState(false); // Track if data is downloaded
  const navigate = useNavigate();

  // Check if translation is downloaded whenever translationId changes
  useEffect(() => {
      const checkStatus = async () => {
          const downloaded = await isEditionDownloaded(translationId);
          setIsOfflineReady(downloaded);
      };
      checkStatus();
  }, [translationId]);

  const performSearch = async (query: string, deep: boolean = false) => {
    if (deep) setIsDeepSearching(true);
    else setIsSearching(true);

    try {
      const results = await searchGlobalVerses(query, translationId, deep);
      setVerseResults(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
      setIsDeepSearching(false);
    }
  };

  // Debounce search
  useEffect(() => {
    if (!value || value.length < 3) {
      setVerseResults([]);
      return;
    }

    const timer = setTimeout(() => {
      performSearch(value, false);
    }, 600); // 600ms debounce

    return () => clearTimeout(timer);
  }, [value, translationId]);

  const handleDeepSearch = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    performSearch(value, true);
  };

  const handleResultClick = (surahId: number, verseId: number) => {
    navigate(`/surah/${surahId}#verse-${verseId}`);
    setIsFocused(false);
  };

  const handleGoToSettings = () => {
      navigate('/settings');
  };

  return (
    <div className="relative max-w-xl mx-auto mb-8 z-30">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <SearchIcon className={`h-5 w-5 transition-colors ${isFocused ? 'text-quran-gold' : 'text-gray-400'}`} />
      </div>
      <input
        type="text"
        className={`block w-full pl-11 pr-4 py-4 bg-white dark:bg-slate-800 border rounded-2xl leading-5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-quran-gold/50 focus:border-quran-gold sm:text-sm shadow-sm transition-all text-gray-800 dark:text-white ${
            isFocused ? 'border-quran-gold ring-2 ring-quran-gold/20' : 'border-stone-200 dark:border-slate-700'
        }`}
        placeholder="Cari surat atau ayat (contoh: 'sabar', 'puasa', 'Al-Kahfi')..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
      />

      {/* DROPDOWN RESULTS */}
      {isFocused && value.length >= 3 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-stone-100 dark:border-slate-700 overflow-hidden max-h-[60vh] overflow-y-auto animate-fade-in custom-scrollbar">
            
            {/* OFFLINE STATUS NOTIFICATION */}
            {!isOfflineReady && (
                <div className="bg-blue-50 dark:bg-blue-900/30 border-b border-blue-100 dark:border-blue-900 p-3 flex items-start gap-3">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-800 rounded-full text-blue-600 dark:text-blue-300 mt-0.5">
                        <Wifi className="w-3 h-3" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-bold text-blue-800 dark:text-blue-300">Pencarian Offline Dasar Aktif</p>
                        <p className="text-[10px] text-blue-600 dark:text-blue-400 leading-relaxed mt-0.5">
                            Data terjemahan belum diunduh. Pencarian offline tetap bisa untuk teks Arab, namun hasil terjemahan lebih lengkap jika data diunduh.
                        </p>
                        <button 
                            onMouseDown={(e) => { e.preventDefault(); handleGoToSettings(); }} // onMouseDown prevents blur issue
                            className="mt-2 text-[10px] font-bold bg-blue-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors w-fit"
                        >
                            <Download className="w-3 h-3" /> Unduh Data Offline
                        </button>
                    </div>
                </div>
            )}

            {/* RESULTS HEADER */}
            <div className="flex items-center justify-between px-4 py-2.5 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-stone-100 dark:border-slate-700 bg-stone-50/50 dark:bg-slate-700/50">
                <div className="flex items-center gap-2">
                    <span>Hasil Pencarian Ayat</span>
                    {verseResults.length > 0 && <span className="text-[10px] bg-stone-200 dark:bg-slate-600 text-gray-600 dark:text-gray-300 px-1.5 rounded-full lowercase">{verseResults.length} hasil</span>}
                </div>
                {(isSearching || isDeepSearching) && <Loader2 className="w-3 h-3 animate-spin text-quran-gold" />}
            </div>

            {/* DEEP SEARCH TRIGGER */}
            {value.length >= 3 && !isDeepSearching && (
                <div className="px-3 py-2 border-b border-stone-50 dark:border-slate-700/50 bg-quran-gold/5 dark:bg-quran-gold/10">
                    <button
                        onMouseDown={handleDeepSearch}
                        className="w-full flex items-center justify-between gap-3 text-[11px] group"
                    >
                        <div className="flex items-center gap-2 text-quran-dark dark:text-quran-gold font-bold">
                            <Zap className="w-3 h-3 fill-current" />
                            <span>Pencarian Mendalam (Online)</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400 group-hover:text-quran-gold transition-colors">
                            <span>Tekan untuk hasil lebih akurat</span>
                            <ArrowRight className="w-3 h-3" />
                        </div>
                    </button>
                </div>
            )}

            {/* RESULTS LIST */}
            <div className="p-2">
                {!isSearching && !isDeepSearching && verseResults.length === 0 && (
                    <div className="p-8 text-center text-gray-400">
                        <p className="text-sm italic mb-3">Tidak ditemukan ayat dengan kata kunci "{value}".</p>
                        <button
                           onMouseDown={handleDeepSearch}
                           className="inline-flex items-center gap-2 px-4 py-2 bg-quran-dark text-white rounded-xl text-xs font-bold hover:bg-quran-gold transition-colors"
                        >
                           <Globe className="w-3.5 h-3.5" />
                           Coba Pencarian Mendalam
                        </button>
                    </div>
                )}

                {isDeepSearching && (
                    <div className="p-12 text-center flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 text-quran-gold animate-spin" />
                        <p className="text-sm font-bold text-gray-500">Mencari di seluruh database...</p>
                        <p className="text-[11px] text-gray-400">Pencarian mendalam memindai setiap ayat dan terjemahan.</p>
                    </div>
                )}

                {!isDeepSearching && verseResults.map((res, idx) => (
                    <button
                        key={`${res.surah.number}-${res.verseId}-${idx}`}
                        onMouseDown={(e) => { e.preventDefault(); handleResultClick(res.surah.number, res.verseId); }}
                        className="w-full text-left p-3.5 hover:bg-stone-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors group border-b border-stone-50 dark:border-slate-700/50 last:border-0"
                    >
                        <div className="flex justify-between items-start mb-2">
                             <div className="flex flex-col gap-1">
                                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                     Surat {res.surah.englishName}
                                 </span>
                                 <span className="text-xs font-bold text-quran-dark dark:text-quran-gold">
                                     Ayat {res.verseId}
                                 </span>
                             </div>
                             <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-quran-gold group-hover:translate-x-0.5 transition-all" />
                        </div>
                        {res.text && res.text !== res.translation && (
                            <p className="font-arabic text-right text-lg text-quran-dark/60 dark:text-white/40 mb-2 line-clamp-1 leading-relaxed">
                                {res.text}
                            </p>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed" 
                           dangerouslySetInnerHTML={{
                               __html: res.translation.replace(new RegExp(`(${escapeRegExp(value)})`, 'gi'), '<mark class="bg-yellow-200 text-gray-800 rounded-sm px-0.5">$1</mark>')
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
