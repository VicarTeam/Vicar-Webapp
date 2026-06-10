<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import DataManager from "@/libs/data/data-manager"
import { resolveAssetUrl } from "@/libs/io/cdn"
import {
  type AdminCharacterSummary,
  type AdminUser,
  deleteCharacter,
  deleteUser,
  getCharacter,
  getUserCharacters,
  listUsers,
  saveCharacter,
  setUserAdmin,
} from "@/libs/io/admin"

const router = useRouter()

const users = ref<AdminUser[]>([])
const userSearch = ref("")
const selectedUser = ref<AdminUser | null>(null)

const userCharacters = ref<AdminCharacterSummary[]>([])
const selectedCharId = ref<string | null>(null)

const draft = ref<any>(null)
const jsonText = ref("")
const jsonError = ref<string | null>(null)
const editMode = ref<"quick" | "json">("quick")

const saving = ref(false)
const notice = ref<{ msg: string; type: "ok" | "err" | "" }>({ msg: "", type: "" })

const filteredUsers = computed(() => {
  const q = userSearch.value.trim().toLowerCase()
  if (!q) return users.value
  return users.value.filter((u) => u.username.toLowerCase().includes(q))
})

// Editier-Felder = alle Top-Level-Primitive (string/number/boolean) des Blobs.
const quickKeys = computed(() => {
  if (!draft.value) return []
  return Object.keys(draft.value)
    .filter((k) => {
      if (k === "id" || k === "userId") return false
      const t = typeof draft.value[k]
      return t === "string" || t === "number" || t === "boolean"
    })
    .sort()
})

onMounted(async () => {
  users.value = await listUsers()
})

async function selectUser(u: AdminUser) {
  selectedUser.value = u
  selectedCharId.value = null
  draft.value = null
  notice.value = { msg: "", type: "" }
  userCharacters.value = await getUserCharacters(u.id)
}

async function selectChar(id: string) {
  notice.value = { msg: "", type: "" }
  jsonError.value = null
  const full = await getCharacter(id)
  if (!full) {
    notice.value = { msg: "Charakter konnte nicht geladen werden.", type: "err" }
    return
  }
  selectedCharId.value = id
  draft.value = full
  jsonText.value = JSON.stringify(full, null, 2)
  editMode.value = "quick"
}

function validateJson() {
  try {
    JSON.parse(jsonText.value)
    jsonError.value = null
  } catch (e: any) {
    jsonError.value = e?.message ? String(e.message) : "Ungültiges JSON"
  }
}

function switchMode(target: "quick" | "json") {
  if (target === editMode.value) return
  if (target === "json") {
    jsonText.value = JSON.stringify(draft.value, null, 2)
    jsonError.value = null
    editMode.value = "json"
  } else {
    // Vor dem Zurückwechseln das JSON übernehmen (und validieren).
    try {
      draft.value = JSON.parse(jsonText.value)
      jsonError.value = null
      editMode.value = "quick"
    } catch (e: any) {
      jsonError.value = e?.message ? String(e.message) : "Ungültiges JSON"
    }
  }
}

async function save() {
  if (!selectedCharId.value) return

  // Validierung VOR dem Speichern.
  let obj = draft.value
  if (editMode.value === "json") {
    try {
      obj = JSON.parse(jsonText.value)
    } catch (e: any) {
      jsonError.value = e?.message ? String(e.message) : "Ungültiges JSON"
      return
    }
  }
  if (!obj || typeof obj !== "object" || Array.isArray(obj) || typeof obj.name !== "string") {
    notice.value = { msg: 'Ungültig: braucht ein Objekt mit Feld "name".', type: "err" }
    return
  }

  saving.value = true
  const [status] = await saveCharacter(selectedCharId.value, obj)
  saving.value = false

  if (status === 200) {
    draft.value = obj
    jsonText.value = JSON.stringify(obj, null, 2)
    jsonError.value = null
    notice.value = { msg: "Gespeichert.", type: "ok" }
    const c = userCharacters.value.find((x) => x.id === selectedCharId.value)
    if (c) c.name = obj.name
  } else {
    notice.value = { msg: `Speichern fehlgeschlagen (${status}).`, type: "err" }
  }
}

async function toggleAdmin(u: AdminUser) {
  const next = !u.isAdmin
  if (!confirm(`"${u.username}" ${next ? "zum Admin machen" : "Admin-Rechte entziehen"}?`)) return
  const [status] = await setUserAdmin(u.id, next)
  if (status === 200) u.isAdmin = next
}

async function removeUser(u: AdminUser) {
  if (!confirm(`User "${u.username}" inkl. ALLER Charaktere unwiderruflich löschen?`)) return
  const [status] = await deleteUser(u.id)
  if (status === 200) {
    users.value = users.value.filter((x) => x.id !== u.id)
    if (selectedUser.value?.id === u.id) {
      selectedUser.value = null
      userCharacters.value = []
      draft.value = null
      selectedCharId.value = null
    }
  }
}

async function removeChar(c: AdminCharacterSummary) {
  if (!confirm(`Charakter "${c.name || c.id}" löschen?`)) return
  const [status] = await deleteCharacter(c.id)
  if (status === 200) {
    userCharacters.value = userCharacters.value.filter((x) => x.id !== c.id)
    if (selectedUser.value) selectedUser.value.characterCount = Math.max(0, selectedUser.value.characterCount - 1)
    if (selectedCharId.value === c.id) {
      draft.value = null
      selectedCharId.value = null
    }
  }
}
</script>

<template>
  <div class="acp">
    <header class="acp-top">
      <div class="brand">VICAR<span class="sep">//</span>ADMIN</div>
      <div class="spacer"></div>
      <div class="who" v-if="DataManager.loggedInAs">{{ DataManager.loggedInAs }}</div>
      <button class="acp-back" @click="router.push('/')">← Zur App</button>
    </header>

    <div class="acp-grid">
      <!-- Spalte 1: User -->
      <section class="acp-panel">
        <div class="acp-head">USER<span class="count">{{ filteredUsers.length }}</span></div>
        <input class="acp-search" v-model="userSearch" placeholder="suche…" spellcheck="false" />
        <div class="acp-list">
          <div
            v-for="u in filteredUsers"
            :key="u.id"
            class="acp-row"
            :class="{ active: selectedUser?.id === u.id }"
            @click="selectUser(u)"
          >
            <div class="acp-row-main">
              <span class="name">{{ u.username }}</span>
              <span v-if="u.isAdmin" class="tag">ADMIN</span>
            </div>
            <div class="acp-row-sub">{{ u.characterCount }} chars</div>
            <div class="acp-row-actions">
              <button class="mini" @click.stop="toggleAdmin(u)" :title="u.isAdmin ? 'Admin entziehen' : 'Zu Admin machen'">⛨</button>
              <button class="mini danger" @click.stop="removeUser(u)" title="User löschen">✕</button>
            </div>
          </div>
          <div v-if="filteredUsers.length === 0" class="acp-empty">keine User</div>
        </div>
      </section>

      <!-- Spalte 2: Charaktere -->
      <section class="acp-panel">
        <div class="acp-head">CHARAKTERE<span class="count" v-if="selectedUser">{{ userCharacters.length }}</span></div>
        <div v-if="!selectedUser" class="acp-empty pad">← User wählen</div>
        <div v-else class="acp-list">
          <div
            v-for="c in userCharacters"
            :key="c.id"
            class="acp-row char"
            :class="{ active: selectedCharId === c.id }"
            @click="selectChar(c.id)"
          >
            <img class="acp-av" :src="resolveAssetUrl(c.avatar) || '/img/placeholder.jpg'" alt="" />
            <div class="acp-row-main">
              <span class="name">{{ c.name || "—" }}</span>
              <span class="tag tech">{{ (c.game || "v5").toUpperCase() }}</span>
            </div>
            <div class="acp-row-actions">
              <button class="mini danger" @click.stop="removeChar(c)" title="Charakter löschen">✕</button>
            </div>
          </div>
          <div v-if="userCharacters.length === 0" class="acp-empty pad">keine Charaktere</div>
        </div>
      </section>

      <!-- Spalte 3: Editor -->
      <section class="acp-panel editor">
        <div class="acp-head">
          EDITOR
          <div class="modes" v-if="draft">
            <button :class="{ on: editMode === 'quick' }" @click="switchMode('quick')">QUICK</button>
            <button :class="{ on: editMode === 'json' }" @click="switchMode('json')">JSON</button>
          </div>
        </div>

        <div v-if="!draft" class="acp-empty pad">← Charakter wählen</div>
        <template v-else>
          <div class="acp-editor-body">
            <div v-if="editMode === 'quick'" class="acp-quick">
              <div v-for="k in quickKeys" :key="k" class="acp-field">
                <label :title="k">{{ k }}</label>
                <input v-if="typeof draft[k] === 'boolean'" type="checkbox" v-model="draft[k]" />
                <input v-else-if="typeof draft[k] === 'number'" type="number" v-model.number="draft[k]" />
                <input v-else type="text" v-model="draft[k]" />
              </div>
              <div class="acp-hint">Verschachtelte Werte (Disziplinen, Skills, Inventar …) im JSON-Tab.</div>
            </div>

            <textarea
              v-else
              class="acp-json"
              v-model="jsonText"
              @input="validateJson"
              spellcheck="false"
            ></textarea>
          </div>

          <div class="acp-foot">
            <div class="acp-status" :class="jsonError ? 'err' : notice.type">{{ jsonError || notice.msg }}</div>
            <button class="acp-btn" :disabled="saving || (editMode === 'json' && !!jsonError)" @click="save">
              {{ saving ? "SPEICHERT…" : "SPEICHERN" }}
            </button>
          </div>
        </template>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
.acp {
  --blood: #c8102e;
  --blood-dim: #7a0c1e;
  --tech: #36d6d0;
  --bg: #070709;
  --panel: #0b0c11;
  --panel-2: #0e1017;
  --line: rgba(54, 214, 208, 0.22);
  --line-blood: rgba(200, 16, 46, 0.40);
  --txt: #d7e0e6;
  --txt-dim: #7b8794;

  position: fixed;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  background:
      radial-gradient(1200px 500px at 80% -10%, rgba(200, 16, 46, 0.10), transparent 60%),
      var(--bg);
  color: var(--txt);
  font-family: ui-monospace, "SFMono-Regular", "JetBrains Mono", Menlo, Consolas, monospace;
  overflow: hidden;

  // dezente Scanlines
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.022) 0 1px, transparent 1px 3px);
    opacity: 0.6;
    z-index: 2;
  }
}

.acp-top {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.7rem 1.1rem;
  border-bottom: 1px solid var(--line-blood);
  background: linear-gradient(180deg, rgba(200, 16, 46, 0.08), transparent);
  z-index: 3;

  .brand {
    font-weight: 700;
    letter-spacing: 3px;
    font-size: 1.05rem;
    color: #fff;
    text-shadow: 0 0 14px rgba(200, 16, 46, 0.55);
    .sep { color: var(--tech); margin: 0 0.35rem; text-shadow: 0 0 12px rgba(54, 214, 208, 0.6); }
  }
  .spacer { flex: 1; }
  .who { color: var(--tech); font-size: 0.85rem; letter-spacing: 1px; }
  .acp-back {
    background: transparent;
    border: 1px solid var(--line);
    color: var(--txt);
    padding: 0.4rem 0.7rem;
    border-radius: 4px;
    cursor: pointer;
    font-family: inherit;
    font-size: 0.8rem;
    letter-spacing: 1px;
    &:hover { border-color: var(--tech); color: var(--tech); box-shadow: 0 0 14px rgba(54, 214, 208, 0.25); }
  }
}

.acp-grid {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 18rem 18rem 1fr;
  gap: 1px;
  background: var(--line);
  z-index: 3;
}

.acp-panel {
  background: var(--panel);
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  &.editor { background: var(--panel-2); }
}

.acp-head {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.8rem;
  font-size: 0.72rem;
  letter-spacing: 2.5px;
  color: var(--txt-dim);
  border-bottom: 1px solid var(--line);
  text-transform: uppercase;
  flex-shrink: 0;

  .count {
    margin-left: auto;
    color: var(--tech);
    border: 1px solid var(--line);
    border-radius: 999px;
    padding: 0 0.5rem;
    font-size: 0.7rem;
  }
  .modes {
    margin-left: auto;
    display: flex;
    gap: 0.3rem;
    button {
      background: transparent;
      border: 1px solid var(--line);
      color: var(--txt-dim);
      font-family: inherit;
      font-size: 0.68rem;
      letter-spacing: 1.5px;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      cursor: pointer;
      &.on { color: #03121a; background: var(--tech); border-color: var(--tech); box-shadow: 0 0 12px rgba(54, 214, 208, 0.4); }
    }
  }
}

.acp-search {
  margin: 0.6rem 0.6rem 0.2rem;
  background: #05060a;
  border: 1px solid var(--line);
  color: var(--txt);
  font-family: inherit;
  padding: 0.45rem 0.6rem;
  border-radius: 4px;
  outline: none;
  &:focus { border-color: var(--tech); box-shadow: 0 0 0 2px rgba(54, 214, 208, 0.18); }
}

.acp-list {
  overflow-y: auto;
  padding: 0.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.acp-row {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-areas: "main actions" "sub actions";
  align-items: center;
  gap: 0.1rem 0.5rem;
  padding: 0.5rem 0.6rem;
  border: 1px solid transparent;
  border-left: 2px solid var(--line-blood);
  background: #0a0b10;
  border-radius: 4px;
  cursor: pointer;

  &.char { grid-template-columns: auto 1fr auto; grid-template-areas: "av main actions"; }

  &:hover { border-color: var(--line); background: #0c0e14; }
  &.active {
    border-color: var(--blood);
    border-left-color: var(--blood);
    box-shadow: 0 0 16px rgba(200, 16, 46, 0.22), inset 0 0 0 1px rgba(200, 16, 46, 0.25);
    background: #11070b;
  }

  .acp-row-main {
    grid-area: main;
    display: flex;
    align-items: center;
    gap: 0.45rem;
    min-width: 0;
    .name { color: #fff; font-size: 0.9rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  }
  .acp-row-sub { grid-area: sub; color: var(--txt-dim); font-size: 0.72rem; }
  .acp-row-actions {
    grid-area: actions;
    display: flex;
    gap: 0.25rem;
    opacity: 0.5;
  }
  &:hover .acp-row-actions, &.active .acp-row-actions { opacity: 1; }
}

.acp-av {
  grid-area: av;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--line-blood);
}

.tag {
  font-size: 0.6rem;
  letter-spacing: 1px;
  padding: 0.08rem 0.35rem;
  border-radius: 3px;
  background: rgba(200, 16, 46, 0.18);
  color: #ff6b82;
  border: 1px solid var(--line-blood);
  &.tech { background: rgba(54, 214, 208, 0.12); color: var(--tech); border-color: var(--line); }
}

.mini {
  background: transparent;
  border: 1px solid var(--line);
  color: var(--txt-dim);
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  line-height: 1;
  display: grid;
  place-items: center;
  &:hover { color: var(--tech); border-color: var(--tech); }
  &.danger:hover { color: #ff5d74; border-color: var(--blood); box-shadow: 0 0 10px rgba(200, 16, 46, 0.3); }
}

.acp-empty {
  color: var(--txt-dim);
  font-size: 0.8rem;
  letter-spacing: 1px;
  &.pad { padding: 1.2rem 0.9rem; }
  padding: 0.6rem;
}

/* Editor */
.acp-editor-body { flex: 1; min-height: 0; display: flex; }

.acp-quick {
  flex: 1;
  overflow-y: auto;
  padding: 0.7rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  gap: 0.6rem;
  align-content: start;
}

.acp-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  label {
    font-size: 0.68rem;
    letter-spacing: 1px;
    color: var(--tech);
    text-transform: lowercase;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  input[type="text"], input[type="number"] {
    background: #05060a;
    border: 1px solid var(--line);
    color: var(--txt);
    font-family: inherit;
    font-size: 0.85rem;
    padding: 0.4rem 0.55rem;
    border-radius: 4px;
    outline: none;
    width: 100%;
    &:focus { border-color: var(--tech); box-shadow: 0 0 0 2px rgba(54, 214, 208, 0.18); }
  }
  input[type="checkbox"] { width: 18px; height: 18px; accent-color: var(--blood); }
}

.acp-hint { grid-column: 1 / -1; color: var(--txt-dim); font-size: 0.72rem; padding-top: 0.3rem; }

.acp-json {
  flex: 1;
  width: 100%;
  resize: none;
  background: #05060a;
  border: none;
  border-top: 1px solid var(--line);
  color: #b9e6e2;
  font-family: inherit;
  font-size: 0.82rem;
  line-height: 1.5;
  padding: 0.8rem;
  outline: none;
  tab-size: 2;
  &:focus { box-shadow: inset 0 0 0 1px rgba(54, 214, 208, 0.25); }
}

.acp-foot {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.6rem 0.8rem;
  border-top: 1px solid var(--line);
  flex-shrink: 0;

  .acp-status {
    flex: 1;
    font-size: 0.76rem;
    letter-spacing: 0.5px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--txt-dim);
    &.ok { color: var(--tech); }
    &.err { color: #ff5d74; }
  }
}

.acp-btn {
  background: linear-gradient(180deg, var(--blood), var(--blood-dim));
  border: 1px solid var(--blood);
  color: #fff;
  font-family: inherit;
  letter-spacing: 2px;
  font-size: 0.8rem;
  padding: 0.55rem 1.1rem;
  border-radius: 4px;
  cursor: pointer;
  box-shadow: 0 0 18px rgba(200, 16, 46, 0.3);
  &:hover:not(:disabled) { filter: brightness(1.1); box-shadow: 0 0 24px rgba(200, 16, 46, 0.5); }
  &:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }
}

@media (max-width: 900px) {
  .acp-grid {
    grid-template-columns: 1fr;
    grid-auto-rows: minmax(12rem, auto);
    overflow-y: auto;
  }
  .acp-panel.editor { min-height: 24rem; }
}
</style>
