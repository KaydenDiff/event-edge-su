<template>
  <div class="create-team-container">
    <h1 class="title">Создание новой команды</h1>
    
    <div v-if="isLoading" class="loading">
      <i class="fas fa-spinner fa-pulse"></i> Загрузка...
    </div>
    
    <div v-if="error" class="error-message">
      <i class="fas fa-exclamation-circle"></i> {{ error }}
    </div>
    
    <form @submit.prevent="submitForm" class="team-form" v-else>
      <div class="form-group">
        <label for="name">Название команды*</label>
        <input 
          type="text" 
          id="name" 
          v-model="form.name" 
          required
          placeholder="Введите название команды"
          class="form-input"
        >
      </div>
      
      <div class="form-group">
        <label>Капитан команды</label>
        <input 
          type="text" 
          :value="userName" 
          disabled
          class="form-input"
        >
        <small class="form-hint">Вы (ID: {{ $userId }}) будете капитаном команды</small>
      </div>
      
      <div class="form-group">
        <label for="status">Статус команды*</label>
        <select 
          id="status" 
          v-model="form.status" 
          required
          class="form-input"
        >
          <option value="active">Активная</option>
          <option value="inactive">Неактивная</option>
          <option value="pending">На рассмотрении</option>
        </select>
      </div>
      
      <div class="form-actions">
        <button 
          type="submit" 
          class="submit-button"
          :disabled="isSubmitting"
        >
          <span v-if="!isSubmitting">
            <i class="fas fa-plus-circle"></i> Создать команду
          </span>
          <span v-else>
            <i class="fas fa-spinner fa-pulse"></i> Создание...
          </span>
        </button>
        
        <button 
          type="button" 
          @click="cancel"
          class="cancel-button"
        >
          Отмена
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import axios from 'axios';
import { useRouter } from 'vue-router';

export default {
  name: 'CreateTeam',
 props: {
  userId: {
    type: [String, Number],
    required: true
  }
},created() {
  // Получите userId из вашего источника данных, например, из локального хранилища или API
  const user = JSON.parse(localStorage.getItem('user'));
  this.userId = user?.id;
},
  data() {
    return {
      form: {
        name: '',
        status: 'active'
      },
      userId: null,
      isSubmitting: false,
      error: null
    };
  },
  mounted() {
    const userId = this.$route.params.userId;
    
    console.log(userId); // Здесь вы можете использовать userId
  },
  methods: {
    async submitForm() {
      this.isSubmitting = true;
      this.error = null;

      try {
        // 1. Получаем токен
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user?.token) throw new Error('Требуется авторизация');

        // 2. Формируем payload с обязательными полями
        const payload = {
          name: this.form.name.trim(),
          captain_id: this.userId, // Используем переданный ID
          status: this.form.status
        };

        console.log('Отправляемые данные:', payload); // Для отладки
console.log('Отправляемые данные:', {
  name: this.form.name.trim(),
  captain_id: this.userId, // Должен содержать число
  status: this.form.status
});
        // 3. Отправка запроса
        const formData = new FormData();
formData.append('name', this.form.name);
formData.append('captain_id', this.userId);
formData.append('status', this.form.status);

const response = await axios.post(
  'http://event-edge-su/api/teams/create',
  formData,
  { headers: { Authorization: `Bearer ${user.token}` } }
);

        // 4. Обработка ответа
        if (response.data?.error) {
          throw new Error(response.data.error);
        }

        this.$toast.success('Команда создана успешно!');
        this.$router.push('/profile');

      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        console.error('Ошибка:', err);
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>
<style scoped>
.create-team-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: #333;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(182, 0, 254, 0.1);
}

.title {
  text-align: center;
  margin-bottom: 2rem;
  color: #fff;
  font-size: 2rem;
  background: linear-gradient(90deg, #630181, #9500ff);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  padding: 0.5rem;
  border-radius: 5px;
}

.team-form {
  background: rgba(40, 40, 40, 0.8);
  padding: 2rem;
  border-radius: 8px;
  border: 1px solid rgba(99, 1, 129, 0.3);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #ddd;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(99, 1, 129, 0.5);
  border-radius: 4px;
  font-size: 1rem;
  background: rgba(30, 30, 30, 0.8);
  color: #fff;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #9500ff;
  box-shadow: 0 0 0 2px rgba(149, 0, 255, 0.2);
}

.form-input:disabled {
  background-color: rgba(50, 50, 50, 0.8);
  color: #aaa;
  cursor: not-allowed;
}

.form-hint {
  display: block;
  margin-top: 0.5rem;
  color: #aaa;
  font-size: 0.85rem;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  gap: 1rem;
}

.submit-button {
  flex: 1;
  background: linear-gradient(90deg, #630181, #9500ff);
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.submit-button:hover {
  background: linear-gradient(90deg, #7a029e, #a700ff);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(149, 0, 255, 0.3);
}

.submit-button:disabled {
  background: linear-gradient(90deg, #3a014a, #5a0099);
  transform: none;
  box-shadow: none;
  cursor: not-allowed;
  opacity: 0.7;
}

.cancel-button {
  flex: 1;
  background: rgba(60, 60, 60, 0.8);
  color: #ddd;
  padding: 0.75rem;
  border: 1px solid rgba(99, 1, 129, 0.5);
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.cancel-button:hover {
  background: rgba(80, 80, 80, 0.8);
  border-color: #9500ff;
  color: #fff;
}

.loading {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #9500ff;
}

.error-message {
  text-align: center;
  padding: 1rem;
  font-size: 1rem;
  color: #ff3860;
  background: rgba(255, 56, 96, 0.1);
  border-radius: 4px;
  border: 1px solid rgba(255, 56, 96, 0.3);
}
</style>