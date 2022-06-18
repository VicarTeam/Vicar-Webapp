<template>
  <div class="pdf-view">
    <div class="actions">
      <button class="btn btn-primary" @click="exportPdf">{{ $t('viewer.pdf.print') }}</button>
    </div>
    <div class="pdf" ref="pdfSheets">
      <ProfileSheet/>

      <Sheet>
      </Sheet>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Ref, Vue} from "vue-property-decorator";
import Sheet from "@/components/viewer/pdf/Sheet.vue";
import Row from "@/components/viewer/pdf/Row.vue";
import Col from "@/components/viewer/pdf/Col.vue";
import {State} from "vuex-class";
import {ICharacter} from "@/types/models";
import Squares from "@/components/progress/Squares.vue";
import html2pdf from "html2pdf.js";
import ProfileSheet from "@/components/viewer/pdf/sheets/ProfileSheet.vue";

@Component({
  components: {ProfileSheet, Squares, Col, Row, Sheet}
})
export default class PdfView extends Vue {

  @State("editingCharacter")
  private editingCharacter!: ICharacter;

  @Ref("pdfSheets")
  private pdfSheets!: HTMLElement;

  private exportPdf() {
    html2pdf().from(this.pdfSheets).save(this.editingCharacter.name + ".pdf");
  }
}
</script>

<style scoped lang="scss">
.pdf-view {
  position: relative;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;

  .actions {
    position: fixed;
    top: 8.7rem;
    left: 3rem;
    width: 20rem;
  }

  .pdf {
    margin-top: 5rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    align-items: center;
  }
}
</style>
