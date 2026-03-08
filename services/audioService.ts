import { Reciter } from '../types';
import * as DB from './db';

const AUDIO_CACHE_VERSION = 'v2';
const getCurrentCacheName = (reciterId: string) => `quran-audio-${AUDIO_CACHE_VERSION}-${reciterId}`;
const getLegacyCacheName = (reciterId: string) => `quran-audio-${reciterId}`;
const getCacheNames = (reciterId: string) => [getCurrentCacheName(reciterId), getLegacyCacheName(reciterId)];
const getAudioTaskId = (reciterId: string, surahId: number) => `audio:${reciterId}:${surahId}`;

export const getAudioUrl = async (reciter: Reciter, surahId: number, verseId: number): Promise<string> => {
    const surahStr = surahId.toString().padStart(3, '0');
    const verseStr = verseId.toString().padStart(3, '0');
    const fileName = `${surahStr}${verseStr}.mp3`;
    const remoteUrl = `https://everyayah.com/data/${reciter.path}/${fileName}`;

    // Check Cache
    if ('caches' in window) {
        try {
            const [currentCacheName, legacyCacheName] = getCacheNames(reciter.id);
            const currentCache = await caches.open(currentCacheName);
            const currentHit = await currentCache.match(remoteUrl);
            if (currentHit) {
                const blob = await currentHit.blob();
                return URL.createObjectURL(blob);
            }

            const legacyCache = await caches.open(legacyCacheName);
            const legacyHit = await legacyCache.match(remoteUrl);
            if (legacyHit) {
                // Migrate hot path item to current cache version.
                await currentCache.put(remoteUrl, legacyHit.clone());
                const blob = await legacyHit.blob();
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
        const urls = new Set<string>();
        for (const cacheName of getCacheNames(reciterId)) {
            const cache = await caches.open(cacheName);
            const requests = await cache.keys();
            requests.forEach(r => urls.add(r.url));
        }
        
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
        const surahPrefix = surahId.toString().padStart(3, '0');
        const urls = new Set<string>();
        for (const cacheName of getCacheNames(reciterId)) {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            keys.forEach(req => urls.add(req.url));
        }
        const count = Array.from(urls).filter(url => url.includes(`/${surahPrefix}`)).length;
        return count >= totalVerses;
    } catch (e) {
        return false;
    }
};

export const deleteSurahAudio = async (reciterId: string, surahId: number) => {
    if (!('caches' in window)) return;
    const surahPrefix = surahId.toString().padStart(3, '0');
    
    for (const cacheName of getCacheNames(reciterId)) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        const deletionPromises = keys
            .filter(req => req.url.includes(`/${surahPrefix}`))
            .map(req => cache.delete(req));
        await Promise.all(deletionPromises);
    }
    await DB.deleteDownloadTask(getAudioTaskId(reciterId, surahId));
};

export const downloadSurahAudio = async (
    reciter: Reciter, 
    surahId: number, 
    totalVerses: number, 
    onProgress: (percent: number) => void,
    signal?: AbortSignal
) => {
    if (!('caches' in window)) throw new Error("Browser tidak mendukung penyimpanan audio.");

    const currentCache = await caches.open(getCurrentCacheName(reciter.id));
    const legacyCache = await caches.open(getLegacyCacheName(reciter.id));
    const surahStr = surahId.toString().padStart(3, '0');
    const taskId = getAudioTaskId(reciter.id, surahId);

    let completed = 0;
    let firstMissingVerse = totalVerses + 1;
    for (let i = 1; i <= totalVerses; i++) {
        const verseStr = i.toString().padStart(3, '0');
        const url = `https://everyayah.com/data/${reciter.path}/${surahStr}${verseStr}.mp3`;
        let existing = await currentCache.match(url);
        if (!existing) {
            const legacy = await legacyCache.match(url);
            if (legacy) {
                await currentCache.put(url, legacy.clone());
                existing = legacy;
            }
        }
        if (existing) {
            completed++;
        } else if (firstMissingVerse === totalVerses + 1) {
            firstMissingVerse = i;
        }
    }

    if (completed >= totalVerses) {
        onProgress(100);
        await DB.saveDownloadTask({
            id: taskId,
            type: 'audio',
            targetId: `${reciter.id}:${surahId}`,
            status: 'completed',
            current: totalVerses,
            total: totalVerses,
            progress: 100,
            updatedAt: Date.now()
        });
        return;
    }
    
    let errors = 0;
    const startVerse = firstMissingVerse <= totalVerses ? firstMissingVerse : 1;

    await DB.saveDownloadTask({
        id: taskId,
        type: 'audio',
        targetId: `${reciter.id}:${surahId}`,
        status: 'downloading',
        current: completed,
        total: totalVerses,
        progress: Math.floor((completed / totalVerses) * 100),
        updatedAt: Date.now()
    });
    onProgress(Math.floor((completed / totalVerses) * 100));

    for (let i = startVerse; i <= totalVerses; i++) {
        if (signal?.aborted) {
            await DB.saveDownloadTask({
                id: taskId,
                type: 'audio',
                targetId: `${reciter.id}:${surahId}`,
                status: 'paused',
                current: completed,
                total: totalVerses,
                progress: Math.floor((completed / totalVerses) * 100),
                updatedAt: Date.now()
            });
            throw new Error("Unduhan dijeda.");
        }

        const verseStr = i.toString().padStart(3, '0');
        const url = `https://everyayah.com/data/${reciter.path}/${surahStr}${verseStr}.mp3`;
        
        try {
            let existing = await currentCache.match(url);
            if (!existing) {
                const legacy = await legacyCache.match(url);
                if (legacy) {
                    await currentCache.put(url, legacy.clone());
                    existing = legacy;
                }
            }
            if (!existing) {
                // Fetch explicitly
                const response = await fetch(url, { signal });
                if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
                await currentCache.put(url, response);
            }
        } catch (e) {
            console.warn(`Failed verse ${i}:`, e);
            errors++;
        } finally {
            completed++;
            const percent = Math.floor((completed / totalVerses) * 100);
            onProgress(percent);
            await DB.saveDownloadTask({
                id: taskId,
                type: 'audio',
                targetId: `${reciter.id}:${surahId}`,
                status: 'downloading',
                current: completed,
                total: totalVerses,
                progress: percent,
                updatedAt: Date.now()
            });
        }
    }

    if (errors > 0 && (errors / totalVerses) > 0.1) {
        await DB.saveDownloadTask({
            id: taskId,
            type: 'audio',
            targetId: `${reciter.id}:${surahId}`,
            status: 'failed',
            current: completed,
            total: totalVerses,
            progress: Math.floor((completed / totalVerses) * 100),
            updatedAt: Date.now()
        });
        throw new Error(`Gagal mengunduh ${errors} ayat. Periksa koneksi internet.`);
    }

    await DB.saveDownloadTask({
        id: taskId,
        type: 'audio',
        targetId: `${reciter.id}:${surahId}`,
        status: 'completed',
        current: totalVerses,
        total: totalVerses,
        progress: 100,
        updatedAt: Date.now()
    });
};

export const estimateSurahSize = (totalVerses: number, quality: 'low'|'mid'|'high' = 'mid') => {
    const avgVerseSizeMB = 0.15; 
    return (totalVerses * avgVerseSizeMB).toFixed(1) + ' MB';
};
