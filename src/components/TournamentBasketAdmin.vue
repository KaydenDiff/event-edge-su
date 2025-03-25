<template>
    <div class="tournament-container">
      <h2 class="title">
        Турнирная сетка ({{ bracketType }}) - {{ selectedTournamentName || "Выберите турнир" }}
      </h2>
  
      <!-- Выбор турнира -->
      <div class="tournament-selector">
        <h3 class="tournament-label">Выберите турнир:</h3>
        <div class="search-container">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Поиск турнира..."
            class="search-input"
            @focus="showSuggestions = true"
            @blur="hideSuggestions"
          />
          <ul v-if="showSuggestions && filteredTournaments.length" class="suggestions">
            <li v-for="tournament in filteredTournaments" :key="tournament.id" @mousedown="selectTournament(tournament)">
              {{ tournament.name }}
            </li>
          </ul>
        </div>
      </div>
  
      <!-- Турнирная сетка -->
      <div v-if="rounds.length" class="bracket">
        <div v-for="(round, roundIndex) in rounds" :key="'round-' + roundIndex" class="round">
          <div v-for="(match, matchIndex) in round" :key="'match-' + matchIndex" class="match-container">
            <div class="match">
              <!-- Первая команда -->
              <div
                class="team"
                :class="{ winner: match.winner_team_id === match.team1 }"
                @click="selectWinner(roundIndex, matchIndex, match.team1)"
              >
                {{ getTeamName(match.team1) }}
              </div>
  
              <!-- Вторая команда -->
              <div
                class="team"
                :class="{ winner: match.winner_team_id === match.team2 }"
                @click="selectWinner(roundIndex, matchIndex, match.team2)"
              >
                {{ getTeamName(match.team2) }}
              </div>
            </div>
            <div v-if="hasWinners" class="champion">
              <h2>Чемпион: {{ getTeamName(winnerTeamId) }}</h2>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Кнопка сохранения результатов -->
      <button v-if="hasWinners" @click="saveResults" class="save-btn">Сохранить результат</button>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        teams: [],
        rounds: [],
        tournaments: [],
        selectedTournamentId: null,
        selectedTournamentName: "",
        bracketType: "Single Elimination",
        searchQuery: "",
        showSuggestions: false
      };
    },
    async mounted() {
      await this.fetchTournaments();
    },
    computed: {
      filteredTournaments() {
        return this.tournaments.filter(tournament =>
          tournament.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      },
      hasWinners() {
        return this.rounds.some(round => round.some(match => match.winner_team_id !== null));
      },
      winnerTeamId() {
        const lastRound = this.rounds[this.rounds.length - 1];
        const lastMatch = lastRound[lastRound.length - 1];
        return lastMatch.winner_team_id;
      }
    },
    methods: {
      async fetchTournaments() {
        try {
          const response = await axios.get("http://event-edge-su/api/guest/tournaments");
          this.tournaments = response.data;
        } catch (error) {
          console.error("Ошибка загрузки турниров:", error);
        }
      },
  
      async fetchBracket() {
        if (!this.selectedTournamentId) return;
        try {
          await this.fetchTeams();
          const response = await axios.get(`http://event-edge-su/api/guest/tournaments/${this.selectedTournamentId}/basket`);
          const gameMatches = response.data.map(item => item.game_match);
  
          // Логируем все данные матчей
          console.log(gameMatches);
  
          this.rounds = this.generateBracketFromMatches(gameMatches);
        } catch (error) {
          console.error("Ошибка загрузки участников:", error);
        }
      },
  
      async fetchTeams() {
        try {
          const response = await axios.get("http://event-edge-su/api/guest/teams");
          this.teams = response.data;
        } catch (error) {
          console.error("Ошибка загрузки команд:", error);
        }
      },
  
      generateBracketFromMatches(gameMatches) {
        let rounds = [];
        let currentRound = [];
        
        // Генерация матчей для стадии группового этапа
        gameMatches.forEach((match, index) => {
          if (index % 2 === 0 && currentRound.length > 0) {
            rounds.push(currentRound);
            currentRound = [];
          }
          currentRound.push({
            match_id: match.id,
            team1: match.team_1_id,
            team2: match.team_2_id,
            winner_team_id: match.winner_team_id
          });
        });
  
        if (currentRound.length > 0) {
          rounds.push(currentRound);
        }
  
        return rounds;
      },
  
      selectWinner(roundIndex, matchIndex, teamId) {
        this.rounds[roundIndex][matchIndex].winner = teamId;
  
        // Обновляем победителя для следующего раунда
        if (this.rounds[roundIndex + 1]) {
          let nextMatchIndex = Math.floor(matchIndex / 2);
          let nextMatch = this.rounds[roundIndex + 1][nextMatchIndex];
  
          if (matchIndex % 2 === 0) {
            nextMatch.team1 = teamId;
          } else {
            nextMatch.team2 = teamId;
          }
        }
      },
  
      getTeamName(teamId) {
        const team = this.teams.find(t => t.id === teamId);
        return team ? team.name : "TBE"; // TBE - To Be Established
      },
  
      async saveResults() {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.token) {
          console.error('Токен не найден');
          alert('Вы не авторизованы!');
          return;
        }
  
        const matches = this.rounds.flat().map(match => ({
          match_id: match.match_id,
          winner_team_id: match.winner
        }));
  
        try {
          const response = await axios.post("http://event-edge-su/api/admin/basket/update", { matches }, {
            headers: {
              'Authorization': `Bearer ${user.token}`,
              'Content-Type': 'application/json'
            }
          });
          console.log('Response:', response);
          alert("Результаты успешно сохранены!");
          await this.fetchBracket();  // Повторно загружаем турнирную сетку
        } catch (error) {
          console.error("Ошибка сохранения результатов:", error);
          alert("Ошибка при сохранении! Проверьте консоль.");
        }
      },
  
      selectTournament(tournament) {
        this.selectedTournamentId = tournament.id;
        this.selectedTournamentName = tournament.name;
        this.searchQuery = tournament.name;
        this.showSuggestions = false;
        this.fetchBracket();
      },
  
      hideSuggestions() {
        setTimeout(() => {
          this.showSuggestions = false;
        }, 200);
      },
    }
  };
  </script>
  
  
  <style scoped>
  .tournament-container {
    margin-top: 100px;
    padding: 30px 20px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #1b1b1b;
  }
  
  .title {
    font-size: 2.5rem;
    font-weight: bold;
    color: #ffffff;
    text-align: center;
    margin-bottom: 40px;
  }
  
  .tournament-selector {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .search-input {
    width: 80%;
    max-width: 400px;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #ccc;
    margin-bottom: 10px;
  }
  
  .tournament-dropdown {
    width: 80%;
    max-width: 400px;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #ccc;
    background-color: #333;
    color: white;
    font-weight: bold;
  }
  
  .add-match-btn {
    background-color: #f5c116;
    color: black;
    font-weight: bold;
    padding: 10px 15px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    display: block;
    margin: 20px auto;
  }
  
  .bracket {
    display: flex;
    justify-content: center;
    gap: 40px;
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
  }
  
  .winner {
    background-color: #f5c116 !important;
  }
  
  .champion {
    font-size: 2em;
    font-weight: bold;
    color: #ffffff;
  }
  .tournament-container {
  margin-top: 100px;
  padding: 30px 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #1b1b1b;
}

.title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #ffffff;
  text-align: center;
  margin-bottom: 40px;
}

.tournament-selector {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.search-container {
  position: relative;
  width: 80%;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
  background-color: #333;
  color: white;
}

.suggestions {
  position: absolute;
  width: 100%;
  background-color: #444;
  border: 1px solid #ccc;
  border-top: none;
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
}

.suggestions li {
  padding: 10px;
  cursor: pointer;
  color: white;
}

.suggestions li:hover {
  background-color: #f5c116;
  color: black;
}

.add-match-btn {
  background-color: #f5c116;
  color: black;
  font-weight: bold;
  padding: 10px 15px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: block;
  margin: 20px auto;
}
.match-container {
  margin-bottom: 20px; /* Увеличиваем отступ между матчами */
}
.team{
 margin: 10px auto;
}
  </style
  