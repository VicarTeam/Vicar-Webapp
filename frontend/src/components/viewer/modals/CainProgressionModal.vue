<template>
  <Modal :shown="show" @close="show = false">
    <div class="cain-progression-modal">
      <div class="d-flex align-items-center justify-content-between mb-10">
        <h5 class="m-0">
          {{ $t('character.moc.title') }}:
        </h5>
      </div>

      <audio ref="sfxRed" src="@/assets/audio/heartbeat.mp3" preload="auto"></audio>
      <audio ref="sfxBlack" src="@/assets/audio/whispers.mp3" preload="auto"></audio>

      <div style="display: flex; width: 100%; gap: 1rem; justify-content: center; align-items: center; margin-bottom: 2rem">
        <button class="btn btn-outline mr-5"
                :disabled="isLocked"
                @click="goToRed()">{{$t('character.moc.go-to-red')}}</button>
        <button class="btn btn-primary ml-5"
                :disabled="isLocked"
                @click="goToBlack()">{{$t('character.moc.go-to-black')}}</button>
      </div>

      <!-- Stepper -->
      <div v-if="levelAbs !== 0" class="path-stepper" :class="'path-' + currentPath">
        <div class="path-stepper--bg"></div>
        <div class="path-stepper--filler" :style="{width: `${(25 * (levelAbs - 1))}%`}"></div>
        <div class="path-stepper--step" :class="{active: levelAbs >= 1}">I</div>
        <div class="path-stepper--step" :class="{active: levelAbs >= 2}">II</div>
        <div class="path-stepper--step" :class="{active: levelAbs >= 3}">III</div>
        <div class="path-stepper--step" :class="{active: levelAbs >= 4}">IV</div>
        <div class="path-stepper--step" :class="{active: levelAbs >= 5}">V</div>
      </div>

      <div class="mt-15">
        <template v-if="currentPath==='none' || levelAbs===0">
        </template>
        <template v-else>
          <div v-for="i in levelAbs" :key="'detail-'+i" class="card card-body mb-10">
            <div class="d-flex align-items-center mb-5">
              <span class="badge mr-10"
                    :class="{
                      'badge-dark': currentPath==='black',
                      'badge-danger': currentPath==='red'
                    }">{{ roman[i-1] }}</span>
              <strong class="h6 m-0">{{ stepTitle(i) }}</strong>
            </div>
            <div class="row">
              <div class="col-12 col-md-4 mb-5">
                <div class="text-muted text-uppercase ls-1 small">
                  {{ $t('character.moc.advantage') || 'Vorteil' }}
                </div>
                <div>{{ stepAdvantage(i) }}</div>
              </div>
              <div class="col-12 col-md-4 mb-5">
                <div class="text-muted text-uppercase ls-1 small">
                  {{ $t('character.moc.disadvantage') || 'Nachteil' }}
                </div>
                <div>{{ stepDisadvantage(i) }}</div>
              </div>
              <div class="col-12 col-md-4">
                <div class="text-muted text-uppercase ls-1 small">
                  {{ $t('character.moc.flavor') || 'Flavor' }}
                </div>
                <div>{{ stepFlavor(i) }}</div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <Blur v-if="announce.show" :hard="true">
      <div class="moc-announce" :class="announce.variant">
        <h1>{{announce.text}}</h1>
      </div>
    </Blur>
  </Modal>
</template>

<script lang="ts">
import {Component, Emit, Vue} from 'vue-property-decorator';
import {State} from 'vuex-class';
import {Generation, ICharacter} from '@/types/models';
import Modal from '@/components/modal/Modal.vue';
import CharacterStorage from "@/libs/io/character-storage";
import {i18n} from "@/libs/i18n";
import Blur from "@/components/modal/Blur.vue";
import EventBus from "@/libs/event-bus";

type PathKind = 'black' | 'red' | 'none';

@Component({ components: {Blur, Modal } })
export default class CainProgressionModal extends Vue {
  @State('editingCharacter') private editingCharacter!: ICharacter;

  @Emit('updated') private emitUpdated(_: { path: PathKind; levelAbs: number; rawLevel: number }) {}

  public announce: { show: boolean; text: string; variant: 'is-red' | 'is-black' } = {
    show: false,
    text: '',
    variant: 'is-red'
  };

  private show = false;

  mounted() {
    EventBus.$on("moc-granted", this.onMocGranted.bind(this));
  }

  destroyed() {
    EventBus.$off("moc-granted", this.onMocGranted.bind(this));
  }

  private onMocGranted() {
    this.$forceUpdate();
  }

  get rawLevel(): number {
    const v = Number((this.editingCharacter as any).cainsMarkLevel ?? 0);
    return Math.max(-5, Math.min(5, v));
  }
  set rawLevel(v: number) {
    if (this.editingCharacter) {
      const oldLevel = this.rawLevel;
      (this.editingCharacter as any).cainsMarkLevel = Math.max(-5, Math.min(5, v));

      if (this.editingCharacter.cainsMarkLevel === -5) {
        this.editingCharacter.bloodPotency = 1;
        this.editingCharacter.humanity = 10;
        this.editingCharacter.stains = 0;
      } else if (this.editingCharacter.cainsMarkLevel === 5) {
        this.editingCharacter.humanity = 1;
        this.editingCharacter.stains = 0;
        this.editingCharacter.useAdavancedDisciplines = true;
        this.editingCharacter.generation = 1;
        this.editingCharacter.generationEra = Generation.CainesInheritance;
        this.editingCharacter.bloodPotency += 2;
        this.editingCharacter.bloodPotency = Math.min(10, this.editingCharacter.bloodPotency);
      } else if (this.editingCharacter.cainsMarkLevel === 1) {
        this.editingCharacter.bloodPotency += 1;
        this.editingCharacter.bloodPotency = Math.min(10, this.editingCharacter.bloodPotency);
      } else if (this.editingCharacter.cainsMarkLevel === 0 && oldLevel === 1) {
        this.editingCharacter.bloodPotency -= 1;
        this.editingCharacter.bloodPotency = Math.max(1, this.editingCharacter.bloodPotency);
      }

      CharacterStorage.saveCharacter(this.editingCharacter).then(() => {});
    }
  }

  public showModal() { this.show = true; }

  get currentPath(): PathKind {
    if (this.rawLevel > 0) return 'black';
    if (this.rawLevel < 0) return 'red';
    return 'none';
  }
  set currentPath(val: PathKind) {
    const abs = this.levelAbs;
    if (val === 'black') this.rawLevel = Math.max(abs || 1, 1);
    else if (val === 'red') this.rawLevel = -Math.max(abs || 1, 1);
    else this.rawLevel = 0;
  }

  get levelAbs(): number { return Math.abs(this.rawLevel); }
  set levelAbs(v: number) {
    v = Math.max(0, Math.min(5, v));
    if (this.currentPath === 'black') this.rawLevel = v;
    else if (this.currentPath === 'red') this.rawLevel = -v;
    else this.rawLevel = 0;
  }

  get isLocked(): boolean { return this.levelAbs >= 5; }
  get roman(): string[] { return ['I', 'II', 'III', 'IV', 'V']; }

  private keyBase(i: number): string {
    const base = this.currentPath === 'black' ? 'character.moc.path-black' : 'character.moc.path-red';
    return `${base}.${i}`;
  }
  stepTitle(i: number) { return i18n.t(`${this.keyBase(i)}.title`) as string; }
  stepAdvantage(i: number) { return i18n.t(`${this.keyBase(i)}.advantage`) as string; }
  stepDisadvantage(i: number) { return i18n.t(`${this.keyBase(i)}.disadvantage`) as string; }
  stepFlavor(i: number) { return i18n.t(`${this.keyBase(i)}.flavor`) as string; }

  private playSfx(kind: 'red' | 'black') {
    try {
      if (kind === 'red' && (this.$refs.sfxRed as HTMLAudioElement)) {
        (this.$refs.sfxRed as HTMLAudioElement).currentTime = 0;
        (this.$refs.sfxRed as HTMLAudioElement).volume = 0.5;
        (this.$refs.sfxRed as HTMLAudioElement).play();
      }
      if (kind === 'black' && (this.$refs.sfxBlack as HTMLAudioElement)) {
        (this.$refs.sfxBlack as HTMLAudioElement).currentTime = 0;
        (this.$refs.sfxBlack as HTMLAudioElement).volume = 0.3;
        (this.$refs.sfxBlack as HTMLAudioElement).play();
      }
    } catch (_) { }
  }

  private showAnnounce(kind: 'redUp'|'redDown'|'blackUp'|'blackDown', newLevelAbs: number) {
    const pick = (arr: (() => string)[]) => arr[Math.min(Math.max(newLevelAbs-1,0), arr.length-1)]();
    let text = '';
    let css: 'is-red' | 'is-black' = 'is-red';

    switch (kind) {
      case 'redUp':    text = pick(this.redUpTexts);    css = 'is-red';   this.playSfx('red'); break;
      case 'redDown':  text = pick(this.redDownTexts);  css = 'is-black';   this.playSfx('black'); break;
      case 'blackUp':  text = pick(this.blackUpTexts);  css = 'is-black'; this.playSfx('black'); break;
      case 'blackDown':text = pick(this.blackDownTexts);css = 'is-red'; this.playSfx('red'); break;
    }
    this.announce = { show: true, text, variant: css };
    window.setTimeout(() => (this.announce.show = false), 5000);
  }

  private redUpTexts   = [
    () => (i18n.t('character.moc.msg.red.up1') as string) || 'Der Griff Kains wird schwächer.',
    () => (i18n.t('character.moc.msg.red.up2') as string) || 'Dein Wille verbrennt die Kette.',
    () => (i18n.t('character.moc.msg.red.up3') as string) || 'Das Mal schreit – und weicht zurück.',
    () => (i18n.t('character.moc.msg.red.up4') as string) || 'Die Flamme wird rein – sein Einfluss wird Asche.',
    () => (i18n.t('character.moc.msg.red.up5') as string) || 'Die Kette bricht. Nur dein Wille bleibt.'
  ];
  private redDownTexts = [
    () => (i18n.t('character.moc.msg.red.down1') as string) || 'Das Feuer flackert – und droht zu erlöschen.',
    () => (i18n.t('character.moc.msg.red.down2') as string) || 'Die Kette kühlt ab, der Griff kehrt zurück.',
    () => (i18n.t('character.moc.msg.red.down3') as string) || 'Die Glut erstickt – sein Zeichen wird lauter.',
    () => (i18n.t('character.moc.msg.red.down4') as string) || 'Die Asche wird schwer; der Schatten gewinnt Raum.',
    () => (i18n.t('character.moc.msg.red.down5') as string) || 'Die Freiheit zerspringt – die Kette schließt sich.'
  ];

  private blackUpTexts   = [
    () => (i18n.t('character.moc.msg.black.up1') as string) || 'Die Nacht neigt sich dir – und beugt sich.',
    () => (i18n.t('character.moc.msg.black.up2') as string) || 'Kains Schatten fällt länger über dich.',
    () => (i18n.t('character.moc.msg.black.up3') as string) || 'Sein Wille sickert tiefer in dein Blut.',
    () => (i18n.t('character.moc.msg.black.up4') as string) || 'Die Stimmen gehorchen; der Hunger krönt dich.',
    () => (i18n.t('character.moc.msg.black.up5') as string) || 'Apostel – der erste Schatten spricht durch dich.'
  ];
  private blackDownTexts = [
    () => (i18n.t('character.moc.msg.black.down1') as string) || 'Ein Spalt im Schatten – kurz atmest du frei.',
    () => (i18n.t('character.moc.msg.black.down2') as string) || 'Sein Blick wendet sich ab – für einen Herzschlag.',
    () => (i18n.t('character.moc.msg.black.down3') as string) || 'Die Finsternis reißt – und lässt Zweifel herein.',
    () => (i18n.t('character.moc.msg.black.down4') as string) || 'Die Ketten lockern sich – doch er vergisst nicht.',
    () => (i18n.t('character.moc.msg.black.down5') as string) || 'Der Altar wird kalt – und du stolperst zurück.'
  ];

  goToRed() {
    if (this.isLocked) return;
    if (this.currentPath === 'red') {
      this.increaseLevel();
    } else if (this.currentPath === 'black') {
      this.decreaseLevel();
    } else {
      this.currentPath = 'red';
      this.levelAbs = 1;
      this.showAnnounce('redUp', 1);
      this.emitUpdated({ path: this.currentPath, levelAbs: this.levelAbs, rawLevel: this.rawLevel });
    }
  }

  goToBlack() {
    if (this.isLocked) return;
    if (this.currentPath === 'black') {
      this.increaseLevel();
    } else if (this.currentPath === 'red') {
      this.decreaseLevel();
    } else {
      this.currentPath = 'black';
      this.levelAbs = 1;
      this.showAnnounce('blackUp', 1);
      this.emitUpdated({ path: this.currentPath, levelAbs: this.levelAbs, rawLevel: this.rawLevel });
    }
  }

  increaseLevel() {
    if (this.isLocked) return;
    if (this.currentPath === 'none') return;
    if (this.levelAbs < 5) {
      const newAbs = this.levelAbs + 1;
      this.levelAbs = newAbs;
      if (this.currentPath === 'red')  this.showAnnounce('redUp', newAbs);
      if (this.currentPath === 'black') this.showAnnounce('blackUp', newAbs);
      this.emitUpdated({ path: this.currentPath, levelAbs: this.levelAbs, rawLevel: this.rawLevel });
    }
  }

  decreaseLevel() {
    if (this.isLocked) return;
    if (this.levelAbs > 0) {
      const newAbs = this.levelAbs - 1;

      if (this.currentPath === 'red')  this.showAnnounce('redDown', newAbs);
      if (this.currentPath === 'black') this.showAnnounce('blackDown', newAbs);

      this.levelAbs = newAbs;
      if (this.levelAbs === 0) this.currentPath = 'none';
      this.emitUpdated({ path: this.currentPath, levelAbs: this.levelAbs, rawLevel: this.rawLevel });
    }
  }
}
</script>

<style scoped lang="scss">
.cain-progression-modal {
  width: 70vw;
  .path-controls .btn { min-width: 140px; }
  .level-controls .level-indicator { min-width: 46px; text-align: center; }
}

.spectrum-labels {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 12px; letter-spacing: .4px; color: var(--c-label, #bcbcbc); opacity: .9;
  .mid { opacity: .75; }
}

.path-stepper {
  width: 100%;
  height: 1rem;
  border-radius: 0.75rem;
  background: var(--c-bg-alt, #1a1a1a);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  &.path-red {
    .path-stepper--bg { background-color: #660000; }
    .path-stepper--filler { background-color: #ff4444; }
    .path-stepper--step {
      background-color: #330000;
      color: #ffaaaa;
      &.active { background-color: #ff4444; color: white; box-shadow: 0 0 8px rgba(255, 68, 68, 0.6); }
    }
  }
  &.path-black {
    .path-stepper--bg { background-color: transparent; }
    .path-stepper--filler { background-color: black; }
    .path-stepper--step {
      background-color: #1a1a1a;
      color: #cccccc;
      &.active { background-color: #111111; color: white; box-shadow: 0 0 8px rgba(136, 136, 136, 0.6); }
    }
  }
  .path-stepper--bg {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 100%;
    height: 1rem;
    border-radius: 0.75rem;
  }
  .path-stepper--filler {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    height: 1rem;
    border-radius: 0.75rem;
    transition: width 0.3s ease;
    z-index: 1;
  }
  .path-stepper--step {
    z-index: 2;
    border-radius: 50%;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    &.active {
      font-weight: bold;
    }
  }
}

.moc-announce {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  h1 {
    color: #fff;
    font-size: 5rem;
    text-align: center;
    font-family: 'Cinzel', serif;
    animation: glowTextGetBrighter 3s linear forwards;
  }

  &::before,
  &::after {
    content: '';
    position: absolute; inset: -15%;
    z-index: 0;
    pointer-events: none;
  }

  h1 { position: relative; z-index: 2; }

  &.is-red {
    background: radial-gradient(120% 120% at 50% 70%, rgba(255, 80, 60, .25), rgba(0,0,0,0) 60%);

    &::before {
      background:
        radial-gradient(40% 35% at 50% 70%, rgba(255,160,80,.35), rgba(255,60,40,.18) 60%, rgba(0,0,0,0) 70%),
        radial-gradient(55% 55% at 50% 85%, rgba(255,70,40,.28), rgba(0,0,0,0) 70%);
      filter: blur(14px) saturate(1.15);
      animation: mocFirePulse 1.2s ease-in-out infinite;
      mix-blend-mode: screen;
    }

    &::after {
      background:
        conic-gradient(from 0deg at 50% 70%,
          rgba(255,120,90,.10),
          rgba(255, 90, 70,.08),
          rgba(255,130,100,.10),
          rgba(255, 90, 70,.08),
          rgba(255,120,90,.10));
      filter: blur(18px) contrast(1.1) saturate(1.15);
      animation: mocHeatWaves 2.1s cubic-bezier(.3,.7,.2,1) infinite;
      opacity: .75;
      mix-blend-mode: screen;
    }
  }

  &.is-black {
    background: radial-gradient(120% 120% at 50% 75%, rgba(30, 10, 12, .55), rgba(0,0,0,0) 65%);

    &::before {
      content: '';
      position: absolute; inset: -10%;
      background: radial-gradient(circle at 50% 50%,
        rgba(0,0,0,0) 70%,
        rgba(0,0,0,0.75) 100%);
      z-index: 1;
      animation: vignetteClose 3s ease forwards;
      pointer-events: none;
    }

    &::after {
      content: '';
      position: absolute; inset: -20%;
      --p1x: 42%; --p2x: 58%; --p3x: 50%;
      background:
        radial-gradient(20% 28% at var(--p1x) 95%, rgba(80,80,80,.4), rgba(0,0,0,0) 70%),
        radial-gradient(24% 32% at var(--p2x) 100%, rgba(100,100,100,.35), rgba(0,0,0,0) 70%),
        radial-gradient(18% 28% at var(--p3x) 105%, rgba(70,70,70,.38), rgba(0,0,0,0) 70%);
      filter: blur(22px);
      opacity: .75;
      animation: mocSmokeRise 5.2s linear infinite;
      z-index: 0;
      mix-blend-mode: lighten;
      pointer-events: none;
    }
  }
}

@keyframes glowTextGetBrighter {
  0% { text-shadow: 0 0 5px rgba(255, 255, 255, 0.0); }
  100% { text-shadow: 0 0 20px rgba(255, 255, 255, 1); }
}

@keyframes mocFirePulse {
  0%   { transform: translate3d(0,1%,0) scale(1.00); opacity:.85; }
  50%  { transform: translate3d(0,-1%,0) scale(1.045); opacity:1; }
  100% { transform: translate3d(0,1%,0) scale(1.00); opacity:.85; }
}

@keyframes mocHeatWaves {
  0%   { transform: translate3d(-2%, 1%, 0) scale(1.02) rotate(0.2deg); opacity:.65; }
  50%  { transform: translate3d( 2%,-1%, 0) scale(1.07) rotate(-0.2deg); opacity:.85; }
  100% { transform: translate3d(-2%, 1%, 0) scale(1.02) rotate(0.2deg); opacity:.65; }
}

@keyframes mocSmokeDrift {
  0%   { transform: translate3d(0,0,0) scale(1.00); opacity:.55; }
  50%  { transform: translate3d(1%, -1%, 0) scale(1.03); opacity:.70; }
  100% { transform: translate3d(0,0,0) scale(1.00); opacity:.55; }
}

@keyframes vignetteClose {
  0%   { transform: scale(1.2); opacity: 0.0; }
  40%  { transform: scale(1.05); opacity: 0.6; }
  100% { transform: scale(1.0); opacity: 1.0; }
}

@keyframes mocSmokeRise {
  0%   { transform: translate3d(0, 6%, 0) scale(1.0); opacity:.55; }
  40%  { transform: translate3d(0, 0%, 0) scale(1.05); opacity:.75; }
  80%  { transform: translate3d(0,-6%, 0) scale(1.10); opacity:.6; }
  100% { transform: translate3d(0,-12%,0) scale(1.12); opacity:.4; }
}
</style>
