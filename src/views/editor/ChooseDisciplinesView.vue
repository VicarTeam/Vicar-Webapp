<template>
  <EditorForm :can-go-next="canGoNext" next-step="editor-traits">

  </EditorForm>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import EditorForm from "@/components/editor/EditorForm.vue";
import {State} from "vuex-class";
import {ICharacter} from "@/types/models";

@Component({
  components: {EditorForm}
})
export default class ChooseDisciplinesView extends Vue {

  @State("editingCharacter")
  private editingCharacter!: ICharacter|undefined;

  private get canGoNext(): boolean {
    return false;
  }
}
</script>

<style scoped lang="scss">

</style>
