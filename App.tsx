
import React, { useState, useEffect } from 'react';
import { MemoryRouter } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import AudioPlayer from './components/AudioPlayer'; 
import AudioDownloadModal from './components/AudioDownloadModal'; 
import { getAvailableEditions } from './services/quranService';
import { LanguageCode, TranslationOption, DEFAULT_EDITIONS } from './types';
import { AudioProvider } from './contexts/AudioContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AppRoutes from './routes';

const App: React.FC = () => {
  const [appLanguage, setAppLanguage] = useState<LanguageCode>('id');
  const [translationEdition, setTranslationEdition] = useState<string>('id.indonesian');
  const [tafsirEdition, setTafsirEdition] = useState<string>('id.jalalayn'); 
  const [showTranslation, setShowTranslation] = useState(false); // DEFAULT FALSE to avoid ambiguity 
  const [showTafsir, setShowTafsir] = useState(false); 
  const [showWordByWord, setShowWordByWord] = useState(false); 
  const [showTajweed, setShowTajweed] = useState(false); 
  
  const [availableEditions, setAvailableEditions] = useState<TranslationOption[]>(DEFAULT_EDITIONS);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
      const initData = async () => {
          const editions = await getAvailableEditions();
          if (editions.length > 0) setAvailableEditions(editions);
      };
      initData();
  }, []);

  return (
    <ThemeProvider>
        <AudioProvider>
            <MemoryRouter>
            <div className="min-h-screen flex flex-col bg-pattern-overlay h-screen overflow-hidden dark:bg-slate-900 dark:text-gray-100 transition-colors duration-300">
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                <Header onOpenSidebar={() => setIsSidebarOpen(true)} />
                <main className="flex-grow overflow-auto h-full">
                  <AppRoutes 
                    appLang={appLanguage}
                    setAppLanguage={setAppLanguage}
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
            </div>
            </MemoryRouter>
        </AudioProvider>
    </ThemeProvider>
  );
};

export default App;
