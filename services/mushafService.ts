
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

// Helper to get extension based on ID logic
const getExtensionForEdition = (id: string) => {
    // Madani is usually PNG on quran.com/android, IndoPak is JPG.
    // However, to be robust, we treat them based on known provider patterns.
    // Provider URL usually ends in '/'
    if (id === 'indopak' || id === 'warsh' || id === 'qaloon') return 'jpg';
    return 'png';
};

export const getPageUrl = async (page: number, editionId?: string): Promise<string> => {
    const id = editionId || getActiveMushafId();
    const edition = getMushafEdition(id);
    const pageStr = page.toString().padStart(3, '0');
    
    const ext = getExtensionForEdition(edition.id);
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
        
        // Simple check: count how many files match the provider URL pattern
        // The provider URL is like "https://.../page"
        // We check if the cached URL contains specific distinguishing path segments
        // e.g. "indopak", "warsh", or just "width_1024/page" for madani
        
        let keyword = 'width_1024/page'; // Default madani
        if (edition.id === 'indopak') keyword = 'indopak';
        else if (edition.id === 'warsh') keyword = 'warsh';
        else if (edition.id === 'qaloon') keyword = 'qaloon';

        const count = keys.filter(req => req.url.includes(keyword)).length;
        
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

    // 1. Check Storage Quota
    if (navigator.storage && navigator.storage.estimate) {
        const { quota, usage } = await navigator.storage.estimate();
        if (quota && usage) {
            const available = quota - usage;
            const REQUIRED_SPACE = 300 * 1024 * 1024; // 300 MB Safety buffer
            
            if (available < REQUIRED_SPACE) {
                throw new Error("Penyimpanan perangkat penuh. Butuh sekitar 300MB kosong.");
            }
        }
    }

    const cache = await caches.open(MUSHAF_CACHE_KEY);
    const edition = getMushafEdition(editionId);
    const ext = getExtensionForEdition(edition.id);
    
    const totalPages = 604;
    let completed = 0;
    let errors = 0;

    // Sequential download to prevent throttling
    // We can batch requests (e.g. 5 at a time) for speed vs stability balance
    // For now, pure sequential is safest for stability.
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

    if (errors > 20) throw new Error("Terlalu banyak halaman gagal diunduh. Periksa koneksi internet.");
};

export const deleteMushafData = async (editionId: string) => {
    if (!('caches' in window)) return;
    const cache = await caches.open(MUSHAF_CACHE_KEY);
    const keys = await cache.keys();
    const edition = getMushafEdition(editionId);
    
    let keyword = 'width_1024/page'; // Default madani
    if (edition.id === 'indopak') keyword = 'indopak';
    else if (edition.id === 'warsh') keyword = 'warsh';
    else if (edition.id === 'qaloon') keyword = 'qaloon';
    
    const deletions = keys
        .filter(req => req.url.includes(keyword))
        .map(req => cache.delete(req));
        
    await Promise.all(deletions);
};
