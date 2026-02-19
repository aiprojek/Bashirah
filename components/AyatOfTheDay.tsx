import React, { useState, useEffect, useRef } from 'react';
import { Share2, ArrowRight, Loader2, X, Quote, Check } from 'lucide-react';
import html2canvas from 'html2canvas';
import { getAyatOfTheDayData } from '../services/quranService';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';

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
    const [shareSuccess, setShareSuccess] = useState(false);
    
    // Ref for the hidden high-res card
    const exportRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

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
        setShareSuccess(false);

        try {
            const canvas = await html2canvas(exportRef.current, {
                scale: 1, 
                backgroundColor: null, 
                useCORS: true,
                logging: false,
                windowWidth: 1080,
                windowHeight: 1080, 
            });

            const image = canvas.toDataURL("image/png");
            const fileName = `Ayat-Harian-${ayat?.surah.englishName}-${ayat?.verseNo}.png`;

            // 1. NATIVE ANDROID/IOS SHARE
            if (Capacitor.isNativePlatform()) {
                try {
                    // Write base64 to temp file
                    const base64Data = image.split(',')[1];
                    const savedFile = await Filesystem.writeFile({
                        path: fileName,
                        data: base64Data,
                        directory: Directory.Cache
                    });

                    // Share the file URI
                    await Share.share({
                        title: 'Ayat Harian',
                        text: `Ayat Harian: QS ${ayat?.surah.englishName} : ${ayat?.verseNo}`,
                        url: savedFile.uri,
                    });
                } catch (err) {
                    console.error("Native share failed", err);
                    alert("Gagal membagikan gambar.");
                }
            } 
            // 2. DESKTOP / WEB SHARE
            else {
                // Web Share API (Mobile Browsers)
                if (navigator.share && navigator.canShare) {
                    const blob = await (await fetch(image)).blob();
                    const file = new File([blob], fileName, { type: 'image/png' });
                    if(navigator.canShare({ files: [file] })) {
                         await navigator.share({
                            title: 'Ayat of the Day',
                            text: `Ayat Harian: QS ${ayat?.surah.englishName} : ${ayat?.verseNo}`,
                            files: [file]
                        });
                        return;
                    }
                }

                // Fallback: Download for Desktop
                const link = document.createElement('a');
                link.href = image;
                link.download = fileName;
                link.click();
                
                // Show Success feedback
                setShareSuccess(true);
                setTimeout(() => setShareSuccess(false), 3000);
            }

        } catch (error) {
            console.error("Failed to generate image", error);
            alert("Gagal membuat gambar.");
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
            <div 
                className="absolute inset-0 bg-quran-dark/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative w-full max-w-sm z-10 flex flex-col items-center">
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
                        <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e3a34] to-[#0f2420] text-white shadow-2xl border border-white/10 flex flex-col justify-between p-6 sm:p-8">
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] pointer-events-none"></div>
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-quran-gold/20 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl"></div>
                            
                            <div className="relative z-10 flex justify-center shrink-0">
                                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-quran-gold/90 border border-quran-gold/30 px-3 py-1 rounded-full bg-black/20 backdrop-blur-sm flex items-center gap-2">
                                    <Quote className="w-3 h-3 fill-current" /> Ayat Harian
                                </div>
                            </div>

                            <div className="relative z-10 flex-1 flex flex-col items-center text-center overflow-y-auto custom-scrollbar my-2 px-2 scroll-smooth">
                                 <p className="font-arabic text-2xl sm:text-3xl leading-[3] sm:leading-[4] drop-shadow-md mb-4 w-full pt-12 pb-2 px-1" dir="rtl">
                                     {ayat.text}
                                 </p>
                                 <p className="font-serif text-sm italic opacity-90 leading-relaxed max-w-xs mx-auto text-stone-200 pb-8">
                                     "{ayat.translation}"
                                 </p>
                            </div>

                            <div className="relative z-10 shrink-0 flex flex-col items-center gap-1 border-t border-white/10 pt-3">
                                <h4 className="font-bold text-base text-quran-gold">{ayat.surah.englishName}</h4>
                                <span className="text-[10px] opacity-60 font-sans tracking-wide">Ayat {ayat.verseNo} • {ayat.surah.englishNameTranslation}</span>
                            </div>
                        </div>

                        {/* === HIDDEN EXPORT CARD (GENERATOR) === */}
                        <div 
                            ref={exportRef}
                            style={{ 
                                position: 'fixed', top: 0, left: '-9999px',
                                width: '1080px', minHeight: '1080px', height: 'auto',
                            }}
                            className="bg-gradient-to-br from-[#1e3a34] to-[#0f2420] text-white flex flex-col justify-between p-[80px] relative"
                        >
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] pointer-events-none"></div>
                            <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-quran-gold/20 rounded-full blur-[100px]"></div>
                            <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-emerald-500/20 rounded-full blur-[100px]"></div>

                            <div className="relative z-10 flex flex-col items-center h-full justify-center gap-12">
                                <div className="text-2xl font-bold uppercase tracking-[0.3em] text-quran-gold/90 border-2 border-quran-gold/30 px-8 py-3 rounded-full bg-black/20 flex items-center gap-4">
                                    <Quote className="w-6 h-6 fill-current" /> Ayat Harian
                                </div>
                                <div className="text-center w-full flex-1 flex flex-col justify-center py-10">
                                    <p className="font-arabic text-[64px] leading-[3] drop-shadow-lg mb-10 w-full py-6 px-10" dir="rtl">{ayat.text}</p>
                                    <p className="font-serif text-[32px] italic opacity-90 leading-relaxed max-w-4xl mx-auto text-stone-200">"{ayat.translation}"</p>
                                </div>
                                <div className="flex flex-col items-center gap-3 border-t border-white/20 pt-8 pb-32 w-full">
                                    <h4 className="font-bold text-4xl text-quran-gold">{ayat.surah.englishName}</h4>
                                    <span className="text-2xl opacity-60 font-sans tracking-wide">Ayat {ayat.verseNo} • {ayat.surah.englishNameTranslation}</span>
                                </div>
                            </div>
                            
                            <div className="absolute bottom-[80px] left-[80px] right-[80px] flex justify-between items-end z-20">
                                <div className="text-left">
                                    <h1 className="text-5xl font-bold font-serif tracking-tight mb-2 text-white">Bashirah</h1>
                                    <p className="text-xl font-sans uppercase tracking-[0.3em] opacity-60 text-white">Al Quran Digital</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-sans font-medium tracking-wider opacity-60 text-white">bashirah.pages.dev</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
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
                                disabled={generatingImage || shareSuccess}
                                className={`flex-1 text-white py-3 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${shareSuccess ? 'bg-green-600' : 'bg-quran-gold hover:bg-yellow-500'}`}
                            >
                                {generatingImage ? (
                                    <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                                ) : shareSuccess ? (
                                    <Check className="w-4 h-4 flex-shrink-0" />
                                ) : (
                                    <Share2 className="w-4 h-4 flex-shrink-0" />
                                )}
                                <span>{generatingImage ? 'Memproses...' : shareSuccess ? 'Tersimpan!' : 'Bagikan'}</span>
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default AyatOfTheDay;