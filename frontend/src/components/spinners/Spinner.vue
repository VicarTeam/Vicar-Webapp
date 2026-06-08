<script setup lang="ts">
defineOptions({ inheritAttrs: false })

defineProps<{
  sizeRem?: number
}>()
</script>

<template>
  <div class="spinner-wrapper" v-bind="$attrs">
    <img alt="spinner" src="/img/ankh.png" class="spinner-img" />
  </div>
</template>

<style scoped lang="scss">
.spinner-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: min(30rem, 80vw);
  height: min(30rem, 80vw);
}

.spinner-img {
  -webkit-user-drag: none;
  width: 100%;
  height: auto;
  max-width: 30rem;
  animation: 4.8s breath infinite;
  filter: drop-shadow(0 0 0 color-mix(in srgb, var(--accent) 75%, transparent));
  transform: translateZ(0);
}

@keyframes breath {
  0% {
    opacity: 0;
    transform: scale(0.84);
    filter: drop-shadow(0 0 0 color-mix(in srgb, var(--accent) 75%, transparent));
  }
  45% {
    opacity: 1;
    transform: scale(1);
    filter: drop-shadow(0 0 1.2rem color-mix(in srgb, var(--accent) 65%, transparent));
  }
  55% {
    opacity: 1;
    transform: scale(1);
    filter: drop-shadow(0 0 1.2rem color-mix(in srgb, var(--accent) 65%, transparent));
  }
  100% {
    opacity: 0;
    transform: scale(0.84);
    filter: drop-shadow(0 0 0 color-mix(in srgb, var(--accent) 75%, transparent));
  }
}

@media (max-width: 520px) {
  .spinner-wrapper {
    width: min(18rem, 78vw);
    height: min(18rem, 78vw);
  }
}
</style>
