
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, Loader2, BookOpen, RefreshCw, Minimize2, Maximize2, ZoomIn, ZoomOut, Move, Bookmark, Check, Target } from 'lucide-react';
import { getVersesByPage } from '../services/quranService';
import { getPageUrl } from '../services/mushafService';
import * as StorageService from '../services/storageService';
import { LastReadData } from '../types';
import ConfirmationModal from './ConfirmationModal';

interface MushafViewProps {
  startPage: number;
  onClose?: () => void;
  translationId: string;
}

const MushafView: React.FC<MushafViewProps> = ({ startPage, onClose, translationId }) => {
  const [currentPage, setCurrentPage] = useState(startPage);
  const [loadingImage, setLoadingImage] = useState(true);
  const [error, setError] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  const [leftImageUrl, setLeftImageUrl] = useState<string>('');
  
  // Responsive State
  const [isDualPage, setIsDualPage] = useState(window.innerWidth >= 768);

  // Overlay State (Translation)
  const [showTranslationSheet, setShowTranslationSheet] = useState(false);
  const [translationContent, setTranslationContent] = useState<any[]>([]);
  const [loadingTranslation, setLoadingTranslation] = useState(false);

  // Mark as Read State
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const [lastReadPage, setLastReadPage] = useState<number | null>(null);
  
  // Khatam State
  const [hasKhatamTarget, setHasKhatamTarget] = useState(false);
  const [showKhatamConfirm, setShowKhatamConfirm] = useState(false);

  // Fullscreen toggle
  const [isFullscreen, setIsFullscreen] = useState(false);

  // --- ZOOM & PAN STATE ---
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Function to convert number to Arabic numerals
  const toArabicNumerals = (n: number) => {
    return n.toString().replace(/\d/g, d => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)]);
  };

  // --- TRANSITION STATE ---
  const [isTurning, setIsTurning] = useState(false);

  // Double Tap Detection
  const lastTapRef = useRef<number>(0);

  // Handle Resize for Dual Page
  useEffect(() => {
      const handleResize = () => {
          setIsDualPage(window.innerWidth >= 768);
          setScale(1);
          setPosition({ x: 0, y: 0 });
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setCurrentPage(startPage);
  }, [startPage]);

  // Check Last Read Status
  const checkLastRead = async () => {
      const lr = await StorageService.getLastRead();
      if (lr) {
          setLastReadPage(lr.pageNumber || null);
      }
      
      const target = await StorageService.getKhatamTarget();
      setHasKhatamTarget(!!(target && target.isActive));
  };

  useEffect(() => {
      checkLastRead();
      window.addEventListener('storage-update', checkLastRead);
      return () => window.removeEventListener('storage-update', checkLastRead);
  }, []);

  // LOGIC UNTUK SPREAD (Tampilan Buku)
  const rightPageNum = isDualPage 
    ? (currentPage % 2 !== 0 ? currentPage : currentPage - 1)
    : currentPage;
    
  const leftPageNum = rightPageNum + 1;

  // Load Image URLs on page change
  useEffect(() => {
    setLoadingImage(true);
    setError(false);
    setShowTranslationSheet(false);
    setScale(1);
    setPosition({ x: 0, y: 0 });

    const loadImages = async () => {
        try {
            const rightUrl = await getPageUrl(rightPageNum);
            setCurrentImageUrl(rightUrl);
            
            if(isDualPage && leftPageNum <= 604) {
                const leftUrl = await getPageUrl(leftPageNum);
                setLeftImageUrl(leftUrl);
            }
        } catch (e) {
            console.error("Error loading mushaf image", e);
            setError(true);
        }
    };
    
    loadImages();
  }, [currentPage, isDualPage, rightPageNum, leftPageNum]);

  // --- PAGE TURN LOGIC (FADE) ---
  const changePageWithAnimation = (newPage: number) => {
      if (newPage < 1 || newPage > 604) return;
      if (isTurning) return;

      setIsTurning(true);
      
      // Fade Out
      setTimeout(() => {
          setCurrentPage(newPage);
          // Fade In
          setIsTurning(false);
      }, 300); 
  };

  const handleNextPage = () => {
    const increment = isDualPage ? 2 : 1;
    if (currentPage < 604) {
        changePageWithAnimation(Math.min(currentPage + increment, 604));
    }
  };

  const handlePrevPage = () => {
    const decrement = isDualPage ? 2 : 1;
    if (currentPage > 1) {
        changePageWithAnimation(Math.max(currentPage - decrement, 1));
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value);
      if (val >= 1 && val <= 604) {
          setCurrentPage(val);
      }
  };

  // --- ZOOM CONTROLS ---
  const handleZoomIn = () => {
      setScale(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
      setScale(prev => {
          const newScale = Math.max(prev - 0.5, 1);
          if (newScale === 1) setPosition({ x: 0, y: 0 });
          return newScale;
      });
  };

  const handleResetZoom = () => {
      setScale(1);
      setPosition({ x: 0, y: 0 });
  };

  // --- PANNING / DRAGGING LOGIC ---
  const onPointerDown = (e: React.MouseEvent | React.TouchEvent) => {
      if (scale > 1) {
          setIsDragging(true);
          const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
          const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
          dragStartRef.current = { x: clientX - position.x, y: clientY - position.y };
          e.preventDefault();
      } else {
          // Swipe Logic for Page Turn
          if ('touches' in e) {
             dragStartRef.current = { x: e.touches[0].clientX, y: 0 };
          }
      }
  };

  const onPointerMove = (e: React.MouseEvent | React.TouchEvent) => {
      if (isDragging && scale > 1) {
          const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
          const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
          
          setPosition({
              x: clientX - dragStartRef.current.x,
              y: clientY - dragStartRef.current.y
          });
      }
  };

  const onPointerUp = (e: React.MouseEvent | React.TouchEvent) => {
      if (isDragging) {
          setIsDragging(false);
      } else if (scale === 1 && 'changedTouches' in e) {
          const touchEnd = e.changedTouches[0].clientX;
          const touchStart = dragStartRef.current.x;
          const distance = touchStart - touchEnd;
          
          if (distance > 50) handleNextPage(); // Swipe Left -> Next Page
          if (distance < -50) handlePrevPage(); // Swipe Right -> Prev Page
      }
  };

  // --- TAP HANDLERS ---
  const handleImageClick = (e: React.MouseEvent) => {
      if (scale > 1) return;
      const now = Date.now();
      const DOUBLE_TAP_DELAY = 300;
      if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
          handleOpenTranslation();
      } 
      lastTapRef.current = now;
  };

  const handleOpenTranslation = async () => {
      setShowTranslationSheet(true);
      setLoadingTranslation(true);
      try {
          const verses = await getVersesByPage(currentPage, translationId);
          setTranslationContent(verses);
      } catch (e) {
          console.error(e);
      } finally {
          setLoadingTranslation(false);
      }
  };

  // --- MARK AS READ LOGIC (Simple Bookmark) ---
  const handleMarkAsRead = async () => {
      setIsMarkingRead(true);
      try {
          // Fetch verses for this page to get the Surah ID and Verse ID of the LAST verse on page
          const verses = await getVersesByPage(currentPage, translationId);
          
          if (verses && verses.length > 0) {
              const firstVerse = verses[0]; // Start of page
              const lastVerse = verses[verses.length - 1]; // Use the last verse of the page
              
              await StorageService.setLastRead(
                  lastVerse.surah.number,
                  lastVerse.surah.englishName, // API returns englishName
                  lastVerse.numberInSurah,
                  currentPage
              );
          }
      } catch (e) {
          console.error("Gagal menandai halaman", e);
          alert("Gagal menyimpan progres. Periksa koneksi internet.");
      } finally {
          setIsMarkingRead(false);
      }
  };

  // --- UPDATE KHATAM LOGIC ---
  const performKhatamUpdate = async () => {
      setIsMarkingRead(true);
      try {
           const verses = await getVersesByPage(currentPage, translationId);
           if (verses && verses.length > 0) {
              const lastVerse = verses[verses.length - 1];
              await StorageService.updateKhatamProgress(currentPage, lastVerse.surah.number, lastVerse.surah.englishName, lastVerse.numberInSurah);
           } else {
               // Fallback if fetch fails (e.g. offline) - just update page number
               await StorageService.updateKhatamProgress(currentPage);
           }
      } catch(e) {
          // Fallback
          await StorageService.updateKhatamProgress(currentPage);
      } finally {
          setIsMarkingRead(false);
      }
  };

  const handleRetry = () => {
      setError(false);
      setLoadingImage(true);
      // Re-trigger effect by clearing url briefly
      setCurrentImageUrl('');
      setTimeout(() => setCurrentPage(prev => prev), 100);
  };

  const isCurrentPageLastRead = lastReadPage === currentPage;

  return (
    <div className="flex flex-col h-full bg-[#f0eadd] relative select-none">
        
        {/* 1. TOP HEADER */}
        {!isFullscreen && (
            <div className="bg-white border-b border-stone-200 px-4 py-2 sm:py-3 flex items-center justify-between shadow-sm z-20 shrink-0">
                <div className="flex items-center gap-3">
                    <span className="bg-quran-dark text-white text-xs font-bold px-2 py-1 rounded">
                        Juz {Math.ceil(rightPageNum / 20)}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-gray-700 hidden sm:inline">
                        {isDualPage 
                            ? `Hal ${rightPageNum} - ${Math.min(leftPageNum, 604)}` 
                            : `Hal ${currentPage}`
                        }
                    </span>
                </div>

                {/* ZOOM CONTROLS */}
                <div className="flex items-center bg-stone-100 rounded-lg p-1 mx-2">
                    <button onClick={handleZoomOut} className="p-1.5 hover:bg-white rounded-md transition-all text-gray-600 disabled:opacity-30" disabled={scale <= 1}>
                        <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-[10px] font-bold w-8 text-center text-gray-500">{Math.round(scale * 100)}%</span>
                    <button onClick={handleZoomIn} className="p-1.5 hover:bg-white rounded-md transition-all text-gray-600 disabled:opacity-30" disabled={scale >= 3}>
                        <ZoomIn className="w-4 h-4" />
                    </button>
                    {scale > 1 && (
                        <button onClick={handleResetZoom} className="ml-1 p-1.5 bg-quran-gold/10 text-quran-dark hover:bg-quran-gold/20 rounded-md" title="Reset Zoom">
                            <RefreshCw className="w-3 h-3" />
                        </button>
                    )}
                </div>
                
                <div className="flex items-center gap-2">
                    {/* Update Khatam Button (Only if Active) */}
                    {hasKhatamTarget && (
                         <button 
                            onClick={() => setShowKhatamConfirm(true)}
                            disabled={isMarkingRead}
                            className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-colors"
                            title="Update Progres Khatam"
                        >
                            <Target className="w-4 h-4" />
                        </button>
                    )}

                    {/* Mark as Read Button */}
                    <button 
                        onClick={handleMarkAsRead}
                        disabled={isMarkingRead || isCurrentPageLastRead}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                            isCurrentPageLastRead 
                            ? 'bg-green-100 text-green-700 border-green-200' 
                            : 'bg-white text-gray-600 border-stone-200 hover:bg-stone-50'
                        }`}
                        title={isCurrentPageLastRead ? "Halaman Terakhir Dibaca" : "Tandai Selesai Dibaca"}
                    >
                        {isMarkingRead ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isCurrentPageLastRead ? (
                            <>
                                <Check className="w-4 h-4" />
                                <span className="hidden sm:inline">Tandai</span>
                            </>
                        ) : (
                            <>
                                <Bookmark className="w-4 h-4" />
                                <span className="hidden sm:inline">Tandai</span>
                            </>
                        )}
                    </button>

                    <button 
                        onClick={() => setIsFullscreen(true)}
                        className="p-2 bg-stone-100 rounded-full hover:bg-stone-200 text-gray-600 hidden sm:block"
                        title="Layar Penuh"
                    >
                        <Maximize2 className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={handleOpenTranslation}
                        className="flex items-center gap-2 px-3 py-1.5 bg-quran-gold/10 text-quran-dark rounded-lg text-xs font-bold hover:bg-quran-gold/20"
                    >
                        <BookOpen className="w-3 h-3" /> <span className="hidden sm:inline">Terjemahan</span>
                    </button>
                </div>
            </div>
        )}

        {/* 2. MAIN CONTENT */}
        <div 
            ref={containerRef}
            className={`flex-1 w-full relative overflow-hidden flex items-center justify-center bg-[#fffbf2] ${isDragging ? 'cursor-move' : ''}`}
            onMouseDown={onPointerDown}
            onMouseMove={onPointerMove}
            onMouseUp={onPointerUp}
            onMouseLeave={() => setIsDragging(false)}
            onTouchStart={onPointerDown}
            onTouchMove={onPointerMove}
            onTouchEnd={onPointerUp}
            onClick={handleImageClick}
        >
             {/* Fullscreen Exit */}
             {isFullscreen && (
                 <button 
                    onClick={(e) => { e.stopPropagation(); setIsFullscreen(false); }}
                    className="absolute top-4 right-4 z-50 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-sm"
                 >
                     <Minimize2 className="w-5 h-5" />
                 </button>
             )}

             {/* Loading Indicator */}
             {loadingImage && !error && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center z-0 gap-3">
                     <Loader2 className="w-10 h-10 text-quran-gold animate-spin" />
                 </div>
             )}

             {/* BOOK CONTAINER */}
             <div 
                className={`relative flex items-center justify-center h-full w-auto transition-opacity duration-300 ease-in-out origin-center
                    ${isDualPage && scale === 1 ? 'shadow-2xl border-x-4 border-stone-800/5' : ''}
                    ${isTurning ? 'opacity-0' : 'opacity-100'}
                `}
                style={{
                    transform: scale > 1 
                        ? `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)` 
                        : undefined
                }}
             >
                 
                 {/* LEFT PAGE (Even Number) - Only in Dual Mode */}
                 {isDualPage && leftPageNum <= 604 && (
                     <div className="h-full w-auto flex justify-end items-center relative bg-white border-r border-stone-200 pointer-events-none [backface-visibility:hidden]">
                        {leftImageUrl && (
                            <img 
                                src={leftImageUrl} 
                                alt={`Page ${leftPageNum}`}
                                className="h-full w-auto object-contain"
                                draggable={false}
                            />
                        )}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-400 opacity-60">
                            {leftPageNum}
                        </div>
                        {/* Spine Shadow */}
                        <div className="absolute top-0 right-0 bottom-0 w-12 bg-gradient-to-l from-stone-400/20 to-transparent"></div>
                     </div>
                 )}

                 {/* RIGHT PAGE (Odd Number / Single Page) */}
                 <div className={`h-full w-auto flex ${isDualPage ? 'justify-start' : 'justify-center'} items-center relative bg-white pointer-events-none [backface-visibility:hidden]`}>
                     {currentImageUrl && (
                        <img 
                            id="mushaf-img-1"
                            src={currentImageUrl} 
                            alt={`Page ${rightPageNum}`}
                            className={`h-full w-auto object-contain ${!isDualPage && scale === 1 ? 'drop-shadow-xl' : ''}`}
                            onLoad={() => setLoadingImage(false)}
                            onError={() => { setLoadingImage(false); setError(true); }}
                            draggable={false}
                        />
                     )}
                     <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-400 opacity-60">
                        {rightPageNum}
                     </div>
                     {/* Spine Shadow */}
                     {isDualPage && (
                         <div className="absolute top-0 left-0 bottom-0 w-12 bg-gradient-to-r from-stone-400/20 to-transparent"></div>
                     )}
                 </div>

             </div>

             {/* Pan Indicator (Visual Hint when zoomed) */}
             {scale > 1 && (
                 <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 backdrop-blur-sm pointer-events-none z-30">
                     <Move className="w-3 h-3" /> Geser untuk melihat
                 </div>
             )}

             {/* Error Message */}
             {error && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-center p-4 bg-[#f4f1ea]">
                     <p className="text-gray-500 mb-4 text-sm">Gagal memuat gambar.</p>
                     <button onClick={handleRetry} className="flex items-center gap-2 px-4 py-2 bg-quran-dark text-white rounded-lg text-sm">
                        <RefreshCw className="w-4 h-4" /> Coba Lagi
                     </button>
                 </div>
             )}
        </div>

        {/* 3. BOTTOM NAVIGATION */}
        {!isFullscreen && (
            <div className="bg-white border-t border-stone-200 p-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20 shrink-0 safe-area-bottom">
                <div className="flex items-center gap-2 max-w-lg mx-auto">
                     <button 
                        onClick={handlePrevPage} 
                        disabled={currentPage <= 1 || isTurning}
                        className="p-3 rounded-xl bg-stone-50 hover:bg-stone-100 text-quran-dark disabled:opacity-30 transition-colors"
                     >
                         <ChevronLeft className="w-5 h-5" />
                     </button>

                     <div className="flex-1 px-2">
                         <input 
                            type="range" 
                            min="1" 
                            max="604" 
                            value={currentPage} 
                            onChange={handleSliderChange}
                            disabled={isTurning}
                            className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-quran-gold"
                         />
                         {/* Dynamic Labels */}
                         <div className="flex justify-between text-[10px] text-gray-500 mt-1 font-bold font-sans">
                             <span>1</span>
                             <span className="text-quran-gold text-xs">
                                {isDualPage 
                                    ? `${rightPageNum} - ${Math.min(leftPageNum, 604)}` 
                                    : currentPage
                                }
                             </span>
                             <span>604</span>
                         </div>
                     </div>

                     <button 
                        onClick={handleNextPage} 
                        disabled={currentPage >= 604 || isTurning}
                        className="p-3 rounded-xl bg-stone-50 hover:bg-stone-100 text-quran-dark disabled:opacity-30 transition-colors"
                     >
                         <ChevronRight className="w-5 h-5" />
                     </button>
                </div>
            </div>
        )}

        {/* BOTTOM SHEET: Contextual Translation */}
        <div 
            className={`absolute inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.2)] transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1) z-40 flex flex-col border-t border-stone-100 max-h-[75vh] ${
                showTranslationSheet ? 'translate-y-0' : 'translate-y-[110%]'
            }`}
        >
            <div 
                className="w-full h-9 flex items-center justify-center cursor-pointer border-b border-stone-100 bg-stone-50 rounded-t-3xl"
                onClick={() => setShowTranslationSheet(false)}
            >
                <div className="w-12 h-1.5 bg-stone-300 rounded-full"></div>
            </div>

            <div className="px-6 py-3 flex items-center justify-between bg-white border-b border-stone-100">
                <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-quran-gold" />
                    <h3 className="font-bold text-quran-dark">Terjemahan Halaman {currentPage}</h3>
                </div>
                <button 
                    onClick={() => setShowTranslationSheet(false)} 
                    className="p-2 bg-stone-100 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-50/50 custom-scrollbar pb-20">
                {loadingTranslation ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
                        <Loader2 className="w-8 h-8 text-quran-gold animate-spin" />
                        <span className="text-xs">Mengambil data ayat...</span>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {translationContent.map((verse: any, idx: number) => (
                            <div key={idx} className="bg-white p-5 rounded-xl border border-stone-100 shadow-sm">
                                <div className="flex justify-between items-center mb-3 border-b border-stone-50 pb-2">
                                    <span className="text-[10px] font-bold text-white bg-quran-dark px-2 py-0.5 rounded-full uppercase tracking-wide">
                                        {verse.surah.englishName} : {verse.numberInSurah}
                                    </span>
                                </div>
                                 <p className="text-right font-arabic text-2xl text-gray-800 dark:text-gray-100 leading-[2.5] mb-4" dir="rtl">
                                     {verse.text}
                                     <span className="verse-ornament">
                                         {toArabicNumerals(verse.numberInSurah)}
                                     </span>
                                 </p>
                                <p className="text-sm text-gray-600 leading-relaxed font-serif">
                                    {verse.translation}
                                </p>
                            </div>
                        ))}
                         {translationContent.length === 0 && <p className="text-center text-gray-400 text-sm py-10">Data tidak tersedia untuk halaman ini.</p>}
                    </div>
                )}
            </div>
        </div>

        {/* Overlay Backdrop */}
        {showTranslationSheet && (
            <div 
                className="absolute inset-0 bg-black/20 z-30 backdrop-blur-[1px] transition-opacity duration-300"
                onClick={() => setShowTranslationSheet(false)}
            />
        )}

        <ConfirmationModal 
            isOpen={showKhatamConfirm}
            onClose={() => setShowKhatamConfirm(false)}
            onConfirm={performKhatamUpdate}
            title="Update Khatam?"
            message={`Anda akan memperbarui progres khatam Anda ke halaman ${currentPage}. Lanjutkan?`}
            confirmText="Ya, Update"
            variant="primary"
        />
    </div>
  );
};

export default MushafView;
