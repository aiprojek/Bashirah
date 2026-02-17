
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DUAS } from '../services/duaData';
import { Bookmark, Share2, Copy, ArrowRight, HeartHandshake, Sparkles, Check } from 'lucide-react';
import * as StorageService from '../services/storageService';

const DuaCollectionPage: React.FC = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState<'all' | 'rabbana' | 'rabbi'>('all');
    const [bookmarks, setBookmarks] = useState<number[]>([]);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Load Bookmarks (using existing storage service logic, but checking by verse ID for simplicity)
    useEffect(() => {
        const bms = StorageService.getBookmarks();
        setBookmarks(bms.map(b => b.verseId)); // Simple check, ideally check surah+verse
    }, []);

    const handleCopy = (text: string, id: string) => {
        // Adding Credit Footer
        const creditText = `\n\nBashirah - Al Quran Digital\nbashirah.pages.dev`;
        navigator.clipboard.writeText(text + creditText);
        
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleBookmark = (dua: typeof DUAS[0]) => {
        // Toggle
        StorageService.toggleBookmark(dua.surahId, dua.surahName, dua.verseId);
        
        // Refresh local state
        const bms = StorageService.getBookmarks();
        setBookmarks(bms.map(b => b.verseId));
    };

    const filteredDuas = DUAS.filter(d => filter === 'all' || d.category === filter);

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in pb-24">
            
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-block p-3 bg-quran-gold/10 rounded-full mb-4">
                    <HeartHandshake className="w-8 h-8 text-quran-gold" />
                </div>
                <h2 className="text-3xl font-bold text-quran-dark font-serif mb-2">Koleksi Doa</h2>
                <p className="text-gray-500 max-w-lg mx-auto text-sm">
                    Munajat indah para Nabi dan orang shaleh yang diabadikan dalam Al-Quran.
                </p>
            </div>

            {/* Filters */}
            <div className="flex justify-center gap-2 mb-8">
                <button 
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${filter === 'all' ? 'bg-quran-dark text-white border-quran-dark' : 'bg-white text-gray-500 border-stone-200 hover:bg-stone-50'}`}
                >
                    Semua
                </button>
                <button 
                    onClick={() => setFilter('rabbana')}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${filter === 'rabbana' ? 'bg-quran-dark text-white border-quran-dark' : 'bg-white text-gray-500 border-stone-200 hover:bg-stone-50'}`}
                >
                    Rabbana (Ya Tuhan Kami)
                </button>
                <button 
                    onClick={() => setFilter('rabbi')}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${filter === 'rabbi' ? 'bg-quran-dark text-white border-quran-dark' : 'bg-white text-gray-500 border-stone-200 hover:bg-stone-50'}`}
                >
                    Rabbi (Ya Tuhanku)
                </button>
            </div>

            {/* List */}
            <div className="space-y-6">
                {filteredDuas.map((dua) => {
                    const isBookmarked = bookmarks.includes(dua.verseId); // Approximate check
                    const isCopied = copiedId === dua.id;

                    return (
                        <div key={dua.id} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 hover:shadow-md transition-all relative overflow-hidden group">
                            
                            {/* Subtle Pattern */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-quran-gold/5 rounded-bl-full pointer-events-none -mr-8 -mt-8"></div>
                            
                            <div className="relative z-10">
                                {/* Title & Meta */}
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                            {dua.title}
                                            {dua.category === 'rabbana' && <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-sans uppercase tracking-wider">Rabbana</span>}
                                        </h3>
                                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1 cursor-pointer hover:text-quran-gold transition-colors" onClick={() => navigate(`/surah/${dua.surahId}#verse-${dua.verseId}`)}>
                                            QS {dua.surahName} : {dua.verseId} <ArrowRight className="w-3 h-3" />
                                        </p>
                                    </div>
                                    <div className="flex gap-1">
                                        <button 
                                            onClick={() => handleBookmark(dua)}
                                            className={`p-2 rounded-full transition-colors ${isBookmarked ? 'text-quran-gold bg-quran-gold/10' : 'text-gray-300 hover:bg-stone-100'}`}
                                            title="Bookmark"
                                        >
                                            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                                        </button>
                                    </div>
                                </div>

                                {/* Arabic Text */}
                                <div className="text-right mb-6" dir="rtl">
                                    <p className="font-arabic text-3xl leading-[2.5] text-quran-dark">
                                        {dua.arabic}
                                    </p>
                                </div>

                                {/* Translation */}
                                <div className="bg-stone-50 p-4 rounded-xl border-l-4 border-quran-gold">
                                    <p className="text-gray-600 italic font-serif text-sm leading-relaxed">
                                        "{dua.translation}"
                                    </p>
                                </div>

                                {/* Footer Actions */}
                                <div className="mt-4 flex justify-end gap-3">
                                     <button 
                                        onClick={() => handleCopy(`${dua.arabic}\n\n"${dua.translation}"\n(QS ${dua.surahName}: ${dua.verseId})`, dua.id)}
                                        className={`text-xs font-bold flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isCopied ? 'bg-green-100 text-green-700' : 'bg-white border border-stone-200 text-gray-500 hover:border-quran-gold hover:text-quran-gold'}`}
                                    >
                                        {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                        {isCopied ? 'Disalin' : 'Salin Teks'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredDuas.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                    Tidak ada doa dalam kategori ini.
                </div>
            )}
        </div>
    );
};

export default DuaCollectionPage;
