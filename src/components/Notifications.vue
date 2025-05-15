<template>
  <div class="notification-card" :class="{ 'unread': notification.status === 'unread' }">
    <div class="notification-header">
      <div class="notification-icon">
        <i :class="getNotificationIcon(notification)"></i>
      </div>
      <div class="notification-timestamp">
        {{ formatDate(notification.created_at) }}
      </div>
    </div>
    <div class="notification-content">
      <p>{{ notification.message }}</p>
    </div>
    <div class="notification-actions" v-if="showActions">
      <button @click="markAsRead(notification.id)" 
              class="read-button" 
              v-if="notification.status === 'unread'">
        Отметить прочитанным
      </button>
      <button @click="$emit('delete', notification.id)" class="delete-button">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotificationCard',
  props: {
    notification: {
      type: Object,
      required: true
    },
    showActions: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        // Today: show time only
        return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      } else if (diffDays === 1) {
        // Yesterday
        return 'Вчера, ' + date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      } else if (diffDays < 7) {
        // This week
        const options = { weekday: 'long', hour: '2-digit', minute: '2-digit' };
        return date.toLocaleDateString('ru-RU', options);
      } else {
        // More than a week ago
        const options = { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' };
        return date.toLocaleDateString('ru-RU', options);
      }
    },
    getNotificationIcon(notification) {
      const data = notification.data || {};
      const type = data.type || '';
      
      // Determine icon based on notification type
      switch(type) {
        case 'tournament-start':
          return 'fas fa-trophy';
        case 'match-reschedule':
          return 'fas fa-calendar-alt';
        case 'match-result':
          return 'fas fa-poll';
        case 'next-stage':
          return 'fas fa-layer-group';
        case 'team-elimination':
          return 'fas fa-user-slash';
        case 'team-registration':
        case 'team-registration-accept':
          return 'fas fa-users';
        default:
          return 'fas fa-bell';
      }
    },
    markAsRead(id) {
      this.$emit('mark-read', id);
    }
  }
}
</script>

<style scoped>
.notification-card {
  background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  transition: all 0.3s ease;
  border-left: 3px solid #666;
  position: relative;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.notification-card.unread {
  border-left: 3px solid #630181;
  background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
}

.notification-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.notification-icon {
  color: #630181;
  font-size: 1.2rem;
}

.notification-timestamp {
  font-size: 0.8rem;
  color: #aaa;
}

.notification-content {
  color: #fff;
  font-size: 0.95rem;
  line-height: 1.4;
}

.notification-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
}

.read-button {
  background: rgba(99, 1, 129, 0.2);
  color: #fff;
  border: 1px solid rgba(99, 1, 129, 0.5);
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.read-button:hover {
  background: rgba(99, 1, 129, 0.4);
}

.delete-button {
  background: rgba(255, 59, 48, 0.2);
  color: #ff3b30;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.delete-button:hover {
  background: rgba(255, 59, 48, 0.4);
}
</style> 