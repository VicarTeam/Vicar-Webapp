<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue"
import { onFx, visualsEnabled, type FxEvent } from "@/libs/fx/fx"
import { playSound, rampSound, stopSound } from "@/libs/fx/sound"
import { startFrenzy3d } from "@/libs/fx/frenzy3d"

const root = ref<HTMLElement>()
const canvas = ref<HTMLCanvasElement>()
let ctx: CanvasRenderingContext2D | null = null

const vignetteColor = ref<string | null>(null)
const flash = ref(false)
const shimmer = ref(false)
const desat = ref(false)
const motif = ref<"heart" | "horns" | "claw" | null>(null)

interface P { x: number; y: number; vx: number; vy: number; grav: number; life: number; max: number; size: number; color: string; shape?: "dot" | "streak"; pull?: number }
let particles: P[] = []
let raf = 0

function hexA(hex: string, a: number): string {
  const h = hex.replace("#", "")
  return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`
}

function resize() {
  if (canvas.value) { canvas.value.width = window.innerWidth; canvas.value.height = window.innerHeight }
}

function ensureLoop() { if (!raf) raf = requestAnimationFrame(loop) }

function loop() {
  raf = 0
  const c = canvas.value
  if (!c || !ctx) return
  ctx.clearRect(0, 0, c.width, c.height)
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]!
    if (++p.life >= p.max) { particles.splice(i, 1); continue }
    if (p.pull) {
      const dx = c.width / 2 - p.x, dy = c.height / 2 - p.y
      const d = Math.max(1, Math.hypot(dx, dy))
      p.vx += (dx / d) * p.pull; p.vy += (dy / d) * p.pull
    }
    p.vy += p.grav
    p.x += p.vx; p.y += p.vy
    ctx.globalAlpha = Math.max(0, 1 - p.life / p.max)
    if (p.shape === "streak") {
      ctx.strokeStyle = p.color; ctx.lineWidth = p.size
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 2, p.y - p.vy * 3); ctx.stroke()
    } else {
      ctx.fillStyle = p.color
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill()
    }
  }
  ctx.globalAlpha = 1
  if (particles.length) ensureLoop()
}

function spawnEmbers(color: string, n = 110) {
  const w = window.innerWidth, h = window.innerHeight
  for (let i = 0; i < n; i++) particles.push({
    x: Math.random() * w, y: h + Math.random() * 40,
    vx: (Math.random() - 0.5) * 0.7, vy: -(0.5 + Math.random() * 1.6), grav: -0.004,
    life: 0, max: 130 + Math.random() * 120, size: 1 + Math.random() * 2.6, color,
  })
  ensureLoop()
}

function spawnBlood(n = 70) {
  const w = window.innerWidth
  for (let i = 0; i < n; i++) particles.push({
    x: Math.random() * w, y: -10 - Math.random() * 60,
    vx: (Math.random() - 0.5) * 0.3, vy: 1 + Math.random() * 3, grav: 0.06,
    life: 0, max: 90 + Math.random() * 70, size: 1.5 + Math.random() * 3.5,
    color: `rgba(${(150 + Math.random() * 70) | 0},0,0,1)`,
  })
  ensureLoop()
}

// Cholerisch: aggressive, flackernde Flammen vom unteren Rand.
function spawnFire(n = 150) {
  const w = window.innerWidth, h = window.innerHeight
  const fire = ["#ffcc33", "#ff8800", "#ff4400", "#cc1111"]
  for (let i = 0; i < n; i++) particles.push({
    x: Math.random() * w, y: h + Math.random() * 30,
    vx: (Math.random() - 0.5) * 1.2, vy: -(1.2 + Math.random() * 3), grav: -0.01,
    life: 0, max: 55 + Math.random() * 70, size: 1.5 + Math.random() * 3.5,
    color: fire[(Math.random() * fire.length) | 0]!,
  })
  ensureLoop()
}

// Melancholisch: feiner, schräg fallender Regen (Streifen).
function spawnRain(color: string, n = 170) {
  const w = window.innerWidth, h = window.innerHeight
  for (let i = 0; i < n; i++) particles.push({
    x: Math.random() * w, y: -Math.random() * h,
    vx: -0.6, vy: 9 + Math.random() * 6, grav: 0.05,
    life: 0, max: 80 + Math.random() * 60, size: 1 + Math.random() * 1.2,
    color, shape: "streak",
  })
  ensureLoop()
}

// Phlegmatisch: langsam horizontal driftender, weicher Nebel.
function spawnMist(color: string, n = 45) {
  const w = window.innerWidth, h = window.innerHeight
  for (let i = 0; i < n; i++) particles.push({
    x: Math.random() * w, y: Math.random() * h,
    vx: 0.2 + Math.random() * 0.5, vy: (Math.random() - 0.5) * 0.2, grav: 0,
    life: 0, max: 200 + Math.random() * 160, size: 14 + Math.random() * 26,
    color: hexA(color, 0.06),
  })
  ensureLoop()
}

// Leer/Void: Partikel von den Rändern werden ins Zentrum gesogen.
function spawnVoid(n = 110) {
  const w = window.innerWidth, h = window.innerHeight
  for (let i = 0; i < n; i++) {
    const onTopBottom = Math.random() < 0.5
    particles.push({
      x: onTopBottom ? Math.random() * w : (Math.random() < 0.5 ? 0 : w),
      y: onTopBottom ? (Math.random() < 0.5 ? 0 : h) : Math.random() * h,
      vx: 0, vy: 0, grav: 0, pull: 0.06,
      life: 0, max: 90 + Math.random() * 60, size: 1 + Math.random() * 2.2,
      color: "#b9a2d6",
    })
  }
  ensureLoop()
}

function motifFor(m: "heart" | "horns" | "claw", ms: number) {
  motif.value = m
  window.setTimeout(() => { if (motif.value === m) motif.value = null }, ms)
}

// Eigenes Motiv + Sound je Resonanz.
function doResonance(key: string) {
  const vis = visualsEnabled()
  switch (key) {
    case "sanguine": // Leidenschaft: pochendes Herz aus Rauch + Kichern.
      if (vis) { motifFor("heart", 4600); spawnEmbers("#ff66cc", 60); pulseVignette("rgba(255,102,204,0.32)", 4600) }
      { const hb = playSound("heartbeat", { volume: 0.5, rate: 1.15 }); if (hb != null) window.setTimeout(() => stopSound("heartbeat", hb), 4600) }
      playSound("giggle")
      break
    case "choleric": // Wut: Feuer, Teufelshörner, Gebrüll, Beben.
      if (vis) { motifFor("horns", 3800); spawnFire(); shake("vfx-shake", 700); pulseVignette("rgba(220,60,0,0.5)", 3500) }
      playSound("roar")
      break
    case "melancholic": // Trauer: Regen, Weinen, kalter blauer Schleier.
      if (vis) { spawnRain("#7aa2ff"); pulseVignette("rgba(60,90,180,0.45)", 5000) }
      playSound("rain"); playSound("crying")
      break
    case "phlegmatic": // Ruhe: langsamer, sanfter Nebel + Wasser.
      if (vis) { spawnMist("#66ffff"); pulseVignette("rgba(102,255,255,0.26)", 5000) }
      playSound("water")
      break
    case "animalblood": // Tierblut: Krallenhieb + erratische grüne Funken + Knurren.
      if (vis) { motifFor("claw", 1200); spawnEmbers("#4dff88", 80); shake("vfx-shake", 500); pulseVignette("rgba(77,255,136,0.3)", 3500) }
      playSound("growl", { volume: 0.7 })
      break
    case "void": // Leer: Dunkelheit zieht nach innen, Entsättigung, Flüstern.
    default:
      if (vis) { spawnVoid(); desat.value = true; window.setTimeout(() => (desat.value = false), 3000); pulseVignette("rgba(20,12,30,0.85)", 4000) }
      playSound("whispers", { volume: 0.3 })
      break
  }
}

function flashOnce(ms = 350) { flash.value = true; window.setTimeout(() => (flash.value = false), ms) }
function shake(cls: "vfx-shake" | "vfx-tremor", ms: number) {
  document.body.classList.add(cls)
  window.setTimeout(() => document.body.classList.remove(cls), ms)
}
function pulseVignette(color: string, ms: number) {
  vignetteColor.value = color
  window.setTimeout(() => { if (vignetteColor.value === color) vignetteColor.value = null }, ms)
}

// --- Raserei (three.js Hero) ---
let frenzyStop: (() => void) | null = null
let frenzyHb: number | null = null
async function doFrenzy() {
  if (frenzyStop) return
  const dur = 6000
  frenzyHb = playSound("heartbeat", { volume: 0.7, rate: 0.9 })
  playSound("growl", { volume: 0.85 })
  vignetteColor.value = "rgba(200,16,46,0.6)"
  if (visualsEnabled()) {
    shake("vfx-tremor", dur)
    if (root.value) frenzyStop = await startFrenzy3d(root.value, dur)
  }
  if (frenzyHb != null) rampSound("heartbeat", frenzyHb, { rateTo: 1.5, ms: dur })
  window.setTimeout(endFrenzy, dur)
}
function endFrenzy() {
  document.body.classList.remove("vfx-tremor")
  if (vignetteColor.value === "rgba(200,16,46,0.6)") vignetteColor.value = null
  if (frenzyStop) { frenzyStop(); frenzyStop = null }
  if (frenzyHb != null) { stopSound("heartbeat", frenzyHb); frenzyHb = null }
}

function handle(e: FxEvent) {
  const vis = visualsEnabled()
  switch (e.kind) {
    case "resonance":
      doResonance(e.payload?.key || "void")
      break
    case "messyCrit":
      if (vis) { spawnBlood(); flashOnce(); shake("vfx-shake", 600); pulseVignette("rgba(160,0,0,0.55)", 1400) }
      playSound("growl", { volume: 0.8 }); playSound("blood")
      break
    case "bestialFail":
      if (vis) { desat.value = true; window.setTimeout(() => (desat.value = false), 2600); shake("vfx-shake", 700); pulseVignette("rgba(90,0,0,0.7)", 2200) }
      playSound("growl", { volume: 0.6 })
      break
    case "critSuccess":
      if (vis) { shimmer.value = true; window.setTimeout(() => (shimmer.value = false), 1200) }
      playSound("chime")
      break
    case "frenzy":
      doFrenzy()
      break
    case "hungerSpike":
      if (vis) pulseVignette("rgba(160,0,0,0.45)", 1600)
      playSound("whispers", { volume: 0.3 })
      break
  }
}

let unsub: (() => void) | null = null
onMounted(() => {
  ctx = canvas.value?.getContext("2d") || null
  resize()
  window.addEventListener("resize", resize)
  unsub = onFx(handle)
})
onUnmounted(() => {
  unsub?.()
  if (raf) cancelAnimationFrame(raf)
  window.removeEventListener("resize", resize)
  endFrenzy()
  document.body.classList.remove("vfx-shake", "vfx-tremor")
})
</script>

<template>
  <div ref="root" class="vfx">
    <canvas ref="canvas" class="vfx-canvas"></canvas>
    <div v-if="vignetteColor" class="vfx-vignette" :style="{ boxShadow: `inset 0 0 220px 70px ${vignetteColor}` }"></div>
    <div v-if="flash" class="vfx-flash"></div>
    <div v-if="shimmer" class="vfx-shimmer"></div>
    <div v-if="desat" class="vfx-desat"></div>

    <div v-if="motif" class="vfx-motif" :class="`vfx-motif--${motif}`">
      <svg v-if="motif === 'heart'" class="vfx-svg vfx-svg--heart" viewBox="0 0 32 29">
        <path d="M16 29S3 20.6 3 11.5C3 6 6.5 3 10 3c2.5 0 4.5 1.5 6 4 1.5-2.5 3.5-4 6-4 3.5 0 7 3 7 8.5C29 20.6 16 29 16 29z" />
      </svg>
      <svg v-else-if="motif === 'horns'" class="vfx-svg vfx-svg--horns" viewBox="0 0 100 40">
        <path d="M10 40C10 15 25 5 40 8 28 12 22 25 25 40Z" />
        <path d="M90 40C90 15 75 5 60 8 72 12 78 25 75 40Z" />
      </svg>
      <svg v-else class="vfx-svg vfx-svg--claw" viewBox="0 0 100 100">
        <path d="M20 5 40 95" /><path d="M45 5 62 95" /><path d="M70 5 85 95" />
      </svg>
    </div>
  </div>
</template>

<style scoped lang="scss">
.vfx {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9000;
  overflow: hidden;
}
.vfx-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.vfx-vignette {
  position: absolute;
  inset: 0;
  animation: vfx-vignette-pulse 1.6s ease-in-out infinite;
}
@keyframes vfx-vignette-pulse {
  0%, 100% { opacity: 0.55; }
  50% { opacity: 1; }
}
.vfx-flash {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 50%, rgba(200, 0, 0, 0.0), rgba(160, 0, 0, 0.45));
  animation: vfx-flash 0.35s ease-out forwards;
}
@keyframes vfx-flash { from { opacity: 1; } to { opacity: 0; } }
.vfx-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(115deg, transparent 30%, rgba(255, 215, 130, 0.35) 48%, rgba(200, 16, 46, 0.35) 55%, transparent 72%);
  background-size: 300% 100%;
  animation: vfx-shimmer 1.2s ease-out forwards;
}
@keyframes vfx-shimmer { from { background-position: 130% 0; } to { background-position: -60% 0; } }
.vfx-desat {
  position: absolute;
  inset: 0;
  backdrop-filter: grayscale(0.85) contrast(1.1);
  -webkit-backdrop-filter: grayscale(0.85) contrast(1.1);
  animation: vfx-flash 2.6s ease-out forwards;
}

/* Resonanz-Motive (Herz / Hörner / Krallen). */
.vfx-motif {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.vfx-motif--horns { align-items: flex-start; }
.vfx-svg--heart {
  width: min(40vmin, 320px);
  fill: #ff5fa8;
  filter: drop-shadow(0 0 30px rgba(255, 90, 160, 0.8));
  animation: vfx-heart-beat 0.85s ease-in-out infinite, vfx-fade-io 4.6s ease-in-out forwards;
}
@keyframes vfx-heart-beat {
  0%, 100% { transform: scale(1); }
  15% { transform: scale(1.18); }
  30% { transform: scale(1); }
  45% { transform: scale(1.1); }
}
.vfx-svg--horns {
  width: min(70vmin, 560px);
  margin-top: 3vh;
  fill: #ff5a1e;
  filter: drop-shadow(0 0 26px rgba(255, 80, 20, 0.85));
  animation: vfx-horns-rise 3.8s ease-out forwards;
}
@keyframes vfx-horns-rise {
  0% { opacity: 0; transform: translateY(20px) scale(0.9); }
  18% { opacity: 1; transform: translateY(0) scale(1); }
  80% { opacity: 1; }
  100% { opacity: 0; }
}
.vfx-svg--claw {
  width: min(60vmin, 520px);
  fill: none;
  stroke: #6dffa0;
  stroke-width: 5;
  stroke-linecap: round;
  stroke-dasharray: 110;
  filter: drop-shadow(0 0 16px rgba(77, 255, 136, 0.9));
  animation: vfx-claw 1.2s ease-out forwards;
}
@keyframes vfx-claw {
  0% { opacity: 0; stroke-dashoffset: 110; transform: translateX(-20px) rotate(-6deg); }
  25% { opacity: 1; }
  60% { stroke-dashoffset: 0; }
  100% { opacity: 0; transform: translateX(20px) rotate(-6deg); }
}
@keyframes vfx-fade-io {
  0% { opacity: 0; }
  12% { opacity: 1; }
  82% { opacity: 1; }
  100% { opacity: 0; }
}
</style>

<style lang="scss">
/* Body-Shake/Tremor (außerhalb des Komponenten-Scopes). */
body.vfx-shake { animation: vfx-shake 0.5s ease-in-out; }
body.vfx-tremor { animation: vfx-tremor 0.18s linear infinite; }
@keyframes vfx-shake {
  0%, 100% { transform: translate(0, 0); }
  20% { transform: translate(-6px, 3px); }
  40% { transform: translate(5px, -4px); }
  60% { transform: translate(-4px, 4px); }
  80% { transform: translate(4px, -2px); }
}
@keyframes vfx-tremor {
  0% { transform: translate(0, 0); }
  25% { transform: translate(-2px, 1px); }
  50% { transform: translate(2px, -1px); }
  75% { transform: translate(-1px, 2px); }
  100% { transform: translate(1px, -1px); }
}
</style>
