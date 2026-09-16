import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ExternalLink, Award, CheckCircle2, Repeat, BookOpen, ArrowRight } from 'lucide-react';
import { MatchingAyahMatch, getMatchingAyahsForVerse } from '../services/matchingAyahService';
import { getAyahMutashabihatPhrases, AyahPhraseOccurrence } from '../services/mutashabihatService';
import * as QuranService from '../services/quranService';
import { useLanguage } from '../contexts/LanguageContext';
import Loading from './Loading';
import UnifiedModal from './UnifiedModal';

interface MatchingAyahModalProps {
  isOpen: boolean;
  onClose: () => void;
  surahId: number;
  surahName: string;
  verseId: number;
  onJumpVerse?: (targetSurahId: number, targetVerseId: number) => void;
}

interface EnrichedMatch extends MatchingAyahMatch {
  targetSurahId: number;
  targetVerseId: number;
  targetSurahName?: string;
  arabicText?: string;
  translationText?: string;
}

const MatchingAyahModal: React.FC<MatchingAyahModalProps> = ({
  isOpen,
  onClose,
  surahId,
  surahName,
  verseId,
  onJumpVerse,
}) => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [matches, setMatches] = useState<EnrichedMatch[]>([]);
  const [phrases, setPhrases] = useState<AyahPhraseOccurrence[]>([]);
  const [activeTab, setActiveTab] = useState<'phrases' | 'structural'>('phrases');
  const [surahsList, setSurahsList] = useState<Array<{ id: number; transliteration: string }>>([]);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    const fetchMatches = async () => {
      setLoading(true);
      try {
        const [rawMatches, rawPhrases, surahs] = await Promise.all([
          getMatchingAyahsForVerse(surahId, verseId),
          getAyahMutashabihatPhrases(surahId, verseId),
          QuranService.getAllSurahs(),
        ]);

        if (isMounted) {
          setSurahsList(surahs);
          setPhrases(rawPhrases);

          // Decide initial active tab
          if (rawPhrases.length > 0) {
            setActiveTab('phrases');
          } else {
            setActiveTab('structural');
          }
        }

        const enriched: EnrichedMatch[] = [];
        for (const match of rawMatches) {
          const [sIdStr, vIdStr] = match.matched_ayah_key.split(':');
          const tSurahId = parseInt(sIdStr, 10);
          const tVerseId = parseInt(vIdStr, 10);
          const targetSurah = surahs.find((s) => s.id === tSurahId);

          let arabicText = '';
          let translationText = '';
          try {
            const detail = await QuranService.getSurahDetail(tSurahId, 'id.indonesian');
            const v = detail.verses.find((item) => item.id === tVerseId);
            if (v) {
              arabicText = v.text;
              translationText = v.translation || '';
            }
          } catch (e) {
            console.warn('Failed to fetch target verse detail:', e);
          }

          if (isMounted) {
            enriched.push({
              ...match,
              targetSurahId: tSurahId,
              targetVerseId: tVerseId,
              targetSurahName: targetSurah ? targetSurah.transliteration : `Surah ${tSurahId}`,
              arabicText,
              translationText,
            });
          }
        }

        if (isMounted) {
          setMatches(enriched);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching matching ayahs and phrases:', err);
        if (isMounted) setLoading(false);
      }
    };

    fetchMatches();

    return () => {
      isMounted = false;
    };
  }, [isOpen, surahId, verseId]);

  if (!isOpen) return null;

  const handleJumpToVerse = (tSurahId: number, tVerseId: number) => {
    onClose();
    if (onJumpVerse) {
      onJumpVerse(tSurahId, tVerseId);
    } else {
      navigate(`/surah/${tSurahId}#verse-${tVerseId}`);
    }
  };

  const getSurahName = (sId: number) => {
    const s = surahsList.find((item) => item.id === sId);
    return s ? s.transliteration : `QS. ${sId}`;
  };

  return (
    <UnifiedModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-2xl"
      badge={language === 'en' ? 'MUTASHABIHAT & MATCHES' : 'MUTASYABIHAT & KEMIRIPAN'}
      badgeColorClass="bg-quran-gold/15 text-quran-gold border-quran-gold/25"
      title={
        <span className="flex items-center gap-2 text-lg sm:text-xl font-bold font-serif text-gray-900 dark:text-white">
          <Repeat className="w-5 h-5 text-quran-gold shrink-0" />
          <span>{language === 'en' ? 'Mutashabihat & Similar Ayahs' : 'Ayat Mutasyabihat & Kemiripan'}</span>
        </span>
      }
      subtitle={`${surahName} : Ayat ${verseId}`}
      bodyClassName="p-4 sm:p-5 space-y-4"
      footer={
        <button
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-gray-600 dark:text-gray-300 bg-stone-100 dark:bg-slate-700 hover:bg-stone-200 dark:hover:bg-slate-600 active:scale-95 transition-all"
        >
          {t('close')}
        </button>
      }
    >
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3">
          <Loading />
          <p className="text-xs text-stone-400">
            {language === 'en' ? 'Searching recurring phrases and matches...' : 'Memuat data frasa mutasyabihat & kemiripan lafadz...'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Sub Tabs */}
          <div className="grid grid-cols-2 p-1 bg-stone-100 dark:bg-slate-700/60 rounded-xl border border-stone-200/60 dark:border-slate-600/60">
            <button
              onClick={() => setActiveTab('phrases')}
              className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'phrases'
                  ? 'bg-white dark:bg-slate-800 text-quran-gold shadow-xs'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>{language === 'en' ? `Recurring Phrases (${phrases.length})` : `Frasa Berulang (${phrases.length})`}</span>
            </button>
            <button
              onClick={() => setActiveTab('structural')}
              className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'structural'
                  ? 'bg-white dark:bg-slate-800 text-quran-gold shadow-xs'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>{language === 'en' ? `Sentence Similarity (${matches.length})` : `Kemiripan Redaksi (${matches.length})`}</span>
            </button>
          </div>

          {/* Tab 1: Phrases */}
          {activeTab === 'phrases' && (
            <div className="space-y-3.5">
              {phrases.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-stone-300 dark:text-slate-600 mx-auto" />
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {language === 'en'
                      ? 'No specific mutashabihat phrase indexed for this ayah.'
                      : 'Tidak ada frasa mutasyabihat khusus yang terdata pada ayat ini.'}
                  </p>
                </div>
              ) : (
                phrases.map((phrase, idx) => (
                  <div
                    key={phrase.phraseId || idx}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-stone-200/80 dark:border-slate-700 space-y-3 shadow-xs"
                  >
                    {/* Header info */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-quran-gold/10 text-quran-gold dark:text-quran-gold font-bold border border-quran-gold/20">
                        {phrase.totalOccurrences}x {language === 'en' ? 'repeated across' : 'berulang di'} {phrase.surahsCount} {language === 'en' ? 'surahs' : 'surat'}
                      </span>
                      {phrase.currentWordRanges.length > 0 && (
                        <span className="text-[11px] text-gray-500 dark:text-gray-400">
                          {language === 'en' ? 'Word' : 'Kata'}{' '}
                          {phrase.currentWordRanges.map((r) => `${r[0]}-${r[1]}`).join(', ')}
                        </span>
                      )}
                    </div>

                    {/* Arabic phrase display */}
                    <div className="p-3 bg-stone-50 dark:bg-slate-900/60 rounded-xl flex items-center justify-end">
                      <p className="font-arabic text-xl sm:text-2xl text-right leading-loose text-gray-900 dark:text-gray-100 select-all" dir="rtl">
                        {phrase.arabicText}
                      </p>
                    </div>

                    {/* Other ayahs list */}
                    {phrase.otherAyahs.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                          {language === 'en'
                            ? `Also found in ${phrase.otherAyahs.length} other verses:`
                            : `Juga terdapat pada ${phrase.otherAyahs.length} ayat lainnya:`}
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {phrase.otherAyahs.slice(0, 8).map((other) => (
                            <button
                              key={other.ayahKey}
                              onClick={() => handleJumpToVerse(other.surahId, other.verseId)}
                              className="p-2.5 rounded-xl bg-stone-50 dark:bg-slate-700/50 hover:bg-stone-100 dark:hover:bg-slate-700 hover:border-quran-gold/40 border border-stone-200/60 dark:border-slate-600/60 flex items-center justify-between text-left group transition-all"
                            >
                              <span className="text-xs font-bold text-gray-800 dark:text-gray-200 group-hover:text-quran-gold dark:group-hover:text-quran-gold transition-colors">
                                {getSurahName(other.surahId)} : Ayat {other.verseId}
                              </span>
                              <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-quran-gold group-hover:translate-x-0.5 transition-all" />
                            </button>
                          ))}
                        </div>
                        {phrase.otherAyahs.length > 8 && (
                          <p className="text-[11px] text-gray-400 italic pt-1">
                            +{phrase.otherAyahs.length - 8} {language === 'en' ? 'more ayahs in' : 'ayat lainnya dalam'}{' '}
                            <button
                              onClick={() => {
                                onClose();
                                navigate('/mutashabihat');
                              }}
                              className="text-quran-gold hover:underline font-semibold"
                            >
                              {language === 'en' ? 'Mutashabihat Explorer' : 'Eksplorator Mutasyabihat'}
                            </button>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 2: Structural matches */}
          {activeTab === 'structural' && (
            <div className="space-y-3">
              {matches.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-stone-300 dark:text-slate-600 mx-auto" />
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {language === 'en'
                      ? 'No similar matching verses recorded for this ayah.'
                      : 'Tidak ada data ayat serupa yang tercatat untuk ayat ini.'}
                  </p>
                </div>
              ) : (
                matches.map((item, idx) => (
                  <div
                    key={`${item.matched_ayah_key}-${idx}`}
                    onClick={() => handleJumpToVerse(item.targetSurahId, item.targetVerseId)}
                    className="group bg-white dark:bg-slate-800/80 hover:bg-stone-50/60 dark:hover:bg-slate-700/50 border border-stone-200/80 dark:border-slate-700/80 hover:border-quran-gold/40 dark:hover:border-quran-gold/40 rounded-2xl p-4 transition-all cursor-pointer flex flex-col gap-2.5 shadow-2xs active:scale-[0.99]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-quran-dark dark:text-gray-100 group-hover:text-quran-gold dark:group-hover:text-quran-gold transition-colors">
                        {item.targetSurahName} ({item.targetSurahId}:{item.targetVerseId})
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 rounded-md">
                          <Award className="w-3 h-3" />
                          Score: {item.score}
                        </span>
                        <span className="px-2 py-0.5 text-[11px] font-bold bg-stone-100 dark:bg-slate-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-slate-600 rounded-md">
                          {item.matched_words_count} {language === 'en' ? 'words match' : 'kata cocok'} ({item.coverage}%)
                        </span>
                      </div>
                    </div>

                    {item.arabicText && (
                      <p className="font-quran text-lg sm:text-xl text-right text-gray-900 dark:text-gray-100 leading-loose" dir="rtl">
                        {item.arabicText}
                      </p>
                    )}

                    {item.translationText && (
                      <p className="text-xs text-gray-600 dark:text-gray-300 italic line-clamp-2">
                        {item.translationText}
                      </p>
                    )}

                    <div className="flex items-center justify-end pt-2 border-t border-stone-100 dark:border-slate-700/60 text-xs font-medium text-quran-gold group-hover:translate-x-0.5 transition-transform">
                      <span className="flex items-center gap-1 font-semibold">
                        {language === 'en' ? 'Open verse' : 'Buka ayat ini'}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </UnifiedModal>
  );
};

export default MatchingAyahModal;

