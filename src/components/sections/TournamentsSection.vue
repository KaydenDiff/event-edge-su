<template>
    <div class="tournaments-section">
      <BaseButton @click="toggleTournamentForm" customClass="toggle-button">
        {{ showTournamentForm ? 'Скрыть форму' : 'Создать турнир' }}
      </BaseButton>
  
      <!-- Форма создания турнира -->
      <TournamentForm 
        v-if="showTournamentForm"
        :teams="activeTeams"
        :games="games"
        :stages="stages"
        :error="error"
        @submit="handleTournamentSubmit"
        @cancel="cancelForm"
      />
  
      <!-- Список турниров -->
      <div v-if="loading" class="loading-message">
        Загрузка турниров...
      </div>
  
      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>
  
      <div v-else-if="!tournaments.length" class="no-tournaments">
        Турниры не найдены
      </div>
  
       <!-- Список турниров -->
    <div v-else class="tournaments-list">
      <div v-for="tournament in tournaments" :key="tournament.id" class="tournament-card">
        <TournamentCard :tournament="tournament" />
        <div class="tournament-actions">
          <BaseButton 
            customClass="details-btn" 
            @click="editTournament(tournament)"
          >
            Редактировать
          </BaseButton>
          <BaseButton 
            customClass="details-btn" 
            @click="showDeleteConfirmation(tournament)"
          >
            Удалить
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Диалоговое окно подтверждения удаления -->
    <div v-if="showDeleteDialog" class="confirmation-dialog">
      <div class="dialog-content">
        <p>Вы точно хотите удалить турнир "{{ tournamentToDelete?.name }}"?</p>
        <div class="dialog-actions">
          <BaseButton customClass="details-btn" @click="confirmDelete">Да</BaseButton>
          <BaseButton customClass="details-btn" @click="cancelDelete">Нет</BaseButton>
        </div>
      </div>
    </div>
      </div>
  </template>
  
  <script>
  import { ref, computed, onMounted } from 'vue'
  import axios from 'axios'
  import BaseButton from '@/components/BaseButton.vue'
  import TournamentForm from '@/components/form/TournamentForm.vue'
  import TournamentCard from '@/components/TournamentCard.vue'

  export default {
    name: 'TournamentsSection',
    components: {
      BaseButton,
      TournamentForm,
      TournamentCard,
    },
    props: {
      isAdmin: {
        type: Boolean,
        default: false
      }
    },
    setup(props, { emit }) {
      const tournaments = ref([])
      const teams = ref([])
      const games = ref([])
      const stages = ref([])
      const loading = ref(true)
      const error = ref(null)
      const showTournamentForm = ref(false)
      const showDeleteDialog = ref(false)
      const tournamentToDelete = ref(null)
      const searchQuery = ref('')
  
      // Вычисляемое свойство для активных команд
      const activeTeams = computed(() => {
        return teams.value.filter(team => team.status === 'active')
      })
  
      // Получение списка команд
      const fetchTeams = async () => {
        try {
          const user = JSON.parse(localStorage.getItem('user'))
          const response = await axios.get('http://event-edge-su/api/guest/teams', {
            headers: {
              'Authorization': `Bearer ${user.token}`
            }
          })
          teams.value = response.data.data
        } catch (err) {
          console.error('Ошибка загрузки команд:', err)
          error.value = 'Ошибка при загрузке списка команд'
        }
      }
  
      // Получение списка игр
      const fetchGames = async () => {
        try {
          const user = JSON.parse(localStorage.getItem('user'))
          const response = await axios.get('http://event-edge-su/api/guest/games', {
            headers: {
              'Authorization': `Bearer ${user.token}`
            }
          })
          games.value = response.data
        } catch (err) {
          console.error('Ошибка загрузки игр:', err)
          error.value = 'Ошибка при загрузке списка игр'
        }
      }
  
      // Получение списка стадий
      const fetchStages = async () => {
        try {
          const user = JSON.parse(localStorage.getItem('user'))
          const response = await axios.get('http://event-edge-su/api/guest/stage-type', {
            headers: {
              'Authorization': `Bearer ${user.token}`
            }
          })
          stages.value = response.data.data
        } catch (err) {
          console.error('Ошибка загрузки стадий:', err)
          error.value = 'Ошибка при загрузке списка стадий'
        }
      }
  
      // Получение списка турниров
      const fetchTournaments = async () => {
        try {
          loading.value = true
          const user = JSON.parse(localStorage.getItem('user'))
          const response = await axios.get('http://event-edge-su/api/guest/tournaments', {
            headers: {
              'Authorization': `Bearer ${user.token}`
            }
          })
          tournaments.value = response.data
        } catch (err) {
          console.error('Ошибка загрузки турниров:', err)
          error.value = 'Ошибка при загрузке турниров'
        } finally {
          loading.value = false
        }
      }
  
      // Фильтрация турниров
      const filteredTournaments = computed(() => {
        if (!searchQuery.value) return tournaments.value
        return tournaments.value.filter(t => 
          t.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
      })
  
      // Обработка отправки формы турнира
      const handleTournamentSubmit = async (formData) => {
        try {
          error.value = null
          const user = JSON.parse(localStorage.getItem('user'))
          
      
          
          // Создаем новый FormData объект
          const submissionData = new FormData()
          
          // Добавляем все поля в FormData
          if (formData && typeof formData === 'object' && !formData.isTrusted) {
            // Добавляем основные поля
            if (formData.name) submissionData.append('name', formData.name)
            if (formData.description) submissionData.append('description', formData.description)
            if (formData.game_id) submissionData.append('game_id', formData.game_id)
            if (formData.stage_id) submissionData.append('stage_id', formData.stage_id)
            if (formData.status) submissionData.append('status', formData.status)
            if (formData.start_date) submissionData.append('start_date', formData.start_date)
            if (formData.end_date) submissionData.append('end_date', formData.end_date)
            
            // Добавляем команды
            if (formData.teams && Array.isArray(formData.teams)) {
              formData.teams.forEach(teamId => {
                submissionData.append('teams[]', teamId)
              })
            }
            
            // Добавляем изображение
            if (formData.image instanceof File) {
              submissionData.append('image', formData.image)
            }
            
            // Логируем данные перед отправкой
            const formDataObj = {}
            for (let [key, value] of submissionData.entries()) {
              formDataObj[key] = value
            }
            
            const response = await axios.post(
              'http://event-edge-su/api/admin/tournaments/create', 
              submissionData,
              {
                headers: {
                  'Authorization': `Bearer ${user.token}`,
                  'Content-Type': 'multipart/form-data'
                }
              }
            )

            // Обновляем список турниров
            await fetchTournaments()
            
            // Закрываем форму
            showTournamentForm.value = false
          }
        } catch (err) {
          console.error('Ошибка создания турнира:', err)
          error.value = err.response?.data?.message || 'Ошибка при создании турнира'
        }
      }
  
      const showDeleteConfirmation = (tournament) => {
        if (!props.isAdmin) return
        tournamentToDelete.value = tournament
        showDeleteDialog.value = true
      }
  
      // Удаление турнира
      const confirmDelete = async () => {
        try {
          const user = JSON.parse(localStorage.getItem('user'))
          if (!user?.token) throw new Error('Требуется авторизация')

          const response = await axios.delete(
            `http://event-edge-su/api/admin/tournaments/delete/${tournamentToDelete.value.id}`,
            {
              headers: {
                'Authorization': `Bearer ${user.token}`
              }
            }
          )

          // Проверяем успешность операции (200 - успешное удаление)
          if (response.status === 200 && response.data.message === "Турнир успешно удален") {
            // Удаляем турнир из списка
            tournaments.value = tournaments.value.filter(
              t => t.id !== tournamentToDelete.value.id
            )
            // Закрываем диалог подтверждения
            showDeleteDialog.value = false
            tournamentToDelete.value = null
          } else {
            throw new Error('Ошибка при удалении турнира')
          }
        } catch (err) {
          console.error('Ошибка удаления турнира:', err)
          error.value = err.response?.data?.message || 'Ошибка при удалении турнира'
          // Закрываем диалог в случае ошибки
          showDeleteDialog.value = false
          tournamentToDelete.value = null
        }
      }
  
      const cancelDelete = () => {
        showDeleteDialog.value = false
        tournamentToDelete.value = null
      }
  
      // Редактирование турнира
      const editTournament = (tournament) => {
        emit('edit-tournament', tournament.id)
      }
  
      const toggleTournamentForm = () => {
        showTournamentForm.value = !showTournamentForm.value
        if (showTournamentForm.value) {
          // Загружаем необходимые данные при открытии формы
          fetchTeams()
          fetchGames()
          fetchStages()
        }
      }
  
      const cancelForm = () => {
        showTournamentForm.value = false
        error.value = null
      }
  
      // Загрузка данных при монтировании компонента
      onMounted(() => {
        fetchTournaments()
      })
  
      return {
        tournaments,
        activeTeams,
        games,
        stages,
        loading,
        error,
        showTournamentForm,
        tournamentToDelete,
        searchQuery,
        filteredTournaments,
        handleTournamentSubmit,
        showDeleteDialog,
        showDeleteConfirmation,
        confirmDelete,
        cancelDelete,
        editTournament,
        toggleTournamentForm,
        cancelForm
      }
    }
  }
  </script>
  
  <style scoped>
  .tournaments-section {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .toggle-button {
    margin-bottom: 20px;
    padding: 12px 25px;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 600;
    transition: all 0.3s ease-in-out;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }

  .toggle-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }

  .tournaments-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-top: 20px;
  }

  .tournament-card {
    background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
    padding: 25px;
    border-radius: 15px;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .tournament-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
  }

  .tournament-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
  }

  .tournament-actions {
    margin-top: 20px;
    display: flex;
    gap: 15px;
  }

  .tournament-actions button {
    flex: 1;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .tournament-actions button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }

  .loading-message,
  .error-message,
  .no-tournaments {
    text-align: center;
    padding: 40px;
    font-size: 1.2rem;
    color: #EAEAEA;
    background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
    border-radius: 15px;
    border: 1px solid rgba(182, 0, 254, 0.1);
    margin: 20px 0;
  }

  .error-message {
    color: #ff6b6b;
    border-color: rgba(255, 107, 107, 0.2);
  }

  .confirmation-dialog {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(5px);
  }

  .dialog-content {
    background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
    padding: 30px;
    border-radius: 15px;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
  }

  .dialog-content p {
    font-size: 1.2rem;
    color: #ffffff;
    margin-bottom: 25px;
    text-align: center;
  }

  .dialog-actions {
    display: flex;
    justify-content: center;
    gap: 15px;
  }

  .dialog-actions button {
    padding: 12px 30px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
  }

  .dialog-actions button:last-child {
    background: linear-gradient(45deg, #630181, #ff6a1f);
    color: white;
  }


  @media (max-width: 768px) {
    .tournaments-list {
      grid-template-columns: 1fr;
    }
    
    .tournament-actions {
      flex-direction: column;
    }
  }
  </style>