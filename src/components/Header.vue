<script setup>
import { onMounted, computed, ref } from "vue";
import { useAuthStore } from '@/stores/auth';
import { useRouter } from "vue-router";
import { icons } from '@/assets/icons';

const authStore = useAuthStore();
const router = useRouter();
const isMobile = ref(window.innerWidth <= 768);
const activeDropdown = ref(null);
const activeSubmenu = ref(null);

const user = computed(() => authStore.user);
const isAdmin = computed(() => user.value?.role === "Администратор");
const isOrganizer = computed(() => user.value?.role === "Оператор");

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

const toggleDropdown = (name) => {
  if (activeDropdown.value === name) {
    activeDropdown.value = null;
    activeSubmenu.value = null;
  } else {
    activeDropdown.value = name;
    activeSubmenu.value = null;
  }
};

const toggleSubmenu = (name, event) => {
  event.stopPropagation();
  if (activeSubmenu.value === name) {
    activeSubmenu.value = null;
  } else {
    activeSubmenu.value = name;
  }
};

const closeAllMenus = () => {
  activeDropdown.value = null;
  activeSubmenu.value = null;
};

const logout = async () => {
  try {
    authStore.logout();
    closeAllMenus();
    await router.push("/login");
  } catch (error) {
    console.error("Ошибка при выходе:", error);
  }
};

onMounted(() => {
  window.addEventListener('resize', checkMobile);
  checkMobile();
});
</script>

<template>
  <nav class="navbar">
    <div class="nav-left"></div>
    <div class="nav-right">
      <template v-if="user">
        <div class="dropdown" v-if="isAdmin">
          <button 
            class="nav-link dropdown-toggle"
            @click="isMobile ? toggleDropdown('admin') : null"
            @mouseenter="!isMobile ? activeDropdown = 'admin' : null"
          >
            <i class="fas fa-cog"></i>
            <span>Управление</span>
            <i class="fas fa-chevron-down" :class="{ 'rotate-180': activeDropdown === 'admin' }"></i>
          </button>
          <div 
            class="dropdown-menu dropdown-menu-right"
            :class="{ 'show': activeDropdown === 'admin' }"
            @mouseleave="!isMobile ? activeDropdown = null : null"
          >
            <router-link to="/admin" class="dropdown-item" @click="closeAllMenus">
              <i class="fas fa-shield-alt"></i>
              Админ-панель
            </router-link>
            <router-link to="/help?section=admin" class="dropdown-item" @click="closeAllMenus">
              <i class="fas fa-question-circle"></i>
              Справка для администратора
            </router-link>
          </div>
        </div>
        
        <div class="dropdown">
          <button 
            class="nav-link dropdown-toggle"
            @click="isMobile ? toggleDropdown('tournaments') : null"
            @mouseenter="!isMobile ? activeDropdown = 'tournaments' : null"
          >
            Турниры
            <i class="fas fa-chevron-down" :class="{ 'rotate-180': activeDropdown === 'tournaments' }"></i>
          </button>
          <div 
            class="dropdown-menu"
            :class="{ 'show': activeDropdown === 'tournaments' }"
            @mouseleave="!isMobile ? activeDropdown = null : null"
          >
            <router-link to="/tournaments" class="dropdown-item" @click="closeAllMenus">
              <i class="fas fa-list"></i>
              Все турниры
            </router-link>
            <router-link 
              v-if="isOrganizer || isAdmin" 
              to="/organize-tournament" 
              class="dropdown-item"
              @click="closeAllMenus"
            >
              <i class="fas fa-plus-circle"></i>
              Создать турнир
            </router-link>
            <template v-if="user">
              <div class="dropdown-submenu">
                <div 
                  class="dropdown-item submenu-toggle"
                  @click="isMobile ? toggleSubmenu('matches', $event) : null"
                  @mouseenter="!isMobile ? activeSubmenu = 'matches' : null"
                >
                  <span v-html="icons.match"></span>
                  Мои матчи
                  <i class="fas" :class="isMobile ? (activeSubmenu === 'matches' ? 'fa-chevron-down' : 'fa-chevron-right') : 'fa-chevron-right'"></i>
                </div>
                <div 
                  class="dropdown-submenu-content"
                  :class="{ 'show': activeSubmenu === 'matches' }"
                  @mouseleave="!isMobile ? activeSubmenu = null : null"
                >
                  <router-link 
                    to="/my-matches?tab=upcoming" 
                    class="dropdown-item"
                    @click="closeAllMenus"
                  >
                    Предстоящие
                  </router-link>
                  <router-link 
                    to="/my-matches?tab=completed" 
                    class="dropdown-item"
                    @click="closeAllMenus"
                  >
                    Завершённые
                  </router-link>
                </div>
              </div>
              <div 
                class="dropdown-submenu" 
                v-if="isOrganizer||isAdmin"
              >
                <div 
                  class="dropdown-item submenu-toggle"
                  @click="isMobile ? toggleSubmenu('my-tournaments', $event) : null"
                  @mouseenter="!isMobile ? activeSubmenu = 'my-tournaments' : null"
                >
                  <span v-html="icons.tournament"></span>
                  Мои турниры
                  <i class="fas" :class="isMobile ? (activeSubmenu === 'my-tournaments' ? 'fa-chevron-down' : 'fa-chevron-right') : 'fa-chevron-right'"></i>
                </div>
                <div 
                  class="dropdown-submenu-content"
                  :class="{ 'show': activeSubmenu === 'my-tournaments' }"
                  @mouseleave="!isMobile ? activeSubmenu = null : null"
                >
                  <router-link 
                    to="/my-tournaments?tab=upcoming" 
                    class="dropdown-item"
                    @click="closeAllMenus"
                  >
                    Предстоящие
                  </router-link>
                  <router-link 
                    to="/my-tournaments?tab=completed" 
                    class="dropdown-item"
                    @click="closeAllMenus"
                  >
                    Завершённые
                  </router-link>
                </div>
              </div>
            </template>
            <router-link 
              to="/help?section=tournaments" 
              class="dropdown-item"
              @click="closeAllMenus"
            >
              <i class="fas fa-question-circle"></i>
              Справка по турнирам
            </router-link>
          </div>
        </div>
        
        <router-link to="/profile" class="nav-link profile-link" @click="closeAllMenus">
          <span v-html="icons.profile"></span>
          <span>Профиль</span>
        </router-link>
        <button @click="logout" class="logout-button">
          <span v-html="icons.logout"></span>
        </button>
      </template>
      <router-link v-else to="/login" class="login-link" @click="closeAllMenus">
        <span v-html="icons.login"></span>
        <span>Вход</span>
      </router-link>
    </div>
  </nav>
</template>

<style scoped>
/* Основные стили шапки */
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
  width: 1200px;
  max-width: 100%;
  border-radius: 0 0 15px 15px; 
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  font-size: 16px;
}

.nav-left, .nav-right {
  display: flex;
  align-items: center;
}

.nav-right {
  gap: 20px;
}

/* Стили навигационных ссылок */
.nav-link, .dropdown-toggle, .login-link {
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
  height: 40px;
  background: none;
  border: none;
  cursor: pointer;
}

.nav-link:hover, .dropdown-toggle:hover, .login-link:hover {
  color: #ffffff;
}

.nav-link::after, .dropdown-toggle::after, .login-link::after {
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

.nav-link:hover::after, .dropdown-toggle:hover::after, .login-link:hover::after {
  transform: scaleX(1);
}

/* Стили выпадающих меню */
.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 250px;
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
  z-index: 1001;
}

.dropdown-menu-right {
  left: auto;
  right: 0;
}

.dropdown:hover .dropdown-menu:not(.show) {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-menu.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  color: #fff;
  text-decoration: none;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.dropdown-item:hover {
  background: rgba(182, 0, 254, 0.1);
  color: #630181;
}

/* Стили подменю */
.dropdown-submenu {
  position: relative;
}

.dropdown-submenu-content {
  position: absolute;
  left: 100%;
  top: 0;
  min-width: 220px;
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
  z-index: 1002;
}

.dropdown-submenu:hover .dropdown-submenu-content:not(.show) {
  opacity: 1;
  visibility: visible;
  transform: translateX(0);
}

.dropdown-submenu-content.show {
  opacity: 1;
  visibility: visible;
  transform: translateX(0);
}

/* Иконки */
.fas {
  transition: transform 0.3s ease;
}

.rotate-180 {
  transform: rotate(180deg);
}

/* Стили для мобильных устройств */
@media (max-width: 768px) {
  .navbar {
    padding: 10px 15px;
    width: 70%;
   border-radius: 0 0 15px 15px; 
    box-sizing: border-box;
  }
  
  .nav-right {
    gap: 10px;
  }
  
  .nav-link, .dropdown-toggle, .login-link {
    padding: 8px 10px;
    font-size: 14px;
  }
  
  .dropdown-menu {
    position: fixed;
    top: 60px;
    left: 10px;
    right: 10px;
    width: calc(100% - 20px);
    max-height: calc(100vh - 70px);
    overflow-y: auto;
    z-index: 1001;
  }
  
  .dropdown-menu-right {
    left: 10px;
    right: auto;
  }
  
  .dropdown-submenu-content {
    position: static;
    margin-left: 0;
    margin-top: 5px;
    transform: none;
    box-shadow: none;
    border: none;
    padding-left: 20px;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
  }
  
  .dropdown-submenu-content.show {
    max-height: 300px;
  }
  
  .dropdown-item {
    padding: 10px 15px;
  }
  
  .submenu-toggle {
    display: flex;
    justify-content: start;
    align-items: center;
  }
  
  .submenu-toggle .fas {
    transition: transform 0.3s ease;
  }
  
  .dropdown-submenu-content .dropdown-item {
    padding-left: 30px;
  }
  
  /* Затемнение фона при открытом меню */
  
}

/* Анимации */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.dropdown-menu.show {
  animation: fadeIn 0.3s ease forwards;
}

.dropdown-submenu-content.show {
  animation: fadeIn 0.3s ease forwards;
}

/* Кнопка выхода */
.logout-button {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-button:hover {
  opacity: 0.8;
}
</style>