
import { Topic } from '../types';

export const TOPICS: Topic[] = [
    {
        id: 'iman',
        title: 'Iman & Aqidah',
        description: 'Ayat-ayat tentang keimanan kepada Allah, Malaikat, Kitab, dan Hari Akhir.',
        iconName: 'Moon',
        references: [
            { surahId: 2, surahName: 'Al-Baqarah', verseId: 177 },
            { surahId: 2, surahName: 'Al-Baqarah', verseId: 255 },
            { surahId: 2, surahName: 'Al-Baqarah', verseId: 285 },
            { surahId: 4, surahName: 'An-Nisa', verseId: 136 },
            { surahId: 112, surahName: 'Al-Ikhlas', verseId: 1 },
        ]
    },
    {
        id: 'sabar',
        title: 'Kesabaran',
        description: 'Petunjuk Al-Quran tentang bersabar menghadapi ujian hidup.',
        iconName: 'HeartHandshake',
        references: [
            { surahId: 2, surahName: 'Al-Baqarah', verseId: 45 },
            { surahId: 2, surahName: 'Al-Baqarah', verseId: 153 },
            { surahId: 2, surahName: 'Al-Baqarah', verseId: 155 },
            { surahId: 3, surahName: 'Ali Imran', verseId: 200 },
            { surahId: 94, surahName: 'Al-Insyirah', verseId: 5 },
        ]
    },
    {
        id: 'keluarga',
        title: 'Keluarga & Orang Tua',
        description: 'Hukum pernikahan, mendidik anak, dan berbakti pada orang tua.',
        iconName: 'Users',
        references: [
            { surahId: 17, surahName: 'Al-Isra', verseId: 23 },
            { surahId: 31, surahName: 'Luqman', verseId: 14 },
            { surahId: 46, surahName: 'Al-Ahqaf', verseId: 15 },
            { surahId: 25, surahName: 'Al-Furqan', verseId: 74 },
            { surahId: 30, surahName: 'Ar-Rum', verseId: 21 },
        ]
    },
    {
        id: 'doa',
        title: 'Kumpulan Doa',
        description: 'Doa-doa para Nabi dan orang saleh yang diabadikan dalam Al-Quran.',
        iconName: 'Sparkles',
        references: [
            { surahId: 2, surahName: 'Al-Baqarah', verseId: 201 },
            { surahId: 3, surahName: 'Ali Imran', verseId: 8 },
            { surahId: 14, surahName: 'Ibrahim', verseId: 40 },
            { surahId: 14, surahName: 'Ibrahim', verseId: 41 },
            { surahId: 21, surahName: 'Al-Anbiya', verseId: 87 },
            { surahId: 23, surahName: 'Al-Mu\'minun', verseId: 118 },
        ]
    },
    {
        id: 'rezeki',
        title: 'Rezeki & Sedekah',
        description: 'Ayat tentang mencari nafkah, sedekah, dan keberkahan harta.',
        iconName: 'Coins',
        references: [
            { surahId: 2, surahName: 'Al-Baqarah', verseId: 261 },
            { surahId: 51, surahName: 'Adz-Dzariyat', verseId: 58 },
            { surahId: 65, surahName: 'At-Talaq', verseId: 3 },
            { surahId: 11, surahName: 'Hud', verseId: 6 },
            { surahId: 67, surahName: 'Al-Mulk', verseId: 15 },
        ]
    },
    {
        id: 'akhlak',
        title: 'Akhlak Mulia',
        description: 'Perintah berlaku jujur, adil, rendah hati, dan menepati janji.',
        iconName: 'Smile',
        references: [
            { surahId: 3, surahName: 'Ali Imran', verseId: 134 },
            { surahId: 17, surahName: 'Al-Isra', verseId: 34 },
            { surahId: 17, surahName: 'Al-Isra', verseId: 37 },
            { surahId: 49, surahName: 'Al-Hujurat', verseId: 12 },
            { surahId: 31, surahName: 'Luqman', verseId: 18 },
        ]
    },
    {
        id: 'ibadah',
        title: 'Ibadah',
        description: 'Shalat, Puasa, Haji, dan ibadah mahdhah lainnya.',
        iconName: 'BookOpen',
        references: [
            { surahId: 2, surahName: 'Al-Baqarah', verseId: 43 },
            { surahId: 2, surahName: 'Al-Baqarah', verseId: 183 },
            { surahId: 22, surahName: 'Al-Hajj', verseId: 27 },
            { surahId: 29, surahName: 'Al-Ankabut', verseId: 45 },
            { surahId: 62, surahName: 'Al-Jumuah', verseId: 9 },
        ]
    },
     {
        id: 'ilmu',
        title: 'Ilmu Pengetahuan',
        description: 'Ayat-ayat yang mendorong manusia untuk berpikir dan menuntut ilmu.',
        iconName: 'Lightbulb',
        references: [
            { surahId: 96, surahName: 'Al-Alaq', verseId: 1 },
            { surahId: 58, surahName: 'Al-Mujadilah', verseId: 11 },
            { surahId: 20, surahName: 'Taha', verseId: 114 },
            { surahId: 39, surahName: 'Az-Zumar', verseId: 9 },
            { surahId: 3, surahName: 'Ali Imran', verseId: 190 },
        ]
    }
];
