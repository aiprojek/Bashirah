/**
 * High-Precision Offline Islamic Prayer Times Calculation
 * Implements Kemenag RI / Muslim World League solar astronomical algorithm
 */

export interface PrayerTimeItem {
  id: 'imsak' | 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
  name: string;
  nameEn: string;
  time: string; // HH:MM
  timestamp: number; // millisecond timestamp of today
}

export interface PrayerLocation {
  id?: string;
  name: string;
  region?: string;
  country?: string;
  latitude: number;
  longitude: number;
  timezone: number; // UTC offset in hours
  source?: 'preset' | 'geocoded' | 'manual' | 'gps';
}

export interface CityPreset extends PrayerLocation {
  id: string;
}

export const INDONESIAN_CITIES: CityPreset[] = [
  // Jawa
  { id: 'jakarta', name: 'Jakarta', region: 'DKI Jakarta', country: 'Indonesia', latitude: -6.2088, longitude: 106.8456, timezone: 7, source: 'preset' },
  { id: 'surabaya', name: 'Surabaya', region: 'Jawa Timur', country: 'Indonesia', latitude: -7.2575, longitude: 112.7521, timezone: 7, source: 'preset' },
  { id: 'bandung', name: 'Bandung', region: 'Jawa Barat', country: 'Indonesia', latitude: -6.9175, longitude: 107.6191, timezone: 7, source: 'preset' },
  { id: 'semarang', name: 'Semarang', region: 'Jawa Tengah', country: 'Indonesia', latitude: -6.9667, longitude: 110.4167, timezone: 7, source: 'preset' },
  { id: 'yogyakarta', name: 'Yogyakarta', region: 'DI Yogyakarta', country: 'Indonesia', latitude: -7.7956, longitude: 110.3695, timezone: 7, source: 'preset' },
  { id: 'malang', name: 'Malang', region: 'Jawa Timur', country: 'Indonesia', latitude: -7.9797, longitude: 112.6304, timezone: 7, source: 'preset' },
  { id: 'surakarta', name: 'Surakarta (Solo)', region: 'Jawa Tengah', country: 'Indonesia', latitude: -7.5755, longitude: 110.8243, timezone: 7, source: 'preset' },
  { id: 'bogor', name: 'Bogor', region: 'Jawa Barat', country: 'Indonesia', latitude: -6.5971, longitude: 106.8060, timezone: 7, source: 'preset' },
  { id: 'bekasi', name: 'Bekasi', region: 'Jawa Barat', country: 'Indonesia', latitude: -6.2383, longitude: 106.9756, timezone: 7, source: 'preset' },
  { id: 'tangerang', name: 'Tangerang', region: 'Banten', country: 'Indonesia', latitude: -6.1783, longitude: 106.6319, timezone: 7, source: 'preset' },
  { id: 'tangerang-selatan', name: 'Tangerang Selatan', region: 'Banten', country: 'Indonesia', latitude: -6.2888, longitude: 106.7179, timezone: 7, source: 'preset' },
  { id: 'depok', name: 'Depok', region: 'Jawa Barat', country: 'Indonesia', latitude: -6.4025, longitude: 106.7942, timezone: 7, source: 'preset' },
  { id: 'serang', name: 'Serang', region: 'Banten', country: 'Indonesia', latitude: -6.1104, longitude: 106.1640, timezone: 7, source: 'preset' },
  { id: 'cirebon', name: 'Cirebon', region: 'Jawa Barat', country: 'Indonesia', latitude: -6.7320, longitude: 108.5523, timezone: 7, source: 'preset' },
  { id: 'tasikmalaya', name: 'Tasikmalaya', region: 'Jawa Barat', country: 'Indonesia', latitude: -7.3274, longitude: 108.2207, timezone: 7, source: 'preset' },
  { id: 'purwokerto', name: 'Purwokerto (Banyumas)', region: 'Jawa Tengah', country: 'Indonesia', latitude: -7.4243, longitude: 109.2302, timezone: 7, source: 'preset' },
  { id: 'kudus', name: 'Kudus', region: 'Jawa Tengah', country: 'Indonesia', latitude: -6.8048, longitude: 110.8405, timezone: 7, source: 'preset' },
  { id: 'magelang', name: 'Magelang', region: 'Jawa Tengah', country: 'Indonesia', latitude: -7.4797, longitude: 110.2177, timezone: 7, source: 'preset' },
  { id: 'kediri', name: 'Kediri', region: 'Jawa Timur', country: 'Indonesia', latitude: -7.8480, longitude: 112.0178, timezone: 7, source: 'preset' },
  { id: 'jember', name: 'Jember', region: 'Jawa Timur', country: 'Indonesia', latitude: -8.1724, longitude: 113.7007, timezone: 7, source: 'preset' },
  { id: 'banyuwangi', name: 'Banyuwangi', region: 'Jawa Timur', country: 'Indonesia', latitude: -8.2192, longitude: 114.3692, timezone: 7, source: 'preset' },

  // Sumatera
  { id: 'medan', name: 'Medan', region: 'Sumatera Utara', country: 'Indonesia', latitude: 3.5952, longitude: 98.6722, timezone: 7, source: 'preset' },
  { id: 'palembang', name: 'Palembang', region: 'Sumatera Selatan', country: 'Indonesia', latitude: -2.9909, longitude: 104.7565, timezone: 7, source: 'preset' },
  { id: 'padang', name: 'Padang', region: 'Sumatera Barat', country: 'Indonesia', latitude: -0.9471, longitude: 100.4172, timezone: 7, source: 'preset' },
  { id: 'banda-aceh', name: 'Banda Aceh', region: 'Aceh', country: 'Indonesia', latitude: 5.5483, longitude: 95.3238, timezone: 7, source: 'preset' },
  { id: 'pekanbaru', name: 'Pekanbaru', region: 'Riau', country: 'Indonesia', latitude: 0.5071, longitude: 101.4478, timezone: 7, source: 'preset' },
  { id: 'batam', name: 'Batam', region: 'Kepulauan Riau', country: 'Indonesia', latitude: 1.1301, longitude: 104.0529, timezone: 7, source: 'preset' },
  { id: 'jambi', name: 'Jambi', region: 'Jambi', country: 'Indonesia', latitude: -1.6101, longitude: 103.6131, timezone: 7, source: 'preset' },
  { id: 'bengkulu', name: 'Bengkulu', region: 'Bengkulu', country: 'Indonesia', latitude: -3.8004, longitude: 102.2655, timezone: 7, source: 'preset' },
  { id: 'bandar-lampung', name: 'Bandar Lampung', region: 'Lampung', country: 'Indonesia', latitude: -5.3971, longitude: 105.2668, timezone: 7, source: 'preset' },
  { id: 'pangkal-pinang', name: 'Pangkal Pinang', region: 'Bangka Belitung', country: 'Indonesia', latitude: -2.1316, longitude: 106.1169, timezone: 7, source: 'preset' },

  // Kalimantan
  { id: 'banjarmasin', name: 'Banjarmasin', region: 'Kalimantan Selatan', country: 'Indonesia', latitude: -3.3194, longitude: 114.5908, timezone: 8, source: 'preset' },
  { id: 'samarinda', name: 'Samarinda', region: 'Kalimantan Timur', country: 'Indonesia', latitude: -0.5022, longitude: 117.1536, timezone: 8, source: 'preset' },
  { id: 'balikpapan', name: 'Balikpapan', region: 'Kalimantan Timur', country: 'Indonesia', latitude: -1.2379, longitude: 116.8289, timezone: 8, source: 'preset' },
  { id: 'pontianak', name: 'Pontianak', region: 'Kalimantan Barat', country: 'Indonesia', latitude: -0.0263, longitude: 109.3425, timezone: 7, source: 'preset' },
  { id: 'palangkaraya', name: 'Palangka Raya', region: 'Kalimantan Tengah', country: 'Indonesia', latitude: -2.2161, longitude: 113.9139, timezone: 7, source: 'preset' },
  { id: 'tarakan', name: 'Tarakan', region: 'Kalimantan Utara', country: 'Indonesia', latitude: 3.3272, longitude: 117.5925, timezone: 8, source: 'preset' },

  // Sulawesi
  { id: 'makassar', name: 'Makassar', region: 'Sulawesi Selatan', country: 'Indonesia', latitude: -5.1477, longitude: 119.4327, timezone: 8, source: 'preset' },
  { id: 'manado', name: 'Manado', region: 'Sulawesi Utara', country: 'Indonesia', latitude: 1.4748, longitude: 124.8421, timezone: 8, source: 'preset' },
  { id: 'palu', name: 'Palu', region: 'Sulawesi Tengah', country: 'Indonesia', latitude: -0.9003, longitude: 119.8779, timezone: 8, source: 'preset' },
  { id: 'kendari', name: 'Kendari', region: 'Sulawesi Tenggara', country: 'Indonesia', latitude: -3.9985, longitude: 122.5126, timezone: 8, source: 'preset' },
  { id: 'gorontalo', name: 'Gorontalo', region: 'Gorontalo', country: 'Indonesia', latitude: 0.5435, longitude: 123.0568, timezone: 8, source: 'preset' },
  { id: 'mamuju', name: 'Mamuju', region: 'Sulawesi Barat', country: 'Indonesia', latitude: -2.6778, longitude: 118.8895, timezone: 8, source: 'preset' },

  // Bali & Nusa Tenggara
  { id: 'denpasar', name: 'Denpasar', region: 'Bali', country: 'Indonesia', latitude: -8.6705, longitude: 115.2126, timezone: 8, source: 'preset' },
  { id: 'mataram', name: 'Mataram (Lombok)', region: 'Nusa Tenggara Barat', country: 'Indonesia', latitude: -8.5833, longitude: 116.1167, timezone: 8, source: 'preset' },
  { id: 'kupang', name: 'Kupang', region: 'Nusa Tenggara Timur', country: 'Indonesia', latitude: -10.1772, longitude: 123.6070, timezone: 8, source: 'preset' },

  // Maluku & Papua
  { id: 'ambon', name: 'Ambon', region: 'Maluku', country: 'Indonesia', latitude: -3.6547, longitude: 128.1906, timezone: 9, source: 'preset' },
  { id: 'ternate', name: 'Ternate', region: 'Maluku Utara', country: 'Indonesia', latitude: 0.7906, longitude: 127.3804, timezone: 9, source: 'preset' },
  { id: 'jayapura', name: 'Jayapura', region: 'Papua', country: 'Indonesia', latitude: -2.5337, longitude: 140.7181, timezone: 9, source: 'preset' },
  { id: 'sorong', name: 'Sorong', region: 'Papua Barat Daya', country: 'Indonesia', latitude: -0.8762, longitude: 131.2558, timezone: 9, source: 'preset' },
  { id: 'merauke', name: 'Merauke', region: 'Papua Selatan', country: 'Indonesia', latitude: -8.4991, longitude: 140.4018, timezone: 9, source: 'preset' },

  // Internasional & Kota Suci
  { id: 'makkah', name: 'Makkah Al-Mukarramah', region: 'Makkah Province', country: 'Saudi Arabia', latitude: 21.4225, longitude: 39.8262, timezone: 3, source: 'preset' },
  { id: 'madinah', name: 'Madinah Al-Munawwarah', region: 'Al Madinah', country: 'Saudi Arabia', latitude: 24.5247, longitude: 39.5692, timezone: 3, source: 'preset' },
  { id: 'kuala-lumpur', name: 'Kuala Lumpur', region: 'Federal Territory', country: 'Malaysia', latitude: 3.1390, longitude: 101.6869, timezone: 8, source: 'preset' },
  { id: 'singapore', name: 'Singapore', region: 'Central Region', country: 'Singapore', latitude: 1.3521, longitude: 103.8198, timezone: 8, source: 'preset' },
];

/**
 * Calculates numeric timezone offset in hours (-12 to +14) from IANA timezone string or longitude
 */
export function getTimezoneOffsetHours(tzName?: string, longitude?: number): number {
  if (tzName) {
    try {
      const now = new Date();
      const tzDate = new Date(now.toLocaleString('en-US', { timeZone: tzName }));
      const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
      const offset = Math.round((tzDate.getTime() - utcDate.getTime()) / (3600 * 1000));
      if (!isNaN(offset) && offset >= -12 && offset <= 14) {
        return offset;
      }
    } catch {
      // Fall through to longitude estimation
    }
  }

  if (longitude !== undefined && !isNaN(longitude)) {
    // Standard longitude approximation: 15 degrees per hour
    const approx = Math.round(longitude / 15);
    return Math.max(-12, Math.min(14, approx));
  }

  return 7; // Default to WIB (UTC+7)
}

/**
 * Searches locations: first checks local offline presets, then attempts live online geocoding
 */
export async function searchPrayerLocations(
  query: string,
  signal?: AbortSignal
): Promise<PrayerLocation[]> {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return [];

  // 1. Local Offline Presets match
  const localMatches: PrayerLocation[] = INDONESIAN_CITIES.filter((c) => {
    return (
      c.name.toLowerCase().includes(cleanQuery) ||
      (c.region && c.region.toLowerCase().includes(cleanQuery)) ||
      (c.country && c.country.toLowerCase().includes(cleanQuery))
    );
  }).map((c) => ({ ...c, source: 'preset' }));

  // 2. If short query or if offline, return local matches
  if (cleanQuery.length < 2) {
    return localMatches;
  }

  // 3. Online Geocoding via Open-Meteo (Fast, Free, No API Key, Global Coverage)
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      cleanQuery
    )}&count=10&language=id&format=json`;

    const res = await fetch(url, { signal });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.results) && data.results.length > 0) {
        const onlineResults: PrayerLocation[] = data.results.map((item: any) => {
          const regionParts = [item.admin2, item.admin1, item.country].filter(Boolean);
          const regionStr = regionParts.length > 0 ? regionParts.join(', ') : item.country || '';
          const tz = getTimezoneOffsetHours(item.timezone, item.longitude);

          return {
            id: `geo-${item.id}`,
            name: item.name,
            region: regionStr,
            country: item.country,
            latitude: item.latitude,
            longitude: item.longitude,
            timezone: tz,
            source: 'geocoded',
          };
        });

        // Deduplicate results: prioritize online details or merge
        const combined = [...localMatches];
        for (const item of onlineResults) {
          const isDup = combined.some(
            (c) =>
              Math.abs(c.latitude - item.latitude) < 0.08 &&
              Math.abs(c.longitude - item.longitude) < 0.08
          );
          if (!isDup) {
            combined.push(item);
          }
        }
        return combined;
      }
    }
  } catch (err: any) {
    // If request aborted, re-throw so debounce can cancel cleanly
    if (err.name === 'AbortError') throw err;
    // Otherwise fallback silently to local matches
  }

  return localMatches;
}

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

function getJulianDate(year: number, month: number, day: number): number {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
}

export function calculatePrayerTimes(
  date: Date,
  latitude: number,
  longitude: number,
  timezone: number
): {
  times: PrayerTimeItem[];
  nextPrayer: { id: string; name: string; nameEn: string; time: string; remainingMs: number };
  hijriDate: string;
} {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const JD = getJulianDate(year, month, day);
  const D = JD - 2451545.0;

  // Mean anomaly of the Sun
  const g = 357.529 + 0.98560028 * D;
  // Mean longitude of the Sun
  const q = 280.459 + 0.98564736 * D;
  // Geocentric apparent ecliptic longitude
  const L = q + 1.915 * Math.sin(rad(g)) + 0.02 * Math.sin(rad(2 * g));

  // Mean obliquity of the ecliptic
  const e = 23.439 - 0.00000036 * D;

  // Sun's declination
  const sinDelta = Math.sin(rad(e)) * Math.sin(rad(L));
  const delta = deg(Math.asin(sinDelta));

  // Equation of Time (minutes)
  const RA = deg(Math.atan2(Math.cos(rad(e)) * Math.sin(rad(L)), Math.cos(rad(L)))) / 15;
  const EqT = (q / 15 - (RA < 0 ? RA + 24 : RA)) * 60;

  // Solar noon in hours (UTC+TZ)
  const noon = 12 + timezone - longitude / 15 - EqT / 60;

  // Hour angle helper
  const hourAngle = (alpha: number, isSunrise: boolean = false): number => {
    const latRad = rad(latitude);
    const deltaRad = rad(delta);
    const numerator = Math.sin(rad(-alpha)) - Math.sin(latRad) * Math.sin(deltaRad);
    const denominator = Math.cos(latRad) * Math.cos(deltaRad);
    const cosHA = numerator / denominator;
    if (cosHA > 1 || cosHA < -1) return 0; // Polar day/night fallback
    const ha = deg(Math.acos(cosHA)) / 15;
    return isSunrise ? -ha : ha;
  };

  // Asr hour angle (Shafi'i/Kemenag: Shadow ratio = 1)
  const asrAngle = (): number => {
    const latRad = rad(latitude);
    const deltaRad = rad(delta);
    const d = Math.abs(latitude - delta);
    const acot = deg(Math.atan(1 / (1 + Math.tan(rad(d)))));
    const num = Math.sin(rad(acot)) - Math.sin(latRad) * Math.sin(deltaRad);
    const den = Math.cos(latRad) * Math.cos(deltaRad);
    const cosHA = num / den;
    if (cosHA > 1 || cosHA < -1) return 0;
    return deg(Math.acos(cosHA)) / 15;
  };

  // Standard Kemenag RI angles:
  // Fajr: 20 degrees twilight
  // Isha: 18 degrees twilight
  // Ihtiyath (precautionary addition): +2 minutes
  const fajrHA = hourAngle(20, true);
  const sunriseHA = hourAngle(0.833, true);
  const sunsetHA = hourAngle(0.833, false);
  const asrHA = asrAngle();
  const ishaHA = hourAngle(18, false);

  const dhuhrHours = noon + 2 / 60; // +2m ihtiyath
  const asrHours = noon + asrHA + 2 / 60;
  const maghribHours = noon + sunsetHA + 2 / 60;
  const ishaHours = noon + ishaHA + 2 / 60;
  const fajrHours = noon + fajrHA + 2 / 60;
  const sunriseHours = noon + sunriseHA;
  const imsakHours = fajrHours - 10 / 60; // 10m before Fajr

  const formatTime = (h: number): string => {
    let norm = (h % 24 + 24) % 24;
    const hours = Math.floor(norm);
    const minutes = Math.floor((norm - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const toTimestamp = (h: number): number => {
    let norm = (h % 24 + 24) % 24;
    const hours = Math.floor(norm);
    const minutes = Math.floor((norm - hours) * 60);
    const target = new Date(date);
    target.setHours(hours, minutes, 0, 0);
    return target.getTime();
  };

  const times: PrayerTimeItem[] = [
    { id: 'imsak', name: 'Imsak', nameEn: 'Imsak', time: formatTime(imsakHours), timestamp: toTimestamp(imsakHours) },
    { id: 'fajr', name: 'Subuh', nameEn: 'Fajr', time: formatTime(fajrHours), timestamp: toTimestamp(fajrHours) },
    { id: 'sunrise', name: 'Terbit', nameEn: 'Sunrise', time: formatTime(sunriseHours), timestamp: toTimestamp(sunriseHours) },
    { id: 'dhuhr', name: 'Dzuhur', nameEn: 'Dhuhr', time: formatTime(dhuhrHours), timestamp: toTimestamp(dhuhrHours) },
    { id: 'asr', name: 'Ashar', nameEn: 'Asr', time: formatTime(asrHours), timestamp: toTimestamp(asrHours) },
    { id: 'maghrib', name: 'Maghrib', nameEn: 'Maghrib', time: formatTime(maghribHours), timestamp: toTimestamp(maghribHours) },
    { id: 'isha', name: 'Isya', nameEn: 'Isha', time: formatTime(ishaHours), timestamp: toTimestamp(ishaHours) },
  ];

  // Determine next prayer
  const now = date.getTime();
  const prayerQueue = times.filter(t => t.id !== 'sunrise' && t.id !== 'imsak');
  let next = prayerQueue.find(p => p.timestamp > now);

  if (!next) {
    // Past Isha, next is tomorrow's Fajr
    const tomorrowFajr = times.find(p => p.id === 'fajr')!;
    const tomorrowTime = tomorrowFajr.timestamp + 24 * 60 * 60 * 1000;
    next = {
      ...tomorrowFajr,
      timestamp: tomorrowTime,
    };
  }

  const remainingMs = Math.max(0, next.timestamp - now);

  // Approximate Hijri calendar calculation (Umm al-Qura standard)
  const hijriMonths = [
    'Muharram', 'Safar', 'Rabiul Awwal', 'Rabiul Akhir', 'Jumadil Ula', 'Jumadil Akhirah',
    'Rajab', 'Sya\'ban', 'Ramadhan', 'Syawwal', 'Dzulqa\'dah', 'Dzulhijjah'
  ];
  const jdInt = Math.floor(JD) + 1;
  const l = jdInt - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = (Math.floor((10985 - l2) / 5316)) * (Math.floor((50 * l2) / 17719)) + (Math.floor(l2 / 5670)) * (Math.floor((43 * l2) / 15238));
  const l3 = l2 - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
  const m = Math.floor((24 * l3) / 709);
  const dDay = l3 - Math.floor((709 * m) / 24);
  const yYear = 30 * n + j - 30;
  const hijriMonthName = hijriMonths[(m - 1 + 12) % 12];
  const hijriDate = `${dDay} ${hijriMonthName} ${yYear} H`;

  return {
    times,
    nextPrayer: {
      id: next.id,
      name: next.name,
      nameEn: next.nameEn,
      time: next.time,
      remainingMs,
    },
    hijriDate,
  };
}
