
import React from 'react';
import { BookOpen } from 'lucide-react';

const Loading: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6 animate-fade-in">
      <div className="relative w-20 h-20">
        {/* Decorative background circle */}
        <div className="absolute inset-0 border-4 border-stone-100 rounded-full"></div>
        {/* Spinning indicator */}
        <div className="absolute inset-0 border-4 border-t-quran-gold border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin duration-1000"></div>
        
        {/* Inner Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
             <div className="bg-quran-gold/10 p-2 rounded-full">
                <BookOpen className="w-6 h-6 text-quran-gold animate-pulse" />
             </div>
        </div>
      </div>
      
      <div className="text-center space-y-2">
        <h3 className="text-quran-dark font-serif text-xl font-bold tracking-tight">Memuat Surat</h3>
        <div className="flex flex-col items-center gap-1">
             <p className="text-xs text-gray-400 font-sans tracking-widest uppercase">Menyiapkan Keindahan Ayat...</p>
             <div className="h-0.5 w-12 bg-quran-gold/30 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-quran-gold w-1/2 animate-[shimmer_1.5s_infinite]"></div>
             </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
