<template>
  <section class="statistics">
    <h2 class="section-title">Статистика турниров</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <h3>{{ tournaments }}</h3>
        <p>Турниров проведено</p>
      </div>
      <div class="stat-card">
        <h3>{{ players }}</h3>
        <p>Игроков зарегистрировано</p>
      </div>
      <div class="stat-card">
        <h3>{{ matches }}</h3>
        <p>Матчей сыграно</p>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  tournaments: Number,
  players: Number,
  matches: Number
});
</script>

<style scoped>
.statistics {
  max-width: 80%;
  margin: 80px auto;
  padding: 0 20px;
}

.section-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 30px;
  color: #ffffff;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}

.stat-card {
  background-color: #1a1a1a;
  padding: 30px;
  border-radius: 15px;
  text-align: center;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-card h3 {
  font-size: 2.5rem;
  font-weight: bold;
  color: #630181;
  margin-bottom: 10px;
}

.stat-card p {
  font-size: 1.1rem;
  color: #ffffff;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
  