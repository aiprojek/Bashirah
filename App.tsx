import React, { useState, useEffect, useRef } from 'react';
import { MemoryRouter } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import AudioPlayer from './components/AudioPlayer';
import AudioDownloadModal from './components/AudioDownloadModal';
import { getAvailableEditions, showToast } from './services/quranService';
import { TranslationOption, DEFAULT_EDITIONS } from './types';
import { AudioProvider, useAudio } from './contexts/AudioContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { migrateFromLocalStorage } from './services/db';
import AppRoutes from './routes';
import Toast from './components/Toast';
import { App as CapApp } from '@capacitor/app';
import { useNavigate, useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';

const AppContent: React.FC = () => {
  const [translationEdition, setTranslationEdition] = useState<string>('id.indonesian');
  const [tafsirEdition, setTafsirEdition] = useState<string>('id.jalalayn');
  const [showTranslation, setShowTranslation] = useState(false);
  const [showTafsir, setShowTafsir] = useState(false);
  const [showWordByWord, setShowWordByWord] = useState(false);
  const [showTajweed, setShowTajweed] = useState(false);

  const [availableEditions, setAvailableEditions] = useState<TranslationOption[]>(DEFAULT_EDITIONS);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMigrating, setIsMigrating] = useState(true);
  const lastBackPressRef = useRef(0);

  const navigate = useNavigate();
  const location = useLocation();

  const { isLoading: isThemeLoading } = useTheme();
  const { isLoading: isLangLoading } = useLanguage();
  const { isLoading: isAudioLoading } = useAudio();

  useEffect(() => {
    const initData = async () => {
      // 1. Run migration if needed
      await migrateFromLocalStorage();
      setIsMigrating(false);

      // 2. Fetch shared data
      const editions = await getAvailableEditions();
      if (editions.length > 0) setAvailableEditions(editions);
    };
    initData();

    // Android Back Button Handling
    let backListener: any;
    if (Capacitor.isNativePlatform()) {
      backListener = CapApp.addListener('backButton', () => {
        // 1) Close sidebar first (native-like modal/back behavior)
        if (isSidebarOpen) {
          setIsSidebarOpen(false);
          return;
        }

        // 2) If not on home, navigate back within app stack
        if (location.pathname !== '/') {
          navigate(-1);
          return;
        }

        // 3) On home, require double-back to exit
        const now = Date.now();
        if (now - lastBackPressRef.current < 1800) {
          CapApp.exitApp();
        } else {
          lastBackPressRef.current = now;
          showToast('Tekan sekali lagi untuk keluar aplikasi.', 'info');
        }
      });
    }

    return () => {
      if (backListener) backListener.remove();
    };
  }, [isSidebarOpen, location.pathname, navigate]);

  if (isMigrating || isThemeLoading || isLangLoading || isAudioLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 dark:text-slate-400 font-medium animate-pulse">Menyiapkan Bashirah...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-pattern-overlay h-screen overflow-hidden dark:bg-slate-900 dark:text-gray-100 transition-colors duration-300">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Header onOpenSidebar={() => setIsSidebarOpen(true)} />
      <main className="flex-grow overflow-auto h-full">
        <AppRoutes
          translationEdition={translationEdition}
          setTranslationEdition={setTranslationEdition}
          tafsirEdition={tafsirEdition}
          setTafsirEdition={setTafsirEdition}
          showTranslation={showTranslation}
          setShowTranslation={setShowTranslation}
          showTafsir={showTafsir}
          setShowTafsir={setShowTafsir}
          showWordByWord={showWordByWord}
          setShowWordByWord={setShowWordByWord}
          showTajweed={showTajweed}
          setShowTajweed={setShowTajweed}
          availableEditions={availableEditions}
        />
      </main>
      <AudioPlayer />
      <AudioDownloadModal />
      <Toast />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AudioProvider>
          <MemoryRouter>
            <AppContent />
          </MemoryRouter>
        </AudioProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
