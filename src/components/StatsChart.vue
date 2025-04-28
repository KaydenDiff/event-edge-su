<template>
    <div class="dashboard">
      <div class="dashboard-statistics">
        <div class="stat-card">
          <h3>Общее количество пользователей</h3>
          <p>{{ stats.total_users }}</p>
        </div>
        <div class="stat-card">
          <h3>Новые пользователи (этот месяц)</h3>
          <p>{{ stats.new_users_this_month }}</p>
        </div>
        <div class="stat-card">
          <h3>Общее количество турниров</h3>
          <p>{{ stats.total_tournaments }}</p>
        </div>
        <div class="stat-card">
          <h3>Активные турниры</h3>
          <p>{{ stats.active_tournaments }}</p>
        </div>
        <div class="stat-card">
          <h3>Завершенные турниры</h3>
          <p>{{ stats.finished_tournaments }}</p>
        </div>
        <div class="stat-card">
          <h3>Общее количество команд</h3>
          <p>{{ stats.total_teams }}</p>
        </div>
        <div class="stat-card">
          <h3>Общее количество матчей</h3>
          <p>{{ stats.total_matches }}</p>
        </div>
      </div>
  
      <div class="charts">
        <!-- График активности пользователей -->
        <div class="chart-container">
          <Line :data="userActivityData" />
        </div>
  
        <!-- График популярности турниров -->
        <div class="chart-container">
          <Bar :data="tournamentPopularityData" />
        </div>
  
      </div>
    </div>
  </template>
  
  <script setup>
import { ref, onMounted } from 'vue';
import { Line, Bar, Radar } from 'vue-chartjs';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth'
import { Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    BarElement, 
    RadialLinearScale, // Шкала для радиальных диаграмм
    PointElement, 
    Title, 
    Tooltip, 
    Legend,
    LineElement  // Добавляем LineElement
} from 'chart.js';

// Регистрация всех необходимых компонентов Chart.js
ChartJS.register(
  CategoryScale,
  RadialLinearScale,
  LinearScale,
  BarElement,
  PointElement,  // Регистрация компонента PointElement
  LineElement,   // Регистрация компонента LineElement
  Title,
  Tooltip,
  Legend
);

const stats = ref({
  total_users: 0,
  new_users_this_month: 0,
  total_tournaments: 0,
  active_tournaments: 0,
  finished_tournaments: 0,
  total_teams: 0,
  total_matches: 0,
});

const userActivityData = ref({
  labels: [],
  datasets: [{
    label: 'Активность пользователей',
    data: [],
    backgroundColor: "rgba(75, 192, 192, 0.2)",
    borderColor: "rgba(75, 192, 192, 1)",
    borderWidth: 1,
  }]
});

const tournamentPopularityData = ref({
  labels: [],  // Здесь будут названия турниров
  datasets: [{
    label: 'Популярность турниров',
    data: [],  // Здесь будут значения просмотров турниров
    backgroundColor: "rgba(255, 99, 132, 0.2)",
    borderColor: "rgba(255, 99, 132, 1)",
    borderWidth: 1,
  }]
});


const fetchStats = async () => {
  try {
    const authStore = useAuthStore();
    if (!authStore.accessToken) {
      alert("Вы не авторизованы!");
      return;
    }
    // Получение данных
    const overviewResponse = await axios.get("http://event-edge-su/api/admin/stats/overview", {
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    const tournamentStatsResponse = await axios.get("http://event-edge-su/api/admin/stats/tournaments", {
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const data = overviewResponse.data;
    const tournamentStats = tournamentStatsResponse.data;

    if (!data || !data.user_activity || !data.user_activity.labels || !data.user_activity.data) {
      throw new Error('User activity data is incomplete');
    }

    if (!tournamentStats || !tournamentStats.popular_tournaments) {
      throw new Error('Tournament stats are incomplete');
    }

    // Обновление состояния
    stats.value = {
      total_users: data.total_users,
      new_users_this_month: data.new_users_this_month,
      total_tournaments: data.total_tournaments,
      active_tournaments: data.active_tournaments,
      finished_tournaments: data.finished_tournaments,
      total_teams: data.total_teams,
      total_matches: data.total_matches,
    };

    userActivityData.value = {
      labels: data.user_activity.labels,
      datasets: [{
        label: 'Активность пользователей',
        data: data.user_activity.data,
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      }],
    };

    tournamentPopularityData.value = {
      labels: tournamentStats.popular_tournaments.map(t => t.name),
      datasets: [{
        label: 'Популярность турниров',
        data: tournamentStats.popular_tournaments.map(t => t.views_count),
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      }],
    };

  } catch (error) {
    console.error('Ошибка загрузки статистики', error);
  }
};

onMounted(fetchStats);
</script>

  
  <style scoped>
  .dashboard {
    display: flex;
    flex-direction: column;
  }
  
  .dashboard-statistics {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
  }
  
  .stat-card {
    background: #000000;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 200px;
  }
  
  .charts {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
  }
  
  .chart-container {
    width: 45%;
  }
  </style>
  