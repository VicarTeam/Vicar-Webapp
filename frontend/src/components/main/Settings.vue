<template>
  <div style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center">
    <div class="w-500 mw-full">
      <div class="card">
        <div class="form-group">
          <label>{{$t("main.settings.language")}}</label>
          <select class="form-control" v-model="selectedLocale" @change="setLocale(selectedLocale)">
            <option v-for="lang in availableLocales" :key="lang.code" :value="lang.code">{{lang.name}}</option>
          </select>
        </div>

        <div style="width: 100%; height: 1px; background-color: rgba(255, 255, 255, 0.2); margin-top: 1rem; margin-bottom: 1.5rem"></div>

        <div class="form-group d-flex align-items-center justify-content-between">
          <button class="btn btn-primary" @click="syncData">{{$t('main.settings.syncdata')}}</button>
          <button class="btn btn-primary" @click="migrateCharacters">{{$t('main.characters.migrate')}}</button>
        </div>
        <div class="form-group d-flex align-items-center">
          <div class="custom-switch d-flex align-items-center flex-grow-1">
            <input type="checkbox" id="switch-1" v-model="devMode">
            <label for="switch-1">{{$t('main.settings.devmode')}}</label>
          </div>
          <small style="margin-top: auto">Vicar v{{appVersion}} (c) {{new Date().getFullYear()}} VicarTeam</small>
        </div>
        <div class="form-group mb-0" style="font-style: italic; width: 100%; text-align: right">
        </div>
      </div>
    </div>

    <VicarLoginModal ref="vicarLoginModal" @login="onLogin"/>
  </div>
</template>

<script lang="ts">
import {Component, Ref, Vue} from "vue-property-decorator";
import {AVAILABLE_LOCALES, i18n, setLocale} from "@/libs/i18n";
import {SettingsData} from "@/libs/io/settings";
import CharacterStorage from "@/libs/io/character-storage";
import {DataSync} from "@/libs/data/data-sync";
import {VicarNet} from "@/libs/io/vicar-net";
import VicarLoginModal from "@/components/main/modals/VicarLoginModal.vue";
import {VicarSync} from "@/libs/io/vicar-sync";

@Component({
  components: {VicarLoginModal}
})
export default class Settings extends Vue {

  @Ref("vicarLoginModal")
  private vicarLoginModal!: VicarLoginModal;

  private availableLocales = AVAILABLE_LOCALES;
  private setLocale = setLocale;
  private VicarNet = VicarNet;

  private selectedLocale = "";

  mounted() {
    this.selectedLocale = i18n.locale;
  }

  private async syncData() {
    await DataSync.sync(true);
  }

  private async migrateCharacters() {
    await CharacterStorage.migrateCharacters();
  }

  private get devMode(): boolean {
    return SettingsData.isDevMode();
  }

  private set devMode(value: boolean) {
    SettingsData.setDevMode(value);
  }

  private get appVersion(): string {
    return process.env.VERSION!;
  }

  private get vicarNetUrl(): string {
    return SettingsData.getVicarNetUrl();
  }

  private set vicarNetUrl(value: string) {
    SettingsData.setVicarNetUrl(value);
  }

  private logout() {
    VicarSync.stopRetrieveInterval();
    VicarNet.logout();
    this.$forceUpdate();
  }

  private onLogin() {
    this.$forceUpdate();
    VicarSync.startRetrieveInterval();
  }
}
</script>

<style scoped lang="scss">

</style>
