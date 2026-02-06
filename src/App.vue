<script setup lang="ts">
</script>

<template>
  <div id="root-layout">
    <router-view />
  </div>
</template>

<style scoped lang="scss">
#root-layout {
  width: 100vw;
  height: 100vh;
  background-color: var(--color-bg-page);
  color: var(--color-text-primary);
  display: flex;
  flex-direction: column;
}
</style>
