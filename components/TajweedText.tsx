
import React, { useMemo } from 'react';

interface TajweedTextProps {
  text: string;
}

// Group definitions for the Legend
export interface TajweedGroup {
    label: string;
    colorClass: string;
    hexColor: string;
    rules: string[]; // chars used in parsing
}

export const TAJWEED_GROUPS: TajweedGroup[] = [
    { 
        label: 'Ghunnah / Ikhfa (Dengung)', 
        colorClass: 'text-[#169b62]', 
        hexColor: '#169b62',
        rules: ['n', 'm', 'f'] 
    },
    { 
        label: 'Qalqalah (Pantulan)', 
        colorClass: 'text-[#367cba]', 
        hexColor: '#367cba',
        rules: ['q'] 
    },
    { 
        label: 'Mad (Panjang)', 
        colorClass: 'text-[#d65f12]', 
        hexColor: '#d65f12',
        rules: ['o', 'u', 'a', 'i'] 
    },
    { 
        label: 'Tafkhim (Tebal)', 
        colorClass: 'text-[#2a5a8a]', 
        hexColor: '#2a5a8a',
        rules: ['t', 'l', 'r'] 
    },
    { 
        label: 'Idgham (Lebur)', 
        colorClass: 'text-gray-400', 
        hexColor: '#9ca3af',
        rules: ['p', 'w', 'h'] 
    },
];

// Helper to get color class by rule char
const getColorClass = (ruleChar: string): string => {
    const group = TAJWEED_GROUPS.find(g => g.rules.includes(ruleChar));
    return group ? group.colorClass : 'text-quran-dark';
};

// Helper to extract active groups from text
export const getActiveTajweedGroups = (text: string): TajweedGroup[] => {
    if (!text) return [];
    
    // Simple regex to find the rule part inside [rule[...]]
    // We are looking for the pattern [code[
    // Example text: ٱلْحَمْدُ لِلَّهِ رَبِّ [h:4[ٱ]لْعَ[n[ـٰ]لَم[p[ِي]نَ
    const ruleRegex = /\[([a-zA-Z0-9:]+)\[/g;
    
    const foundRules = new Set<string>();
    let match;
    while ((match = ruleRegex.exec(text)) !== null) {
        // match[1] is the rule code (e.g. "n" or "h:4")
        const baseRule = match[1].split(':')[0].toLowerCase();
        foundRules.add(baseRule);
    }

    if (foundRules.size === 0) return [];

    return TAJWEED_GROUPS.filter(group => 
        group.rules.some(r => foundRules.has(r))
    );
};

const TajweedText: React.FC<TajweedTextProps> = ({ text }) => {
  const elements = useMemo(() => {
    if (!text) return null;

    // Regex to match the format: [rule[content]
    // Example: [h:4[ٱ]
    const PARSE_REGEX = /\[([^\[]+)\[([^\]]*)\]/g;

    // Check if text actually contains this format
    if (!text.match(PARSE_REGEX)) {
         return <span className="text-quran-dark">{text}</span>;
    }

    const parts = text.split(PARSE_REGEX);
    const result: React.ReactNode[] = [];
    
    // Split with capturing groups returns: [text, rule, content, text, rule, content, ...]
    for (let i = 0; i < parts.length; i += 3) {
        const plainText = parts[i];
        const rule = parts[i + 1];
        const content = parts[i + 2];

        // 1. Add plain text part
        if (plainText) {
            result.push(
                <span key={`t-${i}`} className="text-quran-dark">
                    {plainText}
                </span>
            );
        }

        // 2. Add styled content part (if rule exists)
        if (rule && content !== undefined) {
             // Extract base rule code (e.g., 'h:4' -> 'h')
             const baseRule = rule.split(':')[0].toLowerCase();
             const colorClass = getColorClass(baseRule);
             
             result.push(
                <span key={`c-${i}`} className={colorClass}>
                    {content}
                </span>
             );
        }
    }

    return result;
  }, [text]);

  return <>{elements}</>;
};

export default TajweedText;
