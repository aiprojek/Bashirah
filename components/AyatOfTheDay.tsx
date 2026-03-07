
import React, { useState, useEffect, useRef } from 'react';
import { Share2, ArrowRight, Loader2, X, Quote, Check } from 'lucide-react';
import html2canvas from 'html2canvas';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { getAyatOfTheDayData } from '../services/quranService';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

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
    const { t } = useLanguage();
    const [ayat, setAyat] = useState<AyatData | null>(null);
    const [loading, setLoading] = useState(true);
    const [generatingImage, setGeneratingImage] = useState(false);
    const [shareSuccess, setShareSuccess] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState<'emerald' | 'mushaf' | 'night' | 'royal'>('emerald');
    
    // Ref for the hidden high-res card
    const exportRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const themes = {
        emerald: {
            name: t('theme_emerald'),
            bg: "from-[#1e3a34] to-[#0f2420]",
            text: "text-white",
            subText: "text-stone-200",
            accent: "text-quran-gold",
            badge: "bg-black/20 text-quran-gold/90 border-quran-gold/30",
            border: "border-white/10",
            dot: "bg-[#1e3a34]"
        },
        mushaf: {
            name: t('theme_mushaf'),
            bg: "from-[#fdfaf3] to-[#f4ede1]",
            text: "text-stone-800",
            subText: "text-stone-600",
            accent: "text-stone-900",
            badge: "bg-stone-200/50 text-stone-700 border-stone-300",
            border: "border-stone-200",
            dot: "bg-[#f4ede1]"
        },
        night: {
            name: t('theme_night'),
            bg: "from-[#1a1a1a] to-[#0f0f0f]",
            text: "text-gray-100",
            subText: "text-gray-400",
            accent: "text-white",
            badge: "bg-white/10 text-gray-300 border-white/20",
            border: "border-white/5",
            dot: "bg-[#1a1a1a]"
        },
        royal: {
            name: t('theme_royal'),
            bg: "from-[#1a2a6c] to-[#0f173d]",
            text: "text-white",
            subText: "text-blue-100/80",
            accent: "text-quran-gold",
            badge: "bg-black/20 text-quran-gold/90 border-quran-gold/30",
            border: "border-white/10",
            dot: "bg-[#1a2a6c]"
        }
    };

    const currentTheme = themes[selectedTheme];
    
    // Function to convert number to Arabic numerals
    const toArabicNumerals = (n: number) => {
      return n.toString().replace(/\d/g, d => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)]);
    };

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
                scale: 2, 
                backgroundColor: null, 
                useCORS: true,
                allowTaint: true,
                logging: false,
                windowWidth: 1080,
                onclone: (clonedDoc) => {
                    const clonedEl = clonedDoc.body.querySelector('[data-export-card="true"]') as HTMLElement;
                    if (clonedEl) {
                        clonedEl.style.display = 'flex';
                        const badges = clonedEl.querySelectorAll('.backdrop-blur-sm');
                        badges.forEach((b: any) => {
                            b.style.backdropFilter = 'none';
                            b.style.webkitBackdropFilter = 'none';
                        });
                    }
                }
            });

            const image = canvas.toDataURL("image/png");
            const fileName = `Ayat-Harian-${ayat?.surah.englishName}-${ayat?.verseNo}-${selectedTheme}.png`;

            // 1. Try Capacitor Native Share first if on Native
            if (Capacitor.isNativePlatform()) {
                await Share.share({
                    title: t('daily_verse'),
                    text: `${t('daily_verse')}: QS ${ayat?.surah.englishName} : ${ayat?.verseNo}. ${t('share_capt_text')}`,
                    url: image, // Share the Base64 data URL
                    dialogTitle: t('daily_verse'),
                });
                setGeneratingImage(false);
                return;
            }

            // 2. Web Share API fallback
            if (navigator.share && navigator.canShare) {
                const blob = await (await fetch(image)).blob();
                const file = new File([blob], fileName, { type: 'image/png' });
                if(navigator.canShare({ files: [file] })) {
                        await navigator.share({
                        title: t('daily_verse'),
                        text: `${t('daily_verse')}: QS ${ayat?.surah.englishName} : ${ayat?.verseNo}. ${t('share_capt_text')}`,
                        files: [file]
                    });
                    setGeneratingImage(false);
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

        } catch (error) {
            console.error("Failed to generate image", error);
            alert(t('share_failed'));
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
                        <p className="text-quran-dark font-serif animate-pulse">{t('loading_desc')}</p>
                    </div>
                ) : ayat ? (
                    <div className="w-full flex flex-col gap-4">
                        
                        {/* === VISIBLE CARD (UI) === */}
                        <div className={`relative aspect-square w-full overflow-hidden rounded-3xl bg-gradient-to-br ${currentTheme.bg} ${currentTheme.text} shadow-2xl border ${currentTheme.border} flex flex-col justify-between p-6 sm:p-8 transition-all duration-500`}>
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] pointer-events-none"></div>
                            {selectedTheme === 'emerald' && (
                                <>
                                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-quran-gold/20 rounded-full blur-3xl"></div>
                                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl"></div>
                                </>
                            )}
                            {selectedTheme === 'royal' && (
                                <>
                                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-quran-gold/20 rounded-full blur-3xl"></div>
                                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
                                </>
                            )}
                            
                            <div className="relative z-10 flex justify-center shrink-0">
                                <div className={`text-[10px] font-bold uppercase tracking-[0.2em] border px-3 py-1 rounded-full backdrop-blur-sm flex items-center gap-2 ${currentTheme.badge}`}>
                                    <Quote className="w-3 h-3 fill-current" /> {t('daily_verse')}
                                </div>
                            </div>

                            <div className="relative z-10 flex-1 flex flex-col items-center text-center overflow-y-auto custom-scrollbar my-2 px-2 scroll-smooth text-center">
                                 <p className="font-arabic text-2xl sm:text-3xl leading-[2.5] drop-shadow-md mb-4 w-full pt-12 pb-2 px-4 text-center" dir="rtl">
                                     {ayat.text}
                                 </p>
                                 <p className={`font-serif text-sm italic opacity-90 leading-relaxed max-w-xs mx-auto ${currentTheme.subText} pb-8`}>
                                     "{ayat.translation}"
                                 </p>
                            </div>

                            <div className="relative z-10 shrink-0 flex flex-col items-center gap-1 border-t border-white/10 pt-3">
                                <h4 className={`font-bold text-base ${currentTheme.accent}`}>{ayat.surah.englishName}</h4>
                                <span className="text-[10px] opacity-60 font-sans tracking-wide">{t('tab_surah')} {ayat.verseNo} • {ayat.surah.englishNameTranslation}</span>
                            </div>
                        </div>

                        {/* === HIDDEN EXPORT CARD (GENERATOR) === */}
                        <div 
                            ref={exportRef}
                            data-export-card="true"
                            style={{ 
                                position: 'fixed', top: 0, left: '-9999px',
                                width: '1080px', minHeight: '1080px', height: 'auto',
                            }}
                            className={`bg-gradient-to-br ${currentTheme.bg} ${currentTheme.text} flex flex-col justify-between p-[80px] relative`}
                        >
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] pointer-events-none"></div>
                            {selectedTheme === 'emerald' && (
                                <>
                                    <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-quran-gold/20 rounded-full blur-[100px]"></div>
                                    <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-emerald-500/20 rounded-full blur-[100px]"></div>
                                </>
                            )}
                            {selectedTheme === 'royal' && (
                                <>
                                    <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-quran-gold/20 rounded-full blur-[100px]"></div>
                                    <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px]"></div>
                                </>
                            )}

                            <div className="relative z-10 flex flex-col items-center h-full justify-center gap-12">
                                <div className={`text-2xl font-black uppercase tracking-[0.3em] border-2 px-10 py-4 rounded-full bg-black/40 flex items-center justify-center gap-4 min-w-[400px] h-[90px] ${currentTheme.badge}`}>
                                    <div className="flex items-center justify-center h-full">
                                        <Quote className="w-8 h-8 fill-current" />
                                    </div>
                                    <span className="leading-tight flex items-center h-full">{t('daily_verse')}</span>
                                </div>
                                 <div className="text-center w-full flex-1 flex flex-col justify-center py-10">
                                     <p className="font-arabic text-[64px] leading-[2] drop-shadow-lg mb-10 w-full py-6 px-10" dir="rtl">
                                         {ayat.text}
                                     </p>
                                     <p className={`font-serif text-[32px] italic opacity-90 leading-relaxed max-w-4xl mx-auto ${currentTheme.subText}`}>"{ayat.translation}"</p>
                                 </div>
                                <div className="flex flex-col items-center gap-10 border-t border-white/20 pt-8 pb-32 w-full">
                                    <h4 className={`font-bold text-4xl ${currentTheme.accent}`}>{ayat.surah.englishName}</h4>
                                    <span className="text-2xl opacity-60 font-sans tracking-wide">{t('tab_surah')} {ayat.verseNo} • {ayat.surah.englishNameTranslation}</span>
                                </div>
                            </div>
                            
                            <div className="absolute bottom-[80px] left-[80px] right-[80px] flex justify-between items-end z-20">
                                <div className="text-left">
                                    <h1 className={`text-5xl font-bold font-serif tracking-tight mb-2 ${selectedTheme === 'mushaf' ? 'text-stone-800' : 'text-white'}`}>Bashirah</h1>
                                    <p className={`text-xl font-sans uppercase tracking-[0.3em] opacity-60 ${selectedTheme === 'mushaf' ? 'text-stone-800' : 'text-white'}`}>{t('app_subtitle')}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-2xl font-sans font-medium tracking-wider opacity-60 ${selectedTheme === 'mushaf' ? 'text-stone-800' : 'text-white'}`}>bashirah.pages.dev</p>
                                </div>
                            </div>
                        </div>

                        {/* THEME SELECTOR */}
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 flex justify-around items-center gap-2 border border-white/10">
                            {Object.entries(themes).map(([key, theme]) => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedTheme(key as any)}
                                    className={`group flex flex-col items-center gap-1 transition-all ${selectedTheme === key ? 'scale-110' : 'opacity-60 hover:opacity-100'}`}
                                >
                                    <div className={`w-8 h-8 rounded-full border-2 ${selectedTheme === key ? 'border-quran-gold shadow-[0_0_10px_rgba(212,163,74,0.5)]' : 'border-white/20'} ${theme.dot} transition-all`}></div>
                                    <span className="text-[9px] font-bold text-white uppercase tracking-tighter">{theme.name}</span>
                                </button>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 justify-center w-full">
                            <button 
                                onClick={handleGoToVerse}
                                className="flex-1 bg-white hover:bg-stone-50 text-quran-dark py-3 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 border border-stone-200 whitespace-nowrap"
                            >
                                <span>{t('lib_view_verse')}</span>
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
                                <span>{generatingImage ? t('share_processing') : shareSuccess ? t('share_saved') : t('btn_share')}</span>
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default AyatOfTheDay;
