<template>
  <div class="profile-container">
    <h1 class="title">Мой профиль</h1>

    <div v-if="isLoading" class="loading">Загрузка...</div>
    <div v-if="error" class="error-message">{{ error }}</div>

    <template v-else>
      <div class="profile-info">
        <div class="avatar">
  <img :src="avatarUrl" alt="Аватар" />
</div>
        <div class="details">
          <h2>{{ user.name }}</h2>
          <p><strong>Email:</strong> {{ user.email }}</p>
          <p><strong>Команда:</strong> {{ user.team ? user.team.name : "Нет команды" }}</p>
        </div>
      </div>

      <button @click="editProfile" class="edit-button">Изменить профиль</button>

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

      <div v-if="user.team" class="team-members">
        <h3>Состав команды "{{ user.team.name }}"</h3>
        <ul>
          <li v-for="member in user.team.members" :key="member.id" 
              class="team-member" 
              @click="goToPlayerProfile(member.id)">
            <span class="member-name">{{ member.name }}</span>
            <i class="fas fa-chevron-right"></i>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>

<script>
import axios from "axios";
import { useAuthStore } from "@/stores/auth.js";
import { useRouter } from "vue-router";

export default {
  name: "ProfilePage",
  data() {
    return {
      user: {},
      tournaments: [],
      isLoading: true,
      error: null,
      defaultAvatar: "https://www.gravatar.com/avatar/?d=mp"
    };
  },
  setup() {
    const router = useRouter();
    return { router };
  },
  async mounted() {
    await this.fetchUserProfile();
  },
  computed: {
  avatarUrl() {
    if (this.user.avatar) {
      return `http://event-edge-su/storage/${this.user.avatar}`;
    }
    return "https://www.gravatar.com/avatar/?d=mp";
  }
},
  methods: {
    async fetchUserProfile() {
      this.isLoading = true;
      this.error = null;

      try {
        const authStore = useAuthStore();
        const token = authStore.accessToken;

        const response = await axios.get("http://event-edge-su/api/my-profile", {
          headers: { Authorization: `Bearer ${token}` }
        });

        this.user = response.data.user;
        this.tournaments = response.data.tournaments;
      } catch (err) {
        this.error = "Ошибка при загрузке профиля";
        console.error(err);
      } finally {
        this.isLoading = false;
      }
    },
    formatDate(dateStr) {
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(dateStr).toLocaleDateString("ru-RU", options);
    },
  
    editProfile() {
      this.router.push("/edit-profile");
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
