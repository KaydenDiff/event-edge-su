<template>
  <div class="sidebar" :class="{ 'collapsed': isCollapsed || isMobile }">
    <div class="sidebar-section" v-if="!isAdminRoute">
      <div class="section-header" @click="handleHeaderClick">
        <h3 v-if="!isCollapsed && !isMobile">Навигация</h3>
        <i v-else class="fas fa-compass navigation-icon"></i>
        <i v-if="!isCollapsed && !isMobile" class="fas fa-chevron-left toggle-icon" @click.stop="toggleSidebar"></i>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/" class="nav-item" :title="isCollapsed || isMobile ? 'Главная' : ''">
          <i class="fas fa-home"></i>
          <span v-if="!isCollapsed && !isMobile">Главная</span>
        </router-link>
        <router-link to="/tournaments" class="nav-item" :title="isCollapsed || isMobile ? 'Турниры' : ''">
          <i class="fas fa-trophy"></i>
          <span v-if="!isCollapsed && !isMobile">Турниры</span>
        </router-link>
        <router-link to="/teams" class="nav-item" :title="isCollapsed || isMobile ? 'Команды' : ''">
          <i class="fas fa-users"></i>
          <span v-if="!isCollapsed && !isMobile">Команды</span>
        </router-link>
        <router-link to="/news-feeds" class="nav-item" :title="isCollapsed || isMobile ? 'Новости' : ''">
          <i class="fas fa-newspaper"></i>
          <span v-if="!isCollapsed && !isMobile">Новости</span>
        </router-link>
        <router-link to="/help" class="nav-item" :title="isCollapsed || isMobile ? 'Помощь' : ''">
          <i class="fas fa-question-circle"></i>
          <span v-if="!isCollapsed && !isMobile">Помощь</span>
        </router-link>
      </nav>
    </div>

    <div class="sidebar-section" v-if="isAdminRoute">
      <div class="section-header" @click="handleHeaderClick">
        <h3 v-if="!isCollapsed && !isMobile">Навигация</h3>
        <i v-else class="fas fa-compass navigation-icon"></i>
        <i v-if="!isCollapsed && !isMobile" :class="['fas', isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left', 'toggle-icon']" @click.stop="toggleSidebar"></i>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/" class="nav-item" :title="isCollapsed || isMobile ? 'Главная' : ''">
          <i class="fas fa-home"></i>
          <span v-if="!isCollapsed && !isMobile">Главная</span>
        </router-link>
        <router-link to="/tournaments" class="nav-item" :title="isCollapsed || isMobile ? 'Турниры' : ''">
          <i class="fas fa-trophy"></i>
          <span v-if="!isCollapsed && !isMobile">Турниры</span>
        </router-link>
        <router-link to="/teams" class="nav-item" :title="isCollapsed || isMobile ? 'Команды' : ''">
          <i class="fas fa-users"></i>
          <span v-if="!isCollapsed && !isMobile">Команды</span>
        </router-link>
        <router-link to="/news-feeds" class="nav-item" :title="isCollapsed || isMobile ? 'Новости' : ''">
          <i class="fas fa-newspaper"></i>
          <span v-if="!isCollapsed && !isMobile">Новости</span>
        </router-link>
        <router-link to="/help" class="nav-item" :title="isCollapsed || isMobile ? 'Помощь' : ''">
          <i class="fas fa-question-circle"></i>
          <span v-if="!isCollapsed && !isMobile">Помощь</span>
        </router-link>
      </nav>
      <div class="section-header">
        <h3 v-if="!isCollapsed && !isMobile">Панель администратора</h3>
        <i v-else class="fas fa-user-shield admin-icon"></i>
      </div>
      <nav class="sidebar-nav">
        <a href="#" class="nav-item" @click.prevent="selectMenu('home')" :class="{ active: selectedMenu === 'home' }" :title="isCollapsed || isMobile ? 'Как пользоваться панелью администратора' : ''">
          <i class="fas fa-book"></i>
          <span v-if="!isCollapsed && !isMobile">Как пользоваться панелью администратора</span>
        </a>
        <a href="#" class="nav-item" @click.prevent="selectMenu('users')" :class="{ active: selectedMenu === 'users' }" :title="isCollapsed || isMobile ? 'Управление пользователями' : ''">
          <i class="fas fa-users-cog"></i>
          <span v-if="!isCollapsed && !isMobile">Управление пользователями</span>
        </a>
        <a href="#" class="nav-item" @click.prevent="selectMenu('tournaments')" :class="{ active: selectedMenu === 'tournaments' }" :title="isCollapsed || isMobile ? 'Управление турнирами' : ''">
          <i class="fas fa-trophy"></i>
          <span v-if="!isCollapsed && !isMobile">Управление турнирами</span>
        </a>
        <a href="#" class="nav-item" @click.prevent="selectMenu('matches')" :class="{ active: selectedMenu === 'matches' }" :title="isCollapsed || isMobile ? 'Управление матчами' : ''">
          <i class="fas fa-gamepad"></i>
          <span v-if="!isCollapsed && !isMobile">Управление матчами</span>
        </a>
        <a href="#" class="nav-item" @click.prevent="selectMenu('statistics')" :class="{ active: selectedMenu === 'statistics' }" :title="isCollapsed || isMobile ? 'Статистика' : ''">
          <i class="fas fa-chart-bar"></i>
          <span v-if="!isCollapsed && !isMobile">Статистика</span>
        </a>
        <a href="#" class="nav-item" @click.prevent="selectMenu('tournament-basket')" :class="{ active: selectedMenu === 'tournament-basket' }" :title="isCollapsed || isMobile ? 'Турнирные сетки' : ''">
          <i class="fas fa-sitemap"></i>
          <span v-if="!isCollapsed && !isMobile">Турнирные сетки</span>
        </a>
        <a href="#" class="nav-item" @click.prevent="selectMenu('news')" :class="{ active: selectedMenu === 'news' }" :title="isCollapsed || isMobile ? 'Новости' : ''">
          <i class="fas fa-newspaper"></i>
          <span v-if="!isCollapsed && !isMobile">Новости</span>
        </a>
        <a href="#" class="nav-item" @click.prevent="selectMenu('notifications')" :class="{ active: selectedMenu === 'notifications' }" :title="isCollapsed || isMobile ? 'Уведомления' : ''">
          <i class="fas fa-bell"></i>
          <span v-if="!isCollapsed && !isMobile">Уведомления</span>
        </a>
      </nav>
    </div>

 <div class="sidebar-section" v-if="showGamesSection && (isTournamentsPage || isTeamsPage) && !isMobile">
      <div class="section-header">
        <h3 v-if="!isCollapsed && !isMobile">Игры</h3>
        <i v-else class="fas fa-gamepad games-icon"></i>
      </div>
      <div class="game-filters">
        <div 
          v-for="game in games" 
          :key="game.id || game.name"
          :class="['game-filter-item', { active: selectedGames.includes(game.name) }]"
          @click="toggleGame(game.name)"
          :title="isCollapsed || isMobile ? game.name : ''"
        >
          <span v-if="!isCollapsed && !isMobile">{{ game.name }}</span>
          <i v-else class="fas fa-gamepad"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useRoute, useRouter } from 'vue-router';
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue';

export default {
  name: 'Sidebar',
  props: {
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
  },
  setup(props, { emit }) {
    const route = useRoute();
    const router = useRouter();
    const isCollapsed = ref(false);
    const isMobile = ref(window.innerWidth <= 768);
    
    const checkMobile = () => {
      isMobile.value = window.innerWidth <= 768;
      // На мобильных принудительно сворачиваем сайдбар
      if (isMobile.value) {
        isCollapsed.value = true;
      }
    };

    const isTournamentsPage = computed(() => {
      return route.path === '/tournaments';
    });

    const isTeamsPage = computed(() => {
      return route.path === '/teams';
    });

    const handleHeaderClick = () => {
      // На мобильных не разрешаем разворачивать сайдбар
      if (!isMobile.value) {
        isCollapsed.value = !isCollapsed.value;
      }
    };

    const toggleSidebar = () => {
      // На мобильных игнорируем переключение
      if (!isMobile.value) {
        isCollapsed.value = !isCollapsed.value;
      }
    };

    onMounted(() => {
      window.addEventListener('resize', checkMobile);
      checkMobile(); // Проверяем при загрузке
      
      if (route.query.section && props.isAdminRoute) {
        const section = route.query.section.replace('admin-', '');
        if (section) {
          emit('menu-selected', section);
        }
      }
    });

    onBeforeUnmount(() => {
      window.removeEventListener('resize', checkMobile);
    });

    watch(() => route.query.section, (newSection) => {
      if (newSection && props.isAdminRoute) {
        const section = newSection.replace('admin-', '');
        if (section) {
          emit('menu-selected', section);
        }
      }
    });

    const selectMenu = (section) => {
      router.push({ 
        path: route.path,
        query: { 
          ...route.query,
          section: `admin-${section}` 
        }
      });
      emit('menu-selected', section);
    };

    return {
      isTournamentsPage,
      isTeamsPage,
      selectMenu,
      isCollapsed,
      isMobile,
      handleHeaderClick,
      toggleSidebar
    };
  },
  methods: {
    toggleGame(gameName) {
      this.$emit('game-selected', gameName);
    }
  }
}
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
  z-index: 1000;
}

.sidebar.collapsed {
  width: 80px;
  padding: 20px 10px;
}

.sidebar-section {
  margin-bottom: 30px;
}

.section-header {
  margin-top: 15px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  cursor: pointer;
}

.section-header h3 {
  color: #fff;
  font-size: 1.1rem;
  margin: 0;
}

.toggle-icon {
  font-size: 16px;
  color: #fff;
  opacity: 0.7;
  transition: all 0.3s ease;
  cursor: pointer;
}

.section-header:hover .toggle-icon {
  opacity: 1;
  transform: translateX(2px);
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
}

.game-filter-item.active {
  background: #630181;
  box-shadow: 0 0 15px rgba(99, 1, 129, 0.3);
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

.collapsed .game-filter-item span {
  display: none;
}

@media (max-width: 768px) {
  .sidebar {
    width: 80px;
    padding: 20px 10px;
  }
  
  .section-header {
    justify-content: center;
  }
  
  .section-header h3 {
    display: none;
  }
  
  .toggle-icon {
    display: none;
  }
  
  .nav-item span {
    display: none;
  }
  
  .game-filter-item span {
    display: none;
  }
}
</style>