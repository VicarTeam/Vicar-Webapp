import { Howl } from "howler"
import { SettingsData } from "@/libs/io/settings"

/**
 * Sound-Manager für FX. Dateien liegen in /public/audio. Fehlende Dateien werden
 * still ignoriert (onloaderror) – so kann man weitere SFX einfach nachlegen.
 * Vorhanden: heartbeat, whispers (aus dem alten Frontend). growl/blood/chime sind
 * optional – Datei nach /public/audio/<name>.mp3 legen, dann spielen sie automatisch.
 */

interface SoundDef {
  src: string
  volume: number
  loop?: boolean
}

const SOUNDS: Record<string, SoundDef> = {
  heartbeat: { src: "/audio/heartbeat.mp3", volume: 0.2, loop: true },
  whispers: { src: "/audio/whispers.mp3", volume: 0.2 },
  growl: { src: "/audio/growl.mp3", volume: 0.2 },
  blood: { src: "/audio/blood.mp3", volume: 0.3 },
  chime: { src: "/audio/chime.mp3", volume: 0.3 },
  giggle: { src: "/audio/giggle.mp3", volume: 0.1 },
  roar: { src: "/audio/roar.mp3", volume: 0.2 },
  rain: { src: "/audio/rain.mp3", volume: 0.3 },
  crying: { src: "/audio/crying.mp3", volume: 0.3 },
  water: { src: "/audio/water.mp3", volume: 0.2 },
}

const cache = new Map<string, Howl>()

function get(name: string): Howl | null {
  const def = SOUNDS[name]
  if (!def) return null
  let h = cache.get(name)
  if (!h) {
    h = new Howl({ src: [def.src], volume: def.volume, loop: !!def.loop, html5: false, onloaderror: () => void 0 })
    cache.set(name, h)
  }
  return h
}

export function playSound(name: string, opts?: { volume?: number; rate?: number }): number | null {
  if (!SettingsData.isSoundEnabled()) return null
  const def = SOUNDS[name]
  const h = get(name)
  if (!def || !h) return null
  const id = h.play()
  h.volume(opts?.volume ?? def.volume, id)
  if (opts?.rate != null) h.rate(opts.rate, id)
  return id
}

/** Lautstärke eines laufenden Sounds rampen (z.B. Herzschlag beschleunigen/ausfaden). */
export function rampSound(name: string, id: number, opts: { volumeTo?: number; rateTo?: number; ms: number }) {
  const h = cache.get(name)
  const def = SOUNDS[name]
  if (!h || !def) return
  if (opts.volumeTo != null) h.fade(def.volume, opts.volumeTo, opts.ms, id)
  if (opts.rateTo != null) h.rate(opts.rateTo, id)
}

export function stopSound(name: string, id?: number) {
  const h = cache.get(name)
  if (!h) return
  if (id != null) h.stop(id)
  else h.stop()
}
