<template>
  <div class="my-matches-container">
    <h1 class="title">Мои турниры</h1>

    <div v-if="loading">Загрузка турниров...</div>
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

      <div v-if="activeTab === 'upcoming'">
        <h2>Предстоящие турниры</h2>
        <div v-if="upcomingTournaments.length > 0" class="tournament-list">
          <div v-for="tournament in upcomingTournaments" :key="tournament.id" class="tournament-card">
            <div class="tournament-header">
              <h3>{{ tournament.name }}</h3>
              <router-link 
  :to="`/tournament/${tournament.id}/requests`" 
  class="details-button"
>
  Заявки
</router-link>
            </div>
            <p><strong>Описание:</strong> {{ tournament.description }}</p>
            <p><strong>Дата начала:</strong> {{ tournament.start_date }}</p>
            <p><strong>Дата окончания:</strong> {{ tournament.end_date }}</p>
            <p><strong>Статус:</strong> {{ tournament.status_name }}</p>
            <p><strong>Просмотры:</strong> {{ tournament.views_count }}</p>
          </div>
        </div>
        <p v-else class="no-tournaments">
          Нет предстоящих турниров? <br /> 
          <router-link to="/organize-tournament">
            <button class="cta-button">Время его организовать!</button>
          </router-link>
        </p>
      </div>

      <!-- Завершённые турниры -->
      <div v-if="activeTab === 'completed'">
        <h2>Завершённые турниры</h2>
        <div v-if="pastTournaments.length > 0" class="tournament-list">
          <div v-for="tournament in pastTournaments" :key="tournament.id" class="tournament-card completed">
            <div class="tournament-header">
              <h3>{{ tournament.name }}</h3>
              <router-link 
                :to="`/tournament-details/${tournament.id}`" 
                class="details-button"
              >
                Подробнее
              </router-link>
            </div>
            <p><strong>Описание:</strong> {{ tournament.description }}</p>
            <p><strong>Дата начала:</strong> {{ tournament.start_date }}</p>
            <p><strong>Дата окончания:</strong> {{ tournament.end_date }}</p>
            <p><strong>Статус:</strong> {{ tournament.status_name }}</p>
            <p><strong>Просмотры:</strong> {{ tournament.views_count }}</p>
          </div>
        </div>
        <p v-else class="no-matches">
          Нет завершённых турниров? <br />
          <router-link to="/tournaments">
            <button class="cta-button">Посмотреть активные турниры</button>
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export default {
  name: "MyTournaments",
  setup() {
    const route = useRoute();
    const router = useRouter();
    
    const activeTab = ref('upcoming');
    const upcomingTournaments = ref([]);
    const pastTournaments = ref([]);
    const loading = ref(true);
    const error = ref(null);

    const changeTab = (tab) => {
      router.push({ path: '/my-tournaments', query: { tab } });
      activeTab.value = tab;
    };

    watch(() => route.query.tab, (newTab) => {
      if (newTab && ['upcoming', 'completed'].includes(newTab)) {
        activeTab.value = newTab;
      }
    }, { immediate: true });

    const fetchTournaments = async () => {
      loading.value = true;
      error.value = null;

      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.token) {
          error.value = "Пользователь не авторизован";
          return;
        }

        const response = await axios.get('http://event-edge-su/api/my-tournaments', {
          headers: {
            Authorization: `Bearer ${user.token}`,
          }
        });

        pastTournaments.value = response.data.past_tournaments || [];
        upcomingTournaments.value = response.data.upcoming_tournaments || [];

      } catch (err) {
        error.value = err.response?.data?.error || 'Ошибка при загрузке турниров';
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      if (route.query.tab && ['upcoming', 'completed'].includes(route.query.tab)) {
        activeTab.value = route.query.tab;
      }
      fetchTournaments();
    });

    return {
      activeTab,
      upcomingTournaments,
      pastTournaments,
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

.tournament-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.tournament-card {
  padding: 15px;
  background: #630181;
  border-radius: 8px;
  text-align: left;
}

.completed {
  border-left: 5px solid #27ae60;
}

.tournament-card h3 {
  margin: 0;
  font-size: 20px;
}

.tournament-card p {
  margin: 5px 0;
}

.no-matches {
  margin-top: 20px;
  font-size: 18px;
  color: #7f8c8d;
}
.cta-button {
  margin-top: 10px;
  padding: 10px 20px;
  background-color: #630181;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.3s;
}

.cta-button:hover {
  background-color: #d94500;
}
</style>
