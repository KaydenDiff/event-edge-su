<template>
    <div class="my-tournaments-container">
      <h1 class="title">Мои турниры</h1>
  
      <div class="actions">
        <button @click="createTournament" class="create-button">+ Создать турнир</button>
      </div>
  
      <div v-if="tournaments.length > 0" class="tournament-list">
        <div v-for="tournament in tournaments" :key="tournament.id" class="tournament-card">
          <h2>{{ tournament.name }}</h2>
          <p><strong>Дата:</strong> {{ tournament.date }}</p>
          <p><strong>Статус:</strong> <span :class="getStatusClass(tournament.status)">{{ tournament.status }}</span></p>
          <div class="buttons">
            <button @click="editTournament(tournament.id)" class="edit-button">Редактировать</button>
            <button @click="deleteTournament(tournament.id)" class="delete-button">Удалить</button>
            <button @click="manageStages(tournament.id)" class="manage-button">Управлять стадиями</button>
          </div>
        </div>
      </div>
  
      <div v-else class="no-tournaments">
        <p>Вы еще не создали ни одного турнира.</p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "MyTournament",
    data() {
      return {
        tournaments: [
          { id: 1, name: "Deadlock Open", date: "2025-03-15", status: "Активный" },
          { id: 2, name: "Valorant Pro Cup", date: "2025-04-02", status: "Завершен" },
          { id: 3, name: "Battle Arena", date: "2025-05-10", status: "Ожидание" }
        ]
      };
    },
    methods: {
      createTournament() {
        alert("Открытие формы создания турнира!");
      },
      editTournament(id) {
        alert(`Редактирование турнира с ID: ${id}`);
      },
      deleteTournament(id) {
        if (confirm("Вы уверены, что хотите удалить турнир?")) {
          this.tournaments = this.tournaments.filter(t => t.id !== id);
        }
      },
      manageStages(id) {
        alert(`Управление стадиями турнира с ID: ${id}`);
      },
      getStatusClass(status) {
        return {
          "Активный": "status-active",
          "Завершен": "status-completed",
          "Ожидание": "status-pending"
        }[status] || "status-default";
      }
    }
  };
  </script>
  
  <style scoped>
  .my-tournaments-container {
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
  
  .actions {
    margin-bottom: 15px;
  }
  
  .create-button {
    background: #2ecc71;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .tournament-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .tournament-card {
    padding: 15px;
    background: #f9f9f9;
    border-radius: 8px;
    text-align: left;
    border-left: 5px solid #3498db;
  }
  
  .tournament-card h2 {
    margin: 0;
    font-size: 20px;
  }
  
  .tournament-card p {
    margin: 5px 0;
  }
  
  .status-active {
    color: #27ae60;
    font-weight: bold;
  }
  
  .status-completed {
    color: #c0392b;
    font-weight: bold;
  }
  
  .status-pending {
    color: #f39c12;
    font-weight: bold;
  }
  
  .buttons {
    margin-top: 10px;
  }
  
  button {
    margin-right: 10px;
    padding: 8px 12px;
    border-radius: 5px;
    cursor: pointer;
    border: none;
  }
  
  .edit-button {
    background: #3498db;
    color: white;
  }
  
  .delete-button {
    background: #e74c3c;
    color: white;
  }
  
  .manage-button {
    background: #9b59b6;
    color: white;
  }
  
  .no-tournaments {
    margin-top: 20px;
    font-size: 18px;
    color: #7f8c8d;
  }
  </style>
  