
import React, { useState, useEffect } from 'react';
import { Target, BookOpen, Calendar, Edit2, CheckCircle2, ChevronRight, Plus, Info, X, TrendingUp, Sparkles, Flame } from 'lucide-react';
import * as StorageService from '../services/storageService';
import { KhatamTarget, ReadingLog } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const TOTAL_PAGES = 604; // Standard Madani Mushaf

const KhatamWidget: React.FC = () => {
    const { t } = useLanguage();
    const [target, setTarget] = useState<KhatamTarget | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showHint, setShowHint] = useState(false);
    
    // Form State
    const [daysInput, setDaysInput] = useState(30);
    const [currentPageInput, setCurrentPageInput] = useState(1);
    const [history, setHistory] = useState<ReadingLog[]>([]);
    const [analytics, setAnalytics] = useState<{
        avgPagesPerDay: number;
        estimatedCompletionDate: number;
        totalDaysActive: number;
        estimatedDaysLeft: number;
        streak: number;
    } | null>(null);

    const loadData = async () => {
        const saved = await StorageService.getKhatamTarget();
        const hist = await StorageService.getReadingHistory();
        const anal = await StorageService.calculateKhatamAnalytics();
        
        setTarget(saved);
        setHistory(hist);
        setAnalytics(anal);
        
        if (saved) {
            setCurrentPageInput(saved.currentPage);
        }
    };

    useEffect(() => {
        loadData();

        // Listen for updates from other components
        const handleUpdate = () => loadData();
        window.addEventListener('storage-update', handleUpdate);
        
        return () => window.removeEventListener('storage-update', handleUpdate);
    }, []);

    const handleSaveTarget = async () => {
        const newTarget: KhatamTarget = {
            isActive: true,
            startDate: Date.now(),
            targetDays: daysInput,
            currentPage: currentPageInput,
            lastUpdated: Date.now()
        };
        await StorageService.saveKhatamTarget(newTarget);
        setTarget(newTarget);
        setIsEditing(false);
    };

    const calculateStats = () => {
        if (!target) return { dailyTarget: 0, daysLeft: 0, pagesLeft: 0 };

        const pagesLeft = TOTAL_PAGES - target.currentPage;
        
        // Calculate days passed since start
        const msPerDay = 1000 * 60 * 60 * 24;
        const daysPassed = Math.floor((Date.now() - target.startDate) / msPerDay);
        const daysLeft = Math.max(1, target.targetDays - daysPassed);
        
        const dailyTarget = Math.ceil(pagesLeft / daysLeft);

        return { dailyTarget, daysLeft, pagesLeft };
    };

    const stats = calculateStats();

    // -- RENDER: EMPTY STATE --
    if (!target || !target.isActive) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-stone-100 dark:border-slate-700 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden group transition-colors">
                 <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transform group-hover:scale-110 transition-transform duration-700">
                    <Target className="w-32 h-32 text-quran-dark dark:text-white" />
                 </div>

                 <div className="relative z-10 text-center sm:text-left">
                     <h3 className="text-xl font-bold text-quran-dark dark:text-white font-serif mb-2">{t('khatam_start_title')}</h3>
                     <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                         {t('khatam_start_desc')}
                     </p>
                 </div>

                 {isEditing ? (
                     <div className="relative z-10 w-full sm:w-auto bg-stone-50 dark:bg-slate-700 p-4 rounded-xl border border-stone-200 dark:border-slate-600 animate-fade-in">
                         <div className="flex flex-col gap-3">
                            <div>
                                <label className="text-xs font-bold text-gray-400 dark:text-gray-300 uppercase block mb-1">{t('khatam_label_days')}</label>
                                <input 
                                    type="number" 
                                    min="1" 
                                    max="365"
                                    value={daysInput}
                                    onChange={(e) => setDaysInput(parseInt(e.target.value) || 1)}
                                    className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-slate-500 text-sm font-bold text-quran-dark dark:text-white bg-white dark:bg-slate-600 focus:ring-2 focus:ring-quran-gold/50"
                                />
                            </div>
                            <button 
                                onClick={handleSaveTarget}
                                className="w-full py-2 bg-quran-dark dark:bg-quran-gold text-white dark:text-quran-dark rounded-lg text-sm font-bold hover:bg-quran-dark/90 transition-colors whitespace-nowrap"
                            >
                                {t('btn_save')}
                            </button>
                             <button 
                                onClick={() => setIsEditing(false)}
                                className="w-full py-1 text-xs text-gray-400 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400"
                            >
                                {t('btn_cancel')}
                            </button>
                         </div>
                     </div>
                 ) : (
                     <button 
                        onClick={() => setIsEditing(true)}
                        className="relative z-10 px-6 py-3 bg-quran-gold text-white rounded-xl font-bold shadow-lg shadow-quran-gold/30 hover:bg-quran-gold/90 transition-all flex items-center gap-2 whitespace-nowrap"
                     >
                         <Plus className="w-5 h-5" />
                         {t('khatam_btn_create')}
                     </button>
                 )}
            </div>
        );
    }

    // -- RENDER: ACTIVE STATE --
    return (
        <div className="bg-gradient-to-br from-quran-dark to-[#142924] rounded-2xl p-6 shadow-xl mb-8 text-white relative overflow-hidden transition-all duration-500">
             {/* Decor */}
             <div className="absolute top-0 right-0 opacity-10">
                 <BookOpen className="w-48 h-48 -mr-10 -mt-10" />
             </div>

             {isEditing ? (
                 <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 animate-fade-in border border-white/20">
                     <div className="flex justify-between items-center mb-4">
                         <h4 className="font-bold text-sm">{t('khatam_progress_title')}</h4>
                         <button onClick={() => setIsEditing(false)}><div className="text-xs opacity-70 hover:opacity-100">{t('btn_cancel')}</div></button>
                     </div>
                     <div className="flex gap-4 items-end">
                         <div className="flex-1">
                             <label className="text-[10px] uppercase font-bold opacity-60 block mb-1">{t('khatam_progress_subtitle')}</label>
                             <input 
                                type="number" 
                                min="1" 
                                max="604"
                                value={currentPageInput}
                                onChange={(e) => setCurrentPageInput(parseInt(e.target.value) || 1)}
                                className="w-full px-3 py-2 rounded-lg bg-white/20 border border-white/10 text-white font-bold focus:outline-none focus:ring-1 focus:ring-quran-gold"
                             />
                         </div>
                         <button 
                            onClick={async () => {
                                // IMPORTANT: Call updateKhatamProgress FIRST while current target state is old
                                // This ensures the difference calculation in storageService works correctly
                                await StorageService.updateKhatamProgress(currentPageInput);
                                
                                setIsEditing(false);
                                loadData(); // Refresh UI including analytics
                            }}
                            className="px-4 py-2 bg-quran-gold text-white rounded-lg font-bold text-sm hover:bg-white hover:text-quran-dark transition-colors whitespace-nowrap"
                         >
                             {t('btn_save')}
                         </button>
                     </div>
                 </div>
             ) : (
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="bg-quran-gold/20 border border-quran-gold/30 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase text-quran-gold">
                                    {t('khatam_target')}
                                </span>
                                <span className="text-xs opacity-60 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> {stats.daysLeft} {t('khatam_remaining_days')}
                                </span>
                            </div>
                            <h3 className="text-2xl font-bold font-serif leading-tight">
                                <span className="text-quran-gold">{t('khatam_daily_target')}: {stats.dailyTarget} {t('tab_page')}</span>
                            </h3>
                        </div>
                        
                        {/* Streak Badge */}
                        {analytics && analytics.streak > 0 && (
                            <div className="bg-orange-500/20 border border-orange-500/30 px-3 py-1.5 rounded-xl flex items-center gap-2 animate-bounce-subtle">
                                <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                                <div className="text-left">
                                    <p className="text-[10px] uppercase font-bold text-orange-200/70 leading-none">Streak</p>
                                    <p className="text-sm font-black text-orange-500">{analytics.streak} {t('khatam_streak')}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Analytics Row */}
                    {analytics && (
                        <div className="grid grid-cols-2 gap-3 mb-6 animate-fade-in">
                            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                                <p className="text-[10px] uppercase opacity-60 mb-1">{t('khatam_est_completion')}</p>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-quran-gold" />
                                    <span className="text-sm font-bold">
                                        {new Date(analytics.estimatedCompletionDate).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                                <p className="text-[10px] uppercase opacity-60 mb-1">{t('khatam_speed')}</p>
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                                    <span className="text-sm font-bold">{analytics.avgPagesPerDay} <span className="text-[10px] font-normal opacity-60">hal/hari</span></span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium opacity-80">
                            <span>{t('tab_page')} {target.currentPage} / 604</span>
                            <span>{Math.round((target.currentPage / TOTAL_PAGES) * 100)}%</span>
                        </div>
                        <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-quran-gold to-yellow-300 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${(target.currentPage / TOTAL_PAGES) * 100}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-end">
                             <p className="text-[10px] opacity-60 mt-1">{stats.pagesLeft} {t('khatam_remaining_pages')}</p>
                        </div>
                    </div>

                    {/* Modern Activity Chart */}
                    <div className="mt-10 pt-6 border-t border-white/5">
                        <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-40 mb-6 flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-quran-gold" /> {t('khatam_activity_7days')}
                        </p>
                        
                        <div className="flex items-end justify-between gap-2 h-24 px-1">
                            {[...Array(7)].map((_, i) => {
                                const date = new Date();
                                date.setDate(date.getDate() - (6 - i));
                                const dateStr = date.toISOString().split('T')[0];
                                const log = history.find(h => h.date === dateStr);
                                const pages = log ? log.pagesRead : 0;
                                
                                // Calculate height relative to a max of 20 pages
                                const heightPercentage = Math.min(100, (pages / 20) * 100);
                                const isToday = i === 6;

                                return (
                                    <div key={dateStr} className="flex-1 flex flex-col items-center gap-2 group relative">
                                        <div className="w-full flex items-end justify-center h-16">
                                            <div 
                                                className={`w-full max-w-[12px] rounded-full transition-all duration-700 ease-out relative ${
                                                    isToday ? 'bg-gradient-to-t from-quran-gold to-yellow-300 shadow-[0_0_10px_rgba(234,179,8,0.3)]' : 'bg-white/10 group-hover:bg-white/20'
                                                }`}
                                                style={{ height: `${Math.max(10, heightPercentage)}%` }}
                                            >
                                                {/* Pages Label on top of bar */}
                                                {pages > 0 && (
                                                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {pages}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <span className={`text-[8px] font-bold uppercase transition-colors ${isToday ? 'text-quran-gold' : 'opacity-30'}`}>
                                            {date.toLocaleDateString('id-ID', { weekday: 'short' }).charAt(0)}
                                        </span>

                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-2 py-1 bg-black/90 text-[10px] text-white rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-2xl border border-white/5">
                                            {date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}: {pages} hal
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    
                    {/* Action Area & Hints */}
                    <div className="mt-5 pt-4 border-t border-white/10">
                         {showHint ? (
                            <div className="bg-black/20 backdrop-blur-md p-3 rounded-lg text-xs mb-3 animate-fade-in border border-white/5">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-bold text-quran-gold flex items-center gap-2">
                                        <Info className="w-3 h-3" /> {t('khatam_tips_title')}
                                    </div>
                                    <button onClick={() => setShowHint(false)}><X className="w-3 h-3 opacity-50 hover:opacity-100" /></button>
                                </div>
                                <ul className="space-y-1 opacity-80 list-disc list-inside">
                                    <li>Menu Ayat: Klik (⋮) &rarr; <em>Update Progres Khatam</em>.</li>
                                    <li>Mode Mushaf: Klik ikon target di toolbar.</li>
                                    <li>Manual: Gunakan tombol Update di bawah.</li>
                                </ul>
                            </div>
                         ) : null}

                         <div className="flex items-center justify-between">
                             <button 
                                onClick={() => setShowHint(!showHint)}
                                className="text-[10px] opacity-60 hover:opacity-100 flex items-center gap-1 transition-opacity"
                             >
                                 <Info className="w-3 h-3" /> Tips?
                             </button>

                             <button 
                                onClick={() => setIsEditing(true)}
                                className="text-xs font-bold flex items-center gap-2 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors bg-white/5 border border-white/10 whitespace-nowrap"
                             >
                                 Update Target Khatam Manual <ChevronRight className="w-3 h-3" />
                             </button>
                         </div>
                    </div>
                </div>
             )}
        </div>
    );
};

export default KhatamWidget;
