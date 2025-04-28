<template>
    <div class="tournament-form">
      <h3>Создать новый турнир</h3>
      
      <form @submit="handleSubmit">
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
            />
          </div>
          
          <div class="form-group">
            <label>Дата окончания</label>
            <input 
              v-model="formData.end_date" 
              type="datetime-local" 
              :min="formData.start_date"
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
          <label>Команды</label>
          <div class="teams-selector">
            <div 
              v-for="team in teams" 
              :key="team.id" 
              class="team-checkbox"
              :class="{ 'team-active': team.status === 'active' }"
            >
              <input 
                type="checkbox" 
                :id="'team-'+team.id" 
                :value="team.id" 
                v-model="formData.teams"
                :disabled="team.status !== 'active'"
              >
              <label :for="'team-'+team.id">
                {{ team.name }}
                <span v-if="team.status !== 'active'" class="team-inactive-label">
                  (неактивна)
                </span>
              </label>
            </div>
          </div>
        </div>
        
        <div class="form-group">
          <label>Изображение</label>
          <div class="image-upload-container">
            <div class="upload-area">
              <input 
                type="file" 
                @change="handleImageUpload" 
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
        
        <div class="form-actions">
          <BaseButton type="button" @click="$emit('cancel')" customClass="btn-secondary">
            Отмена
          </BaseButton>
          <BaseButton type="submit" :disabled="isSubmitting" customClass="btn-primary">
            {{ isSubmitting ? 'Отправка...' : 'Создать' }}
          </BaseButton>
        </div>
      </form>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue'
  import BaseButton from '@/components/BaseButton.vue'
  
  export default {
    name: 'TournamentForm',
    components: { BaseButton },
    props: {
      games: {
        type: Array,
        default: () => []
      },
      stages: {
        type: Array,
        default: () => []
      },
      teams: {
        type: Array,
        default: () => []
      }
    },
    setup(props, { emit }) {
      const isSubmitting = ref(false)
      const imagePreview = ref(null)
      const formData = ref({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        game_id: '',
        stage_id: '',
        status: 'pending',
        teams: [],
        image: null
      })
  
      const handleImageUpload = (event) => {
        const file = event.target.files[0]
        if (file) {
          formData.value.image = file
          const reader = new FileReader()
          reader.onload = (e) => {
            imagePreview.value = e.target.result
          }
          reader.readAsDataURL(file)
        }
      }
  
      const removeImage = () => {
        formData.value.image = null
        imagePreview.value = null
        // Сбрасываем значение input file
        const fileInput = document.querySelector('.file-input')
        if (fileInput) fileInput.value = ''
      }
  
      const handleSubmit = (event) => {
        event.preventDefault() // Предотвращаем стандартную отправку формы
        if (isSubmitting.value) return
        isSubmitting.value = true
        try {
          // Создаем объект с данными формы
          const submissionData = {
            name: formData.value.name,
            description: formData.value.description || '',
            game_id: formData.value.game_id,
            stage_id: formData.value.stage_id || '',
            status: formData.value.status,
            teams: [...formData.value.teams], // Создаем копию массива
            image: formData.value.image
          }
          
          // Форматируем даты
          if (formData.value.start_date) {
            submissionData.start_date = formData.value.start_date.replace('T', ' ').slice(0, 16) + ':00'
          }
          if (formData.value.end_date) {
            submissionData.end_date = formData.value.end_date.replace('T', ' ').slice(0, 16) + ':00'
          }
        
          
          // Отправляем данные через emit
          emit('submit', submissionData)
        } finally {
          isSubmitting.value = false
        }
      }
  
      const formatFileSize = (bytes) => {
        if (!bytes) return ''
        const units = ['B', 'KB', 'MB', 'GB']
        let size = bytes
        let unitIndex = 0
        while (size >= 1024 && unitIndex < units.length - 1) {
          size /= 1024
          unitIndex++
        }
        return `${size.toFixed(1)} ${units[unitIndex]}`
      }
  
      return {
        formData,
        isSubmitting,
        imagePreview,
        handleImageUpload,
        removeImage,
        handleSubmit,
        formatFileSize
      }
    }
  }
  </script>
  
  <style scoped>
  .tournament-form {
    background: #2c2c2c;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 30px;
  }
  
  .tournament-form h3 {
    margin-top: 0;
    color: #630181;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }
  
  .form-group input[type="text"],
  .form-group input[type="datetime-local"],
  .form-group select,
  .form-group textarea {
    width: 100%;
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #5F665E;
    background: #3c3c3c;
    color: white;
  }
  
  .form-group textarea {
    min-height: 100px;
  }
  
  .form-row {
    display: flex;
    gap: 15px;
  }
  
  .form-row .form-group {
    flex: 1;
  }
  
  .teams-selector {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 10px;
    max-height: 300px;
    overflow-y: auto;
    padding: 15px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    border: 2px solid rgba(255, 255, 255, 0.1);
  }
  
  .team-checkbox {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-radius: 6px;
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.03);
  }
  
  .team-checkbox:hover {
    background: rgba(255, 255, 255, 0.08);
  }
  
  .team-checkbox input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
  
  .team-checkbox input[type="checkbox"]:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  
  .team-checkbox label {
    margin: 0;
    font-weight: normal;
    color: #ffffff;
    cursor: pointer;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .team-inactive-label {
    font-size: 0.85em;
    color: #ff6b6b;
    font-style: italic;
  }
  
  .team-active {
    border: 1px solid rgba(182, 0, 254, 0.2);
  }
  
  .team-checkbox input[type="checkbox"]:checked + label {
    color: #630181;
    font-weight: 500;
  }
  
  .image-upload-container {
    margin-top: 10px;
  }
  
  .upload-area {
    position: relative;
    margin-bottom: 15px;
  }
  
  .file-input {
    display: none;
  }
  
  .upload-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: rgba(255, 255, 255, 0.05);
    border: 2px dashed rgba(182, 0, 254, 0.3);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .upload-label:hover {
    background: rgba(182, 0, 254, 0.1);
    border-color: rgba(182, 0, 254, 0.5);
  }
  
  .upload-icon {
    font-size: 24px;
    color: #630181;
    margin-bottom: 8px;
  }
  
  .preview-container {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 15px;
    margin-top: 15px;
  }
  
  .image-preview {
    position: relative;
    display: inline-block;
    margin-bottom: 10px;
  }
  
  .image-preview img {
    max-width: 100%;
    max-height: 300px;
    border-radius: 8px;
    border: 2px solid rgba(182, 0, 254, 0.2);
    object-fit: contain;
  }
  
  .remove-image {
    position: absolute;
    top: -12px;
    right: -12px;
    background: #ff6b6b;
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 16px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
  }
  
  .remove-image:hover {
    background: #ff5252;
    transform: scale(1.1);
  }
  
  .image-info {
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding: 10px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
  }
  
  .file-name {
    color: #ffffff;
    font-size: 0.9rem;
    word-break: break-all;
  }
  
  .file-size {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.8rem;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 15px;
    margin-top: 30px;
  }
  
  .form-actions button {
    padding: 12px 25px;
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
  }
  
  button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none !important;
  }
  </style>