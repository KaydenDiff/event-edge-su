<script setup>
import { RouterView, useRoute } from 'vue-router'
import Header from "@/components/Header.vue";
import Bar from "@/components/Bar.vue";
import { computed, ref, provide } from 'vue';

const route = useRoute();

// Определяем, на каких страницах показывать секцию с играми
const showGamesSection = computed(() => {
  const routesWithGames = ['/tournaments'];
  return routesWithGames.includes(route.path);
});

// Определяем, находимся ли мы на странице админ-панели
const isAdminRoute = computed(() => {
  return route.path === '/admin';
});

// Создаем реактивные ссылки для данных
const games = ref([]);
const selectedGames = ref([]);
const selectedMenu = ref('home');

// Предоставляем данные всем дочерним компонентам
provide('games', games);
provide('selectedGames', selectedGames);
provide('selectedMenu', selectedMenu);

// Обработчик выбора игры
const handleGameSelected = (gameName) => {
  const index = selectedGames.value.indexOf(gameName);
  if (index === -1) {
    selectedGames.value.push(gameName);
  } else {
    selectedGames.value.splice(index, 1);
  }
};

// Обработчик выбора пункта меню админ-панели
const handleMenuSelected = (section) => {
  selectedMenu.value = section;
};
</script>

<template>
 <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">

  <div class="container">
    <Header />
    <Bar 
      :show-games-section="showGamesSection"
      :games="games"
      :selected-games="selectedGames"
      :selected-menu="selectedMenu"
      :is-admin-route="isAdminRoute"
      @game-selected="handleGameSelected"
      @menu-selected="handleMenuSelected"
    />
    <RouterView :selected-menu="selectedMenu" />
  </div>
</template>

<style scoped>
  .container {
    margin: 0 auto;
   
    max-width: 1440px;
    padding: 10px 10px;
  }
</style>
