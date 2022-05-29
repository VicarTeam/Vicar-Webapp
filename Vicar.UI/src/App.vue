<template>
  <div class="page-wrapper">
    <div class="content-wrapper">
      <router-view/>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import {Backend} from "@/libs/backend";

@Component({
  components: {}
})
export default class App extends Vue {
  
  async mounted() {
      await Backend.updateData(state => {
        console.log("Data Update State: " + state);
      });
  }
}
</script>
