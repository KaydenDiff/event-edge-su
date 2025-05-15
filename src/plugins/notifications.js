// notifications.js - централизованный плагин для управления уведомлениями
import axios from 'axios';

export default {
  install(app) {
    // Создаем глобальную шину событий для уведомлений
    const notificationBus = {
      // Метод для принудительного обновления уведомлений
      refreshNotifications() {
        document.dispatchEvent(new CustomEvent('refresh-notifications'));
      },
      
      // Метод для отправки уведомления через API
      async sendNotification(type, targetId, data = {}) {
        try {
          const user = JSON.parse(localStorage.getItem('user'));
          if (!user || !user.token) {
            console.error('Токен не найден');
            return { success: false, error: 'Необходима авторизация' };
          }
          
          let endpoint = '';
          
          // Определяем эндпоинт на основе типа уведомления
          switch (type) {
            case 'tournament-start':
              endpoint = `/admin/tournament/${targetId}/notify-start`;
              break;
            case 'match-reschedule':
              endpoint = `/admin/match/${targetId}/notify-reschedule`;
              break;
            case 'match-result':
              endpoint = `/admin/match/${targetId}/notify-result`;
              break;
            case 'next-stage':
              endpoint = `/admin/tournament/${targetId}/notify-next-stage`;
              break;
            case 'team-elimination':
              endpoint = `/admin/tournament/${targetId}/notify-team-elimination`;
              break;
            case 'team-registration':
              endpoint = '/admin/tournament/notify-registration';
              break;
            case 'team-registration-accept':
              endpoint = `/admin/tournament/${targetId}/notify-team-registration-accept`;
              break;
            default:
              console.error('Неизвестный тип уведомления:', type);
              return { success: false, error: 'Неизвестный тип уведомления' };
          }
          
          console.log(`Отправка уведомления на: ${endpoint}`);
          console.log('Данные:', data);
          
          const response = await axios.post(`http://event-edge-su/api${endpoint}`, data, {
            headers: {
              'Authorization': `Bearer ${user.token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('Ответ сервера:', response.data);
          
          // Обновляем уведомления после успешной отправки
          this.refreshNotifications();
          
          return {
            success: true,
            data: response.data
          };
        } catch (error) {
          console.error('Ошибка при отправке уведомления:', error);
          return {
            success: false,
            error: error.response?.data?.message || error.message || 'Ошибка при отправке уведомления'
          };
        }
      },
      
      // Метод для получения уведомлений пользователя
      async fetchUserNotifications() {
        try {
          const user = JSON.parse(localStorage.getItem('user'));
          if (!user || !user.token) {
            console.error('Токен не найден');
            return { success: false, error: 'Необходима авторизация' };
          }
          
          // Выбираем эндпоинт в зависимости от роли пользователя
          let endpoint = 'notifications';
          if (user.role === 'Администратор') {
            endpoint = 'notifications';
          } else if (user.role === 'Оператор') {
            endpoint = 'notifications';
          } else {
            endpoint = 'notifications';
          }
          
          
          const response = await axios.get(`http://event-edge-su/api/${endpoint}`, {
            headers: {
              'Authorization': `Bearer ${user.token}`,
              'Content-Type': 'application/json'
            }
          });
          
          return {
            success: true,
            notifications: response.data.notifications || [],
            unreadCount: response.data.unread_count || 0
          };
        } catch (error) {
          console.error('Ошибка при получении уведомлений:', error);
          return {
            success: false,
            error: error.response?.data?.message || error.message || 'Ошибка при получении уведомлений',
            notifications: [],
            unreadCount: 0
          };
        }
      },
      
      // Метод для отметки уведомления как прочитанное
      async markAsRead(notificationId) {
        try {
          const user = JSON.parse(localStorage.getItem('user'));
          if (!user || !user.token) {
            console.error('Токен не найден');
            return { success: false, error: 'Необходима авторизация' };
          }
          
          const response = await axios.post(`http://event-edge-su/api/user/notifications/${notificationId}/read`, {}, {
            headers: {
              'Authorization': `Bearer ${user.token}`,
              'Content-Type': 'application/json'
            }
          });
          
          // Обновляем уведомления после успешной отметки
          this.refreshNotifications();
          
          return {
            success: true,
            data: response.data
          };
        } catch (error) {
          console.error('Ошибка при отметке уведомления как прочитанное:', error);
          return {
            success: false,
            error: error.response?.data?.message || error.message || 'Ошибка при отметке уведомления'
          };
        }
      },
      
      // Метод для отметки всех уведомлений как прочитанные
      async markAllAsRead() {
        try {
          const user = JSON.parse(localStorage.getItem('user'));
          if (!user || !user.token) {
            console.error('Токен не найден');
            return { success: false, error: 'Необходима авторизация' };
          }
          
          const response = await axios.get(`http://event-edge-su/api/notifications/unread`, {
            headers: {
              'Authorization': `Bearer ${user.token}`,
              'Content-Type': 'application/json'
            }
          });
          
          // Обновляем уведомления после успешной отметки
          this.refreshNotifications();
          
          return {
            success: true,
            data: response.data
          };
        } catch (error) {
          console.error('Ошибка при отметке уведомлений как прочитанные:', error);
          return {
            success: false,
            error: error.response?.data?.message || error.message || 'Ошибка при отметке уведомлений'
          };
        }
      }
    };
    
    // Предоставляем функционал через глобальный плагин
    app.config.globalProperties.$notifications = notificationBus;
    app.provide('notifications', notificationBus);
  }
}; 