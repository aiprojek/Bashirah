
import React from 'react';
import { X, EyeOff, AlignCenter, Ghost, Zap, Check, BrainCircuit } from 'lucide-react';
import { MemorizationLevel } from '../types';

interface MemorizationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: MemorizationLevel;
  onLevelChange: (level: MemorizationLevel) => void;
  isActive: boolean;
  onToggleActive: (active: boolean) => void;
}

const MemorizationSettingsModal: React.FC<MemorizationSettingsModalProps> = ({
  isOpen,
  onClose,
  level,
  onLevelChange,
  isActive,
  onToggleActive
}) => {
  if (!isOpen) return null;

  const levels: {id: MemorizationLevel, label: string, desc: string, icon: any}[] = [
      { id: 'normal', label: 'Blur (Kabur)', desc: 'Teks Arab dikaburkan, ketuk untuk mengintip.', icon: EyeOff },
      { id: 'first-last', label: 'Awal & Akhir', desc: 'Hanya kata pertama dan terakhir yang terlihat.', icon: AlignCenter },
      { id: 'ghost', label: 'Samar (Ghost)', desc: 'Teks sangat transparan, hampir tidak terlihat.', icon: Ghost },
      { id: 'random', label: 'Acak (Random)', desc: 'Sebagian kata dihilangkan secara acak.', icon: Zap },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-fade-in">
        {/* Backdrop */}
        <div 
            className="absolute inset-0 bg-quran-dark/80 backdrop-blur-sm transition-opacity"
            onClick={onClose}
        />
        
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col transform transition-all scale-100 border border-white/10">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
                <h3 className="font-bold text-quran-dark font-serif text-lg flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-quran-gold" /> Mode Hafalan
                </h3>
                <button 
                    onClick={onClose}
                    className="p-1 rounded-full hover:bg-stone-200 text-gray-400 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
                
                {/* Toggle Switch */}
                <div 
                    onClick={() => onToggleActive(!isActive)}
                    className={`flex items-center justify-between p-4 rounded-xl cursor-pointer border-2 transition-all ${
                        isActive 
                        ? 'border-quran-gold bg-quran-gold/5' 
                        : 'border-stone-200 bg-white'
                    }`}
                >
                    <div>
                        <span className="font-bold text-gray-800 block">Aktifkan Mode Hafalan</span>
                        <span className="text-xs text-gray-500">Sembunyikan/samarkan ayat untuk menguji hafalan.</span>
                    </div>
                    <div className={`w-12 h-6 rounded-full relative transition-colors ${isActive ? 'bg-quran-gold' : 'bg-gray-300'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${isActive ? 'left-7' : 'left-1'}`}></div>
                    </div>
                </div>

                {/* Level Selection */}
                {isActive && (
                    <div className="space-y-2 animate-fade-in">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Pilih Tantangan</label>
                        {levels.map((lvl) => (
                            <button
                                key={lvl.id}
                                onClick={() => onLevelChange(lvl.id)}
                                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${
                                    level === lvl.id 
                                    ? 'bg-quran-dark text-white border-quran-dark shadow-md' 
                                    : 'bg-white text-gray-600 border-stone-200 hover:bg-stone-50'
                                }`}
                            >
                                <div className={`p-2 rounded-lg ${level === lvl.id ? 'bg-white/20' : 'bg-stone-100 text-gray-500'}`}>
                                    <lvl.icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-sm">{lvl.label}</div>
                                    <div className={`text-[10px] ${level === lvl.id ? 'text-white/70' : 'text-gray-400'}`}>{lvl.desc}</div>
                                </div>
                                {level === lvl.id && <Check className="w-5 h-5 text-quran-gold" />}
                            </button>
                        ))}
                    </div>
                )}
            </div>

             {/* Footer */}
             <div className="px-6 py-4 bg-stone-50 border-t border-stone-100">
                <button 
                    onClick={onClose}
                    className="w-full py-3 bg-quran-dark text-white rounded-xl font-bold hover:bg-quran-dark/90 transition-all shadow-lg"
                >
                    Selesai
                </button>
            </div>
        </div>
    </div>
  );
};

export default MemorizationSettingsModal;
