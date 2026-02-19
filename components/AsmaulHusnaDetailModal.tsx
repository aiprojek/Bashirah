
import React, { useState, useEffect } from 'react';
import { X, Volume2, BookOpen, Loader2, ArrowRight } from 'lucide-react';
import { AsmaulHusna } from '../services/asmaulHusnaData';
import { searchGlobalVerses } from '../services/quranService';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

interface AsmaulHusnaDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: AsmaulHusna | null;
}

const AsmaulHusnaDetailModal: React.FC<AsmaulHusnaDetailModalProps> = ({ isOpen, onClose, data }) => {
    const { t, language } = useLanguage();
    const [verses, setVerses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const navigate = useNavigate();

    // Reset when data changes
    useEffect(() => {
        if (isOpen && data) {
            fetchDalil();
        } else {
            setVerses([]);
        }
    }, [isOpen, data]);

    const fetchDalil = async () => {
        if (!data) return;
        setLoading(true);
        
        try {
            // Using translation ID to search for verses related to the meaning if needed, 
            // but primarily searching arabic or specific known verses.
            // For now, keeping the simple text search logic.
            const results = await searchGlobalVerses(data.arabic, 'quran-simple');
            setVerses(results.slice(0, 5));
        } catch (error) {
            console.error("Failed to find dalil", error);
        } finally {
            setLoading(false);
        }
    };

    const playAudio = () => {
        if (!data) return;
        setIsPlaying(true);
        
        // Use Web Speech API for Arabic pronunciation
        const utterance = new SpeechSynthesisUtterance(data.arabic);
        utterance.lang = 'ar-SA';
        utterance.rate = 0.8; 
        
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        
        window.speechSynthesis.speak(utterance);
    };

    const handleVerseClick = (surahId: number, verseId: number) => {
        navigate(`/surah/${surahId}#verse-${verseId}`);
        onClose();
    };

    if (!isOpen || !data) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-fade-in">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-quran-dark/80 dark:bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden border border-white/10">
                
                {/* Header / Top Card */}
                <div className="relative bg-gradient-to-br from-quran-dark to-[#142924] p-8 text-center text-white shrink-0 overflow-hidden">
                    {/* Decorative Background */}
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] pointer-events-none"></div>
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-quran-gold/20 rounded-full blur-3xl"></div>
                    
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-20"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="relative z-10 flex flex-col items-center">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-quran-gold/80 mb-2 border border-quran-gold/20 px-3 py-1 rounded-full bg-black/20">
                            Asmaul Husna #{data.index}
                        </span>
                        
                        <h2 className="font-arabic text-6xl mb-4 drop-shadow-md py-2">{data.arabic}</h2>
                        
                        <h3 className="text-2xl font-bold font-serif mb-1">{data.latin}</h3>
                        <p className="text-quran-gold text-sm font-medium">
                            {language === 'id' ? data.translation_id : data.translation_en}
                        </p>
                        
                        <button 
                            onClick={playAudio}
                            disabled={isPlaying}
                            className={`mt-6 flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs transition-all ${
                                isPlaying 
                                ? 'bg-quran-gold text-white shadow-inner' 
                                : 'bg-white text-quran-dark hover:bg-stone-100 shadow-lg'
                            }`}
                        >
                            {isPlaying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
                            {isPlaying ? t('names_playing') : t('names_listen')}
                        </button>
                    </div>
                </div>

                {/* Body: Dalil */}
                <div className="flex-1 overflow-y-auto bg-stone-50 dark:bg-slate-900 p-6 custom-scrollbar">
                    <div className="flex items-center gap-2 mb-4 text-gray-500 dark:text-gray-400 font-bold text-xs uppercase tracking-wider">
                        <BookOpen className="w-4 h-4 text-quran-gold" />
                        {t('names_dalil_title')}
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
                            <Loader2 className="w-6 h-6 animate-spin text-quran-gold" />
                            <span className="text-xs">{t('loading')}</span>
                        </div>
                    ) : verses.length > 0 ? (
                        <div className="space-y-3">
                            {verses.map((v, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => handleVerseClick(v.surah.number, v.verseId)}
                                    className="w-full text-left bg-white dark:bg-slate-800 p-4 rounded-xl border border-stone-100 dark:border-slate-700 hover:border-quran-gold dark:hover:border-quran-gold hover:shadow-md transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-bold bg-stone-100 dark:bg-slate-700 text-stone-600 dark:text-gray-300 px-2 py-1 rounded">
                                            QS. {v.surah.englishName} : {v.verseId}
                                        </span>
                                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-quran-gold" />
                                    </div>
                                    <p className="font-arabic text-xl text-right text-gray-800 dark:text-gray-200 leading-loose line-clamp-2" dir="rtl">
                                        {v.text}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-2 italic">
                                        {t('lib_view_verse')}
                                    </p>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-stone-200 dark:border-slate-700">
                            <p className="text-gray-400 text-sm">{t('names_dalil_empty')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AsmaulHusnaDetailModal;
