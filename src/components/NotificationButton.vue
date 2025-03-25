<template>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <button class="notification-btn" @click="handleNotificationClick">
      <i class="fa fa-bell"></i>
      <span class="notification-count" v-if="notificationCount > 0">{{ notificationCount }}</span>
    </button>
  </template>
  
  <script>
  export default {
    name: 'NotificationButton',
    data() {
      return {
        notificationCount: 3, // Пример количества уведомлений
      };
    },
    methods: {
      handleNotificationClick() {
        this.$emit('click'); // Можно передать событие на родительский компонент
        console.log('Открыть уведомления');
        // Логика для обработки клика по кнопке уведомлений
      }
    }
  };
  </script>
  
  <style scoped>
  .notification-btn {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: #797979;
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
    background-color: #c7c7c7;
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
    color: white;
    font-size: 0.9rem;
    font-weight: bold;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  </style>