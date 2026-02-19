
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import SurahCard from '../components/SurahCard';
import Search from '../components/Search';
import Loading from '../components/Loading';
import KhatamWidget from '../components/KhatamWidget';
import AyatOfTheDay from '../components/AyatOfTheDay';
import { getAllSurahs, JUZ_START_MAPPING, SAJDAH_VERSES, getHizbList, getVersesByPage } from '../services/quranService';
import * as StorageService from '../services/storageService';
import { Surah, LanguageCode, LastReadData } from '../types';
import { Clock, ChevronRight, Sparkles, Bookmark, FileText, Loader2 } from 'lucide-react';

interface HomePageProps {
  appLang: LanguageCode;
  showTranslation: boolean;
  translationId: string;
}

const HomePage: React.FC<HomePageProps> = ({ appLang, showTranslation, translationId }) => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastRead, setLastRead] = useState<LastReadData | null>(null);
  
  // State for Ayat of the Day Modal
  const [showAyatModal, setShowAyatModal] = useState(false);
  const [isDailyAyatEnabled, setIsDailyAyatEnabled] = useState(true);
  
  // Page Navigation State
  const [isNavigatingPage, setIsNavigatingPage] = useState(false);
  
  // Tab State
  const [activeTab, setActiveTab] = useState<'surah' | 'juz' | 'hizb' | 'sajdah' | 'halaman'>('surah');
  
  const navigate = useNavigate();

  // Generate pages array (1-604)
  const allPages = useMemo(() => Array.from({ length: 604 }, (_, i) => i + 1), []);

  useEffect(() => {
    const loadData = () => {
        setLastRead(StorageService.getLastRead());
        setIsDailyAyatEnabled(StorageService.getShowAyatOfTheDay());
    };
    loadData();

    // Listen for storage updates
    window.addEventListener('storage-update', loadData);
    return () => window.removeEventListener('storage-update', loadData);
  }, []);

  useEffect(() => {
    const fetchSurahs = async () => {
      setLoading(true);
      try {
        const data = await getAllSurahs(appLang);
        setSurahs(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSurahs();
  }, [appLang]);

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

  const handlePageClick = async (pageNumber: number) => {
      if (isNavigatingPage) return;
      setIsNavigatingPage(true);
      try {
          // Fetch verses on this page to find the starting point
          // We use the ID translation or default just to get the structure
          const verses = await getVersesByPage(pageNumber, 'id.indonesian');
          
          if (verses && verses.length > 0) {
              const firstVerse = verses[0];
              // Navigate to the surah and scroll to the specific verse
              navigate(`/surah/${firstVerse.surah.number}#verse-${firstVerse.numberInSurah}`);
          } else {
              alert("Gagal memuat data halaman. Periksa koneksi internet Anda.");
          }
      } catch (e) {
          console.error("Page navigation failed", e);
      } finally {
          setIsNavigatingPage(false);
      }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in pb-24">
      
      {/* Loading Overlay for Page Navigation */}
      {isNavigatingPage && (
          <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white p-6 rounded-2xl flex flex-col items-center gap-3 shadow-2xl">
                  <Loader2 className="w-8 h-8 text-quran-gold animate-spin" />
                  <p className="text-sm font-bold text-gray-600">Membuka Halaman...</p>
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
                    title="Lihat Ayat Harian"
                >
                    <div className="flex items-center gap-1 bg-quran-gold text-white px-2 py-1 rounded-lg shadow-md text-[10px] font-bold border border-white dark:border-slate-800">
                        <Sparkles className="w-3 h-3 fill-white" />
                        <span className="hidden md:inline">Ayat Harian</span>
                    </div>
                    {/* Little triangle pointer */}
                    <div className="w-2 h-2 bg-quran-gold absolute left-2 -bottom-1 transform rotate-45 border-b border-r border-white dark:border-slate-800"></div>
                </button>
             )}
        </div>

        <h2 className="text-4xl md:text-5xl font-bold text-quran-dark dark:text-gray-100 mb-4 font-serif">Baca & Pelajari Al-Quran</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto font-serif italic">Temukan kedamaian dalam setiap ayat suci-Nya.</p>
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
                />
            )}
            
            {/* Khatam Tracker */}
            <KhatamWidget />

            {/* Last Read */}
            {lastRead && (
                <div className="mb-10 bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group cursor-pointer" onClick={handleContinueReading}>
                    <div className="flex items-center gap-4">
                        <div className="bg-quran-gold/10 p-3 rounded-full text-quran-gold">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Terakhir Dibaca</p>
                            <h3 className="font-bold text-quran-dark dark:text-gray-100 text-lg">
                                {lastRead.surahName} <span className="font-normal text-gray-400 text-sm">Ayat {lastRead.verseId}</span>
                            </h3>
                        </div>
                    </div>
                    <div className="bg-stone-100 dark:bg-slate-700 p-2 rounded-full text-gray-400 dark:text-gray-300 group-hover:bg-quran-dark group-hover:text-white transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </div>
                </div>
            )}
        </>
      )}

      {/* TABS NAVIGATION */}
      {!searchTerm && (
        <div className="flex justify-center mb-6 overflow-x-auto no-scrollbar">
            <div className="flex bg-stone-100 dark:bg-slate-800 p-1 rounded-xl whitespace-nowrap">
                 {(['surah', 'juz', 'halaman', 'hizb', 'sajdah'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                            activeTab === tab 
                            ? 'bg-white dark:bg-slate-700 text-quran-dark dark:text-white shadow-sm' 
                            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                        }`}
                    >
                        {tab === 'surah' ? 'Surat' : tab === 'juz' ? 'Juz' : tab === 'halaman' ? 'Halaman' : tab === 'hizb' ? 'Hizb' : 'Sajdah'}
                    </button>
                 ))}
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
                  <p>Tidak ada surat yang ditemukan.</p>
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
                              <h4 className="font-bold text-gray-800 dark:text-gray-100">Juz {juz.juz}</h4>
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

       {/* 4. Hizb Grid */}
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
                              <p className="text-[10px] text-gray-400">Juz {hizb.juz}</p>
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
      
    </div>
  );
};

export default HomePage;
