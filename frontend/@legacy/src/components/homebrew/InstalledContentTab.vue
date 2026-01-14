<script lang="ts">
import {Vue, Component, Inject} from 'vue-property-decorator';
import IconButton from "@/components/IconButton.vue";
import Spinner from "@/components/spinners/Spinner.vue";
import {IHomebrewClan, IHomebrewDiscipline} from "@/types/data";
import {HomebrewManager} from "@/libs/data/homebrew-manager";

@Component({
  components: {Spinner, IconButton}
})
export default class InstalledContentTab extends Vue {

  @Inject("confirm")
  private confirm!: (msg: string) => Promise<boolean>;

  private get clans(): IHomebrewClan[] {
    return HomebrewManager.installedContent.clans;
  }

  private get disciplines() {
    return HomebrewManager.installedContent.disciplines;
  }

  private async uninstallClan(clan: IHomebrewClan) {
    if (!await this.confirm(this.$t('homebrew.uninstall.confirm', {name: clan.name}) as string)) {
      return;
    }

    await HomebrewManager.uninstallClan(clan);

    this.$forceUpdate();
  }

  private async uninstallDiscipline(discipline: IHomebrewDiscipline) {
    if (!await this.confirm(this.$t('homebrew.uninstall.confirm', {name: discipline.name}) as string)) {
      return;
    }

    await HomebrewManager.uninstallDiscipline(discipline);

    this.$forceUpdate();
  }
}
</script>

<template>
  <div style="display: flex; flex-grow: 1; height: 100%">
    <div style="display: flex; width: 100%; height: 100%">
      <div style="display: flex; flex-direction: column; width: 50%">
        <div style="display: flex; justify-content: center; align-items: center; border-bottom: 1px solid var(--primary-color)">
          <h4 style="margin: 0; padding: 0.5rem 1rem; font-size: 1.2rem; font-weight: bold; color: var(--primary-color)">{{$t('homebrew.tabs.mycontent.clans')}}</h4>
        </div>
        <div style="flex-grow: 1; height: 100%; overflow-x: hidden; overflow-y: auto; display: flex; flex-direction: column">
          <div v-for="c in clans" style="display: flex; padding: 0.5rem 1rem; align-items: center; cursor: pointer">
            <span style="font-size: 1.3rem; flex-grow: 1">{{c.name}}</span>
            <div style="flex-shrink: 0; display: flex; gap: 0.5rem">
              <IconButton icon="fas fa-x" style="width: 2rem; height: 2rem; font-size: 1rem" @click="uninstallClan(c)"/>
            </div>
          </div>
        </div>
      </div>
      <div style="width: 1px; height: 100%; background-color: var(--primary-color)"></div>
      <div style="display: flex; flex-direction: column; width: 50%">
        <div style="display: flex; justify-content: center; align-items: center; border-bottom: 1px solid var(--primary-color)">
          <h4 style="margin: 0; padding: 0.5rem 1rem; font-size: 1.2rem; font-weight: bold; color: var(--primary-color)">{{$t('homebrew.tabs.mycontent.disciplines')}}</h4>
        </div>
        <div style="flex-grow: 1; height: 100%; overflow-x: hidden; overflow-y: auto; display: flex; flex-direction: column">
          <div v-for="d in disciplines" style="display: flex; padding: 0.5rem 1rem; align-items: center; cursor: pointer">
            <span style="font-size: 1.3rem; flex-grow: 1">{{d.name}}</span>
            <div style="flex-shrink: 0; display: flex; gap: 0.5rem">
              <IconButton icon="fas fa-x" style="width: 2rem; height: 2rem; font-size: 1rem" @click="uninstallDiscipline(d)"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>