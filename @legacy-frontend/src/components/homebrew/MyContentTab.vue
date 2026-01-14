<script lang="ts">
import {Vue, Component} from 'vue-property-decorator';
import Spinner from "@/components/spinners/Spinner.vue";
import {IHomebrewClan, IHomebrewDiscipline} from "@/types/data";
import {VicarNet} from "@/libs/io/vicar-net";
import IconButton from "@/components/IconButton.vue";
import {HomebrewManager} from "@/libs/data/homebrew-manager";

@Component({
  components: {IconButton, Spinner}
})
export default class MyContentTab extends Vue {

  private loading: boolean = true;
  private clans: IHomebrewClan[] = [];
  private disciplines: IHomebrewDiscipline[] = [];

  async mounted() {
    await this.loadContent();
  }

  private async loadContent() {
    try {
      this.loading = true;

      const {clans, disciplines} = await VicarNet.getMyContent();
      this.clans = clans;
      this.disciplines = disciplines;

      for (const clan of this.clans) {
        await HomebrewManager.updateOwnClan(clan);
      }

      for (const discipline of this.disciplines) {
        await HomebrewManager.updateOwnDiscipline(discipline);
      }
    } finally {
      this.$nextTick(() => this.loading = false);
    }
  }

  private editClan(clan: IHomebrewClan) {
    this.$router.push({path: `/homebrew/clan-editor/${clan.id}`});
  }

  private editDiscipline(discipline: IHomebrewDiscipline) {
    this.$router.push({path: `/homebrew/discipline-editor/${discipline.id}`});
  }

  private async createClanInviteCode(clan: IHomebrewClan) {
    const code = await VicarNet.generateAccessCodeForClan(clan);
    if (code) {
      await navigator.clipboard.writeText(code);
    }
  }

  private async createDisciplineInviteCode(discipline: IHomebrewDiscipline) {
    const code = await VicarNet.generateAccessCodeForDiscipline(discipline);
    if (code) {
      await navigator.clipboard.writeText(code);
    }
  }
}
</script>

<template>
  <div style="display: flex; flex-grow: 1; height: 100%">
    <div v-if="loading" style="display: flex; justify-content: center; align-items: center; width: 100%; height: 100%">
      <Spinner />
    </div>
    <div v-else style="display: flex; width: 100%; height: 100%">
      <div style="display: flex; flex-direction: column; width: 50%">
        <div style="display: flex; justify-content: center; align-items: center; border-bottom: 1px solid var(--primary-color)">
          <h4 style="margin: 0; padding: 0.5rem 1rem; font-size: 1.2rem; font-weight: bold; color: var(--primary-color)">{{$t('homebrew.tabs.mycontent.clans')}}</h4>
        </div>
        <div style="flex-grow: 1; height: 100%; overflow-x: hidden; overflow-y: auto; display: flex; flex-direction: column">
          <div v-for="c in clans" style="display: flex; padding: 0.5rem 1rem; align-items: center; cursor: pointer">
            <span style="font-size: 1.3rem; flex-grow: 1">{{c.name}}</span>
            <div style="flex-shrink: 0; display: flex; gap: 0.5rem">
              <IconButton icon="fas fa-envelope" style="width: 2rem; height: 2rem; font-size: 1rem" @click="createClanInviteCode(c)"/>
              <IconButton icon="fas fa-pen" style="width: 2rem; height: 2rem; font-size: 1rem" @click="editClan(c)"/>
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
              <IconButton icon="fas fa-envelope" style="width: 2rem; height: 2rem; font-size: 1rem" @click="createDisciplineInviteCode(d)"/>
              <IconButton icon="fas fa-pen" style="width: 2rem; height: 2rem; font-size: 1rem" @click="editDiscipline(d)"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>