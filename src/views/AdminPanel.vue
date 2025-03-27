<template>
  <div class="admin-panel">
    <AdminSidebar @menu-selected="updateContent" />
    <div class="main-content">
      <h2>{{ pageTitle }}</h2>
      
      <!-- Home Section -->
      <div v-if="pageContent === 'home'">
        <h3>Как пользоваться панелью администратора</h3>
        <p>
          Здесь вы можете управлять различными аспектами системы, включая турниры, матчи, статистику и настройки.
        </p>
        <ul>
          <li>Управление пользователями: Добавляйте, редактируйте и удаляйте пользователей.</li>
          <li>Управление турнирами: Добавляйте и редактируйте турниры.</li>
          <li>Управление матчами: Создавайте и управляйте матчами.</li>
          <li>Статистика: Просматривайте различные данные и отчеты.</li>
          <li>Настройки: Изменяйте настройки приложения.</li>
        </ul>
      </div>

      <!-- Tournaments Section -->
      <div v-if="pageContent === 'tournaments'">
        <p>
          Здесь вы можете добавлять, редактировать и удалять турниры.
        </p>
        <div v-if="!tournaments || tournaments.length === 0">Нет турниров</div>
        <div v-else>
          <div v-for="tournament in tournaments" :key="tournament.id" class="tournament-card">
            <TournamentCard :tournament="tournament" />
            <div class="tournament-actions">
              <!-- Перенаправление на страницу редактирования -->
              <button @click="editTournament(tournament.id)">Редактировать</button>
              <button @click="deleteTournament(tournament.id)">Удалить</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Matches Section -->
      <div v-if="pageContent === 'matches'">
        <button class="btn-primary" @click="showCreateMatchForm = !showCreateMatchForm">
          {{ showCreateMatchForm ? 'Закрыть форму' : 'Создать матч' }}
        </button>

        <!-- Форма создания матча -->
        <div v-if="showCreateMatchForm">
          <h4>Создание нового матча</h4>
          <form @submit.prevent="createMatch">
            <div>
              <label for="tournament_id">Турнир</label>
              <select v-model="newMatch.tournament_id" required>
                <option v-for="tournament in tournaments" :key="tournament.id" :value="tournament.id">
                  {{ tournament.name }}
                </option>
              </select>
            </div>
            <div>
              <label for="team1">Команда 1</label>
              <select v-model="newMatch.team_1_id" required>
                <option v-for="team in filteredTeams" :key="team.id" :value="team.id">
                  {{ team.name }}
                </option>
              </select>
            </div>
            <div>
              <label for="team2">Команда 2</label>
              <select v-model="newMatch.team_2_id" required>
                <option v-for="team in filteredTeams" :key="team.id" :value="team.id">
                  {{ team.name }}
                </option>
              </select>
            </div>
            <div>
              <label for="match_date">Дата и время</label>
              <input type="datetime-local" v-model="newMatch.match_date" required />
            </div>
            <div>
              <label for="status">Статус</label>
              <select v-model="newMatch.status" required>
                <option value="pending">Ожидает</option>
                <option value="completed">Завершен</option>
                <option value="cancelled">Отменен</option>
              </select>
            </div>
            <div>
              <label for="stage_id">Стадия</label>
              <select v-model="newMatch.stage_id" required>
                <option v-for="stage in stages" :key="stage.id" :value="stage.id">
                  {{ stage.name }}
                </option>
              </select>
            </div>
            <div>
              <label for="winner_team_id">Победившая команда</label>
              <select v-model="newMatch.winner_team_id">
                <option :value="null">Без победителя</option>
                <option v-if="newMatch.team_1_id" :value="newMatch.team_1_id">
                  {{ teams.find(team => team.id === newMatch.team_1_id)?.name }}
                </option>
                <option v-if="newMatch.team_2_id" :value="newMatch.team_2_id">
                  {{ teams.find(team => team.id === newMatch.team_2_id)?.name }}
                </option>
              </select>
            </div>
            <button type="submit" class="btn-primary">Создать матч</button>
          </form>
        </div>

        <div v-if="!matches || matches.length === 0">Нет матчей</div>
        <div v-else>
          <div v-for="match in matches" :key="match.id" class="match-card">
            <MatchCard :match="match" />
            <div class="match-actions">
              <button @click="editMatch(match.id)">Редактировать</button>
              <button @click="deleteMatch(match.id)">Удалить</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tournament Bracket Section -->
      <div v-if="pageContent === 'tournament-basket'">
<TournamentBasketAdmin></TournamentBasketAdmin>
      </div>

    </div>
  </div>
</template>

<script>
import AdminSidebar from '../components/AdminSidebar.vue';
import TournamentCard from '../components/TournamentCard.vue';
import TournamentBasketAdmin from '../components/TournamentBasketAdmin.vue';
import MatchCard from '@/components/MatchCard.vue';
import { ref } from 'vue';
import axios from 'axios';

export default {
  name: 'AdminPanel',
  components: {
    AdminSidebar,
    TournamentCard,
    MatchCard,
    TournamentBasketAdmin
  },
  data() {
    return {
      pageContent: 'home',
      tournaments: [], 
      teams: [],
      stages: [],
      rounds: [], // Хранение данных о матчах по раундам
      matches: [],
      showCreateMatchForm: false,
      newMatch: {
        tournament_id: '',
        team_1_id: '',
        team_2_id: '',
        match_date: '',
        status: 'pending',
        winner_team_id: '',
        stage_id: ''
      },
      isAdmin: true // Определяем, является ли пользователь администратором
    };
  },
  computed: {
    filteredTeams() {
      if (!this.newMatch.tournament_id) return [];

      const tournament = this.tournaments.find(t => t.id === this.newMatch.tournament_id);

      if (!tournament || !tournament.teams) return [];

      return tournament.teams.map(team => ({
        id: team.pivot.team_id,
        name: team.name
      }));
    },
    filteredTeam() {
    if (!this.newMatch.tournament_id) return [];
    return this.teams.filter(team => team.tournament_id === this.newMatch.tournament_id);
  },
  filteredMatches() {
    if (!this.selectedTournament) return this.matches;
    return this.matches.filter(match => match.tournament_id === this.selectedTournament);
  }
  },
  methods: {
    updateContent(section) {
    this.pageContent = section;
    if (section === 'home') {
      this.pageTitle = 'Главная панель';
    } else if (section === 'tournaments') {
      this.pageTitle = 'Управление турнирами';
    } else if (section === 'matches') {
      this.pageTitle = 'Управление матчами';
    } else if (section === 'tournament-basket') {
      this.pageTitle = 'Управление турнирными сетками';
    }
  },

    async fetchTournaments() {
      try {
        const response = await fetch('http://event-edge-su/api/guest/tournaments');
        const data = await response.json();
        this.tournaments = data;
      } catch (error) {
        console.error('Ошибка загрузки турниров:', error);
      }
    },

    async deleteTournament(id) {
      if (!confirm('Вы уверены, что хотите удалить турнир?')) return;

      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.token) {
        console.error('Токен не найден');
        return;
      }

      try {
        const response = await fetch(`http://event-edge-su/api/admin/tournaments/delete/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Ошибка при удалении турнира');
        }

        this.tournaments = this.tournaments.filter(tournament => tournament.id !== id);
      } catch (error) {
        console.error('Ошибка удаления турнира:', error);
      }
    },
      // Метод редактирования турнира
  editTournament(id) {
    this.$router.push({ name: 'EditTournament', params: { id } });
  },

    async fetchTeams() {
      try {
        const response = await fetch('http://event-edge-su/api/guest/teams');
        const data = await response.json();
        this.teams = data;
      } catch (error) {
        console.error('Ошибка загрузки команд:', error);
      }
    },

    async fetchStages() {
      try {
        const response = await fetch('http://event-edge-su/api/guest/stages');
        const data = await response.json();
        this.stages = data;
      } catch (error) {
        console.error('Ошибка загрузки стадий:', error);
      }
    },

    async fetchMatches() {
      try {
        const response = await fetch('http://event-edge-su/api/guest/game-matches');
        const data = await response.json();
        this.matches = data;
      } catch (error) {
        console.error('Ошибка загрузки матчей:', error);
      }
    },

    async createMatch() {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.token) {
        console.error('Токен не найден');
        return;
      }

      console.log('Отправляемые данные для создания матча:', this.newMatch);

      try {
        const response = await fetch('http://event-edge-su/api/admin/game-matches/create', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.newMatch),
        });

        if (!response.ok) {
          throw new Error('Ошибка при создании матча');
        }

        this.newMatch = {
          tournament_id: '',
          team_1_id: '',
          team_2_id: '',
          match_date: '',
          status: 'pending',
          winner_team_id: '',
          stage_id: ''
        };
        this.showCreateMatchForm = false;

        await this.fetchMatches();
      } catch (error) {
        console.error('Ошибка создания матча:', error);
      }
    },

    async deleteMatch(id) {
      if (!confirm('Вы уверены, что хотите удалить матч?')) return;

      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.token) {
        console.error('Токен не найден');
        return;
      }

      try {
        const response = await fetch(`http://event-edge-su/api/admin/game-matches/delete/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Ошибка при удалении матча');
        }

        this.matches = this.matches.filter(match => match.id !== id);
      } catch (error) {
        console.error('Ошибка удаления матча:', error);
      }
    },

    async editMatch(id) {
      this.$router.push({ name: 'EditMatch', params: { id } });
    }
  },
  mounted() {
    this.fetchTeams?.();
    this.fetchStages?.();
    this.fetchMatches?.();
    this.fetchTournaments?.();
  }
};
</script>

<style scoped>
button {
  background-color: #ffffff;
  color: #000;
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s ease-in-out;
  outline: none;
  border: 3px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  z-index: 1;
  text-decoration: none;
  display: inline-block;
}
.btn-primary {
  background-color: #ffffff;
  color: #000;
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s ease-in-out;
  outline: none;
  border: 3px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  margin: 10px auto;
  z-index: 1;
  text-decoration: none;

  display: inline-block;
}

/* Анимация пульсирующей обводки */
@keyframes pulseBorder {
  0% {
    border-color: rgba(255, 255, 255, 0.5);
  }
  50% {
    border-color: rgba(255, 255, 255, 1);
  }
  100% {
    border-color: rgba(255, 255, 255, 0.5);
  }
}

/* Применение эффекта */
button:hover {
  animation: pulseBorder 1.5s infinite ease-in-out;
  transform: scale(1.05);
  background-color: #000;
  color: #fff;
}

button:active {
  transform: scale(0.95);
}
.admin-panel {
  display: flex;
  height: 100vh;
}

.admin-panel .admin-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 250px;
  height: 100%;
  background-color: #8C8C8C;

}

.main-content {
  margin-left: 250px;
  padding: 40px;
  width: calc(100% - 250px);
  overflow-y: auto; /* Оставляем прокрутку */
  scrollbar-width: none; /* Скрытие скроллбара в Firefox */
  -ms-overflow-style: none; /* Скрытие скроллбара в IE и Edge */
  padding-top: 74px; /* Отступ сверху */
}

/* Для WebKit (Chrome, Safari) */
.main-content::-webkit-scrollbar {
  display: none; /* Скрывает скроллбар */
}



.tournament-list {
  padding-top: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.tournaments {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

.tournament-card {
  background: #9A9A9A;
  padding: 20px;
  border-radius: 15px;
  text-align: center;
  width: 100%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  margin-bottom: 50px; /* Отступ между турнирами */
}

.tournament-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
}

.tournament-name {
  font-size: 1.25rem;
  font-weight: bold;
  color: #ffffff;
}
.status {
  font-size: 1rem;
  margin: 10px 0;
}

.status.text-green-500 {
  color: #48BB78;
}

.status.text-blue-500 {
  color: #3B82F6;
}

.status.text-gray-500 {
  color: #6B7280;
}

.details-link {
  display: inline-block;
  margin-top: 10px;
  background-color: #CDAA51;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  text-decoration: none;
  transition: background-color 0.3s ease;
}

.details-link:hover {
  background-color: #B88F3A;
}

.main-content h3 {
  font-size: 1.75rem;
  color: #ffffff;
  margin-bottom: 20px;
}

.main-content p {
  font-size: 1.125rem;
  color: #ffffff;
  margin-bottom: 20px;
}

.tournament-actions {
  margin-top: 10px;
  display: flex;
  gap: 15px; /* Увеличенный промежуток между кнопками */
}

.tournament-actions button {
  flex: 1; /* Равномерное распределение кнопок */
}



.warning-text {
  color: red;
  font-size: 0.875rem;
  margin-top: 10px;
}


.warning-text {
  color: red;
  font-size: 12px;
  margin-left: 10px;
}
.match-form {
  background-color: #8f8f8f; /* Легкий фон для формы */
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* Легкая тень */
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  font-size: 1rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 5px;
  display: inline-block;
  margin: 10px auto;
}

select, input[type="datetime-local"], input[type="text"] {
  width: 100%;
  padding: 10px;
  font-size: 1rem;
  border: 2px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box; /* Чтобы padding не выходил за пределы */
  transition: border-color 0.3s ease-in-out;
}

select:focus, input[type="datetime-local"]:focus, input[type="text"]:focus {
  border-color: #6b6b6b;
  outline: none;
  
}


button:active {
  transform: scale(0.95);
}

.match-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 20px;
}

.match-card {
  background: #9c9c9c;
  padding: 20px;
  border-radius: 15px;
  text-align: center;
  width: 100%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}



.warning-text {
  color: red;
  font-size: 0.875rem;
  margin-top: 10px;
}


.match-container {
  position: relative;
}

.edit-button {
  position: absolute;
  top: 0;
  right: 0;
  padding: 5px 10px;
  background-color: #f39c12;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.edit-button:hover {
  background-color: #e67e22;
}

</style>
