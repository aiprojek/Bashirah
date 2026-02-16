
import React, { useState, useEffect, useMemo } from 'react';
import { Globe, BookType, Check, Loader2, Search, AlertCircle, ChevronDown, ChevronUp, Star, Download, Wifi, Book, Volume2, Mic2, Trash2, Image as ImageIcon, Palette, Sparkles } from 'lucide-react';
import { LanguageCode, APP_LANGUAGES, TranslationOption, RECITERS, Surah, MUSHAF_EDITIONS, MushafEdition } from '../types';
import LanguageModal from '../components/LanguageModal';
import * as DB from '../services/db';
import * as AudioService from '../services/audioService';
import * as MushafService from '../services/mushafService';
import * as StorageService from '../services/storageService';
import { downloadEdition, verifyEditionAvailability, getAllSurahs } from '../services/quranService';
import { useAudio } from '../contexts/AudioContext';

interface SettingsPageProps {
  currentAppLang: LanguageCode;
  onAppLangChange: (lang: LanguageCode) => void;
  
  // Translation Props
  currentTranslationId: string;
  onTranslationChange: (id: string) => void;
  showTranslation: boolean;
  onToggleTranslation: (show: boolean) => void;
  
  // Tafsir Props
  currentTafsirId: string;
  onTafsirChange: (id: string) => void;
  showTafsir: boolean;
  onToggleTafsir: (show: boolean) => void;

  // Word By Word Props
  showWordByWord: boolean;
  onToggleWordByWord: (show: boolean) => void;

  availableEditions: TranslationOption[];
}

const SettingsPage: React.FC<SettingsPageProps> = ({
  currentAppLang,
  onAppLangChange,
  
  currentTranslationId,
  onTranslationChange,
  showTranslation,
  onToggleTranslation,

  currentTafsirId,
  onTafsirChange,
  showTafsir,
  onToggleTafsir,

  showWordByWord,
  onToggleWordByWord,

  availableEditions
}) => {
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [downloadedIds, setDownloadedIds] = useState<string[]>([]);
  
  // Handling interaction states
  const [processingId, setProcessingId] = useState<string | null>(null); 
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  
  const [activeSection, setActiveSection] = useState<'translation' | 'tafsir' | 'audio' | 'mushaf' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Audio Settings State
  const { activeReciter, setReciter } = useAudio();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [audioDownloads, setAudioDownloads] = useState<Record<number, boolean>>({});
  const [isDownloadingAudio, setIsDownloadingAudio] = useState(false);
  const [currentDownloadSurah, setCurrentDownloadSurah] = useState<number | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);

  // Mushaf Settings State
  const [activeMushafId, setActiveMushafId] = useState<string>('madani');
  const [mushafDownloads, setMushafDownloads] = useState<Record<string, boolean>>({});
  const [isDownloadingMushaf, setIsDownloadingMushaf] = useState(false);
  const [mushafProgress, setMushafProgress] = useState(0);

  // Appearance Settings
  const [showDailyAyat, setShowDailyAyat] = useState(true);

  useEffect(() => {
    const checkDownloads = async () => {
        const downloads = await DB.getDownloadedEditions();
        setDownloadedIds(downloads.map(d => d.key));
    };
    checkDownloads();
    
    // Fetch Surahs for Audio Manager
    getAllSurahs(currentAppLang).then(setSurahs);

    // Initial Mushaf State
    setActiveMushafId(MushafService.getActiveMushafId());
    
    // Check Mushaf Downloads
    const checkMushafStatus = async () => {
        const status: Record<string, boolean> = {};
        for (const m of MUSHAF_EDITIONS) {
            status[m.id] = await MushafService.isMushafDownloaded(m.id);
        }
        setMushafDownloads(status);
    };
    checkMushafStatus();

    // Check Daily Ayat Settings
    setShowDailyAyat(StorageService.getShowAyatOfTheDay());

  }, [currentAppLang]);

  // Optimized: Check Audio Downloads using batch function
  useEffect(() => {
      const checkAudioStatus = async () => {
          if (surahs.length === 0) return;
          // Use batch check instead of loop
          const statusMap = await AudioService.getDownloadedSurahs(activeReciter.id, surahs);
          setAudioDownloads(statusMap);
      };
      
      if(activeSection === 'audio') {
          checkAudioStatus();
      }
  }, [activeSection, activeReciter, surahs]);

  const getAppLangName = () => {
      return APP_LANGUAGES.find(l => l.code === currentAppLang)?.nativeName || 'English';
  };

  const getEditionName = (id: string) => {
      const ed = availableEditions.find(e => e.identifier === id);
      return ed ? ed.name : 'Unknown';
  }

  // --- APPEARANCE LOGIC ---
  const handleToggleDailyAyat = (enabled: boolean) => {
      setShowDailyAyat(enabled);
      StorageService.setShowAyatOfTheDay(enabled);
      // Trigger a window reload or custom event might be needed if App.tsx doesn't pick it up immediately, 
      // but simpler is to let user navigate back and App.tsx re-mounts/re-checks.
  };

  // --- MUSHAF LOGIC ---
  const handleSetMushaf = (id: string) => {
      MushafService.setActiveMushafId(id);
      setActiveMushafId(id);
  };

  const handleDownloadMushaf = async (mushaf: MushafEdition) => {
      if (isDownloadingMushaf) return;
      
      const confirmMsg = `Unduh Mushaf ${mushaf.name}? \nUkuran sekitar 200MB - 300MB. Pastikan WiFi aktif.`;
      if (!window.confirm(confirmMsg)) return;

      setIsDownloadingMushaf(true);
      setMushafProgress(0);
      setProcessingId(mushaf.id); // Reuse processing ID for UI state

      try {
          await MushafService.downloadMushaf(mushaf.id, (progress) => {
              setMushafProgress(progress);
          });
          setMushafDownloads(prev => ({ ...prev, [mushaf.id]: true }));
          alert("Mushaf berhasil diunduh dan siap digunakan offline.");
      } catch (e: any) {
          console.error(e);
          alert(`Gagal mengunduh: ${e.message}`);
      } finally {
          setIsDownloadingMushaf(false);
          setMushafProgress(0);
          setProcessingId(null);
      }
  };

  const handleDeleteMushaf = async (mushaf: MushafEdition) => {
      if (!window.confirm(`Hapus data offline untuk Mushaf ${mushaf.name}?`)) return;
      await MushafService.deleteMushafData(mushaf.id);
      setMushafDownloads(prev => ({ ...prev, [mushaf.id]: false }));
  };


  // --- AUDIO DOWNLOAD LOGIC ---
  const handleDownloadSurahAudio = async (surah: Surah) => {
      if (isDownloadingAudio) return;
      
      const confirmMsg = `Unduh audio Surat ${surah.transliteration} oleh ${activeReciter.name}?\nEstimasi ukuran: ${AudioService.estimateSurahSize(surah.total_verses)}`;
      if (!window.confirm(confirmMsg)) return;

      setIsDownloadingAudio(true);
      setCurrentDownloadSurah(surah.id);
      setAudioProgress(0);

      try {
          await AudioService.downloadSurahAudio(activeReciter, surah.id, surah.total_verses, (progress) => {
              setAudioProgress(progress);
          });
          setAudioDownloads(prev => ({ ...prev, [surah.id]: true }));
      } catch (e: any) {
          console.error(e);
          alert(`Gagal mengunduh: ${e.message || 'Terjadi kesalahan'}`);
      } finally {
          setIsDownloadingAudio(false);
          setCurrentDownloadSurah(null);
          setAudioProgress(0);
      }
  };

  const handleDeleteSurahAudio = async (surahId: number) => {
      if (!window.confirm("Hapus data audio untuk surat ini?")) return;
      await AudioService.deleteSurahAudio(activeReciter.id, surahId);
      setAudioDownloads(prev => ({ ...prev, [surahId]: false }));
  };

  const handleDownloadAllAudio = async () => {
      if (isDownloadingAudio) return;
      if (!window.confirm(`PERINGATAN: Mengunduh 30 Juz (${activeReciter.name}) membutuhkan ruang penyimpanan besar (~1.5 GB - 3 GB). Lanjutkan?`)) return;

      setIsDownloadingAudio(true);
      
      try {
          for (const s of surahs) {
              if (audioDownloads[s.id]) continue; // Skip if already downloaded
              
              setCurrentDownloadSurah(s.id);
              setAudioProgress(0);
              
              await AudioService.downloadSurahAudio(activeReciter, s.id, s.total_verses, (progress) => {
                  setAudioProgress(progress);
              });
              
              setAudioDownloads(prev => ({ ...prev, [s.id]: true }));
          }
          alert("Unduhan 30 Juz Selesai!");
      } catch (e: any) {
          console.error(e);
          alert(`Unduhan terhenti: ${e.message}`);
      } finally {
          setIsDownloadingAudio(false);
          setCurrentDownloadSurah(null);
          setAudioProgress(0);
      }
  };

  // --- TEXT DOWNLOAD LOGIC ---
  const handleSelectOrDownload = async (edition: TranslationOption, type: 'translation' | 'tafsir') => {
      const isCurrent = type === 'translation' ? currentTranslationId === edition.identifier : currentTafsirId === edition.identifier;
      if (isCurrent) return;

      const isDownloaded = downloadedIds.includes(edition.identifier);
      setProcessingId(edition.identifier);
      setDownloadProgress(0);
      
      try {
          if (isDownloaded) {
               setProcessingStatus('Memverifikasi...');
               if(type === 'translation') {
                   onTranslationChange(edition.identifier);
                   if(!showTranslation) onToggleTranslation(true);
               } else {
                   onTafsirChange(edition.identifier);
                   if(!showTafsir) onToggleTafsir(true);
               }
          } else {
              setProcessingStatus('Cek koneksi...');
              const isWorking = await verifyEditionAvailability(edition.identifier);
              
              if (!isWorking) {
                  alert(`Maaf, edisi "${edition.name}" saat ini tidak dapat diakses dari server.`);
                  setProcessingId(null);
                  return;
              }

              const confirmDownload = window.confirm(
                  `Unduh "${edition.name}"?\nUkuran sekitar: ${edition.approxSize || 'Unknown'}\n\nKlik OK untuk unduh (Offline). Cancel untuk Streaming (Online).`
              );

              if (confirmDownload) {
                  await downloadEdition(edition.identifier, (msg, percent) => {
                      setProcessingStatus(msg);
                      setDownloadProgress(percent);
                  });
                  setDownloadedIds(prev => [...prev, edition.identifier]);
              }
              
              if(type === 'translation') {
                   onTranslationChange(edition.identifier);
                   if(!showTranslation) onToggleTranslation(true);
               } else {
                   onTafsirChange(edition.identifier);
                   if(!showTafsir) onToggleTafsir(true);
               }
          }
      } catch (error) {
          console.error(error);
          alert("Terjadi kesalahan.");
      } finally {
          setProcessingId(null);
          setProcessingStatus('');
          setDownloadProgress(0);
      }
  };

  // --- RENDER LIST ---
  const renderEditionList = (type: 'translation' | 'tafsir') => {
      const currentId = type === 'translation' ? currentTranslationId : currentTafsirId;
      
      const filtered = availableEditions
        .filter(opt => opt.type === type)
        .filter(opt => 
            opt.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            opt.language.toLowerCase().includes(searchQuery.toLowerCase())
        );

      return (
          <div className="space-y-3">
              {/* Search Bar inside Section */}
              <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                      type="text" 
                      placeholder={`Cari ${type === 'translation' ? 'Terjemahan' : 'Tafsir'}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-quran-gold/50 text-sm"
                  />
              </div>

              {filtered.map(option => {
                  const isDownloaded = downloadedIds.includes(option.identifier);
                  const isSelected = currentId === option.identifier;
                  const isProcessing = processingId === option.identifier;

                  return (
                    <div key={option.identifier} className={`p-4 rounded-xl border transition-all ${isSelected ? 'border-quran-gold bg-quran-gold/5' : 'border-stone-200 bg-white hover:border-quran-gold/50'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-semibold text-gray-800 text-sm">{option.name}</h4>
                                <p className="text-xs text-gray-500">{option.englishName}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wide">{option.language}</span>
                                    <span className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded flex items-center gap-1">
                                        <Download className="w-3 h-3" /> {option.approxSize || '? MB'}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Status Icon */}
                            {isSelected && <div className="bg-quran-gold text-white p-1 rounded-full"><Check className="w-3 h-3" /></div>}
                        </div>

                        {isProcessing ? (
                             <div className="mt-3">
                                 <div className="flex justify-between text-xs text-gray-500 mb-1">
                                     <span>{processingStatus}</span>
                                     <span>{downloadProgress}%</span>
                                 </div>
                                 <div className="w-full bg-stone-200 rounded-full h-1.5">
                                     <div className="bg-quran-gold h-1.5 rounded-full transition-all duration-300" style={{ width: `${downloadProgress}%` }}></div>
                                 </div>
                             </div>
                        ) : (
                            <button 
                                onClick={() => handleSelectOrDownload(option, type)}
                                className={`w-full mt-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                                    isSelected
                                    ? 'bg-quran-dark text-white cursor-default'
                                    : isDownloaded
                                        ? 'border border-quran-dark text-quran-dark hover:bg-quran-dark hover:text-white'
                                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                }`}
                            >
                                {isSelected ? 'Sedang Digunakan' : isDownloaded ? 'Gunakan (Offline)' : 'Unduh & Gunakan'}
                                {!isDownloaded && !isSelected && <Download className="w-3 h-3" />}
                            </button>
                        )}
                    </div>
                  );
              })}
              
              {filtered.length === 0 && <p className="text-center text-gray-400 text-sm py-4">Tidak ditemukan.</p>}
          </div>
      );
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20 animate-fade-in">
        
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
            
            {/* 1. Language Settings */}
            <section className="bg-white rounded-2xl shadow-sm border border-stone-200 p-5 flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-quran-gold" /> Bahasa Aplikasi
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">{getAppLangName()}</p>
                </div>
                <button 
                    onClick={() => setIsLangModalOpen(true)}
                    className="px-3 py-1.5 text-xs font-bold bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200"
                >
                    Ubah
                </button>
            </section>
            
            {/* 2. Tampilan UI Settings (New Section for Ayat of the Day) */}
            <section className="bg-white rounded-2xl shadow-sm border border-stone-200 p-5 space-y-5">
                 <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-quran-gold" /> Notifikasi Ayat Harian
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">Tampilkan tombol ayat harian di beranda.</p>
                    </div>
                    <button
                        onClick={() => handleToggleDailyAyat(!showDailyAyat)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            showDailyAyat ? 'bg-quran-dark' : 'bg-gray-300'
                        }`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showDailyAyat ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>

                <div className="flex items-center justify-between border-t border-stone-100 pt-5">
                    <div>
                        <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                            <Book className="w-4 h-4 text-quran-gold" /> Terjemahan Perkata
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">Tampilkan arti setiap kata di bawah teks Arab.</p>
                    </div>
                    <button
                        onClick={() => onToggleWordByWord(!showWordByWord)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            showWordByWord ? 'bg-quran-dark' : 'bg-gray-300'
                        }`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showWordByWord ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </section>

            {/* 3. Mushaf Settings */}
            <section className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50 cursor-pointer" onClick={() => setActiveSection(activeSection === 'mushaf' ? null : 'mushaf')}>
                    <div>
                        <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-quran-gold" /> Tampilan Mushaf
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Jenis: {MushafService.getMushafEdition(activeMushafId).name}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {activeSection === 'mushaf' ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                    </div>
                </div>

                {activeSection === 'mushaf' && (
                    <div className="p-5 bg-stone-50/30 space-y-4">
                        <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded-lg flex gap-2">
                            <Wifi className="w-4 h-4 shrink-0" />
                            <p>Unduh mushaf agar bisa membuka mode halaman tanpa internet (Offline).</p>
                        </div>
                        
                        {MUSHAF_EDITIONS.map(mushaf => {
                            const isSelected = activeMushafId === mushaf.id;
                            const isDownloaded = mushafDownloads[mushaf.id];
                            const isProcessing = processingId === mushaf.id;

                            return (
                                <div key={mushaf.id} className={`p-4 rounded-xl border transition-all ${isSelected ? 'border-quran-gold bg-white ring-1 ring-quran-gold/20' : 'border-stone-200 bg-white hover:border-stone-300'}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                                {mushaf.name}
                                                {isSelected && <Check className="w-3 h-3 text-quran-gold" />}
                                            </h4>
                                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{mushaf.description}</p>
                                        </div>
                                    </div>

                                    {isProcessing ? (
                                         <div className="mt-4 flex items-center gap-3">
                                            <div className="flex-1 bg-stone-200 rounded-full h-1.5">
                                                <div className="bg-quran-gold h-1.5 rounded-full transition-all duration-300" style={{ width: `${mushafProgress}%` }}></div>
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-500">{mushafProgress}%</span>
                                         </div>
                                    ) : (
                                        <div className="flex gap-2 mt-4">
                                            <button 
                                                onClick={() => handleSetMushaf(mushaf.id)}
                                                disabled={isSelected}
                                                className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                                                    isSelected
                                                    ? 'bg-quran-gold text-white cursor-default'
                                                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                                }`}
                                            >
                                                {isSelected ? 'Aktif' : 'Gunakan'}
                                            </button>

                                            {isDownloaded ? (
                                                <button 
                                                    onClick={() => handleDeleteMushaf(mushaf)}
                                                    className="px-3 py-2 border border-red-200 text-red-500 rounded-lg hover:bg-red-50"
                                                    title="Hapus Data Offline"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleDownloadMushaf(mushaf)}
                                                    disabled={isDownloadingMushaf}
                                                    className="px-3 py-2 border border-stone-200 text-stone-500 rounded-lg hover:bg-stone-50 hover:text-quran-dark"
                                                    title="Unduh Offline"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* 4. Audio & Murottal Settings */}
            <section className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                {/* ... Audio Settings Content ... */}
                <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50 cursor-pointer" onClick={() => setActiveSection(activeSection === 'audio' ? null : 'audio')}>
                     <div>
                        <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                            <Volume2 className="w-4 h-4 text-quran-gold" /> Audio & Murottal
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Qari: {activeReciter.name}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {activeSection === 'audio' ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                    </div>
                </div>

                {activeSection === 'audio' && (
                    <div className="p-5 bg-stone-50/30 space-y-6">
                        
                        {/* Reciter Selector */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pilih Qari</label>
                            <div className="relative">
                                <Mic2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-quran-gold" />
                                <select 
                                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-quran-gold/50 text-sm appearance-none bg-white"
                                    value={activeReciter.id}
                                    onChange={(e) => setReciter(e.target.value)}
                                >
                                    {RECITERS.map(r => (
                                        <option key={r.id} value={r.id}>{r.name} {r.style ? `(${r.style})` : ''}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Download Manager */}
                        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                            <div className="p-4 bg-stone-100 border-b border-stone-200 flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-600">Manajer Unduhan (Offline)</span>
                                <button 
                                    onClick={handleDownloadAllAudio}
                                    disabled={isDownloadingAudio}
                                    className="text-[10px] bg-quran-gold/10 text-quran-dark px-2 py-1 rounded font-bold hover:bg-quran-gold/20 disabled:opacity-50"
                                >
                                    Unduh Semua (30 Juz)
                                </button>
                            </div>
                            
                            <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
                                {surahs.map(surah => {
                                    const isDownloaded = audioDownloads[surah.id];
                                    const isThisSurahDownloading = currentDownloadSurah === surah.id;
                                    
                                    return (
                                        <div key={surah.id} className="p-3 flex items-center justify-between hover:bg-stone-50 relative">
                                            {isThisSurahDownloading && (
                                                <div className="absolute inset-0 bg-quran-gold/5 pointer-events-none">
                                                    <div 
                                                        className="h-full bg-quran-gold/10 transition-all duration-300"
                                                        style={{width: `${audioProgress}%`}}
                                                    />
                                                </div>
                                            )}
                                            
                                            <div className="flex items-center gap-3 relative z-10">
                                                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-gray-500 border border-stone-200">
                                                    {surah.id}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-800">{surah.transliteration}</p>
                                                    <p className="text-[10px] text-gray-400">{surah.total_verses} Ayat • {AudioService.estimateSurahSize(surah.total_verses)}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 relative z-10">
                                                {isThisSurahDownloading ? (
                                                    <div className="flex items-center gap-2 text-xs text-quran-gold font-bold bg-white/80 px-2 py-1 rounded-full shadow-sm">
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                        {audioProgress}%
                                                    </div>
                                                ) : isDownloaded ? (
                                                    <button 
                                                        onClick={() => handleDeleteSurahAudio(surah.id)}
                                                        className="p-2 text-green-600 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors group border border-transparent hover:border-red-200"
                                                        title="Hapus Unduhan"
                                                    >
                                                        <Check className="w-4 h-4 group-hover:hidden" />
                                                        <Trash2 className="w-4 h-4 hidden group-hover:block" />
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleDownloadSurahAudio(surah)}
                                                        disabled={isDownloadingAudio}
                                                        className="p-2 text-gray-400 hover:text-quran-gold hover:bg-stone-100 rounded-full transition-colors disabled:opacity-30 border border-transparent hover:border-stone-200"
                                                        title="Unduh"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        
                         <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded-lg flex gap-2">
                            <Wifi className="w-4 h-4 shrink-0" />
                            <p>Data audio yang diunduh akan disimpan di penyimpanan browser (Cache) agar bisa diputar tanpa internet. Pastikan penyimpanan perangkat cukup.</p>
                        </div>

                    </div>
                )}
            </section>

            {/* 5. Translation Settings */}
            <section className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                {/* ... existing translation settings ... */}
                <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                    <div>
                        <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                            <BookType className="w-4 h-4 text-quran-gold" /> Terjemahan Lengkap
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {showTranslation ? `Aktif: ${getEditionName(currentTranslationId)}` : 'Nonaktif'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                         <button
                            onClick={() => onToggleTranslation(!showTranslation)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                                showTranslation ? 'bg-quran-dark' : 'bg-gray-300'
                            }`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showTranslation ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                        <button 
                            onClick={() => {
                                setActiveSection(activeSection === 'translation' ? null : 'translation');
                                setSearchQuery('');
                            }}
                            className="p-1 rounded-full hover:bg-stone-200"
                        >
                            {activeSection === 'translation' ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                        </button>
                    </div>
                </div>
                
                {activeSection === 'translation' && (
                    <div className="p-5 bg-stone-50/30">
                        {renderEditionList('translation')}
                    </div>
                )}
            </section>

            {/* 6. Tafsir Settings */}
            <section className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                {/* ... existing tafsir settings ... */}
                <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                    <div>
                        <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                            <BookType className="w-4 h-4 text-quran-gold" /> Tafsir
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {showTafsir ? `Aktif: ${getEditionName(currentTafsirId)}` : 'Nonaktif'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                         <button
                            onClick={() => onToggleTafsir(!showTafsir)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                                showTafsir ? 'bg-quran-dark' : 'bg-gray-300'
                            }`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showTafsir ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                        <button 
                            onClick={() => {
                                setActiveSection(activeSection === 'tafsir' ? null : 'tafsir');
                                setSearchQuery('');
                            }}
                            className="p-1 rounded-full hover:bg-stone-200"
                        >
                            {activeSection === 'tafsir' ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                        </button>
                    </div>
                </div>
                
                {activeSection === 'tafsir' && (
                    <div className="p-5 bg-stone-50/30">
                        <div className="mb-4 p-3 bg-blue-50 text-blue-700 text-xs rounded-lg flex gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <p>Tafsir memberikan penjelasan mendalam. Ukuran file biasanya lebih besar (3MB - 10MB).</p>
                        </div>
                        {renderEditionList('tafsir')}
                    </div>
                )}
            </section>

        </div>

        <LanguageModal 
            isOpen={isLangModalOpen}
            onClose={() => setIsLangModalOpen(false)}
            currentAppLang={currentAppLang}
            onAppLangChange={onAppLangChange}
        />
    </div>
  );
};

export default SettingsPage;
