export interface FeaturedSurah {
  id: number;
  number: number;
  name: string;
  transliteration: string;
  translation: string;
  totalVerses: number;
  revelation: 'Makkah' | 'Madinah';
  fadhilahTitle: string;
  fadhilahDesc: string;
  fadhilahDescEn: string;
  recommendedTime: string;
  recommendedTimeEn: string;
  hadithReference: string;
  category: 'daily' | 'friday' | 'night' | 'protection' | 'comfort';
}

export const FEATURED_SURAHS: FeaturedSurah[] = [
  {
    id: 18,
    number: 18,
    name: 'الكهف',
    transliteration: 'Al-Kahf',
    translation: 'Gua',
    totalVerses: 110,
    revelation: 'Makkah',
    fadhilahTitle: 'Pelindung dari Fitnah Dajjal & Cahaya di Hari Jumat',
    fadhilahDesc: 'Membaca surat Al-Kahf pada hari Jumat akan memancarkan cahaya baginya di antara dua Jumat dan melindunginya dari fitnah Dajjal.',
    fadhilahDescEn: 'Whoever recites Surah Al-Kahf on Friday will have a light that shines between the two Fridays and protects from the trial of Dajjal.',
    recommendedTime: 'Malam & Hari Jumat',
    recommendedTimeEn: 'Thursday evening & Friday',
    hadithReference: 'HR. Al-Hakim (2/368) & HR. Muslim (809)',
    category: 'friday'
  },
  {
    id: 67,
    number: 67,
    name: 'الملك',
    transliteration: 'Al-Mulk',
    translation: 'Kerajaan',
    totalVerses: 30,
    revelation: 'Makkah',
    fadhilahTitle: 'Penyelamat & Pembela dari Siksa Kubur',
    fadhilahDesc: 'Surat ini memberikan syafaat bagi pembacanya hingga diampuni dosa-dosanya serta menjadi benteng dari azab kubur.',
    fadhilahDescEn: 'Reciting Surah Al-Mulk every night serves as a protective shield against the punishment of the grave.',
    recommendedTime: 'Setiap Malam Sebelum Tidur',
    recommendedTimeEn: 'Every Night Before Sleeping',
    hadithReference: 'HR. At-Tirmidzi (2891) & HR. An-Nasa\'i (Al-Kubra 10547)',
    category: 'night'
  },
  {
    id: 36,
    number: 36,
    name: 'يس',
    transliteration: 'Yasin',
    translation: 'Yasin',
    totalVerses: 83,
    revelation: 'Makkah',
    fadhilahTitle: 'Qalbul Quran (Jantung Al-Quran)',
    fadhilahDesc: 'Surat yang menegaskan kebenaran risalah Nabi, kebangkitan setelah mati, serta menjadi penenteram jiwa di saat mengharap ampunan Allah.',
    fadhilahDescEn: 'Known as the Heart of the Quran, emphasizing the truth of prophethood, resurrection, and divine mercy.',
    recommendedTime: 'Pagi & Malam Hari / Saat Memohon Kemudahan',
    recommendedTimeEn: 'Morning & Evening / Seeking Ease',
    hadithReference: 'HR. At-Tirmidzi (2887) & HR. Ad-Darimi',
    category: 'daily'
  },
  {
    id: 56,
    number: 56,
    name: 'الواقعة',
    transliteration: 'Al-Waqi\'ah',
    translation: 'Hari Kiamat',
    totalVerses: 96,
    revelation: 'Makkah',
    fadhilahTitle: 'Pengingat Akhirat & Keberkahan Rezeki',
    fadhilahDesc: 'Mengingatkan pembagian manusia di hari kiamat dan mentadaburi nikmat penciptaan untuk menghindarkan dari kelalaian dan kefakiran.',
    fadhilahDescEn: 'Reflecting on the certainty of the Day of Judgment and invoking divine sustenance and barakah.',
    recommendedTime: 'Malam Hari / Sore Hari',
    recommendedTimeEn: 'Evening & Night',
    hadithReference: 'Atsar Sahabat Abdullah bin Mas\'ud r.a.',
    category: 'night'
  },
  {
    id: 55,
    number: 55,
    name: 'الرحمن',
    transliteration: 'Ar-Rahman',
    translation: 'Yang Maha Pemurah',
    totalVerses: 78,
    revelation: 'Madinah',
    fadhilahTitle: 'Arusul Quran (Pengantin Al-Quran)',
    fadhilahDesc: 'Pengingat limpahan nikmat Allah yang tiada tara dengan pengulangan "Maka nikmat Tuhanmu yang manakah yang kamu dustakan?" sebanyak 31 kali.',
    fadhilahDescEn: 'The Bride of the Quran, celebrating the boundless mercy and blessings bestowed upon creation.',
    recommendedTime: 'Waktu Tadabbur & Bersyukur',
    recommendedTimeEn: 'Times of Reflection & Gratitude',
    hadithReference: 'HR. Al-Baihaqi dalam Syu\'abul Iman',
    category: 'daily'
  },
  {
    id: 2,
    number: 2,
    name: 'البقرة',
    transliteration: 'Al-Baqarah',
    translation: 'Sapi Betina',
    totalVerses: 286,
    revelation: 'Madinah',
    fadhilahTitle: 'Puncak Al-Quran, Pengusir Setan & Ayat Kursi',
    fadhilahDesc: 'Rumah yang dibacakan surat Al-Baqarah tidak akan dimasuki setan. Memuat ayat paling agung (Ayat Kursi: 255) dan dua ayat terakhir penutup.',
    fadhilahDescEn: 'The pinnacle of the Quran; expels demons from homes and contains the greatest verse (Ayat al-Kursi) and the blessed closing verses.',
    recommendedTime: 'Rutin di Rumah / Menjelang Tidur (2 Ayat Terakhir)',
    recommendedTimeEn: 'In Homes Regularly / Before Sleep (Last 2 Verses)',
    hadithReference: 'HR. Muslim (780) & HR. Al-Bukhari (5008)',
    category: 'protection'
  },
  {
    id: 32,
    number: 32,
    name: 'السجدة',
    transliteration: 'As-Sajdah',
    translation: 'Sujud',
    totalVerses: 30,
    revelation: 'Makkah',
    fadhilahTitle: 'Sunnah Subuh Jumat & Sebelum Tidur',
    fadhilahDesc: 'Rasulullah SAW senantiasa membaca surat ini pada rakaat pertama salat Subuh di hari Jumat dan tidak tidur sebelum membacanya bersama Al-Mulk.',
    fadhilahDescEn: 'The Prophet (PBUH) recited this surah in the first rak\'ah of Fajr prayer on Fridays and before sleeping.',
    recommendedTime: 'Subuh Hari Jumat & Sebelum Tidur',
    recommendedTimeEn: 'Friday Fajr & Night Before Sleeping',
    hadithReference: 'HR. Al-Bukhari (891) & HR. At-Tirmidzi (2892)',
    category: 'friday'
  },
  {
    id: 94,
    number: 94,
    name: 'الشرح',
    transliteration: 'Asy-Syarh (Al-Insyirah)',
    translation: 'Kelapangan',
    totalVerses: 8,
    revelation: 'Makkah',
    fadhilahTitle: 'Pelipur Kesempitan & Penguat Harapan',
    fadhilahDesc: 'Kabar gembira bahwa sesungguhnya bersama setiap kesulitan niscaya ada kemudahan, menenangkan dada yang sesak dan memulihkan semangat.',
    fadhilahDescEn: 'Divine assurance that with every hardship comes ease, bringing serenity to a distressed heart.',
    recommendedTime: 'Saat Cemas, Sedih, atau Mengalami Ujian',
    recommendedTimeEn: 'During Anxiety, Hardship, or Weariness',
    hadithReference: 'Tadabbur Ayat: "Fa inna ma\'al \'usri yusra"',
    category: 'comfort'
  },
  {
    id: 112,
    number: 112,
    name: 'الإخلاص',
    transliteration: 'Al-Ikhlas',
    translation: 'Ikhlas',
    totalVerses: 4,
    revelation: 'Makkah',
    fadhilahTitle: 'Sebanding Sepertiga Al-Quran',
    fadhilahDesc: 'Menegaskan keesaan mutlak Allah SWT. Membacanya setara dengan membaca sepertiga kandungan Al-Quran.',
    fadhilahDescEn: 'Equivalent to one-third of the Quran in reward, declaring the pure oneness of Allah.',
    recommendedTime: 'Setiap Selesai Salat, Pagi & Petang, Sebelum Tidur',
    recommendedTimeEn: 'After Prayers, Morning & Evening, Before Sleeping',
    hadithReference: 'HR. Al-Bukhari (5015)',
    category: 'protection'
  },
  {
    id: 113,
    number: 113,
    name: 'الفلق',
    transliteration: 'Al-Falaq',
    translation: 'Waktu Subuh',
    totalVerses: 5,
    revelation: 'Makkah',
    fadhilahTitle: 'Benteng dari Kejahatan Makhluk & Hasad',
    fadhilahDesc: 'Surat perlindungan utama dari kejahatan malam, sihir, dan kedengkian orang yang hasad.',
    fadhilahDescEn: 'Essential protection against the darkness of night, occult practices, and the evil eye of the envious.',
    recommendedTime: '3x Pagi & Petang, Selesai Salat, Sebelum Tidur',
    recommendedTimeEn: '3x Morning & Evening, After Prayers, Before Sleep',
    hadithReference: 'HR. Abu Dawud (5082) & HR. At-Tirmidzi (3575)',
    category: 'protection'
  },
  {
    id: 114,
    number: 114,
    name: 'الناس',
    transliteration: 'An-Nas',
    translation: 'Manusia',
    totalVerses: 6,
    revelation: 'Makkah',
    fadhilahTitle: 'Perlindungan dari Bisikan Setan & Was-was',
    fadhilahDesc: 'Memohon perlindungan kepada Rabb, Raja, dan Sesembahan manusia dari bisikan jahat setan yang tersembunyi.',
    fadhilahDescEn: 'Seeking refuge in the Lord of humanity from the whispers of evil spirits and doubts.',
    recommendedTime: '3x Pagi & Petang, Selesai Salat, Sebelum Tidur',
    recommendedTimeEn: '3x Morning & Evening, After Prayers, Before Sleep',
    hadithReference: 'HR. Abu Dawud (5082) & HR. At-Tirmidzi (3575)',
    category: 'protection'
  }
];
