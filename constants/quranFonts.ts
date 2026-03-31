export type ArabicFontId = 'uthmani-hafs' | 'indopak' | 'nastaleeq' | 'me-quran';

export interface ArabicFontOption {
  id: ArabicFontId;
  label: string;
  family: string;
  description: string;
}

export const DEFAULT_ARABIC_FONT_ID: ArabicFontId = 'uthmani-hafs';

export const QURAN_ARABIC_FONT_OPTIONS: ArabicFontOption[] = [
  {
    id: 'uthmani-hafs',
    label: 'Uthmani Hafs',
    family: '"Uthmanic Hafs", serif',
    description: 'Paling dekat dengan tampilan mushaf standar dan nyaman untuk membaca ayat.',
  },
  {
    id: 'indopak',
    label: 'IndoPak',
    family: '"AlQuran IndoPak", serif',
    description: 'Gaya huruf IndoPak yang akrab dipakai di sebagian mushaf Asia Selatan.',
  },
  {
    id: 'nastaleeq',
    label: 'Nastaleeq',
    family: '"KFGQPC Nastaleeq", serif',
    description: 'Gaya kaligrafi yang lebih lembut dan dekoratif untuk nuansa berbeda.',
  },
  {
    id: 'me-quran',
    label: 'ME Quran',
    family: '"ME Quran", serif',
    description: 'Tampilan huruf Quran yang padat dan jelas di ukuran menengah hingga besar.',
  },
];

export const getArabicFontOption = (fontId?: string): ArabicFontOption =>
  QURAN_ARABIC_FONT_OPTIONS.find(option => option.id === fontId) ||
  QURAN_ARABIC_FONT_OPTIONS[0];

export const getArabicFontStack = (fontId?: string): string =>
  getArabicFontOption(fontId).family;
