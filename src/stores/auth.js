// authStore.js
import { defineStore } from 'pinia';
import axios from '@/plugins/axios';

export const useAuthStore = defineStore('auth', {
  state: () => {
    let user = null;
    let authStatus = false;

    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        user = JSON.parse(userData);
        authStatus = true;
      }
    } catch (error) {
      console.error('Ошибка при парсинге user из localStorage:', error);
    }

    return {
      user,
      authStatus,
      accessToken: localStorage.getItem('accessToken'),
      refreshToken: localStorage.getItem('refreshToken'),
      tokenExpirationTime: null,
    };
  },

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    isAdmin: (state) => state.user?.role === 'Администратор',
    isOrganizer: (state) => state.user?.role === 'Организатор',
    isPlayer: (state) => state.user?.role === 'Пользователь',
  },

  actions: {
    async login(credentials) {
      try {
        const response = await axios.post('/api/login', credentials);
        this.setTokens(response.data);
        return true;
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },

    async register(userData) {
      try {
        const response = await axios.post('/api/register', userData);
        this.setTokens(response.data);
        return true;
      } catch (error) {
        console.error('Registration error:', error);
        throw error;
      }
    },

    async logout() {
      try {
        if (this.refreshToken) {
          await axios.post('/api/logout', {
            refreshToken: this.refreshToken
          });
        }
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        this.clearAuth();
      }
    },

    setTokens(data) {
      // Сохраняем токен и пользователя из ответа сервера
      this.accessToken = data.access_token;
      // refresh_token может отсутствовать
      this.refreshToken = data.refresh_token || null;
      // Если сервер возвращает expires_in, используем его, иначе null
      this.tokenExpirationTime = data.expires_in ? Date.now() + (data.expires_in * 1000) : null;
      localStorage.setItem('accessToken', this.accessToken);
      if (this.refreshToken) {
        localStorage.setItem('refreshToken', this.refreshToken);
      }
      
      // Сохраняем пользователя с ролью
      this.user = {
        ...data.user,
        role: data.user.role || 'Администратор' // Устанавливаем роль по умолчанию для админа
      };
      localStorage.setItem('user', JSON.stringify(this.user));
    },

    clearAuth() {
      this.user = null;
      this.accessToken = null;
      this.refreshToken = null;
      this.tokenExpirationTime = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    },

    async fetchUserProfile() {
      try {
        const response = await axios.get('/api/my-profile');
        // Сохраняем пользователя с ролью
        
        localStorage.setItem('user', JSON.stringify(this.user));
        this.authStatus = true;
      } catch (error) {
        console.error('Error fetching user profile:', error);
        this.clearAuth();
        throw error;
      }
    },

    async silentRefresh() {
      if (!this.refreshToken) return false;
      try {
        const response = await axios.post('/api/auth/refresh', {
          refreshToken: this.refreshToken
        });
        this.setTokens(response.data);
        return true;
      } catch (error) {
        console.error('Silent refresh error:', error);
        this.clearAuth();
        return false;
      }
    },

    async checkAuth() {
      if (!this.accessToken) return false;
      if (this.tokenExpirationTime && Date.now() > this.tokenExpirationTime - 5 * 60 * 1000) {
        return await this.silentRefresh();
      }
      return true;
    }
  }
});
