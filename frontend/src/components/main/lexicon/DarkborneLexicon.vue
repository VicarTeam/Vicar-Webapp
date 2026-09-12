<script setup lang="ts">
import { computed, inject, onMounted, ref } from "vue"
import TOCMenu from "@/components/main/lexicon/toc/TOCMenu.vue"
import TOCItem from "@/components/main/lexicon/toc/TOCItem.vue"
import LexiconMarkdown from "@/components/main/lexicon/LexiconMarkdown.vue"
import WrappedSpinner from "@/components/spinners/WrappedSpinner.vue"
import DbHouseSymbol from "@/components/symbols/DbHouseSymbol.vue"
import DbArtSymbol from "@/components/symbols/DbArtSymbol.vue"
import {
  DarkborneData,
  type IDarkAnathemaLevel,
  type IDarkArt,
  type IDarkArtBoundary,
  type IDarkborneContent,
  type IDarkCovenant,
  type IDarkFirst,
  type IDarkHouse,
  type IDarkHouseRelation,
  type IDarkLexiconEntry,
  type IDarkNamedEntry,
} from "@/libs/data/darkborne-data"

defineProps<{
  part: "toc" | "body"
}>()

interface ILexiconNode {
  entry: IDarkLexiconEntry
  children: IDarkLexiconEntry[]
}

interface ILexiconSection {
  section: string
  anchor: string
  nodes: ILexiconNode[]
}

const setRef = inject<(key: string) => (el: any) => void>("lexicon-set-ref", () => () => void 0)
const goToParagraph = inject<(paragraph: string) => void>("go-to-paragraph", () => void 0)

const content = ref<IDarkborneContent | null>(null)
const loading = ref(true)
const failed = ref(false)

onMounted(async () => {
  try {
    content.value = await DarkborneData.load()
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
})

function slug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

const sections = computed<ILexiconSection[]>(() => {
  if (!content.value) {
    return []
  }
  return DarkborneData.lexiconSections().map((bucket) => {
    const nodes: ILexiconNode[] = []
    const byKey = new Map<string, ILexiconNode>()
    for (const entry of bucket.entries) {
      if (entry.parentKey) {
        continue
      }
      const node: ILexiconNode = { entry, children: [] }
      byKey.set(entry.key, node)
      nodes.push(node)
    }
    for (const entry of bucket.entries) {
      if (!entry.parentKey) {
        continue
      }
      const parent = byKey.get(entry.parentKey)
      if (parent) {
        parent.children.push(entry)
      } else {
        nodes.push({ entry, children: [] })
      }
    }
    return { section: bucket.section, anchor: `db-section-${slug(bucket.section)}`, nodes }
  })
})

const houses = computed<IDarkHouse[]>(() => content.value?.houses ?? [])
const arts = computed<IDarkArt[]>(() => content.value?.arts ?? [])
const anathemaLevels = computed<IDarkAnathemaLevel[]>(() =>
  [...(content.value?.anathemaLevels ?? [])].sort((a, b) => a.order - b.order)
)

function levelName(level: string): string {
  return DarkborneData.anathemaLevelName(level)
}

function influenceName(key: string): string {
  return DarkborneData.influenceName(key)
}

function depthName(depth: number): string {
  return DarkborneData.depthName(depth)
}

function attributeNames(art: IDarkArt): string {
  const all = content.value?.attributes ?? []
  return art.typicalAttributes.map((key) => all.find((a) => a.key === key)?.name ?? key).join(", ")
}

function counterName(art: IDarkArt): string {
  if (!art.counterKey) {
    return ""
  }
  return DarkborneData.art(art.counterKey)?.name ?? ""
}

function sortedForms(art: IDarkArt) {
  return [...art.forms].sort((a, b) => a.level - b.level || a.name.localeCompare(b.name))
}

const firsts = computed<IDarkFirst[]>(() => content.value?.firsts ?? [])
const covenant = computed<IDarkCovenant | undefined>(() => content.value?.covenant)
const courtTypes = computed<IDarkNamedEntry[]>(() => content.value?.courtTypes ?? [])
const courtMandates = computed<IDarkNamedEntry[]>(() => content.value?.courtMandates ?? [])
const courtStructures = computed<IDarkNamedEntry[]>(() => content.value?.courtStructures ?? [])
const artBoundaries = computed<IDarkArtBoundary[]>(() => content.value?.artBoundaries ?? [])

const boundaryGroups = computed(() => {
  const groups = new Map<string, IDarkArtBoundary[]>()
  for (const row of artBoundaries.value) {
    const rows = groups.get(row.pairKey) ?? []
    rows.push(row)
    groups.set(row.pairKey, rows)
  }
  return [...groups.entries()].map(([key, rows]) => ({
    key,
    rows,
    titleA: DarkborneData.art(rows[0]?.artA ?? "")?.shortName ?? "",
    titleB: DarkborneData.art(rows[0]?.artB ?? "")?.shortName ?? "",
  }))
})

function houseName(key: string): string {
  return DarkborneData.house(key)?.name ?? key
}

function firstOfHouse(key: string): IDarkFirst | undefined {
  return DarkborneData.firstOfHouse(key)
}

function relationsOfHouse(key: string): IDarkHouseRelation[] {
  return DarkborneData.relationsOfHouse(key)
}

function relationPartner(relation: IDarkHouseRelation, key: string): string {
  const other = relation.houseA === key ? relation.houseB : relation.houseA
  return other ? houseName(other) : ""
}
</script>

<template>
  <template v-if="part === 'toc'">
    <div v-if="loading" class="db-toc-state">Regelwerk wird geladen ...</div>
    <div v-else-if="failed" class="db-toc-state">Regelwerk nicht verfügbar</div>

    <template v-else>
      <TOCMenu v-for="s in sections" :key="s.anchor" :title="s.section" :paragraph="s.anchor">
        <template v-for="node in s.nodes" :key="node.entry.key">
          <TOCMenu
            v-if="node.children.length > 0"
            :title="node.entry.title"
            :paragraph="node.entry.key"
          >
            <TOCItem v-for="child in node.children" :key="child.key" :title="child.title" :paragraph="child.key" />
          </TOCMenu>
          <TOCItem v-else :title="node.entry.title" :paragraph="node.entry.key" />
        </template>
      </TOCMenu>

      <TOCMenu title="Die neun Häuser" paragraph="db-houses">
        <TOCMenu v-for="h in houses" :key="h.key" :title="h.name" :paragraph="'db-house-' + h.key">
          <TOCItem :title="'Blood Scar: ' + h.scar.name" :paragraph="'db-house-' + h.key + '-scar'" />
          <TOCItem title="Anathema" :paragraph="'db-house-' + h.key + '-anathema'" />
        </TOCMenu>
      </TOCMenu>

      <TOCMenu title="Die Blutkünste" paragraph="db-arts">
        <TOCMenu v-for="a in arts" :key="a.key" :title="a.shortName" :paragraph="'db-art-' + a.key">
          <TOCItem title="Stufen" :paragraph="'db-art-' + a.key + '-levels'" />
          <TOCItem title="Gefestigte Formen" :paragraph="'db-art-' + a.key + '-forms'" />
        </TOCMenu>
      </TOCMenu>

      <TOCMenu title="Die Neun Ersten" paragraph="db-firsts">
        <TOCItem v-for="f in firsts" :key="f.key" :title="f.name" :paragraph="'db-first-' + f.key" />
      </TOCMenu>

      <TOCMenu title="Courts, Mandate und Ämter" paragraph="db-courts">
        <TOCItem title="Court-Typen" paragraph="db-court-types" />
        <TOCItem title="Mandate" paragraph="db-court-mandates" />
        <TOCItem title="Einrichtungen eines Courts" paragraph="db-court-structures" />
      </TOCMenu>

      <TOCMenu v-if="covenant" title="Der Bund der Schweigenden Nacht" paragraph="db-covenant">
        <TOCItem
          v-for="a in covenant.articles"
          :key="a.key"
          :title="a.number + '. ' + a.title"
          :paragraph="'db-covenant-' + a.key"
        />
        <TOCItem title="Der Schwur der Nacht" paragraph="db-covenant-oath" />
      </TOCMenu>

      <TOCItem title="Anathema-Stufen" paragraph="db-anathema-levels" />
    </template>
  </template>

  <template v-else>
    <WrappedSpinner v-if="loading">
      <span class="db-loading-text">Regelwerk wird geladen ...</span>
    </WrappedSpinner>

    <section v-else-if="failed">
      <h2 :style="{ marginTop: 0 }">Deathborne</h2>
      <p>Das Regelwerk konnte nicht geladen werden. Prüfe die Verbindung und lade die Seite neu.</p>
    </section>

    <template v-else>
      <section v-for="(s, i) in sections" :key="s.anchor" :style="i === 0 ? { marginTop: 0 } : {}">
        <h2 :ref="setRef(s.anchor)">{{ s.section }}</h2>

        <section v-for="node in s.nodes" :key="node.entry.key">
          <h3 :ref="setRef(node.entry.key)">{{ node.entry.title }}</h3>
          <LexiconMarkdown :source="node.entry.body" />

          <section v-for="child in node.children" :key="child.key">
            <h4 :ref="setRef(child.key)">{{ child.title }}</h4>
            <LexiconMarkdown :source="child.body" />
          </section>
        </section>
      </section>

      <section>
        <h2 :ref="setRef('db-houses')">Die neun Häuser</h2>
        <p>Jedes Haus stammt von einem der neun Ursprünge ab und gibt seinen Nachkommen eine Leitidee, einen Blood Scar und ein eigenes Anathema-Profil mit.</p>

        <section v-for="h in houses" :key="h.key">
          <h3 :ref="setRef('db-house-' + h.key)">{{ h.name }}</h3>
          <span class="db-muted"><i>{{ h.epithet }}</i></span>

          <div class="db-row">
            <DbHouseSymbol class="db-lex-symbol" :house="h" size="9rem" />
            <span>{{ h.description }}</span>
          </div>

          <p><b>Leitidee</b>: {{ h.idea }}</p>
          <p><b>Ruf</b>: {{ h.reputation }}</p>
          <p><b>Ursprung</b>: {{ h.originName }}, {{ h.originTitle }}</p>
          <p v-if="firstOfHouse(h.key)">
            <b>Der Erste dahinter</b>:
            <a class="toc-link" @click="goToParagraph('db-first-' + firstOfHouse(h.key)!.key)">
              {{ firstOfHouse(h.key)!.name }}
            </a>
            <span class="db-muted"> ({{ firstOfHouse(h.key)!.ideal }})</span>
          </p>
          <template v-if="relationsOfHouse(h.key).length > 0">
            <p><b>Politische Spannungen</b></p>
            <ul>
              <li v-for="r in relationsOfHouse(h.key)" :key="r.key">
                <b v-if="relationPartner(r, h.key)">{{ relationPartner(r, h.key) }}: </b>{{ r.description }}
              </li>
            </ul>
          </template>

          <section>
            <h4 :ref="setRef('db-house-' + h.key + '-scar')">Blood Scar: {{ h.scar.name }}</h4>
            <p><i>{{ h.scar.summary }}</i></p>
            <p><b>Auslöser</b>: {{ h.scar.triggers.join(", ") }}</p>
            <p><b>Dauerhafte Wirkung</b>: {{ h.scar.permanentEffect }}</p>
            <p v-if="h.scar.compulsions.length > 0"><b>Zwänge</b></p>
            <ul v-if="h.scar.compulsions.length > 0">
              <li v-for="(c, i) in h.scar.compulsions" :key="i">{{ c }}</li>
            </ul>
          </section>

          <section>
            <h4 :ref="setRef('db-house-' + h.key + '-anathema')">Anathema</h4>
            <div class="db-tablewrap">
              <table class="table">
                <thead>
                <tr>
                  <th>Einfluss</th>
                  <th>Stufe</th>
                  <th>Hinweis</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(a, i) in h.anathema" :key="i">
                  <td>{{ influenceName(a.influenceKey) }}</td>
                  <td>{{ levelName(a.level) }}</td>
                  <td>{{ a.note || "-" }}</td>
                </tr>
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </section>

      <section>
        <h2 :ref="setRef('db-arts')">Die Blutkünste</h2>
        <p>Fünfzehn Künste teilen sich in Paare aus Kunst und Gegenkunst, die Kunst des Blutes steht als Urkunst allein. Jede Kunst folgt einem Prinzip und reicht über fünf Stufen der Tiefe.</p>

        <section v-for="a in arts" :key="a.key">
          <h3 :ref="setRef('db-art-' + a.key)">{{ a.name }}</h3>
          <span class="db-muted"><i>{{ a.principle }}</i></span>

          <div class="db-row">
            <DbArtSymbol class="db-lex-symbol" :art="a" size="9rem" />
            <span>{{ a.summary }}</span>
          </div>

          <p><b>Kurzname</b>: {{ a.shortName }}</p>
          <p v-if="a.isPrimal"><b>Urkunst</b>: ohne Gegenkunst, erzeugt Instabilität</p>
          <p v-else-if="counterName(a)">
            <b>Gegenkunst</b>:
            <a
              class="db-link"
              :data-agent="`db:lexicon:art:${a.counterKey}`"
              @click="goToParagraph('db-art-' + a.counterKey)"
            >{{ counterName(a) }}</a>
          </p>
          <p v-if="a.typicalAttributes.length > 0"><b>Typische Attribute</b>: {{ attributeNames(a) }}</p>

          <section>
            <h4 :ref="setRef('db-art-' + a.key + '-levels')">Stufen</h4>
            <div class="db-tablewrap">
              <table class="table">
                <thead>
                <tr>
                  <th>Tiefe</th>
                  <th>Stufe</th>
                  <th>Beispiele</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="l in a.levels" :key="l.depth">
                  <td>{{ l.depth }}</td>
                  <td>{{ depthName(l.depth) }}</td>
                  <td>{{ l.examples.join(", ") }}</td>
                </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section v-if="a.limits.length > 0">
            <h4>Grenzen</h4>
            <ul>
              <li v-for="(limit, i) in a.limits" :key="i">{{ limit }}</li>
            </ul>
          </section>

          <section>
            <h4 :ref="setRef('db-art-' + a.key + '-forms')">Gefestigte Formen</h4>
            <div class="db-tablewrap">
              <table class="table">
                <thead>
                <tr>
                  <th>Form</th>
                  <th>Stufe</th>
                  <th>Schwierigkeit</th>
                  <th>Cruor</th>
                  <th>Wirkung</th>
                  <th>Grenzen</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="f in sortedForms(a)" :key="f.key">
                  <td>{{ f.name }}</td>
                  <td>{{ f.level }}</td>
                  <td>{{ f.difficulty }}</td>
                  <td>{{ f.cost }}</td>
                  <td>{{ f.effect }}</td>
                  <td>{{ f.limits || "-" }}</td>
                </tr>
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </section>

      <section v-if="boundaryGroups.length > 0">
        <h2 :ref="setRef('db-art-boundaries')">Wo sich zwei Künste berühren</h2>
        <p>Zwei Künste können dasselbe Ergebnis erzeugen und bleiben doch verschieden, weil das Prinzip dahinter ein anderes ist.</p>

        <div v-for="group in boundaryGroups" :key="group.key" class="db-tablewrap">
          <table class="table">
            <thead>
            <tr>
              <th>Situation</th>
              <th>{{ group.titleA }}</th>
              <th>{{ group.titleB }}</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(row, i) in group.rows" :key="i">
              <td>{{ row.situation }}</td>
              <td>{{ row.textA }}</td>
              <td>{{ row.textB }}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section v-if="firsts.length > 0">
        <h2 :ref="setRef('db-firsts')">Die Neun Ersten</h2>
        <p>Neun Menschen versuchten gemeinsam, den Tod zu überwinden. Sie starben, und neun von ihnen standen wieder auf. Sie sind der Ursprung jeder Blutlinie, aber keine Vorlage für einen Charakter.</p>

        <section v-for="f in firsts" :key="f.key">
          <h3 :ref="setRef('db-first-' + f.key)">{{ f.name }}</h3>
          <span class="db-muted"><i>{{ f.title }}</i></span>

          <p v-if="f.houseKey">
            <b>Haus</b>:
            <a class="toc-link" @click="goToParagraph('db-house-' + f.houseKey)">{{ houseName(f.houseKey) }}</a>
          </p>
          <p><b>Aufgabe</b>: {{ f.role }}</p>
          <p><b>Antrieb</b>: {{ f.motivation }}</p>
          <p><b>Späteres Ideal</b>: {{ f.ideal }}</p>
          <p>{{ f.description }}</p>
          <p v-if="f.afterAwakening"><b>Nach dem Erwachen</b>: {{ f.afterAwakening }}</p>
          <p v-if="f.humans"><b>Menschen</b>: {{ f.humans }}</p>
          <p v-if="f.scions"><b>Scions</b>: {{ f.scions }}</p>
          <p v-if="f.cruorTrait"><b>Eigenheit des Cruor</b>: {{ f.cruorTrait }}</p>
          <p v-if="f.urScar"><b>Ur-Scar</b>: {{ f.urScar }}</p>
          <p v-if="f.fate"><b>Schicksal</b>: {{ f.fate }}<span v-if="f.fateDetail">. {{ f.fateDetail }}</span></p>
          <blockquote v-if="f.question">{{ f.question }}</blockquote>
        </section>
      </section>

      <section v-if="courtTypes.length > 0 || courtStructures.length > 0">
        <h2 :ref="setRef('db-courts')">Courts, Mandate und Ämter</h2>
        <p>Ein Court ist die anerkannte politische Ordnung der Vesperi in einem Gebiet. Wie er regiert wird, unterscheidet sich von Stadt zu Stadt.</p>

        <section v-if="courtTypes.length > 0">
          <h3 :ref="setRef('db-court-types')">Court-Typen</h3>
          <div v-for="t in courtTypes" :key="t.key">
            <p><b>{{ t.name }}</b>: {{ t.description }}</p>
          </div>
        </section>

        <section v-if="courtMandates.length > 0">
          <h3 :ref="setRef('db-court-mandates')">Mandate</h3>
          <p>Das Mandate beschreibt, warum ein Regent herrschen darf.</p>
          <div v-for="m in courtMandates" :key="m.key">
            <p><b>{{ m.name }}</b>: {{ m.description }}</p>
          </div>
        </section>

        <section v-if="courtStructures.length > 0">
          <h3 :ref="setRef('db-court-structures')">Einrichtungen eines Courts</h3>
          <div v-for="st in courtStructures" :key="st.key">
            <p><b>{{ st.name }}</b>: {{ st.description }}</p>
          </div>
        </section>
      </section>

      <section v-if="covenant && covenant.articles.length > 0">
        <h2 :ref="setRef('db-covenant')">{{ covenant.title }}</h2>
        <span class="db-muted"><i>{{ covenant.subtitle }}</i></span>
        <LexiconMarkdown v-if="covenant.preamble" :source="covenant.preamble" />

        <section v-for="a in covenant.articles" :key="a.key">
          <h3 :ref="setRef('db-covenant-' + a.key)">{{ a.name }}: {{ a.title }}</h3>
          <LexiconMarkdown :source="a.body" />
        </section>

        <section v-if="covenant.oath">
          <h3 :ref="setRef('db-covenant-oath')">Der Schwur der Nacht</h3>
          <LexiconMarkdown :source="covenant.oath" />
        </section>
      </section>

      <section>
        <h2 :ref="setRef('db-anathema-levels')">Anathema-Stufen</h2>
        <p>Jeder Einfluss wirkt auf einer dieser Stufen. Körperliche Einflüsse verletzen, symbolische halten oder zehren.</p>
        <div class="db-tablewrap">
          <table class="table">
            <thead>
            <tr>
              <th>Stufe</th>
              <th>Körperlich</th>
              <th>Symbolisch</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="l in anathemaLevels" :key="l.level">
              <td>{{ l.name }}</td>
              <td>{{ l.physical }}</td>
              <td>{{ l.symbolic }}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </template>
</template>

<style scoped lang="scss">
.db-muted {
  color: #ababab;
}

.db-row {
  margin-top: 0.75rem;
  overflow: auto;
}

.db-lex-symbol {
  float: left;
  margin-right: 1rem;
  margin-bottom: 1rem;
  filter: var(--image-to-primary-color-filter);
  -webkit-user-drag: none;
}

.db-tablewrap {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin: 1rem 0;
}

.db-link {
  cursor: pointer;
  text-decoration: none;
  &:hover {
    color: var(--primary-color-light);
  }
  &:active {
    color: var(--primary-color);
  }
}

.db-toc-state {
  padding: 1rem 0 1rem 1.5rem;
  color: var(--text-3);
}

.db-loading-text {
  color: var(--text-2);
  font-family: Cinzel, serif;
  letter-spacing: 0.02em;
}
</style>
