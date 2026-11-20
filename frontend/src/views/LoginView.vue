<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useRoute } from "vue-router"
import { getRedirectQuery } from "@/app/router"
import OnyxCrystal from "@/components/onyx/OnyxCrystal.vue"
import { forgetOnyxClaim, hasPendingOnyxClaim, isOnyxResult, onyxApiUrl, onyxMessages, rememberOnyxClaim } from "@/libs/onyx"

type LoginType = "onyx" | "discord" | "password"

const route = useRoute()
const type = ref<LoginType>("onyx")

const onyxClaim = ref(typeof route.query.onyx_claim === "string" ? route.query.onyx_claim : "")
const onyxUser = typeof route.query.onyx_user === "string" ? route.query.onyx_user : ""
const linkingExisting = ref(!onyxClaim.value && hasPendingOnyxClaim())
if (linkingExisting.value) {
  type.value = "discord"
}
const onyxError = isOnyxResult(route.query.onyx) && route.query.onyx !== "linked" ? onyxMessages[route.query.onyx] : null

function loginWithOnyx() {
  disabled.value = true
  forgetOnyxClaim()
  window.location.href = onyxApiUrl("/auth/onyx/login" + getRedirectQuery())
}

function linkExistingAccount() {
  rememberOnyxClaim(onyxClaim.value)
  linkingExisting.value = true
  type.value = "discord"
}

function createOnyxAccount() {
  disabled.value = true
  forgetOnyxClaim()
  window.location.href = onyxApiUrl("/auth/onyx/register?claim=" + encodeURIComponent(onyxClaim.value))
}

function cancelClaim() {
  forgetOnyxClaim()
  onyxClaim.value = ""
  linkingExisting.value = false
  type.value = "onyx"
}

const username = ref("")
const password = ref("")
const disabled = ref(false)

const isDev = !!(import.meta as any).env.DEV

function loginAsDev() {
  disabled.value = true
  window.location.href = (import.meta as any).env.VITE_APP_API_URL + "/auth/login/dev" + getRedirectQuery()
}

function loginWithDiscord() {
  disabled.value = true
  window.location.href = (import.meta as any).env.VITE_APP_API_URL + "/auth/login" + getRedirectQuery()
}

async function loginWithPassword() {
  if (!canLoginWithPassword.value) return

  disabled.value = true

  const data = encodeURIComponent(
    btoa(
      JSON.stringify({
        username: username.value,
        password: password.value,
      })
    )
  )

  let queryString = getRedirectQuery()
  if (queryString === "") queryString += "?"
  else queryString += "&"

  window.location.href =
    (import.meta as any).env.VITE_APP_API_URL + "/auth/login/password" + queryString + "d=" + data
}

const canLoginWithPassword = computed(() => {
  return username.value.trim().length > 0 && password.value.trim().length > 0 && !disabled.value
})

</script>

<template>
  <div class="login-wrapper">
    <div class="card login-card">
      <div v-if="onyxClaim && !linkingExisting" class="onyx-claim">
        <OnyxCrystal size="30px" />
        <div>
          <p class="claim-title">Willkommen, {{ onyxUser || "Onyx-Nutzer" }}</p>
          <p class="claim-text">
            Dein Onyx-Konto ist noch mit keinem Vicar-Account verbunden. Hast du schon einen Vicar-Account? Dann melde
            dich einmal wie bisher an, und wir verbinden ihn mit Onyx. Deine Charaktere bleiben erhalten.
          </p>
          <div class="claim-actions">
            <button class="onyx-btn" :disabled="disabled" @click="linkExistingAccount">
              Bestehenden Account verbinden
            </button>
            <button class="btn w-100" :disabled="disabled" @click="createOnyxAccount">Neuen Account erstellen</button>
          </div>
          <button class="link-btn" @click="cancelClaim">Abbrechen</button>
        </div>
      </div>

      <template v-else>
      <p v-if="linkingExisting" class="onyx-hint">
        <i class="fa-solid fa-link" /> Melde dich mit deinem bisherigen Login an. Danach wird dein Account automatisch mit
        Onyx verbunden.
        <button class="link-btn" @click="cancelClaim">Abbrechen</button>
      </p>
      <p v-if="onyxError" class="onyx-error"><i class="fa-solid fa-triangle-exclamation" /> {{ onyxError }}</p>

      <h6 class="headline"><b>Einloggen mit:</b></h6>

      <div v-if="isDev" class="form-group">
        <button class="btn btn-primary w-100 dev-btn" :disabled="disabled" @click="loginAsDev">
          <i class="fa-solid fa-flask" /> Dev-Login (ohne Discord)
        </button>
      </div>

      <div class="form-group">
        <div class="type-select">
          <div v-if="!linkingExisting" :class="{ active: type === 'onyx' }" @click="type = 'onyx'" class="left">Onyx</div>
          <div :class="{ active: type === 'discord' }" @click="type = 'discord'" class="middle">Discord</div>
          <div :class="{ active: type === 'password' }" @click="type = 'password'" class="right">Passwort</div>
        </div>
      </div>

      <div v-if="type === 'onyx'" class="form-group">
        <button class="onyx-btn onyx-login" @click="loginWithOnyx" :disabled="disabled">
          <OnyxCrystal size="20px" :glow="false" /> Mit Onyx einloggen
        </button>
        <p class="onyx-note">
          Neu bei Onyx oder schon migriert? Einfach hier einloggen. Noch nicht migriert? Melde dich wie gewohnt mit Discord
          oder Passwort an und migriere danach über das Banner oben.
        </p>
      </div>

      <div v-if="type === 'discord'" class="form-group">
        <button class="discord-btn" @click="loginWithDiscord" :disabled="disabled">
          <i class="fa-brands fa-discord" /> Mit Discord einloggen
        </button>
      </div>

      <div v-if="type === 'password'" class="form-group">
        <input type="text" class="form-control" placeholder="Benutzername" v-model="username" />
        <input
          type="password"
          class="form-control mt-10"
          placeholder="Passwort"
          v-model="password"
          @keydown.enter="loginWithPassword"
        />
        <button class="btn btn-primary mt-10 w-100" :disabled="!canLoginWithPassword" @click="loginWithPassword">
          Einloggen
        </button>
      </div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.login-card {
  width: 30rem;
  max-width: 100%;
}

.headline {
  margin: 0 0 0.5rem;
}

.type-select {
  display: flex;
  border: 2px solid var(--primary-color);
  border-radius: 0.4rem;
  overflow: hidden;

  div {
    cursor: pointer;
    user-select: none;
    text-align: center;
    flex-grow: 1;
    padding: 0.75rem 0.5rem;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;

    &.active {
      background-color: var(--primary-color);
    }
  }

  .left {
    border-right: 1px solid var(--primary-color);
  }
  .middle {
    border-left: 1px solid var(--primary-color);
    border-right: 1px solid var(--primary-color);
  }
  .right {
    border-left: 1px solid var(--primary-color);
    border-right: 1px solid var(--primary-color);
  }
}

.dev-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.discord-btn {
  width: 100%;
  min-height: 44px;
  background-color: #5865f2;
  border: none;
  color: white;
  font-weight: bold;
  font-size: 1rem;
  border-radius: 0.3rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background-color: #4752c4;
  }
  &:active {
    background-color: #363e9d;
  }
  &:disabled {
    opacity: 0.7;
    cursor: default;
  }
}

.onyx-btn {
  width: 100%;
  min-height: 44px;
  padding: 0 1rem;
  border: 1px solid rgba(91, 157, 255, 0.65);
  background: linear-gradient(180deg, #12203a, #0b1424);
  color: #e9edf5;
  font: inherit;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%);
  transition: border-color 200ms ease;

  &:hover:not(:disabled) {
    border-color: #bcd6ff;
  }
  &:disabled {
    opacity: 0.7;
    cursor: default;
  }
}

.onyx-note {
  margin: 0.6rem 0 0;
  font-size: 0.85rem;
  line-height: 1.45;
  opacity: 0.75;
}

.onyx-claim {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.claim-title {
  margin: 0;
  font-weight: bold;
}

.claim-text {
  margin: 0.35rem 0 1rem;
  font-size: 0.95rem;
  line-height: 1.45;
  opacity: 0.85;
}

.claim-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.onyx-hint,
.onyx-error {
  margin: 0 0 1rem;
  padding: 0.7rem 0.85rem;
  border-radius: 0.3rem;
  font-size: 0.9rem;
  line-height: 1.45;
}

.onyx-hint {
  border: 1px solid rgba(91, 157, 255, 0.45);
  background: rgba(91, 157, 255, 0.08);
}

.onyx-error {
  border: 1px solid rgba(255, 97, 120, 0.5);
  background: rgba(255, 97, 120, 0.08);
}

.link-btn {
  margin-top: 0.6rem;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  font-size: 0.85rem;
  text-decoration: underline;
  opacity: 0.75;
  cursor: pointer;
}

.onyx-hint .link-btn {
  display: block;
  margin-top: 0.4rem;
}

@media (max-width: 520px) {
  .login-wrapper {
    align-items: flex-start;
    padding-top: 2rem;
  }
}
</style>
