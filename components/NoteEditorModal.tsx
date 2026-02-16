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
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-quran-dark/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div>
              <h3 className="text-lg font-bold text-quran-dark font-serif">Catatan Ayat</h3>
              <p className="text-xs text-gray-500">{surahName} : Ayat {verseId}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-200 text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 flex-1 flex flex-col">
            <textarea 
                className="w-full h-40 p-4 border border-stone-200 rounded-xl focus:ring-2 focus:ring-quran-gold/50 focus:border-quran-gold/50 outline-none resize-none text-gray-700 leading-relaxed bg-stone-50/30"
                placeholder="Tulis tadabbur, renungan, atau catatan penting di sini..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                autoFocus
            />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 flex justify-end gap-3 bg-white">
            <button 
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-500 hover:bg-stone-100 transition-colors"
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
