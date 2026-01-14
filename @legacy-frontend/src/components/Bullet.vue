<template>
  <span class="bullet" v-bind="$attrs">&#8226;</span>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";

@Component({
  components: {}
})
export default class Bullet extends Vue {
}
</script>

<style scoped lang="scss">
.bullet {
  color: var(--primary-color);
}
</style>
