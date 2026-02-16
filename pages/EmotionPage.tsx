
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EMOTIONS, EmotionTopic } from '../services/emotionData';
import { 
    Heart, ChevronRight, X, ArrowRight, Quote, 
    CloudDrizzle, Waves, Feather, Flame, Sun, Droplets, Anchor, Compass
} from 'lucide-react';

const EmotionPage: React.FC = () => {
    const navigate = useNavigate();
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
            
            {/* Elegant Header */}
            <div className="text-center mb-12 relative">
                <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-stone-300 to-transparent opacity-50 -z-10"></div>
                <div className="inline-block bg-stone-50 px-6 relative z-10">
                    <div className="w-16 h-16 mx-auto bg-quran-gold/10 rounded-2xl flex items-center justify-center text-quran-dark mb-4 border border-quran-gold/20 rotate-45">
                        <div className="-rotate-45">
                            <Heart className="w-8 h-8 fill-current text-quran-gold" />
                        </div>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-quran-dark font-serif mb-3 tracking-tight">
                        Penawar Hati
                    </h2>
                    <p className="text-gray-500 font-serif italic text-sm md:text-base max-w-lg mx-auto">
                        "Ingatlah, hanya dengan mengingat Allah hati menjadi tenteram."
                    </p>
                </div>
            </div>

            {/* Elegant Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {EMOTIONS.map((emotion) => (
                    <button 
                        key={emotion.id}
                        onClick={() => setSelectedEmotion(emotion)}
                        className="group relative bg-white p-6 rounded-xl border border-stone-200 hover:border-quran-gold transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-left flex flex-col justify-between overflow-hidden"
                    >
                        {/* Background Decoration */}
                        <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500 transform group-hover:scale-110 group-hover:rotate-12">
                             {renderIcon(emotion.icon, "w-32 h-32 text-quran-dark")}
                        </div>

                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center text-gray-500 mb-6 group-hover:bg-quran-dark group-hover:text-quran-gold group-hover:border-quran-dark transition-colors duration-300">
                                {renderIcon(emotion.icon, "w-5 h-5")}
                            </div>
                            
                            <h3 className="text-lg font-bold text-gray-800 font-serif mb-2 group-hover:text-quran-dark transition-colors">
                                {emotion.label}
                            </h3>
                            <p className="text-xs text-gray-500 leading-relaxed opacity-80 line-clamp-2 mb-4 group-hover:opacity-100 font-sans">
                                {emotion.description}
                            </p>
                        </div>
                        
                        <div className="relative z-10 flex items-center text-[10px] font-bold uppercase tracking-widest text-quran-gold group-hover:translate-x-1 transition-transform duration-300">
                            <span>Lihat Ayat</span>
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
                    
                    <div className="relative bg-[#fcfbf7] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in flex flex-col max-h-[85vh] border border-white/50">
                        {/* Modal Header */}
                        <div className="px-8 py-8 text-center relative overflow-hidden bg-white border-b border-stone-100">
                            <div className="absolute inset-0 bg-pattern-overlay opacity-50"></div>
                            
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-16 h-16 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-quran-dark mb-4 shadow-sm">
                                    {renderIcon(selectedEmotion.icon, "w-8 h-8")}
                                </div>
                                <h3 className="font-bold font-serif text-2xl text-quran-dark mb-2">{selectedEmotion.label}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed max-w-xs font-serif italic">
                                    {selectedEmotion.description}
                                </p>
                            </div>
                            
                            <button 
                                onClick={() => setSelectedEmotion(null)}
                                className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 text-gray-400 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Verses List */}
                        <div className="flex-1 overflow-y-auto p-6 bg-[#fcfbf7] space-y-3 custom-scrollbar">
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 text-center">Ayat-Ayat Pilihan</h4>
                            
                            {selectedEmotion.verses.map((ref, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleVerseClick(ref.surahId, ref.verseId)}
                                    className="w-full bg-white p-5 rounded-xl border border-stone-200/60 shadow-sm hover:border-quran-gold/50 hover:shadow-md transition-all flex items-center justify-between group text-left"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-10 h-10 flex-shrink-0 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center text-quran-gold group-hover:bg-quran-dark group-hover:text-white transition-colors">
                                            <Quote className="w-4 h-4 fill-current" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-quran-dark text-base font-serif">QS. {ref.surahName}</h4>
                                            <p className="text-xs text-gray-400 font-sans mt-0.5">Ayat ke-{ref.verseId}</p>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 group-hover:text-quran-gold group-hover:bg-stone-50 transition-all">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Modal Footer */}
                         <div className="p-4 bg-white border-t border-stone-100 text-center">
                            <button 
                                onClick={() => setSelectedEmotion(null)}
                                className="text-xs font-bold text-gray-400 hover:text-quran-dark transition-colors uppercase tracking-wider"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmotionPage;
