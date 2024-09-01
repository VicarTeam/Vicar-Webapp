<template>
  <div class="char-dir">
    <div class="head" v-if="directory">
      {{directory.name}}
      <div class="actions left">
        <IconButton icon="fa-plus" @click="createCharacter"/>
      </div>
      <div class="actions">
        <IconButton icon="fa-trash" @click="deleteDirectoryModal.showModal(directory)"/>
        <IconButton :icon="directory.open ? 'fa-chevron-up' : 'fa-chevron-down'" @click="toggleOpen"/>
      </div>
    </div>

    <Container
        class="list" v-if="!this.directory || directory.open"
        behavior="drop-zone"
        group-name="characters"
        :get-child-payload="getDraggablePayload"
        :should-animate-drop="() => false"
        @drag-start="onDragStart"
        @drag-end="onDragStop"
        @mouseup.native.left="onDrop"
    >
      <Draggable v-for="(c, i) in characters" :key="i">
        <Character :character="c"/>
      </Draggable>
    </Container>

    <DeleteDirectoryModal ref="deleteDirectoryModal" @deleted="updateCharacterList()"/>
  </div>
</template>

<script lang="ts">
import {Component, Inject, Prop, Ref, Vue} from "vue-property-decorator";
import {ICharacter, ICharacterDirectory} from "@/types/models";
import Character from "@/components/main/characters/Character.vue";
import IconButton from "@/components/IconButton.vue";
import {Container, Draggable} from "vue-dndrop";
import {Mutation, State} from "vuex-class";
import CharacterStorage from "@/libs/io/character-storage";
import DeleteDirectoryModal from "@/components/main/characters/modals/DeleteDirectoryModal.vue";

@Component({
  components: {DeleteDirectoryModal, IconButton, Character, Container, Draggable}
})
export default class CharacterDirectory extends Vue {

  @Prop({required: true})
  private directory!: ICharacterDirectory|null;

  @Prop({required: true})
  private characters!: ICharacter[];

  @State("draggingCharacter")
  private draggingCharacter!: ICharacter|undefined;

  @Mutation("setDraggingCharacter")
  private setDraggingCharacter!: (character?: ICharacter) => void;

  @Ref("deleteDirectoryModal")
  private deleteDirectoryModal!: DeleteDirectoryModal;

  private toggleOpen() {
    if (this.directory) {
      this.directory.open = !this.directory.open;
      CharacterStorage.saveCharacterDirectories();

      this.$forceUpdate();
    }
  }

  private createCharacter() {
    if (!this.directory) {
      return;
    }

    this.startCharCreation(this.directory);
  }

  private onDrop() {
    if (!this.draggingCharacter) {
      return;
    }

    if (this.directory) {
      this.draggingCharacter.directory = this.directory.id;
    } else {
      delete this.draggingCharacter.directory;
    }

    CharacterStorage.saveCharacter(this.draggingCharacter);
    this.setDraggingCharacter(undefined);

    setTimeout(() => {
      this.updateCharacterList();
    }, 100);
  }

  private onDragStart(dragResult: any) {
    this.setDraggingCharacter(dragResult.payload);
  }

  private onDragStop() {
    this.setDraggingCharacter();
  }

  private getDraggablePayload(idx: number) {
    return this.characters[idx];
  }

  @Inject("update-character-list")
  private updateCharacterList!: () => void;

  @Inject("create-character")
  private startCharCreation!: (dir?: ICharacterDirectory) => void;
}
</script>

<style scoped lang="scss">
.char-dir {
  width: 100%;
  display: flex;
  flex-direction: column;
  .head {
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
    padding: 0.5rem;
    color: #fff;
    font-weight: bolder;
    text-transform: uppercase;
    border-bottom: 2px solid var(--primary-color);
    .actions {
      height: 100%;
      position: absolute;
      top: 0;
      display: flex;
      gap: 0.5rem;
      &:not(.left) {
        right: 0;
      }
      &.left {
        left: 0;
      }
    }
  }
  .list {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 1rem;
    padding: 1rem;
  }
}
</style>
