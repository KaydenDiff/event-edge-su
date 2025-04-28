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
import { ref, computed, watch } from 'vue';
import axios from 'axios';
import BaseButton from '@/components/BaseButton.vue';
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'NotificationSection',
  components: {
    BaseButton
  },
  setup() {
    const authStore = useAuthStore();
    const tournaments = ref([]);
    const teams = ref([]);
    const stages = ref([]);
    const matches = ref([]);
    const selectedNotificationType = ref('');
    const selectedTournamentId = ref('');
    const additionalData = ref({});
    const message = ref('');
    const isError = ref(false);
    const teamsInTournament = ref([]);
    const teamsInMatch = ref([]);
    const showTournamentSelect = computed(() => ['tournament-start', 'next-stage', 'team-elimination', 'team-registration-accept'].includes(selectedNotificationType.value));
    const filteredTeams = computed(() => {
      if (!selectedTournamentId.value) return [];

      const tournament = tournaments.value.find(t => t.id === selectedTournamentId.value);
      if (!tournament || !tournament.teams) return [];

      return tournament.teams.map(team => ({
        id: team.pivot.team_id,
        name: team.name
      }));
    });
    const isFormValid = computed(() => {
      if (!selectedNotificationType.value) return false;
      if (showTournamentSelect.value && !selectedTournamentId.value) return false;
      
      switch (selectedNotificationType.value) {
        case 'match-reschedule':
          return !!additionalData.value.match_id && !!additionalData.value.new_time;
        case 'match-result':
          return !!additionalData.value.result && !!additionalData.value.winner_team_id;
        case 'next-stage':
          return !!additionalData.value.team_id && !!additionalData.value.stage_id;
        case 'team-elimination':
          return !!additionalData.value.team_id;
        default:
          return true;
      }
    });

    const fetchTournaments = async () => {
      try {
        const response = await fetch('http://event-edge-su/api/guest/tournaments');
        tournaments.value = await response.json();
      } catch (error) {
        console.error('Ошибка загрузки турниров:', error);
        message.value = 'Ошибка при загрузке турниров';
        isError.value = true;
      }
    };

    const fetchTeams = async () => {
      try {
        const response = await fetch('http://event-edge-su/api/guest/teams');
        teams.value = await response.json();
      } catch (error) {
        console.error('Ошибка загрузки команд:', error);
      }
    };

    const fetchStages = async () => {
      try {
        const response = await fetch('http://event-edge-su/api/guest/stages');
        stages.value = await response.json();
      } catch (error) {
        console.error('Ошибка загрузки этапов:', error);
      }
    };

    const fetchMatches = async () => {
      try {
        const response = await fetch('http://event-edge-su/api/guest/game-matches');
        const data = await response.json();
        matches.value = data.map(match => {
          const tournament = tournaments.value.find(t => t.id === match.tournament_id);
          return {
            ...match,
            tournament_name: tournament?.name || 'Неизвестный турнир',
            team1_name: match.team_1_name || 'Неизвестная команда',
            team2_name: match.team_2_name || 'Неизвестная команда'
          };
        });
      } catch (error) {
        console.error('Ошибка загрузки матчей:', error);
        message.value = 'Ошибка при загрузке матчей';
        isError.value = true;
      }
    };

    const formatMatchOption = (match) => {
      const matchDate = new Date(match.match_date).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
      return `${match.tournament_name} | ${match.team_1_name} vs ${match.team_2_name} (${matchDate})`;
    };

    const loadTeamsForTournament = async () => {
      if (!selectedTournamentId.value || 
          !['next-stage', 'team-elimination', 'team-registration-accept'].includes(selectedNotificationType.value)) {
        teamsInTournament.value = [];
        return;
      }

      try {
        const response = await fetch(`http://event-edge-su/api/guest/tournaments/${selectedTournamentId.value}/teams`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        teamsInTournament.value = data.teams.map(team => ({
          id: team.id,
          name: team.name,
          captain_id: team.captain_id,
          status: team.status,
          created_at: team.created_at,
          updated_at: team.updated_at
        }));
      } catch (error) {
        console.error('Ошибка при загрузке команд турнира:', error);
        message.value = 'Ошибка при загрузке команд турнира';
        isError.value = true;
      }
    };

    const handleNotificationTypeChange = () => {
      additionalData.value = {};
      message.value = '';
      selectedTournamentId.value = '';
      
      if (selectedNotificationType.value === 'match-reschedule') {
        // Сначала загружаем турниры, затем матчи
        fetchTournaments().then(() => {
          fetchMatches();
        });
      } else if (['tournament-start', 'next-stage', 'team-elimination', 'team-registration-accept'].includes(selectedNotificationType.value)) {
        fetchTournaments();
      }

      if (selectedNotificationType.value === 'next-stage') {
        fetchStages();
      }
    };

    const sendNotification = async () => {
      try {
        let endpoint = '';
        let data = {};
        
        if (!authStore.accessToken) {
          throw new Error('Не найден токен авторизации');
        }

        switch (selectedNotificationType.value) {
          case 'tournament-start':
            endpoint = `/admin/tournament/${selectedTournamentId.value}/notify-start`;
            break;
          case 'match-reschedule':
            endpoint = `/admin/match/${additionalData.value.match_id}/notify-reschedule`;
            data = { new_time: additionalData.value.new_time };
            break;
          case 'match-result':
            endpoint = `/admin/match/${selectedTournamentId.value}/notify-result`;
            data = {
              winner_team_id: additionalData.value.winner_team_id,
              result: additionalData.value.result
            };
            break;
          case 'next-stage':
            endpoint = `/admin/tournament/${selectedTournamentId.value}/notify-next-stage`;
            data = {
              team_id: additionalData.value.team_id,
              stage_id: additionalData.value.stage_id
            };
            break;
          case 'team-elimination':
            endpoint = `/admin/tournament/${selectedTournamentId.value}/notify-team-elimination`;
            data = { team_id: additionalData.value.team_id };
            break;
          case 'team-registration':
            endpoint = '/admin/tournament/notify-registration';
            data = {
              tournament_id: selectedTournamentId.value,
              team_id: additionalData.value.team_id
            };
            break;
          case 'team-registration-accept':
            endpoint = `/admin/tournament/${selectedTournamentId.value}/notify-team-registration-accept`;
            data = { team_id: additionalData.value.team_id };
            break;
        }

        const response = await fetch(`http://event-edge-su/api${endpoint}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authStore.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          throw new Error('Ошибка при отправке уведомления');
        }

        message.value = 'Уведомление успешно отправлено';
        isError.value = false;
        
        // Очищаем форму после успешной отправки
        selectedNotificationType.value = '';
        selectedTournamentId.value = '';
        additionalData.value = {};
      } catch (error) {
        console.error('Ошибка при отправке уведомления:', error);
        message.value = error.message || 'Ошибка при отправке уведомления';
        isError.value = true;
      }
    };

    // Добавляем watch внутри setup
    watch(selectedTournamentId, (newVal) => {
      if (newVal && 
          ['next-stage', 'team-elimination', 'team-registration-accept'].includes(selectedNotificationType.value)) {
        loadTeamsForTournament();
      }
    });

    return {
      tournaments,
      teams,
      stages,
      matches,
      selectedNotificationType,
      selectedTournamentId,
      additionalData,
      message,
      isError,
      teamsInTournament,
      teamsInMatch,
      showTournamentSelect,
      filteredTeams,
      isFormValid,
      fetchTournaments,
      fetchTeams,
      fetchStages,
      fetchMatches,
      formatMatchOption,
      loadTeamsForTournament,
      handleNotificationTypeChange,
      sendNotification
    };
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
