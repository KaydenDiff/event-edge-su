<template>
  <div class="match-card">
    <div class="match-header">
      <p class="tournament-name">{{ tournamentName }}</p>
      <p class="stage-name">Стадия: {{ match.stage_name }}</p>
      <p class="match-date">Дата матча: {{ formatDate(match.match_date) }}</p>
    </div>
    
    <div class="teams">
      <p :class="{ 'winner': match.winner_team_id === match.team_1_id }">
        {{ match.team_1_name || 'Загрузка...' }} 
        <span v-if="match.winner_team_id === match.team_1_id">🏆</span>
      </p>
      <p :class="{ 'winner': match.winner_team_id === match.team_2_id }">
        {{ match.team_2_name || 'Загрузка...' }} 
        <span v-if="match.winner_team_id === match.team_2_id">🏆</span>
      </p>
    </div>

    <div class="result">
      <p v-if="match.result">Результат: {{ match.result }}</p>
      <p v-else>Результат не завершен</p>
    </div>

    <div class="winner-info" v-if="match.status === 'completed' && match.winner_team_id">
      <p>Победитель: <strong>{{ match.winner_team_id === match.team_1_id ? match.team_1_name : match.team_2_name }}</strong></p>
    </div>

    <div class="status">
      <p>Статус: {{ match.status === 'completed' ? 'Завершен' : 'В ожидании' }}</p>
    </div>

    <button v-if="match.status === 'pending'" @click="goToMatchResultPage">Завершить матч</button>
  </div>
</template>

<script>
export default {
  name: 'MatchCard',
  props: {
    match: Object, // API уже содержит team_1_name и team_2_name!
  },
  async mounted() {
    await this.fetchTournament();
  },
  methods: {
    goToMatchResultPage() {
      this.$router.push({
        name: 'MatchResult',
        params: {
          matchId: this.match.id,
          tournamentId: this.match.tournament_id,
          team1Id: this.match.team_1_id,
          team2Id: this.match.team_2_id,
          matchDate: this.match.match_date,
          stageName: this.match.stage_name,
        }
      });
    },
    formatDate(date) {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
      return new Date(date).toLocaleString('ru-RU', options);
    },
    async fetchTournament() {
      try {
        const response = await fetch(`http://event-edge-su/api/guest/tournaments/${this.match.tournament_id}`);
        const data = await response.json();
        this.tournamentName = data.name;
      } catch (error) {
        console.error('Ошибка загрузки турнира:', error);
      }
    }
  }
};
</script>
<style scoped>
.match-card {
  border: 1px solid #ddd;
  padding: 15px;
  margin-bottom: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.match-header {
  font-weight: bold;
  margin-bottom: 10px;
}

.tournament-name {
  font-size: 1.4rem;
  color: #ffffff;
}

.stage-name, .match-date {
  font-size: 1rem;
  color: #555;
}

.teams {
  margin: 10px 0;
}

.teams p {
  font-size: 1.1rem;
  margin: 5px 0;
}

.winner {
  font-weight: bold;
  color: #28a745; /* Зеленый цвет для победителя */
}

.result {
  margin-top: 10px;
  font-size: 1.1rem;
}

.winner-info {
  margin-top: 10px;
  font-size: 1.2rem;
  font-weight: bold;
  color: #28a745;
}

.status {
  margin-top: 10px;
  font-size: 1.1rem;
  font-weight: bold;
}

button {
  margin: 10px;
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

button:hover {
  animation: pulseBorder 1.5s infinite ease-in-out;
  transform: scale(1.05);
  background-color: #000;
  color: #fff;
}

button:active {
  transform: scale(0.95);
}
</style>
