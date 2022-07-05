<template>
  <WrappedSpinner>
    <i>{{$t(`loading.state.${i18nKey}`)}}</i>
  </WrappedSpinner>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import Spinner from "@/components/spinners/Spinner.vue";
import {UpdateState} from "@/libs/backend";
import DataManager from "@/libs/data-manager";
import CharacterStorage from "@/libs/io/character-storage";
import WrappedSpinner from "@/components/spinners/WrappedSpinner.vue";

@Component({
  components: {WrappedSpinner, Spinner}
})
export default class LoadingView extends Vue {

  private state: UpdateState = UpdateState.Initializing;

  async mounted() {

    this.state = UpdateState.LoadingData;
    await DataManager.load();

    this.state = UpdateState.LoadingCharacters;
    await CharacterStorage.initialize();

    this.state = UpdateState.Finishing;
    await this.$router.push({name: 'main'});
  }

  private get i18nKey() {
    return UpdateState[this.state].toLowerCase();
  }
}
</script>
