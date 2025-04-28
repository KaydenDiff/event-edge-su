<template>
  <div class="news-announcement">
    <div class="announcement-content">
      <div class="icon-container">
        <i class="fas fa-mobile-alt"></i>
      </div>
      <div class="text-content">
        <h2 class="announcement-title">Хотите следить за новыми турнирами?</h2>
        <p class="announcement-text">Скачайте наше приложение с GitHub и будьте в курсе всех анонсов!</p>
      </div>
      <div class="download-buttons">
        <BaseButton
          href="https://github.com/kaydenDiff/reactapp/releases"
          target="_blank"
          customClass="github-button"
        >
          <i class="fab fa-github"></i>
          Перейти на GitHub
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script>
import BaseButton from "@/components/BaseButton.vue";

export default {
  name: "NewsAnnouncement",
  components: {
    BaseButton,
  },
};
</script>

<style scoped>
.news-announcement {
  margin: 80px auto;
  padding: 0 20px;
  max-width: 1000px;
}

.announcement-content {
  position: relative;
  padding: 40px;
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(38, 38, 38, 0.95) 100%);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 40px;
  overflow: hidden;
}

.announcement-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #630181, transparent);
}

.icon-container {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  background: rgba(182, 0, 254, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #630181;
}

.icon-container i {
  font-size: 32px;
}

.text-content {
  flex-grow: 1;
}

.announcement-title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #ffffff;
  line-height: 1.3;
}

.announcement-text {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 0;
  line-height: 1.6;
}

.download-buttons {
  flex-shrink: 0;
}

.github-button {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  background: #630181;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(182, 0, 254, 0.3);
}

.github-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(182, 0, 254, 0.4); 
}

.github-button i {
  font-size: 20px;
}

@media (max-width: 768px) {
  .announcement-content {
    flex-direction: column;
    text-align: center;
    padding: 30px 20px;
    gap: 20px;
  }

  .icon-container {
    margin: 0 auto;
  }

  .announcement-title {
    font-size: 24px;
  }

  .announcement-text {
    font-size: 15px;
  }
}
</style>