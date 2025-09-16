<script lang="ts">
import {Vue, Component, Watch} from 'vue-property-decorator';
import {getRedirectQuery} from "@/router";

@Component({})
export default class LoginView extends Vue {

  private type: 'discord'|'password' = localStorage.getItem('authType') === 'password' ? 'password' : 'discord';

  private username: string = '';
  private password: string = '';
  private disabled: boolean = false;

  private loginWithDiscord() {
    this.disabled = true;
    window.location.href = process.env.VUE_APP_API_URL + '/auth/login' + getRedirectQuery();
  }

  private async loginWithPassword() {
    if (!this.canLoginWithPassword) {
      return;
    }

    this.disabled = true;

    const data = encodeURIComponent(btoa(JSON.stringify({
      username: this.username,
      password: this.password
    })));

    let queryString = getRedirectQuery();
    if (queryString === '') {
      queryString += '?';
    } else {
      queryString += '&';
    }
    window.location.href = process.env.VUE_APP_API_URL + '/auth/login/password' + queryString + 'd=' + data;
  }

  private get canLoginWithPassword() {
    return this.username.trim().length > 0 && this.password.trim().length > 0 && !this.disabled;
  }

  @Watch('type')
  private onTypeChanged(nv: 'discord'|'password') {
    localStorage.setItem('authType', nv);
  }
}
</script>

<template>
  <div class="login-wrapper">
    <div class="card" style="width: 30rem">
      <h6 style="margin: 0 0 0.5rem;"><b>Einloggen mit:</b></h6>
      <div class="form-group">
        <div class="sex-select">
          <div :class="{'active': type === 'discord'}" @click="type = 'discord'" style="border-right: 1px solid var(--primary-color);">Discord</div>
          <div :class="{'active': type === 'password'}" @click="type = 'password'" style="border-left: 1px solid var(--primary-color); border-right: 1px solid var(--primary-color)">Passwort</div>
        </div>
      </div>
      <div v-if="type === 'discord'" class="form-group">
        <button class="discord-btn" @click="loginWithDiscord"><i class="fa-brands fa-discord"/> Mit Discord einloggen</button>
      </div>
      <div v-if="type === 'password'" class="form-group">
        <input type="text" class="form-control" placeholder="Benutzername" v-model="username" style="margin-bottom: 1rem"/>
        <input type="password" class="form-control" placeholder="Passwort" v-model="password" style="margin-bottom: 1rem" @keydown.enter="loginWithPassword"/>
        <button class="btn btn-primary" style="width: 100%" :disabled="!canLoginWithPassword" @click="loginWithPassword">Einloggen</button>
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
  .sex-select {
    display: flex;
    border: 2px solid var(--primary-color);
    div {
      cursor: pointer;
      user-select: none;
      text-align: center;
      flex-grow: 1;
      padding: 0.5rem;
      &.active {
        background-color: var(--primary-color);
      }
    }
  }
  .discord-btn {
    width: 100%;
    height: 2.5rem;
    background-color: #5865F2;
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
      background-color: #4752C4;
    }
    &:active {
      background-color: #363E9D;
    }
  }
}
</style>