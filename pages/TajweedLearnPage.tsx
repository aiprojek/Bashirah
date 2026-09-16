
import React, { useState } from 'react';
import { TAJWEED_LEARNING_DATA, TajweedCategory, TajweedRuleItem } from '../services/tajweedData';
import { BookOpen, ChevronRight, ArrowLeft, GraduationCap, Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import UnifiedModal from '../components/UnifiedModal';

const TajweedLearnPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
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
    
    // Helper to format key (replace - with _)
    const formatKey = (id: string) => id.replace(/-/g, '_');

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
                        {t('tajweed_title')}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {t('tajweed_desc')}
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
                            
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-quran-gold transition-colors">{t(`tajweed_${formatKey(cat.id)}_title`)}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">{t(`tajweed_${formatKey(cat.id)}_desc`)}</p>
                            
                            <div className="flex items-center text-xs font-bold text-quran-dark dark:text-gray-200 uppercase tracking-wider bg-stone-50 dark:bg-slate-700 w-fit px-3 py-1.5 rounded-lg group-hover:bg-quran-dark dark:group-hover:bg-quran-gold group-hover:text-white dark:group-hover:text-quran-dark transition-colors">
                                {cat.rules.length} {t('tajweed_rules')}
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
                        <h3 className="font-bold text-xl text-quran-dark dark:text-quran-gold mb-1">{t(`tajweed_${formatKey(selectedCategory.id)}_title`)}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{t(`tajweed_${formatKey(selectedCategory.id)}_desc`)}</p>
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
                                        {t(`tajweed_${formatKey(rule.id)}_name`).charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 dark:text-gray-200">{t(`tajweed_${formatKey(rule.id)}_name`)}</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{t(`tajweed_${formatKey(rule.id)}_desc`)}</p>
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
                <UnifiedModal
                    isOpen={!!selectedRule}
                    onClose={() => setSelectedRule(null)}
                    badge={
                        <span className="flex items-center gap-1.5">
                            <span 
                                className="w-2 h-2 rounded-full inline-block"
                                style={{ backgroundColor: selectedRule.colorCode || '#10b981' }}
                            />
                            <span>Tajwid</span>
                        </span>
                    }
                    title={t(`tajweed_${formatKey(selectedRule.id)}_name`)}
                    maxWidth="max-w-lg"
                >
                    <div className="space-y-6">
                        {/* Definition */}
                        <section>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-quran-gold" /> {t('tajweed_def')}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed bg-stone-50/80 dark:bg-slate-700/40 p-4 rounded-xl border-l-4 border-stone-300 dark:border-slate-600">
                                {t(`tajweed_${formatKey(selectedRule.id)}_desc`)}
                            </p>
                        </section>

                        {/* How to Read */}
                        <section>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <Volume2 className="w-4 h-4 text-quran-gold" /> {t('tajweed_how')}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed bg-stone-50/80 dark:bg-slate-700/40 p-4 rounded-xl">
                                {t(`tajweed_${formatKey(selectedRule.id)}_how`)}
                            </p>
                        </section>

                        {/* Examples */}
                        <section>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-3 border-b border-stone-100 dark:border-slate-700 pb-2">
                                {t('tajweed_example')}
                            </h4>
                            <div className="space-y-3">
                                {selectedRule.examples.map((ex, idx) => (
                                    <div key={idx} className="bg-stone-50/80 dark:bg-slate-700/30 rounded-xl p-4 border border-stone-100 dark:border-slate-700 text-center">
                                        <p 
                                            className="font-arabic text-3xl text-quran-dark dark:text-white mb-2 leading-relaxed" 
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
                </UnifiedModal>
            )}

        </div>
    );
};

export default TajweedLearnPage;
