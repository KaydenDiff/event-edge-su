<template>
  <section class="upcoming-tournaments">
    <h2 class="section-title">Ближайшие турниры</h2>
    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="!loading && !error" class="tournament-list">
      <div v-for="tournament in tournaments" :key="tournament.id" class="tournament-card">
        <div class="card-header">
          <h3 class="tournament-name">{{ tournament.name }}</h3>
          <div class="status-badge" :class="tournament.status_name.toLowerCase()">
            {{ tournament.status_name }}
          </div>
        </div>
        <div class="card-content">
          <p class="game-name">{{ tournament.description }}</p>
          <div class="organizer-info">
            <i class="fas fa-user"></i>
            <span> Организатор: {{ typeof tournament.organizer === 'object' ? tournament.organizer.name : tournament.organizer }}</span>
          </div>
          <div class="date-info">
            <i class="fas fa-calendar"></i>
            <span>{{ formatDate(tournament.start_date) }}</span>
          </div>
          <div class="views-info">
            <i class="fas fa-eye"></i>
            <span>{{ tournament.views_count }}</span>
          </div>
        </div>
        <div class="card-footer">
          <BaseButton :to="'/tournaments/' + tournament.id" customClass="details-button">
            Подробнее
          </BaseButton>
        </div>
      </div>
    </div>
  </section>
</template>
  
<script setup>
import BaseButton from '@/components/BaseButton.vue';
import { defineProps } from 'vue';

const props = defineProps(['tournaments', 'loading', 'error']);

const formatDate = (dateString) => {
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('ru-RU', options);
};
</script>
  
<style scoped>
.upcoming-tournaments {
  max-width: 80%;
  margin: 80px auto;
  padding: 0 20px;
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
  
.tournament-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
}
  
.tournament-card {
  background: rgba(26, 26, 26, 0.8);
  border-radius: 15px;
  padding: 25px;
  color: white;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.tournament-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #630181, transparent);
}

.tournament-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(182, 0, 254, 0.2);
  border-color: rgba(182, 0, 254, 0.3);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.tournament-name {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
  color: #ffffff;
  flex: 1;
}

.status-badge {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-left: 15px;
}

.status-badge.active {
  background: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
}

.status-badge.upcoming {
  background: rgba(33, 150, 243, 0.2);
  color: #2196F3;
}

.status-badge.completed {
  background: rgba(158, 158, 158, 0.2);
  color: #9E9E9E;
}

.card-content {
  margin-bottom: 20px;
}

.game-name {
  color: #cccccc;
  margin-bottom: 15px;
  line-height: 1.5;
  font-size: 1rem;
}

.organizer-info,
.date-info,
.views-info {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  color: #aaaaaa;
  font-size: 0.9rem;
}

.organizer-info i,
.date-info i,
.views-info i {
  margin-right: 10px;
  color: #630181;
  width: 20px;
  text-align: center;
}

.card-footer {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.details-button {
  width: 100%;
  background: #630181;
  border: none;
  color: rgb(255, 255, 255);
  padding: 12px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.details-button:hover {

  background: #ffffff;

color: rgb(0, 0, 0);
  transform: translateY(-2px);
}
  
.loading, .error {
  text-align: center;
  padding: 20px;
  color: white;
  font-size: 1.2rem;
}
  
.error {
  color: #ff4444;
}
</style>