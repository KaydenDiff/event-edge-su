<template>
  <div>
    <!-- Кнопка уведомлений -->
    <button class="notification-btn" @click="toggleNotifications">
      <i class="fa fa-bell"></i>
      <span class="notification-count" v-if="unreadCount > 0">
        {{ unreadCount }}
      </span>
    </button>

    <!-- Выпадающий список уведомлений -->
    <transition name="fade">
      <div v-if="showNotifications" class="notification-dropdown">
        <h3>Уведомления</h3>
        <!-- Список всех уведомлений (показываются все или только непрочитанные) -->
        <ul v-if="showAllNotificationsView">
          <li v-for="notification in notifications" :key="notification.id">
            {{ notification.message }}
          </li>
        </ul>
        
        <!-- Список только непрочитанных уведомлений -->
        <ul v-else>
          <li v-for="notification in unreadNotifications" :key="notification.id">
            {{ notification.message }}
          </li>
        </ul>

        <!-- Сообщение, если нет уведомлений -->
        <p v-if="notifications.length === 0" class="no-notifications">Нет уведомлений</p>

        <!-- Кнопка для отображения всех уведомлений -->
        <button v-if="notifications.length > unreadNotifications.length" @click="toggleShowAllNotifications" class="show-all-btn">
          Все уведомления
        </button>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from "axios";
import { useAuthStore } from "@/stores/auth.js";
export default {
  name: "NotificationButton",
  data() {
    return {
      notifications: [], // Список всех уведомлений
      unreadNotifications: [], // Список только непрочитанных уведомлений
      showNotifications: false, // Показывать ли список уведомлений
      showAllNotificationsView: false, // Показывать ли все уведомления
      unreadCount: 0, // Количество непрочитанных уведомлений
    };
  },
  mounted() {
    this.fetchNotifications(); // Загрузка при монтировании
  },
  methods: {
    async fetchNotifications() {
      try {
        const authStore = useAuthStore();
        const token = authStore.accessToken;

        const response = await axios.get("http://event-edge-su/api/notifications", {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.notifications = response.data.notifications;
        // Подсчет непрочитанных уведомлений
        this.unreadNotifications = this.notifications.filter(n => n.status === "unread");
        this.unreadCount = this.unreadNotifications.length;
      } catch (error) {
        console.error("Ошибка при загрузке уведомлений:", error);
      }
    },

    async markNotificationsAsRead() {
      try {
        const authStore = useAuthStore();
        const token = authStore.accessToken;
        if (!token) {
          console.error("Токен не найден");
          return;
        }
        // Отправляем запрос на сервер для пометки всех уведомлений как прочитанных
        const response = await axios.get("http://event-edge-su/api/notifications/unread", {
          headers: {
            'Authorization': `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (response.status === 200) {
          // Обновляем список уведомлений локально
          this.notifications.forEach(notification => {
            notification.status = 'read'; // Устанавливаем статус как прочитано
          });
          
        }
      } catch (error) {
        console.error("Ошибка при обновлении статуса уведомлений:", error);
      }
    },

    toggleNotifications() {
      this.showNotifications = !this.showNotifications;
      if (this.showNotifications) {
        // Когда уведомления открыты, обновляем их только при переключении на все уведомления
        if (!this.showAllNotificationsView) {
          // Помечаем все уведомления как прочитанные только при переключении на все
          this.markNotificationsAsRead();
          this.unreadCount = 0;
        }
      }
    },

    toggleShowAllNotifications() {
      this.showAllNotificationsView = !this.showAllNotificationsView;
      if (this.showAllNotificationsView) {
        // При переключении на все уведомления, помечаем все как прочитанные
        this.markNotificationsAsRead();
        this.unreadCount = 0;
      }
    },
  },
};
</script>

<style scoped>
.notification-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #630181;
  color: white;
  padding: 15px;
  border-radius: 50%;
  border: none;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  font-size: 20px;
  cursor: pointer;
  z-index: 1000;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.notification-btn:hover {
  background-color: #8a2be2;
  transform: scale(1.1);
}

.notification-btn i {
  font-size: 1.5rem;
}

.notification-count {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: red;
  color: rgb(0, 0, 0);
  font-size: 0.9rem;
  font-weight: bold;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.notification-dropdown {
  position: fixed;
  bottom: 70px;
  right: 80px;
  width: 250px;
  background: rgb(77, 77, 77);
  border-radius: 8px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  padding: 10px;
  z-index: 1001;
}

.notification-dropdown h3 {
  font-size: 16px;
  margin-bottom: 10px;
}

.notification-dropdown ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.notification-dropdown li {
  padding: 8px;
  border-bottom: 1px solid #ddd;
  font-size: 14px;
}

.notification-dropdown li:last-child {
  border-bottom: none;
}

.no-notifications {
  font-size: 14px;
  text-align: center;
  color: #888;
}

.show-all-btn {
  background: #630181;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-top: 10px;
  transition: background 0.3s ease;
}

.show-all-btn:hover {
  background: #8a2be2;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
