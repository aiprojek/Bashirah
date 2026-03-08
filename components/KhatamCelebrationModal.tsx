
import React, { useState, useEffect, useRef } from 'react';
import { X, Share2, Download, Trophy, Star, Heart, CheckCircle2, User } from 'lucide-react';
import html2canvas from 'html2canvas';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { useLanguage } from '../contexts/LanguageContext';
import { KhatamTarget } from '../types';
import * as StorageService from '../services/storageService';

interface KhatamCelebrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    target: KhatamTarget | null;
}

const KhatamCelebrationModal: React.FC<KhatamCelebrationModalProps> = ({ isOpen, onClose, target }) => {
    const { t } = useLanguage();
    const [name, setName] = useState(target?.userName || '');
    const [isSharing, setIsSharing] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [canvasImage, setCanvasImage] = useState<string | null>(null);
    const [totalKhatam, setTotalKhatam] = useState(0);
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            loadAnalytics();
            if (target?.userName) setName(target.userName);
            const loadStats = async () => {
                const count = await StorageService.getTotalKhatamCount();
                setTotalKhatam(count);
            };
            loadStats();
        }
    }, [isOpen, target]);

    const loadAnalytics = async () => {
        const anal = await StorageService.calculateKhatamAnalytics();
        setStats(anal);
    };

    const handleShare = async () => {
        if (!cardRef.current) return;
        setIsSharing(true);
        try {
            // Save name first if changed
            if (name !== target?.userName) {
                await StorageService.updateKhatamUserName(name);
            }

            const canvas = await html2canvas(cardRef.current, {
                scale: 3, // Even higher scale for the certificate
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#064e3b',
                logging: false,
                onclone: (clonedDoc) => {
                    const clonedEl = clonedDoc.body.querySelector('[data-export-card="true"]') as HTMLElement;
                    if (clonedEl) {
                        const styleFixes = clonedEl.querySelectorAll('.backdrop-blur-sm');
                        styleFixes.forEach((b: any) => {
                            b.style.backdropFilter = 'none';
                            b.style.webkitBackdropFilter = 'none';
                        });
                    }
                }
            });
            const image = canvas.toDataURL('image/png');
            
            if (Capacitor.isNativePlatform()) {
                const base64Data = image.split(',')[1];
                const fileName = `khatam-bashirah-${Date.now()}.png`;
                const savedFile = await Filesystem.writeFile({
                    path: fileName,
                    data: base64Data,
                    directory: Directory.Cache
                });

                await Share.share({
                    title: 'Khatam Al-Quran - Bashirah',
                    text: `Alhamdulillah, saya telah khatam Al-Quran menggunakan aplikasi Bashirah! 📖✨`,
                    url: savedFile.uri,
                    dialogTitle: 'Bagikan Khatam'
                });
                setIsSharing(false);
                return;
            }

            if (navigator.share) {
                const blob = await (await fetch(image)).blob();
                const file = new File([blob], 'khatam-bashirah.png', { type: 'image/png' });
                await navigator.share({
                    files: [file],
                    title: 'Khatam Al-Quran - Bashirah',
                    text: `Alhamdulillah, saya telah khatam Al-Quran menggunakan aplikasi Bashirah! 📖✨`
                });
            } else {
                const link = document.createElement('a');
                link.download = 'khatam-bashirah.png';
                link.href = image;
                link.click();
            }
        } catch (err) {
            console.error('Sharing failed', err);
        } finally {
            setIsSharing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                
                {/* Header Actions */}
                <div className="p-4 flex justify-between items-center border-b border-gray-100 dark:border-slate-800">
                    <h3 className="font-bold flex items-center gap-2 text-quran-dark dark:text-white">
                        <Trophy className="w-5 h-5 text-quran-gold" /> {t('success')}!
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    
                    {/* Input Name Group */}
                    <div className="bg-stone-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-stone-200 dark:border-slate-700">
                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">{t('khatam_cel_name_label')}</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <input 
                                type="text"
                                placeholder="Masukkan Nama Anda..."
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 dark:border-slate-600 bg-white dark:bg-slate-700 font-bold focus:ring-2 focus:ring-quran-gold/50 transition-all outline-none"
                            />
                        </div>
                    </div>

                    {/* THE CARD (The part that gets shared) */}
                    <div className="relative group">
                        <div 
                            ref={cardRef}
                            data-export-card="true"
                            className="w-full bg-emerald-950 rounded-2xl p-4 sm:p-8 text-white relative overflow-hidden flex flex-col items-center justify-between text-center min-h-[450px] sm:aspect-[4/5] border-[6px] sm:border-[12px] border-[#ce9e00]"
                            style={{ 
                                backgroundImage: 'radial-gradient(circle at center, #065f46 0%, #064e3b 100%)'
                            }}
                        >
                            {/* Decorative Corner Ornaments */}
                            <div className="absolute top-2 left-2 w-16 h-16 border-t-2 border-l-2 border-quran-gold/40 rounded-tl-xl pointer-events-none"></div>
                            <div className="absolute top-2 right-2 w-16 h-16 border-t-2 border-r-2 border-quran-gold/40 rounded-tr-xl pointer-events-none"></div>
                            <div className="absolute bottom-2 left-2 w-16 h-16 border-b-2 border-l-2 border-quran-gold/40 rounded-bl-xl pointer-events-none"></div>
                            <div className="absolute bottom-2 right-2 w-16 h-16 border-b-2 border-r-2 border-quran-gold/40 rounded-br-xl pointer-events-none"></div>

                            {/* Content */}
                            <div className="relative z-10 w-full animate-float">
                                <Star className="w-12 h-12 text-quran-gold mb-4 mx-auto drop-shadow-lg" />
                                <h4 className="text-sm font-bold tracking-[0.2em] text-quran-gold uppercase mb-1">
                                    {t('khatam_cel_subtitle')}
                                </h4>
                                <h2 className="text-xl sm:text-3xl font-serif font-bold mb-4 sm:mb-6">
                                    {t('khatam_cel_congrats')}
                                </h2>
                                
                                {/* User Name Section */}
                                <div className="mb-4 sm:mb-6">
                                    <p className="text-[10px] sm:text-xs opacity-60 italic mb-1 sm:mb-2">{t('khatam_cel_name_label')}</p>
                                    <h1 className="text-2xl sm:text-4xl font-serif font-bold text-quran-gold drop-shadow-md underline decoration-quran-gold/30 underline-offset-8">
                                        {name || '[Nama Anda]'}
                                    </h1>
                                </div>

                                {/* Center Content: Period & Stats */}
                                <div className="flex-1 flex flex-col justify-center gap-6 sm:gap-8 w-full py-2">
                                    {/* Journey Period */}
                                    <div className="flex flex-col items-center">
                                        <div className="h-px w-32 bg-quran-gold/20 mb-4"></div>
                                        <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-quran-gold/60 mb-3">{t('khatam_period')}</p>
                                        <div className="flex items-center gap-4 sm:gap-8">
                                            <div className="flex flex-col items-center">
                                                <span className="text-[8px] sm:text-[9px] uppercase opacity-40 mb-1">{t('khatam_start')}</span>
                                                <span className="text-xs sm:text-sm font-bold">{target?.startDate ? new Date(target.startDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</span>
                                            </div>
                                            <div className="w-8 h-px bg-white/10 mt-4"></div>
                                            <div className="flex flex-col items-center">
                                                <span className="text-[8px] sm:text-[9px] uppercase opacity-40 mb-1">{t('khatam_end')}</span>
                                                <span className="text-xs sm:text-sm font-bold">{new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats box inside card */}
                                    <div className="grid grid-cols-2 gap-4 w-full max-w-sm mx-auto">
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-2 sm:p-3 backdrop-blur-sm">
                                            <p className="text-[9px] sm:text-[10px] uppercase opacity-60 mb-1">{t('khatam_cel_stats_avg')}</p>
                                            <p className="text-base sm:text-lg font-bold text-quran-gold">{stats?.avgPagesPerDay || 0} <span className="text-[10px] sm:text-xs font-normal">hal</span></p>
                                        </div>
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-2 sm:p-3 backdrop-blur-sm">
                                            <p className="text-[9px] sm:text-[10px] uppercase opacity-60 mb-1">{t('khatam_days_active')}</p>
                                            <p className="text-base sm:text-lg font-bold text-quran-gold">{stats?.totalDaysActive || 0} <span className="text-[10px] sm:text-xs font-normal">hari</span></p>
                                        </div>
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-2 sm:p-3 backdrop-blur-sm col-span-2">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Trophy className="w-4 h-4 text-quran-gold" />
                                                <p className="text-[9px] sm:text-[10px] uppercase opacity-60">{t('khatam_total_count')}</p>
                                            </div>
                                            <p className="text-base sm:text-lg font-bold text-quran-gold">{totalKhatam} <span className="text-[10px] sm:text-xs font-normal">kali</span></p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10 w-full mb-2">
                                <div className="bg-black/25 p-3 sm:p-5 rounded-xl border border-white/5 mb-2 backdrop-blur-md">
                                    <p className="font-arabic text-lg sm:text-2xl mb-2 sm:mb-3 tracking-normal leading-[1.8] sm:leading-[2] text-quran-gold drop-shadow-md" dir="rtl">
                                        {t('khatam_cel_doa')}
                                    </p>
                                    <p className="text-[10px] sm:text-xs opacity-70 italic font-serif leading-relaxed px-2">
                                        "Ya Allah, rahmatilah aku dengan Al-Quran, dan jadikanlah ia bagiku sebagai pemimpin, cahaya, petunjuk dan rahmat."
                                    </p>
                                    <p className="text-[9px] opacity-40 font-bold uppercase tracking-[0.3em] mt-6">Bashirah Quran App • bashirah.pages.dev</p>
                                </div>
                            </div>

                            {/* Seal Ornament */}
                            <div className="absolute bottom-6 right-6 opacity-20 pointer-events-none">
                                <div className="w-20 h-20 rounded-full border-4 border-double border-quran-gold flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-quran-gold rotate-12">AUTHENTIC</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-gray-50 dark:bg-slate-800/50 flex flex-col sm:flex-row gap-3">
                    <button 
                        onClick={handleShare}
                        disabled={isSharing}
                        className="flex-1 py-4 bg-quran-gold text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-quran-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {isSharing ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Share2 className="w-5 h-5" />
                        )}
                        {t('khatam_cel_btn_share')}
                    </button>
                    <button 
                         onClick={onClose}
                         className="px-8 py-4 bg-white dark:bg-slate-700 text-gray-500 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                    >
                        {t('btn_close')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default KhatamCelebrationModal;
