
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aiprojek.bashirah',
  appName: 'Bashirah',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    // Add plugins config here if needed later (e.g. status bar, splash screen)
  }
};

export default config;
