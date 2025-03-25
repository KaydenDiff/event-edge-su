<template>
    <div class="tournament-card">
      <p>{{ tournament.name }} ({{ tournament.status_name }})</p>
    </div>
  </template>
  
  <script>
  export default {
    name: 'TournamentCard',
    props: {
      tournament: Object,
    },
    methods: {
    
    },
  };
  </script>
  
  <style scoped>
  .tournament-card {
    border: 1px solid #ddd;
    padding: 10px;
    margin-bottom: 10px;
  }
  
  button {
    margin-top: 10px;
  }
  </style>