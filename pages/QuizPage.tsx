
import React, { useState, useEffect } from 'react';
import { Surah, QuizScore } from '../types';
import { getAllSurahs, getVerseSampleForQuiz, isAnyTranslationDownloaded } from '../services/quranService';
import * as StorageService from '../services/storageService';
import { 
    Trophy, CheckCircle, XCircle, Brain, RefreshCw, Star, 
    Loader2, User, Medal, Crown, MessageSquare, BookOpen, 
    Edit, Languages, Download, AlertCircle, ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

interface Question {
    text: string;
    options: string[];
    correctAnswer: string;
    type: 'meaning' | 'verse_count' | 'revelation' | 'order';
    fullText?: string;
    surahName?: string;
    verseId?: number;
    surahId?: number;
}

const QuizPage: React.FC = () => {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const [surahs, setSurahs] = useState<Surah[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Game State
    const [gameState, setGameState] = useState<'start' | 'mode_select' | 'playing' | 'end'>('start');
    const [gameMode, setGameMode] = useState<'trivia' | 'guess_surah' | 'complete_verse' | 'guess_translation'>('trivia');
    const [hasTranslation, setHasTranslation] = useState(false);
    const [playerName, setPlayerName] = useState('');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    
    // Leaderboard State
    const [highScores, setHighScores] = useState<QuizScore[]>([]);
    const [currentScoreId, setCurrentScoreId] = useState<string | null>(null);
    const [leaderboardFilter, setLeaderboardFilter] = useState<'trivia' | 'guess_surah' | 'complete_verse' | 'guess_translation' | 'all'>('all');

    useEffect(() => {
        const initData = async () => {
            setLoading(true);
            try {
                const data = await getAllSurahs(language);
                setSurahs(data);
                setHighScores(await StorageService.getQuizScores());
                const transDownloaded = await isAnyTranslationDownloaded();
                setHasTranslation(transDownloaded);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        initData();
    }, [language]);

    const generateQuestions = async (data: Surah[], mode: 'trivia' | 'guess_surah' | 'complete_verse' | 'guess_translation'): Promise<Question[]> => {
        const generated: Question[] = [];
        const usedIndices = new Set<number>();
        
        // Helper to get random surah
        const getRandomSurah = () => {
            let idx = Math.floor(Math.random() * data.length);
            return data[idx];
        };

        if (mode === 'guess_surah') {
            const samples = await getVerseSampleForQuiz(10);
            for (const sample of samples) {
                const correctAnswer = sample.surahName;
                const options = [correctAnswer];
                while (options.length < 4) {
                    const random = getRandomSurah().transliteration;
                    if (!options.includes(random)) options.push(random);
                }
                generated.push({
                    text: sample.text,
                    options: options.sort(() => 0.5 - Math.random()),
                    correctAnswer,
                    type: 'meaning',
                    fullText: sample.text,
                    surahName: sample.surahName,
                    verseId: sample.verseId,
                    surahId: sample.surahId
                });
            }
            return generated;
        }

        if (mode === 'complete_verse') {
            // No longer requesting 'true' for includeWords to avoid heavy network calls
            const samples = await getVerseSampleForQuiz(20, false);
            const questionSamples = samples.slice(0, 10);
            const decoyWordsPool = samples.slice(10).flatMap(s => s.words || []).filter(w => w.char_type_name === 'word').map(w => w.text_uthmani);

            for (const sample of questionSamples) {
                if (!sample.words || sample.words.length < 3) continue;
                
                // Pick a word to hide
                const words = sample.words.filter(w => !w.isBismillah && w.char_type_name === 'word');
                if (words.length < 2) continue;
                
                const hideIdx = Math.floor(Math.random() * words.length);
                const targetWord = words[hideIdx];
                
                const maskedText = sample.words.map((w) => {
                    if (!w.isBismillah && w.char_type_name === 'word' && w.text_uthmani === targetWord.text_uthmani) {
                        return '_____';
                    }
                    return w.text_uthmani;
                }).join(' ');
                
                const correctAnswer = targetWord.text_uthmani;
                const options = [correctAnswer];
                
                // Try to get decoys from the same verse first
                const sameVerseDecoys = words.filter(w => w.text_uthmani !== correctAnswer).map(w => w.text_uthmani);
                for (const d of sameVerseDecoys) {
                    if (options.length < 4 && !options.includes(d)) options.push(d);
                }

                // If still not enough, pick from pool
                let pIdx = 0;
                while (options.length < 4 && pIdx < decoyWordsPool.length) {
                    const decoy = decoyWordsPool[Math.floor(Math.random() * decoyWordsPool.length)];
                    if (!options.includes(decoy)) options.push(decoy);
                    pIdx++;
                }

                while (options.length < 4) {
                    options.push(`كلمة ${options.length}`);
                }

                generated.push({
                    text: maskedText,
                    options: options.sort(() => 0.5 - Math.random()),
                    correctAnswer,
                    type: 'meaning',
                    fullText: sample.text,
                    surahName: sample.surahName,
                    verseId: sample.verseId,
                    surahId: sample.surahId
                });
            }
            return generated;
        }

        if (mode === 'guess_translation') {
            const allSamples = await getVerseSampleForQuiz(30);
            const questionSamples = allSamples.slice(0, 10);
            const decoyPool = allSamples.slice(10).map(s => s.translation).filter(Boolean);

            for (const sample of questionSamples) {
                if (!sample.translation) continue;
                
                const correctAnswer = sample.translation;
                const options = [correctAnswer];
                
                let dIdx = 0;
                const shuffledDecoys = [...decoyPool].sort(() => 0.5 - Math.random());
                while (options.length < 4 && dIdx < shuffledDecoys.length) {
                    const decoy = shuffledDecoys[dIdx++];
                    if (!options.includes(decoy)) options.push(decoy);
                }

                while (options.length < 4) {
                    options.push(`Pilihan decoy ${options.length}`);
                }

                generated.push({
                    text: sample.text,
                    options: options.sort(() => 0.5 - Math.random()),
                    correctAnswer,
                    type: 'meaning',
                    fullText: sample.text,
                    surahName: sample.surahName,
                    verseId: sample.verseId,
                    surahId: sample.surahId
                });
            }
            return generated;
        }

        for (let i = 0; i < 10; i++) {
            let surah = getRandomSurah();
            while(usedIndices.has(surah.id)) {
                surah = getRandomSurah();
            }
            usedIndices.add(surah.id);

            // Determine question type randomly
            const typeRoll = Math.random();
            let question: Question;
            
            const qTemplates = {
                meaning: language === 'id' ? `Apa arti dari nama surat "${surah.transliteration}"?` : `What is the meaning of Surah "${surah.transliteration}"?`,
                count: language === 'id' ? `Berapa jumlah ayat dalam surat "${surah.transliteration}"?` : `How many verses in Surah "${surah.transliteration}"?`,
                reverse: language === 'id' ? `Surat manakah yang memiliki arti "${surah.translation}"?` : `Which Surah means "${surah.translation}"?`,
                order: language === 'id' ? `Surat "${surah.transliteration}" adalah surat keberapa dalam Al-Quran?` : `What number is Surah "${surah.transliteration}" in the Quran?`
            };

            if (typeRoll < 0.3) {
                // TYPE: Meaning
                const correctAnswer = surah.translation;
                const options = [correctAnswer];
                while(options.length < 4) {
                    const random = getRandomSurah().translation;
                    if(!options.includes(random)) options.push(random);
                }
                question = {
                    text: qTemplates.meaning,
                    options: options.sort(() => 0.5 - Math.random()),
                    correctAnswer,
                    type: 'meaning'
                };
            } else if (typeRoll < 0.6) {
                // TYPE: Verse Count
                const correctAnswer = surah.total_verses.toString();
                const options = [correctAnswer];
                while(options.length < 4) {
                    const random = getRandomSurah().total_verses.toString();
                    if(!options.includes(random)) options.push(random);
                }
                question = {
                    text: qTemplates.count,
                    options: options.sort(() => 0.5 - Math.random()),
                    correctAnswer,
                    type: 'verse_count'
                };
            } else if (typeRoll < 0.8) {
                // TYPE: Reverse Meaning
                const correctName = surah.transliteration;
                const opts = [correctName];
                while(opts.length < 4) {
                    const s = getRandomSurah();
                    if(!opts.includes(s.transliteration)) opts.push(s.transliteration);
                }
                question = {
                    text: qTemplates.reverse,
                    options: opts.sort(() => 0.5 - Math.random()),
                    correctAnswer: correctName,
                    type: 'meaning' 
                };
            } else {
                 // TYPE: Order
                 const correctAnswer = surah.id.toString();
                 const options = [correctAnswer];
                 while(options.length < 4) {
                     const random = Math.floor(Math.random() * 114 + 1).toString();
                     if(!options.includes(random)) options.push(random);
                 }
                 question = {
                     text: qTemplates.order,
                     options: options.sort(() => 0.5 - Math.random()),
                     correctAnswer,
                     type: 'order'
                 };
            }

            generated.push(question);
        }
        return generated;
    };

    const startModeSelect = () => {
        if (!playerName.trim()) {
            alert(t('quiz_input_name'));
            return;
        }
        setGameState('mode_select');
    };

    const startGame = async (mode: 'trivia' | 'guess_surah' | 'complete_verse' | 'guess_translation') => {
        setLoading(true);
        setGameMode(mode);
        const q = await generateQuestions(surahs, mode);
        setQuestions(q);
        setCurrentIndex(0);
        setScore(0);
        setGameState('playing');
        setSelectedOption(null);
        setShowFeedback(false);
        setCurrentScoreId(null);
        setLoading(false);
    };

    const handleAnswer = (option: string) => {
        if (showFeedback) return; // Prevent double click

        setSelectedOption(option);
        setShowFeedback(true);

        const isCorrect = option === questions[currentIndex].correctAnswer;
        if (isCorrect) {
            setScore(prev => prev + 1);
        }
    };

    const nextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
            setShowFeedback(false);
        } else {
            finishGame(score);
        }
    };

    const finishGame = async (finalScore: number) => {
        setGameState('end');
        // Save score with mode
        const newEntry = await StorageService.saveQuizScore(playerName, finalScore, questions.length, gameMode);
        setHighScores(await StorageService.getQuizScores());
        setCurrentScoreId(newEntry.id);
        setLeaderboardFilter(gameMode); // Default show current mode's leaderboard
    };

    const getRankInfo = (totalScore: number) => {
        if (totalScore >= 100) return { title: t('quiz_rank_expert'), color: 'text-purple-500' };
        if (totalScore >= 50) return { title: t('quiz_rank_intermediate'), color: 'text-amber-500' };
        return { title: t('quiz_rank_beginner'), color: 'text-emerald-500' };
    };

    const renderLeaderboard = (limit?: number) => {
        const filteredScores = leaderboardFilter === 'all' 
            ? highScores 
            : highScores.filter(s => s.gameMode === leaderboardFilter);

        const displayScores = limit ? filteredScores.slice(0, limit) : filteredScores;
        
        if (displayScores.length === 0) return (
            <div className="text-center text-gray-400 text-xs italic py-8 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-stone-200 dark:border-slate-700">
                Belum ada skor untuk mode ini.
            </div>
        );

        return (
            <div className="w-full space-y-2">
                {displayScores.map((s, idx) => {
                    const isCurrentRun = s.id === currentScoreId;
                    let rankIcon = <span className="font-bold text-gray-400 w-5 text-center text-xs">{idx + 1}</span>;
                    if (idx === 0) rankIcon = <Crown className="w-5 h-5 text-yellow-500 fill-current" />;
                    else if (idx === 1) rankIcon = <Medal className="w-5 h-5 text-gray-400 fill-current" />;
                    else if (idx === 2) rankIcon = <Medal className="w-5 h-5 text-orange-400 fill-current" />;

                    // Get mode label
                    let modeLabel = '';
                    let modeColor = '';
                    switch(s.gameMode) {
                        case 'trivia': modeLabel = t('quiz_mode_trivia_title'); modeColor = 'bg-blue-100 text-blue-600'; break;
                        case 'guess_surah': modeLabel = t('quiz_mode_guess_surah_title'); modeColor = 'bg-emerald-100 text-emerald-600'; break;
                        case 'complete_verse': modeLabel = t('quiz_mode_complete_verse_title'); modeColor = 'bg-amber-100 text-amber-600'; break;
                        case 'guess_translation': modeLabel = t('quiz_mode_guess_translation_title'); modeColor = 'bg-purple-100 text-purple-600'; break;
                    }

                    return (
                        <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${isCurrentRun ? 'bg-quran-gold/10 border-quran-gold scale-[1.02] shadow-md' : 'bg-white dark:bg-slate-800 border-stone-100 dark:border-slate-700 shadow-sm'}`}>
                            <div className="flex items-center gap-3">
                                {rankIcon}
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-bold ${isCurrentRun ? 'text-quran-dark dark:text-quran-gold' : 'text-gray-700 dark:text-gray-200'}`}>
                                            {s.playerName}
                                        </span>
                                        {s.gameMode && leaderboardFilter === 'all' && (
                                            <span className={`text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-full ${modeColor}`}>
                                                {modeLabel}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-gray-400">
                                        {new Date(s.timestamp).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="font-bold text-quran-gold">{s.score}/{s.totalQuestions}</div>
                                {s.score === s.totalQuestions && (
                                    <span className="text-[8px] text-emerald-500 font-bold uppercase tracking-widest">Perfect</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[80vh]">
                <Loader2 className="w-10 h-10 animate-spin text-quran-gold" />
            </div>
        );
    }

    // --- SCREEN: START ---
    if (gameState === 'start') {
        return (
            <div className="max-w-xl mx-auto px-4 py-12 animate-fade-in text-center flex flex-col items-center justify-center min-h-[70vh]">
                <div className="w-24 h-24 bg-gradient-to-br from-quran-gold to-yellow-300 rounded-3xl flex items-center justify-center shadow-xl mb-6 rotate-12">
                    <Brain className="w-12 h-12 text-white -rotate-12" />
                </div>
                
                <h1 className="text-4xl font-bold text-quran-dark dark:text-white font-serif mb-2">
                    {t('quiz_title')}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm text-sm">
                    {t('quiz_desc')}
                </p>

                {/* Name Input */}
                <div className="w-full max-w-xs mb-6">
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                            type="text"
                            placeholder={t('quiz_input_name')}
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 dark:border-slate-700 focus:border-quran-gold focus:ring-2 focus:ring-quran-gold/20 outline-none text-center font-bold text-quran-dark dark:text-white bg-white dark:bg-slate-800 shadow-sm transition-all"
                        />
                    </div>
                </div>

                <button 
                    onClick={startModeSelect}
                    disabled={!playerName.trim()}
                    className="w-full max-w-xs py-4 bg-quran-dark dark:bg-quran-gold text-white dark:text-quran-dark rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:bg-quran-dark/90 dark:hover:bg-quran-gold/90 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                    {t('quiz_btn_start')}
                </button>

                {/* Mini Leaderboard with Tabs */}
                {highScores.length > 0 && (
                    <div className="mt-12 w-full max-w-sm">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <Trophy className="w-4 h-4 text-quran-gold" />
                            <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">{t('quiz_leaderboard')}</h3>
                        </div>

                        {/* Mini Mode Tabs */}
                        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar mb-4 pb-1 justify-start px-0.5">
                            {(['all', 'trivia', 'guess_surah', 'complete_verse', 'guess_translation'] as const).map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setLeaderboardFilter(m)}
                                    className={`px-3 py-1.5 rounded-lg text-[9px] font-bold transition-all whitespace-nowrap ${
                                        leaderboardFilter === m 
                                        ? 'bg-quran-gold text-white shadow-sm' 
                                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                                    }`}
                                >
                                    {m === 'all' ? t('quiz_leaderboard_all') : t(`quiz_mode_${m}_title`)}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-2">
                            {renderLeaderboard(3)}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // --- SCREEN: MODE SELECT ---
    if (gameState === 'mode_select') {
        return (
            <div className="max-w-xl mx-auto px-4 py-8 animate-fade-in text-center flex flex-col items-center pb-24">
                <h2 className="text-2xl font-bold text-quran-dark dark:text-white font-serif mb-8">{t('quiz_mode_title')}</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    <button 
                        onClick={() => startGame('trivia')}
                        className="p-5 bg-white dark:bg-slate-800 border-2 border-stone-100 dark:border-slate-700 rounded-2xl hover:border-quran-gold transition-all text-left group flex flex-col justify-between"
                    >
                        <div>
                            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors mb-3">
                                <MessageSquare className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-gray-800 dark:text-white mb-1">{t('quiz_mode_trivia_title')}</h3>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">{t('quiz_mode_trivia_desc')}</p>
                        </div>
                    </button>

                    <button 
                        onClick={() => startGame('guess_surah')}
                        className="p-5 bg-white dark:bg-slate-800 border-2 border-stone-100 dark:border-slate-700 rounded-2xl hover:border-quran-gold transition-all text-left group flex flex-col justify-between"
                    >
                        <div>
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors mb-3">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-gray-800 dark:text-white mb-1">{t('quiz_mode_guess_surah_title')}</h3>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">{t('quiz_mode_guess_surah_desc')}</p>
                        </div>
                    </button>

                    <button 
                        onClick={() => startGame('complete_verse')}
                        className="p-5 bg-white dark:bg-slate-800 border-2 border-stone-100 dark:border-slate-700 rounded-2xl hover:border-quran-gold transition-all text-left group flex flex-col justify-between"
                    >
                        <div>
                            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors mb-3">
                                <Edit className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-gray-800 dark:text-white mb-1">{t('quiz_mode_complete_verse_title')}</h3>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">{t('quiz_mode_complete_verse_desc')}</p>
                        </div>
                    </button>

                    <button 
                        onClick={() => {
                            if (hasTranslation) startGame('guess_translation');
                        }}
                        className={`p-5 bg-white dark:bg-slate-800 border-2 border-stone-100 dark:border-slate-700 rounded-2xl transition-all text-left group flex flex-col justify-between ${!hasTranslation ? 'opacity-60 grayscale cursor-not-allowed' : 'hover:border-quran-gold'}`}
                    >
                        <div>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${!hasTranslation ? 'bg-gray-100 text-gray-400' : 'bg-purple-50 dark:bg-purple-900/30 text-purple-500 group-hover:bg-purple-500 group-hover:text-white'}`}>
                                <Languages className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-gray-800 dark:text-white mb-1">{t('quiz_mode_guess_translation_title')}</h3>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">{t('quiz_mode_guess_translation_desc')}</p>
                        </div>
                    </button>
                </div>

                {!hasTranslation && (
                    <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-xl flex items-center gap-3 text-left">
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                        <div className="flex-1">
                            <p className="text-[11px] text-amber-800 dark:text-amber-200 leading-tight mb-2">{t('quiz_no_translation')}</p>
                            <button 
                                onClick={() => navigate('/settings')}
                                className="flex items-center text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline"
                            >
                                <Download className="w-3 h-3 mr-1" />
                                {t('quiz_btn_download_trans')}
                            </button>
                        </div>
                    </div>
                )}

                <button 
                    onClick={() => setGameState('start')}
                    className="mt-12 flex items-center text-sm font-bold text-gray-400 hover:text-quran-dark dark:hover:text-quran-gold transition-colors"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    {t('btn_back')}
                </button>
            </div>
        );
    }

    // --- SCREEN: END ---
    if (gameState === 'end') {
        const percentage = Math.round((score / questions.length) * 100);
        let message = t('quiz_msg_keep_learning');
        if (percentage >= 80) message = t('quiz_msg_excellent');
        else if (percentage >= 50) message = t('quiz_msg_good');

        const totalPlayerScore = highScores.filter(s => s.playerName === playerName).reduce((sum, s) => sum + s.score, 0);
        const rank = getRankInfo(totalPlayerScore);

        return (
            <div className="max-w-xl mx-auto px-4 py-8 animate-fade-in text-center flex flex-col items-center pb-24">
                <div className="mb-4 relative">
                     <div className="absolute inset-0 bg-quran-gold/20 rounded-full blur-3xl"></div>
                     <Trophy className="w-20 h-20 text-quran-gold relative z-10 drop-shadow-sm" />
                </div>
                
                <h2 className="text-2xl font-bold text-quran-dark dark:text-white font-serif mb-1">{message}</h2>
                <div className="text-5xl font-bold text-gray-800 dark:text-gray-200 mb-2 font-sans">{score}/{questions.length}</div>
                
                <div className="flex items-center gap-2 mb-8">
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">{t('quiz_score')} {playerName}</p>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-stone-100 dark:bg-slate-700 ${rank.color}`}>
                        {rank.title}
                    </span>
                </div>

                {/* Leaderboard Section with Tabs */}
                <div className="w-full max-w-md bg-stone-50/50 dark:bg-slate-800/50 rounded-3xl p-5 border border-stone-100 dark:border-slate-700 mb-8 shadow-inner">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-600 dark:text-gray-300 flex items-center gap-2">
                            <Star className="w-4 h-4 text-quran-gold fill-current" /> {t('quiz_leaderboard')}
                        </h3>
                        <div className="flex items-center gap-1 bg-stone-200/50 dark:bg-slate-700/50 p-1 rounded-lg">
                            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 ml-1 mr-2">{t('quiz_total_points')}:</span>
                            <span className="text-xs font-black text-quran-dark dark:text-quran-gold">{totalPlayerScore}</span>
                        </div>
                    </div>

                    {/* Mode Tabs */}
                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar mb-4 pb-1 w-full justify-start px-0.5">
                        {(['all', 'trivia', 'guess_surah', 'complete_verse', 'guess_translation'] as const).map((m) => (
                            <button
                                key={m}
                                onClick={() => setLeaderboardFilter(m)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap ${
                                    leaderboardFilter === m 
                                    ? 'bg-quran-dark dark:bg-quran-gold text-white dark:text-quran-dark shadow-md' 
                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                                }`}
                            >
                                {m === 'all' ? t('quiz_leaderboard_all') : t(`quiz_mode_${m}_title`)}
                            </button>
                        ))}
                    </div>

                    <div className="max-h-80 overflow-y-auto custom-scrollbar pr-1">
                        {renderLeaderboard()}
                    </div>
                </div>

                <div className="flex flex-col gap-3 w-full max-w-xs">
                    <button 
                        onClick={startGame}
                        className="py-4 bg-quran-dark dark:bg-quran-gold text-white dark:text-quran-dark rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:opacity-90 active:scale-95 transition-all"
                    >
                        <RefreshCw className="w-4 h-4" /> {t('quiz_btn_play_again')}
                    </button>
                    <button 
                        onClick={() => navigate('/')}
                        className="py-4 bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 rounded-xl font-bold hover:bg-stone-50 dark:hover:bg-slate-700 active:scale-95 transition-all"
                    >
                        {t('quiz_btn_home')}
                    </button>
                </div>
            </div>
        );
    }

    // --- SCREEN: PLAYING ---
    const currentQ = questions[currentIndex];
    
    return (
        <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in min-h-screen flex flex-col">
            
            {/* Header Info */}
            <div className="flex justify-between items-center mb-6">
                 <div className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-300">
                     <User className="w-4 h-4" /> {playerName}
                 </div>
                 <div className="text-xs font-bold px-2 py-1 bg-stone-100 dark:bg-slate-700 rounded text-gray-500 dark:text-gray-300">
                     {t('quiz_score')}: {score}
                 </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                    <span>{t('quiz_question')} {currentIndex + 1}</span>
                    <span>{questions.length}</span>
                </div>
                <div className="h-2 w-full bg-stone-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-quran-gold transition-all duration-500 ease-out"
                        style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Question Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-stone-200 dark:border-slate-700 p-6 sm:p-10 mb-6 flex-1 flex flex-col justify-center text-center relative overflow-hidden">
                 <div className="absolute -top-10 -right-10 w-40 h-40 bg-quran-gold/5 rounded-full pointer-events-none"></div>
                 <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-quran-dark/5 rounded-full pointer-events-none"></div>
                 
                 {showFeedback && (currentQ.surahName || currentQ.fullText) && (
                     <div className="mb-6 animate-in fade-in zoom-in duration-300">
                         {selectedOption === currentQ.correctAnswer ? (
                             <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-sm font-bold border border-green-100 dark:border-green-900/50 mb-4">
                                 <CheckCircle className="w-4 h-4" />
                                 {t('quiz_correct_title')}
                             </div>
                         ) : (
                             <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-sm font-bold border border-red-100 dark:border-red-900/50 mb-4">
                                 <XCircle className="w-4 h-4" />
                                 {t('quiz_incorrect_title')}
                             </div>
                         )}
                         
                         {(gameMode === 'guess_surah' || gameMode === 'complete_verse' || gameMode === 'guess_translation') && (
                             <div className="mt-2 text-xs font-bold text-quran-gold uppercase tracking-widest flex items-center justify-center gap-2">
                                 <BookOpen className="w-3 h-3" />
                                 {currentQ.surahName} {currentQ.verseId ? `: ${currentQ.verseId}` : ''}
                             </div>
                         )}
                     </div>
                 )}

                 <h2 className={`font-bold text-gray-800 dark:text-white font-serif leading-relaxed relative z-10 transition-all duration-500 ${gameMode === 'guess_surah' || gameMode === 'complete_verse' ? 'text-3xl sm:text-4xl font-arabic' : 'text-xl sm:text-2xl'}`}>
                     {showFeedback && currentQ.fullText ? currentQ.fullText : currentQ.text}
                 </h2>

                 {showFeedback && gameMode === 'guess_translation' && (
                     <div className="mt-6 p-4 bg-stone-50 dark:bg-slate-700/50 rounded-xl text-gray-600 dark:text-gray-300 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                         {currentQ.correctAnswer}
                     </div>
                 )}
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentQ.options.map((option, idx) => {
                    const isSelected = selectedOption === option;
                    const isCorrect = option === currentQ.correctAnswer;
                    
                    let btnClass = "bg-white dark:bg-slate-800 border-stone-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:border-quran-gold/50 dark:hover:border-quran-gold/50"; // Default
                    let icon = null;

                    if (showFeedback) {
                        if (isCorrect) {
                            btnClass = "bg-green-50 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400 ring-1 ring-green-500";
                            icon = <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
                        } else if (isSelected && !isCorrect) {
                            btnClass = "bg-red-50 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-400 ring-1 ring-red-500";
                            icon = <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
                        } else {
                            btnClass = "bg-stone-50 dark:bg-slate-700/50 border-stone-100 dark:border-slate-700 text-gray-300 dark:text-gray-600 opacity-50";
                        }
                    } else {
                        // Hover effects only when feedback not showing
                        btnClass += " hover:shadow-md hover:-translate-y-0.5 active:scale-95";
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => handleAnswer(option)}
                            disabled={showFeedback}
                            className={`p-4 rounded-xl border-2 font-semibold transition-all duration-300 flex items-center justify-between group ${btnClass} ${gameMode === 'complete_verse' ? 'font-arabic text-2xl py-2' : 'text-sm'}`}
                        >
                            <span className="text-left">{option}</span>
                            {icon}
                        </button>
                    );
                })}
            </div>

            {/* Navigation Button (Visible after answering) */}
            {showFeedback && (
                <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
                    <button 
                        onClick={nextQuestion}
                        className="w-full py-4 bg-quran-dark dark:bg-quran-gold text-white dark:text-quran-dark rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition-all active:scale-95"
                    >
                        {currentIndex < questions.length - 1 ? t('btn_next') : t('btn_finish')}
                    </button>
                </div>
            )}

        </div>
    );
};

export default QuizPage;
