
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EMOTIONS, EmotionTopic } from '../services/emotionData';
import { 
    Heart, ChevronRight, X, ArrowRight, Quote, 
    CloudDrizzle, Waves, Feather, Flame, Sun, Droplets, Anchor, Compass
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const EmotionPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [selectedEmotion, setSelectedEmotion] = useState<EmotionTopic | null>(null);

    const handleVerseClick = (surahId: number, verseId: number) => {
        navigate(`/surah/${surahId}#verse-${verseId}`);
    };

    // Helper to map string name to component
    const renderIcon = (name: string, className: string) => {
        const icons: any = { 
            CloudDrizzle, Waves, Feather, Flame, 
            Sun, Droplets, Anchor, Compass 
        };
        const Icon = icons[name] || Heart;
        return <Icon className={className} />;
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in min-h-screen pb-24">
            
            {/* Header */}
            <div className="text-center mb-10">
                <div className="inline-block p-3 bg-quran-gold/10 rounded-full mb-4 ring-1 ring-quran-gold/20">
                    <Heart className="w-8 h-8 text-quran-gold fill-current" />
                </div>
                <h1 className="text-4xl font-bold text-quran-dark dark:text-white font-serif mb-2">
                    {t('feelings_title')}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto font-serif italic text-sm">
                    {t('feelings_desc')}
                </p>
            </div>

            {/* Elegant Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {EMOTIONS.map((emotion) => (
                    <button 
                        key={emotion.id}
                        onClick={() => setSelectedEmotion(emotion)}
                        className="group relative bg-white dark:bg-slate-800 p-5 md:p-6 rounded-xl border border-stone-200 dark:border-slate-700 hover:border-quran-gold dark:hover:border-quran-gold transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-left flex flex-col justify-between"
                    >
                        {/* Background Decoration */}
                        <div className="absolute -right-4 -top-4 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-10 transition-opacity duration-500 transform group-hover:scale-110 group-hover:rotate-12 pointer-events-none">
                             {renderIcon(emotion.icon, "w-24 h-24 md:w-32 md:h-32 text-quran-dark dark:text-white")}
                        </div>

                        <div className="relative z-10">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-stone-50 dark:bg-slate-700 border border-stone-100 dark:border-slate-600 flex items-center justify-center text-gray-500 dark:text-gray-300 mb-4 md:mb-6 group-hover:bg-quran-dark group-hover:text-quran-gold group-hover:border-quran-dark dark:group-hover:bg-quran-gold dark:group-hover:text-quran-dark transition-colors duration-300">
                                {renderIcon(emotion.icon, "w-5 h-5")}
                            </div>
                            
                            <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-100 font-serif mb-2 group-hover:text-quran-dark dark:group-hover:text-quran-gold transition-colors break-words">
                                {t(`emotion_${emotion.id}_label`)}
                            </h3>
                            <p className="text-[11px] md:text-xs text-gray-500 dark:text-gray-400 leading-relaxed opacity-80 mb-4 group-hover:opacity-100 font-sans">
                                {t(`emotion_${emotion.id}_desc`)}
                            </p>
                        </div>
                        
                        <div className="relative z-10 flex items-center text-[10px] font-bold uppercase tracking-widest text-quran-gold group-hover:translate-x-1 transition-transform duration-300">
                            <span>{t('feelings_view')}</span>
                            <ChevronRight className="w-3 h-3 ml-1" />
                        </div>
                    </button>
                ))}
            </div>

            {/* Elegant Detail Modal */}
            {selectedEmotion && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <div 
                        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setSelectedEmotion(null)}
                    />
                    
                    <div className="relative bg-[#fcfbf7] dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in flex flex-col max-h-[85vh] border border-white/50 dark:border-white/10">
                        {/* Modal Header */}
                        <div className="px-5 py-6 md:px-8 md:py-8 text-center relative overflow-hidden bg-white dark:bg-slate-800 border-b border-stone-100 dark:border-slate-700 shrink-0">
                            <div className="absolute inset-0 bg-pattern-overlay opacity-50 dark:opacity-10"></div>
                            
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-stone-50 dark:bg-slate-700 border border-stone-200 dark:border-slate-600 flex items-center justify-center text-quran-dark dark:text-quran-gold mb-3 md:mb-4 shadow-sm">
                                    {renderIcon(selectedEmotion.icon, "w-6 h-6 md:w-8 md:h-8")}
                                </div>
                                <h3 className="font-bold font-serif text-xl md:text-2xl text-quran-dark dark:text-white mb-2 break-words w-full">{t(`emotion_${selectedEmotion.id}_label`)}</h3>
                                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 leading-relaxed w-full font-serif italic px-2">
                                    {t(`emotion_${selectedEmotion.id}_desc`)}
                                </p>
                            </div>
                            
                            <button 
                                onClick={() => setSelectedEmotion(null)}
                                className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 dark:hover:bg-slate-700 text-gray-400 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Verses List */}
                        <div className="flex-1 overflow-y-auto p-6 bg-[#fcfbf7] dark:bg-slate-900 space-y-3 custom-scrollbar">
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 text-center">{t('feelings_select')}</h4>
                            
                            {selectedEmotion.verses.map((ref, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleVerseClick(ref.surahId, ref.verseId)}
                                    className="w-full bg-white dark:bg-slate-800 p-5 rounded-xl border border-stone-200/60 dark:border-slate-700 shadow-sm hover:border-quran-gold/50 dark:hover:border-quran-gold/50 hover:shadow-md transition-all flex items-center justify-between group text-left"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-10 h-10 flex-shrink-0 rounded-full bg-stone-50 dark:bg-slate-700 border border-stone-100 dark:border-slate-600 flex items-center justify-center text-quran-gold group-hover:bg-quran-dark dark:group-hover:bg-quran-gold group-hover:text-white dark:group-hover:text-quran-dark transition-colors">
                                            <Quote className="w-4 h-4 fill-current" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-quran-dark dark:text-gray-100 text-base font-serif">QS. {ref.surahName}</h4>
                                            <p className="text-xs text-gray-400 font-sans mt-0.5">{t('lib_verse')} {ref.verseId}</p>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 dark:text-gray-600 group-hover:text-quran-gold group-hover:bg-stone-50 dark:group-hover:bg-slate-700 transition-all">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Modal Footer */}
                         <div className="p-4 bg-white dark:bg-slate-800 border-t border-stone-100 dark:border-slate-700 text-center">
                            <button 
                                onClick={() => setSelectedEmotion(null)}
                                className="text-xs font-bold text-gray-400 hover:text-quran-dark dark:hover:text-quran-gold transition-colors uppercase tracking-wider"
                            >
                                {t('btn_close')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmotionPage;
