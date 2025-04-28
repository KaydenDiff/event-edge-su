<template>
  <div class="game-carousel">
    <swiper
      :slides-per-view="1"
      :space-between="30"
      :navigation="{
        nextEl: '.swiper-button-next-custom',
        prevEl: '.swiper-button-prev-custom'
      }"
      :pagination="{
        el: '.swiper-pagination-custom',
        clickable: true
      }"
      loop
      class="mySwiper"
    >
      <swiper-slide v-for="game in games" :key="game.id">
        <div class="slide-content" :style="{ backgroundImage: game.logo ? `url(${apiUrl + game.logo})` : '' }">
          <div class="slide-overlay">
            <div class="slide-info">
              <h2>{{ game.name }}</h2>
              <p>{{ game.description }}</p>
            </div>
          </div>
        </div>
      </swiper-slide>
      <!-- Кастомные кнопки -->
      <div class="swiper-button-prev-custom"></div>
      <div class="swiper-button-next-custom"></div>
      <!-- Кастомная пагинация -->
      <div class="swiper-pagination-custom"></div>
    </swiper>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import 'swiper/css/navigation'

const apiUrl = 'http://event-edge-su'
const games = ref([])

onMounted(async () => {
  const res = await fetch(`${apiUrl}/api/guest/games`)
  games.value = await res.json()
})
</script>

<style scoped>
.game-carousel {
 
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  margin-top: 200px;
  border-radius: 30px;
  overflow: hidden;
  background: #111;
  position: relative;
}
.slide-content {
  display: flex;
  align-items: center;
  min-height: 320px;
  background-size: cover;
  background-position: center;
  position: relative;
  border-radius: 30px;
}
.slide-overlay {
  min-width: 520px;
  min-height: 260px;
  background: rgba(0,0,0,0.92);
  border-radius: 32px;
  margin-left: 80px;
  display: flex;
  align-items: center;
  box-shadow: 0 8px 32px rgba(0,0,0,0.25);
}
.slide-info {
  color: #fff;
  padding: 48px 40px;
  max-width: 420px;
}
.slide-info h2 {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 2rem;
  letter-spacing: 2px;
}
.slide-info p {
  font-size: 1.15rem;
  font-weight: 500;
}

/* Кастомные кнопки */
.swiper-button-prev-custom,
.swiper-button-next-custom {
  position: absolute;
  z-index: 10;
  width: 44px;
  height: 44px;
  background: rgba(0,0,0,0.7);
  border-radius: 50%;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  cursor: pointer;
  transition: background 0.2s;
  user-select: none;
}
.swiper-button-prev-custom {
  right: 24px;
  bottom: 24px;
  left: unset;
  top: unset;
}
.swiper-button-next-custom {
  right: 24px;
  top: 24px;
  left: unset;
  bottom: unset;
}
.swiper-button-prev-custom::after {
  content: '‹';
}
.swiper-button-next-custom::after {
  content: '›';
}

/* Пагинация (точки) */
.swiper-pagination-custom {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 24px;
  margin: 0 auto;
  text-align: center;
  z-index: 10;
}
.swiper-pagination-custom .swiper-pagination-bullet {
  width: 12px;
  height: 12px;
  background: #fff;
  opacity: 0.5;
  border-radius: 50%;
  margin: 0 6px;
  display: inline-block;
  transition: opacity 0.2s, background 0.2s;
}
.swiper-pagination-custom .swiper-pagination-bullet-active {
  opacity: 1;
  background: #fff;
}
</style>