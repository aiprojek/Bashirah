
import React, { useMemo } from 'react';
import { getWaqafItemByChar, WAQAF_REGEX, WaqafItem } from '../constants/waqafData';

interface TajweedTextProps {
  text: string;
  onWaqafClick?: (waqaf: WaqafItem) => void;
}

// Group definitions for the Legend based on Al-Quran Cloud / International Mushaf Tajweed standards
export interface TajweedGroup {
    id: string;
    label: string;
    colorClass: string;
    hexColor: string;
    rules: string[]; // chars used in parsing
}

export const TAJWEED_GROUPS: TajweedGroup[] = [
    { 
        id: 'ghunnah-ikhfa',
        label: 'Ghunnah, Ikhfa & Iqlab (Dengung)', 
        colorClass: 'text-[#16a34a] dark:text-[#4ade80]', 
        hexColor: '#16a34a',
        rules: ['g', 'f', 'c', 'i', 'a', 'w'] 
        // g: Ghunnah mushaddadah (نّ, مّ)
        // f: Ikhfa haqiqi
        // c: Ikhfa syafawi (م bertemu ب)
        // i: Iqlab (ن/tanwin bertemu ب)
        // a: Idgham bighunnah (ي ن م و)
        // w: Idgham mimi / mutamatsilain
    },
    { 
        id: 'qalqalah',
        label: 'Qalqalah (Pantulan)', 
        colorClass: 'text-[#2563eb] dark:text-[#60a5fa]', 
        hexColor: '#2563eb',
        rules: ['q', 'd'] 
        // q: Qalqalah sugra
        // d: Qalqalah kubra
    },
    { 
        id: 'mad-panjang',
        label: 'Mad Panjang 4-6 Harakat', 
        colorClass: 'text-[#dc2626] dark:text-[#f87171]', 
        hexColor: '#dc2626',
        rules: ['o', 'm'] 
        // o: Mad wajib muttashil & mad lazim (4-6 harakat)
        // m: Mad jaiz munfashil (4-5 harakat)
    },
    { 
        id: 'mad-biasa',
        label: 'Mad Biasa 2 Harakat (Thabi\'i / \'Aridh)', 
        colorClass: 'text-[#d97706] dark:text-[#fbbf24]', 
        hexColor: '#d97706',
        rules: ['n', 'p'] 
        // n: Mad thabi'i / asli (2 harakat)
        // p: Mad 'aridh lissukun
    },
    { 
        id: 'idgham-silent',
        label: 'Idgham & Tidak Dibaca (Lebur/Samar)', 
        colorClass: 'text-[#64748b] dark:text-[#94a3b8]', 
        hexColor: '#64748b',
        rules: ['u', 'b', 'l', 'h', 's'] 
        // u: Idgham bila ghunnah (ل, ر)
        // b: Idgham mutajanisain / mutaqaribain
        // l: Lam shamsiyyah
        // h: Hamzatul wasl
        // s: Silent letter (alif/waw ziyadah)
    },
];

// Helper to get color class by rule char
const getColorClass = (ruleChar: string): string => {
    const group = TAJWEED_GROUPS.find(g => g.rules.includes(ruleChar));
    // Default fallback is vital here: text-quran-dark for light, text-white for dark
    return group ? group.colorClass : 'text-quran-dark dark:text-white';
};

// Helper to extract active groups from text
export const getActiveTajweedGroups = (text: string): TajweedGroup[] => {
    if (!text) return [];
    
    // Simple regex to find the rule part inside [rule[...]]
    // Example text: ٱلْحَمْدُ لِلَّهِ رَبِّ [h:4[ٱ]لْعَ[n[ـٰ]لَم[p[ِي]نَ
    const ruleRegex = /\[([a-zA-Z0-9:]+)\[/g;
    
    const foundRules = new Set<string>();
    let match;
    while ((match = ruleRegex.exec(text)) !== null) {
        const baseRule = match[1].split(':')[0].toLowerCase();
        foundRules.add(baseRule);
    }

    if (foundRules.size === 0) return [];

    return TAJWEED_GROUPS.filter(group => 
        group.rules.some(r => foundRules.has(r))
    );
};

const TajweedText: React.FC<TajweedTextProps> = ({ text, onWaqafClick }) => {
  const elements = useMemo(() => {
    if (!text) return null;

    const renderWithWaqaf = (str: string, prefix: string): React.ReactNode => {
      if (!str) return null;
      if (!onWaqafClick) return str;
      const segments = str.split(WAQAF_REGEX);
      if (segments.length === 1) return str;
      return (
        <>
          {segments.map((seg, sIdx) => {
            const waqaf = getWaqafItemByChar(seg);
            if (waqaf) {
              const cleanChar = seg.replace(/[\u200C\u200D\s]/g, '');
              return (
                <button
                  key={`${prefix}-wq-${sIdx}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onWaqafClick(waqaf);
                  }}
                  className="waqaf-mark-btn inline-flex items-center justify-center mx-1 px-1 py-0.5 rounded text-amber-600 dark:text-amber-400 font-bold bg-amber-500/15 hover:bg-amber-500/30 active:scale-125 transition-all cursor-pointer align-baseline select-none"
                  title={`${waqaf.name} (${waqaf.hukum})`}
                >
                  {cleanChar || seg}
                </button>
              );
            }
            return seg;
          })}
        </>
      );
    };

    // Regex to match the format: [rule[content]
    const PARSE_REGEX = /\[([^\[]+)\[([^\]]*)\]/g;

    if (!text.match(PARSE_REGEX)) {
         return <span className="text-quran-dark dark:text-white">{renderWithWaqaf(text, 'p')}</span>;
    }

    const parts = text.split(PARSE_REGEX);
    const result: React.ReactNode[] = [];
    for (let i = 0; i < parts.length; i += 3) {
        const plainText = parts[i];
        const rule = parts[i + 1];
        const content = parts[i + 2];

        // 1. Add plain text part
        if (plainText) {
            result.push(
                <span key={`t-${i}`} className="text-quran-dark dark:text-white">
                    {renderWithWaqaf(plainText, `t-${i}`)}
                </span>
            );
        }

        // 2. Add styled content part (if rule exists)
        if (rule && content !== undefined) {
             const baseRule = rule.split(':')[0].toLowerCase();
             const colorClass = getColorClass(baseRule);
             
             result.push(
                <span key={`c-${i}`} className={colorClass}>
                    {renderWithWaqaf(content, `c-${i}`)}
                </span>
             );
        }
    }

    return result;
  }, [text, onWaqafClick]);

  return <span className="tajweed-container">{elements}</span>;
};

export default TajweedText;
