
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LibraryPage from './pages/LibraryPage';
import TopicIndexPage from './pages/TopicIndexPage';
import DuaCollectionPage from './pages/DuaCollectionPage';
import EmotionPage from './pages/EmotionPage';
import QuizPage from './pages/QuizPage';
import TadabburPage from './pages/TadabburPage';
import AboutPage from './pages/AboutPage';
import AsmaulHusnaPage from './pages/AsmaulHusnaPage';
import TajweedLearnPage from './pages/TajweedLearnPage';
import SurahDetailPage from './pages/SurahDetailPage';
import SettingsPage from './pages/SettingsPage';
import { TranslationOption } from './types';

interface AppRoutesProps {
  translationEdition: string;
  setTranslationEdition: (id: string) => void;
  tafsirEdition: string;
  setTafsirEdition: (id: string) => void;
  showTranslation: boolean;
  setShowTranslation: (show: boolean) => void;
  showTafsir: boolean;
  setShowTafsir: (show: boolean) => void;
  showWordByWord: boolean;
  setShowWordByWord: (show: boolean) => void;
  showTajweed: boolean;
  setShowTajweed: (show: boolean) => void;
  availableEditions: TranslationOption[];
}

const AppRoutes: React.FC<AppRoutesProps> = ({
  translationEdition,
  setTranslationEdition,
  tafsirEdition,
  setTafsirEdition,
  showTranslation,
  setShowTranslation,
  showTafsir,
  setShowTafsir,
  showWordByWord,
  setShowWordByWord,
  showTajweed,
  setShowTajweed,
  availableEditions
}) => {
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <HomePage 
            showTranslation={showTranslation} 
            translationId={translationEdition} 
          />
        } 
      />
      <Route path="/library" element={<LibraryPage />} />
      <Route path="/topics" element={<TopicIndexPage />} />
      <Route path="/duas" element={<DuaCollectionPage />} />
      <Route path="/feelings" element={<EmotionPage />} />
      <Route path="/quiz" element={<QuizPage />} />
      <Route path="/tadabbur" element={<TadabburPage />} />
      <Route path="/asmaul-husna" element={<AsmaulHusnaPage />} />
      <Route path="/tajweed-learn" element={<TajweedLearnPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route 
        path="/surah/:id" 
        element={
          <SurahDetailPage 
            translationId={translationEdition} 
            tafsirId={tafsirEdition} 
            showTranslation={showTranslation} 
            showTafsir={showTafsir} 
            showWordByWord={showWordByWord} 
            showTajweed={showTajweed} 
          />
        } 
      />
      <Route 
        path="/settings" 
        element={
          <SettingsPage 
            currentTranslationId={translationEdition} 
            onTranslationChange={setTranslationEdition} 
            showTranslation={showTranslation} 
            onToggleTranslation={setShowTranslation} 
            currentTafsirId={tafsirEdition} 
            onTafsirChange={setTafsirEdition} 
            showTafsir={showTafsir} 
            onToggleTafsir={setShowTafsir} 
            showWordByWord={showWordByWord} 
            onToggleWordByWord={setShowWordByWord} 
            availableEditions={availableEditions} 
            showTajweed={showTajweed} 
            onToggleTajweed={setShowTajweed} 
          />
        } 
      />
    </Routes>
  );
};

export default AppRoutes;
