<template>
  <div class="help-container">
    <div class="welcome-section">
      <h1 class="help-title">Инструкция по использованию сайта</h1>
      <p class="welcome-text">
        Здесь вы найдете подробное руководство по использованию всех функций турнирной системы. Выберите интересующий вас раздел для получения детальной информации.
      </p>
    </div>
    
    <div class="guide-sections">
      <div class="guide-section">
        <h2><i class="fas fa-user"></i> Для игроков</h2>
        <div class="section-content">
          <div class="subsection">
            <h3><i class="fas fa-user-plus"></i> Регистрация и профиль</h3>
            <ul>
              <li>Зарегистрируйтесь на сайте, заполнив форму регистрации</li>
              <li>После регистрации вы можете заполнить свой профиль игрока</li>
              <li>В профиле вы можете указать свои достижения, статистику и предпочитаемые игры</li>
            </ul>
          </div>

          <div class="subsection">
            <h3><i class="fas fa-trophy"></i> Участие в турнирах</h3>
            <ul>
              <li>Просматривайте доступные турниры на главной странице</li>
              <li>Выбирайте интересующие вас турниры и регистрируйтесь на них</li>
              <li>Следите за своими матчами в разделе "Мои матчи"</li>
              <li>Проверяйте турнирную сетку и результаты в деталях турнира</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="guide-section">
        <h2><i class="fas fa-cogs"></i> Для организаторов</h2>
        <div class="section-content">
          <div class="subsection">
            <h3><i class="fas fa-plus-circle"></i> Создание турниров</h3>
            <ul>
              <li>Перейдите в раздел "Создать турнир"</li>
              <li>Заполните информацию о турнире (название, даты, правила)</li>
              <li>Настройте формат турнира и систему начисления очков</li>
              <li>Управляйте участниками и матчами через панель организатора</li>
            </ul>
          </div>

          <div class="subsection">
            <h3><i class="fas fa-tasks"></i> Управление турниром</h3>
            <ul>
              <li>Отслеживайте регистрацию участников</li>
              <li>Формируйте турнирную сетку</li>
              <li>Вводите результаты матчей</li>
              <li>Коммуницируйте с участниками через систему уведомлений</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="guide-section">
        <h2><i class="fas fa-info-circle"></i> Общие функции</h2>
        <div class="section-content">
          <div class="subsection">
            <h3><i class="fas fa-bell"></i> Уведомления</h3>
            <ul>
              <li>Получайте уведомления о предстоящих матчах</li>
              <li>Следите за обновлениями в турнирах</li>
              <li>Получайте важные сообщения от организаторов</li>
            </ul>
          </div>

        </div>
      </div>
    </div>

    <div class="admin-tips">
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
  name: 'HelpView'
}
</script>

<style scoped>
.help-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  padding-top: 74px; /* Отступ сверху для фиксированного хедера */
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

.guide-section h2 {
  color: #630181;
  font-size: 1.8rem;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.guide-section h2 i {
  font-size: 1.4rem;
}

.section-content {
  color: #ffffff;
}

.subsection {
  margin-bottom: 20px;
}

.subsection h3 {
  color: #d971f3;
  margin-bottom: 15px;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.subsection h3 i {
  font-size: 1.2rem;
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
  .help-container {
    padding: 1rem;
    padding-top: 74px;
  }

  .guide-sections {
    grid-template-columns: 1fr;
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