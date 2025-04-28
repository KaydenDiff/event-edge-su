<template>
  <div class="tournament-container">
    <h2 class="title">
      Турнирная сетка ({{ bracketType }}) - {{ selectedTournamentName || "Загрузка..." }}
    </h2>

    <h3 class="round-title" :class="{ 'active-stage': stageIndex === currentStageIndex }">
      {{ currentStageName || 'Неизвестная стадия' }}
    </h3>

    <!-- Турнирная сетка -->
    <div v-if="stages.length" class="bracket">
      <div v-for="(stage, stageIndex) in stages" :key="'stage-' + stageIndex" class="round">
        <h3 class="round-title">{{ getStageName(stageIndex) }}</h3>
        <div v-for="(match, matchIndex) in stage.matches" :key="'match-' + matchIndex" class="match-container">
          <div class="match">
            <div class="team" :class="{ winner: match.winner_team === match.team1 }">
              {{ getTeamName(match.team1) }}
            </div>

            <div class="vs">VS</div>

            <div class="team" :class="{ winner: match.winner_team === match.team2 }">
              {{ getTeamName(match.team2) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import axios from "axios";

export default {
  props: {
    tournamentId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      stages: [],
      selectedTournamentName: "",
      bracketType: "Single Elimination",
      stageIndex: null,
      currentStageIndex: 0,
      currentStageName: "",
      selectedTournamentId: null,
      currentStageId: null
    };
  },
  async mounted() {
    if (this.tournamentId) {
      this.selectedTournamentId = this.tournamentId;
      await this.fetchTournamentData();
      await this.fetchBracket();
    }
  },
  methods: {
    async fetchTournamentData() {
      try {
        const response = await axios.get(`http://event-edge-su/api/guest/tournaments/${this.selectedTournamentId}`);
        const tournament = response.data;
        this.selectedTournamentName = tournament.name;
        const currentStage = tournament.stage;

        if (currentStage) {
          this.currentStageId = currentStage.id;
          this.currentStageName = currentStage.name;
          this.currentStageIndex = tournament.currentStageIndex;
        } else {
          console.log("Стадия не найдена для турнира.");
        }

        this.stageIndex = tournament.currentStageIndex;
        
      } catch (error) {
        console.error("Ошибка при загрузке данных турнира", error);
      }
    },
    async fetchBracket() {
      if (!this.selectedTournamentId) return;
      try {
        const response = await axios.get(`http://event-edge-su/api/guest/tournaments/${this.selectedTournamentId}/basket`);
        this.stages = this.createBracket(response.data);
      } catch (error) {
        console.error("Ошибка загрузки сетки:", error);
      }
    },
    createBracket(matches) {
      const stagesMap = {};
      const stageIdSet = new Set();

      matches.forEach(match => {
        const stageId = match.game_match.stage_id;
        stageIdSet.add(stageId);
        if (!stagesMap[stageId]) {
          stagesMap[stageId] = [];
        }

        stagesMap[stageId].push({
          match_id: match.game_match.id,
          team1: match.team_a,
          team2: match.team_b,
          winner_team: match.winner_team,
        });
      });

      const sortedStageIds = [...stageIdSet].sort((a, b) => a - b);
      const stagesArray = sortedStageIds.map(stage_id => ({
        stage_id,
        matches: stagesMap[stage_id],
      }));

      const initialStage = stagesArray[0];
      const initialTeamCount = initialStage?.matches.length * 2 || 0;

      const totalStages = Math.ceil(Math.log2(initialTeamCount));

      while (stagesArray.length < totalStages) {
        const prevStage = stagesArray[stagesArray.length - 1];
        const winners = prevStage.matches.map(m => m.winner_team);

        const newMatches = [];
        for (let i = 0; i < Math.ceil(winners.length / 2); i++) {
          const team1 = winners[i * 2] || null;
          const team2 = winners[i * 2 + 1] || null;

          newMatches.push({
            team1: team1 ?? 'TBE',
            team2: team2 ?? 'TBE',
            winner_team: null,
          });
        }

        stagesArray.push({
          stage_id: stagesArray.length + 1,
          matches: newMatches,
        });
      }

      return stagesArray;
    },
    getTeamName(teamName) {
      return teamName || "TBE";
    },
    getStageName(stageIndex) {
      if (stageIndex === this.currentStageIndex) {
        return this.currentStageName || 'Неизвестная стадия';
      }

      const stageNames = [ "1/8", "1/4", "Полуфинал", "Финал"];
      return stageNames[stageIndex] || `Стадия ${stageIndex}`;
    },
  },
};
</script>

<style scoped>
.tournament-container {
  margin-top: 100px;
  padding: 30px 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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
  background-color: #630181;
  color: black;
}

.add-match-btn {
  background-color: #630181;
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
  margin-bottom: 20px;
}

.team {
  margin: 10px auto;
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
  background-color: #630181 !important;
}

.champion {
  font-size: 2em;
  font-weight: bold;
  color: #ffffff;
}

.bracket {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: nowrap;
  overflow-x: auto;
}

.round {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.round-title {
  color: white;
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 10px;
}
</style>

