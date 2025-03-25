<template>
    <div class="my-matches-container">
      <h1 class="title">Мои матчи</h1>
  
      <!-- Табы "Предстоящие" / "Завершённые" -->
      <div class="tabs">
        <button @click="activeTab = 'upcoming'" :class="{ active: activeTab === 'upcoming' }">
          Предстоящие
        </button>
        <button @click="activeTab = 'completed'" :class="{ active: activeTab === 'completed' }">
          Завершённые
        </button>
      </div>
  
      <!-- Блок с матчами -->
      <div v-if="activeTab === 'upcoming'">
        <h2>Предстоящие матчи</h2>
        <div v-if="upcomingMatches.length > 0" class="match-list">
          <div v-for="match in upcomingMatches" :key="match.id" class="match-card">
            <h3>{{ match.tournamentName }}</h3>
            <p><strong>Матч:</strong> {{ match.team1 }} vs {{ match.team2 }}</p>
            <p><strong>Дата:</strong> {{ match.date }}</p>
            <p><strong>Время:</strong> {{ match.time }}</p>
          </div>
        </div>
        <p v-else class="no-matches">Нет предстоящих матчей.</p>
      </div>
  
      <div v-if="activeTab === 'completed'">
        <h2>Завершённые матчи</h2>
        <div v-if="completedMatches.length > 0" class="match-list">
          <div v-for="match in completedMatches" :key="match.id" class="match-card completed">
            <h3>{{ match.tournamentName }}</h3>
            <p><strong>Матч:</strong> {{ match.team1 }} vs {{ match.team2 }}</p>
            <p><strong>Счёт:</strong> {{ match.score }}</p>
            <p><strong>Дата:</strong> {{ match.date }}</p>
            <p class="winner"><strong>Победитель:</strong> {{ match.winner }}</p>
          </div>
        </div>
        <p v-else class="no-matches">Нет завершённых матчей.</p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "MyMatches",
    data() {
      return {
        activeTab: "upcoming",
        upcomingMatches: [
          { id: 1, tournamentName: "Deadlock Cup", team1: "Team A", team2: "Team B", date: "2025-03-10", time: "18:00" },
          { id: 2, tournamentName: "Valorant Masters", team1: "Team C", team2: "Team D", date: "2025-03-12", time: "20:00" }
        ],
        completedMatches: [
          { id: 3, tournamentName: "Deadlock Open", team1: "Team X", team2: "Team Y", score: "2:1", date: "2025-02-28", winner: "Team X" },
          { id: 4, tournamentName: "Valorant Pro League", team1: "Team Z", team2: "Team W", score: "0:2", date: "2025-02-26", winner: "Team W" }
        ]
      };
    }
  };
  </script>
  
  <style scoped>
  .my-matches-container {
    max-width: 800px;
    margin: 20px auto;
    padding: 20px;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
  }
  
  .title {
    font-size: 24px;
    margin-bottom: 20px;
  }
  
  .tabs {
    display: flex;
    justify-content: center;
    margin-bottom: 15px;
  }
  
  .tabs button {
    padding: 10px 15px;
    border: none;
    cursor: pointer;
    background: #dcdcdc;
    font-size: 16px;
    margin: 0 5px;
    border-radius: 5px;
  }
  
  .tabs .active {
    background: #3498db;
    color: white;
    font-weight: bold;
  }
  
  .match-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .match-card {
    padding: 15px;
    background: #f9f9f9;
    border-radius: 8px;
    text-align: left;
    border-left: 5px solid #3498db;
  }
  
  .completed {
    border-left: 5px solid #27ae60;
  }
  
  .match-card h3 {
    margin: 0;
    font-size: 20px;
  }
  
  .match-card p {
    margin: 5px 0;
  }
  
  .winner {
    font-weight: bold;
    color: #27ae60;
  }
  
  .no-matches {
    margin-top: 20px;
    font-size: 18px;
    color: #7f8c8d;
  }
  </style>
  