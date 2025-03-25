<template>
    <div class="container">
      <h1>Организация турнира</h1>
  
      <!-- Сообщение об ошибке -->
      <div v-if="error" class="error-message">{{ error }}</div>
  
      <!-- Сообщение об успешном создании -->
      <div v-if="success" class="success-message">Турнир успешно создан!</div>
  
      <form @submit.prevent="createTournament">
        <label>Название турнира:</label>
        <input v-model="tournament.name" type="text" required />
  
        <label>Описание:</label>
        <textarea v-model="tournament.description" required></textarea>
  
        <label>Дата начала:</label>
        <input v-model="tournament.start_date" type="date" required />
  
        <label>Дата окончания:</label>
        <input v-model="tournament.end_date" type="date" required />
  
        <label>Игра:</label>
        <select v-model="tournament.game_id" required>
          <option v-for="game in games" :key="game.id" :value="game.id">
            {{ game.name }}
          </option>
        </select>
  
        <label>Стадия:</label>
<select v-model="tournament.stage_id" required>
  <option v-for="stage in stages" :key="stage.id" :value="stage.id">
    {{ stage.name }}
  </option>
</select>
  
        <BaseButton type="submit" customClass="details-button" :disabled="isLoading">Создать турнир</BaseButton>
      </form>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  import { useAuthStore } from "@/stores/auth.js";
  import BaseButton from "@/components/BaseButton.vue";
  export default {
    name: "CreateTournamentPage",
    components: {
    BaseButton,  // Убедитесь, что компонент зарегистрирован здесь
  },
    data() {
      return {
        tournament: {
          name: "",
          description: "",
          start_date: "",
          end_date: "",
          game_id: null,
          stage_id: null,
        },
        games: [],
        stage_types: [],
        isLoading: false,
        error: null,
        success: false,
      };
    },
    async mounted() {
      await this.fetchDropdownData();
    },
    methods: {
      async fetchDropdownData() {
  try {
    const authStore = useAuthStore();
    const token = authStore.user?.token;

    const [gamesRes, stagesRes] = await Promise.all([
      axios.get("http://event-edge-su/api/guest/games", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get("http://event-edge-su/api/guest/stage-type", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    this.games = gamesRes.data;
    this.stages = stagesRes.data.stage_types; // Теперь корректно получаем массив стадий
  } catch (err) {
    this.error = "Ошибка при загрузке данных";
  }
},

      async createTournament() {
        this.isLoading = true;
        this.error = null;
        this.success = false;
  
        // Проверка на правильность дат (например, дата начала до даты окончания)
        if (new Date(this.tournament.start_date) >= new Date(this.tournament.end_date)) {
          this.error = "Дата начала должна быть раньше даты окончания";
          this.isLoading = false;
          return;
        }
  
        try {
          const authStore = useAuthStore();
          const token = authStore.user?.token;
  
          await axios.post(
            "http://event-edge-su/api/tournaments",
            this.tournament,
            { headers: { Authorization: `Bearer ${token}` } }
          );
  
          this.success = true;
          setTimeout(() => {
            this.$router.push("/tournaments"); // Перенаправление после создания
          }, 2000);
        } catch (err) {
          this.error = "Ошибка при создании турнира";
        } finally {
          this.isLoading = false;
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .container {
    max-width: 600px;
    margin: 100px auto;
    padding: 20px;
    background: #000;
    border-radius: 12px;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2);
    color: #fff;
  }
  
  h1 {
    text-align: center;
    color: #fff;
  }
  
  form {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  input,
  textarea,
  select {
    width: 100%;
    padding: 8px;
    border-radius: 6px;
    border: 1px solid #ccc;
    background: #333;
    color: #fff;
  }
  
  button {
    background: #fff;
    color: #000;
    border: none;
    padding: 10px;
    cursor: pointer;
    border-radius: 6px;
    transition: background 0.3s ease;
  }
  
  button:disabled {
    background: gray;
    cursor: not-allowed;
  }
  
  button:hover:enabled {
    background: #000;
    color: #fff;
  }
  
  .error-message {
    color: red;
    text-align: center;
  }
  
  .success-message {
    color: green;
    text-align: center;
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


  </style>
  