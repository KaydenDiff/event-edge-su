<template>
  <div class="match-card">
    <div class="match-header">
      <p class="tournament-name">{{ tournamentName || 'Загрузка...' }}</p>
      <p class="stage-name">Стадия: {{ match.stage_name }}</p>
      <p class="match-date">Дата матча: {{ formatDate(match.match_date) }}</p>
    </div>

    <div class="teams">
      <p :class="winnerClass(1)">
        {{ match.team_1_name || 'Загрузка...' }} 
      </p>
      <p :class="winnerClass(2)">
        {{ match.team_2_name || 'Загрузка...' }} 
      </p>
    </div>

    <div class="result">
      <p v-if="match.result">Результат: {{ match.result }}</p>
      <p v-else>Результат не завершен</p>
    </div>

    <div class="winner-info" v-if="match.winner_team_name">
      <p>Победитель: <strong>{{ winnerName }}🏆</strong></p>
    </div>
    <div class="status">
      <p>Статус: {{ match.status === 'completed' ? 'Завершен' : 'В ожидании' }}</p>
    </div>
    <div class="button-group">
      <BaseButton 
        v-if="match.status === 'pending'" 
        @click="goToMatchResultPage"
        customClass="details-button"
      >
        Завершить матч
      </BaseButton>
      <BaseButton 
        @click="addMatchToBracket"
        customClass="details-button"
        :disabled="isMatchInBracket"
      >
        {{ isMatchInBracket ? 'Матч уже в сетке' : 'Добавить в сетку' }}
      </BaseButton>
    </div>
  </div>
</template>

<script>
  import BaseButton from '@/components/BaseButton.vue';
  import axios from 'axios';
  import { useAuthStore } from '@/stores/auth.js';

export default {
  name: 'MatchCard',
  props: {
    match: Object,
    tournamentName: {
      type: String,
      default: null
    },
    bracketMatches: {
      type: Array,
      default: () => []
    }
  },
  components: {
    BaseButton,
  },
  data() {
    return {
      isMatchInBracket: false,
      isCheckingBracket: false,
      checkError: null,
      retryCount: 0,
      maxRetries: 3,
      retryDelay: 1000, // 1 second initial delay
    };
  },
  computed: {
    winnerName() {
      if (this.match.winner_team_name === this.match.team_1_name) {
        return this.match.team_1_name;
      } else if (this.match.winner_team_name === this.match.team_2_name) {
        return this.match.team_2_name;
      }
      return 'Не определен';
    }
  },
  watch: {
    // Watch for changes in bracketMatches prop
    bracketMatches: {
      immediate: true,
      handler(newBracketMatches) {
        if (newBracketMatches && newBracketMatches.length > 0) {
          this.checkMatchInBracketLocally(newBracketMatches);
        } else {
          this.checkMatchInBracket();
        }
      }
    }
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
    winnerClass(teamNumber) {
      const teamId = teamNumber === 1 ? this.match.team_1_id : this.match.team_2_id;
      return {
        'winner': this.match.winner_team_id === teamId,
      };
    },
    checkMatchInBracketLocally(bracketMatches) {
      this.isMatchInBracket = bracketMatches.some(bracketMatch => 
        bracketMatch.game_match_id === this.match.id
      );
    },
    async checkMatchInBracket() {
      if (this.isCheckingBracket) return;
      
      this.isCheckingBracket = true;
      this.checkError = null;

      try {
        const authStore = useAuthStore();
        const token = authStore.accessToken;

        const response = await axios.get(
          `http://event-edge-su/api/guest/tournaments/${this.match.tournament_id}/basket`,
          {
            headers: { 
              'Authorization': `Bearer ${token}`
            },
            timeout: 5000 // 5 second timeout
          }
        );
        
        this.retryCount = 0; // Reset retry count on success
        this.checkMatchInBracketLocally(response.data || []);
        
      } catch (error) {
        console.error('Ошибка при проверке матча в сетке:', error);
        this.checkError = error;
        
        // Implement retry logic
        if (this.retryCount < this.maxRetries) {
          this.retryCount++;
          const delay = this.retryDelay * Math.pow(2, this.retryCount - 1); // Exponential backoff
          setTimeout(() => {
            this.checkMatchInBracket();
          }, delay);
        } else {
          // After max retries, assume match is not in bracket to allow adding
          this.isMatchInBracket = false;
        }
      } finally {
        this.isCheckingBracket = false;
      }
    },
    async addMatchToBracket() {
      if (this.isMatchInBracket) {
        alert('Этот матч уже добавлен в сетку');
        return;
      }

      try {
        const authStore = useAuthStore();
        const token = authStore.accessToken;

        const matchData = {
          tournament_id: this.match.tournament_id,
          game_match_id: this.match.id,
          status: 'in_progress'
        };

        await axios.post('http://event-edge-su/api/admin/tournaments/add-match', 
          matchData,
          {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            timeout: 5000 // 5 second timeout
          }
        );

        this.isMatchInBracket = true;
        this.$emit('match-added');
        alert('Матч успешно добавлен в сетку');
      } catch (error) {
        if (error.response?.status === 400) {
          this.isMatchInBracket = true;
          alert('Этот матч уже существует в сетке');
        } else {
          console.error('Ошибка при добавлении матча в сетку:', error);
          alert('Ошибка при добавлении матча в сетку. Пожалуйста, попробуйте позже.');
        }
      }
    },
    async saveResults() {
      try {
        console.log("Начинаем сохранение результатов...");

        const authStore = useAuthStore();
        if (!authStore.accessToken) {
          alert("Вы не авторизованы!");
          return;
        }

        // Получаем только реальные матчи с победителями
        const matches = this.stages
          .flatMap(stage => stage.matches)
          .filter(match => {
            // Подробное логирование для отладки
            console.log("Проверка матча:", match);
            
            // Проверяем все необходимые поля
            const isValid = 
              match && 
              match.match_id && 
              match.match_id !== 'null' && 
              match.match_id !== null && 
              match.winner_team_id && 
              match.winner_team_id !== null;

            console.log(`Матч ${match?.match_id} валиден: ${isValid}`);
            return isValid;
          })
          .map(match => ({
            match_id: Number(match.match_id),
            winner_team_id: Number(match.winner_team_id)
          }));

        console.log("Отфильтрованные матчи для отправки:", matches);

        if (matches.length === 0) {
          alert("Нет завершенных матчей с победителями для сохранения.");
          return;
        }

        // Проверяем данные перед отправкой
        const requestData = { matches };
        console.log("Отправляемые данные:", requestData);

        const response = await axios.post(
          "http://event-edge-su/api/admin/basket/update",
          requestData,
          {
            headers: {
              'Authorization': `Bearer ${authStore.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Ответ сервера:", response.data);
        
        await this.createNextStageOnServer();
        await this.fetchBracket();
        
        alert("Результаты успешно сохранены!");
      } catch (error) {
        console.error("Детали ошибки:", {
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers
        });

        if (error.response?.data?.errors) {
          const errorMessages = Object.entries(error.response.data.errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('\n');
          alert(`Ошибки валидации:\n${errorMessages}`);
        } else {
          alert(`Ошибка при сохранении: ${error.response?.data?.message || error.message}`);
        }
      }
    },
    async createNextStageOnServer() {
      // Находим последнюю полностью завершённую стадию
      const lastCompletedStageIndex = this.stages
        .slice()
        .reverse()
        .findIndex(stage =>
          stage.matches.length > 0 &&
          stage.matches.every(match => match.winner_team_id !== null)
        );

      if (lastCompletedStageIndex === -1) {
        console.log("Нет завершенной стадии для создания следующей.");
        return;
      }

      const actualStageIndex = this.stages.length - 1 - lastCompletedStageIndex;
      const currentStage = this.stages[actualStageIndex];

      console.log("Текущая заполненная стадия:", currentStage);

      const winners = currentStage.matches
        .map(m => m.winner_team_id)
        .filter(w => w !== null);

      if (winners.length === 0) {
        console.log("Нет победителей для генерации следующей стадии.");
        return;
      }

      // Формируем матчи следующей стадии
      const nextStageMatches = [];
      for (let i = 0; i < winners.length; i += 2) {
        const match = {
          team_1_id: winners[i],
          team_2_id: winners[i + 1] || null,
          status: 'pending', // Добавляем статус для новых матчей
          match_date: new Date().toISOString() // Добавляем дату матча
        };
        nextStageMatches.push(match);
      }

      const nextStageData = {
        tournament_id: this.selectedTournamentId,
        stage_id: currentStage.stage_id,
        matches: nextStageMatches
      };

      console.log("Данные для следующей стадии:", nextStageData);

      try {
        const authStore = useAuthStore();
        if (!authStore.accessToken) {
          alert("Вы не авторизованы!");
          return;
        }

        const response = await axios.post(
          "http://event-edge-su/api/admin/basket/create-stage",
          nextStageData,
          {
            headers: {
              'Authorization': `Bearer ${authStore.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Новая стадия успешно создана:", response.data);

        await this.addMatchesToBracket(response.data.matches);
        await this.fetchBracket();

      } catch (error) {
        console.error("Ошибка при создании следующей стадии:", error.response?.data || error);
        alert(`Ошибка при создании следующей стадии: ${error.response?.data?.message || error.message}`);
      }
    },
    createBracket(gameMatches) {
      console.log("Входящие матчи:", gameMatches);

      const stagesMap = {};
      const stageIdSet = new Set();

      // Группируем матчи по стадиям
      gameMatches.forEach(match => {
        const stageId = match.stage_id;
        stageIdSet.add(stageId);
        if (!stagesMap[stageId]) {
          stagesMap[stageId] = [];
        }

        // Убедимся, что все ID являются числами
        const matchData = {
          match_id: match.id ? Number(match.id) : null,
          team1: match.team_1_id ? Number(match.team_1_id) : null,
          team2: match.team_2_id ? Number(match.team_2_id) : null,
          winner_team_id: match.winner_team_id ? Number(match.winner_team_id) : null
        };

        stagesMap[stageId].push(matchData);
      });

      const sortedStageIds = [...stageIdSet].sort((a, b) => a - b);
      const stagesArray = sortedStageIds.map(stage_id => ({
        stage_id,
        matches: stagesMap[stage_id]
      }));

      // Для будущих стадий создаем пустые матчи без ID
      const initialStage = stagesArray[0];
      const initialTeamCount = initialStage?.matches.length * 2 || 0;
      const totalStages = Math.ceil(Math.log2(initialTeamCount));

      while (stagesArray.length < totalStages) {
        const prevStage = stagesArray[stagesArray.length - 1];
        const winners = prevStage.matches
          .filter(m => m.winner_team_id)
          .map(m => m.winner_team_id);

        const newMatches = [];
        for (let i = 0; i < Math.ceil(winners.length / 2); i++) {
          newMatches.push({
            match_id: null,
            team1: null,
            team2: null,
            winner_team_id: null
          });
        }

        stagesArray.push({
          stage_id: stagesArray.length + 1,
          matches: newMatches
        });
      }

      console.log("Сформированные стадии:", stagesArray);
      return stagesArray;
    }
  }
};
</script>

<style scoped>
.match-card {
  background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(182, 0, 254, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
  width: calc(33.333% - 20px);
  margin: 10px;
  display: inline-block;
  vertical-align: top;
  box-sizing: border-box;
}

.match-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #630181, #ff6a1f);
}

.match-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
}

.match-header {
  margin-bottom: 15px;
}

.tournament-name {
  font-size: 1.4rem;
  color: #ffffff;
  font-weight: 600;
  margin-bottom: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stage-name, .match-date {
  font-size: 0.9rem;
  color: #EAEAEA;
  margin: 5px 0;
  opacity: 0.8;
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  font-size: 1rem;
  color: #EAEAEA;
  text-align: center;
  padding: 5px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.details-button {
  padding: 8px 15px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 120px;
  text-align: center;
}

.details-button:hover {
  transform: translateY(-2px);
}

.details-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #666;
}

.details-button:disabled:hover {
  transform: none;
  box-shadow: none;
}

@media (max-width: 1200px) {
  .match-card {
    width: calc(50% - 20px);
  }
}

@media (max-width: 768px) {
  .match-card {
    width: calc(100% - 20px);
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .details-button {
    width: 100%;
  }
}
</style>
