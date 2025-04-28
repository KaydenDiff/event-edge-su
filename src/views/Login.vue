<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const handleSubmit = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    await authStore.login({
      email: email.value,
      password: password.value
    });

    // Перенаправляем на запрошенную страницу или на главную
    const redirectPath = route.query.redirect || '/';
    router.push(redirectPath);
  } catch (err) {
    console.error('Login error:', err);
    error.value = err.response?.data?.message || 'Ошибка при входе в систему';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="login-container">
    <div class="login-form">
      <h2>Вход в систему</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="email"
            required
            placeholder="Введите ваш email"
          />
        </div>
        <div class="form-group">
          <label for="password">Пароль</label>
          <input
            type="password"
            id="password"
            v-model="password"
            required
            placeholder="Введите ваш пароль"
          />
        </div>
        <div class="error-message" v-if="error">{{ error }}</div>
        <button type="submit" :disabled="loading">
          {{ loading ? 'Вход...' : 'Войти' }}
        </button>
        <div class="register-link">
          Нет аккаунта? <router-link to="/register">Зарегистрироваться</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #121212;
  padding: 20px;
}

.login-form {
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

.register-link {
  margin-top: 20px;
  text-align: center;
  color: #aaa;
  font-size: 14px;
}

.register-link a {
  color: #630181;
  text-decoration: none;
  transition: color 0.3s ease;
}

.register-link a:hover {
  color: #7a019c;
}
</style>
