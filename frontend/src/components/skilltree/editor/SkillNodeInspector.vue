<script setup lang="ts">
import {computed} from "vue"
import {
  DependencyKind,
  DependencyStyle,
  type ISkillNode,
  type ISkillTree,
  ModifierOperator,
  ModifierTargetType,
  ParentGate,
  SkillConstraintType,
} from "@/@types/skilltree"
import {AttributeKeys, getAttributeName, getSkillName, SkillKeys} from "@/@types/models"
import ImageUpload from "@/components/skilltree/editor/ImageUpload.vue"

const props = defineProps<{
  tree: ISkillTree
  node: ISkillNode
}>()

const emit = defineEmits<{
  (e: "delete"): void
}>()

const attributeOptions = Object.values(AttributeKeys).map(k => ({value: k as string, name: getAttributeName(k)}))
const skillOptions = Object.values(SkillKeys).map(k => ({value: k as string, name: getSkillName(k)}))
const charValueOptions = [
  {value: "humanity", name: "Menschlichkeit"},
  {value: "hunger", name: "Hunger"},
  {value: "bloodPotency", name: "Blutmacht"},
  {value: "health", name: "Gesundheit"},
  {value: "willpower", name: "Willenskraft"},
  {value: "stains", name: "Makel"},
  {value: "generation", name: "Generation"},
]

const targetOptions = [
  {value: ModifierTargetType.Attribute, name: "Attribut"},
  {value: ModifierTargetType.Skill, name: "Fähigkeit"},
  {value: ModifierTargetType.CharacterValue, name: "Charakterwert"},
  {value: ModifierTargetType.Advantage, name: "Vorteil"},
  {value: ModifierTargetType.Disadvantage, name: "Nachteil"},
]

const operatorOptions = [
  {value: ModifierOperator.Add, name: "Addieren"},
  {value: ModifierOperator.Subtract, name: "Subtrahieren"},
  {value: ModifierOperator.Multiply, name: "Multiplizieren"},
  {value: ModifierOperator.Divide, name: "Dividieren"},
  {value: ModifierOperator.Set, name: "Setzen"},
  {value: ModifierOperator.Lock, name: "Sperren"},
  {value: ModifierOperator.Min, name: "Minimum"},
  {value: ModifierOperator.Max, name: "Maximum"},
]

const styleOptions = [
  {value: DependencyStyle.Square, name: "Eckig"},
  {value: DependencyStyle.Diagonal, name: "Diagonal"},
  {value: DependencyStyle.Bezier, name: "Kurvig"},
]
const kindOptions = [
  {value: DependencyKind.Parent, name: "Eltern (Voraussetzung)"},
  {value: DependencyKind.Cosmetic, name: "Kosmetisch"},
]

const gateOptions = [
  {value: ParentGate.And, name: "UND – alle Eltern nötig"},
  {value: ParentGate.Or, name: "ODER – mindestens ein Elternteil"},
  {value: ParentGate.Xor, name: "XOR – genau ein Elternteil"},
]

const parentGate = computed<ParentGate>({
  get: () => props.node.parentGate ?? ParentGate.And,
  set: (v) => { props.node.parentGate = v },
})

const hasParentDeps = computed(() =>
  (props.node.dependencies ?? []).some(d => d.kind === DependencyKind.Parent),
)

const constraintTypeOptions = [
  {value: SkillConstraintType.MinCharacterValue, name: "Mindest-Charakterwert"},
  {value: SkillConstraintType.RequiresSkill, name: "Benötigt Skill"},
  {value: SkillConstraintType.ExcludesSkill, name: "Schließt Skill aus"},
  {value: SkillConstraintType.ExclusiveGroup, name: "Exklusive Gruppe"},
]

/** Andere Knoten des Trees (für Abhängigkeiten/Constraints). */
const otherNodes = computed(() =>
  props.tree.nodes
    .filter(n => n.id !== props.node.id)
    .map(n => ({value: n.id, name: n.name || "(unbenannt)"})),
)

function keyOptionsForTarget(target: ModifierTargetType) {
  if (target === ModifierTargetType.Attribute) return attributeOptions
  if (target === ModifierTargetType.Skill) return skillOptions
  if (target === ModifierTargetType.CharacterValue) return charValueOptions
  return null // Advantage/Disadvantage -> Freitext
}

function addModifier() {
  props.node.modifiers.push({
    target: ModifierTargetType.Attribute,
    key: AttributeKeys.Strength,
    operator: ModifierOperator.Add,
    value: 1,
  })
}

function removeModifier(i: number) {
  props.node.modifiers.splice(i, 1)
}

function onTargetChange(i: number) {
  const mod = props.node.modifiers[i]!
  const opts = keyOptionsForTarget(mod.target)
  mod.key = opts ? opts[0]!.value : ""
}

function addDependency() {
  const first = otherNodes.value[0]
  props.node.dependencies.push({
    fromSkillId: first ? first.value : "",
    style: DependencyStyle.Square,
    kind: DependencyKind.Parent,
  })
}

function removeDependency(i: number) {
  props.node.dependencies.splice(i, 1)
}

function addConstraint() {
  props.node.constraints.push({
    type: SkillConstraintType.MinCharacterValue,
    data: {key: AttributeKeys.Strength, value: 1},
  })
}

function removeConstraint(i: number) {
  props.node.constraints.splice(i, 1)
}

function onConstraintTypeChange(i: number) {
  const c = props.node.constraints[i]!
  switch (c.type) {
    case SkillConstraintType.MinCharacterValue:
      c.data = {key: AttributeKeys.Strength, value: 1}
      break
    case SkillConstraintType.RequiresSkill:
    case SkillConstraintType.ExcludesSkill:
      c.data = {skillId: otherNodes.value[0]?.value ?? ""}
      break
    case SkillConstraintType.ExclusiveGroup:
      c.data = {groupId: ""}
      break
  }
}
</script>

<template>
  <div class="inspector">
    <div class="inspector-head">
      <b>Skill bearbeiten</b>
      <button type="button" class="iconbtn danger" title="Skill löschen" @click="emit('delete')">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>

    <label class="field">
      <span>Name</span>
      <input type="text" class="form-control" v-model="node.name" placeholder="Skill-Name"/>
    </label>

    <label class="field">
      <span>Beschreibung</span>
      <textarea class="form-control" rows="3" v-model="node.description" placeholder="Beschreibung"></textarea>
    </label>

    <div class="field">
      <span>Icon</span>
      <ImageUpload v-model="node.icon" rounded label="Icon hochladen"/>
    </div>

    <label class="field">
      <span>Kosten</span>
      <input type="number" min="0" class="form-control" v-model.number="node.cost"/>
    </label>

    <label class="field">
      <span>Sub-Tree Bonus Code (optional)</span>
      <input type="text" class="form-control" v-model="node.subTreeBonusCode" placeholder="Bonus Code eines anderen Trees"/>
    </label>

    <!-- Modifikatoren -->
    <div class="section">
      <div class="section-head">
        <span>Modifikatoren</span>
        <button type="button" class="iconbtn" @click="addModifier"><i class="fa-solid fa-plus"></i></button>
      </div>

      <div v-for="(mod, i) in node.modifiers" :key="`m${i}`" class="row-card">
        <div class="row-grid">
          <select class="form-control" v-model="mod.target" @change="onTargetChange(i)">
            <option v-for="o in targetOptions" :key="o.value" :value="o.value">{{ o.name }}</option>
          </select>

          <select v-if="keyOptionsForTarget(mod.target)" class="form-control" v-model="mod.key">
            <option v-for="o in keyOptionsForTarget(mod.target)!" :key="o.value" :value="o.value">{{ o.name }}</option>
          </select>
          <input v-else type="text" class="form-control" v-model="mod.key" placeholder="Schlüssel"/>

          <select class="form-control" v-model="mod.operator">
            <option v-for="o in operatorOptions" :key="o.value" :value="o.value">{{ o.name }}</option>
          </select>

          <input type="number" class="form-control" v-model.number="mod.value"/>
        </div>
        <button type="button" class="iconbtn danger small" @click="removeModifier(i)"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div v-if="node.modifiers.length === 0" class="empty-hint">Keine Modifikatoren.</div>
    </div>

    <!-- Abhängigkeiten -->
    <div class="section">
      <div class="section-head">
        <span>Abhängigkeiten (Linien)</span>
        <button type="button" class="iconbtn" :disabled="otherNodes.length === 0" @click="addDependency">
          <i class="fa-solid fa-plus"></i>
        </button>
      </div>

      <label v-if="hasParentDeps" class="field gate-field">
        <span>Eltern-Logik</span>
        <select class="form-control" v-model="parentGate">
          <option v-for="o in gateOptions" :key="o.value" :value="o.value">{{ o.name }}</option>
        </select>
      </label>

      <div v-for="(dep, i) in node.dependencies" :key="`d${i}`" class="row-card">
        <div class="row-grid">
          <select class="form-control" v-model="dep.fromSkillId">
            <option v-for="o in otherNodes" :key="o.value" :value="o.value">{{ o.name }}</option>
          </select>
          <select class="form-control" v-model="dep.style">
            <option v-for="o in styleOptions" :key="o.value" :value="o.value">{{ o.name }}</option>
          </select>
          <select class="form-control" v-model="dep.kind">
            <option v-for="o in kindOptions" :key="o.value" :value="o.value">{{ o.name }}</option>
          </select>
        </div>
        <button type="button" class="iconbtn danger small" @click="removeDependency(i)"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div v-if="node.dependencies.length === 0" class="empty-hint">Keine Abhängigkeiten.</div>
    </div>

    <!-- Einschränkungen -->
    <div class="section">
      <div class="section-head">
        <span>Einschränkungen</span>
        <button type="button" class="iconbtn" @click="addConstraint"><i class="fa-solid fa-plus"></i></button>
      </div>

      <div v-for="(c, i) in node.constraints" :key="`co${i}`" class="row-card">
        <div class="row-grid">
          <select class="form-control" v-model="c.type" @change="onConstraintTypeChange(i)">
            <option v-for="o in constraintTypeOptions" :key="o.value" :value="o.value">{{ o.name }}</option>
          </select>

          <template v-if="c.type === SkillConstraintType.MinCharacterValue">
            <select class="form-control" v-model="c.data.key">
              <optgroup label="Attribute">
                <option v-for="o in attributeOptions" :key="o.value" :value="o.value">{{ o.name }}</option>
              </optgroup>
              <optgroup label="Fähigkeiten">
                <option v-for="o in skillOptions" :key="o.value" :value="o.value">{{ o.name }}</option>
              </optgroup>
              <optgroup label="Werte">
                <option v-for="o in charValueOptions" :key="o.value" :value="o.value">{{ o.name }}</option>
              </optgroup>
            </select>
            <input type="number" class="form-control" v-model.number="c.data.value"/>
          </template>

          <select
            v-else-if="c.type === SkillConstraintType.RequiresSkill || c.type === SkillConstraintType.ExcludesSkill"
            class="form-control"
            v-model="c.data.skillId"
          >
            <option v-for="o in otherNodes" :key="o.value" :value="o.value">{{ o.name }}</option>
          </select>

          <input
            v-else-if="c.type === SkillConstraintType.ExclusiveGroup"
            type="text"
            class="form-control"
            v-model="c.data.groupId"
            placeholder="Gruppen-ID"
          />
        </div>
        <button type="button" class="iconbtn danger small" @click="removeConstraint(i)"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div v-if="node.constraints.length === 0" class="empty-hint">Keine Einschränkungen.</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.inspector {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4);
}

.inspector-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1.05rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);

  > span {
    font-size: 0.8rem;
    color: var(--text-2);
  }
}

.icon-row {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}

.section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  border-top: 1px solid color-mix(in srgb, var(--accent) 14%, rgba(255, 255, 255, 0.06));
  padding-top: var(--space-3);
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--text-2);
}

.row-card {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-1);
  padding: var(--space-2);
}

.row-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(7rem, 1fr));
  gap: var(--space-2);
  min-width: 0;
}

.iconbtn.danger {
  color: color-mix(in srgb, #ff5a5a 80%, #ffffff);
}

.iconbtn.small {
  min-width: 2.2rem;
  min-height: 2.2rem;
  width: 2.2rem;
  height: 2.2rem;
}

.empty-hint {
  font-size: 0.78rem;
  color: var(--text-3);
  font-style: italic;
}
</style>
