<template>
  <div class="home">
    <div class="main-content">
      <header class="main-header">
        <div class="header-left">
          <h1>Команды</h1>
        </div>
      </header>

      <!-- Текущая команда пользователя -->
      <div v-if="userTeam" class="user-team-section">
        <h2 class="section-title">Моя команда</h2>
        <div class="team-card user-team-card">
          <div class="team-content">
            <h3 class="team-name">{{ userTeam.name }}</h3>
            <div class="team-status">
              <span class="status-label status-active">Активна</span>
            </div>
            <div class="team-info">
              <div class="info-item">
                <i class="fas fa-clock"></i>
                <span>Создана: {{ formatDate(userTeam.created_at) }}</span>
              </div>
            </div>
            <div class="team-members-section">
              <h4 class="members-title">Участники команды:</h4>
              <div class="team-members">
                <div v-for="member in userTeam.members" :key="member.id" class="member-item">
                  <i class="fas fa-user"></i>
                  <span class="member-name">{{ member.name }}</span>
                  <span class="member-email">{{ member.email }}</span>
                  <span v-if="member.id === userTeam.captain_id" class="captain-badge">
                    <i class="fas fa-crown"></i> Капитан
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2 class="section-title">Все команды</h2>
      <div class="teams-grid">
        <div v-for="team in teams" :key="team.id" class="team-card" :class="{ 'user-team': userTeam && team.id === userTeam.id }">
          <div class="team-content">
            <h3 class="team-name">{{ team.name }}</h3>
            <div class="team-status">
              <span :class="['status-label', team.status === 'active' ? 'status-active' : 'status-inactive']">
                {{ team.status === 'active' ? 'Активна' : 'Неактивна' }}
              </span>
            </div>
            <div class="team-info">
              <div class="info-item">
                <i class="fas fa-clock"></i>
                <span>Создана: {{ formatDate(team.created_at) }}</span>
              </div>
            </div>
            
            <!-- Список участников команды -->
            <div class="team-members-section">
              <h4 class="members-title">Участники команды:</h4>
              <div v-if="team.members && team.members.length > 0" class="team-members">
                <div v-for="member in team.members" :key="member.id" class="member-item">
                  <i class="fas fa-user"></i>
                  <span class="member-name">{{ member.name }}</span>
                  <span class="member-email">{{ member.email }}</span>
                  <span v-if="member.id === team.captain_id" class="captain-badge">
                    <i class="fas fa-crown"></i> Капитан
                  </span>
                </div>
              </div>
              <div v-else class="loading-members">
                <i class="fas fa-spinner fa-spin"></i> Загрузка участников...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const teams = ref([])
const userTeam = ref(null)

// Загрузка команд
const fetchTeams = async () => {
  try {
    const res = await fetch('http://event-edge-su/api/guest/teams')
    const data = await res.json()
    teams.value = data.data.map(team => ({
      ...team,
      members: []
    }))
    
    // Загружаем участников для всех команд
    await Promise.all(teams.value.map(team => loadTeamMembers(team.id)))
  } catch (e) {
    console.error('Ошибка при загрузке команд:', e)
    teams.value = []
  }
}

// Загрузка участников команды
const loadTeamMembers = async (teamId) => {
  try {
    const res = await fetch(`http://event-edge-su/api/guest/teams/${teamId}/members`)
    const data = await res.json()

    // Проверяем структуру ответа и извлекаем участников
    if (data.data && data.data.members) {
      const team = teams.value.find(t => t.id === teamId)
      if (team) {
        team.members = data.data.members
      }
    } else {
      console.error(`Неверный формат данных для команды ${teamId}:`, data)
    }
  } catch (e) {
    console.error(`Ошибка при загрузке участников команды ${teamId}:`, e)
  }
}

// Загрузка профиля пользователя
const fetchUserProfile = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.token) {
      console.error('Токен авторизации не найден');
      return;
    }

    const res = await fetch('http://event-edge-su/api/my-profile', {
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    });
    const data = await res.json()
    console.log('User profile response:', data)
    if (data.user && data.user.team) {
      // Получаем капитана команды из списка всех команд
      const userTeamFromList = teams.value.find(t => t.id === data.user.team.id)
      userTeam.value = {
        ...data.user.team,
        captain_id: userTeamFromList ? userTeamFromList.captain_id : null
      }
    }
  } catch (e) {
    console.error('Ошибка при загрузке профиля пользователя:', e)
  }
}

// Форматирование даты
function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Загрузка данных при монтировании
onMounted(async () => {
  await fetchTeams()
  await fetchUserProfile()
})
</script>

<style scoped>
.home {
  min-height: 100vh;
  background-color: #1a1a1a;
  color: #f5f5f5;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.main-header {
  margin-bottom: 30px;
}

.header-left h1 {
  font-size: 2rem;
  color: #f5f5f5;
  margin: 0;
}

.section-title {
  font-size: 1.5rem;
  color: #f5f5f5;
  margin: 30px 0 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #630181;
}

.members-title {
  font-size: 1rem;
  color: #f5f5f5;
  margin: 0 0 10px 0;
}

.user-team-section {
  margin-bottom: 30px;
}

.user-team-card {
  border: 2px solid #630181;
  background-color: #2a2a2a;
}

.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px 0;
}

.team-card {
  background: #2a2a2a;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
  border: 1px solid #3a3a3a;
}

.team-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(99, 1, 129, 0.4);
  border-color: #630181;
}

.team-card.user-team {
  border: 2px solid #630181;
  background-color: #2a2a2a;
}

.team-content {
  padding: 20px;
}

.team-name {
  font-size: 1.25rem;
  color: #f5f5f5;
  margin: 0 0 10px 0;
}

.team-status {
  margin-bottom: 15px;
}

.status-label {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-active {
  background-color: rgba(99, 1, 129, 0.3);
  color: #f5f5f5;
  border: 1px solid #630181;
}

.status-inactive {
  background-color: rgba(180, 0, 0, 0.3);
  color: #f5f5f5;
  border: 1px solid #b40000;
}

.team-info {
  margin-top: 15px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  color: #cccccc;
}

.info-item i {
  margin-right: 8px;
  width: 16px;
  text-align: center;
  color: #630181;
}

.team-members-section {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #3a3a3a;
}

.team-members {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 8px;
  background-color: #333333;
  border-radius: 4px;
  border: 1px solid #3a3a3a;
}

.member-item i {
  margin-right: 8px;
  color: #630181;
}

.member-name {
  font-weight: 500;
  margin-right: 8px;
  color: #f5f5f5;
}

.member-email {
  color: #cccccc;
  font-size: 0.875rem;
  margin-right: auto;
}

.captain-badge {
  margin-left: 8px;
  font-size: 0.75rem;
  color: #f5f5f5;
  display: flex;
  align-items: center;
  background-color: rgba(99, 1, 129, 0.3);
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #630181;
}

.captain-badge i {
  margin-right: 4px;
  color: #f5f5f5;
}

.loading-members {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
  color: #cccccc;
}

.loading-members i {
  margin-right: 8px;
  color: #630181;
}

@media (max-width: 768px) {
  .teams-grid {
    grid-template-columns: 1fr;
  }
  
  .main-content {
    padding: 10px;
    width: 70%;
  }
}
</style> 