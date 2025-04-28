<template>
  <div class="organize-section">
    <div class="organize-content">
      <h2>Организуйте свой турнир</h2>
      <p>Хотите провести собственный турнир? Это просто!</p>
      <div class="features">
        <div class="feature">
          <i class="fas fa-trophy"></i>
          <h3>Создайте турнир</h3>
          <p>Настройте правила, формат и призы</p>
        </div>
        <div class="feature">
          <i class="fas fa-users"></i>
          <h3>Пригласите участников</h3>
          <p>Пригласите друзей или откройте регистрацию для всех</p>
        </div>
        <div class="feature">
          <i class="fas fa-calendar-alt"></i>
          <h3>Управляйте расписанием</h3>
          <p>Удобное управление матчами и расписанием</p>
        </div>
      </div>
      <button @click="goToCreateTournament" class="create-button">
        Создать турнир
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goToCreateTournament = () => {
  router.push('/organize-tournament');
};
</script>

<style scoped>
.organize-section {
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  padding: 4rem 2rem;
  margin: 2rem auto;
  max-width: 80%;
}

.organize-content {
  margin: 0 auto;
  text-align: center;
}

h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #fff;
}

p {
  font-size: 1.2rem;
  color: #ccc;
  margin-bottom: 3rem;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.feature {
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  transition: transform 0.3s ease;
}

.feature:hover {
  transform: translateY(-5px);
}

.feature i {
  font-size: 2.5rem;
  color: #630181;
  margin-bottom: 1rem;
}

.feature h3 {
  color: #fff;
  margin-bottom: 0.5rem;
}

.feature p {
  color: #ccc;
  margin: 0;
  font-size: 1rem;
}

.create-button {
  background: #630181;
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.create-button:hover {
  background: #630181;
}
</style> 