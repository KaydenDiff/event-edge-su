import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import router from '@/router';

// Создаем экземпляр axios с базовым URL
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://event-edge-su/',
  timeout: 10000,
});

// Добавляем перехватчик для запросов
axiosInstance.interceptors.request.use(
  async (config) => {
    const authStore = useAuthStore();
    
    // Проверяем, нужно ли обновить токен
    if (authStore.accessToken) {
      await authStore.checkAuth();
      config.headers.Authorization = `Bearer ${authStore.accessToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Добавляем перехватчик для ответов
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const authStore = useAuthStore();

    // Если ошибка 401 и это не повторный запрос
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Пробуем обновить токен
        const refreshed = await authStore.silentRefresh();
        
        if (refreshed) {
          // Если токен обновлен успешно, повторяем оригинальный запрос
          originalRequest.headers.Authorization = `Bearer ${authStore.accessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Если не удалось обновить токен, очищаем аутентификацию
        authStore.clearAuth();
        router.push('/login');
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance; 