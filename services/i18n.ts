
import { LanguageCode } from "../types";

type TranslationKey = 
  // Navigation & General
  | 'nav_home' | 'nav_topics' | 'nav_tajweed' | 'nav_names' | 'nav_feelings' 
  | 'nav_quiz' | 'nav_tadabbur' | 'nav_dua' | 'nav_library' | 'nav_settings' 
  | 'nav_about' | 'app_title' | 'app_subtitle'
  // Home
  | 'home_greeting' | 'home_subtitle' | 'search_placeholder' | 'daily_verse'
  | 'last_read' | 'khatam_target' | 'tab_surah' | 'tab_juz' | 'tab_page'
  | 'no_surah_found'
  // Settings
  | 'settings_theme' | 'settings_theme_dark' | 'settings_theme_light'
  | 'settings_lang' | 'settings_data' | 'settings_backup' | 'settings_restore'
  | 'settings_ui' | 'settings_tajweed' | 'settings_tajweed_desc' | 'settings_tajweed_downloaded'
  | 'settings_mushaf' | 'settings_audio' | 'settings_reciter'
  | 'settings_trans' | 'settings_tafsir' | 'download_manager' | 'download_all'
  | 'settings_daily_notif' | 'settings_wbw' | 'settings_mushaf_type' 
  | 'settings_mushaf_download_title' | 'settings_mushaf_download_desc'
  | 'settings_mushaf_delete_title' | 'settings_mushaf_delete_desc'
  | 'settings_audio_download_title' | 'settings_audio_download_desc'
  | 'settings_audio_delete_title' | 'settings_audio_delete_desc'
  | 'settings_audio_download_all_title' | 'settings_audio_download_all_desc'
  | 'settings_tajweed_download_title' | 'settings_tajweed_download_desc'
  | 'settings_tajweed_delete_title' | 'settings_tajweed_delete_desc'
  | 'settings_data_download_title' | 'settings_data_download_desc'
  | 'settings_data_unavailable' | 'settings_restore_confirm_title' | 'settings_restore_confirm_desc'
  | 'settings_restore_success'
  // Khatam Widget
  | 'khatam_start_title' | 'khatam_start_desc' | 'khatam_label_days'
  | 'khatam_btn_start' | 'khatam_btn_create' | 'khatam_btn_update_manual'
  | 'khatam_progress_title' | 'khatam_progress_subtitle' | 'khatam_daily_target'
  | 'khatam_remaining_days' | 'khatam_remaining_pages' | 'khatam_update_modal_title'
  | 'khatam_manual_page_input' | 'khatam_tips_title'
  | 'khatam_est_completion' | 'khatam_speed' | 'khatam_days_active'
  | 'khatam_cel_congrats' | 'khatam_cel_subtitle' | 'khatam_cel_name_label'
  | 'khatam_cel_doa' | 'khatam_cel_btn_share' | 'khatam_cel_stats_avg'
  | 'stats_less' | 'stats_more' | 'khatam_streak' | 'khatam_activity_7days'
  // Tadabbur
  | 'tadabbur_title' | 'tadabbur_desc' | 'tadabbur_empty' | 'tadabbur_btn_write'
  | 'tadabbur_edit_title' | 'tadabbur_new_title' | 'tadabbur_placeholder_title'
  | 'tadabbur_placeholder_content' | 'tag_gratitude' | 'tag_patience' | 'tag_forgiveness'
  | 'tag_prayer' | 'tag_lesson' | 'tag_general'
  // Quiz
  | 'quiz_title' | 'quiz_desc' | 'quiz_input_name' | 'quiz_btn_start' 
  | 'quiz_leaderboard' | 'quiz_score' | 'quiz_question' | 'quiz_msg_excellent'
  | 'quiz_msg_good' | 'quiz_msg_keep_learning' | 'quiz_btn_play_again' | 'quiz_btn_home'
  // Stats
  | 'stats_title' | 'stats_less' | 'stats_more' | 'stats_total_read' | 'stats_active_days'
  // About
  | 'about_tab_about' | 'about_tab_features' | 'about_tab_guide' | 'about_tab_contact'
  | 'about_desc' | 'about_license_title' | 'about_license_text' | 'about_data_source' | 'about_created_by'
  | 'about_contact_title' | 'about_contact_desc' | 'about_btn_email' | 'about_or_manual'
  | 'about_coffee' | 'about_download_app' | 'about_source_title' | 'about_source_quran' | 'about_source_api' 
  | 'about_form_subject' | 'about_form_message'
  | 'about_form_placeholder_subject' | 'about_form_placeholder_message'
  // Features List
  | 'feature_mushaf_title' | 'feature_mushaf_desc'
  | 'feature_tajweed_title' | 'feature_tajweed_desc'
  | 'feature_audio_title' | 'feature_audio_desc'
  | 'feature_trans_title' | 'feature_trans_desc'
  | 'feature_wbw_title' | 'feature_wbw_desc'
  | 'feature_tadabbur_title' | 'feature_tadabbur_desc'
  | 'feature_feelings_title' | 'feature_feelings_desc'
  | 'feature_topics_title' | 'feature_topics_desc'
  | 'feature_quiz_title' | 'feature_quiz_desc'
  | 'feature_names_title' | 'feature_names_desc'
  | 'feature_khatam_title' | 'feature_khatam_desc'
  | 'feature_pwa_title' | 'feature_pwa_desc'
  | 'feature_dark_title' | 'feature_dark_desc'
  | 'feature_search_title' | 'feature_search_desc'
  // Loading & Nav
  | 'loading_title' | 'loading_desc'
  | 'prev_surah' | 'next_surah'
  // Pages Titles & Descs
  | 'topics_title' | 'topics_desc' | 'topics_ref' | 'topics_collection'
  | 'names_title' | 'names_desc' | 'names_search' | 'names_empty' | 'names_listen' | 'names_playing' | 'names_dalil_title' | 'names_dalil_empty'
  | 'tajweed_title' | 'tajweed_desc' | 'tajweed_rules' | 'tajweed_def' | 'tajweed_how' | 'tajweed_example' | 'tajweed_close'
  | 'feelings_title' | 'feelings_desc' | 'feelings_view' | 'feelings_select'
  | 'dua_title' | 'dua_desc' | 'dua_all' | 'dua_rabbana' | 'dua_rabbi' | 'dua_copy' | 'dua_empty'
  | 'lib_bookmarks' | 'lib_notes' | 'lib_empty_bk' | 'lib_empty_note' | 'lib_start_read' | 'lib_verse' | 'lib_created' | 'lib_view_verse' | 'lib_delete_bk_title' | 'lib_delete_bk_msg' | 'lib_delete_note_title' | 'lib_delete_note_msg'
  // Common Actions
  | 'btn_download' | 'btn_delete' | 'btn_change' | 'btn_save' | 'btn_cancel'
  | 'btn_close' | 'btn_open' | 'btn_use' | 'btn_active' | 'btn_share' | 'btn_copy'
  | 'loading' | 'error' | 'success' | 'copied' | 'version'
  // DYNAMIC DATA KEYS (Topics, Emotions, Tajweed, Dua)
  | string;

const translations: Record<LanguageCode, Record<string, string>> = {
  id: {
    nav_home: "Beranda",
    nav_topics: "Indeks Topik",
    nav_tajweed: "Belajar Tajwid",
    nav_names: "Asmaul Husna",
    nav_feelings: "Ayat Pelipur Lara",
    nav_quiz: "Kuis & Trivia",
    nav_tadabbur: "Jurnal Tadabbur",
    nav_dua: "Koleksi Doa",
    nav_library: "Pustaka Saya",
    nav_settings: "Pengaturan",
    nav_about: "Tentang Aplikasi",
    app_title: "Bashirah",
    app_subtitle: "Al-Quran Digital",

    home_greeting: "Baca & Pelajari Al-Quran",
    home_subtitle: "Temukan kedamaian dalam setiap ayat suci-Nya.",
    search_placeholder: "Cari surat atau ayat...",
    daily_verse: "Ayat Harian",
    last_read: "Terakhir Dibaca",
    khatam_target: "Target Khatam",
    tab_surah: "Surat",
    tab_juz: "Juz",
    tab_page: "Halaman",
    no_surah_found: "Tidak ada surat yang ditemukan.",

    settings_theme: "Tema Aplikasi",
    settings_theme_dark: "Mode Gelap",
    settings_theme_light: "Mode Terang",
    settings_lang: "Bahasa Aplikasi",
    settings_data: "Manajemen Data",
    settings_backup: "Backup Data",
    settings_restore: "Restore Data",
    settings_ui: "Antarmuka",
    settings_tajweed: "Tampilan Tajwid (Warna)",
    settings_tajweed_desc: "Unduh data untuk mewarnai tajwid secara offline.",
    settings_tajweed_downloaded: "Data Tajwid telah diunduh. Aktifkan untuk mewarnai ayat.",
    settings_mushaf: "Tampilan Mushaf",
    settings_audio: "Audio & Murottal",
    settings_reciter: "Pilih Qari",
    settings_trans: "Terjemahan",
    settings_tafsir: "Tafsir",
    download_manager: "Manajer Unduhan",
    download_all: "Unduh Semua (30 Juz)",
    settings_daily_notif: "Notifikasi Ayat Harian",
    settings_wbw: "Terjemahan Perkata",
    settings_mushaf_type: "Jenis",
    settings_mushaf_download_title: "Unduh Mushaf?",
    settings_mushaf_download_desc: "Ukuran file sekitar 200MB - 300MB. Pastikan Anda terhubung ke WiFi untuk menghemat kuota data.",
    settings_mushaf_delete_title: "Hapus Data Mushaf?",
    settings_mushaf_delete_desc: "Anda akan menghapus data offline untuk Mushaf ini.",
    settings_audio_download_title: "Unduh Audio Surat?",
    settings_audio_download_desc: "Anda akan mengunduh audio surat ini.",
    settings_audio_delete_title: "Hapus Audio?",
    settings_audio_delete_desc: "Audio surat ini akan dihapus dari penyimpanan.",
    settings_audio_download_all_title: "Unduh Audio 30 Juz?",
    settings_audio_download_all_desc: "PERINGATAN: Mengunduh seluruh Al-Quran membutuhkan ruang penyimpanan sangat besar.",
    settings_tajweed_download_title: "Unduh Data Tajwid?",
    settings_tajweed_download_desc: "Data ini diperlukan untuk menampilkan fitur Tajwid Berwarna secara offline.",
    settings_tajweed_delete_title: "Hapus Data Tajwid?",
    settings_tajweed_delete_desc: "Fitur Tajwid Berwarna tidak akan bisa digunakan lagi sampai Anda mengunduhnya kembali.",
    settings_data_download_title: "Unduh Data?",
    settings_data_download_desc: "Anda akan mengunduh data ini untuk penggunaan offline.",
    settings_data_unavailable: "Maaf, edisi ini saat ini tidak dapat diakses dari server.",
    settings_restore_confirm_title: "Restore Data?",
    settings_restore_confirm_desc: "Proses ini akan menimpa/menggabungkan data Bookmark, Catatan, dan Jurnal Tadabbur Anda dengan data dari file backup. Lanjutkan?",
    settings_restore_success: "Data berhasil dipulihkan! Aplikasi akan dimuat ulang.",

    khatam_start_title: "Mulai Target Khatam",
    khatam_start_desc: "Bangun kebiasaan membaca Al-Quran setiap hari. Tetapkan target harimu dan pantau progresmu.",
    khatam_label_days: "Target (Hari)",
    khatam_btn_start: "Simpan Target",
    khatam_btn_create: "Buat Target",
    khatam_btn_update_manual: "Update Manual",
    khatam_progress_title: "Update Progres Manual",
    khatam_progress_subtitle: "Halaman Sekarang",
    khatam_daily_target: "Target Harian",
    khatam_remaining_days: "hari lagi",
    khatam_remaining_pages: "Sisa halaman menuju khatam",
    khatam_update_modal_title: "Update Khatam?",
    khatam_manual_page_input: "Halaman ke-",
    khatam_tips_title: "Tips Update Progres",
    khatam_est_completion: "Estimasi Selesai",
    khatam_speed: "Kecepatan Baca",
    khatam_days_active: "Hari Aktif",
    khatam_cel_congrats: "Selamat! Telah Khatam Al-Quran",
    khatam_cel_subtitle: "Khatm al-Qur'an al-Karim",
    khatam_cel_name_label: "Diberikan kepada:",
    khatam_cel_doa: "اللَّهُمَّ ارْحَمْنِي بِالْقُرْآنِ، وَاجْعَلْهُ لِي إِمَامًا وَنُورًا وَهُدًى وَرَحْمَةً",
    khatam_cel_btn_share: "Bagikan Keberkahan",
    khatam_cel_stats_avg: "Rata-rata Halaman/Hari",

    tadabbur_title: "Jurnal Tadabbur",
    tadabbur_desc: "\"Ikatlah ilmu dengan tulisan. Renungkan ayat-Nya, dan abadikan hikmah yang menyentuh hatimu.\"",
    tadabbur_empty: "Belum ada catatan tadabbur.",
    tadabbur_btn_write: "Mulai Menulis",
    tadabbur_edit_title: "Edit Jurnal",
    tadabbur_new_title: "Tulis Jurnal Baru",
    tadabbur_placeholder_title: "Judul Renungan...",
    tadabbur_placeholder_content: "Tuliskan apa yang Anda rasakan, pelajari, atau syukuri hari ini...",
    tag_gratitude: "Syukur",
    tag_patience: "Sabar",
    tag_forgiveness: "Istighfar",
    tag_prayer: "Doa",
    tag_lesson: "Pelajaran",
    tag_general: "Umum",

    quiz_title: "Kuis Al-Quran",
    quiz_desc: "Uji wawasanmu tentang nama-nama surat, arti, dan jumlah ayat.",
    quiz_input_name: "Masukkan Nama Anda",
    quiz_btn_start: "Mulai Main",
    quiz_leaderboard: "Papan Skor",
    quiz_score: "Skor",
    quiz_question: "Soal",
    quiz_msg_excellent: "MasyaAllah, Luar Biasa!",
    quiz_msg_good: "Bagus, Tingkatkan Lagi!",
    quiz_msg_keep_learning: "Teruslah Belajar!",
    quiz_btn_play_again: "Main Lagi",
    quiz_btn_home: "Kembali ke Beranda",

    stats_title: "Statistik Ibadah",
    stats_less: "Sedikit",
    stats_more: "Banyak",
    khatam_streak: "Hari Berturut-turut",
    khatam_activity_7days: "Aktivitas 7 Hari",
    stats_total_read: "Total Dibaca",
    stats_active_days: "Hari Aktif",

    about_tab_about: "Tentang",
    about_tab_features: "Fitur",
    about_tab_guide: "Panduan",
    about_tab_contact: "Pesan",
    about_desc: "\"Membawa cahaya Al-Quran ke dalam genggaman, dengan desain yang menenangkan jiwa dan fitur yang memudahkan tadabbur.\"",
    about_license_title: "Lisensi Open Source",
    about_license_text: "Aplikasi ini adalah perangkat lunak bebas yang dilisensikan di bawah",
    about_data_source: "Sumber Data",
    about_created_by: "Dibuat dengan ❤️ oleh",
    about_contact_title: "Hubungi Kami",
    about_contact_desc: "Punya saran, kritik, atau menemukan bug? Kirimkan pesan langsung kepada pengembang.",
    about_btn_email: "Kirim via Email",
    about_or_manual: "Atau hubungi via email manual:",
    about_coffee: "Traktir Kopi",
    about_download_app: "Unduh Aplikasi (Android/PC)",
    about_source_title: "Sumber Data",
    about_source_quran: "Data Al-Quran berasal dari",
    about_source_api: "API Ayat, Terjemahan & Audio dari",
    about_form_subject: "Subjek",
    about_form_message: "Pesan",
    about_form_placeholder_subject: "Contoh: Saran Fitur Baru",
    about_form_placeholder_message: "Tulis pesan Anda di sini...",

    feature_mushaf_title: "Mode Mushaf & List", feature_mushaf_desc: "Nikmati pengalaman membaca seperti Mushaf cetak atau mode daftar ayat yang fleksibel.",
    feature_tajweed_title: "Tajwid Berwarna", feature_tajweed_desc: "Bantu membaca dengan hukum tajwid yang ditandai warna.",
    feature_audio_title: "Audio Murottal", feature_audio_desc: "Dengarkan lantunan ayat dari berbagai Qari ternama dunia (streaming/download).",
    feature_trans_title: "Terjemahan & Tafsir", feature_trans_desc: "Dilengkapi terjemahan berbagai bahasa dan Tafsir Jalalayn/Kemenag.",
    feature_wbw_title: "Terjemahan Per Kata", feature_wbw_desc: "Pahami makna mendalam setiap kata dalam ayat Al-Quran.",
    feature_tadabbur_title: "Jurnal Tadabbur", feature_tadabbur_desc: "Catat hikmah dan pelajaran pribadi dari setiap ayat.",
    feature_feelings_title: "Ayat Pelipur Lara", feature_feelings_desc: "Temukan ayat penenang hati sesuai emosi yang sedang dirasakan.",
    feature_topics_title: "Indeks Topik", feature_topics_desc: "Jelajahi ayat berdasarkan tema kehidupan sehari-hari.",
    feature_quiz_title: "Kuis Al-Quran", feature_quiz_desc: "Uji wawasan dan hafalan tentang surat dan ayat.",
    feature_names_title: "Asmaul Husna", feature_names_desc: "Pelajari 99 Nama Allah beserta arti dan dalilnya.",
    feature_khatam_title: "Target Khatam", feature_khatam_desc: "Pantau progres membaca harian untuk mencapai target khatam.",
    feature_pwa_title: "Aplikasi PWA & Offline", feature_pwa_desc: "Dapat diinstal di HP/Desktop dan bekerja secara offline (setelah unduh data).",
    feature_dark_title: "Mode Gelap", feature_dark_desc: "Nyaman dibaca pada malam hari.",
    feature_search_title: "Pencarian Cepat", feature_search_desc: "Cari surat, ayat, atau terjemahan dengan mudah.",
    
    loading_title: "Memuat...",
    loading_desc: "Menyiapkan Keindahan Ayat...",
    prev_surah: "Sebelumnya",
    next_surah: "Selanjutnya",
    
    // Page Content
    topics_title: "Indeks Topik Al-Quran",
    topics_desc: "Jelajahi ayat-ayat suci berdasarkan tema kehidupan sehari-hari, hukum, dan kisah teladan.",
    topics_ref: "Referensi",
    topics_collection: "Kumpulan Ayat Pilihan",
    
    names_title: "Asmaul Husna",
    names_desc: "\"Hanya milik Allah asma-ul husna (nama-nama yang maha indah), maka bermohonlah kepada-Nya dengan menyebut asma-ul husna itu...\" (QS. Al-A'raf: 180)",
    names_search: "Cari nama atau arti...",
    names_empty: "Tidak ada nama yang cocok dengan pencarian Anda.",
    names_listen: "Dengarkan Pelafalan",
    names_playing: "Memutar...",
    names_dalil_title: "Dalil Al-Quran Terkait",
    names_dalil_empty: "Tidak ditemukan ayat spesifik dengan lafaz persis ini dalam pencarian cepat.",
    
    tajweed_title: "Panduan Tajwid",
    tajweed_desc: "Pelajari cara membaca Al-Quran dengan benar.",
    tajweed_rules: "Aturan",
    tajweed_def: "Definisi",
    tajweed_how: "Cara Membaca",
    tajweed_example: "Contoh Lafadz",
    tajweed_close: "Tutup",
    
    feelings_title: "Penawar Hati",
    feelings_desc: "\"Ingatlah, hanya dengan mengingat Allah hati menjadi tenteram.\"",
    feelings_view: "View Verses",
    feelings_select: "Ayat-Ayat Pilihan",
    
    dua_title: "Koleksi Doa",
    dua_desc: "Munajat indah para Nabi dan orang shaleh yang diabadikan dalam Al-Quran.",
    dua_all: "Semua",
    dua_rabbana: "Rabbana (Ya Tuhan Kami)",
    dua_rabbi: "Rabbi (Ya Tuhanku)",
    dua_copy: "Salin Teks",
    dua_empty: "Tidak ada doa dalam kategori ini.",
    
    lib_bookmarks: "Bookmark",
    lib_notes: "Catatan",
    lib_empty_bk: "Belum ada bookmark.",
    lib_empty_note: "Belum ada catatan.",
    lib_start_read: "Mulai Membaca",
    lib_verse: "Ayat",
    lib_created: "Dibuat pada",
    lib_view_verse: "Lihat Ayat",
    lib_delete_bk_title: "Hapus Bookmark",
    lib_delete_bk_msg: "Apakah Anda yakin ingin menghapus bookmark untuk ayat ini?",
    lib_delete_note_title: "Hapus Catatan",
    lib_delete_note_msg: "Catatan yang dihapus tidak dapat dikembalikan. Lanjutkan?",

    btn_download: "Unduh",
    btn_delete: "Hapus",
    btn_change: "Ubah",
    btn_save: "Simpan",
    btn_cancel: "Batal",
    btn_close: "Tutup",
    btn_open: "Buka",
    btn_use: "Gunakan",
    btn_active: "Aktif",
    btn_share: "Bagikan",
    btn_copy: "Salin",
    loading: "Memuat...",
    error: "Terjadi kesalahan",
    success: "Berhasil",
    copied: "Disalin!",
    version: "Versi",

    // --- DYNAMIC DATA CONTENT ---
    // Tajweed
    tajweed_nun_sukun_title: "Hukum Nun Sukun & Tanwin", tajweed_nun_sukun_desc: "Aturan membaca ketika Nun Mati atau Tanwin bertemu huruf hijaiyah.",
    tajweed_mim_sukun_title: "Hukum Mim Sukun", tajweed_mim_sukun_desc: "Aturan membaca ketika Mim Mati bertemu huruf hijaiyah.",
    tajweed_qalqalah_title: "Qalqalah (Pantulan)", tajweed_qalqalah_desc: "Aturan memantulkan bunyi huruf tertentu saat sukun.",
    tajweed_mad_title: "Hukum Mad (Panjang)", tajweed_mad_desc: "Aturan memanjangkan bacaan huruf.",
    
    tajweed_izhar_halqi_name: "Izhar Halqi", tajweed_izhar_halqi_desc: "Nun Sukun/Tanwin bertemu huruf halqi (tenggorokan): ء هـ ع ح غ خ.", tajweed_izhar_halqi_how: "Dibaca JELAS dan TERANG tanpa dengung.",
    tajweed_idgham_bighunnah_name: "Idgham Bighunnah", tajweed_idgham_bighunnah_desc: "Bertemu dengan huruf: ي ن م و (Yanmu).", tajweed_idgham_bighunnah_how: "Meleburkan bunyi ke huruf berikutnya disertai DENGUNG 2 harakat.",
    tajweed_idgham_bilaghunnah_name: "Idgham Bilaghunnah", tajweed_idgham_bilaghunnah_desc: "Bertemu dengan huruf: ل (Lam) atau ر (Ra).", tajweed_idgham_bilaghunnah_how: "Meleburkan bunyi TANPA dengung. Bunyi 'N' hilang total.",
    tajweed_iqlab_name: "Iqlab", tajweed_iqlab_desc: "Bertemu dengan huruf: ب (Ba).", tajweed_iqlab_how: "Mengganti bunyi Nun/Tanwin menjadi Mim (م), disertai dengung ringan.",
    tajweed_ikhfa_haqiqi_name: "Ikhfa Haqiqi", tajweed_ikhfa_haqiqi_desc: "Bertemu dengan 15 huruf sisa (t, ts, j, d, dll).", tajweed_ikhfa_haqiqi_how: "Dibaca SAMAR antara Izhar dan Idgham, disertai dengung.",
    tajweed_ikhfa_syafawi_name: "Ikhfa Syafawi", tajweed_ikhfa_syafawi_desc: "Mim Sukun bertemu dengan huruf Ba (ب).", tajweed_ikhfa_syafawi_how: "Dibaca samar di bibir dengan didengungkan.",
    tajweed_idgham_mimi_name: "Idgham Mimi", tajweed_idgham_mimi_desc: "Mim Sukun bertemu dengan huruf Mim (م).", tajweed_idgham_mimi_how: "Meleburkan Mim pertama ke Mim kedua disertai dengung.",
    tajweed_izhar_syafawi_name: "Izhar Syafawi", tajweed_izhar_syafawi_desc: "Mim Sukun bertemu huruf selain Mim dan Ba.", tajweed_izhar_syafawi_how: "Dibaca JELAS di bibir tanpa dengung.",
    tajweed_qalqalah_sugra_name: "Qalqalah Sugra", tajweed_qalqalah_sugra_desc: "Huruf Qalqalah mati asli di tengah kata.", tajweed_qalqalah_sugra_how: "Dipantulkan dengan goncangan ringan.",
    tajweed_qalqalah_kubra_name: "Qalqalah Kubra", tajweed_qalqalah_kubra_desc: "Huruf Qalqalah mati karena waqaf di akhir ayat.", tajweed_qalqalah_kubra_how: "Dipantulkan dengan goncangan yang lebih kuat.",
    tajweed_mad_thabii_name: "Mad Thabi'i", tajweed_mad_thabii_desc: "Alif sesudah fathah, Ya sukun sesudah kasrah, Wau sukun sesudah dhommah.", tajweed_mad_thabii_how: "Dibaca panjang 2 harakat.",
    tajweed_mad_wajib_name: "Mad Wajib Muttashil", tajweed_mad_wajib_desc: "Mad Thabi'i bertemu Hamzah dalam satu kata.", tajweed_mad_wajib_how: "Wajib dibaca panjang 4 atau 5 harakat.",
    tajweed_mad_jaiz_name: "Mad Jaiz Munfashil", tajweed_mad_jaiz_desc: "Mad Thabi'i bertemu Hamzah di lain kata.", tajweed_mad_jaiz_how: "Boleh dibaca panjang 2, 4, atau 5 harakat.",

    // Topics
    topic_iman_title: "Iman & Aqidah", topic_iman_desc: "Ayat-ayat tentang keimanan kepada Allah, Malaikat, Kitab, dan Hari Akhir.",
    topic_sabar_title: "Kesabaran", topic_sabar_desc: "Petunjuk Al-Quran tentang bersabar menghadapi ujian hidup.",
    topic_keluarga_title: "Keluarga & Orang Tua", topic_keluarga_desc: "Hukum pernikahan, mendidik anak, dan berbakti pada orang tua.",
    topic_doa_title: "Kumpulan Doa", topic_doa_desc: "Doa-doa para Nabi dan orang saleh yang diabadikan dalam Al-Quran.",
    topic_rezeki_title: "Rezeki & Sedekah", topic_rezeki_desc: "Ayat tentang mencari nafkah, sedekah, dan keberkahan harta.",
    topic_akhlak_title: "Akhlak Mulia", topic_akhlak_desc: "Perintah berlaku jujur, adil, rendah hati, dan menepati janji.",
    topic_ibadah_title: "Ibadah", topic_ibadah_desc: "Shalat, Puasa, Haji, dan ibadah mahdhah lainnya.",
    topic_ilmu_title: "Ilmu Pengetahuan", topic_ilmu_desc: "Ayat-ayat yang mendorong manusia untuk berpikir dan menuntut ilmu.",

    // Emotions
    emotion_sedih_label: "Kesedihan", emotion_sedih_desc: "Saat hati terasa sempit, air mata tak terbendung, dan butuh sandaran.",
    emotion_cemas_label: "Kecemasan", emotion_cemas_desc: "Saat pikiran dipenuhi ketakutan akan masa depan dan hati tidak tenang.",
    emotion_kesepian_label: "Kesepian", emotion_kesepian_desc: "Saat merasa sendiri, terasing, dan merasa tidak ada yang mengerti.",
    emotion_marah_label: "Amarah", emotion_marah_desc: "Saat emosi memuncak, dada terasa panas, dan sulit dikendalikan.",
    emotion_syukur_label: "Rasa Syukur", emotion_syukur_desc: "Saat hati dipenuhi cahaya kebahagiaan dan nikmat Allah terasa melimpah.",
    emotion_berdosa_label: "Penyesalan", emotion_berdosa_desc: "Saat menyadari kekhilafan, merasa berdosa, dan ingin kembali.",
    emotion_lelah_label: "Kelelahan", emotion_lelah_desc: "Saat perjuangan hidup terasa berat, fisik dan batin ingin bersandar.",
    emotion_ragu_label: "Keraguan", emotion_ragu_desc: "Saat hati bimbang kehilangan arah dan sulit mengambil keputusan.",

    // Duas
    dua_d1_title: "Doa Sapu Jagat", dua_d1_desc: "Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat dan peliharalah kami dari siksa neraka.",
    dua_d2_title: "Doa Memohon Kesabaran", dua_d2_desc: "Ya Tuhan kami, tuangkanlah kesabaran atas diri kami, dan kokohkanlah pendirian kami dan tolonglah kami terhadap orang-orang kafir.",
    dua_d3_title: "Doa Agar Tidak Lupa", dua_d3_desc: "Ya Tuhan kami, janganlah Engkau hukum kami jika kami lupa atau kami tersalah.",
    dua_d4_title: "Doa Keteguhan Hati", dua_d4_desc: "Ya Tuhan kami, janganlah Engkau jadikan hati kami condong kepada kesesatan sesudah Engkau beri petunjuk kepada kami, dan karuniakanlah kepada kami rahmat dari sisi-Mu.",
    dua_d5_title: "Doa Nabi Ibrahim", dua_d5_desc: "Ya Tuhanku, jadikanlah aku dan anak cucuku orang-orang yang tetap mendirikan shalat, ya Tuhan kami, perkenankanlah doaku.",
    dua_d6_title: "Doa Pengampunan Orang Tua", dua_d6_desc: "Ya Tuhan kami, beri ampunlah aku dan kedua ibu bapaku dan sekalian orang-orang mukmin pada hari terjadinya hisab.",
    dua_d7_title: "Doa Nabi Musa", dua_d7_desc: "Ya Tuhanku, lapangkanlah untukku dadaku, dan mudahkanlah untukku urusanku.",
    dua_d8_title: "Doa Tambahan Ilmu", dua_d8_desc: "Ya Tuhanku, tambahkanlah kepadaku ilmu pengetahuan.",
    dua_d9_title: "Doa Nabi Yunus", dua_d9_desc: "Tidak ada Tuhan selain Engkau. Maha Suci Engkau, sesungguhnya aku adalah termasuk orang-orang yang zalim.",
    dua_d10_title: "Doa Pasangan & Keturunan", dua_d10_desc: "Ya Tuhan kami, anugrahkanlah kepada kami isteri-isteri kami dan keturunan kami sebagai penyenang hati (kami), dan jadikanlah kami imam bagi orang-orang yang bertakwa.",
    dua_d11_title: "Doa Mensyukuri Nikmat", dua_d11_desc: "Ya Tuhanku, tunjukilah aku untuk mensyukuri nikmat Engkau yang telah Engkau berikan kepadaku dan kepada ibu bapakku.",
    dua_d12_title: "Doa Nabi Ayyub", dua_d12_desc: "(Ya Tuhanku), sesungguhnya aku telah ditimpa penyakit dan Engkau adalah Tuhan Yang Maha Penyayang di antara semua penyayang.",
  },
  en: {
    nav_home: "Home",
    nav_topics: "Topic Index",
    nav_tajweed: "Learn Tajweed",
    nav_names: "Asmaul Husna",
    nav_feelings: "Verses for Feelings",
    nav_quiz: "Quiz & Trivia",
    nav_tadabbur: "Reflections Journal",
    nav_dua: "Dua Collection",
    nav_library: "My Library",
    nav_settings: "Settings",
    nav_about: "About App",
    app_title: "Bashirah",
    app_subtitle: "Digital Quran",

    home_greeting: "Read & Learn Quran",
    home_subtitle: "Find peace in His holy verses.",
    search_placeholder: "Search surah or verse...",
    daily_verse: "Daily Verse",
    last_read: "Last Read",
    khatam_target: "Khatam Target",
    tab_surah: "Surah",
    tab_juz: "Juz",
    tab_page: "Page",
    no_surah_found: "No surah found.",

    settings_theme: "App Theme",
    settings_theme_dark: "Dark Mode",
    settings_theme_light: "Light Mode",
    settings_lang: "App Language",
    settings_data: "Data Management",
    settings_backup: "Backup Data",
    settings_restore: "Restore Data",
    settings_ui: "Interface",
    settings_tajweed: "Tajweed Highlight",
    settings_tajweed_desc: "Download data to enable colored tajweed offline.",
    settings_tajweed_downloaded: "Tajweed data downloaded. Enable to colorize verses.",
    settings_mushaf: "Mushaf View",
    settings_audio: "Audio & Recitation",
    settings_reciter: "Select Reciter",
    settings_trans: "Translation",
    settings_tafsir: "Tafsir (Commentary)",
    download_manager: "Download Manager",
    download_all: "Download All (30 Juz)",
    settings_daily_notif: "Daily Verse Notification",
    settings_wbw: "Word by Word Translation",
    settings_mushaf_type: "Type",
    settings_mushaf_download_title: "Download Mushaf?",
    settings_mushaf_download_desc: "File size is around 200MB - 300MB. Please ensure you are on WiFi to save data.",
    settings_mushaf_delete_title: "Delete Mushaf Data?",
    settings_mushaf_delete_desc: "You are about to delete offline data for this Mushaf.",
    settings_audio_download_title: "Download Surah Audio?",
    settings_audio_download_desc: "You are about to download the audio for this Surah.",
    settings_audio_delete_title: "Delete Audio?",
    settings_audio_delete_desc: "This audio will be removed from storage.",
    settings_audio_download_all_title: "Download All 30 Juz?",
    settings_audio_download_all_desc: "WARNING: Downloading the entire Quran requires significant storage space.",
    settings_tajweed_download_title: "Download Tajweed Data?",
    settings_tajweed_download_desc: "This data is required to show Colored Tajweed offline.",
    settings_tajweed_delete_title: "Delete Tajweed Data?",
    settings_tajweed_delete_desc: "Colored Tajweed feature will be disabled until you download it again.",
    settings_data_download_title: "Download Data?",
    settings_data_download_desc: "You are about to download this data for offline use.",
    settings_data_unavailable: "Sorry, this edition is currently unavailable from the server.",
    settings_restore_confirm_title: "Restore Data?",
    settings_restore_confirm_desc: "This process will overwrite/merge your Bookmarks, Notes, and Journal data from the backup file. Continue?",
    settings_restore_success: "Data restored successfully! App will reload.",

    khatam_start_title: "Start Khatam Target",
    khatam_start_desc: "Build a daily Quran reading habit. Set your goal and track your progress.",
    khatam_label_days: "Target (Days)",
    khatam_btn_start: "Save Target",
    khatam_btn_create: "Create Target",
    khatam_btn_update_manual: "Manual Update",
    khatam_progress_title: "Update Progress",
    khatam_progress_subtitle: "Current Page",
    khatam_daily_target: "Daily Target",
    khatam_remaining_days: "days left",
    khatam_remaining_pages: "Pages left to finish",
    khatam_update_modal_title: "Update Khatam?",
    khatam_manual_page_input: "Page No.",
    khatam_tips_title: "Progress Update Tips",
    khatam_est_completion: "Estimated Completion",
    khatam_speed: "Reading Speed",
    khatam_days_active: "Active Days",
    khatam_cel_congrats: "Congratulations! You've Completed the Quran",
    khatam_cel_subtitle: "Khatm al-Qur'an al-Karim",
    khatam_cel_name_label: "Awarded to:",
    khatam_cel_doa: "O Allah, have mercy on me with the Quran, and make it for me a leader, a light, a guidance and a mercy.",
    khatam_cel_btn_share: "Share the Blessing",
    khatam_cel_stats_avg: "Average Pages/Day",

    tadabbur_title: "Reflections Journal",
    tadabbur_desc: "\"Bind knowledge with writing. Reflect on His verses, and preserve the wisdom that touches your heart.\"",
    tadabbur_empty: "No reflection notes yet.",
    tadabbur_btn_write: "Start Writing",
    tadabbur_edit_title: "Edit Journal",
    tadabbur_new_title: "New Reflection",
    tadabbur_placeholder_title: "Title...",
    tadabbur_placeholder_content: "Write down what you feel, learned, or are grateful for today...",
    tag_gratitude: "Gratitude",
    tag_patience: "Patience",
    tag_forgiveness: "Forgiveness",
    tag_prayer: "Prayer",
    tag_lesson: "Lesson",
    tag_general: "General",

    quiz_title: "Quran Quiz",
    quiz_desc: "Test your knowledge about surah names, meanings, and verse counts.",
    quiz_input_name: "Enter Your Name",
    quiz_btn_start: "Start Game",
    quiz_leaderboard: "Leaderboard",
    quiz_score: "Score",
    quiz_question: "Question",
    quiz_msg_excellent: "MashaAllah, Excellent!",
    quiz_msg_good: "Good Job, Keep It Up!",
    quiz_msg_keep_learning: "Keep Learning!",
    quiz_btn_play_again: "Play Again",
    quiz_btn_home: "Back to Home",

    stats_title: "Worship Statistics",
    stats_less: "Less",
    stats_more: "More",
    khatam_streak: "Day Streak",
    khatam_activity_7days: "7 Days Activity",
    stats_total_read: "Total Read",
    stats_active_days: "Active Days",

    about_tab_about: "About",
    about_tab_features: "Features",
    about_tab_guide: "Guide",
    about_tab_contact: "Contact",
    about_desc: "\"Bringing the light of the Quran into your grasp, with a soul-soothing design and features that facilitate reflection.\"",
    about_license_title: "Open Source License",
    about_license_text: "This application is free software licensed under",
    about_data_source: "Data Sources",
    about_created_by: "Made with ❤️ by",
    about_contact_title: "Contact Us",
    about_contact_desc: "Have suggestions, critics, or found a bug? Send a message directly to the developer.",
    about_btn_email: "Send via Email",
    about_or_manual: "Or contact manually via:",
    about_coffee: "Buy me a Coffee",
    about_download_app: "Download App (Android/PC)",
    about_source_title: "Data Sources",
    about_source_quran: "Quran data comes from",
    about_source_api: "Verses API, Translation & Audio from",
    about_form_subject: "Subject",
    about_form_message: "Message",
    about_form_placeholder_subject: "Example: New Feature Suggestion",
    about_form_placeholder_message: "Write your message here...",

    feature_mushaf_title: "Mushaf & List Mode", feature_mushaf_desc: "Enjoy reading experience like printed Mushaf or flexible verse list mode.",
    feature_tajweed_title: "Colored Tajweed", feature_tajweed_desc: "Help reading with color-coded Tajweed rules.",
    feature_audio_title: "Audio Recitation", feature_audio_desc: "Listen to verses recited by world-renowned Qaris (streaming/download).",
    feature_trans_title: "Translation & Tafsir", feature_trans_desc: "Equipped with translations in various languages and Tafsir Jalalayn/Kemenag.",
    feature_wbw_title: "Word by Word Translation", feature_wbw_desc: "Understand the deep meaning of each word in the Quranic verses.",
    feature_tadabbur_title: "Reflections Journal", feature_tadabbur_desc: "Record personal wisdom and lessons from every verse.",
    feature_feelings_title: "Verses for Feelings", feature_feelings_desc: "Find heart-soothing verses matching your current emotions.",
    feature_topics_title: "Topic Index", feature_topics_desc: "Explore verses based on daily life themes.",
    feature_quiz_title: "Quran Quiz", feature_quiz_desc: "Test your knowledge and memorization of surahs and verses.",
    feature_names_title: "Asmaul Husna", feature_names_desc: "Learn 99 Names of Allah with meanings and proofs.",
    feature_khatam_title: "Khatam Target", feature_khatam_desc: "Monitor daily reading progress to achieve khatam target.",
    feature_pwa_title: "PWA & Offline App", feature_pwa_desc: "Installable on Mobile/Desktop and works offline (after downloading data).",
    feature_dark_title: "Dark Mode", feature_dark_desc: "Comfortable reading at night.",
    feature_search_title: "Quick Search", feature_search_desc: "Search surah, verse, or translation easily.",

    // New Translations
    loading_title: "Loading...",
    loading_desc: "Preparing the Beauty of Verses...",
    prev_surah: "Previous",
    next_surah: "Next",

    // Page Content
    topics_title: "Quran Topic Index",
    topics_desc: "Explore holy verses based on daily life themes, laws, and exemplary stories.",
    topics_ref: "References",
    topics_collection: "Selected Verse Collection",

    names_title: "Asmaul Husna",
    names_desc: "\"And to Allah belong the best names, so invoke Him by them...\" (QS. Al-A'raf: 180)",
    names_search: "Search name or meaning...",
    names_empty: "No names match your search.",
    names_listen: "Listen to Pronunciation",
    names_playing: "Playing...",
    names_dalil_title: "Related Quranic Verses",
    names_dalil_empty: "No specific verse found with this exact wording in quick search.",

    tajweed_title: "Tajweed Guide",
    tajweed_desc: "Learn how to recite the Quran correctly.",
    tajweed_rules: "Rules",
    tajweed_def: "Definition",
    tajweed_how: "How to Read",
    tajweed_example: "Examples",
    tajweed_close: "Close",

    feelings_title: "Heart Healer",
    feelings_desc: "\"Unquestionably, by the remembrance of Allah hearts are assured.\"",
    feelings_view: "View Verses",
    feelings_select: "Selected Verses",

    dua_title: "Dua Collection",
    dua_desc: "Beautiful supplications of Prophets and righteous people preserved in the Quran.",
    dua_all: "All",
    dua_rabbana: "Rabbana (Our Lord)",
    dua_rabbi: "Rabbi (My Lord)",
    dua_copy: "Copy Text",
    dua_empty: "No dua in this category.",

    lib_bookmarks: "Bookmarks",
    lib_notes: "Notes",
    lib_empty_bk: "No bookmarks yet.",
    lib_empty_note: "No notes yet.",
    lib_start_read: "Start Reading",
    lib_verse: "Verse",
    lib_created: "Created on",
    lib_view_verse: "View Verse",
    lib_delete_bk_title: "Delete Bookmark",
    lib_delete_bk_msg: "Are you sure you want to delete the bookmark for this verse?",
    lib_delete_note_title: "Delete Note",
    lib_delete_note_msg: "Deleted notes cannot be recovered. Continue?",

    btn_download: "Download",
    btn_delete: "Delete",
    btn_change: "Change",
    btn_save: "Save",
    btn_cancel: "Cancel",
    btn_close: "Close",
    btn_open: "Open",
    btn_use: "Use",
    btn_active: "Active",
    btn_share: "Share",
    btn_copy: "Copy",
    loading: "Loading...",
    error: "An error occurred",
    success: "Success",
    copied: "Copied!",
    version: "Version",

    // --- DYNAMIC DATA CONTENT ---
    // Tajweed
    tajweed_nun_sukun_title: "Nun Sukun & Tanween Rules", tajweed_nun_sukun_desc: "Rules for reading when Nun Mati or Tanween meets Arabic letters.",
    tajweed_mim_sukun_title: "Mim Sukun Rules", tajweed_mim_sukun_desc: "Rules for reading when Mim Mati meets Arabic letters.",
    tajweed_qalqalah_title: "Qalqalah (Bouncing)", tajweed_qalqalah_desc: "Rules for bouncing the sound of certain letters when sukun.",
    tajweed_mad_title: "Mad Rules (Elongation)", tajweed_mad_desc: "Rules for elongating the reading of letters.",
    
    tajweed_izhar_halqi_name: "Izhar Halqi", tajweed_izhar_halqi_desc: "Nun Sukun/Tanwin meets throat letters: ء هـ ع ح غ خ.", tajweed_izhar_halqi_how: "Read CLEARLY and DISTINCTLY without humming.",
    tajweed_idgham_bighunnah_name: "Idgham Bighunnah", tajweed_idgham_bighunnah_desc: "Meets letters: ي ن م و (Yanmu).", tajweed_idgham_bighunnah_how: "Merge sound into next letter with HUMMING for 2 counts.",
    tajweed_idgham_bilaghunnah_name: "Idgham Bilaghunnah", tajweed_idgham_bilaghunnah_desc: "Meets letters: ل (Lam) or ر (Ra).", tajweed_idgham_bilaghunnah_how: "Merge sound WITHOUT humming. The 'N' sound disappears completely.",
    tajweed_iqlab_name: "Iqlab", tajweed_iqlab_desc: "Meets letter: ب (Ba).", tajweed_iqlab_how: "Change Nun/Tanwin sound to Mim (م), with light humming.",
    tajweed_ikhfa_haqiqi_name: "Ikhfa Haqiqi", tajweed_ikhfa_haqiqi_desc: "Meets remaining 15 letters.", tajweed_ikhfa_haqiqi_how: "Read FAINTLY between Izhar and Idgham, with humming.",
    tajweed_ikhfa_syafawi_name: "Ikhfa Syafawi", tajweed_ikhfa_syafawi_desc: "Mim Sukun meets letter Ba (ب).", tajweed_ikhfa_syafawi_how: "Read faintly on lips with humming.",
    tajweed_idgham_mimi_name: "Idgham Mimi", tajweed_idgham_mimi_desc: "Mim Sukun meets letter Mim (م).", tajweed_idgham_mimi_how: "Merge first Mim into second Mim with humming.",
    tajweed_izhar_syafawi_name: "Izhar Syafawi", tajweed_izhar_syafawi_desc: "Mim Sukun meets letters other than Mim and Ba.", tajweed_izhar_syafawi_how: "Read CLEARLY on lips without humming.",
    tajweed_qalqalah_sugra_name: "Qalqalah Sugra", tajweed_qalqalah_sugra_desc: "Qalqalah letter dies naturally in middle of word.", tajweed_qalqalah_sugra_how: "Bounced with light shaking.",
    tajweed_qalqalah_kubra_name: "Qalqalah Kubra", tajweed_qalqalah_kubra_desc: "Qalqalah letter dies due to stop (waqaf) at end.", tajweed_qalqalah_kubra_how: "Bounced with stronger shaking.",
    tajweed_mad_thabii_name: "Mad Thabi'i", tajweed_mad_thabii_desc: "Natural elongation (Alif after fathah, etc).", tajweed_mad_thabii_how: "Read long for 2 counts.",
    tajweed_mad_wajib_name: "Mad Wajib Muttashil", tajweed_mad_wajib_desc: "Mad Thabi'i meets Hamzah in one word.", tajweed_mad_wajib_how: "Must be read long for 4 or 5 counts.",
    tajweed_mad_jaiz_name: "Mad Jaiz Munfashil", tajweed_mad_jaiz_desc: "Mad Thabi'i meets Hamzah in different word.", tajweed_mad_jaiz_how: "Can be read long for 2, 4, or 5 counts.",

    // Topics
    topic_iman_title: "Faith & Aqidah", topic_iman_desc: "Verses about faith in Allah, Angels, Books, and the Last Day.",
    topic_sabar_title: "Patience", topic_sabar_desc: "Quranic guidance on being patient in facing life's trials.",
    topic_keluarga_title: "Family & Parents", topic_keluarga_desc: "Laws of marriage, raising children, and being dutiful to parents.",
    topic_doa_title: "Dua Collection", topic_doa_desc: "Supplications of Prophets and righteous people preserved in the Quran.",
    topic_rezeki_title: "Provision & Charity", topic_rezeki_desc: "Verses about seeking livelihood, charity, and blessed wealth.",
    topic_akhlak_title: "Noble Character", topic_akhlak_desc: "Commands to be honest, just, humble, and to keep promises.",
    topic_ibadah_title: "Worship", topic_ibadah_desc: "Prayer, Fasting, Hajj, and other formal acts of worship.",
    topic_ilmu_title: "Knowledge", topic_ilmu_desc: "Verses that encourage humans to think and seek knowledge.",

    // Emotions
    emotion_sedih_label: "Sadness", emotion_sedih_desc: "When the heart feels constricted, tears flow, and you need support.",
    emotion_cemas_label: "Anxiety", emotion_cemas_desc: "When thoughts are filled with fear of the future and the heart is restless.",
    emotion_kesepian_label: "Loneliness", emotion_kesepian_desc: "When feeling alone, isolated, and feeling no one understands.",
    emotion_marah_label: "Anger", emotion_marah_desc: "When emotions peak, the chest feels hot, and it's hard to control.",
    emotion_syukur_label: "Gratitude", emotion_syukur_desc: "When the heart is filled with light of happiness and Allah's blessings feel abundant.",
    emotion_berdosa_label: "Regret", emotion_berdosa_desc: "When realizing mistakes, feeling sinful, and wanting to return.",
    emotion_lelah_label: "Exhaustion", emotion_lelah_desc: "When life's struggle feels heavy, physical and mental self wants to lean.",
    emotion_ragu_label: "Doubt", emotion_ragu_desc: "When the heart is in doubt, losing direction and finding it hard to decide.",

    // Duas
    dua_d1_title: "Comprehensive Supplication", dua_d1_desc: "Our Lord, give us in this world [that which is] good and in the Hereafter [that which is] good and protect us from the punishment of the Fire.",
    dua_d2_title: "Request for Patience", dua_d2_desc: "Our Lord, pour upon us patience and plant firmly our feet and give us victory over the disbelieving people.",
    dua_d3_title: "Prayer Against Forgetfulness", dua_d3_desc: "Our Lord, do not impose blame upon us if we have forgotten or erred.",
    dua_d4_title: "Steadfastness of Heart", dua_d4_desc: "Our Lord, let not our hearts deviate after You have guided us and grant us from Yourself mercy.",
    dua_d5_title: "Prophet Ibrahim's Prayer", dua_d5_desc: "My Lord, make me an establisher of prayer, and [many] from my descendants. Our Lord, and accept my supplication.",
    dua_d6_title: "Forgiveness for Parents", dua_d6_desc: "Our Lord, forgive me and my parents and the believers the Day the account is established.",
    dua_d7_title: "Prophet Musa's Prayer", dua_d7_desc: "My Lord, expand for me my breast [with assurance] and ease for me my task.",
    dua_d8_title: "Increase in Knowledge", dua_d8_desc: "My Lord, increase me in knowledge.",
    dua_d9_title: "Prophet Yunus's Prayer", dua_d9_desc: "There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.",
    dua_d10_title: "Spouse & Offspring", dua_d10_desc: "Our Lord, grant us from among our wives and offspring comfort to our eyes and make us an example for the righteous.",
    dua_d11_title: "Gratitude for Blessings", dua_d11_desc: "My Lord, enable me to be grateful for Your favor which You have bestowed upon me and upon my parents.",
    dua_d12_title: "Prophet Ayyub's Prayer", dua_d12_desc: "Indeed, adversity has touched me, and you are the Most Merciful of the merciful.",
  }
};

export const getTranslation = (lang: LanguageCode, key: string): string => {
  return translations[lang][key] || key;
};
