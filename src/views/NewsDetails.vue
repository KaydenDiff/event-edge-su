<template>
  <div class="news-details-page">
    <!-- Состояние загрузки -->
    <div v-if="loading" class="loading-state">
      <div class="loading-content">
        <i class="fas fa-spinner fa-spin fa-3x"></i>
        <p>Загружаем новость...</p>
      </div>
    </div>
    
    <!-- Состояние ошибки -->
    <div v-else-if="error" class="error-state">
      <div class="error-card">
        <i class="fas fa-exclamation-triangle fa-4x"></i>
        <h3>Ошибка загрузки</h3>
        <p>{{ error }}</p>
        <div class="action-buttons">
          <button @click="fetchNewsDetails" class="btn btn-retry">
            <i class="fas fa-sync-alt"></i> Попробовать снова
          </button>
          <button @click="goBack" class="btn btn-outline">
            <i class="fas fa-arrow-left"></i> Назад
          </button>
        </div>
      </div>
    </div>
    
    <!-- Успешная загрузка -->
    <div v-else-if="news" class="news-article-container">
      <!-- Шапка статьи -->
      <div class="article-header">
        <button @click="goBack" class="back-button">
          <i class="fas fa-chevron-left"></i> Все новости
        </button>
        
        <div class="header-content">
          <div class="meta-info">
            <span class="category-badge">
              <i class="fas fa-tag"></i> {{ news.category?.name || 'Без категории' }}
            </span>
            <span class="publish-date">
              <i class="far fa-calendar-alt"></i> {{ formatDate(news.published_at) }}
            </span>
            <span class="views-count">
              <i class="fas fa-eye"></i> {{ news.views_count }}
            </span>
            <span v-if="news.is_featured" class="featured-badge">
              <i class="fas fa-star"></i> Рекомендовано
            </span>
          </div>
          
          <h1 class="article-title">{{ news.title }}</h1>
          
          <div class="author-info">
            <div class="author-avatar">
              <i class="fas fa-user-circle"></i>
            </div>
            <div>
              <p class="author-name">{{ news.author?.name || 'Неизвестный автор' }}</p>
              <p class="author-role">Автор материала</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Изображение новости -->
      <div v-if="news.image" class="article-image">
        <img :src="news.image" :alt="news.title">
        <div class="image-overlay"></div>
      </div>
      
      <!-- Контент статьи -->
      <div class="article-content">
        <div class="article-description">
          <p>{{ news.description }}</p>
        </div>
        
        <div class="article-body" v-html="news.content"></div>
      </div>
      
      <!-- Футер статьи -->
      <div class="article-footer">
        <div class="tags-section" v-if="news.tags && news.tags.length">
          <h4><i class="fas fa-tags"></i> Теги:</h4>
          <div class="tags-list">
            <span v-for="tag in news.tags" :key="tag.id" class="tag">
              #{{ tag.name }}
            </span>
          </div>
        </div>
        
        <div class="social-sharing">
          <h4><i class="fas fa-share-alt"></i> Поделиться:</h4>
          <div class="social-buttons">
            <button class="social-btn">
              <i class="fab fa-telegram"></i>
            </button>
            <button class="social-btn">
              <i class="fab fa-vk"></i>
            </button>
            <button class="social-btn">
              <i class="fab fa-twitter"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Новость не найдена -->
    <div v-else class="not-found-state">
      <div class="not-found-card">
        <i class="fas fa-newspaper fa-4x"></i>
        <h2>Новость не найдена</h2>
        <p>Запрошенная новость не существует или была удалена</p>
        <button @click="goBack" class="btn btn-primary">
          <i class="fas fa-arrow-left"></i> Вернуться к новостям
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getNewsById } from '@/api/methods/news';

const route = useRoute();
const router = useRouter();
const news = ref(null);
const loading = ref(true);
const error = ref(null);

const fetchNewsDetails = async () => {
  const { slug } = route.params;
  
  if (!slug) {
    error.value = 'Не указан идентификатор новости';
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = null;
  news.value = null;

  try {
    const response = await getNewsById(slug);
    news.value = response;
    updateMetaTags();
  } catch (err) {
    console.error('Ошибка при загрузке новости:', err);
    error.value = err.message || 'Не удалось загрузить новость. Пожалуйста, попробуйте позже.';
  } finally {
    loading.value = false;
  }
};

const updateMetaTags = () => {
  if (!news.value) return;
  document.title = news.value.meta_title || `${news.value.title} | Новости`;
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription && news.value.meta_description) {
    metaDescription.content = news.value.meta_description;
  }
};

const goBack = () => {
  router.push({ name: 'NewsFeeds' });
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(fetchNewsDetails);
</script>

<style scoped>
/* Базовые стили */
.news-details-page {
  margin-top: 50px ;
  min-height: 100vh;
  color: white;
  font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  padding: 2rem 0;
}

/* Состояние загрузки */
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
}

.loading-content {
  text-align: center;
  color: #8B5CF6;
}

.loading-content i {
  margin-bottom: 1rem;
  color: #8B5CF6;
}

/* Состояние ошибки */
.error-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  padding: 2rem;
}

.error-card {
  background: #333;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.error-card i {
  color: #8B5CF6;
  margin-bottom: 1rem;
}

.error-card h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.error-card p {
  color: #ccc;
  margin-bottom: 1.5rem;
}

/* Основной контент новости */
.news-article-container {
  max-width: 800px;
  margin: 0 auto;
  background: #333;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.article-header {
  padding: 2rem;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #8B5CF6;
  font-size: 0.95rem;
  cursor: pointer;
  margin-bottom: 1.5rem;
  transition: color 0.2s;
}

.back-button:hover {
  color: #a78bfa;
}

.back-button i {
  font-size: 0.8rem;
}

.meta-info {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  color: #ccc;
}

.meta-info > span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.category-badge {
  background: #8B5CF6;
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
}

.featured-badge {
  background: rgba(139, 92, 246, 0.2);
  color: #8B5CF6;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
}

.article-title {
  font-size: 2rem;
  margin: 1rem 0 1.5rem;
  line-height: 1.3;
  color: white;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.author-avatar i {
  font-size: 2.5rem;
  color: #8B5CF6;
}

.author-name {
  font-weight: 600;
  margin-bottom: 0.2rem;
}

.author-role {
  font-size: 0.8rem;
  color: #ccc;
}

.article-image {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
}

.article-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: linear-gradient(to top, rgba(42, 42, 42, 0.9), transparent);
}

.article-content {
  padding: 2rem;
}

.article-description {
  font-size: 1.1rem;
  line-height: 1.7;
  margin-bottom: 2rem;
  color: #eee;
  font-weight: 400;
}

.article-body {
  font-size: 1rem;
  line-height: 1.8;
  color: #ddd;
}

.article-body :deep(p) {
  margin-bottom: 1.5rem;
}

.article-body :deep(h2),
.article-body :deep(h3) {
  margin: 2rem 0 1rem;
  color: white;
}

.article-body :deep(a) {
  color: #8B5CF6;
  text-decoration: underline;
}

.article-body :deep(ul),
.article-body :deep(ol) {
  margin-bottom: 1.5rem;
  padding-left: 1.5rem;
}

.article-body :deep(li) {
  margin-bottom: 0.5rem;
}

.article-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid #444;
}

.tags-section h4,
.social-sharing h4 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: #ccc;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.tag {
  background: rgba(139, 92, 246, 0.2);
  color: #8B5CF6;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
}

.social-buttons {
  display: flex;
  gap: 0.75rem;
}

.social-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #444;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background 0.2s;
}

.social-btn:hover {
  background: #8B5CF6;
}

/* Состояние "не найдено" */
.not-found-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  padding: 2rem;
}

.not-found-card {
  background: #333;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.not-found-card i {
  color: #8B5CF6;
  margin-bottom: 1rem;
}

.not-found-card h2 {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

.not-found-card p {
  color: #ccc;
  margin-bottom: 1.5rem;
}

/* Кнопки */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn i {
  font-size: 0.9rem;
}

.btn-primary {
  background: #8B5CF6;
  color: white;
}

.btn-primary:hover {
  background: #7c3aed;
}

.btn-outline {
  background: transparent;
  color: #8B5CF6;
  border: 1px solid #8B5CF6;
}

.btn-outline:hover {
  background: rgba(139, 92, 246, 0.1);
}

.btn-retry {
  background: #8B5CF6;
  color: white;
}

.btn-retry:hover {
  background: #7c3aed;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

/* Анимации */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.fa-spin {
  animation: spin 1s linear infinite;
}

/* Адаптивность */
@media (max-width: 768px) {
  .news-article-container {
    border-radius: 0;
  }
  
  .article-header,
  .article-content {
    padding: 1.5rem;
  }
  
  .article-title {
    font-size: 1.6rem;
  }
  
  .article-image {
    height: 300px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .article-title {
    font-size: 1.4rem;
  }
  
  .meta-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>