<template>
    <div class="match-section">
      <BaseButton customClass="details-btn" @click="showCreateMatchForm = !showCreateMatchForm">
        {{ showCreateMatchForm ? 'Скрыть форму' : 'Создать матч' }}
      </BaseButton>
  
      <div v-if="showCreateMatchForm" class="create-match-form">
        <label>Турнир:</label>
        <select v-model="newMatch.tournament_id">
          <option disabled value="">Выберите турнир</option>
          <option v-for="t in tournaments" :key="t.id" :value="t.id">{{ t.name }}</option>
        </select>
  
        <label>Команда 1:</label>
        <select v-model="newMatch.team_1_id">
          <option disabled value="">Выберите команду</option>
          <option v-for="team in filteredTeams" :key="team.id" :value="team.id">{{ team.name }}</option>
        </select>
  
        <label>Команда 2:</label>
        <select v-model="newMatch.team_2_id">
          <option disabled value="">Выберите команду</option>
          <option v-for="team in filteredTeams" :key="team.id" :value="team.id">{{ team.name }}</option>
        </select>
  
        <label>Дата матча:</label>
        <input type="datetime-local" v-model="newMatch.match_date" />
  
        <label>Стадия:</label>
        <select v-model="newMatch.stage_id">
          <option disabled value="">Выберите стадию</option>
          <option v-for="stage in stages" :key="stage.id" :value="stage.id">{{ stage.name }}</option>
        </select>
  
        <BaseButton @click="createMatch">Создать матч</BaseButton>
      </div>
  
      <div class="matches-list">
        <div v-if="!matches || matches.length === 0">Нет матчей</div>
        <div v-else>
          <div v-for="match in matches" :key="match.id" class="match-card">
            <MatchCard 
              :match="match" 
              :tournamentName="getTournamentName(match.tournament_id)"
              :bracketMatches="getBracketMatchesForTournament(match.tournament_id)"
              @match-added="handleMatchAdded"
            />
            <div class="match-actions">
              <BaseButton customClass="details-btn" @click="editMatch(match.id)">Редактировать</BaseButton>
              <BaseButton customClass="details-btn" @click="showDeleteConfirmation(match)">Удалить</BaseButton>
            </div>
          </div>
          </div>
        </div>
    </div>
  
    <!-- Диалоговое окно подтверждения удаления -->
    <div v-if="showDeleteDialog" class="confirmation-dialog">
      <div class="dialog-content">
        <p>Вы точно хотите удалить матч между "{{ getTeamName(matchToDelete?.team_1_id) }}" и "{{ getTeamName(matchToDelete?.team_2_id) }}"?</p>
        <div class="dialog-actions">
          <BaseButton customClass="details-btn" @click="confirmDelete">Да</BaseButton>
          <BaseButton customClass="details-btn" @click="cancelDelete">Нет</BaseButton>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted } from 'vue';
  import BaseButton from '@/components/BaseButton.vue';
  import MatchCard from '@/components/MatchCard.vue';
  import { useAuthStore } from '@/stores/auth'
  import router from '@/router';
  export default {
    name: 'MatchSection',
    components: {
      BaseButton,
      MatchCard
    },
    setup() {
      const authStore = useAuthStore();
      const matches = ref([]);
      const tournaments = ref([]);
      const teams = ref([]);
      const stages = ref([]);
      const bracketMatchesByTournament = ref({});
      const showCreateMatchForm = ref(false);
      const showDeleteDialog = ref(false);
      const matchToDelete = ref(null);
      const loading = ref(false);
      const error = ref(null);
      const newMatch = ref({
        tournament_id: '',
        team_1_id: '',
        team_2_id: '',
        match_date: '',
        status: 'pending',
        winner_team_id: '',
        stage_id: ''
      });

      const filteredTeams = computed(() => teams.value.filter(team => team.status === 'active'));

      const handleTournamentChange = async (newVal) => {
        if (newVal) {
          await fetchTeamsForTournament(newVal);
          newMatch.value.team_1_id = '';
          newMatch.value.team_2_id = '';
        } else {
          teams.value = [];
        }
      };

      const fetchTeamsForTournament = async (tournamentId) => {
        try {
          if (!tournamentId) return;
          
          const res = await fetch(`http://event-edge-su/api/guest/tournaments/${tournamentId}/teams`);
          if (!res.ok) throw new Error('Ошибка загрузки команд');
          
          const data = await res.json();
          teams.value = [...teams.value, ...(data.teams || [])];
        } catch (e) {
          console.error('Ошибка загрузки команд:', e);
        }
      };

      const fetchAllData = async () => {
        try {
          await Promise.all([
            fetchTournaments(),
            fetchStages(),
            fetchMatches()
          ]);
          
          await fetchBracketDataForAllTournaments();
        } catch (error) {
          console.error('Ошибка при загрузке данных:', error);
        }
      };

      const fetchTournaments = async () => {
        try {
          const res = await fetch('http://event-edge-su/api/guest/tournaments');
          tournaments.value = await res.json();
        } catch (e) {
          console.error('Ошибка загрузки турниров:', e);
        }
      };

      const fetchStages = async () => {
        try {
          const res = await fetch('http://event-edge-su/api/guest/stages');
          stages.value = await res.json();
        } catch (e) {
          console.error('Ошибка загрузки стадий:', e);
        }
      };

      const fetchMatches = async () => {
        try {
          loading.value = true;
          const response = await fetch('http://event-edge-su/api/guest/game-matches', {
            headers: { Authorization: `Bearer ${authStore.accessToken}` }
          });
          matches.value = await response.json();
        } catch (err) {
          error.value = 'Ошибка загрузки матчей';
          console.error('Ошибка загрузки:', err);
        } finally {
          loading.value = false;
        }
      };

      const fetchBracketDataForAllTournaments = async () => {
        const uniqueTournamentIds = [...new Set(matches.value.map(match => match.tournament_id))];
        
        const fetchPromises = uniqueTournamentIds.map(async (tournamentId) => {
          try {
            const response = await fetch(`http://event-edge-su/api/guest/tournaments/${tournamentId}/basket`, {
              headers: { Authorization: `Bearer ${authStore.accessToken}` }
            });
            
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            bracketMatchesByTournament.value[tournamentId] = data || [];
          } catch (error) {
            console.error(`Ошибка при загрузке сетки для турнира ${tournamentId}:`, error);
            bracketMatchesByTournament.value[tournamentId] = [];
          }
        });

        await Promise.all(fetchPromises);
      };

      const handleMatchAdded = () => {
        fetchBracketDataForAllTournaments();
      };

      const createMatch = async () => {
        try {
          error.value = null;
          
          if (!authStore.accessToken) {
            error.value = 'Не авторизован';
            return;
          }

          const res = await fetch('http://event-edge-su/api/admin/game-matches/create', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${authStore.accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(newMatch.value)
          });
  
          if (!res.ok) throw new Error('Ошибка при создании матча');
  
          newMatch.value = {
            tournament_id: '',
            team_1_id: '',
            team_2_id: '',
            match_date: '',
            status: 'pending',
            winner_team_id: '',
            stage_id: ''
          };
          showCreateMatchForm.value = false;
          await fetchMatches();
        } catch (err) {
          error.value = 'Ошибка создания матча';
          console.error('Ошибка создания матча:', err);
        }
      };

      const getTournamentName = (tournamentId) => {
        const tournament = tournaments.value.find(t => t.id === tournamentId);
        return tournament ? tournament.name : 'Неизвестный турнир';
      };

      const getBracketMatchesForTournament = (tournamentId) => {
        return bracketMatchesByTournament.value[tournamentId] || [];
      };

      const getTeamName = (teamId) => {
        const team = teams.value.find(t => t.id === teamId);
        return team ? team.name : 'Неизвестная команда';
      };

      const showDeleteConfirmation = (match) => {
        matchToDelete.value = match;
        fetchTeamsForTournament(match.tournament_id).then(() => {
          showDeleteDialog.value = true;
        });
      };

      const confirmDelete = async () => {
        try {
          if (!authStore.accessToken) {
            throw new Error('Не авторизован');
          }

          const matchIdToDelete = matchToDelete.value?.id;
          if (!matchIdToDelete) {
            throw new Error('ID матча не найден');
          }

          await fetch(`http://event-edge-su/api/admin/game-matches/delete/${matchIdToDelete}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${authStore.accessToken}` }
          });

          matches.value = matches.value.filter(match => match.id !== matchIdToDelete);
        } catch (error) {
          error.value = 'Ошибка удаления матча';
          console.error('Ошибка удаления матча:', error);
        } finally {
          showDeleteDialog.value = false;
          matchToDelete.value = null;
        }
      };

      const cancelDelete = () => {
        showDeleteDialog.value = false;
        matchToDelete.value = null;
      };

      const editMatch = (id) => {
        router.push({ name: 'EditMatch', params: { id } });
      };

      // Добавляем onMounted хук
      onMounted(() => {
        fetchAllData();
      });

      return {
        matches,
        tournaments,
        teams,
        stages,
        bracketMatchesByTournament,
        showCreateMatchForm,
        showDeleteDialog,
        matchToDelete,
        newMatch,
        filteredTeams,
        handleTournamentChange,
        fetchTeamsForTournament,
        fetchAllData,
        fetchTournaments,
        fetchStages,
        fetchMatches,
        fetchBracketDataForAllTournaments,
        handleMatchAdded,
        createMatch,
        getTournamentName,
        getBracketMatchesForTournament,
        getTeamName,
        showDeleteConfirmation,
        confirmDelete,
        cancelDelete,
        editMatch,
        error
      };
    }
  };
  </script>
  
  <style scoped>
.match-section {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.details-btn {
  padding: 12px 25px;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.3s ease-in-out;
  margin-bottom: 30px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.details-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);

}

.create-match-form {
  background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(182, 0, 254, 0.1);
}

.create-match-form label {
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
  margin: 10px 0;
  display: block;
}

.create-match-form select,
.create-match-form input {
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(182, 0, 254, 0.1);
  border-radius: 8px;
  color: #ffffff;
  margin-bottom: 15px;
}
 .create-match-form input:focus,
  .create-match-form select:focus {
    outline: none;
  }
    .create-match-form input::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

.create-match-form select option {
  color: #ffffff;
  background-color: #272727 ;
  border: 1px solid rgba(182, 0, 254, 0.1);
}

.create-match-form select option:hover,
.create-match-form select option:checked {
  color: #ffffff ;
  border: 1px solid rgba(182, 0, 254, 0.1);
}

.create-match-form select:focus,
.create-match-form input[type="datetime-local"]:focus {
  outline: none;
  border-color: #630181;
  box-shadow: 0 0 10px rgba(182, 0, 254, 0.2);
  background: rgba(255, 255, 255, 0.05);
}

  
  .create-match-form select:hover {
    background: #3c3c3c;
  }
  
  .create-match-form select option {
    background: #2c2c2c;
    color: white;
    padding: 8px;
  }
  
  .create-match-form select option:hover {
    background: #3c3c3c;
  }
  
.matches-list {
  display: flex;
  flex-wrap: wrap;
  margin: -10px;
  justify-content: flex-start;
}

.matches-list > div:first-child {
  width: 100%;
  margin: 10px;
  text-align: center;
}

.match-card {
  background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(182, 0, 254, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
}

.match-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #630181, #6301817e);
}

.match-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
}

.tournament-name {
  font-size: 1.4rem;
  color: #ffffff;
  font-weight: 600;
  margin-bottom: 15px;
}

.stage-name, .match-date {
  font-size: 1rem;
  color: #EAEAEA;
  margin: 5px 0;
}

.teams {
  margin: 15px 0;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.teams p {
  font-size: 1.1rem;
  margin: 8px 0;
  color: #EAEAEA;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

.teams p:hover {
  background: rgba(182, 0, 254, 0.1);
}

.winner {
  font-weight: bold;
  color: #4CAF50;
  background: rgba(76, 175, 80, 0.1);
}

.result {
  margin: 15px 0;
  font-size: 1.1rem;
  color: #EAEAEA;
}

.winner-info {
  margin: 15px 0;
  font-size: 1.2rem;
  font-weight: bold;
  color: #4CAF50;
  padding: 10px;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 8px;
}

.status {
  margin: 15px 0;
  font-size: 1.1rem;
  font-weight: bold;
  color: #EAEAEA;
}

.match-actions {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.match-actions button {
  flex: 1;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.match-actions button:hover {
  transform: translateY(-2px);
}

.confirmation-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.dialog-content {
  background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
  padding: 30px;
  border-radius: 15px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(182, 0, 254, 0.1);
}

.dialog-content p {
  font-size: 1.2rem;
  color: #ffffff;
  margin-bottom: 25px;
  text-align: center;
}

.dialog-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.dialog-actions button {
  padding: 12px 30px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.dialog-actions button:first-child {
  background: linear-gradient(45deg, #630181, #ff6a1f);
  color: white;
}

.dialog-actions button:last-child {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.dialog-actions button:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

@media (max-width: 1200px) {
  .matches-list {
    justify-content: center;
  }
}

@keyframes pulseBorder {
  0% { border-color: rgba(182, 0, 254, 0.1); }
  50% { border-color: rgba(182, 0, 254, 0.3); }
  100% { border-color: rgba(182, 0, 254, 0.1); }
}
  </style>
  