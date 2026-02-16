
export interface EmotionTopic {
    id: string;
    label: string;
    icon: string; // Changed from emoji to icon name
    description: string;
    verses: {
        surahId: number;
        verseId: number;
        surahName: string;
    }[];
}

export const EMOTIONS: EmotionTopic[] = [
    {
        id: 'sedih',
        label: 'Kesedihan',
        icon: 'CloudDrizzle',
        description: 'Saat hati terasa sempit, air mata tak terbendung, dan butuh sandaran.',
        verses: [
            { surahId: 9, verseId: 40, surahName: 'At-Tawbah' },
            { surahId: 94, verseId: 5, surahName: 'Al-Insyirah' },
            { surahId: 94, verseId: 6, surahName: 'Al-Insyirah' },
            { surahId: 12, verseId: 86, surahName: 'Yusuf' },
            { surahId: 3, verseId: 139, surahName: 'Ali Imran' },
        ]
    },
    {
        id: 'cemas',
        label: 'Kecemasan',
        icon: 'Waves',
        description: 'Saat pikiran dipenuhi ketakutan akan masa depan dan hati tidak tenang.',
        verses: [
            { surahId: 2, verseId: 286, surahName: 'Al-Baqarah' },
            { surahId: 3, verseId: 173, surahName: 'Ali Imran' },
            { surahId: 65, verseId: 2, surahName: 'At-Talaq' },
            { surahId: 65, verseId: 3, surahName: 'At-Talaq' },
            { surahId: 13, verseId: 28, surahName: 'Ar-Ra\'d' },
        ]
    },
    {
        id: 'kesepian',
        label: 'Kesepian',
        icon: 'Feather',
        description: 'Saat merasa sendiri, terasing, dan merasa tidak ada yang mengerti.',
        verses: [
            { surahId: 50, verseId: 16, surahName: 'Qaf' },
            { surahId: 57, verseId: 4, surahName: 'Al-Hadid' },
            { surahId: 2, verseId: 186, surahName: 'Al-Baqarah' },
            { surahId: 21, verseId: 89, surahName: 'Al-Anbiya' },
        ]
    },
    {
        id: 'marah',
        label: 'Amarah',
        icon: 'Flame',
        description: 'Saat emosi memuncak, dada terasa panas, dan sulit dikendalikan.',
        verses: [
            { surahId: 3, verseId: 134, surahName: 'Ali Imran' },
            { surahId: 42, verseId: 37, surahName: 'Asy-Syura' },
            { surahId: 41, verseId: 34, surahName: 'Fussilat' },
            { surahId: 7, verseId: 199, surahName: 'Al-A\'raf' },
        ]
    },
    {
        id: 'syukur',
        label: 'Rasa Syukur',
        icon: 'Sun',
        description: 'Saat hati dipenuhi cahaya kebahagiaan dan nikmat Allah terasa melimpah.',
        verses: [
            { surahId: 14, verseId: 7, surahName: 'Ibrahim' },
            { surahId: 27, verseId: 40, surahName: 'An-Naml' },
            { surahId: 93, verseId: 11, surahName: 'Ad-Duha' },
            { surahId: 55, verseId: 13, surahName: 'Ar-Rahman' },
        ]
    },
    {
        id: 'berdosa',
        label: 'Penyesalan',
        icon: 'Droplets',
        description: 'Saat menyadari kekhilafan, merasa berdosa, dan ingin kembali.',
        verses: [
            { surahId: 39, verseId: 53, surahName: 'Az-Zumar' },
            { surahId: 3, verseId: 135, surahName: 'Ali Imran' },
            { surahId: 42, verseId: 25, surahName: 'Asy-Syura' },
            { surahId: 66, verseId: 8, surahName: 'At-Tahrim' },
        ]
    },
     {
        id: 'lelah',
        label: 'Kelelahan',
        icon: 'Anchor',
        description: 'Saat perjuangan hidup terasa berat, fisik dan batin ingin bersandar.',
        verses: [
            { surahId: 12, verseId: 87, surahName: 'Yusuf' },
            { surahId: 94, verseId: 5, surahName: 'Al-Insyirah' },
            { surahId: 2, verseId: 214, surahName: 'Al-Baqarah' },
            { surahId: 29, verseId: 69, surahName: 'Al-Ankabut' },
        ]
    },
    {
        id: 'ragu',
        label: 'Keraguan',
        icon: 'Compass',
        description: 'Saat hati bimbang kehilangan arah dan sulit mengambil keputusan.',
        verses: [
            { surahId: 2, verseId: 216, surahName: 'Al-Baqarah' },
            { surahId: 65, verseId: 3, surahName: 'At-Talaq' },
            { surahId: 3, verseId: 159, surahName: 'Ali Imran' },
            { surahId: 18, verseId: 23, surahName: 'Al-Kahf' },
        ]
    }
];
