<script setup lang="ts">
import { inject, onMounted, ref } from "vue"
import TOCMenu from "@/components/main/lexicon/toc/TOCMenu.vue"
import TOCItem from "@/components/main/lexicon/toc/TOCItem.vue"
import DataManager from "@/libs/data/data-manager"
import ClanSymbol from "@/components/symbols/ClanSymbol.vue"
import type { IClan } from "@/@types/models"
import type {
  IBloodRitual,
  IDiscipline,
  IDisciplineAbility,
  IOblivionCeremony,
  IPredatorType,
  ITraitPack,
} from "@/@types/data"
import type { ISectionatedCustomLexicon } from "@/@types/custom-lexicon"

defineProps<{
  part: "toc" | "body"
}>()

const data = DataManager

const clans = ref<IClan[]>([])
const disciplines = ref<IDiscipline[]>([])
const disciplineAbilities = ref<IDisciplineAbility[]>([])
const bloodRituals = ref<IBloodRitual[][]>([])
const oblivionCeremonies = ref<IOblivionCeremony[][]>([])
const merits = ref<ITraitPack[]>([])
const backgrounds = ref<ITraitPack[]>([])
const predatorTypes = ref<IPredatorType[]>([])
const customLexicon = ref<ISectionatedCustomLexicon>(data.selectedLanguage.customLexicon)

const setRef = inject<(key: string) => (el: any) => void>("lexicon-set-ref", () => () => void 0)
const goToParagraph = inject<(paragraph: string) => void>("go-to-paragraph", () => void 0)

onMounted(() => {
  clans.value = data.selectedLanguage.books
    .map((b: any) => b.clans)
    .flat()
    .filter((x: any) => x.id !== -1)
    .sort((a: any, b: any) => a.name.localeCompare(b.name))

  const discs: IDiscipline[] = []
  for (const c of clans.value) {
    for (const d of (c as any).disciplines || []) {
      if (!discs.includes(d)) discs.push(d)
    }
  }
  disciplines.value = discs.sort((a, b) => a.name.localeCompare(b.name))
  disciplineAbilities.value = disciplines.value.map((d) => data.normalToLeveledAbilities(d)).flat()

  bloodRituals.value = data.normalBloodRitualsAsArray()
  oblivionCeremonies.value = data.normalOblivionCeremoniesAsArray()

  backgrounds.value = data.selectedLanguage.books.flatMap((book: any) => (book?.backgrounds ? book.backgrounds : []))
  merits.value = data.selectedLanguage.books.flatMap((book: any) => (book?.merits ? book.merits : []))
  predatorTypes.value = data.selectedLanguage.books
    .flatMap((book: any) => (book?.predatorTypes ? book.predatorTypes : []))
    .sort((a: any, b: any) => a.name.localeCompare(b.name))
})

function filterPacks(packs: ITraitPack[], forFlaw: boolean): ITraitPack[] {
  return [...packs].filter((p: any) => p[!forFlaw ? "advantages" : "disadvantages"].length > 0)
}

function getCombo(ability: IDisciplineAbility): string {
  const comb: any = (ability as any).combination
  if (!comb) return ""
  return (DataManager.getDiscipline(comb.id)?.name ?? "") + " " + comb.level
}

function getRequirement(ability: IDisciplineAbility): string {
  const req: any = (ability as any).requirement
  if (!req) return ""
  return disciplineAbilities.value.find((a: any) => a.id === req)?.name ?? ""
}

function findOblivionDiscipline(id: number | undefined): IDisciplineAbility | undefined {
  if (!id) return undefined
  const disc: any = data.getDiscipline(11)
  if (!disc) return undefined
  for (const abilities of Object.values(disc.levels)) {
    for (const ability of abilities as any[]) {
      if (ability.id === id) return ability as any
    }
  }
  return undefined
}
</script>

<template>
  <template v-if="part === 'toc'">
    <TOCMenu
      v-for="(s, i) in customLexicon.prepend.toc"
      :key="i"
      :title="s.title.text"
      :paragraph="s.title.paragraph"
    >
      <TOCItem v-for="(sb, j) in s.subtitles" :key="j" :title="sb.text" :paragraph="sb.paragraph" />
    </TOCMenu>

    <TOCMenu title="Blutmacht" paragraph="bloodpotency">
      <TOCItem title="Blutschub" paragraph="bloodpotency-spurt" />
      <TOCItem title="Heilung pro Wallungs-Check" paragraph="bloodpotency-healing" />
      <TOCItem title="Disziplinsbonus" paragraph="bloodpotency-bonus" />
      <TOCItem title="Wiederholung Wallung" paragraph="bloodpotency-rouserepeat" />
    </TOCMenu>

    <TOCMenu title="Clans" paragraph="clans">
      <TOCMenu v-for="c in clans" :key="c.id" :title="c.name" :paragraph="'clan-' + c.name">
        <TOCItem title="Fluch" :paragraph="'clan-' + c.name + '-bane'" />
        <TOCItem title="Clan-Disziplinen" :paragraph="'clan-' + c.name + '-disciplines'" />
      </TOCMenu>
    </TOCMenu>

    <TOCMenu title="Disziplinen" paragraph="disciplines">
      <TOCMenu v-for="d in disciplines" :key="d.id" :title="d.name" :paragraph="'discipline-' + d.name">
        <TOCMenu title="Kräfte" :paragraph="'discipline-' + d.name + '-abilities'">
          <TOCItem
            v-for="i in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"
            :key="i"
            :title="'Stufe ' + i"
            :paragraph="'discipline-' + d.name + '-abilities' + i"
          />
        </TOCMenu>

        <TOCMenu v-if="d.id === 3" title="Blutrituale" paragraph="bloodrituals">
          <TOCItem
            v-for="i in [1, 2, 3, 4, 5]"
            :key="i"
            :title="'Stufe ' + i"
            :paragraph="'bloodrituals-' + i"
          />
        </TOCMenu>

        <TOCMenu v-if="d.id === 11" title="Vergessenheitszeremonien" paragraph="oblivionceremonies">
          <TOCItem
            v-for="i in [1, 2, 3, 4, 5]"
            :key="i"
            :title="'Stufe ' + i"
            :paragraph="'oblivionceremonies-' + i"
          />
        </TOCMenu>
      </TOCMenu>
    </TOCMenu>

    <TOCMenu title="Vorteile" paragraph="merits">
      <TOCItem title="Vorzüge" paragraph="merits-merits" />
      <TOCItem title="Hintergründe" paragraph="merits-backgrounds" />
    </TOCMenu>

    <TOCMenu title="Schwäche" paragraph="flaws">
      <TOCItem title="Vorzüge" paragraph="flaws-merits" />
      <TOCItem title="Hintergründe" paragraph="flaws-backgrounds" />
    </TOCMenu>

    <TOCMenu title="Jagdverhalten" paragraph="predator">
      <TOCItem v-for="p in predatorTypes" :title="p.name" :paragraph="'predator-' + p.id" :key="p.id" />
    </TOCMenu>

    <TOCMenu
      v-for="(s, i) in customLexicon.append.toc"
      :key="i"
      :title="s.title.text"
      :paragraph="s.title.paragraph"
    >
      <TOCItem v-for="(sb, j) in s.subtitles" :key="j" :title="sb.text" :paragraph="sb.paragraph" />
    </TOCMenu>
  </template>

  <template v-else>
    <section v-for="(s, i) in customLexicon.prepend.sections" :key="i" :style="i === 0 ? { marginTop: 0 } : {}">
      <h2 :ref="setRef(s.paragraph)">{{ s.title }}</h2>

      <template v-for="(it, j) in s.items" :key="j">
        <p v-if="it.type === 'paragraph'">{{ (it as any).text }}</p>
        <ul v-else-if="it.type === 'list'">
          <li v-for="(li, k) in (it as any).items" :key="k">{{ li }}</li>
        </ul>
      </template>

      <section v-for="(sb, j) in s.sections" :key="j">
        <h5 :ref="setRef(sb.paragraph)">{{ sb.title }}</h5>
        <template v-for="(it, k) in sb.items" :key="k">
          <p v-if="it.type === 'paragraph'">{{ (it as any).text }}</p>
          <ul v-else-if="it.type === 'list'">
            <li v-for="(li, l) in (it as any).items" :key="l">{{ li }}</li>
          </ul>
        </template>
      </section>
    </section>

    <section>
      <h2 :ref="setRef('bloodpotency')" :style="customLexicon.prepend.sections.length > 0 ? {} : { marginTop: 0 }">
        Blutmacht
      </h2>

      <h5 :ref="setRef('bloodpotency-spurt')">Blutschub</h5>
      <p>Jeder Vampir kann sein Blut anrufen, um seine Attribute vorübergehend zu verstärken, sei es körperlich, gesellschaftlich oder geistig. Wenn der Charakter einen Blutschub auslösen möchte, kann der Spieler eine bestimmte Anzahl von Würfeln zu einem Würfelvorrat eines Attributs hinzufügen. Die Anzahl der Würfel, die ein Blutschub gewährt, hängt von der Blutmacht des Charakters ab; Charaktere können Blutschub nur einmal pro Probe verwenden. Ein Blutschub erfordert einen Wallungs-Check. Blutschub gilt nur für einen einzigen Würfelwurf. (Durch einen Blutschub hinzugewonnene Würfel, bleiben auch für eine Wiederholung durch Willenskraft erhalten.) Charaktere können keinen Blutschub für Proben auf Willenskraft oder Menschlichkeit, für Proben, die sich über mehrere Szenen erstrecken oder Ein-Wurf-Kämpfe (S. 296) verwenden, ebenso wenig, wenn die Erzählerin sie nicht erlaubt. Automatische Erfolge (S. 120) oder „Nimm die Hälfte“ gelten nicht für Proben, die durch einen Blutschub gesteigert werden.</p>

      <h5 :ref="setRef('bloodpotency-healing')">Heilung pro Wallungs-Check</h5>
      <p>Vampire sind tot, somit heilen sie auch nicht auf natürliche Weise. Ihr untotes Gerüst kann sich noch immer selbst zusammenflicken, wenn sie sich ausreichend anstrengen. Leichten Schaden an der Gesundheit heilen: Je nach Blutmacht kann ein Vampir mit einem einzigen Wallungs-Check einen oder mehrere Punkte Leichten Schaden an seiner Gesundheit heilen. Vampire können pro Runde einen Wallungs- Check durchführen, um Leichten Schaden an der Gesundheit zu heilen. Schweren Schaden an der Gesundheit heilen: Um Schweren Schaden zu heilen, muss ein Vampir bis zum nächsten Sonnenuntergang warten und anschließend drei Wallungs- Checks zusätzlich zum regulären Wallungs- Check beim Erwachen ablegen. Hierdurch wird ein Punkt Schwerer Schaden geheilt, ebenso eine Lähmende Verletzung oder ähnliche Beeinträchtigung. Ein Vampir kann nur einen Punkt Schweren Schaden pro Nacht heilen. Es gilt ebenso wie beim Erwachen, wenn der Hunger des Vampirs durch diese Wallungs-Checks über Hunger 5 steigt, fällt er eher in Starre, als dass er eine Probe gegen Hungerraserei ablegen muss.</p>

      <h5 :ref="setRef('bloodpotency-bonus')">Disziplinsbonus</h5>
      <p>Wie viele Würfel zum Vorrat bei einer Disziplinsprobe hinzugefügt werden dürfen.</p>

      <h5 :ref="setRef('bloodpotency-rouserepeat')">Wiederholung Wallung</h5>
      <p>Definiert bis zu welcher Disziplinsstufe ein Wallungs-Check für das Einsetzen einer Kraft einmalig neu gewürfelt werden darf.</p>

      <h5 :ref="setRef('bloodpotency-table')">Blutmacht</h5>
      <table class="table">
        <thead>
        <tr>
          <th>#</th>
          <th>Blutschub</th>
          <th>Heilung pro Wallungs-Check</th>
          <th>Disziplinsbonus</th>
          <th>Wiederholung Wallung</th>
          <th>Schwere des Fluchs</th>
          <th>Beuteausschluss</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="b in data.selectedLanguage.bloodPotencyTable" :key="b.value">
          <td>{{ b.value }}</td>
          <td>{{ b.bleedingSpurt }} Würfel</td>
          <td>{{ b.healedDamage }} Punkt(e) leichter Schaden</td>
          <td>{{ b.disciplineBonus }} Würfel</td>
          <td>{{ `Stufe ${b.rouseRepeatDisciplineLevel} und darunter` }}</td>
          <td>{{ b.baneLevel }}</td>
          <td>{{ b.pray }}</td>
        </tr>
        </tbody>
      </table>
    </section>

    <section>
      <h2 :ref="setRef('clans')">Clans</h2>
      <p>Der Clan beschreibt deine Zugehörigkeit in der Domäne. Sowas wie ein Kult beschreibt jedoch der Clan ebenso deine Disziplinen, also die übernatürlichen Fähigkeiten, die ein Vampir besitzt.</p>

      <section v-for="c in clans" :key="c.id">
        <h3 :ref="setRef('clan-' + c.name)">{{ c.name }}</h3>
        <span class="muted"><i>"{{ (c as any).slogan }}"</i></span>

        <div class="clan-row">
          <ClanSymbol class="clan-symbol" :clan="c" />
          <span>{{ (c as any).description }}</span>
        </div>

        <section>
          <h4 :ref="setRef('clan-' + c.name + '-bane')">Fluch</h4>
          <p>{{ (c as any).curse }}</p>
        </section>

        <section>
          <h4 :ref="setRef('clan-' + c.name + '-disciplines')">Clan-Disziplinen</h4>
          <ul>
            <li v-for="d in (c as any).disciplines" :key="d.id" class="tight">
              <a class="toc-link" @click="goToParagraph('discipline-' + d.name)">{{ d.name }}</a>
            </li>
          </ul>
        </section>
      </section>
    </section>

    <section>
      <h2 :ref="setRef('disciplines')">Disziplinen</h2>

      <section v-for="d in disciplines" :key="d.id">
        <h3 :ref="setRef('discipline-' + d.name)">{{ d.name }}</h3>
        <p>{{ (d as any).summary }}</p>

        <section>
          <h4 :ref="setRef('discipline-' + d.name + '-abilities')">Kräfte</h4>

          <section v-for="(abs, i) in data.normalDisciplineAbilitiesAsArray(d)" :key="i">
            <h5 :ref="setRef('discipline-' + d.name + '-abilities' + (i + 1))">
              Stufe {{ i + 1 }}
            </h5>

            <section v-for="a in abs" :key="a.id">
              <h6>{{ a.name }}</h6>
              <small><i>{{ (a as any).summary }}</i></small>
              <hr />
              <small v-if="(a as any).minBloodPotency"><b>Min. Blutmacht</b>: {{ (a as any).minBloodPotency }}<br/></small>
              <small v-if="(a as any).requirement"><b>Voraussetzung</b>: {{ getRequirement(a as any) }}<br/></small>
              <small v-if="(a as any).combination"
              ><b>Kombination</b>: {{ getCombo(a as any) }}<br/></small>
              <hr v-if="(a as any).combination || (a as any).requirement" />
              <p><b>Kosten</b>: {{ (a as any).costs }}</p>
              <p v-if="(a as any).diceSupplies"><b>Würfelpool</b>: {{ (a as any).diceSupplies }}</p>
              <p><b>System</b>: <span v-html="(a as any).system" /></p>
              <small v-if="(a as any).alternatives?.length > 0"
              ><b>Alternativen</b>: {{ (a as any).alternatives.join(", ") }}</small>
              <p><b>Dauer</b>: {{ (a as any).duration }}</p>
            </section>
          </section>
        </section>

        <section v-if="d.id === 3">
          <h4 :ref="setRef('bloodrituals')">Blutrituale</h4>
          <section v-for="(br, i) in bloodRituals" :key="i">
            <h5 :ref="setRef('bloodrituals-' + (i + 1))">Stufe {{ i + 1 }}</h5>
            <section v-for="r in br" :key="(r as any).id">
              <h6>{{ (r as any).name }}</h6>
              <small><i>{{ (r as any).description }}</i></small>
              <hr />
              <p><b>Zutaten</b>: {{ (r as any).ingredients }}</p>
              <p><b>Ausführung</b>: {{ (r as any).execution }}</p>
              <p><b>System</b>: {{ (r as any).system }}</p>
            </section>
          </section>
        </section>

        <section v-if="d.id === 11">
          <h4 :ref="setRef('oblivionceremonies')">Vergessenheitszeremonien</h4>
          <section v-for="(br, i) in oblivionCeremonies" :key="i">
            <h5 :ref="setRef('oblivionceremonies-' + (i + 1))">Stufe {{ i + 1 }}</h5>
            <section v-for="r in br" :key="(r as any).id">
              <h6>{{ (r as any).name }}</h6>
              <small><i>{{ (r as any).summary }}</i></small>
              <hr />
              <p v-if="findOblivionDiscipline((r as any).requires)">
                <b>Benötigte Disziplinsfähigkeit</b>: {{ (findOblivionDiscipline((r as any).requires) as any)?.name }}
              </p>
              <p v-if="(r as any).cult"><b>Praktiziert von</b>: {{ (r as any).cult }}</p>
              <p><b>Kosten</b>: {{ (r as any).cost }}</p>
              <p><b>Zeremonienwurf</b>: {{ (r as any).roll }}</p>
              <p><b>Zutaten</b>: {{ (r as any).ingredients }}</p>
              <p><b>Ausführung</b>: {{ (r as any).execution }}</p>
              <p><b>System</b>: {{ (r as any).system }}</p>
              <p v-if="(r as any).duration">
                <b>Dauer</b>: {{ (r as any).duration }}
              </p>
            </section>
          </section>
        </section>
      </section>
    </section>

    <section>
      <h2 :ref="setRef('merits')">Vorteile</h2>

      <section>
        <h3 :ref="setRef('merits-merits')">Vorzüge</h3>
        <section v-for="p in filterPacks(merits, false)" :key="(p as any).id">
          <h4>{{ (p as any).name }}</h4>
          <small>{{ (p as any).description }}</small>
          <section v-for="t in (p as any).advantages" :key="(t as any).id">
            <h6>
              {{ (t as any).name }} -
              <small class="muted"><i>{{ "Stufe " + (t as any).level }}</i></small>
            </h6>
            <small>{{ (t as any).description }}</small>
          </section>
        </section>
      </section>

      <section>
        <h3 :ref="setRef('merits-backgrounds')">Hintergründe</h3>
        <section v-for="p in filterPacks(backgrounds, false)" :key="(p as any).id">
          <h4>{{ (p as any).name }}</h4>
          <small>{{ (p as any).description }}</small>
          <section v-for="t in (p as any).advantages" :key="(t as any).id">
            <h6>
              {{ (t as any).name }} -
              <small class="muted"><i>{{ "Stufe " + (t as any).level }}</i></small>
            </h6>
            <small>{{ (t as any).description }}</small>
          </section>
        </section>
      </section>
    </section>

    <section>
      <h2 :ref="setRef('flaws')">Schwäche</h2>

      <section>
        <h3 :ref="setRef('flaws-merits')">Vorzüge</h3>
        <section v-for="p in filterPacks(merits, true)" :key="(p as any).id">
          <h4>{{ (p as any).name }}</h4>
          <small>{{ (p as any).description }}</small>
          <section v-for="t in (p as any).disadvantages" :key="(t as any).id">
            <h6>
              {{ (t as any).name }} -
              <small class="muted"><i>{{ "Stufe " + (t as any).level }}</i></small>
            </h6>
            <small>{{ (t as any).description }}</small>
          </section>
        </section>
      </section>

      <section>
        <h3 :ref="setRef('flaws-backgrounds')">Hintergründe</h3>
        <section v-for="p in filterPacks(backgrounds, true)" :key="(p as any).id">
          <h4>{{ (p as any).name }}</h4>
          <small>{{ (p as any).description }}</small>
          <section v-for="t in (p as any).disadvantages" :key="(t as any).id">
            <h6>
              {{ (t as any).name }} -
              <small class="muted"><i>{{ "Stufe " + (t as any).level }}</i></small>
            </h6>
            <small>{{ (t as any).description }}</small>
          </section>
        </section>
      </section>
    </section>

    <section>
      <h2 :ref="setRef('predator')">Jagdverhalten</h2>
      <section v-for="p in predatorTypes" :key="p.id">
        <h3 :ref="setRef('predator-' + p.id)">{{ p.name }}</h3>
        <small>{{ (p as any).description }}</small>
        <section>
          <h5>und das erhälst du:</h5>
          <ul>
            <li v-for="(pa, i) in (p as any).actions" :key="i">{{ (pa as any).description }}</li>
          </ul>
        </section>
      </section>
    </section>

    <section v-for="(s, i) in customLexicon.append.sections" :key="i">
      <h2 :ref="setRef(s.paragraph)">{{ s.title }}</h2>
      <template v-for="(it, j) in s.items" :key="j">
        <p v-if="it.type === 'paragraph'">{{ (it as any).text }}</p>
        <ul v-else-if="it.type === 'list'">
          <li v-for="(li, k) in (it as any).items" :key="k">{{ li }}</li>
        </ul>
      </template>

      <section v-for="(sb, j) in s.sections" :key="j">
        <h5 :ref="setRef(sb.paragraph)">{{ sb.title }}</h5>
        <template v-for="(it, k) in sb.items" :key="k">
          <p v-if="it.type === 'paragraph'">{{ (it as any).text }}</p>
          <ul v-else-if="it.type === 'list'">
            <li v-for="(li, l) in (it as any).items" :key="l">{{ li }}</li>
          </ul>
        </template>
      </section>
    </section>
  </template>
</template>

<style scoped lang="scss">
.muted {
  color: #ababab;
}
.tight {
  margin-bottom: 0;
}
.toc-link {
  cursor: pointer;
  text-decoration: none;
  &:hover {
    color: var(--primary-color-light);
  }
  &:active {
    color: var(--primary-color);
  }
}
.clan-row {
  margin-top: 0.75rem;
  overflow: auto;
}
.clan-symbol {
  float: left;
  width: 10rem;
  margin-right: 1rem;
  margin-bottom: 1rem;
  filter: var(--image-to-primary-color-filter);
  -webkit-user-drag: none;
}
</style>
