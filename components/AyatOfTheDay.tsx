
import React, { useState, useEffect, useRef } from 'react';
import { Share2, ArrowRight, Loader2, X, Quote } from 'lucide-react';
import html2canvas from 'html2canvas';
import { getAyatOfTheDayData } from '../services/quranService';
import { useNavigate } from 'react-router-dom';

interface AyatData {
    surah: {
        number: number;
        name: string;
        englishName: string;
        englishNameTranslation: string;
    };
    verseNo: number;
    text: string;
    translation: string;
}

interface AyatOfTheDayProps {
    isOpen: boolean;
    onClose: () => void;
    translationId: string;
}

const AyatOfTheDay: React.FC<AyatOfTheDayProps> = ({ isOpen, onClose, translationId }) => {
    const [ayat, setAyat] = useState<AyatData | null>(null);
    const [loading, setLoading] = useState(true);
    const [generatingImage, setGeneratingImage] = useState(false);
    
    // Ref for the hidden high-res card (for image generation)
    const exportRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Fetch data when modal opens
    useEffect(() => {
        if (isOpen && !ayat) {
            const fetchAyat = async () => {
                setLoading(true);
                const data = await getAyatOfTheDayData(translationId);
                if (data) {
                    setAyat(data as AyatData);
                }
                setLoading(false);
            };
            fetchAyat();
        }
    }, [isOpen, translationId, ayat]);

    const handleShare = async () => {
        if (!exportRef.current) return;
        setGeneratingImage(true);

        try {
            // We capture the HIDDEN export card, not the visible one.
            const canvas = await html2canvas(exportRef.current, {
                scale: 1, // Element is already large (1080px width), so scale 1 is fine
                backgroundColor: null, 
                useCORS: true,
                logging: false,
                // Ensure we capture the full height of the hidden element
                windowWidth: 1920,
                windowHeight: 3000,
            });

            const image = canvas.toDataURL("image/png");
            const fileName = `Ayat-Harian-${ayat?.surah.englishName}-${ayat?.verseNo}.png`;
            
            if (navigator.share) {
                const blob = await (await fetch(image)).blob();
                const file = new File([blob], fileName, { type: 'image/png' });
                
                if(navigator.canShare && navigator.canShare({ files: [file] })) {
                     await navigator.share({
                        title: 'Ayat of the Day',
                        text: `Ayat Harian: QS ${ayat?.surah.englishName} : ${ayat?.verseNo}`,
                        files: [file]
                    });
                    setGeneratingImage(false);
                    return;
                }
            }

            const link = document.createElement('a');
            link.href = image;
            link.download = fileName;
            link.click();

        } catch (error) {
            console.error("Failed to generate image", error);
            alert("Gagal membuat gambar. Silakan coba lagi.");
        } finally {
            setGeneratingImage(false);
        }
    };

    const handleGoToVerse = () => {
        if (ayat) {
            navigate(`/surah/${ayat.surah.number}#verse-${ayat.verseNo}`);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-fade-in">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-quran-dark/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content - Constrained width for UI */}
            <div className="relative w-full max-w-sm z-10 flex flex-col items-center">
                
                {/* Close Button Outside */}
                <button 
                    onClick={onClose}
                    className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors p-2 bg-white/10 rounded-full"
                >
                    <X className="w-6 h-6" />
                </button>

                {loading ? (
                     <div className="bg-white rounded-3xl p-10 shadow-2xl border border-stone-100 flex flex-col items-center justify-center aspect-square w-full">
                        <Loader2 className="w-10 h-10 text-quran-gold animate-spin mb-4" />
                        <p className="text-quran-dark font-serif animate-pulse">Menyiapkan ayat pilihan...</p>
                    </div>
                ) : ayat ? (
                    <div className="w-full flex flex-col gap-4">
                        
                        {/* === VISIBLE CARD (UI) === */}
                        {/* Keeps the 1:1 Aspect Ratio and Scrollable Content for User Viewing */}
                        <div 
                            className="relative aspect-square w-full overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e3a34] to-[#0f2420] text-white shadow-2xl border border-white/10 flex flex-col justify-between p-6 sm:p-8"
                        >
                            {/* Decorative Elements */}
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] pointer-events-none"></div>
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-quran-gold/20 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl"></div>
                            
                            {/* Top Badge */}
                            <div className="relative z-10 flex justify-center shrink-0">
                                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-quran-gold/90 border border-quran-gold/30 px-3 py-1 rounded-full bg-black/20 backdrop-blur-sm flex items-center gap-2">
                                    <Quote className="w-3 h-3 fill-current" /> Ayat Harian
                                </div>
                            </div>

                            {/* Main Text Content - Scrollable if long */}
                            {/* Removed vertical padding from container, added specific padding to text elements to prevent clipping */}
                            <div className="relative z-10 flex-1 flex flex-col items-center text-center overflow-y-auto custom-scrollbar my-2 px-2 scroll-smooth">
                                 {/* Increased leading for desktop (sm:leading-[4]) to fix tight spacing */}
                                 <p className="font-arabic text-2xl sm:text-3xl leading-[3] sm:leading-[4] drop-shadow-md mb-4 w-full pt-12 pb-2 px-1" dir="rtl">
                                     {ayat.text}
                                 </p>
                                 <p className="font-serif text-sm italic opacity-90 leading-relaxed max-w-xs mx-auto text-stone-200 pb-8">
                                     "{ayat.translation}"
                                 </p>
                            </div>

                            {/* Footer Info */}
                            <div className="relative z-10 shrink-0 flex flex-col items-center gap-1 border-t border-white/10 pt-3">
                                <h4 className="font-bold text-base text-quran-gold">{ayat.surah.englishName}</h4>
                                <span className="text-[10px] opacity-60 font-sans tracking-wide">Ayat {ayat.verseNo} • {ayat.surah.englishNameTranslation}</span>
                            </div>
                        </div>

                        {/* === HIDDEN EXPORT CARD (GENERATOR) === */}
                        {/* High Resolution, No Scrollbar, Auto Height to fit all content */}
                        <div 
                            ref={exportRef}
                            style={{ 
                                position: 'fixed', 
                                top: 0,
                                left: '-9999px', // Hide off-screen
                                width: '1080px', // Standard Social Media Width
                                minHeight: '1080px', // At least square
                                height: 'auto', // Grow if text is long
                            }}
                            className="bg-gradient-to-br from-[#1e3a34] to-[#0f2420] text-white flex flex-col justify-between p-[80px] relative"
                        >
                             {/* Decorative Elements Scaled Up */}
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] pointer-events-none"></div>
                            <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-quran-gold/20 rounded-full blur-[100px]"></div>
                            <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-emerald-500/20 rounded-full blur-[100px]"></div>

                            <div className="relative z-10 flex flex-col items-center h-full justify-center gap-12">
                                {/* Badge */}
                                <div className="text-2xl font-bold uppercase tracking-[0.3em] text-quran-gold/90 border-2 border-quran-gold/30 px-8 py-3 rounded-full bg-black/20 flex items-center gap-4">
                                    <Quote className="w-6 h-6 fill-current" /> Ayat Harian
                                </div>

                                {/* Content - Auto grow, no scroll */}
                                <div className="text-center w-full flex-1 flex flex-col justify-center py-10">
                                    {/* Added extra padding for export as well just in case */}
                                    <p className="font-arabic text-[64px] leading-[3] drop-shadow-lg mb-10 w-full py-6 px-10" dir="rtl">
                                        {ayat.text}
                                    </p>
                                    <p className="font-serif text-[32px] italic opacity-90 leading-relaxed max-w-4xl mx-auto text-stone-200">
                                        "{ayat.translation}"
                                    </p>
                                </div>

                                {/* Footer (Surah Info) - Added padding bottom to separate from new branding footer */}
                                <div className="flex flex-col items-center gap-3 border-t border-white/20 pt-8 pb-32 w-full">
                                    <h4 className="font-bold text-4xl text-quran-gold">{ayat.surah.englishName}</h4>
                                    <span className="text-2xl opacity-60 font-sans tracking-wide">Ayat {ayat.verseNo} • {ayat.surah.englishNameTranslation}</span>
                                </div>
                            </div>
                            
                            {/* BRANDING FOOTER */}
                            <div className="absolute bottom-[80px] left-[80px] right-[80px] flex justify-between items-end z-20">
                                {/* Left: Branding */}
                                <div className="text-left">
                                    <h1 className="text-5xl font-bold font-serif tracking-tight mb-2 text-white">Bashirah</h1>
                                    <p className="text-xl font-sans uppercase tracking-[0.3em] opacity-60 text-white">Al Quran Digital</p>
                                </div>
                                
                                {/* Right: URL */}
                                <div className="text-right">
                                    <p className="text-2xl font-sans font-medium tracking-wider opacity-60 text-white">bashirah.pages.dev</p>
                                </div>
                            </div>
                        </div>


                        {/* Action Buttons Row */}
                        <div className="flex gap-3 justify-center w-full">
                            <button 
                                onClick={handleGoToVerse}
                                className="flex-1 bg-white hover:bg-stone-50 text-quran-dark py-3 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 border border-stone-200 whitespace-nowrap"
                            >
                                <span>Baca Tafsir</span>
                                <ArrowRight className="w-4 h-4 flex-shrink-0" />
                            </button>
                            <button 
                                onClick={handleShare}
                                disabled={generatingImage}
                                className="flex-1 bg-quran-gold hover:bg-yellow-500 text-white py-3 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                            >
                                {generatingImage ? <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" /> : <Share2 className="w-4 h-4 flex-shrink-0" />}
                                <span>{generatingImage ? 'Membuat...' : 'Bagikan Gambar'}</span>
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default AyatOfTheDay;
