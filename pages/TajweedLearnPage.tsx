
import React, { useState } from 'react';
import { TAJWEED_LEARNING_DATA, TajweedCategory, TajweedRuleItem } from '../services/tajweedData';
import { BookOpen, ChevronRight, X, ArrowLeft, GraduationCap, Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TajweedLearnPage: React.FC = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState<TajweedCategory | null>(null);
    const [selectedRule, setSelectedRule] = useState<TajweedRuleItem | null>(null);

    const handleBack = () => {
        if (selectedRule) {
            setSelectedRule(null);
        } else if (selectedCategory) {
            setSelectedCategory(null);
        } else {
            navigate('/');
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in min-h-screen pb-24 relative">
            
            {/* Header Area */}
            <div className="flex items-center gap-4 mb-8">
                {(selectedCategory || selectedRule) && (
                    <button onClick={handleBack} className="p-2 bg-stone-100 dark:bg-slate-700 rounded-full hover:bg-stone-200 dark:hover:bg-slate-600 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                )}
                <div>
                    <h2 className="text-2xl font-bold text-quran-dark dark:text-gray-100 font-serif flex items-center gap-2">
                        <GraduationCap className="w-6 h-6 text-quran-gold" />
                        Panduan Tajwid
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Pelajari cara membaca Al-Quran dengan benar.
                    </p>
                </div>
            </div>

            {/* --- LEVEL 1: CATEGORY LIST --- */}
            {!selectedCategory && !selectedRule && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {TAJWEED_LEARNING_DATA.map((cat) => (
                        <button 
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat)}
                            className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-slate-700 hover:border-quran-gold/50 dark:hover:border-quran-gold/50 hover:shadow-md transition-all text-left group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-quran-gold/5 rounded-bl-full -mr-8 -mt-8 pointer-events-none transition-transform group-hover:scale-110"></div>
                            
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-quran-gold transition-colors">{cat.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">{cat.description}</p>
                            
                            <div className="flex items-center text-xs font-bold text-quran-dark dark:text-gray-200 uppercase tracking-wider bg-stone-50 dark:bg-slate-700 w-fit px-3 py-1.5 rounded-lg group-hover:bg-quran-dark dark:group-hover:bg-quran-gold group-hover:text-white dark:group-hover:text-quran-dark transition-colors">
                                {cat.rules.length} Aturan
                                <ChevronRight className="w-3 h-3 ml-2" />
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* --- LEVEL 2: RULES LIST (Inside Category) --- */}
            {selectedCategory && !selectedRule && (
                <div className="animate-fade-in">
                    <div className="bg-quran-gold/10 border border-quran-gold/20 p-5 rounded-2xl mb-6">
                        <h3 className="font-bold text-xl text-quran-dark dark:text-quran-gold mb-1">{selectedCategory.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{selectedCategory.description}</p>
                    </div>

                    <div className="space-y-4">
                        {selectedCategory.rules.map((rule) => (
                            <div 
                                key={rule.id}
                                onClick={() => setSelectedRule(rule)}
                                className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-stone-200 dark:border-slate-700 hover:border-quran-gold dark:hover:border-quran-gold hover:shadow-sm cursor-pointer transition-all flex justify-between items-center group"
                            >
                                <div className="flex items-center gap-4">
                                    <div 
                                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0"
                                        style={{ backgroundColor: rule.colorCode || '#1e3a34' }}
                                    >
                                        {rule.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 dark:text-gray-200">{rule.name}</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{rule.description}</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-500 group-hover:text-quran-gold" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- LEVEL 3: RULE DETAIL MODAL/VIEW --- */}
            {selectedRule && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                     <div 
                        className="absolute inset-0 bg-stone-900/60 dark:bg-black/80 backdrop-blur-sm transition-opacity"
                        onClick={() => setSelectedRule(null)}
                    />
                    
                    <div className="relative bg-white dark:bg-slate-800 w-full max-w-lg max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up border border-white/10">
                        
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-stone-100 dark:border-slate-700 flex justify-between items-start bg-stone-50 dark:bg-slate-700/50">
                            <div>
                                <span 
                                    className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white mb-2 inline-block"
                                    style={{ backgroundColor: selectedRule.colorCode || '#1e3a34' }}
                                >
                                    Tajwid
                                </span>
                                <h3 className="text-2xl font-bold text-quran-dark dark:text-white font-serif">{selectedRule.name}</h3>
                            </div>
                            <button 
                                onClick={() => setSelectedRule(null)}
                                className="p-2 bg-white dark:bg-slate-700 rounded-full text-gray-400 hover:text-red-500 shadow-sm border border-stone-100 dark:border-slate-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-8 bg-white dark:bg-slate-800">
                            
                            {/* Definition */}
                            <section>
                                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-quran-gold" /> Definisi
                                </h4>
                                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed bg-stone-50 dark:bg-slate-700/50 p-4 rounded-xl border-l-4 border-stone-300 dark:border-slate-600">
                                    {selectedRule.description}
                                </p>
                            </section>

                            {/* How to Read */}
                            <section>
                                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                                    <Volume2 className="w-4 h-4 text-quran-gold" /> Cara Membaca
                                </h4>
                                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                    {selectedRule.howToRead}
                                </p>
                            </section>

                            {/* Examples */}
                            <section>
                                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 border-b border-stone-100 dark:border-slate-700 pb-2">
                                    Contoh Lafadz
                                </h4>
                                <div className="space-y-4">
                                    {selectedRule.examples.map((ex, idx) => (
                                        <div key={idx} className="bg-stone-50 dark:bg-slate-700/30 rounded-xl p-4 border border-stone-100 dark:border-slate-700 text-center">
                                            <p 
                                                className="font-arabic text-3xl text-quran-dark dark:text-white mb-3 leading-relaxed" 
                                                dir="rtl"
                                                style={{ color: selectedRule.colorCode || 'inherit' }}
                                            >
                                                {ex.arabic}
                                            </p>
                                            <p className="font-serif text-sm text-gray-500 dark:text-gray-400 italic">
                                                "{ex.latin}"
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                        
                        <div className="p-4 border-t border-stone-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-center">
                            <button 
                                onClick={() => setSelectedRule(null)}
                                className="text-xs font-bold text-gray-400 hover:text-quran-dark dark:hover:text-quran-gold uppercase tracking-wider transition-colors"
                            >
                                Tutup Penjelasan
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default TajweedLearnPage;
