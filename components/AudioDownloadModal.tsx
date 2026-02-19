
import React from 'react';
import { useAudio } from '../contexts/AudioContext';
import { Download, Wifi, X, Music, Loader2, Mic2, ChevronDown } from 'lucide-react';
import { estimateSurahSize } from '../services/audioService';
import { RECITERS } from '../types';

const AudioDownloadModal: React.FC = () => {
  const { 
    downloadPrompt, 
    isDownloading, 
    downloadProgress, 
    resolveDownloadPrompt,
    activeReciter,
    setReciter
  } = useAudio();

  if (!downloadPrompt) return null;

  const estimatedSize = estimateSurahSize(downloadPrompt.totalVerses);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 animate-fade-in">
      <div 
         className="absolute inset-0 bg-quran-dark/70 dark:bg-black/80 backdrop-blur-sm transition-opacity"
         onClick={() => !isDownloading && resolveDownloadPrompt('cancel')}
      />
      
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-white/20 dark:border-slate-700">
          
          {/* Header */}
          <div className="p-6 text-center border-b border-stone-100 dark:border-slate-700 bg-stone-50/50 dark:bg-slate-700/30">
             <div className="w-16 h-16 bg-quran-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 text-quran-gold">
                 {isDownloading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Music className="w-8 h-8" />}
             </div>
             <h3 className="text-lg font-bold text-quran-dark dark:text-white font-serif mb-1">
                 {isDownloading ? 'Mengunduh Audio...' : 'Putar Audio'}
             </h3>
             <p className="text-sm text-gray-500 dark:text-gray-400">
                 Surat {downloadPrompt.surahName}
             </p>
          </div>

          <div className="p-6">
              {isDownloading ? (
                  <div className="space-y-3">
                      <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          <span>{activeReciter.name}</span>
                          <span>{downloadProgress}%</span>
                      </div>
                      <div className="w-full bg-stone-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                          <div 
                            className="bg-quran-gold h-full transition-all duration-300 ease-out rounded-full" 
                            style={{ width: `${downloadProgress}%` }}
                          ></div>
                      </div>
                      <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2">Mohon tunggu sebentar...</p>
                  </div>
              ) : (
                  <div className="space-y-4">
                      {/* Reciter Selector */}
                      <div className="bg-stone-50 dark:bg-slate-700 p-3 rounded-xl border border-stone-100 dark:border-slate-600">
                          <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-400 block mb-2 tracking-wider">Pilih Qari (Pembaca)</label>
                          <div className="relative">
                                <Mic2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-quran-gold" />
                                <select 
                                    className="w-full pl-9 pr-8 py-2 rounded-lg border border-stone-200 dark:border-slate-600 focus:ring-1 focus:ring-quran-gold/50 text-sm appearance-none bg-white dark:bg-slate-600 text-gray-700 dark:text-white"
                                    value={activeReciter.id}
                                    onChange={(e) => setReciter(e.target.value)}
                                >
                                    {RECITERS.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                      </div>

                      <p className="text-center text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                          Audio surat ini belum tersimpan.
                      </p>

                      <button 
                          onClick={() => resolveDownloadPrompt('download')}
                          className="w-full py-3.5 px-4 bg-quran-dark dark:bg-quran-gold text-white dark:text-quran-dark rounded-xl flex items-center justify-between group hover:bg-quran-dark/90 dark:hover:bg-quran-gold/90 transition-all shadow-lg shadow-quran-dark/20 dark:shadow-quran-gold/20"
                      >
                          <div className="flex items-center gap-3">
                              <div className="bg-white/10 dark:bg-black/10 p-2 rounded-lg"><Download className="w-5 h-5" /></div>
                              <div className="text-left">
                                  <div className="font-bold text-sm">Unduh & Putar</div>
                                  <div className="text-[10px] opacity-70">Simpan Offline (~{estimatedSize})</div>
                              </div>
                          </div>
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      </button>

                      <div className="relative flex py-2 items-center">
                          <div className="flex-grow border-t border-gray-200 dark:border-slate-700"></div>
                          <span className="flex-shrink-0 mx-4 text-gray-400 dark:text-gray-500 text-xs font-bold uppercase">Atau</span>
                          <div className="flex-grow border-t border-gray-200 dark:border-slate-700"></div>
                      </div>

                      <button 
                          onClick={() => resolveDownloadPrompt('stream')}
                          className="w-full py-3.5 px-4 bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-600 text-gray-700 dark:text-gray-200 rounded-xl flex items-center justify-between hover:bg-stone-50 dark:hover:bg-slate-700 transition-colors"
                      >
                          <div className="flex items-center gap-3">
                              <div className="bg-stone-100 dark:bg-slate-700 p-2 rounded-lg text-gray-500 dark:text-gray-300"><Wifi className="w-5 h-5" /></div>
                              <div className="text-left">
                                  <div className="font-bold text-sm">Stream Online</div>
                                  <div className="text-[10px] text-gray-400 dark:text-gray-500">Gunakan Internet</div>
                              </div>
                          </div>
                      </button>
                  </div>
              )}
          </div>
          
          {!isDownloading && (
              <button 
                onClick={() => resolveDownloadPrompt('cancel')}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
              >
                  <X className="w-5 h-5" />
              </button>
          )}
      </div>
    </div>
  );
};

export default AudioDownloadModal;
