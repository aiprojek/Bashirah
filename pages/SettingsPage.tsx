
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Globe, BookType, Check, Loader2, Search, AlertCircle, ChevronDown, ChevronUp, Star, Download, Wifi, Book, Volume2, Mic2, Trash2, Image as ImageIcon, Palette, Sparkles, Moon, Sun, Save, Upload, HardDrive } from 'lucide-react';
import { LanguageCode, APP_LANGUAGES, TranslationOption, RECITERS, Surah, MUSHAF_EDITIONS, MushafEdition, TAJWEED_EDITION } from '../types';
import LanguageModal from '../components/LanguageModal';
import ConfirmationModal from '../components/ConfirmationModal'; 
import * as DB from '../services/db';
import * as AudioService from '../services/audioService';
import * as MushafService from '../services/mushafService';
import * as StorageService from '../services/storageService';
import * as BackupService from '../services/backupService';
import { downloadEdition, verifyEditionAvailability, getAllSurahs } from '../services/quranService';
import { useAudio } from '../contexts/AudioContext';
import { useTheme } from '../contexts/ThemeContext'; 

interface SettingsPageProps {
  currentAppLang: LanguageCode;
  onAppLangChange: (lang: LanguageCode) => void;
  currentTranslationId: string;
  onTranslationChange: (id: string) => void;
  showTranslation: boolean;
  onToggleTranslation: (show: boolean) => void;
  currentTafsirId: string;
  onTafsirChange: (id: string) => void;
  showTafsir: boolean;
  onToggleTafsir: (show: boolean) => void;
  showWordByWord: boolean;
  onToggleWordByWord: (show: boolean) => void;
  availableEditions: TranslationOption[];
  showTajweed: boolean; 
  onToggleTajweed: (show: boolean) => void; 
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
  availableEditions,
  showTajweed,
  onToggleTajweed
}) => {
  const { theme, toggleTheme } = useTheme();
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [downloadedIds, setDownloadedIds] = useState<string[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null); 
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [activeSection, setActiveSection] = useState<'translation' | 'tafsir' | 'audio' | 'mushaf' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { activeReciter, setReciter } = useAudio();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [audioDownloads, setAudioDownloads] = useState<Record<number, boolean>>({});
  const [isDownloadingAudio, setIsDownloadingAudio] = useState(false);
  const [currentDownloadSurah, setCurrentDownloadSurah] = useState<number | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [activeMushafId, setActiveMushafId] = useState<string>('madani');
  const [mushafDownloads, setMushafDownloads] = useState<Record<string, boolean>>({});
  const [isDownloadingMushaf, setIsDownloadingMushaf] = useState(false);
  const [mushafProgress, setMushafProgress] = useState(0);
  const [showDailyAyat, setShowDailyAyat] = useState(true);
  const [confirmState, setConfirmState] = useState<{
      isOpen: boolean;
      title: string;
      message: string;
      confirmText: string;
      variant: 'primary' | 'danger';
      onConfirm: () => void;
  }>({
      isOpen: false,
      title: '',
      message: '',
      confirmText: 'Lanjutkan',
      variant: 'primary',
      onConfirm: () => {},
  });

  // Backup & Restore State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isBackupProcessing, setIsBackupProcessing] = useState(false);

  const requestConfirmation = (title: string, message: string, confirmText: string, variant: 'primary' | 'danger', action: () => void) => {
      setConfirmState({ isOpen: true, title, message, confirmText, variant, onConfirm: action });
  };

  useEffect(() => {
    const checkDownloads = async () => {
        const downloads = await DB.getDownloadedEditions();
        setDownloadedIds(downloads.map(d => d.identifier));
    };
    checkDownloads();
    getAllSurahs(currentAppLang).then(setSurahs);
    setActiveMushafId(MushafService.getActiveMushafId());
    const checkMushafStatus = async () => {
        const status: Record<string, boolean> = {};
        for (const m of MUSHAF_EDITIONS) {
            status[m.id] = await MushafService.isMushafDownloaded(m.id);
        }
        setMushafDownloads(status);
    };
    checkMushafStatus();
    setShowDailyAyat(StorageService.getShowAyatOfTheDay());
  }, [currentAppLang]);

  // ... (keep audio logic) ...
  useEffect(() => {
      const checkAudioStatus = async () => {
          if (surahs.length === 0) return;
          const statusMap = await AudioService.getDownloadedSurahs(activeReciter.id, surahs);
          setAudioDownloads(statusMap);
      };
      if(activeSection === 'audio') {
          checkAudioStatus();
      }
  }, [activeSection, activeReciter, surahs]);

  const getAppLangName = () => APP_LANGUAGES.find(l => l.code === currentAppLang)?.nativeName || 'English';
  const getEditionName = (id: string) => {
      const ed = availableEditions.find(e => e.identifier === id);
      return ed ? ed.name : 'Unknown';
  }
  const handleToggleDailyAyat = (enabled: boolean) => {
      setShowDailyAyat(enabled);
      StorageService.setShowAyatOfTheDay(enabled);
  };
  const handleSetMushaf = (id: string) => {
      MushafService.setActiveMushafId(id);
      setActiveMushafId(id);
  };

  // --- BACKUP & RESTORE ---
  const handleBackup = async () => {
      setIsBackupProcessing(true);
      try {
          await BackupService.createBackup();
      } catch (e: any) {
          alert(e.message || "Gagal membuat backup.");
      } finally {
          setIsBackupProcessing(false);
      }
  };

  const handleRestoreClick = () => {
      if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      requestConfirmation(
          "Restore Data?",
          "Proses ini akan menimpa/menggabungkan data Bookmark, Catatan, dan Jurnal Tadabbur Anda dengan data dari file backup. Lanjutkan?",
          "Ya, Restore",
          "primary",
          async () => {
              setIsBackupProcessing(true);
              try {
                  await BackupService.restoreBackup(file);
                  alert("Data berhasil dipulihkan! Aplikasi akan dimuat ulang.");
                  window.location.reload();
              } catch (err: any) {
                  console.error(err);
                  alert("Gagal memulihkan data: " + err.message);
              } finally {
                  setIsBackupProcessing(false);
                  if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
              }
          }
      );
  };

  // ... (Keep existing download handlers) ...

  const handleDownloadMushaf = async (mushaf: MushafEdition) => { 
      if (isDownloadingMushaf) return;
      requestConfirmation(`Unduh Mushaf ${mushaf.name}?`, "Ukuran file sekitar 200MB - 300MB. Pastikan Anda terhubung ke WiFi untuk menghemat kuota data.", "Unduh Sekarang", "primary", async () => {
          setIsDownloadingMushaf(true); setMushafProgress(0); setProcessingId(mushaf.id);
          try { await MushafService.downloadMushaf(mushaf.id, (progress) => { setMushafProgress(progress); }); setMushafDownloads(prev => ({ ...prev, [mushaf.id]: true })); } catch (e: any) { console.error(e); alert(`Gagal mengunduh: ${e.message}`); } finally { setIsDownloadingMushaf(false); setMushafProgress(0); setProcessingId(null); }
      });
  };
  
  const handleDeleteMushaf = async (mushaf: MushafEdition) => {
      requestConfirmation("Hapus Data Mushaf?", `Anda akan menghapus data offline untuk Mushaf ${mushaf.name}.`, "Hapus Data", "danger", async () => {
          await MushafService.deleteMushafData(mushaf.id); setMushafDownloads(prev => ({ ...prev, [mushaf.id]: false }));
      });
  };

  const handleDownloadSurahAudio = async (surah: Surah) => {
      if(isDownloadingAudio) return;
      requestConfirmation("Unduh Audio Surat?", `Anda akan mengunduh audio Surat ${surah.transliteration} oleh ${activeReciter.name}.`, "Mulai Unduh", "primary", async () => {
          setIsDownloadingAudio(true); setCurrentDownloadSurah(surah.id); setAudioProgress(0);
          try { await AudioService.downloadSurahAudio(activeReciter, surah.id, surah.total_verses, (progress) => { setAudioProgress(progress); }); setAudioDownloads(prev => ({...prev, [surah.id]: true})); } catch(e: any) { console.error(e); alert(`Gagal: ${e.message}`); } finally { setIsDownloadingAudio(false); setCurrentDownloadSurah(null); setAudioProgress(0); }
      });
  };
  
  const handleDeleteSurahAudio = async (surahId: number) => {
       requestConfirmation("Hapus Audio?", "Audio surat ini akan dihapus.", "Hapus", "danger", async () => { await AudioService.deleteSurahAudio(activeReciter.id, surahId); setAudioDownloads(prev => ({...prev, [surahId]: false})); });
  };
  
  const handleDownloadAllAudio = async () => { 
      requestConfirmation("Unduh Audio 30 Juz?", `PERINGATAN: Mengunduh seluruh Al-Quran (${activeReciter.name}) membutuhkan ruang penyimpanan sangat besar.`, "Ya, Unduh Semua", "primary", async () => {
          setIsDownloadingAudio(true);
          try { for (const s of surahs) { if (audioDownloads[s.id]) continue; setCurrentDownloadSurah(s.id); setAudioProgress(0); await AudioService.downloadSurahAudio(activeReciter, s.id, s.total_verses, (progress) => { setAudioProgress(progress); }); setAudioDownloads(prev => ({ ...prev, [s.id]: true })); } alert("Unduhan 30 Juz Selesai!"); } catch (e: any) { console.error(e); alert(`Unduhan terhenti: ${e.message}`); } finally { setIsDownloadingAudio(false); setCurrentDownloadSurah(null); setAudioProgress(0); }
      });
  };

  // --- TAJWEED HANDLERS ---
  const handleDownloadTajweed = async () => {
       const edition = TAJWEED_EDITION;
       setProcessingId(edition.identifier);
       setProcessingStatus('Menyiapkan...');
       
       requestConfirmation("Unduh Data Tajwid?", `Ukuran sekitar ${edition.approxSize}. Data ini diperlukan untuk menampilkan fitur Tajwid Berwarna secara offline.`, "Unduh Sekarang", "primary", async () => {
           setProcessingId(edition.identifier); setProcessingStatus('Mengunduh...'); setDownloadProgress(0);
           try {
               await downloadEdition(edition.identifier, (msg, percent) => {
                   setProcessingStatus(msg);
                   setDownloadProgress(percent);
               });
               setDownloadedIds(prev => [...prev, edition.identifier]);
               onToggleTajweed(true); // Auto enable after download
           } catch (e) {
               console.error(e); alert("Gagal mengunduh data Tajwid.");
           } finally {
               setProcessingId(null); setProcessingStatus(''); setDownloadProgress(0);
           }
       });
       setProcessingId(null);
  };

  const handleDeleteTajweed = async () => {
      requestConfirmation("Hapus Data Tajwid?", "Fitur Tajwid Berwarna tidak akan bisa digunakan lagi sampai Anda mengunduhnya kembali.", "Hapus Data", "danger", async () => {
          await DB.deleteDownloadedEdition(TAJWEED_EDITION.identifier);
          setDownloadedIds(prev => prev.filter(id => id !== TAJWEED_EDITION.identifier));
          onToggleTajweed(false);
      });
  };

  const handleSelectOrDownload = async (edition: TranslationOption, type: 'translation' | 'tafsir') => {
      const isFeatureActive = type === 'translation' ? showTranslation : showTafsir;
      const currentId = type === 'translation' ? currentTranslationId : currentTafsirId;
      
      // If same ID and Feature is ACTIVE, do nothing (already selected)
      if (currentId === edition.identifier && isFeatureActive) return;

      const isDownloaded = downloadedIds.includes(edition.identifier);
      
      if (isDownloaded) {
           if(type === 'translation') {
               onTranslationChange(edition.identifier);
               if(!showTranslation) onToggleTranslation(true);
           } else {
               onTafsirChange(edition.identifier);
               if(!showTafsir) onToggleTafsir(true);
           }
           return;
      }

      setProcessingId(edition.identifier);
      setProcessingStatus('Cek koneksi...');
      try {
          const isWorking = await verifyEditionAvailability(edition.identifier);
          if (!isWorking) { alert(`Maaf, edisi "${edition.name}" saat ini tidak dapat diakses dari server.`); setProcessingId(null); return; }

          requestConfirmation(`Unduh ${edition.type === 'tafsir' ? 'Tafsir' : 'Terjemahan'}?`, `Anda akan mengunduh "${edition.name}" untuk penggunaan offline.`, "Unduh & Gunakan", "primary", async () => {
               setProcessingId(edition.identifier); setProcessingStatus('Menyiapkan...'); setDownloadProgress(0);
               try { await downloadEdition(edition.identifier, (msg, percent) => { setProcessingStatus(msg); setDownloadProgress(percent); }); setDownloadedIds(prev => [...prev, edition.identifier]); if(type==='translation') { onTranslationChange(edition.identifier); if(!showTranslation) onToggleTranslation(true); } else { onTafsirChange(edition.identifier); if(!showTafsir) onToggleTafsir(true); } } catch (e) { console.error(e); alert("Gagal mengunduh data."); } finally { setProcessingId(null); setProcessingStatus(''); setDownloadProgress(0); }
          });
          setProcessingId(null);
      } catch (error) { console.error(error); setProcessingId(null); alert("Terjadi kesalahan koneksi."); }
  };

  const renderEditionList = (type: 'translation' | 'tafsir') => {
      // ... (Existing render logic remains same) ...
      const currentId = type === 'translation' ? currentTranslationId : currentTafsirId;
      const isFeatureActive = type === 'translation' ? showTranslation : showTafsir;

      const filtered = availableEditions
        .filter(opt => opt.type === type)
        .filter(opt => opt.name.toLowerCase().includes(searchQuery.toLowerCase()) || opt.language.toLowerCase().includes(searchQuery.toLowerCase()));

      return (
          <div className="space-y-3">
              <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                      type="text" 
                      placeholder={`Cari ${type === 'translation' ? 'Terjemahan' : 'Tafsir'}...`} 
                      value={searchQuery} 
                      onChange={(e) => setSearchQuery(e.target.value)} 
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-quran-gold/50 text-gray-800 dark:text-white placeholder-gray-400 transition-colors" 
                   />
              </div>

              {filtered.map(option => {
                  const isDownloaded = downloadedIds.includes(option.identifier);
                  // UPDATED LOGIC: Only selected if IDs match AND the feature is globally ON
                  const isSelected = isFeatureActive && currentId === option.identifier;
                  const isProcessing = processingId === option.identifier;

                  return (
                    <div key={option.identifier} className={`p-4 rounded-xl border transition-all ${isSelected ? 'border-quran-gold bg-quran-gold/5 dark:bg-quran-gold/10' : 'border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-quran-gold/50'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{option.name}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{option.englishName}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wide">{option.language}</span>
                                    <span className="text-[10px] bg-stone-100 dark:bg-slate-700 text-stone-500 dark:text-gray-400 px-1.5 py-0.5 rounded flex items-center gap-1"><Download className="w-3 h-3" /> {option.approxSize || '? MB'}</span>
                                </div>
                            </div>
                            {isSelected && <div className="bg-quran-gold text-white p-1 rounded-full"><Check className="w-3 h-3" /></div>}
                        </div>

                        {isProcessing ? (
                             <div className="mt-3"><div className="flex justify-between text-xs text-gray-500 mb-1"><span>{processingStatus}</span><span>{downloadProgress}%</span></div><div className="w-full bg-stone-200 rounded-full h-1.5"><div className="bg-quran-gold h-1.5 rounded-full transition-all duration-300" style={{ width: `${downloadProgress}%` }}></div></div></div>
                        ) : (
                            <button onClick={() => handleSelectOrDownload(option, type)} className={`w-full mt-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${isSelected ? 'bg-quran-dark dark:bg-quran-gold text-white dark:text-quran-dark cursor-default' : isDownloaded ? 'border border-quran-dark dark:border-quran-gold text-quran-dark dark:text-quran-gold hover:bg-quran-dark dark:hover:bg-quran-gold hover:text-white dark:hover:text-quran-dark' : 'bg-stone-100 dark:bg-slate-700 text-stone-600 dark:text-gray-300 hover:bg-stone-200 dark:hover:bg-slate-600'}`}>
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

  const isTajweedDownloaded = downloadedIds.includes(TAJWEED_EDITION.identifier);
  const isTajweedProcessing = processingId === TAJWEED_EDITION.identifier;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-slate-900 pb-20 animate-fade-in transition-colors duration-300">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
            {/* ... Other sections remain unchanged as they use generic dark: classes ... */}
            
            {/* Theme Settings */}
            <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-stone-200 dark:border-slate-700 p-5 flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                        {theme === 'dark' ? <Moon className="w-4 h-4 text-quran-gold" /> : <Sun className="w-4 h-4 text-quran-gold" />} 
                        Tema Aplikasi
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{theme === 'dark' ? 'Mode Gelap' : 'Mode Terang'}</p>
                </div>
                <button onClick={toggleTheme} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${theme === 'dark' ? 'bg-quran-gold' : 'bg-gray-300'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </section>

            {/* Language Settings */}
            <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-stone-200 dark:border-slate-700 p-5 flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2"><Globe className="w-4 h-4 text-quran-gold" /> Bahasa Aplikasi</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{getAppLangName()}</p>
                </div>
                <button onClick={() => setIsLangModalOpen(true)} className="px-3 py-1.5 text-xs font-bold bg-stone-100 dark:bg-slate-700 text-stone-600 dark:text-gray-200 rounded-lg hover:bg-stone-200">Ubah</button>
            </section>

            {/* DATA MANAGEMENT (Backup & Restore) - NEW SECTION */}
            <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-stone-200 dark:border-slate-700 p-5">
                <div className="flex items-center gap-2 mb-4">
                    <HardDrive className="w-4 h-4 text-quran-gold" />
                    <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">Manajemen Data</h2>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                    Amankan catatan tadabbur, bookmark, dan pengaturan Anda dengan mengekspor data ke file. Anda dapat memulihkannya nanti jika menghapus cache aplikasi.
                </p>
                <div className="flex gap-3">
                    <button 
                        onClick={handleBackup} 
                        disabled={isBackupProcessing}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-stone-100 dark:bg-slate-700 text-stone-600 dark:text-gray-200 rounded-xl text-xs font-bold hover:bg-stone-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                    >
                        {isBackupProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        Backup Data
                    </button>
                    <button 
                        onClick={handleRestoreClick}
                        disabled={isBackupProcessing}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-quran-gold/10 text-quran-dark dark:text-quran-gold rounded-xl text-xs font-bold hover:bg-quran-gold/20 transition-colors disabled:opacity-50"
                    >
                        <Upload className="w-3 h-3" />
                        Restore Data
                    </button>
                    {/* Hidden Input for Restore */}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        accept="application/json" 
                        onChange={handleFileChange}
                    />
                </div>
            </section>
            
            {/* UI Settings */}
            <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-stone-200 dark:border-slate-700 p-5 space-y-5">
                 <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2"><Sparkles className="w-4 h-4 text-quran-gold" /> Notifikasi Ayat Harian</h2>
                    </div>
                    <button onClick={() => handleToggleDailyAyat(!showDailyAyat)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${showDailyAyat ? 'bg-quran-dark dark:bg-quran-gold' : 'bg-gray-300'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showDailyAyat ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
                <div className="flex items-center justify-between border-t border-stone-100 dark:border-slate-700 pt-5">
                    <div>
                        <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2"><Book className="w-4 h-4 text-quran-gold" /> Terjemahan Perkata</h2>
                    </div>
                    <button onClick={() => onToggleWordByWord(!showWordByWord)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${showWordByWord ? 'bg-quran-dark dark:bg-quran-gold' : 'bg-gray-300'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showWordByWord ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
                 
                 {/* TAJWEED SETTINGS - REDESIGNED */}
                 <div className="border-t border-stone-100 dark:border-slate-700 pt-5">
                     <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2"><Palette className="w-4 h-4 text-quran-gold" /> Tampilan Tajwid (Warna)</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
                                {isTajweedDownloaded 
                                    ? "Data Tajwid telah diunduh. Aktifkan untuk mewarnai ayat." 
                                    : "Unduh data untuk mengaktifkan pewarnaan tajwid secara offline."}
                            </p>
                        </div>
                        
                        {isTajweedProcessing ? (
                             <div className="flex flex-col items-end gap-1 w-32">
                                <span className="text-[10px] text-gray-500">{processingStatus} {downloadProgress}%</span>
                                <div className="w-full bg-stone-200 rounded-full h-1.5"><div className="bg-quran-gold h-1.5 rounded-full transition-all duration-300" style={{ width: `${downloadProgress}%` }}></div></div>
                             </div>
                        ) : isTajweedDownloaded ? (
                             <div className="flex items-center gap-3">
                                 <button 
                                    onClick={handleDeleteTajweed}
                                    className="p-2 text-red-400 hover:text-red-600 bg-red-50 rounded-lg transition-colors"
                                    title="Hapus Data Tajwid"
                                 >
                                     <Trash2 className="w-4 h-4" />
                                 </button>
                                 <button onClick={() => onToggleTajweed(!showTajweed)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${showTajweed ? 'bg-quran-dark dark:bg-quran-gold' : 'bg-gray-300'}`}>
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showTajweed ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                             </div>
                        ) : (
                             <button 
                                onClick={handleDownloadTajweed}
                                className="flex items-center gap-2 px-3 py-2 bg-stone-100 dark:bg-slate-700 text-stone-600 dark:text-gray-200 rounded-lg text-xs font-bold hover:bg-stone-200 dark:hover:bg-slate-600 transition-colors"
                             >
                                 <Download className="w-3 h-3" /> Unduh (1.5 MB)
                             </button>
                        )}
                     </div>
                </div>
            </section>

            {/* Mushaf Settings */}
            <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-stone-200 dark:border-slate-700 overflow-hidden">
                 <div className="p-5 border-b border-stone-100 dark:border-slate-700 flex items-center justify-between bg-stone-50/50 dark:bg-slate-700/50 cursor-pointer" onClick={() => setActiveSection(activeSection === 'mushaf' ? null : 'mushaf')}>
                    <div>
                        <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2"><ImageIcon className="w-4 h-4 text-quran-gold" /> Tampilan Mushaf</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Jenis: {MushafService.getMushafEdition(activeMushafId).name}</p>
                    </div>
                    <div className="flex items-center gap-2">{activeSection === 'mushaf' ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}</div>
                </div>
                {activeSection === 'mushaf' && (
                    <div className="p-5 bg-stone-50/30 dark:bg-slate-900/30 space-y-4">
                        {MUSHAF_EDITIONS.map(mushaf => {
                            const isSelected = activeMushafId === mushaf.id;
                            const isDownloaded = mushafDownloads[mushaf.id];
                            const isProcessing = processingId === mushaf.id;
                            return (
                                <div key={mushaf.id} className={`p-4 rounded-xl border transition-all ${isSelected ? 'border-quran-gold bg-white dark:bg-slate-800 ring-1 ring-quran-gold/20' : 'border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}>
                                    <div className="flex justify-between items-start">
                                        <div><h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm flex items-center gap-2">{mushaf.name} {isSelected && <Check className="w-3 h-3 text-quran-gold" />}</h4><p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{mushaf.description}</p></div>
                                    </div>
                                    {isProcessing ? <div className="mt-4 flex items-center gap-3"><div className="flex-1 bg-stone-200 dark:bg-slate-600 rounded-full h-1.5"><div className="bg-quran-gold h-1.5 rounded-full transition-all duration-300" style={{ width: `${mushafProgress}%` }}></div></div><span className="text-[10px] font-bold text-gray-500">{mushafProgress}%</span></div> : <div className="flex gap-2 mt-4"><button onClick={() => handleSetMushaf(mushaf.id)} disabled={isSelected} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase ${isSelected ? 'bg-quran-gold text-white' : 'bg-stone-100 dark:bg-slate-700 text-stone-600 dark:text-gray-300'}`}>{isSelected ? 'Aktif' : 'Gunakan'}</button>{isDownloaded ? <button onClick={() => handleDeleteMushaf(mushaf)} className="px-3 py-2 border border-red-200 text-red-500 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4" /></button> : <button onClick={() => handleDownloadMushaf(mushaf)} disabled={isDownloadingMushaf} className="px-3 py-2 border border-stone-200 dark:border-slate-600 text-stone-500 dark:text-gray-300 rounded-lg hover:bg-stone-50 dark:hover:bg-slate-700"><Download className="w-4 h-4" /></button>}</div>}
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
            
             {/* Audio Settings */}
             <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-stone-200 dark:border-slate-700 overflow-hidden">
                 <div className="p-5 border-b border-stone-100 dark:border-slate-700 flex items-center justify-between bg-stone-50/50 dark:bg-slate-700/50 cursor-pointer" onClick={() => setActiveSection(activeSection === 'audio' ? null : 'audio')}>
                     <div><h2 className="text-base font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2"><Volume2 className="w-4 h-4 text-quran-gold" /> Audio & Murottal</h2><p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Qari: {activeReciter.name}</p></div>
                    <div className="flex items-center gap-2">{activeSection === 'audio' ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}</div>
                </div>
                {activeSection === 'audio' && (
                    <div className="p-5 bg-stone-50/30 dark:bg-slate-900/30 space-y-6">
                        <div className="space-y-2"><label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pilih Qari</label><div className="relative"><Mic2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-quran-gold" /><select className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-slate-600 text-sm appearance-none bg-white dark:bg-slate-700 dark:text-white" value={activeReciter.id} onChange={(e) => setReciter(e.target.value)}>{RECITERS.map(r => (<option key={r.id} value={r.id}>{r.name}</option>))}</select></div></div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-stone-200 dark:border-slate-700 overflow-hidden"><div className="p-4 bg-stone-100 dark:bg-slate-700 border-b border-stone-200 dark:border-slate-600 flex justify-between items-center"><span className="text-xs font-bold text-gray-600 dark:text-gray-300">Manajer Unduhan</span>
                        <button 
                            onClick={handleDownloadAllAudio} 
                            disabled={isDownloadingAudio} 
                            className="text-[10px] bg-white border border-stone-300 dark:bg-slate-600 dark:border-slate-500 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-lg font-bold hover:bg-stone-50 dark:hover:bg-slate-500 disabled:opacity-50 transition-colors shadow-sm"
                        >
                            Unduh Semua (30 Juz)
                        </button>
                        </div><div className="max-h-80 overflow-y-auto divide-y divide-stone-100 dark:divide-slate-700">{surahs.map(surah => { const isDownloaded = audioDownloads[surah.id]; const isThisSurahDownloading = currentDownloadSurah === surah.id; return (<div key={surah.id} className="p-3 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-slate-700 relative">{isThisSurahDownloading && (<div className="absolute inset-0 bg-quran-gold/5 pointer-events-none"><div className="h-full bg-quran-gold/10 transition-all duration-300" style={{width: `${audioProgress}%`}} /></div>)}<div className="flex items-center gap-3 relative z-10"><div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-slate-600 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-300 border border-stone-200 dark:border-slate-500">{surah.id}</div><div><p className="text-sm font-bold text-gray-800 dark:text-gray-100">{surah.transliteration}</p><p className="text-[10px] text-gray-400">{surah.total_verses} Ayat</p></div></div><div className="flex items-center gap-2 relative z-10">{isThisSurahDownloading ? <div className="flex items-center gap-2 text-xs text-quran-gold font-bold bg-white/80 dark:bg-slate-800/80 px-2 py-1 rounded-full shadow-sm"><Loader2 className="w-3 h-3 animate-spin" /> {audioProgress}%</div> : isDownloaded ? <button onClick={() => handleDeleteSurahAudio(surah.id)} className="p-2 text-green-600 hover:text-red-500"><Trash2 className="w-4 h-4" /></button> : <button onClick={() => handleDownloadSurahAudio(surah)} disabled={isDownloadingAudio} className="p-2 text-gray-400 hover:text-quran-gold"><Download className="w-4 h-4" /></button>}</div></div>); })}</div></div>
                    </div>
                )}
            </section>

            {/* Translation & Tafsir */}
             {['translation', 'tafsir'].map((type) => (
                <section key={type} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-stone-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-5 border-b border-stone-100 dark:border-slate-700 flex items-center justify-between bg-stone-50/50 dark:bg-slate-700/50">
                        <div>
                            <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2"><BookType className="w-4 h-4 text-quran-gold" /> {type === 'translation' ? 'Terjemahan' : 'Tafsir'}</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {type === 'translation' 
                                    ? (showTranslation ? `Aktif: ${getEditionName(currentTranslationId)}` : 'Nonaktif')
                                    : (showTafsir ? `Aktif: ${getEditionName(currentTafsirId)}` : 'Nonaktif')
                                }
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                             <button onClick={() => type === 'translation' ? onToggleTranslation(!showTranslation) : onToggleTafsir(!showTafsir)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${(type === 'translation' ? showTranslation : showTafsir) ? 'bg-quran-dark dark:bg-quran-gold' : 'bg-gray-300'}`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${ (type === 'translation' ? showTranslation : showTafsir) ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                            <button onClick={() => { setActiveSection(activeSection === type ? null : type as any); setSearchQuery(''); }} className="p-1 rounded-full hover:bg-stone-200 dark:hover:bg-slate-700">
                                {activeSection === type ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                            </button>
                        </div>
                    </div>
                    {activeSection === type && <div className="p-5 bg-stone-50/30 dark:bg-slate-900/30">{renderEditionList(type as any)}</div>}
                </section>
            ))}
        </div>

        <LanguageModal isOpen={isLangModalOpen} onClose={() => setIsLangModalOpen(false)} currentAppLang={currentAppLang} onAppLangChange={onAppLangChange} />
        <ConfirmationModal isOpen={confirmState.isOpen} onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))} onConfirm={confirmState.onConfirm} title={confirmState.title} message={confirmState.message} confirmText={confirmState.confirmText} variant={confirmState.variant} />
    </div>
  );
};

export default SettingsPage;
