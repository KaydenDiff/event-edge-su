<script setup>
import { RouterView } from 'vue-router'
import Header from "@/components/Header.vue";
</script>

<template>


  <div class="container">
    <Header />
    <RouterView />
  </div>
</template>

<style scoped>
  .container {
    margin: 0 auto;
    max-width: 1440px;
    padding: 0 10px;
  }
</style>
