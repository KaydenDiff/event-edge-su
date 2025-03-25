<template>
  <div class="tournament-container">
    <h2 class="title">Турнирная сетка (Single Elimination)</h2>
    
    <!-- Проверка наличия матчей -->
    <div v-if="!rounds.length" class="no-matches-message">
      <p>Нет матчей еще для этого турнира.</p>
    </div>

    <!-- Если матчи есть, показываем сетку -->
    <div v-else class="bracket">
      <div 
        v-for="(round, roundIndex) in rounds" 
        :key="'round-' + roundIndex" 
        class="round"
      >
        <div 
          v-for="(match, matchIndex) in round" 
          :key="'match-' + matchIndex" 
          class="match-container"
        >
          <div class="match">
            <div 
              class="team" 
              :class="{ winner: match.winner === match.team1 }" 
              @click="selectWinner(roundIndex, matchIndex, match.team1)" 
              :disabled="!!match.winner"
            >
              {{ getTeamName(match.team1) }}
            </div>
            <div 
              class="team" 
              :class="{ winner: match.winner === match.team2 }" 
              @click="selectWinner(roundIndex, matchIndex, match.team2)" 
              :disabled="!!match.winner"
            >
              {{ getTeamName(match.team2) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Отображение чемпиона -->
    <div v-if="rounds.length > 0 && rounds[rounds.length - 1][0]?.winner" class="champion-container">
      <h3 class="champion-title">Чемпион</h3>
      <div class="champion">
        {{ getTeamName(rounds[rounds.length - 1][0].winner) }}
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import axios from 'axios';

export default defineComponent({
  name: "TournamentBracket",
  props: {
    tournamentId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      teams: [], // Список команд с их названиями и ID
      rounds: [], // Сетка турнира
      champion: null
    };
  },
  async mounted() {
    try {
      await this.fetchTeams(); // Загружаем команды с сервера
      await this.fetchParticipants(); // Загружаем данные для турнира
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
    }
  },
  methods: {
    async fetchTeams() {
      try {
        const response = await axios.get('http://event-edge-su/api/guest/teams');
        if (Array.isArray(response.data)) {
          this.teams = response.data;
        } else {
          console.error("Ответ от сервера не является массивом.");
        }
      } catch (error) {
        console.error('Ошибка загрузки команд:', error);
      }
    },

    async fetchParticipants() {
      try {
        const response = await axios.get(`http://event-edge-su/api/guest/tournaments/${this.tournamentId}/basket`);
        
        if (Array.isArray(response.data)) {
          const gameMatches = response.data.map(item => item.game_match);

          if (gameMatches.length > 0) {
            this.rounds = this.generateBracketFromMatches(gameMatches);
          } else {
            console.log("Нет матчей для турнира.");
            this.rounds = []; // Устанавливаем пустую сетку, чтобы отобразить сообщение
          }
        } else {
          console.error("Ответ от сервера не является массивом.");
        }
      } catch (error) {
        console.error('Ошибка загрузки участников:', error);
      }
    },

    generateBracketFromMatches(gameMatches) {
      let rounds = [];
      let currentRound = [];
      gameMatches.forEach((match, index) => {
        if (index % 2 === 0 && currentRound.length > 0) {
          rounds.push(currentRound);
          currentRound = []; // Новый раунд
        }
        currentRound.push({
          team1: match.team_1_id, 
          team2: match.team_2_id, 
          winner: match.winner_team_id || null
        });
      });
      if (currentRound.length > 0) {
        rounds.push(currentRound); // Добавляем последний раунд
      }
      return rounds;
    },

    // Получаем название команды по ID
    getTeamName(teamId) {
      const team = this.teams.find(t => t.id === teamId);
      return team ? team.name : `Команда ${teamId}`;
    },

    selectWinner(roundIndex, matchIndex, team) {
      const selectedMatch = this.rounds[roundIndex][matchIndex];
      if (selectedMatch.winner || !selectedMatch.team1 || !selectedMatch.team2) {
        return; // Если уже есть победитель, или матч неполный, не даём изменить результат
      }

      selectedMatch.winner = team;
      this.updateBracket(roundIndex, matchIndex);
    },

    updateBracket(roundIndex, matchIndex) {
      const selectedMatch = this.rounds[roundIndex][matchIndex];

      if (roundIndex < this.rounds.length - 1) {
        let nextRoundIndex = roundIndex + 1;
        let nextRound = this.rounds[nextRoundIndex];
        const nextMatchIndex = Math.floor(matchIndex / 2);
        
        if (!nextRound[nextMatchIndex]) {
          nextRound[nextMatchIndex] = { team1: null, team2: null, winner: null };
        }

        if (matchIndex % 2 === 0) {
          nextRound[nextMatchIndex].team1 = selectedMatch.winner;
        } else {
          nextRound[nextMatchIndex].team2 = selectedMatch.winner;
        }
      } else if (roundIndex === this.rounds.length - 1 && selectedMatch.winner) {
        this.champion = selectedMatch.winner;
      }
    }
  }
});
</script>

<style scoped>
.tournament-container {
  margin-top: 100px;
  padding: 30px 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #000000; /* Серый фон */
}

.title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #ffffff; /* Темно-золотой */
  text-align: center;
  margin-bottom: 40px;
}

.no-matches-message {
  text-align: center;
  font-size: 1.5rem;
  color: #e74c3c;
  font-weight: bold;
}

.bracket {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 40px;
  flex: 1;
}

.round {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.match {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.team {
  padding: 10px 15px;
  background-color: #6d6d6d;
  color: white;
  font-weight: bold;
  border-radius: 8px;
  min-width: 150px;
  text-align: center;
  cursor: pointer;
  transition: background 0.3s;
}

.team:hover {
  background-color: #5F665E;
}

.winner {
  background-color: #f5c116 !important;
}

.match-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  min-height: 70px;
}

.champion-title {
  font-size: 1.5em;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 10px;
}

.champion {
  font-size: 2em;
  font-weight: bold;
  color: #ffffff;
  padding: 10px;
  border-radius: 8px;
  background-color: #6e6e6e;
}
</style>
