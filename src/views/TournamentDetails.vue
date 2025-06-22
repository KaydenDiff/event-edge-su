<template>
  <div class="tournament-details">
    <h1 class="title">{{ tournament.name }}</h1>

    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div class="info-card enhanced-info-card">
  <div class="info-row">
    <span class="icon">📝</span>
    <p><strong>Описание:</strong> {{ tournament.description }}</p>
  </div>
  <div class="info-row">
    <span class="icon">📅</span>
    <p><strong>Дата начала:</strong> {{ formatDate(tournament.start_date) }}</p>
  </div>
  <div class="info-row">
    <span class="icon">📅</span>
    <p><strong>Дата окончания:</strong> {{ formatDate(tournament.end_date) }}</p>
  </div>
  <div class="info-row">
    <span class="icon">👁️</span>
    <p><strong>Просмотры:</strong> {{ tournament.views_count }}</p>
  </div>
  <div class="info-row">
    <span class="icon">👤</span>
    <p><strong>Организатор:</strong> {{ tournament.organizer?.name || tournament.organizer }}</p>
  </div>
  <div class="info-row">
    <span class="icon">🎮</span>
    <p><strong>Игра:</strong> {{ tournament.game?.name || "Не указано" }}</p>
  </div>
  <div class="info-row">
    <span class="icon">🏁</span>
    <p><strong>Стадия:</strong> {{ tournament.stage?.name || "Не указано" }}</p>
  </div>
</div>
      <!-- Секция с командами-участниками -->
      <div class="teams-section enhanced-teams-section">
  <h2>Команды-участники</h2>
  <div v-if="loadingTeams" class="loading">Загрузка списка команд...</div>
  <div v-else-if="teamsError" class="error">{{ teamsError }}</div>
  <div v-else>
    <div v-if="teams.length > 0" class="teams-list">
      <div v-for="team in teams" :key="team.id" class="team-card enhanced-team-card">
        <div class="team-info">
          <h3>
            <span class="icon">🛡️</span>
            {{ team.name }}
          </h3>
          <p class="team-status">
            <span class="icon">📌</span>
            <strong>Статус:</strong> 
            <span :class="['status-label', team.status]">{{ getStatusText(team.status) }}</span>
          </p>
        </div>
        <router-link 
          v-if="isOrganizer"
          :to="`/team/${team.id}`" 
          class="details-button team-details-button"
        >
          Подробнее
        </router-link>
      </div>
    </div>
    <div v-else class="no-teams">
      В турнире пока нет зарегистрированных команд
    </div>
  </div>
</div>

      <TournamentBracket :tournamentId="tournament.id" />
      
      <div class="status-message">
        <BaseButton 
          v-if="isUpcoming" 
          @click="registerForTournament"
          customClass="details-button"
        >
          Регистрация
        </BaseButton>
        <p v-else-if="isFinished" class="tournament-ended">Турнир завершён</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import TournamentBracket from "@/components/TournamentBracket.vue"; 
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import BaseButton from "@/components/BaseButton.vue";

const route = useRoute();
const router = useRouter();

const tournament = ref({});
const teams = ref([]);
const loading = ref(true);
const loadingTeams = ref(false);
const error = ref(null);
const teamsError = ref(null);

const isUpcoming = computed(() => new Date(tournament.value.start_date) > new Date());
const isFinished = computed(() => new Date(tournament.value.end_date) < new Date());
const isOrganizer = computed(() => {
  // Логика проверки, является ли текущий пользователь организатором
  const user = JSON.parse(localStorage.getItem('user'));
  return user && user.id === tournament.value.user_id;
});

const formatDate = (date) => {
  return new Date(date).toLocaleString("ru-RU");
};

const getStatusText = (status) => {
  const statusMap = {
    'active': 'Активна',
    'inactive': 'Неактивна',
    'pending': 'На рассмотрении'
  };
  return statusMap[status] || status;
};

const fetchTournamentDetails = async (tournamentId) => {
  try {
    loading.value = true;
    const response = await axios.get(`http://event-edge-su/api/guest/tournaments/${tournamentId}`);
    tournament.value = response.data;
    await fetchTournamentTeams(tournamentId);
  } catch (err) {
    error.value = "Ошибка загрузки данных турнира. Попробуйте позже.";
  } finally {
    loading.value = false;
  }
};

const fetchTournamentTeams = async (tournamentId) => {
  try {
    loadingTeams.value = true;
    const response = await axios.get(`http://event-edge-su/api/guest/tournaments/${tournamentId}/teams`);
    teams.value = response.data.teams || [];
  } catch (err) {
    teamsError.value = "Ошибка загрузки списка команд. Попробуйте позже.";
  } finally {
    loadingTeams.value = false;
  }
};

const registerForTournament = () => {
  router.push({
    name: 'RegisterTournament',
    params: { 
      tournamentId: tournament.value.id,
      tournamentName: tournament.value.name 
    }
  });
};

onMounted(async () => {
  const tournamentId = route.params.id;
  await fetchTournamentDetails(tournamentId);
});

watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      fetchTournamentDetails(newId);
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.tournament-details {
  margin: 100px auto;
  max-width: 800px;
  padding: 20px;
  background: #1f1f1f;
  border-radius: 8px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
  text-align: center;
  color: #fff;
}

.loading,
.error {
  font-size: 18px;
  color: #fff;
}

.title {
  font-size: 26px;
  margin-bottom: 15px;
  color: #630181; /* Фиолетовый цвет для заголовка */
}


.info-card {
  background: #2c2c2c;
  padding: 15px;
  border-radius: 8px;
  text-align: left;
  margin-bottom: 20px;
  border: 1px solid #630181; /* Фиолетовая рамка для карточки информации */
}
.teams-section {
  margin-top: 30px;
  background: #2c2c2c;
  padding: 20px;
  border-radius: 8px;
}

.teams-section h2 {
  font-size: 22px;
  margin-bottom: 15px;
  text-align: center;
  color: #630181; /* Фиолетовый цвет для заголовка секции команд */
}


.teams-list {
  display: grid;
  gap: 15px;
}

.team-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #3a3a3a;
  border-radius: 8px;
  border: 1px solid #630181; /* Фиолетовая рамка для карточки команды */
}

.team-info h3 {
  margin: 0 0 5px 0;
  color: #fff;
}
.team-info p strong {
  color: #630181;
}

.team-info p {
  margin: 3px 0;
  color: #ccc;
}

.no-teams {
  text-align: center;
  padding: 20px;
  color: #aaa;
}


.status-message {
  margin-top: 20px;
}
.details-button {
  padding: 8px 20px;
  border-radius: 8px;
  text-decoration: none;
  display: inline-block;
  background-color: #630181; /* Фиолетовый фон для кнопки */
  color: #fff; /* Белый текст на кнопке */
}
.details-button:hover {
  background-color: #7a2b9c; /* Более светлый фиолетовый при наведении */
}

.tournament-ended {
  font-size: 18px;
  font-weight: bold;
  color: #ff6347; /* Цвет для завершенного турнира */
}
.enhanced-info-card {
  background: #2c2c2c;
  padding: 20px 25px;
  border-radius: 10px;
  border: 1px solid #630181;
  box-shadow: 0 0 12px rgba(99, 1, 129, 0.3);
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 12px;
}

.info-row .icon {
  font-size: 20px;
  color: #a35ad7;
  min-width: 24px;
  text-align: center;
  margin-top: 2px;
}

.info-row p {
  margin: 0;
  color: #ddd;
  line-height: 1.5;
}

.info-row strong {
  color: #fff;
}
.enhanced-teams-section {
  background: #2c2c2c;
  padding: 25px;
  border-radius: 10px;
  border: 1px solid #630181;
  box-shadow: 0 0 12px rgba(99, 1, 129, 0.3);
}

.enhanced-team-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #3a3a3a;
  padding: 18px 20px;
  border-radius: 10px;
  border: 1px solid #630181;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.enhanced-team-card:hover {
  transform: scale(1.01);
  box-shadow: 0 0 12px rgba(99, 1, 129, 0.4);
}

.team-info h3 {
  margin: 0 0 5px;
  font-size: 20px;
  color: #fff;
  display: flex;
  align-items: center;
}

.team-info .icon {
  font-size: 18px;
  color: #a35ad7;
}

.team-status {
  margin: 0;
  color: #ccc;
  display: flex;
  align-items: center;
}

.status-label {
  padding: 2px 8px;
  border-radius: 6px;
  margin-left: 6px;
  font-weight: bold;
  font-size: 14px;
}

.status-label.accepted {
  background-color: #2e8b57;
  color: #fff;
}

.status-label.pending {
  background-color: #c29300;
  color: #fff;
}

.status-label.rejected {
  background-color: #b22222;
  color: #fff;
}

.team-details-button {
  font-size: 14px;
  background-color: #630181;
  color: #fff;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.team-details-button:hover {
  background-color: #7a2b9c;
}
</style>