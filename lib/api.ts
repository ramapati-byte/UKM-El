import axios from "axios";
import { getDynamicApiUrl } from "./axios";
import { isMockEnabled } from "./env";
import { mockApiAdapter } from "./mock-api";

// Membuat instance axios global yang bisa di-reuse di seluruh aplikasi
const api = axios.create({
  baseURL: getDynamicApiUrl(),
  adapter: isMockEnabled() ? mockApiAdapter : undefined,
});

// Interceptor (Opsional tapi sangat berguna): 
// Otomatis menyisipkan Token JWT ke setiap request ke Backend jika user sudah login
api.interceptors.request.use(
  (config) => {
    config.baseURL = getDynamicApiUrl();
    
    // Pastikan berjalan di sisi client (browser) sebelum mengakses localStorage
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;