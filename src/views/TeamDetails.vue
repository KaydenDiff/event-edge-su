<template>
  <div class="team-details">
  
    <header class="main-header">
      <h1>Детали команды: {{ team.name }}</h1>
    </header>
<div class="team-details-card">
    <div class="team-card">
      <div class="team-content">
        <h3 class="team-name">{{ team.name }}</h3>
        <div class="team-status">
          <span class="status-label" :class="team.status === 'active' ? 'status-active' : 'status-inactive'">
            {{ team.status === 'active' ? 'Активна' : 'Неактивна' }}
          </span>
        </div>
        <div class="team-info">
          <div class="info-item">
            <i class="fas fa-clock"></i>
            <span>Создана: {{ formatDate(team.created_at) }}</span>
          </div>
        </div>
      </div>
    </div>

    <h2 class="section-title">Участники команды</h2>
<div class="team-members-section">
  <div v-if="team.members && team.members.length > 0" class="team-members">
    <div v-for="member in team.members" :key="member.id" class="member-item" @click="goToPlayerProfile(member.id)">
  <i class="fas fa-user"></i>
  <span class="member-email">{{ member.name }}</span>
  <span v-if="member.id === team.captain_id" class="captain-badge">
    <i class="fas fa-crown"></i> Капитан
  </span>
</div>
  </div>
  <div v-else class="loading-members">
    <i class="fas fa-spinner fa-spin"></i> Загрузка участников...
  </div>
</div>

    <h2 class="section-title">Турниры</h2>
    <div class="tournaments-grid">
      <div v-if="tournaments.length === 0" class="no-tournaments">Нет турниров для этой команды.</div>
      <div v-for="tournament in tournaments" :key="tournament.id" class="tournament-card">
        <h4 class="tournament-name">{{ tournament.name }}</h4>
        <p class="tournament-date">Дата: {{ formatDate(tournament.date) }}</p>
      </div>
    </div>
</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router';

const route = useRoute()
const router = useRouter();
const team = ref({})
const tournaments = ref([])

const fetchTeamDetails = async () => {
  const teamId = route.params.id; // Предполагаем, что ID команды передается через параметры маршрута
  try {
    const res = await fetch(`http://event-edge-su/api/guest/teams/${teamId}`);
    const data = await res.json();
    
    // Извлекаем данные о команде
    team.value = data.data; // Сохраняем данные о команде

    // Загрузка участников команды
    const membersRes = await fetch(`http://event-edge-su/api/guest/teams/${teamId}/members`);
    const membersData = await membersRes.json();
    
    // Извлекаем участников из ответа
    if (membersData.data && membersData.data.members) {
      team.value.members = membersData.data.members; // Добавляем массив участников
    } else {
      team.value.members = []; // Если нет участников, инициализируем пустой массив
    }

    // Загрузка турниров, в которых участвовала команда
    const tournamentsRes = await fetch(`http://event-edge-su/api/guest/teams/${teamId}/tournaments`);
    const tournamentsData = await tournamentsRes.json();
    tournaments.value = tournamentsData.data;
  } catch (e) {
    console.error('Ошибка при загрузке данных команды:', e);
  }
}
// Форматирование даты
function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' })
}
const goToPlayerProfile = (playerId) => {
    router.push(`/profile/${playerId}`);
};
// Загрузка данных при монтировании
onMounted(fetchTeamDetails)
</script>

<style scoped>
.team-details {
  padding: 100px;
  color: #f5f5f5;
}
.section-title {
  padding: 20px 0;
}
.team-details-card {
    padding: 20px;
    background: #2a2a2a ;
    border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
  border: 1px solid #3a3a3a;
}
.main-header {
  color: #f5f5f5;
  margin: 30px 0 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #630181;
}

.team-card {
  border: 2px solid #630181; /* Фиолетовая рамка */
  background: #2a2a2a;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
}

.tournament-card {
  background: #333333;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
}

.tournament-name {
  font-size: 1.2rem;
  color: #f5f5f5;
}

.tournament-date {
  color: #cccccc;
}

.no-tournaments {
  color: #cccccc;
  text-align: center;
}

.team-members-section {
  margin-top: 20px;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 8px;
  background-color: #333333;
  border-radius: 4px;
  border: 1px solid #3a3a3a;
  margin-bottom: 5px;
}
.team-status {
    margin-top:  10px;
  margin-bottom: 10px;
}
.status-label {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-active {
  background-color: rgba(99, 1, 129, 0.3);
  color: #f5f5f5;
  border: 1px solid #630181;
}

.status-inactive {
  background-color: rgba(180, 0, 0, 0.3);
  color: #f5f5f5;
  border: 1px solid #b40000;
}
.member-item {
  display: flex;
  align-items: center;
  padding: 8px;
  background-color: #333333;
  border-radius: 4px;
  border: 1px solid #3a3a3a;
  margin-bottom: 5px;
  cursor: pointer; /* Указываем, что это кликабельный элемент */
  transition: background 0.3s ease, transform 0.3s ease; /* Анимация при наведении */
}

.member-item:hover {
  background: rgba(99, 1, 129, 0.1); /* Изменение фона при наведении */
  transform: translateY(-2px); /* Подъём при наведении */
}

.member-name {
  color: #f5f5f5; /* Цвет текста */
  text-decoration: none; /* Убираем подчеркивание */
  transition: color 0.3s ease; /* Анимация цвета */
}
.member-name:hover {
  color: #630181; /* Цвет при наведении */
}
.member-email {
  color: #cccccc;
  font-size: 0.875rem;
  margin-right: auto;
}

.captain-badge {
  margin-left: 8px;
  font-size: 0.75rem;
  color: #f5f5f5;
  display: flex;
  align-items: center;
  background-color: rgba(99, 1, 129, 0.3); /* Фиолетовый фон для капитана */
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #630181; /* Фиолетовая рамка для капитана */
}

.loading-members {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
  color: #cccccc;
}
.info-item i {
  margin-right: 8px;
  width: 16px;
  text-align: center;
  color: #630181;
}
.member-item i {
  margin-right: 8px;
  width: 16px;
  text-align: center;
  color: #630181;
}
.captain-badge i {
    margin-right: 8px;
  width: 16px;
  text-align: center;
  color: #ffffff;
}
</style>