<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, ref } from "vue"
import Bullet from "@/components/Bullet.vue"
import Avatar from "@/components/Avatar.vue"
import IconButton from "@/components/IconButton.vue"
import {getGenerationName, getSexName, type ICharacter} from "@/@types/models"
import CharacterStorage from "@/libs/io/character-storage"
import FileCreator from "@/libs/io/file-creator"
import { GameLine, type IBaseSheet } from "@/@types/gameline"
import {useRouter} from "vue-router";
import {useStore} from "@/app/store.ts";

const store = useStore()
const router = useRouter()

const props = defineProps<{
  character: IBaseSheet
}>()

const localIsVampire = computed(() => props.character?.game === GameLine.Vampire || !props.character?.game)

const editViewers = inject<(character: ICharacter) => void>("edit-viewers")!
const beginCharDeletion = inject<(character: ICharacter) => void>("begin-char-deletion")!
const updateCharacterList = inject<() => void>("update-character-list")!

const beginDrag = inject<(char: ICharacter, e: PointerEvent) => void>("begin-drag")!

/*const enableSyncModalVisible = ref(false)
const enableSyncModalType = ref<"in" | "out">("out")
const enableSyncModalInHash = ref("")

const infoSyncModalVisible = ref(false)
const infoSyncModalDisableConfirm = ref<number | null>(null)*/

const ctrlDown = ref(false)

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Control") ctrlDown.value = true
}
function onKeyup(e: KeyboardEvent) {
  if (e.key === "Control") ctrlDown.value = false
}

onMounted(() => {
  window.addEventListener("keydown", onKeydown)
  window.addEventListener("keyup", onKeyup)
})
onUnmounted(() => {
  window.removeEventListener("keydown", onKeydown)
  window.removeEventListener("keyup", onKeyup)
})

async function cloneCharacter(character: ICharacter) {
  // Karte hält nur ein Summary -> vollen Blob laden, sonst wäre der Klon unvollständig.
  const full = await CharacterStorage.getFullCharacter(character.id)
  if (!full) return
  const newChar = { ...(full as any) } as any
  newChar.name += " - " + String((window as any).$t ? (window as any).$t("character.copy") : "Kopie")
  await CharacterStorage.addCharacter(newChar)
  updateCharacterList()
}

async function exportCharacter(char: ICharacter) {
  // Vollständigen Blob exportieren, nicht nur das Listen-Summary.
  const full = await CharacterStorage.getFullCharacter(char.id)
  const data = full ?? char
  FileCreator.create(data.name + ".json", JSON.stringify(data))
}

function viewCharacter(character: ICharacter, newTab = false) {
  if (ctrlDown.value || newTab) {
    window.open(router.resolve({name: 'viewer', params: {characterId: character.id}}).href, '_blank');
    return;
  }

  store.isLevelMode = false
  router.push({name: 'viewer', params: {characterId: character.id}});
}

/*async function finishLinkCharacterWithSync() {
  if (enableSyncModalType.value === "out") {
    const hash = await VicarSync.enableCharacterOutSync(props.character as unknown as ICharacter)
    if (hash) await navigator.clipboard.writeText(hash)
  } else {
    await VicarSync.syncCharacterIn(props.character as unknown as ICharacter, enableSyncModalInHash.value)
  }
  enableSyncModalVisible.value = false
  enableSyncModalInHash.value = ""
  enableSyncModalType.value = "out"
}

async function beginUnlinkCharacterWithSync() {
  if (infoSyncModalDisableConfirm.value === null) {
    infoSyncModalDisableConfirm.value = window.setTimeout(() => (infoSyncModalDisableConfirm.value = null), 3000)
  } else {
    if (VicarSync.isCharacterSyncedOut(props.character as any)) {
      await VicarSync.disableCharacterOutSync(props.character as any)
    } else if (VicarSync.isCharacterSyncedIn(props.character as any)) {
      await VicarSync.unsyncCharacterIn(props.character as any)
    }
    infoSyncModalVisible.value = false
    clearTimeout(infoSyncModalDisableConfirm.value)
    infoSyncModalDisableConfirm.value = null
  }
}

async function copySyncOutId() {
  await navigator.clipboard.writeText(VicarSync.getCharacterSyncOutId(props.character as any))
}*/

const mocActive = computed(() => localIsVampire.value && !!(props.character as any)?.hasCainsMark)

function onDragHandleDown(e: PointerEvent) {
  beginDrag(props.character as unknown as ICharacter, e)
}
</script>

<template>
  <div
    class="character-entry"
    :class="{
      w5: character.game === GameLine.Werewolf,
      m20: character.game === GameLine.Mage,
      h5: character.game === GameLine.Hunter,
      vdz: character.game === GameLine.DarkAges,
    }"
  >
    <div class="drag-handle" @pointerdown="onDragHandleDown" title="Drag">
      <i class="fa-solid fa-grip-vertical"></i>
    </div>

    <Avatar :src="character.avatar" :orientation="character.avatarOrientation" class="avatar" />

    <div class="info">
      <span class="title">{{ character.name }}</span>

      <span class="subtitle">
        {{ getSexName((character as any).sex) }}
        <bullet />
        {{ (character as any).concept }}
        <bullet v-if="(character as any).concept" />

        <span v-if="(character as any).clan"><i> Clan:</i> {{ (character as any).clan.name }}</span>
        <span v-else-if="(character as any).tribe"><i> Stamm:</i> {{ (character as any).tribe.name }}</span>
        <span v-else-if="(character as any).tradition"><i> Allianz:</i> {{ (character as any).tradition.name }}</span>
        <span v-else-if="(character as any).creed"><i> Credo:</i> {{ (character as any).creed.name }}</span>

        <bullet />
        <span v-if="(character as any).clan">{{ (character as any).clan.slogan ?? (character as any).clan.nickname }}</span>
        <span v-else-if="(character as any).auspice">{{ (character as any).auspice.name }}</span>

        <bullet v-if="localIsVampire" />
        <span v-if="localIsVampire && !mocActive"><i> Generation:</i> {{ (character as any).generation }} ({{ getGenerationName((character as any).generationEra) }})</span>
        <span v-if="localIsVampire && mocActive"><i> Generation:</i> 1</span>

        <bullet v-if="(character as any).chronicle" />
        {{ (character as any).chronicle }}

        <bullet v-if="(character as any).exp > 0" />
        <span v-if="(character as any).exp > 0"><i> EXP:</i> {{ (character as any).exp }}</span>
      </span>
    </div>

    <div class="actions">
      <IconButton icon="fa-trash" @click="beginCharDeletion(character as any)" />
      <IconButton icon="fa-copy" @click="cloneCharacter(character as any)" />
      <IconButton icon="fa-file-arrow-down" @click="exportCharacter(character as any)" />
      <IconButton icon="fa-share-nodes" @click="editViewers(character as any)" />
      <IconButton icon="fa-eye" @click="viewCharacter(character as any)" />
    </div>

<!--    <Modal :shown="enableSyncModalVisible" @close="enableSyncModalVisible = false">
      <div class="modals-box">
        <b class="modals-title">Wie möchtest du diesen Charakter mit VicarSync synchronisieren?</b>
        <select class="form-control" v-model="enableSyncModalType">
          <option value="out">{{ $t("character.sync.enable.type.out") }}</option>
          <option value="in">{{ $t("character.sync.enable.type.in") }}</option>
        </select>

        <div class="form-group mb-0" v-if="enableSyncModalType === 'in'">
          <label>{{ $t("character.sync.hash") }}:</label>
          <input class="form-control" v-model="enableSyncModalInHash" />
        </div>

        <div class="center">
          <button class="btn btn-primary" :disabled="enableSyncModalType === 'in' && enableSyncModalInHash.length <= 0" @click="finishLinkCharacterWithSync">
            {{ $t("character.sync.enable") }}
          </button>
        </div>
      </div>
    </Modal>

    <Modal :shown="infoSyncModalVisible" @close="infoSyncModalVisible = false">
      <div class="modals-box">
        <b class="modals-title center-text">{{ $t("character.sync.info.text") }}</b>

        <div class="form-group mb-0" v-if="VicarSync.isCharacterSyncedOut(character as any)">
          <label>{{ $t("character.sync.hash") }}:</label>
          <div class="row">
            <input class="form-control" :value="VicarSync.getCharacterSyncOutId(character as any)" />
            <button class="btn btn-primary" @click="copySyncOutId">{{ $t("character.sync.info.hashcopy") }}</button>
          </div>
        </div>

        <div class="center">
          <button class="btn btn-dark" @click="beginUnlinkCharacterWithSync">
            {{ $t(infoSyncModalDisableConfirm ? "character.sync.info.disable.confirm" : "character.sync.info.disable") }}
          </button>
        </div>
      </div>
    </Modal>-->
  </div>
</template>

<style scoped lang="scss">
.character-entry {
  // Akzentfarbe pro Gameline (Default = globales Theme).
  --card-accent: var(--accent);
  position: relative;
  border-radius: var(--card-border-radius);
  background: linear-gradient(180deg, var(--bg-2), var(--bg-1));
  border: 1px solid color-mix(in srgb, var(--card-accent) 26%, rgba(255, 255, 255, 0.08));
  box-shadow: var(--shadow-hairline), var(--shadow-raise);
  overflow: hidden;
  user-select: none;
  padding: 1rem 1rem;
  display: grid;
  grid-template-columns: auto auto 1fr auto;
  gap: 1rem;
  align-items: center;
  transition: border-color var(--dur-2) var(--ease-1), box-shadow var(--dur-2) var(--ease-1);

  // Klare, kräftige Akzentkante oben statt Smoke-Overlay.
  &::before {
    content: "";
    position: absolute;
    inset: 0 0 auto 0;
    height: 3px;
    background: linear-gradient(90deg, var(--card-accent), color-mix(in srgb, var(--card-accent) 35%, transparent));
    pointer-events: none;
  }

  &:hover {
    border-color: color-mix(in srgb, var(--card-accent) 45%, rgba(255, 255, 255, 0.10));
    box-shadow: var(--shadow-hairline), var(--shadow-ambient);
  }

  &.w5 { --card-accent: #0e2e8c; }
  &.m20 { --card-accent: #6f2dbd; }
  &.h5 { --card-accent: #3b5d2a; }

  // VDZ (Dark Ages): gealterte, mittelalterliche Optik – dunkler Graurot-Verlauf
  // und eine feine Körnungs-Textur (keine warmen Gold-/Bronzetöne).
  &.vdz {
    --card-accent: #3d2a2c;
    background:
      radial-gradient(130% 120% at 50% -10%, rgba(61, 42, 44, 0.30), transparent 55%),
      linear-gradient(180deg, #141011, #0d0a0a);
    box-shadow:
      var(--shadow-hairline),
      var(--shadow-raise),
      inset 0 0 22px rgba(0, 0, 0, 0.5);

    // Feine Aged-Körnung über die ganze Karte (rein CSS/SVG, kein externes Asset).
    &::after {
      content: "";
      position: absolute;
      inset: 0;
      pointer-events: none;
      opacity: 0.22;
      mix-blend-mode: overlay;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    }
  }
}

.drag-handle {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  cursor: grab;
  border-radius: 8px;
  touch-action: none; // wichtig: Pointer-Drag auf Mobile
  &:active {
    cursor: grabbing;
  }
  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }
  i {
    opacity: 0.9;
  }
}

.avatar {
  width: 5rem;
  height: 5rem;
}

.info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  .title {
    text-transform: uppercase;
    font-size: 1.4rem;
    font-weight: 800;
    color: #fff;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .subtitle {
    font-size: 1.05rem;
    color: #939393;
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
  }
}

.actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.modal-box {
  padding: 1rem;
  width: min(26rem, calc(100vw - 2rem));
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-size: 1rem;
}
.modal-title {
  font-size: 1.15rem;
}
.center {
  display: flex;
  justify-content: center;
  align-items: center;
  .btn {
    min-height: 44px;
    width: 100%;
  }
}
.row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  .btn {
    min-height: 44px;
    flex: 0 0 auto;
  }
}
.center-text {
  text-align: center;
}

@media (max-width: 800px) {
  .character-entry {
    grid-template-columns: auto auto 1fr;
    grid-template-areas:
      "handle avatar actions"
      "info info info";
  }
  .drag-handle {
    grid-area: handle;
  }
  .avatar {
    grid-area: avatar;
  }
  .actions {
    grid-area: actions;
    justify-content: flex-end;
  }
  .info {
    grid-area: info;
  }
}
</style>
