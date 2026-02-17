
import React, { useState, useEffect, useMemo } from 'react';
import { X, ArrowRight, BookOpen, Hash } from 'lucide-react';
import { Surah } from '../types';

interface QuickJumpModalProps {
    isOpen: boolean;
    onClose: () => void;
    surahs: Surah[];
    currentSurahId: number;
    onNavigate: (surahId: number, verseId: number) => void;
}

const QuickJumpModal: React.FC<QuickJumpModalProps> = ({
    isOpen,
    onClose,
    surahs,
    currentSurahId,
    onNavigate
}) => {
    const [selectedSurahId, setSelectedSurahId] = useState<number>(currentSurahId);
    const [selectedVerseId, setSelectedVerseId] = useState<number>(1);

    // Update internal state when modal opens with new current surah
    useEffect(() => {
        if (isOpen) {
            setSelectedSurahId(currentSurahId);
            setSelectedVerseId(1);
        }
    }, [isOpen, currentSurahId]);

    // Get selected surah object to know total verses
    const selectedSurah = useMemo(() => 
        surahs.find(s => s.id === selectedSurahId) || surahs[0], 
    [selectedSurahId, surahs]);

    const handleSurahChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newId = parseInt(e.target.value);
        setSelectedSurahId(newId);
        setSelectedVerseId(1); // Reset verse to 1 when surah changes
    };

    const handleGo = () => {
        onNavigate(selectedSurahId, selectedVerseId);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-fade-in">
            <div 
                className="absolute inset-0 bg-quran-dark/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col transform transition-all scale-100">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
                    <h3 className="font-bold text-quran-dark font-serif text-lg">Pindah Cepat</h3>
                    <button 
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-stone-200 text-gray-400 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                    {/* Surah Selector */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-quran-gold" /> Pilih Surat
                        </label>
                        <div className="relative">
                            <select 
                                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-quran-gold/50 focus:border-quran-gold outline-none text-gray-700 font-bold appearance-none cursor-pointer"
                                value={selectedSurahId}
                                onChange={handleSurahChange}
                            >
                                {surahs.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.id}. {s.transliteration}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <ArrowRight className="w-4 h-4 rotate-90" />
                            </div>
                        </div>
                    </div>

                    {/* Verse Selector */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <Hash className="w-4 h-4 text-quran-gold" /> Pilih Ayat (1 - {selectedSurah?.total_verses})
                        </label>
                        <input 
                            type="number" 
                            min={1} 
                            max={selectedSurah?.total_verses || 286}
                            value={selectedVerseId}
                            onChange={(e) => setSelectedVerseId(Math.min(Math.max(1, parseInt(e.target.value) || 1), selectedSurah?.total_verses || 286))}
                            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-quran-gold/50 focus:border-quran-gold outline-none text-gray-700 font-bold"
                        />
                         <input 
                            type="range"
                            min={1}
                            max={selectedSurah?.total_verses || 286}
                            value={selectedVerseId}
                            onChange={(e) => setSelectedVerseId(parseInt(e.target.value))}
                            className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-quran-gold"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-stone-50 border-t border-stone-100">
                    <button 
                        onClick={handleGo}
                        className="w-full py-3 bg-quran-dark text-white rounded-xl font-bold hover:bg-quran-dark/90 transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                        Buka Ayat <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuickJumpModal;
