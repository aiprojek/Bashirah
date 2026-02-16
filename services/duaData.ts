
import { QuranDua } from '../types';

export const DUAS: QuranDua[] = [
  {
    id: 'd1',
    title: 'Doa Sapu Jagat (Kebaikan Dunia Akhirat)',
    category: 'rabbana',
    surahId: 2,
    surahName: 'Al-Baqarah',
    verseId: 201,
    arabic: 'رَبَّنَآ ءَاتِنَا فِي ٱلدُّنۡيَا حَسَنَةٗ وَفِي ٱلۡأٓخِرَةِ حَسَنَةٗ وَقِنَا عَذَابَ ٱلنَّارِ',
    translation: 'Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat dan peliharalah kami dari siksa neraka.'
  },
  {
    id: 'd2',
    title: 'Doa Memohon Kesabaran',
    category: 'rabbana',
    surahId: 2,
    surahName: 'Al-Baqarah',
    verseId: 250,
    arabic: 'رَبَّنَآ أَفۡرِغۡ عَلَيۡنَا صَبۡرٗا وَثَبِّتۡ أَقۡدَامَنَا وَٱنصُرۡنَا عَلَى ٱلۡقَوۡمِ ٱلۡكَٰفِرِينَ',
    translation: 'Ya Tuhan kami, tuangkanlah kesabaran atas diri kami, dan kokohkanlah pendirian kami dan tolonglah kami terhadap orang-orang kafir.'
  },
  {
    id: 'd3',
    title: 'Doa Agar Tidak Pikun / Lupa',
    category: 'rabbana',
    surahId: 2,
    surahName: 'Al-Baqarah',
    verseId: 286,
    arabic: 'رَبَّنَا لَا تُؤَاخِذۡنَآ إِن نَّسِينَآ أَوۡ أَخۡطَأۡنَا',
    translation: 'Ya Tuhan kami, janganlah Engkau hukum kami jika kami lupa atau kami tersalah.'
  },
  {
    id: 'd4',
    title: 'Doa Keteguhan Hati',
    category: 'rabbana',
    surahId: 3,
    surahName: 'Ali Imran',
    verseId: 8,
    arabic: 'رَبَّنَا لَا تُزِغۡ قُلُوبَنَا بَعۡدَ إِذۡ هَدَيۡتَنَا وَهَبۡ لَنَا مِن لَّدُنكَ رَحۡمَةًۚ إِنَّكَ أَنتَ ٱلۡوَهَّابُ',
    translation: 'Ya Tuhan kami, janganlah Engkau jadikan hati kami condong kepada kesesatan sesudah Engkau beri petunjuk kepada kami, dan karuniakanlah kepada kami rahmat dari sisi-Mu; karena sesungguhnya Engkau-lah Maha Pemberi (karunia).'
  },
  {
    id: 'd5',
    title: 'Doa Nabi Ibrahim (Agar Sholat & Diterima Doa)',
    category: 'rabbi',
    surahId: 14,
    surahName: 'Ibrahim',
    verseId: 40,
    arabic: 'رَبِّ ٱجۡعَلۡنِي مُقِيمَ ٱلصَّلَوٰةِ وَمِن ذُرِّيَّتِيۚ رَبَّنَا وَتَقَبَّلۡ دُعَآءِ',
    translation: 'Ya Tuhanku, jadikanlah aku dan anak cucuku orang-orang yang tetap mendirikan shalat, ya Tuhan kami, perkenankanlah doaku.'
  },
  {
    id: 'd6',
    title: 'Doa Pengampunan Orang Tua',
    category: 'rabbana',
    surahId: 14,
    surahName: 'Ibrahim',
    verseId: 41,
    arabic: 'رَبَّنَا ٱغۡفِرۡ لِي وَلِوَٰلِدَيَّ وَلِلۡمُؤۡمِنِينَ يَوۡمَ يَقُومُ ٱلۡحِسَابُ',
    translation: 'Ya Tuhan kami, beri ampunlah aku dan kedua ibu bapaku dan sekalian orang-orang mukmin pada hari terjadinya hisab (hari kiamat).'
  },
  {
    id: 'd7',
    title: 'Doa Nabi Musa (Kelapangan Dada)',
    category: 'rabbi',
    surahId: 20,
    surahName: 'Taha',
    verseId: 25,
    arabic: 'رَبِّ ٱشۡرَحۡ لِي صَدۡرِي وَيَسِّرۡ لِيٓ أَمۡرِي',
    translation: 'Ya Tuhanku, lapangkanlah untukku dadaku, dan mudahkanlah untukku urusanku.'
  },
  {
    id: 'd8',
    title: 'Doa Tambahan Ilmu',
    category: 'rabbi',
    surahId: 20,
    surahName: 'Taha',
    verseId: 114,
    arabic: 'رَّبِّ زِدۡنِي عِلۡمٗا',
    translation: 'Ya Tuhanku, tambahkanlah kepadaku ilmu pengetahuan.'
  },
  {
    id: 'd9',
    title: 'Doa Nabi Yunus (Kesulitan Hidup)',
    category: 'rabbi', // Exception: Starts with La ilaha illa anta... but implies Ya Rabb
    surahId: 21,
    surahName: 'Al-Anbiya',
    verseId: 87,
    arabic: 'لَّآ إِلَٰهَ إِلَّآ أَنتَ سُبۡحَٰنَكَ إِنِّي كُنتُ مِنَ ٱلظَّـٰلِمِينَ',
    translation: 'Tidak ada Tuhan selain Engkau. Maha Suci Engkau, sesungguhnya aku adalah termasuk orang-orang yang zalim.'
  },
  {
    id: 'd10',
    title: 'Doa Memohon Pasangan & Keturunan',
    category: 'rabbana',
    surahId: 25,
    surahName: 'Al-Furqan',
    verseId: 74,
    arabic: 'رَبَّنَا هَبۡ لَنَا مِنۡ أَزۡوَٰجِنَا وَذُرِّيَّـٰتِنَا قُرَّةَ أَعۡيُنٖ وَٱجۡعَلۡنَا لِلۡمُتَّقِينَ إِمَامًا',
    translation: 'Ya Tuhan kami, anugrahkanlah kepada kami isteri-isteri kami dan keturunan kami sebagai penyenang hati (kami), dan jadikanlah kami imam bagi orang-orang yang bertakwa.'
  },
  {
    id: 'd11',
    title: 'Doa Mensyukuri Nikmat',
    category: 'rabbi',
    surahId: 46,
    surahName: 'Al-Ahqaf',
    verseId: 15,
    arabic: 'رَبِّ أَوۡزِعۡنِيٓ أَنۡ أَشۡكُرَ نِعۡمَتَكَ ٱلَّتِيٓ أَنۡعَمۡتَ عَلَيَّ وَعَلَىٰ وَٰلِدَيَّ وَأَنۡ أَعۡمَلَ صَٰلِحٗا تَرۡضَىٰهُ وَأَصۡلِحۡ لِي فِي ذُرِّيَّتِيٓۖ إِنِّي تُبۡتُ إِلَيۡكَ وَإِنِّي مِنَ ٱلۡمُسۡلِمِينَ',
    translation: 'Ya Tuhanku, tunjukilah aku untuk mensyukuri nikmat Engkau yang telah Engkau berikan kepadaku dan kepada ibu bapakku dan supaya aku dapat berbuat amal yang saleh yang Engkau ridhai.'
  },
  {
    id: 'd12',
    title: 'Doa Nabi Ayyub (Kesembuhan)',
    category: 'rabbi',
    surahId: 21,
    surahName: 'Al-Anbiya',
    verseId: 83,
    arabic: 'أَنِّي مَسَّنِيَ ٱلضُّرُّ وَأَنتَ أَرۡحَمُ ٱلرَّـٰحِمِينَ',
    translation: '(Ya Tuhanku), sesungguhnya aku telah ditimpa penyakit dan Engkau adalah Tuhan Yang Maha Penyayang di antara semua penyayang.'
  }
];
