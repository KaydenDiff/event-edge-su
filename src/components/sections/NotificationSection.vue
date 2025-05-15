<template>
  <div class="notification-section">
    <h2 class="section-title">
      <i class="fas fa-bell"></i> Отправка уведомлений
    </h2>
    
    <div class="notification-card">
      <!-- Выбор типа уведомления -->
      <div class="form-group">
        <label for="notification-type">
          <i class="fas fa-tag"></i> Выберите тип уведомления:
        </label>
        <select 
          id="notification-type"
          v-model="selectedNotificationType" 
          @change="handleNotificationTypeChange" 
          class="select-field"
        >
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
        <label for="tournament-select">
          <i class="fas fa-trophy"></i> Выберите турнир:
        </label>
        <select 
          id="tournament-select"
          v-model="selectedTournamentId" 
          class="select-field"
        >
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
          <label for="match-select">
            <i class="fas fa-gamepad"></i> Выберите матч:
          </label>
          <select 
            id="match-select"
            v-model="additionalData.match_id" 
            class="select-field"
          >
            <option value="">Выберите матч</option>
            <option v-for="match in matches" :key="match.id" :value="match.id">
              {{ formatMatchOption(match) }}
            </option>
          </select>
          
          <label for="new-time">
            <i class="fas fa-clock"></i> Новое время:
          </label>
          <input 
            id="new-time"
            type="time" 
            v-model="additionalData.new_time" 
            class="input-field" 
          />
        </div>

        <!-- Поля для результата матча -->
        <div v-if="selectedNotificationType === 'match-result'" class="form-group">
          <label for="match-result">
            <i class="fas fa-poll"></i> Результат:
          </label>
          <input 
            id="match-result"
            type="text" 
            v-model="additionalData.result" 
            placeholder="Например: 2:1" 
            class="input-field" 
          />
          
          <label for="winner-team">
            <i class="fas fa-medal"></i> Победившая команда:
          </label>
          <select 
            id="winner-team"
            v-model="additionalData.winner_team_id" 
            class="select-field"
          >
            <option value="">Выберите команду</option>
            <option v-for="team in teamsInMatch" :key="team.id" :value="team.id">
              {{ team.name }}
            </option>
          </select>
        </div>

        <!-- Поля для следующего этапа -->
        <div v-if="selectedNotificationType === 'next-stage'" class="form-group">
          <label for="team-select">
            <i class="fas fa-users"></i> Команда:
          </label>
          <select 
            id="team-select"
            v-model="additionalData.team_id" 
            class="select-field"
          >
            <option value="">Выберите команду</option>
            <option v-for="team in teamsInTournament" :key="team.id" :value="team.id">
              {{ team.name }}
            </option>
          </select>
          
          <label for="stage-select">
            <i class="fas fa-layer-group"></i> Этап:
          </label>
          <select 
            id="stage-select"
            v-model="additionalData.stage_id" 
            class="select-field"
          >
            <option value="">Выберите этап</option>
            <option v-for="stage in stages" :key="stage.id" :value="stage.id">
              {{ stage.name }}
            </option>
          </select>
        </div>

        <!-- Поля для выбывания команды -->
        <div v-if="selectedNotificationType === 'team-elimination'" class="form-group">
          <label for="team-eliminate">
            <i class="fas fa-user-slash"></i> Команда:
          </label>
          <select 
            id="team-eliminate"
            v-model="additionalData.team_id" 
            class="select-field"
          >
            <option value="">Выберите команду</option>
            <option v-for="team in teamsInTournament" :key="team.id" :value="team.id">
              {{ team.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Кнопка отправки -->
      <button 
        @click="sendNotification" 
        :disabled="!isFormValid"
        class="send-button"
        :class="{ 'disabled': !isFormValid }"
      >
        <i class="fas fa-paper-plane"></i>
        Отправить уведомление
      </button>
    </div>

    <!-- Сообщение об успехе/ошибке -->
    <div v-if="message" :class="['message-card', { 'success': !isError, 'error': isError }]">
      <i :class="['message-icon', isError ? 'fas fa-exclamation-circle' : 'fas fa-check-circle']"></i>
      <span>{{ message }}</span>
    </div>
  </div>
</template>

<script>
import { ref, computed, inject } from 'vue';
import axios from 'axios';
import BaseButton from '@/components/BaseButton.vue';

export default {
  name: 'NotificationSection',
  components: {
    BaseButton
  },
  setup() {
    // Инжектим сервис уведомлений из плагина
    const notificationsService = inject('notifications');
    return { notificationsService };
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
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.token) {
          this.error = "Необходима авторизация";
          return;
        }
        
        const response = await axios.get('http://event-edge-su/api/guest/tournaments', {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        });
        this.tournaments = response.data;
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
        if (!this.isFormValid) {
          this.message = 'Заполните все необходимые поля';
          this.isError = true;
          return;
        }
        
        // Сбрасываем сообщение перед отправкой
        this.message = '';
        this.isError = false;
        
        let result;

        switch (this.selectedNotificationType) {
          case 'tournament-start':
            // Отправляем уведомление через плагин
            result = await this.notificationsService.sendNotification(
              'tournament-start', 
              this.selectedTournamentId
            );
            break;
          case 'match-reschedule':
            // Отправляем уведомление через плагин
            result = await this.notificationsService.sendNotification(
              'match-reschedule', 
              this.additionalData.match_id, 
              { new_time: this.additionalData.new_time }
            );
            break;
          case 'match-result':
            // Отправляем уведомление через плагин
            result = await this.notificationsService.sendNotification(
              'match-result', 
              this.selectedTournamentId, 
              {
                winner_team_id: this.additionalData.winner_team_id,
                result: this.additionalData.result
              }
            );
            break;
          case 'next-stage':
            // Отправляем уведомление через плагин
            result = await this.notificationsService.sendNotification(
              'next-stage', 
              this.selectedTournamentId, 
              {
                team_id: this.additionalData.team_id,
                stage_id: this.additionalData.stage_id
              }
            );
            break;
          case 'team-elimination':
            // Отправляем уведомление через плагин
            result = await this.notificationsService.sendNotification(
              'team-elimination', 
              this.selectedTournamentId, 
              { team_id: this.additionalData.team_id }
            );
            break;
          case 'team-registration':
            // Отправляем уведомление через плагин
            result = await this.notificationsService.sendNotification(
              'team-registration', 
              null, 
              {
                tournament_id: this.selectedTournamentId,
                team_id: this.additionalData.team_id
              }
            );
            break;
          case 'team-registration-accept':
            // Отправляем уведомление через плагин
            result = await this.notificationsService.sendNotification(
              'team-registration-accept', 
              this.selectedTournamentId, 
              { team_id: this.additionalData.team_id }
            );
            break;
        }

        if (result && result.success) {
          this.message = 'Уведомление успешно отправлено';
          this.isError = false;
          
          // Вызываем событие обновления уведомлений для всех компонентов
          this.notificationsService.refreshNotifications();
          
          // Очищаем форму после успешной отправки
          this.selectedNotificationType = '';
          this.selectedTournamentId = '';
          this.additionalData = {};
        } else {
          this.message = result?.error || 'Ошибка при отправке уведомления';
          this.isError = true;
        }
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
  padding: 30px;
  max-width: 800px;
  margin: 0 auto;
}

.section-title {
  font-size: 2.2rem;
  color: #fff;
  margin-bottom: 30px;
  text-align: center;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.section-title i {
  color: #630181;
}

.notification-card {
  background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  margin-bottom: 30px;
  border: 1px solid rgba(182, 0, 254, 0.1);
  position: relative;
  overflow: hidden;
}

.notification-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #630181, #9500ff);
}

.form-group {
  margin-bottom: 20px;
  position: relative;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-weight: 500;
  color: #ffffff;
  font-size: 1.1rem;
}

.form-group label i {
  color: #630181;
  width: 20px;
  text-align: center;
}

.select-field {
  width: 100%;
  padding: 12px 15px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  background: #3c3c3c;
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-repeat: no-repeat;
  background-position: right 15px center;
}

.select-field:hover {
  background: #444444;
}

.select-field:focus {
  outline: none;
  border-color: #630181;
  box-shadow: 0 0 0 2px rgba(99, 1, 129, 0.3);
}

.select-field option {
  background: #2c2c2c;
  color: white;
  padding: 8px;
}

.select-field option:hover {
  background: #3c3c3c;
}

.select-field option:checked {
  background: #630181;
}

.input-field {
  width: 100%;
  padding: 12px 15px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.input-field:focus {
  outline: none;
  border-color: #630181;
  box-shadow: 0 0 0 2px rgba(99, 1, 129, 0.3);
}

.send-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 15px;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  background: linear-gradient(45deg, #630181, #9500ff);
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 30px;
  box-shadow: 0 4px 15px rgba(99, 1, 129, 0.3);
}

.send-button:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(99, 1, 129, 0.4);
}

.send-button:active:not(.disabled) {
  transform: translateY(1px);
}

.send-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: linear-gradient(45deg, #444, #666);
}

.message-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  border-radius: 10px;
  margin-top: 20px;
  font-size: 1.1rem;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.success {
  background: linear-gradient(145deg, #1c4d1e, #2c7431);
  color: white;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.error {
  background: linear-gradient(145deg, #6b1a1a, #8e2121);
  color: white;
  border: 1px solid rgba(244, 67, 54, 0.3);
}

.message-icon {
  font-size: 1.5rem;
}

.additional-fields {
  border-left: 2px solid #630181;
  padding-left: 20px;
  margin-left: 10px;
  margin-top: 30px;
}

@media (max-width: 768px) {
  .notification-section {
    padding: 20px;
  }
  
  .section-title {
    font-size: 1.8rem;
  }
  
  .notification-card {
    padding: 20px;
  }
  
  .send-button {
    padding: 12px;
    font-size: 1rem;
  }
  
  .message-card {
    flex-direction: column;
    text-align: center;
  }
}
</style>
