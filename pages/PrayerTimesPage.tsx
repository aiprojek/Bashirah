import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Compass,
  MapPin,
  Calendar,
  Sparkles,
  Info,
  RefreshCw,
  Coins,
  ArrowRight,
  Search,
  Sliders,
  X,
  Check,
  Loader2,
  Globe,
  Navigation,
} from 'lucide-react';
import {
  calculatePrayerTimes,
  INDONESIAN_CITIES,
  PrayerLocation,
  searchPrayerLocations,
  getTimezoneOffsetHours,
} from '../services/prayerTimesService';
import { useLanguage } from '../contexts/LanguageContext';
import { showToast } from '../services/quranService';

const STORAGE_LOCATION_KEY = 'prayer_times_selected_location';

function getInitialLocation(): PrayerLocation {
  try {
    const saved = localStorage.getItem(STORAGE_LOCATION_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (
        parsed &&
        typeof parsed.latitude === 'number' &&
        typeof parsed.longitude === 'number' &&
        typeof parsed.timezone === 'number'
      ) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse saved location from localStorage:', e);
  }
  // Default to Jakarta
  return (
    INDONESIAN_CITIES.find((c) => c.id === 'jakarta') || {
      name: 'Jakarta',
      region: 'DKI Jakarta',
      country: 'Indonesia',
      latitude: -6.2088,
      longitude: 106.8456,
      timezone: 7,
      source: 'preset',
    }
  );
}

const POPULAR_QUICK_CHIPS = [
  'Jakarta',
  'Surabaya',
  'Bandung',
  'Medan',
  'Semarang',
  'Yogyakarta',
  'Malang',
  'Solo',
  'Makassar',
  'Banda Aceh',
  'Makkah',
  'Madinah',
];

const PrayerTimesPage: React.FC = () => {
  const { language, t } = useLanguage();

  const [activeLocation, setActiveLocation] = useState<PrayerLocation>(getInitialLocation);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Search Modal state
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchTab, setSearchTab] = useState<'search' | 'manual'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PrayerLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchAbortRef = useRef<AbortController | null>(null);

  // Manual Coordinates state
  const [manualName, setManualName] = useState('');
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [manualTz, setManualTz] = useState<number>(7);

  // Live timer tick every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync activeLocation to manual form fields when modal opens
  useEffect(() => {
    if (isSearchModalOpen) {
      setManualName(activeLocation.name || '');
      setManualLat(activeLocation.latitude.toString());
      setManualLng(activeLocation.longitude.toString());
      setManualTz(activeLocation.timezone ?? 7);
      setSearchQuery('');
      setSearchResults(INDONESIAN_CITIES);
    }
  }, [isSearchModalOpen, activeLocation]);

  // Debounced search when searchQuery changes
  useEffect(() => {
    if (!isSearchModalOpen || searchTab !== 'search') return;

    if (!searchQuery.trim()) {
      setSearchResults(INDONESIAN_CITIES);
      setIsSearching(false);
      return;
    }

    if (searchAbortRef.current) {
      searchAbortRef.current.abort();
    }
    const controller = new AbortController();
    searchAbortRef.current = controller;

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const results = await searchPrayerLocations(searchQuery, controller.signal);
        setSearchResults(results);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Location search error:', err);
        }
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [searchQuery, isSearchModalOpen, searchTab]);

  // Calculated Prayer Times
  const prayerData = useMemo(() => {
    return calculatePrayerTimes(
      currentTime,
      activeLocation.latitude,
      activeLocation.longitude,
      activeLocation.timezone
    );
  }, [currentTime, activeLocation]);

  // Save selected location
  const selectLocation = (loc: PrayerLocation) => {
    setActiveLocation(loc);
    try {
      localStorage.setItem(STORAGE_LOCATION_KEY, JSON.stringify(loc));
    } catch (e) {
      console.error('Failed to save location to localStorage:', e);
    }
    setIsSearchModalOpen(false);
    showToast(
      language === 'en'
        ? `Prayer times updated for ${loc.name}!`
        : `Waktu salat disesuaikan untuk ${loc.name}!`,
      'success'
    );
  };

  // Request GPS Location
  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      showToast(
        language === 'en'
          ? 'Geolocation is not supported by your browser.'
          : 'Perangkat tidak mendukung geolokasi GPS.',
        'warning'
      );
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGettingLocation(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const tz = getTimezoneOffsetHours(undefined, lng);
        const gpsLocation: PrayerLocation = {
          name: language === 'en' ? 'My Current Location (GPS)' : 'Lokasi GPS Saya',
          region: `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`,
          latitude: lat,
          longitude: lng,
          timezone: tz,
          source: 'gps',
        };
        selectLocation(gpsLocation);
      },
      (err) => {
        setIsGettingLocation(false);
        console.error('GPS error:', err);
        showToast(
          language === 'en'
            ? 'Could not access GPS. Please check location permissions.'
            : 'Tidak dapat mengakses GPS. Periksa izin lokasi perangkat Anda.',
          'warning'
        );
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Fill manual coordinates form using GPS
  const handlePrefillManualWithGPS = () => {
    if (!navigator.geolocation) {
      showToast(
        language === 'en' ? 'Geolocation not supported' : 'GPS tidak didukung',
        'warning'
      );
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGettingLocation(false);
        setManualLat(pos.coords.latitude.toFixed(5));
        setManualLng(pos.coords.longitude.toFixed(5));
        setManualTz(getTimezoneOffsetHours(undefined, pos.coords.longitude));
        if (!manualName.trim()) {
          setManualName(language === 'en' ? 'My Coordinates' : 'Koordinat Saya');
        }
        showToast(
          language === 'en'
            ? 'Coordinates filled from GPS!'
            : 'Koordinat berhasil diisi dari GPS!',
          'info'
        );
      },
      (err) => {
        setIsGettingLocation(false);
        showToast(
          language === 'en' ? 'Failed to read GPS coordinates' : 'Gagal membaca koordinat GPS',
          'warning'
        );
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Handle Manual Coordinates Form Submit
  const handleApplyManualCoords = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      showToast(
        language === 'en'
          ? 'Invalid latitude. Enter a number between -90 and 90.'
          : 'Garis lintang tidak valid. Masukkan angka antara -90 dan 90.',
        'warning'
      );
      return;
    }

    if (isNaN(lng) || lng < -180 || lng > 180) {
      showToast(
        language === 'en'
          ? 'Invalid longitude. Enter a number between -180 and 180.'
          : 'Garis bujur tidak valid. Masukkan angka antara -180 dan 180.',
        'warning'
      );
      return;
    }

    const name =
      manualName.trim() ||
      (language === 'en' ? 'Custom Coordinates' : 'Koordinat Kustom');

    const customLoc: PrayerLocation = {
      name,
      region: `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`,
      latitude: lat,
      longitude: lng,
      timezone: Number(manualTz),
      source: 'manual',
    };

    selectLocation(customLoc);
  };

  const formatCountdown = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimezoneLabel = (tz: number) => {
    const sign = tz >= 0 ? `+${tz}` : `${tz}`;
    if (tz === 7) return `UTC${sign} (WIB)`;
    if (tz === 8) return `UTC${sign} (WITA)`;
    if (tz === 9) return `UTC${sign} (WIT)`;
    if (tz === 3) return `UTC${sign} (Arab Saudi)`;
    return `UTC${sign}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in pb-28">
      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-500/20">
          <Clock className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'Accurate & Offline' : 'Akurat & Tanpa Internet'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-quran-dark dark:text-gray-100 mb-2">
          {language === 'en' ? 'Automatic Prayer Times' : 'Jadwal Waktu Salat Otomatis'}
        </h1>
        <p className="text-stone-500 dark:text-stone-400 text-sm max-w-lg mx-auto">
          {language === 'en'
            ? 'Accurate prayer times calculated based on solar position and Ministry of Religious Affairs (Kemenag RI) standards.'
            : 'Jadwal salat otomatis akurat berbasis posisi matahari serta standar hisab Kementerian Agama RI.'}
        </p>
      </div>

      <div className="space-y-6">
        {/* Location Selector Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/95 border border-stone-200/80 dark:border-slate-700/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 block">
                  {language === 'en' ? 'Selected Location' : 'Lokasi Terpilih'}
                </span>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                  {activeLocation.source === 'gps'
                    ? 'GPS Aktif'
                    : activeLocation.source === 'manual'
                    ? 'Koordinat Manual'
                    : activeLocation.source === 'geocoded'
                    ? 'Pencarian'
                    : 'Kota'}
                </span>
              </div>
              <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <span>{activeLocation.name}</span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {activeLocation.region ? `${activeLocation.region} • ` : ''}
                {activeLocation.latitude.toFixed(2)}°, {activeLocation.longitude.toFixed(2)}° •{' '}
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {getTimezoneLabel(activeLocation.timezone)}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search / Manual Location Button */}
            <button
              type="button"
              onClick={() => setIsSearchModalOpen(true)}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100/80 dark:bg-slate-700 dark:hover:bg-slate-650 border border-emerald-200 dark:border-slate-600 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Search / Type Location' : 'Cari / Ketik Lokasi'}</span>
            </button>

            {/* GPS Button */}
            <button
              type="button"
              onClick={handleUseGPS}
              disabled={isGettingLocation}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
              title={language === 'en' ? 'Detect current GPS coordinates' : 'Deteksi koordinat GPS saat ini'}
            >
              {isGettingLocation ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Compass className="w-3.5 h-3.5" />
              )}
              <span>GPS</span>
            </button>
          </div>
        </div>

        {/* Next Prayer Countdown Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e3a34] via-[#162e29] to-[#0e1d1a] text-white p-6 sm:p-8 shadow-xl border border-emerald-600/30">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 mb-2.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-bold text-emerald-300 border border-white/15 whitespace-nowrap self-start shadow-2xs">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{prayerData.hijriDate}</span>
                </div>
                <span className="text-xs text-emerald-100/90 font-medium whitespace-nowrap flex items-center gap-1.5">
                  <span className="hidden sm:inline text-emerald-400/40">•</span>
                  <span>
                    {currentTime.toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">
                {language === 'en' ? 'Next Prayer:' : 'Waktu Salat Berikutnya:'}{' '}
                <span className="text-amber-400">{prayerData.nextPrayer.name}</span>
              </h2>
              <p className="text-emerald-100/80 text-sm">
                {language === 'en' ? 'Adhan at' : 'Masuk waktu pada pukul'}{' '}
                <span className="font-bold text-white font-mono text-base">
                  {prayerData.nextPrayer.time}
                </span>
              </p>
            </div>

            {/* Live Countdown Box */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center shrink-0 min-w-[200px]">
              <span className="text-[11px] uppercase tracking-widest text-emerald-200 font-bold mb-1">
                {language === 'en' ? 'Countdown' : 'Hitung Mundur'}
              </span>
              <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
                {formatCountdown(prayerData.nextPrayer.remainingMs)}
              </span>
              <span className="text-[10px] text-emerald-200/70 mt-1">
                {language === 'en' ? 'Hours : Minutes : Seconds' : 'Jam : Menit : Detik'}
              </span>
            </div>
          </div>
        </div>

        {/* 7 Prayer Times Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3">
          {prayerData.times.map((item) => {
            const isNext = prayerData.nextPrayer.id === item.id;
            const isSunrise = item.id === 'sunrise';
            const isImsak = item.id === 'imsak';
            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center text-center justify-center relative overflow-hidden ${
                  isNext
                    ? 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/50 shadow-md ring-2 ring-amber-500/30'
                    : isImsak || isSunrise
                      ? 'bg-stone-50/70 dark:bg-slate-800/50 border-stone-200/60 dark:border-slate-700/60'
                      : 'bg-white dark:bg-slate-800/90 border-stone-200/80 dark:border-slate-700/80 shadow-2xs hover:border-emerald-500/40'
                }`}
              >
                {isNext && (
                  <span className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                )}
                <span
                  className={`text-[11px] font-extrabold uppercase tracking-wider mb-1 ${
                    isNext
                      ? 'text-amber-700 dark:text-amber-400'
                      : 'text-stone-500 dark:text-stone-400'
                  }`}
                >
                  {language === 'en' ? item.nameEn : item.name}
                </span>
                <span
                  className={`text-xl sm:text-2xl font-black font-mono tracking-tight ${
                    isNext
                      ? 'text-amber-800 dark:text-amber-300'
                      : 'text-gray-900 dark:text-gray-100'
                  }`}
                >
                  {item.time}
                </span>
                <span className="text-[10px] text-stone-400 dark:text-stone-500 mt-1">
                  {isImsak
                    ? '10m sblm Subuh'
                    : isSunrise
                      ? 'Batas Subuh'
                      : isNext
                        ? 'Mendatang'
                        : 'Waktu Salat'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Fiqih Notes on Prayer Times */}
        <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-xs text-stone-600 dark:text-stone-300 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
            <Info className="w-4 h-4 text-emerald-600" />
            <span>Standar Perhitungan Astronomis Kemenag RI</span>
          </div>
          <p className="leading-relaxed">
            Jadwal dihitung secara offline berdasarkan posisi matahari astronomis dengan sudut fajar
            (Subuh) 20° dan sudut senja (Isya) 18°, waktu Ashar perbandingan bayangan 1 (Madzhab
            Syafi'i), serta koreksi ihtiyath +2 menit sesuai standar ketetapan Kementerian Agama
            Republik Indonesia.
          </p>
        </div>

        {/* Quick Link to Zakat Calculator */}
        <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200/70 dark:border-slate-700/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                {language === 'en' ? 'Need to calculate Zakat?' : 'Ingin Menghitung Kewajiban Zakat?'}
              </h4>
              <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400">
                {language === 'en'
                  ? 'Open the dedicated Zakat Maal & Fitrah Calculator'
                  : 'Buka Kalkulator Zakat Maal & Fitrah'}
              </p>
            </div>
          </div>
          <Link
            to="/zakat"
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-xs active:scale-95 text-center"
          >
            <span>{language === 'en' ? 'Open Zakat Calculator' : 'Buka Kalkulator Zakat'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* LOCATION SEARCH & MANUAL INPUT MODAL */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div
            className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 dark:border-slate-700 flex flex-col max-h-[88vh] overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>{language === 'en' ? 'Set Prayer Location' : 'Atur Lokasi Waktu Salat'}</span>
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {language === 'en'
                    ? 'Search by city name or enter manual coordinates'
                    : 'Cari nama kota/daerah atau masukkan koordinat manual'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSearchModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-stone-600 dark:text-stone-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-stone-200 dark:border-slate-700 px-4 pt-2 gap-2 bg-stone-50/60 dark:bg-slate-800/60">
              <button
                type="button"
                onClick={() => setSearchTab('search')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                  searchTab === 'search'
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                    : 'border-transparent text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Search City / Region' : 'Ketik Nama Kota / Daerah'}</span>
              </button>

              <button
                type="button"
                onClick={() => setSearchTab('manual')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                  searchTab === 'manual'
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                    : 'border-transparent text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Manual Coordinates' : 'Koordinat Lintang & Bujur'}</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
              {searchTab === 'search' ? (
                <>
                  {/* Search Input Box */}
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 pointer-events-none" />
                    <input
                      type="text"
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={
                        language === 'en'
                          ? 'Type city, regency, district or country...'
                          : 'Ketik kota, kabupaten, kecamatan, atau negara (cth: Malang, Solo, Bogor)...'
                      }
                      className="w-full pl-10 pr-10 py-2.5 bg-stone-50 dark:bg-slate-700/80 border border-stone-200 dark:border-slate-600 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    {isSearching ? (
                      <Loader2 className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-600 animate-spin" />
                    ) : searchQuery ? (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 flex items-center justify-center cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    ) : null}
                  </div>

                  {/* Quick Suggestion Chips */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 block mb-1.5">
                      {language === 'en' ? 'Quick Popular Cities' : 'Pilihan Cepat Kota Populer'}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {POPULAR_QUICK_CHIPS.map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => setSearchQuery(chip)}
                          className="px-2.5 py-1 text-xs rounded-lg bg-stone-100 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-stone-700 dark:text-stone-200 font-medium transition-colors cursor-pointer"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Search Results List */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 px-1">
                      <span>
                        {searchQuery
                          ? `${language === 'en' ? 'Results for' : 'Hasil pencarian'} "${searchQuery}"`
                          : language === 'en'
                          ? 'Available Locations'
                          : 'Daftar Lokasi Tersedia'}
                      </span>
                      <span>{searchResults.length} {language === 'en' ? 'locations' : 'lokasi'}</span>
                    </div>

                    {searchResults.length === 0 && !isSearching ? (
                      <div className="text-center py-8 px-4 rounded-2xl bg-stone-50 dark:bg-slate-850 border border-stone-200/60 dark:border-slate-700/60">
                        <Globe className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                        <p className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                          {language === 'en'
                            ? 'No location found for this name.'
                            : 'Lokasi tidak ditemukan dengan kata kunci ini.'}
                        </p>
                        <p className="text-[11px] text-stone-400 mt-1">
                          {language === 'en'
                            ? 'Try different spelling or enter coordinates directly in the Manual tab.'
                            : 'Coba ejaan lain atau masukkan koordinat langsung melalui tab Koordinat Manual.'}
                        </p>
                        <button
                          type="button"
                          onClick={() => setSearchTab('manual')}
                          className="mt-3 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white cursor-pointer hover:bg-emerald-700 transition-colors"
                        >
                          {language === 'en' ? 'Enter Coordinates Manually' : 'Input Koordinat Manual'}
                        </button>
                      </div>
                    ) : (
                      <div className="max-h-64 overflow-y-auto space-y-1 pr-1 divide-y divide-stone-100 dark:divide-slate-700/50">
                        {searchResults.map((loc, idx) => {
                          const isSelected =
                            Math.abs(loc.latitude - activeLocation.latitude) < 0.01 &&
                            Math.abs(loc.longitude - activeLocation.longitude) < 0.01;

                          return (
                            <button
                              key={loc.id || `${loc.name}-${idx}`}
                              type="button"
                              onClick={() => selectLocation(loc)}
                              className={`w-full text-left p-3 rounded-xl flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-100 font-bold border border-emerald-500/30'
                                  : 'hover:bg-stone-50 dark:hover:bg-slate-700/50 text-stone-800 dark:text-stone-200'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                    isSelected
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-stone-100 dark:bg-slate-700 text-stone-500 dark:text-stone-400'
                                  }`}
                                >
                                  <MapPin className="w-4 h-4" />
                                </div>
                                <div className="truncate">
                                  <div className="text-xs font-bold truncate flex items-center gap-1.5">
                                    <span>{loc.name}</span>
                                    {loc.source === 'geocoded' && (
                                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 font-normal">
                                        Online
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                                    {loc.region || loc.country || ''}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] px-2 py-0.5 rounded-md font-mono bg-stone-100 dark:bg-slate-700 text-stone-600 dark:text-stone-300 font-semibold">
                                  {getTimezoneLabel(loc.timezone)}
                                </span>
                                {isSelected && (
                                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                  /* Manual Coordinates Tab */
                  <form onSubmit={handleApplyManualCoords} className="space-y-4">
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                      {language === 'en'
                        ? 'Enter exact decimal coordinates (Latitude & Longitude). Useful for remote locations, villages, or Islamic boarding schools.'
                        : 'Masukkan koordinat desimal lintang dan bujur secara manual. Berguna untuk lokasi spesifik seperti pesantren, desa, atau pulau terpencil.'}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        {language === 'en' ? 'Location Name (Optional)' : 'Nama Lokasi (Opsional)'}
                      </label>
                      <input
                        type="text"
                        value={manualName}
                        onChange={(e) => setManualName(e.target.value)}
                        placeholder={
                          language === 'en'
                            ? 'e.g. My Mosque / Pesantren'
                            : 'cth: Pondok Pesantren Al-Falah, Kediri'
                        }
                        className="w-full px-3 py-2 bg-stone-50 dark:bg-slate-700/80 border border-stone-200 dark:border-slate-600 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                          {language === 'en' ? 'Latitude (-90 to 90)' : 'Garis Lintang / Latitude'}
                        </label>
                        <input
                          type="number"
                          step="any"
                          required
                          value={manualLat}
                          onChange={(e) => setManualLat(e.target.value)}
                          placeholder="-6.2088"
                          className="w-full px-3 py-2 bg-stone-50 dark:bg-slate-700/80 border border-stone-200 dark:border-slate-600 rounded-xl text-xs font-mono font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <span className="text-[10px] text-stone-400 mt-0.5 block">
                          Format desimal (- untuk Lintang Selatan)
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                          {language === 'en' ? 'Longitude (-180 to 180)' : 'Garis Bujur / Longitude'}
                        </label>
                        <input
                          type="number"
                          step="any"
                          required
                          value={manualLng}
                          onChange={(e) => setManualLng(e.target.value)}
                          placeholder="106.8456"
                          className="w-full px-3 py-2 bg-stone-50 dark:bg-slate-700/80 border border-stone-200 dark:border-slate-600 rounded-xl text-xs font-mono font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <span className="text-[10px] text-stone-400 mt-0.5 block">
                          Format desimal (+ untuk Bujur Timur)
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        {language === 'en' ? 'Timezone (UTC Offset)' : 'Zona Waktu (Selisih UTC)'}
                      </label>
                      <select
                        value={manualTz}
                        onChange={(e) => setManualTz(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-stone-50 dark:bg-slate-700/80 border border-stone-200 dark:border-slate-600 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value={7}>UTC+7 : WIB (Jawa, Sumatera, Kalbar, Kalteng)</option>
                        <option value={8}>UTC+8 : WITA (Sulawesi, Bali, NTB, NTT, Kalsel, Kaltim, Kaltara)</option>
                        <option value={9}>UTC+9 : WIT (Maluku, Papua)</option>
                        <option value={3}>UTC+3 : Arab Saudi (Makkah & Madinah)</option>
                        <option value={0}>UTC+0 : GMT / Western European Time</option>
                        <option value={1}>UTC+1 : Central European Time</option>
                        <option value={4}>UTC+4 : UAE (Dubai)</option>
                        <option value={5}>UTC+5 : Pakistan / Asia Selatan</option>
                        <option value={6}>UTC+6 : Bangladesh</option>
                        <option value={10}>UTC+10 : Australia Timur</option>
                        <option value={-5}>UTC-5 : Eastern Time (AS & Kanada)</option>
                        <option value={-8}>UTC-8 : Pacific Time (AS & Kanada)</option>
                      </select>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={handlePrefillManualWithGPS}
                        disabled={isGettingLocation}
                        className="px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-slate-600 hover:bg-stone-100 dark:hover:bg-slate-700 text-stone-700 dark:text-stone-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {isGettingLocation ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                        <span>{language === 'en' ? 'Fill from GPS' : 'Isi Dari GPS Saat Ini'}</span>
                      </button>

                      <button
                        type="submit"
                        className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs active:scale-95 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>{language === 'en' ? 'Apply Coordinates' : 'Terapkan Koordinat Ini'}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 bg-stone-50 dark:bg-slate-850 border-t border-stone-200 dark:border-slate-700 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
              <span className="flex items-center gap-1.5 text-[11px]">
                <Info className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'en' ? 'Saved automatically' : 'Tersimpan otomatis di perangkat'}</span>
              </span>
              <button
                type="button"
                onClick={() => setIsSearchModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                {language === 'en' ? 'Close' : 'Tutup'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrayerTimesPage;
