<template>
  <EditorForm :can-go-next="canGoNext" next-step="editor-skills">
  </EditorForm>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import {State} from "vuex-class";
import {ICharacter} from "@/types/models";
import EditorForm from "@/components/editor/EditorForm.vue";

@Component({
  components: {EditorForm}
})
export default class ChooseAttributesView extends Vue {

  @State("editingCharacter")
  private editingCharacter!: ICharacter|undefined;

  private get canGoNext() {
    return this.editingCharacter;
  }
}
</script>

<style scoped lang="scss">

</style>
