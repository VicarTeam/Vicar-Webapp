<script setup lang="ts">
import {computed, ref} from "vue"
import Modal from "@/components/modal/Modal.vue"
import type {ICharacter} from "@/@types/models"
import {
  type ICharacterSkillTreeState,
  type ISkillNode,
  SkillTreeResourceType,
} from "@/@types/skilltree"
import {skillTreeConstraintResolver} from "@/libs/resolvers/skilltree-constraint-resolver"
import {formatModifier} from "@/libs/skilltree-format"
import {resolveAssetUrl} from "@/libs/io/cdn"
import CharacterStorage from "@/libs/io/character-storage"
import SkillTreeStorage from "@/libs/io/skilltree-storage"

const emit = defineEmits<{
  (e: "unlocked", nodeId: string): void
}>()

const show = ref(false)
const char = ref<ICharacter | null>(null)
const state = ref<ICharacterSkillTreeState | null>(null)
const node = ref<ISkillNode | null>(null)

const isUnlocked = computed(() =>
  !!state.value && !!node.value && state.value.unlockedSkillIds.includes(node.value.id),
)

const check = computed(() => {
  if (!char.value || !state.value || !node.value) return {ok: false, reasons: []}
  return skillTreeConstraintResolver.canUnlock(char.value, state.value, node.value)
})

const resourceLabel = computed(() =>
  state.value ? skillTreeConstraintResolver.resourceLabel(state.value) : "",
)

function showModal(c: ICharacter, s: ICharacterSkillTreeState, n: ISkillNode) {
  char.value = c
  state.value = s
  node.value = n
  show.value = true
}

async function embedSubTree(c: ICharacter, code: string) {
  const result = await SkillTreeStorage.redeemByCode(code)
  if (result.status !== "ok") return
  c.skillTrees = c.skillTrees ?? []
  if (c.skillTrees.some(t => t.treeId === result.tree.id)) return
  c.skillTrees.push({
    treeId: result.tree.id,
    treeSnapshot: result.tree,
    unlockedSkillIds: [],
    customResource: 0,
  })
}

async function unlock() {
  const c = char.value
  const s = state.value
  const n = node.value
  if (!c || !s || !n) return
  if (!check.value.ok) return

  const tree = s.treeSnapshot
  if (tree.resourceType === SkillTreeResourceType.Experience) {
    c.exp = (c.exp ?? 0) - n.cost
    c.usedExp = (c.usedExp ?? 0) + n.cost
  } else if (tree.resourceType === SkillTreeResourceType.Custom) {
    s.customResource = (s.customResource ?? 0) - n.cost
  }
  // BonusCode-Ressource: keine Abbuchung, nur Voraussetzung.

  s.unlockedSkillIds.push(n.id)

  // Sub-Tree-Portal: referenzierten Baum einlösen und einbetten.
  if (n.subTreeBonusCode && n.subTreeBonusCode.trim().length > 0) {
    await embedSubTree(c, n.subTreeBonusCode.trim())
  }

  CharacterStorage.saveCharacter(c)

  emit("unlocked", n.id)
  show.value = false
}

defineExpose({showModal})
</script>

<template>
  <Modal :shown="show" @close="show = false">
    <div v-if="node" class="unlock-modal">
      <div class="head">
        <div class="node-icon">
          <img v-if="node.icon && !node.icon.includes('fa-')" :src="resolveAssetUrl(node.icon)" alt=""/>
          <i v-else class="fa-solid" :class="node.icon && node.icon.includes('fa-') ? node.icon : 'fa-star'"></i>
        </div>
        <div>
          <b class="title">{{ node.name }}</b>
          <div class="cost">
            Kosten: <b>{{ node.cost }}</b> {{ resourceLabel }}
          </div>
        </div>
      </div>

      <p v-if="node.description" class="desc">{{ node.description }}</p>

      <div v-if="node.modifiers.length > 0" class="mods">
        <span class="section-label">Effekte</span>
        <ul>
          <li v-for="(mod, i) in node.modifiers" :key="i">{{ formatModifier(mod) }}</li>
        </ul>
      </div>

      <div v-if="node.subTreeBonusCode" class="subtree-note">
        <i class="fa-solid fa-diagram-project"></i> Schaltet einen weiteren Skill-Baum frei.
      </div>

      <div v-if="isUnlocked" class="status ok">
        <i class="fa-solid fa-circle-check"></i> Bereits freigeschaltet
      </div>

      <template v-else>
        <ul v-if="check.reasons.length > 0" class="reasons">
          <li v-for="(r, i) in check.reasons" :key="i">
            <i class="fa-solid fa-lock"></i> {{ r }}
          </li>
        </ul>

        <button class="btn btn-primary unlock-btn" :disabled="!check.ok" @click="unlock">
          Freischalten
        </button>
      </template>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.unlock-modal {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.head {
  display: flex;
  align-items: center;
  gap: var(--space-4);

  .node-icon {
    font-size: 1.8rem;
    color: color-mix(in srgb, var(--accent) 80%, #ffffff);

    img {
      width: 2.6rem;
      height: 2.6rem;
      object-fit: contain;
      border-radius: var(--radius-1);
    }
  }

  .title {
    font-family: var(--font-display);
    font-size: 1.2rem;
  }

  .cost {
    color: var(--text-2);
    font-size: 0.9rem;
  }
}

.desc {
  color: var(--text-2);
  margin: 0;
}

.section-label {
  font-size: 0.8rem;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.mods ul,
.reasons {
  margin: var(--space-2) 0 0;
  padding-left: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.mods li {
  color: var(--text-1);
}

.reasons {
  list-style: none;
  padding-left: 0;

  li {
    color: color-mix(in srgb, #ff8a8a 80%, var(--text-2));
    font-size: 0.88rem;
  }
}

.status.ok {
  color: color-mix(in srgb, var(--accent) 60%, #ffffff);
}

.subtree-note {
  font-size: 0.85rem;
  color: color-mix(in srgb, var(--accent) 55%, var(--text-1));
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.unlock-btn {
  align-self: flex-start;
}
</style>
