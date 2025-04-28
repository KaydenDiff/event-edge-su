<template>
    <footer class="footer">
      <div class="container">
        <p class="footer-text">
          Наша платформа помогает игрокам находить турниры, а организаторам — легко их создавать.  
          Развивай свои киберспортивные навыки вместе с нами!
        </p>
        <div class="social-links">
          <a href="https://vk.com" target="_blank" class="social-link">
            <img src="@/assets/vk-svgrepo-com.svg" alt="VK" />
          </a>
          <a href="https://t.me" target="_blank" class="social-link">
            <img src="@/assets/telegram-svgrepo-com.svg" alt="Telegram" />
          </a>
        </div>
      </div>
    </footer>
  </template>
  
  <script>
  export default {
    name: "FooterComponent",
  };
  </script>
  
  <style scoped>
  .footer {
    background-color: #ffffff;
    color: #000000;
    text-align: center;
    padding: 20px 0;
    
    width: 100%;
  }
  
  .container {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .footer-text {
    font-size: 16px;
    line-height: 1.5;
    margin-bottom: 15px;
  }
  
  .social-links {
    display: flex;
    justify-content: center;
    gap: 15px;
  }
  
  .social-link img {
    width: 30px;
    height: 30px;
    transition: opacity 0.3s ease;
  }
  
  .social-link img:hover {
    opacity: 0.7;
  }
  </style>
  