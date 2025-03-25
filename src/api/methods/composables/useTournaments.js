import { ref, onMounted } from 'vue';

export function useTournaments() {
  const tournaments = ref([]);
  const loading = ref(true);
  const error = ref(null);

  const fetchTournaments = async () => {
    try {
      const response = await fetch('http://event-edge-su/api/guest/tournaments');
      if (!response.ok) throw new Error('Ошибка при загрузке данных');
      tournaments.value = await response.json();
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  onMounted(fetchTournaments);

  return { tournaments, loading, error };
}