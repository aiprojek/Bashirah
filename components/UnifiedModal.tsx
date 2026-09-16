import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export interface UnifiedModalProps {
  isOpen: boolean;
  onClose: () => void;
  badge?: React.ReactNode;
  badgeColorClass?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  hero?: React.ReactNode;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showFooter?: boolean;
  maxWidth?: string; // defaults to 'max-w-lg'
  bodyClassName?: string;
}

export const UnifiedModal: React.FC<UnifiedModalProps> = ({
  isOpen,
  onClose,
  badge,
  badgeColorClass = 'bg-quran-gold/15 text-quran-gold border-quran-gold/20 dark:text-quran-gold',
  title,
  subtitle,
  hero,
  headerActions,
  children,
  footer,
  showFooter = true,
  maxWidth = 'max-w-lg',
  bodyClassName = 'p-5 sm:p-6 space-y-4',
}) => {
  const { t } = useLanguage();

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/70 dark:bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        className={`relative bg-white dark:bg-slate-800 w-full ${maxWidth} max-h-[85vh] sm:max-h-[88vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-stone-200/80 dark:border-slate-700/80 my-auto transition-all`}
        role="dialog"
        aria-modal="true"
      >
        {/* Optional Custom Hero Section */}
        {hero}

        {/* Standard Modal Header */}
        {(title || badge) && (
          <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-stone-100 dark:border-slate-700/80 flex items-start justify-between gap-4 bg-stone-50/70 dark:bg-slate-800/90 shrink-0">
            <div className="min-w-0 flex-1">
              {badge && (
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider uppercase border ${badgeColorClass}`}
                  >
                    {badge}
                  </span>
                </div>
              )}
              {title && (
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0 pt-0.5">
              {headerActions}
              <button
                onClick={onClose}
                aria-label={t('btn_close')}
                className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-stone-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className={`flex-1 overflow-y-auto custom-scrollbar bg-stone-50/40 dark:bg-slate-900/40 ${bodyClassName}`}>
          {children}
        </div>

        {/* Modal Footer */}
        {showFooter && (
          <div className="p-4 border-t border-stone-100 dark:border-slate-700/80 bg-white dark:bg-slate-800 flex items-center justify-end gap-3 shrink-0">
            {footer ? (
              footer
            ) : (
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-gray-600 dark:text-gray-300 bg-stone-100 dark:bg-slate-700 hover:bg-stone-200 dark:hover:bg-slate-600 active:scale-[0.98] transition-all"
              >
                {t('btn_close')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedModal;
