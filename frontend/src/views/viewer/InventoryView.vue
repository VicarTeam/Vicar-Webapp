<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useStore } from "@/app/store"
import type { ICharacter, IGroupItems, IItem, IItemStack } from "@/@types/models"
import CharacterStorage from "@/libs/io/character-storage"
import IconButton from "@/components/IconButton.vue"
import TipButton from "@/components/editor/TipButton.vue"
import DataManager from "@/libs/data/data-manager"
import Modal from "@/components/modal/Modal.vue"
import Bullet from "@/components/Bullet.vue"

const store = useStore()

const editingCharacter = computed(() => store.editingCharacter as ICharacter | undefined)

const bank = ref("")
const cash = ref("")

const addingItemToInventory = ref<"carriedItems" | "ownedItems" | null>(null)

const addingItemCustomName = ref("")
const addingItemCustomDescription = ref("")
const addingItemCustomAmount = ref("")

const addingItemPredefinedCategory = ref<IGroupItems | null>(null)
const addingItemPredefinedItem = ref<IItem | null>(null)
const addingItemPredefinedAmount = ref("")

const editingCustomItem = ref<IItemStack | null>(null)

const showTransferModal = ref(false)
const transferDirection = ref<"bank" | "cash">("bank")
const transferAmount = ref(1)

const showAmountZeroWarning = ref(false)
const amountZeroItemName = ref("")
const amountZeroRemoveCallback = ref<(() => void) | null>(null)

onMounted(() => {
  const c = editingCharacter.value
  if (!c) return

  if (!c.inventory) {
    c.inventory = { bank: 0, cash: 0, carriedItems: [], ownedItems: [] }
    CharacterStorage.saveCharacter(c)
  }

  bank.value = String(c.inventory.bank)
  cash.value = String(c.inventory.cash)

  addingItemPredefinedCategory.value = DataManager.selectedLanguage.items?.[0] ?? null
})

function beginAddingItemTo(inventory: "carriedItems" | "ownedItems") {
  addingItemCustomName.value = ""
  addingItemCustomDescription.value = ""
  addingItemCustomAmount.value = ""

  addingItemPredefinedCategory.value = DataManager.selectedLanguage.items?.[0] ?? null
  addingItemPredefinedItem.value = null
  addingItemPredefinedAmount.value = ""

  addingItemToInventory.value = inventory
  editingCustomItem.value = null
}

function convertAmount(amountStr: string): number {
  if (amountStr.trim().length <= 0) return 1
  const amount = parseInt(amountStr, 10)
  return Number.isFinite(amount) && amount >= 1 ? amount : 1
}

function sortInventory(invKey: "carriedItems" | "ownedItems") {
  const c = editingCharacter.value
  if (!c) return

  c.inventory[invKey].sort((a, b) => {
    if (a.item.category < b.item.category) return -1
    if (a.item.category > b.item.category) return 1
    if (a.item.name < b.item.name) return -1
    if (a.item.name > b.item.name) return 1
    return 0
  })

  CharacterStorage.saveCharacter(c, true)
}

function resolveMoneyEval(key: "bank" | "cash", allowNegative = false) {
  const c = editingCharacter.value
  if (!c) return

  const current = key === "bank" ? bank.value : cash.value
  let rawValue = current.replace(/[^0-9.,+-]/g, "").replace(/,/g, ".")

  try {
    const result = Number(Function(`"use strict"; return (${rawValue})`)())
    if (!Number.isFinite(result)) throw new Error("not finite")

    if (result < 0 && !allowNegative) {
      if (key === "bank") bank.value = String(c.inventory.bank)
      else cash.value = String(c.inventory.cash)
      return
    }

    if (key === "bank") bank.value = String(result)
    else cash.value = String(result)

    c.inventory[key] = result
    CharacterStorage.saveCharacter(c, true)
  } catch {
    if (key === "bank") bank.value = String(c.inventory.bank)
    else cash.value = String(c.inventory.cash)
  }
}

const canAddPredefined = computed(() => !!addingItemPredefinedCategory.value && !!addingItemPredefinedItem.value)

const canAddCustom = computed(() => {
  return addingItemCustomName.value.trim().length > 0 && addingItemCustomDescription.value.trim().length > 0
})

function addPredefinedItem() {
  const c = editingCharacter.value
  if (!c) return
  if (!addingItemToInventory.value) return
  if (!canAddPredefined.value) return

  const item = addingItemPredefinedItem.value!
  const amount = convertAmount(addingItemPredefinedAmount.value)

  c.inventory[addingItemToInventory.value].push({ item, amount })
  sortInventory(addingItemToInventory.value)
  CharacterStorage.saveCharacter(c, true)

  addingItemPredefinedCategory.value = DataManager.selectedLanguage.items?.[0] ?? null
  addingItemPredefinedItem.value = null
  addingItemPredefinedAmount.value = ""
}

function addCustomItem() {
  const c = editingCharacter.value
  if (!c) return
  if (!addingItemToInventory.value) return
  if (!canAddCustom.value) return

  const amount = convertAmount(addingItemCustomAmount.value)

  if (!editingCustomItem.value) {
    c.inventory[addingItemToInventory.value].push({
      item: {
        isCustom: true,
        name: addingItemCustomName.value,
        description: addingItemCustomDescription.value,
        category: "Eigene Einträge",
      } as any,
      amount,
    })
  } else {
    editingCustomItem.value.item.name = addingItemCustomName.value
    editingCustomItem.value.item.description = addingItemCustomDescription.value
    editingCustomItem.value.amount = amount
  }

  sortInventory(addingItemToInventory.value)
  CharacterStorage.saveCharacter(c, true)

  addingItemCustomName.value = ""
  addingItemCustomDescription.value = ""
  addingItemCustomAmount.value = ""

  if (editingCustomItem.value) {
    editingCustomItem.value = null
    addingItemToInventory.value = null
  }
}

function editCustomItem(item: IItemStack) {
  const c = editingCharacter.value
  if (!c) return

  editingCustomItem.value = item
  addingItemCustomName.value = item.item.name
  addingItemCustomDescription.value = item.item.description
  addingItemCustomAmount.value = String(item.amount)

  addingItemToInventory.value = c.inventory.carriedItems.includes(item) ? "carriedItems" : "ownedItems"
}

function transferTo(from: "bank" | "cash") {
  transferDirection.value = from
  transferAmount.value = 1
  showTransferModal.value = true
}

const canTransfer = computed(() => {
  const c = editingCharacter.value
  if (!c) return false
  return transferAmount.value > 0 && c.inventory[transferDirection.value] >= transferAmount.value
})

function resolveTransfer() {
  const c = editingCharacter.value
  if (!c) return
  if (!canTransfer.value) return

  c.inventory[transferDirection.value] -= transferAmount.value
  c.inventory[transferDirection.value === "bank" ? "cash" : "bank"] += transferAmount.value

  bank.value = String(c.inventory.bank)
  cash.value = String(c.inventory.cash)

  CharacterStorage.saveCharacter(c, true)
  showTransferModal.value = false
}

function transferItem(item: IItemStack, idx: number, current: "ownedItems" | "carriedItems") {
  const c = editingCharacter.value
  if (!c) return

  c.inventory[current].splice(idx, 1)
  c.inventory[current === "ownedItems" ? "carriedItems" : "ownedItems"].push(item)

  sortInventory("ownedItems")
  sortInventory("carriedItems")
  CharacterStorage.saveCharacter(c, true)
}

function cloneItem(item: IItemStack, current: "ownedItems" | "carriedItems") {
  const c = editingCharacter.value
  if (!c) return

  c.inventory[current].push({ item: { ...item.item }, amount: item.amount })
  CharacterStorage.saveCharacter(c, true)
}

function handleItemAmountChange(item: IItemStack, idx: number, current: "ownedItems" | "carriedItems") {
  const c = editingCharacter.value
  if (!c) return

  if (item.amount >= 1) {
    CharacterStorage.saveCharacter(c, true)
    return
  }

  amountZeroRemoveCallback.value = () => {
    c.inventory[current].splice(idx, 1)
    CharacterStorage.saveCharacter(c, true)
    amountZeroRemoveCallback.value = null
    showAmountZeroWarning.value = false
  }

  amountZeroItemName.value = item.item.name
  showAmountZeroWarning.value = true
}

const itemsData = computed(() => DataManager.selectedLanguage.items ?? [])
</script>

<template>
  <div v-if="editingCharacter" class="inventory-view">
    <div class="money-management">
      <div class="money-holder">
        <div class="inventory-fit">
          <b>Mitgeführt</b>
          <IconButton style="width: 2rem; height: 2rem" icon="fa-plus" @click="beginAddingItemTo('carriedItems')" />
        </div>

        <span>Bargeld</span>
        <input class="form-control" type="text" v-model="cash" @keydown.enter="resolveMoneyEval('cash')" @focusout="resolveMoneyEval('cash')" />
        <IconButton style="width: 3rem; height: 3rem; margin-left: 1rem" icon="fa-arrow-left" @click="transferTo('bank')" />
      </div>

      <div class="money-holder">
        <IconButton style="width: 3rem; height: 3rem; margin-right: 1rem" icon="fa-arrow-right" @click="transferTo('cash')" />
        <input class="form-control" type="text" v-model="bank" @keydown.enter="resolveMoneyEval('bank', true)" @focusout="resolveMoneyEval('bank', true)" />
        <span>Bank</span>

        <div class="inventory-fit">
          <b>Besitz</b>
          <IconButton style="width: 2rem; height: 2rem" icon="fa-plus" @click="beginAddingItemTo('ownedItems')" />
        </div>
      </div>
    </div>

    <div class="inventories">
      <div class="inventory">
        <div v-for="(i, j) in editingCharacter.inventory.carriedItems" :key="j" class="item">
          <span class="item-name">{{ i.item.name }}</span>
          <Bullet />
          <small class="item-cat"><b>Kategorie: </b>{{ i.item.category }}</small>
          <Bullet />
          <TipButton :content="i.item.description" />

          <div class="item-actions">
            <input class="form-control item-amount-edit" type="number" placeholder="Anzahl" :step="1" :min="0" v-model.number="i.amount" @input="handleItemAmountChange(i, j, 'carriedItems')" />
            <IconButton v-if="i.item.isCustom" icon="fa-edit" style="width: 2rem; height: 2rem; font-size: 1rem" @click="editCustomItem(i)" />
            <IconButton v-else icon="fa-copy" style="width: 2rem; height: 2rem; font-size: 1rem; opacity: 0" />
            <IconButton icon="fa-copy" style="width: 2rem; height: 2rem; font-size: 1rem" @click="cloneItem(i, 'carriedItems')" />
            <IconButton icon="fa-arrow-right" style="width: 2rem; height: 2rem; font-size: 1rem" @click="transferItem(i, j, 'carriedItems')" />
          </div>
        </div>
      </div>

      <div class="inventory-border" />

      <div class="inventory">
        <div v-for="(i, j) in editingCharacter.inventory.ownedItems" :key="j" class="item">
          <span class="item-name">{{ i.item.name }}</span>
          <Bullet />
          <small class="item-cat"><b>Kategorie: </b>{{ i.item.category }}</small>
          <Bullet />
          <TipButton :content="i.item.description" />

          <div class="item-actions">
            <input class="form-control item-amount-edit" type="number" placeholder="Anzahl" :step="1" :min="0" v-model.number="i.amount" @input="handleItemAmountChange(i, j, 'ownedItems')" />
            <IconButton v-if="i.item.isCustom" icon="fa-edit" style="width: 2rem; height: 2rem; font-size: 1rem" @click="editCustomItem(i)" />
            <IconButton v-else icon="fa-copy" style="width: 2rem; height: 2rem; font-size: 1rem; opacity: 0" />
            <IconButton icon="fa-copy" style="width: 2rem; height: 2rem; font-size: 1rem" @click="cloneItem(i, 'ownedItems')" />
            <IconButton icon="fa-arrow-left" style="width: 2rem; height: 2rem; font-size: 1rem" @click="transferItem(i, j, 'ownedItems')" />
          </div>
        </div>
      </div>
    </div>

    <div class="add-item-wrapper" v-show="addingItemToInventory">
      <div class="add-item-box">
        <b class="add-headline">
          {{ !editingCustomItem ? "Item hinzufügen" : "Item bearbeiten" }}
          <span style="opacity: 0.85"> ({{ addingItemToInventory === "ownedItems" ? "Besitz" : "Mitgeführt" }})</span>
          <IconButton class="add-close" icon="fa-x" @click="addingItemToInventory = null" />
        </b>

        <div class="add-forms">
          <div v-if="!editingCustomItem" class="add-form">
            <div class="add-stack">
              <select class="form-control" v-model="addingItemPredefinedCategory">
                <option v-for="(g, idx) in itemsData" :key="idx" :value="g">
                  {{ g.category }}
                </option>
              </select>

              <select class="form-control" v-model="addingItemPredefinedItem" v-if="addingItemPredefinedCategory">
                <option :value="null" disabled style="opacity: 0.5; font-style: italic">– Bitte wählen –</option>
                <option v-for="(i, idx) in addingItemPredefinedCategory.items" :key="idx" :value="i">
                  {{ i.name }}
                </option>
              </select>

              <input class="form-control" type="number" placeholder="Anzahl" :min="1" :step="1" v-model="addingItemPredefinedAmount" />
            </div>

            <button class="btn btn-primary" :disabled="!canAddPredefined" @click="addPredefinedItem">Hinzufügen</button>
          </div>

          <div v-if="!editingCustomItem" class="addborder" />

          <div class="add-form">
            <div class="add-stack">
              <input class="form-control" type="text" placeholder="Name" v-model="addingItemCustomName" />
              <input class="form-control" type="text" placeholder="Beschreibung" v-model="addingItemCustomDescription" />
              <input class="form-control" type="number" placeholder="Anzahl" :min="1" :step="1" v-model="addingItemCustomAmount" />
            </div>

            <button class="btn btn-primary" :disabled="!canAddCustom" @click="addCustomItem">
              {{ !editingCustomItem ? "Eigenes Item hinzufügen" : "Speichern" }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <Modal :shown="showTransferModal" @close="showTransferModal = false">
      <div style="display: flex; flex-direction: column; gap: 1rem; width: 20rem">
        <b>{{ transferDirection === "bank" ? "Von Bank zu Bargeld" : "Von Bargeld zu Bank" }}:</b>
        <input class="form-control" type="number" placeholder="Anzahl" :min="1" v-model.number="transferAmount" />
        <small v-if="!canTransfer" style="color: red; opacity: 0.8"><i>Nicht genug Guthaben.</i></small>
        <button class="btn btn-primary" :disabled="!canTransfer" @click="resolveTransfer">Bestätigen</button>
      </div>
    </Modal>

    <Modal :shown="showAmountZeroWarning" @close="showAmountZeroWarning = false">
      <div style="display: flex; flex-direction: column; gap: 2rem; width: min(40rem, 90vw)">
        <span style="font-size: 1rem">
          Die Anzahl von <b>{{ amountZeroItemName }}</b> ist 0 oder kleiner. Entfernen?
        </span>
        <div style="display: flex; gap: 1rem; width: 100%; justify-content: flex-end">
          <button class="btn btn-dark" @click="showAmountZeroWarning = false">Behalten</button>
          <button class="btn btn-primary" @click="amountZeroRemoveCallback?.()">Entfernen</button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<style scoped lang="scss">
.inventory-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .money-management {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    width: 100%;
    padding: 1rem 0;
    border-bottom: 1px solid var(--primary-color);

    .money-holder {
      width: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;

      input {
        width: 10rem;
        text-align: center;
      }

      .inventory-fit {
        flex-grow: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.5rem;
      }
    }
  }

  .inventories {
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: stretch;
    gap: 1rem;
    width: 100%;
    padding: 1rem 0;

    .inventory-border {
      width: 1px;
      background-color: var(--primary-color);
    }

    .inventory {
      width: 100%;
      flex-grow: 1;
      display: flex;
      overflow-x: hidden;
      overflow-y: auto;
      padding: 1rem;
      flex-direction: column;
      gap: 0.5rem;

      .item {
        padding: 0 1rem;
        display: flex;
        align-items: center;
        font-size: 1.2rem;
        user-select: none;
        gap: 0.5rem;

        .item-actions {
          flex-grow: 1;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 1rem;

          .item-amount-edit {
            width: 6.5rem;
            text-align: center;
          }
        }
      }
    }
  }

  .add-item-wrapper {
    width: 100%;
    height: 20rem;
    display: flex;
    justify-content: center;
    align-items: center;

    .add-item-box {
      width: min(50%, 70rem);
      height: 100%;
      padding: 0.5rem;
      border-top-left-radius: 1rem;
      border-top-right-radius: 1rem;
      border: 1px solid var(--primary-color);
      border-bottom: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .add-headline {
      color: var(--primary-color);
      font-size: 1.5rem;
      width: 100%;
      text-align: center;
      position: relative;
    }

    .add-close {
      position: absolute;
      right: 0;
      top: 0;
      width: 2rem;
      height: 2rem;
      font-size: 1rem;
    }

    .add-forms {
      width: 100%;
      flex-grow: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.5rem;

      .addborder {
        width: 1px;
        height: 100%;
        background-color: var(--primary-color);
      }

      .add-form {
        width: 50%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 1rem;

        button {
          font-size: 1.1rem;
        }

        input,
        select {
          font-size: 1.1rem;
        }
      }

      .add-stack {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        flex-grow: 1;
        gap: 0.5rem;
      }
    }
  }
}

@media (max-width: 900px) {
  .inventory-view {
    .money-management {
      flex-direction: column;

      .money-holder {
        width: 100%;
        flex-wrap: wrap;

        input {
          width: min(12rem, 100%);
        }
      }
    }

    .inventories {
      flex-direction: column;

      .inventory-border {
        width: 100%;
        height: 1px;
      }
    }

    .add-item-wrapper {
      height: auto;

      .add-item-box {
        width: 100%;
        border-radius: 1rem;
        border-bottom: 1px solid var(--primary-color);
      }

      .add-forms {
        flex-direction: column;

        .addborder {
          width: 100%;
          height: 1px;
        }

        .add-form {
          width: 100%;
        }
      }
    }
  }
}
</style>
