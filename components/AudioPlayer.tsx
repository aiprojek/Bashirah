
import React, { useState } from 'react';
import { useAudio } from '../contexts/AudioContext';
import { Play, Pause, SkipForward, SkipBack, X, Mic2, Loader2, ChevronUp, Repeat, Settings2, Infinity as InfinityIcon } from 'lucide-react';
import { RECITERS } from '../types';

const AudioPlayer: React.FC = () => {
  const { 
      isPlaying, 
      currentSurah, 
      currentVerse, 
      currentTotalVerses,
      surahName,
      activeReciter, 
      pause, 
      resume, 
      nextVerse, 
      prevVerse, 
      stop,
      setReciter,
      isLoading,
      repeatSettings,
      setRepeatSettings,
      currentLoopCount
  } = useAudio();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState<'reciter' | 'repeat' | null>(null);

  if (!currentSurah || !currentVerse) return null;

  const toggleSettings = (type: 'reciter' | 'repeat') => {
      if (showSettings === type) {
          setIsExpanded(false);
          setShowSettings(null);
      } else {
          setIsExpanded(true);
          setShowSettings(type);
      }
  };

  // --- RENDER REPEAT CONTROLS ---
  const renderRepeatControls = () => (
      <div className="p-4 space-y-4 text-gray-800 dark:text-gray-100">
          <div className="flex items-center justify-between mb-2">
               <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
                   <Repeat className="w-4 h-4 text-quran-gold" />
                   Muraja'ah (Pengulangan)
               </span>
               <button onClick={() => { setIsExpanded(false); setShowSettings(null); }}><ChevronUp className="w-4 h-4 text-gray-400" /></button>
          </div>

          {/* Mode Selector */}
          <div className="flex bg-stone-100 dark:bg-slate-700 p-1 rounded-lg">
              <button 
                onClick={() => setRepeatSettings({ ...repeatSettings, mode: 'none' })}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${repeatSettings.mode === 'none' ? 'bg-white dark:bg-slate-600 text-quran-dark dark:text-white shadow-sm' : 'text-gray-400'}`}
              >
                  Normal
              </button>
              <button 
                onClick={() => setRepeatSettings({ ...repeatSettings, mode: 'verse' })}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${repeatSettings.mode === 'verse' ? 'bg-white dark:bg-slate-600 text-quran-dark dark:text-white shadow-sm' : 'text-gray-400'}`}
              >
                  Per Ayat
              </button>
              <button 
                onClick={() => setRepeatSettings({ ...repeatSettings, mode: 'range' })}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${repeatSettings.mode === 'range' ? 'bg-white dark:bg-slate-600 text-quran-dark dark:text-white shadow-sm' : 'text-gray-400'}`}
              >
                  Rentang
              </button>
          </div>

          {/* Contextual Settings based on Mode */}
          {repeatSettings.mode !== 'none' && (
              <div className="grid grid-cols-2 gap-4 animate-fade-in">
                  
                  {/* Range Inputs */}
                  {repeatSettings.mode === 'range' && (
                    <div className="col-span-2 flex gap-3 items-center bg-white dark:bg-slate-700 p-3 rounded-xl border border-stone-200 dark:border-slate-600">
                        <div className="flex-1">
                            <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Mulai Ayat</label>
                            <input 
                                type="number" 
                                min={1} 
                                max={currentTotalVerses}
                                value={repeatSettings.rangeStart}
                                onChange={(e) => setRepeatSettings({ ...repeatSettings, rangeStart: Math.min(Math.max(1, parseInt(e.target.value) || 1), currentTotalVerses) })}
                                className="w-full text-center font-bold text-quran-dark dark:text-white bg-stone-50 dark:bg-slate-800 rounded p-1 border-none focus:ring-1 focus:ring-quran-gold"
                            />
                        </div>
                        <span className="text-gray-300">-</span>
                        <div className="flex-1">
                            <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Sampai Ayat</label>
                            <input 
                                type="number" 
                                min={repeatSettings.rangeStart} 
                                max={currentTotalVerses}
                                value={repeatSettings.rangeEnd}
                                onChange={(e) => setRepeatSettings({ ...repeatSettings, rangeEnd: Math.min(Math.max(repeatSettings.rangeStart, parseInt(e.target.value) || repeatSettings.rangeStart), currentTotalVerses) })}
                                className="w-full text-center font-bold text-quran-dark dark:text-white bg-stone-50 dark:bg-slate-800 rounded p-1 border-none focus:ring-1 focus:ring-quran-gold"
                            />
                        </div>
                    </div>
                  )}

                  {/* Repeat Count */}
                  <div className="col-span-2 bg-white dark:bg-slate-700 p-3 rounded-xl border border-stone-200 dark:border-slate-600 flex items-center justify-between">
                       <div>
                            <label className="text-[10px] text-gray-400 font-bold uppercase block">Jumlah Ulang</label>
                            <div className="text-xs text-gray-400 mt-0.5">
                                {repeatSettings.count === Infinity ? 'Tanpa Batas' : `${repeatSettings.count} Kali`}
                            </div>
                       </div>
                       
                       <div className="flex items-center gap-2">
                           <button 
                                onClick={() => setRepeatSettings({ ...repeatSettings, count: Infinity })}
                                className={`p-2 rounded-lg border ${repeatSettings.count === Infinity ? 'bg-quran-gold/10 border-quran-gold text-quran-gold' : 'border-stone-200 dark:border-slate-600 text-gray-400'}`}
                           >
                               <InfinityIcon className="w-4 h-4" />
                           </button>
                           <input 
                                type="number"
                                min={1}
                                max={100}
                                disabled={repeatSettings.count === Infinity}
                                value={repeatSettings.count === Infinity ? '' : repeatSettings.count}
                                onChange={(e) => setRepeatSettings({ ...repeatSettings, count: parseInt(e.target.value) || 1 })}
                                className={`w-16 text-center font-bold p-1.5 rounded-lg border ${repeatSettings.count !== Infinity ? 'border-quran-gold bg-white dark:bg-slate-800 text-quran-dark dark:text-white' : 'border-stone-200 dark:border-slate-600 bg-stone-50 dark:bg-slate-800 text-gray-300'}`}
                                placeholder="1"
                           />
                       </div>
                  </div>
              </div>
          )}
      </div>
  );

  // --- RENDER RECITER LIST ---
  const renderReciterList = () => (
      <div className="p-4">
            <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                        <Mic2 className="w-4 h-4 text-quran-gold" />
                        Pilih Qari
                    </span>
                    <button onClick={() => { setIsExpanded(false); setShowSettings(null); }}><ChevronUp className="w-4 h-4 text-gray-400" /></button>
            </div>
            
            <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                {RECITERS.map(reciter => (
                    <button
                        key={reciter.id}
                        onClick={() => setReciter(reciter.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between ${
                            activeReciter.id === reciter.id 
                            ? 'bg-quran-gold/10 text-quran-dark dark:text-quran-gold font-bold' 
                            : 'text-gray-600 dark:text-gray-300 hover:bg-stone-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        <span>{reciter.name}</span>
                        {activeReciter.id === reciter.id && <div className="w-2 h-2 bg-quran-gold rounded-full"></div>}
                    </button>
                ))}
            </div>
      </div>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 pointer-events-none">
        <div className="max-w-xl mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-stone-200 dark:border-slate-700 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] rounded-2xl overflow-hidden pointer-events-auto transition-all duration-300">
            
            {/* Main Bar */}
            <div className="flex items-center justify-between p-4 gap-3">
                
                {/* 1. Reciter Info & Button */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button 
                        className="w-10 h-10 bg-quran-dark rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-quran-gold transition-colors flex-shrink-0 relative group"
                        onClick={() => toggleSettings('reciter')}
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <div className="relative">
                                <Mic2 className="w-5 h-5" />
                                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Settings2 className="w-2 h-2 text-quran-dark dark:text-quran-gold" />
                                </div>
                            </div>
                        )}
                    </button>
                    <div className="min-w-0 cursor-pointer" onClick={() => toggleSettings('reciter')}>
                        <div className="flex items-center gap-2">
                             <p className="text-xs text-quran-gold font-bold uppercase tracking-wider mb-0.5 truncate">
                                 {activeReciter.name}
                             </p>
                             {/* Repeat Badge */}
                             {repeatSettings.mode !== 'none' && (
                                 <span className="text-[9px] bg-stone-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-gray-500 dark:text-gray-400 font-bold border border-stone-200 dark:border-slate-600 flex items-center gap-1">
                                     <Repeat className="w-2 h-2" /> 
                                     {repeatSettings.mode === 'verse' ? '1 Ayat' : 'Range'} 
                                     ({currentLoopCount}/{repeatSettings.count === Infinity ? '∞' : repeatSettings.count})
                                 </span>
                             )}
                        </div>
                        <p className="text-sm font-bold text-quran-dark dark:text-gray-100 truncate">
                            Surat {surahName} : Ayat {currentVerse}
                        </p>
                    </div>
                </div>

                {/* 2. Controls */}
                <div className="flex items-center gap-1 sm:gap-3">
                    {/* Repeat Toggle */}
                    <button 
                        onClick={() => toggleSettings('repeat')}
                        className={`p-2 rounded-full transition-colors ${repeatSettings.mode !== 'none' ? 'text-quran-gold bg-quran-gold/5' : 'text-stone-400 hover:text-quran-dark dark:hover:text-quran-gold'}`}
                    >
                        <Repeat className="w-5 h-5" />
                    </button>

                    <button onClick={prevVerse} className="p-2 text-stone-400 hover:text-quran-dark dark:hover:text-quran-gold transition-colors">
                        <SkipBack className="w-5 h-5 fill-current" />
                    </button>
                    
                    <button 
                        onClick={isPlaying ? pause : resume}
                        className="w-11 h-11 bg-quran-dark rounded-full flex items-center justify-center text-white hover:bg-quran-dark/90 hover:scale-105 transition-all shadow-lg shadow-quran-dark/30"
                    >
                        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                    </button>

                    <button onClick={nextVerse} className="p-2 text-stone-400 hover:text-quran-dark dark:hover:text-quran-gold transition-colors">
                        <SkipForward className="w-5 h-5 fill-current" />
                    </button>
                    
                    {/* Close */}
                    <button 
                        onClick={stop}
                        className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-stone-300 hover:text-red-500 transition-colors ml-1"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Expanded Settings Area */}
            <div className={`bg-stone-50 dark:bg-slate-800 border-t border-stone-100 dark:border-slate-700 transition-all duration-300 overflow-hidden ${isExpanded ? (showSettings === 'repeat' && repeatSettings.mode !== 'none' ? 'max-h-80' : 'max-h-60') : 'max-h-0'}`}>
                {showSettings === 'reciter' && renderReciterList()}
                {showSettings === 'repeat' && renderRepeatControls()}
            </div>
            
            {/* Visual Progress Bar (Simple) */}
            <div className="h-1 w-full bg-stone-100 dark:bg-slate-700">
                <div className={`h-full bg-quran-gold transition-all duration-[1000ms] ${isLoading ? 'w-full animate-pulse opacity-50' : isPlaying ? 'w-full opacity-100' : 'w-0'}`}></div>
            </div>
        </div>
    </div>
  );
};

export default AudioPlayer;
