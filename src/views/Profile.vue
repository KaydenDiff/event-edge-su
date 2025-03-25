<template>
  <div class="profile-container">
    <h1 class="title">Профиль пользователя</h1>

    <div v-if="isLoading" class="loading">Загрузка...</div>
    <div v-if="error" class="error-message">{{ error }}</div>

    <template v-else>
      <div class="profile-info">
        <div class="avatar">
          <img :src="defaultAvatar" alt="Аватар">
        </div>
        <div class="details">
          <h2>{{ user.name }}</h2>
          <p><strong>Email:</strong> {{ user.email }}</p>
          <p><strong>Команда:</strong> {{ user.team || "Нет команды" }}</p>
        </div>
      </div>

      <button @click="editProfile" class="edit-button">Изменить профиль</button>

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
  methods: {
    async fetchUserProfile() {
      this.isLoading = true;
      this.error = null;

      try {
        const authStore = useAuthStore();
        const token = authStore.user?.token;

        const response = await axios.get("http://event-edge-su/api/guest/participants/my-profile", {
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
