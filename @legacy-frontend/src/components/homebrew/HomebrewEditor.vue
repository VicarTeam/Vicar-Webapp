<script lang="ts">
import {Vue, Component, Prop} from 'vue-property-decorator';
import VText from "@/components/text/VText.vue";
import IconButton from "@/components/IconButton.vue";

@Component({
  components: {IconButton, VText}
})
export default class HomebrewEditor extends Vue {

  @Prop({required: true})
  private subject!: any|null;

  @Prop({required: true})
  private notFoundMessage!: string;

  @Prop({default: 'name'})
  private nameKey!: string;

  @Prop({default: false})
  private canSave!: boolean;

  @Prop({required: true})
  private onSave!: () => Promise<boolean>;

  @Prop({default: false})
  private isSpecialEnabled!: boolean;

  @Prop({default: ''})
  private specialIcon!: string;

  private loading: boolean = false;

  private backToHomebrew() {
    this.$router.push({name: "main", query: {specific: "homebrew", tab: "tab-mycontent"}});
  }

  private async submitSave() {
    if (this.loading) {
      return;
    }

    if (!this.canSave) {
      return;
    }

    try {
      this.loading = true;

      if (await this.onSave()) {
        this.backToHomebrew();
      }
    } finally {
      this.loading = false;
    }
  }

  private get title(): string {
    if (this.subject) {
      return this.subject[this.nameKey];
    }

    return this.notFoundMessage;
  }
}
</script>

<template>
  <div class="hb-editor">
    <div class="hb-editor--header">
      <div class="actions"></div>
      <div class="title">
        <VText :text="title"/>
        <IconButton v-if="isSpecialEnabled" :icon="specialIcon" @click="$emit('special')" style="width: 2rem; height: 2rem; font-size: 1rem"/>
      </div>
      <div class="actions" style="justify-content: flex-end">
        <IconButton icon="fas fa-x" style="width: 2.5rem; height: 2.5rem; font-size: 1.2rem" @click="backToHomebrew"/>
        <IconButton v-if="subject" :disabled="loading || !canSave" icon="fas fa-check" style="width: 2.5rem; height: 2.5rem; font-size: 1.2rem" @click="submitSave"/>
      </div>
    </div>
    <div class="hb-editor--content" v-if="subject">
      <slot/>
    </div>
  </div>
</template>

<style scoped lang="scss">
.hb-editor {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .hb-editor--header {
    padding: 0.5rem 1rem;
    border-bottom: 1px solid var(--primary-color);
    display: flex;
    align-items: center;
    .actions {
      width: 25%;
      display: flex;
      gap: 0.5rem;
    }
    .title {
      width: 50%;
      text-align: center;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.5rem;
    }
  }
  .hb-editor--content {
    flex-grow: 1;
    overflow-x: hidden;
    overflow-y: auto;
  }
}
</style>