
import React, { useEffect, useState } from 'react';
import { Activity, Flame } from 'lucide-react';
import * as StorageService from '../services/storageService';
import { ReadingLog } from '../types';

const ReadingHeatmap: React.FC = () => {
    const [history, setHistory] = useState<ReadingLog[]>([]);

    const loadData = () => {
        setHistory(StorageService.getReadingHistory());
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
        if (count === 0) return 'bg-stone-200'; // No reading
        if (count <= 2) return 'bg-emerald-200'; // Little
        if (count <= 5) return 'bg-emerald-400'; // Medium
        if (count <= 10) return 'bg-emerald-600'; // Good
        return 'bg-emerald-800'; // MashaAllah
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 mt-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-quran-dark font-serif flex items-center gap-2">
                    <Activity className="w-5 h-5 text-quran-gold" /> Statistik Ibadah
                </h3>
                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                    <span>Kurang</span>
                    <div className="flex gap-0.5">
                        <div className="w-2 h-2 rounded-sm bg-stone-200"></div>
                        <div className="w-2 h-2 rounded-sm bg-emerald-200"></div>
                        <div className="w-2 h-2 rounded-sm bg-emerald-400"></div>
                        <div className="w-2 h-2 rounded-sm bg-emerald-600"></div>
                        <div className="w-2 h-2 rounded-sm bg-emerald-800"></div>
                    </div>
                    <span>Sering</span>
                </div>
            </div>

            {/* Grid Container */}
            <div className="w-full overflow-x-auto pb-2">
                <div className="min-w-[600px]"> {/* Force min width to prevent squishing */}
                    <div className="grid grid-rows-7 grid-flow-col gap-1">
                        {daysData.map((day, idx) => (
                            <div 
                                key={day.date}
                                className={`w-3 h-3 rounded-sm ${getColor(day.count)} transition-all hover:ring-2 hover:ring-offset-1 hover:ring-quran-gold cursor-help relative group`}
                            >
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-50 whitespace-nowrap bg-gray-800 text-white text-[10px] px-2 py-1 rounded shadow-lg">
                                    {day.count} hal. pada {day.fullDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Summary */}
            <div className="mt-4 flex gap-4 text-xs text-gray-500 border-t border-stone-100 pt-4">
                 <div className="flex items-center gap-2">
                     <Flame className="w-4 h-4 text-orange-500" />
                     <span>Total Dibaca: <strong className="text-gray-800">{history.reduce((a,b) => a + b.pagesRead, 0)} Halaman</strong></span>
                 </div>
                 <div>
                     <span>Hari Aktif: <strong className="text-gray-800">{history.filter(h => h.pagesRead > 0).length} Hari</strong></span>
                 </div>
            </div>
        </div>
    );
};

export default ReadingHeatmap;
