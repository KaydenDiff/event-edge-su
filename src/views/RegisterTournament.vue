<template>
    <div class="register-container">
      <h1 class="title">Регистрация на турнир</h1>
      <div v-if="success" class="success-message">Вы успешно зарегистрировались!</div>
      <form v-else @submit.prevent="register">
        <div class="form-group">
          <label for="tournament">Турнир</label>
          <input type="text" id="tournament" v-model="form.tournament" disabled />
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="form.email" disabled />
        </div>
        <div class="form-group">
          <label for="nickname">Никнейм</label>
          <input type="text" id="nickname" v-model="form.nickname" required />
        </div>
        <div class="form-group">
          <label for="phone">Контактный номер</label>
          <input type="tel" id="phone" v-model="form.phone" required />
        </div>
        <button type="submit" class="submit-button">Подать заявку</button>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    name: "RegisterTournament",
    data() {
      return {
        success: false,
        form: {
          tournament: this.$route.params.name || "Неизвестный турнир",
          email: "user@example.com", // Заглушка, заменить на реальный email
          nickname: "",
          phone: ""
        }
      };
    },
    methods: {
      async register() {
        try {
          // Здесь должен быть реальный API-запрос
          console.log("Регистрация отправлена", this.form);
          this.success = true;
        } catch (error) {
          console.error("Ошибка регистрации", error);
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .register-container {
    max-width: 500px;
    margin: 100px auto;
    padding: 20px;
    background: #5F665E;
    border-radius: 8px;
    text-align: center;
    color: #EAEAEA;
  }
  
  .title {
    font-size: 24px;
    color: #CDAA51;
    margin-bottom: 15px;
  }
  
  .form-group {
    text-align: left;
    margin-bottom: 15px;
  }
  
  label {
    font-weight: bold;
    display: block;
    margin-bottom: 5px;
  }
  
  input {
    width: 100%;
    padding: 8px;
    border: none;
    border-radius: 5px;
    background: #9A9A9A;
    color: white;
  }
  
  .submit-button {
    padding: 10px 20px;
    background: #CDAA51;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    width: 100%;
  }
  
  .submit-button:hover {
    background: #B88F3A;
  }
  
  .success-message {
    font-size: 18px;
    color: #8A9E9C;
    font-weight: bold;
  }
  </style>
  