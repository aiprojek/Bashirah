export interface WaqafItem {
  id: string;
  symbol: string;
  name: string;
  arabicName: string;
  category: 'must-stop' | 'can-stop' | 'better-continue' | 'must-not-stop' | 'special';
  categoryLabel: string;
  categoryColor: string;
  hukum: string;
  description: string;
  descriptionEn: string;
  howToRead: string;
  example: {
    surahId: number;
    surahName: string;
    verseId: number;
    arabicSnippet: string;
    translation: string;
  };
}

export const WAQAF_DATA: WaqafItem[] = [
  {
    id: 'lazim',
    symbol: 'مـ',
    name: 'Waqaf Lazim',
    arabicName: 'الوَقْفُ اللَّازِمُ',
    category: 'must-stop',
    categoryLabel: 'Wajib Berhenti',
    categoryColor: 'bg-red-500/10 text-red-600 border-red-500/30',
    hukum: 'Wajib (Harus Berhenti)',
    description: 'Harus berhenti sempurna. Melanjutkan bacaan tanpa waqaf dapat merusak atau mengubah makna ayat yang dimaksud.',
    descriptionEn: 'Must stop. Continuing without stopping may alter or distort the intended theological meaning of the verse.',
    howToRead: 'Berhentilah pada kata yang bertanda huruf Mim (مـ), ambil napas, lalu lanjutkan membaca dari kata berikutnya.',
    example: {
      surahId: 6,
      surahName: 'Al-An\'am',
      verseId: 36,
      arabicSnippet: 'إِنَّمَا يَسْتَجِيبُ الَّذِينَ يَسْمَعُونَ ۘ وَالْمَوْتَىٰ يَبْعَثُهُمُ اللَّهُ',
      translation: 'Hanya orang-orang yang mendengar sajalah yang mematuhi (seruan dakwahmu) [Waqaf Lazim]. Dan orang-orang yang mati, kelak akan dibangkitkan oleh Allah...',
    },
  },
  {
    id: 'mamnu',
    symbol: 'لا',
    name: 'Waqaf Mamnu\'',
    arabicName: 'الوَقْفُ المَمْنُوعُ',
    category: 'must-not-stop',
    categoryLabel: 'Dilarang Berhenti',
    categoryColor: 'bg-rose-500/10 text-rose-600 border-rose-500/30',
    hukum: 'Dilarang Berhenti (Harus Lanjut)',
    description: 'Dilarang berhenti di tengah kalimat jika maknanya belum tuntas. Jika terpaksa berhenti karena napas habis, wajib mengulang (isti\'naf) dari kata sebelumnya.',
    descriptionEn: 'Must not stop mid-sentence. If breath runs out, repeat from an earlier appropriate word to preserve meaning.',
    howToRead: 'Lanjutkan bacaan tanpa memotong kalimat. Jika kehabisan napas, mundurlah satu atau dua kata ke belakang sebelum melanjutkan.',
    example: {
      surahId: 16,
      surahName: 'An-Nahl',
      verseId: 32,
      arabicSnippet: 'الَّذِينَ تَتَوَفَّاهُمُ الْمَلَائِكَةُ طَيِّبِينَ ۙ يَقُولُونَ سَلَامٌ عَلَيْكُمُ',
      translation: '(Yaitu) orang yang diwafatkan oleh para malaikat dalam keadaan baik [Harus Lanjut] dengan mengatakan kepada mereka: "Salamun \'alaikum"...',
    },
  },
  {
    id: 'jaiz',
    symbol: 'ج',
    name: 'Waqaf Ja\'iz',
    arabicName: 'الوَقْفُ الجَائِزُ',
    category: 'can-stop',
    categoryLabel: 'Boleh Berhenti / Lanjut',
    categoryColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
    hukum: 'Boleh Berhenti atau Lanjut (Sama Kuat)',
    description: 'Pembaca diperbolehkan memilih apakah ingin berhenti atau terus menyambung bacaan, keduanya berkedudukan sama baik.',
    descriptionEn: 'Permissible to either stop or continue; both choices carry equal validity.',
    howToRead: 'Anda bebas berhenti mengambil napas atau langsung melanjutkan ke kata berikutnya tanpa harus mengulang.',
    example: {
      surahId: 18,
      surahName: 'Al-Kahf',
      verseId: 13,
      arabicSnippet: 'نَّحْنُ نَقُصُّ عَلَيْكَ نَبَأَهُم بِالْحَقِّ ۚ إِنَّهُمْ فِتْيَةٌ آمَنُوا بِرَبِّهِمْ',
      translation: 'Kami ceritakan kepadamu (Muhammad) kisah mereka dengan sebenarnya [Boleh Berhenti/Lanjut]. Sesungguhnya mereka adalah pemuda-pemuda yang beriman...',
    },
  },
  {
    id: 'waqf-aula',
    symbol: 'قلى',
    name: 'Waqaf Al-Waqf Aula',
    arabicName: 'الوَقْفُ أَوْلَى',
    category: 'can-stop',
    categoryLabel: 'Lebih Utama Berhenti',
    categoryColor: 'bg-teal-500/10 text-teal-600 border-teal-500/30',
    hukum: 'Diutamakan Berhenti (Waqaf Lebih Baik)',
    description: 'Singkatan dari "Al-Waqfu Aula". Boleh menyambung bacaan, tetapi berhenti jauh lebih utama dan lebih indah maknanya.',
    descriptionEn: 'Stopping is preferred over continuing, though continuing remains grammatically permissible.',
    howToRead: 'Dianjurkan berhenti dan mengambil napas untuk meresapi makna ayat, baru kemudian membaca kata berikutnya.',
    example: {
      surahId: 2,
      surahName: 'Al-Baqarah',
      verseId: 253,
      arabicSnippet: 'تِلْكَ الرُّسُلُ فَضَّلْنَا بَعْضَهُمْ عَلَىٰ بَعْضٍ ۘ مِّنْهُم مَّن كَلَّمَ اللَّهُ',
      translation: 'Rasul-rasul itu Kami lebihkan sebagian mereka dari sebagian yang lain [Lebih Utama Berhenti]. Di antara mereka ada yang langsung Allah ajak bicara...',
    },
  },
  {
    id: 'washl-aula',
    symbol: 'صلى',
    name: 'Waqaf Al-Washl Aula',
    arabicName: 'الوَصْلُ أَوْلَى',
    category: 'better-continue',
    categoryLabel: 'Lebih Utama Lanjut',
    categoryColor: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
    hukum: 'Diutamakan Lanjut (Washal Lebih Baik)',
    description: 'Singkatan dari "Al-Washlu Aula". Boleh berhenti bila terpaksa, tetapi menyambung bacaan (washal) lebih utama.',
    descriptionEn: 'Continuing without pause is preferred to maintain narrative continuity, though stopping is allowed.',
    howToRead: 'Lanjutkan membaca kata berikutnya tanpa berhenti. Berhentilah hanya jika kapasitas napas sudah tidak mencukupi.',
    example: {
      surahId: 4,
      surahName: 'An-Nisa',
      verseId: 171,
      arabicSnippet: 'إِنَّمَا اللَّهُ إِلَٰهٌ وَاحِدٌ ۖ سُبْحَانَهُ أَن يَكُونَ لَهُ وَلَدٌ',
      translation: 'Sesungguhnya Allah adalah Tuhan Yang Maha Esa [Lebih Baik Lanjut], Mahasuci Dia dari mempunyai anak...',
    },
  },
  {
    id: 'muanaqah',
    symbol: '∴ ... ∴',
    name: 'Waqaf Mu\'anaqah (Muraqabah)',
    arabicName: 'وَقْفُ المُعَانَقَةِ / المُرَاقَبَةِ',
    category: 'special',
    categoryLabel: 'Berhenti di Salah Satu',
    categoryColor: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30',
    hukum: 'Wajib Berhenti di Salah Satu Tanda (Bukan Keduanya)',
    description: 'Tanda titik tiga kembar (triplet). Pembaca harus berhenti di salah satu tanda saja; tidak boleh berhenti di kedua-duanya, dan tidak boleh melewati kedua-duanya tanpa berhenti sama sekali.',
    descriptionEn: 'Triple dots mark. You must pause at one of the two signs, not both, and not skip both.',
    howToRead: 'Pilihlah salah satu tanda titik tiga untuk waqaf (misalnya tanda pertama), lalu lanjutkan bacaan melewati tanda kedua tanpa berhenti.',
    example: {
      surahId: 2,
      surahName: 'Al-Baqarah',
      verseId: 2,
      arabicSnippet: 'ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ',
      translation: 'Kitab (Al-Qur\'an) ini tidak ada keraguan padanya [Titik 1]; petunjuk bagi mereka yang bertakwa [Titik 2]. Berhenti di "Laa raiba" ATAU di "Fiihi".',
    },
  },
  {
    id: 'saktah',
    symbol: 'س / سكتة',
    name: 'Saktah',
    arabicName: 'السَّكْتَةُ اللَّطِيفَةُ',
    category: 'special',
    categoryLabel: 'Berhenti Tanpa Napas',
    categoryColor: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
    hukum: 'Berhenti Sejenak 1 Alif Tanpa Bernapas',
    description: 'Menahan suara selama 2 harakat (1 alif) tanpa mengambil napas baru, lalu langsung melanjutkan bacaan. Terdapat di 4 tempat utama dalam riwayat Hafsh \'an \'Ashim.',
    descriptionEn: 'Brief pause of 2 counts without taking a breath before resuming speech. Found in 4 specific places in Hafs reading.',
    howToRead: 'Diam sejenak kira-kira 2 hitungan, tahan napas (jangan menghirup udara), lalu lanjutkan kalimat selanjutnya.',
    example: {
      surahId: 36,
      surahName: 'Yasin',
      verseId: 52,
      arabicSnippet: 'قَالُوا يَا وَيْلَنَا مَن بَعَثَنَا مِن مَّرْقَدِنَا ۜ هَٰذَا مَا وَعَدَ الرَّحْمَٰنُ',
      translation: 'Mereka berkata: "Celakalah kami! Siapakah yang membangkitkan kami dari tempat tidur kami (kubur)?" [Saktah sejenak tanpa napas] "Inilah yang dijanjikan (Allah) Yang Maha Pengasih..."',
    },
  },
  {
    id: 'qif',
    symbol: 'قف',
    name: 'Waqaf Al-Waqfu (Qif)',
    arabicName: 'قِفْ',
    category: 'can-stop',
    categoryLabel: 'Dianjurkan Berhenti',
    categoryColor: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
    hukum: 'Dianjurkan Berhenti (Sunnah / Mustahab)',
    description: 'Tanda "Qif" berarti "Berhentilah!". Sangat dianjurkan untuk berhenti agar nafas teratur dan makna tersampaikan dengan utuh.',
    descriptionEn: 'Meaning "Stop!". Highly recommended to stop for breathing and optimal thematic comprehension.',
    howToRead: 'Berhentilah pada lafadz yang bertanda qif, lalu lanjutkan dari kata berikutnya.',
    example: {
      surahId: 3,
      surahName: 'Ali \'Imran',
      verseId: 7,
      arabicSnippet: 'وَمَا يَعْلَمُ تَأْوِيلَهُ إِلَّا اللَّهُ ۗ وَالرَّاسِخُونَ فِي الْعِلْمِ',
      translation: 'Padahal tidak ada yang mengetahui takwilnya melainkan Allah [Qif]. Dan orang-orang yang mendalam ilmunya berkata: "Kami beriman kepadanya..."',
    },
  },
  {
    id: 'murakhkhas',
    symbol: 'ص',
    name: 'Waqaf Murakhkhas',
    arabicName: 'الوَقْفُ المُرَخَّصُ',
    category: 'can-stop',
    categoryLabel: 'Rukhsah (Keringanan)',
    categoryColor: 'bg-stone-500/10 text-stone-600 border-stone-500/30',
    hukum: 'Keringanan Berhenti Karena Darurat',
    description: 'Boleh berhenti karena darurat atau keterbatasan napas karena ayatnya panjang, meskipun menyambung tetap lebih diutamakan.',
    descriptionEn: 'Concession pause for long sentences when breath is limited.',
    howToRead: 'Bila napas tidak cukup, berhentilah di sini tanpa rasa cemas, lalu lanjutkan dari kata berikutnya.',
    example: {
      surahId: 7,
      surahName: 'Al-A\'raf',
      verseId: 158,
      arabicSnippet: 'قُلْ يَا أَيُّهَا النَّاسُ إِنِّي رَسُولُ اللَّهِ إِلَيْكُمْ جَمِيعًا',
      translation: 'Katakanlah: "Wahai manusia! Sesungguhnya aku adalah utusan Allah kepadamu semua..."',
    },
  },
];

export interface WaqafQuizQuestion {
  id: number;
  question: string;
  symbol: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const WAQAF_QUIZ_QUESTIONS: WaqafQuizQuestion[] = [
  {
    id: 1,
    question: 'Apa arti hukum dari tanda waqaf "مـ" (Waqaf Lazim)?',
    symbol: 'مـ',
    options: ['Boleh berhenti atau lanjut', 'Wajib berhenti', 'Dilarang berhenti', 'Lebih utama lanjut'],
    correctIndex: 1,
    explanation: 'Tanda "مـ" adalah Waqaf Lazim yang mewajibkan pembaca untuk berhenti agar tidak merubah makna ayat.',
  },
  {
    id: 2,
    question: 'Jika menemukan tanda titik tiga kembar (∴ ... ∴ / Waqaf Mu\'anaqah), bagaimana kaidah membacanya?',
    symbol: '∴ ... ∴',
    options: [
      'Berhenti di kedua-duanya',
      'Tidak boleh berhenti di kedua-duanya',
      'Berhenti di salah satu tanda saja',
      'Berhenti sejenak tanpa bernapas',
    ],
    correctIndex: 2,
    explanation: 'Pada Waqaf Mu\'anaqah, pembaca wajib berhenti di salah satu tanda saja, tidak boleh di keduanya atau mengabaikan keduanya.',
  },
  {
    id: 3,
    question: 'Apa yang harus dilakukan pembaca saat menemui tanda "لا" di tengah kalimat?',
    symbol: 'لا',
    options: ['Dilarang berhenti, harus lanjut', 'Wajib berhenti mengambil napas', 'Berhenti sejenak 2 harakat', 'Sujud tilawah'],
    correctIndex: 0,
    explanation: 'Tanda "لا" (Waqaf Mamnu\') melarang pembaca berhenti di tengah kalimat yang maknanya belum selesai.',
  },
  {
    id: 4,
    question: 'Cara membaca "Saktah" (س) adalah:',
    symbol: 'س',
    options: [
      'Berhenti lama dan menarik napas dalam',
      'Berhenti sejenak (kira-kira 2 harakat) tanpa mengambil napas',
      'Membaca cepat bersambung',
      'Mendengung 3 harakat',
    ],
    correctIndex: 1,
    explanation: 'Saktah adalah menahan suara selama 2 harakat tanpa mengambil napas baru sebelum melanjutkan bacaan.',
  },
  {
    id: 5,
    question: 'Tanda waqaf "قلى" (Al-Waqfu Aula) memiliki hukum:',
    symbol: 'قلى',
    options: ['Lebih utama berhenti', 'Lebih utama lanjut', 'Dilarang berhenti', 'Wajib sujud'],
    correctIndex: 0,
    explanation: '"قلى" singkatan dari Al-Waqfu Aula, yang berarti berhenti lebih utama daripada menyambung bacaan.',
  },
];

/**
 * Mapping Unicode Quranic Waqaf Characters (Uthmani Hafs & Indopak)
 * \u06D6: صلى (Al-Washl Aula)
 * \u06D7: قلى (Al-Waqf Aula)
 * \u06D8: مـ (Lazim)
 * \u06D9: لا (Mamnu')
 * \u06DA: ج (Ja'iz)
 * \u06DB: ∴ (Mu'anaqah)
 * \u06DC: س (Saktah)
 * \u06E2: مـ (Small high meem isolated)
 */
export const WAQAF_CHAR_MAP: Record<string, string> = {
  '\u06D6': 'washl-aula', // ۖ
  '\u06D7': 'waqf-aula',  // ۗ
  '\u06D8': 'lazim',       // ۘ
  '\u06D9': 'mamnu',       // ۙ
  '\u06DA': 'jaiz',        // ۚ
  '\u06DB': 'muanaqah',    // ۛ
  '\u06DC': 'saktah',      // ۜ
};

export const WAQAF_REGEX = /([\u200C\u200D]?[\u06D6-\u06DC])/g;

export const getWaqafItemById = (id: string): WaqafItem | undefined => {
  return WAQAF_DATA.find((w) => w.id === id);
};

export const getWaqafItemByChar = (char: string): WaqafItem | undefined => {
  if (!char) return undefined;
  const cleanChar = char.replace(/[\u200C\u200D\s]/g, '');
  if (!cleanChar) return undefined;

  // 1. Exact match in canonical Quranic waqaf unicode character map (ۖ ۗ ۘ ۙ ۚ ۛ ۜ)
  const id = WAQAF_CHAR_MAP[cleanChar] || WAQAF_CHAR_MAP[char];
  if (id) return getWaqafItemById(id);

  // 2. Exact match by Waqaf Item ID (e.g. 'lazim', 'mamnu', 'jaiz')
  return getWaqafItemById(cleanChar);
};

export const detectWaqafInText = (text: string): { waqaf: WaqafItem; char: string }[] => {
  if (!text) return [];
  const results: { waqaf: WaqafItem; char: string }[] = [];
  const seenIds = new Set<string>();

  const matches = text.match(WAQAF_REGEX);
  if (matches) {
    for (const rawChar of matches) {
      const cleanChar = rawChar.replace(/[\u200C\u200D\s]/g, '');
      const waqafId = WAQAF_CHAR_MAP[cleanChar] || WAQAF_CHAR_MAP[rawChar];
      if (waqafId && !seenIds.has(waqafId)) {
        const item = getWaqafItemById(waqafId);
        if (item) {
          seenIds.add(waqafId);
          results.push({ waqaf: item, char: cleanChar || rawChar });
        }
      }
    }
  }

  return results;
};

