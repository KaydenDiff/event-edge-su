<template>
    <div class="profile-container">
      <h1 class="title">Профиль игрока</h1>
  
      <!-- Условие для отображения индикатора загрузки -->
      <div v-if="isLoading" class="loading">Загрузка...</div>
      <div v-if="error" class="error-message">{{ error }}</div>
  
      <!-- Отображаем информацию только если данные загружены -->
      <template v-else>
        <div v-if="player" class="profile-info">
          <div class="avatar">
            <!-- Проверяем, что player.avatar существует, если нет, используем defaultAvatar -->
            <img :src="player.avatar || defaultAvatar" alt="Аватар игрока">
          </div>
          <div class="details">
            <h2>{{ player.name || "Неизвестный игрок" }}</h2>
            <p><strong>Команда:</strong> {{ player.team || "Нет команды" }}</p>
          </div>
        </div>
  
        <h3 class="history-title">История участия в турнирах</h3>
        <ul class="tournament-history">
          <li v-for="tournament in tournaments" :key="tournament.id">
            <span class="tournament-name">{{ tournament.name }}</span>
            <span class="tournament-result">
              {{ formatDate(tournament.start_date) }} - {{ formatDate(tournament.end_date) }}
            </span>
          </li>
        </ul>
      </template>
    </div>
  </template>
  
  <script>
import axios from "axios";
import { useRouter } from "vue-router";

export default {
  name: "PlayerProfilePage",
  data() {
    return {
      player: null, // Инициализируем как null
      tournaments: [],
      isLoading: true,
      error: null,
      defaultAvatar: "https://www.gravatar.com/avatar/?d=mp",
    };
  },
  setup() {
    const router = useRouter();
    return { router };
  },
  async mounted() {
    const playerId = this.$route.params.id; // Получаем ID игрока из маршрута
    await this.fetchPlayerProfile(playerId);
  },
  methods: {
  async fetchPlayerProfile(playerId) {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await axios.get(`http://event-edge-su/api/guest/participants/profile/${playerId}`);
      this.player = response.data.user; // Меняем player на user
      this.tournaments = response.data.tournaments;
    } catch (err) {
      this.error = "Ошибка при загрузке профиля игрока";
      console.error(err);
    } finally {
      this.isLoading = false;
    }
  },

  formatDate(dateStr) {
    if (!dateStr) return "Неизвестно"; // Проверяем, что дата есть
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateStr).toLocaleDateString("ru-RU", options);
  }
},
};
</script>
  
  <style scoped>
  .profile-container {
    max-width: 600px;
    margin: 100px auto;
    padding: 20px;
    background: #1e1e1e;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    text-align: center;
  }
  
  .title {
    font-size: 2rem;
    color: #fff;
    margin-bottom: 20px;
  }
  
  .profile-info {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 20px;
    background: #333;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }
  
  .avatar img {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
  }
  
  .details h2 {
    font-size: 1.5rem;
    color: #fff;
  }
  
  .details p {
    margin: 5px 0;
    font-size: 1rem;
    color: #bbb;
  }
  
  .history-title {
    margin-top: 30px;
    font-size: 1.25rem;
    font-weight: bold;
    color: #fff;
  }
  
  .tournament-history {
    list-style: none;
    padding: 0;
  }
  
  .tournament-history li {
    padding: 12px;
    border-bottom: 1px solid #444;
    display: flex;
    justify-content: space-between;
    font-size: 1rem;
    color: #bbb;
  }
  
  .tournament-name {
    font-weight: bold;
    color: #fff;
  }
  
  .tournament-result {
    color: #aaa;
  }
  
  .loading {
    color: #fff;
    font-size: 1.5rem;
  }
  
  .error-message {
    color: red;
    font-size: 1.2rem;
  }
  </style>
  