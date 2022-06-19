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
        <div class="form-group mb-0" style="font-style: italic; width: 100%; text-align: right">
          <small>Vicar v{{appVersion}} (c) {{new Date().getFullYear()}} VicarTeam</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import {AVAILABLE_LOCALES, i18n, setLocale} from "@/libs/i18n";

@Component({
  components: {}
})
export default class Settings extends Vue {

  availableLocales = AVAILABLE_LOCALES;
  setLocale = setLocale;

  private selectedLocale = "";

  mounted() {
    this.selectedLocale = i18n.locale;
  }

  private get appVersion(): string {
    return process.env.VERSION;
  }
}
</script>

<style scoped lang="scss">

</style>
