<script setup>
import {reactive, ref} from "vue";

import Form from "@/components/Form.vue";
import FormItem from "@/components/FormItem.vue";
import BaseButton from "@/components/BaseButton.vue";

import {registration} from "@/api/methods/auth/registration.js";
import router from "@/router/index.js";
import axios from "axios";
import { useAuthStore } from "@/stores/auth.js";

const userStore = useAuthStore();

const inputData = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  avatar: null
})

const avatarPreview = ref(null);

const isLoading = ref(false)

const errors = reactive({
  data: {},
  message: ''
})

// Function to login after successful registration
const loginAfterRegistration = async (email, password) => {
  try {
    const response = await axios.post("http://event-edge-su/api/login", {
      email,
      password
    });

    if (response.data?.access_token && response.data?.user) {
      const userData = {
        token: response.data.access_token,
        role: response.data.user.role,
      };

      userStore.setUser(userData);
      await router.push({ name: 'home' });
    }
  } catch (error) {
    console.error("Ошибка автоматической авторизации:", error);
    await router.push({ name: 'login' });
  }
};

const onSubmit = async () => {
  isLoading.value = true;
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

    if (response.data?.success) {
      await loginAfterRegistration(inputData.email, inputData.password);
    } else {
      errors.message = "Ошибка при регистрации";
    }
  } catch (error) {
    if (error.response?.status === 422) {
      errors.data = error.response.data.errors;
    } else {
      errors.message = "Ошибка при регистрации";
    }
  } finally {
    isLoading.value = false;
  }
};

const onInputChange = (field, event) => {
  const value = field === 'avatar' ? event.target.files[0] : event.target.value;
  errors.data[field] = [];
  inputData[field] = value;
  
  // Добавляем предпросмотр для аватара
  if (field === 'avatar' && event.target.files && event.target.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      avatarPreview.value = e.target.result;
    };
    reader.readAsDataURL(event.target.files[0]);
  }
}

// Функция для очистки аватара
const clearAvatar = () => {
  inputData.avatar = null;
  avatarPreview.value = null;
  const fileInput = document.getElementById('avatar');
  if (fileInput) fileInput.value = '';
}
</script>

<template>
  <main class="register-page">
    <h1 class="text-center text-4xl font-bold text-white">Регистрация</h1>

    <Form :submit="onSubmit" method="POST" class="register-form">
      <div v-if="errors.message" class="error-message text-red-500 text-center">
        <span v-text="errors.message"></span>
      </div>
      <div v-if="isLoading" class="loading text-center text-gray-500">
        <span v-text="'Загрузка...'"></span>
      </div>

      <template v-else>
        <FormItem
          id="name"
          label="Имя"
          placeholder="Введите имя"
          :value="inputData.name"
          :error-messages="errors.data?.name"
          @change="(event) => onInputChange('name', event)"
          class="input-field"
        />

        <FormItem
          id="email"
          label="Email"
          placeholder="Введите email"
          type="email"
          :value="inputData.email"
          :error-messages="errors.data?.email"
          @change="(event) => onInputChange('email', event)"
          class="input-field"
        />

        <FormItem
          id="password"
          label="Пароль"
          placeholder="Введите пароль"
          type="password"
          :value="inputData.password"
          :error-messages="errors.data?.password"
          @change="(event) => onInputChange('password', event)"
          class="input-field"
        />

        <FormItem
          id="password_confirmation"
          label="Подтверждение пароля"
          placeholder="Подтвердите пароль"
          type="password"
          :value="inputData.password_confirmation"
          :error-messages="errors.data?.password_confirmation"
          @change="(event) => onInputChange('password_confirmation', event)"
          class="input-field"
        />
        <BaseButton 
          @click="onSubmit"
          :customClass="'base-button'"
        >
          Зарегистрироваться
        </BaseButton>
      </template>
    </Form>
  </main>
</template>

<style scoped>
.register-page {
  padding: 50px 30px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

h1 {
  color: #ffffff;
  font-size: 3rem;
  margin-bottom: 2rem;
}

.register-form {
  background: #4d4d4d;
  padding: 60px 40px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  color: #ffffff;
}

.input-field {
  margin-bottom: 25px;
}

.error-message {
  color: red;
  margin-bottom: 1rem;
}

.avatar-section {
  width: 100%;
  margin-bottom: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.custom-file-input {
  width: 100%;
}

.custom-file-input :deep(input[type="file"]) {
  width: 100%;
  padding: 10px;
  background-color: #333;
  border: 1px solid #555;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  box-sizing: border-box;
}

.avatar-preview-container {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 15px auto;
}

.avatar-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.clear-avatar {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background-color: #ff4444;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  transition: background-color 0.3s;
  padding: 0;
  line-height: 1;
}

.clear-avatar::before {
  content: '×';
  position: relative;
  top: -1px;
}

.clear-avatar:hover {
  background-color: #ff6666;
}

/* Стили для поля загрузки файла в Firefox */
.custom-file-input :deep(input[type="file"]::-moz-file-upload-button) {
  background-color: #630181;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
}

.custom-file-input :deep(input[type="file"]::-moz-file-upload-button:hover) {
  background-color: #ff6b1a;
}
</style>
