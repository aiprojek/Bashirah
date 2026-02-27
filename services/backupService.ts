import * as DB from './db';

interface BackupData {
    version: number;
    timestamp: number;
    data: {
        user_settings: any[];
        bookmarks: any[];
        notes: any[];
        reading_history: any[];
        quiz_scores: any[];
        tadabbur: any[];
    };
}

export const createBackup = async (): Promise<void> => {
    try {
        const db = await DB.getDB();
        
        // 1. Gather all IndexedDB Data
        const backupPayload: BackupData = {
            version: 2, // Incremented version
            timestamp: Date.now(),
            data: {
                user_settings: await db.getAll('user_settings'),
                bookmarks: await db.getAll('bookmarks'),
                notes: await db.getAll('notes'),
                reading_history: await db.getAll('reading_history'),
                quiz_scores: await db.getAll('quiz_scores'),
                tadabbur: await db.getAll('tadabbur')
            }
        };

        // Note: user_settings getAll returns values but does not return keys if not in-line.
        // Wait, 'user_settings' store doesn't have a keyPath, so getAll only gives values.
        // We need keys to restore them.
        
        const settingsTx = db.transaction('user_settings', 'readonly');
        const settingsStore = settingsTx.objectStore('user_settings');
        const settings: Record<string, any> = {};
        let cursor = await settingsStore.openCursor();
        while (cursor) {
            settings[cursor.key.toString()] = cursor.value;
            cursor = await cursor.continue();
        }
        
        // Update data with records where necessary
        const structuredData = {
            ...backupPayload.data,
            user_settings: settings as any // Use as record for restoration
        };

        const finalPayload = { ...backupPayload, data: structuredData };

        // 2. Create File and Download
        const fileName = `bashirah-backup-v2-${new Date().toISOString().split('T')[0]}.json`;
        const jsonStr = JSON.stringify(finalPayload, null, 2);
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

                const backupData: any = JSON.parse(text);

                // 1. Access DB
                const db = await DB.getDB();

                // 2. Restore User Settings
                if (backupData.data.user_settings) {
                    const tx = db.transaction('user_settings', 'readwrite');
                    for (const [key, value] of Object.entries(backupData.data.user_settings)) {
                        await tx.objectStore('user_settings').put(value, key);
                    }
                    await tx.done;
                }

                // 3. Restore Collections
                const collections = ['bookmarks', 'notes', 'reading_history', 'quiz_scores', 'tadabbur'];
                for (const col of collections) {
                    const items = backupData.data[col];
                    if (items && Array.isArray(items)) {
                        const tx = db.transaction(col as any, 'readwrite');
                        const store = tx.objectStore(col as any);
                        for (const item of items) {
                            await store.put(item);
                        }
                        await tx.done;
                    }
                }

                // 4. Trigger update event for UI refresh
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
