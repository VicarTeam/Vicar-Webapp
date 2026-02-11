<script setup lang="ts">
import {useStore} from "@/app/store.ts";
import {computed, ref} from "vue";
import {AttributeKeys, DamageType, type ICharacter} from "@/@types/models.ts";
import IconButton from "@/components/IconButton.vue";
import CharacterStorage from "@/libs/io/character-storage.ts";
import ConfirmModal from "@/components/main/modals/ConfirmModal.vue";

const store = useStore()
const editingCharacter = computed(() => store.editingCharacter as ICharacter | undefined)

const menuVisible = ref(false)
const confirmModal = ref<{showConfirm: (t: string, next: (success: boolean) => void) => void}>()

const fortitudeLevel = computed(() => {
  if (!editingCharacter.value || !store.isVampire) return 0
  for (const d of (editingCharacter.value as any).disciplines ?? []) {
    if (d?.discipline?.id === 7) return Math.min(d.currentLevel ?? 0, 5)
  }
  return 0
})

const hasResilience = computed(() => {
  if (!editingCharacter.value || !store.isVampire) return false
  for (const d of (editingCharacter.value as any).disciplines ?? []) {
    if (d?.discipline?.id === 7) return (d.abilities ?? []).some((a: any) => a?.id === 1)
  }
  return false
})

async function restForSession() {
  if (!editingCharacter.value || !editingCharacter.value.willpowerDamage) return

  menuVisible.value = false

  let firstHeavyWillDmg = -1
  let willpowerHealValue = Math.max(0, getAttribute(AttributeKeys.Composure), getAttribute(AttributeKeys.Resolve))
  const damages = [...editingCharacter.value.willpowerDamage]
  if (willpowerHealValue > 0) {
    for (let i = editingCharacter.value.willpower - 1; i >= 0; i--) {
      const dmg = damages[i]?.toLowerCase()
      if (willpowerHealValue > 0 && dmg === DamageType.Superficial) {
        damages[i] = DamageType.None
        willpowerHealValue--
      }

      if ((dmg === DamageType.Heavy || dmg === DamageType.Full) && firstHeavyWillDmg === -1) {
        firstHeavyWillDmg = i
      }
    }
  }

  if (firstHeavyWillDmg !== -1) {
    const success = await showConfirmation("Bist du im Einklang mit deinen Ambition?");
    if (success) {
      damages[firstHeavyWillDmg] = DamageType.None
    }
  }

  editingCharacter.value.willpowerDamage = damages
  await CharacterStorage.saveCharacter(editingCharacter.value, false, true)
}

async function restForNight() {
  if (!editingCharacter.value || !editingCharacter.value.healthDamage) return

  menuVisible.value = false

  const maxHealth = editingCharacter.value.health + (hasResilience.value ? fortitudeLevel.value : 0)
  let firstHeavyHealthDmg = -1
  const damages = [...editingCharacter.value.healthDamage]
  for (let i = maxHealth - 1; i >= 0; i--) {
    const dmg = damages[i]?.toLowerCase()
    if (!dmg) continue

    if (dmg === DamageType.Superficial) {
      damages[i] = DamageType.None
    }

    if ((dmg === DamageType.Heavy || dmg === DamageType.Full) && firstHeavyHealthDmg === -1) {
      firstHeavyHealthDmg = i
    }
  }

  if (firstHeavyHealthDmg !== -1) {
    const success = await showConfirmation("Ein schweren Schaden heilen?");
    if (success) {
      damages[firstHeavyHealthDmg] = DamageType.None
    }
  }

  editingCharacter.value.healthDamage = damages
  await CharacterStorage.saveCharacter(editingCharacter.value, false, true)
}

function getAttribute(attr: AttributeKeys): number {
  if (!editingCharacter.value) return 0
  for (const cat of editingCharacter.value.categories) {
    const attrValue = cat.attributes.find(a => a.key === attr)?.value
    if (attrValue !== undefined) return attrValue
  }
  return 0
}

function showConfirmation(text: string): Promise<boolean> {
  return new Promise(resolve => {
    confirmModal?.value?.showConfirm(text, resolve)
  })
}

</script>

<template>
  <div v-if="editingCharacter" class="rest-button">
    <IconButton
      v-if="!editingCharacter.justViewing"
      icon="fa-moon"
      class="rest-button--icon"
      @click="menuVisible = !menuVisible"
    />

    <div v-if="menuVisible" class="rest-button--menu card" @mouseleave="menuVisible = false">
      <button class="button" @click="restForSession">Spielsitzung</button>
      <button class="button" @click="restForNight">Nacht</button>
    </div>

    <ConfirmModal ref="confirmModal"/>
  </div>
</template>

<style scoped lang="scss">
.rest-button {
  position: relative;
}

.rest-button--icon {
  width: 2rem;
  height: 2rem;
  font-size: 1.2rem;
}

.rest-button--menu {
  position: absolute;
  top: 100%;
  right: 0.5rem;
  margin-top: 0.25rem;
  box-shadow: none;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  &::before {
    content: unset !important;
  }
}
</style>