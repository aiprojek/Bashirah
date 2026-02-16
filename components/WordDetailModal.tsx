import React, { useState, useEffect } from 'react';
import { Word } from '../types';
import { X, Search, Loader2, ArrowRight } from 'lucide-react';
import { findOccurrences } from '../services/quranService';
import { useNavigate } from 'react-router-dom';

interface WordDetailModalProps {
  word: Word;
  isOpen: boolean;
  onClose: () => void;
}

const WordDetailModal: React.FC<WordDetailModalProps> = ({ word, isOpen, onClose }) => {
  const [occurrences, setOccurrences] = useState<{surahId: number, verseId: number, text: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const navigate = useNavigate();

  // Reset state when modal opens/closes or word changes
  useEffect(() => {
    setOccurrences([]);
    setHasSearched(false);
    setLoading(false);
  }, [isOpen, word]);

  if (!isOpen) return null;

  const handleVerseClick = (surahId: number, verseId: number) => {
      onClose();
      navigate(`/surah/${surahId}#verse-${verseId}`);
  };

  const handleSearch = () => {
      setLoading(true);
      setHasSearched(true);
      
      let searchTerm = '';
      let type: 'root' | 'text' = 'text';

      // Smart search logic kept hidden from UI for better UX
      // It tries to find the best way to search, but doesn't confuse user with details
      if (word.root) {
          searchTerm = word.root;
          type = 'root';
      } else if (word.lemma) {
          searchTerm = word.lemma;
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
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4 animate-fade-in">
        {/* Backdrop */}
        <div 
            className="absolute inset-0 bg-quran-dark/70 backdrop-blur-sm transition-opacity"
            onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="p-8 bg-pattern-overlay bg-quran-cream border-b border-stone-200 flex flex-col items-center justify-center relative">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 text-gray-500 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="mb-4 text-center w-full">
                    <p className="font-arabic text-7xl text-quran-dark leading-tight drop-shadow-sm py-2">
                        {word.text_uthmani}
                    </p>
                </div>
                
                <div className="text-center space-y-2 max-w-xs mx-auto">
                    <p className="font-serif text-xl font-bold text-gray-800 leading-snug">
                        {word.translation?.text}
                    </p>
                    <p className="font-sans text-sm text-gray-500 italic">
                        {word.transliteration?.text}
                    </p>
                </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-white">
                
                {/* Search / Concordance Section */}
                <div className="space-y-4">
                    {!hasSearched ? (
                         <div className="py-8 text-center bg-stone-50 rounded-xl border border-stone-100">
                             <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-stone-100 text-quran-gold">
                                <Search className="w-6 h-6" />
                             </div>
                             <p className="text-sm text-gray-600 mb-1 font-medium">
                                 Jelajahi Al-Quran
                             </p>
                             <p className="text-xs text-gray-400 mb-5 px-8 leading-relaxed">
                                 Temukan di ayat mana saja kata ini (atau kata dasarnya) disebutkan dalam Al-Quran.
                             </p>
                             <button 
                                onClick={handleSearch}
                                className="px-6 py-3 bg-quran-dark text-white rounded-xl font-bold text-sm hover:bg-quran-dark/90 transition-all shadow-lg shadow-quran-dark/20 inline-flex items-center gap-2"
                             >
                                 Cari Kata Ini
                                 <ArrowRight className="w-4 h-4" />
                             </button>
                         </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between text-quran-gold font-bold text-xs uppercase tracking-widest border-b border-stone-100 pb-2 mb-4">
                                <div className="flex items-center gap-2">
                                    <Search className="w-4 h-4" />
                                    <span>Hasil Pencarian</span>
                                </div>
                                {!loading && (
                                    <span className="bg-quran-gold/10 px-2 py-0.5 rounded text-[10px] text-quran-dark">
                                        {occurrences.length > 49 ? '50+' : occurrences.length} Ayat Ditemukan
                                    </span>
                                )}
                            </div>

                            {loading ? (
                                <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-3">
                                    <Loader2 className="w-8 h-8 text-quran-gold animate-spin" />
                                    <span className="text-xs font-medium">Sedang memindai seluruh Al-Quran...</span>
                                </div>
                            ) : occurrences.length > 0 ? (
                                <div className="space-y-3">
                                    {occurrences.map((occ, idx) => (
                                        <button 
                                            key={idx} 
                                            onClick={() => handleVerseClick(occ.surahId, occ.verseId)}
                                            className="w-full text-right p-4 hover:bg-stone-50 rounded-xl border border-transparent hover:border-stone-200 transition-all group bg-white shadow-sm"
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="flex items-center gap-1 text-quran-gold text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                                    <span>Buka</span>
                                                    <ArrowRight className="w-3 h-3" />
                                                </div>
                                                <span className="text-[10px] font-bold bg-stone-100 text-stone-600 px-2 py-1 rounded border border-stone-200">
                                                    QS {occ.surahId}:{occ.verseId}
                                                </span>
                                            </div>
                                            <p className="font-arabic text-lg text-gray-600 leading-loose line-clamp-2" dir="rtl">
                                                {occ.text}
                                            </p>
                                        </button>
                                    ))}
                                    {occurrences.length >= 50 && (
                                        <p className="text-center text-xs text-gray-400 italic pt-4">
                                            Menampilkan 50 hasil pertama...
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="py-8 text-center bg-stone-50 rounded-xl border border-dashed border-stone-200">
                                    <p className="text-gray-400 text-sm italic">Tidak ada ayat lain yang ditemukan.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default WordDetailModal;