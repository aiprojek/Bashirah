import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Compass,
  BookOpen,
  Volume2,
  Sparkles,
  Trophy,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Info,
  RotateCcw,
} from 'lucide-react';
import { WAQAF_DATA, WAQAF_QUIZ_QUESTIONS, WaqafItem } from '../constants/waqafData';
import { useLanguage } from '../contexts/LanguageContext';
import { useAudio } from '../contexts/AudioContext';

const WaqafGuidePage: React.FC = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { playVerse } = useAudio();

  const urlId = searchParams.get('id');
  const [activeTab, setActiveTab] = useState<'guide' | 'quiz'>('guide');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeCardId, setActiveCardId] = useState<string | null>(urlId || null);

  useEffect(() => {
    if (urlId) {
      setActiveCardId(urlId);
      const el = document.getElementById(`waqaf-${urlId}`);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
      }
    }
  }, [urlId]);

  // Quiz State
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);

  const categories = [
    { id: 'all', label: language === 'en' ? 'All Signs' : 'Semua Tanda' },
    { id: 'must-stop', label: language === 'en' ? 'Must Stop' : 'Wajib Berhenti' },
    { id: 'can-stop', label: language === 'en' ? 'Permissible' : 'Boleh Berhenti' },
    { id: 'better-continue', label: language === 'en' ? 'Better Continue' : 'Lebih Utama Lanjut' },
    { id: 'must-not-stop', label: language === 'en' ? 'Do Not Stop' : 'Dilarang Berhenti' },
    { id: 'special', label: language === 'en' ? 'Special (Saktah/Mu\'anaqah)' : 'Tanda Khusus' },
  ];

  const filteredWaqaf = selectedCategory === 'all'
    ? WAQAF_DATA
    : WAQAF_DATA.filter((w) => w.category === selectedCategory);

  const handlePlayAudio = (surahId: number, verseId: number, surahName: string) => {
    playVerse(surahId, verseId, undefined, surahName);
  };

  const handleOpenVerse = (surahId: number, verseId: number) => {
    navigate(`/surah/${surahId}#verse-${verseId}`);
  };

  // Quiz Handlers
  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    setIsAnswerSubmitted(true);
    const q = WAQAF_QUIZ_QUESTIONS[currentQuizIndex];
    if (selectedAnswer === q.correctIndex) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuizIndex < WAQAF_QUIZ_QUESTIONS.length - 1) {
      setCurrentQuizIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsQuizCompleted(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setQuizScore(0);
    setIsQuizCompleted(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in pb-28">
      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3 border border-indigo-500/20">
          <Compass className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'Tajweed & Recitation Rules' : 'Ilmu Tajwid & Seni Tilawah'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-quran-dark dark:text-gray-100 mb-2">
          {language === 'en' ? 'Interactive Guide to Waqaf Marks' : 'Panduan Tanda Waqaf Interaktif'}
        </h1>
        <p className="text-stone-500 dark:text-stone-400 text-sm max-w-lg mx-auto">
          {language === 'en'
            ? 'Master the rules of stopping, continuing, and breathing in the Holy Quran with real examples and quiz'
            : 'Pahami kaidah berhenti, menyambung, dan menahan napas dalam tilawah Al-Qur\'an lengkap dengan contoh ayat dan kuis'}
        </p>
      </div>

      {/* Main Tabs: Panduan vs Kuis */}
      <div className="flex p-1 bg-stone-100 dark:bg-slate-800 rounded-2xl max-w-sm mx-auto mb-8 border border-stone-200/60 dark:border-slate-700/60 shadow-inner">
        <button
          type="button"
          onClick={() => setActiveTab('guide')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'guide'
              ? 'bg-white dark:bg-slate-700 text-quran-dark dark:text-white shadow-xs'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
          }`}
        >
          <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>{language === 'en' ? 'Waqaf Signs' : 'Katalog Tanda'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('quiz')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'quiz'
              ? 'bg-white dark:bg-slate-700 text-quran-dark dark:text-white shadow-xs'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>{language === 'en' ? 'Waqaf Quiz' : 'Kuis Pemahaman'}</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* MODE 1: WAQAF CATALOG */}
      {/* ============================================================== */}
      {activeTab === 'guide' && (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-quran-dark dark:bg-quran-gold text-white dark:text-slate-900 shadow-xs'
                    : 'bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Waqaf Signs Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredWaqaf.map((item) => {
              const isExpanded = activeCardId === item.id;
              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl bg-white dark:bg-slate-800/95 border transition-all ${
                    isExpanded
                      ? 'border-indigo-500/50 shadow-md ring-2 ring-indigo-500/20'
                      : 'border-stone-200/80 dark:border-slate-700/80 shadow-2xs hover:border-indigo-500/30'
                  }`}
                >
                  {/* Top Bar: Symbol & Title */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-arabic text-2xl font-bold border border-indigo-500/25 shrink-0">
                        {item.symbol}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-gray-900 dark:text-white">
                          {item.name}
                        </h3>
                        <p className="text-xs font-arabic text-stone-500 dark:text-stone-400" dir="rtl">
                          {item.arabicName}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${item.categoryColor}`}
                    >
                      {item.categoryLabel}
                    </span>
                  </div>

                  {/* Hukum & Description */}
                  <div className="space-y-2 mb-4 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-gray-800 dark:text-gray-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      <span>Hukum: {item.hukum}</span>
                    </div>
                    <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                      {language === 'en' ? item.descriptionEn : item.description}
                    </p>
                    <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-slate-900/60 border border-stone-100 dark:border-slate-700/60 text-stone-500 dark:text-stone-400">
                      <span className="font-semibold text-gray-700 dark:text-gray-300 block mb-0.5">
                        Cara Membaca:
                      </span>
                      <span>{item.howToRead}</span>
                    </div>
                  </div>

                  {/* Real Quranic Example */}
                  <div className="p-3.5 rounded-xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/15 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-indigo-700 dark:text-indigo-300 font-bold">
                      <span>
                        Contoh: QS. {item.example.surahName} : {item.example.verseId}
                      </span>
                    </div>

                    <p
                      className="font-arabic text-lg sm:text-xl text-right leading-loose text-gray-900 dark:text-gray-100"
                      dir="rtl"
                    >
                      {item.example.arabicSnippet}
                    </p>

                    <p className="text-xs text-stone-500 dark:text-stone-400 italic leading-relaxed pt-1 border-t border-indigo-500/15">
                      {item.example.translation}
                    </p>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          handlePlayAudio(
                            item.example.surahId,
                            item.example.verseId,
                            item.example.surahName
                          )
                        }
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 flex items-center gap-1 transition-colors cursor-pointer"
                        title="Putar Audio Ayat"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Dengar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenVerse(item.example.surahId, item.example.verseId)}
                        className="px-3 py-1 rounded-lg text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>Buka Ayat</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODE 2: INTERACTIVE WAQAF QUIZ */}
      {/* ============================================================== */}
      {activeTab === 'quiz' && (
        <div className="max-w-xl mx-auto space-y-6">
          {!isQuizCompleted ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800/95 border border-stone-200/80 dark:border-slate-700/80 shadow-md space-y-6">
              {/* Quiz Progress Header */}
              <div className="flex items-center justify-between text-xs font-bold text-stone-500 dark:text-stone-400 pb-3 border-b border-stone-100 dark:border-slate-700">
                <span>
                  Pertanyaan {currentQuizIndex + 1} dari {WAQAF_QUIZ_QUESTIONS.length}
                </span>
                <span className="text-amber-600 dark:text-amber-400">Skor: {quizScore}</span>
              </div>

              {/* Question Item */}
              {(() => {
                const q = WAQAF_QUIZ_QUESTIONS[currentQuizIndex];
                return (
                  <div className="space-y-4">
                    {/* Symbol Focus Box */}
                    <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-arabic text-4xl font-bold border border-indigo-500/25 mx-auto shadow-inner">
                      {q.symbol}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-center text-gray-900 dark:text-white leading-snug">
                      {q.question}
                    </h3>

                    {/* Options List */}
                    <div className="space-y-2.5 pt-2">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = selectedAnswer === optIdx;
                        const isCorrect = optIdx === q.correctIndex;
                        let optionStyle =
                          'bg-stone-50 dark:bg-slate-700/60 border-stone-200 dark:border-slate-600 hover:bg-stone-100 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200';

                        if (isAnswerSubmitted) {
                          if (isCorrect) {
                            optionStyle =
                              'bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold';
                          } else if (isSelected && !isCorrect) {
                            optionStyle =
                              'bg-rose-500/15 border-rose-500 text-rose-800 dark:text-rose-300 font-bold';
                          }
                        } else if (isSelected) {
                          optionStyle =
                            'bg-indigo-500/15 border-indigo-500 text-indigo-800 dark:text-indigo-300 font-bold ring-2 ring-indigo-500/20';
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => handleSelectOption(optIdx)}
                            className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${optionStyle}`}
                          >
                            <span>{opt}</span>
                            {isAnswerSubmitted && isCorrect && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                            {isAnswerSubmitted && isSelected && !isCorrect && (
                              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation Box on Submit */}
                    {isAnswerSubmitted && (
                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 leading-relaxed animate-in fade-in">
                        <span className="font-bold block mb-1">Penjelasan:</span>
                        <span>{q.explanation}</span>
                      </div>
                    )}

                    {/* Submit / Next Button */}
                    <div className="pt-2">
                      {!isAnswerSubmitted ? (
                        <button
                          type="button"
                          onClick={handleSubmitAnswer}
                          disabled={selectedAnswer === null}
                          className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md active:scale-98 disabled:opacity-40 cursor-pointer"
                        >
                          Cek Jawaban
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleNextQuestion}
                          className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-quran-dark dark:bg-quran-gold dark:text-slate-900 hover:opacity-95 transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                        >
                          <span>
                            {currentQuizIndex < WAQAF_QUIZ_QUESTIONS.length - 1
                              ? 'Pertanyaan Selanjutnya'
                              : 'Lihat Skor Akhir'}
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            /* Quiz Completed Score Card */
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-800/95 border border-stone-200/80 dark:border-slate-700/80 shadow-lg text-center space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                <Trophy className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  Kuis Selesai!
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Berikut hasil pemahaman tanda waqaf Anda:
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-stone-50 dark:bg-slate-700/50 border border-stone-200/80 dark:border-slate-600 text-center">
                <span className="text-4xl font-black font-mono text-indigo-600 dark:text-indigo-400 block mb-1">
                  {quizScore} / {WAQAF_QUIZ_QUESTIONS.length}
                </span>
                <span className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                  {quizScore === WAQAF_QUIZ_QUESTIONS.length
                    ? '🎉 Masya Allah, sempurna! Pemahaman tanda waqaf Anda sangat baik!'
                    : quizScore >= 3
                      ? '👍 Bagus! Terus latih tilawah Anda dengan memperhatikan tanda waqaf.'
                      : '📖 Teruslah belajar dan mengulang katalog tanda waqaf di atas agar bacaan semakin tartil.'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleRestartQuiz}
                  className="flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-gray-700 dark:text-gray-200 bg-stone-100 dark:bg-slate-700 hover:bg-stone-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Ulangi Kuis</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('guide')}
                  className="flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-quran-dark dark:bg-quran-gold dark:text-slate-900 hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Kembali ke Katalog
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WaqafGuidePage;
