
import React from 'react';
import { X, EyeOff, AlignCenter, Ghost, Zap, Check, BrainCircuit, Repeat, Infinity as InfinityIcon } from 'lucide-react';
import { MemorizationLevel, RepeatSettings } from '../types';

interface MemorizationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: MemorizationLevel;
  onLevelChange: (level: MemorizationLevel) => void;
  isActive: boolean;
  onToggleActive: (active: boolean) => void;
  repeatSettings: RepeatSettings;
  onRepeatSettingsChange: (settings: RepeatSettings) => void;
  currentTotalVerses: number;
}

const MemorizationSettingsModal: React.FC<MemorizationSettingsModalProps> = ({
  isOpen,
  onClose,
  level,
  onLevelChange,
  isActive,
  onToggleActive,
  repeatSettings,
  onRepeatSettingsChange,
  currentTotalVerses
}) => {
  if (!isOpen) return null;

  const levels: {id: MemorizationLevel, label: string, desc: string, icon: any}[] = [
      { id: 'normal', label: 'Blur (Kabur)', desc: 'Teks Arab dikaburkan, ketuk untuk mengintip.', icon: EyeOff },
      { id: 'first-last', label: 'Awal & Akhir', desc: 'Hanya kata pertama dan terakhir yang terlihat.', icon: AlignCenter },
      { id: 'ghost', label: 'Samar (Ghost)', desc: 'Teks sangat transparan, hampir tidak terlihat.', icon: Ghost },
      { id: 'random', label: 'Acak (Random)', desc: 'Sebagian kata dihilangkan secara acak.', icon: Zap },
  ];

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center px-4 animate-fade-in">
        {/* Backdrop */}
        <div 
            className="absolute inset-0 bg-quran-dark/80 dark:bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={onClose}
        />
        
        <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col transform transition-all scale-100 border border-white/10">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-stone-100 dark:border-slate-700 flex items-center justify-between bg-stone-50 dark:bg-slate-700/50">
                <h3 className="font-bold text-quran-dark dark:text-white font-serif text-lg flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-quran-gold" /> Hafalan & Muraja'ah
                </h3>
                <button 
                    onClick={onClose}
                    className="p-1 rounded-full hover:bg-stone-200 dark:hover:bg-slate-600 text-gray-400 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
                
                {/* 1. Memorization Toggle */}
                <div 
                    onClick={() => onToggleActive(!isActive)}
                    className={`flex items-center justify-between p-4 rounded-xl cursor-pointer border-2 transition-all ${
                        isActive 
                        ? 'border-quran-gold bg-quran-gold/5 dark:bg-quran-gold/10' 
                        : 'border-stone-200 dark:border-slate-600 bg-white dark:bg-slate-700'
                    }`}
                >
                    <div className="min-w-0 pr-2">
                        <span className="font-bold text-gray-800 dark:text-white block text-sm">Mode Hafalan</span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">Sembunyikan teks untuk menguji hafalan.</span>
                    </div>
                    <div className={`w-10 h-5 rounded-full relative transition-colors overflow-hidden flex-shrink-0 ${isActive ? 'bg-quran-gold' : 'bg-gray-300 dark:bg-gray-500'}`}>
                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${isActive ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </div>
                </div>

                {/* Level Selection */}
                {isActive && (
                    <div className="space-y-2 animate-fade-in border-l-2 border-quran-gold/20 pl-3">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Tingkat Kesulitan</label>
                        {levels.map((lvl) => (
                            <button
                                key={lvl.id}
                                onClick={() => onLevelChange(lvl.id)}
                                className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center gap-3 ${
                                    level === lvl.id 
                                    ? 'bg-quran-dark dark:bg-quran-gold text-white dark:text-quran-dark border-quran-dark dark:border-quran-gold shadow-md' 
                                    : 'bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 border-stone-200 dark:border-slate-600 hover:bg-stone-50 dark:hover:bg-slate-600'
                                }`}
                            >
                                <div className={`p-1.5 rounded-lg ${level === lvl.id ? 'bg-white/20' : 'bg-stone-100 dark:bg-slate-600 text-gray-500 dark:text-gray-300'}`}>
                                    <lvl.icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-xs">{lvl.label}</div>
                                </div>
                                {level === lvl.id && <Check className="w-4 h-4 text-quran-gold dark:text-quran-dark" />}
                            </button>
                        ))}
                    </div>
                )}

                <div className="h-px bg-stone-100 dark:bg-slate-700 mx-2"></div>

                {/* 2. Audio Loop (Hifzh Mode) */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                        <Repeat className="w-4 h-4 text-quran-gold" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pengulangan Audio (Hifzh)</span>
                    </div>

                    <div className="flex bg-stone-100 dark:bg-slate-700 p-1 rounded-xl">
                        {(['none', 'verse', 'range'] as const).map(m => (
                            <button 
                                key={m}
                                onClick={() => onRepeatSettingsChange({ ...repeatSettings, mode: m })}
                                className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${repeatSettings.mode === m ? 'bg-white dark:bg-slate-600 text-quran-dark dark:text-white shadow-sm' : 'text-gray-400'}`}
                            >
                                {m === 'none' ? 'Mati' : m === 'verse' ? 'Ayat' : 'Rentang'}
                            </button>
                        ))}
                    </div>

                    {repeatSettings.mode !== 'none' && (
                        <div className="space-y-3 p-3 bg-stone-50 dark:bg-slate-900/50 rounded-xl border border-stone-100 dark:border-slate-700 animate-fade-in">
                            {repeatSettings.mode === 'range' && (
                                <div className="flex gap-2 items-center">
                                    <div className="flex-1">
                                        <input 
                                            type="number" 
                                            value={repeatSettings.rangeStart}
                                            onChange={(e) => onRepeatSettingsChange({ ...repeatSettings, rangeStart: Math.max(1, parseInt(e.target.value) || 1) })}
                                            className="w-full text-center text-xs font-bold p-1.5 rounded-lg border border-stone-200 dark:border-slate-600 bg-white dark:bg-slate-800"
                                            placeholder="Dari"
                                        />
                                    </div>
                                    <span className="text-gray-400">-</span>
                                    <div className="flex-1">
                                        <input 
                                            type="number" 
                                            value={repeatSettings.rangeEnd}
                                            onChange={(e) => onRepeatSettingsChange({ ...repeatSettings, rangeEnd: Math.min(currentTotalVerses, Math.max(repeatSettings.rangeStart, parseInt(e.target.value) || repeatSettings.rangeStart)) })}
                                            className="w-full text-center text-xs font-bold p-1.5 rounded-lg border border-stone-200 dark:border-slate-600 bg-white dark:bg-slate-800"
                                            placeholder="Ke"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-gray-500 font-bold uppercase">Ulangi Ayat</span>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => onRepeatSettingsChange({ ...repeatSettings, count: Infinity })}
                                        className={`p-1.5 rounded-lg border ${repeatSettings.count === Infinity ? 'bg-quran-gold/10 border-quran-gold text-quran-gold' : 'border-stone-200 dark:border-slate-600 text-gray-400'}`}
                                    >
                                        <InfinityIcon className="w-3.5 h-3.5" />
                                    </button>
                                    <input 
                                        type="number"
                                        value={repeatSettings.count === Infinity ? '' : repeatSettings.count}
                                        onChange={(e) => onRepeatSettingsChange({ ...repeatSettings, count: Math.max(1, parseInt(e.target.value) || 1) })}
                                        disabled={repeatSettings.count === Infinity}
                                        className="w-12 text-center text-xs font-bold p-1.5 rounded-lg border border-stone-200 dark:border-slate-600 bg-white dark:bg-slate-800"
                                        placeholder="1"
                                    />
                                    <span className="text-[10px] text-gray-400 font-bold uppercase">Kali</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

             {/* Footer */}
             <div className="px-6 py-4 bg-stone-50 dark:bg-slate-700/50 border-t border-stone-100 dark:border-slate-700">
                <button 
                    onClick={onClose}
                    className="w-full py-3 bg-quran-dark dark:bg-quran-gold text-white dark:text-quran-dark rounded-xl font-bold hover:bg-quran-dark/90 dark:hover:bg-quran-gold/90 transition-all shadow-lg"
                >
                    Selesai
                </button>
            </div>
        </div>
    </div>
  );
};

export default MemorizationSettingsModal;
