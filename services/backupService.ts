
import * as DB from './db';
import { TadabburData } from '../types';

interface BackupData {
    version: number;
    timestamp: number;
    localStorage: Record<string, any>;
    indexedDB: {
        tadabbur: TadabburData[];
    };
}

const LOCAL_STORAGE_KEYS = [
    'quran_last_read',
    'quran_bookmarks',
    'quran_notes',
    'quran_khatam_target',
    'quran_reading_history',
    'quran_show_daily_ayat',
    'quran_reciter_id',
    'quran_theme',
    'active_mushaf_id',
    'quran_quiz_scores'
];

export const createBackup = async (): Promise<void> => {
    try {
        // 1. Gather LocalStorage Data
        const localStorageData: Record<string, any> = {};
        LOCAL_STORAGE_KEYS.forEach(key => {
            const val = localStorage.getItem(key);
            if (val) {
                try {
                    localStorageData[key] = JSON.parse(val);
                } catch (e) {
                    localStorageData[key] = val; // Store as string if parse fails (rare)
                }
            }
        });

        // 2. Gather IndexedDB Data (Tadabbur)
        const tadabburData = await DB.getAllTadabbur();

        // 3. Construct Backup Object
        const backupPayload: BackupData = {
            version: 1,
            timestamp: Date.now(),
            localStorage: localStorageData,
            indexedDB: {
                tadabbur: tadabburData
            }
        };

        // 4. Create File and Download
        const fileName = `bashirah-backup-${new Date().toISOString().split('T')[0]}.json`;
        const jsonStr = JSON.stringify(backupPayload, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const href = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = href;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        URL.revokeObjectURL(href);

    } catch (error) {
        console.error("Backup failed:", error);
        throw new Error("Gagal membuat file backup.");
    }
};

export const restoreBackup = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            try {
                const text = e.target?.result as string;
                if (!text) throw new Error("File kosong");

                const backupData: BackupData = JSON.parse(text);

                // Validate basic structure
                if (!backupData.localStorage || !backupData.indexedDB) {
                    throw new Error("Format file backup tidak valid.");
                }

                // 1. Restore LocalStorage
                Object.entries(backupData.localStorage).forEach(([key, value]) => {
                    if (typeof value === 'object') {
                        localStorage.setItem(key, JSON.stringify(value));
                    } else {
                        localStorage.setItem(key, String(value));
                    }
                });

                // 2. Restore IndexedDB (Tadabbur)
                if (backupData.indexedDB.tadabbur && Array.isArray(backupData.indexedDB.tadabbur)) {
                    await DB.bulkPutTadabbur(backupData.indexedDB.tadabbur);
                }

                // 3. Trigger update event for UI refresh
                window.dispatchEvent(new Event('storage-update'));
                
                resolve();
            } catch (error) {
                console.error("Restore failed:", error);
                reject(error);
            }
        };

        reader.onerror = () => reject(new Error("Gagal membaca file"));
        reader.readAsText(file);
    });
};
