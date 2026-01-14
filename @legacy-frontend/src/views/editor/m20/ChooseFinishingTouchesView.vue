<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import EditorForm from "@/components/editor/EditorForm.vue";
import { IM20Tradition, IMageSheet, M20Sphere } from '@/types/m20';
import TipButton from "@/components/editor/TipButton.vue";

@Component({
  components: {TipButton, EditorForm }
})
export default class ChooseFinishingTouchesView extends Vue {

  @State('editingCharacter')
  private editingCharacter!: IMageSheet;

  private readonly ARETE_BASE = 1;
  private readonly ARETE_MAX = 3;
  private readonly WILL_BASE = 5;
  private readonly STARTING_SPHERE_POOL = 6;

  private readonly COST = {
    aretePerDot: 4,
    spherePerDot: 7,
    willPerDot: 1,
    quintPerFour: 1,
  };

  spheresOrder: M20Sphere[] = [
    M20Sphere.Correspondence,
    M20Sphere.Entropy,
    M20Sphere.Forces,
    M20Sphere.Life,
    M20Sphere.Matter,
    M20Sphere.Mind,
    M20Sphere.Prime,
    M20Sphere.Spirit,
    M20Sphere.Time,
  ];

  private onBeforeNext() {
    this.editingCharacter.freebiePoints = (this.editingCharacter.freebiePoints || 0) - this.totalFreebieCost;
    this.editingCharacter.quintessence = this.quintessence;
  }

  private get avatarLevel(): number {
    return this.getAvatarLevel(this.editingCharacter);
  }

  private get baseArete(): number { return this.ARETE_BASE; }
  private get baseWill(): number { return this.WILL_BASE; }
  private get baseQuint(): number { return this.avatarLevel; }

  private get arete(): number { return this.editingCharacter.arete || this.baseArete; }
  private set arete(v: number) {
    const maxSphere = Math.max(...this.spheresOrder.map(s => this.getSphere(s)));
    const minAllowed = Math.max(this.baseArete, maxSphere);
    this.editingCharacter.arete = Math.max(minAllowed, Math.min(this.ARETE_MAX, v | 0));
  }

  private get willpower(): number { return this.editingCharacter.willpower || this.baseWill; }
  private set willpower(v: number) {
    this.editingCharacter.willpower = Math.max(this.baseWill, v | 0);
  }

  private get quintessence(): number { return this.editingCharacter.quintessence || this.baseQuint; }
  private set quintessence(v: number) {
    this.editingCharacter.quintessence = Math.max(this.baseQuint, v | 0);
  }

  private getSphere(s: M20Sphere): number {
    return (this.editingCharacter.spheres[s as never] ?? 0) as number;
  }
  private setSphere(s: M20Sphere, v: number) {
    const capped = Math.max(0, Math.min(this.arete, v | 0));
    this.$set(this.editingCharacter.spheres, s, capped);
  }

  private get tradition(): IM20Tradition | undefined {
    return this.editingCharacter.tradition as any;
  }
  private get affinityList(): M20Sphere[] {
    return this.tradition?.affinitySpheres ?? [];
  }
  private get hasAffinityRequirement(): boolean {
    return (this.affinityList?.length ?? 0) > 0;
  }
  private get affinitySatisfied(): boolean {
    if (!this.hasAffinityRequirement) return true;
    return this.affinityList.some(s => this.getSphere(s) > 0);
  }

  private get spheresTotal(): number {
    return this.spheresOrder.reduce((acc, s) => acc + this.getSphere(s), 0);
  }
  private get affinityFreeDot(): number {
    return (this.hasAffinityRequirement && this.affinitySatisfied) ? 1 : 0;
  }
  private get startingSphereSpent(): number {
    return Math.min(this.STARTING_SPHERE_POOL, Math.max(0, this.spheresTotal - this.affinityFreeDot));
  }
  private get extraSphereDots(): number {
    return Math.max(0, this.spheresTotal - this.affinityFreeDot - this.STARTING_SPHERE_POOL);
  }

  private get costArete(): number {
    const bought = Math.max(0, this.arete - this.baseArete);
    return bought * this.COST.aretePerDot;
  }
  private get costWill(): number {
    const bought = Math.max(0, this.willpower - this.baseWill);
    return bought * this.COST.willPerDot;
  }
  private get costSpheres(): number {
    return this.extraSphereDots * this.COST.spherePerDot;
  }
  private get costQuint(): number {
    const bought = Math.max(0, this.quintessence - this.baseQuint);
    return Math.ceil(bought / 4) * this.COST.quintPerFour;
  }

  private get totalFreebieCost(): number {
    return this.costArete + this.costSpheres + this.costWill + this.costQuint;
  }
  private get freebiesAvailable(): number {
    return this.editingCharacter.freebiePoints ?? 0;
  }
  private get freebiesLeft(): number {
    return this.freebiesAvailable - this.totalFreebieCost;
  }

  isSphereOptionDisabled(s: M20Sphere, candidate: number): boolean {
    if (candidate === this.getSphere(s)) return false;
    if (candidate < 0) return true;
    if (candidate > this.arete) return true;

    const current = this.getSphere(s);
    const newTotal = this.spheresTotal - current + candidate;

    let newHasAffinity = this.affinitySatisfied;
    if (this.hasAffinityRequirement) {
      newHasAffinity = this.affinityList.some(t => {
        const v = (t === s) ? candidate : this.getSphere(t);
        return v > 0;
      });
    }

    const newAffinityFree = (this.hasAffinityRequirement && newHasAffinity) ? 1 : 0;

    const newExtra = Math.max(0, newTotal - newAffinityFree - this.STARTING_SPHERE_POOL);
    const newCostSpheres = newExtra * this.COST.spherePerDot;

    const newTotalCost = this.costArete + this.costWill + this.costQuint + newCostSpheres;
    return newTotalCost > this.freebiesAvailable;
  }

  private get areteMin(): number {
    const maxSphere = Math.max(...this.spheresOrder.map(s => this.getSphere(s)));
    return Math.max(this.baseArete, maxSphere);
  }

  private get canGoNext(): boolean {
    const poolOk = this.startingSphereSpent === this.STARTING_SPHERE_POOL;
    return poolOk && this.affinitySatisfied && this.freebiesLeft >= 0;
  }

  private getAvatarLevel(sheet: IMageSheet): number {
    try {
      const pack = sheet.backgrounds.packs.find(x => x.pack.id === 4); // Avatar Pack ID
      if (!pack || pack.traits.length <= 0) {
        return 0;
      }
      return Math.max(...pack.traits.map(x => x.level));
    } catch {
      return 0;
    }
  }
}
</script>

<template>
  <EditorForm :can-go-next="canGoNext" :is-finish="true" @before-next="onBeforeNext">
    <div class="finishing-view" v-if="editingCharacter">
      <div class="card header">
        <h4>Letzte Schritte</h4>
        <p>
          Verteile <strong>6 Sphärenpunkte</strong> (mind. 1 Punkt in eine
          <em v-if="hasAffinityRequirement">Affinitätssphäre deiner Tradition</em>
          <em v-else>beliebige Sphäre</em>).
          <br/>
          <strong>{{$t('m20.arete')}}</strong> startet bei 1 (max. 3) und kann mit Freebies erhöht werden.
          <strong>Willenskraft</strong> startet bei 5.
          <strong>Quintessenz</strong> entspricht deinem <strong>Avatar</strong>-Rang.
          <br/>
          Du kannst hier Freebies für <strong>{{$t('m20.arete')}}</strong>, <strong>Sphären</strong>,
          <strong>Willenskraft</strong> und <strong>Quintessenz</strong> ausgeben.
          Freebies für <strong>Attribute</strong>, <strong>Fähigkeiten</strong> und
          <strong>Hintergründe</strong> kannst du auch später noch verwenden.
        </p>

        <div class="costs">
          <div><strong>Freebie-Kosten</strong></div>
          <ul>
            <li>{{$t('m20.arete')}}: <strong>4</strong> pro Punkt (max. 3 gesamt)</li>
            <li>Sphäre: <strong>7</strong> pro Punkt (nur <em>über</em> die 6 Startpunkte hinaus)</li>
            <li>Willenskraft: <strong>1</strong> pro Punkt</li>
            <li>Quintessenz: <strong>1</strong> pro <strong>4</strong> Punkte</li>
          </ul>
        </div>

        <div class="freebies">
          Verfügbar: <strong>{{ freebiesAvailable }}</strong> —
          Geplant: <strong>{{ totalFreebieCost }}</strong> —
          Übrig: <strong :class="{neg: freebiesLeft < 0}">{{ freebiesLeft }}</strong>
        </div>
      </div>

      <div class="grid trio">
        <div class="card">
          <h6>{{$t('m20.arete')}} <TipButton :content="$t('m20.arete.description')"/></h6>
          <div class="row">
            <button class="btn incdec" :disabled="arete <= areteMin" @click="arete = arete - 1">−</button>
            <div class="value">{{ arete }}</div>
            <button
              class="btn incdec"
              :disabled="arete >= ARETE_MAX || (totalFreebieCost + COST.aretePerDot) > freebiesAvailable"
              @click="arete = arete + 1"
            >+</button>
          </div>
          <small>Basis: {{ baseArete }} &nbsp;|&nbsp; Kosten: {{ costArete }}</small>
        </div>

        <div class="card">
          <h6>Willenskraft <TipButton :content="$t('m20.willpower.description')"/></h6>
          <div class="row">
            <button class="btn incdec" :disabled="willpower <= baseWill" @click="willpower = willpower - 1">−</button>
            <div class="value">{{ willpower }}</div>
            <button
              class="btn incdec"
              :disabled="(totalFreebieCost + COST.willPerDot) > freebiesAvailable"
              @click="willpower = willpower + 1"
            >+</button>
          </div>
          <small>Basis: {{ baseWill }} &nbsp;|&nbsp; Kosten: {{ costWill }}</small>
        </div>

        <div class="card">
          <h6>Quintessenz <TipButton :content="$t('m20.quintessence_and_paradoxon')"/></h6>
          <div class="row">
            <button class="btn incdec" :disabled="quintessence <= baseQuint" @click="quintessence = quintessence - 1">−</button>
            <div class="value">{{ quintessence }}</div>
            <button
              class="btn incdec"
              :disabled="(costArete + costSpheres + costWill + Math.ceil((Math.max(0, (quintessence + 1) - baseQuint)) / 4)) > freebiesAvailable"
              @click="quintessence = quintessence + 1"
            >+</button>
          </div>
          <small>Basis (Avatar): {{ baseQuint }} &nbsp;|&nbsp; Kosten: {{ costQuint }}</small>
        </div>
      </div>

      <div class="card">
        <h6 style="margin-bottom: 1rem">{{$t('m20.sphere.description')}}</h6>

        <div class="spheres-bar">
          <div>Startpool: <strong>{{ startingSphereSpent }}</strong> / {{ STARTING_SPHERE_POOL }}</div>
          <div>Gratis Affinitätspunkt: <strong>{{ affinityFreeDot }}</strong></div>
          <div>Zusatz über Pool: <strong>{{ extraSphereDots }}</strong> (Kosten: {{ costSpheres }})</div>
          <div>Arete-Limit pro Sphäre: <strong>{{ arete }}</strong></div>
          <div v-if="hasAffinityRequirement">
            Affinität erfüllt:
            <strong :class="{ok: affinitySatisfied, bad: !affinitySatisfied}">
              {{ affinitySatisfied ? 'Ja' : 'Nein' }}
            </strong>
          </div>
        </div>

        <div class="spheres-grid">
          <div v-for="s in spheresOrder" :key="s" class="sphere-row">
            <div class="label">
              {{$t('m20.sphere.' + s)}}
              <span v-if="hasAffinityRequirement && affinityList.includes(s)" class="badge">Affinity</span>
            </div>
            <select
              class="form-control"
              :value="getSphere(s)"
              @change="setSphere(s, +$event.target.value)"
            >
              <option
                v-for="n in (arete + 1)"
              :key="n-1"
              :value="n-1"
              :disabled="isSphereOptionDisabled(s, n-1)"
              >{{ n-1 }}</option>
            </select>
          </div>
        </div>
      </div>

      <div class="guards">
        <span v-if="startingSphereSpent !== STARTING_SPHERE_POOL">Bitte verteile alle 6 Sphärenpunkte.</span>
        <span v-else-if="!affinitySatisfied">Mindestens 1 Punkt in eine Affinity-Sphäre deiner Tradition.</span>
        <span v-else-if="freebiesLeft < 0">Zu wenig Freebie-Punkte.</span>
      </div>
    </div>
  </EditorForm>
</template>

<style scoped lang="scss">
.finishing-view {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .card {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    border-radius: 0.75rem;
  }

  .header p { margin: 0; }

  .costs ul {
    margin: 0.25rem 0 0;
    padding-left: 1.25rem;
  }

  .freebies { margin-top: 0.25rem; }
  .freebies .neg { color: #b00020; }

  .grid.trio {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
    gap: 1rem;
  }

  h4, h6 {
    margin-bottom: 0;
  }

  .row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    .btn {
      min-width: 2.25rem;
      height: 2.25rem;
      &.incdec {
        font-size: 1.5rem;
        font-weight: bold;
        padding: 0;
        line-height: 1;
      }
    }
    .value {
      min-width: 3rem;
      text-align: center;
      font-weight: 600;
      font-size: 1.1rem;
    }
  }

  .spheres-bar {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
    gap: 0.5rem;
    align-items: center;

    .ok { color: #2e7d32; }
    .bad { color: #b00020; }
  }

  .spheres-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(22rem, 1fr));
    gap: 0.5rem 1rem;
    margin-top: 0.5rem;
  }

  .sphere-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;

    .label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .badge {
      font-size: 0.7rem;
      padding: 0.1rem 0.4rem;
      border-radius: 0.5rem;
      background: #1a73e8;
      color: white;
    }
    select { width: 6rem; }
  }

  .guards {
    color: #b00020;
    display: flex;
    justify-content: center;
    font-weight: 600;
  }
}
</style>
