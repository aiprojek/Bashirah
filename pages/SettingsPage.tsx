
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Globe, BookType, Check, Loader2, Search, AlertCircle, ChevronDown, ChevronUp, Star, Download, Wifi, Book, Volume2, Mic2, Trash2, Image as ImageIcon, Palette, Sparkles, Moon, Sun, Save, Upload, HardDrive, Type } from 'lucide-react';
import { LanguageCode, APP_LANGUAGES, TranslationOption, RECITERS, Surah, MUSHAF_EDITIONS, MushafEdition, TAJWEED_EDITION } from '../types';
import LanguageModal from '../components/LanguageModal';
import ConfirmationModal from '../components/ConfirmationModal'; 
import FontSettingsModal from '../components/FontSettingsModal';
import * as DB from '../services/db';
import * as AudioService from '../services/audioService';
import * as MushafService from '../services/mushafService';
import * as StorageService from '../services/storageService';
import * as BackupService from '../services/backupService';
import { downloadEdition, verifyEditionAvailability, getAllSurahs, showToast } from '../services/quranService';
import { downloadAyahMorphologyPack, downloadSurahInfoPack, downloadWordMorphologyPack } from '../services/qulService';
import { useAudio } from '../contexts/AudioContext';
import { useTheme } from '../contexts/ThemeContext'; 
import { useLanguage } from '../contexts/LanguageContext';
import { ArabicFontId, DEFAULT_ARABIC_FONT_ID, getArabicFontOption } from '../constants/quranFonts';

interface SettingsPageProps {
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
  const { language, setLanguage, t } = useLanguage();
  
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
  const [defaultMushafMode, setDefaultMushafMode] = useState<'text' | 'image'>('text');
  const [showDailyAyat, setShowDailyAyat] = useState(true);
  const [activeTab, setActiveTab] = useState<'quick' | 'offline' | 'audio' | 'mushaf' | 'reading' | 'data'>('quick');
  const [showFontSettings, setShowFontSettings] = useState(false);
  const [arabicFontSize, setArabicFontSize] = useState(30);
  const [translationFontSize, setTranslationFontSize] = useState(16);
  const [arabicFontFamily, setArabicFontFamily] = useState<ArabicFontId>(DEFAULT_ARABIC_FONT_ID);
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

  const [pendingTasks, setPendingTasks] = useState<any[]>([]);
  const [isResumingTaskId, setIsResumingTaskId] = useState<string | null>(null);

  // Backup & Restore State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isBackupProcessing, setIsBackupProcessing] = useState(false);
  const [isProcessingMorphologyPack, setIsProcessingMorphologyPack] = useState(false);
  const [isProcessingQulSurahPack, setIsProcessingQulSurahPack] = useState(false);
  const [morphologyPackMeta, setMorphologyPackMeta] = useState<{ count: number; ayahCount?: number; source: string } | null>(null);
  const [qulSurahPackMeta, setQulSurahPackMeta] = useState<{ count: number; source: string } | null>(null);

  const requestConfirmation = (title: string, message: string, confirmText: string, variant: 'primary' | 'danger', action: () => void) => {
      setConfirmState({ isOpen: true, title, message, confirmText, variant, onConfirm: action });
  };

  const refreshPendingTasks = async () => {
      const tasks = await DB.getAllDownloadTasks();
      setPendingTasks(
          tasks
            .filter((task: any) => task.status !== 'completed')
            .sort((a: any, b: any) => (b.updatedAt || 0) - (a.updatedAt || 0))
      );
  };

  useEffect(() => {
    const checkDownloads = async () => {
        const downloads = await DB.getDownloadedEditions();
        setDownloadedIds(downloads.map(d => d.identifier));
    };
    checkDownloads();
    getAllSurahs(language).then(setSurahs);
    setActiveMushafId(MushafService.getActiveMushafId());
    StorageService.getDefaultMushafMode().then(setDefaultMushafMode);
    const checkMushafStatus = async () => {
        const status: Record<string, boolean> = {};
        for (const m of MUSHAF_EDITIONS) {
            status[m.id] = await MushafService.isMushafDownloaded(m.id);
        }
        setMushafDownloads(status);
    };
    checkMushafStatus();
    const fetchInitialSettings = async () => {
        setShowDailyAyat(await StorageService.getShowAyatOfTheDay());
        const [savedArabicSize, savedTranslationSize, savedArabicFamily] = await Promise.all([
          StorageService.getArabicFontSize(),
          StorageService.getTranslationFontSize(),
          StorageService.getArabicFontFamily(),
        ]);
        setArabicFontSize(savedArabicSize);
        setTranslationFontSize(savedTranslationSize);
        setArabicFontFamily(savedArabicFamily);
        StorageService.applyArabicFontFamily(savedArabicFamily);
        const savedMorphMeta = await DB.getSetting('qul_morphology_pack_meta');
        const savedSurahPackMeta = await DB.getSetting(`qul_surah_info_pack_meta_${language}`);
        const morphologyCount = await DB.countWordMorphologyEntries();
        const ayahMorphologyCount = await DB.countAyahMorphologyEntries();
        setMorphologyPackMeta(
          savedMorphMeta || (morphologyCount > 0 || ayahMorphologyCount > 0 ? { count: morphologyCount, ayahCount: ayahMorphologyCount, source: 'Imported' } : null)
        );
        setQulSurahPackMeta(savedSurahPackMeta || null);
        await refreshPendingTasks();
    };
    fetchInitialSettings();
  }, [language]);

  useEffect(() => {
      const timer = window.setInterval(() => {
          refreshPendingTasks().catch(() => {});
      }, 3000);
      return () => window.clearInterval(timer);
  }, []);

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

  const getAppLangName = () => APP_LANGUAGES.find(l => l.code === language)?.nativeName || 'English';
  const getEditionName = (id: string) => {
      const ed = availableEditions.find(e => e.identifier === id);
      return ed ? ed.name : 'Unknown';
  }
  const handleToggleDailyAyat = async (enabled: boolean) => {
      setShowDailyAyat(enabled);
      await StorageService.setShowAyatOfTheDay(enabled);
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
          showToast(e.message || "Gagal membuat backup.", "error");
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
          t('settings_restore_confirm_title'),
          t('settings_restore_confirm_desc'),
          t('settings_restore'),
          "primary",
          async () => {
              setIsBackupProcessing(true);
              try {
                  await BackupService.restoreBackup(file);
                  showToast(t('settings_restore_success'), "success");
                  setTimeout(() => window.location.reload(), 1500);
              } catch (err: any) {
                  console.error(err);
                  showToast(`${t('error')}: ${err.message}`, "error");
              } finally {
                  setIsBackupProcessing(false);
                  if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
              }
          }
      );
  };

  const handleDownloadMorphologyPack = async () => {
      setIsProcessingMorphologyPack(true);
      try {
          const [count, ayahCount] = await Promise.all([
            downloadWordMorphologyPack(),
            downloadAyahMorphologyPack(),
          ]);
          const meta = { count, ayahCount, source: 'Local pack' };
          await DB.setSetting('qul_morphology_pack_meta', meta);
          setMorphologyPackMeta(meta);
          showToast(`Pack morphology berhasil dimuat (${count} kata, ${ayahCount} ayat).`, 'success');
      } catch (e: any) {
          console.error(e);
          showToast(e.message || 'Gagal memuat pack morphology.', 'error');
      } finally {
          setIsProcessingMorphologyPack(false);
      }
  };

  const handleDownloadQulSurahPack = async () => {
      setIsProcessingQulSurahPack(true);
      try {
          const count = await downloadSurahInfoPack(language);
          const meta = { count, source: `Local pack (${language})` };
          await DB.setSetting(`qul_surah_info_pack_meta_${language}`, meta);
          setQulSurahPackMeta(meta);
          showToast(`Pack info surat QUL ${getAppLangName()} berhasil dimuat (${count} surat).`, 'success');
      } catch (e: any) {
          console.error(e);
          showToast(e.message || 'Gagal memuat pack info surat QUL.', 'error');
      } finally {
          setIsProcessingQulSurahPack(false);
      }
  };


  // ... (Keep existing download handlers) ...

  const handleDownloadMushaf = async (mushaf: MushafEdition) => { 
      if (isDownloadingMushaf) return;
      requestConfirmation(t('settings_mushaf_download_title'), t('settings_mushaf_download_desc'), t('btn_download'), "primary", async () => {
          setIsDownloadingMushaf(true); setMushafProgress(0); setProcessingId(mushaf.id);
          try { await MushafService.downloadMushaf(mushaf.id, (progress) => { setMushafProgress(progress); }); setMushafDownloads(prev => ({ ...prev, [mushaf.id]: true })); } catch (e: any) { console.error(e); showToast(`Gagal mengunduh: ${e.message}`, "error"); } finally { setIsDownloadingMushaf(false); setMushafProgress(0); setProcessingId(null); await refreshPendingTasks(); }
      });
  };
  
  const handleDeleteMushaf = async (mushaf: MushafEdition) => {
      requestConfirmation(t('settings_mushaf_delete_title'), t('settings_mushaf_delete_desc'), t('btn_delete'), "danger", async () => {
          await MushafService.deleteMushafData(mushaf.id); setMushafDownloads(prev => ({ ...prev, [mushaf.id]: false })); await refreshPendingTasks();
      });
  };

  const handleDownloadSurahAudio = async (surah: Surah) => {
      if(isDownloadingAudio) return;
      requestConfirmation(t('settings_audio_download_title'), t('settings_audio_download_desc'), t('btn_download'), "primary", async () => {
          setIsDownloadingAudio(true); setCurrentDownloadSurah(surah.id); setAudioProgress(0);
          try { await AudioService.downloadSurahAudio(activeReciter, surah.id, surah.total_verses, (progress) => { setAudioProgress(progress); }); setAudioDownloads(prev => ({...prev, [surah.id]: true})); } catch(e: any) { console.error(e); showToast(`Gagal: ${e.message}`, "error"); } finally { setIsDownloadingAudio(false); setCurrentDownloadSurah(null); setAudioProgress(0); await refreshPendingTasks(); }
      });
  };
  
  const handleDeleteSurahAudio = async (surahId: number) => {
       requestConfirmation(t('settings_audio_delete_title'), t('settings_audio_delete_desc'), t('btn_delete'), "danger", async () => { await AudioService.deleteSurahAudio(activeReciter.id, surahId); setAudioDownloads(prev => ({...prev, [surahId]: false})); await refreshPendingTasks(); });
  };
  
  const handleDownloadAllAudio = async () => { 
      requestConfirmation(t('settings_audio_download_all_title'), t('settings_audio_download_all_desc'), t('download_all'), "primary", async () => {
          setIsDownloadingAudio(true);
          try { for (const s of surahs) { if (audioDownloads[s.id]) continue; setCurrentDownloadSurah(s.id); setAudioProgress(0); await AudioService.downloadSurahAudio(activeReciter, s.id, s.total_verses, (progress) => { setAudioProgress(progress); }); setAudioDownloads(prev => ({ ...prev, [s.id]: true })); } showToast(t('success'), "success"); } catch (e: any) { console.error(e); showToast(`Unduhan terhenti: ${e.message}`, "error"); } finally { setIsDownloadingAudio(false); setCurrentDownloadSurah(null); setAudioProgress(0); }
      });
  };

  const handleResumeTask = async (task: any) => {
      if (isDownloadingAudio || isDownloadingMushaf || isResumingTaskId) return;
      setIsResumingTaskId(task.id);
      try {
          if (task.type === 'mushaf') {
              setIsDownloadingMushaf(true);
              setProcessingId(task.targetId);
              setMushafProgress(task.progress || 0);
              await MushafService.downloadMushaf(task.targetId, (progress) => setMushafProgress(progress));
              setMushafDownloads(prev => ({ ...prev, [task.targetId]: true }));
              showToast("Unduhan mushaf dilanjutkan.", "success");
          } else if (task.type === 'audio') {
              const [reciterId, surahIdRaw] = (task.targetId || '').split(':');
              const surahId = parseInt(surahIdRaw || '0');
              const reciter = RECITERS.find(r => r.id === reciterId);
              const surah = surahs.find(s => s.id === surahId);
              if (!reciter || !surah) throw new Error("Data tugas audio tidak valid.");

              setIsDownloadingAudio(true);
              setCurrentDownloadSurah(surahId);
              setAudioProgress(task.progress || 0);
              await AudioService.downloadSurahAudio(reciter, surahId, surah.total_verses, (progress) => setAudioProgress(progress));
              if (activeReciter.id === reciter.id) {
                  setAudioDownloads(prev => ({ ...prev, [surahId]: true }));
              }
              showToast("Unduhan audio dilanjutkan.", "success");
          }
      } catch (e: any) {
          showToast(`Gagal melanjutkan: ${e.message || e}`, "error");
      } finally {
          setIsResumingTaskId(null);
          setIsDownloadingMushaf(false);
          setProcessingId(null);
          setMushafProgress(0);
          setIsDownloadingAudio(false);
          setCurrentDownloadSurah(null);
          setAudioProgress(0);
          await refreshPendingTasks();
      }
  };

  const offlineReadiness = useMemo(() => {
      const translationCount = downloadedIds.filter(id => availableEditions.some(e => e.identifier === id && e.type === 'translation')).length;
      const tafsirCount = downloadedIds.filter(id => availableEditions.some(e => e.identifier === id && e.type === 'tafsir')).length;
      const mushafCount = Object.values(mushafDownloads).filter(Boolean).length;
      const audioCount = Object.values(audioDownloads).filter(Boolean).length;
      return [
          { label: 'Terjemahan', value: `${translationCount} siap offline`, ok: translationCount > 0 },
          { label: 'Tafsir', value: `${tafsirCount} siap offline`, ok: tafsirCount > 0 },
          { label: 'Tajweed', value: downloadedIds.includes(TAJWEED_EDITION.identifier) ? 'Siap offline' : 'Belum diunduh', ok: downloadedIds.includes(TAJWEED_EDITION.identifier) },
          { label: 'Mushaf', value: `${mushafCount}/${MUSHAF_EDITIONS.length} jenis siap`, ok: mushafCount > 0 },
          { label: 'Audio (Qari aktif)', value: `${audioCount}/${surahs.length || 114} surat`, ok: audioCount > 0 },
          { label: 'Info Surat & Asbabun Nuzul', value: qulSurahPackMeta ? `${qulSurahPackMeta.count} surat (${getAppLangName()})` : 'Belum ada pack', ok: !!qulSurahPackMeta },
          { label: 'Word-by-word', value: 'On-demand via cache', ok: true },
          { label: 'QUL Morphology', value: morphologyPackMeta ? `${morphologyPackMeta.count} kata${morphologyPackMeta.ayahCount ? ` • ${morphologyPackMeta.ayahCount} ayat` : ''}` : 'Belum ada pack', ok: !!morphologyPackMeta },
          { label: 'QUL Info Surat', value: qulSurahPackMeta ? `${qulSurahPackMeta.count} surat (${getAppLangName()})` : 'Belum ada pack', ok: !!qulSurahPackMeta }
      ];
  }, [downloadedIds, availableEditions, mushafDownloads, audioDownloads, surahs.length, morphologyPackMeta, qulSurahPackMeta, language]);

  // --- TAJWEED HANDLERS ---
  const handleDownloadTajweed = async () => {
       const edition = TAJWEED_EDITION;
       setProcessingId(edition.identifier);
       setProcessingStatus(t('loading'));
       
       requestConfirmation(t('settings_tajweed_download_title'), t('settings_tajweed_download_desc'), t('btn_download'), "primary", async () => {
           setProcessingId(edition.identifier); setProcessingStatus(t('loading')); setDownloadProgress(0);
           try {
               await downloadEdition(edition.identifier, (msg, percent) => {
                   setProcessingStatus(msg);
                   setDownloadProgress(percent);
               });
               setDownloadedIds(prev => [...prev, edition.identifier]);
               onToggleTajweed(true); // Auto enable after download
           } catch (e) {
               console.error(e); showToast(t('error'), "error");
           } finally {
               setProcessingId(null); setProcessingStatus(''); setDownloadProgress(0);
           }
       });
       setProcessingId(null);
  };

  const handleDeleteTajweed = async () => {
      requestConfirmation(t('settings_tajweed_delete_title'), t('settings_tajweed_delete_desc'), t('btn_delete'), "danger", async () => {
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
      setProcessingStatus('...');
      try {
          const isWorking = await verifyEditionAvailability(edition.identifier);
          if (!isWorking) { showToast(t('settings_data_unavailable'), "error"); setProcessingId(null); return; }

          requestConfirmation(t('settings_data_download_title'), t('settings_data_download_desc'), t('btn_use'), "primary", async () => {
               setProcessingId(edition.identifier); setProcessingStatus(t('loading')); setDownloadProgress(0);
               try { await downloadEdition(edition.identifier, (msg, percent) => { setProcessingStatus(msg); setDownloadProgress(percent); }); setDownloadedIds(prev => [...prev, edition.identifier]); if(type==='translation') { onTranslationChange(edition.identifier); if(!showTranslation) onToggleTranslation(true); } else { onTafsirChange(edition.identifier); if(!showTafsir) onToggleTafsir(true); } } catch (e) { console.error(e); showToast(t('error'), 'error'); } finally { setProcessingId(null); setProcessingStatus(''); setDownloadProgress(0); }
          });
          setProcessingId(null);
      } catch (error) { console.error(error); setProcessingId(null); showToast(t('error'), "error"); }
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
                      placeholder={t('search_placeholder')}
                      value={searchQuery} 
                      onChange={(e) => setSearchQuery(e.target.value)} 
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-quran-gold/50 text-gray-800 dark:text-white placeholder-gray-400 transition-colors" 
                   />
              </div>

              {filtered.map(option => {
                  const isDownloaded = downloadedIds.includes(option.identifier);
                  const isSelected = isFeatureActive && currentId === option.identifier;
                  const isProcessing = processingId === option.identifier;
                  const actionLabel = isSelected ? t('btn_active') : isDownloaded ? t('btn_use') : t('btn_download');

                  return (
                    <div key={option.identifier} className={`rounded-2xl border transition-all ${isSelected ? 'border-quran-gold bg-quran-gold/5 dark:bg-quran-gold/10' : 'border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}>
                        <div className="p-4 flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-gray-800 dark:text-gray-100 text-sm leading-snug">{option.name}</h4>
                                    {isSelected && <span className="rounded-full bg-quran-gold px-2 py-0.5 text-[10px] font-bold text-white">Aktif</span>}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{option.englishName}</p>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                    <span className="rounded-full bg-stone-100 dark:bg-slate-700 px-2 py-1 text-[10px] uppercase font-bold tracking-wide text-gray-500 dark:text-gray-300">{option.language}</span>
                                    <span className="rounded-full bg-stone-100 dark:bg-slate-700 px-2 py-1 text-[10px] font-bold text-gray-500 dark:text-gray-300">{option.approxSize || '? MB'}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleSelectOrDownload(option, type)}
                                disabled={isProcessing || isSelected}
                                className={`shrink-0 min-h-10 px-3 py-2 rounded-xl text-[11px] font-bold transition-all ${
                                  isSelected
                                    ? 'bg-quran-dark dark:bg-quran-gold text-white dark:text-quran-dark opacity-90'
                                    : isDownloaded
                                      ? 'border border-quran-dark dark:border-quran-gold text-quran-dark dark:text-quran-gold bg-white dark:bg-slate-800'
                                      : 'bg-stone-100 dark:bg-slate-700 text-stone-600 dark:text-gray-200'
                                } ${isProcessing ? 'opacity-60' : ''}`}
                            >
                                {actionLabel}
                            </button>
                        </div>

                        {isProcessing && (
                          <div className="px-4 pb-4">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>{processingStatus}</span>
                              <span>{downloadProgress}%</span>
                            </div>
                            <div className="w-full bg-stone-200 dark:bg-slate-700 rounded-full h-1.5">
                              <div className="bg-quran-gold h-1.5 rounded-full transition-all duration-300" style={{ width: `${downloadProgress}%` }} />
                            </div>
                          </div>
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
  const offlineReadyCount = offlineReadiness.filter((item) => item.ok).length;
  const offlineTotalCount = offlineReadiness.length;
  const downloadedAudioCount = Object.values(audioDownloads).filter(Boolean).length;
  const downloadedMushafCount = Object.values(mushafDownloads).filter(Boolean).length;
  const settingsTabs = [
    { id: 'quick', label: 'Cepat' },
    { id: 'offline', label: 'Offline' },
    { id: 'audio', label: 'Audio' },
    { id: 'mushaf', label: 'Mushaf' },
    { id: 'reading', label: 'Bacaan' },
    { id: 'data', label: 'Data' },
  ] as const;

  const renderSettingSectionHeader = (
    icon: React.ReactNode,
    title: string,
    subtitle: string,
    statusLabel: string,
    expanded: boolean,
    onToggle: () => void,
    extras?: React.ReactNode
  ) => (
    <div
      className="p-4 sm:p-5 border-b border-stone-100 dark:border-slate-700 bg-stone-50/50 dark:bg-slate-700/50 cursor-pointer"
      onClick={onToggle}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            {icon} {title}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-600 px-2.5 py-1">
            <span className="h-2 w-2 rounded-full bg-quran-gold" />
            <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300">{statusLabel}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {extras}
          {expanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
        </div>
      </div>
    </div>
  );

  const renderOfflineCenter = () => (
    <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-stone-200 dark:border-slate-700 overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-slate-700 bg-stone-50/50 dark:bg-slate-700/50">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-100">
              <Wifi className="w-4 h-4 text-quran-gold" />
              Offline Center
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {offlineReadyCount} dari {offlineTotalCount} komponen siap dipakai tanpa internet.
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-quran-gold/10 px-3 py-1 text-[11px] font-bold text-quran-dark dark:text-quran-gold">
            {Math.round((offlineReadyCount / offlineTotalCount) * 100)}%
          </span>
        </div>
        <div className="mt-3 h-2 rounded-full bg-stone-200 dark:bg-slate-700 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-quran-gold to-emerald-400 transition-all duration-500"
            style={{ width: `${(offlineReadyCount / offlineTotalCount) * 100}%` }}
          />
        </div>
      </div>
      <div className="p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-4 gap-2 bg-stone-50/30 dark:bg-slate-900/30">
        {offlineReadiness.slice(0, 8).map((item) => (
          <div key={item.label} className="rounded-2xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-bold text-gray-700 dark:text-gray-200 leading-tight">{item.label}</p>
              <span className={`h-2.5 w-2.5 rounded-full ${item.ok ? 'bg-emerald-500' : 'bg-amber-400'}`} />
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-gray-500 dark:text-gray-400">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-slate-900 pb-20 animate-fade-in transition-colors duration-300">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-4 sm:space-y-6">
            <section className="rounded-[28px] border border-stone-200 dark:border-slate-700 bg-gradient-to-br from-white via-stone-50 to-quran-gold/10 dark:from-slate-800 dark:via-slate-800 dark:to-quran-gold/10 shadow-sm overflow-hidden">
                <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.25em] font-black text-quran-gold">Pengaturan</p>
                            <h1 className="mt-2 text-xl sm:text-2xl font-bold text-quran-dark dark:text-white">Bashirah</h1>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-lg">
                                Atur tampilan, audio, bacaan, dan data offline agar pengalaman menggunakan Bashirah tetap nyaman di berbagai perangkat.
                            </p>
                        </div>
                        <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 dark:bg-slate-700/70 text-quran-gold shadow-sm">
                            <Sparkles className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </section>

            <div className="sticky top-0 z-10 bg-stone-50/95 dark:bg-slate-900/95 backdrop-blur-sm py-2 mb-1 -mx-3 px-3 sm:-mx-4 sm:px-4 border-b border-stone-200/50 dark:border-slate-700/50 transition-colors">
                <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1 snap-x justify-start sm:justify-center">
                    {settingsTabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-shrink-0 px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 border snap-start whitespace-nowrap active:scale-[0.98] ${
                                    isActive
                                        ? 'bg-quran-dark dark:bg-quran-gold text-white dark:text-quran-dark shadow-md border-quran-dark dark:border-quran-gold'
                                        : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:bg-stone-50 dark:hover:bg-slate-700 hover:text-quran-dark dark:hover:text-white border-stone-200 dark:border-slate-700'
                                }`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {activeTab === 'quick' && (
            <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-stone-200 dark:border-slate-700 overflow-hidden">
                <div className="px-4 sm:px-5 py-4 border-b border-stone-100 dark:border-slate-700 bg-stone-50/50 dark:bg-slate-700/50">
                    <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">Pengaturan Cepat</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Hal-hal yang paling sering diubah saat membaca.</p>
                </div>
                <div className="divide-y divide-stone-100 dark:divide-slate-700">
                    <div className="px-4 sm:px-5 py-4 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                <Globe className="w-4 h-4 text-quran-gold" /> {t('settings_lang')}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{getAppLangName()}</p>
                        </div>
                        <button onClick={() => setIsLangModalOpen(true)} className="shrink-0 px-3 py-2 text-xs font-bold bg-stone-100 dark:bg-slate-700 text-stone-600 dark:text-gray-200 rounded-lg hover:bg-stone-200 min-h-10">
                            {t('btn_change')}
                        </button>
                    </div>
                    <div className="px-4 sm:px-5 py-4 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                {theme === 'dark' ? <Moon className="w-4 h-4 text-quran-gold" /> : <Sun className="w-4 h-4 text-quran-gold" />} 
                                {t('settings_theme')}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{theme === 'dark' ? t('settings_theme_dark') : t('settings_theme_light')}</p>
                        </div>
                        <button onClick={toggleTheme} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${theme === 'dark' ? 'bg-quran-gold' : 'bg-gray-300'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                    <div className="px-4 sm:px-5 py-4 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                <Type className="w-4 h-4 text-quran-gold" /> Tampilan Ayat
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {getArabicFontOption(arabicFontFamily).label} • Arab {arabicFontSize}px • Terjemahan {translationFontSize}px
                            </p>
                        </div>
                        <button onClick={() => setShowFontSettings(true)} className="shrink-0 px-3 py-2 text-xs font-bold bg-stone-100 dark:bg-slate-700 text-stone-600 dark:text-gray-200 rounded-lg hover:bg-stone-200 min-h-10">
                            Atur
                        </button>
                    </div>
                    <div className="px-4 sm:px-5 py-4 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-quran-gold" /> {t('settings_daily_notif')}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tampilkan ayat pilihan harian di beranda.</p>
                        </div>
                        <button onClick={() => handleToggleDailyAyat(!showDailyAyat)} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${showDailyAyat ? 'bg-quran-dark dark:bg-quran-gold' : 'bg-gray-300'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showDailyAyat ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                    <div className="px-4 sm:px-5 py-4 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                <Book className="w-4 h-4 text-quran-gold" /> {t('settings_wbw')}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tampilkan arti kata per kata saat dibutuhkan.</p>
                        </div>
                        <button onClick={() => onToggleWordByWord(!showWordByWord)} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${showWordByWord ? 'bg-quran-dark dark:bg-quran-gold' : 'bg-gray-300'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showWordByWord ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                    <div className="px-4 sm:px-5 py-4 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                <Palette className="w-4 h-4 text-quran-gold" /> {t('settings_tajweed')}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {isTajweedDownloaded ? 'Warna tajwid siap dipakai saat membaca.' : t('settings_tajweed_desc')}
                            </p>
                        </div>
                        {isTajweedProcessing ? (
                             <div className="flex flex-col items-end gap-1 w-28 shrink-0">
                                <span className="text-[10px] text-gray-500">{downloadProgress}%</span>
                                <div className="w-full bg-stone-200 rounded-full h-1.5"><div className="bg-quran-gold h-1.5 rounded-full transition-all duration-300" style={{ width: `${downloadProgress}%` }}></div></div>
                             </div>
                        ) : isTajweedDownloaded ? (
                             <div className="flex items-center gap-3 shrink-0">
                                 <button 
                                    onClick={handleDeleteTajweed}
                                    className="p-2 text-red-400 hover:text-red-600 bg-red-50 rounded-lg transition-colors"
                                    title={t('btn_delete')}
                                 >
                                     <Trash2 className="w-4 h-4" />
                                 </button>
                                <button onClick={() => onToggleTajweed(!showTajweed)} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${showTajweed ? 'bg-quran-dark dark:bg-quran-gold' : 'bg-gray-300'}`}>
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showTajweed ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                             </div>
                        ) : (
                             <button 
                                onClick={handleDownloadTajweed}
                                className="shrink-0 flex items-center gap-2 px-3 py-2.5 bg-stone-100 dark:bg-slate-700 text-stone-600 dark:text-gray-200 rounded-lg text-xs font-bold hover:bg-stone-200 dark:hover:bg-slate-600 transition-colors min-h-10"
                             >
                                 <Download className="w-3 h-3" /> Unduh
                             </button>
                        )}
                    </div>
                </div>
            </section>
            )}

            {activeTab === 'data' && (
            <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-stone-200 dark:border-slate-700 overflow-hidden">
                <div className="px-4 sm:px-5 py-4 border-b border-stone-100 dark:border-slate-700 bg-stone-50/50 dark:bg-slate-700/50">
                    <div className="flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-quran-gold" />
                        <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">{t('settings_data')}</h2>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Simpan cadangan data penting agar catatan, bookmark, dan pengaturan tetap aman.
                    </p>
                </div>
                <div className="p-4 sm:p-5 space-y-3 bg-stone-50/30 dark:bg-slate-900/30">
                    <div className="rounded-2xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">Cadangkan Data</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Buat file cadangan untuk disimpan di perangkat Anda.
                                </p>
                            </div>
                            <button 
                                onClick={handleBackup} 
                                disabled={isBackupProcessing}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-stone-100 dark:bg-slate-700 text-stone-600 dark:text-gray-200 rounded-2xl text-xs font-bold hover:bg-stone-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 min-h-11 w-full sm:w-auto"
                            >
                                {isBackupProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                {t('settings_backup')}
                            </button>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">Pulihkan Data</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Gunakan file cadangan untuk mengembalikan data sebelumnya.
                                </p>
                            </div>
                            <button 
                                onClick={handleRestoreClick}
                                disabled={isBackupProcessing}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-quran-gold/10 text-quran-dark dark:text-quran-gold rounded-2xl text-xs font-bold hover:bg-quran-gold/20 transition-colors disabled:opacity-50 min-h-11 w-full sm:w-auto"
                            >
                                <Upload className="w-3 h-3" />
                                {t('settings_restore')}
                            </button>
                        </div>
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        accept="application/json" 
                        onChange={handleFileChange}
                    />
                </div>
            </section>
            )}

            {activeTab === 'offline' && renderOfflineCenter()}

            {activeTab === 'mushaf' && (
            <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-stone-200 dark:border-slate-700 overflow-hidden">
                {renderSettingSectionHeader(
                  <ImageIcon className="w-4 h-4 text-quran-gold" />,
                  t('settings_mushaf'),
                  `Mode aktif: ${MushafService.getMushafEdition(activeMushafId).name}`,
                  `${downloadedMushafCount}/${MUSHAF_EDITIONS.length} jenis siap`,
                  activeSection === 'mushaf',
                  () => setActiveSection(activeSection === 'mushaf' ? null : 'mushaf')
                )}
                {activeSection === 'mushaf' && (
                    <div className="p-4 sm:p-5 bg-stone-50/30 dark:bg-slate-900/30 space-y-4">
                        <div className="p-4 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                            <div className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Default Mode Mushaf</div>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <button
                                    onClick={async () => { setDefaultMushafMode('text'); await StorageService.setDefaultMushafMode('text'); }}
                                    className={`flex-1 px-4 py-2.5 rounded-lg text-xs font-bold border transition-all ${
                                        defaultMushafMode === 'text'
                                            ? 'bg-quran-dark text-white border-quran-dark'
                                            : 'bg-white dark:bg-slate-800 border-stone-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:bg-stone-100 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    Mushaf Teks (Offline)
                                </button>
                                <button
                                    onClick={async () => { setDefaultMushafMode('image'); await StorageService.setDefaultMushafMode('image'); }}
                                    className={`flex-1 px-4 py-2.5 rounded-lg text-xs font-bold border transition-all ${
                                        defaultMushafMode === 'image'
                                            ? 'bg-quran-dark text-white border-quran-dark'
                                            : 'bg-white dark:bg-slate-800 border-stone-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:bg-stone-100 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    Mushaf Gambar (Perlu Unduh)
                                </button>
                            </div>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2">
                                Mushaf gambar membutuhkan data mushaf yang diunduh terlebih dahulu.
                            </p>
                        </div>
                        {MUSHAF_EDITIONS.map(mushaf => {
                            const isSelected = activeMushafId === mushaf.id;
                            const isDownloaded = mushafDownloads[mushaf.id];
                            const isProcessing = processingId === mushaf.id;
                            return (
                                <div key={mushaf.id} className={`p-4 rounded-2xl border transition-all ${isSelected ? 'border-quran-gold bg-white dark:bg-slate-800 ring-1 ring-quran-gold/20' : 'border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm">{mushaf.name}</h4>
                                                {isSelected && <span className="rounded-full bg-quran-gold px-2 py-0.5 text-[10px] font-bold text-white">Aktif</span>}
                                                {isDownloaded && !isSelected && <span className="rounded-full bg-emerald-100 dark:bg-emerald-800/40 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">Tersimpan</span>}
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{mushaf.description}</p>
                                        </div>
                                        {!isProcessing && (
                                            isDownloaded ? (
                                                <button onClick={() => handleDeleteMushaf(mushaf)} className="shrink-0 p-2.5 border border-red-200 text-red-500 rounded-xl hover:bg-red-50 min-h-10">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <button onClick={() => handleDownloadMushaf(mushaf)} disabled={isDownloadingMushaf} className="shrink-0 p-2.5 border border-stone-200 dark:border-slate-600 text-stone-500 dark:text-gray-300 rounded-xl hover:bg-stone-50 dark:hover:bg-slate-700 min-h-10">
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            )
                                        )}
                                    </div>
                                    {isProcessing ? (
                                        <div className="mt-4 flex items-center gap-3">
                                            <div className="flex-1 bg-stone-200 dark:bg-slate-600 rounded-full h-1.5"><div className="bg-quran-gold h-1.5 rounded-full transition-all duration-300" style={{ width: `${mushafProgress}%` }}></div></div>
                                            <span className="text-xs font-bold text-gray-500">{mushafProgress}%</span>
                                        </div>
                                    ) : (
                                        <div className="mt-4">
                                            <button onClick={() => handleSetMushaf(mushaf.id)} disabled={isSelected} className={`w-full py-3 rounded-xl text-xs font-bold uppercase min-h-10 ${isSelected ? 'bg-quran-gold text-white' : 'bg-stone-100 dark:bg-slate-700 text-stone-600 dark:text-gray-300'}`}>
                                                {isSelected ? t('btn_active') : t('btn_use')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
            )}
            
            {activeTab === 'offline' && (
            <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-stone-200 dark:border-slate-700 overflow-hidden">
                 <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-slate-700 bg-stone-50/50 dark:bg-slate-700/50">
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                             <Sparkles className="w-4 h-4 text-quran-gold" />
                             Aset Offline Tambahan
                        </h2>
                        <span className="rounded-full bg-quran-gold/10 px-2.5 py-1 text-[10px] font-bold text-quran-dark dark:text-quran-gold">
                            Direkomendasikan
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Tambahkan info surat dan analisis kata agar fitur bacaan offline terasa lebih lengkap.
                    </p>
                 </div>
                 <div className="p-4 sm:p-5 space-y-4 bg-stone-50/30 dark:bg-slate-900/30">
                    <div className="rounded-2xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div>
                                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">Analisis Kata Quran</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md">
                                    Membantu memahami kata dan susunan ayat saat kamu mengetuk kata Arab, termasuk bentuk dasar dan keterkaitannya dalam ayat.
                                </p>
                                <p className="text-[11px] text-gray-400 mt-2">
                                    {morphologyPackMeta ? `Siap digunakan untuk ${morphologyPackMeta.count.toLocaleString('id-ID')} kata${morphologyPackMeta.ayahCount ? ` dan ${morphologyPackMeta.ayahCount.toLocaleString('id-ID')} ayat` : ''}.` : 'Belum diunduh.'}
                                </p>
                            </div>
                            {isProcessingMorphologyPack && (
                                <div className="inline-flex items-center gap-2 text-xs font-bold text-quran-gold">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Memproses...
                                </div>
                            )}
                        </div>
                        <div className="mt-4 flex flex-col sm:flex-row gap-2">
                            <button
                                onClick={handleDownloadMorphologyPack}
                                disabled={isProcessingMorphologyPack || !!morphologyPackMeta}
                                className="px-4 py-3 text-xs font-bold bg-stone-100 dark:bg-slate-700 text-stone-600 dark:text-gray-200 rounded-2xl hover:bg-stone-200 transition-colors flex items-center justify-center gap-1.5 min-h-10 disabled:opacity-50 w-full sm:w-auto"
                            >
                                <Download className="w-3.5 h-3.5" />
                                {morphologyPackMeta ? 'Sudah Terpasang' : 'Unduh Pack'}
                            </button>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div>
                                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">Info Surat & Asbabun Nuzul Offline</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md">
                                    Menyediakan penjelasan surat, latar turunnya, dan pokok kandungannya agar tetap bisa dibaca tanpa internet.
                                </p>
                                <p className="text-[11px] text-gray-400 mt-2">
                                    {qulSurahPackMeta ? `Siap digunakan untuk ${qulSurahPackMeta.count} surat dalam bahasa ${getAppLangName()}.` : `Belum diunduh untuk bahasa ${getAppLangName()}.`}
                                </p>
                            </div>
                            {isProcessingQulSurahPack && (
                                <div className="inline-flex items-center gap-2 text-xs font-bold text-quran-gold">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Memproses...
                                </div>
                            )}
                        </div>
                        <div className="mt-4 flex flex-col sm:flex-row gap-2">
                            <button
                                onClick={handleDownloadQulSurahPack}
                                disabled={isProcessingQulSurahPack || !!qulSurahPackMeta}
                                className="px-4 py-3 text-xs font-bold bg-stone-100 dark:bg-slate-700 text-stone-600 dark:text-gray-200 rounded-2xl hover:bg-stone-200 transition-colors flex items-center justify-center gap-1.5 min-h-10 disabled:opacity-50 w-full sm:w-auto"
                            >
                                <Download className="w-3.5 h-3.5" />
                                {qulSurahPackMeta ? 'Sudah Terpasang' : 'Unduh Pack'}
                            </button>
                        </div>
                    </div>
                 </div>
            </section>
            )}

            {activeTab === 'offline' && (
            <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-stone-200 dark:border-slate-700 p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-quran-gold" /> Unduhan Tertunda
                    </h2>
                    <button
                        onClick={refreshPendingTasks}
                        className="text-xs px-3 py-2 rounded-md bg-stone-100 dark:bg-slate-700 text-stone-600 dark:text-gray-300 font-bold min-h-10"
                    >
                        Refresh
                    </button>
                </div>
                {pendingTasks.length === 0 ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400">Tidak ada unduhan tertunda.</p>
                ) : (
                    <div className="space-y-2">
                        {pendingTasks.map((task) => (
                            <div key={task.id} className="p-4 rounded-2xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-900/30">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-200 break-all">
                                            {task.type === 'mushaf' ? `Mushaf: ${task.targetId}` : `Audio: ${task.targetId}`}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Status: {task.status} • {task.progress || 0}%
                                        </p>
                                    </div>
                                    <button
                                        disabled={!!isResumingTaskId || isDownloadingAudio || isDownloadingMushaf}
                                        onClick={() => handleResumeTask(task)}
                                        className="px-4 py-2.5 text-xs font-bold rounded-xl bg-quran-dark dark:bg-quran-gold text-white dark:text-quran-dark disabled:opacity-50 min-h-10 w-full sm:w-auto"
                                    >
                                        {isResumingTaskId === task.id ? 'Melanjutkan...' : 'Lanjutkan'}
                                    </button>
                                </div>
                                <div className="mt-3 h-1.5 rounded-full bg-stone-200 dark:bg-slate-700">
                                    <div className="h-full rounded-full bg-quran-gold" style={{ width: `${task.progress || 0}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
            )}

            {activeTab === 'audio' && (
             <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-stone-200 dark:border-slate-700 overflow-hidden">
                {renderSettingSectionHeader(
                  <Volume2 className="w-4 h-4 text-quran-gold" />,
                  t('settings_audio'),
                  `Qari aktif: ${activeReciter.name}`,
                  `${downloadedAudioCount}/${surahs.length || 114} surat siap`,
                  activeSection === 'audio',
                  () => setActiveSection(activeSection === 'audio' ? null : 'audio')
                )}
                {activeSection === 'audio' && (
                    <div className="p-4 sm:p-5 bg-stone-50/30 dark:bg-slate-900/30 space-y-6">
                        <div className="space-y-2"><label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('settings_reciter')}</label><div className="relative"><Mic2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-quran-gold" /><select className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-slate-600 text-sm appearance-none bg-white dark:bg-slate-700 dark:text-white" value={activeReciter.id} onChange={(e) => setReciter(e.target.value)}>{RECITERS.map(r => (<option key={r.id} value={r.id}>{r.name}</option>))}</select></div></div>
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-stone-200 dark:border-slate-700 overflow-hidden"><div className="p-4 bg-stone-100 dark:bg-slate-700 border-b border-stone-200 dark:border-slate-600 flex flex-col sm:flex-row justify-between sm:items-center gap-2"><span className="text-xs font-bold text-gray-600 dark:text-gray-300">{t('download_manager')}</span>
                        <button 
                            onClick={handleDownloadAllAudio} 
                            disabled={isDownloadingAudio} 
                            className="text-xs bg-white border border-stone-300 dark:bg-slate-600 dark:border-slate-500 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg font-bold hover:bg-stone-50 dark:hover:bg-slate-500 disabled:opacity-50 transition-colors shadow-sm min-h-10"
                        >
                            {t('download_all')}
                        </button>
                        </div><div className="max-h-80 overflow-y-auto divide-y divide-stone-100 dark:divide-slate-700">{surahs.map(surah => { 
                            const isDownloaded = audioDownloads[surah.id]; 
                            const isThisSurahDownloading = currentDownloadSurah === surah.id; 
                            const size = AudioService.estimateSurahSize(surah.total_verses);
                            
                            return (
                                <div key={surah.id} className="p-4 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-slate-700 relative">
                                    {isThisSurahDownloading && (
                                        <div className="absolute inset-0 bg-quran-gold/5 pointer-events-none">
                                            <div className="h-full bg-quran-gold/10 transition-all duration-300" style={{width: `${audioProgress}%`}} />
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 relative z-10">
                                        <div className="w-9 h-9 rounded-2xl bg-stone-100 dark:bg-slate-600 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-300 border border-stone-200 dark:border-slate-500">{surah.id}</div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{surah.transliteration}</p>
                                                {isDownloaded && !isThisSurahDownloading && <span className="rounded-full bg-emerald-100 dark:bg-emerald-800/40 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">Siap</span>}
                                            </div>
                                            <p className="text-xs text-gray-400">{surah.total_verses} ayat • {size}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 relative z-10">
                                        {isThisSurahDownloading ? 
                                            <div className="flex items-center gap-2 text-xs text-quran-gold font-bold bg-white/80 dark:bg-slate-800/80 px-2 py-1 rounded-full shadow-sm">
                                                <Loader2 className="w-3 h-3 animate-spin" /> {audioProgress}%
                                            </div> 
                                            : isDownloaded ? 
                                                <button onClick={() => handleDeleteSurahAudio(surah.id)} className="p-2.5 text-green-600 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10"><Trash2 className="w-4 h-4" /></button> 
                                            : 
                                                <button onClick={() => handleDownloadSurahAudio(surah)} disabled={isDownloadingAudio} className="p-2.5 text-gray-400 hover:text-quran-gold rounded-xl hover:bg-stone-100 dark:hover:bg-slate-700"><Download className="w-4 h-4" /></button>
                                        }
                                    </div>
                                </div>
                            ); 
                        })}
                        </div></div>
                    </div>
                )}
            </section>
            )}

            {activeTab === 'reading' && (
            <>
             {['translation', 'tafsir'].map((type) => (
                <section key={type} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-stone-200 dark:border-slate-700 overflow-hidden">
                    {renderSettingSectionHeader(
                      <BookType className="w-4 h-4 text-quran-gold" />,
                      type === 'translation' ? t('settings_trans') : t('settings_tafsir'),
                      type === 'translation'
                        ? (showTranslation ? `Aktif: ${getEditionName(currentTranslationId)}` : 'Belum diaktifkan')
                        : (showTafsir ? `Aktif: ${getEditionName(currentTafsirId)}` : 'Belum diaktifkan'),
                      type === 'translation'
                        ? (showTranslation ? 'Menyala' : 'Mati')
                        : (showTafsir ? 'Menyala' : 'Mati'),
                      activeSection === type,
                      () => { setActiveSection(activeSection === type ? null : type as any); setSearchQuery(''); },
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          type === 'translation' ? onToggleTranslation(!showTranslation) : onToggleTafsir(!showTafsir);
                        }}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${(type === 'translation' ? showTranslation : showTafsir) ? 'bg-quran-dark dark:bg-quran-gold' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${(type === 'translation' ? showTranslation : showTafsir) ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    )}
                    {activeSection === type && <div className="p-4 sm:p-5 bg-stone-50/30 dark:bg-slate-900/30">{renderEditionList(type as any)}</div>}
                </section>
            ))}
            </>
            )}
        </div>

        <LanguageModal isOpen={isLangModalOpen} onClose={() => setIsLangModalOpen(false)} currentAppLang={language} onAppLangChange={setLanguage} />
        <FontSettingsModal
            isOpen={showFontSettings}
            onClose={() => setShowFontSettings(false)}
            arabicFontFamily={arabicFontFamily}
            onArabicFontFamilyChange={(fontId) => {
                setArabicFontFamily(fontId);
                StorageService.setArabicFontFamily(fontId);
            }}
            arabicFontSize={arabicFontSize}
            onArabicFontSizeChange={(size) => {
                setArabicFontSize(size);
                StorageService.setArabicFontSize(size);
            }}
            translationFontSize={translationFontSize}
            onTranslationFontSizeChange={(size) => {
                setTranslationFontSize(size);
                StorageService.setTranslationFontSize(size);
            }}
        />
        <ConfirmationModal isOpen={confirmState.isOpen} onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))} onConfirm={confirmState.onConfirm} title={confirmState.title} message={confirmState.message} confirmText={confirmState.confirmText} variant={confirmState.variant} />
    </div>
  );
};

export default SettingsPage;
