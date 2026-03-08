
import React, { useState, useEffect } from 'react';
import { ImageIcon, Info, Download, Settings, ChevronRight, Check, X, AlertTriangle, BookOpen } from 'lucide-react';
import { MUSHAF_EDITIONS, MushafEdition } from '../types';
import * as MushafService from '../services/mushafService';
import { useLanguage } from '../contexts/LanguageContext';

interface MushafSetupOverlayProps {
    onConfirm: () => void;
    onCancel: () => void;
    onGoToSettings: () => void;
}

const MushafSetupOverlay: React.FC<MushafSetupOverlayProps> = ({ onConfirm, onCancel, onGoToSettings }) => {
    const { t } = useLanguage();
    const [activeMushafId, setActiveMushafId] = useState<string>(MushafService.getActiveMushafId());
    const [downloads, setDownloads] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const checkStatus = async () => {
            const status: Record<string, boolean> = {};
            for (const m of MUSHAF_EDITIONS) {
                status[m.id] = await MushafService.isMushafDownloaded(m.id);
            }
            setDownloads(status);
        };
        checkStatus();
    }, []);

    const handleSelectMushaf = (id: string) => {
        MushafService.setActiveMushafId(id);
        setActiveMushafId(id);
    };

    return (
        <div className="fixed inset-0 z-[60] bg-[#f0eadd] flex flex-col items-center p-4 sm:p-8 animate-fade-in overflow-hidden">
            <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col my-auto max-h-full">
                {/* 1. Header (Fixed) */}
                <div className="bg-quran-dark p-5 sm:p-6 text-white text-center relative shrink-0">
                    <button 
                        onClick={onCancel}
                        className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-quran-gold" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold">{t('mushaf_setup_title')}</h2>
                    <p className="text-white/70 text-[11px] sm:text-sm mt-1 sm:mt-2 leading-relaxed px-2">
                        {t('mushaf_setup_desc')}
                    </p>
                </div>

                {/* 2. Content (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar">
                    {/* Choose Mushaf */}
                    <div>
                        <h3 className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                             <Check className="w-3 h-3 text-quran-gold" /> {t('mushaf_setup_choose')}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {MUSHAF_EDITIONS.map(edition => {
                                const isSelected = activeMushafId === edition.id;
                                const isDownloaded = downloads[edition.id];
                                return (
                                    <button 
                                        key={edition.id}
                                        onClick={() => handleSelectMushaf(edition.id)}
                                        className={`p-4 rounded-2xl border-2 text-left transition-all relative ${
                                            isSelected 
                                            ? 'border-quran-gold bg-quran-gold/5 shadow-inner' 
                                            : 'border-stone-100 hover:border-stone-200 bg-stone-50/50'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-sm font-bold ${isSelected ? 'text-quran-dark' : 'text-gray-700'}`}>
                                                {edition.name}
                                            </span>
                                            {isSelected && <Check className="w-4 h-4 text-quran-gold" />}
                                        </div>
                                        <p className="text-[10px] text-gray-500 leading-tight">
                                            {edition.description}
                                        </p>
                                        {isDownloaded && (
                                            <div className="mt-2 flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
                                                <Download className="w-2 h-2" /> Offline Ready
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Warning Box */}
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
                        <div className="shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                            <AlertTriangle className="w-4 h-4" />
                        </div>
                        <p className="text-[11px] sm:text-xs text-amber-800 leading-relaxed italic">
                            {t('mushaf_setup_warning')}
                        </p>
                    </div>

                    {/* Advanced Link */}
                    <div className="flex justify-center pb-2">
                        <button 
                            onClick={onGoToSettings}
                            className="text-xs font-bold text-quran-dark/60 hover:text-quran-dark flex items-center gap-1 group transition-colors"
                        >
                            <Settings className="w-3 h-3 group-hover:rotate-45 transition-transform" />
                            <span>{t('settings_mushaf')}</span>
                            <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>

                {/* 3. Actions (Fixed at Bottom of Card) */}
                <div className="p-5 sm:p-6 bg-stone-50 border-t border-stone-100 shrink-0">
                    <div className="flex flex-col gap-2">
                        <button 
                            onClick={onConfirm}
                            className="w-full py-3.5 sm:py-4 bg-quran-dark text-white rounded-2xl font-bold shadow-lg shadow-quran-dark/20 hover:bg-quran-dark/95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 px-4"
                        >
                            <BookOpen className="w-5 h-5 shrink-0" />
                            <span className="text-xs sm:text-base leading-tight">{t('mushaf_setup_btn_confirm')}</span>
                        </button>
                        <button 
                            onClick={onCancel}
                            className="w-full py-2 text-gray-400 font-bold text-xs sm:text-sm hover:text-gray-600 transition-colors"
                        >
                            {t('mushaf_setup_btn_list')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MushafSetupOverlay;
