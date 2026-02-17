
import React, { useState, useRef, useEffect } from 'react';
import { Verse, Word, MemorizationLevel } from '../types';
import { BookOpen, Bookmark, CheckCircle, MoreVertical, FileText, PlayCircle, Volume2, Eye, EyeOff, Hash, Target, Copy, Share2, Check } from 'lucide-react';
import WordItem from './WordItem';
import * as StorageService from '../services/storageService'; // Import direct for check

interface VerseItemProps {
  verse: Verse;
  surahId: number;
  totalVerses: number;
  surahName: string; 
  verseTranslation?: string; 
  verseTafsir?: string;
  isBookmarked: boolean;
  isLastRead: boolean;
  hasNote: boolean;
  showWordByWord: boolean;
  
  // Memorization Props
  memorizationMode?: {
    isActive: boolean;
    level: MemorizationLevel;
    hideTranslation: boolean;
  };

  onToggleBookmark: (verseId: number) => void;
  onSetLastRead: (verseId: number) => void;
  onTakeNote: (verseId: number) => void;
  onWordClick: (word: Word) => void;
  
  // New: Specific Handler for Khatam Update
  onUpdateKhatam?: (verseId: number) => void;
  
  // New: Share Handler
  onShare?: (verse: Verse, surahName: string) => void;

  // New Audio Props
  isAudioPlaying?: boolean;
  onPlayAudio?: () => void;

  // New Font Size Props
  arabicFontSize?: number;
  translationFontSize?: number;
}

const VerseItem: React.FC<VerseItemProps> = ({ 
    verse, 
    surahId, 
    surahName,
    verseTranslation, 
    verseTafsir,
    isBookmarked,
    isLastRead,
    hasNote,
    showWordByWord,
    memorizationMode = { isActive: false, level: 'normal', hideTranslation: false },
    onToggleBookmark,
    onSetLastRead,
    onTakeNote,
    onWordClick,
    onUpdateKhatam,
    onShare,
    isAudioPlaying = false,
    onPlayAudio,
    arabicFontSize = 30, // Default sizes
    translationFontSize = 16
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [revealArabic, setRevealArabic] = useState(false);
  const [revealTranslation, setRevealTranslation] = useState(false);
  const [hasKhatamTarget, setHasKhatamTarget] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      // Check if khatam target exists to conditionally show the button
      const target = StorageService.getKhatamTarget();
      setHasKhatamTarget(!!(target && target.isActive));
  }, [isMenuOpen]); // Check every time menu opens

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reset reveal state whenever mode or level changes to ensure fresh rendering
  useEffect(() => {
      setRevealArabic(false);
      setRevealTranslation(false);
  }, [memorizationMode.isActive, memorizationMode.level, memorizationMode.hideTranslation]);

  // Handle Copy
  const handleCopyVerse = () => {
      const textToCopy = `${verse.text}\n\n"${verseTranslation || ''}"\n(QS. ${surahName}: ${verse.id})\n\nBashirah - Al Quran Digital\nbashirah.pages.dev`;
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setIsMenuOpen(false);
  };

  // Function to convert number to Arabic numerals
  const toArabicNumerals = (n: number) => {
    return n.toString().replace(/\d/g, d => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)]);
  };

  // --- SMART MEMORIZATION LOGIC ---
  const renderArabicText = () => {
      // 1. Default Normal View (Not in Memorization Mode)
      if (!memorizationMode.isActive) {
           return (
             <p 
                className={`font-arabic leading-[2.5] ${isAudioPlaying ? 'font-medium' : ''}`}
                style={{ fontSize: `${arabicFontSize}px` }}
             >
                <span className="text-quran-dark">{verse.text}</span>
                <span className="font-arabic text-quran-gold mx-2 select-none inline-block border border-quran-gold/40 rounded-full min-w-[40px] h-10 text-center leading-9 text-2xl">
                     {toArabicNumerals(verse.id)}
                </span>
             </p>
           );
      }

      // 2. If User Clicked "Reveal", show full text temporarily
      if (revealArabic) {
           return (
             <p 
                className="font-arabic leading-[2.5] animate-fade-in relative"
                style={{ fontSize: `${arabicFontSize}px` }}
             >
                <span className="text-quran-dark">{verse.text}</span>
                <span className="font-arabic text-quran-gold mx-2 select-none inline-block border border-quran-gold/40 rounded-full min-w-[40px] h-10 text-center leading-9 text-2xl">
                     {toArabicNumerals(verse.id)}
                </span>
                {/* Close Button to hide again */}
                <button 
                    onClick={(e) => { e.stopPropagation(); setRevealArabic(false); }}
                    className="absolute -top-6 -right-2 text-[10px] text-gray-400 bg-stone-100 px-2 py-1 rounded-full flex items-center gap-1 hover:bg-stone-200"
                >
                    <EyeOff className="w-3 h-3" /> Tutup
                </button>
             </p>
           );
      }

      // 3. HANDLE DIFFERENT LEVELS
      const level = memorizationMode.level;

      // Level: Normal (Blur Total)
      if (level === 'normal') {
          return (
             <div className="relative cursor-pointer group/blur" onClick={() => setRevealArabic(true)}>
                 <div className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover/blur:opacity-100 transition-opacity">
                     <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 text-xs font-bold text-quran-dark flex items-center gap-2 shadow-lg border border-stone-100 transform scale-95 group-hover/blur:scale-100 transition-transform">
                        <Eye className="w-4 h-4" /> Ketuk untuk melihat
                     </div>
                 </div>
                 <p 
                    className={`font-arabic leading-[2.5] blur-md select-none opacity-40 transition-all duration-300`}
                    style={{ fontSize: `${arabicFontSize}px` }}
                 >
                    <span className="text-quran-dark">{verse.text}</span>
                 </p>
             </div>
          );
      }
      
      // Level: Ghost (Samar/Transparent)
      if (level === 'ghost') {
          return (
             <div className="relative cursor-pointer" onClick={() => setRevealArabic(true)}>
                 {/* No Blur, just very low opacity */}
                 <p 
                    className={`font-arabic leading-[2.5] text-quran-dark opacity-10 hover:opacity-30 transition-opacity duration-300 select-none filter-none`}
                    style={{ fontSize: `${arabicFontSize}px` }}
                 >
                    {verse.text}
                    <span className="font-arabic text-quran-gold mx-2 inline-block border border-quran-gold/40 rounded-full min-w-[40px] h-10 text-center leading-9 text-2xl">
                         {toArabicNumerals(verse.id)}
                    </span>
                 </p>
             </div>
          );
      }

      // Split words for First-Last and Random
      // Use regex to split by whitespace to be safer with Arabic spacing
      const words = verse.text.trim().split(/\s+/);
      
      // Level: First & Last (Awal & Akhir)
      if (level === 'first-last') {
          return (
             <div className="font-arabic leading-[2.5] cursor-pointer" style={{ fontSize: `${arabicFontSize}px` }} onClick={() => setRevealArabic(true)} dir="rtl">
                 {words.map((word, idx) => {
                     // Logic: Show first 2 and last 2. 
                     // If verse is short (<= 4 words), show only first and last word.
                     let isVisible = false;
                     if (words.length <= 4) {
                         isVisible = idx === 0 || idx === words.length - 1;
                     } else {
                         isVisible = idx < 2 || idx >= words.length - 2;
                     }
                     
                     if (isVisible) {
                         return <span key={idx} className="text-quran-dark ml-1.5">{word} </span>;
                     }
                     
                     // Hidden word placeholder
                     return (
                        <span key={idx} className="inline-block bg-stone-200/50 rounded-md text-transparent select-none ml-1.5 min-w-[30px] h-4 align-middle opacity-50">
                             ....
                        </span>
                     );
                 })}
                 <span className="font-arabic text-quran-gold mx-2 select-none inline-block border border-quran-gold/40 rounded-full min-w-[40px] h-10 text-center leading-9 text-2xl">
                     {toArabicNumerals(verse.id)}
                 </span>
             </div>
          );
      }

      // Level: Random (Acak)
      if (level === 'random') {
           return (
             <div className="font-arabic leading-[2.5] cursor-pointer" style={{ fontSize: `${arabicFontSize}px` }} onClick={() => setRevealArabic(true)} dir="rtl">
                 {words.map((word, idx) => {
                     // Deterministic random based on verse ID and word index
                     const pseudoRandom = (verse.id + idx * 7) % 10; 
                     const shouldHide = pseudoRandom < 4; // 40% chance to hide
                     
                     if (!shouldHide) {
                         return <span key={idx} className="text-quran-dark ml-1.5">{word} </span>;
                     }
                     
                     return (
                        <span key={idx} className="inline-block bg-stone-200/50 rounded-md text-transparent select-none ml-1.5 min-w-[20px] h-4 align-middle opacity-50">
                             ...
                        </span>
                     );
                 })}
                 <span className="font-arabic text-quran-gold mx-2 select-none inline-block border border-quran-gold/40 rounded-full min-w-[40px] h-10 text-center leading-9 text-2xl">
                     {toArabicNumerals(verse.id)}
                 </span>
             </div>
          );
      }

      return null;
  };

  const isTranslationBlurred = memorizationMode.isActive && memorizationMode.hideTranslation && !revealTranslation;

  return (
    <div 
        id={`verse-${verse.id}`} 
        className={`py-10 border-b border-stone-200 last:border-0 transition-all duration-500 px-4 rounded-xl group scroll-mt-24 ${
            isAudioPlaying 
            ? 'bg-quran-gold/10 ring-1 ring-quran-gold/30 shadow-sm' 
            : isLastRead 
                ? 'bg-stone-50/80 ring-1 ring-stone-200' 
                : 'hover:bg-stone-50/50'
        }`}
    >
      {/* Action Bar / Meta */}
      <div className="flex justify-between items-start mb-6 relative">
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border transition-colors ${
                    isAudioPlaying ? 'bg-quran-gold text-white border-quran-gold' : 'bg-stone-100 text-quran-dark border-stone-200'
                }`}>
                    {surahId}:{verse.id}
                </span>

                {/* Page Number Indicator */}
                {verse.page_number && (
                    <span className="text-[10px] text-gray-400 font-medium px-2 py-0.5 bg-white border border-stone-100 rounded-full flex items-center gap-1">
                        <Hash className="w-2 h-2" /> Hal. {verse.page_number}
                    </span>
                )}
                
                {isAudioPlaying && (
                    <span className="text-[10px] uppercase font-bold tracking-wider text-quran-gold animate-pulse flex items-center gap-1">
                        <Volume2 className="w-3 h-3" /> Sedang Diputar
                    </span>
                )}

                {isLastRead && !isAudioPlaying && (
                    <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Terakhir Dibaca
                    </span>
                )}
            </div>
            <div className="flex items-center gap-2">
                 {isBookmarked && (
                    <span className="text-[10px] text-quran-gold flex items-center gap-1">
                        <Bookmark className="w-3 h-3 fill-current" /> Bookmark
                    </span>
                )}
                {hasNote && (
                     <span className="text-[10px] text-gray-500 flex items-center gap-1">
                        <FileText className="w-3 h-3" /> Ada Catatan
                    </span>
                )}
            </div>
        </div>
        
        <div className="flex items-center gap-1">
            {/* Play Button */}
            <button 
                onClick={onPlayAudio}
                className={`p-2 rounded-full transition-all ${isAudioPlaying ? 'text-quran-gold bg-white shadow-sm' : 'text-gray-300 hover:text-quran-gold hover:bg-stone-100'}`}
                title="Putar Ayat Ini"
            >
                <PlayCircle className={`w-6 h-6 ${isAudioPlaying ? 'fill-current' : ''}`} />
            </button>

            {/* Actions Dropdown */}
            <div className="relative" ref={menuRef}>
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={`p-2 rounded-full transition-colors ${isMenuOpen ? 'bg-stone-100 text-quran-dark' : 'text-gray-300 hover:text-quran-dark hover:bg-stone-100'}`}
                    title="Opsi Ayat"
                >
                    <MoreVertical className="w-5 h-5" />
                </button>

                {isMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-stone-100 z-10 overflow-hidden animate-fade-in origin-top-right">
                        
                        {/* UPDATE KHATAM OPTION (ONLY IF TARGET EXISTS) */}
                        {hasKhatamTarget && onUpdateKhatam && (
                            <button 
                                onClick={() => { onUpdateKhatam(verse.id); setIsMenuOpen(false); }}
                                className="w-full text-left px-4 py-3 text-sm text-emerald-700 bg-emerald-50 hover:bg-emerald-100 flex items-center gap-3 transition-colors border-b border-emerald-100"
                            >
                                <Target className="w-4 h-4 fill-current" />
                                <span className="font-bold">Update Progres Khatam</span>
                            </button>
                        )}

                        <button 
                            onClick={() => { onSetLastRead(verse.id); setIsMenuOpen(false); }}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-stone-50 flex items-center gap-3 transition-colors"
                        >
                            <BookOpen className="w-4 h-4 text-quran-gold" />
                            <span>Tandai Terakhir Dibaca</span>
                        </button>

                         <button 
                            onClick={handleCopyVerse}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-stone-50 flex items-center gap-3 transition-colors"
                        >
                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                            <span>{copied ? 'Tersalin' : 'Salin Ayat'}</span>
                        </button>

                        {onShare && (
                            <button 
                                onClick={() => { onShare(verse, surahName); setIsMenuOpen(false); }}
                                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-stone-50 flex items-center gap-3 transition-colors"
                            >
                                <Share2 className="w-4 h-4 text-gray-400" />
                                <span>Bagikan Gambar</span>
                            </button>
                        )}

                        <button 
                            onClick={() => { onToggleBookmark(verse.id); setIsMenuOpen(false); }}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-stone-50 flex items-center gap-3 transition-colors"
                        >
                            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'text-quran-gold fill-current' : 'text-gray-400'}`} />
                            <span>{isBookmarked ? 'Hapus Bookmark' : 'Bookmark'}</span>
                        </button>
                        <button 
                            onClick={() => { onTakeNote(verse.id); setIsMenuOpen(false); }}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-stone-50 flex items-center gap-3 transition-colors border-t border-stone-50"
                        >
                            <FileText className={`w-4 h-4 ${hasNote ? 'text-quran-gold fill-current' : 'text-gray-400'}`} />
                            <span>{hasNote ? 'Ubah Catatan' : 'Buat Catatan'}</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Arabic Text */}
      <div className="mb-8 w-full text-right relative" dir="rtl">
         {/* Memorization Logic Injection */}
         {showWordByWord && verse.words && verse.words.length > 0 ? (
             // Word By Word View (Overrides memorization)
             <div className="flex flex-wrap gap-y-6 justify-start items-end -mr-1">
                {verse.words.map((word, idx) => (
                    <WordItem 
                        key={`${word.id}-${idx}`} 
                        word={word} 
                        verseNumber={verse.id}
                        onClick={onWordClick}
                    />
                ))}
             </div>
         ) : (
             // Render with Memorization Logic
             renderArabicText()
         )}
      </div>

      {/* Translation Area */}
      {verseTranslation && (
        <div className="text-left max-w-3xl mb-6 relative">
             {/* Memorization Overlay for Translation */}
             {isTranslationBlurred && (
                <div 
                    onClick={() => setRevealTranslation(true)}
                    className="absolute inset-0 z-10 cursor-pointer flex items-center justify-center group/blur"
                >
                    <div className="bg-stone-100/50 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2 text-stone-500 font-bold text-sm shadow-sm border border-stone-200 opacity-0 group-hover/blur:opacity-100 transition-opacity">
                        <Eye className="w-4 h-4" /> Ketuk untuk melihat
                    </div>
                </div>
            )}

            <p 
                className={`text-gray-700 leading-relaxed font-serif italic transition-all duration-300 ${isAudioPlaying ? 'text-quran-dark font-medium' : ''} ${isTranslationBlurred ? 'blur-sm select-none opacity-50' : ''}`}
                style={{ fontSize: `${translationFontSize}px` }}
                onClick={() => isTranslationBlurred ? setRevealTranslation(true) : revealTranslation ? setRevealTranslation(false) : null}
            >
                {verseTranslation}
            </p>
        </div>
      )}

      {/* Tafsir Area */}
      {verseTafsir && (
          <div className="text-left max-w-3xl bg-stone-50 p-6 rounded-xl border border-stone-100 mt-4">
            <div className="flex items-center gap-2 mb-3 text-quran-gold font-bold text-xs uppercase tracking-widest border-b border-stone-200 pb-2">
                <BookOpen className="w-4 h-4" />
                <span>Tafsir</span>
            </div>
            <p className="text-gray-600 leading-relaxed font-sans text-sm text-justify">
                {verseTafsir}
            </p>
          </div>
      )}
    </div>
  );
};

export default VerseItem;
