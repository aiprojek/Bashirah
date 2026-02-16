import React, { useMemo } from 'react';

interface TajweedTextProps {
  text: string;
}

// Map tags to Tailwind text colors
// Based on typical IndoPak/Medina Tajweed color coding
const COLOR_MAP: Record<string, string> = {
  // Ghunnah: Nasalization (Green)
  'n': 'text-[#169b62]', 
  'm': 'text-[#169b62]', // Iqlab/Idgham Mim Sakiin usually same color family
  
  // Qalqalah: Echoing (Blue)
  'q': 'text-[#367cba]', 
  
  // Madd: Prolongation (Red/Orange)
  'o': 'text-[#d65f12]', // Extra long
  'u': 'text-[#d65f12]',
  'a': 'text-[#d65f12]',
  'i': 'text-[#d65f12]',
  
  // Idgham: Merging (Gray/Light)
  'p': 'text-stone-400', 
  
  // Ikhfa (Cyan/Light Blue - sometimes similar to Ghunnah but distinct)
  'f': 'text-[#169b62]', 
  
  // Idgham bila Ghunnah (Gray/No color usually, but we keep it distinct)
  'w': 'text-stone-400',
};

const TajweedText: React.FC<TajweedTextProps> = ({ text }) => {
  const parsedContent = useMemo(() => {
    if (!text) return null;

    // 1. Normalize: Convert curly braces to square brackets for consistency
    // Some APIs return {n} instead of [n]
    let normalized = text.replace(/\{/g, '[').replace(/\}/g, ']');

    // 2. Split by tags
    // This Regex captures:
    // \[ : starting bracket
    // /? : optional slash (for closing tags)
    // [a-z]+ : the tag name (e.g., n, q, m)
    // (?::\d+)? : optional colon and number (e.g., :1, :24) used for indexing
    // \] : closing bracket
    const SPLIT_REGEX = /(\[[\/]?[a-z]+(?::\d+)?\])/gi;

    const parts = normalized.split(SPLIT_REGEX);
    const elements: React.ReactNode[] = [];
    
    // Stack-like behavior (though simple state is usually enough for this API)
    let currentClass = 'text-quran-dark';

    parts.forEach((part, index) => {
      // Check if it's a tag
      if (part.startsWith('[') && part.endsWith(']')) {
        const isClosing = part.startsWith('[/');
        
        if (isClosing) {
           // Reset to default color on closing tag
           currentClass = 'text-quran-dark';
        } else {
           // Extract the rule code. 
           // Example: "[n:1]" -> "n"
           // Example: "[q]" -> "q"
           const content = part.replace(/[\[\]]/g, ''); // remove brackets
           const code = content.split(':')[0].toLowerCase(); // take part before colon

           if (COLOR_MAP[code]) {
             currentClass = COLOR_MAP[code];
           } else {
             currentClass = 'text-quran-dark'; // Fallback
           }
        }
      } else {
        // It's text content
        if (part) {
          elements.push(
            <span key={index} className={`${currentClass} font-arabic`}>
              {part}
            </span>
          );
        }
      }
    });

    return elements;
  }, [text]);

  return <>{parsedContent}</>;
};

export default TajweedText;