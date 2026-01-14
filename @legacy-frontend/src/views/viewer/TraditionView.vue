<script lang="ts">
import {Vue, Component} from 'vue-property-decorator';
import ChooseTraditionView from "@/views/editor/m20/ChooseTraditionView.vue";

@Component({
  components: {ChooseTraditionView}
})
export default class TraditionView extends Vue {

}
</script>

<template>
  <div style="width: 100%; height: 100%">
    <ChooseTraditionView :forced="true"/>
  </div>
</template>

<style scoped lang="scss">

</style>