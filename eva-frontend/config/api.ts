import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Centralized API configuration

// Automatically detects production build vs development mode
const IS_PRODUCTION = !__DEV__;

// Production Cloud URL (Render)
export const PROD_API_URL = "https://eva-backend-d1nu.onrender.com/api";

// Dynamically determine the local machine IP for physical device Expo Go testing
const getLocalHost = (): string => {
  if (Platform.OS === 'web') {
    return 'localhost';
  }
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    return debuggerHost.split(':')[0];
  }
  if (Platform.OS === 'android') {
    return '10.0.2.2'; // Android Emulator alias for localhost
  }
  return 'localhost';
};

export const LOCAL_API_URL = `http://${getLocalHost()}:5000/api`;

// The final active URL
export const API_URL = IS_PRODUCTION ? PROD_API_URL : LOCAL_API_URL;
