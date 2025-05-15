<template>
  <div class="notification-wrapper">
    <!-- Кнопка уведомлений -->
    <button class="notification-btn" @click="toggleNotifications">
      <i class="fas fa-bell"></i>
      <span class="notification-count" v-if="unreadCount > 0">
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <!-- Выпадающий список уведомлений -->
    <transition name="fade">
      <div v-if="showNotifications" class="notification-dropdown">
        <div class="notification-header">
          <h3>Уведомления</h3>
          <div class="notification-actions">
            <button @click="toggleView" class="toggle-view-btn">
              {{ showAllNotificationsView ? 'Непрочитанные' : 'Все' }}
            </button>
            <button @click="markAllAsRead" class="mark-all-btn" v-if="unreadCount > 0">
              <i class="fas fa-check-double"></i>
            </button>
          </div>
        </div>

        <div class="notification-content">
          <!-- Список всех уведомлений -->
          <div v-if="showAllNotificationsView">
            <notification-card 
              v-for="notification in notifications" 
              :key="notification.id" 
              :notification="notification" 
              @mark-read="markAsRead"
            />
          </div>
          
          <!-- Список только непрочитанных уведомлений -->
          <div v-else>
            <notification-card 
              v-for="notification in unreadNotifications" 
              :key="notification.id" 
              :notification="notification" 
              @mark-read="markAsRead"
            />
          </div>

          <!-- Сообщение, если нет уведомлений -->
          <div class="no-notifications" v-if="displayedNotifications.length === 0">
            <i class="fas fa-bell-slash"></i>
            <p>{{ showAllNotificationsView ? 'Нет уведомлений' : 'Нет новых уведомлений' }}</p>
          </div>
        </div>

        <div class="notification-footer">
          <router-link to="/notifications" class="view-all-link" @click="showNotifications = false">
            Посмотреть все
          </router-link>
        </div>
      </div>
    </transition>

    <!-- Overlay для закрытия при клике вне компонента -->
    <div v-if="showNotifications" class="notification-overlay" @click="showNotifications = false"></div>
  </div>
</template>

<script>
import NotificationCard from "./Notifications.vue";
import { inject } from 'vue';

export default {
  name: "NotificationButton",
  components: {
    NotificationCard
  },
  data() {
    return {
      notifications: [], // Список всех уведомлений
      unreadNotifications: [], // Список только непрочитанных уведомлений
      showNotifications: false, // Показывать ли список уведомлений
      showAllNotificationsView: false, // Показывать ли все уведомления
      unreadCount: 0, // Количество непрочитанных уведомлений
      loading: false, // Загрузка данных
      error: null, // Ошибка при загрузке
      refreshInterval: null // Интервал для автоматического обновления
    };
  },
  computed: {
    displayedNotifications() {
      return this.showAllNotificationsView ? this.notifications : this.unreadNotifications;
    }
  },
  setup() {
    // Инжектим сервис уведомлений из плагина
    const notificationsService = inject('notifications');
    return { notificationsService };
  },
  mounted() {
    this.fetchNotifications(); // Загрузка при монтировании
    
    // Устанавливаем интервал для проверки новых уведомлений (каждые 30 секунд)
    this.refreshInterval = setInterval(() => {
      if (!this.showNotifications) { // Обновляем только если панель закрыта
        this.fetchNotifications(true); // Silent refresh
      }
    }, 30000);
    
    // Добавляем обработчик для закрытия при клике вне компонента
    document.addEventListener('click', this.closeOnClickOutside);
    
    // Добавляем слушатель для обновления уведомлений
    document.addEventListener('refresh-notifications', this.handleRefreshEvent);
  },
  beforeUnmount() {
    // Очищаем интервал и удаляем обработчики при размонтировании компонента
    clearInterval(this.refreshInterval);
    document.removeEventListener('click', this.closeOnClickOutside);
    document.removeEventListener('refresh-notifications', this.handleRefreshEvent);
  },
  methods: {
    async fetchNotifications(silent = false) {
      if (this.loading && !silent) return;
      
      this.loading = true;
      if (!silent) this.error = null;
      
      try {
        // Используем плагин для получения уведомлений
        const result = await this.notificationsService.fetchUserNotifications();
        
        if (result.success) {
          this.notifications = result.notifications || [];
          // Подсчет непрочитанных уведомлений
          this.unreadNotifications = this.notifications.filter(n => n.status === "unread");
          this.unreadCount = result.unreadCount || this.unreadNotifications.length;
        } else {
          console.error("Ошибка при загрузке уведомлений:", result.error);
          if (!silent) this.error = result.error || "Не удалось загрузить уведомления";
        }
      } catch (error) {
        if (!silent) {
          console.error("Ошибка при загрузке уведомлений:", error);
          this.error = "Не удалось загрузить уведомления";
        }
      } finally {
        this.loading = false;
      }
    },

    async markAsRead(id) {
      try {
        // Обновляем локально сразу для лучшего UX
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
          notification.status = 'read';
          this.unreadNotifications = this.notifications.filter(n => n.status === "unread");
          this.unreadCount = this.unreadNotifications.length;
        }
        
        // Используем плагин для отметки уведомления как прочитанное
        const result = await this.notificationsService.markAsRead(id);
        
        if (!result.success) {
          console.error("Ошибка при отметке уведомления:", result.error);
          // В случае ошибки перезагружаем все уведомления
          this.fetchNotifications(true);
        }
      } catch (error) {
        console.error("Ошибка при обновлении статуса уведомления:", error);
        // В случае ошибки перезагружаем все уведомления
        this.fetchNotifications(true);
      }
    },

    async markAllAsRead() {
      try {
        // Обновляем локально сразу для лучшего UX
        this.notifications.forEach(notification => {
          notification.status = 'read';
        });
        this.unreadNotifications = [];
        this.unreadCount = 0;
        
        // Используем плагин для отметки всех уведомлений как прочитанные
        const result = await this.notificationsService.markAllAsRead();
        
        if (!result.success) {
          console.error("Ошибка при отметке всех уведомлений:", result.error);
          // В случае ошибки перезагружаем все уведомления
          this.fetchNotifications(true);
        }
      } catch (error) {
        console.error("Ошибка при обновлении статуса уведомлений:", error);
        // В случае ошибки перезагружаем все уведомления
        this.fetchNotifications(true);
      }
    },

    toggleNotifications() {
      this.showNotifications = !this.showNotifications;
      if (this.showNotifications) {
        // Обновляем данные при открытии панели
        this.fetchNotifications();
      }
    },

    toggleView() {
      this.showAllNotificationsView = !this.showAllNotificationsView;
    },
    
    closeOnClickOutside(event) {
      const notificationWrapper = this.$el.querySelector('.notification-wrapper');
      const notificationButton = this.$el.querySelector('.notification-btn');
      
      // Проверяем, что клик был не внутри компонента и не на кнопке
      if (this.showNotifications && 
          notificationWrapper && 
          !notificationWrapper.contains(event.target) &&
          !notificationButton.contains(event.target)) {
        this.showNotifications = false;
      }
    },
    
    handleRefreshEvent() {
      this.fetchNotifications();
    }
  },
};
</script>

<style scoped>
.notification-wrapper {
  position: relative;
}

.notification-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #630181;
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  font-size: 20px;
  cursor: pointer;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.notification-btn:hover {
  background-color: #8a2be2;
  transform: scale(1.1);
}

.notification-btn i {
  font-size: 1.2rem;
}

.notification-count {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #ff3b30;
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
  border-radius: 50%;
  min-width: 18px;
  height: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 4px;
}

.notification-dropdown {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 320px;
  max-width: 90vw;
  background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
  border-radius: 12px;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.3);
  z-index: 1001;
  display: flex;
  flex-direction: column;
  max-height: 80vh;
  overflow: hidden;
  border: 1px solid rgba(182, 0, 254, 0.1);
}

.notification-header {
  padding: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-header h3 {
  font-size: 16px;
  color: #fff;
  margin: 0;
  font-weight: 600;
}

.notification-actions {
  display: flex;
  gap: 10px;
}

.toggle-view-btn, .mark-all-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.toggle-view-btn:hover, .mark-all-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.mark-all-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  padding: 0;
}

.notification-content {
  padding: 10px;
  overflow-y: auto;
  max-height: 400px;
  flex-grow: 1;
}

.no-notifications {
  padding: 30px 0;
  text-align: center;
  color: #aaa;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.no-notifications i {
  font-size: 24px;
  opacity: 0.5;
}

.no-notifications p {
  margin: 0;
  font-size: 14px;
}

.notification-footer {
  padding: 10px 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.view-all-link {
  color: #630181;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.3s ease;
}

.view-all-link:hover {
  color: #8a2be2;
  text-decoration: underline;
}

.notification-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background: transparent;
}

.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@media (max-width: 480px) {
  .notification-dropdown {
    width: 90vw;
    right: 5vw;
  }
}
</style>
