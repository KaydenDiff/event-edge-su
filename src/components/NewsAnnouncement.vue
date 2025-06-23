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
          href="https://github.com/KaydenDiff/Event-edge-mobile"
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
  margin: 2rem auto;
  padding: 0 1rem;
  max-width: 1000px;
}

.announcement-content {
  position: relative;
  padding: 2rem;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  border-radius: 10px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 2rem;
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
  width: 60px;
  height: 60px;
  background: rgba(182, 0, 254, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #630181;
}

.icon-container i {
  font-size: 24px;
}

.text-content {
  flex-grow: 1;
}

.announcement-title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #ffffff;
  line-height: 1.3;
}

.announcement-text {
  font-size: 1rem;
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
  padding: 1rem 2rem;
  background: #630181;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
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
  font-size: 1.5rem;
}

@media (max-width: 1024px) {
  .news-announcement {
    display: flex;
    justify-content: center;
  }

  .announcement-content {
    flex-direction: column;
    text-align: center;
    padding: 1rem;
    gap: 1rem;
    width: 70%;
  }

  .icon-container {
    margin: 0 auto;
    width: 50px;
    height: 50px;
  }

  .icon-container i {
    font-size: 20px;
  }

  .announcement-title {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  .announcement-text {
    font-size: 0.9rem;
  }

  .download-buttons {
    margin-top: 0.5rem;
  }

  .github-button {
    padding: 0.8rem 1.5rem;
    font-size: 0.9rem;
  }

  .github-button i {
    font-size: 1.2rem;
  }
}
</style>
