<template>
    <div class="match-result">
      <h2>Завершение матча</h2>
  
      <div>
        <p><strong>Турнир:</strong> {{ tournamentName }}</p>
        <p><strong>Стадия:</strong> {{ stageName }}</p>
        <p><strong>Команды:</strong> {{ team1Name }} vs {{ team2Name }}</p>
        <p><strong>Дата матча:</strong> {{ formatDate(matchDate) }}</p>
      </div>
  
      <div>
        <label for="result">Результат:</label>
        <input type="text" id="result" v-model="result" placeholder="Введите результат" />
  
        <label for="winner">Победитель:</label>
        <select v-model="winnerTeamId">
          <option :value="team1Id">{{ team1Name }}</option>
          <option :value="team2Id">{{ team2Name }}</option>
        </select>
  
        <label for="status">Статус:</label>
        <select v-model="status">
          <option value="pending">В ожидании</option>
          <option value="completed">Завершен</option>
        </select>
  
        <button @click="submitResult">Отправить результат</button>
      </div>
    </div>
  </template>
  
  <script>
  import { useAuthStore } from '@/stores/auth'
  export default {
    name: 'MatchResult',
    props: ['matchId', 'tournamentId', 'team1Id', 'team2Id'],
    data() {
      return {
        tournamentName: '',
        stageName: '',  // Пустое значение по умолчанию, будет обновляться через fetch
        team1Name: '',
        team2Name: '',
        matchDate: '',  // Добавлено свойство для хранения даты матча
        result: '',  // Результат матча
        winnerTeamId: '',  // Победитель матча
        status: 'pending',  // Статус матча
      };
    },
    methods: {
      formatDate(date) {
        if (!date) {
          return 'Дата не доступна'; // Возвращаем дефолтное сообщение, если дата не определена
        }
  
        const parsedDate = new Date(date.replace(' ', 'T')); // Преобразуем строку в объект Date
  
        if (isNaN(parsedDate)) {
          return 'Некорректная дата'; // Если дата невалидна
        }
  
        const options = { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric', 
          hour: 'numeric', 
          minute: 'numeric', 
          second: 'numeric' 
        };
  
        return parsedDate.toLocaleString('ru-RU', options);  // Форматируем дату в нужный формат
      },
      async fetchMatchDetails() {
        try {
          const response = await fetch(`http://event-edge-su/api/guest/game-matches/${this.matchId}`);
          if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
          }
          const data = await response.json();
          
          // Получаем данные о командах, турнире и статусе
          this.team1Name = data.team_1_name;
          this.team2Name = data.team_2_name;
          this.tournamentName = await this.fetchTournamentName(data.tournament_id);
          this.status = data.status;
          
          // Получаем дату матча в формате строки
          this.matchDate = data.match_date;  // Сохраняем в data переменную matchDate
  
          // Получаем название стадии
          const stageResponse = await fetch(`http://event-edge-su/api/guest/stages/${data.stage_id}`);
          if (!stageResponse.ok) {
            throw new Error(`Ошибка при загрузке данных стадии: ${stageResponse.status}`);
          }
          const stageData = await stageResponse.json();
          this.stageName = stageData.name;
  
        } catch (error) {
          console.error('Ошибка при загрузке данных матча:', error);
        }
      },
      async fetchTournamentName(tournamentId) {
        try {
          const response = await fetch(`http://event-edge-su/api/guest/tournaments/${tournamentId}`);
          const data = await response.json();
          return data.name;
        } catch (error) {
          console.error('Ошибка при загрузке данных о турнире:', error);
        }
      },
      async submitResult() {
        const authStore = useAuthStore();
        if (!authStore.accessToken) {
          console.error('Токен не найден');
          return;
        }
  
        const matchResult = {
          result: this.result,
          winner_team_id: this.winnerTeamId,
          status: this.status,
        };
        console.log('winnerTeamId:', this.winnerTeamId, typeof this.winnerTeamId);
  
        try {
          const response = await fetch(`http://event-edge-su/api/admin/game-matches/update/${this.matchId}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authStore.accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(matchResult),
          });
  
          if (!response.ok) {
            throw new Error('Ошибка при обновлении результата матча');
          }
  
          alert('Результат матча успешно обновлен!');
        } catch (error) {
          console.error('Ошибка обновления результата матча:', error);
        }
      },
    },
    mounted() {
      this.fetchMatchDetails();
    },
  };
  </script>
  
  <style scoped>
  .match-result {
    border: 1px solid #000000;
    padding: 20px;
    background-color: #505050;
    border-radius: 8px;
    max-width: 600px;
    margin: 100px auto;
  }
  
  .match-result-header {
    font-weight: bold;
    margin-bottom: 20px;
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
  
  .result-form {
    margin-top: 20px;
  }
  
  .result-title {
    font-size: 1.2rem;
    font-weight: bold;
  }
  
  label {
    display: block;
    margin-top: 10px;
    font-size: 1rem;
    font-weight: bold;
  }
  
  select {
    width: 100%;
    padding: 8px;
    margin-top: 5px;
    font-size: 1rem;
    border: 1px solid #ddd;
    border-radius: 5px;
  }
  
  button {
    margin-top: 20px;
    background-color: #ffffff;
    color: #000;
    padding: 10px 20px;
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
  
  /* Применение эффекта */
  button:hover {
    animation: pulseBorder 1.5s infinite ease-in-out;
    transform: scale(1.05);
    background-color: #000;
    color: #fff;
  }
  
  button:active {
    transform: scale(0.95);
  }
  input[type="text"] {
  width: 100%;
  padding: 10px;
  margin-top: 5px;
  font-size: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 5px;
  background-color: #ffffff;
  color: #000000;
  transition: all 0.3s ease-in-out;
  outline: none;
}

input[type="text"]:focus {
  border-color: rgba(255, 255, 255, 1);
  background-color: #404040;
  color: #fff;
  transform: scale(1.02);
}
  </style>