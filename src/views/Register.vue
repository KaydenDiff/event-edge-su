<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const inputData = ref({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  avatar: null
});

const avatarPreview = ref(null);
const isLoading = ref(false);
const errors = ref({
  data: {},
  message: ''
});

const onSubmit = async () => {
  isLoading.value = true;
  errors.value.data = {};

  const formData = new FormData();
  formData.append('name', inputData.value.name);
  formData.append('email', inputData.value.email);
  formData.append('password', inputData.value.password);
  formData.append('password_confirmation', inputData.value.password_confirmation);
  if (inputData.value.avatar) {
    formData.append('avatar', inputData.value.avatar);
  }

  try {
    await authStore.register({
      name: inputData.value.name,
      email: inputData.value.email,
      password: inputData.value.password,
      password_confirmation: inputData.value.password_confirmation,
      avatar: inputData.value.avatar
    });

    router.push('/');
  } catch (error) {
    if (error.response?.status === 422) {
      errors.value.data = error.response.data.errors;
    } else {
      errors.value.message = "Ошибка при регистрации";
    }
  } finally {
    isLoading.value = false;
  }
};

const onInputChange = (field, event) => {
  const value = field === 'avatar' ? event.target.files[0] : event.target.value;
  errors.value.data[field] = [];
  inputData.value[field] = value;
  
  if (field === 'avatar' && event.target.files && event.target.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      avatarPreview.value = e.target.result;
    };
    reader.readAsDataURL(event.target.files[0]);
  }
};

const clearAvatar = () => {
  inputData.value.avatar = null;
  avatarPreview.value = null;
  const fileInput = document.getElementById('avatar');
  if (fileInput) fileInput.value = '';
};
</script>

<template>
  <div class="register-container">
    <div class="register-form">
      <h2>Регистрация</h2>
      <form @submit.prevent="onSubmit">
        <div class="form-group">
          <label for="name">Имя</label>
          <input
            type="text"
            id="name"
            v-model="inputData.name"
            required
            placeholder="Введите ваше имя"
          />
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="inputData.email"
            required
            placeholder="Введите ваш email"
          />
        </div>
        <div class="form-group">
          <label for="password">Пароль</label>
          <input
            type="password"
            id="password"
            v-model="inputData.password"
            required
            placeholder="Введите пароль"
          />
        </div>
        <div class="form-group">
          <label for="password_confirmation">Подтверждение пароля</label>
          <input
            type="password"
            id="password_confirmation"
            v-model="inputData.password_confirmation"
            required
            placeholder="Подтвердите пароль"
          />
        </div>
        <div class="error-message" v-if="errors.message">{{ errors.message }}</div>
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Регистрация...' : 'Зарегистрироваться' }}
        </button>
        <div class="login-link">
          Уже есть аккаунт? <router-link to="/login">Войти</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #121212;
  padding: 20px;
}

.register-form {
  background: #1a1a1a;
  padding: 40px;
  border-radius: 15px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.3);
}

h2 {
  color: #fff;
  text-align: center;
  margin-bottom: 30px;
  font-size: 24px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  color: #aaa;
  margin-bottom: 8px;
  font-size: 14px;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #333;
  border-radius: 8px;
  background: #222;
  color: #fff;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

input:focus {
  outline: none;
  border-color: #630181;
}

button {
  width: 100%;
  padding: 12px;
  background: #630181;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s ease;
}

button:hover {
  background: #7a019c;
}

button:disabled {
  background: #444;
  cursor: not-allowed;
}

.error-message {
  color: #ff4444;
  margin-bottom: 20px;
  text-align: center;
  font-size: 14px;
}

.login-link {
  margin-top: 20px;
  text-align: center;
  color: #aaa;
  font-size: 14px;
}

.login-link a {
  color: #630181;
  text-decoration: none;
  transition: color 0.3s ease;
}

.login-link a:hover {
  color: #7a019c;
}
</style>
