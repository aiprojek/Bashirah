/**
 * Offline Sync Service:
 * Handles Service Worker registration, updates, and automatic verification/redownload
 * of critical application libraries and offline assets.
 */

export function initOfflineSync(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // Helper to ask SW to check and download any missing assets
  const triggerAssetIntegrityCheck = () => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'VERIFY_AND_SYNC_OFFLINE',
      });
    }
  };

  // Listen for sync completion from Service Worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'OFFLINE_ASSETS_SYNC_RESULT') {
      const { missing, downloaded } = event.data;
      if (downloaded > 0) {
        console.info(`[Offline Sync] ${downloaded} aset aplikasi berhasil dilengkapi untuk mode offline.`);
      } else if (missing === 0) {
        console.info('[Offline Sync] Semua library dan aset utama aplikasi lengkap offline.');
      }
    }
  });

  // When device returns online, automatically verify and recover incomplete assets
  window.addEventListener('online', () => {
    console.info('[Offline Sync] Koneksi kembali online, memeriksa kelengkapan aset...');
    triggerAssetIntegrityCheck();
  });

  // Verify on initial page load after short delay to not block startup rendering
  window.addEventListener('load', () => {
    setTimeout(() => {
      triggerAssetIntegrityCheck();
    }, 2500);
  });
}
