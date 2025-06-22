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
                <button class="clear-game" @click.stop="removeGame(game)">
                  <i class="fas fa-times"></i>
                </button>
              </span>
            </div>
            <button class="clear-all" @click.stop="clearGames" v-if="selectedGames.length > 1">
              Очистить все
            </button>
          </div>
        </div>
        
        <!-- Кнопка фильтра для мобильных -->
        <button 
          v-if="isMobile" 
          class="mobile-filter-button"
          @click="showMobileFilter = !showMobileFilter"
        >
          <i class="fas fa-filter"></i>
          <span v-if="selectedGames.length">({{ selectedGames.length }})</span>
        </button>
      </header>

      <!-- Мобильный фильтр -->
      <div 
        v-if="isMobile && showMobileFilter" 
        class="mobile-filter-overlay"
        @click="showMobileFilter = false"
      >
        <div class="mobile-filter-content" @click.stop>
          <div class="mobile-filter-header">
            <h3>Фильтр по играм</h3>
            <button class="close-filter" @click="showMobileFilter = false">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="mobile-games-list">
            <div 
              v-for="game in games" 
              :key="game.name"
              class="mobile-game-item"
              :class="{ 'active': selectedGames.includes(game.name) }"
              @click="handleGameSelection(game.name)"
            >
              {{ game.name }}
              <i 
                class="fas"
                :class="selectedGames.includes(game.name) ? 'fa-check-circle' : 'fa-circle'"
              ></i>
            </div>
          </div>
          <div class="mobile-filter-actions">
            <button class="apply-filter" @click="showMobileFilter = false">
              Применить
            </button>
            <button class="reset-filter" @click="clearGames">
              Сбросить
            </button>
          </div>
        </div>
      </div>

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
      
      <div v-if="filteredTournaments.length === 0" class="no-tournaments">
        <p>Нет турниров, соответствующих выбранным критериям</p>
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
const showMobileFilter = ref(false)
const isMobile = ref(window.innerWidth <= 768)

const games = inject('games')

const tabs = [
  { id: 'current', name: 'Текущие' },
  { id: 'upcoming', name: 'Предстоящие' },
  { id: 'completed', name: 'Прошедшие' }
]

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  window.addEventListener('resize', checkMobile)
  checkMobile()
})

const filteredTournaments = computed(() => {
  return tournaments.value.filter(tournament => {
    const matchesGame = selectedGames.value.length === 0 || 
                       selectedGames.value.includes(tournament.game?.name)
    const matchesStatus = tournament.status === statusMap[activeTab.value]
    return matchesGame && matchesStatus
  })
})

const fetchTournaments = async () => {
  try {
    const res = await fetch('http://event-edge-su/api/guest/tournaments')
    tournaments.value = await res.json()
  } catch (e) {
    console.error('Ошибка при загрузке турниров:', e)
    tournaments.value = []
  }
}

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

const handleGameSelection = (gameName) => {
  const index = selectedGames.value.indexOf(gameName)
  if (index === -1) {
    selectedGames.value.push(gameName)
  } else {
    selectedGames.value.splice(index, 1)
  }
}

const removeGame = (gameName) => {
  const index = selectedGames.value.indexOf(gameName)
  if (index !== -1) {
    selectedGames.value.splice(index, 1)
  }
}

const clearGames = () => {
  selectedGames.value = []
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr.replace(' ', 'T'))
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' })
}

function getAvatarUrl(avatar) {
  if (!avatar) return ''
  if (avatar.startsWith('http')) return avatar
  return `http://event-edge-su/storage/${avatar}`
}

const navigateToTournament = (tournament) => {
  router.push(`/tournaments/${tournament.id}`)
}

const statusMap = {
  current: 'ongoing',
  upcoming: 'pending',
  completed: 'completed'
}

onMounted(() => {
  fetchGames()
  fetchTournaments()
})

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
  flex-wrap: wrap;
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
  flex-wrap: wrap;
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
  overflow-x: auto;
  padding-bottom: 10px;
  scrollbar-width: none; /* Firefox */
}

.tournament-tabs::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
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
  white-space: nowrap;
  flex-shrink: 0;
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
  word-break: break-word;
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
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
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
  flex-wrap: wrap;
}

.info-item i {
  color: #630181;
  width: 16px;
  text-align: center;
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
  margin-top: auto;
}

.register-button:hover {
  background: #7a019c;
  box-shadow: 0 0 15px rgba(99, 1, 129, 0.3);
  transform: translateY(-1px);
}

.no-tournaments {
  text-align: center;
  padding: 40px;
  color: #aaa;
  font-size: 18px;
}

/* Мобильные стили */
@media (max-width: 768px) {
  .main-content {
    margin-left: 100px;
    padding: 15px;
  }
  
  .header-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .game-selector {
    width: 100%;
  }
  
  .tournament-tabs {
    gap: 8px;
  }
  
  .tab-button {
    padding: 8px 16px;
    font-size: 14px;
  }
  
  .tournaments-grid {
    grid-template-columns: 1fr;
  }
  
  .tournament-card {
    margin-bottom: 15px;
    width: 70%;
  }
  
  .tournament-image-block {
    height: 150px;
  }
  
  .tournament-content {
    padding: 15px;
  }
  
  .tournament-name {
    font-size: 18px;
  }
  
  .tournament-description {
    font-size: 14px;
    -webkit-line-clamp: 2;
  }
  
  .info-item {
    font-size: 13px;
  }
  
  .register-button {
    padding: 10px;
    font-size: 14px;
  }
  .mobile-filter-button {
  background: #630181;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
}

.mobile-filter-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.mobile-filter-content {
  background: #1a1a1a;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.mobile-filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.mobile-filter-header h3 {
  margin: 0;
  color: white;
}

.close-filter {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
}

.mobile-games-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.mobile-game-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: #2a2a2a;
  border-radius: 8px;
  color: white;
  cursor: pointer;
}

.mobile-game-item.active {
  background: #630181;
}

.mobile-game-item i {
  font-size: 18px;
}

.mobile-game-item.active i {
  color: #4CAF50;
}

.mobile-filter-actions {
  display: flex;
  gap: 10px;
}

.apply-filter, .reset-filter {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  border: none;
  font-weight: 500;
  cursor: pointer;
}

.apply-filter {
  background: #630181;
  color: white;
}

.reset-filter {
  background: #2a2a2a;
  color: white;
}
}

@media (max-width: 576px) {
  .home {
    margin-top: 60px;
  }
  
  .main-header {
    margin-bottom: 20px;
  }
  
  .header-left h1 {
    font-size: 20px;
  }
  
  .selected-game {
    font-size: 13px;
    padding: 3px 6px;
  }
  
  .tournament-image-block {
    height: 120px;
  }
  
  .tournament-name {
    font-size: 16px;
  }
  
  .tournament-description {
    -webkit-line-clamp: 1;
  }
  
  .info-item {
    font-size: 12px;
  }
  
  .no-tournaments {
    padding: 20px;
    font-size: 16px;
  }
}
</style>