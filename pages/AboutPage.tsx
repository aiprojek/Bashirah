
import React, { useState } from 'react';
import { 
    Info, List, BookOpen, Mail, Coffee, Github, Send, 
    Heart, Mic2, Search, BookMarked, PenTool, LayoutGrid, 
    ChevronRight, ShieldCheck 
} from 'lucide-react';
import Logo from '../components/Logo';

const AboutPage: React.FC = () => {
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
        { id: 'about', label: 'Tentang', icon: Info },
        { id: 'features', label: 'Fitur', icon: List },
        { id: 'guide', label: 'Panduan', icon: BookOpen },
        { id: 'contact', label: 'Pesan', icon: Mail },
    ];

    const featuresList = [
        { title: "Al-Quran Digital", desc: "Teks Utsmani, IndoPak, dan Kemenag yang jelas.", icon: BookOpen },
        { title: "Terjemahan & Tafsir", desc: "Multibahasa dan tafsir Jalalayn, Ibn Katsir, dll.", icon: BookMarked },
        { title: "Audio Murottal", desc: "30 Juz dari berbagai Qari ternama, bisa diunduh.", icon: Mic2 },
        { title: "Pencarian Cerdas", desc: "Cari ayat berdasarkan kata kunci atau topik.", icon: Search },
        { title: "Jurnal Tadabbur", desc: "Catat renungan dan hikmah dari setiap ayat.", icon: PenTool },
        { title: "Ayat Pelipur Lara", desc: "Kurasi ayat berdasarkan emosi (sedih, cemas, dll).", icon: Heart },
        { title: "Indeks Topik", desc: "Eksplorasi ayat berdasarkan tema kehidupan.", icon: LayoutGrid },
    ];

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in min-h-screen pb-24">
            
            {/* Tab Navigation - Scrollable on Mobile */}
            <div className="sticky top-0 z-10 bg-stone-50/95 backdrop-blur-sm py-2 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-stone-200/50 sm:border-none">
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
                                    ? 'bg-quran-dark text-white shadow-md border-quran-dark' 
                                    : 'bg-white text-gray-500 border-stone-200 hover:bg-stone-50 hover:text-quran-dark'
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
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm min-h-[50vh]">
                
                {/* --- TAB 1: TENTANG --- */}
                {activeTab === 'about' && (
                    <div className="p-8 flex flex-col items-center justify-center w-full">
                        <div className="w-24 h-24 bg-quran-gold/10 rounded-3xl flex items-center justify-center mb-6 shadow-lg border border-quran-gold/20">
                            <Logo className="w-14 h-14" />
                        </div>
                        
                        <p className="font-arabic text-3xl text-quran-gold my-2 leading-relaxed">بَصِيرَة</p>
                        <h2 className="text-3xl font-bold text-quran-dark font-serif mb-1 text-center">Bashirah</h2>
                        <p className="text-sm font-serif italic text-gray-500 mb-4">"Mata Hati"</p>

                        <div className="bg-stone-50 px-3 py-1 rounded-full text-[10px] text-gray-500 font-mono mb-6 border border-stone-200">
                            Versi 20260217
                        </div>

                        <p className="text-gray-600 max-w-lg mx-auto leading-relaxed mb-10 font-serif italic text-center text-sm md:text-base">
                            "Membawa cahaya Al-Quran ke dalam genggaman, dengan desain yang menenangkan jiwa dan fitur yang memudahkan tadabbur."
                        </p>

                        <div className="flex flex-col w-full max-w-md gap-3 mb-10">
                            <a 
                                href="https://lynk.id/aiprojek/s/bvBJvdA" 
                                target="_blank" 
                                rel="noreferrer"
                                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#FFDD00] text-black rounded-xl font-bold hover:bg-[#FFEA00] transition-colors shadow-sm active:scale-95 transform duration-200"
                            >
                                <Coffee className="w-5 h-5" /> Traktir Kopi
                            </a>
                            <div className="flex gap-3">
                                <a 
                                    href="https://github.com/aiprojek/Bashirah" 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors shadow-sm text-sm"
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
                        <div className="w-full max-w-lg border-t border-stone-100 pt-8 text-center space-y-6">
                            
                            {/* License Info */}
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-wide">
                                    <ShieldCheck className="w-4 h-4 text-quran-gold" />
                                    Lisensi Open Source
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Aplikasi ini adalah perangkat lunak bebas yang dilisensikan di bawah <br/>
                                    <a 
                                        href="https://www.gnu.org/licenses/gpl-3.0.html" 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="text-quran-dark font-bold hover:text-quran-gold hover:underline transition-colors"
                                    >
                                        GNU General Public License v3.0 (GPLv3)
                                    </a>.
                                </p>
                            </div>

                            {/* Data Sources */}
                            <div className="text-[10px] text-gray-400 leading-relaxed">
                                <p className="mb-1">
                                    Data Al-Quran berasal dari <a href="https://github.com/risan/quran-json" target="_blank" rel="noreferrer" className="text-quran-gold hover:underline">Risan/Quran-JSON</a>.
                                </p>
                                <p>
                                    API Ayat, Terjemahan & Audio dari <a href="https://alquran.cloud/api" target="_blank" rel="noreferrer" className="text-quran-gold hover:underline">Al Quran Cloud</a>.
                                </p>
                            </div>
                            
                            <p className="text-xs text-gray-500 pt-4">
                                Dibuat dengan ❤️ oleh <a href="https://aiprojek01.my.id" target="_blank" rel="noreferrer" className="hover:text-quran-gold transition-colors font-bold">AI Projek</a>
                            </p>
                        </div>
                    </div>
                )}

                {/* --- TAB 2: FITUR --- */}
                {activeTab === 'features' && (
                    <div className="p-6 sm:p-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {featuresList.map((feat, idx) => (
                                <div key={idx} className="flex items-start gap-4 p-4 rounded-xl border border-stone-100 hover:border-quran-gold/30 hover:bg-stone-50 transition-all">
                                    <div className="w-10 h-10 rounded-full bg-quran-gold/10 flex items-center justify-center text-quran-dark shrink-0">
                                        <feat.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-sm mb-1">{feat.title}</h4>
                                        <p className="text-xs text-gray-500 leading-relaxed">{feat.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- TAB 3: PANDUAN --- */}
                {activeTab === 'guide' && (
                    <div className="p-6 sm:p-8 space-y-8">
                        <section>
                            <h3 className="text-lg font-bold text-quran-dark font-serif mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-quran-dark text-white flex items-center justify-center text-xs">1</span>
                                Membaca Al-Quran
                            </h3>
                            <ul className="space-y-3 text-sm text-gray-600 pl-2 border-l-2 border-stone-100 ml-3">
                                <li className="flex gap-2">
                                    <ChevronRight className="w-4 h-4 text-quran-gold shrink-0 mt-0.5" />
                                    <span><strong>Mode List:</strong> Tampilan default. Gulir ke bawah untuk membaca ayat demi ayat. Klik ayat untuk melihat opsi (Bookmark, Catatan).</span>
                                </li>
                                <li className="flex gap-2">
                                    <ChevronRight className="w-4 h-4 text-quran-gold shrink-0 mt-0.5" />
                                    <span><strong>Mode Mushaf:</strong> Klik tombol "Mode Mushaf" di atas surat untuk tampilan halaman layaknya Al-Quran cetak. Geser atau klik tepi layar untuk membalik halaman.</span>
                                </li>
                                <li className="flex gap-2">
                                    <ChevronRight className="w-4 h-4 text-quran-gold shrink-0 mt-0.5" />
                                    <span><strong>Tajwid:</strong> Ayat dilengkapi pewarnaan tajwid standar (Merah=Mad, Hijau=Ghunnah, Biru=Qalqalah).</span>
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-lg font-bold text-quran-dark font-serif mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-quran-dark text-white flex items-center justify-center text-xs">2</span>
                                Audio & Murottal
                            </h3>
                            <ul className="space-y-3 text-sm text-gray-600 pl-2 border-l-2 border-stone-100 ml-3">
                                <li className="flex gap-2">
                                    <ChevronRight className="w-4 h-4 text-quran-gold shrink-0 mt-0.5" />
                                    <span>Klik ikon <strong>Play</strong> di setiap ayat untuk memutar audio.</span>
                                </li>
                                <li className="flex gap-2">
                                    <ChevronRight className="w-4 h-4 text-quran-gold shrink-0 mt-0.5" />
                                    <span>Buka <strong>Pengaturan</strong> untuk mengganti Qari (Mishary, Sudais, dll) atau mengunduh audio agar bisa diputar offline.</span>
                                </li>
                                <li className="flex gap-2">
                                    <ChevronRight className="w-4 h-4 text-quran-gold shrink-0 mt-0.5" />
                                    <span>Gunakan fitur <strong>Muraja'ah</strong> di player bawah untuk mengulang-ulang ayat tertentu.</span>
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-lg font-bold text-quran-dark font-serif mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-quran-dark text-white flex items-center justify-center text-xs">3</span>
                                Tadabbur & Fitur Lain
                            </h3>
                            <ul className="space-y-3 text-sm text-gray-600 pl-2 border-l-2 border-stone-100 ml-3">
                                <li className="flex gap-2">
                                    <ChevronRight className="w-4 h-4 text-quran-gold shrink-0 mt-0.5" />
                                    <span><strong>Jurnal Tadabbur:</strong> Tulis refleksi pribadi Anda terhadap ayat tertentu melalui menu "Tulis Jurnal".</span>
                                </li>
                                <li className="flex gap-2">
                                    <ChevronRight className="w-4 h-4 text-quran-gold shrink-0 mt-0.5" />
                                    <span><strong>Ayat Pelipur Lara:</strong> Temukan ayat-ayat yang menenangkan hati berdasarkan emosi yang Anda rasakan.</span>
                                </li>
                                <li className="flex gap-2">
                                    <ChevronRight className="w-4 h-4 text-quran-gold shrink-0 mt-0.5" />
                                    <span><strong>Target Khatam:</strong> Set target hari khatam di beranda, sistem akan menghitung target halaman harian Anda.</span>
                                </li>
                            </ul>
                        </section>
                    </div>
                )}

                {/* --- TAB 4: PESAN --- */}
                {activeTab === 'contact' && (
                    <div className="p-6 sm:p-10 flex flex-col items-center">
                        <div className="max-w-lg w-full">
                            <h3 className="text-xl font-bold text-quran-dark font-serif mb-2 text-center">Hubungi Kami</h3>
                            <p className="text-gray-500 text-sm text-center mb-8">
                                Punya saran, kritik, atau menemukan <em>bug</em>? Kirimkan pesan langsung kepada pengembang.
                            </p>

                            <form onSubmit={handleSendMail} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subjek</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-quran-gold/50 focus:border-quran-gold outline-none transition-all"
                                        placeholder="Contoh: Saran Fitur Baru"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pesan</label>
                                    <textarea 
                                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-quran-gold/50 focus:border-quran-gold outline-none transition-all min-h-[150px] resize-none"
                                        placeholder="Tulis pesan Anda di sini..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        required
                                    ></textarea>
                                </div>
                                <button 
                                    type="submit"
                                    className="w-full py-3.5 bg-quran-dark text-white rounded-xl font-bold hover:bg-quran-dark/90 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 transform"
                                >
                                    <Send className="w-4 h-4" />
                                    Kirim via Email
                                </button>
                            </form>
                            
                            <div className="mt-8 pt-8 border-t border-stone-100 text-center">
                                <p className="text-xs text-gray-400 mb-2">Atau hubungi via email manual:</p>
                                <div className="flex items-center justify-center gap-2 text-sm font-bold text-quran-dark bg-stone-50 py-2 rounded-lg select-all">
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
