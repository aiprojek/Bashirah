import React from 'react';
import { Word } from '../types';

interface WordItemProps {
  word: Word;
  verseNumber: number;
  onClick: (word: Word) => void;
}

const WordItem: React.FC<WordItemProps> = ({ word, verseNumber, onClick }) => {
  const isEnd = word.char_type_name === 'end';
  
  // Helper for Arabic Numerals
  const toArabicNumerals = (n: number) => {
    return n.toString().replace(/\d/g, d => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)]);
  };

  if (isEnd) {
      return (
        <div className="flex items-center justify-center self-center mb-4 mx-1">
            <span className="verse-ornament">
                {toArabicNumerals(verseNumber)}
            </span>
        </div>
      );
  }

  return (
    <div 
        className="relative group flex flex-col items-center mb-4 mx-0.5 cursor-pointer rounded-lg hover:bg-stone-100/80 transition-colors p-1"
        onClick={() => onClick(word)}
    >
      {/* Arabic Word */}
      <div className="px-1">
          <p className="font-arabic text-3xl leading-relaxed text-center text-quran-dark group-hover:text-quran-gold transition-colors">
            {word.text_uthmani}
          </p>
      </div>

      {/* Inline Meaning */}
      <p className="text-[10px] sm:text-xs text-gray-400 font-sans mt-1 text-center max-w-[80px] truncate group-hover:text-gray-600 transition-colors">
          {word.translation?.text}
      </p>
    </div>
  );
};

export default WordItem;