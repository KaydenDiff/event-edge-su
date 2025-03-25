<script setup>
defineProps({
  type: {
    required: false,
    type: String,
    default: 'button'
  }
})
</script>

<template>
  <button :type="type" class="button">
    <slot />
  </button>
</template>

<style scoped>
  .button {
    cursor: pointer;
    padding: 10px 15px;
    border-radius: 5px;

    border: 2px solid var(--secondary-color);
    background-color: var(--secondary-bg);
    color: white;
    font-weight: bold;

    transition: .15s linear all;
  }

  .button:hover {
    border: 2px solid var(--color-pink);
    background-color: transparent;
  }

  .button:active {
    border: 2px solid var(--color-pink);
    background-color: var(--color-pink);
  }
  .details-button {
  background-color: #fff;
  color: #000;
  padding: 8px 20px;
  border-radius: 8px;
  text-decoration: none;
  display: inline-block;
}

.details-button:hover {
  background-color: #000;
  color: #fff;
}
</style>