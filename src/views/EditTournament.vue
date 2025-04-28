<template>
  <div class="edit-tournament-container">
    <h2>Редактирование турнира</h2>
    <form @submit.prevent="updateTournament" class="edit-tournament-form">
      <div class="form-group">
        <label for="name">Название турнира:</label>
        <input type="text" id="name" v-model="tournament.name" class="input-field"  @input="handleInput"/>
      </div>

      <div class="form-group">
        <label for="description">Описание:</label>
        <textarea id="description" v-model="tournament.description" class="input-field"  @input="handleInput"></textarea>
      </div>

      <div class="form-group">
        <label for="startDate">Дата начала:</label>
        <input 
          type="datetime-local" 
          id="startDate" 
          v-model="tournament.startDate" 
          class="input-field"  
          @input="handleInput"
          step="60"
        />
      </div>

      <div class="form-group">
        <label for="endDate">Дата окончания:</label>
        <input 
          type="datetime-local" 
          id="endDate" 
          v-model="tournament.endDate" 
          class="input-field" 
          @input="handleInput" 
          step="60"
        />
      </div>
      <!-- Выпадающий список для выбора игры -->
      <div class="form-group">
        <label for="game">Игра:</label>
        <select id="game" v-model="gameId" class="input-field"  @input="handleInput">
          <option v-for="game in games" :key="game.id" :value="game.id">{{ game.name }}</option>
        </select>
      </div>

      <!-- Выпадающий список для выбора этапа -->
      <div class="form-group">
        <label for="stage">Этап:</label>
        <select id="stage" v-model="stageId" class="input-field"  @input="handleInput">
          <option v-for="stage in stages" :key="stage.id" :value="stage.id">{{ stage.name }}</option>
        </select>
      </div>

      <div class="form-group">
  <label for="image">Изображение:</label>
  <input type="file" id="image" @change="handleFileUpload" />
  
  <!-- Отображение имени выбранного файла -->
  <p v-if="selectedFileName" class="file-info">Выбранный файл: {{ selectedFileName }}</p>

  <!-- Предпросмотр загруженного изображения -->
  <div v-if="previewImage" class="image-preview">
    <img :src="previewImage" alt="Предпросмотр изображения" />
  </div>
</div>
      <button type="submit" class="btn-submit">Обновить турнир</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'EditTournament',
  data() {
    return {
      tournament: {
        id: null,
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        viewsCount: 0
      },
      imageFile: null,
      organizerId: null,
      gameId: null,
      stageId: null,
      organizerName: '',
      gameName: '',
      stageName: '',
      originalTournament: {},
      games: [], // Список игр
      stages: [], // Список этапов
      previewImage: null,
      selectedFileName: "",
    };
  },
  async mounted() {
    await this.fetchTournament();
    await this.fetchGamesAndStages(); // Получаем список игр и этапов
  },
  methods: {
    
    handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    // Проверяем формат файла
    const allowedFormats = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedFormats.includes(file.type)) {
      alert("❌ Разрешены только файлы форматов PNG, JPG, JPEG.");
      event.target.value = ""; // Очищаем input
      this.imageFile = null;
      this.previewImage = null;
      this.selectedFileName = "";
      return;
    }

      this.imageFile = file;
      this.previewImage = URL.createObjectURL(file); // Генерация URL для предпросмотра
      this.selectedFileName = `${file.name} (${file.type})`; // Отображение имени и формата
      }
    },
    sanitizeInput(input) {
    // Простая фильтрация (удаляем специальные символы)
    return input.replace(/[<>&"'/]/g, ''); // Можно добавить больше символов в регулярное выражение
  },

  handleInput(event) {
    // Применяем фильтрацию при каждом вводе
    event.target.value = this.sanitizeInput(event.target.value);
  },
    async fetchTournament() {
      try {
        const response = await fetch(`http://event-edge-su/api/guest/tournaments/${this.$route.params.id}`);
        if (!response.ok) {
          throw new Error('Ошибка загрузки турнира');
        }
        const data = await response.json();
        
        // Форматируем даты, убирая секунды
        const formatDateTime = (dateTimeStr) => {
          if (!dateTimeStr) return '';
          const date = new Date(dateTimeStr);
          return date.toISOString().slice(0, 16); // Убираем секунды
        };

        this.tournament = {
          id: data.id,
          name: data.name,
          description: data.description,
          startDate: formatDateTime(data.start_date),
          endDate: formatDateTime(data.end_date),
          viewsCount: data.views_count
        };
        this.organizerId = data.organizer.id;
        this.organizerName = data.organizer.name;
        this.gameId = data.game.id;
        this.gameName = data.game.name;
        this.stageId = data.stage.id;
        this.stageName = data.stage.name;

        // Сохраняем оригинальные данные для сравнения
        this.originalTournament = JSON.parse(JSON.stringify(this.tournament));
      } catch (error) {
        console.error('Ошибка загрузки турнира:', error);
      }
    },
    async fetchGamesAndStages() {
      try {
        const [gamesResponse, stagesResponse] = await Promise.all([
          fetch('http://event-edge-su/api/guest/games'),
          fetch('http://event-edge-su/api/guest/stages')
        ]);

        if (!gamesResponse.ok || !stagesResponse.ok) {
          throw new Error('Ошибка загрузки игр и этапов');
        }

        this.games = await gamesResponse.json();
        this.stages = await stagesResponse.json();
      } catch (error) {
        console.error('Ошибка загрузки игр и этапов:', error);
      }
    },
    async updateTournament() {
      let updatedFields = new FormData();

      // Добавляем только измененные текстовые поля
      if (this.tournament.name !== this.originalTournament.name) {
        updatedFields.append('name', this.tournament.name);
      }
      if (this.tournament.description !== this.originalTournament.description) {
        updatedFields.append('description', this.tournament.description);
      }
      if (this.tournament.startDate !== this.originalTournament.startDate) {
        updatedFields.append('start_date', this.tournament.startDate);
      }
      if (this.tournament.endDate !== this.originalTournament.endDate) {
        updatedFields.append('end_date', this.tournament.endDate);
      }
      
      // Добавляем обязательные поля
      updatedFields.append('views_count', this.tournament.viewsCount);
      updatedFields.append('user_id', this.organizerId);
      updatedFields.append('game_id', this.gameId);
      updatedFields.append('stage_id', this.stageId);

      // Добавляем изображение только если оно было выбрано
      if (this.imageFile) {
        updatedFields.append('image', this.imageFile);
      }

      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.token) {
        console.error("❌ Ошибка: токен не найден!");
        alert("Ошибка: вы не авторизованы");
        return;
      }

      try {
        const response = await fetch(`http://event-edge-su/api/admin/tournaments/update/${this.tournament.id}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.token}`
          },
          body: updatedFields
        });

        if (!response.ok) {
          const responseData = await response.json();
          console.error("❌ Ошибка при обновлении:", responseData);
          throw new Error(responseData.message || 'Ошибка при обновлении');
        }

        const responseData = await response.json();
        alert('Турнир успешно обновлен!');
        this.$router.push('/admin');
      } catch (error) {
        alert(`Ошибка при обновлении турнира: ${error.message}`);
      }
    }
  }
};
</script>

<style scoped>
.edit-tournament-container {
  max-width: 600px;
  margin: 70px auto;
  padding: 25px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  color: #333;
  font-size: 24px;
  margin-bottom: 20px;
}

.edit-tournament-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  font-weight: 600;
  margin-bottom: 5px;
  color: #444;
}

.input-field {
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
  transition: 0.3s ease-in-out;
  background-color: #f9f9f9;
}

.input-field:focus {
  border-color: #000000;
  outline: none;
  background-color: #fff;
}

textarea {
  min-height: 100px;
  resize: vertical;
}

.btn-submit {
  background-color: #ffffff;
  color: #000000;
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s ease-in-out;
  outline: none;
  border: 3px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 10px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  z-index: 1;
  text-decoration: none;
}

.btn-submit:hover {
  animation: pulseBorder 1.5s infinite ease-in-out;
  transform: scale(1.05);
  color: #ffffff;
}

.btn-submit:active {
  transform: scale(0.95);
}

@keyframes pulseBorder {
  0% { border-color: rgba(255, 255, 255, 0.5); }
  50% { border-color: rgba(255, 255, 255, 1); }
  100% { border-color: rgba(255, 255, 255, 0.5); }
}

@media (max-width: 768px) {
  .edit-tournament-container {
    max-width: 90%;
    padding: 20px;
  }
}
.image-preview {
  margin-top: 10px;
  text-align: center;
}

/* Стили для изображения */
.image-preview img {
  max-width: 100%;
  height: auto;
  border-radius: 10px;
  padding: 5px;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border: 3px solid rgba(255, 255, 255, 0.5); /* Добавляем рамку */
  animation: pulseBorder1 1.5s infinite ease-in-out;
}
.file-info {
  font-size: 14px;
  color: #555;
  margin-top: 5px;
}
@keyframes pulseBorder1 {
  0% { border-color: rgba(0, 0, 0, 0.2); }
  50% { border-color: rgba(0, 0, 0, 1); }
  100% { border-color: rgba(0, 0, 0, 0.2); }
}
</style>
