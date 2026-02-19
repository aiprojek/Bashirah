
import React, { useState } from 'react';
import { 
    Info, List, BookOpen, Mail, Coffee, Github, Send, 
    Heart, Mic2, Search, BookMarked, PenTool, LayoutGrid, 
    ShieldCheck 
} from 'lucide-react';
import Logo from '../components/Logo';
import { useLanguage } from '../contexts/LanguageContext';

const AboutPage: React.FC = () => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'about' | 'features' | 'guide' | 'contact'>('about');

    // Contact Form State
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    const handleSendMail = (e: React.FormEvent) => {
        e.preventDefault();
        const email = "aiprojek01@gmail.com";
        const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
        window.location.href = mailtoLink;
    };

    const tabs = [
        { id: 'about', label: t('about_tab_about'), icon: Info },
        { id: 'features', label: t('about_tab_features'), icon: List },
        { id: 'guide', label: t('about_tab_guide'), icon: BookOpen },
        { id: 'contact', label: t('about_tab_contact'), icon: Mail },
    ];

    const featuresList = [
        { title: "Al-Quran Digital", desc: "Teks Rasm Utsmani & IndoPak.", icon: BookOpen },
        { title: t('settings_trans') + " & " + t('settings_tafsir'), desc: "Multibahasa, Jalalayn, Kemenag, dll.", icon: BookMarked },
        { title: t('settings_audio'), desc: t('download_all'), icon: Mic2 },
        { title: "Pencarian", desc: t('search_placeholder'), icon: Search },
        { title: t('tadabbur_title'), desc: t('tadabbur_desc'), icon: PenTool },
        { title: t('nav_feelings'), desc: "Ayat pelipur lara.", icon: Heart },
        { title: t('nav_topics'), desc: "Indeks tematik.", icon: LayoutGrid },
    ];

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in min-h-screen pb-24">
            
            {/* Tab Navigation - Scrollable on Mobile */}
            <div className="sticky top-0 z-10 bg-stone-50/95 dark:bg-slate-900/95 backdrop-blur-sm py-2 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-stone-200/50 dark:border-slate-700/50 sm:border-none transition-colors">
                <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 sm:pb-0 snap-x">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all snap-start whitespace-nowrap border ${
                                    isActive 
                                    ? 'bg-quran-dark dark:bg-quran-gold text-white dark:text-quran-dark shadow-md border-quran-dark dark:border-quran-gold' 
                                    : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 border-stone-200 dark:border-slate-700 hover:bg-stone-50 dark:hover:bg-slate-700 hover:text-quran-dark dark:hover:text-white'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                    {/* Spacer for right padding in scroll view */}
                    <div className="w-2 flex-shrink-0 sm:hidden"></div>
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-stone-100 dark:border-slate-700 shadow-sm min-h-[50vh]">
                
                {/* --- TAB 1: TENTANG --- */}
                {activeTab === 'about' && (
                    <div className="p-8 flex flex-col items-center justify-center w-full">
                        <div className="w-24 h-24 bg-quran-gold/10 rounded-3xl flex items-center justify-center mb-6 shadow-lg border border-quran-gold/20">
                            <Logo className="w-14 h-14" />
                        </div>
                        
                        <p className="font-arabic text-3xl text-quran-gold my-2 leading-relaxed">بَصِيرَة</p>
                        <h2 className="text-3xl font-bold text-quran-dark dark:text-gray-100 font-serif mb-1 text-center">Bashirah</h2>
                        <p className="text-sm font-serif italic text-gray-500 dark:text-gray-400 mb-4">{t('app_subtitle')}</p>

                        <div className="bg-stone-50 dark:bg-slate-700 px-3 py-1 rounded-full text-[10px] text-gray-500 dark:text-gray-300 font-mono mb-6 border border-stone-200 dark:border-slate-600">
                            {t('version')} 20260217
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto leading-relaxed mb-10 font-serif italic text-center text-sm md:text-base">
                            {t('about_desc')}
                        </p>

                        <div className="flex flex-col w-full max-w-md gap-3 mb-10">
                            <a 
                                href="https://lynk.id/aiprojek/s/bvBJvdA" 
                                target="_blank" 
                                rel="noreferrer"
                                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#FFDD00] text-black rounded-xl font-bold hover:bg-[#FFEA00] transition-colors shadow-sm active:scale-95 transform duration-200"
                            >
                                <Coffee className="w-5 h-5" /> {t('about_coffee')}
                            </a>
                            <div className="flex gap-3">
                                <a 
                                    href="https://github.com/aiprojek/Bashirah" 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-gray-900 dark:bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-sm text-sm"
                                >
                                    <Github className="w-4 h-4" /> Github
                                </a>
                                <a 
                                    href="https://t.me/aiprojek_community/32" 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-[#0088cc] text-white rounded-xl font-bold hover:bg-[#0099dd] transition-colors shadow-sm text-sm"
                                >
                                    <Send className="w-4 h-4" /> Telegram
                                </a>
                            </div>
                        </div>

                        {/* License & Attribution Section */}
                        <div className="w-full max-w-lg border-t border-stone-100 dark:border-slate-700 pt-8 text-center space-y-6">
                            
                            {/* License Info */}
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                    <ShieldCheck className="w-4 h-4 text-quran-gold" />
                                    {t('about_license')}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                    GNU General Public License v3.0 (GPLv3)
                                </p>
                            </div>

                            {/* Data Sources */}
                            <div className="text-[10px] text-gray-400 dark:text-gray-500 leading-relaxed">
                                <p className="mb-1 font-bold">{t('about_data_source')}:</p>
                                <p>Risan/Quran-JSON, Al-Quran Cloud, EveryAyah.</p>
                            </div>
                            
                            <p className="text-xs text-gray-500 dark:text-gray-400 pt-4">
                                {t('about_created_by')} <a href="https://aiprojek01.my.id" target="_blank" rel="noreferrer" className="hover:text-quran-gold transition-colors font-bold">AI Projek</a>
                            </p>
                        </div>
                    </div>
                )}

                {/* --- TAB 2: FITUR --- */}
                {activeTab === 'features' && (
                    <div className="p-6 sm:p-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {featuresList.map((feat, idx) => (
                                <div key={idx} className="flex items-start gap-4 p-4 rounded-xl border border-stone-100 dark:border-slate-700 hover:border-quran-gold/30 dark:hover:border-quran-gold/30 hover:bg-stone-50 dark:hover:bg-slate-700/50 transition-all">
                                    <div className="w-10 h-10 rounded-full bg-quran-gold/10 flex items-center justify-center text-quran-dark dark:text-quran-gold shrink-0">
                                        <feat.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm mb-1">{feat.title}</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{feat.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- TAB 3: PANDUAN --- */}
                {activeTab === 'guide' && (
                    <div className="p-6 sm:p-8 text-center text-gray-500">
                        <p>Panduan penggunaan akan segera hadir.</p>
                    </div>
                )}

                {/* --- TAB 4: PESAN --- */}
                {activeTab === 'contact' && (
                    <div className="p-6 sm:p-10 flex flex-col items-center">
                        <div className="max-w-lg w-full">
                            <h3 className="text-xl font-bold text-quran-dark dark:text-white font-serif mb-2 text-center">{t('about_contact_title')}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-8">
                                {t('about_contact_desc')}
                            </p>

                            <form onSubmit={handleSendMail} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Subjek</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-quran-gold/50 focus:border-quran-gold outline-none transition-all"
                                        placeholder="Contoh: Saran Fitur Baru"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Pesan</label>
                                    <textarea 
                                        className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-quran-gold/50 focus:border-quran-gold outline-none transition-all min-h-[150px] resize-none"
                                        placeholder="Tulis pesan Anda di sini..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        required
                                    ></textarea>
                                </div>
                                <button 
                                    type="submit"
                                    className="w-full py-3.5 bg-quran-dark dark:bg-quran-gold text-white dark:text-quran-dark rounded-xl font-bold hover:bg-quran-dark/90 dark:hover:bg-quran-gold/90 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 transform"
                                >
                                    <Send className="w-4 h-4" />
                                    {t('about_btn_email')}
                                </button>
                            </form>
                            
                            <div className="mt-8 pt-8 border-t border-stone-100 dark:border-slate-700 text-center">
                                <p className="text-xs text-gray-400 mb-2">{t('about_or_manual')}</p>
                                <div className="flex items-center justify-center gap-2 text-sm font-bold text-quran-dark dark:text-gray-200 bg-stone-50 dark:bg-slate-700 py-2 rounded-lg select-all">
                                    <Mail className="w-4 h-4" /> aiprojek01@gmail.com
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AboutPage;
