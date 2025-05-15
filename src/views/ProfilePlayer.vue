<template>
  <div class="profile-container">
    <h1 class="title">Профиль игрока</h1>

    <!-- Индикатор загрузки и ошибки -->
    <div v-if="isLoading" class="loading">
      <i class="fas fa-spinner fa-pulse"></i> Загрузка...
    </div>
    <div v-if="error" class="error-message">
      <i class="fas fa-exclamation-circle"></i> {{ error }}
    </div>

    <!-- Основной контент -->
    <div v-if="!isLoading && !error && player">
      <div class="profile-card">
        <div class="profile-header">
          <div class="avatar-container">
            <img :src="avatarUrl" alt="Аватар" class="avatar-image" />
          </div>
          <div class="details">
            <h2>{{ player.name || "Неизвестный игрок" }}</h2>
            <p><i class="fas fa-users"></i> {{ player.team ? player.team.name : "Нет команды" }}</p>
          </div>
        </div>
      </div>

      <div class="section-container">
        <h3 class="section-title">
          <i class="fas fa-trophy"></i> История участия в турнирах
        </h3>
        <div class="section-content">
          <ul class="tournament-history" v-if="tournaments.length > 0">
            <li v-for="tournament in tournaments" :key="tournament.id" 
                class="tournament-item"
                @click="goToTournament(tournament.id)">
              <div class="tournament-info">
                <span class="tournament-name">{{ tournament.name }}</span>
                <span class="tournament-date">
                  {{ formatDate(tournament.start_date) }} - {{ formatDate(tournament.end_date) }}
                </span>
              </div>
              <i class="fas fa-chevron-right arrow-icon"></i>
            </li>
          </ul>
          <p v-else class="empty-message">Игрок еще не участвовал в турнирах</p>
        </div>
      </div>

      <div class="section-container" v-if="player.team && player.team.members.length">
        <h3 class="section-title">
          <i class="fas fa-users"></i> Состав команды
        </h3>
        <div class="section-content">
          <ul class="team-members">
            <li v-for="member in player.team.members" :key="member.id" 
                class="team-member" 
                @click="goToPlayerProfile(member.id)">
              <span class="member-name">{{ member.name }}</span>
              <i class="fas fa-chevron-right arrow-icon"></i>
            </li>
          </ul>
        </div>
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
  max-width: 800px;
  margin: 100px auto;
  padding: 30px;
}

.title {
  font-size: 2.2rem;
  color: #fff;
  margin-bottom: 30px;
  text-align: center;
  font-weight: 600;
  background: linear-gradient(90deg, #630181, #9500ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.profile-card {
  background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  margin-bottom: 30px;
  border: 1px solid rgba(182, 0, 254, 0.1);
  position: relative;
  overflow: hidden;
}

.profile-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #630181, #9500ff);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 30px;
}

.avatar-container {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #630181;
  background: #333;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.avatar-container:hover .avatar-image {
  transform: scale(1.05);
}

.details {
  flex: 1;
}

.details h2 {
  font-size: 1.8rem;
  color: #fff;
  margin-bottom: 10px;
  font-weight: 600;
}

.details p {
  margin: 8px 0;
  font-size: 1.1rem;
  color: #d0d0d0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.details p i {
  color: #630181;
  font-size: 0.9rem;
  width: 20px;
  text-align: center;
}

.section-container {
  background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(182, 0, 254, 0.1);
  position: relative;
  overflow: hidden;
}

.section-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #630181, #9500ff);
}

.section-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title i {
  color: #630181;
}

.section-content {
  padding: 10px 0;
}

.tournament-history, .team-members {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tournament-item, .team-member {
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid transparent;
}

.tournament-item:hover, .team-member:hover {
  background: rgba(99, 1, 129, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  border-color: rgba(182, 0, 254, 0.2);
}

.tournament-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.tournament-name, .member-name {
  font-weight: 600;
  color: #fff;
  font-size: 1.1rem;
}

.tournament-date {
  color: #aaa;
  font-size: 0.9rem;
}

.arrow-icon {
  color: #630181;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.tournament-item:hover .arrow-icon, .team-member:hover .arrow-icon {
  opacity: 1;
  transform: translateX(5px);
}

.loading, .error-message {
  text-align: center;
  padding: 40px;
  border-radius: 15px;
  background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
  margin: 30px 0;
  font-size: 1.2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.loading {
  color: #fff;
}

.loading i {
  color: #630181;
  font-size: 2rem;
  margin-bottom: 10px;
}

.error-message {
  color: #ff6b6b;
  border: 1px solid rgba(255, 107, 107, 0.3);
}

.error-message i {
  font-size: 2rem;
  margin-bottom: 10px;
}

.empty-message {
  text-align: center;
  color: #aaa;
  padding: 20px;
  font-style: italic;
}

@media (max-width: 768px) {
  .profile-container {
    padding: 20px;
    margin: 80px auto 30px;
        width: 80%;
  }
  
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
  
  .title {
    font-size: 1.8rem;
  }
  
  .details h2 {
    font-size: 1.6rem;
  }
  
  .details p {
    justify-content: center;
  }
  
  .tournament-item, .team-member {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }
  
  .arrow-icon {
    display: none;
  }
}
</style>
