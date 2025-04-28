<template>
  <section class="tournaments">
    <h2 class="section-title">Популярные турниры</h2>
    
    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-if="error" class="error">{{ error }}</div>
    
    <div v-if="!loading && !error" class="tournaments-container">
      <!-- Главная карточка с информационным блоком -->
      <div v-if="tournaments.length > 0" 
           class="featured-tournament"
           @click="navigateToTournament(tournaments[0])">
        <div class="main-card" :style="getBackgroundStyle(tournaments[0])">
          <div class="main-card-game-tag">{{ tournaments[0].game }}</div>
        </div>
        <div class="info-block">
          <h3 class="info-title">{{ tournaments[0].name }}</h3>
          <div class="info-date">Начало турнира: {{ formatDate(tournaments[0].start_date) }}</div>
          <div class="info-date">Конец турнира: {{ formatDate(tournaments[0].end_date) }}</div>
        </div>
      </div>

      <!-- Сетка остальных карточек -->
      <div class="cards-grid">
        <div v-for="tournament in tournaments.slice(1)" 
             :key="tournament.id" 
             class="tournament-card"
             :style="getBackgroundStyle(tournament)"
             @click="navigateToTournament(tournament)">
          <div class="game-tag">{{ tournament.game }}</div>
          <div class="content">
            <h4 class="title">{{ tournament.name }}</h4>
            <div class="dates">
              <span>{{ formatDate(tournament.start_date) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { defineProps } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const props = defineProps(['tournaments', 'loading', 'error']);

const navigateToTournament = (tournament) => {
  router.push(`/tournaments/${tournament.id}`);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const getBackgroundStyle = (tournament) => {
  const defaultImage = 'default-tournament-bg.jpg';
  
  const backgroundImage = tournament.image || defaultImage;

  return {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  };
};
</script>

<style scoped>
.tournaments {
  max-width: 80%;
  margin: 80px auto;
  padding: 40px 20px;
}


.section-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 40px;
  color: #ffffff;
  text-align: center;
  position: relative;
  padding-bottom: 15px;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 3px;
  background: #630181;
}
.tournaments-container {
  display: flex;
  flex-direction: column;
  gap: 30px;

}

.featured-tournament {
  display: flex;
  height: 400px;
  cursor: pointer;
}

.featured-tournament:hover .info-title {
  color: #d1d1d1;
  transition: color 0.3s ease;
}

.featured-tournament:hover .info-date {
  color: #630181;
  transition: color 0.3s ease;
}

.main-card {
  flex: 1;
  border-radius: 20px;
  background-size: cover;
  background-position: center;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease;
  cursor: pointer;
  background-color: #1a1a1a;

}

.info-block {
  width: 30%;
  height: 55%;
  background-color: #1E1E1E;
  padding: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: auto 0;
}

.info-title {
  font-size: 2rem;
  font-weight: bold;
  color: white;
  margin-bottom: 15px;
}

.info-date {
  font-size: 1rem;
  color: #cccccc;
}

/* Сетка остальных карточек */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.tournament-card {
  height: 200px;
  border-radius: 15px;
  background-size: cover;
  background-position: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease;
  cursor: pointer;
  background-color: #1a1a1a;
}

.tournament-card:hover {
  transform: translateY(-3px);
}

/* Общие стили */
.game-tag {
  position: absolute;
  top: 20px;
  left: 20px;
  background-color: #630181;  
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 1.1rem;
}

.content {
  position: absolute;
  bottom: 30px;
  left: 30px;
  right: 30px;
  color: white;
}

.title {
  font-weight: bold;
  font-size: 1.2rem;
  margin-bottom: 10px;
}

.dates {
  font-size: 1.1rem;
  opacity: 0.9;
}

.date-separator {
  margin: 0 10px;
}

/* Состояния загрузки и ошибки */
.loading, .error {
  text-align: center;
  padding: 20px;
  color: white;
}

.error {
  color: #ff4444;
}

/* Медиа-запрос для мобильных устройств */
@media (max-width: 768px) {
  .featured-tournament {
    flex-direction: column;
    height: auto;
  }

  .main-card {
    height: 300px;
  }

  .info-block {
    width: 100%;
  }
}

/* Стиль для game-tag в главной карточке */
.main-card-game-tag {
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: #630181;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 1.1rem;
}

.tournament-card:hover .title {
  color: #d1d1d1;
  transition: color 0.3s ease;
}

.tournament-card:hover .dates {
  color: #a0a0a0;
  transition: color 0.3s ease;
}
</style>