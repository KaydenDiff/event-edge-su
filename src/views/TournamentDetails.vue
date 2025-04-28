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

      <!-- Передаем ID турнира в TournamentBracket -->
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
const loading = ref(true);
const error = ref(null);

const isUpcoming = computed(() => new Date(tournament.value.start_date) > new Date());
const isFinished = computed(() => new Date(tournament.value.end_date) < new Date());

const formatDate = (date) => {
  return new Date(date).toLocaleString("ru-RU");
};

const fetchTournamentDetails = async (tournamentId) => {
  try {
    const response = await axios.get(`http://event-edge-su/api/guest/tournaments/${tournamentId}`);
    tournament.value = response.data;
  } catch (err) {
    error.value = "Ошибка загрузки данных. Попробуйте позже.";
  } finally {
    loading.value = false;
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
}

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

.teams-list {
  margin-top: 20px;
  padding: 15px;
  background: #2c2c2c;
  border-radius: 8px;
  text-align: left;
}

.teams-list h2 {
  font-size: 22px;
  margin-bottom: 10px;
  text-align: center;
}

.teams-list ul {
  list-style-type: none;
  padding: 0;
}

.teams-list li {
  font-size: 18px;
  padding: 8px;
  border-bottom: 1px solid #444;
}

.teams-list li:last-child {
  border-bottom: none;
}

.register-button {
  background-color: #ffffff;
  color: rgb(0, 0, 0);
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  transition: background-color 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease;
  outline: none;
  border: 2px solid transparent;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: inline-block;
  text-align: center;
  text-decoration: none;
}

.register-button:hover {
  transform: scale(1.05);
  color: #ffffff;
}

.tournament-ended {
  font-size: 18px;
  font-weight: bold;
  color: #ff6347;
}

.details-button {
  padding: 8px 20px;
  border-radius: 8px;
  text-decoration: none;
  display: inline-block;
}

</style>
