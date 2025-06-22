<template>
  <div class="my-matches-container">
    <h1 class="title">Мои матчи</h1>

    <div v-if="loading">Загрузка матчей...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="!loading && !error">
      <!-- Табы -->
      <div class="tabs">
        <button @click="changeTab('upcoming')" :class="{ active: activeTab === 'upcoming' }">
          Предстоящие
        </button>
        <button @click="changeTab('completed')" :class="{ active: activeTab === 'completed' }">
          Завершённые
        </button>
      </div>

      <!-- Предстоящие -->
      <div v-if="activeTab === 'upcoming'">
        <h2>Предстоящие матчи</h2>
        <div v-if="upcomingMatches.length > 0" class="match-list">
          <div v-for="match in upcomingMatches" :key="match.id" class="match-card">
            <h3>{{ match.tournamentName }}</h3>
            <p><strong>Матч:</strong> {{ match.team1 }} vs {{ match.team2 }}</p>
            <p><strong>Дата:</strong> {{ match.date }}</p>
            <p><strong>Время:</strong> {{ match.time }}</p>
          </div>
        </div>
        <div v-else class="no-matches">
          <p>Нет матчей? Прими участие!</p>
          <router-link to="/tournaments" class="join-button">Посмотреть турниры</router-link>
        </div>
      </div>

      <!-- Завершённые -->
      <div v-if="activeTab === 'completed'">
        <h2>Завершённые матчи</h2>
        <div v-if="completedMatches.length > 0" class="match-list">
          <div v-for="match in completedMatches" :key="match.id" class="match-card completed">
            <h3>{{ match.tournamentName }}</h3>
            <p><strong>Матч:</strong> {{ match.team1 }} vs {{ match.team2 }}</p>
            <p><strong>Счёт:</strong> {{ match.score }}</p>
            <p><strong>Дата:</strong> {{ match.date }}</p>
            <p class="winner"><strong>🏆 Победитель:</strong> {{ match.winner }}</p>
          </div>
        </div>
        <div v-else class="no-matches">
          <p>Нет матчей? Прими участие!</p>
          <router-link to="/tournaments" class="join-button">Посмотреть турниры</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export default {
  name: "MyMatches",
  setup() {
    const route = useRoute();
    const router = useRouter();
    
    const activeTab = ref('upcoming');
    const upcomingMatches = ref([]);
    const completedMatches = ref([]);
    const loading = ref(true);
    const error = ref(null);

    // Функция для изменения таба
    const changeTab = (tab) => {
      router.push({ path: '/my-matches', query: { tab } });
      activeTab.value = tab;
    };

    // Следим за изменениями URL
    watch(() => route.query.tab, (newTab) => {
      if (newTab && ['upcoming', 'completed'].includes(newTab)) {
        activeTab.value = newTab;
      }
    }, { immediate: true });

    const fetchMatches = async () => {
      loading.value = true;
      error.value = null;

      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.token) {
          console.error("Токен не найден");
          return;
        }
        const response = await axios.get('http://event-edge-su/api/my-matches', {
          headers: {
            Authorization: `Bearer ${user.token}`,
          }
        });

        upcomingMatches.value = response.data.upcoming_matches.map(match => ({
          id: match.id,
          tournamentName: match.stage_name,
          team1: match.team_1_name,
          team2: match.team_2_name,
          date: new Date(match.match_date).toLocaleDateString(),
          time: new Date(match.match_date).toLocaleTimeString(),
        }));

        completedMatches.value = response.data.past_matches.map(match => ({
          id: match.id,
          tournamentName: match.stage_name,
          team1: match.team_1_name,
          team2: match.team_2_name,
          date: new Date(match.match_date).toLocaleDateString(),
          score: match.score || "N/A",
          winner: match.winner_team_name ?? "N/A"
        }));
      } catch (err) {
        error.value = err.response?.data?.error || 'Ошибка при загрузке матчей';
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      // Устанавливаем начальный таб из URL при монтировании
      if (route.query.tab && ['upcoming', 'completed'].includes(route.query.tab)) {
        activeTab.value = route.query.tab;
      }
      fetchMatches();
    });

    return {
      activeTab,
      upcomingMatches,
      completedMatches,
      loading,
      error,
      changeTab
    };
  }
};
</script>

<style scoped>
.my-matches-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.title {
  font-size: 24px;
  margin-bottom: 20px;
}

.tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
}

.tabs button {
  padding: 10px 15px;
  border: none;
  cursor: pointer;
  background: #dcdcdc;
  font-size: 16px;
  margin: 0 5px;
  border-radius: 5px;
}

.tabs .active {
  background: #630181;
  color: white;
  font-weight: bold;
}
.error {
  color: red;
  font-weight: bold;
  margin-bottom: 10px;
}
.match-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.match-card {
  padding: 15px;
  background: #2a2a2a;
  border-radius: 8px;
  text-align: left;
}

.completed {
  border-left: 5px solid #630181;
}

.match-card h3 {
  margin: 0;
  font-size: 20px;
}

.match-card p {
  margin: 5px 0;
}

.winner {
  font-weight: bold;
  color: #630181;
}

.no-matches {
  margin-top: 20px;
  font-size: 18px;
  color: #7f8c8d;
}
.join-button {
  display: inline-block;
  margin-top: 10px;
  padding: 10px 20px;
  background-color: #ffffff;
  color: rgb(0, 0, 0);
  border-radius: 5px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.join-button:hover {
  background-color: #630181;
  color: #ffffff;
}

.no-matches {
  margin-top: 20px;
  font-size: 18px;
  color: #7f8c8d;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
  