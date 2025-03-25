<script setup>
  defineProps({
    submit: {
      type: Function,
      required: false
    },
    method: {
      type: String,
      required: false,
      default: 'GET',
    }
  })
</script>

<template>
  <form class="form"
        :method="method"
        @submit.prevent="submit">
    <slot />
  </form>
</template>

<style scoped>
  .form {
    padding: 20px 50px;
    border-radius: 10px;
    background-color: var(--secondary-bg);

    display: flex;
    gap: 12px;
    align-items: center;
    flex-direction: column;
  }
</style>