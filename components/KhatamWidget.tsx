
import React, { useState, useEffect } from 'react';
import { Target, BookOpen, Calendar, Edit2, CheckCircle2, ChevronRight, Plus, Info, X } from 'lucide-react';
import * as StorageService from '../services/storageService';
import { KhatamTarget } from '../types';

const TOTAL_PAGES = 604; // Standard Madani Mushaf

const KhatamWidget: React.FC = () => {
    const [target, setTarget] = useState<KhatamTarget | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showHint, setShowHint] = useState(false);
    
    // Form State
    const [daysInput, setDaysInput] = useState(30);
    const [currentPageInput, setCurrentPageInput] = useState(1);

    const loadData = () => {
        const saved = StorageService.getKhatamTarget();
        setTarget(saved);
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

    const handleSaveTarget = () => {
        const newTarget: KhatamTarget = {
            isActive: true,
            startDate: Date.now(),
            targetDays: daysInput,
            currentPage: currentPageInput,
            lastUpdated: Date.now()
        };
        StorageService.saveKhatamTarget(newTarget);
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
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transform group-hover:scale-110 transition-transform duration-700">
                    <Target className="w-32 h-32 text-quran-dark" />
                 </div>

                 <div className="relative z-10 text-center sm:text-left">
                     <h3 className="text-xl font-bold text-quran-dark font-serif mb-2">Mulai Target Khatam</h3>
                     <p className="text-sm text-gray-500 max-w-sm">
                         Bangun kebiasaan membaca Al-Quran setiap hari. Tetapkan target harimu dan pantau progresmu.
                     </p>
                 </div>

                 {isEditing ? (
                     <div className="relative z-10 w-full sm:w-auto bg-stone-50 p-4 rounded-xl border border-stone-200 animate-fade-in">
                         <div className="flex flex-col gap-3">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Target (Hari)</label>
                                <input 
                                    type="number" 
                                    min="1" 
                                    max="365"
                                    value={daysInput}
                                    onChange={(e) => setDaysInput(parseInt(e.target.value) || 1)}
                                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm font-bold text-quran-dark focus:ring-2 focus:ring-quran-gold/50"
                                />
                            </div>
                            <button 
                                onClick={handleSaveTarget}
                                className="w-full py-2 bg-quran-dark text-white rounded-lg text-sm font-bold hover:bg-quran-dark/90 transition-colors"
                            >
                                Simpan Target
                            </button>
                             <button 
                                onClick={() => setIsEditing(false)}
                                className="w-full py-1 text-xs text-gray-400 hover:text-red-500"
                            >
                                Batal
                            </button>
                         </div>
                     </div>
                 ) : (
                     <button 
                        onClick={() => setIsEditing(true)}
                        className="relative z-10 px-6 py-3 bg-quran-gold text-white rounded-xl font-bold shadow-lg shadow-quran-gold/30 hover:bg-quran-gold/90 transition-all flex items-center gap-2"
                     >
                         <Plus className="w-5 h-5" />
                         Buat Target
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
                         <h4 className="font-bold text-sm">Update Progres Manual</h4>
                         <button onClick={() => setIsEditing(false)}><div className="text-xs opacity-70 hover:opacity-100">Batal</div></button>
                     </div>
                     <div className="flex gap-4 items-end">
                         <div className="flex-1">
                             <label className="text-[10px] uppercase font-bold opacity-60 block mb-1">Halaman Sekarang</label>
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
                            onClick={() => {
                                const newTarget = { ...target, currentPage: currentPageInput, lastUpdated: Date.now() };
                                StorageService.saveKhatamTarget(newTarget);
                                StorageService.updateKhatamProgress(currentPageInput); // Log to history
                                setTarget(newTarget);
                                setIsEditing(false);
                            }}
                            className="px-4 py-2 bg-quran-gold text-white rounded-lg font-bold text-sm hover:bg-white hover:text-quran-dark transition-colors"
                         >
                             Simpan
                         </button>
                     </div>
                 </div>
             ) : (
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="bg-quran-gold/20 border border-quran-gold/30 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase text-quran-gold">
                                    Target Khatam
                                </span>
                                <span className="text-xs opacity-60 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> {stats.daysLeft} hari lagi
                                </span>
                            </div>
                            <h3 className="text-2xl font-bold font-serif leading-tight">
                                Semangat! <br/> 
                                <span className="text-quran-gold">Target {stats.dailyTarget} Halaman</span> Hari Ini
                            </h3>
                        </div>
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                            title="Edit Progres"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium opacity-80">
                            <span>Halaman {target.currentPage} / 604</span>
                            <span>{Math.round((target.currentPage / TOTAL_PAGES) * 100)}%</span>
                        </div>
                        <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-quran-gold to-yellow-300 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${(target.currentPage / TOTAL_PAGES) * 100}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-end">
                             <p className="text-[10px] opacity-60 mt-1">Sisa {stats.pagesLeft} halaman menuju khatam</p>
                        </div>
                    </div>
                    
                    {/* Action Area & Hints */}
                    <div className="mt-5 pt-4 border-t border-white/10">
                         {showHint ? (
                            <div className="bg-black/20 backdrop-blur-md p-3 rounded-lg text-xs mb-3 animate-fade-in border border-white/5">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-bold text-quran-gold flex items-center gap-2">
                                        <Info className="w-3 h-3" /> Tips Update Progres
                                    </div>
                                    <button onClick={() => setShowHint(false)}><X className="w-3 h-3 opacity-50 hover:opacity-100" /></button>
                                </div>
                                <ul className="space-y-1 opacity-80 list-disc list-inside">
                                    <li><strong>Menu Ayat:</strong> Klik titik tiga (⋮) pada ayat &rarr; <em>Update Progres Khatam</em>.</li>
                                    <li><strong>Mode Mushaf:</strong> Klik ikon target di toolbar atas.</li>
                                    <li><strong>Manual:</strong> Gunakan tombol "Update Manual" di bawah ini (untuk Al-Quran fisik).</li>
                                </ul>
                            </div>
                         ) : null}

                         <div className="flex items-center justify-between">
                             <button 
                                onClick={() => setShowHint(!showHint)}
                                className="text-[10px] opacity-60 hover:opacity-100 flex items-center gap-1 transition-opacity"
                             >
                                 <Info className="w-3 h-3" /> Cara lain update?
                             </button>

                             <button 
                                onClick={() => setIsEditing(true)}
                                className="text-xs font-bold flex items-center gap-2 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors bg-white/5 border border-white/10"
                             >
                                 Update Manual <ChevronRight className="w-3 h-3" />
                             </button>
                         </div>
                    </div>
                </div>
             )}
        </div>
    );
};

export default KhatamWidget;
