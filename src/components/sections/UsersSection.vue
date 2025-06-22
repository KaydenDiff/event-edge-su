<template>
  <div class="users-section">
    <BaseButton @click="toggleUserForm" class="toggle-button">
      {{ showUserForm ? 'Скрыть форму' : 'Создать пользователя' }}
    </BaseButton>

    <!-- Форма создания/редактирования пользователя -->
    <UserForm 
      v-if="showUserForm"
      :user="editingUser"
      :error="error"
      @submit="handleUserSubmit"
      @cancel="cancelForm"
    />

    <!-- Список пользователей -->
    <div v-if="loading" class="loading-message">
      Загрузка пользователей...
    </div>

    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-else-if="!users.length" class="no-users">
      Пользователи не найдены
    </div>

    <div v-else class="users-list">
      <div v-for="user in users" :key="user.id" class="user-card">
        <div class="user-info">
          <h3>{{ user.name }}</h3>
          <p>{{ user.email }}</p>
          <p class="user-role" :class="getRoleClass(user.role_id)">
            {{ formatRole(user.role_id) }}
          </p>
        </div>
        <div class="user-actions">
          <BaseButton 
            customClass="btn-primary" 
            @click="editUser(user)"
          >
            Редактировать
          </BaseButton>
          <BaseButton 
            customClass="btn-danger" 
            @click="showDeleteConfirmation(user)"
          >
            Удалить
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Диалог подтверждения удаления -->
    <div v-if="showDeleteDialog" class="confirmation-dialog">
      <div class="dialog-content">
        <p>Вы точно хотите удалить пользователя "{{ userToDelete?.name }}"?</p>
        <div class="dialog-actions">
          <BaseButton @click="confirmDelete">Да</BaseButton>
          <BaseButton @click="cancelDelete">Нет</BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import BaseButton from '@/components/BaseButton.vue'
import UserForm from '@/components/form/UserForm.vue'

export default {
  name: 'UsersSection',
  components: {
    BaseButton,
    UserForm
  },
  props: {
    isAdmin: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    const users = ref([])
    const loading = ref(true)
    const error = ref(null)
    const showUserForm = ref(false)
    const showDeleteDialog = ref(false)
    const userToDelete = ref(null)
    const editingUser = ref(null)

    // Получение списка пользователей
    const fetchUsers = async () => {
      try {
        loading.value = true
        const user = JSON.parse(localStorage.getItem('user'))
        const response = await axios.get('http://event-edge-su/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        })
        users.value = response.data
      } catch (err) {
        error.value = 'Ошибка загрузки пользователей'
        console.error('Ошибка загрузки:', err)
      } finally {
        loading.value = false
      }
    }

    // Создание/обновление пользователя
    const handleUserSubmit = async (userData) => {
      try {
        error.value = null // Сбрасываем ошибки в начале метода
        
        const user = JSON.parse(localStorage.getItem('user'))
        if (!user?.token) {
          error.value = 'Не авторизован'
          return
        }

        const isEditing = editingUser.value !== null
        const userId = editingUser.value?.id

        // Подготавливаем данные для отправки
        const requestData = {
          name: userData.name?.trim(),
          email: userData.email?.trim(),
          role_id: userData.role_id
        }

        // Проверяем обязательные поля
      
 
      

        let response
        if (isEditing && userId) {
          // Обновление существующего пользователя
          response = await axios.post(
            `http://event-edge-su/api/admin/users/update/${userId}`,
            requestData,
            {
              headers: { 
                'Authorization': `Bearer ${user.token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            }
          )
        } else {
          // Создание нового пользователя
          response = await axios.post(
            'http://event-edge-su/api/admin/users/create',
            requestData,
            {
              headers: { 
                'Authorization': `Bearer ${user.token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            }
          )
        }

        // Проверяем успешность ответа
        if (response.data) {
          // Сбрасываем состояние формы
          showUserForm.value = false
          editingUser.value = null
          error.value = null
          
          // Обновляем список пользователей
          await fetchUsers()
        }

      } catch (err) {
        console.error('Ошибка:', err)
        if (err.response?.status === 422) {
          const validationErrors = err.response.data.errors
          const errorMessages = Object.values(validationErrors).flat().join('\n')
          error.value = `Ошибка валидации:\n${errorMessages}`
        } else {
          error.value = err.response?.data?.message || err.message || 'Произошла ошибка'
        }
      }
    }

    // Удаление пользователя
    const confirmDelete = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'))
        if (!user?.token) {
          throw new Error('Не авторизован')
        }

        const userIdToDelete = userToDelete.value?.id
        if (!userIdToDelete) {
          throw new Error('ID пользователя не найден')
        }

        await axios.delete(`http://event-edge-su/api/admin/users/delete/${userIdToDelete}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        })

        // Обновляем список пользователей
        await fetchUsers()

        // Закрываем диалог
        showDeleteDialog.value = false
        userToDelete.value = null

      } catch (error) {
        console.error('Ошибка:', error)
        error.value = error.response?.data?.message || 'Произошла ошибка при удалении'
      }
    }

    const editUser = (user) => {
      editingUser.value = { ...user }
      showUserForm.value = true
    }

    const showDeleteConfirmation = (user) => {
      userToDelete.value = user
      showDeleteDialog.value = true
    }

    const cancelDelete = () => {
      showDeleteDialog.value = false
      userToDelete.value = null
    }

    const toggleUserForm = () => {
      showUserForm.value = !showUserForm.value
      if (!showUserForm.value) {
        editingUser.value = null
      }
    }

    const cancelForm = () => {
      showUserForm.value = false
      editingUser.value = null
    }

    const formatRole = (roleId) => {
      const roles = {
        1: 'Администратор',
        2: 'Редактор',
        3: 'Оператор',
        4: 'Пользователь'
      };
      return roles[roleId] || 'Неизвестная роль';
    };

    const getRoleClass = (roleId) => {
      const roleClasses = {
        1: 'role-admin',
        2: 'role-editor',
        3: 'role-operator',
        4: 'role-user'
      };
      return roleClasses[roleId] || 'role-unknown';
    };

    onMounted(fetchUsers)

    return {
      users,
      loading,
      error,
      showUserForm,
      showDeleteDialog,
      userToDelete,
      editingUser,
      handleUserSubmit,
      editUser,
      showDeleteConfirmation,
      confirmDelete,
      cancelDelete,
      toggleUserForm,
      cancelForm,
      formatRole,
      getRoleClass
    }
  }
}
</script>

<style scoped>
.users-section {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.toggle-button {
  margin-bottom: 30px;
  padding: 12px 25px;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(182, 0, 254, 0.2);
}

.toggle-button:hover {
  transform: translateY(-2px);

}

.users-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 25px;
}

.user-card {
  background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(182, 0, 254, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
}

.user-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #630181, #630181);
}

.user-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
}

.user-info h3 {
  margin: 0;
  color: #ffffff;
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 10px;
}

.user-info p {
  margin: 8px 0;
  color: #EAEAEA;
  font-size: 1.1rem;
}

.user-role {
  font-weight: 600;
  padding: 6px 12px;
  display: inline-block;
  margin-top: 12px;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Стили для разных ролей */
.role-admin {
  background: linear-gradient(45deg, #ff4444, #ff6b6b);
  color: white;
}

.role-editor {
  background: linear-gradient(45deg, #4CAF50, #66BB6A);
  color: white;
}

.role-operator {
  background: linear-gradient(45deg, #2196F3, #42A5F5);
  color: white;
}

.role-user {
  background: linear-gradient(45deg, #9146ff, #a970ff);
  color: white;
}

.role-unknown {
  background: linear-gradient(45deg, #757575, #9E9E9E);
  color: white;
}

.user-actions {
  margin-top: 20px;
  display: flex;
  gap: 15px;
}

.user-actions button {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary {
  border: none;
}

.btn-danger {

  border: none;
}

.loading-message,
.error-message,
.no-users {
  text-align: center;
  padding: 50px;
  font-size: 1.3rem;
  color: #EAEAEA;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  margin: 20px 0;
}

.error-message {
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
}

.confirmation-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.dialog-content {
  background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
  padding: 30px;
  border-radius: 15px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(182, 0, 254, 0.1);
  text-align: center;
}

.dialog-content p {
  font-size: 1.2rem;
  color: #ffffff;
  margin-bottom: 25px;
}

.dialog-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.dialog-actions button {
  padding: 12px 30px;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dialog-actions button:first-child {
  background: linear-gradient(45deg, #630181, #ff6a1f);
  color: white;
}

.dialog-actions button:last-child {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.dialog-actions button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .users-list {
    grid-template-columns: 1fr;
  }
  
  .user-card {
    padding: 20px;
  }
  
  .dialog-content {
    margin: 20px;
    padding: 20px;
  }
}
</style>
