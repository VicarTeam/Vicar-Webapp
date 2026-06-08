<template>
  <div style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center">
    <div class="w-500 mw-full">
      <div class="card">
<!--        <div class="form-group">
          <label>{{$t("main.settings.language")}}</label>
          <select class="form-control" v-model="selectedLocale" @change="setLocale(selectedLocale)">
            <option v-for="lang in availableLocales" :key="lang.code" :value="lang.code">{{lang.name}}</option>
          </select>
        </div>-->

<!--        <div v-if="DataManager.loggedInAs" style="width: 100%; height: 1px; background-color: rgba(255, 255, 255, 0.2); margin-top: 1rem; margin-bottom: 1.5rem"></div>-->
        <p v-if="DataManager.loggedInAs">
          {{$t('settings.logged-in-as')}}<b>{{DataManager.loggedInAs}}</b>
        </p>
        <button v-if="DataManager.loggedInAs" class="btn btn-primary" style="width: 100%" @click="logout">{{$t('settings.logout')}}</button>

        <div v-if="DataManager.loggedInAs" style="width: 100%; height: 1px; background-color: rgba(255, 255, 255, 0.2); margin-top: 1rem; margin-bottom: 1.5rem"></div>
        <p v-if="DataManager.loggedInAs">Passwort ändern:</p>
        <input v-if="DataManager.loggedInAs" type="password" class="form-control" placeholder="Altes Passwort (leerlassen wenn neu)" v-model="oldPassword"/>
        <input v-if="DataManager.loggedInAs" type="password" class="form-control" placeholder="Neues Passwort" v-model="newPassword" style="margin-top: 1rem"/>
        <input v-if="DataManager.loggedInAs" type="password" class="form-control" placeholder="Passwort wiederholen" v-model="newPasswordRepeat" style="margin: 1rem 0 1rem 0"/>
        <button v-if="DataManager.loggedInAs" class="btn btn-primary" style="width: 100%" :disabled="!canChangePassword" @click="changePassword">Speichern</button>

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
          <small style="margin-top: auto">Vicar (c) 2022-{{new Date().getFullYear()}} VicarTeam</small>
        </div>
        <div class="form-group mb-0" style="font-style: italic; width: 100%; text-align: right">
        </div>
      </div>
    </div>
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
import DataManager from "@/libs/data/data-manager";
import {post} from "@/libs/io/rest";
import {logout} from "@/libs/auth";

@Component({
  computed: {
    DataManager() {
      return DataManager
    }
  },
  components: {VicarLoginModal}
})
export default class Settings extends Vue {

  @Ref("vicarLoginModal")
  private vicarLoginModal!: VicarLoginModal;

  private availableLocales = AVAILABLE_LOCALES;
  private setLocale = setLocale;
  private VicarNet = VicarNet;

  private selectedLocale = "";

  private oldPassword = "";
  private newPassword = "";
  private newPasswordRepeat = "";

  async mounted() {
    await DataManager.loadLogin();
    this.selectedLocale = i18n.locale;

    this.$forceUpdate();
  }

  private async syncData() {
    await DataSync.sync(true);
  }

  private async migrateCharacters() {
    await CharacterStorage.migrateCharacters();
  }

  private async changePassword() {
    if (!this.canChangePassword) {
      return;
    }

    const success = await DataManager.changeUserPassword(this.newPassword, this.oldPassword);
    if (!success) {
      alert("Fehler beim Ändern des Passworts");
      return;
    }

    this.oldPassword = "";
    this.newPassword = "";
    this.newPasswordRepeat = "";
  }

  private get devMode(): boolean {
    return SettingsData.isDevMode();
  }

  private set devMode(value: boolean) {
    SettingsData.setDevMode(value);
  }

  private get canChangePassword(): boolean {
    return this.newPassword.length > 0 && this.newPassword === this.newPasswordRepeat;
  }

  private async logout() {
    const [status] = await post(`/auth/logout`);
    if (status < 400) {
      await logout();
      window.location.reload();
    }
  }
}
</script>

<style scoped lang="scss">

</style>
