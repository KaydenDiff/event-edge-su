<script setup>
import { onMounted, computed } from "vue";
import { useAuthStore } from '@/stores/auth';
import { useRouter } from "vue-router";  // Для перенаправления

// Инициализация хранилища и роутера
const authStore = useAuthStore();
const router = useRouter();

// Извлекаем информацию о пользователе из хранилища
const user = computed(() => authStore.user);
const isAdmin = computed(() => user.value?.role === "Администратор");
const isOrganizer = computed(() => user.value?.role === "organizer");

// Инициализация данных при монтировании компонента
onMounted(() => {
  // Здесь мы не вызываем authStore.initialize(), так как данные уже восстанавливаются из localStorage
 
});

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
      <router-link to="/tournaments" class="nav-link">Турниры</router-link>
      <router-link to="/tournament-bracket-admin" class="nav-link">Турнирная сетка</router-link>
    </div>
    <div class="nav-right">
   

      <!-- Если пользователь администратор -->
      <router-link v-if="isAdmin" to="/admin" class="nav-link">Админка</router-link>

      <!-- Если пользователь организатор -->
      <router-link v-if="isOrganizer||isAdmin" to="/organize-tournament" class="nav-link">Организовать турнир</router-link>
   <!-- Если пользователь авторизован -->
   <router-link v-if="user" to="/profile" class="nav-link">Мой профиль</router-link>
      <!-- Если пользователь авторизован, отображается кнопка выхода -->
      <button v-if="user" @click="logout" class="logout-button">Выйти</button>

      <!-- Если пользователь не авторизован, отображается ссылка на страницу входа -->
      <router-link v-else to="/login" class="login-link">Вход</router-link>
    </div>
  </nav>
</template>

<style scoped>
/* Шапка на весь экран */
.navbar {
  display: flex;
  justify-content: space-between; /* Расположение элементов слева и справа */
  align-items: center;
  padding: 20px;
  background: #000; /* Черный фон */
  color: #fff; /* Белый цвет для текста */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  width: 100%;
  font-size: 16px; /* Установим фиксированный размер шрифта */
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
  font-size: 1rem;
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
}

.nav-right a, .logout-button {
  text-decoration: none;
  color: #fff;
  padding: 8px 12px;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 500;
  transition: color 0.3s;
  position: relative;
}

.nav-right a:hover, .logout-button:hover {
  color: #ffffff; /* Цвет текста при наведении */
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
  transform: scaleX(1); /* Появление линии снизу */
}

.logout-button {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 8px 12px;
  font-weight: 500;
  transition: color 0.3s;
}

.logout-button:hover {
  color: #FF4C4C;
}

/* Стиль для кнопки Вход */
.login-link {
  text-decoration: none;
  color: #fff;
  padding: 8px 12px;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 500;
  transition: color 0.3s;
}

.login-link:hover {
  color: #ffffff;
}

/* Обеспечиваем, чтобы содержимое не перекрывалось шапкой */
body {
  padding-top: 200px; /* Отступ сверху */
}
</style>
