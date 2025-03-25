<template>
    <div class="notifications-container">
      <h1 class="title">Уведомления</h1>
  
      <!-- Кнопка для отметки всех уведомлений как прочитанные -->
      <button @click="markAllAsRead" class="mark-all-button">Отметить все как прочитанные</button>
  
      <!-- Фильтры -->
      <div class="filters">
        <select v-model="filterType" @change="applyFilter">
          <option value="all">Все</option>
          <option value="unread">Непрочитанные</option>
          <option value="admin">От администрации</option>
          <option value="matches">Матчи</option>
        </select>
      </div>
  
      <!-- Список уведомлений -->
      <ul class="notifications-list">
        <li 
          v-for="notification in filteredNotifications" 
          :key="notification.id" 
          :class="{'unread': !notification.read}"
        >
          <div class="notification-header">
            <h3>{{ notification.title }}</h3>
            <span class="time">{{ formatDate(notification.date) }}</span>
          </div>
          <p>{{ notification.message }}</p>
          <button @click="markAsRead(notification.id)" class="read-button">
            {{ notification.read ? 'Прочитано' : 'Отметить как прочитанное' }}
          </button>
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  export default {
    name: "NotificationsPage",
    data() {
      return {
        filterType: "all",
        notifications: [
          { id: 1, title: "Новая заявка в турнир", message: "Игрок JohnDoe подал заявку", date: "2025-03-03T12:00:00", read: false },
          { id: 2, title: "Матч назначен", message: "Ваш следующий матч запланирован на 5 марта", date: "2025-03-02T10:30:00", read: true },
          { id: 3, title: "Сообщение от администрации", message: "Обновлены правила участия в турнирах", date: "2025-03-01T08:45:00", read: false }
        ]
      };
    },
    computed: {
      filteredNotifications() {
        if (this.filterType === "unread") {
          return this.notifications.filter(n => !n.read);
        } else if (this.filterType === "admin") {
          return this.notifications.filter(n => n.title.includes("администрации"));
        } else if (this.filterType === "matches") {
          return this.notifications.filter(n => n.title.includes("Матч"));
        }
        return this.notifications;
      }
    },
    methods: {
      markAsRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
          notification.read = true;
        }
      },
      markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
      },
      formatDate(dateString) {
        const options = { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('ru-RU', options);
      }
    }
  };
  </script>
  
  <style scoped>
  .notifications-container {
    max-width: 600px;
    margin: 20px auto;
    padding: 20px;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  }
  
  .title {
    font-size: 24px;
    text-align: center;
    margin-bottom: 15px;
  }
  
  .mark-all-button {
    background: #3498db;
    color: white;
    border: none;
    padding: 10px 15px;
    cursor: pointer;
    border-radius: 5px;
    display: block;
    margin: 0 auto 15px auto;
  }
  
  .filters select {
    width: 100%;
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ddd;
    margin-bottom: 15px;
  }
  
  .notifications-list {
    list-style: none;
    padding: 0;
  }
  
  .notifications-list li {
    padding: 15px;
    border-bottom: 1px solid #eee;
    transition: background 0.3s;
  }
  
  .notifications-list li.unread {
    background: #f9f9f9;
  }
  
  .notification-header {
    display: flex;
    justify-content: space-between;
    font-weight: bold;
  }
  
  .time {
    font-size: 0.9em;
    color: #888;
  }
  
  .read-button {
    background: #2ecc71;
    color: white;
    border: none;
    padding: 5px 10px;
    cursor: pointer;
    border-radius: 5px;
    margin-top: 5px;
  }
  
  .read-button:hover {
    background: #27ae60;
  }
  
  @media (max-width: 600px) {
    .notifications-container {
      width: 90%;
      padding: 15px;
    }
  
    .mark-all-button, .filters select, .read-button {
      width: 100%;
    }
  }
  </style>
  