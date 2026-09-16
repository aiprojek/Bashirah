
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import SurahCard from '../components/SurahCard';
import Search from '../components/Search';
import Loading from '../components/Loading';
import KhatamWidget from '../components/KhatamWidget';
import AutoLastReadWidget from '../components/AutoLastReadWidget';
import AyatOfTheDay from '../components/AyatOfTheDay';
import KhatamCelebrationModal from '../components/KhatamCelebrationModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { getAllSurahs, JUZ_START_MAPPING, SAJDAH_VERSES, getHizbList, getVersesByPage, getPageStartLocal } from '../services/quranService';
import { getManzilList, ManzilItem } from '../services/manzilService';
import * as StorageService from '../services/storageService';
import { Surah, LastReadData, KhatamTarget } from '../types';
import { Clock, ChevronRight, Sparkles, Bookmark, FileText, Loader2, Trash2, Calendar, BookOpen, Layers } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface HomePageProps {
  showTranslation: boolean;
  translationId: string;
}

const HomePage: React.FC<HomePageProps> = ({ showTranslation, translationId }) => {
  const { language, t } = useLanguage();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastRead, setLastRead] = useState<LastReadData | null>(null);
  const [khatamTarget, setKhatamTarget] = useState<KhatamTarget | null>(null);
  const [khatamLastRead, setKhatamLastRead] = useState<LastReadData | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showDeleteManualConfirm, setShowDeleteManualConfirm] = useState(false);
  const [manzils, setManzils] = useState<ManzilItem[]>([]);
  
  // State for Ayat of the Day Modal
  const [showAyatModal, setShowAyatModal] = useState(false);
  const [isDailyAyatEnabled, setIsDailyAyatEnabled] = useState(true);
  
  // Page Navigation State
  const [isNavigatingPage, setIsNavigatingPage] = useState(false);
  
  // Tab State
  const [activeTab, setActiveTab] = useState<'surah' | 'juz' | 'halaman' | 'manzil' | 'hizb' | 'sajdah'>('surah');
  
  const navigate = useNavigate();

  // Generate pages array (1-604)
  const allPages = useMemo(() => Array.from({ length: 604 }, (_, i) => i + 1), []);

  useEffect(() => {
    const loadData = async () => {
        const lr = await StorageService.getLastRead();
        const kt = await StorageService.getKhatamTarget();
        setLastRead(lr);
        setKhatamTarget(kt);
        setIsDailyAyatEnabled(await StorageService.getShowAyatOfTheDay());

        // Derive last read from khatam if available
        if (kt && kt.isActive) {
            // We only have the page number in KhatamTarget, but we can potentially derive more from history
            // For now, if we have a page number, we can show it as "Halaman X"
            // If we want surah/verse info, we'd need to fetch it. 
            // Since we want to show it as a card, let's keep it simple or try to fetch the first verse of that page.
        }
    };

    loadData();
    
    const handleKhatamComplete = (e: any) => {
        setKhatamTarget(e.detail.target);
        setShowCelebration(true);
    };

    window.addEventListener('storage-update', loadData);
    window.addEventListener('app:khatam-complete', handleKhatamComplete as EventListener);
    
    return () => {
        window.removeEventListener('storage-update', loadData);
        window.removeEventListener('app:khatam-complete', handleKhatamComplete as EventListener);
    };
  }, []);

  useEffect(() => {
    const fetchSurahs = async () => {
      setLoading(true);
      try {
        const [data, manzilData] = await Promise.all([
          getAllSurahs(language),
          getManzilList(),
        ]);
        setSurahs(data);
        setManzils(manzilData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSurahs();
  }, [language]);

  const filteredSurahs = useMemo(() => {
    return surahs.filter(s => 
      s.transliteration.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.translation.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [surahs, searchTerm]);

  const handleSurahClick = (id: number) => {
      navigate(`/surah/${id}`);
  };

  const handleContinueReading = () => {
      if(lastRead) {
          navigate(`/surah/${lastRead.surahId}#verse-${lastRead.verseId}`);
      }
  };
  
  const handleNavigateToVerse = (surahId: number, verseId: number) => {
      navigate(`/surah/${surahId}#verse-${verseId}`);
  };

  const handlePageClick = (pageNumber: number) => {
      const start = getPageStartLocal(pageNumber);
      navigate(`/surah/${start.surahId}#verse-${start.verseId}`);
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in pb-24">
      
      {/* Loading Overlay for Page Navigation */}
      {isNavigatingPage && (
          <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white p-6 rounded-2xl flex flex-col items-center gap-3 shadow-2xl">
                  <Loader2 className="w-8 h-8 text-quran-gold animate-spin" />
                  <p className="text-sm font-bold text-gray-600">
                    {language === 'en' ? 'Opening Page...' : 'Membuka Halaman...'}
                  </p>
              </div>
          </div>
      )}

      <div className="text-center mb-8 relative z-10">
        
        {/* Title Badge Container */}
        <div className="relative inline-block mb-4 group">
             {/* The Main Badge */}
             <div className="p-1 border border-quran-gold/30 rounded-full">
                <div className="px-4 py-1 bg-quran-gold/10 rounded-full text-quran-dark dark:text-quran-gold text-xs font-bold tracking-widest uppercase">
                    Al-Quran Al-Kareem
                </div>
             </div>

             {/* AYAT OF THE DAY TRIGGER - "Nyembul" Effect - Only show if enabled */}
             {isDailyAyatEnabled && (
                <button 
                    onClick={() => setShowAyatModal(true)}
                    className="absolute -top-3 -right-6 md:-right-8 z-20 animate-bounce hover:animate-none transition-transform hover:scale-110"
                    title={t('daily_verse')}
                >
                    <div className="flex items-center gap-1 bg-quran-gold text-white px-2 py-1 rounded-lg shadow-md text-[10px] font-bold border border-white dark:border-slate-800">
                        <Sparkles className="w-3 h-3 fill-white" />
                        <span className="hidden md:inline">{t('daily_verse')}</span>
                    </div>
                    {/* Little triangle pointer */}
                    <div className="w-2 h-2 bg-quran-gold absolute left-2 -bottom-1 transform rotate-45 border-b border-r border-white dark:border-slate-800"></div>
                </button>
             )}
        </div>

        <h2 className="text-4xl md:text-5xl font-bold text-quran-dark dark:text-gray-100 mb-4 font-serif">{t('home_greeting')}</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto font-serif italic">{t('home_subtitle')}</p>
      </div>
      
      {/* Search Bar - NOW PASSING TRANSLATION ID */}
      <Search value={searchTerm} onChange={setSearchTerm} translationId={translationId} />

      {/* Only show widgets if not searching */}
      {!searchTerm && (
        <>
            {/* Modal for Ayat of the Day */}
            {isDailyAyatEnabled && (
                <AyatOfTheDay 
                    isOpen={showAyatModal} 
                    onClose={() => setShowAyatModal(false)} 
                    translationId={translationId}
                    showTranslation={showTranslation}
                />
            )}
            
            {/* Khatam Tracker */}
            <KhatamWidget />

            {/* Manual Last Read (Compact, mobile-optimized, only shows if user has marked a verse) */}
            {lastRead && (
                <div 
                    onClick={handleContinueReading}
                    className="w-full bg-white dark:bg-slate-800 border border-stone-200/80 dark:border-slate-700/80 rounded-2xl p-3 sm:p-4 shadow-sm hover:shadow-md hover:border-quran-gold/40 dark:hover:border-quran-gold/40 transition-all cursor-pointer mb-5 flex items-center justify-between group"
                >
                    <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-quran-gold/10 dark:bg-quran-gold/20 flex items-center justify-center text-quran-gold shrink-0">
                            <Bookmark className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-quran-gold">
                                    {language === 'en' ? 'Last Read (Manual)' : 'Tanda Baca Terakhir'}
                                </span>
                                {lastRead.pageNumber > 0 && (
                                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                                        • {language === 'en' ? 'Page' : 'Hal.'} {lastRead.pageNumber}
                                    </span>
                                )}
                            </div>
                            <h3 className="font-bold text-sm sm:text-base text-quran-dark dark:text-gray-100 truncate group-hover:text-quran-gold transition-colors">
                                {lastRead.surahName}{' '}
                                <span className="font-semibold text-xs sm:text-sm text-gray-500 dark:text-gray-400 ml-1">
                                    {language === 'en' ? 'Verse' : 'Ayat'} {lastRead.verseId}
                                </span>
                            </h3>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <span className="hidden sm:inline-block text-xs font-semibold text-quran-gold group-hover:underline">
                            {language === 'en' ? 'Continue' : 'Lanjutkan'}
                        </span>
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-stone-100 dark:bg-slate-700 group-hover:bg-quran-dark group-hover:text-white dark:group-hover:bg-quran-gold dark:group-hover:text-slate-900 flex items-center justify-center text-gray-400 transition-colors">
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowDeleteManualConfirm(true);
                            }}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center justify-center transition-colors ml-0.5"
                            title={language === 'en' ? 'Delete manual last read bookmark' : 'Hapus tanda baca terakhir'}
                        >
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Delete Manual Last Read Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteManualConfirm}
                onClose={() => setShowDeleteManualConfirm(false)}
                onConfirm={async () => {
                    await StorageService.clearLastRead();
                    setLastRead(null);
                    setShowDeleteManualConfirm(false);
                }}
                title={language === 'en' ? 'Delete Last Read Bookmark?' : 'Hapus Tanda Baca Terakhir?'}
                message={language === 'en' 
                    ? `Remove manual bookmark for ${lastRead?.surahName} verse ${lastRead?.verseId}?`
                    : `Hapus tanda baca terakhir untuk surat ${lastRead?.surahName} ayat ${lastRead?.verseId}?`}
                confirmText={language === 'en' ? 'Delete' : 'Hapus'}
                variant="danger"
            />

            {/* Auto-Save Last Read Verses (Menyamping, max 3 verses, hidden if none) */}
            <AutoLastReadWidget />
        </>
      )}

      {/* TABS NAVIGATION */}
      {!searchTerm && (
        <div className="w-full max-w-2xl mx-auto px-2 sm:px-4 mb-6">
            <div className="grid grid-cols-6 p-1 bg-stone-100 dark:bg-slate-800 rounded-2xl border border-stone-200/60 dark:border-slate-700/60 shadow-inner">
                 {(['surah', 'juz', 'halaman', 'manzil', 'hizb', 'sajdah'] as const).map((tab) => {
                    const getTabLabel = () => {
                      if (tab === 'surah') return t('tab_surah');
                      if (tab === 'juz') return t('tab_juz');
                      if (tab === 'manzil') return t('tab_manzil');
                      if (tab === 'hizb') return 'Hizb';
                      if (tab === 'sajdah') return 'Sajdah';
                      return (
                        <>
                          <span className="sm:hidden">{language === 'en' ? 'Page' : 'Hal'}</span>
                          <span className="hidden sm:inline">{t('tab_page')}</span>
                        </>
                      );
                    };

                    return (
                      <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`py-2 px-0.5 sm:px-1 text-[10px] xs:text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 text-center whitespace-nowrap ${
                              activeTab === tab 
                              ? 'bg-white dark:bg-slate-700 text-quran-dark dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10' 
                              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                          }`}
                      >
                          {getTabLabel()}
                      </button>
                    );
                 })}
            </div>
        </div>
      )}

      {/* CONTENT LISTS */}
      {/* 1. Surah Grid */}
      {(activeTab === 'surah' || searchTerm) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSurahs.map((surah) => (
              <SurahCard 
                key={surah.id} 
                surah={surah} 
                onClick={handleSurahClick}
                showTranslation={showTranslation} 
              />
            ))}
            {filteredSurahs.length === 0 && (
              <div className="col-span-full text-center py-20 text-gray-400">
                  <p>{t('no_surah_found')}</p>
              </div>
            )}
          </div>
      )}

      {/* 2. Juz Grid */}
      {activeTab === 'juz' && !searchTerm && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {JUZ_START_MAPPING.map((juz) => (
                  <button 
                      key={juz.juz}
                      onClick={() => handleNavigateToVerse(juz.surahId, juz.verseId)}
                      className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-stone-200 dark:border-slate-700 hover:border-quran-gold/50 dark:hover:border-quran-gold/50 hover:shadow-md transition-all text-left flex items-center justify-between group"
                  >
                      <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-stone-50 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold text-quran-dark dark:text-gray-200 border border-stone-100 dark:border-slate-600 group-hover:bg-quran-gold group-hover:text-white transition-colors">
                              {juz.juz}
                          </div>
                          <div>
                              <h4 className="font-bold text-gray-800 dark:text-gray-100">{t('tab_juz')} {juz.juz}</h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Mulai: {juz.label}</p>
                          </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-500 group-hover:text-quran-gold" />
                  </button>
              ))}
          </div>
      )}

      {/* 3. Page Grid */}
      {activeTab === 'halaman' && !searchTerm && (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
              {allPages.map((page) => (
                  <button 
                      key={page}
                      onClick={() => handlePageClick(page)}
                      className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-stone-200 dark:border-slate-700 hover:border-quran-gold/50 dark:hover:border-quran-gold/50 hover:shadow-sm transition-all flex flex-col items-center justify-center group h-16"
                  >
                      <span className="text-xs text-gray-400 uppercase tracking-wide">Hal</span>
                      <span className="font-bold text-lg text-quran-dark dark:text-gray-100 group-hover:text-quran-gold">{page}</span>
                  </button>
              ))}
          </div>
      )}

      {/* 4. Manzil Grid */}
      {activeTab === 'manzil' && !searchTerm && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-slate-800 border border-stone-200/80 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-quran-gold/10 dark:bg-quran-gold/20 text-quran-gold flex items-center justify-center shrink-0 mt-0.5">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-quran-dark dark:text-gray-100 text-sm sm:text-base font-serif">
                  {language === 'en' ? 'Manzil — 7-Day Quran Completion' : 'Manzil — Khatam Al-Qur\'an 7 Hari'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-serif italic">
                  {language === 'en'
                    ? "Traditional 7-part division (Fami bi-Shawq / فمي بشوق) practiced by the Companions of Prophet Muhammad ﷺ to read and complete the entire Quran in one week."
                    : "Pembagian 7 Manzil (Fami bi-Shawq / فمي بشوق) yang diamalkan para Sahabat Nabi Muhammad ﷺ untuk menyelesaikan khatam Al-Qur'an dalam tempo sepekan (Jum'at hingga Kamis)."}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {manzils.map((manzil) => (
              <div
                key={manzil.id}
                className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-stone-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-quran-gold/40 dark:hover:border-quran-gold/40 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-slate-700 text-quran-dark dark:text-gray-200 font-bold text-sm flex items-center justify-center border border-stone-200 dark:border-slate-600 group-hover:bg-quran-gold group-hover:text-white group-hover:border-quran-gold transition-colors">
                        {manzil.id}
                      </span>
                      <div>
                        <h4 className="font-bold text-quran-dark dark:text-gray-100 text-sm group-hover:text-quran-gold dark:group-hover:text-quran-gold transition-colors">
                          Manzil {manzil.id}
                        </h4>
                        <span className="text-[11px] font-semibold text-quran-gold">
                          {language === 'en' ? manzil.dayLabelEn : manzil.dayLabelId}
                        </span>
                      </div>
                    </div>
                    <span className="font-arabic text-2xl text-quran-dark/80 dark:text-gray-300 group-hover:text-quran-gold dark:group-hover:text-quran-gold transition-colors">
                      {manzil.mnemonic.letter}
                    </span>
                  </div>

                  <div className="p-3 bg-stone-50 dark:bg-slate-700/40 rounded-xl border border-stone-100 dark:border-slate-700/50 space-y-1">
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200">
                      {manzil.surahRangeText}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      {manzil.versesCount} {language === 'en' ? 'verses' : 'ayat'} ({manzil.firstVerseKey} — {manzil.lastVerseKey})
                    </p>
                  </div>

                  {/* Included Surahs tags */}
                  <div className="flex flex-wrap gap-1">
                    {manzil.surahIds.map((sId) => {
                      const surahMeta = surahs.find((s) => s.id === sId);
                      return (
                        <button
                          key={sId}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/surah/${sId}`);
                          }}
                          className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-stone-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-quran-dark hover:text-white dark:hover:bg-quran-gold dark:hover:text-slate-900 transition-colors"
                        >
                          {surahMeta ? surahMeta.transliteration : `QS. ${sId}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => handleNavigateToVerse(manzil.startSurahId, manzil.startVerseId)}
                  className="mt-4 w-full py-2.5 px-3 rounded-xl bg-stone-100 dark:bg-slate-700 hover:bg-quran-dark hover:text-white dark:hover:bg-quran-gold dark:hover:text-slate-900 text-quran-dark dark:text-gray-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-stone-200/60 dark:border-slate-600/60 group-hover:border-quran-gold/40"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? `Read Manzil ${manzil.id}` : `Mulai Baca Manzil ${manzil.id}`}</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

       {/* 5. Hizb Grid */}
       {activeTab === 'hizb' && !searchTerm && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {getHizbList().map((hizb) => (
                  <button 
                      key={hizb.id}
                      onClick={() => handleNavigateToVerse(hizb.surahId, hizb.verseId)}
                      className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-stone-200 dark:border-slate-700 hover:border-quran-gold/50 dark:hover:border-quran-gold/50 hover:shadow-sm transition-all text-left flex items-center justify-between group"
                  >
                      <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-stone-50 dark:bg-slate-700 rounded-lg flex items-center justify-center font-bold text-xs text-stone-500 dark:text-gray-300 border border-stone-100 dark:border-slate-600 group-hover:bg-quran-gold group-hover:text-white transition-colors">
                              {hizb.id}
                          </div>
                          <div>
                              <h4 className="font-bold text-gray-700 dark:text-gray-200 text-sm">Hizb {hizb.id}</h4>
                              <p className="text-[10px] text-gray-400">{t('tab_juz')} {hizb.juz}</p>
                          </div>
                      </div>
                  </button>
              ))}
          </div>
      )}

      {/* 5. Sajdah Grid */}
      {activeTab === 'sajdah' && !searchTerm && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {SAJDAH_VERSES.map((sajdah, idx) => (
                   <button 
                      key={idx}
                      onClick={() => handleNavigateToVerse(sajdah.surahId, sajdah.verseId)}
                      className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-stone-200 dark:border-slate-700 hover:border-quran-gold/50 dark:hover:border-quran-gold/50 hover:shadow-md transition-all text-left flex items-center justify-between group"
                   >
                       <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-quran-gold/10 rounded-full flex items-center justify-center text-quran-dark dark:text-quran-gold">
                                <Bookmark className="w-4 h-4 fill-current" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 dark:text-gray-100">{sajdah.surahName}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Ayat Sajdah: {sajdah.verseId}</p>
                            </div>
                       </div>
                       <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-500 group-hover:text-quran-gold" />
                   </button>
               ))}
          </div>
      )}
      
      {/* Celebration Modal */}
      <KhatamCelebrationModal 
        isOpen={showCelebration} 
        onClose={() => setShowCelebration(false)} 
        target={khatamTarget} 
      />
    </div>
  );
};

export default HomePage;
