import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TOPICS } from '../services/topicData';
import { Topic } from '../types';
import { 
    Moon, HeartHandshake, Users, Sparkles, Coins, Smile, BookOpen, 
    Lightbulb, ChevronRight, ArrowRight,
    Shield, Hourglass, RefreshCw, Heart, Compass, Scale, Globe,
    Search, X, SlidersHorizontal, BookMarked, Layers, Copy, Check,
    Loader2, Hash, Filter
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import UnifiedModal from '../components/UnifiedModal';
import { 
    loadAyahTopics, 
    getLocalizedTopicName, 
    getLocalizedTopicDescription, 
    getSurahName, 
    AyahTopic 
} from '../services/ayahThemeTopicService';
import { showToast } from '../services/quranService';

// Category classification keywords
const PROPHET_KEYWORDS = [
    'adam', 'nuh', 'noah', 'ibrahim', 'abraham', 'ismail', 'ishmael', 'ishaq', 'isaac', 
    'yaqub', 'jacob', 'yusuf', 'joseph', 'ayyub', 'job', 'syuaib', 'musa', 'moses', 
    'harun', 'aaron', 'dawud', 'david', 'sulaiman', 'solomon', 'ilyas', 'elijah', 
    'ilyasa', 'yunus', 'jonah', 'zakariya', 'yahya', 'john', 'isa', 'jesus', 
    'muhammad', 'maryam', 'mary', 'luqman', 'pharaoh', 'firaun', 'qarun', 'haman', 
    'korah', 'goliath', 'jalut', 'saul', 'thalut', 'prophet', 'nabi', 'rasul'
];

const THEOLOGY_KEYWORDS = [
    'allah', 'god', 'lord', 'tuhan', 'angel', 'malaikat', 'jibril', 'gabriel', 
    'mikail', 'michael', 'heaven', 'paradise', 'surga', 'jannah', 'hell', 'neraka', 
    'jahannam', 'resurrection', 'kebangkitan', 'kiamat', 'akhirat', 'hereafter', 
    'judgment', 'penghakiman', 'faith', 'belief', 'iman', 'keyakinan', 'disbeliever', 
    'kafir', 'hypocrite', 'munafik', 'unseen', 'gaib', 'devil', 'satan', 'iblis', 
    'setan', 'jinn', 'jin', 'spirit', 'roh', 'soul', 'jiwa'
];

const WORSHIP_KEYWORDS = [
    'prayer', 'shalat', 'salat', 'zakat', 'charity', 'sedekah', 'infaq', 'fasting', 
    'puasa', 'hajj', 'haji', 'umrah', 'supplication', 'doa', 'patience', 'sabar', 
    'gratitude', 'syukur', 'repentance', 'taubat', 'forgiveness', 'ampunan', 
    'justice', 'keadilan', 'truth', 'kebenaran', 'piety', 'taqwa', 'righteousness', 
    'kebaikan', 'honesty', 'kejujuran', 'humility', 'rendah hati'
];

const CREATION_KEYWORDS = [
    'sky', 'langit', 'earth', 'bumi', 'sun', 'matahari', 'moon', 'bulan', 'star', 
    'bintang', 'mountain', 'gunung', 'sea', 'laut', 'water', 'air', 'rain', 'hujan', 
    'wind', 'angin', 'cloud', 'awan', 'night', 'malam', 'day', 'siang', 'animal', 
    'hewan', 'bird', 'burung', 'plant', 'tumbuhan', 'tree', 'pohon', 'human', 
    'manusia', 'creation', 'ciptaan'
];

// Related topic tags mapping for curated themes (linking to 2,300+ database)
const RELATED_TOPICS_TAGS: Record<string, string[]> = {
    iman: ['Iman', 'Faith', 'Belief', 'Malaikat', 'Prophet', 'Al-Ikhlas'],
    sabar: ['Patience', 'Sabar', 'Ujian', 'Perseverance', 'Endurance'],
    keluarga: ['Parents', 'Orang Tua', 'Marriage', 'Family', 'Anak', 'Orphans'],
    doa: ['Supplication', 'Prayer', 'Doa', 'Istighfar', 'Munajat'],
    rezeki: ['Charity', 'Sedekah', 'Zakat', 'Infaq', 'Provision', 'Sedekah Subuh'],
    akhlak: ['Akhlak', 'Honesty', 'Humility', 'Forgiveness', 'Adab', 'Lisan'],
    ibadah: ['Worship', 'Shalat', 'Hajj', 'Puasa', 'Ablution', 'Sujud'],
    ilmu: ['Knowledge', 'Ilmu', 'Pen', 'Wisdom', 'Akal', 'Tadabbur'],
    tauhid: ['Monotheism', 'Tauhid', "Allah's Throne", 'Creator', 'Asmaul Husna'],
    hari_akhir: ['Day of Resurrection', 'Paradise', 'Surga', 'Hell', 'Neraka', 'Kiamat'],
    taubat: ['Repentance', 'Taubat', 'Ampunan', 'Forgiveness', 'Maghfirah'],
    syukur: ['Gratitude', 'Syukur', 'Nikmat', 'Blessing', 'Alhamdulillah'],
    kisah_nabi: ['Musa', 'Ibrahim', 'Isa', 'Muhammad', 'Yusuf', 'Nuh', 'Adam'],
    keadilan: ['Justice', 'Keadilan', 'Adil', 'Witness', 'Saksi', 'Timbangan'],
    alam: ['Creation', 'Earth', 'Bumi', 'Sky', 'Langit', 'Rain', 'Matahari'],
    persaudaraan: ['Brotherhood', 'Peace', 'Damai', 'Ukhuwah', 'Persatuan'],
};

type CategoryFilter = 'all' | 'popular' | 'prophets' | 'theology' | 'worship' | 'creation';
type SortOrder = 'most' | 'az';

const PAGE_CHUNK_SIZE = 48;

const TopicIndexPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { language, t } = useLanguage();

    // Data states
    const [ayahTopics, setAyahTopics] = useState<AyahTopic[]>([]);
    const [isLoadingAyahTopics, setIsLoadingAyahTopics] = useState(true);

    // Filter & Tab states
    const [activeTab, setActiveTab] = useState<'all' | 'featured'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
    const [sortBy, setSortBy] = useState<SortOrder>('most');
    const [visibleCount, setVisibleCount] = useState(PAGE_CHUNK_SIZE);

    // Selected Topic Modals
    const [selectedCuratedTopic, setSelectedCuratedTopic] = useState<Topic | null>(null);
    const [selectedAyahTopic, setSelectedAyahTopic] = useState<AyahTopic | null>(null);
    const [modalAyahFilter, setModalAyahFilter] = useState('');
    const [modalCuratedFilter, setModalCuratedFilter] = useState('');
    const [copiedAll, setCopiedAll] = useState(false);
    const [copiedCurated, setCopiedCurated] = useState(false);

    // Dynamic icon helper for curated topics
    const renderIcon = (name: string, className: string) => {
        const icons: any = { 
            Moon, HeartHandshake, Users, Sparkles, Coins, Smile, BookOpen, 
            Lightbulb, Shield, Hourglass, RefreshCw, Heart, Compass, Scale, Globe 
        };
        const Icon = icons[name] || BookOpen;
        return <Icon className={className} />;
    };

    // Load comprehensive Quranic topics
    useEffect(() => {
        let isMounted = true;
        const fetchTopics = async () => {
            setIsLoadingAyahTopics(true);
            try {
                const all = await loadAyahTopics();
                if (isMounted) {
                    // Only keep topics that have mapped verses
                    const withAyahs = all.filter((item) => item.ayahs && item.ayahs.length > 0);
                    setAyahTopics(withAyahs);
                }
            } catch (err) {
                console.error('Failed to load ayah topics:', err);
            } finally {
                if (isMounted) {
                    setIsLoadingAyahTopics(false);
                }
            }
        };
        fetchTopics();
        return () => { isMounted = false; };
    }, []);

    // Check query params on load (e.g. ?topicId=123 or ?tab=featured or ?search=musa)
    useEffect(() => {
        const topicIdParam = searchParams.get('topicId');
        const tabParam = searchParams.get('tab');
        const searchParam = searchParams.get('search');

        if (tabParam === 'featured') {
            setActiveTab('featured');
        }

        if (searchParam) {
            setSearchQuery(searchParam);
        }

        if (topicIdParam && ayahTopics.length > 0) {
            const numId = Number(topicIdParam);
            const found = ayahTopics.find((item) => item.id === numId);
            if (found) {
                setSelectedAyahTopic(found);
                setActiveTab('all');
            }
        }
    }, [searchParams, ayahTopics]);

    // Reset pagination when search or filters change
    useEffect(() => {
        setVisibleCount(PAGE_CHUNK_SIZE);
    }, [searchQuery, categoryFilter, sortBy, activeTab]);

    // Filter & Sort Comprehensive Quranic Topics
    const filteredAyahTopics = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return ayahTopics.filter((topic) => {
            // Search matching
            if (query) {
                const nameEn = (topic.name || '').toLowerCase();
                const nameId = (topic.name_id || '').toLowerCase();
                const arabic = (topic.arabic || '').toLowerCase();
                const desc = (topic.description_id || topic.description || '').toLowerCase();
                const matchesQuery = nameEn.includes(query) || nameId.includes(query) || arabic.includes(query) || desc.includes(query);
                if (!matchesQuery) return false;
            }

            // Category matching
            if (categoryFilter === 'popular') {
                return topic.ayahs.length >= 20;
            }

            const searchString = `${topic.name} ${topic.name_id || ''}`.toLowerCase();
            if (categoryFilter === 'prophets') {
                return PROPHET_KEYWORDS.some((kw) => searchString.includes(kw));
            }
            if (categoryFilter === 'theology') {
                return THEOLOGY_KEYWORDS.some((kw) => searchString.includes(kw));
            }
            if (categoryFilter === 'worship') {
                return WORSHIP_KEYWORDS.some((kw) => searchString.includes(kw));
            }
            if (categoryFilter === 'creation') {
                return CREATION_KEYWORDS.some((kw) => searchString.includes(kw));
            }

            return true;
        }).sort((a, b) => {
            if (sortBy === 'most') {
                return b.ayahs.length - a.ayahs.length;
            }
            if (sortBy === 'az') {
                const nameA = language === 'id' ? (a.name_id || a.name) : a.name;
                const nameB = language === 'id' ? (b.name_id || b.name) : b.name;
                return nameA.localeCompare(nameB);
            }
            return 0;
        });
    }, [ayahTopics, searchQuery, categoryFilter, sortBy, language]);

    // Filter Curated Topics
    const filteredCuratedTopics = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return TOPICS;

        return TOPICS.filter((topic) => {
            const title = t(`topic_${topic.id}_title`).toLowerCase();
            const desc = t(`topic_${topic.id}_desc`).toLowerCase();
            return title.includes(query) || desc.includes(query);
        });
    }, [searchQuery, t]);

    // Navigate to verse in SurahDetailPage
    const handleVerseClick = (surahId: number, verseId: number) => {
        setSelectedCuratedTopic(null);
        setSelectedAyahTopic(null);
        navigate(`/surah/${surahId}#verse-${verseId}`);
    };

    // Verses of selected AyahTopic parsed with Surah names
    const parsedAyahReferences = useMemo(() => {
        if (!selectedAyahTopic) return [];
        return selectedAyahTopic.ayahs.map((ayahStr, index) => {
            const [sId, vId] = ayahStr.split(':').map(Number);
            return {
                id: index + 1,
                surahId: sId,
                verseId: vId,
                surahName: getSurahName(sId),
                referenceStr: `QS. ${getSurahName(sId)} (${sId}): ${vId}`
            };
        });
    }, [selectedAyahTopic]);

    // Filter verses inside modal for AyahTopic
    const filteredModalAyahs = useMemo(() => {
        const q = modalAyahFilter.trim().toLowerCase();
        if (!q) return parsedAyahReferences;
        return parsedAyahReferences.filter((ref) => 
            ref.surahName.toLowerCase().includes(q) || 
            ref.surahId.toString().includes(q) || 
            ref.verseId.toString().includes(q)
        );
    }, [parsedAyahReferences, modalAyahFilter]);

    // Filter verses inside modal for Curated Topic
    const filteredCuratedReferences = useMemo(() => {
        if (!selectedCuratedTopic) return [];
        const q = modalCuratedFilter.trim().toLowerCase();
        if (!q) return selectedCuratedTopic.references;
        return selectedCuratedTopic.references.filter((ref) => 
            ref.surahName.toLowerCase().includes(q) || 
            ref.surahId.toString().includes(q) || 
            ref.verseId.toString().includes(q)
        );
    }, [selectedCuratedTopic, modalCuratedFilter]);

    // Copy all references for selected topic
    const handleCopyAllReferences = () => {
        if (!selectedAyahTopic) return;
        const topicName = getLocalizedTopicName(selectedAyahTopic, language);
        const textToCopy = `${topicName} (${selectedAyahTopic.ayahs.length} ${t('topics_verses_count')}):\n` +
            parsedAyahReferences.map((r) => r.referenceStr).join('\n');
        
        navigator.clipboard.writeText(textToCopy);
        setCopiedAll(true);
        showToast(language === 'en' ? 'All references copied to clipboard' : 'Daftar referensi ayat berhasil disalin', 'success');
        setTimeout(() => setCopiedAll(false), 2000);
    };

    // Copy all references for selected curated topic
    const handleCopyCuratedReferences = () => {
        if (!selectedCuratedTopic) return;
        const topicTitle = t(`topic_${selectedCuratedTopic.id}_title`);
        const textToCopy = `${topicTitle} (${selectedCuratedTopic.references.length} ${t('topics_verses_count')}):\n` +
            selectedCuratedTopic.references.map((r) => `QS. ${r.surahName} (${r.surahId}): ${r.verseId}`).join('\n');
        
        navigator.clipboard.writeText(textToCopy);
        setCopiedCurated(true);
        showToast(language === 'en' ? 'All references copied to clipboard' : 'Daftar referensi ayat berhasil disalin', 'success');
        setTimeout(() => setCopiedCurated(false), 2000);
    };

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in min-h-screen">
            
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center p-3 bg-quran-gold/10 dark:bg-quran-gold/20 rounded-full mb-3 text-quran-gold">
                    <BookOpen className="w-8 h-8" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-quran-dark dark:text-gray-100 font-serif mb-2">
                    {t('topics_title')}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
                    {t('topics_desc')}
                </p>

                {/* Subtitle badge stats */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-slate-950/40 text-quran-dark dark:text-amber-300 border border-amber-200/60 dark:border-quran-dark/60">
                        <Layers className="w-3.5 h-3.5" />
                        <span>{ayahTopics.length > 0 ? `${ayahTopics.length.toLocaleString()} ${language === 'en' ? 'Quranic Topics' : 'Topik Al-Qur\'an'}` : (language === 'en' ? '2,300+ Topics' : '2.300+ Topik')}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{TOPICS.length} {t('topics_tab_featured')}</span>
                    </span>
                </div>
            </div>

            {/* Search and Tabs Container */}
            <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-3.5 sm:p-5 border border-stone-200/80 dark:border-slate-700 shadow-sm mb-6 space-y-3.5 sm:space-y-4">
                
                {/* Search Bar */}
                <div className="relative">
                    <Search className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('topics_search_placeholder')}
                        className="w-full pl-10 sm:pl-11 pr-10 py-2.5 sm:py-3 rounded-xl bg-stone-50 dark:bg-slate-900/80 border border-stone-200 dark:border-slate-700 text-sm sm:text-base text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            aria-label="Clear search"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Main Navigation Segmented Tabs - Optimized for Mobile & Desktop */}
                <div className="pt-2 border-t border-stone-100 dark:border-slate-700/80">
                    <div className="grid grid-cols-2 p-1 bg-stone-100 dark:bg-slate-900 rounded-xl gap-1 sm:max-w-md sm:mx-auto">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 sm:gap-2 min-w-0 ${
                                activeTab === 'all'
                                    ? 'bg-white dark:bg-slate-800 text-quran-dark dark:text-amber-300 shadow-xs'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                        >
                            <BookOpen className="w-4 h-4 shrink-0" />
                            <span className="truncate">{t('topics_tab_all')}</span>
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 dark:bg-slate-950 text-quran-dark dark:text-amber-300 font-bold shrink-0">
                                {ayahTopics.length > 0 ? ayahTopics.length.toLocaleString() : '2.3K+'}
                            </span>
                        </button>

                        <button
                            onClick={() => setActiveTab('featured')}
                            className={`px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 sm:gap-2 min-w-0 ${
                                activeTab === 'featured'
                                    ? 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 shadow-xs'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                        >
                            <Sparkles className="w-4 h-4 shrink-0" />
                            <span className="truncate">{t('topics_tab_featured')}</span>
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold shrink-0">
                                {TOPICS.length}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Controls for "Semua Topik" Tab: Categories & Sorting */}
                {activeTab === 'all' && (
                    <div className="space-y-2.5 pt-2 border-t border-stone-100 dark:border-slate-700/80">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Filter className="w-3.5 h-3.5 text-quran-gold dark:text-amber-400" />
                                <span>{language === 'en' ? 'Category' : 'Kategori'}</span>
                            </span>

                            {/* Sorting Toggle */}
                            <div className="flex items-center gap-1 p-0.5 bg-stone-100 dark:bg-slate-900 rounded-lg text-xs">
                                <button
                                    onClick={() => setSortBy('most')}
                                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                                        sortBy === 'most'
                                            ? 'bg-white dark:bg-slate-800 text-quran-dark dark:text-amber-300 shadow-2xs font-semibold'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                                    }`}
                                >
                                    {t('topics_sort_most')}
                                </button>
                                <button
                                    onClick={() => setSortBy('az')}
                                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                                        sortBy === 'az'
                                            ? 'bg-white dark:bg-slate-800 text-quran-dark dark:text-amber-300 shadow-2xs font-semibold'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                                    }`}
                                >
                                    {t('topics_sort_az')}
                                </button>
                            </div>
                        </div>

                        {/* Horizontal Scroll Filter Chips */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none text-xs">
                            {[
                                { id: 'all', label: t('topics_filter_all') },
                                { id: 'popular', label: `${t('topics_filter_popular')} (>20)` },
                                { id: 'prophets', label: t('topics_filter_prophets') },
                                { id: 'theology', label: t('topics_filter_theology') },
                                { id: 'worship', label: t('topics_filter_worship') },
                                { id: 'creation', label: t('topics_filter_creation') },
                            ].map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setCategoryFilter(cat.id as CategoryFilter)}
                                    className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                                        categoryFilter === cat.id
                                            ? 'bg-quran-gold text-white shadow-xs font-semibold'
                                            : 'bg-stone-100 dark:bg-slate-900 text-gray-600 dark:text-gray-300 hover:bg-stone-200 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    <span>{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Information Sub-bar for "Tema Pilihan" Tab */}
                {activeTab === 'featured' && (
                    <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-slate-700/80 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1.5 font-medium">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>{language === 'en' ? 'Curated Life Themes' : 'Tema Utama Kehidupan'}</span>
                        </span>
                        <span className="font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-800/60 text-[11px]">
                            {language === 'en' ? '1,040+ Verses' : '1.040+ Referensi Ayat'}
                        </span>
                    </div>
                )}
            </div>

            {/* Results Counter */}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4 px-1">
                <div>
                    {activeTab === 'all' ? (
                        <span>
                            {language === 'en' 
                                ? `Showing ${Math.min(visibleCount, filteredAyahTopics.length)} of ${filteredAyahTopics.length.toLocaleString()} topics`
                                : `Menampilkan ${Math.min(visibleCount, filteredAyahTopics.length)} dari ${filteredAyahTopics.length.toLocaleString()} topik`}
                        </span>
                    ) : (
                        <span>
                            {language === 'en'
                                ? `Showing ${filteredCuratedTopics.length} featured themes`
                                : `Menampilkan ${filteredCuratedTopics.length} tema pilihan`}
                        </span>
                    )}
                </div>
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="text-quran-gold dark:text-amber-400 hover:underline font-medium"
                    >
                        {language === 'en' ? 'Reset search' : 'Hapus pencarian'}
                    </button>
                )}
            </div>

            {/* TAB 1: ALL QURANIC TOPICS (2,300+ topics) */}
            {activeTab === 'all' && (
                <div>
                    {isLoadingAyahTopics ? (
                        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-stone-200/80 dark:border-slate-700">
                            <Loader2 className="w-8 h-8 animate-spin text-quran-gold mx-auto mb-3" />
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                {language === 'en' ? 'Loading 2,300+ Quranic topics...' : 'Memuat 2.300+ topik Al-Qur\'an...'}
                            </p>
                        </div>
                    ) : filteredAyahTopics.length === 0 ? (
                        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-stone-200/80 dark:border-slate-700 p-6">
                            <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                            <h3 className="text-base font-bold text-gray-700 dark:text-gray-300 mb-1">
                                {t('topics_empty')}
                            </h3>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 max-w-md mx-auto">
                                {language === 'en'
                                    ? 'Try searching with different terms like "Moses", "Prayer", "Patience", or select another category.'
                                    : 'Coba kata kunci lain seperti "Musa", "Shalat", "Sabar", "Surga", atau ubah filter kategori.'}
                            </p>
                            <button
                                onClick={() => { setSearchQuery(''); setCategoryFilter('all'); }}
                                className="px-4 py-2 rounded-xl bg-quran-gold hover:bg-quran-dark text-white text-xs font-semibold transition-all shadow-xs"
                            >
                                {language === 'en' ? 'View All Topics' : 'Lihat Semua Topik'}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                                {filteredAyahTopics.slice(0, visibleCount).map((topic) => {
                                    const localizedName = getLocalizedTopicName(topic, language);
                                    const localizedDesc = getLocalizedTopicDescription(topic, language);

                                    return (
                                        <div
                                            key={topic.id}
                                            onClick={() => setSelectedAyahTopic(topic)}
                                            className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs border border-stone-200/80 dark:border-slate-700 hover:border-amber-500/50 dark:hover:border-amber-500/50 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                                        >
                                            <div className="mb-3">
                                                {/* Header with pill and Arabic */}
                                                <div className="flex items-center justify-between gap-2 mb-3">
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-slate-950/50 text-quran-dark dark:text-amber-300 border border-amber-200/60 dark:border-quran-dark/60">
                                                        <Hash className="w-3 h-3 text-amber-500" />
                                                        <span>{topic.ayahs.length} {t('topics_verses_count')}</span>
                                                    </span>
                                                    {topic.arabic && (
                                                        <span className="font-arabic text-sm font-bold text-gray-500 dark:text-gray-400 group-hover:text-quran-gold dark:group-hover:text-amber-400 transition-colors">
                                                            {topic.arabic}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Judul */}
                                                <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 group-hover:text-quran-dark dark:group-hover:text-amber-300 transition-colors font-serif mb-1.5 line-clamp-1">
                                                    {localizedName}
                                                </h3>

                                                {/* Deskripsi Singkat */}
                                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                                                    {localizedDesc}
                                                </p>
                                            </div>

                                            {/* Action Link Footer */}
                                            <div className="pt-2.5 border-t border-stone-100 dark:border-slate-700/80 flex items-center justify-between text-xs font-semibold text-quran-dark dark:text-amber-400">
                                                <span>{language === 'en' ? 'Explore Verses' : 'Lihat Ayat'}</span>
                                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Load More Button */}
                            {visibleCount < filteredAyahTopics.length && (
                                <div className="text-center pt-4">
                                    <button
                                        onClick={() => setVisibleCount((prev) => prev + PAGE_CHUNK_SIZE)}
                                        className="px-6 py-3 rounded-xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 font-semibold text-sm hover:bg-stone-50 dark:hover:bg-slate-700 hover:border-amber-500/50 shadow-xs transition-all inline-flex items-center gap-2"
                                    >
                                        <Layers className="w-4 h-4 text-quran-gold" />
                                        <span>{t('topics_load_more')} ({filteredAyahTopics.length - visibleCount} {language === 'en' ? 'remaining' : 'lagi'})</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: CURATED THEMES (15 core life topics) */}
            {activeTab === 'featured' && (
                <div>
                    {filteredCuratedTopics.length === 0 ? (
                        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-stone-200 dark:border-slate-700 p-6">
                            <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                            <h3 className="text-base font-bold text-gray-700 dark:text-gray-300 mb-1">
                                {t('topics_empty')}
                            </h3>
                            <button
                                onClick={() => setSearchQuery('')}
                                className="px-4 py-2 rounded-xl bg-quran-gold text-white text-xs font-semibold transition-all shadow-xs mt-3"
                            >
                                {language === 'en' ? 'Reset Search' : 'Reset Pencarian'}
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
                            {filteredCuratedTopics.map((topic) => (
                                <div 
                                    key={topic.id}
                                    onClick={() => setSelectedCuratedTopic(topic)}
                                    className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs border border-stone-200/80 dark:border-slate-700 hover:shadow-md hover:border-amber-500/50 dark:hover:border-amber-500/50 transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between"
                                >
                                    {/* Background Decor */}
                                    <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 pointer-events-none">
                                        {renderIcon(topic.iconName, "w-20 h-20 text-quran-dark dark:text-white")}
                                    </div>

                                    <div className="relative z-10 mb-3">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40 group-hover:bg-amber-500 group-hover:text-white transition-colors shadow-2xs">
                                                {renderIcon(topic.iconName, "w-5 h-5")}
                                            </div>
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100/80 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40">
                                                {topic.references.length} {t('topics_verses_count')}
                                            </span>
                                        </div>
                                        
                                        <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100 mb-1.5 font-serif group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                                            {t(`topic_${topic.id}_title`)}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                                            {t(`topic_${topic.id}_desc`)}
                                        </p>
                                    </div>

                                    <div className="pt-2.5 border-t border-stone-100 dark:border-slate-700/80 flex items-center justify-between text-xs font-semibold text-amber-700 dark:text-amber-400 relative z-10">
                                        <span>{language === 'en' ? 'View All Verses' : 'Lihat Kumpulan Ayat'}</span>
                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* UNIFIED DETAIL MODAL FOR COMPREHENSIVE AYAH TOPIC */}
            {selectedAyahTopic && (
                <UnifiedModal
                    isOpen={!!selectedAyahTopic}
                    onClose={() => { setSelectedAyahTopic(null); setModalAyahFilter(''); }}
                    badge={t('topics_title')}
                    badgeColorClass="bg-amber-100/80 text-quran-dark dark:bg-slate-950/60 dark:text-amber-300 border-amber-300 dark:border-quran-dark"
                    title={
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-quran-dark/40 text-quran-dark dark:text-amber-300 flex items-center justify-center font-bold text-sm">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-900 dark:text-gray-100">
                                        {getLocalizedTopicName(selectedAyahTopic, language)}
                                    </span>
                                    {selectedAyahTopic.arabic && (
                                        <span className="font-arabic text-base font-bold text-quran-dark dark:text-amber-400">
                                            {selectedAyahTopic.arabic}
                                        </span>
                                    )}
                                </div>
                                {language === 'id' && selectedAyahTopic.name !== selectedAyahTopic.name_id && (
                                    <p className="text-xs text-gray-400 font-normal">
                                        {selectedAyahTopic.name}
                                    </p>
                                )}
                            </div>
                        </div>
                    }
                    subtitle={`${selectedAyahTopic.ayahs.length} ${t('topics_verses_count')} • ${language === 'en' ? 'Quranic References' : 'Referensi Al-Quran'}`}
                    maxWidth="max-w-xl"
                >
                    <div className="space-y-4">
                        {/* Topic Description Box */}
                        {getLocalizedTopicDescription(selectedAyahTopic, language) && (
                            <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-slate-950/20 border border-amber-200/50 dark:border-quran-dark/40 text-xs sm:text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
                                {getLocalizedTopicDescription(selectedAyahTopic, language)}
                            </div>
                        )}

                        {/* Search inside topic verses */}
                        <div className="flex items-center justify-between gap-2">
                            <div className="relative flex-1">
                                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={modalAyahFilter}
                                    onChange={(e) => setModalAyahFilter(e.target.value)}
                                    placeholder={t('topics_search_ayah')}
                                    className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-stone-100 dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-xs text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                                />
                                {modalAyahFilter && (
                                    <button
                                        onClick={() => setModalAyahFilter('')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>

                            <button
                                onClick={handleCopyAllReferences}
                                className="px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 text-xs font-medium hover:bg-stone-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 shrink-0"
                                title={language === 'en' ? 'Copy all verse references' : 'Salin semua referensi'}
                            >
                                {copiedAll ? <Check className="w-3.5 h-3.5 text-quran-gold" /> : <Copy className="w-3.5 h-3.5" />}
                                <span className="hidden sm:inline">{language === 'en' ? 'Copy List' : 'Salin Semua'}</span>
                            </button>
                        </div>

                        {/* Verses List */}
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                            {filteredModalAyahs.length === 0 ? (
                                <p className="text-center py-6 text-xs text-gray-400 italic">
                                    {language === 'en' ? 'No verses matching this search.' : 'Tidak ada ayat yang cocok dengan pencarian ini.'}
                                </p>
                            ) : (
                                filteredModalAyahs.map((ref) => (
                                    <button
                                        key={`${ref.surahId}:${ref.verseId}`}
                                        onClick={() => handleVerseClick(ref.surahId, ref.verseId)}
                                        className="w-full bg-white dark:bg-slate-800 p-3 rounded-xl border border-stone-200/80 dark:border-slate-700 shadow-2xs hover:border-amber-500 hover:shadow-xs transition-all flex items-center justify-between group text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-7 h-7 rounded-full bg-amber-50 dark:bg-slate-950/60 text-quran-dark dark:text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-200/60 dark:border-quran-dark/60 shrink-0">
                                                {ref.id}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm font-serif group-hover:text-quran-dark dark:group-hover:text-amber-300 transition-colors">
                                                    QS. {ref.surahName} ({ref.surahId})
                                                </h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {t('verse')} {ref.verseId}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-gray-300 dark:text-gray-500 group-hover:text-quran-gold group-hover:translate-x-0.5 transition-all">
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </UnifiedModal>
            )}

            {/* UNIFIED DETAIL MODAL FOR CURATED TOPIC */}
            {selectedCuratedTopic && (
                <UnifiedModal
                    isOpen={!!selectedCuratedTopic}
                    onClose={() => { setSelectedCuratedTopic(null); setModalCuratedFilter(''); }}
                    badge={t('topics_title')}
                    badgeColorClass="bg-amber-100/80 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-700"
                    title={
                        <div className="flex items-center gap-3">
                            <span className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40 shrink-0">
                                {renderIcon(selectedCuratedTopic.iconName, "w-5 h-5")}
                            </span>
                            <div>
                                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 font-serif">
                                    {t(`topic_${selectedCuratedTopic.id}_title`)}
                                </h3>
                                <p className="text-xs text-amber-700/80 dark:text-amber-400 font-medium">
                                    {selectedCuratedTopic.references.length} {t('topics_ref')} • {t('topics_collection')}
                                </p>
                            </div>
                        </div>
                    }
                    headerActions={
                        <button
                            onClick={handleCopyCuratedReferences}
                            className="p-2 text-gray-500 hover:text-amber-600 dark:text-gray-400 dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
                            title={language === 'en' ? 'Copy all verse references' : 'Salin seluruh referensi ayat'}
                        >
                            {copiedCurated ? (
                                <>
                                    <Check className="w-4 h-4 text-quran-gold" />
                                    <span className="text-quran-gold hidden sm:inline">{language === 'en' ? 'Copied' : 'Tersalin'}</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4" />
                                    <span className="hidden sm:inline">{language === 'en' ? 'Copy All' : 'Salin Semua'}</span>
                                </>
                            )}
                        </button>
                    }
                    maxWidth="max-w-xl"
                >
                    <div className="space-y-4">
                        {/* Description */}
                        <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-slate-900 border border-stone-200/70 dark:border-slate-800">
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                {t(`topic_${selectedCuratedTopic.id}_desc`)}
                            </p>
                        </div>

                        {/* Search Filter for Verses in Curated Topic */}
                        <div className="relative">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={modalCuratedFilter}
                                onChange={(e) => setModalCuratedFilter(e.target.value)}
                                placeholder={t('topics_search_ayah')}
                                className="w-full pl-9 pr-8 py-2 rounded-xl bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-xs sm:text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                            />
                            {modalCuratedFilter && (
                                <button
                                    onClick={() => setModalCuratedFilter('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Verses Counter and Indicator */}
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-0.5">
                            <span>
                                {language === 'en'
                                    ? `Showing ${filteredCuratedReferences.length} of ${selectedCuratedTopic.references.length} verses`
                                    : `Menampilkan ${filteredCuratedReferences.length} dari ${selectedCuratedTopic.references.length} ayat`}
                            </span>
                            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                                {language === 'en' ? 'Tap verse to open reader' : 'Klik ayat untuk baca'}
                            </span>
                        </div>

                        {/* List of Verses */}
                        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                            {filteredCuratedReferences.length === 0 ? (
                                <div className="text-center py-8 text-gray-400 text-xs">
                                    {language === 'en' ? 'No verses match your filter.' : 'Tidak ada ayat yang cocok dengan pencarian.'}
                                </div>
                            ) : (
                                filteredCuratedReferences.map((ref, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleVerseClick(ref.surahId, ref.verseId)}
                                        className="w-full bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-stone-200/70 dark:border-slate-700 shadow-2xs hover:border-amber-500/60 dark:hover:border-amber-500/60 hover:shadow-xs transition-all flex items-center justify-between group text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-xs font-bold text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40 shrink-0">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm font-serif">
                                                    QS. {ref.surahName} ({ref.surahId})
                                                </h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 font-sans">
                                                    {t('verse')} {ref.verseId}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-gray-300 dark:text-gray-500 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0">
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>

                        {/* Related Quranic Topics Tags from 2,300+ DB */}
                        {RELATED_TOPICS_TAGS[selectedCuratedTopic.id] && (
                            <div className="pt-3 border-t border-stone-100 dark:border-slate-800">
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-2">
                                    {language === 'en' ? 'Related Quranic Topics (2,300+ Index):' : 'Topik Al-Qur\'an Terkait:'}
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                    {RELATED_TOPICS_TAGS[selectedCuratedTopic.id].map((tag, tIdx) => (
                                        <button
                                            key={tIdx}
                                            onClick={() => {
                                                setSelectedCuratedTopic(null);
                                                setActiveTab('all');
                                                setSearchQuery(tag);
                                            }}
                                            className="px-2.5 py-1 rounded-lg text-xs bg-stone-100 dark:bg-slate-700/60 text-gray-700 dark:text-gray-300 hover:bg-amber-100 hover:text-amber-900 dark:hover:bg-amber-950/60 dark:hover:text-amber-300 transition-colors flex items-center gap-1 font-medium"
                                        >
                                            <Hash className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                            <span>{tag}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </UnifiedModal>
            )}

        </div>
    );
};

export default TopicIndexPage;
