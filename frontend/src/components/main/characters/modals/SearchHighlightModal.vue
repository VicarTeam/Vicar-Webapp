<script lang="ts">
import {Vue, Component} from 'vue-property-decorator';
import Modal from "@/components/modal/Modal.vue";
import {AttributeKeys, ICharacter} from "@/types/models";
import Dropdown, {IOption} from "@/components/Dropdown.vue";

const HIGHLIGHT_SKILL = "hlsk-";
const HIGHLIGHT_ATTRIBUTE = "hlat-";
const HIGHLIGHT_STAT = "hlst-";
const HIGHLIGHT_DISCIPLINE = "hldc-";

@Component({
  components: {Dropdown, Modal}
})
export default class SearchHighlightModal extends Vue {

  private show: boolean = false;
  private character: ICharacter = null!;
  private highlight: string|null = null;

  public showModal(character: ICharacter) {
    this.character = character;
    this.highlight = null;
    this.show = true;
  }

  private get options(): IOption[] {
    const opts: IOption[] = [];

    for (const c of this.character.categories) {
      opts.push({
        name: this.$t('data.category.' + c.name).toString(),
        value: '',
        isCategory: true
      });

      const skillOpts: IOption[] = [];
      for (const i of c.skills) {
        skillOpts.push({
          name: this.$t('data.skill.' + i.key).toString() + ` (${i.value})`,
          value: HIGHLIGHT_SKILL + i.key
        });
      }
      opts.push(...skillOpts.sort((a, b) => a.name.localeCompare(b.name)));
    }

    if (this.character.disciplines.length > 0) {
      opts.push({
        name: this.$t('editor.clan.disciplines').toString(),
        value: '',
        isCategory: true
      });

      const discOpts: IOption[] = [];
      for (const i of this.character.disciplines) {
        discOpts.push({
          name: i.discipline.name + ` (${i.currentLevel})`,
          value: HIGHLIGHT_DISCIPLINE + i.discipline.id
        });
      }

      opts.push(...discOpts.sort((a, b) => a.name.localeCompare(b.name)));
    }

    const opt = (key: AttributeKeys) => {
      return {
        name: this.$t(`data.attribute.${key}`).toString() + ` (${this.getAttrVal(key)})`,
        value: HIGHLIGHT_ATTRIBUTE + key
      };
    }

    opts.push({
      name: this.$t('viewer.tab.attributes').toString(),
      value: '',
      isCategory: true
    });

    opts.push(opt(AttributeKeys.Strength));
    opts.push(opt(AttributeKeys.Dexterity));
    opts.push(opt(AttributeKeys.Stamina));
    opts.push(opt(AttributeKeys.Charisma));
    opts.push(opt(AttributeKeys.Manipulation));
    opts.push(opt(AttributeKeys.Composure));
    opts.push(opt(AttributeKeys.Intelligence));
    opts.push(opt(AttributeKeys.Wits));
    opts.push(opt(AttributeKeys.Resolve));

    opts.push({
      name: this.$t('character.modal.search-highlight.stats').toString(),
      value: '',
      isCategory: true
    });
    opts.push({
      name: this.$t('character.health').toString(),
      value: 'hlst-health',
    });
    opts.push({
      name: this.$t('character.willpower').toString(),
      value: 'hlst-willpower',
    });
    opts.push({
      name: this.$t('character.bloodpotency').toString(),
      value: 'hlst-blood',
    });
    opts.push({
      name: this.$t('character.humanity').toString(),
      value: 'hlst-humanity',
    });
    opts.push({
      name: this.$t('character.hunger').toString(),
      value: 'hlst-hunger',
    });

    return opts;
  }

  private getAttrVal(attr: AttributeKeys): number {
    for (const i of this.character.categories) {
      for (const j of i.attributes) {
        if (j.key === attr) {
          return j.value;
        }
      }
    }

    return 0;
  }

  private reset() {
    this.show = false;
    this.highlight = null;
    setTimeout(() => {
      this.show = true;
    }, 10);
  }

  private async jump() {
    if (!this.highlight) {
      return;
    }

    const route = this.$router.currentRoute.name;
    if (this.highlight.startsWith(HIGHLIGHT_DISCIPLINE) && route !== "viewer-disciplines") {
      await this.$router.push({name: "viewer-disciplines"});
    } else if (this.highlight.startsWith(HIGHLIGHT_SKILL) && route !== "viewer-skills") {
      await this.$router.push({name: "viewer-skills"});
    } else if (this.highlight.startsWith(HIGHLIGHT_ATTRIBUTE) && route !== "viewer-attributes") {
      await this.$router.push({name: "viewer-attributes"});
    } else if (this.highlight.startsWith(HIGHLIGHT_STAT) && route !== "viewer-profile") {
      await this.$router.push({name: "viewer-profile"});
    }

    const id = this.highlight;
    setTimeout(() => {
      const el = document.getElementById(id);
      if (!el) {
        return;
      }

      let count = 0;
      const interval = setInterval(() => {
        if (count >= 5) {
          clearInterval(interval);
          el.classList.remove('vicar-highlight');
          return;
        }
        if (el) {
          el.classList.toggle('vicar-highlight');
        }
        count++;
      }, 500);
    }, 10);

    this.show = false;
  }
}
</script>

<template>
  <Modal :shown="show" @close="show = false" v-if="character">
    <div class="w-400 d-flex justify-content-center align-items-center flex-column" style="gap: 0.5rem">
      <b>{{$t('character.modal.search-highlight')}}:</b>
      <Dropdown v-if="show" :options="options" v-model="highlight" :placeholder="$t('character.modal.search-highlight.search')" :autofocus="true"/>

      <div style="display: flex; flex-direction: row; gap: 1rem; justify-content: center; align-items: center; margin-top: 1.5rem">
        <button class="btn" @click="reset">
          {{$t('character.modal.search-highlight.reset')}}
        </button>
        <button class="btn btn-primary" @click="jump">
          {{$t('character.modal.search-highlight.jump')}}
        </button>
      </div>
    </div>
  </Modal>
</template>

<style scoped lang="scss">

</style>