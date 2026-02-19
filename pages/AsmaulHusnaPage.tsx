
import React, { useState, useMemo } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { ASMAUL_HUSNA, AsmaulHusna } from '../services/asmaulHusnaData';
import AsmaulHusnaDetailModal from '../components/AsmaulHusnaDetailModal';

const AsmaulHusnaPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedName, setSelectedName] = useState<AsmaulHusna | null>(null);

    const filteredNames = useMemo(() => {
        return ASMAUL_HUSNA.filter(name => 
            name.latin.toLowerCase().includes(searchTerm.toLowerCase()) || 
            name.translation_id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in min-h-screen pb-24">
            
            {/* Header */}
            <div className="text-center mb-10">
                <div className="inline-block p-3 bg-quran-gold/10 rounded-full mb-4 ring-1 ring-quran-gold/20">
                    <Sparkles className="w-8 h-8 text-quran-gold" />
                </div>
                <h1 className="text-4xl font-bold text-quran-dark dark:text-white font-serif mb-2">Asmaul Husna</h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto font-serif italic text-sm">
                    "Hanya milik Allah asma-ul husna (nama-nama yang maha indah), maka bermohonlah kepada-Nya dengan menyebut asma-ul husna itu..." (QS. Al-A'raf: 180)
                </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-md mx-auto mb-12 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-full leading-5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-quran-gold/50 focus:border-quran-gold transition-all shadow-sm text-gray-800 dark:text-white"
                    placeholder="Cari nama atau arti..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredNames.map((item) => (
                    <button 
                        key={item.index}
                        onClick={() => setSelectedName(item)}
                        className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-stone-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-quran-gold/30 dark:hover:border-quran-gold/30 transition-all group relative overflow-hidden flex flex-col items-center text-center h-full w-full"
                    >
                        {/* Decorative Number */}
                        <div className="absolute top-2 left-2 text-[10px] font-bold text-gray-300 dark:text-gray-600 bg-stone-50 dark:bg-slate-700 px-2 py-0.5 rounded-full border border-stone-100 dark:border-slate-600 group-hover:bg-quran-gold group-hover:text-white transition-colors">
                            {item.index}
                        </div>

                        {/* Background Decoration */}
                        <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity text-quran-dark dark:text-white">
                             <span className="font-arabic text-6xl">{item.arabic}</span>
                        </div>

                        <div className="flex-1 flex flex-col justify-center w-full">
                            <div className="mb-4 mt-2">
                                <p className="font-arabic text-3xl text-quran-dark dark:text-white group-hover:text-quran-gold dark:group-hover:text-quran-gold transition-colors leading-relaxed drop-shadow-sm">
                                    {item.arabic}
                                </p>
                            </div>
                            
                            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm mb-1 group-hover:text-quran-dark dark:group-hover:text-quran-gold transition-colors">
                                {item.latin}
                            </h3>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-snug px-1">
                                {item.translation_id}
                            </p>
                        </div>
                    </button>
                ))}
            </div>

            {filteredNames.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                    <p>Tidak ada nama yang cocok dengan pencarian Anda.</p>
                </div>
            )}

            {/* Detail Modal */}
            <AsmaulHusnaDetailModal 
                isOpen={!!selectedName}
                onClose={() => setSelectedName(null)}
                data={selectedName}
            />

        </div>
    );
};

export default AsmaulHusnaPage;
