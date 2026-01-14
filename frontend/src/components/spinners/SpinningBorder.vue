<script setup lang="ts">
defineOptions({ inheritAttrs: false })
</script>

<template>
  <div class="bordered-box" v-bind="$attrs">
    <slot></slot>
    <div class="border"></div>
  </div>
</template>

<style scoped lang="scss">
.bordered-box {
  position: relative;
  overflow: hidden;
  width: fit-content;
  border-radius: 16px;
}

.border {
  position: absolute;
  bottom: 0;
  height: 2px;
  background:
    linear-gradient(
        90deg,
        transparent,
        color-mix(in srgb, var(--accent) 80%, #ffffff),
        rgba(255, 255, 255, 0.55),
        color-mix(in srgb, var(--accent) 80%, #ffffff),
        transparent
    );
  filter: drop-shadow(0 0 0.8rem color-mix(in srgb, var(--accent) 45%, transparent));
  animation: 4.6s move infinite;
  transform: translateZ(0);
}

@keyframes move {
  0% {
    left: 0;
    width: 0;
    opacity: 0.7;
  }
  22% {
    left: 0;
    width: 100%;
    opacity: 1;
  }
  44% {
    left: 100%;
    width: 0;
    opacity: 0.7;
  }
  50% {
    right: 0;
    width: 0;
    opacity: 0.7;
  }
  72% {
    right: 0;
    width: 100%;
    opacity: 1;
  }
  94% {
    right: 0;
    width: 0;
    opacity: 0.7;
  }
  100% {
    left: 0;
    width: 0;
    opacity: 0.7;
  }
}
</style>
