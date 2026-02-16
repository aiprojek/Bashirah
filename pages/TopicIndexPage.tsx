
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TOPICS } from '../services/topicData';
import { Topic } from '../types';
import { 
    Moon, HeartHandshake, Users, Sparkles, Coins, Smile, BookOpen, 
    Lightbulb, ChevronRight, X, ArrowRight 
} from 'lucide-react';

const TopicIndexPage: React.FC = () => {
    const navigate = useNavigate();
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

    // Helper to render dynamic icon
    const renderIcon = (name: string, className: string) => {
        const icons: any = { Moon, HeartHandshake, Users, Sparkles, Coins, Smile, BookOpen, Lightbulb };
        const Icon = icons[name] || BookOpen;
        return <Icon className={className} />;
    };

    const handleVerseClick = (surahId: number, verseId: number) => {
        navigate(`/surah/${surahId}#verse-${verseId}`);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in min-h-screen">
            
            {/* Header */}
            <div className="text-center mb-10">
                <div className="inline-block p-3 bg-quran-gold/10 rounded-full mb-4">
                    <BookOpen className="w-8 h-8 text-quran-gold" />
                </div>
                <h2 className="text-3xl font-bold text-quran-dark font-serif mb-2">Indeks Topik Al-Quran</h2>
                <p className="text-gray-500 max-w-lg mx-auto">
                    Jelajahi ayat-ayat suci berdasarkan tema kehidupan sehari-hari, hukum, dan kisah teladan.
                </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {TOPICS.map((topic) => (
                    <div 
                        key={topic.id}
                        onClick={() => setSelectedTopic(topic)}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 hover:shadow-md hover:border-quran-gold/30 transition-all cursor-pointer group relative overflow-hidden"
                    >
                         {/* Background Decor */}
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">
                             {renderIcon(topic.iconName, "w-24 h-24 text-quran-dark")}
                        </div>

                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-stone-50 flex items-center justify-center text-quran-dark mb-4 group-hover:bg-quran-dark group-hover:text-white transition-colors">
                                {renderIcon(topic.iconName, "w-6 h-6")}
                            </div>
                            
                            <h3 className="text-lg font-bold text-gray-800 mb-2">{topic.title}</h3>
                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
                                {topic.description}
                            </p>
                            
                            <div className="flex items-center text-xs font-bold text-quran-gold uppercase tracking-wider">
                                <span>{topic.references.length} Referensi</span>
                                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Detail Modal */}
            {selectedTopic && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <div 
                        className="absolute inset-0 bg-quran-dark/80 backdrop-blur-sm transition-opacity"
                        onClick={() => setSelectedTopic(null)}
                    />
                    
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in flex flex-col max-h-[85vh]">
                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-quran-gold/10 rounded-lg text-quran-dark">
                                    {renderIcon(selectedTopic.iconName, "w-5 h-5")}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 font-serif text-lg">{selectedTopic.title}</h3>
                                    <p className="text-xs text-gray-500">Kumpulan Ayat Pilihan</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedTopic(null)}
                                className="p-2 rounded-full hover:bg-stone-200 text-gray-400 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* References List */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-50/30 space-y-3">
                            {selectedTopic.references.map((ref, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleVerseClick(ref.surahId, ref.verseId)}
                                    className="w-full bg-white p-4 rounded-xl border border-stone-200 shadow-sm hover:border-quran-gold hover:shadow-md transition-all flex items-center justify-between group text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-gray-500 border border-stone-200">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-quran-dark text-sm">Surat {ref.surahName}</h4>
                                            <p className="text-xs text-gray-500">Ayat {ref.verseId}</p>
                                        </div>
                                    </div>
                                    <div className="text-quran-gold opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                        <ArrowRight className="w-5 h-5" />
                                    </div>
                                </button>
                            ))}
                        </div>
                        
                        <div className="p-4 bg-white border-t border-stone-100 text-center">
                            <button 
                                onClick={() => setSelectedTopic(null)}
                                className="w-full py-3 bg-stone-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-stone-200 transition-colors"
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

export default TopicIndexPage;
