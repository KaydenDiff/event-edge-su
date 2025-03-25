<template>
  <section class="tournaments">
    <h2 class="text-3xl font-bold text-center mb-8">Все турниры</h2>

    <div class="filter-buttons-container">
  <BaseButton @click="toggleFilterVisibility" class="details-button">
    Фильтрация
  </BaseButton>

  <BaseButton @click="resetFilters" class="details-button reset-button">
    Сбросить фильтры
  </BaseButton>
</div>

   <div v-if="showSearch" class="search-container">
  <input 
    type="text" 
    v-model="searchQuery" 
    @input="fetchGameSuggestions"
    placeholder="Введите название игры..."
    class="search-input"
  >

  <ul v-if="gameSuggestions.length > 0" class="suggestions">
    <li 
      v-for="game in gameSuggestions" 
      :key="game.id" 
      @click="selectGame(game.name)"
      v-html="game.highlightedName"
    ></li>
  </ul>
</div>

    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="!loading && !error" class="tournament-list">
      <div 
        v-for="tournament in filteredTournaments" 
        :key="tournament.id" 
        class="tournament-card"
      >
        <div class="tournament-image-wrapper">
          <img :src="getImageUrl(tournament.image)" alt="Изображение турнира" class="tournament-img">
        </div>
        <div class="tournament-info">
          <h3 class="tournament-name">{{ tournament.name }}</h3>
          <p class="game-name">Игра: {{ tournament.game.name }}</p>
          <p class="organizer-name">Организатор: {{ tournament.organizer.name }}</p>
          <p class="status">Статус: {{ tournament.status_name }}</p>
          <p class="description">{{ tournament.description }}</p>
          <BaseButton :to="'/tournaments/' + tournament.id" customClass="details-button">
            Подробнее
          </BaseButton>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useTournaments } from '@/api/methods/composables/useTournaments';
import BaseButton from "@/components/BaseButton.vue";
import axios from "axios";

const { tournaments, loading, error } = useTournaments();
const searchQuery = ref(""); // Поисковый запрос
const gameSuggestions = ref([]); // Подсказки для игр
const selectedGame = ref(""); // Выбранная игра
const showActiveOnly = ref(false);
const showSearch = ref(false); // Видимость строки поиска

// Функция переключения видимости поиска
const toggleFilterVisibility = () => {
  showSearch.value = !showSearch.value;
};

// Сброс фильтров
const resetFilters = () => {
  searchQuery.value = "";
  selectedGame.value = "";
  showActiveOnly.value = false;
  gameSuggestions.value = [];
};

// Функция получения подсказок для игр
const fetchGameSuggestions = async () => {
  if (searchQuery.value.length < 2) {
    gameSuggestions.value = [];
    return;
  }

  try {
    const response = await axios.get(`http://event-edge-su/api/guest/games`);
    
    const query = searchQuery.value.toLowerCase();
    gameSuggestions.value = response.data
      .filter(game => game.name.toLowerCase().includes(query))
      .map(game => ({
        ...game,
        highlightedName: highlightMatch(game.name, query),
      }));
  } catch (err) {
    console.error("Ошибка загрузки игр:", err);
  }
};

// Подсветка совпадений
const highlightMatch = (name, query) => {
  const regex = new RegExp(`(${query})`, "gi");
  return name.replace(regex, '<span class="highlighted">$1</span>');
};

// Выбор игры из списка
const selectGame = (gameName) => {
  selectedGame.value = gameName;
  searchQuery.value = gameName;
  gameSuggestions.value = [];
};

// Фильтрация турниров
const filteredTournaments = computed(() => {
  let filtered = tournaments.value;

  if (selectedGame.value) {
    filtered = filtered.filter(tournament => tournament.game.name.includes(selectedGame.value));
  }

  if (showActiveOnly.value) {
    filtered = filtered.filter(tournament => tournament.status === "active");
  }

  return filtered;
});

// Обработчик изображений
const getImageUrl = (path) => {
  if (!path) {
    return "https://via.placeholder.com/300x200?text=No+Image";
  }
  return path.startsWith('http') ? path : `http://event-edge-su/storage/${path}`;
};
</script>

<style scoped>

.tournaments {
  max-width: 1200px;
  margin: 50px auto;
  padding: 20px;
}

.filter-toggle-btn {
  display: block;
  margin: 20px auto;
  padding: 10px 20px;
  font-size: 1.2rem;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.filter-toggle-btn:hover {
  background-color: #0056b3;
}
.details-button {
  margin-top: 10px;
  background-color: #ffffff;
  color: #000;
  padding: 8px 16px; /* уменьшение отступов */
  border-radius: 8px; /* уменьшение радиуса */
  font-size: 1rem; /* уменьшение размера шрифта */
  font-weight: bold;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  border: 3px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease-in-out;
  position: relative;
  overflow: hidden;
  z-index: 1;
}


.details-button:hover {
  animation: pulseBorder 1.5s infinite ease-in-out;
  transform: scale(1.05);
  background-color: #000;
  color: #fff;
}

.details-button:active {
  transform: scale(0.95);
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
.game-filter {
  display: flex;
  gap: 30px;
}

.filter-column {
  flex: 1;
}

.filter-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin: 10px auto;
  color: #fff;
}

.game-checkbox {
  display: flex;
  align-items: center;
  padding: 5px;
  gap: 10px;
  color: #fff;
}

.game-checkbox input {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 20px; /* Размер галочки */
  height: 20px;
  border-radius: 4px; /* Радиус углов */
  background-color: #ddd; /* Цвет фона, когда не выбрано */
  border: 2px solid #bbb; /* Граница чекбокса */
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.game-checkbox input:checked {
  background-color: #270544; /* Зеленый фон, когда выбран */
  border-color: #270544; /* Зеленая граница */
}

.game-checkbox input:checked::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 14px;
  border: solid white;
  border-width: 0 3px 3px 0;
  transform: translate(-50%, -50%) rotate(45deg); /* Центрируем галочку */
}

.game-checkbox input:hover {
  background-color: #270544; /* Цвет фона при наведении */
}

.game-checkbox input:active {
  background-color: #270544; /* Цвет фона при активации */
}
.status-checkbox input {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 20px; /* Размер галочки */
  height: 20px;
  border-radius: 4px; /* Радиус углов */
  background-color: #ddd; /* Цвет фона, когда не выбрано */
  border: 2px solid #bbb; /* Граница чекбокса */
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.status-checkbox input:checked {
  background-color: #270544; /* Зеленый фон, когда выбран */
  border-color: #270544; /* Зеленая граница */
}

.status-checkbox input:checked::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 14px;
  border: solid white;
  border-width: 0 3px 3px 0;
  transform: translate(-50%, -50%) rotate(45deg); /* Центрируем галочку */
}

.status-checkbox input:hover {
  background-color: #270544; /* Цвет фона при наведении */
}

.status-checkbox input:active {
  background-color: #270544; /* Цвет фона при активации */
}
.status-checkbox {
  display: flex;
  align-items: center;  /* Выравнивание по вертикали */
  color: #fff;
  font-size: 1rem;
}

.status-checkbox input {
  margin-right: 10px;  /* Отступ между чекбоксом и текстом */
}

.tournament-list {
  margin-top: 50px;
  display: flex;
  flex-direction: column;
  gap: 50px;
}

.tournament-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
  padding: 20px;
  border-radius: 15px;
  background: #222;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.tournament-card:hover {
  transform: scale(1.02);
}

.tournament-image {
  flex: 1;
  max-width: 40%;
}
.tournament-image img {
  width: 100%;
  height: auto;
  border-radius: 10px;
}

.tournament-info {
  flex: 2;
  max-width: 50%;
  color: #fff;
}

.tournament-name {
  font-size: 1.8rem;
  font-weight: bold;
}

.game-name, .organizer-name, .description, .status {
  font-size: 1rem;
  color: #ccc;
  margin: 5px 0;
}

/* Мобильные стили */
@media (max-width: 768px) {
  .tournament-card {
    flex-direction: column;
    text-align: center;
  }


}
.tournament-image {
    max-width: 80%;
  }

  .tournament-info {
    max-width: 100%;
  }
  .search-container {
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 20px auto 20px; /* Добавлен отступ сверху */
  transition: all 0.3s ease;
}

.search-input {
  width: 100%;
  padding: 14px;
  font-size: 1.2rem;
  border: 2px solid #bbb;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.search-input:focus {
  width: 110%;
  font-size: 1.4rem;
  border-color: #270544;
}

.suggestions {
  position: absolute;
  width: 100%;
  background: white;
  color: #000;
  border: 1px solid #ccc;
  border-radius: 10px;
  list-style: none;
  padding: 5px;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.suggestions li {
  padding: 12px;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: background 0.2s;
}

.suggestions li:hover {
  background: #eee;
}

.highlighted {
  background-color: yellow;
  color: black;
  font-weight: bold;
  padding: 2px 4px;
  border-radius: 3px;
}
.game-logo {
  width: 30px;
  height: 30px;
  object-fit: cover;
  border-radius: 4px;
}

.details-button {
  margin-top: 10px;
  background-color: #ffffff;
  color: #000;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  border: 3px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease-in-out;
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.details-button:hover {
  animation: pulseBorder 1.5s infinite ease-in-out;
  transform: scale(1.05);
  background-color: #000;
  color: #fff;
}

.details-button:active {
  transform: scale(0.95);
}

/* Новое правило для создания отступа между кнопками */
.details-button + .details-button {
  margin-left: 10px; /* добавляем отступ между кнопками */
}
.filter-buttons-container {
  display: flex;
  gap: 10px; /* Расстояние между кнопками */
  justify-content: center;
  margin-top: 10px; /* или любое другое значение для отступа сверху */
}
</style>
