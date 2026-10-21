import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_URL } from '../config/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15 second timeout for Render cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const userInfo = await AsyncStorage.getItem('userInfo');
      if (userInfo) {
        const { token } = JSON.parse(userInfo);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (e) {
      console.warn('Failed to get token from storage');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for unified error formatting
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Auto-logout on 401 (expired/invalid token)
    if (error.response?.status === 401) {
      try {
        await AsyncStorage.removeItem('userInfo');
        await AsyncStorage.removeItem('userToken');
      } catch (e) {
        // Ignore storage errors during cleanup
      }
    }

    let customError = error;
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      customError = new Error('Request timed out. Please check your internet connection.');
    } else if (!error.response) {
      customError = new Error('Network Error. Cannot reach the server. You might be offline.');
    } else if (error.response?.data?.message) {
      // Pass backend-provided error message through if available
      customError = new Error(error.response.data.message);
      (customError as any).response = error.response;
    }
    return Promise.reject(customError);
  }
);

export default api;

