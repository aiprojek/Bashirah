
import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

interface NoteEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (text: string) => void;
  surahName: string;
  verseId: number;
  initialText?: string;
}

const NoteEditorModal: React.FC<NoteEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  surahName,
  verseId,
  initialText = ''
}) => {
  const [noteText, setNoteText] = useState(initialText);

  useEffect(() => {
    if (isOpen) {
      setNoteText(initialText);
    }
  }, [isOpen, initialText]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-quran-dark/60 dark:bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh] border border-white/10">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 dark:border-slate-700 flex items-center justify-between bg-stone-50 dark:bg-slate-700/50">
          <div>
              <h3 className="text-lg font-bold text-quran-dark dark:text-gray-100 font-serif">Catatan Ayat</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{surahName} : Ayat {verseId}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-200 dark:hover:bg-slate-600 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 flex-1 flex flex-col">
            <textarea 
                className="w-full h-40 p-4 border border-stone-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-quran-gold/50 focus:border-quran-gold/50 outline-none resize-none text-gray-700 dark:text-gray-200 leading-relaxed bg-stone-50/30 dark:bg-slate-900/50"
                placeholder="Tulis tadabbur, renungan, atau catatan penting di sini..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                autoFocus
            />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 dark:border-slate-700 flex justify-end gap-3 bg-white dark:bg-slate-800">
            <button 
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-stone-100 dark:hover:bg-slate-700 transition-colors"
            >
                Batal
            </button>
            <button 
                onClick={() => {
                    onSave(noteText);
                    onClose();
                }}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-quran-dark text-white hover:bg-quran-dark/90 transition-colors flex items-center gap-2"
            >
                <Save className="w-4 h-4" />
                Simpan
            </button>
        </div>
      </div>
    </div>
  );
};

export default NoteEditorModal;
