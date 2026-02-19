
import React from 'react';
import { AlertTriangle, X, CheckCircle, Info } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary' | 'neutral'; // New prop for styling
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  // Configuration based on variant
  const config = {
      danger: {
          icon: <AlertTriangle className="w-8 h-8 text-red-500" />,
          iconBg: 'bg-red-50 dark:bg-red-900/20',
          confirmBtn: 'bg-red-500 hover:bg-red-600 shadow-red-500/30 text-white',
          confirmTextDefault: 'Hapus'
      },
      primary: {
          icon: <CheckCircle className="w-8 h-8 text-quran-gold" />,
          iconBg: 'bg-quran-gold/10',
          confirmBtn: 'bg-quran-dark hover:bg-quran-gold shadow-quran-dark/30 text-white',
          confirmTextDefault: 'Simpan'
      },
      neutral: {
          icon: <Info className="w-8 h-8 text-blue-500" />,
          iconBg: 'bg-blue-50 dark:bg-blue-900/20',
          confirmBtn: 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30 text-white',
          confirmTextDefault: 'Lanjutkan'
      }
  };

  const activeConfig = config[variant];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center px-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-quran-dark/60 dark:bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 border border-white/20 dark:border-slate-700">
        
        {/* Header (Hidden visual close button, but clickable area exists) */}
        <div className="absolute right-4 top-4 z-10">
             <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors bg-white/50 dark:bg-slate-700/50 rounded-full p-1"
            >
                <X className="w-5 h-5" />
            </button>
        </div>

        <div className="p-8 text-center">
            <div className={`w-16 h-16 ${activeConfig.iconBg} rounded-full flex items-center justify-center mx-auto mb-5 transition-colors`}>
                {activeConfig.icon}
            </div>
            
            <h3 className="text-xl font-bold text-gray-800 dark:text-white font-serif mb-3">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-300 leading-relaxed">{message}</p>
        </div>

        {/* Footer Buttons */}
        <div className="px-6 pb-6 flex gap-3">
            <button 
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 bg-stone-100 dark:bg-slate-700 hover:bg-stone-200 dark:hover:bg-slate-600 transition-colors"
            >
                {cancelText}
            </button>
            <button 
                onClick={() => {
                    onConfirm();
                    onClose();
                }}
                className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-lg transform active:scale-95 ${activeConfig.confirmBtn}`}
            >
                {confirmText === 'Ya, Lanjutkan' && variant === 'danger' ? activeConfig.confirmTextDefault : confirmText}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
