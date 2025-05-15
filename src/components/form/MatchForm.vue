<template>
  <div class="match-form">
    <div v-if="loading" class="loading">
      <p>Загрузка данных...</p>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div class="form-container">
      <div class="form-group">
        <label>Турнир:</label>
        <select v-if="isCreate" v-model="formData.tournament_id" :class="{ 'error-input': validationErrors.tournament_id }">
          <option disabled value="">Выберите турнир</option>
          <option v-for="tournament in tournaments" :key="tournament.id" :value="tournament.id">{{ tournament.name }}</option>
        </select>
        <div v-else class="team-display">{{ getTournamentName(formData.tournament_id) }}</div>
        <div v-if="validationErrors.tournament_id" class="error-text">{{ validationErrors.tournament_id }}</div>
      </div>

      <div class="form-group">
        <label>Команда 1:</label>
        <select v-if="isCreate" v-model="formData.team_1_id" :class="{ 'error-input': validationErrors.team_1_id }">
          <option disabled value="">Выберите команду</option>
          <option v-for="team in filteredTeams" :key="team.id" :value="team.id">{{ team.name }}</option>
        </select>
        <div v-else class="team-display">{{ formData.team_1_name }}</div>
        <div v-if="validationErrors.team_1_id" class="error-text">{{ validationErrors.team_1_id }}</div>
      </div>

      <div class="form-group">
        <label>Команда 2:</label>
        <select v-if="isCreate" v-model="formData.team_2_id" :class="{ 'error-input': validationErrors.team_2_id }">
          <option disabled value="">Выберите команду</option>
          <option v-for="team in filteredTeams" :key="team.id" :value="team.id">{{ team.name }}</option>
        </select>
        <div v-else class="team-display">{{ formData.team_2_name }}</div>
        <div v-if="validationErrors.team_2_id" class="error-text">{{ validationErrors.team_2_id }}</div>
      </div>

      <div class="form-group">
        <label>Дата матча:</label>
        <input type="datetime-local" v-model="formData.match_date" :class="{ 'error-input': validationErrors.match_date }" />
        <div v-if="validationErrors.match_date" class="error-text">{{ validationErrors.match_date }}</div>
      </div>

      <div class="form-group">
        <label>Стадия:</label>
        <select v-model="formData.stage_id" :class="{ 'error-input': validationErrors.stage_id }">
          <option disabled value="">Выберите стадию</option>
          <option v-for="stage in stages" :key="stage.id" :value="stage.id">{{ stage.name }}</option>
        </select>
        <div v-if="validationErrors.stage_id" class="error-text">{{ validationErrors.stage_id }}</div>
      </div>

      <div class="form-group">
        <label>Статус:</label>
        <select v-model="formData.status">
          <option value="pending">В ожидании</option>
          <option value="completed">Завершен</option>
        </select>
      </div>

      <div v-if="formData.status === 'completed'" class="form-group">
        <label>Результат:</label>
        <input type="text" v-model="formData.result" 
               placeholder="Например: 3:1" 
               :class="{ 'error-input': validationErrors.result }" />
        <div v-if="validationErrors.result" class="error-text">{{ validationErrors.result }}</div>
      </div>

      <div v-if="formData.status === 'completed'" class="form-group">
        <label>Победитель:</label>
        <select 
          v-model="formData.winner_team_id" 
          :class="{ 'error-input': validationErrors.winner_team_id }"
          @change="handleWinnerChange"
        >
          <option value="">Выберите победителя</option>
          <option v-if="formData.team_1_id" :value="formData.team_1_id">{{ formData.team_1_name || getTeamName(formData.team_1_id) }}</option>
          <option v-if="formData.team_2_id" :value="formData.team_2_id">{{ formData.team_2_name || getTeamName(formData.team_2_id) }}</option>
        </select>
        <div v-if="validationErrors.winner_team_id" class="error-text">{{ validationErrors.winner_team_id }}</div>
      </div>

      <div class="form-actions">
        <BaseButton @click="submitForm" :disabled="loading" customClass="primary-button">
          {{ loading ? 'Сохранение...' : (isCreate ? 'Создать' : 'Сохранить') }}
        </BaseButton>
        <BaseButton @click="cancel" :disabled="loading" customClass="secondary-button">Отмена</BaseButton>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import axios from 'axios'
import BaseButton from '@/components/BaseButton.vue'

export default {
  name: 'MatchForm',
  components: {
    BaseButton
  },
  props: {
    matchId: {
      type: [Number, String],
      default: null
    },
    isCreate: {
      type: Boolean,
      default: true
    }
  },
  emits: ['submit-success', 'cancel'],
  setup(props, { emit }) {
    const loading = ref(false)
    const error = ref(null)
    const validationErrors = ref({})
    
    const formData = ref({
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

    // Загрузка списка команд, связанных с выбранным турниром
    const filteredTeams = computed(() => {
      if (!formData.value.tournament_id) return []
      return teams.value.filter(team => team.tournament_id === formData.value.tournament_id)
    })

    // Следим за изменением турнира для подгрузки связанных команд
    watch(() => formData.value.tournament_id, async (newVal) => {
      if (newVal && props.isCreate) {
        await fetchTeamsForTournament(newVal)
        formData.value.team_1_id = ''
        formData.value.team_2_id = ''
      }
    })

    const getTournamentName = (tournamentId) => {
      const tournament = tournaments.value.find(t => t.id === Number(tournamentId))
      return tournament ? tournament.name : 'Неизвестный турнир'
    }

    const getTeamName = (teamId) => {
      const team = teams.value.find(t => t.id === Number(teamId))
      return team ? team.name : 'Неизвестная команда'
    }

    const handleWinnerChange = (event) => {
      const value = event.target.value
      // Convert empty string to null, otherwise convert to number
      formData.value.winner_team_id = value === '' ? null : Number(value)
    }

    const fetchTeamsForTournament = async (tournamentId) => {
      try {
        const user = JSON.parse(localStorage.getItem('user'))
        const response = await axios.get(`http://event-edge-su/api/guest/tournaments/${tournamentId}/teams`, {
          headers: {
            'Authorization': `Bearer ${user?.token || ''}`
          }
        })
        
        if (response.data && response.data.teams) {
          teams.value = response.data.teams
        }
      } catch (err) {
        console.error('Ошибка загрузки команд:', err)
      }
    }

    const fetchMatchData = async () => {
      if (!props.matchId || props.isCreate) return
      
      try {
        loading.value = true
        error.value = null
        validationErrors.value = {}
        
        const response = await axios.get(`http://event-edge-su/api/guest/game-matches/${props.matchId}`)
        const matchData = response.data
        
        // Format date for datetime-local input
        const date = new Date(matchData.match_date)
        const formattedDate = date.toISOString().slice(0, 16)
        
        // Ensure we have all required fields and convert IDs to numbers
        formData.value = {
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
        console.error('Ошибка загрузки данных матча:', err)
        error.value = 'Ошибка при загрузке данных матча: ' + (err.response?.data?.message || err.message)
      } finally {
        loading.value = false
      }
    }

    const fetchAllData = async () => {
      try {
        loading.value = true
        error.value = null
        validationErrors.value = {}
        
        // Fetch tournaments and stages in parallel
        const [tournamentsResponse, stagesResponse] = await Promise.all([
          axios.get('http://event-edge-su/api/guest/tournaments'),
          axios.get('http://event-edge-su/api/guest/stages')
        ])
        
        tournaments.value = tournamentsResponse.data
        stages.value = stagesResponse.data
        
        // After loading basic data, fetch match details if editing
        if (!props.isCreate && props.matchId) {
          await fetchMatchData()
        }
      } catch (err) {
        error.value = 'Ошибка при загрузке данных: ' + (err.response?.data?.message || err.message)
      } finally {
        loading.value = false
      }
    }

    const validateForm = () => {
      validationErrors.value = {}
      
      if (!formData.value.tournament_id) {
        validationErrors.value.tournament_id = 'Выберите турнир'
      }
      
      if (!formData.value.match_date) {
        validationErrors.value.match_date = 'Укажите дату матча'
      }
      
      if (!formData.value.stage_id) {
        validationErrors.value.stage_id = 'Выберите стадию'
      }
      
      if (props.isCreate) {
        if (!formData.value.team_1_id) {
          validationErrors.value.team_1_id = 'Выберите первую команду'
        }
        
        if (!formData.value.team_2_id) {
          validationErrors.value.team_2_id = 'Выберите вторую команду'
        }
        
        if (formData.value.team_1_id && formData.value.team_2_id && 
            formData.value.team_1_id === formData.value.team_2_id) {
          validationErrors.value.team_2_id = 'Команды должны быть разными'
        }
      }
      
      if (formData.value.status === 'completed') {
        if (!formData.value.result) {
          validationErrors.value.result = 'Укажите результат матча'
        }
        
        if (!formData.value.winner_team_id) {
          validationErrors.value.winner_team_id = 'Выберите победителя'
        }
      }
      
      return Object.keys(validationErrors.value).length === 0
    }

    const submitForm = async () => {
      if (!validateForm()) return
      
      try {
        // Check if user is admin
        const user = JSON.parse(localStorage.getItem('user'))
        if (!user || user.role !== 'Администратор') {
          throw new Error('Только администратор может управлять матчами')
        }

        loading.value = true
        error.value = null
        
        // Format date to match backend expectations (Y-m-d H:i:s)
        const formattedDate = formData.value.match_date ? 
          new Date(formData.value.match_date).toISOString().slice(0, 19).replace('T', ' ') : 
          null;
        
        if (props.isCreate) {
          // Create payload for new match
          const payload = {
            tournament_id: formData.value.tournament_id,
            team_1_id: formData.value.team_1_id,
            team_2_id: formData.value.team_2_id,
            match_date: formattedDate,
            status: formData.value.status,
            stage_id: formData.value.stage_id,
            winner_team_id: formData.value.status === 'completed' ? formData.value.winner_team_id : null,
            result: formData.value.status === 'completed' ? formData.value.result : ''
          }
          
          await axios.post(
            'http://event-edge-su/api/admin/game-matches/create',
            payload,
            {
              headers: {
                'Authorization': `Bearer ${user.token}`,
                'Content-Type': 'application/json'
              }
            }
          )
        } else {
          // Create payload for match update
          const payload = {
            match_date: formattedDate,
            stage_id: Number(formData.value.stage_id),
            status: formData.value.status,
            winner_team_id: formData.value.status === 'completed' ? formData.value.winner_team_id : null,
            result: formData.value.status === 'completed' ? formData.value.result : ''
          }
          
          await axios.post(
            `http://event-edge-su/api/admin/game-matches/update/${props.matchId}`,
            payload,
            {
              headers: {
                'Authorization': `Bearer ${user.token}`,
                'Content-Type': 'application/json'
              }
            }
          )
        }
        
        emit('submit-success')
      } catch (err) {
        console.error('Ошибка сохранения матча:', err)
        error.value = err.response?.data?.message || err.message
      } finally {
        loading.value = false
      }
    }

    const cancel = () => {
      emit('cancel')
    }

    // Add check for admin on component mount and load data
    onMounted(async () => {
      const user = JSON.parse(localStorage.getItem('user'))
      if (!user || user.role !== 'Администратор') {
        error.value = 'Только администратор может редактировать матчи'
        return
      }
      
      await fetchAllData()
    })

    return {
      loading,
      error,
      formData,
      tournaments,
      teams,
      stages,
      filteredTeams,
      validationErrors,
      submitForm,
      cancel,
      getTournamentName,
      getTeamName,
      handleWinnerChange
    }
  }
}
</script>

<style scoped>
.match-form {
  max-width: 600px;
  margin: 0 auto;
  background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
  border-radius: 15px;
  color: #ffffff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(182, 0, 254, 0.1);
  overflow: hidden;
}

.form-container {
  padding: 25px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.loading, .error-message {
  text-align: center;
  padding: 20px;
  border-radius: 8px;
  margin: 20px;
}

.loading {
  background: rgba(255, 255, 255, 0.1);
}

.error-message {
  background: rgba(255, 59, 48, 0.1);
  color: #ff3b30;
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

select {
  width: 100%;
  padding: 12px 15px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  background: #3c3c3c;
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

select:hover {
  background: #444444;
}

select option {
  background: #2c2c2c;
  color: white;
  padding: 8px;
}

select option:hover {
  background: #3c3c3c;
}

input[type="datetime-local"]:focus,
input[type="text"]:focus,
select:focus {
  outline: none;
  border-color: #630181;
  box-shadow: 0 0 10px rgba(182, 0, 254, 0.2);
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
}

.primary-button, .secondary-button {
  padding: 12px 25px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
  color: white;
  border: none;
  transition: all 0.3s ease;
}

.primary-button {
  background: linear-gradient(45deg, #630181, #9500ff);
}

.secondary-button {
  background: rgba(255, 255, 255, 0.1);
}

.primary-button:hover, .secondary-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.primary-button:disabled, .secondary-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
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

.error-text {
  color: #ff3b30;
  font-size: 0.85rem;
  margin-top: 4px;
}

@media (max-width: 768px) {
  .match-form {
    margin: 0;
    border-radius: 0;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style> 