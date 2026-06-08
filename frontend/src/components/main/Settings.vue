<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import CharacterStorage from "@/libs/io/character-storage"
import { DataSync } from "@/libs/data/data-sync"
import DataManager from "@/libs/data/data-manager"
import { post } from "@/libs/io/rest"
import { logout as doLogout } from "@/libs/auth"
import { SettingsData } from "@/libs/io/settings"

const oldPassword = ref("")
const newPassword = ref("")
const newPasswordRepeat = ref("")

const devMode = computed<boolean>({
  get() {
    return SettingsData.isDevMode()
  },
  set(v) {
    SettingsData.setDevMode(v)
  },
})

const canChangePassword = computed(() => newPassword.value.length > 0 && newPassword.value === newPasswordRepeat.value)

onMounted(async () => {
  await DataManager.loadLogin()
})

async function syncData() {
  await DataSync.sync(true)
}

async function migrateCharacters() {
  await CharacterStorage.migrateCharacters()
}

async function changePassword() {
  if (!canChangePassword.value) return

  const success = await DataManager.changeUserPassword(newPassword.value, oldPassword.value)
  if (!success) {
    alert("Fehler beim Ändern des Passworts")
    return
  }

  oldPassword.value = ""
  newPassword.value = ""
  newPasswordRepeat.value = ""
}

async function logout() {
  const [status] = await post(`/auth/logout`)
  if (status < 400) {
    await doLogout()
    window.location.reload()
  }
}
</script>

<template>
  <div class="settings-page">
    <div class="settings-wrap">
      <div class="card settings-card">
        <p v-if="DataManager.loggedInAs" class="logged">
          Eingeloggt als: <b>{{ DataManager.loggedInAs }}</b>
        </p>

        <button v-if="DataManager.loggedInAs" class="btn btn-primary full" @click="logout">
          Ausloggen
        </button>

        <div v-if="DataManager.loggedInAs" class="divider"></div>

        <template v-if="DataManager.loggedInAs">
          <p class="section-title">Passwort ändern:</p>
          <input
            type="password"
            class="form-control"
            placeholder="Altes Passwort (leerlassen wenn neu)"
            v-model="oldPassword"
          />
          <input
            type="password"
            class="form-control"
            placeholder="Neues Passwort"
            v-model="newPassword"
          />
          <input
            type="password"
            class="form-control"
            placeholder="Passwort wiederholen"
            v-model="newPasswordRepeat"
          />
          <button class="btn btn-primary full" style="margin-top: 1rem" :disabled="!canChangePassword" @click="changePassword">
            Speichern
          </button>

          <div class="divider"></div>
        </template>

        <div class="actions">
          <button class="btn btn-primary" @click="syncData">Daten synchronisieren</button>
          <button class="btn btn-primary" @click="migrateCharacters">Charaktere migrieren</button>
        </div>

        <div class="bottom">
          <div class="custom-switch">
            <input type="checkbox" id="switch-1" v-model="devMode" />
            <label for="switch-1">Entwicklermodus</label>
          </div>
          <small class="copyright">Vicar (c) 2022-{{ new Date().getFullYear() }} DasDarki</small>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.settings-page {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  padding: 1rem;
}
.settings-wrap {
  width: min(34rem, 100%);
}
.settings-card {
  padding: 1.25rem;
}
.logged {
  margin: 0 0 0.75rem;
  opacity: 0.95;
}
.full {
  width: 100%;
  min-height: 44px;
}
.divider {
  width: 100%;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.14);
  margin: 1rem 0 1.15rem;
}
.section-title {
  margin: 0 0 0.75rem;
  opacity: 0.9;
}
.form-control {
  width: 100%;
}
.form-control + .form-control {
  margin-top: 0.75rem;
}
.actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  .btn {
    min-height: 44px;
    flex: 1 1 12rem;
  }
}
.bottom {
  margin-top: 1rem;
  display: flex;
  gap: 0.75rem;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}
.custom-switch {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-height: 44px;
}
.copyright {
  opacity: 0.75;
  text-align: right;
}
</style>
