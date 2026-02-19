
import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, ArrowRight, Loader2, Wifi, Download, Settings } from 'lucide-react';
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

  // Debounce search
  useEffect(() => {
    if (!value || value.length < 3) {
      setVerseResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchGlobalVerses(value, translationId);
        setVerseResults(results);
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    }, 600); // 600ms debounce

    return () => clearTimeout(timer);
  }, [value, translationId]);

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
                        <p className="text-xs font-bold text-blue-800 dark:text-blue-300">Pencarian Online Aktif</p>
                        <p className="text-[10px] text-blue-600 dark:text-blue-400 leading-relaxed mt-0.5">
                            Data terjemahan belum diunduh. Pencarian mungkin lebih lambat.
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
            <div className="flex items-center justify-between px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-stone-100 dark:border-slate-700 bg-stone-50/50 dark:bg-slate-700/50">
                <span>Hasil Pencarian Ayat</span>
                {isSearching && <Loader2 className="w-3 h-3 animate-spin text-quran-gold" />}
            </div>

            {/* RESULTS LIST */}
            <div className="p-2">
                {!isSearching && verseResults.length === 0 && (
                    <div className="p-6 text-center text-gray-400 text-sm">
                        <p className="italic mb-2">Tidak ditemukan ayat dengan kata kunci "{value}".</p>
                        {!isOfflineReady && (
                            <p className="text-xs text-gray-400">Pastikan koneksi internet lancar atau unduh data di Pengaturan.</p>
                        )}
                    </div>
                )}

                {verseResults.map((res, idx) => (
                    <button
                        key={`${res.surah.number}-${res.verseId}-${idx}`}
                        onMouseDown={(e) => { e.preventDefault(); handleResultClick(res.surah.number, res.verseId); }}
                        className="w-full text-left p-3 hover:bg-stone-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors group border-b border-stone-50 dark:border-slate-700 last:border-0"
                    >
                        <div className="flex justify-between items-start mb-1">
                             <span className="text-xs font-bold bg-quran-gold/10 text-quran-dark dark:text-quran-gold px-2 py-0.5 rounded">
                                 QS. {res.surah.englishName} : {res.verseId}
                             </span>
                             <ArrowRight className="w-3 h-3 text-gray-300 dark:text-gray-600 group-hover:text-quran-gold" />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed" 
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
