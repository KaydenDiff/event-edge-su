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
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.token) return;
        const response = await axios.get("http://event-edge-su/api/my-profile", {
          headers: {'Authorization': `Bearer ${user.token}`}
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

  max-width: 800px; /* Увеличьте ширину для соответствия профилю */
  margin: 100px auto; /* Отступ сверху */
  padding: 30px; /* Уменьшите отступы для более компактного вида */
  background: linear-gradient(145deg, #2c2c2c, #1a1a1a); /* Градиентный фон */
  border-radius: 15px; /* Увеличьте радиус скругления */
  text-align: center;
  color: #fff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); /* Тень для глубины */
  border: 1px solid rgba(182, 0, 254, 0.1); /* Лёгкая рамка */
}

.title {
  font-size: 2.2rem; /* Размер заголовка */
  color: #630181; /* Цвет заголовка */
  margin-bottom: 30px; /* Отступ снизу */
  font-weight: 600; /* Жирный шрифт */
  letter-spacing: 1px; /* Расстояние между буквами */
}

form {
  display: flex;
  flex-direction: column; /* Вертикальное расположение элементов */
  gap: 20px; /* Промежутки между элементами */
}

label {
  text-align: left; /* Выравнивание текста */
  font-size: 1.1rem; /* Размер шрифта */
  color: #630181; /* Цвет текста */
  margin-bottom: 8px; /* Отступ снизу */
  display: block; /* Блочный элемент */
}

input {
  width: 100%; /* Ширина 100% */
  padding: 12px; /* Отступы внутри поля */
  border-radius: 8px; /* Скругление углов */
  border: 1px solid rgba(184, 81, 205, 0.2); /* Рамка */
  background-color: rgba(51, 51, 51, 0.8); /* Фон */
  color: #fff; /* Цвет текста */
  font-size: 1rem; /* Размер шрифта */
  transition: all 0.3s ease; /* Плавный переход */
}

input:focus {
  outline: none; /* Убираем обводку */
  border-color: #630181; /* Цвет рамки при фокусе */
  box-shadow: 0 0 10px rgba(205, 170, 81, 0.2); /* Тень при фокусе */
}

.input-error {
  color: #ff6b6b; /* Цвет ошибок */
  font-size: 0.9rem; /* Размер шрифта для ошибок */
  margin-top: 5px; /* Отступ сверху */
  text-align: left; /* Выравнивание текста */
}

.avatar-preview {
  margin: 20px 0; /* Отступы сверху и снизу */
}

.avatar-preview img {
  max-width: 200px; /* Максимальная ширина */
  max-height: 200px; /* Максимальная высота */
  border-radius: 50%; /* Круглая форма */
  object-fit: cover; /* Обтекание изображения */
  border: 3px solid #630181; /* Рамка */
  box-shadow: 0 5px 15px rgba(205, 170, 81, 0.2); /* Тень */
}

.details-button {
  padding: 10px 20px; /* Уменьшите отступы для компактного вида */
  border-radius: 8px; /* Скругление углов */
  font-weight: 600; /* Жирный шрифт */
  font-size: 1rem; /* Размер шрифта */
  border: none; /* Убираем рамку */
  cursor: pointer; /* Указатель при наведении */
  transition: all 0.3s ease; /* Плавный переход */
  text-transform: uppercase; /* Верхний регистр */
  letter-spacing: 1px; /* Расстояние между буквами */
  margin: 10px 0; /* Отступы */
  background: linear-gradient(45deg, #630181, #9500ff); /* Градиентный фон */
  color: #fff; /* Цвет текста */
}

.details-button:hover {
  transform: translateY(-2px); /* Подъём при наведении */
  box-shadow: 0 5px 15px rgba(205, 170, 81, 0.3); /* Тень при наведении */
}

.success-message {
  color: #4CAF50; /* Цвет успеха */
  margin-top: 20px; /* Отступ сверху */
  padding: 15px; /* Отступы */
  background: rgba(76, 175, 80, 0.1); /* Фон успеха */
  border-radius: 8px; /* Скругление углов */
  font-weight: 500; /* Жирный шрифт */
}

.error-message {
  color: #ff6b6b; /* Цвет ошибки */
  margin-top: 20px; /* Отступ сверху */
  padding: 15px; /* Отступы */
  background: rgba(255, 107, 107, 0.1); /* Фон ошибки */
  border-radius: 8px; /* Скругление углов */
  font-weight: 500; /* Жирный шрифт */
}

.loading {
  color: #630181; /* Цвет загрузки */
  font-size: 1.2rem; /* Размер шрифта */
  margin: 20px 0; /* Отступы */
}

@media (max-width: 768px) {
  .edit-profile-container {
    margin: 40px 20px; /* Отступы для мобильных */
    padding: 20px; /* Отступы для мобильных */
  }

  .title {
    font-size: 1.8rem; /* Размер заголовка для мобильных */
  }

  .details-button {
    padding: 10px 20px; /* Отступы для мобильных */
    font-size: 1rem; /* Размер шрифта для мобильных */
  }
}
</style>
  