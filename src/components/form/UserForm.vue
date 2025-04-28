<template>
    <div class="user-form">
      <h3>{{ isEditing ? 'Редактировать пользователя' : 'Создать пользователя' }}</h3>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Имя пользователя*</label>
          <input v-model="formData.name" type="text" required />
        </div>
        
        <div class="form-group">
          <label>Email*</label>
          <input v-model="formData.email" type="email" required />
        </div>
        
        <div class="form-group">
          <label>Пароль{{ !isEditing ? '*' : ' (оставьте пустым, чтобы не менять)' }}</label>
          <input v-model="formData.password" type="password" :required="!isEditing" />
        </div>
  
        <div class="form-group">
          <label>Роль пользователя</label>
          <select v-model="formData.role_id" class="role-select">
            <option value="1">Администратор</option>
            <option value="2">Модератор</option>
            <option value="3">Редактор</option>
            <option value="4">Пользователь</option>
            <option value="5">Оператор</option>
          </select>
          <div class="role-description">
            <template v-if="formData.role_id === '1'">
              Полный доступ ко всем функциям системы, включая управление пользователями и настройки
            </template>
            <template v-else-if="formData.role_id === '3'">
              Может создавать и редактировать турниры, управлять матчами и результатами
            </template>
            <template v-else-if="formData.role_id === '5'">
              Может управлять матчами и обновлять их статусы
            </template>
            <template v-else-if="formData.role_id === '2'">
              Может модерировать контент и управлять базовыми настройками
            </template>
            <template v-else>
              Базовый доступ к функциям системы
            </template>
          </div>
        </div>
        
        <div class="form-actions">
          <BaseButton type="button" @click="$emit('cancel')">
            Отмена
          </BaseButton>
          <BaseButton type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Сохранение...' : (isEditing ? 'Сохранить' : 'Создать') }}
          </BaseButton>
        </div>
      </form>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue'
  import BaseButton from '@/components/BaseButton.vue'
  
  export default {
    name: 'UserForm',
    components: { BaseButton },
    props: {
      user: {
        type: Object,
        default: null
      },
      error: {
        type: String,
        default: null
      }
    },
    setup(props, { emit }) {
      const isSubmitting = ref(false)
      const isEditing = props.user !== null
  
      const formData = ref({
        name: props.user?.name || '',
        email: props.user?.email || '',
        password: '',
        role_id: props.user?.role_id?.toString() || '4'
      })
  
      const handleSubmit = async () => {
        if (isSubmitting.value) return
        isSubmitting.value = true
        try {
          const submitData = {
            name: formData.value.name,
            email: formData.value.email,
            role_id: parseInt(formData.value.role_id)
          }
  
          // Добавляем пароль только если он был введен или это новый пользователь
          if (formData.value.password || !isEditing) {
            submitData.password = formData.value.password
          }
  
          await emit('submit', submitData)
        } finally {
          isSubmitting.value = false
        }
      }
  
      return {
        formData,
        isSubmitting,
        isEditing,
        handleSubmit
      }
    }
  }
  </script>
  
  <style scoped>
  .user-form {
    background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
    padding: 30px;
    border-radius: 15px;
    margin-bottom: 30px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(182, 0, 254, 0.1);
    position: relative;
    overflow: hidden;
  }
  
  .user-form::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, #630181, #ff6a1f);
  }
  
  .user-form h3 {
    margin: 0 0 25px 0;
    color: #ffffff;
    font-size: 1.5rem;
    font-weight: 600;
  }
  
  .form-group {
    margin-bottom: 20px;
    position: relative;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #ffffff;
    font-size: 1.1rem;
  }
  
  .form-group input,
  .form-group select {
    width: 100%;
    padding: 12px 15px;
    border-radius: 8px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.05);
    color: white;
    font-size: 1rem;
    transition: all 0.3s ease;
  }
  
  .form-group input:focus,
  .form-group select:focus {
    outline: none;
  }
  
  .form-group input::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  .form-group select {
    width: 100%;
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #5F665E;
    background: #3c3c3c;
    color: white;
    transition: all 0.3s ease;
    cursor: pointer;
  }
  
  .form-group select:hover {
    background: #3c3c3c;
  }
  
  .form-group select option {
    background: #2c2c2c;
    color: white;
    padding: 8px;
  }
  
  .form-group select option:hover {
    background: #3c3c3c;
  }
  
  .role-select {
    position: relative;
    width: 100%;
    padding: 12px 15px;
    border-radius: 8px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    font-size: 1rem;
    transition: all 0.3s ease;
    cursor: pointer;
  }
  
  .role-select option {
    color: rgb(255, 255, 255);
    padding: 10px;
  }
  
  .role-description {
    margin-top: 10px;
    padding: 10px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9rem;
    line-height: 1.4;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 15px;
    margin-top: 30px;
  }
  
  .form-actions button {
    padding: 12px 25px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 1rem;
    transition: all 0.3s ease;
    cursor: pointer;
  }
  
  .form-actions button:first-child {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
  
  .form-actions button:last-child {
    background: linear-gradient(45deg, #630181, #ff6a1f);
    color: white;
  }
  
  .form-actions button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }
  
  .form-actions button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    .user-form {
      padding: 20px;
    }
    
    .form-actions {
      flex-direction: column;
    }
    
    .form-actions button {
      width: 100%;
    }
  }
  
  .error-message {
    background: rgba(255, 87, 87, 0.1);
    border: 1px solid rgba(255, 87, 87, 0.3);
    color: #ff5757;
    padding: 12px 15px;
    border-radius: 8px;
    margin-bottom: 20px;
    font-size: 0.95rem;
  }
  </style>