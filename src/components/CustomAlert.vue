<template>
    <div v-if="visible" :class="['custom-alert', type]" class="custom-alert">
      <div class="alert-content">
        <span>{{ message }}</span>
        <button @click="closeAlert" class="btn-close">Закрыть</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'CustomAlert',
    props: {
      message: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        default: 'success', // success, error, info
      },
    },
    data() {
      return {
        visible: false,
      };
    },
    methods: {
      showAlert() {
        this.visible = true;
        setTimeout(this.closeAlert, 5000); // Скрыть через 5 секунд
      },
      closeAlert() {
        this.visible = false;
      },
    },
    watch: {
      message(newMessage) {
        if (newMessage) {
          this.showAlert();
        }
      },
    },
    updated() {
      if (this.message) {
        this.showAlert();
      }
    }
  };
  </script>
  
  <style scoped>
  .custom-alert {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #28a745;
    color: white;
    padding: 15px 30px;
    border-radius: 5px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    font-size: 16px;
    z-index: 1000;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: opacity 0.3s ease-in-out;
  }
  
  .custom-alert.hidden {
    display: none;
  }
  
  .custom-alert.success {
    background-color: #28a745;
  }
  
  .custom-alert.error {
    background-color: #dc3545;
  }
  
  .custom-alert.info {
    background-color: #17a2b8;
  }
  
  .custom-alert .btn-close {
    background: none;
    border: none;
    color: white;
    font-size: 18px;
    cursor: pointer;
    margin-left: 15px;
  }
  </style>
  