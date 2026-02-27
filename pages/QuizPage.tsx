
import React, { useState, useEffect } from 'react';
import { Surah, QuizScore } from '../types';
import { getAllSurahs } from '../services/quranService';
import * as StorageService from '../services/storageService';
import { Trophy, CheckCircle, XCircle, Brain, RefreshCw, Star, Loader2, User, Medal, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

interface Question {
    text: string;
    options: string[];
    correctAnswer: string;
    type: 'meaning' | 'verse_count' | 'revelation' | 'order';
}

const QuizPage: React.FC = () => {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const [surahs, setSurahs] = useState<Surah[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Game State
    const [gameState, setGameState] = useState<'start' | 'playing' | 'end'>('start');
    const [playerName, setPlayerName] = useState('');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    
    // Leaderboard State
    const [highScores, setHighScores] = useState<QuizScore[]>([]);
    const [currentScoreId, setCurrentScoreId] = useState<string | null>(null);

    useEffect(() => {
        const initData = async () => {
            const data = await getAllSurahs(language);
            setSurahs(data);
            setLoading(false);
            setHighScores(await StorageService.getQuizScores());
        };
        initData();
    }, [language]);

    const generateQuestions = (data: Surah[]): Question[] => {
        const generated: Question[] = [];
        const usedIndices = new Set<number>();
        
        // Helper to get random surah
        const getRandomSurah = () => {
            let idx = Math.floor(Math.random() * data.length);
            // Try not to repeat same surah as the main question too often
            return data[idx];
        };

        for (let i = 0; i < 10; i++) {
            let surah = getRandomSurah();
            while(usedIndices.has(surah.id)) {
                surah = getRandomSurah();
            }
            usedIndices.add(surah.id);

            // Determine question type randomly
            const typeRoll = Math.random();
            let question: Question;

            // Simplified question generation for now, ideally questions should be dynamic based on lang
            // But since surah data is localized, we just need to localize the Question Text template
            
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
                // TYPE: Revelation (City) -> Changed to Reverse Meaning for simplicity
                const meaningTarget = surah.translation;
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

    const startGame = () => {
        if (!playerName.trim()) {
            alert(t('quiz_input_name'));
            return;
        }
        const q = generateQuestions(surahs);
        setQuestions(q);
        setCurrentIndex(0);
        setScore(0);
        setGameState('playing');
        setSelectedOption(null);
        setShowFeedback(false);
        setCurrentScoreId(null);
    };

    const handleAnswer = (option: string) => {
        if (showFeedback) return; // Prevent double click

        setSelectedOption(option);
        setShowFeedback(true);

        const isCorrect = option === questions[currentIndex].correctAnswer;
        if (isCorrect) {
            setScore(prev => prev + 1);
        }

        setTimeout(() => {
            if (currentIndex < questions.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setSelectedOption(null);
                setShowFeedback(false);
            } else {
                finishGame(score + (isCorrect ? 1 : 0)); // Pass latest score
            }
        }, 1200); 
    };

    const finishGame = async (finalScore: number) => {
        setGameState('end');
        // Save score
        const newEntry = await StorageService.saveQuizScore(playerName, finalScore, questions.length);
        setHighScores(await StorageService.getQuizScores());
        setCurrentScoreId(newEntry.id);
    };

    const renderLeaderboard = (limit?: number) => {
        const displayScores = limit ? highScores.slice(0, limit) : highScores;
        
        if (displayScores.length === 0) return (
            <div className="text-center text-gray-400 text-xs italic py-4">Belum ada skor tersimpan. Jadilah yang pertama!</div>
        );

        return (
            <div className="w-full space-y-2">
                {displayScores.map((s, idx) => {
                    const isCurrentRun = s.id === currentScoreId;
                    let rankIcon = <span className="font-bold text-gray-400 w-5 text-center">{idx + 1}</span>;
                    if (idx === 0) rankIcon = <Crown className="w-5 h-5 text-yellow-500 fill-current" />;
                    else if (idx === 1) rankIcon = <Medal className="w-5 h-5 text-gray-400 fill-current" />;
                    else if (idx === 2) rankIcon = <Medal className="w-5 h-5 text-orange-400 fill-current" />;

                    return (
                        <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border ${isCurrentRun ? 'bg-quran-gold/10 border-quran-gold' : 'bg-white dark:bg-slate-800 border-stone-100 dark:border-slate-700'} shadow-sm`}>
                            <div className="flex items-center gap-3">
                                {rankIcon}
                                <div className="flex flex-col">
                                    <span className={`text-sm font-bold ${isCurrentRun ? 'text-quran-dark dark:text-quran-gold' : 'text-gray-700 dark:text-gray-200'}`}>
                                        {s.playerName} {isCurrentRun && '(Anda)'}
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                        {new Date(s.timestamp).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <div className="font-bold text-quran-gold">{s.score}/{s.totalQuestions}</div>
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
                    onClick={startGame}
                    disabled={!playerName.trim()}
                    className="w-full max-w-xs py-4 bg-quran-dark dark:bg-quran-gold text-white dark:text-quran-dark rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:bg-quran-dark/90 dark:hover:bg-quran-gold/90 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                    {t('quiz_btn_start')}
                </button>

                {/* Mini Leaderboard */}
                {highScores.length > 0 && (
                    <div className="mt-12 w-full max-w-sm">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <Trophy className="w-4 h-4 text-quran-gold" />
                            <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">{t('quiz_leaderboard')}</h3>
                        </div>
                        {renderLeaderboard(3)}
                    </div>
                )}
            </div>
        );
    }

    // --- SCREEN: END ---
    if (gameState === 'end') {
        const percentage = Math.round((score / questions.length) * 100);
        let message = t('quiz_msg_keep_learning');
        if (percentage >= 80) message = t('quiz_msg_excellent');
        else if (percentage >= 50) message = t('quiz_msg_good');

        return (
            <div className="max-w-xl mx-auto px-4 py-12 animate-fade-in text-center flex flex-col items-center">
                <div className="mb-4 relative">
                     <div className="absolute inset-0 bg-quran-gold/20 rounded-full blur-3xl"></div>
                     <Trophy className="w-24 h-24 text-quran-gold relative z-10 drop-shadow-sm" />
                </div>
                
                <h2 className="text-2xl font-bold text-quran-dark dark:text-white font-serif mb-1">{message}</h2>
                <div className="text-5xl font-bold text-gray-800 dark:text-gray-200 mb-2 font-sans">{score}/{questions.length}</div>
                <p className="text-gray-400 mb-8 text-xs font-bold uppercase tracking-wider">{t('quiz_score')} {playerName}</p>

                {/* Leaderboard Section */}
                <div className="w-full max-w-md bg-stone-50/50 dark:bg-slate-800/50 rounded-2xl p-4 border border-stone-100 dark:border-slate-700 mb-8">
                    <h3 className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-3 text-left flex items-center gap-2">
                        <Star className="w-4 h-4 text-quran-gold fill-current" /> {t('quiz_leaderboard')}
                    </h3>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar pr-1">
                        {renderLeaderboard()}
                    </div>
                </div>

                <div className="flex flex-col gap-3 w-full max-w-xs">
                    <button 
                        onClick={startGame}
                        className="py-3 bg-quran-dark dark:bg-quran-gold text-white dark:text-quran-dark rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-quran-dark/90 dark:hover:bg-quran-gold/90"
                    >
                        <RefreshCw className="w-4 h-4" /> {t('quiz_btn_play_again')}
                    </button>
                    <button 
                        onClick={() => navigate('/')}
                        className="py-3 bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 rounded-xl font-bold hover:bg-stone-50 dark:hover:bg-slate-700"
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
                 
                 <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white font-serif leading-relaxed relative z-10">
                     {currentQ.text}
                 </h2>
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
                            className={`p-4 rounded-xl border-2 font-semibold text-sm transition-all duration-300 flex items-center justify-between group ${btnClass}`}
                        >
                            <span className="text-left">{option}</span>
                            {icon}
                        </button>
                    );
                })}
            </div>

        </div>
    );
};

export default QuizPage;
