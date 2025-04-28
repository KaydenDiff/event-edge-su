<template>
  <div class="register-container">
    <h1 class="title">Регистрация на турнир "{{ form.tournament }}"</h1>
    <div v-if="success" class="success-message">Вы успешно зарегистрировались!</div>
    <div v-else-if="loading" class="loading-message">Загрузка данных...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <form v-else @submit.prevent="register">
      <div class="form-group">
        <label for="tournament">Турнир</label>
        <input type="text" id="tournament" :value="form.tournament" disabled />
      </div>
      <div class="form-group">
        <label for="team">Команда</label>
        <input type="text" id="team" :value="form.team" disabled />
      </div>
      <BaseButton 
        type="submit"
        customClass="register-button"
      >
        Подать заявку
      </BaseButton>
    </form>
  </div>
</template>

<script>
import BaseButton from '@/components/BaseButton.vue';

export default {
  name: "RegisterTournament",
  components: {
    BaseButton
  },
  props: {
    tournamentId: {
      type: [String, Number],
      required: true
    },
    tournamentName: {
      type: String,
      default: "Неизвестный турнир"
    }
  },
  data() {
    return {
      success: false,
      loading: true,
      error: null,
      userProfile: null,
      form: {
        tournament: this.tournamentName,
        team: "",
        teamId: null
      }
    };
  },
  async created() {
    try {
      const authStore = useAuthStore();
      const token = authStore.accessToken;
      if (!token) {
        this.error = "Требуется авторизация";
        this.loading = false;
        return;
      }

      // Загружаем профиль пользователя
      const response = await fetch('http://event-edge-su/api/my-profile', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Ошибка загрузки профиля');
      }
      
      this.userProfile = await response.json();
      
      // Заполняем форму данными из профиля
      this.form.team = this.userProfile.user.team?.name || "Не в команде";
      this.form.teamId = this.userProfile.user.team?.id || null;
      
      this.loading = false;
    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
      this.error = `Не удалось загрузить данные: ${error.message}`;
      this.loading = false;
    }
  },
  methods: {
    async register() {
      try {
        // Формируем данные для отправки
        const registrationData = {
          tournament_id: this.tournamentId,
          team_id: this.form.teamId
        };
        const authStore = useAuthStore();
        const token = authStore.accessToken;
        if (!token) {
          this.error = "Требуется авторизация";
          this.loading = false;
          return;
        }
        const response = await fetch('http://event-edge-su/api/tournament/notify-registration', {
          method: 'POST',
          headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
          body: JSON.stringify(registrationData)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Ошибка регистрации');
        }

        const result = await response.json();
        console.log("Успешная регистрация", result);
        this.success = true;
      } catch (error) {
        console.error("Ошибка регистрации", error);
        this.error = `Ошибка регистрации: ${error.message}`;
      }
    }
  }
};
</script>

<style scoped>
.register-container {
  padding: 30px 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #000;
  color: #fff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  scrollbar-width: none;
}

.register-container::-webkit-scrollbar {
  display: none;
}

form {
  max-width: 500px;
  width: 100%;
  padding: 30px;
  background: #4d4d4d;
  border-radius: 15px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.title {
  font-size: 28px;
  color: #ffffff;
  margin-bottom: 30px;
  text-align: center;
  font-weight: bold;
}

.form-group {
  margin-bottom: 25px;
}

label {
  display: block;
  font-size: 16px;
  color: #ffffff;
  margin-bottom: 8px;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 12px;
  border: 2px solid #666;
  border-radius: 8px;
  background: #333;
  color: #fff;
  font-size: 16px;
  transition: all 0.3s ease;
}

input:disabled {
  background: #2a2a2a;
  cursor: not-allowed;
}

.register-button {
  width: 100%;
  margin-top: 20px;
}

.success-message {
  font-size: 18px;
  color: #4CAF50;
  background: rgba(76, 175, 80, 0.1);
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: bold;
}

.loading-message {
  font-size: 18px;
  color: #630181;
  text-align: center;
  margin: 20px 0;
}

.error-message {
  font-size: 18px;
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: bold;
}

/* Анимация для сообщений */
.success-message,
.error-message,
.loading-message {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>