<template>
  <div class="mark-of-cain" :class="[`path-${path}`, { compact, progression: showProgression }]">
    <div class="activation-layer" v-show="showActivation">
      <div class="flash-layer" :class="{ 'flash-on': phase==='flash' }"></div>

      <div class="stage">
        <div class="sigil-wrap"
             :class="{
               'phase-expand': phase==='expand',
               'phase-flash': phase==='flash',
               'phase-slam': phase==='slam'
             }">
          <svg class="sigil" viewBox="0 0 240 240" aria-label="Mal Kains" role="img">
            <g id="halo" fill="none" :stroke="sigilStroke" stroke-width="6" stroke-linecap="round">
              <circle cx="120" cy="120" r="82"/>
              <path d="M120 28 l0 -18" />
              <path d="M173 41 l11 -14" />
              <path d="M205 88 l16 -6" />
              <path d="M205 152 l16 6" />
              <path d="M173 199 l11 14" />
              <path d="M120 212 l0 18" />
              <path d="M67 199 l-11 14" />
              <path d="M35 152 l-16 6" />
              <path d="M35 88 l-16 -6" />
              <path d="M67 41 l-11 -14" />
            </g>
            <path id="drop" :fill="sigilFill" opacity="0.92"
                  d="M120 52 C145 92,168 115,168 140 C168 164,146 186,120 186 C94 186,72 164,72 140 C72 115,95 92,120 52 Z"/>
            <path id="rune" d="M118 84 L118 168 M118 120 L154 102 M118 120 L156 144"
                  stroke="#000" stroke-width="7" stroke-linecap="round" fill="none" opacity="0.85"/>
            <path d="M102 162 C96 154,94 147,92 140" stroke="#000" stroke-width="2" opacity="0.35" fill="none"/>
            <path d="M140 160 C146 150,148 144,150 138" stroke="#000" stroke-width="2" opacity="0.35" fill="none"/>
          </svg>
        </div>
      </div>
    </div>

    <div class="landed" v-show="showProgression">
      <div style="width: 100%; text-align: center">
        <svg class="sigil small" viewBox="0 0 240 240" aria-hidden="true" @click="openProgression">
          <use href="#moc-sprite" />
        </svg>
      </div>

      <div class="moc-progress" :class="[`path-${path}`]">
        <div class="progress-rail">
          <div class="progress-rail--red"/>
          <div class="progress-rail--none"/>
          <div class="progress-rail--black"/>

          <div class="progress-rail--nr" v-for="n in 11" :key="n" :class="{active: (n - 6) === level}">
            {{getNrText(n - 6)}}
          </div>
        </div>

        <div class="legend-text">
          <span v-if="path==='black'">{{$t('character.moc.path-black')}}</span>
          <span v-else-if="path==='red'">{{$t('character.moc.path-red')}}</span>
          <span v-else>{{$t('character.moc.path-none')}}</span>
        </div>
      </div>
    </div>

    <svg width="0" height="0" style="position:absolute;opacity:0;pointer-events:none" aria-hidden="true">
      <symbol id="moc-sprite" viewBox="0 0 240 240">
        <g id="halo" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round">
          <circle cx="120" cy="120" r="82"/>
          <path d="M120 28 l0 -18" />
          <path d="M173 41 l11 -14" />
          <path d="M205 88 l16 -6" />
          <path d="M205 152 l16 6" />
          <path d="M173 199 l11 14" />
          <path d="M120 212 l0 18" />
          <path d="M67 199 l-11 14" />
          <path d="M35 152 l-16 6" />
          <path d="M35 88 l-16 -6" />
          <path d="M67 41 l-11 -14" />
        </g>
        <path id="drop" d="M120 52 C145 92,168 115,168 140 C168 164,146 186,120 186 C94 186,72 164,72 140 C72 115,95 92,120 52 Z" fill="currentColor" opacity="0.92"/>
        <path id="rune" d="M118 84 L118 168 M118 120 L154 102 M118 120 L156 144"
              stroke="#000" stroke-width="7" stroke-linecap="round" fill="none" opacity="0.85"/>
        <path d="M102 162 C96 154,94 147,92 140" stroke="#000" stroke-width="2" opacity="0.35" fill="none"/>
        <path d="M140 160 C146 150,148 144,150 138" stroke="#000" stroke-width="2" opacity="0.35" fill="none"/>
      </symbol>
    </svg>

    <CainProgressionModal @updated="emitUpdated()" ref="cainProgressionModal"/>
  </div>
</template>

<script lang="ts">
import {Vue, Component, Emit, Prop, Ref} from 'vue-property-decorator';
import CainProgressionModal from "@/components/viewer/modals/CainProgressionModal.vue";
import EventBus from "@/libs/event-bus";

type PathKind = 'black' | 'red' | 'none';

@Component({
  components: {CainProgressionModal}
})
export default class MarkOfCain extends Vue {
  @Prop({ type: Boolean, default: false }) readonly showProgression!: boolean;
  @Prop({type: String, default: 'none'}) readonly path!: PathKind;
  @Prop({type: Number, default: 0}) readonly level!: number; // 0–5
  @Prop({type: Boolean, default: false}) readonly compact!: boolean;

  @Ref('cainProgressionModal') readonly cainProgressionModal!: CainProgressionModal;

  phase: '' | 'expand' | 'flash' | 'slam' = '';
  showActivation = false;
  landed = false;

  mounted() {
    EventBus.$on("moc-granted", this.onMocGranted.bind(this));
  }

  destroyed() {
    EventBus.$off("moc-granted", this.onMocGranted.bind(this));
  }

  private onMocGranted() {
    if (this.showProgression) {
      this.$forceUpdate();
    }
  }

  get fillWidth(): string {
    const clamped = Math.max(0, Math.min(5, this.level));
    return `${(clamped / 5) * 100}%`;
  }
  get sigilFill(): string {
    return this.path === 'black' ? '#7a0a0a' : '#b81e2b';
  }
  get sigilStroke(): string {
    return this.path === 'black' ? '#450608' : '#7a0a0a';
  }

  @Emit('flash') emitFlash() { }
  @Emit('updated') emitUpdated() { }

  public async runSequence() {
    this.phase = '';
    this.landed = false;
    this.showActivation = true;

    this.phase = 'expand';
    await this.wait(1600);

    this.phase = 'flash';
    this.landed = true;
    this.emitFlash();
    await this.wait(650);

    this.phase = 'slam';
    await this.wait(100);
    document.getElementById('viewer-wrapper')?.classList.add('vicar-screen-shake');
    await this.wait(700);
    document.getElementById('viewer-wrapper')?.classList.remove('vicar-screen-shake');
    await this.wait(100);

    this.showActivation = false;

    await this.wait(300);
  }

  private wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getNrText(nr: number): string {
    if (nr === 0) return '0';
    const abs = Math.abs(nr);
    if (abs >= 1 && abs <= 3) return 'I'.repeat(abs);
    if (abs === 4) return 'IV';
    if (abs === 5) return 'V';
    return nr.toString();
  }

  private openProgression() {
    (this.cainProgressionModal as any).showModal();
  }
}
</script>

<style scoped lang="scss">
.mark-of-cain {
  --c-black: #1a0003;
  --c-red:   #b81e2b;
  --c-deep:  #7a0a0a;
  --c-ember: #ff2e2e;
  --c-rail:  #2a1c1f;
  --c-fill:  #7a0a0a;
  --c-label: #ccb;
  position: relative;
  &.progression {
    width: 100%;
    height: 100%;
  }

  &.path-black { --c-fill: #7a0a0a; }
  &.path-red   { --c-fill: #b81e2b; }

  .activation-layer {
    position: fixed; inset: 0;
    display: grid; place-items: center;
    background:
      radial-gradient(900px 900px at 50% 50%, rgba(255,40,40,0.10), rgba(0,0,0,0) 60%),
      radial-gradient(1200px 1200px at 50% 50%, rgba(0,0,0,0.65), rgba(0,0,0,0.95));
    z-index: 9999;
    overflow: hidden;

    .flash-layer {
      position: absolute; inset: 0;
      pointer-events: none;
      opacity: 0;
      background:
        radial-gradient(28% 28% at 50% 50%, rgba(255,90,90,.55), rgba(255,90,90,0) 70%),
        rgba(255,36,36,0.85);
      mix-blend-mode: screen;
    }
    .flash-layer.flash-on { animation: flashBang 0.65s ease-out forwards; }

    .stage {
      width: 100%; height: 100%;
      display: grid; place-items: center;
      perspective: 1400px;
      perspective-origin: 50% 50%;
      transform-style: preserve-3d;
    }
  }

  .sigil-wrap {
    width: 260px; height: 260px; position: relative;
    transform-style: preserve-3d;
    will-change: transform, filter, opacity;
    filter: drop-shadow(0 0 22px rgba(255, 30, 30, 0.35));

    &::before {
      content: '';
      position: absolute; inset: -30%;
      border-radius: 50%;
      background: radial-gradient(closest-side, rgba(255,90,90,.30), rgba(255,90,90,0) 70%);
      filter: blur(18px);
      opacity: 0; transition: opacity .35s ease;
      pointer-events: none;
    }
    .sigil { width: 100%; height: 100%; color: var(--c-fill); backface-visibility: hidden; }

    &.phase-expand {
      animation: mocExpand 1.6s cubic-bezier(.16,.84,.18,1) forwards;
      &::before { opacity: .9; }
    }

    &.phase-flash {
      animation: flashPulse 0.65s ease-out forwards;
      &::before { opacity: 1; }
    }

    &.phase-slam {
      animation: mocSlam 0.2s linear forwards;
      &::before { opacity: .4; }
    }
  }

  .landed {
    width: 100%;
    height: 100%;
    padding: 2rem;
    .sigil.small {
      height: 48px;
      width: 48px;
      color: var(--c-fill);
      &:hover {
        color: var(--c-ember);
        cursor: pointer;
      }
      &:active {
        color: var(--c-red);
      }
    }

    .moc-progress {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: unset;
      height: 3rem;
      .progress-rail {
        width: 100%;
        height: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: relative;
        border: 1px solid var(--c-fill);
        .progress-rail--black, .progress-rail--red, .progress-rail--none {
          position: absolute;
          top: 0; bottom: 0;
        }
        .progress-rail--red {
          left: 0;
          width: calc((100% - 1.5rem) / 2);
          background: linear-gradient(-90deg, #5d5d5d 0%, #b81e2b 15%, #7a0a0a);
        }
        .progress-rail--black {
          right: 0;
          width: calc((100% - 1.5rem) / 2);
          background: linear-gradient(90deg, #5d5d5d 0%, #212121 15%, #0a0a0a);
        }
        .progress-rail--none {
          left: calc((100% - 1.5rem) / 2);
          width: 1.5rem;
          background: #5d5d5d;
        }
        .progress-rail--nr {
          width: calc(100% / 11 - 2px);
          height: 100%;
          border: 1px solid transparent;
          z-index: 1;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          justify-content: center;
          &.active {
            border-left: 2px solid var(--c-fill);
            border-right: 2px solid var(--c-fill);
            color: #fff;
            text-decoration: underline;
            box-shadow: inset 0 0 8px rgba(255, 255, 255, 0.4);
            background: rgba(255, 255, 255, 0.2);
            font-weight: bold;
            font-size: 0.9rem;
          }
        }
      }
      .legend-text {
        display: flex;
        justify-content: center;
        font-size: 0.875rem;
        font-style: italic;
        opacity: 0.75;
        margin-top: 0.2rem;
      }
      &.path-black .legend-text {
        text-decoration: underline var(--c-black);
      }
      &.path-red .legend-text {
        text-decoration: underline var(--c-red);
      }
    }
  }
}

@keyframes mocExpand {
  0%   { transform: translateZ(0)     scale(1.00) rotate(0.2deg); opacity: 1; }
  100% { transform: translateZ(220px) scale(3.8) rotate(0.4deg); opacity: 1; }
}

@keyframes flashBang {
  0%   { opacity: 0; }
  15%  { opacity: 1; }
  55%  { opacity: .55; }
  100% { opacity: 0; }
}
@keyframes flashPulse {
  0%   { transform: scale(3.8); filter: drop-shadow(0 0 42px rgba(255, 90, 90, .72)); }
  50%  { transform: scale(3.95); filter: drop-shadow(0 0 56px rgba(255, 110, 110, .85)); }
  100% { transform: scale(3.8); filter: drop-shadow(0 0 38px rgba(255, 70, 70, .65)); }
}

@keyframes mocSlam {
  0%   { transform: translateZ(220px) scale(3.8); opacity: 1; filter: drop-shadow(0 0 40px rgba(255,70,70,.65)); }
  100% { transform: translateZ(-1200px) scale(0.35); opacity: 0; filter: drop-shadow(0 0 10px rgba(255,40,40,.25)) blur(1px); }
}
</style>
