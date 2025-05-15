<template>
    <div class="admin-panel">
      <div class="main-content">
        <h2>Управление турнирами</h2>
        <div v-if="!tournaments || tournaments.length === 0">Нет турниров</div>
        <div v-else>
          <div v-for="tournament in tournaments" :key="tournament.id" class="tournament-card">
            <TournamentCard :tournament="tournament" @deleteTournament="deleteTournament" />
            <div class="tournament-popularity">
              <label>
                <input type="checkbox" v-model="tournament.isPopular" :disabled="popularCount >= 3 && !tournament.isPopular" />
                Популярный
              </label>
              <span v-if="popularCount >= 3 && !tournament.isPopular" class="warning-text">
                Вы можете выбрать не более 3 популярных турниров!
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import TournamentCard from '../components/TournamentCard.vue';
  import { ref, onMounted, computed } from 'vue';
  
  export default {
    name: 'AdminTournaments',
    components: {
      TournamentCard
    },
    setup() {
      const tournaments = ref([]);
      onMounted(() => {
        tournaments.value = [
          { id: 1, name: 'Tournament 1', status: 'active', isPopular: false },
          { id: 2, name: 'Tournament 2', status: 'completed', isPopular: false },
          { id: 3, name: 'Tournament 3', status: 'active', isPopular: false },
          { id: 4, name: 'Tournament 4', status: 'active', isPopular: false },
        ];
      });
  
      const popularCount = computed(() => {
        return tournaments.value.filter(tournament => tournament.isPopular).length;
      });
  
      const deleteTournament = (tournamentId) => {
        alert(`Tournament ${tournamentId} deleted`);
      };
  
      return {
        tournaments,
        popularCount,
        deleteTournament
      };
    }
  };
  </script>
  
  <style scoped>
  .tournament-card {
    margin-bottom: 15px;
  }
  
  .tournament-popularity {
    margin-top: 10px;
  }
  
  .warning-text {
    color: red;
    font-size: 14px;
  }
  </style>
  