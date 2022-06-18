<template>
  <Sheet>
    <Row class="botborder">
      <Col :shrink="true">
        <img src="@/assets/img/logo.png" style="width: 7cm"/>
      </Col>
      <Col :grow="true" :center-horizontally="true" :center-vertically="true">
        <Row style="gap: 3rem">
          <Col style="gap: 1rem">
            <Row>
              <div class="stat">
                <b>{{ $t('character.health') }}:</b>
                <Squares :max="10" :amount="editingCharacter.health" :margin-at="6"/>
              </div>
            </Row>
            <Row>
              <div class="stat">
                <b>{{ $t('character.humanity') }}:</b>
                <Squares :max="10" :amount="editingCharacter.humanity" :margin-at="6"/>
              </div>
            </Row>
          </Col>
          <Col style="gap: 1rem">
            <Row>
              <div class="stat">
                <b>{{ $t('character.willpower') }}:</b>
                <Squares :max="10" :amount="editingCharacter.willpower" :margin-at="6"/>
              </div>
            </Row>
            <Row>
              <div class="stat">
                <b>{{ $t('character.hunger') }}:</b>
                <Squares :max="5" :amount="editingCharacter.hunger"/>
              </div>
            </Row>
          </Col>
        </Row>
      </Col>
    </Row>

    <Row style="justify-content: center; align-items: center" class="botborder">
      <Col style="width: 100%; border: 1px solid rgba(0, 0, 0, 0.5)">
        <Row>
          <Col class="cell" v-resize-text>
            <small class="label">{{$t('character.name')}}</small>
            {{editingCharacter.name}}
          </Col>
          <Col class="cell" v-resize-text>
            <small class="label">{{$t('character.concept')}}</small>
            {{editingCharacter.concept}}
          </Col>
          <Col class="cell" v-resize-text>
            <small class="label">{{$t('data.predatortype')}}</small>
            {{editingCharacter.predatorType.name}}
          </Col>
        </Row>
        <Row>
          <Col class="cell" v-resize-text>
            <small class="label">{{$t('character.chronicle')}}</small>
            {{editingCharacter.chronicle}}
          </Col>
          <Col class="cell" v-resize-text>
            <small class="label">{{$t('character.ambition')}}</small>
            {{editingCharacter.ambition}}
          </Col>
          <Col class="cell" v-resize-text>
            <small class="label">Clan</small>
            {{editingCharacter.clan.name}}
          </Col>
        </Row>
        <Row>
          <Col class="cell" v-resize-text>
            <small class="label">{{$t('character.sire')}}</small>
            {{editingCharacter.sire}}
          </Col>
          <Col class="cell" v-resize-text>
            <small class="label">{{$t('character.desire')}}</small>
            {{editingCharacter.desire}}
          </Col>
          <Col class="cell" v-resize-text>
            <small class="label">{{$t('main.characters.create.generation')}}</small>
            {{editingCharacter.generation}} ({{ $t('character.generation.' + editingCharacter.generationEra) }})
          </Col>
        </Row>
      </Col>
    </Row>

    <Row class="botborder" style="border-width: 3px; justify-content: center; align-items: center; padding-bottom: 0.5rem">
      <b style="color: var(--primary-color); font-size: 2rem">{{$t('viewer.tab.attributes')}}</b>
    </Row>

    <Row style="width: 100%">
      <Col style="width: calc((100% - (1px - 2rem) * 2)/3)">
        <Row style="justify-content: center">
          <i>{{$t('data.category.physical')}}</i>
        </Row>

        <Row style="width: 100%">
          <Col style="width: 100%">
            <Row v-for="a in getCategory(CategoryKeys.Physical).attributes" style="gap: 2rem; justify-content: center; align-items: center">
              <Col :grow="true" style="width: 100%">
                {{$t('data.attribute.' + a.key)}}
              </Col>
              <Col :shrink="true">
                <Dots :max="5" :amount="a.value"/>
              </Col>
            </Row>
          </Col>
        </Row>
      </Col>

      <Col>
        <div style="width: 1px; height: calc(100% - 2rem); margin-top: 2rem; margin-left: 1rem; margin-right: 1rem; background-color: rgba(0, 0, 0, 0.5)"></div>
      </Col>

      <Col style="width: calc((100% - (1px - 2rem) * 2)/3)">
        <Row style="justify-content: center">
          <i>{{$t('data.category.social')}}</i>
        </Row>

        <Row style="width: 100%">
          <Col style="width: 100%">
            <Row v-for="a in getCategory(CategoryKeys.Social).attributes" style="gap: 2rem; justify-content: center; align-items: center">
              <Col :grow="true">
                {{$t('data.attribute.' + a.key)}}
              </Col>
              <Col :shrink="true">
                <Dots :max="5" :amount="a.value"/>
              </Col>
            </Row>
          </Col>
        </Row>
      </Col>

      <Col>
        <div style="width: 1px; height: calc(100% - 2rem); margin-top: 2rem; margin-left: 1rem; margin-right: 1rem; background-color: rgba(0, 0, 0, 0.5)"></div>
      </Col>

      <Col style="width: calc((100% - (1px - 2rem) * 2)/3)">
        <Row style="justify-content: center">
          <i>{{$t('data.category.mental')}}</i>
        </Row>

        <Row style="width: 100%">
          <Col style="width: 100%">
            <Row v-for="a in getCategory(CategoryKeys.Mental).attributes" style="gap: 2rem; justify-content: center; align-items: center">
              <Col :grow="true">
                {{$t('data.attribute.' + a.key)}}
              </Col>
              <Col :shrink="true">
                <Dots :max="5" :amount="a.value"/>
              </Col>
            </Row>
          </Col>
        </Row>
      </Col>
    </Row>

    <Row class="botborder" style="border-width: 3px; justify-content: center; align-items: center; padding-bottom: 0.5rem; margin-top: 0">
      <b style="color: var(--primary-color); font-size: 2rem">{{$t('viewer.tab.skills')}}</b>
    </Row>

    <Row style="width: 100%">
      <Col style="width: calc((100% - 1rem)/3); margin-right: 1rem">
        <Row style="width: 100%">
          <Col style="width: 100%">
            <Row v-for="a in sortSkills(getCategory(CategoryKeys.Physical).skills)" style="gap: 2rem; justify-content: center; align-items: center">
              <Col :grow="true" style="width: 100%; font-size: 1.2rem">
                {{$t('data.skill.' + a.key)}} <span style="margin-bottom: 0.3rem; font-size: 1.1rem; font-style: italic" v-if="a.specialization.length > 0">({{a.specialization.join(', ')}})</span>
              </Col>
              <Col :shrink="true">
                <Dots :max="5" :amount="a.value"/>
              </Col>
            </Row>
          </Col>
        </Row>
      </Col>

      <Col style="width: calc((100% - 1rem)/3)">
        <Row style="width: 100%">
          <Col style="width: 100%">
            <Row v-for="a in sortSkills(getCategory(CategoryKeys.Social).skills)" style="gap: 2rem; justify-content: center; align-items: center">
              <Col :grow="true" style="width: 100%; font-size: 1.2rem">
                {{$t('data.skill.' + a.key)}} <span style="margin-bottom: 0.3rem; font-size: 1.1rem; font-style: italic" v-if="a.specialization.length > 0">({{a.specialization.join(', ')}})</span>
              </Col>
              <Col :shrink="true">
                <Dots :max="5" :amount="a.value"/>
              </Col>
            </Row>
          </Col>
        </Row>
      </Col>

      <Col style="width: calc((100% - 1rem)/3); margin-left: 1rem">
        <Row style="width: 100%">
          <Col style="width: 100%">
            <Row v-for="a in sortSkills(getCategory(CategoryKeys.Mental).skills)" style="gap: 2rem; justify-content: center; align-items: center">
              <Col :grow="true" style="width: 100%; font-size: 1.2rem; ">
                {{$t('data.skill.' + a.key)}} <span style="margin-bottom: 0.3rem; font-size: 1.1rem; font-style: italic" v-if="a.specialization.length > 0">({{a.specialization.join(', ')}})</span>
              </Col>
              <Col :shrink="true">
                <Dots :max="5" :amount="a.value"/>
              </Col>
            </Row>
          </Col>
        </Row>
      </Col>
    </Row>

    <Row class="botborder" style="border-width: 3px; justify-content: center; align-items: center; padding-bottom: 0.5rem; margin-top: 0; margin-bottom: 0">
      <b style="color: var(--primary-color); font-size: 2rem">{{$t('viewer.tab.disciplines')}}</b>
    </Row>

    <Row style="width: 100%; border: 1px solid rgba(0, 0, 0, 0.5); flex-wrap: wrap">
      <Col style="width: calc(100% / 3)" v-for="d in getDisciplines()">
        <Row style="border: 1px solid rgba(0, 0, 0, 0.5); height: 2.5rem">
          <Col style="padding: 1rem; font-size: 1.5rem" :grow="true" :center-horizontally="true">
            {{d.discipline.name}}
          </Col>
          <Col style="margin-right: 1rem" :shrink="true" :center-vertically="true" :center-horizontally="true">
            <Dots :amount="d.currentLevel - 1" :max="5"/>
          </Col>
        </Row>
        <Row style="border: 1px solid rgba(0, 0, 0, 0.5); font-size: 1.1rem; height: 2.5rem; padding-left: 1rem; padding-right: 1rem; align-items: center" v-for="a in getDisciplineAbilities(d)">
          <span v-if="a.name">{{a.name}} (<small><b>{{$t('editor.disciplines.level')}}</b>: {{a.level}}</small>)</span>
        </Row>
      </Col>
    </Row>
  </Sheet>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import {State} from "vuex-class";
import {
  CategoryKeys,
  ICategory,
  ICharacter,
  IDisciplineSelection,
  ILeveledDisciplineAbility,
  ISkillData
} from "@/types/models";
import Squares from "@/components/progress/Squares.vue";
import Col from "@/components/viewer/pdf/Col.vue";
import Row from "@/components/viewer/pdf/Row.vue";
import Sheet from "@/components/viewer/pdf/Sheet.vue";
import Dots from "@/components/progress/Dots.vue";

@Component({
  components: {Dots, Sheet, Row, Col, Squares}
})
export default class ProfileSheet extends Vue {

  @State("editingCharacter")
  private editingCharacter!: ICharacter;

  CategoryKeys = CategoryKeys;

  private getCategory(key: CategoryKeys): ICategory {
    return this.editingCharacter.categories.find(c => c.name === key)!;
  }

  private sortSkills(skills: ISkillData[]): ISkillData[] {
    return [...skills].sort((a, b) => {
      return this.$t('data.skill.' + a.key).toString().localeCompare(this.$t('data.skill.' + b.key).toString());
    });
  }

  private getDisciplineAbilities(discipline: IDisciplineSelection): ILeveledDisciplineAbility[] {
    const abilites = [...discipline.abilities];
    for (let i = abilites.length; i < 5; i++) {
      abilites.push({
        alternatives: [], costs: "", duration: "", id: 0, level: 0, name: "", summary: "", system: "", usedLevel: 0
      });
    }
    return abilites;
  }

  private getDisciplines(): IDisciplineSelection[] {
    const disciplines = [...this.editingCharacter.disciplines].slice(0, 6);
    for (let i = disciplines.length; i < 6; i++) {
      disciplines.push({
        abilities: [], currentLevel: 0, points: 0,
        discipline: {
          id: 0, levels: {}, name: "", nicknames: [], properties: undefined!
        }
      });
    }
    return disciplines;
  }
}
</script>

<style scoped lang="scss">
.botborder {
  border-bottom: 1px solid var(--primary-color);
  padding-bottom: 1rem;
  margin-bottom: 1rem;
}
.cell {
  font-size: 1.5rem;
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.5);
  padding: 1rem;
  height: 4rem;
  display: flex;
  justify-content: center;
  align-items: center;
  width: calc(100% / 3);
  .label {
    position: absolute;
    top: 3px;
    left: 3px;
    font-weight: bolder;
    font-size: 0.9rem;
  }
}
</style>
