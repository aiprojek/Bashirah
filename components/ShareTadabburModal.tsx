
import React, { useState, useRef } from 'react';
import { X, Share2, Download, Check, Loader2, Quote } from 'lucide-react';
import html2canvas from 'html2canvas';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { useLanguage } from '../contexts/LanguageContext';
import { TadabburTag } from '../types';

interface ShareTadabburModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    content: string;
    tag: TadabburTag;
    timestamp: number;
}

const ShareTadabburModal: React.FC<ShareTadabburModalProps> = ({
    isOpen,
    onClose,
    title,
    content,
    tag,
    timestamp
}) => {
    const { t } = useLanguage();
    const [generatingImage, setGeneratingImage] = useState(false);
    const [shareSuccess, setShareSuccess] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState<'emerald' | 'mushaf' | 'night' | 'royal'>('emerald');
    const exportRef = useRef<HTMLDivElement>(null);

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
    const date = new Date(timestamp);

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
                        // Fix backdrop-filter blur which is not supported by html2canvas
                        const badges = clonedEl.querySelectorAll('.backdrop-blur-sm');
                        badges.forEach((b: any) => {
                            b.style.backdropFilter = 'none';
                            b.style.webkitBackdropFilter = 'none';
                        });
                    }
                }
            });

            const image = canvas.toDataURL("image/png");
            const fileName = `Bashirah-Tadabbur-${Date.now()}.png`;

            if (Capacitor.isNativePlatform()) {
                const base64Data = image.split(',')[1];
                const savedFile = await Filesystem.writeFile({
                    path: fileName,
                    data: base64Data,
                    directory: Directory.Cache
                });

                await Share.share({
                    title: title,
                    text: t('tadabbur_share_capt'),
                    url: savedFile.uri,
                    dialogTitle: t('tadabbur_share_title'),
                });
                setGeneratingImage(false);
                return;
            }

            if (navigator.share && navigator.canShare) {
                const blob = await (await fetch(image)).blob();
                const file = new File([blob], fileName, { type: 'image/png' });

                if (navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title: title,
                        text: t('tadabbur_share_capt'),
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

            setShareSuccess(true);
            setTimeout(() => setShareSuccess(false), 3000);

        } catch (error) {
            console.error("Failed to generate image", error);
            alert(t('share_failed'));
        } finally {
            setGeneratingImage(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 animate-fade-in">
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

                <div className="w-full flex flex-col gap-4">
                    {/* PREVIEW CARD */}
                    <div className={`relative aspect-square w-full overflow-hidden rounded-3xl bg-gradient-to-br ${currentTheme.bg} ${currentTheme.text} shadow-2xl border ${currentTheme.border} flex flex-col justify-between p-6 transition-all duration-500`}>
                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] pointer-events-none"></div>
                        
                        <div className="relative z-10 flex justify-center shrink-0">
                            <div className={`text-[10px] font-bold uppercase tracking-[0.2em] border px-4 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-2 ${currentTheme.badge}`}>
                                <Quote className="w-3 h-3 fill-current" /> 
                                <span className="leading-none">{t('tadabbur_share_title')}</span>
                            </div>
                        </div>

                        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center overflow-y-auto custom-scrollbar my-4 px-2 scroll-smooth">
                            <h3 className={`text-xl font-bold font-serif mb-4 leading-tight ${currentTheme.accent}`}>{title}</h3>
                            <div className="relative">
                                 <p className={`font-serif text-sm leading-relaxed italic opacity-90 ${currentTheme.subText}`}>
                                    {content}
                                </p>
                            </div>
                        </div>

                        <div className="relative z-10 shrink-0 flex flex-col items-center gap-1 border-t border-white/10 pt-4">
                            <div className="flex items-center gap-2 text-[10px] opacity-60 font-sans tracking-widest uppercase">
                                <span className="leading-none">{date.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>

                    {/* HIDDEN EXPORT CARD */}
                    <div
                        ref={exportRef}
                        data-export-card="true"
                        style={{ position: 'fixed', top: 0, left: '-9999px', width: '1080px', minHeight: '1080px', height: 'auto' }}
                        className={`bg-gradient-to-br ${currentTheme.bg} ${currentTheme.text} flex flex-col justify-between p-[100px] relative`}
                    >
                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] pointer-events-none"></div>
                        
                        <div className="relative z-10 flex flex-col items-center h-full justify-center gap-16">
                            <div className={`text-2xl font-black uppercase tracking-[0.5em] border-2 px-12 py-5 rounded-full bg-black/30 flex items-center justify-center gap-6 min-w-[500px] h-[100px] ${currentTheme.badge}`}>
                                <div className="flex items-center justify-center h-full">
                                    <Quote className="w-10 h-10 fill-current" />
                                </div>
                                <span className="leading-tight flex items-center h-full">{t('tadabbur_share_title')}</span>
                            </div>
                            
                            <div className="text-center w-full flex-1 flex flex-col items-center justify-center py-10 px-10">
                                <h2 className={`text-6xl font-bold font-serif mb-16 tracking-tight leading-tight max-w-4xl ${currentTheme.accent}`}>{title}</h2>
                                <p className={`font-serif text-[42px] italic opacity-95 leading-[1.8] max-w-4xl mx-auto ${currentTheme.subText}`}>
                                    {content}
                                </p>
                            </div>

                            <div className="flex flex-col items-center gap-4 border-t border-white/20 pt-16 pb-32 w-full">
                                <div className="flex items-center justify-center gap-5 text-2xl opacity-60 font-sans tracking-[0.3em] uppercase h-[40px]">
                                    <span className="leading-tight flex items-center h-full whitespace-nowrap">{date.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                </div>
                            </div>
                        </div>

                        <div className="absolute bottom-[100px] left-[100px] right-[100px] flex justify-between items-end z-20">
                            <div className="text-left">
                                <h1 className={`text-6xl font-bold font-serif tracking-tight mb-2 ${selectedTheme === 'mushaf' ? 'text-stone-800' : 'text-white'}`}>Bashirah</h1>
                                <p className={`text-2xl font-sans uppercase tracking-[0.4em] opacity-60 ${selectedTheme === 'mushaf' ? 'text-stone-800' : 'text-white'}`}>{t('app_subtitle')}</p>
                            </div>
                            <div className="text-right">
                                <p className={`text-3xl font-sans font-medium tracking-wider opacity-60 ${selectedTheme === 'mushaf' ? 'text-stone-800' : 'text-white'}`}>bashirah.pages.dev</p>
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

                    <button
                        onClick={handleShare}
                        disabled={generatingImage || shareSuccess}
                        className={`w-full text-white py-4 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-3 whitespace-nowrap ${shareSuccess ? 'bg-green-600' : 'bg-quran-dark/80 hover:bg-black/90'}`}
                    >
                        {generatingImage ? (
                            <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                        ) : shareSuccess ? (
                            <Check className="w-4 h-4 flex-shrink-0" />
                        ) : (
                            <Share2 className="w-4 h-4 flex-shrink-0" />
                        )}
                        <span>{generatingImage ? t('share_processing') : shareSuccess ? t('share_saved') : t('btn_share_image')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareTadabburModal;
