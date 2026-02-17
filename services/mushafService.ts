import { MUSHAF_EDITIONS, MushafEdition } from '../types';

const MUSHAF_CACHE_KEY = 'quran-mushaf-images-v1';

export const getActiveMushafId = (): string => {
    return localStorage.getItem('active_mushaf_id') || 'madani';
};

export const setActiveMushafId = (id: string) => {
    localStorage.setItem('active_mushaf_id', id);
};

export const getMushafEdition = (id: string): MushafEdition => {
    return MUSHAF_EDITIONS.find(m => m.id === id) || MUSHAF_EDITIONS[0];
};

export const getPageUrl = async (page: number, editionId?: string): Promise<string> => {
    const id = editionId || getActiveMushafId();
    const edition = getMushafEdition(id);
    const pageStr = page.toString().padStart(3, '0');
    
    // Check extension: Madani uses .png, IndoPak usually .jpg or .png depending on source.
    // Based on android.quran.com current state:
    // Madani: .png
    // IndoPak: .jpg (usually) - Let's try .jpg for IndoPak to match typical Quran Android structure, 
    // BUT since we can't be 100% sure of the mirror, we will use a robust fallback or the standard one.
    // NOTE: The Android Quran project uses .jpg for IndoPak images on their server.
    const ext = edition.id === 'indopak' ? 'jpg' : 'png';
    const remoteUrl = `${edition.provider}${pageStr}.${ext}`;

    // Check Cache API
    if ('caches' in window) {
        try {
            const cache = await caches.open(MUSHAF_CACHE_KEY);
            const cachedResponse = await cache.match(remoteUrl);
            if (cachedResponse) {
                const blob = await cachedResponse.blob();
                return URL.createObjectURL(blob);
            }
        } catch (e) {
            console.warn("Mushaf cache miss", e);
        }
    }

    return remoteUrl;
};

// Check if a specific mushaf type is fully downloaded
export const isMushafDownloaded = async (editionId: string): Promise<boolean> => {
    if (!('caches' in window)) return false;
    try {
        const cache = await caches.open(MUSHAF_CACHE_KEY);
        const keys = await cache.keys();
        const edition = getMushafEdition(editionId);
        
        // Simple check: count how many files match the provider URL
        // Note: provider URL might be long, let's just check uniqueness count
        const count = keys.filter(req => req.url.includes(edition.type)).length;
        
        // 604 pages is standard
        return count >= 604;
    } catch (e) {
        return false;
    }
};

export const downloadMushaf = async (
    editionId: string, 
    onProgress: (percent: number) => void,
    signal?: AbortSignal
) => {
    if (!('caches' in window)) throw new Error("Browser tidak mendukung penyimpanan offline.");

    const cache = await caches.open(MUSHAF_CACHE_KEY);
    const edition = getMushafEdition(editionId);
    const ext = edition.id === 'indopak' ? 'jpg' : 'png';
    
    const totalPages = 604;
    let completed = 0;
    let errors = 0;

    // Sequential download to prevent throttling
    for (let i = 1; i <= totalPages; i++) {
        if (signal?.aborted) throw new Error("Unduhan dibatalkan");

        const pageStr = i.toString().padStart(3, '0');
        const url = `${edition.provider}${pageStr}.${ext}`;
        
        try {
            const existing = await cache.match(url);
            if (!existing) {
                const response = await fetch(url, { signal });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                await cache.put(url, response);
            }
        } catch (e) {
            console.warn(`Failed page ${i}`, e);
            errors++;
        } finally {
            completed++;
            onProgress(Math.floor((completed / totalPages) * 100));
        }
    }

    if (errors > 50) throw new Error("Terlalu banyak halaman gagal diunduh.");
};

export const deleteMushafData = async (editionId: string) => {
    if (!('caches' in window)) return;
    const cache = await caches.open(MUSHAF_CACHE_KEY);
    const keys = await cache.keys();
    const edition = getMushafEdition(editionId);
    
    const deletions = keys
        .filter(req => req.url.includes(edition.type))
        .map(req => cache.delete(req));
        
    await Promise.all(deletions);
};
