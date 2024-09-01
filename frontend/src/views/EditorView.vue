<template>
  <div class="editor-view">
    <router-view/>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";

@Component({
  components: {}
})
export default class EditorView extends Vue {
}
</script>

<style scoped lang="scss">
.editor-view {
  width: 100%;
  height: 100%;
}
</style>
