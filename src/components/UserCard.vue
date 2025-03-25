<template>
    <div class="user-card">
      <p>{{ user.name }} ({{ user.role }})</p>
      <p>Status: {{ user.status }}</p>
      <button @click="banUser">Забанить</button>
      <button @click="changeRole('admin')">Сделать админом</button>
    </div>
  </template>
  
  <script>
  export default {
    name: 'UserCard',
    props: {
      user: Object,
    },
    methods: {
      banUser() {
        this.$emit('banUser', this.user.id);
      },
      changeRole(newRole) {
        this.$emit('changeRole', this.user.id, newRole);
      },
    },
  };
  </script>
  
  <style scoped>
  .user-card {
    border: 1px solid #ddd;
    padding: 10px;
    margin-bottom: 10px;
  }
  
  button {
    margin-top: 10px;
    margin-right: 10px;
  }
  </style>