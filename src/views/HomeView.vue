<template>

  <div class="home-page">
    <section class="hero">
      <h1 class="text-4xl font-bold">Добро пожаловать в Турнирный Хаб</h1>
      <p class="text-lg mt-2">Создавайте, управляйте и участвуйте в турнирах!</p>
      <BaseButton @click="goToTournaments" customClass="details-button">Принять участие в турнире</BaseButton>
    </section>

    <section class="tournaments mt-8">
      <h2 class="text-2xl font-semibold">Популярные турниры</h2>

      <div v-if="loading" class="loading">Загрузка...</div>
      <div v-if="error" class="error">{{ error }}</div>

      <div v-if="!loading && !error" class="tournament-list">
        <div v-for="tournament in popularTournaments" :key="tournament.name" class="tournament-card">
  <h3 class="tournament-name">{{ tournament.name }}</h3>
  <p class="game-name">{{ tournament.description }}</p>
  <p class="organizer-name">
    Организатор: 
    {{ typeof tournament.organizer === 'object' ? tournament.organizer.name : tournament.organizer }}
  </p>
  <p class="status">Просмотры: {{ tournament.views_count }}</p>
  <!-- Добавляем статус турнира -->
  <p class="status-name">Статус: {{ tournament.status_name }}</p>
  <BaseButton :to="'/tournaments/' + tournament.id" customClass="details-button">
    Подробнее
  </BaseButton>
</div>

      </div>
    </section>

    <section class="upcoming-tournaments mt-8">
      <h2 class="text-2xl font-semibold">Ближайшие турниры</h2>

      <div v-if="loading" class="loading">Загрузка...</div>
      <div v-if="error" class="error">{{ error }}</div>

      <div v-if="!loading && !error" class="tournament-list">
        <div v-for="tournament in upcomingTournaments" :key="tournament.id" class="tournament-card">
  <h3 class="tournament-name">{{ tournament.name }}</h3>
  <p class="game-name">{{ tournament.description }}</p>
  <p class="organizer-name">
    Организатор: 
    {{ typeof tournament.organizer === 'object' ? tournament.organizer.name : tournament.organizer }}
  </p>
  <p class="status">Дата начала: {{ tournament.start_date }}</p>
  <!-- Добавляем статус турнира -->
  <p class="status-name">Статус: {{ tournament.status_name }}</p>
  <BaseButton :to="'/tournaments/' + tournament.id" customClass="details-button">
    Регистрация
  </BaseButton>
</div>
      </div>
    </section>

    <section class="stats mt-8">
      <h2 class="text-2xl font-semibold">Статистика турниров</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <h3>{{ totalTournaments }}</h3>
          <p>Турниров проведено</p>
        </div>
        <div class="stat-card">
          <h3>{{ totalPlayers }}</h3>
          <p>Игроков зарегистрировано</p>
        </div>
        <div class="stat-card">
          <h3>{{ totalMatches }}</h3>
          <p>Матчей сыграно</p>
        </div>
      </div>
    </section>
    <NotificationButton @click="handleNotificationClick" />
    <div class="news-announcement">
      <h2 class="announcement-title">Хотите следить за новыми турнирами?</h2>
      <p class="announcement-text">
        Скачивайте наше приложение и будьте в курсе всех анонсов!
      </p>
      <div class="download-buttons">
        <a href="https://play.google.com" target="_blank" class="download-button google-play">
          <img src="" alt="Google Play" />
        </a>
        <a href="https://www.apple.com/app-store/" target="_blank" class="download-button app-store">
          <img src="" alt="App Store" />
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import BaseButton from "@/components/BaseButton.vue";
import NotificationButton from "@/components/NotificationButton.vue";

const router = useRouter();
const popularTournaments = ref([]);
const tournaments = ref([]); // Все турниры
const upcomingTournaments = ref([]); // Ближайшие турниры
const loading = ref(true);
const error = ref(null);
// Статистика турниров
const totalTournaments = ref(0);
const totalPlayers = ref(0);
const totalMatches = ref(0);
const fetchPopularTournaments = async () => {
  try {
    const response = await fetch("http://event-edge-su/api/guest/popular-tournaments");
    if (!response.ok) throw new Error("Ошибка загрузки данных");
    const data = await response.json();
    popularTournaments.value = data;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};
const fetchStatistics = async () => {
  try {
    const response = await fetch("http://event-edge-su/api/guest/statistics");
    if (!response.ok) throw new Error("Ошибка загрузки статистики");
    const data = await response.json();

    totalTournaments.value = data.tournaments_count;
    totalPlayers.value = data.players_count;
    totalMatches.value = data.matches_count;
  } catch (err) {
    error.value = err.message;
  }
};
const fetchTournaments = async () => {
  try {
    const response = await fetch("http://event-edge-su/api/guest/tournaments");
    if (!response.ok) throw new Error("Ошибка загрузки данных");
    const data = await response.json();

    tournaments.value = data;

    // Получаем сегодняшнюю дату в формате YYYY-MM-DD
    const today = new Date().toISOString().split("T")[0];

    // Фильтруем турниры, у которых дата начала больше или равна текущей
    upcomingTournaments.value = data
      .filter(tournament => tournament.start_date >= today)
      .sort((a, b) => new Date(a.start_date) - new Date(b.start_date)); // Сортировка по дате
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const goToTournaments = () => {
  router.push("/tournaments");
};

onMounted(() => {
  fetchPopularTournaments();
  fetchTournaments();
  fetchStatistics();
});
</script>

<style scoped>
.news-announcement {
  margin: 50px auto;
  padding: 20px;
  max-width: 700px;
  text-align: center;
  background: #000;
  border-radius: 12px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2);
  color: #fff;
  animation: fadeIn 1s ease-in-out;
}
.upcoming-tournaments {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
.announcement-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #fff;
}

.announcement-text {
  font-size: 18px;
  margin-bottom: 20px;
}

.download-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.download-button img {
  width: 140px;
  transition: transform 0.3s ease;
}

.download-button img:hover {
  transform: scale(1.1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.home-page {
  padding: 30px 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #000;
  color: #fff;
  scrollbar-width: none; /* Скрытие скроллбара в Firefox */
}

.hero {
  text-align: center;
  margin-top: 80px;
  margin-bottom: 50px;
  background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/img/main.png') no-repeat center center/cover;
  padding: 50px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.hero h1 {
  font-size: 2.5rem;
  margin-bottom: 15px;
  color: #fff;
}

.hero p {
  font-size: 1.125rem;
  margin-bottom: 20px;
}

.btn-primary {
  background-color: #fff;
  color: #000;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  transition: background-color 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease;
  outline: none;
  border: 2px solid transparent;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-primary:hover {
  background-color: #000;
  color: #fff;
  transform: scale(1.05);
}

.tournaments {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.tournament-list {
  padding-top: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  justify-content: center; /* Центрирование всего контента в гриде */
}
.tournament-card {
  background: #333;
  padding: 20px;
  border-radius: 15px;
  text-align: center;
  width: 100%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.tournament-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
}

.tournament-name {
  font-size: 1.5rem;
  font-weight: bold;
  color: #fff;
}

.game-name {
  font-size: 1.125rem;
  color: #ccc;
}

.organizer-name {
  font-size: 1rem;
  color: #ccc;
}

.status {
  font-size: 1rem;
  margin: 10px 0;
}
.status-name {
  font-size: 1rem;
  margin: 10px 0;
}
.details-button {
  background-color: #fff;
  color: #000;
  padding: 8px 20px;
  border-radius: 8px;
  text-decoration: none;
  display: inline-block;
}

.details-button:hover {
  background-color: #000;
  color: #fff;
}

.stats {
  margin-top: 40px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.stat-card {
  background-color: #333;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  color: #fff;
}

.stat-card h3 {
  font-size: 2rem;
  font-weight: bold;
}

.stat-card p {
  font-size: 1rem;
  color: #ccc;
}

.loading,
.error {
  text-align: center;
  color: #fff;
}

.error {
  color: red;
}
/* Для WebKit (Chrome, Safari) */
.home-page::-webkit-scrollbar {
  display: none; /* Скрывает скроллбар */
}
</style>
