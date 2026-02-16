import { Reciter } from '../types';

const getCacheName = (reciterId: string) => `quran-audio-${reciterId}`;

export const getAudioUrl = async (reciter: Reciter, surahId: number, verseId: number): Promise<string> => {
    const surahStr = surahId.toString().padStart(3, '0');
    const verseStr = verseId.toString().padStart(3, '0');
    const fileName = `${surahStr}${verseStr}.mp3`;
    const remoteUrl = `https://everyayah.com/data/${reciter.path}/${fileName}`;

    // Check Cache
    if ('caches' in window) {
        try {
            const cache = await caches.open(getCacheName(reciter.id));
            const cachedResponse = await cache.match(remoteUrl);
            if (cachedResponse) {
                const blob = await cachedResponse.blob();
                return URL.createObjectURL(blob);
            }
        } catch (e) {
            console.error("Cache match error", e);
        }
    }

    return remoteUrl;
};

// Batch check for all surahs (Much Faster)
export const getDownloadedSurahs = async (reciterId: string, surahs: {id: number, total_verses: number}[]): Promise<Record<number, boolean>> => {
    if (!('caches' in window)) return {};
    
    try {
        const cache = await caches.open(getCacheName(reciterId));
        const requests = await cache.keys();
        const urls = new Set(requests.map(r => r.url));
        
        const result: Record<number, boolean> = {};
        const counts: Record<string, number> = {};
        
        // Count verses per surah prefix in cache
        for (const url of urls) {
             // Pattern check for EveryAyah format: .../001001.mp3
             // We look for last 6 digits + .mp3
             const match = url.match(/\/(\d{3})\d{3}\.mp3$/);
             if (match) {
                 const surahPrefix = parseInt(match[1]).toString(); // "001" -> "1"
                 counts[surahPrefix] = (counts[surahPrefix] || 0) + 1;
             }
        }
        
        for (const s of surahs) {
            const count = counts[s.id.toString()] || 0;
            // Consider downloaded if >= 95% of verses exist (to account for network hiccups on 1-2 verses)
            result[s.id] = count >= s.total_verses;
        }
        
        return result;
    } catch (e) {
        console.error("Batch status check failed", e);
        return {};
    }
};

// Legacy single check (kept for compatibility if needed, but prefer batch)
export const isSurahDownloaded = async (reciterId: string, surahId: number, totalVerses: number): Promise<boolean> => {
    if (!('caches' in window)) return false;
    try {
        const cache = await caches.open(getCacheName(reciterId));
        const keys = await cache.keys();
        const surahPrefix = surahId.toString().padStart(3, '0');
        const count = keys.filter(req => req.url.includes(`/${surahPrefix}`)).length;
        return count >= totalVerses;
    } catch (e) {
        return false;
    }
};

export const deleteSurahAudio = async (reciterId: string, surahId: number) => {
    if (!('caches' in window)) return;
    const cache = await caches.open(getCacheName(reciterId));
    const keys = await cache.keys();
    const surahPrefix = surahId.toString().padStart(3, '0');
    
    // Convert to parallel promises for speed
    const deletionPromises = keys
        .filter(req => req.url.includes(`/${surahPrefix}`))
        .map(req => cache.delete(req));
        
    await Promise.all(deletionPromises);
};

export const downloadSurahAudio = async (
    reciter: Reciter, 
    surahId: number, 
    totalVerses: number, 
    onProgress: (percent: number) => void,
    signal?: AbortSignal
) => {
    if (!('caches' in window)) throw new Error("Browser tidak mendukung penyimpanan audio.");

    const cache = await caches.open(getCacheName(reciter.id));
    const surahStr = surahId.toString().padStart(3, '0');
    
    let completed = 0;
    let errors = 0;

    // Use a concurrency limit to prevent browser network thrashing (e.g. 5 concurrent requests)
    // For simplicity in this implementation, we will use sequential to guarantee order and progress,
    // but we will use fetch+put instead of cache.add for better error handling.

    for (let i = 1; i <= totalVerses; i++) {
        if (signal?.aborted) throw new Error("Unduhan dibatalkan");

        const verseStr = i.toString().padStart(3, '0');
        const url = `https://everyayah.com/data/${reciter.path}/${surahStr}${verseStr}.mp3`;
        
        try {
            const existing = await cache.match(url);
            if (!existing) {
                // Fetch explicitly
                const response = await fetch(url, { signal });
                if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
                await cache.put(url, response);
            }
        } catch (e) {
            console.warn(`Failed verse ${i}:`, e);
            errors++;
        } finally {
            // Always increment completed to keep progress bar moving
            completed++;
            const percent = Math.floor((completed / totalVerses) * 100);
            onProgress(percent);
        }
    }

    // If too many errors (e.g. > 10%), assume failure
    if (errors > 0 && (errors / totalVerses) > 0.1) {
        throw new Error(`Gagal mengunduh ${errors} ayat. Periksa koneksi internet.`);
    }
};

export const estimateSurahSize = (totalVerses: number, quality: 'low'|'mid'|'high' = 'mid') => {
    const avgVerseSizeMB = 0.15; 
    return (totalVerses * avgVerseSizeMB).toFixed(1) + ' MB';
};