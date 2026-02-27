import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { RECITERS, Reciter } from '../types';
import { getAudioUrl, isSurahDownloaded, downloadSurahAudio } from '../services/audioService';
import { showToast } from '../services/quranService';
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
  playVerse: (surahId: number, verseId: number, totalVerses: number, surahName: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  nextVerse: () => void;
  prevVerse: () => void;
  setReciter: (reciterId: string) => void;
  isLoading: boolean;
  
  downloadPrompt: PendingPlay | null;
  isDownloading: boolean;
  downloadProgress: number;
  resolveDownloadPrompt: (action: 'stream' | 'download' | 'cancel') => void;

  repeatSettings: RepeatSettings;
  setRepeatSettings: (settings: RepeatSettings) => void;
  currentLoopCount: number; 
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
  const [isLoading, setIsLoading] = useState(true);
  
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
          const stored = await DB.getSetting('reciter_id');
          if (stored) {
              const found = RECITERS.find(r => r.id === stored);
              if (found) setActiveReciter(found);
          }
          setIsLoading(false);
      };
      initAudioAction();
  }, []);

  // Initialize Audio Object ONCE
  if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'auto';
  }

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
                audio.play().catch(console.error);
                return;
            } else {
                // Finished loops, reset count and move next
                setCurrentLoopCount(1);
                if (currentVerse && currentVerse < currentTotalVerses) {
                    setCurrentVerse(currentVerse + 1);
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
                    setCurrentVerse(currentVerse + 1);
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
                } else {
                    // Range looping finished. Stop or continue? 
                    // Usually better to stop or reset to 1st verse of range
                    setIsPlaying(false); 
                    setCurrentLoopCount(1);
                    setCurrentVerse(rangeStart); // Reset position
                }
                return;
            }
        }

        // 3. Mode: Normal
        if (currentVerse && currentVerse < currentTotalVerses) {
             setCurrentVerse(currentVerse + 1);
        } else {
            setIsPlaying(false); // End of Surah
            setCurrentVerse(1); // Reset to start
        }
    };

    const handleError = (e: any) => {
        // Ignore AbortError which happens on rapid source changes
        if (e.target && e.target.error && e.target.error.code !== e.target.error.MEDIA_ERR_ABORTED) {
             console.warn("Audio error", e);
             setIsPlaying(false);
             setIsLoading(false);
        }
    };

    const handleCanPlay = () => {
        setIsLoading(false);
        if (stateRef.current.isPlaying) {
            audio.play().catch(e => {
                if (e.name !== 'AbortError') console.warn("Play interrupted", e);
            });
        }
    };

    const handleWaiting = () => setIsLoading(true);

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('waiting', handleWaiting);

    return () => {
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('waiting', handleWaiting);
    };
  }, []);

  // --- SOURCE MANAGEMENT ---
  useEffect(() => {
      const loadAudio = async () => {
          if (currentSurah && currentVerse && audioRef.current) {
              try {
                  const url = await getAudioUrl(activeReciter, currentSurah, currentVerse);
                  
                  // Only update src if changed
                  if (audioRef.current.src !== url) {
                      audioRef.current.src = url;
                      audioRef.current.load();
                  } else if (isPlaying && audioRef.current.paused) {
                      // Ensure it plays if state says playing
                      audioRef.current.play().catch(console.error);
                  }
              } catch (e) {
                  console.error("Failed to load audio URL", e);
                  setIsPlaying(false);
              }
          }
      };
      loadAudio();
  }, [currentSurah, currentVerse, activeReciter]); // Trigger on verse change

  // --- PLAY/PAUSE EFFECT ---
  useEffect(() => {
      if (!audioRef.current) return;
      
      if (isPlaying) {
          if (audioRef.current.src && audioRef.current.paused) {
               const playPromise = audioRef.current.play();
               if (playPromise !== undefined) {
                   playPromise.catch(e => {
                       if (e.name !== 'AbortError') console.warn("Play effect error", e);
                   });
               }
          }
      } else {
          if (!audioRef.current.paused) {
             audioRef.current.pause();
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


  const playVerse = async (surahId: number, verseId: number, totalVerses: number, sName: string) => {
      // Toggle if same verse
      if (currentSurah === surahId && currentVerse === verseId) {
          setIsPlaying(!isPlaying);
          return;
      }

      const downloaded = await isSurahDownloaded(activeReciter.id, surahId, totalVerses);
      
      if (downloaded) {
          setCurrentTotalVerses(totalVerses);
          setSurahName(sName);
          setCurrentSurah(surahId);
          setCurrentVerse(verseId);
          setCurrentLoopCount(1); 
          setIsPlaying(true);
      } else {
          setDownloadPrompt({ surahId, verseId, totalVerses, surahName: sName });
      }
  };

  const resolveDownloadPrompt = async (action: 'stream' | 'download' | 'cancel') => {
      if (!downloadPrompt) return;
      const { surahId, verseId, totalVerses, surahName } = downloadPrompt;

      if (action === 'cancel') {
          setDownloadPrompt(null);
          return;
      }

      if (action === 'stream') {
          setCurrentTotalVerses(totalVerses);
          setSurahName(surahName);
          setCurrentSurah(surahId);
          setCurrentVerse(verseId);
          setCurrentLoopCount(1);
          setIsPlaying(true);
          setDownloadPrompt(null);
      } else if (action === 'download') {
          setIsDownloading(true);
          setDownloadProgress(0);
          try {
              await downloadSurahAudio(activeReciter, surahId, totalVerses, (progress) => {
                  setDownloadProgress(progress);
              });
              setCurrentTotalVerses(totalVerses);
              setSurahName(surahName);
              setCurrentSurah(surahId);
              setCurrentVerse(verseId);
              setCurrentLoopCount(1);
              setIsPlaying(true);
          } catch (error) {
              console.error("Download failed", error);
              showToast("Gagal mengunduh. Memutar secara streaming...", "warning");
              setCurrentTotalVerses(totalVerses);
              setSurahName(surahName);
              setCurrentSurah(surahId);
              setCurrentVerse(verseId);
              setIsPlaying(true);
          } finally {
              setIsDownloading(false);
              setDownloadPrompt(null);
              setDownloadProgress(0);
          }
      }
  };

  const pause = () => setIsPlaying(false);
  
  const resume = () => {
      if (currentSurah && currentVerse) setIsPlaying(true);
  };
  
  const stop = () => {
      setIsPlaying(false);
      setCurrentSurah(null);
      setCurrentVerse(null);
      setCurrentTotalVerses(0);
      setSurahName('');
      setCurrentLoopCount(1);
      
      if(audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
      }
  };

  const nextVerse = () => {
      if (currentVerse && currentVerse < currentTotalVerses) {
          setCurrentVerse(currentVerse + 1);
          setCurrentLoopCount(1);
      }
  };

  const prevVerse = () => {
      if (currentVerse && currentVerse > 1) {
          setCurrentVerse(currentVerse - 1);
          setCurrentLoopCount(1);
      }
  };

  const setReciter = async (reciterId: string) => {
      const found = RECITERS.find(r => r.id === reciterId);
      if (found) {
          setActiveReciter(found);
          await DB.setSetting('reciter_id', reciterId);
      }
  };

  return (
    <AudioContext.Provider value={{
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
        currentLoopCount
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