<template>
  <div class="access-denied">
    <div class="content">
      <i class="fas fa-lock"></i>
      <h1>Доступ запрещен</h1>
      <p>У вас нет прав для доступа к этой странице</p>
      <div class="actions">
        <button class="back-button" @click="goBack">
          <i class="fas fa-arrow-left"></i>
          Вернуться назад
        </button>
        <button class="home-button" @click="goHome">
          <i class="fas fa-home"></i>
          На главную
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
  router.go(-1);
};

const goHome = () => {
  router.push('/');
};
</script>

<style scoped>
.access-denied {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #121212;
  padding: 20px;
}

.content {
  text-align: center;
  max-width: 500px;
  padding: 40px;
  background: #1a1a1a;
  border-radius: 15px;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.3);
}

.content i {
  font-size: 64px;
  color: #630181;
  margin-bottom: 20px;
}

h1 {
  color: #fff;
  font-size: 32px;
  margin-bottom: 15px;
}

p {
  color: #aaa;
  font-size: 18px;
  margin-bottom: 30px;
}

.actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.back-button,
.home-button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.back-button {
  background: #333;
  color: #fff;
}

.home-button {
  background: #630181;
  color: #fff;
}

.back-button:hover {
  background: #444;
  transform: translateY(-2px);
}

.home-button:hover {
  background: #7a019c;
  transform: translateY(-2px);
}

.back-button:active,
.home-button:active {
  transform: translateY(0);
}

i {
  font-size: 16px;
}
</style> 