<template>
  <div class="home-page">
    <PopularTournaments :tournaments="popularTournaments" :loading="loading" :error="error" />
    <UpcomingTournaments :tournaments="upcomingTournaments" :loading="loading" :error="error" />
    <OrganizeTournamentSection />
    <StatisticsSection :tournaments="totalTournaments" :players="totalPlayers" :matches="totalMatches" />
    <NotificationButton />
    <NewsAnnouncement />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import PopularTournaments from "@/components/PopularTournaments.vue";
import UpcomingTournaments from "@/components/UpcomingTournaments.vue";
import StatisticsSection from "@/components/StatisticsSection.vue";
import NewsAnnouncement from "@/components/NewsAnnouncement.vue";
import NotificationButton from "@/components/NotificationButton.vue";
import OrganizeTournamentSection from "@/components/sections/OrganizeTournamentSection.vue";

const router = useRouter();
const popularTournaments = ref([]);
const upcomingTournaments = ref([]);
const loading = ref(true);
const error = ref(null);
const totalTournaments = ref(0);
const totalPlayers = ref(0);
const totalMatches = ref(0);

const fetchPopularTournaments = async () => {
  try {
    const response = await fetch("http://event-edge-su/api/guest/popular-tournaments");
    if (!response.ok) throw new Error("Ошибка загрузки данных");
    const data = await response.json();
    popularTournaments.value = data.map(tournament => ({
      ...tournament,
      image: tournament.image || 'default-tournament-bg.jpg'
    }));
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const fetchStatistics = async () => {
  try {
    const response = await fetch("http://event-edge-su/api/guest/statistics");
    if (!response.ok) throw new Error("Ошибка загрузки статистики");
    const data = await response.json();
    totalTournaments.value = data.tournaments_count;
    totalPlayers.value = data.players_count;
    totalMatches.value = data.matches_count;
  } catch (err) {
    error.value = err.message;
  }
};

const fetchTournaments = async () => {
  try {
    const response = await fetch("http://event-edge-su/api/guest/tournaments");
    if (!response.ok) throw new Error("Ошибка загрузки данных");
    const data = await response.json();

    const today = new Date();
    const twoWeeksLater = new Date();
    twoWeeksLater.setDate(today.getDate() + 14); // +14 дней

    // Фильтрация турниров, которые начинаются в ближайшие 14 дней
    upcomingTournaments.value = data
      .filter(t => {
        const startDate = new Date(t.start_date);
        return startDate >= today && startDate <= twoWeeksLater;
      })
      .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const goToTournaments = () => {
  router.push("/tournaments");
};

onMounted(() => {
  fetchPopularTournaments();
  fetchTournaments();
  fetchStatistics();
});
</script>

<style scoped>
.home-page {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #fff;
  scrollbar-width: none;
}
.home-page::-webkit-scrollbar {
  display: none;
}
</style>
