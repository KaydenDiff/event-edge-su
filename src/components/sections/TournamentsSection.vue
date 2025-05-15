<template>
  <div class="tournaments-section">
    <!-- Кнопка создания турнира -->
    <BaseButton @click="toggleTournamentForm" customClass="toggle-button">
      {{ showTournamentForm ? 'Скрыть форму' : (editingTournament ? 'Отменить редактирование' : 'Создать турнир') }}
    </BaseButton>

    <!-- Форма создания/редактирования турнира -->
    <TournamentForm 
      v-if="showTournamentForm"
      :teams="activeTeams"
      :games="games"
      :stages="stages"
      :error="error"
      :tournament="editingTournament"
      :isEdit="!!editingTournament"
      @submit="handleTournamentSubmit"
      @cancel="cancelForm"
    />

    <!-- Список турниров на размещение -->
    <div class="tournament-requests-section" v-if="isAdmin">
      <h2>Запросы на размещение турниров</h2>
      
      <div v-if="loadingRequests" class="loading-message">
        Загрузка запросов...
      </div>
      
      <div v-else-if="errorRequests" class="error-message">
        {{ errorRequests }}
      </div>
      
      <div v-else-if="!tournamentRequests.length" class="no-requests">
        Нет запросов на размещение турниров
      </div>
      
      <div v-else class="tournaments-list">
        <div v-for="request in tournamentRequests" :key="request.id" class="tournament-card">
          <div class="tournament-info">
            <div class="tournament-image-container">
            <img v-if="request.image" :src="`${request.image}`" alt="Изображение турнира" class="tournament-image" />
            <div v-else class="tournament-image-placeholder">
              <i class="fas fa-trophy"></i>
            </div>
          </div>
            <h3>{{ request.name }}</h3>
            <p><strong>Организатор:</strong> {{ request.user_name	 || 'Не указан' }}</p>
            <p><strong>Игра:</strong> {{ request.game_name || 'Не указана' }}</p>
            <p><strong>Дата начала:</strong> {{ formatDate(request.start_date) }}</p>
            <p><strong>Дата окончания:</strong> {{ formatDate(request.end_date) }}</p>
            <p><strong>Статус:</strong> {{ getStatusText(request.status) }}</p>
            <p><strong>Формат сетки турнира:</strong> {{ request.stage_type_name	 || 'Не указан' }}</p>
          </div>
          <div class="tournament-actions" v-if="request.status === 'pending'">
            <BaseButton 
              customClass="approve-btn" 
              @click="approveRequest(request.id)"
            >
              <i class="fas fa-check"></i> Разрешить
            </BaseButton>
            <BaseButton 
              customClass="reject-btn" 
              @click="rejectRequest(request.id)"
            >
              <i class="fas fa-times"></i> Отклонить
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
    <div><h2>Список турниров</h2></div>
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
 
    <div v-else class="tournaments-list">
    
      <div v-for="tournament in tournaments" :key="tournament.id" class="tournament-card">
        <div class="tournament-card-content">
          <div class="tournament-image-container">
            <img v-if="tournament.image" :src="`${tournament.image}`" alt="Изображение турнира" class="tournament-image" />
            <div v-else class="tournament-image-placeholder">
              <i class="fas fa-trophy"></i>
            </div>
          </div>
          <TournamentCard :tournament="tournament" />
        </div>
        <div class="tournament-actions">
          <BaseButton 
            customClass="details-btn" 
            @click="editTournament(tournament)"
          >
            <i class="fas fa-edit"></i> Редактировать
          </BaseButton>
          <BaseButton 
            customClass="details-btn" 
            @click="showDeleteConfirmation(tournament)"
          >
            <i class="fas fa-trash"></i> Удалить
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
    const tournamentRequests = ref([])
    const teams = ref([])
    const games = ref([])
    const stages = ref([])
    const loading = ref(true)
    const loadingRequests = ref(false)
    const error = ref(null)
    const errorRequests = ref(null)
    const showTournamentForm = ref(false)
    const showDeleteDialog = ref(false)
    const tournamentToDelete = ref(null)
    const searchQuery = ref('')
    const editingTournament = ref(null)

    // Вычисляемое свойство для активных команд
    const activeTeams = computed(() => {
      return teams.value.filter(team => team.status === 'active')
    })

    // Получение списка запросов на турниры
    const fetchTournamentRequests = async () => {
      try {
        loadingRequests.value = true
        errorRequests.value = null
        const user = JSON.parse(localStorage.getItem('user'))
        const response = await axios.get('http://event-edge-su/api/admin/tournament-requests/list', {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        })
        tournamentRequests.value =  response.data.tournament_requests
      } catch (err) {
        console.error('Ошибка загрузки запросов на турниры:', err)
        errorRequests.value = 'Ошибка при загрузке запросов на турниры'
      } finally {
        loadingRequests.value = false
      }
    }

    // Разрешение запроса на турнир
    const approveRequest = async (requestId) => {
      try {
        const user = JSON.parse(localStorage.getItem('user'))
        const response = await axios.post(
          `http://event-edge-su/api/admin/tournament-request/${requestId}/accept`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${user.token}`
            }
          }
        )
        
        if (response.data.success) {
          // Обновляем список запросов
          await fetchTournamentRequests()
          // Обновляем список турниров
          await fetchTournaments()
        }
      } catch (err) {
        console.error('Ошибка при разрешении запроса:', err)
        errorRequests.value = err.response?.data?.message || 'Ошибка при разрешении запроса'
      }
    }

    // Отклонение запроса на турнир
    const rejectRequest = async (requestId) => {
      try {
        const user = JSON.parse(localStorage.getItem('user'))
        const response = await axios.post(
          `http://event-edge-su/api/admin/tournament-request/${requestId}/reject`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${user.token}`
            }
          }
        )
        
        if (response.data.success) {
          // Обновляем список запросов
          await fetchTournamentRequests()
        }
      } catch (err) {
        console.error('Ошибка при отклонении запроса:', err)
        errorRequests.value = err.response?.data?.message || 'Ошибка при отклонении запроса'
      }
    }

    // Форматирование даты
    const formatDate = (dateString) => {
      if (!dateString) return 'Не указана'
      const date = new Date(dateString)
      return date.toLocaleDateString('ru-RU')
    }

    // Получение текста статуса
    const getStatusText = (status) => {
      const statusMap = {
        'pending': 'На рассмотрении',
        'approved': 'Одобрено',
        'rejected': 'Отклонено'
      }
      return statusMap[status] || status
    }

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

    // Получение данных турнира для редактирования
    const fetchTournamentDetails = async (tournamentId) => {
      try {
        error.value = null
        const user = JSON.parse(localStorage.getItem('user'))
        const response = await axios.get(`http://event-edge-su/api/guest/tournaments/${tournamentId}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        })
        return response.data
      } catch (err) {
        console.error('Ошибка загрузки данных турнира:', err)
        error.value = 'Ошибка при загрузке данных турнира'
        return null
      }
    }

    // Обработка отправки формы турнира - создание или обновление
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
          
          // Определяем, создаем или обновляем турнир
          const isUpdate = !!formData.id

          // URL-эндпоинт в зависимости от операции
          const url = isUpdate 
            ? `http://event-edge-su/api/admin/tournaments/update/${formData.id}`
            : 'http://event-edge-su/api/admin/tournaments/create'
          
          const response = await axios.post(
            url, 
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
          
          // Закрываем форму и сбрасываем режим редактирования
          showTournamentForm.value = false
          editingTournament.value = null
        }
      } catch (err) {
        console.error(editingTournament.value ? 'Ошибка обновления турнира:' : 'Ошибка создания турнира:', err)
        error.value = err.response?.data?.message || (editingTournament.value ? 'Ошибка при обновлении турнира' : 'Ошибка при создании турнира')
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
    const editTournament = async (tournament) => {
      try {
        // Загружаем необходимые данные при открытии формы
        await Promise.all([
          fetchTeams(),
          fetchGames(),
          fetchStages()
        ])

        // Получаем полные данные турнира
        const tournamentDetails = await fetchTournamentDetails(tournament.id)
        if (tournamentDetails) {
          editingTournament.value = tournamentDetails
          showTournamentForm.value = true
        }
      } catch (err) {
        console.error('Ошибка при подготовке к редактированию:', err)
        error.value = 'Ошибка при загрузке данных для редактирования'
      }
    }

    const toggleTournamentForm = () => {
      // Если форма открыта, закрываем ее и сбрасываем редактирование
      if (showTournamentForm.value) {
        showTournamentForm.value = false
        editingTournament.value = null
      } else {
        // Если форма закрыта, открываем для создания нового турнира
        showTournamentForm.value = true
        // Загружаем необходимые данные при открытии формы
        fetchTeams()
        fetchGames()
        fetchStages()
      }
    }

    const cancelForm = () => {
      showTournamentForm.value = false
      editingTournament.value = null
      error.value = null
    }

    // Загрузка данных при монтировании компонента
    onMounted(() => {
      fetchTournaments()
      if (props.isAdmin) {
        fetchTournamentRequests()
      }
    })

    return {
      tournaments,
      tournamentRequests,
      activeTeams,
      games,
      stages,
      loading,
      loadingRequests,
      error,
      errorRequests,
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
      cancelForm,
      editingTournament,
      approveRequest,
      rejectRequest,
      formatDate,
      getStatusText
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
    background-color: #630181;
  }

  .tournament-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
  }

  .tournament-card-content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .tournament-image-container {
    width: 100%;
    height: 150px;
    overflow: hidden;
    border-radius: 8px;
    margin-bottom: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.2);
  }

  .tournament-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .tournament-card:hover .tournament-image {
    transform: scale(1.05);
  }

  .tournament-image-placeholder {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background-color: rgba(99, 1, 129, 0.2);
    font-size: 3rem;
    color: #630181;
  }

  .tournament-actions {
    margin-top: 20px;
    display: flex;
    gap: 15px;
  }


  .tournament-actions button {
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .tournament-actions button i {
    font-size: 1rem;
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