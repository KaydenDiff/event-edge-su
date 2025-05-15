<template>
  <div class="help-container">
    <div class="welcome-section">
      <h1 class="help-title">Инструкция по использованию сайта</h1>
      <p class="welcome-text">
        Здесь вы найдете подробное руководство по использованию всех функций турнирной системы. Выберите интересующий вас раздел для получения детальной информации.
      </p>
    </div>

    <!-- Navigation Buttons -->
    <div class="nav-buttons">
      <button 
        class="nav-button" 
        :class="{ active: activeSection === 'players' }"
        @click="selectSection('players')"
      >
        <i class="fas fa-user"></i>
        Для игроков
      </button>
      <button 
        class="nav-button" 
        :class="{ active: activeSection === 'organizers' }"
        @click="selectSection('organizers')"
      >
        <i class="fas fa-cogs"></i>
        Для организаторов
      </button>
      <button 
        class="nav-button" 
        :class="{ active: activeSection === 'admin' }"
        @click="selectSection('admin')"
      >
        <i class="fas fa-shield-alt"></i>
        Для администраторов
      </button>
    </div>
    
    <div class="guide-sections">
      <!-- Players Section -->
      <div id="players" class="guide-section" v-show="activeSection === 'players'">
        <h2 @click="navigateToSection('players')">
          <i class="fas fa-user"></i> Для игроков
        </h2>
        <div class="section-content">
          <div id="registration" class="subsection">
            <h3 @click="navigateToSection('registration')">
              <i class="fas fa-user-plus"></i> Регистрация и профиль
            </h3>
            <ul>
              <li>Зарегистрируйтесь на сайте, заполнив форму регистрации</li>
              <li>После регистрации вы можете заполнить свой профиль игрока</li>
              <li>В профиле вы можете указать свои достижения, статистику и предпочитаемые игры</li>
            </ul>
          </div>

          <div id="tournaments" class="subsection">
            <h3 @click="navigateToSection('tournaments')">
              <i class="fas fa-trophy"></i> Участие в турнирах
            </h3>
            <ul>
              <li>Просматривайте доступные турниры на главной странице</li>
              <li>Выбирайте интересующие вас турниры и регистрируйтесь на них</li>
              <li>Следите за своими матчами в разделе "Мои матчи"</li>
              <li>Проверяйте турнирную сетку и результаты в деталях турнира</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Organizers Section -->
      <div id="organizers" class="guide-section" v-show="activeSection === 'organizers'">
        <h2 @click="navigateToSection('organizers')">
          <i class="fas fa-cogs"></i> Для организаторов
        </h2>
        <div class="section-content">
          <div id="tournament-creation" class="subsection">
            <h3 @click="navigateToSection('tournament-creation')">
              <i class="fas fa-plus-circle"></i> Создание турниров
            </h3>
            <ul>
              <li>Перейдите в раздел "Турниры" → "Создать турнир"</li>
              <li>Заполните информацию о турнире (название, даты, правила)</li>
              <li>Настройте формат турнира и систему начисления очков</li>
              <li>Управляйте участниками и матчами через панель организатора</li>
            </ul>
          </div>

          <div id="tournament-management" class="subsection">
            <h3 @click="navigateToSection('tournament-management')">
              <i class="fas fa-tasks"></i> Управление турниром
            </h3>
            <ul>
              <li>Отслеживайте регистрацию участников</li>
              <li>Формируйте турнирную сетку</li>
              <li>Вводите результаты матчей</li>
              <li>Коммуницируйте с участниками через систему уведомлений</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Admin Section -->
      <div id="admin" class="guide-section" v-show="activeSection === 'admin'">
        <h2 @click="navigateToSection('admin')">
          <i class="fas fa-shield-alt"></i> Для администраторов
        </h2>
        <div class="section-content">
          <div id="admin-users" class="subsection">
            <h3 @click="navigateToSection('admin-users')">
              <i class="fas fa-users"></i> Управление пользователями
            </h3>
            <ul>
              <li>Просматривайте и редактируйте информацию о пользователях</li>
              <li>Управляйте правами и ролями</li>
              <li>Блокируйте аккаунты нарушителей</li>
            </ul>
          </div>

          <div id="admin-tournaments" class="subsection">
            <h3 @click="navigateToSection('admin-tournaments')">
              <i class="fas fa-trophy"></i> Управление турнирами
            </h3>
            <ul>
              <li>Создавайте, редактируйте и удаляйте турниры</li>
              <li>Управляйте статусами и настройками турниров</li>
            </ul>
          </div>

          <div id="admin-matches" class="subsection">
            <h3 @click="navigateToSection('admin-matches')">
              <i class="fas fa-gamepad"></i> Управление матчами
            </h3>
            <ul>
              <li>Создавайте и редактируйте матчи</li>
              <li>Обновляйте результаты и стадии</li>
            </ul>
          </div>

          <div id="admin-brackets" class="subsection">
            <h3 @click="navigateToSection('admin-brackets')">
              <i class="fas fa-sitemap"></i> Турнирные сетки
            </h3>
            <ul>
              <li>Создавайте и настраивайте сетки турниров</li>
              <li>Управляйте стадиями и форматами</li>
            </ul>
          </div>
        </div>
      </div>

      <div id="general" class="guide-section" v-show="!activeSection">
        <h2><i class="fas fa-info-circle"></i> Общие функции</h2>
        <div class="section-content">
          <div id="notifications" class="subsection">
            <h3 @click="navigateToSection('notifications')">
              <i class="fas fa-bell"></i> Уведомления
            </h3>
            <ul>
              <li>Получайте уведомления о предстоящих матчах</li>
              <li>Следите за обновлениями в турнирах</li>
              <li>Получайте важные сообщения от организаторов</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div id="tips" class="admin-tips" v-show="activeSection">
      <h4><i class="fas fa-lightbulb"></i> Полезные советы</h4>
      <ul>
        <li>Регулярно проверяйте раздел уведомлений для своевременной реакции на важные сообщения</li>
        <li>Используйте фильтры в каждом разделе для быстрого поиска нужной информации</li>
        <li>При возникновении спорных ситуаций обращайтесь к администраторам турнира</li>
        <li>Следите за сроками регистрации на турниры, чтобы не пропустить интересующие вас соревнования</li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HelpView',
  data() {
    return {
      activeSection: null
    }
  },
  mounted() {
    // Если в URL есть section, активируем соответствующий раздел
    const section = this.$route.query.section;
    if (section) {
      this.activeSection = section;
      this.$nextTick(() => {
        const element = document.getElementById(section);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }
  },
  methods: {
    selectSection(section) {
      this.activeSection = this.activeSection === section ? null : section;
      if (this.activeSection) {
        this.$nextTick(() => {
          const element = document.getElementById(section);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      }
    },
    navigateToSection(section) {
      // Обновляем URL с новым параметром section
      this.$router.push({ 
        query: { ...this.$route.query, section } 
      });
      
      // Прокручиваем к нужному разделу
      this.$nextTick(() => {
        const element = document.getElementById(section);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Добавляем подсветку
          element.classList.add('highlight-section');
          setTimeout(() => {
            element.classList.remove('highlight-section');
          }, 2000);
        }
      });
    }
  }
}
</script>

<style scoped>
.help-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  padding-top: 74px;
}

.welcome-section {
  text-align: center;
  margin-bottom: 40px;
  padding: 20px;
  background: rgba(13, 13, 13, 1);
  border-radius: 10px;
}

.help-title {
  color: #ffffff;
  margin-bottom: 1rem;
  font-size: 2.5rem;
}

.welcome-text {
  font-size: 1.1rem;
  color: #ffffff;
  max-width: 800px;
  margin: 0 auto;
}

/* Navigation Buttons */
.nav-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.nav-button {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 30px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.nav-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  background: linear-gradient(145deg, #630181, #9500ff);
}

.nav-button.active {
  background: linear-gradient(145deg, #630181, #9500ff);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 1, 129, 0.3);
}

.guide-sections {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.guide-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 25px;
  transition: all 0.3s ease;
  scroll-margin-top: 90px;
}

.guide-section:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.guide-section h2 {
  color: #630181;
  font-size: 1.8rem;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.guide-section h2:hover {
  color: #9500ff;
}

.section-content {
  color: #ffffff;
}

.subsection {
  margin-bottom: 20px;
  scroll-margin-top: 90px;
}

.subsection h3 {
  color: #d971f3;
  margin-bottom: 15px;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.subsection h3:hover {
  color: #9500ff;
}

.subsection ul {
  list-style-type: none;
  padding: 0;
}

.subsection li {
  margin-bottom: 10px;
  padding-left: 25px;
  position: relative;
}

.subsection li::before {
  content: "•";
  color: #d971f3;
  position: absolute;
  left: 0;
}

.admin-tips {
  background: rgba(182, 0, 254, 0.1);
  border-radius: 10px;
  padding: 25px;
  margin-top: 30px;
  scroll-margin-top: 90px;
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

/* Animation for section highlight */
@keyframes highlightPulse {
  0% { background-color: rgba(99, 1, 129, 0.1); }
  50% { background-color: rgba(99, 1, 129, 0.3); }
  100% { background-color: rgba(99, 1, 129, 0.1); }
}

.highlight-section {
  animation: highlightPulse 2s ease;
}

/* Responsive Design */
@media (max-width: 768px) {
  .help-container {
    padding: 1rem;
    padding-top: 74px;
  }

  .nav-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .nav-button {
    width: 100%;
    justify-content: center;
  }
  
  .guide-section {
    padding: 20px;
  }
  
  .welcome-section {
    padding: 15px;
  }

  .help-title {
    font-size: 2rem;
  }

  .guide-section h2 {
    font-size: 1.5rem;
  }

  .subsection h3 {
    font-size: 1.2rem;
  }
}
</style>