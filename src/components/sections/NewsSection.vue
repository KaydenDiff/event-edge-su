<template>
  <div class="news-section">
    <BaseButton @click="toggleNewsForm" customClass="toggle-button">
      {{ showNewsForm ? 'Скрыть форму' : (editingNews ? 'Отменить редактирование' : 'Создать новость') }}
    </BaseButton>

    <NewsForm 
      v-if="showNewsForm"
      :news="editingNews"
      :isEdit="!!editingNews"
      @submit="handleNewsSubmit"
      @cancel="cancelForm"
    />

    <div v-if="loading" class="loading-message">
      Загрузка новостей...
    </div>

    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-else-if="!news.length" class="no-news">
      Новости не найдены
    </div>

    <div v-else class="news-list">
      <div v-for="newsItem in news" :key="newsItem.id" class="news-card">
        <div class="news-image-container" v-if="newsItem.image">
          <img :src="newsItem.image" :alt="newsItem.title" class="news-image">
        </div>
        <div class="news-image-placeholder" v-else>
          📰
        </div>
        
        <div class="news-meta">
          <span class="news-category">{{ newsItem.category_name }}</span>
        </div>
        
        <h3>{{ newsItem.title }}</h3>
        <p class="news-description">{{ newsItem.description }}</p>
        
        <div class="news-footer">
          <span class="news-author">Автор: {{ newsItem.author_name }}</span>
          <div class="news-actions">
            <BaseButton customClass="details-btn" @click="editNews(newsItem)">Редактировать</BaseButton>
            <BaseButton customClass="details-btn" @click="showDeleteConfirmation(newsItem)">Удалить</BaseButton>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showDeleteDialog" class="confirmation-dialog">
      <div class="dialog-content">
        <p>Вы точно хотите удалить новость "{{ newsToDelete?.title }}"?</p>
        <div class="dialog-actions">
          <BaseButton @click="confirmDelete">Да</BaseButton>
          <BaseButton @click="cancelDelete">Нет</BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

  
  <script>
  import { ref, onMounted } from 'vue'
  import axios from 'axios'
  import BaseButton from '@/components/BaseButton.vue'
  import NewsForm from '@/components/form/NewsForm.vue'
  
  export default {
    name: 'NewsSection',
    components: {
      BaseButton,
      NewsForm,
    },
    setup() {
      const news = ref([])
      const loading = ref(true)
      const error = ref(null)
      const showNewsForm = ref(false)
      const showDeleteDialog = ref(false)
      const newsToDelete = ref(null)
      const editingNews = ref(null)
      const formatDate = (dateString) => {
      if (!dateString) return '';
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('ru-RU', options);
    };
      const fetchNews = async () => {
        try {
          loading.value = true
          const response = await axios.get('http://event-edge-su/api/guest/news-feeds')
          news.value = response.data
        } catch (err) {
          error.value = 'Ошибка при загрузке новостей'
        } finally {
          loading.value = false
        }
      }
  
      const handleNewsSubmit = async (formData) => {
        if (loading.value) return; // Предотвращаем повторные отправки, если уже идет загрузка
  
        const submissionData = new FormData()
        submissionData.append('title', formData.title)
        submissionData.append('description', formData.description)
        submissionData.append('content', formData.content)
        submissionData.append('status', formData.status)
        submissionData.append('category_id', formData.category_id)
        if (formData.image) {
          submissionData.append('image', formData.image)
        }
  
        try {
          const url = editingNews.value 
            ? `http://event-edge-su/api/admin/news-feeds/update/${editingNews.value.id}` 
            : 'http://event-edge-su/api/admin/news-feeds/create'
          
          const user = JSON.parse(localStorage.getItem('user'))
          const token = user ? user.token : null
  
          await axios.post(url, submissionData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${token}`
            }
          })
          await fetchNews() // Обновляем список новостей после успешной отправки
          cancelForm() // Закрываем форму после успешной отправки
        } catch (error) {
          console.error('Ошибка при отправке данных:', error)
        }
      }
  
      const editNews = (newsItem) => {
        editingNews.value = newsItem
        showNewsForm.value = true
      }
  
      const toggleNewsForm = () => {
        showNewsForm.value = !showNewsForm.value
        if (!showNewsForm.value) editingNews.value = null
      }
  
      const showDeleteConfirmation = (newsItem) => {
        newsToDelete.value = newsItem
        showDeleteDialog.value = true
      }
  
    
      const confirmDelete = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    if (!user?.token) throw new Error('Требуется авторизация')

    const response = await axios.delete(`http://event-edge-su/api/admin/news-feeds/delete/${newsToDelete.value.id}`,
      {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      }
    )

    // Проверяем успешность операции (200 - успешное удаление)
    if (response.status === 200 && response.data.message === "Новость успешно перемещена в архив!") {
      // Удаляем новость из списка
      news.value = news.value.filter(
        n => n.id !== newsToDelete.value.id
      )
      // Закрываем диалог подтверждения
      showDeleteDialog.value = false
      newsToDelete.value = null
    } else {
      throw new Error('Ошибка при удалении новости')
    }
  } catch (err) {
    console.error('Ошибка удаления новости:', err)
    error.value = err.response?.data?.message || 'Ошибка при удалении новости'
    // Закрываем диалог в случае ошибки
    showDeleteDialog.value = false
    newsToDelete.value = null
  }
}
      const cancelDelete = () => {
        showDeleteDialog.value = false
        newsToDelete.value = null
      }
  
      const cancelForm = () => {
        showNewsForm.value = false
        editingNews.value = null
      }
  
      onMounted(() => {
        fetchNews()
      })
  
      return {
        news,
        loading,
        error,
        showNewsForm,
        showDeleteDialog,
        newsToDelete,
        editingNews,
        handleNewsSubmit,
        toggleNewsForm,
        editNews,
        showDeleteConfirmation,
        confirmDelete,
        cancelDelete,
        formatDate,
        cancelForm,
      }
    }
  }
  </script>

<style scoped>
.news-section {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.toggle-button {
  margin-bottom: 20px;
  padding: 12px 25px;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.3s ease-in-out;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.toggle-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.news-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.news-card {
  background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
  padding: 25px;
  border-radius: 15px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
}

.news-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background-color: #630181;
}

.news-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
}

.news-card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tournament-image-container {
  width: 100%;
  height: 150px;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.2);
}

.tournament-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.tournament-card:hover .tournament-image {
  transform: scale(1.05);
}

.tournament-image-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: rgba(99, 1, 129, 0.2);
  font-size: 3rem;
  color: #630181;
}

.tournament-actions {
  margin-top: 20px;
  display: flex;
  gap: 15px;
}


.tournament-actions button {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.tournament-actions button i {
  font-size: 1rem;
}

.tournament-actions button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}
.details-btn {
  padding: 12px ;
  border-radius: 8px;
  transition: all 0.3s ease;
  margin-bottom: 1rem;
  cursor: pointer; 
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.2);
}

.details-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.3);
  background: linear-gradient(135deg, #9461FF, #7C3AED);
}
.loading-message,
.error-message,
.no-news {
  text-align: center;
  padding: 40px;
  font-size: 1.2rem;
  color: #EAEAEA;
  background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
  border-radius: 15px;
  border: 1px solid rgba(182, 0, 254, 0.1);
  margin: 20px 0;
}

.error-message {
  color: #ff6b6b;
  border-color: rgba(255, 107, 107, 0.2);
}

.confirmation-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.dialog-content {
  background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
  padding: 30px;
  border-radius: 15px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
}

.dialog-content p {
  font-size: 1.2rem;
  color: #ffffff;
  margin-bottom: 25px;
  text-align: center;
}

.dialog-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.dialog-actions button {
  padding: 12px 30px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.dialog-actions button:last-child {
  background: linear-gradient(45deg, #630181, #ff6a1f);
  color: white;
}

@media (max-width: 768px) {
  .news-list {
    grid-template-columns: 1fr;
  }
  
  .tournament-actions {
    flex-direction: column;
  }
}
.news-section {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.toggle-button {
  margin-bottom: 20px;
  padding: 12px 25px;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.3s ease-in-out;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  color: black;
  border: none;
}

.toggle-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.news-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.news-card {
  background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
  padding: 20px;
  border-radius: 15px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.news-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background-color: #630181;
}

.news-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
}

.news-image-container {
  width: 100%;
  height: 180px;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.2);
}

.news-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.news-card:hover .news-image {
  transform: scale(1.05);
}

.news-image-placeholder {
  width: 100%;
  height: 180px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(99, 1, 129, 0.2);
  font-size: 3rem;
  color: #630181;
  border-radius: 8px;
  margin-bottom: 15px;
}

.news-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
}

.news-category {
  background: rgba(99, 1, 129, 0.3);
  padding: 3px 8px;
  border-radius: 4px;
}

.news-card h3 {
  font-size: 1.3rem;
  margin: 0 0 10px 0;
  color: #fff;
  line-height: 1.4;
}

.news-description {
  color: #EAEAEA;
  line-height: 1.5;
  margin-bottom: 15px;
  flex-grow: 1;
}

.news-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 15px;
}

.news-author {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
}

.news-actions {
  display: flex;
  gap: 10px;
}

.details-btn {
  padding: 8px 15px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
  cursor: pointer;
}

.details-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.3);
  background: linear-gradient(135deg, #9461FF, #7C3AED);
}
</style>