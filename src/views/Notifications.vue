<template>
  <div class="notifications-page">
    <h1 class="page-title">
      <i class="fas fa-bell"></i> Уведомления
    </h1>

    <!-- Фильтры -->
    <div class="filters-container">
      <div class="filter-item">
        <label for="filter-type">Фильтр по типу:</label>
        <select id="filter-type" v-model="filterType" class="select-field">
          <option value="all">Все уведомления</option>
          <option value="unread">Непрочитанные</option>
          <option value="tournament">Турниры</option>
          <option value="match">Матчи</option>
          <option value="team">Команды</option>
        </select>
      </div>
      <button @click="markAllAsRead" class="action-button" v-if="unreadCount > 0">
        <i class="fas fa-check-double"></i> Отметить все как прочитанные
      </button>
    </div>

    <!-- Состояние загрузки -->
    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Загрузка уведомлений...</p>
    </div>

    <!-- Ошибка загрузки -->
    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
      <button @click="fetchNotifications" class="retry-button">
        Попробовать снова
      </button>
    </div>

    <!-- Пусто -->
    <div v-else-if="filteredNotifications.length === 0" class="empty-state">
      <i class="fas fa-bell-slash"></i>
      <p>У вас нет уведомлений</p>
    </div>

    <!-- Список уведомлений -->
    <div v-else class="notifications-list">
      <notification-card 
        v-for="notification in filteredNotifications" 
        :key="notification.id"
        :notification="notification"
        :showActions="true"
        @mark-read="markAsRead"
        @delete="deleteNotification"
      />

      <!-- Пагинация, если будет много уведомлений -->
      <div v-if="hasMoreNotifications" class="pagination">
        <button @click="loadMoreNotifications" :disabled="loadingMore" class="load-more-button">
          {{ loadingMore ? 'Загрузка...' : 'Загрузить еще' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import NotificationCard from '@/components/Notifications.vue';
import { inject } from 'vue';

export default {
  name: "NotificationsPage",
  components: {
    NotificationCard
  },
  setup() {
    // Инжектим сервис уведомлений из плагина
    const notificationsService = inject('notifications');
    return { notificationsService };
  },
  data() {
    return {
      filterType: "all",
      notifications: [],
      loading: true,
      loadingMore: false,
      error: null,
      unreadCount: 0,
      page: 1,
      hasMoreNotifications: false
    };
  },
  computed: {
    filteredNotifications() {
      if (this.filterType === "all") {
        return this.notifications;
      }
      
      if (this.filterType === "unread") {
        return this.notifications.filter(n => n.status === "unread");
      }
      
      if (this.filterType === "tournament") {
        return this.notifications.filter(n => {
          const data = n.data || {};
          return data.type && data.type.includes('tournament');
        });
      }
      
      if (this.filterType === "match") {
        return this.notifications.filter(n => {
          const data = n.data || {};
          return data.type && data.type.includes('match');
        });
      }
      
      if (this.filterType === "team") {
        return this.notifications.filter(n => {
          const data = n.data || {};
          return data.type && data.type.includes('team');
        });
      }
      
      return this.notifications;
    }
  },
  methods: {
    async fetchNotifications() {
      this.loading = true;
      this.error = null;
      this.page = 1;
      
      try {
        // Получаем уведомления через плагин
        const result = await this.notificationsService.fetchUserNotifications();
        
        if (result.success) {
          this.notifications = result.notifications || [];
          this.unreadCount = result.unreadCount || 0;
          
          // Если API поддерживает пагинацию, проверяем наличие следующей страницы
          this.hasMoreNotifications = Array.isArray(this.notifications) && 
                                     this.notifications.length >= 50; // предполагаем, что 50 это размер страницы
        } else {
          console.error("Ошибка при загрузке уведомлений:", result.error);
          this.error = result.error || "Произошла ошибка при загрузке уведомлений";
        }
      } catch (error) {
        console.error("Ошибка при загрузке уведомлений:", error);
        this.error = "Произошла ошибка при загрузке уведомлений";
      } finally {
        this.loading = false;
      }
    },
    
    async loadMoreNotifications() {
      if (this.loadingMore) return;
      
      this.loadingMore = true;
      this.page += 1;
      
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.token) return;
        
        const response = await axios.get(`http://event-edge-su/api/notifications?page=${this.page}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json"
          }
        });
        
        const newNotifications = response.data.notifications || [];
        this.notifications = [...this.notifications, ...newNotifications];
        
        // Если получили меньше элементов, чем ожидалось, значит следующей страницы нет
        this.hasMoreNotifications = newNotifications.length >= 50;
      } catch (error) {
        console.error("Ошибка при загрузке дополнительных уведомлений:", error);
      } finally {
        this.loadingMore = false;
      }
    },
    
    async markAsRead(id) {
      try {
        // Обновляем локально сразу для лучшего UX
        const index = this.notifications.findIndex(n => n.id === id);
        if (index !== -1) {
          this.notifications[index].status = 'read';
          if (this.unreadCount > 0) this.unreadCount -= 1;
        }
        
        // Используем плагин для отметки как прочитанное
        const result = await this.notificationsService.markAsRead(id);
        
        if (!result.success) {
          console.error("Ошибка при отметке уведомления:", result.error);
          this.fetchNotifications(); // Перезагружаем список в случае ошибки
        }
      } catch (error) {
        console.error("Ошибка при отметке уведомления как прочитанное:", error);
        this.fetchNotifications(); // Перезагружаем список в случае ошибки
      }
    },
    
    async markAllAsRead() {
      try {
        // Обновляем локально сразу
        this.notifications.forEach(notification => {
          notification.status = 'read';
        });
        this.unreadCount = 0;
        
        // Используем плагин для отметки всех как прочитанные
        const result = await this.notificationsService.markAllAsRead();
        
        if (!result.success) {
          console.error("Ошибка при отметке всех уведомлений:", result.error);
          this.fetchNotifications(); // Перезагружаем список в случае ошибки
        }
      } catch (error) {
        console.error("Ошибка при отметке всех уведомлений как прочитанные:", error);
        this.fetchNotifications(); // Перезагружаем список в случае ошибки
      }
    },
    
    async deleteNotification(id) {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.token) return;
        
        // Обновляем локально сразу
        const index = this.notifications.findIndex(n => n.id === id);
        if (index !== -1) {
          const wasUnread = this.notifications[index].status === 'unread';
          this.notifications.splice(index, 1);
          if (wasUnread && this.unreadCount > 0) this.unreadCount -= 1;
        }
        
        // Отправляем запрос на сервер (если API поддерживает удаление)
        await axios.delete(`http://event-edge-su/api/user/notifications/${id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json"
          }
        });
      } catch (error) {
        console.error("Ошибка при удалении уведомления:", error);
        // В случае ошибки перезагружаем данные
        this.fetchNotifications();
      }
    }
  },
  mounted() {
    this.fetchNotifications();
    
    // Добавляем слушатель для обновления уведомлений
    document.addEventListener('refresh-notifications', this.fetchNotifications);
  },
  beforeUnmount() {
    // Удаляем обработчик при размонтировании компонента
    document.removeEventListener('refresh-notifications', this.fetchNotifications);
  }
};
</script>

<style scoped>
.notifications-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 30px 20px;
}

.page-title {
  font-size: 2rem;
  color: #fff;
  margin-bottom: 30px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.page-title i {
  color: #630181;
}

.filters-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filter-item label {
  font-size: 0.9rem;
  color: #aaa;
}

.select-field {
  width: 250px;
  padding: 12px 15px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  background: #3c3c3c;
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.select-field:hover {
  background: #444444;
}

.select-field:focus {
  outline: none;
  border-color: #630181;
  box-shadow: 0 0 0 2px rgba(99, 1, 129, 0.3);
}

.select-field option {
  background: #2c2c2c;
  color: white;
  padding: 8px;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(99, 1, 129, 0.2);
  border: 1px solid rgba(99, 1, 129, 0.5);
  color: white;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-button:hover {
  background: rgba(99, 1, 129, 0.4);
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 15px;
  color: #aaa;
  text-align: center;
}

.loading-state i, .error-state i, .empty-state i {
  font-size: 2.5rem;
  opacity: 0.6;
}

.error-state {
  color: #ff3b30;
}

.empty-state {
  color: #aaa;
}

.retry-button {
  margin-top: 10px;
  padding: 8px 20px;
  background: rgba(99, 1, 129, 0.2);
  border: 1px solid rgba(99, 1, 129, 0.5);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-button:hover {
  background: rgba(99, 1, 129, 0.4);
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.load-more-button {
  padding: 10px 25px;
  background: linear-gradient(45deg, #630181, #9500ff);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
}

.load-more-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(99, 1, 129, 0.4);
}

.load-more-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .filters-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .select-field {
    width: 100%;
  }
}
</style>
  