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
  import BaseButton from '@/components/BaseButton.vue';
  import MatchCard from '@/components/MatchCard.vue';
  
  export default {
    name: 'MatchSection',
    components: {
      BaseButton,
      MatchCard
    },
    data() {
      return {
        matches: [],
        tournaments: [],
        teams: [],
        stages: [],
        bracketMatchesByTournament: {},
        showCreateMatchForm: false,
        showDeleteDialog: false,
        matchToDelete: null,
        newMatch: {
          tournament_id: '',
          team_1_id: '',
          team_2_id: '',
          match_date: '',
          status: 'pending',
          winner_team_id: '',
          stage_id: ''
        }
      };
    },
    computed: {
      filteredTeams() {
        return this.teams.filter(team => team.status === 'active');
      }
    },
    watch: {
      'newMatch.tournament_id': 'handleTournamentChange'
    },
    methods: {
      async handleTournamentChange(newVal) {
        if (newVal) {
          await this.fetchTeamsForTournament(newVal);
          this.newMatch.team_1_id = '';
          this.newMatch.team_2_id = '';
        } else {
          this.teams = [];
        }
      },
      async fetchTeamsForTournament(tournamentId) {
        try {
          if (!tournamentId) return;
          
          const res = await fetch(`http://event-edge-su/api/guest/tournaments/${tournamentId}/teams`);
          if (!res.ok) throw new Error('Ошибка загрузки команд');
          
          const data = await res.json();
          this.teams = [...this.teams, ...(data.teams || [])];
        } catch (e) {
          console.error('Ошибка загрузки команд:', e);
        }
      },
      async fetchAllData() {
        try {
          await Promise.all([
            this.fetchTournaments(),
            this.fetchStages(),
            this.fetchMatches()
          ]);
          
          await this.fetchBracketDataForAllTournaments();
        } catch (error) {
          console.error('Ошибка при загрузке данных:', error);
        }
      },
      async fetchTournaments() {
        try {
          const res = await fetch('http://event-edge-su/api/guest/tournaments');
          this.tournaments = await res.json();
        } catch (e) {
          console.error('Ошибка загрузки турниров:', e);
        }
      },
      async fetchStages() {
        try {
          const res = await fetch('http://event-edge-su/api/guest/stages');
          this.stages = await res.json();
        } catch (e) {
          console.error('Ошибка загрузки стадий:', e);
        }
      },
      async fetchMatches() {
        try {
          const res = await fetch('http://event-edge-su/api/guest/game-matches');
          this.matches = await res.json();
        } catch (e) {
          console.error('Ошибка загрузки матчей:', e);
        }
      },
      async fetchBracketDataForAllTournaments() {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.token) return;

        const uniqueTournamentIds = [...new Set(this.matches.map(match => match.tournament_id))];
        
        const fetchPromises = uniqueTournamentIds.map(async (tournamentId) => {
          try {
            const response = await fetch(`http://event-edge-su/api/guest/tournaments/${tournamentId}/basket`, {
              headers: {
                'Authorization': `Bearer ${user.token}`
              }
            });
            
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.bracketMatchesByTournament[tournamentId] = data || [];
          } catch (error) {
            console.error(`Ошибка при загрузке сетки для турнира ${tournamentId}:`, error);
            this.bracketMatchesByTournament[tournamentId] = [];
          }
        });

        await Promise.all(fetchPromises);
      },
      handleMatchAdded() {
        // Refresh bracket data for all tournaments after a match is added
        this.fetchBracketDataForAllTournaments();
      },
      async createMatch() {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.token) {
          console.error('Токен не найден');
          return;
        }
  
        try {
          const res = await fetch('http://event-edge-su/api/admin/game-matches/create', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${user.token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.newMatch)
          });
  
          if (!res.ok) throw new Error('Ошибка при создании матча');
  
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
        } catch (e) {
          console.error('Ошибка создания матча:', e);
        }
      },
      getTournamentName(tournamentId) {
        const tournament = this.tournaments.find(t => t.id === tournamentId);
        return tournament ? tournament.name : 'Неизвестный турнир';
      },
      getBracketMatchesForTournament(tournamentId) {
        return this.bracketMatchesByTournament[tournamentId] || [];
      },
      getTeamName(teamId) {
        const team = this.teams.find(t => t.id === teamId);
        return team ? team.name : 'Неизвестная команда';
      },
      showDeleteConfirmation(match) {
        this.matchToDelete = match;
        this.fetchTeamsForTournament(match.tournament_id).then(() => {
          this.showDeleteDialog = true;
        });
      },
      async confirmDelete() {
        if (!this.matchToDelete) return;
  
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.token) return;
  
        try {
          const res = await fetch(`http://event-edge-su/api/admin/game-matches/delete/${this.matchToDelete.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${user.token}`,
              'Content-Type': 'application/json'
            }
          });
  
          if (!res.ok) throw new Error('Ошибка удаления матча');
  
          this.matches = this.matches.filter(match => match.id !== this.matchToDelete.id);
        } catch (e) {
          console.error('Ошибка удаления матча:', e);
        } finally {
          this.showDeleteDialog = false;
          this.matchToDelete = null;
        }
      },
      cancelDelete() {
        this.showDeleteDialog = false;
        this.matchToDelete = null;
      },
      editMatch(id) {
        this.$router.push({ name: 'EditMatch', params: { id } });
      }
    },
    mounted() {
      this.fetchAllData();
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
  