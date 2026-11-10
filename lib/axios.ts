import axios from 'axios';
import { isMockEnabled } from './env';
import { mockApiAdapter } from './mock-api';
import { getActiveUkId, getActiveUkSlug, isMultiTenantEnabled } from './tenant';

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

// Helper untuk mendapatkan header UKM jika multi-tenant diaktifkan
export const getUkHeaders = (): Record<string, string> => {
  if (!isMultiTenantEnabled()) return {};

  const ukmId = getActiveUkId();
  if (!ukmId) return {};

  return {
    'X-UKM-ID': ukmId,
    'X-UKM-SLUG': getActiveUkSlug() || '',
  };
};

const api = axios.create({
  baseURL: getDynamicApiUrl(),
  adapter: isMockEnabled() ? mockApiAdapter : undefined,
});

api.interceptors.request.use((config) => {
  // Update baseURL on each request in case window was undefined during initialization
  config.baseURL = getDynamicApiUrl();

  if (typeof window !== 'undefined') {
    // Tambahkan token otentikasi
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Tambahkan header UKM untuk multi-tenant isolation (jika aktif)
    if (isMultiTenantEnabled()) {
      const ukHeaders = getUkHeaders();
      Object.assign(config.headers, ukHeaders);
    }
  }
  return config;
});

// Interceptor respons untuk menangani error multi-tenant
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Jika error terkait tenant/isolasi, bisa ditambahkan handling di sini
    // Contoh: error.status === 403 && error.message.includes('UKM')
    return Promise.reject(error);
  }
);

export default api;
