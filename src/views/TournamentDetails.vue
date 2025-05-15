<template>
  <div class="tournament-details">
    <h1 class="title">{{ tournament.name }}</h1>

    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div class="info-card">
        <p><strong>Описание:</strong> {{ tournament.description }}</p>
        <p><strong>Дата начала:</strong> {{ formatDate(tournament.start_date) }}</p>
        <p><strong>Дата окончания:</strong> {{ formatDate(tournament.end_date) }}</p>
        <p><strong>Просмотры:</strong> {{ tournament.views_count }}</p>
        <p class="organizer-name">
          <strong>Организатор:</strong> {{ tournament.organizer?.name || tournament.organizer }}
        </p>
        <p><strong>Игра:</strong> {{ tournament.game?.name || "Не указано" }}</p>
        <p><strong>Стадия:</strong> {{ tournament.stage?.name || "Не указано" }}</p>
      </div>

      <!-- Секция с командами-участниками -->
      <div class="teams-section">
        <h2>Команды-участники</h2>
        <div v-if="loadingTeams" class="loading">Загрузка списка команд...</div>
        <div v-else-if="teamsError" class="error">{{ teamsError }}</div>
        <div v-else>
          <div v-if="teams.length > 0" class="teams-list">
            <div v-for="team in teams" :key="team.id" class="team-card">
              <div class="team-info">
                <h3>{{ team.name }}</h3>
                <p><strong>Статус:</strong> {{ getStatusText(team.status) }}</p>
                <p><strong>Капитан:</strong> ID {{ team.captain_id }}</p>
              </div>
              <router-link 
                v-if="isOrganizer"
                :to="`/team/${team.id}`" 
                class="details-button"
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
  color: #ffffff;
}

.info-card {
  background: #2c2c2c;
  padding: 15px;
  border-radius: 8px;
  text-align: left;
  margin-bottom: 20px;
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
}

.team-info h3 {
  margin: 0 0 5px 0;
  color: #fff;
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
}
.tournament-ended {
  font-size: 18px;
  font-weight: bold;
  color: #ff6347;
}
</style>