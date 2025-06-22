<template>
    <div class="match-section">
      <BaseButton customClass="details-btn" @click="toggleMatchForm">
        {{ showCreateMatchForm ? 'Скрыть форму' : 'Создать матч' }}
      </BaseButton>
  
      <div v-if="showCreateMatchForm" class="form-container">
      <MatchForm 
        :isCreate="true" 
        :teams="teams" 
        @submit-success="handleMatchCreated" 
        @cancel="showCreateMatchForm = false"
      />
    </div>
      <div v-if="showEditMatchForm" class="form-container">
        <h3>Редактирование матча</h3>
        <MatchForm 
          :isCreate="false" 
          :matchId="editingMatchId" 
          @submit-success="handleMatchUpdated" 
          @cancel="cancelEditing"
        />
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
              @match-deleted="handleMatchDeleted"
              @edit-match="editMatch"
            />
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import BaseButton from '@/components/BaseButton.vue';
  import MatchCard from '@/components/MatchCard.vue';
  import MatchForm from '@/components/form/MatchForm.vue';
  
  export default {
    name: 'MatchSection',
    components: {
      BaseButton,
      MatchCard,
      MatchForm
    },
    data() {
      return {
        matches: [],
        tournaments: [],
        teams: [],
        stages: [],
        bracketMatchesByTournament: {},
        showCreateMatchForm: false,
        showEditMatchForm: false,
        editingMatchId: null
      };
    },
    methods: {
      async fetchAllData() {
        try {
          await Promise.all([
            this.fetchTournaments(),
            this.fetchStages(),
            this.fetchTeams(),
            this.fetchMatches()
          ]);
          
          await this.fetchBracketDataForAllTournaments();
        } catch (error) {
          console.error('Ошибка при загрузке данных:', error);
        }
      },
      async fetchTeams() {
  try {
    const res = await fetch('http://event-edge-su/api/guest/teams');
    const result = await res.json(); // Предположим, что это объект с сообщением и массивом
    this.teams = result.data; // Извлекаем массив команд из объекта
  } catch (e) {
    console.error('Ошибка загрузки команд:', e);
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
      handleMatchDeleted(matchId) {
        // Remove the deleted match from the matches array
        this.matches = this.matches.filter(match => match.id !== matchId);
      },
      handleMatchCreated() {
        this.showCreateMatchForm = false;
        this.fetchMatches();
      },
      handleMatchUpdated() {
        this.showEditMatchForm = false;
        this.editingMatchId = null;
        this.fetchMatches();
      },
      toggleMatchForm() {
        this.showCreateMatchForm = !this.showCreateMatchForm;
        if (this.showCreateMatchForm) {
          this.showEditMatchForm = false;
        }
      },
      editMatch(matchId) {
        this.editingMatchId = matchId;
        this.showEditMatchForm = true;
        this.showCreateMatchForm = false;
      },
      cancelEditing() {
        this.showEditMatchForm = false;
        this.editingMatchId = null;
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
      }
    },
    mounted() {
      this.fetchAllData();
    }
  };
  </script>
  
  <style scoped>
.match-section {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
}

.details-btn {
  padding: 12px 25px;
  border-radius: 8px;
  transition: all 0.3s ease;
  margin-bottom: 2rem;
  cursor: pointer; 
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.2);
}

.details-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.3);
  background: linear-gradient(135deg, #9461FF, #7C3AED);
}

.form-container {
  margin-bottom: 30px;
}

.form-container h3 {
  margin-bottom: 20px;
  font-size: 1.5rem;
  color: #fff;
  text-align: center;
}

.matches-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 50px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.matches-list > div:first-child {
  width: 100%;
  text-align: center;
  grid-column: 1 / -1;
  color: #E5E7EB;
  font-size: 1.1rem;
  padding: 2rem;
}

.match-card {
  width: 100%;
  margin: 0;
  box-sizing: border-box;
  transition: transform 0.3s ease;
}

.tournament-name {
  font-size: 1.25rem;
  color: #FFFFFF;
  font-weight: 600;
  margin-bottom: 1rem;
}

.stage-name, 
.match-date {
  font-size: 0.9rem;
  color: #A3A3A3;
  margin: 0.25rem 0;
}

.teams {
  margin: 1rem 0;
  padding: 1rem;
  background: rgba(139, 92, 246, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(139, 92, 246, 0.1);
}

.teams p {
  font-size: 1rem;
  margin: 0.5rem 0;
  color: #E5E7EB;
  padding: 0.75rem;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

.teams p:hover {
  background: rgba(139, 92, 246, 0.1);
}

.winner {
  font-weight: 600;
  color: #8B5CF6 !important;
  background: rgba(139, 92, 246, 0.1);
}

.result {
  margin: 1rem 0;
  font-size: 1rem;
  color: #E5E7EB;
}

.winner-info {
  margin: 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #8B5CF6;
  padding: 1rem;
  background: rgba(139, 92, 246, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.status {
  margin: 1rem 0;
  font-size: 0.9rem;
  color: #A3A3A3;
}

.match-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.match-actions button {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
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
  backdrop-filter: blur(8px);
}

.dialog-content {
  background: #2A2A2A;
  padding: 2rem;
  border-radius: 16px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.dialog-content p {
  font-size: 1.1rem;
  color: #E5E7EB;
  margin-bottom: 1.5rem;
  text-align: center;
  line-height: 1.5;
}

.dialog-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.dialog-actions button {
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dialog-actions button:first-child {
  background: #8B5CF6;
  color: white;
  border: none;
}

.dialog-actions button:last-child {
  background: #333333;
  color: white;
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.dialog-actions button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(139, 92, 246, 0.2);
}

@media (max-width: 992px) {
  .matches-list {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
}

@media (max-width: 768px) {
  .match-section {
    padding: 1rem;
  }

  .matches-list {
    grid-template-columns: 1fr;
  }
  
  .match-card {
    width: 100%;
  }

  .form-container {
    padding: 0;
  }
}
  </style>
  