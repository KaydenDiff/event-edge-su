<template>
  <!-- Если href задан, рендерим ссылку, иначе кнопку -->
  <a 
    v-if="href"
    :href="href"
    :target="target"
    :class="['base-button', customClass]"
    class="base-button"
  >
    <slot></slot>
  </a>
  <button 
    v-else
    :class="['base-button', customClass]" 
    @click="handleClick"
  >
    <slot></slot>
  </button>
</template>

<script setup>
import { useRouter } from "vue-router";

const props = defineProps({
  customClass: {
    type: String,
    default: "",
  },
  href: {
    type: String,
    required: false,  // href теперь необязателен
  },
  target: {
    type: String,
    default: "_self", // если target не указан, открываем ссылку в текущем окне
  },
  to: {
    type: [String, Object],
    required: false,  // Путь теперь необязателен
  },
});

const router = useRouter();

const handleClick = () => {
  if (props.to) {
    router.push(props.to);  // Если путь указан, переходим по нему
  }
};
</script>

<style scoped>
.base-button {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-family: inherit;
  cursor: pointer;
  background: #ffffff;
  color: #000;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s ease-in-out;
  outline: none;
  border: 3px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  z-index: 1;
  text-decoration: none;
  min-width: 120px;
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

/* Применение эффекта */
.base-button:hover {
  animation: pulseBorder 1.5s infinite ease-in-out;
  transform: scale(1.05);
  background: #630181;
  color: #fff;
}

.base-button:active {
  transform: scale(0.95);
}
</style>
