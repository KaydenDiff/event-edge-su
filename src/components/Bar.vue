<template>
    <div class="sidebar" :class="{ 'collapsed': isCollapsed }">
      <div class="sidebar-section" v-if="!isAdminRoute">
        <div class="section-header" @click="toggleSidebar">
          <h3 v-if="!isCollapsed">Навигация</h3>
          <i v-else class="fas fa-compass navigation-icon"></i>
          <i :class="['fas', isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left', 'toggle-icon']"></i>
        </div>
        <nav class="sidebar-nav">
          <router-link to="/" class="nav-item" :title="isCollapsed ? 'Главная' : ''">
            <i class="fas fa-home"></i>
            <span v-if="!isCollapsed">Главная</span>
          </router-link>
          <router-link to="/tournaments" class="nav-item" :title="isCollapsed ? 'Турниры' : ''">
            <i class="fas fa-trophy"></i>
            <span v-if="!isCollapsed">Турниры</span>
          </router-link>
          <router-link to="/teams" class="nav-item" :title="isCollapsed ? 'Команды' : ''">
            <i class="fas fa-users"></i>
            <span v-if="!isCollapsed">Команды</span>
          </router-link>
          <router-link to="/news" class="nav-item" :title="isCollapsed ? 'Новости' : ''">
            <i class="fas fa-newspaper"></i>
            <span v-if="!isCollapsed">Новости</span>
          </router-link>
          <router-link to="/help" class="nav-item" :title="isCollapsed ? 'Помощь' : ''">
            <i class="fas fa-question-circle"></i>
            <span v-if="!isCollapsed">Помощь</span>
          </router-link>
        </nav>
      </div>

      <div class="sidebar-section" v-if="isAdminRoute">
        <div class="section-header">
          <h3 v-if="!isCollapsed">Навигация</h3>
          <i v-else class="fas fa-compass navigation-icon"></i>
        </div>
        <nav class="sidebar-nav">
          <router-link to="/" class="nav-item" :title="isCollapsed ? 'Главная' : ''">
            <i class="fas fa-home"></i>
            <span v-if="!isCollapsed">Главная</span>
          </router-link>
          <router-link to="/tournaments" class="nav-item" :title="isCollapsed ? 'Турниры' : ''">
            <i class="fas fa-trophy"></i>
            <span v-if="!isCollapsed">Турниры</span>
          </router-link>
          <router-link to="/teams" class="nav-item" :title="isCollapsed ? 'Команды' : ''">
            <i class="fas fa-users"></i>
            <span v-if="!isCollapsed">Команды</span>
          </router-link>
          <router-link to="/news" class="nav-item" :title="isCollapsed ? 'Новости' : ''">
            <i class="fas fa-newspaper"></i>
            <span v-if="!isCollapsed">Новости</span>
          </router-link>
          <router-link to="/help" class="nav-item" :title="isCollapsed ? 'Помощь' : ''">
            <i class="fas fa-question-circle"></i>
            <span v-if="!isCollapsed">Помощь</span>
          </router-link>
        </nav>
        <div class="section-header">
          <h3 v-if="!isCollapsed">Панель администратора</h3>
          <i v-else class="fas fa-user-shield admin-icon"></i>
        </div>
        <nav class="sidebar-nav">
          <a href="#" class="nav-item" @click.prevent="selectMenu('home')" :class="{ active: selectedMenu === 'home' }" :title="isCollapsed ? 'Как пользоваться панелью администратора' : ''">
            <i class="fas fa-book"></i>
            <span v-if="!isCollapsed">Как пользоваться панелью администратора</span>
          </a>
          <a href="#" class="nav-item" @click.prevent="selectMenu('users')" :class="{ active: selectedMenu === 'users' }" :title="isCollapsed ? 'Управление пользователями' : ''">
            <i class="fas fa-users-cog"></i>
            <span v-if="!isCollapsed">Управление пользователями</span>
          </a>
          <a href="#" class="nav-item" @click.prevent="selectMenu('tournaments')" :class="{ active: selectedMenu === 'tournaments' }" :title="isCollapsed ? 'Управление турнирами' : ''">
            <i class="fas fa-trophy"></i>
            <span v-if="!isCollapsed">Управление турнирами</span>
          </a>
          <a href="#" class="nav-item" @click.prevent="selectMenu('matches')" :class="{ active: selectedMenu === 'matches' }" :title="isCollapsed ? 'Управление матчами' : ''">
            <i class="fas fa-gamepad"></i>
            <span v-if="!isCollapsed">Управление матчами</span>
          </a>
          <a href="#" class="nav-item" @click.prevent="selectMenu('statistics')" :class="{ active: selectedMenu === 'statistics' }" :title="isCollapsed ? 'Статистика' : ''">
            <i class="fas fa-chart-bar"></i>
            <span v-if="!isCollapsed">Статистика</span>
          </a>
          <a href="#" class="nav-item" @click.prevent="selectMenu('tournament-basket')" :class="{ active: selectedMenu === 'tournament-basket' }" :title="isCollapsed ? 'Турнирные сетки' : ''">
            <i class="fas fa-sitemap"></i>
            <span v-if="!isCollapsed">Турнирные сетки</span>
          </a>
          <a href="#" class="nav-item" @click.prevent="selectMenu('notifications')" :class="{ active: selectedMenu === 'notifications' }" :title="isCollapsed ? 'Уведомления' : ''">
            <i class="fas fa-bell"></i>
            <span v-if="!isCollapsed">Уведомления</span>
          </a>
        </nav>
      </div>

      <div class="sidebar-section" v-if="showGamesSection && (isTournamentsPage || isTeamsPage)">
        <div class="section-header">
          <h3 v-if="!isCollapsed">Игры</h3>
          <i v-else class="fas fa-gamepad games-icon"></i>
        </div>
        <div class="game-filters">
          <div 
            v-for="game in games" 
            :key="game.id || game.name"
            :class="['game-filter-item', { active: selectedGames.includes(game.name) }]"
            @click="toggleGame(game.name)"
            :title="isCollapsed ? game.name : ''"
          >
            <span v-if="!isCollapsed">{{ game.name }}</span>
            <i v-else class="fas fa-gamepad"></i>
          </div>
        </div>
      </div>

    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useAuthStore } from '@/stores/auth';

  const route = useRoute();
  const router = useRouter();
  const authStore = useAuthStore();

  const isCollapsed = ref(false);
  const showUserMenu = ref(false);

  const isTournamentsPage = computed(() => route.path === '/tournaments');
  const isTeamsPage = computed(() => route.path === '/teams');

  const props = defineProps({
    showGamesSection: {
      type: Boolean,
      default: false
    },
    games: {
      type: Array,
      default: () => []
    },
    selectedGames: {
      type: Array,
      default: () => []
    },
    selectedMenu: {
      type: String,
      default: 'home'
    },
    isAdminRoute: {
      type: Boolean,
      default: false
    }
  });

  const emit = defineEmits(['game-selected', 'menu-selected']);

  const toggleSidebar = () => {
    isCollapsed.value = !isCollapsed.value;
  };

  const toggleUserMenu = () => {
    showUserMenu.value = !showUserMenu.value;
  };

  const selectMenu = (section) => {
    emit('menu-selected', section);
  };

  const toggleGame = (gameName) => {
    emit('game-selected', gameName);
  };

  const handleLogout = async () => {
    try {
      await authStore.logout();
      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };
  </script>
  
  <style scoped>
  .sidebar {
    width: 280px;
    background: #1a1a1a;
    padding: 20px;
    height: 100vh;
    position: fixed;
    left: 0;
    top: 0;
    overflow-y: auto;
    transition: all 0.3s ease;
  }
  
  .sidebar.collapsed {
    width: 80px;
    padding: 20px 10px;
  }
  
  .toggle-button {
    position: absolute;
    right: 10px;
    top: 0px;
    background: #1a1a1a;
    border: none;
    color: #fff;
    width: 30px;
    height: 30px;
    border-radius: 0 4px 4px 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }
  
  .toggle-button:hover {
    background: #630181;
  }
  
  .sidebar-section {
    margin-bottom: 30px;
  }
  
  .section-header {
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .section-header:hover {
    background: rgba(99, 1, 129, 0.1);
    border-radius: 8px;
  }
  
  .toggle-icon {
    font-size: 16px;
    color: #fff;
    opacity: 0.7;
    transition: all 0.3s ease;
  }
  
  .section-header:hover .toggle-icon {
    opacity: 1;
    transform: translateX(2px);
  }
  
  .collapsed .section-header {
    justify-content: center;
  }
  
  .collapsed .toggle-icon {
    position: absolute;
    right: -30px;
    top: 20px;
    background: #1a1a1a;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0 4px 4px 0;
    cursor: pointer;
  }
  
  .collapsed .toggle-icon:hover {
    background: #630181;
  }
  
  .navigation-icon,
  .admin-icon,
  .games-icon {
    font-size: 24px;
    color: #fff;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(99, 1, 129, 0.2);
    border-radius: 8px;
    transition: all 0.3s ease;
  }
  
  .navigation-icon:hover,
  .admin-icon:hover,
  .games-icon:hover {
    background: #630181;
    transform: scale(1.1);
  }
  
  .game-filters {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .game-filter-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    color: #fff;
    background: transparent;
    white-space: nowrap;
    overflow: hidden;
  }
  
  .game-filter-item:hover {
    background: rgba(99, 1, 129, 0.2);
    transform: translateX(5px);
  }
  
  .game-filter-item.active {
    background: #630181;
    box-shadow: 0 0 15px rgba(99, 1, 129, 0.3);
  }
  
  .game-icon {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }
  
  .sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    color: #fff;
    text-decoration: none;
    border-radius: 8px;
    transition: all 0.3s ease;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
  }
  
  .nav-item:hover {
    background: rgba(99, 1, 129, 0.2);
    transform: translateX(5px);
  }
  
  .nav-item.active {
    background: #630181;
    box-shadow: 0 0 15px rgba(99, 1, 129, 0.3);
  }
  
  .nav-item i {
    width: 20px;
    text-align: center;
    font-size: 18px;
  }
  
  .nav-item span {
    opacity: 1;
    transition: opacity 0.3s ease;
  }
  
  .collapsed .nav-item span {
    opacity: 0;
    width: 0;
  }
  
  .collapsed .nav-item {
    justify-content: center;
    padding: 12px;
  }
  
  .collapsed .game-filter-item {
    justify-content: center;
    padding: 12px;
  }

  .user-menu {
    margin-top: auto;
    padding: 20px 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .user-info:hover {
    background: rgba(99, 1, 129, 0.2);
  }

  .user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
  }

  .user-dropdown {
    position: absolute;
    bottom: 100%;
    left: 0;
    width: 100%;
    background: #1a1a1a;
    border-radius: 8px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    z-index: 1000;
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    color: #fff;
    text-decoration: none;
    transition: all 0.3s ease;
  }

  .dropdown-item:hover {
    background: rgba(99, 1, 129, 0.2);
  }

  .dropdown-item i {
    width: 20px;
    text-align: center;
  }
  </style> 