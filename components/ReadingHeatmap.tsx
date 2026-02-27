
import React, { useEffect, useState } from 'react';
import { Activity, Flame } from 'lucide-react';
import * as StorageService from '../services/storageService';
import { ReadingLog } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const ReadingHeatmap: React.FC = () => {
    const { t } = useLanguage();
    const [history, setHistory] = useState<ReadingLog[]>([]);

    const loadData = async () => {
        setHistory(await StorageService.getReadingHistory());
    };

    useEffect(() => {
        loadData();
        window.addEventListener('storage-update', loadData);
        return () => window.removeEventListener('storage-update', loadData);
    }, []);

    // Generate last 150 days (approx 5 months) for responsive grid
    const generateDays = () => {
        const days = [];
        const today = new Date();
        for (let i = 149; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            // Find log
            const log = history.find(h => h.date === dateStr);
            days.push({
                date: dateStr,
                count: log ? log.pagesRead : 0,
                fullDate: date
            });
        }
        return days;
    };

    const daysData = generateDays();

    // Helpers for intensity color
    const getColor = (count: number) => {
        if (count === 0) return 'bg-stone-200 dark:bg-slate-700'; // No reading
        if (count <= 2) return 'bg-emerald-200 dark:bg-emerald-900/50'; // Little
        if (count <= 5) return 'bg-emerald-400 dark:bg-emerald-700'; // Medium
        if (count <= 10) return 'bg-emerald-600 dark:bg-emerald-500'; // Good
        return 'bg-emerald-800 dark:bg-emerald-400'; // MashaAllah
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-stone-200 dark:border-slate-700 mt-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-quran-dark dark:text-white font-serif flex items-center gap-2">
                    <Activity className="w-5 h-5 text-quran-gold" /> {t('stats_title')}
                </h3>
                <div className="flex items-center gap-2 text-[10px] text-gray-400 dark:text-gray-500">
                    <span>{t('stats_less')}</span>
                    <div className="flex gap-0.5">
                        <div className="w-2 h-2 rounded-sm bg-stone-200 dark:bg-slate-700"></div>
                        <div className="w-2 h-2 rounded-sm bg-emerald-200 dark:bg-emerald-900/50"></div>
                        <div className="w-2 h-2 rounded-sm bg-emerald-400 dark:bg-emerald-700"></div>
                        <div className="w-2 h-2 rounded-sm bg-emerald-600 dark:bg-emerald-500"></div>
                        <div className="w-2 h-2 rounded-sm bg-emerald-800 dark:bg-emerald-400"></div>
                    </div>
                    <span>{t('stats_more')}</span>
                </div>
            </div>

            {/* Grid Container */}
            <div className="w-full overflow-x-auto pb-2">
                <div className="min-w-[600px]"> {/* Force min width to prevent squishing */}
                    <div className="grid grid-rows-7 grid-flow-col gap-1">
                        {daysData.map((day, idx) => (
                            <div 
                                key={day.date}
                                className={`w-3 h-3 rounded-sm ${getColor(day.count)} transition-all hover:ring-2 hover:ring-offset-1 hover:ring-quran-gold dark:hover:ring-offset-slate-800 cursor-help relative group`}
                            >
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-50 whitespace-nowrap bg-gray-800 dark:bg-white text-white dark:text-gray-900 text-[10px] px-2 py-1 rounded shadow-lg font-bold">
                                    {day.count} {t('tab_page')} • {day.fullDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Summary */}
            <div className="mt-4 flex gap-4 text-xs text-gray-500 dark:text-gray-400 border-t border-stone-100 dark:border-slate-700 pt-4">
                 <div className="flex items-center gap-2">
                     <Flame className="w-4 h-4 text-orange-500" />
                     <span>{t('stats_total_read')}: <strong className="text-gray-800 dark:text-gray-200">{history.reduce((a,b) => a + b.pagesRead, 0)} {t('tab_page')}</strong></span>
                 </div>
                 <div>
                     <span>{t('stats_active_days')}: <strong className="text-gray-800 dark:text-gray-200">{history.filter(h => h.pagesRead > 0).length}</strong></span>
                 </div>
            </div>
        </div>
    );
};

export default ReadingHeatmap;
