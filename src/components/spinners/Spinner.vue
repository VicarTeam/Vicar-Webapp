<template>
  <div class="spinner-wrapper">
    <img alt="spinner" src="@/assets/img/ankh.png" style="height: 30rem"/>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";

@Component({
  components: {}
})
export default class Spinner extends Vue {
}
</script>

<style scoped lang="scss">
.spinner-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 30rem;
  height: 30rem;
  img {
    -webkit-user-drag: none;
    animation: 5s breath infinite;
  }
}

@keyframes breath {
  0% {
    opacity: 0;
    height: 25rem;
    filter: drop-shadow(0 0 0 var(--primary-color));
  }
  45% {
    opacity: 1;
    height: 30rem;
    filter: drop-shadow(0 0 1rem var(--primary-color));
  }
  55% {
    opacity: 1;
    height: 30rem;
    filter: drop-shadow(0 0 1rem var(--primary-color));
  }
  100% {
    opacity: 0;
    height: 25rem;
    filter: drop-shadow(0 0 0 var(--primary-color));
  }
}
</style>