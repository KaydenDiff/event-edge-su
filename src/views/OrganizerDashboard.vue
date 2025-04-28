<template>
  <div class="tournament-form">
    <h3>Разместить информацию о своем турнире</h3>
    
    <form @submit.prevent="createTournament">
      <div class="form-group">
        <label>Название турнира*</label>
        <input v-model="formData.name" type="text" required />
      </div>
      
      <div class="form-group">
        <label>Описание</label>
        <textarea v-model="formData.description"></textarea>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>Дата начала*</label>
          <input 
            v-model="formData.start_date" 
            type="datetime-local" 
            required 
            step="60"
          />
        </div>
        
        <div class="form-group">
          <label>Дата окончания</label>
          <input 
            v-model="formData.end_date" 
            type="datetime-local" 
            :min="formData.start_date"
            step="60"
          />
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>Игра*</label>
          <select v-model="formData.game_id" required>
            <option disabled value="">Выберите игру</option>
            <option 
              v-for="game in games" 
              :key="game.id" 
              :value="game.id"
            >
              {{ game.name }}
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Стадия</label>
          <select v-model="formData.stage_id">
            <option disabled value="">Выберите стадию</option>
            <option 
              v-for="stage in stages" 
              :key="stage.id" 
              :value="stage.id"
            >
              {{ stage.name }}
            </option>
          </select>
        </div>
      </div>
      
      <div class="form-group">
        <label>Статус</label>
        <select v-model="formData.status">
          <option value="pending">Ожидание</option>
          <option value="registrationOpen">Регистрация открыта</option>
          <option value="ongoing">В процессе</option>
          <option value="completed">Завершен</option>
          <option value="canceled">Отменен</option>
        </select>
      </div>  
      <div class="form-group">
        <label>Изображение</label>
        <div class="image-upload-container">
          <div class="upload-area">
            <input 
              type="file" 
              @change="handleFileChange" 
              accept="image/*"
              class="file-input" 
              id="tournament-image"
            />
            <label for="tournament-image" class="upload-label">
              <i class="upload-icon">+</i>
              <span>Выберите изображение</span>
            </label>
          </div>

          <div v-if="imagePreview" class="preview-container">
            <div class="image-preview">
              <img :src="imagePreview" alt="Preview" />
              <button type="button" @click="removeImage" class="remove-image">×</button>
            </div>
            <div class="image-info">
              <span class="file-name">{{ formData.image?.name }}</span>
              <span class="file-size">{{ formatFileSize(formData.image?.size) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div class="form-actions">
        <BaseButton type="button" @click="$router.push('/tournaments')" customClass="btn-secondary">
          Отмена
        </BaseButton>
        <BaseButton type="submit" :disabled="isLoading" customClass="btn-primary">
          {{ isLoading ? 'Создание...' : 'Создать турнир' }}
        </BaseButton>
      </div>
    </form>
  </div>
</template>
  
<script>
import axios from "axios";
import { useAuthStore } from "@/stores/auth.js";
import BaseButton from "@/components/BaseButton.vue";

export default {
  name: "CreateTournamentPage",
  components: {
    BaseButton,
  },
  data() {
    return {
      formData: {
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        game_id: '',
        stage_id: '',
        status: 'pending',
        image: null
      },
      imagePreview: null,
      games: [],
      stages: [],
      teams: [],
      isLoading: false,
      error: null,
    };
  },
  async mounted() {
    await this.fetchDropdownData();
  },
  methods: {
    getRoutePrefix() {
      try {
        const userDataString = localStorage.getItem('user');
        if (!userDataString) {
          throw new Error('Пользователь не авторизован');
        }

        const userData = JSON.parse(userDataString);
        const userRole = userData.role;

        switch (userRole) {
          case 'Администратор':
            return 'admin';
          case 'Оператор':
            return 'operator';
          default:
            return 'user';
        }
      } catch (error) {
        console.error('Ошибка при определении роли пользователя:', error);
        throw new Error('Ошибка при определении прав доступа');
      }
    },
    async fetchDropdownData() {
      try {
        const userDataString = localStorage.getItem('user');
        const userData = JSON.parse(userDataString);
        const token = userData.token;

        const [gamesRes, stagesRes] = await Promise.all([
          axios.get("http://event-edge-su/api/guest/games"),
          axios.get("http://event-edge-su/api/guest/stage-type"),
        ]);

        this.games = gamesRes.data;
        this.stages = stagesRes.data.data;
      } catch (err) {
        this.error = "Ошибка при загрузке данных";
        console.error(err);
      }
    },
    handleFileChange(event) {
      const file = event.target.files[0];

      if (!file) return;

      if (!file.type.startsWith("image/")) {
        this.error = "Файл должен быть изображением.";
        this.formData.image = null;
        this.imagePreview = null;
        return;
      }

      const maxSizeInBytes = 2 * 1024 * 1024; // 2 MB
      if (file.size > maxSizeInBytes) {
        this.error = "Изображение слишком большое. Максимальный размер — 2MB.";
        this.formData.image = null;
        this.imagePreview = null;
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
            this.formData.image = null;
            this.imagePreview = null;
          } else {
            this.error = null;
            this.formData.image = file;
            this.imagePreview = e.target.result;
          }
        };
      };
      reader.readAsDataURL(file);
    },
    removeImage() {
      this.formData.image = null;
      this.imagePreview = null;
      const fileInput = document.querySelector('#tournament-image');
      if (fileInput) fileInput.value = '';
    },
    formatFileSize(bytes) {
      if (!bytes) return '';
      const units = ['B', 'KB', 'MB', 'GB'];
      let size = bytes;
      let unitIndex = 0;
      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
      }
      return `${size.toFixed(1)} ${units[unitIndex]}`;
    },
    
    formatDateForApi(dateString) {
      if (!dateString) return '';
      return dateString.replace('T', ' ') + ':00';
    },
    async createTournament() {
      if (this.isLoading) return;
      
      this.isLoading = true;
      this.error = null;

      if (this.formData.start_date && this.formData.end_date && 
          new Date(this.formData.start_date) >= new Date(this.formData.end_date)) {
        this.error = "Дата и время начала должны быть раньше даты и времени окончания";
        this.isLoading = false;
        return;
      }

      try {
        const authStore = useAuthStore();
        const token = authStore.accessToken;
        const routePrefix = this.getRoutePrefix();

        const formData = new FormData();
        const tournamentData = {
          ...this.formData,
          start_date: this.formatDateForApi(this.formData.start_date),
          end_date: this.formatDateForApi(this.formData.end_date)
        };

        Object.keys(tournamentData).forEach(key => {
          if (key === 'image') return;
          if (key === 'teams') {
            formData.append(key, JSON.stringify(tournamentData[key]));
            return;
          }
          if (tournamentData[key] !== null && tournamentData[key] !== undefined) {
            formData.append(key, tournamentData[key]);
          }
        });
        
        if (this.formData.image) {
          formData.append('image', this.formData.image);
        }

        await axios.post(
          `http://event-edge-su/api/tournament-request-${routePrefix}`,
          formData,
          { 
            headers: { 
              Authorization: `Bearer ${useAuthStore.token}`,
              'Content-Type': 'multipart/form-data'
            } 
          }
        );

        this.$router.push("/tournaments");
      } catch (err) {
        if (err.response?.data?.errors) {
          const errors = err.response.data.errors;
          this.error = Object.values(errors)
            .flat()
            .join('\n');
        } else if (err.message.includes('Недостаточно прав') || err.message.includes('Пользователь не авторизован')) {
          this.error = err.message;
        } else {
          this.error = "Ошибка при создании турнира";
        }
        console.error(err);
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>
  
<style scoped>
.tournament-form {
  background: #2c2c2c;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(182, 0, 254, 0.1);
  position: relative;
  overflow: hidden;
  max-width: 800px;
  width: 90%;
  margin: 100px auto;
}

.tournament-form::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #630181, #ff6a1f);
}

.tournament-form h3 {
  margin: 0 0 30px 0;
  color: #630181;
  font-size: 1.8rem;
  font-weight: 600;
  text-align: center;
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #ffffff;
  font-size: 1.1rem;
}

.form-group input[type="text"],
.form-group input[type="datetime-local"],
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px 15px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  background: #3c3c3c;
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
}

.form-group textarea {
  min-height: 120px;
  resize: vertical;
}

.form-row {
  display: flex;
  gap: 25px;
  margin-bottom: 25px;
}

.form-row .form-group {
  flex: 1;
  margin-bottom: 0;
}

.teams-selector {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
  max-height: 300px;
  overflow-y: auto;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 2px solid rgba(182, 0, 254, 0.1);
}

.team-checkbox {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 15px;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: rgba(60, 60, 60, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
}


.team-checkbox input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #630181;
}

.team-checkbox label {
  margin: 0;
  font-weight: normal;
  color: #ffffff;
  cursor: pointer;
  flex: 1;
}

.team-inactive-label {
  color: #ff6b6b;
  font-size: 0.9em;
  font-style: italic;
}

.team-active {
  border-color: rgba(182, 0, 254, 0.3);
  background: rgba(99, 1, 129, 0.1);
}

.image-upload-container {
  margin-top: 15px;
}

.upload-area {
  position: relative;
  margin-bottom: 20px;
}

.file-input {
  display: none;
}

.upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  background: rgba(60, 60, 60, 0.8);
  border: 2px dashed rgba(182, 0, 254, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-label:hover {
  background: rgba(80, 80, 80, 0.8);
  color: white;
}

.upload-icon {
  font-size: 28px;
  color: #ffffff;
  margin-bottom: 10px;
}

.preview-container {
  background: rgba(60, 60, 60, 0.8);
  border-radius: 12px;
  padding: 20px;
}

.image-preview {
  position: relative;
  display: inline-block;
  margin-bottom: 15px;
}

.image-preview img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 12px;
  object-fit: contain;
}

.remove-image {
  position: absolute;
  top: -15px;
  right: -15px;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.remove-image:hover {
  background: #ff5252;
  transform: scale(1.1);
  color: white;
}

.image-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

.file-name {
  color: #ffffff;
  font-size: 0.95rem;
  word-break: break-all;
}

.file-size {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 40px;
}

.form-actions button {
  padding: 12px 30px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.btn-primary {
  background: linear-gradient(45deg, #630181, #ff6a1f);
  color: white;
}

.btn-secondary:hover,
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  color: #ffffff;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none !important;
}

@media (max-width: 768px) {
  .tournament-form {
    width: 95%;
    padding: 25px;
    margin: 20px auto;
  }

  .form-row {
    flex-direction: column;
    gap: 15px;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions button {
    width: 100%;
  }
}
</style>