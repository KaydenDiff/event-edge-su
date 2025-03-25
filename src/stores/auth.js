// authStore.js
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null, // Загружаем пользователя из localStorage
  }),

  actions: {
    setUser(userData) {
      this.user = userData;
      localStorage.setItem('user', JSON.stringify(userData)); // Сохраняем данные о пользователе в localStorage
    },

    logout() {
      this.user = null;
      localStorage.removeItem('user'); // Удаляем данные о пользователе из localStorage
    }
  }
});
