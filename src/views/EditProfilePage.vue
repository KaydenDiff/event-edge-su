<template>
    <div class="edit-profile-container">
      <h1 class="title">Редактировать профиль</h1>
  
      <div v-if="isLoading" class="loading">Загрузка...</div>
      <div v-if="error" class="error-message">{{ error }}</div>
  
      <form v-else @submit.prevent="updateProfile">
        <!-- Поля для изменения имени и аватара -->
        <label>
          Имя:
          <input v-model="user.name" type="text" required />
        </label>
        
        <label>
          Аватар:
          <input type="file" @change="handleFileChange" />
          <div v-if="avatarPreview" class="avatar-preview">
            <img :src="avatarPreview" alt="Аватар" />
          </div>
        </label>
  
        <!-- Кнопка для показа/скрытия полей пароля -->
        <BaseButton type="button" customClass="details-button" @click="togglePasswordFields">
          Изменить пароль
        </BaseButton>
  
        <!-- Поля для изменения пароля (появляются только если showPasswordFields равно true) -->
        <div v-if="showPasswordFields">
          <label>
            Новый пароль:
            <input v-model="user.password" type="password" />
          </label>
  
          <label>
            Подтвердите новый пароль:
            <input v-model="user.confirmPassword" type="password" />
          </label>
        </div>
  
        <BaseButton type="submit" customClass="details-button" >Сохранить</BaseButton>
        <BaseButton type="button" customClass="details-button" @click="goBack">Отмена</BaseButton>
      </form>
  
      <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  import { useAuthStore } from "@/stores/auth.js";
  import { useRouter } from "vue-router";
  import BaseButton from "@/components/BaseButton.vue";
  
  export default {
    name: "EditProfilePage",
    components: {
   BaseButton
},
    data() {
      return {
        user: { name: "", password: "", confirmPassword: "" },
        avatarPreview: null,
        isLoading: true,
        error: null,
        successMessage: "",
        showPasswordFields: false, // Состояние для отображения полей пароля
      };
    },
    setup() {
      const router = useRouter();
      return { router };
    },
    async mounted() {
      await this.fetchUserProfile();
    },
    methods: {
      async fetchUserProfile() {
        this.isLoading = true;
        this.error = null;
  
        try {
          const authStore = useAuthStore();
          const token = authStore.user?.token;
  
          const response = await axios.get("http://event-edge-su/api/guest/participants/my-profile", {
            headers: { Authorization: `Bearer ${token}` }
          });
  
          this.user = response.data.user;
        } catch (err) {
          this.error = "Ошибка при загрузке данных";
          console.error(err);
        } finally {
          this.isLoading = false;
        }
      },
      handleFileChange(event) {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            this.avatarPreview = reader.result; // Сохраняем изображение для предпросмотра
          };
          reader.readAsDataURL(file);
        }
      },
      togglePasswordFields() {
        this.showPasswordFields = !this.showPasswordFields; // Переключаем состояние видимости полей для пароля
      },
      async updateProfile() {
        this.error = null;
        this.successMessage = "";
  
        if (this.user.password !== this.user.confirmPassword) {
          this.error = "Пароли не совпадают!";
          return;
        }
  
        const formData = new FormData();
        formData.append("name", this.user.name);
        if (this.user.password) {
          formData.append("password", this.user.password);
        }
  
        if (this.avatarPreview) {
          formData.append("avatar", this.avatarPreview);
        }
  
        try {
          const authStore = useAuthStore();
          const token = authStore.user?.token;
  
          await axios.post("http://event-edge-su/api/guest/participants/update-profile", formData, {
            headers: { 
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data" // Указываем, что передаем formData
            }
          });
  
          this.successMessage = "Профиль успешно обновлен!";
        } catch (err) {
          this.error = "Ошибка при обновлении профиля";
          console.error(err);
        }
      },
      goBack() {
        this.router.push("/profile");
      }
    }
  };
  </script>
  
  <style scoped>
  .edit-profile-container {
    max-width: 500px;
    margin: 100px auto;
    padding: 20px;
    background: #2D2D2D;
    border-radius: 12px;
    text-align: center;
    color: #fff;
  }
  
  .title {
    font-size: 2rem;
    color: #CDAA51;
    margin-bottom: 20px;
  }
  
  form {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  input {
    width: 100%;
    padding: 8px;
    border-radius: 5px;
    border: 1px solid #ccc;
    background-color: #333;
    color: #fff;
  }
  
  .save-button,
  .cancel-button {
    padding: 10px;
    font-size: 1rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 10px;
  }
  
  .save-button {
    background-color: #205f3a;
    color: white;
  }
  
  .cancel-button {
    background-color: #E53E3E;
    color: white;
  }
  
  .success-message {
    color: #2a7749;
    margin-top: 10px;
  }
  
  .avatar-preview img {
    max-width: 100px;
    max-height: 100px;
    margin-top: 10px;
    border-radius: 50%;
  }
  
  .details-button {
  background-color: #fff;
  color: #000;
  padding: 8px 20px;
  border-radius: 8px;
  text-decoration: none;
  display: inline-block;
}

.details-button:hover {
  background-color: #000;
  color: #fff;
}
  </style>
  