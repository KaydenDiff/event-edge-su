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
    <button v-if="hasWinners" @click="saveResults" class="add-match-btn">Сохранить результат</button>
    <h3 class="round-title" :class="{ 'active-stage': stageIndex === currentStageIndex }">
  {{ currentStageName || 'Неизвестная стадия' }}
</h3>

    <!-- Турнирная сетка -->
    <div v-if="stages.length" class="bracket">
      <div v-for="(stage, stageIndex) in stages" :key="'stage-' + stageIndex" class="round">
        <h3 class="round-title">{{ getStageName(stageIndex) }}</h3>
        <div v-for="(match, matchIndex) in stage.matches" :key="'match-' + matchIndex" class="match-container">
          <div class="match">
            <div
              class="team"
              :class="{ winner: match.winner_team_id === match.team1 }"
              @click="selectWinner(stageIndex, matchIndex, match.team1)"
            >
              {{ getTeamName(match.team1) }}
            </div>

            <div class="vs">VS</div>

            <div
              class="team"
              :class="{ winner: match.winner_team_id === match.team2 }"
              @click="selectWinner(stageIndex, matchIndex, match.team2)"
            >
              {{ getTeamName(match.team2) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Кнопка сохранения -->
  
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      teams: [],
      stages: [],
      tournaments: [],
      stageIndex: null,
      currentStageIndex: 0,
      selectedTournamentId: null,
      selectedTournamentName: "",
      bracketType: "Single Elimination",
      searchQuery: "",
      showSuggestions: false,
      currentStageName: "",  
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
      return this.stages.some(stage => stage.matches.some(match => match.winner_team_id !== null));
    },
  },
  methods: {

    async fetchTournamentData() {
  try {
    const response = await axios.get(`http://event-edge-su/api/guest/tournaments/${this.selectedTournamentId}`);
    
    // Получаем текущую стадию турнира из ответа
    const tournament = response.data;
    const currentStage = tournament.stage;  // Получаем объект стадии
    
    if (currentStage) {
      // Если стадия существует, сохраняем её данные
      this.currentStageId = currentStage.id;
      this.currentStageName = currentStage.name;  // Сохраняем название стадии
      this.currentStageIndex = tournament.currentStageIndex;  // Индекс текущей стадии
    } else {
      console.log("Стадия не найдена для турнира.");
    }
    
    // Также сохраняем текущий индекс стадии
    this.stageIndex = tournament.currentStageIndex;
    
  } catch (error) {
    console.error("Ошибка при загрузке данных турнира", error);
  }
},
async saveResults() {
  try {
    console.log("Начинаем сохранение результатов...");

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.token) {
      alert("Вы не авторизованы!");
      return;
    }

    await this.fetchTournamentData();

    const matches = this.stages.flatMap((stage) =>
      stage.matches
        .filter((match) => match.winner_team_id !== null)
        .map((match) => ({
          match_id: Number(match.match_id),
          winner_team_id: Number(match.winner_team_id),
        }))
    );

    if (matches.length === 0) {
      alert("Нет завершенных матчей с победителями.");
      return;
    }

    await axios.post("http://event-edge-su/api/admin/basket/update", {
  matches: matches,  // Используем уже сформированный массив `matches`
}, {
  headers: {
    Authorization: `Bearer ${user.token}`,
    "Content-Type": "application/json",
  },
});

    console.log("Результаты сохранены, создаём следующую стадию...");

    await this.createNextStageOnServer();

    // Теперь обновляем турнирную сетку!
    await this.fetchBracket();
    console.log("Сетка обновлена.");

    alert("Результаты успешно сохранены!");
  } catch (error) {
    console.error("Ошибка при сохранении:", error);
    alert("Ошибка при сохранении! Проверьте консоль.");
  }
},

async createNextStageOnServer() {
  // Найдем первую завершенную стадию, чтобы взять победителей
  const lastCompletedStageIndex = this.stages.findIndex(stage =>
    stage.matches.every(match => match.winner_team_id !== null)
  );

  if (lastCompletedStageIndex === -1) {
    console.log("Нет завершенной стадии для создания следующей.");
    return;
  }
  console.log('currentStageName:', this.currentStageName);
  console.log('Stages:', this.stages);
  const stageMapping = {
  'Group Stage': 1,
  'Quarterfinals': 2,
  'Semifinals': 3,
  'Finals': 4
};
const currentStageId = stageMapping[this.currentStageName];

const currentStage = this.stages.find(stage => stage.stage_id === currentStageId);
  console.log("Текущая заполненная стадия:", currentStage);

  // Получим победителей из текущей стадии
  const winners = currentStage.matches
    .map(match => match.winner_team_id)
    .filter(winner => winner !== null);

  console.log("Победители", winners); // Для дебага

  if (winners.length < 2) {
    console.log("Недостаточно победителей для следующей стадии.");
    return;
  }

  // Создадим новые матчи для следующей стадии (1/8)
  const nextStageMatches = [];
for (let i = 0; i < winners.length; i += 2) {
  if (i + 1 < winners.length) {
    // Составляем матч с двумя победителями
    const match = {
      team_1_id: winners[i],
      team_2_id: winners[i + 1],
    };

    // Если победитель уже есть, добавляем его в матч
    if (match.winner_team_id !== null) {
      match.winner_team_id = null;  // Можно оставить как null или уберите это поле
    }

    nextStageMatches.push(match);
  } else {
    // Если нечётное количество победителей, матч с одним участником
    const match = {
      team_1_id: winners[i],
      team_2_id: null, // Второй команды нет
    };

    // Победитель будет выбран позже, и мы не указываем его сейчас
    nextStageMatches.push(match);
  }
}

console.log("Отправляемые матчей для следующей стадии:", nextStageMatches);

// Подготовим данные для создания новой стадии
const nextStageData = {
  tournament_id: this.selectedTournamentId,
  stage_id: currentStage.stage_id, // Указываем id текущей стадии
  matches: nextStageMatches.map(match => {
    // Если есть победитель, добавляем его, если нет, не передаем
    const matchData = {
      team_1_id: match.team_1_id,
      team_2_id: match.team_2_id,
    };
    if (match.winner_team_id !== null) {
      matchData.winner_team_id = match.winner_team_id;
    }
    return matchData;
  }),
};

console.log("Отправка данных для следующей стадии:", nextStageData);

// Отправим на сервер запрос для создания новой стадии
try {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || !user.token) {
    alert("Вы не авторизованы!");
    return;
  }

  const response = await axios.post(
    "http://event-edge-su/api/admin/basket/create-stage",
    nextStageData,
    {
      headers: {
        Authorization: `Bearer ${user.token}`,
        "Content-Type": "application/json",
      },
    }
  );

  console.log("Новая стадия успешно создана:", response.data);

  await this.addMatchesToBracket(response.data.matches);
  // Обновляем сетку турнира
  await this.fetchBracket();
  console.log("Обновленные данные турнира:", this.stages);
} catch (error) {
  console.error("Ошибка при создании следующей стадии:", error);
}
},
    async fetchTournaments() {
      try {
        const response = await axios.get("http://event-edge-su/api/guest/tournaments");
        this.tournaments = response.data;
      } catch (error) {
        console.error("Ошибка загрузки турниров:", error);
      }
    },
    async addMatchesToBracket(nextStageMatches) {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.token) {
      alert("Вы не авторизованы!");
      return;
    }
  
    for (const match of nextStageMatches) {
      const addMatchResponse = await axios.post(
        "http://event-edge-su/api/admin/tournaments/add-match",
        {
          tournament_id: this.selectedTournamentId,
          game_match_id: match.game_match_id, // ID матча
          winner_team_id: match.winner_team_id || null, // Победитель (если есть)
          status: "in_progress",
        },
        
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        }
      );
     
      console.log("Матч добавлен в турнирную сетку:", addMatchResponse.data);
    }

    console.log("Все матчи следующей стадии успешно добавлены!");
    await this.fetchTournamentData();
  } catch (error) {
    console.error("Ошибка при добавлении матчей в сетку:", error.response?.data || error);
  }
},
    async fetchBracket() {
  if (!this.selectedTournamentId) return;
  try {
    await this.fetchTeams();
    const response = await axios.get(`http://event-edge-su/api/guest/tournaments/${this.selectedTournamentId}/basket`);
    console.log("Данные от API:", response.data);

    // Обновляем `stages` сразу после получения данных!
    this.stages = this.createBracket(response.data.map(item => item.game_match));

    console.log("Обновлённые стадии:", this.stages);
  } catch (error) {
    console.error("Ошибка загрузки сетки:", error);
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

    createBracket(gameMatches) {
      let stagesMap = {};

      gameMatches.forEach(match => {
        if (!stagesMap[match.stage_id]) {
          stagesMap[match.stage_id] = [];
        }
        stagesMap[match.stage_id].push({
          match_id: match.id,
          team1: match.team_1_id,
          team2: match.team_2_id,
          winner_team_id: match.winner_team_id,
        });
      });

      let stagesArray = Object.entries(stagesMap)
        .sort(([a], [b]) => a - b)
        .map(([stage_id, matches]) => ({
          stage_id: Number(stage_id),
          matches,
        }));

      const requiredStages = 4;
      while (stagesArray.length < requiredStages) {
        const previousStage = stagesArray[stagesArray.length - 1] || { matches: [] };
        const newMatches = [];

        for (let i = 0; i < Math.ceil(previousStage.matches.length / 2); i++) {
          newMatches.push({
            match_id: `tbe-${stagesArray.length}-${i}`,
            team1: null,
            team2: null,
            winner_team_id: null,
          });
        }

        stagesArray.push({
          stage_id: stagesArray.length + 1,
          matches: newMatches,
        });
      }

      return stagesArray;
    },

    getTeamName(teamId) {
      const team = this.teams.find(t => t.id === teamId);
      return team ? team.name : "TBE";
    },

    

selectWinner(stageIndex, matchIndex, teamId) {
  const match = this.stages[stageIndex].matches[matchIndex];

  // Проверяем, что для этого матча еще не выбран победитель
  if (match.winner_team_id !== null) {
    return; // Если победитель уже выбран, не позволяем выбрать другого
  }

  match.winner_team_id = teamId;

  // Если есть следующая стадия, пытаемся обновить её матчи
  const nextStage = this.stages[stageIndex + 1];
  if (nextStage) {
    const emptyMatch = nextStage.matches.find(m => !m.team1 || !m.team2);
    if (emptyMatch) {
      if (!emptyMatch.team1) {
        emptyMatch.team1 = teamId;
      } else {
        emptyMatch.team2 = teamId;
      }
    }
  }

  console.log("Обновлённые стадии:", this.stages);
},

    selectTournament(tournament) {
      this.selectedTournamentId = tournament.id;
      this.selectedTournamentName = tournament.name;
      this.fetchBracket();
      this.fetchTournamentData(); 
      this.showSuggestions = false;
    },

    hideSuggestions() {
      setTimeout(() => {
        this.showSuggestions = false;
      }, 200);
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
    background-color: #000000;
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
    background-color: #f5c116 !important;
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
  