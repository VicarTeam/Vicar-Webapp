<script setup lang="ts">
import { ref } from "vue"
import Modal from "@/components/modal/Modal.vue"
import CharacterStorage from "@/libs/io/character-storage"
import FileCreator from "@/libs/io/file-creator"
import { post } from "@/libs/io/rest"
import type { ICharacter } from "@/@types/models"

const emit = defineEmits<{ (e: "migrated"): void }>()

const show = ref(false)
const character = ref<ICharacter | null>(null)
const backedUp = ref(false)
const busy = ref(false)
const error = ref("")

const showModal = (c: ICharacter) => {
  character.value = c
  backedUp.value = false
  busy.value = false
  error.value = ""
  show.value = true
}

async function backup(): Promise<void> {
  const c = character.value
  if (!c) return
  const full = await CharacterStorage.getFullCharacter(c.id)
  const data: any = full ?? c
  FileCreator.create((data.name || "charakter") + ".json", JSON.stringify(data))
  backedUp.value = true
}

async function migrate() {
  const c = character.value
  if (!c || busy.value) return
  busy.value = true
  error.value = ""
  try {
    // Sicherheitsnetz: wurde noch nicht gesichert, jetzt automatisch sichern.
    if (!backedUp.value) await backup()

    const [status, body] = await post<any>(`/characters/${c.id}/migrate`)
    if (status !== 200) {
      error.value = body?.message || "Die Modernisierung ist fehlgeschlagen."
      busy.value = false
      return
    }

    show.value = false
    emit("migrated")
  } catch {
    error.value = "Die Modernisierung ist fehlgeschlagen."
    busy.value = false
  }
}

defineExpose({ showModal })
</script>

<template>
  <Modal :shown="show" @close="show = false" v-if="character">
    <div class="mcm">
      <b class="mcm__title">Charakter modernisieren</b>

      <div class="mcm__warn">
        <i class="fa-solid fa-triangle-exclamation" />
        <span>
          Diese Funktion ist noch <b>experimentell</b> und kann im schlimmsten Fall zu
          <b>Datenverlust</b> führen. Bitte sichere den Charakter vorher als Datei.
        </span>
      </div>

      <p class="mcm__text">
        „{{ character.name }}" wird auf die neue Speicherung umgestellt. Lade dir davor
        eine Sicherung herunter — sollte etwas schiefgehen, kannst du den Charakter daraus
        wiederherstellen. Klickst du direkt auf <b>Modernisieren</b>, sichern wir ihn
        automatisch, bevor die Umstellung startet.
      </p>

      <div v-if="backedUp" class="mcm__ok"><i class="fa-solid fa-check" /> Sicherung heruntergeladen.</div>
      <div v-if="error" class="mcm__error">{{ error }}</div>

      <div class="mcm__actions">
        <button class="btn" :disabled="busy" @click="show = false">Abbrechen</button>
        <button class="btn" :disabled="busy" @click="backup">Charakter sichern</button>
        <button class="btn btn-primary" :disabled="busy" @click="migrate">
          <i v-if="busy" class="fa-solid fa-spinner fa-spin" />
          Modernisieren
        </button>
      </div>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.mcm {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  max-width: 34rem;
}

.mcm__title {
  font-size: 1.2rem;
  font-family: var(--font-display, Cinzel), serif;
  letter-spacing: 0.03em;
}

.mcm__warn {
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
  padding: 0.75rem;
  border-radius: 0.6rem;
  background: rgba(224, 122, 122, 0.10);
  border: 1px solid rgba(224, 122, 122, 0.42);
  color: #e8b3b3;

  i {
    margin-top: 0.15rem;
  }
}

.mcm__text {
  margin: 0;
  opacity: 0.92;
}

.mcm__ok {
  color: #8fdc8f;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.mcm__error {
  color: #e07a7a;
}

.mcm__actions {
  display: flex;
  gap: 0.6rem;
  justify-content: flex-end;
  flex-wrap: wrap;
}
</style>
