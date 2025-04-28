<template>
  <div class="notification-section">
    <h3>Отправка уведомлений</h3>
    
    <!-- Выбор типа уведомления -->
    <div class="notification-type-selector">
      <label>Выберите тип уведомления:</label>
      <select v-model="selectedNotificationType" @change="handleNotificationTypeChange" class="select-field">
        <option value="">Выберите тип</option>
        <option value="tournament-start">Старт турнира</option>
        <option value="match-reschedule">Перенос матча</option>
        <option value="match-result">Результат матча</option>
        <option value="next-stage">Переход на следующий этап</option>
        <option value="team-elimination">Выбывание команды</option>
        <option value="team-registration">Регистрация команды</option>
        <option value="team-registration-accept">Принятие заявки команды</option>
      </select>
    </div>

    <!-- Форма для турнира -->
    <div v-if="showTournamentSelect" class="form-group">
      <label>Выберите турнир:</label>
      <select v-model="selectedTournamentId" class="select-field">
        <option value="">Выберите турнир</option>
        <option v-for="tournament in tournaments" :key="tournament.id" :value="tournament.id">
          {{ tournament.name }}
        </option>
      </select>
    </div>

    <!-- Дополнительные поля в зависимости от типа уведомления -->
    <div v-if="selectedNotificationType" class="additional-fields">
      <!-- Поля для переноса матча -->
      <div v-if="selectedNotificationType === 'match-reschedule'" class="form-group">
        <label>Выберите матч:</label>
        <select v-model="additionalData.match_id" class="select-field">
          <option value="">Выберите матч</option>
          <option v-for="match in matches" :key="match.id" :value="match.id">
            {{ formatMatchOption(match) }}
          </option>
        </select>
        <label>Новое время:</label>
        <input type="time" v-model="additionalData.new_time" class="input-field" />
      </div>

      <!-- Поля для результата матча -->
      <div v-if="selectedNotificationType === 'match-result'" class="form-group">
        <label>Результат:</label>
        <input type="text" v-model="additionalData.result" placeholder="Например: 2:1" class="input-field" />
        <label>Победившая команда:</label>
        <select v-model="additionalData.winner_team_id" class="select-field">
          <option value="">Выберите команду</option>
          <option v-for="team in teamsInMatch" :key="team.id" :value="team.id">
            {{ team.name }}
          </option>
        </select>
      </div>

      <!-- Поля для следующего этапа -->
      <div v-if="selectedNotificationType === 'next-stage'" class="form-group">
        <label>Команда:</label>
        <select v-model="additionalData.team_id" class="select-field">
          <option value="">Выберите команду</option>
          <option v-for="team in teamsInTournament" :key="team.id" :value="team.id">
            {{ team.name }}
          </option>
        </select>
        <label>Этап:</label>
        <select v-model="additionalData.stage_id" class="select-field">
          <option value="">Выберите этап</option>
          <option v-for="stage in stages" :key="stage.id" :value="stage.id">
            {{ stage.name }}
          </option>
        </select>
      </div>

      <!-- Поля для выбывания команды -->
      <div v-if="selectedNotificationType === 'team-elimination'" class="form-group">
        <label>Команда:</label>
        <select v-model="additionalData.team_id" class="select-field">
          <option value="">Выберите команду</option>
          <option v-for="team in teamsInTournament" :key="team.id" :value="team.id">
            {{ team.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Кнопка отправки -->
    <BaseButton 
      @click="sendNotification" 
      :disabled="!isFormValid"
      class="send-button"
    >
      Отправить уведомление
    </BaseButton>

    <!-- Сообщение об успехе/ошибке -->
    <div v-if="message" :class="['message', { 'success': !isError, 'error': isError }]">
      {{ message }}
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import axios from 'axios';
import BaseButton from '@/components/BaseButton.vue';

export default {
  name: 'NotificationSection',
  components: {
    BaseButton
  },
  data() {
    return {
      tournaments: [],
      teams: [],
      stages: [],
      matches: [],
      selectedNotificationType: '',
      selectedTournamentId: '',
      additionalData: {},
      message: '',
      isError: false,
      teamsInTournament: [],
      teamsInMatch: []
    };
  },
  computed: {
    showTournamentSelect() {
      return ['tournament-start', 'next-stage', 'team-elimination', 'team-registration-accept'].includes(this.selectedNotificationType);
    },
    filteredTeams() {
      if (!this.selectedTournamentId) return [];

      const tournament = this.tournaments.find(t => t.id === this.selectedTournamentId);
      if (!tournament || !tournament.teams) return [];

      return tournament.teams.map(team => ({
        id: team.pivot.team_id,
        name: team.name
      }));
    },
    isFormValid() {
      if (!this.selectedNotificationType) return false;
      if (this.showTournamentSelect && !this.selectedTournamentId) return false;
      
      switch (this.selectedNotificationType) {
        case 'match-reschedule':
          return !!this.additionalData.match_id && !!this.additionalData.new_time;
        case 'match-result':
          return !!this.additionalData.result && !!this.additionalData.winner_team_id;
        case 'next-stage':
          return !!this.additionalData.team_id && !!this.additionalData.stage_id;
        case 'team-elimination':
          return !!this.additionalData.team_id;
        default:
          return true;
      }
    }
  },
  methods: {
    async fetchTournaments() {
      try {
        const response = await fetch('http://event-edge-su/api/guest/tournaments');
        this.tournaments = await response.json();
      } catch (error) {
        console.error('Ошибка загрузки турниров:', error);
        this.message = 'Ошибка при загрузке турниров';
        this.isError = true;
      }
    },
    async fetchTeams() {
      try {
        const response = await fetch('http://event-edge-su/api/guest/teams');
        this.teams = await response.json();
      } catch (error) {
        console.error('Ошибка загрузки команд:', error);
      }
    },
    async fetchStages() {
      try {
        const response = await fetch('http://event-edge-su/api/guest/stages');
        this.stages = await response.json();
      } catch (error) {
        console.error('Ошибка загрузки этапов:', error);
      }
    },
    async fetchMatches() {
      try {
        const response = await fetch('http://event-edge-su/api/guest/game-matches');
        const data = await response.json();
        this.matches = data.map(match => {
          const tournament = this.tournaments.find(t => t.id === match.tournament_id);
          return {
            ...match,
            tournament_name: tournament?.name || 'Неизвестный турнир',
            team1_name: match.team_1_name || 'Неизвестная команда',
            team2_name: match.team_2_name || 'Неизвестная команда'
          };
        });
      } catch (error) {
        console.error('Ошибка загрузки матчей:', error);
        this.message = 'Ошибка при загрузке матчей';
        this.isError = true;
      }
    },
    formatMatchOption(match) {
      const matchDate = new Date(match.match_date).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
      return `${match.tournament_name} | ${match.team_1_name} vs ${match.team_2_name} (${matchDate})`;
    },
    async loadTeamsForTournament() {
      if (!this.selectedTournamentId || 
          !['next-stage', 'team-elimination', 'team-registration-accept'].includes(this.selectedNotificationType)) {
        this.teamsInTournament = [];
        return;
      }

      try {
        const response = await fetch(`http://event-edge-su/api/guest/tournaments/${this.selectedTournamentId}/teams`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        this.teamsInTournament = data.teams.map(team => ({
          id: team.id,
          name: team.name,
          captain_id: team.captain_id,
          status: team.status,
          created_at: team.created_at,
          updated_at: team.updated_at
        }));
      } catch (error) {
        console.error('Ошибка при загрузке команд турнира:', error);
        this.message = 'Ошибка при загрузке команд турнира';
        this.isError = true;
      }
    },
    handleNotificationTypeChange() {
      this.additionalData = {};
      this.message = '';
      this.selectedTournamentId = '';
      
      if (this.selectedNotificationType === 'match-reschedule') {
        // Сначала загружаем турниры, затем матчи
        this.fetchTournaments().then(() => {
          this.fetchMatches();
        });
      } else if (['tournament-start', 'next-stage', 'team-elimination', 'team-registration-accept'].includes(this.selectedNotificationType)) {
        this.fetchTournaments();
      }

      if (this.selectedNotificationType === 'next-stage') {
        this.fetchStages();
      }
    },
    async sendNotification() {
      try {
        let endpoint = '';
        let data = {};
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (!user || !user.token) {
          throw new Error('Не найден токен авторизации');
        }

        switch (this.selectedNotificationType) {
          case 'tournament-start':
            endpoint = `/admin/tournament/${this.selectedTournamentId}/notify-start`;
            break;
          case 'match-reschedule':
            endpoint = `/admin/match/${this.additionalData.match_id}/notify-reschedule`;
            data = { new_time: this.additionalData.new_time };
            break;
          case 'match-result':
            endpoint = `/admin/match/${this.selectedTournamentId}/notify-result`;
            data = {
              winner_team_id: this.additionalData.winner_team_id,
              result: this.additionalData.result
            };
            break;
          case 'next-stage':
            endpoint = `/admin/tournament/${this.selectedTournamentId}/notify-next-stage`;
            data = {
              team_id: this.additionalData.team_id,
              stage_id: this.additionalData.stage_id
            };
            break;
          case 'team-elimination':
            endpoint = `/admin/tournament/${this.selectedTournamentId}/notify-team-elimination`;
            data = { team_id: this.additionalData.team_id };
            break;
          case 'team-registration':
            endpoint = '/admin/tournament/notify-registration';
            data = {
              tournament_id: this.selectedTournamentId,
              team_id: this.additionalData.team_id
            };
            break;
          case 'team-registration-accept':
            endpoint = `/admin/tournament/${this.selectedTournamentId}/notify-team-registration-accept`;
            data = { team_id: this.additionalData.team_id };
            break;
        }

        const response = await fetch(`http://event-edge-su/api${endpoint}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          throw new Error('Ошибка при отправке уведомления');
        }

        this.message = 'Уведомление успешно отправлено';
        this.isError = false;
        
        // Очищаем форму после успешной отправки
        this.selectedNotificationType = '';
        this.selectedTournamentId = '';
        this.additionalData = {};
      } catch (error) {
        console.error('Ошибка при отправке уведомления:', error);
        this.message = error.message || 'Ошибка при отправке уведомления';
        this.isError = true;
      }
    }
  },
  watch: {
    selectedTournamentId() {
      if (this.selectedTournamentId && 
          ['next-stage', 'team-elimination', 'team-registration-accept'].includes(this.selectedNotificationType)) {
        this.loadTeamsForTournament();
      }
    }
  },
  mounted() {
    // При монтировании компонента ничего не загружаем
    // Данные будут загружаться при выборе типа уведомления
  }
};
</script>

<style scoped>
.notification-section {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 20px;
}

.select-field, .input-field {
  width: 100%;
  padding: 10px;
  margin-top: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
}

.send-button {
  width: 100%;
  margin-top: 20px;
}

.message {
  margin-top: 20px;
  padding: 10px;
  border-radius: 4px;
}

.success {
  background-color: #4CAF50;
  color: white;
}

.error {
  background-color: #f44336;
  color: white;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #ffffff;
}
</style>
