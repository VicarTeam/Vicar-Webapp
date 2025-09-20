<script lang="ts">
import {Vue, Component} from 'vue-property-decorator';
import {State} from "vuex-class";
import Modal from "@/components/modal/Modal.vue";
import Bullet from "@/components/Bullet.vue";
import {IM20Tradition, IMageSheet, M20Ability, M20Attribute, M20Sphere} from "@/types/m20";
import CharacterStorage from "@/libs/io/character-storage";

type LevelType = 'attribute'|'ability'|'sphere'|'arete'|'willpower';
type Subject = M20Ability | M20Attribute | M20Sphere | undefined;

@Component({
  components: {Bullet, Modal}
})
export default class M20LevelModal extends Vue {

  @State("editingCharacter")
  private editingCharacter!: IMageSheet;

  private show: boolean = false;
  private type: LevelType = 'attribute';
  private subject?: Subject;

  public showModal(type: LevelType, subject?: M20Ability|M20Attribute|M20Sphere) {
    this.type = type;
    this.subject = subject;
    this.show = true;
    this.$forceUpdate();
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

  private getValue(): number {
    switch (this.type) {
      case 'attribute':
        return this.editingCharacter.attributes[this.subject as M20Attribute] ?? 0;
      case 'ability':
        return this.editingCharacter.abilities[this.subject as M20Ability] ?? 0;
      case 'sphere':
        return this.editingCharacter.spheres[this.subject as M20Sphere as never] ?? 0;
      case 'arete':
        return this.editingCharacter.arete ?? 0;
      case 'willpower':
        return this.editingCharacter.willpower ?? 0;
    }
  }

  private setValue(v: number) {
    switch (this.type) {
      case 'attribute':
        this.$set(this.editingCharacter.attributes, this.subject as M20Attribute, v);
        break;
      case 'ability':
        this.$set(this.editingCharacter.abilities, this.subject as M20Ability, v);
        break;
      case 'sphere':
        this.$set(this.editingCharacter.spheres, this.subject as M20Sphere, v);
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
    return this.getValue();
  }
  private get newValue(): number {
    return this.oldValue + 1;
  }

  private getFreebieCost(): number {
    switch (this.type) {
      case 'attribute': return 5;
      case 'ability': return 2;
      case 'sphere': return 7;
      case 'arete': return 4;
      case 'willpower': return 1;
    }
  }

  private getXpCost(): number {
    const n = this.newValue;
    switch (this.type) {
      case 'attribute':
        return n * 4;
      case 'ability':
        return 3;
      case 'sphere': {
        const s = this.subject as M20Sphere;
        if (this.oldValue === 0) return 10;
        return this.isAffinitySphere(s) ? n * 7 : n * 8;
      }
      case 'arete':
        return n * 8;
      case 'willpower':
        return n;
    }
  }

  private get canPayWithFP(): boolean {
    const fp = this.editingCharacter.freebiePoints ?? 0;
    return fp >= this.getFreebieCost();
  }
  private spendType(): 'FP' | 'XP' {
    return this.canPayWithFP ? 'FP' : 'XP';
  }

  private sphereAreteLimitViolated(): boolean {
    if (this.type !== 'sphere') return false;
    const arete = this.editingCharacter.arete ?? 1;
    return this.newValue > arete;
  }

  private get hasRequirement(): boolean {
    if (this.spendType() === 'FP' && !this.canPayWithFP) return false;
    if (this.spendType() === 'XP') {
      const used = (this.editingCharacter as any).usedExp ?? 0;
      const exp = this.editingCharacter.exp ?? 0;
      if (used + this.getXpCost() > exp) return false;
    }

    return !this.sphereAreteLimitViolated();
  }

  private costs(): number {
    return this.spendType() === 'FP' ? this.getFreebieCost() : this.getXpCost();
  }

  private level() {
    if (!this.hasRequirement) return;

    if (this.canPayWithFP) {
      this.editingCharacter.freebiePoints = Math.max(0, (this.editingCharacter.freebiePoints ?? 0) - this.getFreebieCost());
    } else {
      const used = (this.editingCharacter as any).usedExp ?? 0;
      (this.editingCharacter as any).usedExp = used + this.getXpCost();
    }

    if (this.type === 'arete') {
      this.setValue(Math.min(3, this.newValue));
    } else if (this.type === 'sphere') {
      const arete = this.editingCharacter.arete ?? 1;
      this.setValue(Math.min(arete, this.newValue));
    } else {
      this.setValue(this.newValue);
    }

    CharacterStorage.saveCharacter(this.editingCharacter as any);
    this.show = false;
  }
}
</script>

<template>
  <Modal :shown="show" @close="show = false">
    <div v-if="show" style="display: flex; flex-direction: column; gap: 1rem; width: 22rem">
      <div style="width: 100%; text-align: center">
        {{ getValue() }} &#8594; {{ getValue() + 1 }} <bullet/>
        Kosten: {{ costs() }} {{ spendType() }}
      </div>

      <div v-if="sphereAreteLimitViolated()" class="alert alert-warning" style="text-align:center">
        Sphären dürfen Arete nicht übersteigen.
      </div>

      <div style="width: 100%; display: flex; justify-content: center; align-items: center">
        <button class="btn btn-primary" :disabled="!hasRequirement" @click="level">
          {{$t('viewer.modal.level.btn')}}
        </button>
      </div>
    </div>
  </Modal>
</template>
