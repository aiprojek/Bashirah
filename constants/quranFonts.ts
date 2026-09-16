export type ArabicFontId = 'uthmani-hafs' | 'indopak' | 'nastaleeq' | 'me-quran';

export interface ArabicFontOption {
  id: ArabicFontId;
  label: string;
  family: string;
  description: string;
  descriptionEn?: string;
}

export const DEFAULT_ARABIC_FONT_ID: ArabicFontId = 'uthmani-hafs';

export const QURAN_ARABIC_FONT_OPTIONS: ArabicFontOption[] = [
  {
    id: 'uthmani-hafs',
    label: 'Uthmani Hafs',
    family: '"Uthmanic Hafs", serif',
    description: 'Paling dekat dengan tampilan mushaf standar dan nyaman untuk membaca ayat.',
    descriptionEn: 'Closest to the standard Mushaf layout, comfortable for reading verses.',
  },
  {
    id: 'indopak',
    label: 'IndoPak',
    family: '"AlQuran IndoPak", serif',
    description: 'Gaya huruf IndoPak yang akrab dipakai di sebagian mushaf Asia Selatan.',
    descriptionEn: 'IndoPak script style commonly used in South Asian mushafs.',
  },
  {
    id: 'nastaleeq',
    label: 'Nastaleeq',
    family: '"KFGQPC Nastaleeq", serif',
    description: 'Gaya kaligrafi yang lebih lembut dan dekoratif untuk nuansa berbeda.',
    descriptionEn: 'Soft and decorative calligraphic style for an artistic reading experience.',
  },
  {
    id: 'me-quran',
    label: 'ME Quran',
    family: '"ME Quran", serif',
    description: 'Tampilan huruf Quran yang padat dan jelas di ukuran menengah hingga besar.',
    descriptionEn: 'Dense and clear Quranic glyphs optimized for medium to large text sizes.',
  },
];

export const getArabicFontOption = (fontId?: string): ArabicFontOption =>
  QURAN_ARABIC_FONT_OPTIONS.find(option => option.id === fontId) ||
  QURAN_ARABIC_FONT_OPTIONS[0];

export const getArabicFontStack = (fontId?: string): string =>
  getArabicFontOption(fontId).family;
