<template>
    <div class="tournament-requests">
      <h1>Заявки на участие</h1>
  
      <div v-if="loading" class="status-msg">Загрузка заявок...</div>
      <div v-else-if="error" class="status-msg error">{{ error }}</div>
      <div v-else-if="requests.length === 0" class="status-msg empty">
        Нет заявок на участие в этом турнире
      </div>
      <div v-else class="requests-list">
        <div v-for="request in requests" :key="request.id" class="request-card">
          <div class="team-name">{{ request.team_name || 'Нет названия команды' }}</div>
          <div class="actions">
            <button @click="acceptRequest(request.id)" class="accept-btn">Принять</button>
            <button @click="rejectRequest(request.id)" class="reject-btn">Отклонить</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  
  export default {
    name: 'TournamentRequests',
    setup() {
      const route = useRoute();
      const tournamentId = route.params.id;
      const requests = ref([]);
      const loading = ref(true);
      const error = ref(null);
  
      const fetchRequests = async () => {
        loading.value = true;
        try {
          const user = JSON.parse(localStorage.getItem("user"));
          const res = await axios.get(`http://event-edge-su/api/admin/tournament/${tournamentId}/requests`, {
            headers: {
              Authorization: `Bearer ${user.token}`,
            }
          });
          requests.value = res.data.requests || [];
        } catch (err) {
          error.value = err.response?.data?.error || "Ошибка при загрузке заявок";
        } finally {
          loading.value = false;
        }
      };
  
      const acceptRequest = async (id) => {
        try {
          const user = JSON.parse(localStorage.getItem("user"));
          await axios.post(`http://event-edge-su/api/admin/team-tournament-request/${id}/accept`, {}, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          requests.value = requests.value.filter(r => r.id !== id);
        } catch {
          alert("Не удалось принять заявку.");
        }
      };
  
      const rejectRequest = async (id) => {
        try {
          const user = JSON.parse(localStorage.getItem("user"));
          await axios.post(`http://event-edge-su/api/admin/team-tournament-request/${id}/reject`, {}, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          requests.value = requests.value.filter(r => r.id !== id);
        } catch {
          alert("Не удалось отклонить заявку.");
        }
      };
  
      onMounted(fetchRequests);
  
      return {
        requests,
        loading,
        error,
        acceptRequest,
        rejectRequest
      };
    }
  };
  </script>
  
  <style scoped>
  .tournament-requests {
    min-height: 100vh;
    color: #f5f5f5;
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  h1 {
    font-size: 2rem;
    color: #f5f5f5;
    margin-bottom: 30px;
    padding-bottom: 10px;
    border-bottom: 1px solid #630181;
  }
  
  .status-msg {
    margin: 20px 0;
    font-size: 1rem;
    color: #cccccc;
  }
  
  .status-msg.error {
    color: #ff4d4d;
  }
  
  .status-msg.empty {
    color: #999;
  }
  
  .requests-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    padding: 20px 0;
  }
  
  .request-card {
    background: #2a2a2a;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    border: 1px solid #3a3a3a;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  
  .request-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(99, 1, 129, 0.4);
    border-color: #630181;
  }
  
  .team-name {
    font-size: 1.25rem;
    color: #f5f5f5;
    margin-bottom: 15px;
    font-weight: 500;
  }
  
  .actions {
    display: flex;
    gap: 10px;
    margin-top: 15px;
  }
  
  .accept-btn {
    background-color: rgba(99, 1, 129, 0.7);
    border: none;
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .accept-btn:hover {
    background-color: rgba(99, 1, 129, 1);
  }
  
  .reject-btn {
    background-color: transparent;
    border: 1px solid #ff5e5e;
    color: #ff5e5e;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .reject-btn:hover {
    background-color: rgba(180, 0, 0, 0.2);
    color: #ff8a8a;
  }
  
  @media (max-width: 768px) {
    .requests-list {
      grid-template-columns: 1fr;
    }
    
    .tournament-requests {
      padding: 10px;
    }
  }
  </style>