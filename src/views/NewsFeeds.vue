<template>
  <div class="news-feeds-container">
    <h1 class="page-title">Новости</h1>
    
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Загрузка новостей...</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="fetchNewsFeeds" class="retry-button">Попробовать снова</button>
    </div>
    
    <div v-else class="news-grid">
      <div 
        v-for="news in filteredNews" 
        :key="news.id" 
        class="news-card" 
        @click="viewNewsDetails(news.slug)"
      >
        <div class="news-image-container">
          <img v-if="news.image" :src="news.image" :alt="news.title" class="news-image">
          <div v-else class="news-image-placeholder">Нет изображения</div>
        </div>
        <div class="news-content">
          <span v-if="news.is_featured" class="featured-badge">Рекомендовано</span>
          <h2 class="news-title">{{ news.title }}</h2>
          <p class="news-description">{{ news.description }}</p>
          <div class="news-meta">
            <span class="news-category">{{ news.category_name }}</span>
            <div class="meta-right">
              <span class="news-date">{{ formatDate(news.published_at) }}</span>
              <span class="news-views">👁 {{ news.views_count }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!loading && !error && filteredNews.length === 0" class="no-news">
      <p>Новостей пока нет</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getNewsFeeds } from '@/api/methods/news';

const router = useRouter();
const newsFeeds = ref([]);
const loading = ref(true);
const error = ref(null);

const fetchNewsFeeds = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    newsFeeds.value = await getNewsFeeds();
    
    if (newsFeeds.value.length === 0) {
      console.warn('Получен пустой список новостей');
    }
  } catch (err) {
    console.error('Error fetching news feeds:', err);
    error.value = 'Не удалось загрузить новости. Пожалуйста, попробуйте позже.';
  } finally {
    loading.value = false;
  }
};

const filteredNews = computed(() => {
  return newsFeeds.value.filter(news => news.status === 'published');
});

const viewNewsDetails = (slug) => {
  router.push({ name: 'NewsDetails', params: { slug } });
};

const formatDate = (dateString) => {
  if (!dateString) return 'Дата не указана';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

onMounted(fetchNewsFeeds);
</script>

<style scoped>
.news-feeds-container {
  max-width: 1200px;
  margin: 70px auto;
  padding: 1rem;
}

.page-title {
  margin-bottom: 1.5rem;
  font-size: 1.75rem;
  text-align: center;
  color: #ffffff;
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  min-height: 200px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: #8B5CF6;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.retry-button {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background-color: #8B5CF6;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.retry-button:hover {
  background-color: #7C3AED;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.news-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  background: #2a2a2a;
  cursor: pointer;
  border: 1px solid #3a3a3a;
  display: flex;
  flex-direction: column;
}

.news-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(99, 1, 129, 0.4);
  border-color: #630181;
}

.news-image-container {
  height: 180px;
  overflow: hidden;
  position: relative;
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
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #1e1e1e;
  color: #888;
  font-size: 0.9rem;
}

.news-content {
  padding: 1.25rem;
  position: relative;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.featured-badge {
  position: absolute;
  top: -12px;
  right: 15px;
  background-color: #8B5CF6;
  color: white;
  padding: 0.25rem 0.8rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: bold;
  z-index: 1;
}

.news-title {
  margin-top: 0;
  margin-bottom: 0.75rem;
  font-size: 1.25rem;
  line-height: 1.4;
  color: #ffffff;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.news-description {
  color: #cccccc;
  margin-bottom: 1rem;
  font-size: 0.95rem;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  flex-grow: 1;
}

.news-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 0.5rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.meta-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.news-category {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  background-color: rgba(99, 1, 129, 0.3);
  color: #f5f5f5;
  border: 1px solid #630181;
}

.news-date {
  font-size: 0.8rem;
  color: #aaaaaa;
}

.news-views {
  font-size: 0.8rem;
  color: #aaaaaa;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.no-news {
  text-align: center;
  padding: 2rem;
  color: #888;
  font-size: 1.1rem;
}

/* Мобильные стили */
@media (max-width: 768px) {
  .news-feeds-container {
    margin-top: 70px;
    padding: 0.75rem;
    width: 70%;
  }

  .page-title {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  .news-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .news-card {
    border-radius: 10px;
  }

  .news-image-container {
    height: 160px;
  }

  .news-content {
    padding: 1rem;
  }

  .news-title {
    font-size: 1.1rem;
    -webkit-line-clamp: 2;
  }

  .news-description {
    font-size: 0.9rem;
    -webkit-line-clamp: 2;
    margin-bottom: 0.75rem;
  }

  .news-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .meta-right {
    width: 100%;
    justify-content: space-between;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.3rem;
  }

  .news-image-container {
    height: 140px;
  }

  .featured-badge {
    font-size: 0.7rem;
    padding: 0.2rem 0.6rem;
  }

  .news-title {
    font-size: 1rem;
  }

  .news-description {
    font-size: 0.85rem;
  }

  .news-category,
  .news-date,
  .news-views {
    font-size: 0.75rem;
  }
}
</style>