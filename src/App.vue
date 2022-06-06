<template>
  <div class="page-wrapper">
    <div class="content-wrapper">
      <router-view/>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";

@Component({
  components: {}
})
export default class App extends Vue {

  async mounted() {

  }
}
</script>
