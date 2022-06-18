<template>
  <Sheet>
    <Row class="botborder" style="border-width: 3px; justify-content: center; align-items: center; padding-bottom: 0.5rem; margin-top: 0">
      <b style="color: var(--primary-color); font-size: 2rem">{{$t('viewer.tab.traits')}}</b>
    </Row>

    <Row style="width: 100%; border: 1px solid rgba(0, 0, 0, 0.5)">
      <Col style="width: 50%">
        <Row style="border: 1px solid rgba(0, 0, 0, 0.5); font-size: 1.1rem; height: 2.5rem; padding-left: 1rem; padding-right: 1rem; align-items: center" v-for="a in getTransformedData(editingCharacter.merits, false)">
          <span v-if="a.pack">
            <i style="color: #989898">{{$t('data.trait.merit')}}</i> - {{a.pack.name}}: {{a.name}}{{getTraitSuffix(a)}} - <i><b>{{$t('editor.traits.modal.trait.level')}}</b>: {{getTraitLevel(a)}}</i>
          </span>
        </Row>
        <Row style="border: 1px solid rgba(0, 0, 0, 0.5); font-size: 1.1rem; height: 2.5rem; padding-left: 1rem; padding-right: 1rem; align-items: center" v-for="a in getTransformedData(editingCharacter.backgrounds, false)">
          <span v-if="a.pack">
            <i style="color: #989898">{{$t('data.trait.background')}}</i> - {{a.pack.name}}: {{a.name}}{{getTraitSuffix(a)}} - <i><b>{{$t('editor.traits.modal.trait.level')}}</b>: {{getTraitLevel(a)}}</i>
          </span>
        </Row>
        <Row style="border: 1px solid rgba(0, 0, 0, 0.5); font-size: 1.1rem; height: 2.5rem; padding-left: 1rem; padding-right: 1rem; align-items: center" v-for="a in getTraitPlaceholders()">

        </Row>
      </Col>

      <Col style="width: 50%">
        <Row style="border: 1px solid rgba(0, 0, 0, 0.5); font-size: 1.1rem; height: 2.5rem; padding-left: 1rem; padding-right: 1rem; align-items: center" v-for="a in getTransformedData(editingCharacter.merits, true)">
          <span v-if="a.pack">
            <i style="color: #989898">{{$t('data.trait.merit')}}</i> - {{a.pack.name}}: {{a.name}}{{getTraitSuffix(a)}} - <i><b>{{$t('editor.traits.modal.trait.level')}}</b>: {{getTraitLevel(a)}}</i>
          </span>
        </Row>
        <Row style="border: 1px solid rgba(0, 0, 0, 0.5); font-size: 1.1rem; height: 2.5rem; padding-left: 1rem; padding-right: 1rem; align-items: center" v-for="a in getTransformedData(editingCharacter.backgrounds, true)">
          <span v-if="a.pack">
            <i style="color: #989898">{{$t('data.trait.background')}}</i> - {{a.pack.name}}: {{a.name}}{{getTraitSuffix(a)}} - <i><b>{{$t('editor.traits.modal.trait.level')}}</b>: {{getTraitLevel(a)}}</i>
          </span>
        </Row>
        <Row style="border: 1px solid rgba(0, 0, 0, 0.5); font-size: 1.1rem; height: 2.5rem; padding-left: 1rem; padding-right: 1rem; align-items: center" v-for="a in getFlawPlaceholders()">

        </Row>
      </Col>
    </Row>

    <Row class="botborder"></Row>

    <Row style="width: 100%">
      <Col style="width: calc(100%/3)">
        <Row style="justify-content: center; text-align: center; color: var(--primary-color)">{{$t('character.chronicleprinciples')}}</Row>
        <Row style="width: 100%; height: 5cm; border: 2px solid rgba(0, 0, 0, 0.5); border-right-width: 1px; padding: 0.8rem; font-size: 1rem; overflow: hidden; text-overflow: ellipsis">
          {{editingCharacter.chroniclePrinciples}}
        </Row>
      </Col>

      <Col style="width: calc(100%/3)">
        <Row style="justify-content: center; text-align: center; color: var(--primary-color)">{{$t('character.anchorsandbeliefs')}}</Row>
        <Row style="width: 100%; height: 5cm; border: 1px solid rgba(0, 0, 0, 0.5); border-top-width: 2px; border-bottom-width: 2px; padding: 0.8rem; font-size: 1rem; overflow: hidden; text-overflow: ellipsis">
          {{editingCharacter.anchorsAndBeliefs}}
        </Row>
      </Col>

      <Col style="width: calc(100%/3)">
        <Row style="justify-content: center; text-align: center; color: var(--primary-color)">{{$t('character.clan.curse')}}</Row>
        <Row style="width: 100%; height: 5cm; border: 2px solid rgba(0, 0, 0, 0.5); border-left-width: 1px; padding: 0.8rem; font-size: 1rem; overflow: hidden; text-overflow: ellipsis">
          {{editingCharacter.clan.curse}}
        </Row>
      </Col>
    </Row>

    <Row style="width: 100%; margin-top: 1rem">
      <Col style="width: calc(100%/2)">
        <Row style="justify-content: center; text-align: center; color: var(--primary-color)">{{$t('character.backstory')}}</Row>
        <Row style="width: 100%; height: 8cm; border: 2px solid rgba(0, 0, 0, 0.5); border-right-width: 1px; padding: 0.8rem; font-size: 1rem; overflow: hidden; text-overflow: ellipsis">
          {{editingCharacter.backstory}}
        </Row>
      </Col>

      <Col style="width: calc(100%/2)">
        <Row style="justify-content: center; text-align: center; color: var(--primary-color)">{{$t('character.notes')}}</Row>
        <Row style="width: 100%; height: 8cm; border: 1px solid rgba(0, 0, 0, 0.5); border-top-width: 2px; border-bottom-width: 2px; padding: 0.8rem; font-size: 1rem; overflow: hidden; text-overflow: ellipsis">
          {{editingCharacter.notes}}
        </Row>
      </Col>
    </Row>

    <Row class="botborder"></Row>

    <Row style="width: 100%">
      <Col style="width: calc(100%/3); justify-content: center; align-items: center">
        <Row><b>{{$t('character.bloodpotency.spurt')}}</b>:</Row>
        <Row><small>{{getBloodPotency().bleedingSpurt}} {{$t('character.dice')}}</small></Row>
      </Col>
      <Col style="width: calc(100%/3); justify-content: center; align-items: center">
        <Row><b>{{$t('character.bloodpotency.healing')}}</b>:</Row>
        <Row><small>{{getBloodPotency().healedDamage}} {{$t('character.simpledmg')}}</small></Row>
      </Col>
      <Col style="width: calc(100%/3); justify-content: center; align-items: center">
        <Row><b>{{$t('character.bloodpotency.bonus')}}</b>:</Row>
        <Row><small>{{getBloodPotency().disciplineBonus}} {{$t('character.dice')}}</small></Row>
      </Col>
    </Row>

    <Row style="width: 100%; margin-top: 1rem">
      <Col style="width: calc(100%/3); justify-content: center; align-items: center">
        <Row><b>{{$t('character.bloodpotency.rouserepeat')}}</b>:</Row>
        <Row><small>{{$t('character.bloodpotency.rouserepeat.val', {x: getBloodPotency().rouseRepeatDisciplineLevel})}}</small></Row>
      </Col>
      <Col style="width: calc(100%/3); justify-content: center; align-items: center">
        <Row><b>{{$t('character.bloodpotency.banelevel')}}</b>:</Row>
        <Row><small>{{getBloodPotency().baneLevel}}</small></Row>
      </Col>
      <Col style="width: calc(100%/3); justify-content: center; align-items: center">
        <Row><b>{{$t('character.bloodpotency.pray')}}</b>:</Row>
        <Row><small>{{getBloodPotency().pray}}</small></Row>
      </Col>
    </Row>

    <Row class="botborder"></Row>

    <Row style="width: 100%; gap: 2rem">
      <Col style="width: 33%">
        <Row style="width: 4rem; gap: 1rem; align-items: center">
          <Col>
            <b>{{ $t('character.bloodpotency') }}:</b>
          </Col>
          <Col>
            <Dots :max="10" :amount="editingCharacter.bloodPotency" :margin-at="6"/>
          </Col>
        </Row>
      </Col>
      <Col style="width: 33%">
        <Row style="width: 4rem; gap: 1rem; align-items: center">
          <Col>
            <b>{{ $t('character.resonance') }}:</b>
          </Col>
          <Col>
            _________________________
          </Col>
        </Row>
      </Col>
      <Col style="width: 33%">
        <Row style="width: 4rem; gap: 1rem; align-items: center">
          <Col>
            <b>{{ $t('character.exp') }}:</b>
          </Col>
          <Col>
            {{editingCharacter.exp}}
          </Col>
        </Row>
      </Col>
    </Row>
  </Sheet>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import Sheet from "@/components/viewer/pdf/Sheet.vue";
import Row from "@/components/viewer/pdf/Row.vue";
import Col from "@/components/viewer/pdf/Col.vue";
import {State} from "vuex-class";
import {ICharacter, ILockableTrait, IUsingTraitPacks} from "@/types/models";
import {IBloodPotencyData, ITraitPack} from "@/types/data";
import Dots from "@/components/progress/Dots.vue";
import DataManager from "@/libs/data-manager";

export interface ITransformedData extends ILockableTrait {
  pack: ITraitPack;
}

@Component({
  components: {Dots, Col, Row, Sheet}
})
export default class SecondSheet extends Vue {

  @State("editingCharacter")
  private editingCharacter!: ICharacter;

  private getBloodPotency(): IBloodPotencyData {
    return DataManager.selectedLanguage.bloodPotencyTable.find(x => x.value === this.editingCharacter.bloodPotency)!;
  }

  private getTraitPlaceholders() {
    const count = Math.max(0, 10 - this.getTransformedData(this.editingCharacter.merits, false).length - this.getTransformedData(this.editingCharacter.backgrounds, false).length);
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push(i);
    }
    return arr;
  }

  private getFlawPlaceholders() {
    const count = Math.max(0, 10 - this.getTransformedData(this.editingCharacter.merits, true).length - this.getTransformedData(this.editingCharacter.backgrounds, true).length);
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push(i);
    }
    return arr;
  }

  private getTransformedData(upacks: IUsingTraitPacks, isFlaw: boolean): ITransformedData[] {
    const arr: ITransformedData[] = [];
    for (const upack of upacks.packs) {
      for (const trait of upack[isFlaw ? 'flawTraits' : 'traits']) {
        arr.push({
          ...trait,
          pack: upack.pack
        });
      }
    }

    return arr;
  }

  private getTraitSuffix(trait: ITransformedData): string {
    if (trait.suffix) {
      return " (" + trait.suffix + ")";
    }
    return "";
  }

  private getTraitLevel(trait: ITransformedData) {
    return parseInt((trait.customLevel ?? trait.level).toString());
  }
}
</script>

<style scoped lang="scss">
.botborder {
  border-bottom: 1px solid var(--primary-color);
  padding-bottom: 1rem;
  margin-bottom: 1rem;
}
</style>
