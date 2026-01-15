<script setup lang="ts">
import { computed, ref } from "vue"
import Modal from "@/components/modal/Modal.vue"
import type { ICharacter } from "@/@types/models.ts"
import type { ILevelChange } from "@/@types/gameline.ts"
import { levelChangeTypeLabel } from "@/@types/gameline.ts"

const char = ref<ICharacter | null>(null)
const show = ref(false)

function showModal(c: ICharacter) {
  char.value = c
  show.value = true
}

const entries = computed<ILevelChange[]>(() => {
  if (!char.value) return []
  return [...(char.value.levelHistory || [])].reverse()
})

defineExpose({ showModal })
</script>

<template>
  <Modal :shown="show" @close="show = false">
    <div v-if="char && show" class="history">
      <b>{{ char.name }}'s Level-Verlauf:</b>

      <div class="table-wrap">
        <table class="table">
          <thead>
          <tr>
            <th scope="col">Datum</th>
            <th scope="col">Art der Änderung</th>
            <th scope="col">Beschreibung</th>
            <th scope="col">XP-Kosten</th>
          </tr>
          </thead>

          <tbody v-if="entries.length > 0">
          <tr v-for="(entry, index) in entries" :key="index">
            <td>{{ new Date(entry.date).toLocaleString() }}</td>
            <td>{{ levelChangeTypeLabel(entry.type) }}</td>
            <td>{{ entry.text }}</td>
            <td>{{ entry.exp.before }} &#8594; {{ entry.exp.after }} (-{{ entry.exp.used }})</td>
          </tr>
          </tbody>

          <tbody v-else>
          <tr>
            <td colspan="4" class="empty">Keine Level-Änderungen vorhanden.</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.history {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.table-wrap {
  width: 100%;
  max-height: 50vh;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}

.empty {
  text-align: center;
}
</style>
