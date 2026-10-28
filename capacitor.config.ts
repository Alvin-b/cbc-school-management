import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.elimutrack.teacher',
  appName: 'ElimuTrack Teacher',
  webDir: 'dist',
  server: {
    // Point to your deployed production server so it works on mobile
    url: 'https://site-4457d1964dd64e19ba7fec208a2066ee.freebuff.page',
    cleartext: false
  },
  android: {
    allowMixedContent: false
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#020617",
      showSpinner: false
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#020617"
    }
  }
};

export default config;
