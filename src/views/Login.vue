<script setup>
import { reactive, ref } from "vue";
import Form from "@/components/Form.vue";
import FormItem from "@/components/FormItem.vue";
import Button from "@/components/Button.vue";
import router from "@/router/index.js";
import axios from "axios";
import { useAuthStore } from "@/stores/auth.js";  

const inputData = reactive({
  email: '',
  password: '',
});

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

// Метод для обработки изменений в input
const onInputChange = (field, event) => {
  inputData[field] = event.target.value;
};

const onSubmit = async () => {
  isLoading.value = true;
  errors.message = "";
  errors.data = {};

  try {
    const response = await axios.post("http://event-edge-su/api/login", {
      email: inputData.email,
      password: inputData.password,
    });

    isLoading.value = false;

    if (response.data?.access_token && response.data?.user) {
      const userData = {
        token: response.data.access_token, // Исправлено
        role: response.data.user.role, // Исправлено
      };

      userStore.setUser(userData);
      router.push({ name: "home" });
    } else {
      errors.message = "Неверный ответ сервера. Попробуйте позже.";
    }

  } catch (error) {
    isLoading.value = false;
    errors.message = "Ошибка при авторизации";
    console.error(error);
  }
};

</script>

<template>
  <main class="login-page">
    <h1 class="text-center text-4xl font-bold text-white" v-text="'Вход в Турнирный Хаб'"></h1>

    <Form :submit="onSubmit" method="POST" class="login-form">
      <div v-if="errors.message" class="error-message text-red-500 text-center">
        <span v-text="errors.message"></span>
      </div>
      <div v-if="isLoading" class="loading text-center text-gray-500">
        <span v-text="'Загрузка...'"></span>
      </div>

      <template v-else>
        <FormItem
          id="email"
          label="Введите почту"
          placeholder="Введите почту"
          type="email"
          :value="inputData.email"
          :error-messages="errors.data?.email"
          @change="(event) => onInputChange('email', event)"
          class="input-field"
        />

        <FormItem
          id="password"
          label="Введите пароль"
          placeholder="Введите пароль"
          type="password"
          :value="inputData.password"
          :error-messages="errors.data?.password"
          @change="(event) => onInputChange('password', event)"
          class="input-field"
        />

        <Button @submit.prevent="onSubmit" type="submit" class="submit-btn">
          <span v-text="'Войти'"></span>
        </Button>
      </template>

      <div class="register-link text-center mt-4">
        <p class="text-white">
          <span v-text="'До сих пор нет аккаунта? '" /> 
          <span @click="goToRegister" class="text-yellow-400 cursor-pointer hover:underline">
            <span v-text="'Регистрируйся'"></span>
          </span>
        </p>
      </div>
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
/* Добавим анимацию для плавного появления */
@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.login-page {
  padding: 50px 30px; /* Увеличиваем отступы вокруг формы */
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #000000; /* Серый фон */
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

.login-form {
  background: #4d4d4d; /* Темно-зеленый */
  padding: 60px 40px; /* Увеличиваем внутренние отступы формы */
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px; /* Увеличиваем максимальную ширину формы */
  color: #ffffff;
}

.input-field {
  margin-bottom: 25px; /* Увеличиваем отступ между полями ввода */
}

.submit-btn {
  background-color: #ffffff;
  color: #000;
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s ease-in-out;
  outline: none;
  border: 3px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  z-index: 1;
  text-decoration: none;
  display: inline-block;
}
@keyframes pulseBorder {
  0% {
    border-color: rgba(255, 255, 255, 0.5);
  }
  50% {
    border-color: rgba(255, 255, 255, 1);
  }
  100% {
    border-color: rgba(255, 255, 255, 0.5);
  }
}
.submit-btn:hover {
  animation: pulseBorder 1.5s infinite ease-in-out;
  transform: scale(1.05);
  background-color: #000;
  color: #fff;
}
.submit-btn:active {
  transform: scale(0.95);
}
.error-message {
  color: red;
}

.register-link {
  margin-top: 20px;
  color: #000000; /* Увеличиваем отступ между кнопкой и ссылкой */
}

.register-link span {
  color: #ffffff; /* Яркий желтый для ссылки */
}

.register-link span:hover {
  text-decoration: underline;
  cursor: pointer; /* Указатель на "Регистрируйся" */
}

.register-link p {
  display: inline-block;
  margin: 0;
  cursor: default; /* Обычный курсор на "До сих пор нет аккаунта?" */
}
</style>
