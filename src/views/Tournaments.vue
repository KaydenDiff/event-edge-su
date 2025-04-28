<template>
  <div class="home">
    <div class="main-content">
      <header class="main-header">
        <div class="header-left">
          <h1>Турниры</h1>
          <div class="game-selector" v-if="selectedGames.length">
            <div class="selected-games">
              <span v-for="game in selectedGames" :key="game" class="selected-game">
                {{ game }}
                <button class="clear-game" @click="removeGame(game)">
                  <i class="fas fa-times"></i>
                </button>
              </span>
            </div>
            <button class="clear-all" @click="clearGames" v-if="selectedGames.length > 1">
              Очистить все
            </button>
          </div>
        </div>
      </header>

      <div class="tournament-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['tab-button', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          {{ tab.name }}
        </button>
      </div>

      <div class="tournaments-grid">
        <div v-for="tournament in filteredTournaments" :key="tournament.id" class="tournament-card" @click="navigateToTournament(tournament)">
          <div class="tournament-image-block">
            <img :src="tournament.image" alt="tournament image" class="tournament-image" />
          </div>
          <div class="tournament-content">
            <h3 class="tournament-name">{{ tournament.name }}</h3>
            <div class="tournament-status">
              <span class="status-label">{{ tournament.status_name }}</span>
            </div>
            <p class="tournament-description">{{ tournament.description }}</p>
            <div class="tournament-info">
              <div class="info-item">
                <i class="fas fa-calendar"></i>
                <span>{{ formatDate(tournament.start_date) }} - {{ formatDate(tournament.end_date) }}</span>
              </div>
              <div class="info-item">
                <i class="fas fa-gamepad"></i>
                <span>Игра: {{ tournament.game?.name }}</span>
              </div>
              <div class="info-item">
                <i class="fas fa-user"></i>
                <span>Организатор: {{ tournament.organizer?.name }}</span>
              </div>
              <div class="info-item" v-if="activeTab === 'current' && tournament.stage">
                <i class="fas fa-flag-checkered"></i>
                <span>Стадия: {{ tournament.stage.name }}</span>
              </div>
              <div class="info-item" v-if="activeTab === 'past'">
                <i class="fas fa-trophy"></i>
                <span>Победитель: {{ tournament.winner ? tournament.winner.name : '—' }}</span>
              </div>
            </div>
            <button 
              v-if="activeTab !== 'past'" 
              class="register-button"
              @click.stop="$router.push(`/register-tournament/${tournament.id}/${tournament.name}`)"
            >
              Регистрация
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const tournaments = ref([])
const selectedGames = inject('selectedGames')
const activeTab = ref('current')

// Получаем ссылки на общие данные из App.vue
const games = inject('games')

const tabs = [
  { id: 'current', name: 'Текущие' },
  { id: 'upcoming', name: 'Предстоящие' },
  { id: 'completed', name: 'Прошедшие' }
]

// Фильтрация турниров
const filteredTournaments = computed(() => {
  console.log('Selected games:', selectedGames.value) // Для отладки
  console.log('All tournaments:', tournaments.value) // Для отладки
  
  return tournaments.value.filter(tournament => {
    const matchesGame = selectedGames.value.length === 0 || 
                       selectedGames.value.includes(tournament.game?.name)
    const matchesStatus = tournament.status === statusMap[activeTab.value]
    return matchesGame && matchesStatus
  })
})

// Загрузка турниров
const fetchTournaments = async () => {
  try {
    const res = await fetch('http://event-edge-su/api/guest/tournaments')
    tournaments.value = await res.json()
  } catch (e) {
    console.error('Ошибка при загрузке турниров:', e)
    tournaments.value = []
  }
}

// Загрузка игр
const fetchGames = async () => {
  try {
    const res = await fetch('http://event-edge-su/api/guest/games')
    const data = await res.json()
    games.value = data
  } catch (e) {
    console.error('Ошибка при загрузке игр:', e)
    games.value = []
  }
}

// Обработчик выбора игры
const handleGameSelection = (gameName) => {
  const index = selectedGames.value.indexOf(gameName)
  if (index === -1) {
    selectedGames.value.push(gameName)
  } else {
    selectedGames.value.splice(index, 1)
  }
}

// Удаление одной игры из фильтра
const removeGame = (gameName) => {
  const index = selectedGames.value.indexOf(gameName)
  if (index !== -1) {
    selectedGames.value.splice(index, 1)
  }
}

// Очистка всех игр из фильтра
const clearGames = () => {
  selectedGames.value = []
}

// Форматирование даты
function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr.replace(' ', 'T'))
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Получение URL аватара
function getAvatarUrl(avatar) {
  if (!avatar) return ''
  if (avatar.startsWith('http')) return avatar
  return `http://event-edge-su/storage/${avatar}`
}

// Переключение панели управления
const toggleControlPanel = () => {
  // Реализуйте по необходимости
}

// Navigation to tournament details
const navigateToTournament = (tournament) => {
  router.push(`/tournaments/${tournament.id}`)
}

// Маппинг статусов
const statusMap = {
  current: 'ongoing',
  upcoming: 'pending',
  past: 'finished'
}

// Загрузка данных при монтировании
onMounted(() => {
  fetchGames()
  fetchTournaments()
})

// Экспортируем необходимые данные и методы для использования в Bar
defineExpose({
  games,
  selectedGames,
  handleGameSelection
})
</script>

<style scoped>
.home {
  margin-top: 80px;
  display: flex;
  min-height: 100vh;
  background: #121212;
}

.main-content {
  flex: 1;
  margin-left: 280px;
  padding: 20px;
}

.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-left h1 {
  color: #fff;
  font-size: 24px;
  font-weight: 600;
}

.game-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  background: #2d2d2d;
  border-radius: 8px;
  color: #fff;
  transition: all 0.3s ease;
}

.selected-games {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.selected-game {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: #630181;
  border-radius: 4px;
  font-size: 14px;
}

.clear-game {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 2px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.clear-game:hover {
  background: rgba(255, 255, 255, 0.1);
}

.clear-all {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.clear-all:hover {
  background: rgba(255, 255, 255, 0.1);
}

.tournament-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

.tab-button {
  padding: 10px 20px;
  background: #2d2d2d;
  border: none;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.tab-button:hover {
  background: #3d3d3d;
  transform: translateY(-1px);
}

.tab-button.active {
  background: #630181;
  box-shadow: 0 0 15px rgba(99, 1, 129, 0.3);
}

.tournaments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.tournament-card {
  background: #1a1a1a;
  border-radius: 12px;
  padding: 0;
  color: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
}

.tournament-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0 20px rgba(99, 1, 129, 0.2);
  border-color: rgba(99, 1, 129, 0.3);
}

.tournament-image-block {
  position: relative;
  width: 100%;
  height: 180px;
  background: #222;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
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

.game-logo {
  position: absolute;
  left: 16px;
  bottom: 16px;
  width: 48px;
  height: 48px;
  background: #fff;
  border-radius: 50%;
  object-fit: contain;
  border: 2px solid #222;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.tournament-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tournament-name {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 4px;
  color: #fff;
}

.tournament-status {
  margin-bottom: 8px;
}

.status-label {
  background: #630181;
  color: #fff;
  border-radius: 6px;
  padding: 4px 12px;
  font-size: 13px;
  font-weight: 500;
  display: inline-block;
}

.tournament-description {
  color: #bbb;
  font-size: 15px;
  margin-bottom: 8px;
  line-height: 1.5;
}

.tournament-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #aaa;
  font-size: 14px;
}

.info-item i {
  color: #630181;
  width: 16px;
  text-align: center;
}

.organizer-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  margin-left: 6px;
  border: 1px solid #333;
}

.register-button {
  width: 100%;
  padding: 12px;
  background: #630181;
  border: none;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.register-button:hover {
  background: #7a019c;
  box-shadow: 0 0 15px rgba(99, 1, 129, 0.3);
  transform: translateY(-1px);
}

.register-button:active {
  transform: translateY(0);
}
</style>
