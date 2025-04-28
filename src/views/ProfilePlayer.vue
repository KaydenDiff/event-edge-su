<template>
  <div class="profile-container">
    <h1 class="title">Профиль игрока</h1>

    <!-- Индикатор загрузки и ошибки -->
    <div v-if="isLoading" class="loading">Загрузка...</div>
    <div v-if="error" class="error-message">{{ error }}</div>

    <!-- Основной контент -->
    <div v-if="!isLoading && !error && player">
  <div class="profile-info">
    <div class="avatar">
  <img :src="avatarUrl" alt="Аватар" />
</div>
    <div class="details">
      <h2>{{ player.name || "Неизвестный игрок" }}</h2>
      <p><strong>Команда:</strong> {{ player.team ? player.team.name : "Нет команды" }}</p>
    </div>
  </div>

  <h3 class="history-title">История участия в турнирах</h3>
  <ul class="tournament-history">
    <li v-for="tournament in tournaments" :key="tournament.id" 
        class="tournament-item"
        @click="goToTournament(tournament.id)">
      <span class="tournament-name">{{ tournament.name }}</span>
      <span class="tournament-result">
        {{ formatDate(tournament.start_date) }} - {{ formatDate(tournament.end_date) }}
      </span>
    </li>
  </ul>

  <div v-if="player.team && player.team.members.length" class="team-members">
    <h3>Состав команды:</h3>
    <ul>
      <li v-for="member in player.team.members" :key="member.id" 
          class="team-member" 
          @click="goToPlayerProfile(member.id)">
        <span class="member-name">{{ member.name }}</span>
        <i class="fas fa-chevron-right"></i>
      </li>
    </ul>
  </div>
</div>
  </div>
</template>

<script>
import axios from "axios";
import { useRouter } from "vue-router";

export default {
  name: "PlayerProfilePage",
  data() {
    return {
      player: null,
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
    const playerId = this.$route.params.id;
    await this.fetchPlayerProfile(playerId);
  },
  watch: {
    '$route.params.id': {
      handler(newId) {
        if (newId) {
          this.fetchPlayerProfile(newId);
        }
      },
      immediate: true
    }
  },
  computed: {
    avatarUrl() {
    if (this.player.avatar) {
      return `http://event-edge-su/storage/${this.player.avatar}`;
    }
    return "https://www.gravatar.com/avatar/?d=mp";
  }
},
  methods: {
    async fetchPlayerProfile(playerId) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.get(`http://event-edge-su/api/profile/${playerId}`);
        this.player = response.data.user;
        this.tournaments = response.data.tournaments;
      } catch (err) {
        this.error = "Ошибка при загрузке профиля игрока";
        console.error(err);
      } finally {
        this.isLoading = false;
      }
    },
    formatDate(dateStr) {
      if (!dateStr) return "Неизвестно";
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(dateStr).toLocaleDateString("ru-RU", options);
    },
    goToPlayerProfile(playerId) {
      this.router.push(`/profile/${playerId}`);
    },
    goToTournament(tournamentId) {
      this.router.push(`/tournaments/${tournamentId}`);
    }
  }
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
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.02);
}

.tournament-history li:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateX(5px);
}

.tournament-name {
  font-weight: bold;
  color: #fff;
}

.tournament-result {
  color: #aaa;
}

.team-members {
  margin-top: 20px;
  text-align: left;
}

.team-members h3 {
  font-size: 1.2rem;
  display: flex;
  color: #fff;
  justify-content: center;
}

.team-members ul {
  list-style: none;
  padding: 0;
}

.team-member {
  padding: 12px;
  border-bottom: 1px solid #444;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.02);
}

.team-member:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateX(5px);
}

.team-member i {
  color: #630181;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.team-member:hover i {
  opacity: 1;
}

.member-name {
  font-weight: 500;
}

.loading {
  color: #fff;
  font-size: 1.5rem;
}

.error-message {
  color: red;
  font-size: 1.2rem;
}

.edit-button {
  margin-top: 20px;
  padding: 10px 15px;
  font-size: 1rem;
  background-color: #444;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.3s;
}

.edit-button:hover {
  background-color: #666;
}
</style>
