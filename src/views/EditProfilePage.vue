<template>
  <div class="edit-profile-container">
    <h1 class="title">Редактировать профиль</h1>

    <div v-if="isLoading" class="loading">Загрузка...</div>
    <div v-if="error" class="error-message">{{ error }}</div>

    <form v-else @submit.prevent="updateProfile">
      <label>
        Имя:
        <input v-model="user.name" type="text" required v-tooltip="'Имя должно быть от 1 до 255 символов'" />
        <div class="input-error" v-if="fieldErrors.name">
          {{ fieldErrors.name[0] }}
        </div>
      </label>

      <label>
        Аватар:
        <input type="file" accept="image/*" @change="handleFileChange" title="Максимум 2MB, не менее 200x200px" />
        <div v-if="fieldErrors.avatar" class="input-error">
          {{ fieldErrors.avatar[0] }}
        </div>
        <div v-if="avatarPreview" class="avatar-preview">
          <img :src="avatarPreview" alt="Аватар" />
        </div>
      </label>

      <BaseButton type="button" customClass="details-button" @click="togglePasswordFields">
        Изменить пароль
      </BaseButton>

      <div v-if="showPasswordFields">
        <label>
          Новый пароль:
          <input v-model="user.password" type="password" v-tooltip="'Пароль должен быть минимум 8 символов'" />
          <div class="input-error" v-if="fieldErrors.password">
            {{ fieldErrors.password[0] }}
          </div>
        </label>

        <label>
          Подтвердите новый пароль:
          <input v-model="user.confirmPassword" type="password" v-tooltip="'Пароль и подтверждение пароля должны совпадать'" />
          <div class="input-error" v-if="fieldErrors.password_confirmation">
            {{ fieldErrors.password_confirmation[0] }}
          </div>
        </label>
      </div>

      <BaseButton type="submit" customClass="details-button">Сохранить</BaseButton>
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
import { VTooltip } from 'v-tooltip';
export default {
  name: "EditProfilePage",
  components: { BaseButton },
   directives: {
    tooltip: VTooltip
  },
  data() {
    return {
      user: { name: "", password: "", confirmPassword: "" },
      avatarFile: null,
      avatarPreview: null,
      isLoading: true,
      error: null,
      successMessage: "",
      showPasswordFields: false,
      fieldErrors: {} // добавлено для отображения ошибок по полям
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

        const response = await axios.get("http://event-edge-su/api/my-profile", {
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

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    this.error = "Файл должен быть изображением.";
    this.avatarFile = null;
    this.avatarPreview = null;
    return;
  }

  const maxSizeInBytes = 2 * 1024 * 1024; // 2 MB
  if (file.size > maxSizeInBytes) {
    this.error = "Изображение слишком большое. Максимальный размер — 2MB.";
    this.avatarFile = null;
    this.avatarPreview = null;
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.src = e.target.result;

    img.onload = () => {
      const minWidth = 200;
      const minHeight = 200;

      if (img.width < minWidth || img.height < minHeight) {
        this.error = `Разрешение изображения слишком маленькое. Минимум: ${minWidth}x${minHeight}px.`;
        this.avatarFile = null;
        this.avatarPreview = null;
      } else {
        this.error = null;
        this.avatarFile = file;
        this.avatarPreview = e.target.result;
      }
    };
  };
  reader.readAsDataURL(file);
},
    togglePasswordFields() {
      this.showPasswordFields = !this.showPasswordFields;
    },

    async updateProfile() {
      this.error = null;
      this.successMessage = "";
      this.fieldErrors = {};

      if (this.user.password !== this.user.confirmPassword) {
        this.fieldErrors.password_confirmation = ["Пароли не совпадают."];
        return;
      }

      const formData = new FormData();
      formData.append("name", this.user.name);

      if (this.user.password) {
        formData.append("password", this.user.password);
        formData.append("password_confirmation", this.user.confirmPassword);
      }

      if (this.avatarFile) {
        formData.append("avatar", this.avatarFile);
      }

      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.token) {
          this.error = "Токен не найден";
          return;
        }

        await axios.post("http://event-edge-su/api/profile/update", formData, {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "multipart/form-data"
          }
        });

        this.successMessage = "Профиль успешно обновлен!";
        this.goBack();

      } catch (err) {
        if (err.response?.status === 422 && err.response?.data?.errors) {
          this.fieldErrors = err.response.data.errors;
        } else {
          this.error = "Ошибка при обновлении профиля.";
        }
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
  max-width: 600px;
  margin: 100px auto;
  padding: 40px;
  background: linear-gradient(145deg, #2D2D2D, #1a1a1a);
  border-radius: 16px;
  text-align: center;
  color: #fff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(205, 170, 81, 0.1);
}

.title {
  font-size: 2.2rem;
  color: #630181;
  margin-bottom: 30px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

label {
  text-align: left;
  font-size: 1.1rem;
  color: #630181;
  margin-bottom: 8px;
  display: block;
}

input {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(205, 170, 81, 0.2);
  background-color: rgba(51, 51, 51, 0.8);
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;
}

input:focus {
  outline: none;
  border-color: #630181;
  box-shadow: 0 0 10px rgba(205, 170, 81, 0.2);
}

.input-error {
  color: #ff6b6b;
  font-size: 0.9rem;
  margin-top: 5px;
  text-align: left;
}

.avatar-preview {
  margin: 20px 0;
}

.avatar-preview img {
  max-width: 200px;
  max-height: 200px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #630181;
  box-shadow: 0 5px 15px rgba(205, 170, 81, 0.2);
}

.details-button {
  background: linear-gradient(45deg, #630181, #b38d3d);
  color: #000;
  padding: 12px 25px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.1rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 10px 0;
}

.details-button:hover {
  background: linear-gradient(45deg, #b38d3d, #630181);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(205, 170, 81, 0.3);
}

.success-message {
  color: #4CAF50;
  margin-top: 20px;
  padding: 15px;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 8px;
  font-weight: 500;
}

.error-message {
  color: #ff6b6b;
  margin-top: 20px;
  padding: 15px;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 8px;
  font-weight: 500;
}

.loading {
  color: #630181;
  font-size: 1.2rem;
  margin: 20px 0;
}

@media (max-width: 768px) {
  .edit-profile-container {
    margin: 40px 20px;
    padding: 20px;
  }

  .title {
    font-size: 1.8rem;
  }

  .details-button {
    padding: 10px 20px;
    font-size: 1rem;
  }
}
</style>
  