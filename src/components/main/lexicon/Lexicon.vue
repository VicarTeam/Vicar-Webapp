<template>
  <div class="d-flex flex-grow-1 lexicon">
    <div class="sidenav">
      <TOCMenu :title="$t('character.bloodpotency')" paragraph="bloodpotency">
        <TOCItem :title="$t('character.bloodpotency.spurt')" paragraph="bloodpotency-spurt"/>
        <TOCItem :title="$t('character.bloodpotency.healing')" paragraph="bloodpotency-healing"/>
        <TOCItem :title="$t('character.bloodpotency.bonus')" paragraph="bloodpotency-bonus"/>
        <TOCItem :title="$t('character.bloodpotency.rouserepeat')" paragraph="bloodpotency-rouserepeat"/>
      </TOCMenu>

      <TOCMenu :title="$t('lexicon.toc.clans')" paragraph="clans">
        <TOCMenu v-for="c in clans" :key="c.id" :title="c.name" :paragraph="'clan-' + c.id">
          <TOCItem :title="$t('lexicon.toc.clans.bane')" :paragraph="'clan-' + c.id + '-bane'"/>
          <TOCItem :title="$t('lexicon.toc.clans.disciplines')" :paragraph="'clan-' + c.id + '-disciplines'"/>
        </TOCMenu>
      </TOCMenu>

      <TOCMenu :title="$t('lexicon.toc.disciplines')" paragraph="disciplines">
        <TOCMenu v-for="d in disciplines" :key="d.id" :title="d.name" :paragraph="'discipline-' + d.id">
          <TOCMenu :title="$t('lexicon.toc.disciplines.abilites')" :paragraph="'discipline-' + d.id + '-abilities'">
            <TOCItem v-for="i in [1, 2, 3, 4, 5]" :key="i" :title="$t('editor.disciplines.level') + ' ' + i" :paragraph="'discipline-' + d.id + '-abilities' + i"/>
          </TOCMenu>
          <TOCMenu :title="$t('viewer.tab.bloodrituals')" paragraph="bloodrituals">
            <TOCItem v-for="i in [1, 2, 3, 4, 5]" :key="i" :title="$t('editor.disciplines.level') + ' ' + i" :paragraph="'bloodrituals-' + i"/>
          </TOCMenu>
        </TOCMenu>
      </TOCMenu>

      <TOCMenu :title="$t('editor.traits.merits')" paragraph="merits">
        <TOCItem :title="$t('data.trait.merits')" paragraph="merits-merits"/>
        <TOCItem :title="$t('data.trait.backgrounds')" paragraph="merits-backgrounds"/>
      </TOCMenu>
      <TOCMenu :title="$t('editor.traits.flaws')" paragraph="flaws">
        <TOCItem :title="$t('data.trait.merits')" paragraph="flaws-merits"/>
        <TOCItem :title="$t('data.trait.backgrounds')" paragraph="flaws-backgrounds"/>
      </TOCMenu>

      <TOCMenu :title="$t('data.predatortype')" paragraph="predator">
        <TOCItem v-for="p in predatorTypes" :title="p.name" :paragraph="'predator-' + p.id" :key="p.id"/>
      </TOCMenu>
    </div>
    <div class="text-content">
      <section>
        <h2 ref="bloodpotency" style="margin-top: 0">{{$t('character.bloodpotency')}}</h2>
        <h5 ref="bloodpotency-spurt">{{$t('character.bloodpotency.spurt')}}</h5>
        <p>{{$t('character.bloodpotency.spurt.desc')}}</p>
        <h5 ref="bloodpotency-healing">{{$t('character.bloodpotency.healing')}}</h5>
        <p>{{$t('character.bloodpotency.healing.desc')}}</p>
        <h5 ref="bloodpotency-bonus">{{$t('character.bloodpotency.bonus')}}</h5>
        <p>{{$t('character.bloodpotency.bonus.desc')}}</p>
        <h5 ref="bloodpotency-rouserepeat">{{$t('character.bloodpotency.rouserepeat')}}</h5>
        <p>{{$t('character.bloodpotency.rouserepeat.desc')}}</p>
        <h5 ref="bloodpotency-table">{{$t('lexicon.toc.bloodpotency')}}</h5>
        <table class="table">
          <thead>
          <tr>
            <th>#</th>
            <th>{{$t('character.bloodpotency.spurt')}}</th>
            <th>{{$t('character.bloodpotency.healing')}}</th>
            <th>{{$t('character.bloodpotency.bonus')}}</th>
            <th>{{$t('character.bloodpotency.rouserepeat')}}</th>
            <th>{{$t('character.bloodpotency.banelevel')}}</th>
            <th>{{$t('character.bloodpotency.pray')}}</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="b in data.selectedLanguage.bloodPotencyTable" :key="b.value">
            <td>{{b.value}}</td>
            <td>{{b.bleedingSpurt}} {{$t('character.dice')}}</td>
            <td>{{b.healedDamage}} {{$t('character.simpledmg')}}</td>
            <td>{{b.disciplineBonus}} {{$t('character.dice')}}</td>
            <td>{{$t('character.bloodpotency.rouserepeat.val', {x: b.rouseRepeatDisciplineLevel})}}</td>
            <td>{{b.baneLevel}}</td>
            <td>{{b.pray}}</td>
          </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2 ref="clans">{{$t('lexicon.toc.clans')}}</h2>
        <p>{{$t('editor.clan.tip.content')}}</p>

        <section v-for="c in clans">
          <h3 :ref="'clan-' + c.id">{{c.name}}</h3>
          <span style="color: #ababab"><i>"{{c.slogan}}"</i></span>
          <div style="margin-top: 0.5rem;overflow: auto;">
            <img style="filter: var(--image-to-primary-color-filter); float: left; width: 10rem; margin-right: 1rem; margin-bottom: 1rem" :src="getClanSymbol(c)"/>
            {{c.description}}
          </div>
          <section>
            <h4 :ref="'clan-' + c.id + '-disciplines'">{{$t('lexicon.toc.clans.disciplines')}}</h4>
            <ul>
              <li v-for="d in c.disciplines" style="margin-bottom: 0">
                <a style="cursor: pointer" @click="goToParagraph('discipline-' + d.id)">{{d.name}}</a>
              </li>
            </ul>
          </section>
        </section>
      </section>

      <section>
        <h2 ref="disciplines">{{$t('lexicon.toc.disciplines')}}</h2>
        <section v-for="d in disciplines">
          <h3 :ref="'discipline-' + d.id">{{d.name}}</h3>
          <p>{{d.summary}}</p>

          <section>
            <h4 :ref="'discipline-' + d.id + '-abilities'">{{$t('lexicon.toc.disciplines.abilites')}}</h4>

            <section v-for="(abs, i) in data.normalDisciplineAbilitiesAsArray(d)">
              <h5 :ref="'discipline-' + d.id + '-abilities' + (i + 1)">{{$t('editor.disciplines.level')}} {{i + 1}}</h5>

              <section v-for="a in abs">
                <h6>{{a.name}}</h6>
                <small><i>{{a.summary}}</i></small>
                <hr>
                <small v-if="a.requirement"><b>{{$t('editor.disciplines.requirement')}}</b>: {{getRequirement(a)}}</small>
                <small v-if="a.combination"><b>{{$t('editor.disciplines.combo')}}</b>: {{getCombo(a)}}</small>
                <hr v-if="a.combination || a.requirement">
                <p><b>{{$t('editor.disciplines.costs')}}</b>: {{a.costs}}</p>
                <p v-if="a.diceSupplies"><b>{{$t('editor.disciplines.dices')}}</b>: {{a.diceSupplies}}</p>
                <p><b>{{$t('editor.disciplines.system')}}</b>: <span v-html="a.system"/></p>
                <small v-if="a.alternatives"><b>{{$t('editor.disciplines.alternatives')}}</b>: {{a.alternatives.join(", ")}}</small>
                <p><b>{{$t('editor.disciplines.duration')}}</b>: {{a.duration}}</p>
              </section>
            </section>
          </section>

          <section v-if="d.id === 3">
            <h4 ref="bloodrituals">{{$t('viewer.tab.bloodrituals')}}</h4>

            <section v-for="(br, i) in bloodRituals">
              <h5 :ref="'bloodrituals-' + (i + 1)">{{$t('editor.disciplines.level')}} {{i + 1}}</h5>

              <section v-for="r in br">
                <h6>{{r.name}}</h6>
                <small><i>{{r.description}}</i></small>
                <hr>
                <p><b>{{$t('editor.disciplines.bloodritual.ingredients')}}</b>: {{r.ingredients}}</p>
                <p><b>{{$t('editor.disciplines.bloodritual.execution')}}</b>: {{r.execution}}</p>
                <p><b>{{$t('editor.disciplines.bloodritual.system')}}</b>: {{r.system}}</p>
              </section>
            </section>
          </section>
        </section>
      </section>

      <section>
        <h2 ref="merits">{{$t('editor.traits.merits')}}</h2>

        <section>
          <h3 ref="merits-merits">{{$t('data.trait.merits')}}</h3>

          <section v-for="p in filterPacks(merits, false)">
            <h4>{{p.name}}</h4>
            <small>{{p.description}}</small>

            <section v-for="t in p.advantages">
              <h6>{{t.name}} - <small style="color: #ababab"><i>{{$t('editor.disciplines.level') + ' ' + t.level}}</i></small></h6>
              <small>{{t.description}}</small>
            </section>
          </section>
        </section>

        <section>
          <h3 ref="merits-backgrounds">{{$t('data.trait.backgrounds')}}</h3>

          <section v-for="p in filterPacks(backgrounds, false)">
            <h4>{{p.name}}</h4>
            <small>{{p.description}}</small>

            <section v-for="t in p.advantages">
              <h6>{{t.name}} - <small style="color: #ababab"><i>{{$t('editor.disciplines.level') + ' ' + t.level}}</i></small></h6>
              <small>{{t.description}}</small>
            </section>
          </section>
        </section>
      </section>

      <section>
        <h2 ref="flaws">{{$t('editor.traits.flaws')}}</h2>

        <section>
          <h3 ref="flaws-merits">{{$t('data.trait.merits')}}</h3>

          <section v-for="p in filterPacks(merits, true)">
            <h4>{{p.name}}</h4>
            <small>{{p.description}}</small>

            <section v-for="t in p.advantages">
              <h6>{{t.name}} - <small style="color: #ababab"><i>{{$t('editor.disciplines.level') + ' ' + t.level}}</i></small></h6>
              <small>{{t.description}}</small>
            </section>
          </section>
        </section>

        <section>
          <h3 ref="flaws-backgrounds">{{$t('data.trait.backgrounds')}}</h3>

          <section v-for="p in filterPacks(backgrounds, true)">
            <h4>{{p.name}}</h4>
            <small>{{p.description}}</small>

            <section v-for="t in p.advantages">
              <h6>{{t.name}} - <small style="color: #ababab"><i>{{$t('editor.disciplines.level') + ' ' + t.level}}</i></small></h6>
              <small>{{t.description}}</small>
            </section>
          </section>
        </section>
      </section>

      <section>
        <h2 ref="predator">{{$t('data.predatortype')}}</h2>

        <section v-for="p in predatorTypes">
          <h3 :ref="'predator-' + p.id">{{p.name}}</h3>
          <small>{{p.description}}</small>
        </section>
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Provide, Vue} from "vue-property-decorator";
import TOCMenu from "@/components/main/lexicon/toc/TOCMenu.vue";
import TOCItem from "@/components/main/lexicon/toc/TOCItem.vue";
import DataManager from "@/libs/data-manager";
import {IClan} from "@/types/models";
import {IBloodRitual, IDiscipline, IDisciplineAbility, IPredatorType, ITraitPack} from "@/types/data";

@Component({
  components: {TOCItem, TOCMenu}
})
export default class Lexicon extends Vue {

  private data = DataManager;
  private clans: IClan[] = [];
  private disciplines: IDiscipline[] = [];
  private disciplineAbilities: IDisciplineAbility[] = [];
  private bloodRituals: IBloodRitual[][] = [];
  private merits: ITraitPack[] = [];
  private backgrounds: ITraitPack[] = [];
  private predatorTypes: IPredatorType[] = [];

  mounted() {
    this.clans = this.data.selectedLanguage.books.map(b => b.clans).flat().sort((a, b) => a.name.localeCompare(b.name));

    this.clans.forEach(c => {
      c.disciplines.forEach(d => {
        if (this.disciplines.includes(d)) {
          return;
        }
        this.disciplines.push(d);
      });
    });
    this.disciplines = this.disciplines.sort((a, b) => a.name.localeCompare(b.name));
    this.disciplineAbilities = this.disciplines.map(d => this.data.normalToLeveledAbilities(d)).flat();

    this.bloodRituals = this.data.normalBloodRitualsAsArray();

    this.backgrounds = DataManager.selectedLanguage.books.flatMap(book => {
      if (book && book.backgrounds) {
        return book.backgrounds;
      }
      return [];
    });
    this.merits = DataManager.selectedLanguage.books.flatMap(book => {
      if (book && book.merits) {
        return book.merits;
      }
      return [];
    });

    this.predatorTypes = DataManager.selectedLanguage.books.flatMap(book => {
      if (book && book.predatorTypes) {
        return book.predatorTypes;
      }
      return [];
    }).sort((a, b) => a.name.localeCompare(b.name));
  }

  private filterPacks(packs: ITraitPack[], forFlaw: boolean): ITraitPack[] {
    return [...packs].filter(p => p[!forFlaw ? 'advantages' : 'disadvantages'].length > 0);
  }

  private getClanSymbol(clan: IClan) {
    const images = require.context('@/assets/img/clans', false, /\.png$/)
    return images(`./${clan.id}.png`);
  }

  private getCombo(ability: IDisciplineAbility): string {
    if (!ability.combination) {
      return "";
    }

    return (DataManager.getDiscipline(ability.combination.id)?.name ?? "") + " " + ability.combination.level;
  }

  private getRequirement(ability: IDisciplineAbility): string {
    if (!ability.requirement) {
      return "";
    }
    return this.disciplineAbilities.find(a => a.id === ability.requirement)?.name ?? "";
  }

  @Provide("go-to-paragraph")
  private goToParagraph(paragraph: string) {
    let ref: any = this.$refs[paragraph];
    if (Array.isArray(ref)) {
      ref = ref[0] as HTMLElement;
    }

    if (ref) {
      ref.scrollIntoView({behavior: "smooth"});
    }
  }
}
</script>

<style scoped lang="scss">
.lexicon {
  gap: 1px;
  background: var(--primary-color);
  & > * {
    height: calc((100vh - 4.2rem) - 3px);
    background-color: #25282C;
    overflow-x: hidden;
    overflow-y: auto;
  }
  .sidenav {
    width: 20%;
    & > * {
      padding-right: 1.5rem;
    }
  }
  .text-content {
    width: 80%;
    padding: 2rem 3rem;
    color: #fff;
    font-size: 1.3rem;
    h1, h2, h3, h4, h5, h6 {
      margin-bottom: 0;
      margin-top: 2rem;
    }
    h2 {
      margin-top: 5rem;
    }
  }
}
</style>
