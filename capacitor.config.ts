import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize, KeyboardStyle } from '@capacitor/keyboard';

const config: CapacitorConfig = {
  appId: 'homes.ezy.app',
  appName: 'ezy.homes',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    allowNavigation: [
      'www.ezy.homes',
      'ezy.homes',
      'esy-homes.vercel.app',
      '*.vercel.app',
      'wa.me',
      '*.whatsapp.com',
      'nominatim.openstreetmap.org'
    ]
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0f172a',
      overlaysWebView: false
    },
    Keyboard: {
      resize: KeyboardResize.Body,
      style: KeyboardStyle.Dark
    }
  }
};

export default config;
