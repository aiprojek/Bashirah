
import React, { useState, useEffect, useCallback } from 'react';
import { Search as SearchIcon, ArrowRight, Loader2, BookOpen } from 'lucide-react';
import { searchGlobalVerses } from '../services/quranService';
import { useNavigate } from 'react-router-dom';

interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  // New prop to trigger external search logic if needed, or we handle it here
}

const Search: React.FC<SearchProps> = ({ value, onChange }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [verseResults, setVerseResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  // Debounce search
  useEffect(() => {
    if (!value || value.length < 3) {
      setVerseResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchGlobalVerses(value);
        setVerseResults(results);
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    }, 600); // 600ms debounce

    return () => clearTimeout(timer);
  }, [value]);

  const handleResultClick = (surahId: number, verseId: number) => {
    navigate(`/surah/${surahId}#verse-${verseId}`);
    // Optional: Clear search or collapse
    setIsFocused(false);
  };

  return (
    <div className="relative max-w-xl mx-auto mb-8 z-30">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <SearchIcon className={`h-5 w-5 transition-colors ${isFocused ? 'text-quran-gold' : 'text-gray-400'}`} />
      </div>
      <input
        type="text"
        className={`block w-full pl-11 pr-4 py-4 bg-white border rounded-2xl leading-5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-quran-gold/50 focus:border-quran-gold sm:text-sm shadow-sm transition-all ${
            isFocused ? 'border-quran-gold ring-2 ring-quran-gold/20' : 'border-stone-200'
        }`}
        placeholder="Cari surat atau ayat (contoh: 'sabar', 'puasa', 'Al-Kahfi')..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)} // Delay to allow click
      />

      {/* DROPDOWN RESULTS */}
      {isFocused && value.length >= 3 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-stone-100 overflow-hidden max-h-[60vh] overflow-y-auto animate-fade-in custom-scrollbar">
            
            {/* 1. Surah Matches (Filtered in Parent) */}
            {/* We assume parent handles surah list filtering and passes control, 
                but here we focus on showing Verse Search Results.
                The user can still see filtered Surah cards below this input in the main layout.
             */}
            
            {/* 2. Verse Matches */}
            <div className="p-2">
                <div className="flex items-center justify-between px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-stone-100">
                    <span>Hasil Pencarian Ayat</span>
                    {isSearching && <Loader2 className="w-3 h-3 animate-spin text-quran-gold" />}
                </div>

                {!isSearching && verseResults.length === 0 && (
                    <div className="p-4 text-center text-gray-400 text-sm italic">
                        Tidak ditemukan ayat dengan kata kunci "{value}".
                    </div>
                )}

                {verseResults.map((res, idx) => (
                    <button
                        key={`${res.surah.number}-${res.verseId}-${idx}`}
                        onClick={() => handleResultClick(res.surah.number, res.verseId)}
                        className="w-full text-left p-3 hover:bg-stone-50 rounded-lg transition-colors group border-b border-stone-50 last:border-0"
                    >
                        <div className="flex justify-between items-start mb-1">
                             <span className="text-xs font-bold bg-quran-gold/10 text-quran-dark px-2 py-0.5 rounded">
                                 QS. {res.surah.englishName} : {res.verseId}
                             </span>
                             <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-quran-gold" />
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed" 
                           dangerouslySetInnerHTML={{
                               // Simple highlight logic
                               __html: res.translation.replace(new RegExp(`(${value})`, 'gi'), '<mark class="bg-yellow-200 text-gray-800 rounded-sm px-0.5">$1</mark>')
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
