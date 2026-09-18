import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { RECITERS, Reciter } from '../types';
import { getAudioUrl, getRemoteAudioUrl, isSurahDownloaded, downloadSurahAudio } from '../services/audioService';
import { showToast, getAllSurahs } from '../services/quranService';
import * as DB from '../services/db';

interface PendingPlay {
    surahId: number;
    verseId: number;
    totalVerses: number;
    surahName: string;
}

export interface RepeatSettings {
    mode: 'none' | 'verse' | 'range';
    rangeStart: number;
    rangeEnd: number;
    count: number;
}

interface AudioContextType {
  isPlaying: boolean;
  currentSurah: number | null;
  currentVerse: number | null;
  currentTotalVerses: number;
  surahName: string; 
  activeReciter: Reciter;
  playVerse: (
    surahId: number, 
    verseId: number, 
    totalVerses?: number, 
    surahName?: string | number, 
    optionalSurahName?: string, 
    optionalText?: string
  ) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  nextVerse: () => void;
  prevVerse: () => void;
  setReciter: (reciterId: string) => void;
  isInitialized: boolean;
  isLoading: boolean;
  
  downloadPrompt: PendingPlay | null;
  isDownloading: boolean;
  downloadProgress: number;
  resolveDownloadPrompt: (action: 'stream' | 'download' | 'cancel') => void;

  repeatSettings: RepeatSettings;
  setRepeatSettings: (settings: RepeatSettings) => void;
  currentLoopCount: number; 
  selectSurah: (surahId: number, totalVerses: number, surahName: string) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSurah, setCurrentSurah] = useState<number | null>(null);
  const [currentVerse, setCurrentVerse] = useState<number | null>(null);
  const [currentTotalVerses, setCurrentTotalVerses] = useState<number>(0);
  const [surahName, setSurahName] = useState<string>('');
  
  const [activeReciter, setActiveReciter] = useState<Reciter>(RECITERS[0]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Download Prompt State
  const [downloadPrompt, setDownloadPrompt] = useState<PendingPlay | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Muraja'ah State
  const [repeatSettings, setRepeatSettings] = useState<RepeatSettings>({
      mode: 'none',
      rangeStart: 1,
      rangeEnd: 1,
      count: 1 
  });
  const [currentLoopCount, setCurrentLoopCount] = useState(1);

  // Refs to hold mutable state for event listeners without re-binding
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamingSurahsRef = useRef<Set<number>>(new Set());
  
  // State Ref to access latest state inside event listeners
  const stateRef = useRef({
      repeatSettings,
      currentLoopCount,
      currentVerse,
      currentSurah,
      currentTotalVerses,
      isPlaying
  });

  // Sync state to ref
  useEffect(() => {
      stateRef.current = { 
          repeatSettings, 
          currentLoopCount, 
          currentVerse, 
          currentSurah, 
          currentTotalVerses,
          isPlaying
      };
  }, [repeatSettings, currentLoopCount, currentVerse, currentSurah, currentTotalVerses, isPlaying]);

  // Load Initial Settings
  useEffect(() => {
      const initAudioAction = async () => {
          try {
              const stored = await DB.getSetting('reciter_id');
              if (stored) {
                  const found = RECITERS.find(r => r.id === stored);
                  if (found) setActiveReciter(found);
              }
          } catch (e) {
              console.warn("Failed to load reciter setting", e);
          } finally {
              setIsInitialized(true);
              setIsLoading(false);
          }
      };
      initAudioAction();
  }, []);

  // Initialize Audio Object ONCE
  if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'auto';
  }

  const playPromiseRef = useRef<Promise<void> | null>(null);

  const safePlay = () => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;
    try {
      const p = audio.play();
      if (p !== undefined) {
        playPromiseRef.current = p;
        p.catch(err => {
          if (err && err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
            console.warn("Audio play interrupted or failed:", err);
          }
          if (err && err.name === 'NotAllowedError') {
            console.warn("Audio playback blocked by autoplay policy");
            setIsPlaying(false);
            stateRef.current.isPlaying = false;
            setIsLoading(false);
          }
        }).finally(() => {
          if (playPromiseRef.current === p) {
            playPromiseRef.current = null;
          }
        });
      }
    } catch (e: any) {
      if (e && e.name !== 'AbortError' && e.name !== 'NotAllowedError') {
        console.warn("Audio play error:", e);
      }
    }
  };

  const safePause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playPromiseRef.current) {
      playPromiseRef.current
        .then(() => {
          if (!stateRef.current.isPlaying) {
            audio.pause();
          }
        })
        .catch(() => {
          audio.pause();
        });
    } else {
      audio.pause();
    }
  };

  // --- AUDIO EVENT LISTENERS ---
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
        const state = stateRef.current;
        const { mode, count, rangeStart, rangeEnd } = state.repeatSettings;
        const { currentLoopCount, currentVerse, currentTotalVerses } = state;

        // 1. Mode: Per Ayat (Single Verse Loop)
        if (mode === 'verse') {
            if (count === Infinity || currentLoopCount < count) {
                // Loop again
                setCurrentLoopCount(prev => prev + 1);
                audio.currentTime = 0;
                safePlay();
                return;
            } else {
                // Finished loops, reset count and move next
                setCurrentLoopCount(1);
                if (currentVerse && currentVerse < currentTotalVerses) {
                    const nextV = currentVerse + 1;
                    setCurrentVerse(nextV);
                    stateRef.current.currentVerse = nextV;
                } else {
                    stop(); // End of surah/range
                }
                return;
            }
        }

        // 2. Mode: Rentang (Range Loop)
        if (mode === 'range') {
            if (!currentVerse) return;

            // If we are NOT at the end of range, just go next
            if (currentVerse < rangeEnd) {
                if (currentVerse < currentTotalVerses) {
                    const nextV = currentVerse + 1;
                    setCurrentVerse(nextV);
                    stateRef.current.currentVerse = nextV;
                } else {
                    stop();
                }
                return;
            }

            // If we ARE at the end of range
            if (currentVerse === rangeEnd) {
                if (count === Infinity || currentLoopCount < count) {
                    // Jump back to start of range
                    setCurrentLoopCount(prev => prev + 1);
                    setCurrentVerse(rangeStart);
                    stateRef.current.currentVerse = rangeStart;
                } else {
                    // Range looping finished. Stop playback cleanly.
                    setIsPlaying(false); 
                    stateRef.current.isPlaying = false;
                    setCurrentLoopCount(1);
                    safePause();
                }
                return;
            }
        }

        // 3. Mode: Normal
        if (mode === 'none') {
            if (currentVerse && currentVerse < currentTotalVerses) {
                 const nextV = currentVerse + 1;
                 setCurrentVerse(nextV);
                 stateRef.current.currentVerse = nextV;
            } else {
                // End of Surah -> Move to Next Surah
                const currentState = stateRef.current;
                const currentS = currentState.currentSurah;
                if (currentS && currentS < 114) {
                    const nextSurahId = currentS + 1;
                    getAllSurahs().then(surahs => {
                        const nextSurah = surahs.find(s => s.id === nextSurahId);
                        if (nextSurah) {
                            playVerse(nextSurahId, 1, nextSurah.total_verses, nextSurah.transliteration);
                        } else {
                            setIsPlaying(false);
                            stateRef.current.isPlaying = false;
                            setCurrentVerse(1);
                        }
                    }).catch(() => {
                        setIsPlaying(false);
                        stateRef.current.isPlaying = false;
                        setCurrentVerse(1);
                    });
                } else {
                    setIsPlaying(false); // End of Quran
                    stateRef.current.isPlaying = false;
                    setCurrentVerse(1);
                }
            }
        } else {
            setIsPlaying(false);
            stateRef.current.isPlaying = false;
        }
    };

    const handleError = (e: any) => {
        const currentAudio = audioRef.current;
        const err = currentAudio?.error;
        if (err && err.code === MediaError.MEDIA_ERR_ABORTED) return;

        console.warn("Audio element error", err?.code, err?.message, e);
        setIsPlaying(false);
        stateRef.current.isPlaying = false;
        setIsLoading(false);
    };

    const handleCanPlay = () => {
        setIsLoading(false);
        if (stateRef.current.isPlaying && audio.paused) {
            safePlay();
        }
    };

    const handleWaiting = () => setIsLoading(true);

    const handlePlaying = () => {
        setIsLoading(false);
        setIsPlaying(true);
        stateRef.current.isPlaying = true;
    };

    const handlePause = () => {
        if (!playPromiseRef.current && !stateRef.current.isPlaying) {
            setIsLoading(false);
        }
    };

    const handleLoadedData = () => setIsLoading(false);

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('canplaythrough', handleLoadedData);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);

    return () => {
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('canplaythrough', handleLoadedData);
        audio.removeEventListener('loadeddata', handleLoadedData);
        audio.removeEventListener('waiting', handleWaiting);
        audio.removeEventListener('playing', handlePlaying);
        audio.removeEventListener('pause', handlePause);
    };
  }, []);

  // --- SOURCE MANAGEMENT ---
  useEffect(() => {
      let isCancelled = false;
      const loadAudio = async () => {
          if (currentSurah && currentVerse && audioRef.current) {
              try {
                  const isStreaming = streamingSurahsRef.current.has(currentSurah);
                  const downloaded = await isSurahDownloaded(activeReciter.id, currentSurah, currentTotalVerses);
                  if (isCancelled) return;

                  if (!downloaded && !isStreaming && !stateRef.current.isPlaying) {
                      return;
                  }

                  setIsLoading(true);
                  const url = isStreaming
                      ? getRemoteAudioUrl(activeReciter, currentSurah, currentVerse)
                      : await getAudioUrl(activeReciter, currentSurah, currentVerse);
                  if (isCancelled) return;

                  const audio = audioRef.current;
                  if (!audio) return;

                  if (audio.src !== url) {
                      audio.src = url;
                  }
                  
                  if (stateRef.current.isPlaying) {
                      safePlay();
                  }
              } catch (e) {
                  console.error("Failed to load audio URL", e);
                  if (!isCancelled) {
                      setIsPlaying(false);
                      stateRef.current.isPlaying = false;
                      setIsLoading(false);
                  }
              }
          }
      };
      loadAudio();
      return () => {
          isCancelled = true;
      };
  }, [currentSurah, currentVerse, activeReciter]); // Trigger on verse or reciter change

  // --- PLAY/PAUSE EFFECT ---
  useEffect(() => {
      if (!audioRef.current) return;
      
      if (isPlaying) {
          if (audioRef.current.src && audioRef.current.paused) {
              safePlay();
          }
      } else {
          if (!audioRef.current.paused) {
              safePause();
          }
      }
  }, [isPlaying]);

  // --- MEDIA SESSION ---
  useEffect(() => {
    if ('mediaSession' in navigator && currentSurah && currentVerse) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: `Ayat ${currentVerse}`,
            artist: activeReciter.name,
            album: `Surat ${surahName}`,
             artwork: [
                { src: 'https://cdn-icons-png.flaticon.com/512/4358/4358666.png', sizes: '512x512', type: 'image/png' }
            ]
        });

        navigator.mediaSession.setActionHandler('play', resume);
        navigator.mediaSession.setActionHandler('pause', pause);
        navigator.mediaSession.setActionHandler('previoustrack', prevVerse);
        navigator.mediaSession.setActionHandler('nexttrack', nextVerse);
    }
  }, [currentSurah, currentVerse, surahName, activeReciter]);


  const playVerse = async (
      surahId: number, 
      verseId: number, 
      totalVerses?: number, 
      sName?: string | number,
      optionalSurahName?: string,
      _optionalText?: string
  ) => {
      const safeVerse = Math.max(1, Math.floor(verseId) || 1);
      let safeTotal = Math.max(safeVerse, Math.floor(Number(totalVerses)) || 1);
      let finalSurahName = '';
      if (typeof sName === 'string') {
          finalSurahName = sName;
      } else if (typeof optionalSurahName === 'string') {
          finalSurahName = optionalSurahName;
      }

      // If safeTotal is invalid or only 1, look up real total verses and surah name
      if (safeTotal <= 1 || !finalSurahName) {
          try {
              const allSurahs = await getAllSurahs();
              const foundSurah = allSurahs.find(s => s.id === surahId);
              if (foundSurah) {
                  safeTotal = Math.max(safeVerse, foundSurah.total_verses);
                  if (!finalSurahName) finalSurahName = foundSurah.transliteration;
              }
          } catch (e) {
              // fallback
          }
      }
      
      // If same verse and currently playing, pause it.
      if (stateRef.current.currentSurah === surahId && stateRef.current.currentVerse === safeVerse && stateRef.current.isPlaying) {
          setIsPlaying(false);
          stateRef.current.isPlaying = false;
          safePause();
          return;
      }

      // Always update player metadata immediately so floating bar & UI match the target surah & verse
      setCurrentTotalVerses(safeTotal);
      setSurahName(finalSurahName);
      setCurrentSurah(surahId);
      setCurrentVerse(safeVerse);
      setCurrentLoopCount(1);
      stateRef.current.currentSurah = surahId;
      stateRef.current.currentVerse = safeVerse;
      stateRef.current.currentTotalVerses = safeTotal;

      // Check download status or active streaming session
      const downloaded = await isSurahDownloaded(activeReciter.id, surahId, safeTotal);
      const isStreaming = streamingSurahsRef.current.has(surahId);

      if (downloaded || isStreaming) {
          setIsPlaying(true);
          stateRef.current.isPlaying = true;
          if (audioRef.current) {
              setIsLoading(true);
              const url = isStreaming
                  ? getRemoteAudioUrl(activeReciter, surahId, safeVerse)
                  : await getAudioUrl(activeReciter, surahId, safeVerse);
              if (audioRef.current && stateRef.current.currentSurah === surahId && stateRef.current.currentVerse === safeVerse) {
                  if (audioRef.current.src !== url) {
                      audioRef.current.src = url;
                  }
                  safePlay();
              }
          }
      } else {
          setIsPlaying(false);
          stateRef.current.isPlaying = false;
          safePause();
          setDownloadPrompt({ surahId, verseId: safeVerse, totalVerses: safeTotal, surahName: finalSurahName });
      }
  };

  const resolveDownloadPrompt = async (action: 'stream' | 'download' | 'cancel') => {
      if (!downloadPrompt) return;
      const { surahId, verseId, totalVerses, surahName } = downloadPrompt;
      const safeVerse = Math.max(1, Math.floor(verseId) || 1);
      const safeTotal = Math.max(safeVerse, Math.floor(totalVerses) || safeVerse);

      if (action === 'cancel') {
          setDownloadPrompt(null);
          setIsPlaying(false);
          stateRef.current.isPlaying = false;
          safePause();
          return;
      }

      // If streaming, mark this surah as streaming
      if (action === 'stream') {
          streamingSurahsRef.current.add(surahId);
      }

      setCurrentTotalVerses(safeTotal);
      setSurahName(surahName);
      setCurrentSurah(surahId);
      setCurrentVerse(safeVerse);
      setCurrentLoopCount(1);
      setIsPlaying(true);
      stateRef.current.isPlaying = true;
      stateRef.current.currentSurah = surahId;
      stateRef.current.currentVerse = safeVerse;
      stateRef.current.currentTotalVerses = safeTotal;
      setDownloadPrompt(null);

      // Start playing immediately within the user gesture callback!
      if (audioRef.current) {
          setIsLoading(true);
          const streamUrl = getRemoteAudioUrl(activeReciter, surahId, safeVerse);
          if (audioRef.current.src !== streamUrl) {
              audioRef.current.src = streamUrl;
          }
          safePlay();
      }

      if (action === 'download') {
          // Keep downloading in background
          setIsDownloading(true);
          setDownloadProgress(0);
          try {
              await downloadSurahAudio(activeReciter, surahId, safeTotal, (progress) => {
                  setDownloadProgress(progress);
              });
          } catch (error) {
              console.error("Download failed", error);
              showToast("Gagal mengunduh. Memutar secara streaming...", "warning");
          } finally {
              setIsDownloading(false);
              setDownloadProgress(0);
          }
      }
  };

  const pause = () => {
      setIsPlaying(false);
      stateRef.current.isPlaying = false;
      safePause();
  };
  
  const resume = () => {
      if (currentSurah && currentVerse) {
          setIsPlaying(true);
          stateRef.current.isPlaying = true;
          if (audioRef.current && audioRef.current.src && audioRef.current.paused) {
              safePlay();
          } else if (audioRef.current) {
              setIsLoading(true);
              const isStreaming = streamingSurahsRef.current.has(currentSurah);
              if (isStreaming) {
                  const streamUrl = getRemoteAudioUrl(activeReciter, currentSurah, currentVerse);
                  audioRef.current.src = streamUrl;
                  safePlay();
              } else {
                  getAudioUrl(activeReciter, currentSurah, currentVerse).then(cachedUrl => {
                      if (audioRef.current) {
                          audioRef.current.src = cachedUrl;
                          safePlay();
                      }
                  }).catch(console.error);
              }
          }
      }
  };
  
  const stop = () => {
      setIsPlaying(false);
      stateRef.current.isPlaying = false;
      setCurrentSurah(null);
      setCurrentVerse(null);
      setCurrentTotalVerses(0);
      setSurahName('');
      setCurrentLoopCount(1);
      
      safePause();
      if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.removeAttribute('src');
          audioRef.current.load();
      }
  };

  const nextVerse = () => {
      if (currentVerse && currentVerse < currentTotalVerses && currentSurah) {
          const nextV = currentVerse + 1;
          setCurrentVerse(nextV);
          setCurrentLoopCount(1);
          stateRef.current.currentVerse = nextV;
          if (stateRef.current.isPlaying && audioRef.current) {
              setIsLoading(true);
              const isStreaming = streamingSurahsRef.current.has(currentSurah);
              if (isStreaming) {
                  const streamUrl = getRemoteAudioUrl(activeReciter, currentSurah, nextV);
                  audioRef.current.src = streamUrl;
                  safePlay();
              } else {
                  getAudioUrl(activeReciter, currentSurah, nextV).then(cachedUrl => {
                      if (audioRef.current && stateRef.current.currentVerse === nextV) {
                          audioRef.current.src = cachedUrl;
                          safePlay();
                      }
                  }).catch(console.error);
              }
          }
      }
  };

  const prevVerse = () => {
      if (currentVerse && currentVerse > 1 && currentSurah) {
          const prevV = currentVerse - 1;
          setCurrentVerse(prevV);
          setCurrentLoopCount(1);
          stateRef.current.currentVerse = prevV;
          if (stateRef.current.isPlaying && audioRef.current) {
              setIsLoading(true);
              const isStreaming = streamingSurahsRef.current.has(currentSurah);
              if (isStreaming) {
                  const streamUrl = getRemoteAudioUrl(activeReciter, currentSurah, prevV);
                  audioRef.current.src = streamUrl;
                  safePlay();
              } else {
                  getAudioUrl(activeReciter, currentSurah, prevV).then(cachedUrl => {
                      if (audioRef.current && stateRef.current.currentVerse === prevV) {
                          audioRef.current.src = cachedUrl;
                          safePlay();
                      }
                  }).catch(console.error);
              }
          }
      }
  };

  const setReciter = async (reciterId: string) => {
      const found = RECITERS.find(r => r.id === reciterId);
      if (found) {
          setActiveReciter(found);
          await DB.setSetting('reciter_id', reciterId);
      }
  };

  const selectSurah = (surahId: number, totalVerses: number, sName: string) => {
      const safeTotal = Math.max(1, Math.floor(totalVerses) || 1);
      setCurrentSurah(surahId);
      setCurrentVerse(1);
      setCurrentTotalVerses(safeTotal);
      setSurahName(sName);
      setIsPlaying(false);
      stateRef.current.isPlaying = false;
      stateRef.current.currentSurah = surahId;
      stateRef.current.currentVerse = 1;
      stateRef.current.currentTotalVerses = safeTotal;
      setCurrentLoopCount(1);
      safePause();
      if (audioRef.current) {
          audioRef.current.currentTime = 0;
      }
  };

  return (
    <AudioContext.Provider value={{
        isInitialized,
        isPlaying,
        currentSurah,
        currentVerse,
        currentTotalVerses,
        surahName,
        activeReciter,
        playVerse,
        pause,
        resume,
        stop,
        nextVerse,
        prevVerse,
        setReciter,
        isLoading,
        downloadPrompt,
        isDownloading,
        downloadProgress,
        resolveDownloadPrompt,
        repeatSettings,
        setRepeatSettings,
        currentLoopCount,
        selectSurah
    }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
