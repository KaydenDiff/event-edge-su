<script setup>
import { onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";  // Для перенаправления
import { icons } from '@/assets/icons';
import { useAuthStore } from "@/stores/auth.js";
// Инициализация хранилища и роутера
const authStore = useAuthStore();
const router = useRouter();

// Извлекаем информацию о пользователе из хранилища
const user = computed(() => authStore.user);
const isAdmin = computed(() => authStore.isAdmin);
const isOrganizer = computed(() => authStore.isOrganizer);


// Логика для выхода
const logout = async () => {
  try {
    authStore.logout(); // Очистка состояния
    await router.push("/login"); // Перенаправление на страницу входа
  } catch (error) {
    console.error("Ошибка при выходе:", error);
  }
};
</script>

<template>
  <nav class="navbar">
    <div class="nav-left">
      <router-link to="/" class="nav-link">Главная</router-link>
    </div>
    <div class="nav-right">
      <template v-if="user">
        <div class="dropdown" v-if="isOrganizer||isAdmin">
          <button class="nav-link dropdown-toggle">
            <i class="fas fa-cog"></i>
            <span>Управление</span>
            <i class="fas fa-chevron-down"></i>
          </button>
          <div class="dropdown-menu dropdown-menu-right">
            <router-link v-if="isAdmin" to="/admin" class="dropdown-item">
              <i class="fas fa-shield-alt"></i>
              Админ-панель
            </router-link>
            <router-link to="/organize-tournament" class="dropdown-item">
              <i class="fas fa-trophy"></i>
              Создать турнир
            </router-link>
          </div>
        </div>
        <div class="dropdown">
        <button class="nav-link dropdown-toggle">
          Турниры
          <i class="fas fa-chevron-down"></i>
        </button>
        <div class="dropdown-menu">
          <router-link to="/tournaments" class="dropdown-item">Все турниры</router-link>
          <template v-if="user">
            <div class="dropdown-submenu">
              <router-link to="/my-matches" class="dropdown-item">
                <span v-html="icons.match"></span>
                Мои матчи
                <i class="fas fa-chevron-right"></i>
              </router-link>
              <div class="dropdown-submenu-content">
                <router-link to="/my-matches?tab=upcoming" class="dropdown-item">Предстоящие</router-link>
                <router-link to="/my-matches?tab=completed" class="dropdown-item">Завершённые</router-link>
              </div>
            </div>
            <div class="dropdown-submenu" v-if="isOrganizer||isAdmin">
              <router-link to="/my-tournaments" class="dropdown-item">
                <span v-html="icons.tournament"></span>
                Мои турниры
                <i class="fas fa-chevron-right"></i>
              </router-link>
              <div class="dropdown-submenu-content">
                <router-link to="/my-tournaments?tab=upcoming" class="dropdown-item">Предстоящие</router-link>
                <router-link to="/my-tournaments?tab=completed" class="dropdown-item">Завершённые</router-link>
              </div>
            </div>
          </template>
        </div>
      </div>
        <router-link to="/profile" class="nav-link profile-link">
          <span v-html="icons.profile"></span>
          <span>Профиль</span>
        </router-link>
    
    
        <button @click="logout" class="logout-button">
          <span v-html="icons.logout"></span>
          <span>Выйти</span>
        </button>
      </template>
      <router-link v-else to="/login" class="login-link">
        <span v-html="icons.login"></span>
        <span>Вход</span>
      </router-link>
    </div>
  </nav>
</template>

<style scoped>
/* Шапка на весь экран */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #630181;
  color: #fff;
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  width: 1200px; /* Фиксированная ширина */
  max-width: 100%; /* Максимальная ширина для мобильных устройств */
  border-radius: 0 0 15px 15px; 
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2); /* Добавляем тень */
  font-size: 20px; /* Установим фиксированный размер шрифта */
}

/* Логотип */
.logo {
  width: 40px; /* Размер логотипа */
  height: auto;
  margin-right: 20px; /* Отступ между логотипом и текстовыми ссылками */
}

/* Слева: Главная и Турниры */
.nav-left {
  display: flex;
  gap: 20px;
  align-items: center; /* Центрируем элементы вертикально */
}

.nav-link {
  text-decoration: none;
  color: #fff;
  padding: 8px 12px;
  border-radius: 5px;
  font-size: 20px;
  font-weight: 500;
  transition: color 0.3s;
  position: relative; /* Для добавления псевдоэлемента */
}

/* Эффект для навигационных ссылок */
.nav-link:hover {
  color: #ffffff; /* При наведении меняем цвет текста */
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #ffffff;
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

/* Появление линии при наведении */
.nav-link:hover::after {
  transform: scaleX(1); /* Появление линии снизу */
}

/* Справа: Профиль, Админка, Организовать турнир, Выйти */
.nav-right {
  display: flex;
  gap: 20px;
  align-items: center; /* Добавляем центрирование по вертикали */
}

.nav-right a, .logout-button, .dropdown-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: #fff;
  padding: 8px 12px;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 500;
  transition: color 0.3s;
  position: relative;
  height: 40px; /* Фиксированная высота для всех элементов */
}

/* Обновляем стили для иконок внутри nav-right */
.nav-right a svg, .logout-button svg, .dropdown-toggle svg {
  width: 24px;
  height: 24px;
  stroke: currentColor;
}

/* Обновляем стили для иконок Font Awesome */
.nav-right .fas {
  font-size: 16px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-right a:hover, .logout-button:hover {
  color: #ffffff;
}

.nav-right a::after, .logout-button::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #ffffff;
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.nav-right a:hover::after, .logout-button:hover::after {
  transform: scaleX(1);
}

.logout-button {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 16px;
  padding: 8px 12px;
  font-weight: 500;
  transition: color 0.3s;
}

.logout-button:hover {
  color: #ffffff;
}

/* Стиль для кнопки Вход */
.login-link {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: #fff;
  padding: 8px 12px;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 500;
  transition: color 0.3s;
}

.login-link svg {
  width: 24px;
  height: 24px;
  stroke: currentColor;
}

.login-link:hover {
  color: #ffffff;
}

.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-toggle {
  display: flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: color 0.3s;
}

.dropdown-toggle i {
  font-size: 0.8rem;
  transition: transform 0.3s ease;
}

.dropdown:hover .dropdown-toggle i {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 200px;
  background: #1a1a1a;
  border-radius: 8px;
  padding: 10px 0;
  margin-top: 5px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dropdown:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  color: #fff;
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
}

.dropdown-item:hover {
  background: rgba(182, 0, 254, 0.1);
  color: #630181;
}

.dropdown-submenu {
  position: relative;
}

.dropdown-submenu-content {
  position: absolute;
  left: 100%;
  top: 0;
  min-width: 200px;
  background: #1a1a1a;
  border-radius: 8px;
  padding: 10px 0;
  margin-left: 5px;
  opacity: 0;
  visibility: hidden;
  transform: translateX(10px);
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dropdown-submenu:hover .dropdown-submenu-content {
  opacity: 1;
  visibility: visible;
  transform: translateX(0);
}

.dropdown-submenu .dropdown-item {
  padding-right: 30px;
}

.dropdown-submenu .dropdown-item i {
  position: absolute;
  right: 10px;
  font-size: 0.8rem;
}

.dropdown-submenu-content .dropdown-item {
  padding-left: 30px;
}

.dropdown-submenu-content .dropdown-item:hover {
  background: rgba(182, 0, 254, 0.1);
  color: #630181;
}

.dropdown-menu-right {
  left: auto;
  right: 0;
}

.dropdown-menu .fas {
  width: 20px;
  text-align: center;
  margin-right: 8px;
  color: #630181;
}

/* Стили для иконки настроек */
.nav-link .fas {
  font-size: 16px;
  margin-right: 6px;
}

/* Обновленные стили для выпадающего меню */
.dropdown-menu {
  min-width: 180px;
}

/* Стили для разделителя в выпадающем меню */
.dropdown-menu > *:not(:last-child)::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 10px;
  right: 10px;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
}

/* Анимация для иконок при наведении */
.dropdown-item:hover .fas {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}
</style>
