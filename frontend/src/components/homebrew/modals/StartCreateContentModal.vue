<script lang="ts">
import {Vue, Component, Watch} from 'vue-property-decorator';
import Modal from "@/components/modal/Modal.vue";
import {VicarNet} from "@/libs/io/vicar-net";
import {HomebrewManager} from "@/libs/data/homebrew-manager";
import {IClan} from "@/types/models";
import DataManager from "@/libs/data/data-manager";

@Component({
  components: {Modal}
})
export default class StartCreateContentModal extends Vue {

  private visible: boolean = false;
  private loading: boolean = false;

  private type: "clans"|"disciplines" = "clans";
  private clanPreset: IClan|null = null;
  private name: string = "";
  private description: string = "";
  private slogan: string = "";
  private curse: string = "";
  private symbol: string = "";

  public show() {
    this.type = "clans";
    this.name = "";
    this.description = "";
    this.slogan = "";
    this.curse = "";
    this.symbol = "";
    this.clanPreset = null;
    this.visible = true;
  }

  private async submit() {
    if (!this.canCreate) {
      return;
    }

    this.loading = true;

    try {
      if (this.type === "clans") {
        await this.createClan();
      } else {
        await this.createDiscipline();
      }
    } finally {
      this.loading = false;
    }
  }

  private async createClan() {
    const res = await VicarNet.createClan({
      id: undefined!,
      name: this.name,
      curse: this.curse,
      slogan: this.slogan,
      symbol: this.symbol,
      description: this.description,
      creator: undefined!,
      disciplines: this.clanPreset ? this.clanPreset.disciplines.map(d => d.id) : []
    });

    if (res) {
      HomebrewManager.updateOwnClan(res);
      await this.$router.push({path: `/homebrew/clan-editor/${res.id}`});
      this.visible = false;
    }
  }

  private async createDiscipline() {
    const res = await VicarNet.createDiscipline({
      id: -1,
      name: this.name,
      summary: this.description,
      creator: undefined!,
      levels: {}
    });

    if (res) {
      HomebrewManager.updateOwnDiscipline(res);
      await this.$router.push({path: `/homebrew/discipline-editor/${res.id}`});
      this.visible = false;
    }
  }

  private get canCreate(): boolean {
    if (this.loading) {
      return false;
    }

    if (this.type === "disciplines") {
      return this.name.length > 0 && this.description.length > 0;
    }

    return this.name.length > 0 && this.description.length > 0 && this.slogan.length > 0 && this.curse.length > 0 && this.symbol.length > 0;
  }

  private get clans(): IClan[] {
    return DataManager.selectedLanguage.books.map(book => book.clans).flat().filter(b => b.id >= 0).sort((a, b) => a.name.localeCompare(b.name));
  }

  @Watch("clanPreset")
  private onClanPresetChanged() {
    if (this.clanPreset) {
      this.name = this.clanPreset.name;
      this.slogan = this.clanPreset.slogan;
      this.curse = this.clanPreset.curse;
      this.symbol = this.clanPreset.symbol || "";
      this.description = this.clanPreset.description;
    } else {
      this.name = "";
      this.slogan = "";
      this.curse = "";
      this.symbol = "";
      this.description = "";
    }
  }
}
</script>

<template>
  <Modal :shown="visible" @close="visible = false">
    <div class="w-400" style="display: flex; flex-direction: column; gap: 1rem">
      <h6 class="text-center mb-0" style="margin-top: 0"><b>{{$t('homebrew.create')}}</b></h6>
      <div class="form-group mb-0">
        <label>{{$t('homebrew.create.type')}}:</label>
        <select class="form-control" v-model="type">
          <option value="clans">{{$t('homebrew.create.type.clans')}}</option>
          <option value="disciplines">{{$t('homebrew.create.type.disciplines')}}</option>
        </select>
      </div>

      <div class="form-group m-0" v-if="type === 'clans'">
        <label>{{$t('homebrew.create.clan.preset')}}:</label>
        <select class="form-control" v-model="clanPreset">
          <option :value="null">{{$t('homebrew.create.clan.preset.none')}}</option>
          <option v-for="clan in clans" :value="clan">{{clan.name}}</option>
        </select>
      </div>

      <div class="form-group mb-0">
        <label>{{$t('homebrew.create.name')}}:</label>
        <input class="form-control" v-model="name"/>
      </div>
      <template v-if="type === 'clans'">
        <div class="form-group mb-0">
          <label>{{$t('homebrew.create.clan.slogan')}}:</label>
          <input class="form-control" v-model="slogan"/>
        </div>
        <div class="form-group mb-0">
          <label>{{$t('homebrew.create.clan.symbol')}}:</label>
          <input class="form-control" v-model="symbol"/>
        </div>
        <div class="form-group mb-0">
          <label>{{$t('homebrew.create.clan.bane')}}:</label>
          <textarea class="form-control" v-model="curse" style="resize: vertical"/>
        </div>
      </template>
      <div class="form-group mb-0">
        <label>{{$t('homebrew.create.description')}}:</label>
        <textarea class="form-control" v-model="description" style="resize: vertical"/>
      </div>
      <div style="display: flex; justify-content: center; align-items: center; margin-top: 1rem">
        <button class="btn btn-primary" :disabled="!canCreate" @click="submit">{{$t('homebrew.create.submit')}}</button>
      </div>
    </div>
  </Modal>
</template>