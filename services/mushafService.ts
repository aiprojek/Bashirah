
import { MUSHAF_EDITIONS, MushafEdition } from '../types';
import * as DB from './db';

const MUSHAF_CACHE_VERSION = 'v2';
const MUSHAF_CACHE_KEY = `quran-mushaf-images-${MUSHAF_CACHE_VERSION}`;
const MUSHAF_LEGACY_CACHE_KEY = 'quran-mushaf-images-v1';
const getMushafTaskId = (editionId: string) => `mushaf:${editionId}`;

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
    
    // Use the format defined in the edition config, do not hardcode
    const ext = edition.format || 'png';
    const remoteUrl = `${edition.provider}${pageStr}.${ext}`;

    // Check Cache API
    if ('caches' in window) {
        try {
            const currentCache = await caches.open(MUSHAF_CACHE_KEY);
            const currentHit = await currentCache.match(remoteUrl);
            if (currentHit) {
                const blob = await currentHit.blob();
                return URL.createObjectURL(blob);
            }

            const legacyCache = await caches.open(MUSHAF_LEGACY_CACHE_KEY);
            const legacyHit = await legacyCache.match(remoteUrl);
            if (legacyHit) {
                await currentCache.put(remoteUrl, legacyHit.clone());
                const blob = await legacyHit.blob();
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
        const edition = getMushafEdition(editionId);
        const urls = new Set<string>();
        for (const cacheName of [MUSHAF_CACHE_KEY, MUSHAF_LEGACY_CACHE_KEY]) {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            keys.forEach(req => urls.add(req.url));
        }
        const count = Array.from(urls).filter(url => url.includes(edition.type)).length;
        
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

    const currentCache = await caches.open(MUSHAF_CACHE_KEY);
    const legacyCache = await caches.open(MUSHAF_LEGACY_CACHE_KEY);
    const edition = getMushafEdition(editionId);
    
    // Use dynamic format
    const ext = edition.format || 'png';
    
    const totalPages = 604;
    const taskId = getMushafTaskId(editionId);
    let completed = 0;
    let errors = 0;
    let firstMissingPage = totalPages + 1;

    for (let i = 1; i <= totalPages; i++) {
        const pageStr = i.toString().padStart(3, '0');
        const url = `${edition.provider}${pageStr}.${ext}`;
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
        } else if (firstMissingPage === totalPages + 1) {
            firstMissingPage = i;
        }
    }

    if (completed >= totalPages) {
        onProgress(100);
        await DB.saveDownloadTask({
            id: taskId,
            type: 'mushaf',
            targetId: editionId,
            status: 'completed',
            current: totalPages,
            total: totalPages,
            progress: 100,
            updatedAt: Date.now()
        });
        return;
    }

    await DB.saveDownloadTask({
        id: taskId,
        type: 'mushaf',
        targetId: editionId,
        status: 'downloading',
        current: completed,
        total: totalPages,
        progress: Math.floor((completed / totalPages) * 100),
        updatedAt: Date.now()
    });
    onProgress(Math.floor((completed / totalPages) * 100));

    const startPage = firstMissingPage <= totalPages ? firstMissingPage : 1;

    for (let i = startPage; i <= totalPages; i++) {
        if (signal?.aborted) {
            await DB.saveDownloadTask({
                id: taskId,
                type: 'mushaf',
                targetId: editionId,
                status: 'paused',
                current: completed,
                total: totalPages,
                progress: Math.floor((completed / totalPages) * 100),
                updatedAt: Date.now()
            });
            throw new Error("Unduhan dijeda.");
        }

        const pageStr = i.toString().padStart(3, '0');
        const url = `${edition.provider}${pageStr}.${ext}`;
        
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
                const response = await fetch(url, { signal });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                await currentCache.put(url, response);
            }
        } catch (e) {
            console.warn(`Failed page ${i}`, e);
            errors++;
        } finally {
            completed++;
            const percent = Math.floor((completed / totalPages) * 100);
            onProgress(percent);
            await DB.saveDownloadTask({
                id: taskId,
                type: 'mushaf',
                targetId: editionId,
                status: 'downloading',
                current: completed,
                total: totalPages,
                progress: percent,
                updatedAt: Date.now()
            });
        }
    }

    if (errors > 50) {
        await DB.saveDownloadTask({
            id: taskId,
            type: 'mushaf',
            targetId: editionId,
            status: 'failed',
            current: completed,
            total: totalPages,
            progress: Math.floor((completed / totalPages) * 100),
            updatedAt: Date.now()
        });
        throw new Error("Terlalu banyak halaman gagal diunduh.");
    }

    await DB.saveDownloadTask({
        id: taskId,
        type: 'mushaf',
        targetId: editionId,
        status: 'completed',
        current: totalPages,
        total: totalPages,
        progress: 100,
        updatedAt: Date.now()
    });
};

export const deleteMushafData = async (editionId: string) => {
    if (!('caches' in window)) return;
    const edition = getMushafEdition(editionId);
    
    for (const cacheName of [MUSHAF_CACHE_KEY, MUSHAF_LEGACY_CACHE_KEY]) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        const deletions = keys
            .filter(req => req.url.includes(edition.type))
            .map(req => cache.delete(req));
        await Promise.all(deletions);
    }
    await DB.deleteDownloadTask(getMushafTaskId(editionId));
};

export const isMushafInitialized = (): boolean => {
    return localStorage.getItem('mushaf_initialized') === 'true';
};

export const setMushafInitialized = (val: boolean) => {
    localStorage.setItem('mushaf_initialized', val ? 'true' : 'false');
};
