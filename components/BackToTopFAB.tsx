import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAudio } from '../contexts/AudioContext';

export interface BackToTopFABProps {
  show?: boolean;
  onClick?: () => void;
  targetContainerSelector?: string;
  threshold?: number;
  className?: string;
}

const BackToTopFAB: React.FC<BackToTopFABProps> = ({
  show: controlledShow,
  onClick: customOnClick,
  targetContainerSelector = 'main',
  threshold = 300,
  className = '',
}) => {
  const { language } = useLanguage();
  const { currentSurah } = useAudio();
  const [internalShow, setInternalShow] = useState(false);

  const isControlled = typeof controlledShow === 'boolean';
  const isVisible = isControlled ? controlledShow : internalShow;

  useEffect(() => {
    if (isControlled) return;

    let targetEl: HTMLElement | Window | null = null;
    if (targetContainerSelector) {
      targetEl = document.querySelector(targetContainerSelector);
    }
    if (!targetEl) {
      targetEl = window;
    }

    const handleScroll = () => {
      let scrollTop = 0;
      if (targetEl === window) {
        scrollTop = window.scrollY || document.documentElement.scrollTop;
      } else if (targetEl instanceof HTMLElement) {
        scrollTop = targetEl.scrollTop;
      }
      setInternalShow(scrollTop > threshold);
    };

    targetEl.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      targetEl?.removeEventListener('scroll', handleScroll);
    };
  }, [isControlled, targetContainerSelector, threshold]);

  const handleClick = () => {
    if (customOnClick) {
      customOnClick();
      return;
    }

    let targetEl: HTMLElement | Window | null = null;
    if (targetContainerSelector) {
      targetEl = document.querySelector(targetContainerSelector);
    }

    if (targetEl instanceof HTMLElement) {
      targetEl.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Adjust bottom offset if audio player bar is active (it occupies ~64-80px at bottom)
  const bottomClass = currentSurah !== null
    ? 'bottom-24 sm:bottom-24'
    : 'bottom-6 sm:bottom-8';

  return (
    <button
      type="button"
      id="back-to-top-fab"
      onClick={handleClick}
      aria-label={language === 'en' ? 'Back to top' : 'Kembali ke atas'}
      title={language === 'en' ? 'Back to top' : 'Kembali ke atas'}
      className={`fixed right-4 sm:right-6 ${bottomClass} z-40 p-3 sm:p-3.5 rounded-2xl bg-white/95 dark:bg-slate-800/95 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 dark:border-emerald-500/30 shadow-lg shadow-emerald-950/10 dark:shadow-black/30 backdrop-blur-md transition-all duration-300 transform active:scale-95 hover:scale-105 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:text-emerald-800 dark:hover:text-emerald-200 cursor-pointer flex items-center justify-center group ${
        isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto scale-100'
          : 'opacity-0 translate-y-4 pointer-events-none scale-75'
      } ${className}`}
    >
      <ArrowUp className="w-5 h-5 transition-transform group-hover:-translate-y-0.5 duration-200" />
      <span className="sr-only">
        {language === 'en' ? 'Back to top' : 'Kembali ke atas'}
      </span>
    </button>
  );
};

export default BackToTopFAB;
