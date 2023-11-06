<script lang="ts">
import {Vue, Component} from 'vue-property-decorator';
import Modal from "@/components/modal/Modal.vue";
import {VicarNet} from "@/libs/io/vicar-net";
import WrappedSpinner from "@/components/spinners/WrappedSpinner.vue";

@Component({
  components: {WrappedSpinner, Modal}
})
export default class VicarLoginModal extends Vue {

  private VicarNet = VicarNet;
  private visible: boolean = false;
  private loading: boolean = false;

  private step = 1;
  private isRegister = false;
  private registerAlias: string = '';
  private registerEmail: string = '';
  private recoverEmail: string = '';
  private confirmCode: string = '';

  public show() {
    this.step = 0;
    this.loading = false;
    this.registerAlias = '';
    this.registerEmail = '';
    this.recoverEmail = '';
    this.confirmCode = '';
    this.isRegister = false;
    this.visible = true;
  }

  private get canRegister() {
    return this.registerAlias.length > 0 && this.registerEmail.length > 0;
  }

  private get canRecover() {
    return this.recoverEmail.length > 0;
  }

  private get canConfirm() {
    return this.confirmCode.length > 0;
  }

  private async beginRegister() {
    if (!this.canRegister || this.loading) return;

    this.loading = true;
    this.step = 1;

    const success = await VicarNet.beginRegister(this.registerEmail, this.registerAlias);
    if (!success) {
      this.step = 0;
      this.loading = false;
      return;
    }

    this.isRegister = true;
    this.step = 2;
  }

  private async beginRecover() {
    if (!this.canRecover || this.loading) return;

    this.loading = true;
    this.step = 1;

    const success = await VicarNet.beginRecover(this.recoverEmail);
    if (!success) {
      this.step = 0;
      this.loading = false;
      return;
    }

    this.isRegister = false;
    this.step = 2;
  }

  private async confirm() {
    if (!this.canConfirm) return;

    this.step = 3;

    const success = await (this.isRegister ? VicarNet.finishRegister : VicarNet.finishRecover)(this.confirmCode);
    if (!success) {
      this.step = 2;
      return;
    }

    this.$emit('login');
    this.visible = false;
  }
}
</script>

<template>
  <Modal :shown="visible" :with-close="!loading" @close="visible = false">
    <div style="display: flex; flex-direction: column">
      <b style="width: 100%; text-align: center">{{$t('main.settings.vicarnet.login')}}</b>

      <div v-if="step === 0" style="width: 100%; display: flex; flex-direction: row; gap: 2rem">
        <div style="width: 50%; display: flex; flex-direction: column; gap: 0.5rem">
          <div class="form-group mb-0">
            <label>{{$t('main.vicarnet.login.register.alias')}}</label>
            <input type="text" class="form-control" v-model="registerAlias">
          </div>
          <div class="form-group mb-0">
            <label>{{$t('main.vicarnet.login.register.email')}}</label>
            <input type="email" class="form-control" v-model="registerEmail">
          </div>

          <button class="btn btn-primary" style="margin-top: 1.5rem" :disabled="!canRegister" @click="beginRegister">{{$t('main.vicarnet.login.register.submit')}}</button>
        </div>

        <div style="display: flex; height: 100%; justify-content: center; align-items: center; flex-direction: column; gap: 0.5rem">
          <div style="width: 1px; height: 100%; background-color: rgba(255, 255, 255, 0.2)"></div>
          <i>{{$t('main.vicarnet.login.or')}}</i>
          <div style="width: 1px; height: 100%; background-color: rgba(255, 255, 255, 0.2)"></div>
        </div>

        <div style="width: 50%; display: flex; flex-direction: column; gap: 0.5rem">
          <div class="form-group mb-0">
            <label>{{$t('main.vicarnet.login.register.email')}}</label>
            <input type="email" class="form-control" v-model="recoverEmail">
          </div>

          <button class="btn btn-primary" style="margin-top: auto" :disabled="!canRecover" @click="beginRecover">{{$t('main.vicarnet.login.recover.submit')}}</button>
        </div>
      </div>

      <div v-else-if="step === 1" style="width: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 2rem; padding: 1rem">
        <WrappedSpinner>
          <i>{{$t(`main.vicarnet.login.loading.1`)}}</i>
        </WrappedSpinner>
      </div>

      <div v-else-if="step === 2" style="display: flex; flex-direction: column; width: 30rem">
        <div class="form-group">
          <label>{{$t('main.vicarnet.login.enter-code')}}</label>
          <input type="text" class="form-control" v-model="confirmCode">
        </div>

        <button class="btn btn-primary" :disabled="!canConfirm" @click="confirm">{{$t('main.vicarnet.login.enter-code.submit')}}</button>
      </div>

      <div v-else-if="step === 3" style="width: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 2rem; padding: 1rem">
        <WrappedSpinner>
          <i>{{$t(`main.vicarnet.login.loading.2`)}}</i>
        </WrappedSpinner>
      </div>
    </div>
  </Modal>
</template>