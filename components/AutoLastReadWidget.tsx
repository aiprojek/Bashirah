import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ChevronRight, Clock, X } from 'lucide-react';
import * as StorageService from '../services/storageService';
import { LastReadData } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import ConfirmationModal from './ConfirmationModal';

const formatTimeAgo = (timestamp: number, lang: string): string => {
  if (!timestamp) return '';
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return lang === 'en' ? 'Just now' : 'Baru saja';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} ${lang === 'en' ? 'm' : 'mnt'}`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} ${lang === 'en' ? 'h' : 'jam'}`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return lang === 'en' ? 'Yesterday' : 'Kemarin';
  if (diffDays < 7) return `${diffDays} ${lang === 'en' ? 'd' : 'hari'}`;
  return new Date(timestamp).toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID', {
    day: 'numeric',
    month: 'short'
  });
};

const AutoLastReadWidget: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [recentRead, setRecentRead] = useState<LastReadData | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);

  const loadData = async () => {
    const data = await StorageService.getAutoSaveLastRead();
    setRecentRead(data);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('storage-update', handleUpdate);
    return () => window.removeEventListener('storage-update', handleUpdate);
  }, []);

  if (!recentRead) {
    return null;
  }

  const handleNavigateToVerse = () => {
    navigate(`/surah/${recentRead.surahId}#verse-${recentRead.verseId}`);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowClearModal(true);
  };

  const confirmClear = async () => {
    await StorageService.clearAutoLastRead();
    setRecentRead(null);
    setShowClearModal(false);
  };

  const timeAgo = formatTimeAgo(recentRead.timestamp, language);

  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          <h3 className="font-bold text-xs sm:text-sm text-gray-700 dark:text-gray-200">
            {language === 'en' ? 'Auto-Saved Reading' : 'Terakhir Dibaca (Auto)'}
          </h3>
        </div>
      </div>

      <div
        onClick={handleNavigateToVerse}
        className="group relative bg-white dark:bg-slate-800 border border-stone-200/80 dark:border-slate-700/80 hover:border-quran-gold/60 dark:hover:border-quran-gold/60 rounded-xl p-3 sm:p-4 shadow-sm hover:shadow transition-all cursor-pointer flex flex-col justify-between"
        title={`${language === 'en' ? 'Read' : 'Baca'} ${recentRead.surahName} : ${recentRead.verseId}`}
      >
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-bold text-sm sm:text-base text-quran-dark dark:text-gray-100 truncate group-hover:text-quran-gold transition-colors">
              {recentRead.surahName}
            </span>
            <span className="px-2 py-0.5 text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 rounded-md shrink-0">
              {language === 'en' ? 'Verse' : 'Ayat'} {recentRead.verseId}
            </span>
          </div>
          <button
            onClick={handleClear}
            className="w-6 h-6 rounded-full flex items-center justify-center text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors shrink-0"
            title={language === 'en' ? 'Clear auto-save' : 'Hapus auto-save'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-400 pt-2 border-t border-stone-100 dark:border-slate-700/50">
          <div className="flex items-center gap-2 truncate">
            {recentRead.pageNumber > 0 && (
              <span>
                {language === 'en' ? 'Page' : 'Hal.'} {recentRead.pageNumber}
              </span>
            )}
            {recentRead.pageNumber > 0 && timeAgo && <span>•</span>}
            {timeAgo && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 opacity-70" />
                {timeAgo}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-quran-gold font-medium group-hover:translate-x-0.5 transition-transform shrink-0">
            <span>{language === 'en' ? 'Resume' : 'Lanjutkan'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={confirmClear}
        title={language === 'en' ? 'Clear Auto-Saved Verse?' : 'Hapus Auto-Save Terakhir?'}
        message={language === 'en'
          ? 'Are you sure you want to clear your auto-saved reading position?'
          : 'Apakah Anda yakin ingin menghapus posisi bacaan auto-save terakhir?'}
        confirmText={language === 'en' ? 'Clear' : 'Hapus'}
        variant="danger"
      />
    </div>
  );
};

export default AutoLastReadWidget;
