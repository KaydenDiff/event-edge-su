<template>
  <div class="sidebar">
    <h2 class="sidebar-title">Панель администратора</h2>
    <ul class="sidebar-menu">
      <li 
        @click="selectMenu('home')" 
        :class="{ selected: selectedMenu === 'home' }"
      >Как пользоваться панелью администратора</li>
      <li 
        @click="selectMenu('users')" 
        :class="{ selected: selectedMenu === 'users' }"
      >Управление пользователями</li>
      <li 
        @click="selectMenu('tournaments')" 
        :class="{ selected: selectedMenu === 'tournaments' }"
      >Управление турнирами</li>
      <li 
        @click="selectMenu('matches')" 
        :class="{ selected: selectedMenu === 'matches' }"
      >Управление матчами</li>
      <li 
        @click="selectMenu('statistics')" 
        :class="{ selected: selectedMenu === 'statistics' }"
      >Статистика</li>
      <li 
        @click="selectMenu('tournament-basket')" 
        :class="{ selected: selectedMenu === 'tournament-basket' }"
      >Турнирные сетки</li>
      <li 
        @click="selectMenu('notifications')" 
        :class="{ selected: selectedMenu === 'notifications' }"
      >Уведомления</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'AdminSidebar',
  data() {
    return {
      selectedMenu: 'home',  // Начальный пункт меню
    };
  },
  methods: {
    selectMenu(section) {
      this.selectedMenu = section;
      this.$emit('menu-selected', section);
    },
  },
};
</script>

<style scoped>
.sidebar {
  position: fixed; /* Панель фиксируется слева */
  top: 74px;
  left: 0;
  width: 250px;
  height: 100%; /* Занимает всю высоту экрана */
  color: rgb(255, 255, 255);
  padding: 20px;
}

.sidebar-title {
  font-size: 1.5em;
  text-align: center;
  margin-bottom: 20px;
}

.sidebar-menu {
  list-style-type: none;
  padding: 0;
}

.sidebar-menu li {
  cursor: pointer;
  padding: 10px 10px;
  font-size: 1.2em;
  border-bottom: 1px solid #757575;
  border-radius: 8px; 
}

.sidebar-menu li:hover {
  background-color: #747474;
}

.sidebar-menu li.selected {
  background-color: rgb(255, 255, 255);  /* Золотой цвет для выбранного пункта */
  color: rgb(0, 0, 0);  /* Белый цвет текста для выделенного пункта */
  border-radius: 8px;  /* Скругленные углы */
  padding: 15px 20px;  /* Добавляем внутренние отступы для более выразительного эффекта */
}
</style>
