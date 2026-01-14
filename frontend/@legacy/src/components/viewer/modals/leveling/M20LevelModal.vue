<script lang="ts">
import {Vue, Component} from 'vue-property-decorator';
import {State} from "vuex-class";
import Modal from "@/components/modal/Modal.vue";
import Bullet from "@/components/Bullet.vue";
import {IM20Tradition, IMageSheet, M20Ability, M20Attribute, M20Sphere} from "@/types/m20";
import CharacterStorage from "@/libs/io/character-storage";
import {LevelChangeType} from "@/types/gameline";

type LevelType = 'attribute'|'ability'|'sphere'|'arete'|'willpower'|'';
type Subject = M20Ability | M20Attribute | M20Sphere | undefined;

@Component({
  components: {Bullet, Modal}
})
export default class M20LevelModal extends Vue {

  @State("editingCharacter")
  private editingCharacter!: IMageSheet;

  private modalKey: string = '';
  private show: boolean = false;
  private type: LevelType = 'attribute';
  private subject?: Subject;

  public showModal(type: LevelType, subject?: M20Ability|M20Attribute|M20Sphere) {
    this.modalKey = `${Date.now()}-${Math.random()}`;
    this.type = type;
    this.subject = subject;
    this.show = true;
  }

  private get tradition(): IM20Tradition | undefined {
    return this.editingCharacter?.tradition as any;
  }
  private get affinitySpheres(): M20Sphere[] {
    return this.tradition?.affinitySpheres ?? [];
  }
  private isAffinitySphere(s: M20Sphere): boolean {
    return this.affinitySpheres.includes(s);
  }

  private get currentValue(): number {
    switch (this.type) {
      case 'attribute': return this.editingCharacter.attributes[this.subject as M20Attribute] ?? 0;
      case 'ability':   return this.editingCharacter.abilities[this.subject as M20Ability] ?? 0;
      case 'sphere':    return this.editingCharacter.spheres[this.subject as M20Sphere as never] ?? 0;
      case 'arete':     return this.editingCharacter.arete ?? 0;
      case 'willpower': return this.editingCharacter.willpower ?? 0;
      default: return 0;
    }
  }

  private setValue(v: number) {
    switch (this.type) {
      case 'attribute':
        this.editingCharacter.attributes[this.subject as M20Attribute] = v;
        break;
      case 'ability':
        this.editingCharacter.abilities[this.subject as M20Ability] = v;
        break;
      case 'sphere':
        // @ts-ignore
        this.editingCharacter.spheres[this.subject as M20Sphere] = v;
        break;
      case 'arete':
        this.editingCharacter.arete = v;
        break;
      case 'willpower':
        this.editingCharacter.willpower = v;
        break;
    }
  }

  private get oldValue(): number {
    return this.currentValue;
  }
  private get newValue(): number {
    return this.oldValue + 1;
  }

  private get freebieCost(): number {
    switch (this.type) {
      case 'attribute': return 5;
      case 'ability':   return 2;
      case 'sphere':    return 7;
      case 'arete':     return 4;
      case 'willpower': return 1;
      default: return 0;
    }
  }

  private get xpCost(): number {
    const n = this.newValue;
    switch (this.type) {
      case 'attribute': return n * 4;
      case 'ability':   return 3;
      case 'sphere': {
        const s = this.subject as M20Sphere;
        if (this.oldValue === 0) return 10;
        return this.isAffinitySphere(s) ? n * 7 : n * 8;
      }
      case 'arete':     return n * 8;
      case 'willpower': return n;
      default: return 0;
    }
  }

  private get canPayWithFP(): boolean {
    const fp = this.editingCharacter.freebiePoints ?? 0;
    return fp >= this.freebieCost;
  }
  private get spendType(): 'FP' | 'XP' {
    return this.canPayWithFP ? 'FP' : 'XP';
  }

  private get sphereAreteLimitViolated(): boolean {
    if (this.type !== 'sphere') return false;
    const arete = this.editingCharacter.arete ?? 1;
    return this.newValue > arete;
  }

  private get hasRequirement(): boolean {
    if (this.type === '') return false;
    if (this.spendType === 'FP' && !this.canPayWithFP) return false;
    if (this.spendType === 'XP') {
      const exp = this.editingCharacter.exp ?? 0;
      if (this.xpCost > exp) return false;
    }

    return !this.sphereAreteLimitViolated;
  }

  private get costs(): number {
    return this.spendType === 'FP' ? this.freebieCost : this.xpCost;
  }

  private level() {
    if (!this.hasRequirement) return;

    if (this.canPayWithFP) {
      this.editingCharacter.freebiePoints = Math.max(0, (this.editingCharacter.freebiePoints ?? 0) - this.freebieCost);
    } else {
      CharacterStorage.trackLevelChange(this.editingCharacter, this.levelChangeType, this.xpCost, `${this.levelChangeLabel()}: ${this.oldValue} → ${this.newValue}`);
    }

    this.setValue(this.newValue);

    CharacterStorage.saveCharacter(this.editingCharacter as any);
    this.show = false;
    this.type = '';
  }

  private levelChangeLabel(): string {
    switch (this.type) {
      case 'attribute': return 'Attribut';
      case 'ability':   return 'Fähigkeit';
      case 'sphere':    return 'Sphäre';
      case 'arete':     return 'Arete';
      case 'willpower': return 'Willenskraft';
      default: return '';
    }
  }

  private get levelChangeType(): LevelChangeType {
    switch (this.type) {
      case 'attribute': return LevelChangeType.M20_Attribute;
      case 'ability':   return LevelChangeType.M20_Ability;
      case 'sphere':    return LevelChangeType.M20_Sphere;
      case 'arete':     return LevelChangeType.M20_Arete;
      case 'willpower': return LevelChangeType.M20_Willpower;
      default: return LevelChangeType.Unknown;
    }
  }
}
</script>

<template>
  <Modal :shown="show" @close="show = false; type = ''">
    <div v-if="show" style="display: flex; flex-direction: column; gap: 1rem; width: 22rem" :key="modalKey + 'm'">
      <div style="width: 100%; text-align: center" :key="modalKey + 'i'">
        {{ oldValue }} &#8594; {{ newValue }} <bullet/>
        Kosten: {{ costs }} {{ spendType }}
      </div>

      <div v-if="sphereAreteLimitViolated" :key="modalKey + 'a'" class="alert alert-warning" style="text-align:center">
        Sphären dürfen Arete nicht übersteigen.
      </div>

      <div style="width: 100%; display: flex; justify-content: center; align-items: center">
        <button class="btn btn-primary" :disabled="!hasRequirement" @click="level" :key="modalKey + 'b'">
          {{$t('viewer.modal.level.btn')}}
        </button>
      </div>
    </div>
  </Modal>
</template>
