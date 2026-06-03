<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { getRedirectQuery } from "@/app/router"

type LoginType = "discord" | "password"

const type = ref<LoginType>(localStorage.getItem("authType") === "password" ? "password" : "discord")

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

watch(type, (nv) => {
  localStorage.setItem("authType", nv)
})
</script>

<template>
  <div class="login-wrapper">
    <div class="card login-card">
      <h6 class="headline"><b>Einloggen mit:</b></h6>

      <div v-if="isDev" class="form-group">
        <button class="btn btn-primary w-100 dev-btn" :disabled="disabled" @click="loginAsDev">
          <i class="fa-solid fa-flask" /> Dev-Login (ohne Discord)
        </button>
      </div>

      <div class="form-group">
        <div class="type-select">
          <div :class="{ active: type === 'discord' }" @click="type = 'discord'" class="left">Discord</div>
          <div :class="{ active: type === 'password' }" @click="type = 'password'" class="right">Passwort</div>
        </div>
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

@media (max-width: 520px) {
  .login-wrapper {
    align-items: flex-start;
    padding-top: 2rem;
  }
}
</style>
