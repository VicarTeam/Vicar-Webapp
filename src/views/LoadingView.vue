<template>
  <div class="loading-wrapper">
    <div class="loader">
      <Spinner/>
      <i>{{$t(`loading.state.${i18nKey}`)}}</i>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import Spinner from "@/components/spinners/Spinner.vue";
import {UpdateState} from "@/libs/backend";
import DataManager from "@/libs/data-manager";
import CharacterStorage from "@/libs/io/character-storage";

@Component({
  components: {Spinner}
})
export default class LoadingView extends Vue {

  private state: UpdateState = UpdateState.Initializing;

  async mounted() {

    this.state = UpdateState.LoadingData;
    await DataManager.load();

    this.state = UpdateState.LoadingCharacters;
    CharacterStorage.initialize();

    this.state = UpdateState.Finishing;
    await this.$router.push({name: 'main'});
  }

  private get i18nKey() {
    return UpdateState[this.state].toLowerCase();
  }
}
</script>

<style scoped lang="scss">
.loading-wrapper {
  user-select: none;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  .loader {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    i {
      font-size: 1.7rem;
      flex-shrink: 0;
      margin-top: 10px;
    }
  }
}
</style>
