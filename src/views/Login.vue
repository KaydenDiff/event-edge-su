<script setup>
import { reactive, ref } from "vue";
import Form from "@/components/Form.vue";
import BaseButton from "@/components/BaseButton.vue";
import router from "@/router/index.js";
import axios from "axios";
import { useAuthStore } from "@/stores/auth.js";  

const isLoginMode = ref(true); // Добавляем состояние для отслеживания текущего режима

const inputData = reactive({
  // Данные для входа
  email: '',
  password: '',
  rememberMe: false,
  // Данные для регистрации
  name: '',
  password_confirmation: '',
  avatar: null
});

const avatarPreview = ref(null);
const isLoading = ref(false);
const errors = reactive({
  data: {},
  message: '',
});

// Инициализируем store
const userStore = useAuthStore(); 

// Настроим axios для добавления токена в заголовок авторизации
axios.interceptors.request.use((config) => {
  const token = userStore.user?.token;
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Переключение между режимами входа и регистрации
const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value;
  clearForm();
};

// Метод для обработки изменений в input
const onInputChange = (field, event) => {
  const value = field === 'avatar' ? event.target.files[0] : event.target.value;
  errors.data[field] = [];
  inputData[field] = value;
  
  if (field === 'avatar' && event.target.files && event.target.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      avatarPreview.value = e.target.result;
    };
    reader.readAsDataURL(event.target.files[0]);
  }
};

const clearAvatar = () => {
  inputData.avatar = null;
  avatarPreview.value = null;
  const fileInput = document.getElementById('avatar');
  if (fileInput) fileInput.value = '';
};

const goToRegister = () => {
  router.push({ name: 'register' });
};

// Разделяем методы для входа и регистрации
const onLogin = async () => {
  isLoading.value = true;
  errors.message = "";
  errors.data = {};

  try {
    const response = await axios.post("http://event-edge-su/api/login", {
      email: inputData.email,
      password: inputData.password,
      remember_me: inputData.rememberMe
    });

    if (response.data?.access_token && response.data?.user) {
      const userData = {
        token: response.data.access_token,
        role: response.data.user.role,
      };

      userStore.setUser(userData);
      
      if (inputData.rememberMe) {
        localStorage.setItem('remember_token', response.data.access_token);
      }
      
      router.push({ name: "home" });
    }
  } catch (error) {
    if (error.response?.status === 401) {
      errors.message = "Неверный email или пароль";
    } else {
      errors.message = "Ошибка при входе в систему";
    }
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

const onRegister = async () => {
  isLoading.value = true;
  errors.message = "";
  errors.data = {};

  const formData = new FormData();
  formData.append('name', inputData.name);
  formData.append('email', inputData.email);
  formData.append('password', inputData.password);
  formData.append('password_confirmation', inputData.password_confirmation);
  if (inputData.avatar) {
    formData.append('avatar', inputData.avatar);
  }

  try {
    const response = await axios.post("http://event-edge-su/api/register", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    // После успешной регистрации пытаемся войти
    try {
      const loginResponse = await axios.post("http://event-edge-su/api/login", {
        email: inputData.email,
        password: inputData.password,
        remember_me: inputData.rememberMe
      });

      if (loginResponse.data?.access_token && loginResponse.data?.user) {
        const userData = {
          token: loginResponse.data.access_token,
          role: loginResponse.data.user.role,
        };

        userStore.setUser(userData);
        
        if (inputData.rememberMe) {
          localStorage.setItem('remember_token', loginResponse.data.access_token);
        }
        
        router.push({ name: "home" });
      }
    } catch (loginError) {
      errors.message = "Регистрация успешна, но не удалось выполнить автоматический вход. Пожалуйста, войдите вручную.";
      isLoginMode.value = true; // Переключаемся на форму входа
    }
  } catch (error) {
    if (error.response?.status === 422) {
      errors.data = error.response.data.errors;
    } else if (error.response?.status === 400) {
      errors.message = "Пользователь с таким email уже существует";
    } else {
      errors.message = "Ошибка при регистрации";
    }
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

// Общий метод onSubmit, который вызывает нужный обработчик в зависимости от режима
const onSubmit = () => {
  if (isLoginMode.value) {
    onLogin();
  } else {
    onRegister();
  }
};

const clearForm = () => {
  inputData.email = '';
  inputData.password = '';
  inputData.password_confirmation = '';
  inputData.name = '';
  inputData.avatar = null;
  inputData.rememberMe = false;
  avatarPreview.value = null;
  errors.data = {};
  errors.message = '';
};

</script>

<template>
  <main class="login-page">
    <div class="mode-toggle">
      <button 
        :class="['toggle-btn', { active: isLoginMode }]"
        @click="() => isLoginMode = true"
      >
        Вход с паролем
      </button>
      <button 
        :class="['toggle-btn', { active: !isLoginMode }]"
        @click="() => isLoginMode = false"
      >
        Регистрация
      </button>
    </div>

    <Form :submit="onSubmit" method="POST" class="auth-form">
      <div v-if="errors.message" class="error-message text-red-500 text-center">
        <span v-text="errors.message"></span>
      </div>
      <div v-if="isLoading" class="loading text-center text-gray-500">
        <span v-text="'Загрузка...'"></span>
      </div>

      <template v-else>
        <!-- Форма входа -->
        <template v-if="isLoginMode">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Введите email"
              :value="inputData.email"
              @input="(event) => onInputChange('email', event)"
              :class="{ 'error': errors.data?.email }"
            />
            <div v-if="errors.data?.email" class="error-text">
              {{ errors.data.email[0] }}
            </div>
          </div>

          <div class="form-group">
            <label for="password">Пароль</label>
            <input
              id="password"
              type="password"
              placeholder="Введите пароль"
              :value="inputData.password"
              @input="(event) => onInputChange('password', event)"
              :class="{ 'error': errors.data?.password }"
            />
            <div v-if="errors.data?.password" class="error-text">
              {{ errors.data.password[0] }}
            </div>
          </div>

          <div class="remember-me">
            <input 
              type="checkbox" 
              id="rememberMe" 
              v-model="inputData.rememberMe"
            >
            <label for="rememberMe">Запомнить меня</label>
          </div>

          <BaseButton 
            @click="onLogin"
            class="auth-button"
          >
            Войти
          </BaseButton>

          <div class="recovery-link">
            <a href="#" @click.prevent="recoverPassword">восстановить доступ</a>
          </div>
        </template>

        <!-- Форма регистрации -->
        <template v-else>
          <div class="form-group">
            <label for="name">Имя</label>
            <input
              id="name"
              type="text"
              placeholder="Введите имя"
              :value="inputData.name"
              @input="(event) => onInputChange('name', event)"
              :class="{ 'error': errors.data?.name }"
            />
            <div v-if="errors.data?.name" class="error-text">
              {{ errors.data.name[0] }}
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Введите email"
              :value="inputData.email"
              @input="(event) => onInputChange('email', event)"
              :class="{ 'error': errors.data?.email }"
            />
            <div v-if="errors.data?.email" class="error-text">
              {{ errors.data.email[0] }}
            </div>
          </div>

          <div class="form-group">
            <label for="password">Пароль</label>
            <input
              id="password"
              type="password"
              placeholder="Введите пароль"
              :value="inputData.password"
              @input="(event) => onInputChange('password', event)"
              :class="{ 'error': errors.data?.password }"
            />
            <div v-if="errors.data?.password" class="error-text">
              {{ errors.data.password[0] }}
            </div>
          </div>

          <div class="form-group">
            <label for="password_confirmation">Подтверждение пароля</label>
            <input
              id="password_confirmation"
              type="password"
              placeholder="Подтвердите пароль"
              :value="inputData.password_confirmation"
              @input="(event) => onInputChange('password_confirmation', event)"
              :class="{ 'error': errors.data?.password_confirmation }"
            />
            <div v-if="errors.data?.password_confirmation" class="error-text">
              {{ errors.data.password_confirmation[0] }}
            </div>
          </div>

          <BaseButton 
            @click="onRegister"
            class="auth-button"
          >
            Зарегистрироваться
          </BaseButton>
        </template>
      </template>
    </Form>

    <div v-if="userStore.user" class="profile-link text-center mt-4">
      <p class="text-white">
        <span @click="goToProfile" class="text-yellow-400 cursor-pointer hover:underline">
          <span v-text="'Мой профиль'"></span>
        </span>
      </p>
    </div>
  </main>
</template>

<style scoped>
.login-page {
  padding: 50px 30px; /* Увеличиваем отступы вокруг формы */
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.8s ease-out; /* Применяем анимацию при загрузке */
}

h1 {
  color: #ffffff; /* Темно-золотой */
  font-size: 3rem; /* Увеличиваем размер заголовка */
}

.mode-toggle {
  display: flex;
  gap: 2px;
  margin-bottom: 20px;
  background: #333;
  padding: 2px;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
}

.toggle-btn {
  flex: 1;
  padding: 10px;
  border: none;
  background: transparent;
  color: #fff;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.toggle-btn.active {
  background: #630181;
}

.auth-form {
  background: #4d4d4d;
  padding: 25px; /* Уменьшаем отступы формы */
  border-radius: 15px;
  width: 100%;
  max-width: 450px; /* Уменьшаем максимальную ширину формы */
  color: #ffffff;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-size: 0.9rem;
  color: #fff;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #666;
  border-radius: 4px;
  background: #333;
  color: #fff;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #630181;
  box-shadow: 0 0 0 2px rgba(99, 1, 129, 0.2);
}

.form-group input.error {
  border-color: #ff4444;
}

.error-text {
  color: #ff4444;
  font-size: 0.8rem;
  margin-top: 4px;
}

.auth-button {
  margin-top: 10px;
  padding: 10px;
  font-size: 0.95rem;
  width: 100%;
}

.auth-button:hover {
  transform: translateY(-2px);
}

.auth-button:active {
  transform: translateY(0);
}

.recovery-link {
  text-align: center;
  margin-top: 15px;
}

.recovery-link a {
  color: #4a76a8;
  text-decoration: none;
}

.recovery-link a:hover {
  text-decoration: underline;
}

.error-message {
  font-size: 0.85rem;
  margin-bottom: 10px;
}

.remember-me {
  margin-bottom: 15px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.remember-me input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.remember-me label {
  cursor: pointer;
}

.profile-link {
  margin-top: 20px;
}

.profile-link span {
  cursor: pointer;
}

.profile-link span:hover {
  text-decoration: underline;
}
</style>
