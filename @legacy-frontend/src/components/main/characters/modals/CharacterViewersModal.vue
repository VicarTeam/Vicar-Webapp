<script lang="ts">
import {Vue, Component} from 'vue-property-decorator';
import {del, get, post} from "@/libs/io/rest";
import Modal from "@/components/modal/Modal.vue";
import {ICharacter} from "@/types/models";

interface Viewer {
  id: string;
  username: string;
}

@Component({
  components: {Modal}
})
export default class CharacterViewersModal extends Vue {

  private show: boolean = false;
  private char: ICharacter = null!;
  private viewers: Viewer[] = [];
  private addViewerUsername: string = "";

  public showModal(char: ICharacter) {
    this.getViewersOfCharacter(char.id).then(viewers => {
      this.viewers = viewers;
      this.char = char;
      this.show = true;
    });
  }

  private async getViewersOfCharacter(id: string): Promise<Viewer[]> {
    const [status, res] = await get<Viewer[]>(`/characters/${id}/viewers`);
    if (status >= 400) {
      return [];
    }
    return res;
  }

  private async removeViewer(viewerId: string) {
    const [status] = await del(`/characters/${this.char.id}/viewers/${viewerId}`);
    if (status < 400) {
      this.viewers = this.viewers.filter(v => v.id !== viewerId);
    }
  }

  private async addViewer() {
    if (!this.addViewerUsername) {
      return;
    }

    const [status] = await post(`/characters/${this.char.id}/share`, {username: this.addViewerUsername.toLowerCase()});
    if (status < 400) {
      this.viewers.push({id: this.addViewerUsername, username: this.addViewerUsername});
    } else if (status === 404) {
      alert(this.$t('character.viewers.notFound'));
    }
  }
}
</script>

<template>
  <Modal :shown="show" @close="show = false; viewers = []">
    <div class="w-400 d-flex justify-content-center align-items-center flex-column" style="gap: 1rem" v-if="char">
      <span>{{char.name}} - {{$t('character.viewers')}}</span>
      <div style="display: flex; flex-direction: column; width: 100%">
        <div v-for="viewer in viewers" :key="viewer.id" class="d-flex justify-content-between align-items-center">
          <span>{{viewer.username}}</span>
          <button class="btn btn-primary" @click="removeViewer(viewer.id)">{{$t('character.viewers.remove')}}</button>
        </div>
      </div>

      <div style="width: 100%; height: 1px; background-color: rgba(255, 255, 255, 0.2); margin-top: 1rem; margin-bottom: 1.5rem"></div>

      <input type="text" class="form-control" v-model="addViewerUsername" style="width: 100%"/>
      <button class="btn btn-primary" style="width: 100%" @click="addViewer">{{$t('character.viewers.add')}}</button>
    </div>
  </Modal>
</template>

<style scoped lang="scss">

</style>