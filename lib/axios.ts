import axios from 'axios';

// Helper untuk mendapatkan URL API (untuk axios request)
export const getDynamicApiUrl = () => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || 'https://api.ukmelrahma.my.id/api';
};

// Helper untuk mendapatkan URL dasar Backend (misal untuk tag <img> /uploads)
export const getBackendBaseUrl = () => {
  return getDynamicApiUrl();
};

const api = axios.create({
  baseURL: getDynamicApiUrl(),
});

api.interceptors.request.use((config) => {
  // Update baseURL on each request in case window was undefined during initialization
  config.baseURL = getDynamicApiUrl();

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
