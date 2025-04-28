<template>
  <div class="admin-panel">
    <div v-if="!isAdmin">
        <p>У вас нет доступа к этой странице.</p>
      </div>
    <div class="main-content">
      <h2>{{ pageTitle }}</h2>
      
      <!-- Home Section -->
      <div v-if="pageContent === 'home'" class="admin-guide">
        <div class="welcome-section">
          <h3>Добро пожаловать в панель администратора</h3>
          <p class="welcome-text">
            Здесь вы можете управлять всеми аспектами турнирной системы. Ниже представлено подробное руководство по каждому разделу.
          </p>
        </div>

        <div class="guide-sections">
          <div class="guide-section">
            <h4><i class="fas fa-users"></i> Управление пользователями</h4>
            <div class="section-content">
              <p>В этом разделе вы можете:</p>
              <ul>
                <li>Просматривать список всех зарегистрированных пользователей</li>
                <li>Редактировать профили пользователей</li>
                <li>Управлять правами доступа</li>
                <li>Блокировать нарушителей правил</li>
              </ul>
            </div>
          </div>

          <div class="guide-section">
            <h4><i class="fas fa-trophy"></i> Управление турнирами</h4>
            <div class="section-content">
              <p>Возможности раздела:</p>
              <ul>
                <li>Создание новых турниров</li>
                <li>Редактирование существующих турниров</li>
                <li>Управление статусами турниров</li>
                <li>Настройка правил и форматов</li>
              </ul>
            </div>
          </div>

          <div class="guide-section">
            <h4><i class="fas fa-gamepad"></i> Управление матчами</h4>
            <div class="section-content">
              <p>В этом разделе доступно:</p>
              <ul>
                <li>Создание и редактирование матчей</li>
                <li>Обновление результатов</li>
                <li>Управление расписанием</li>
                <li>Модерация конфликтных ситуаций</li>
              </ul>
            </div>
          </div>

          <div class="guide-section">
            <h4><i class="fas fa-chart-bar"></i> Статистика</h4>
            <div class="section-content">
              <p>Раздел предоставляет:</p>
              <ul>
                <li>Аналитику по турнирам и матчам</li>
                <li>Статистику активности пользователей</li>
                <li>Отчеты по проведенным мероприятиям</li>
                <li>Графики и диаграммы</li>
              </ul>
            </div>
          </div>

          <div class="guide-section">
            <h4><i class="fas fa-sitemap"></i> Турнирные сетки</h4>
            <div class="section-content">
              <p>Здесь вы можете:</p>
              <ul>
                <li>Создавать турнирные сетки</li>
                <li>Настраивать форматы проведения</li>
                <li>Управлять стадиями турнира</li>
                <li>Автоматизировать процесс жеребьёвки</li>
              </ul>
            </div>
          </div>

          <div class="guide-section">
            <h4><i class="fas fa-bell"></i> Уведомления</h4>
            <div class="section-content">
              <p>Возможности раздела:</p>
              <ul>
                <li>Отправка системных уведомлений</li>
                <li>Массовая рассылка важных сообщений</li>
                <li>Настройка автоматических уведомлений</li>
                <li>Просмотр истории отправленных сообщений</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="admin-tips">
          <h4><i class="fas fa-lightbulb"></i> Полезные советы</h4>
          <ul>
            <li>Регулярно проверяйте раздел уведомлений для своевременной реакции на запросы пользователей</li>
            <li>Используйте фильтры в каждом разделе для быстрого поиска нужной информации</li>
            <li>При возникновении спорных ситуаций обращайтесь к логам системы</li>
            <li>Создавайте резервные копии важных данных перед внесением существенных изменений</li>
          </ul>
        </div>
      </div>

      <!-- Users Section -->
      <UsersSection 
        v-if="pageContent === 'users'" 
        :is-admin="isAdmin"
      />

      <!-- Tournaments Section -->
      <TournamentsSection 
        v-if="pageContent === 'tournaments'" 
        :is-admin="isAdmin"
        @edit-tournament="editTournament"
      />

      <!-- Matches Section -->
      <div v-if="pageContent === 'matches'">
        <MatchSection />
      </div>

      <!-- Tournament Bracket Section -->
      <div v-if="pageContent === 'tournament-basket'">
        <TournamentBasketAdmin></TournamentBasketAdmin>
      </div>

      <!-- Statistics Section -->
      <div v-if="pageContent === 'statistics'">
        <StatsChart></StatsChart>
      </div>

      <!-- Notification Section -->
      <div v-if="pageContent === 'notifications'">
        <NotificationSection />
      </div>
    </div>
    </div>
</template>

<script>
import AdminSidebar from '@/components/AdminSidebar.vue';
import TournamentCard from '@/components/TournamentCard.vue';
import TournamentBasketAdmin from '@/components/TournamentBasketAdmin.vue';
import MatchCard from '@/components/MatchCard.vue';
import BaseButton from '@/components/BaseButton.vue';
import StatsChart from '@/components/StatsChart.vue';
import MatchSection from '@/components/sections/MatchSection.vue';
import TournamentsSection from '@/components/sections/TournamentsSection.vue';
import UsersSection from '@/components/sections/UsersSection.vue';
import NotificationSection from '@/components/sections/NotificationSection.vue';
import { ref } from 'vue';
import axios from 'axios';

export default {
  name: 'AdminPanel',
  components: {
    AdminSidebar,
    StatsChart,
    TournamentCard,
    BaseButton,
    MatchSection,
    MatchCard,
    TournamentBasketAdmin,
    TournamentsSection,
    UsersSection,
    NotificationSection
  },
  props: {
    selectedMenu: {
      type: String,
      default: 'home'
    }
  },
  data() {
    return {
      pageContent: 'home',
      pageTitle: '', 
      tournaments: [], 
      teams: [],
      showCreateMatchForm: false,
      stages: [],
      rounds: [],
      isAdmin: true
    };
  },
  watch: {
    selectedMenu: {
      immediate: true,
      handler(newValue) {
        this.pageContent = newValue;
        this.updateContent(newValue);
      }
    }
  },
  computed: {
    filteredTeams() {
      if (!this.newMatch.tournament_id) return [];

      const tournament = this.tournaments.find(t => t.id === this.newMatch.tournament_id);

      if (!tournament || !tournament.teams) return [];

      return tournament.teams.map(team => ({
        id: team.pivot.team_id,
        name: team.name
      }));
    },
    filteredTeam() {
    if (!this.newMatch.tournament_id) return [];
    return this.teams.filter(team => team.tournament_id === this.newMatch.tournament_id);
  },
  filteredMatches() {
    if (!this.selectedTournament) return this.matches;
    return this.matches.filter(match => match.tournament_id === this.selectedTournament);
  }
  },
  methods: {
    updateContent(section) {
    this.pageContent = section;
    if (section === 'home') {
      this.pageTitle = 'Главная панель';
    } else if (section === 'tournaments') {
      this.pageTitle = 'Управление турнирами';
    } else if (section === 'matches') {
      this.pageTitle = 'Управление матчами';
    } else if (section === 'tournament-basket') {
      this.pageTitle = 'Управление турнирными сетками';
    } else if (section === 'statistics') {
      this.pageTitle = 'Просмотр статистики';
    } else if (section === 'users') {
      this.pageTitle = 'Управление пользователями';
    } else if (section === 'notifications') {
      this.pageTitle = 'Управление уведомлениями';
    } 
  },

    async fetchTournaments() {
      try {
        const response = await fetch('http://event-edge-su/api/guest/tournaments');
        const data = await response.json();
        this.tournaments = data;
      } catch (error) {
        console.error('Ошибка загрузки турниров:', error);
      }
    },

    async deleteTournament(id) {
      if (!confirm('Вы уверены, что хотите удалить турнир?')) return;

      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.token) {
        console.error('Токен не найден');
        return;
      }

      try {
        const response = await fetch(`http://event-edge-su/api/admin/tournaments/delete/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Ошибка при удалении турнира');
        }

        this.tournaments = this.tournaments.filter(tournament => tournament.id !== id);
      } catch (error) {
        console.error('Ошибка удаления турнира:', error);
      }
    },
      // Метод редактирования турнира
  editTournament(id) {
    this.$router.push({ name: 'EditTournament', params: { id } });
  },

    async fetchTeams() {
      try {
        const response = await fetch('http://event-edge-su/api/guest/teams');
        const data = await response.json();
        this.teams = data;
      } catch (error) {
        console.error('Ошибка загрузки команд:', error);
      }
    },

    async fetchStages() {
      try {
        const response = await fetch('http://event-edge-su/api/guest/stages');
        const data = await response.json();
        this.stages = data;
      } catch (error) {
        console.error('Ошибка загрузки стадий:', error);
      }
    },
  },
  mounted() {
    this.fetchTeams?.();
    this.fetchStages?.();
    this.fetchTournaments?.();
  }
};
</script>

<style scoped>
.btn-primary {
  padding: 8px 20px;
  border-radius: 8px;
  text-decoration: none;
  display: inline-block;
}

/* Анимация пульсирующей обводки */
@keyframes pulseBorder {
  0% {
    border-color: rgba(255, 255, 255, 0.5);
  }
  50% {
    border-color: rgba(255, 255, 255, 1);
  }
  100% {
    border-color: rgba(255, 255, 255, 0.5);
  }
}

.admin-panel {
  display: flex;
  height: 100vh;
}

.admin-panel .admin-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 250px;
  height: 100%;
  background-color: #8C8C8C;

}

.main-content {
  margin-left: 250px;
  padding: 40px;
  width: calc(100% - 250px);
  overflow-y: auto; /* Оставляем прокрутку */
  scrollbar-width: none; /* Скрытие скроллбара в Firefox */
  -ms-overflow-style: none; /* Скрытие скроллбара в IE и Edge */
  padding-top: 74px; /* Отступ сверху */
}

/* Для WebKit (Chrome, Safari) */
.main-content::-webkit-scrollbar {
  display: none; /* Скрывает скроллбар */
}

.tournament-list {
  padding-top: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.tournaments {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

.tournament-card {
  background: #9A9A9A;
  padding: 20px;
  border-radius: 15px;
  text-align: center;
  width: 100%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  margin-bottom: 50px; /* Отступ между турнирами */
}

.tournament-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
}

.tournament-name {
  font-size: 1.25rem;
  font-weight: bold;
  color: #ffffff;
}
.status {
  font-size: 1rem;
  margin: 10px 0;
}

.status.text-green-500 {
  color: #48BB78;
}

.status.text-blue-500 {
  color: #3B82F6;
}

.status.text-gray-500 {
  color: #6B7280;
}

.details-link {
  display: inline-block;
  margin-top: 10px;
  background-color: #630181;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  text-decoration: none;
  transition: background-color 0.3s ease;
}

.details-link:hover {
  background-color: #B88F3A;
}

.main-content h3 {
  font-size: 1.75rem;
  color: #ffffff;
  margin-bottom: 20px;
}

.main-content p {
  font-size: 1.125rem;
  color: #ffffff;
  margin-bottom: 20px;
}

.tournament-actions {
  margin-top: 10px;
  display: flex;
  gap: 15px; /* Увеличенный промежуток между кнопками */
}

.tournament-actions button {
  flex: 1; /* Равномерное распределение кнопок */
}



.warning-text {
  color: red;
  font-size: 0.875rem;
  margin-top: 10px;
}


.warning-text {
  color: red;
  font-size: 12px;
  margin-left: 10px;
}

label {
  font-size: 1rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 5px;
  display: inline-block;
  margin: 10px auto;
}

select, input[type="datetime-local"], input[type="text"] {
  width: 100%;
  padding: 10px;
  font-size: 1rem;
  border: 2px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box; /* Чтобы padding не выходил за пределы */
  transition: border-color 0.3s ease-in-out;
}

select:focus, input[type="datetime-local"]:focus, input[type="text"]:focus {
  border-color: #6b6b6b;
  outline: none;
  
}


button:active {
  transform: scale(0.95);
}

.warning-text {
  color: red;
  font-size: 0.875rem;
  margin-top: 10px;
}
.edit-button {
  position: absolute;
  top: 0;
  right: 0;
  padding: 5px 10px;
  background-color: #f39c12;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.edit-button:hover {
  background-color: #ffffff;
}

.admin-guide {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.welcome-section {
  text-align: center;
  margin-bottom: 40px;
  padding: 20px;
  background: rgba(13, 13, 13, 1);
  border-radius: 10px;
}

.welcome-text {
  font-size: 1.1rem;
  color: #ffffff;
  max-width: 800px;
  margin: 0 auto;
}

.guide-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

.guide-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 25px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.guide-section:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.guide-section h4 {
  color: #630181;
  font-size: 1.3rem;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.guide-section i {
  font-size: 1.4rem;
}

.section-content {
  color: #ffffff;
}

.section-content p {
  margin-bottom: 10px;
  font-weight: 500;
}

.section-content ul {
  list-style-type: none;
  padding: 0;
}

.section-content li {
  margin-bottom: 8px;
  padding-left: 20px;
  position: relative;
}

.section-content li::before {
  content: "•";
  color: #630181;
  position: absolute;
  left: 0;
}

.admin-tips {
  background: rgba(182, 0, 254, 0.1);
  border-radius: 10px;
  padding: 25px;
  margin-top: 30px;
}

.admin-tips h4 {
  color: #630181;
  font-size: 1.3rem;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.admin-tips ul {
  list-style-type: none;
  padding: 0;
}

.admin-tips li {
  margin-bottom: 10px;
  padding-left: 25px;
  position: relative;
  color: #ffffff;
}

.admin-tips li::before {
  content: "💡";
  position: absolute;
  left: 0;
}

@media (max-width: 768px) {
  .guide-sections {
    grid-template-columns: 1fr;
  }
  
  .guide-section {
    padding: 20px;
  }
  
  .welcome-section {
    padding: 15px;
  }
}
</style>
