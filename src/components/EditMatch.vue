<template>
  <div class="edit-match">
    <h2>Редактирование матча</h2>

    <div v-if="loading" class="loading">
      <p>Загрузка данных матча...</p>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="match" class="match-form">
      <div class="form-group">
        <label>Турнир:</label>
        <div class="team-display">{{ tournaments.find(t => t.id === match.tournament_id)?.name }}</div>
      </div>

      <div class="form-group">
        <label>Команда 1:</label>
        <div class="team-display">{{ match.team_1_name }}</div>
      </div>

      <div class="form-group">
        <label>Команда 2:</label>
        <div class="team-display">{{ match.team_2_name }}</div>
      </div>

      <div class="form-group">
        <label>Дата матча:</label>
        <input type="datetime-local" v-model="match.match_date" :class="{ 'error-input': error && !match.match_date }" />
      </div>

      <div class="form-group">
        <label>Стадия:</label>
        <select v-model="match.stage_id" :class="{ 'error-input': error && !match.stage_id }">
          <option disabled value="">Выберите стадию</option>
          <option v-for="stage in stages" :key="stage.id" :value="stage.id">{{ stage.name }}</option>
        </select>
      </div>

      <div class="form-group">
        <label>Статус:</label>
        <select v-model="match.status">
          <option value="pending">В ожидании</option>
          <option value="completed">Завершен</option>
        </select>
      </div>

      <div v-if="match.status === 'completed'" class="form-group">
        <label>Результат:</label>
        <input type="text" v-model="match.result" 
               placeholder="Например: 3:1" 
               :class="{ 'error-input': error && match.status === 'completed' && !match.result }" />
      </div>

      <div v-if="match.status === 'completed'" class="form-group">
        <label>Победитель:</label>
        <select 
          v-model="match.winner_team_id" 
          :class="{ 'error-input': error && match.status === 'completed' && !match.winner_team_id }"
          @change="handleWinnerChange"
        >
          <option value="">Выберите победителя</option>
          <option v-if="match.team_1_id" :value="match.team_1_id">{{ match.team_1_name }}</option>
          <option v-if="match.team_2_id" :value="match.team_2_id">{{ match.team_2_name }}</option>
        </select>
      </div>

      <div class="form-actions">
        <BaseButton @click="saveMatch" :disabled="loading" variant="primary">
          {{ loading ? 'Сохранение...' : 'Сохранить' }}
        </BaseButton>
        <BaseButton @click="$router.go(-1)" :disabled="loading" variant="secondary">Отмена</BaseButton>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import BaseButton from '@/components/BaseButton.vue'

export default {
  name: 'EditMatch',
  components: {
    BaseButton
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const loading = ref(true)
    const error = ref(null)
    
    const match = ref({
      tournament_id: '',
      team_1_id: '',
      team_2_id: '',
      team_1_name: '',
      team_2_name: '',
      match_date: '',
      stage_id: '',
      stage_name: '',
      status: 'pending',
      winner_team_id: null,
      result: ''
    })

    const tournaments = ref([])
    const teams = ref([])
    const stages = ref([])

    const filteredTeams = computed(() => {
      return teams.value
    })

    const handleWinnerChange = (event) => {
      const value = event.target.value;
      // Convert empty string to null, otherwise convert to number
      match.value.winner_team_id = value === '' ? null : Number(value);
    }

    const fetchMatchData = async () => {
      try {
        loading.value = true
        error.value = null
        const response = await axios.get(`http://event-edge-su/api/guest/game-matches/${route.params.id}`)
        const matchData = response.data
        
        // Format date for datetime-local input
        const date = new Date(matchData.match_date)
        const formattedDate = date.toISOString().slice(0, 16)
        
        // Ensure we have all required fields and convert IDs to numbers
        match.value = {
          tournament_id: Number(matchData.tournament_id),
          team_1_id: Number(matchData.team_1_id),
          team_2_id: Number(matchData.team_2_id),
          team_1_name: matchData.team_1_name,
          team_2_name: matchData.team_2_name,
          match_date: formattedDate,
          stage_id: Number(matchData.stage_id),
          stage_name: matchData.stage_name,
          status: matchData.status,
          winner_team_id: matchData.winner_team_id ? Number(matchData.winner_team_id) : null,
          result: matchData.result || ''
        }
      } catch (err) {
        console.error('Error fetching match:', err)
        error.value = 'Ошибка при загрузке данных матча: ' + (err.response?.data?.message || err.message)
      } finally {
        loading.value = false
      }
    }

    const getTeamName = (teamId) => {
      if (teamId === match.value.team_1_id) return match.value.team_1_name
      if (teamId === match.value.team_2_id) return match.value.team_2_name
      return 'Команда не найдена'
    }

    const fetchAllData = async () => {
      try {
        loading.value = true
        error.value = null
        
        // Fetch tournaments and stages in parallel
        const [tournamentsResponse, stagesResponse] = await Promise.all([
          axios.get('http://event-edge-su/api/guest/tournaments'),
          axios.get('http://event-edge-su/api/guest/stages')
        ])
        
        tournaments.value = tournamentsResponse.data
        stages.value = stagesResponse.data
        
        // After loading basic data, fetch match details
        await fetchMatchData()
      } catch (err) {
        error.value = 'Ошибка при загрузке данных: ' + (err.response?.data?.message || err.message)
        loading.value = false
      }
    }

    const saveMatch = async () => {
      try {
        // Check if user is admin
        const user = JSON.parse(localStorage.getItem('user'))
        if (!user || user.role !== 'Администратор') {
          throw new Error('Только администратор может редактировать матчи')
        }

        loading.value = true
        error.value = null
        
        // Only validate status-specific fields
        if (match.value.status === 'completed') {
          if (match.value.winner_team_id === null || match.value.winner_team_id === undefined) {
            throw new Error('Для завершенного матча необходимо указать победителя')
          }
          if (!match.value.result) {
            throw new Error('Для завершенного матча необходимо указать результат')
          }
        }

        // Format date to match backend expectations (Y-m-d H:i:s)
        const formattedDate = match.value.match_date ? 
          new Date(match.value.match_date).toISOString().slice(0, 19).replace('T', ' ') : 
          null;
        
        // Create payload with only the fields that can be modified
        const payload = {
          match_date: formattedDate,
          stage_id: Number(match.value.stage_id),
          status: match.value.status,
          winner_team_id: match.value.status === 'completed' ? match.value.winner_team_id : null,
          result: match.value.status === 'completed' ? match.value.result : ''
        }
        
        // Use POST method with admin endpoint
        await axios.post(
          `http://event-edge-su/api/admin/game-matches/update/${route.params.id}`,
          payload,
          {
            headers: {
              'Authorization': `Bearer ${user.token}`,
              'Content-Type': 'application/json'
            }
          }
        )
        
        router.push('/admin')
      } catch (err) {
        console.error('Error saving match:', err)
        error.value = err.response?.data?.message || err.message
        loading.value = false
      }
    }

    // Add check for admin on component mount
    onMounted(async () => {
      const user = JSON.parse(localStorage.getItem('user'))
      if (!user || user.role !== 'Администратор') {
        error.value = 'Только администратор может редактировать матчи'
        loading.value = false
        return
      }
      await fetchAllData()
    })

    return {
      loading,
      error,
      match,
      tournaments,
      stages,
      saveMatch,
      getTeamName,
      filteredTeams,
      handleWinnerChange
    }
  }
}
</script>

<style scoped>
.edit-match {
  max-width: 600px;
  margin: 100px auto;
  padding: 20px;
  background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
  border-radius: 15px;
  color: #ffffff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(182, 0, 254, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #ffffff;
}

.loading, .error-message {
  text-align: center;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
}

.loading {
  background: rgba(255, 255, 255, 0.1);
}

.error-message {
  background: rgba(255, 59, 48, 0.1);
  color: #ff3b30;
}

.match-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-weight: 600;
  color: #ffffff;
}
select,
input[type="datetime-local"],
input[type="text"] {
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(182, 0, 254, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  font-size: 1rem;
  transition: all 0.3s ease;
}

select:focus,
input[type="datetime-local"]:focus,
input[type="text"]:focus {
  outline: none;
  border-color: #630181;
  box-shadow: 0 0 10px rgba(182, 0, 254, 0.2);
}

select:focus option {
  color: #000000;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
}


@media (max-width: 768px) {
  .edit-match {
    margin: 20px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  button {
    width: 100%;
  }
}

.team-display {
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(182, 0, 254, 0.1);
  border-radius: 8px;
  color: #ffffff;
  font-size: 1rem;
}

.error-input {
  border-color: #ff3b30 !important;
  box-shadow: 0 0 5px rgba(255, 59, 48, 0.2) !important;
}

.error-message {
  background: rgba(255, 59, 48, 0.1);
  color: #ff3b30;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 59, 48, 0.2);
}

.loading {
  background: rgba(255, 255, 255, 0.1);
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>

