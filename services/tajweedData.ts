
export interface TajweedExample {
    arabic: string;
    latin: string;
}

export interface TajweedRuleItem {
    id: string;
    name: string;
    description: string; // Makna
    howToRead: string;   // Cara Baca
    colorCode?: string;
    examples: TajweedExample[];
}

export interface TajweedCategory {
    id: string;
    title: string;
    description: string;
    rules: TajweedRuleItem[];
}

export const TAJWEED_LEARNING_DATA: TajweedCategory[] = [
    {
        id: "nun-sukun",
        title: "Hukum Nun Sukun & Tanwin",
        description: "Aturan membaca ketika Nun Mati (نْ) atau Tanwin (ـً ـٍ ـٌ) bertemu huruf hijaiyah.",
        rules: [
            {
                id: "izhar-halqi",
                name: "Izhar Halqi",
                description: "Apabila Nun Sukun atau Tanwin bertemu dengan salah satu huruf halqi (tenggorokan): ء هـ ع ح غ خ.",
                howToRead: "Dibaca JELAS dan TERANG tanpa dengung (ghunnah). Bunyi 'N' terdengar tajam.",
                examples: [
                    { arabic: "مِنْ خَوْفٍ", latin: "Min khaufin" },
                    { arabic: "سَلَامٌ هِيَ", latin: "Salaamun hiya" }
                ]
            },
            {
                id: "idgham-bighunnah",
                name: "Idgham Bighunnah",
                description: "Bertemu dengan huruf: ي ن م و (Yanmu).",
                howToRead: "Meleburkan bunyi Nun/Tanwin ke huruf berikutnya disertai DENGUNG yang ditahan selama 2 harakat.",
                colorCode: "#169b62",
                examples: [
                    { arabic: "مَن يَقُولُ", latin: "May-yaquulu" },
                    { arabic: "مِن مَّسَدٍ", latin: "Mim-masad" }
                ]
            },
            {
                id: "idgham-bilaghunnah",
                name: "Idgham Bilaghunnah",
                description: "Bertemu dengan huruf: ل (Lam) atau ر (Ra).",
                howToRead: "Meleburkan bunyi Nun/Tanwin ke huruf berikutnya TANPA dengung. Bunyi 'N' hilang total.",
                colorCode: "#9ca3af",
                examples: [
                    { arabic: "غَفُورٌ رَّحِيمٌ", latin: "Ghafuurur-rahiim" },
                    { arabic: "مِن لَّدُنْكَ", latin: "Mil-ladunka" }
                ]
            },
            {
                id: "iqlab",
                name: "Iqlab",
                description: "Bertemu dengan huruf: ب (Ba).",
                howToRead: "Mengganti bunyi Nun/Tanwin menjadi Mim (م), disertai dengung ringan.",
                colorCode: "#169b62",
                examples: [
                    { arabic: "مِنۢ بَعْدِ", latin: "Mim-ba'di" },
                    { arabic: "سَمِيعٌۢ بَصِيرٌ", latin: "Samii'um-bashiir" }
                ]
            },
            {
                id: "ikhfa-haqiqi",
                name: "Ikhfa Haqiqi",
                description: "Bertemu dengan 15 huruf sisa (ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك).",
                howToRead: "Dibaca SAMAR antara Izhar dan Idgham, disertai dengung. Bunyi 'N' terdengar seperti 'NG' atau samar di rongga hidung.",
                colorCode: "#169b62",
                examples: [
                    { arabic: "مِن شَرِّ", latin: "Min-syarri" },
                    { arabic: "أَنفُسَهُمْ", latin: "An-fusahum" }
                ]
            }
        ]
    },
    {
        id: "mim-sukun",
        title: "Hukum Mim Sukun",
        description: "Aturan membaca ketika Mim Mati (مْ) bertemu huruf hijaiyah.",
        rules: [
            {
                id: "ikhfa-syafawi",
                name: "Ikhfa Syafawi",
                description: "Mim Sukun bertemu dengan huruf Ba (ب).",
                howToRead: "Dibaca samar di bibir dengan didengungkan.",
                colorCode: "#169b62",
                examples: [
                    { arabic: "تَرْمِيهِم بِحِجَارَةٍ", latin: "Tarmiihim-bihijaaratin" }
                ]
            },
            {
                id: "idgham-mimi",
                name: "Idgham Mimi (Mutamatsilain)",
                description: "Mim Sukun bertemu dengan huruf Mim (م).",
                howToRead: "Meleburkan Mim pertama ke Mim kedua disertai dengung.",
                colorCode: "#169b62",
                examples: [
                    { arabic: "لَهُم مَّا يَشَاءُونَ", latin: "Lahum-maa yasyaa'uun" }
                ]
            },
            {
                id: "izhar-syafawi",
                name: "Izhar Syafawi",
                description: "Mim Sukun bertemu huruf selain Mim dan Ba.",
                howToRead: "Dibaca JELAS di bibir tanpa dengung. Hati-hati jangan didengungkan saat bertemu Wa (و) atau Fa (ف).",
                examples: [
                    { arabic: "أَمْ لَمْ تُنذِرْهُمْ", latin: "Am lam tundzirhum" }
                ]
            }
        ]
    },
    {
        id: "qalqalah",
        title: "Qalqalah (Pantulan)",
        description: "Aturan memantulkan bunyi huruf tertentu saat sukun (mati).",
        rules: [
            {
                id: "qalqalah-sugra",
                name: "Qalqalah Sugra (Kecil)",
                description: "Huruf Qalqalah (ق ط ب ج د) yang mati asli di tengah kata.",
                howToRead: "Dipantulkan dengan goncangan ringan.",
                colorCode: "#367cba",
                examples: [
                    { arabic: "يَقْطَعُونَ", latin: "Yaq-tha'uuna" },
                    { arabic: "إِبْرَاهِيمَ", latin: "Ib-roohiim" }
                ]
            },
            {
                id: "qalqalah-kubra",
                name: "Qalqalah Kubra (Besar)",
                description: "Huruf Qalqalah yang mati karena waqaf (berhenti) di akhir ayat/kalimat.",
                howToRead: "Dipantulkan dengan goncangan yang lebih kuat dan jelas.",
                colorCode: "#367cba",
                examples: [
                    { arabic: "ٱلْفَلَقِ", latin: "Al-Falaq" },
                    { arabic: "مُحِيطٌ", latin: "Muhiith" }
                ]
            }
        ]
    },
    {
        id: "mad",
        title: "Hukum Mad (Panjang)",
        description: "Aturan memanjangkan bacaan huruf.",
        rules: [
            {
                id: "mad-thabii",
                name: "Mad Thabi'i (Asli)",
                description: "Alif sesudah fathah, Ya sukun sesudah kasrah, Wau sukun sesudah dhommah.",
                howToRead: "Dibaca panjang 2 harakat (1 alif).",
                colorCode: "#d65f12",
                examples: [
                    { arabic: "نُوحِيهَا", latin: "Nuu-hii-haa" }
                ]
            },
            {
                id: "mad-wajib",
                name: "Mad Wajib Muttashil",
                description: "Mad Thabi'i bertemu Hamzah dalam satu kata.",
                howToRead: "Wajib dibaca panjang 4 atau 5 harakat.",
                colorCode: "#d65f12",
                examples: [
                    { arabic: "جَاءَ", latin: "Jaaa-a" },
                    { arabic: "ٱلسَّمَاءَ", latin: "As-samaaa-a" }
                ]
            },
            {
                id: "mad-jaiz",
                name: "Mad Jaiz Munfashil",
                description: "Mad Thabi'i bertemu Hamzah di lain kata.",
                howToRead: "Boleh dibaca panjang 2, 4, atau 5 harakat.",
                colorCode: "#d65f12",
                examples: [
                    { arabic: "إِنَّا أَعْطَيْنَاكَ", latin: "Innaaa a'thainaaka" }
                ]
            }
        ]
    }
];
