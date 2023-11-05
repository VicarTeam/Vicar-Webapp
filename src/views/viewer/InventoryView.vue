<script lang="ts">
import {Vue, Component} from 'vue-property-decorator';
import {State} from "vuex-class";
import {ICharacter, IGroupItems, IItem, IItemStack} from "@/types/models";
import CharacterStorage from "@/libs/io/character-storage";
import IconButton from "@/components/IconButton.vue";
import TipButton from "@/components/editor/TipButton.vue";
import DataManager from "@/libs/data/data-manager";
import Modal from "@/components/modal/Modal.vue";
import {Container, Draggable} from "vue-dndrop";
import Character from "@/components/main/characters/Character.vue";
import Bullet from "@/components/Bullet.vue";

@Component({
  components: {Bullet, Character, Draggable, Container, Modal, TipButton, IconButton}
})
export default class InventoryView extends Vue {

  @State("editingCharacter")
  private editingCharacter!: ICharacter;

  private DataManager = DataManager;

  private bank: string = "";
  private cash: string = "";

  private addingItemToInventory: "carriedItems"| "ownedItems" | null = null;
  private addingItemCustomName: string = "";
  private addingItemCustomDescription: string = "";
  private addingItemCustomAmount: string = "";
  private addingItemPredefinedCategory: IGroupItems | null = null;
  private addingItemPredefinedItem: IItem | null = null;
  private addingItemPredefinedAmount: string = "";

  private showTransferModal: boolean = false;
  private transferDirection: "bank" | "cash" = "bank";
  private transferAmount: number = 1;

  private showAmountZeroWarning: boolean = false;
  private amountZeroItemName: string = "";
  private amountZeroRemoveCallback: (() => void) | null = null;

  mounted() {
    if (!this.editingCharacter.inventory) {
      this.editingCharacter.inventory = {
        bank: 0,
        cash: 0,
        carriedItems: [],
        ownedItems: [],
      };
      CharacterStorage.saveCharacter(this.editingCharacter);
    }

    this.bank = this.editingCharacter.inventory.bank.toString();
    this.cash = this.editingCharacter.inventory.cash.toString();

    this.addingItemPredefinedCategory = DataManager.selectedLanguage.items[0];
  }

  private beginAddingItemTo(inventory: "carriedItems" | "ownedItems") {
    this.addingItemCustomName = "";
    this.addingItemCustomDescription = "";
    this.addingItemCustomAmount = "";
    this.addingItemPredefinedCategory = DataManager.selectedLanguage.items[0];
    this.addingItemPredefinedItem = null;
    this.addingItemPredefinedAmount = "";
    this.addingItemToInventory = inventory;
  }

  private resolveMoneyEval(key: 'bank' | 'cash', allowNegative: boolean = false) {
    let rawValue = this[key];
    rawValue = rawValue.replace(/[^0-9.,+-]/g, '');
    rawValue = rawValue.replace(/,/g, '.');
    try {
      const result = eval(rawValue);
      if (result < 0 && !allowNegative) {
        this[key] = this.editingCharacter.inventory[key].toString();
        console.log("result is negative");
        return;
      }

      this[key] = result.toString();
      this.editingCharacter.inventory[key] = result;
      CharacterStorage.saveCharacter(this.editingCharacter);
    } catch (e) {
      this[key] = this.editingCharacter.inventory[key].toString();
      console.log("error while evaluating", e);
    }
  }

  private addPredefinedItem() {
    if (!this.addingItemToInventory) {
      return;
    }
    if (!this.canAddPredefined) {
      return;
    }

    const item = this.addingItemPredefinedItem!;
    const amount = this.convertAmount(this.addingItemPredefinedAmount);
    this.editingCharacter.inventory[this.addingItemToInventory].push({
      item,
      amount
    });
    this.sortInventory(this.addingItemToInventory);
    CharacterStorage.saveCharacter(this.editingCharacter);

    this.addingItemPredefinedCategory = DataManager.selectedLanguage.items[0];
    this.addingItemPredefinedItem = null;
    this.addingItemPredefinedAmount = "";
  }

  private addCustomItem() {
    if (!this.addingItemToInventory) {
      return;
    }
    if (!this.canAddCustom) {
      return;
    }

    const amount = this.convertAmount(this.addingItemCustomAmount);
    this.editingCharacter.inventory[this.addingItemToInventory].push({
      item: {
        isCustom: true,
        name: this.addingItemCustomName,
        description: this.addingItemCustomDescription,
        category: this.$t('character.inventory.custom').toString()
      },
      amount
    });
    this.sortInventory(this.addingItemToInventory);
    CharacterStorage.saveCharacter(this.editingCharacter);

    this.addingItemCustomName = "";
    this.addingItemCustomDescription = "";
    this.addingItemCustomAmount = "";
  }

  private transferTo(from: "bank" | "cash") {
    this.transferDirection = from;
    this.transferAmount = 1;
    this.showTransferModal = true;
  }

  private resolveTransfer() {
    if (!this.canTransfer) {
      return;
    }

    this.editingCharacter.inventory[this.transferDirection] -= this.transferAmount;
    this.editingCharacter.inventory[this.transferDirection === "bank" ? "cash" : "bank"] += this.transferAmount;
    this.bank = this.editingCharacter.inventory.bank.toString();
    this.cash = this.editingCharacter.inventory.cash.toString();
    CharacterStorage.saveCharacter(this.editingCharacter);
    this.showTransferModal = false;
  }

  private convertAmount(amountStr: string): number {
    if (amountStr.trim().length <= 0) {
      return 1;
    }

    const amount = parseInt(amountStr);
    if (isNaN(amount)) {
      return 1;
    }

    return amount;
  }

  private transferItem(item: IItemStack, idx: number, current: "ownedItems"|"carriedItems") {
    this.editingCharacter.inventory[current].splice(idx, 1);
    this.editingCharacter.inventory[current === "ownedItems" ? "carriedItems" : "ownedItems"].push(item);
    this.sortInventory("ownedItems");
    this.sortInventory("carriedItems");
    CharacterStorage.saveCharacter(this.editingCharacter);
  }

  private cloneItem(item: IItemStack, current: "ownedItems"|"carriedItems") {
    this.editingCharacter.inventory[current].push({
      item: {...item.item},
      amount: item.amount
    });
    CharacterStorage.saveCharacter(this.editingCharacter);
  }

  private handleItemAmountChange(item: IItemStack, idx: number, current: "ownedItems"|"carriedItems") {
    if (item.amount >= 1) {
      CharacterStorage.saveCharacter(this.editingCharacter);
      return;
    }

    this.amountZeroRemoveCallback = () => {
      this.editingCharacter.inventory[current].splice(idx, 1);
      CharacterStorage.saveCharacter(this.editingCharacter);

      this.amountZeroRemoveCallback = null;
      this.showAmountZeroWarning = false;
    };
    this.amountZeroItemName = item.item.name;
    this.showAmountZeroWarning = true;
  }

  private sortInventory(invKey: "carriedItems" | "ownedItems") {
    this.editingCharacter.inventory[invKey].sort((a, b) => {
      if (a.item.category < b.item.category) {
        return -1;
      }
      if (a.item.category > b.item.category) {
        return 1;
      }
      if (a.item.name < b.item.name) {
        return -1;
      }
      if (a.item.name > b.item.name) {
        return 1;
      }
      return 0;
    });
    CharacterStorage.saveCharacter(this.editingCharacter);
  }

  private get canAddPredefined() {
    return this.addingItemPredefinedCategory && this.addingItemPredefinedItem;
  }

  private get canAddCustom() {
    return this.addingItemCustomName.trim().length > 0 && this.addingItemCustomDescription.trim().length > 0;
  }

  private get canTransfer() {
    return this.transferAmount > 0 && this.editingCharacter.inventory[this.transferDirection] >= this.transferAmount;
  }
}
</script>

<template>
  <div class="inventory-view">
    <div class="money-management">
      <div class="money-holder">
        <div class="inventory-fit">
          <b>{{$t('character.inventory.carried')}}</b>
          <IconButton style="width: 2rem; height: 2rem" icon="fa-plus" @click="beginAddingItemTo('carriedItems')"/>
        </div>

        <span>{{$t('character.inventory.cash')}}</span>
        <input class="form-control" type="text" v-model="cash" :min="0" @keydown.enter="resolveMoneyEval('cash')" @focusout="resolveMoneyEval('cash')"/>
        <IconButton style="width: 3rem; height: 3rem; margin-left: 1rem" icon="fa-arrow-left" @click="transferTo('bank')"/>
      </div>
      <div class="money-holder">
        <IconButton style="width: 3rem; height: 3rem; margin-right: 1rem" icon="fa-arrow-right" @click="transferTo('cash')"/>
        <input class="form-control" type="text" v-model="bank" :min="0" @keydown.enter="resolveMoneyEval('bank', true)" @focusout="resolveMoneyEval('bank', true)"/>
        <span>{{$t('character.inventory.bank')}}</span>

        <div class="inventory-fit">
          <b>{{$t('character.inventory.owned')}}</b>
          <IconButton style="width: 2rem; height: 2rem" icon="fa-plus" @click="beginAddingItemTo('ownedItems')"/>
        </div>
      </div>
    </div>

    <div class="inventories">
      <div class="inventory">
        <div v-for="(i, j) in editingCharacter.inventory.carriedItems" :key="j" class="item">
          <span class="item-name">{{i.item.name}}</span>
          <bullet/>
          <small class="item-cat"><b>{{$t('character.inventory.category')}}: </b>{{i.item.category}}</small>
          <bullet/>
          <TipButton :content="i.item.description"/>

          <div class="item-actions">
            <input class="form-control item-amount-edit" type="number" :placeholder="$t('character.inventory.amount')" :step="1" :min="0" v-model.number="i.amount" @input="handleItemAmountChange(i, j, 'carriedItems')"/>
            <IconButton icon="fa-copy" style="width: 2rem; height: 2rem; font-size: 1rem" @click="cloneItem(i, 'carriedItems')"/>
            <IconButton icon="fa-arrow-right" style="width: 2rem; height: 2rem; font-size: 1rem" @click="transferItem(i, j, 'carriedItems')"/>
          </div>
        </div>
      </div>
      <div class="inventory-border"></div>
      <div class="inventory">
        <div v-for="(i, j) in editingCharacter.inventory.ownedItems" :key="j" class="item">
          <span class="item-name">{{i.item.name}}</span>
          <bullet/>
          <small class="item-cat"><b>{{$t('character.inventory.category')}}: </b>{{i.item.category}}</small>
          <bullet/>
          <TipButton :content="i.item.description"/>

          <div class="item-actions">
            <input class="form-control item-amount-edit" type="number" :placeholder="$t('character.inventory.amount')" :step="1" :min="0" v-model.number="i.amount" @input="handleItemAmountChange(i, j, 'ownedItems')"/>
            <IconButton icon="fa-copy" style="width: 2rem; height: 2rem; font-size: 1rem" @click="cloneItem(i, 'ownedItems')"/>
            <IconButton icon="fa-arrow-left" style="width: 2rem; height: 2rem; font-size: 1rem" @click="transferItem(i, j, 'ownedItems')"/>
          </div>
        </div>
      </div>
    </div>

    <div class="add-item-wrapper" v-show="addingItemToInventory">
      <div class="add-item-box">
        <b style="color: var(--primary-color); font-size: 1.5rem; width: 100%; text-align: center; position: relative">
          {{$t('character.inventory.add', {name: addingItemToInventory === 'ownedItems' ? $t('character.inventory.owned') : $t('character.inventory.carried')})}}
          <IconButton style="position: absolute; right: 0; top: 0; width: 2rem; height: 2rem; font-size: 1rem" icon="fa-x" @click="addingItemToInventory = null"/>
        </b>
        <div class="add-forms">
          <div class="add-form">
            <div style="display: flex; flex-direction: column; justify-content: space-around; flex-grow: 1">
              <select class="form-control" v-model="addingItemPredefinedCategory">
                <option v-for="(g, idx) in DataManager.selectedLanguage.items" :key="idx" :value="g">
                  {{g.category}}
                </option>
              </select>
              <select class="form-control" v-model="addingItemPredefinedItem" v-if="addingItemPredefinedCategory">
                <option :value="null" disabled style="opacity: 0.5; font-style: italic">{{$t('character.inventory.add.select')}}</option>
                <option v-for="(i, idx) in addingItemPredefinedCategory.items" :key="idx" :value="i">
                  {{i.name}}
                </option>
              </select>
              <input class="form-control" type="number" :placeholder="$t('character.inventory.transfer.amount')" :min="1" :step="1" v-model="addingItemPredefinedAmount"/>
            </div>

            <button class="btn btn-primary" :disabled="!canAddPredefined" @click="addPredefinedItem">{{$t('character.inventory.add.predefined')}}</button>
          </div>
          <div class="addborder"></div>
          <div class="add-form">
            <div style="display: flex; flex-direction: column; justify-content: space-around; flex-grow: 1">
              <input class="form-control" type="text" :placeholder="$t('character.inventory.add.custom.name')" v-model="addingItemCustomName"/>
              <input class="form-control" type="text" :placeholder="$t('character.inventory.add.custom.description')" v-model="addingItemCustomDescription"/>
              <input class="form-control" type="number" :placeholder="$t('character.inventory.amount')" :min="1" :step="1" v-model="addingItemCustomAmount"/>
            </div>

            <button class="btn btn-primary" :disabled="!canAddCustom" @click="addCustomItem">{{$t('character.inventory.add.custom')}}</button>
          </div>
        </div>
      </div>
    </div>

    <Modal :shown="showTransferModal" @close="showTransferModal = false">
      <div style="display: flex; flex-direction: column; gap: 1rem; width: 20rem">
        <b>{{$t(`character.inventory.transfer.${(transferDirection === 'bank' ? 'tocash' : 'tobank')}`)}}:</b>
        <input class="form-control" type="number" :placeholder="$t('character.inventory.amount')" :min="1" v-model.number="transferAmount"/>
        <small v-if="!canTransfer" style="color: red; opacity: 0.8"><i>{{$t('character.inventory.transfer.error', {name: $t(`character.inventory.${transferDirection}`)})}}</i></small>
        <button class="btn btn-primary" :disabled="!canTransfer" @click="resolveTransfer">{{$t('character.inventory.transfer.confirm')}}</button>
      </div>
    </Modal>
    <Modal :shown="showAmountZeroWarning" @close="showAmountZeroWarning = false">
      <div style="display: flex; flex-direction: column; gap: 2rem; width: 40rem">
        <span style="font-size: 1rem">{{$t('character.inventory.amount.change.zero', {name: amountZeroItemName})}}</span>
        <div style="display: flex; gap: 1rem; width: 100%; justify-content: flex-end">
          <button class="btn btn-dark" @click="showAmountZeroWarning = false">{{$t('character.inventory.amount.change.zero.keep')}}</button>
          <button class="btn btn-primary" @click="amountZeroRemoveCallback()">{{$t('character.inventory.amount.change.zero.delete')}}</button>
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
    flex-direction: row;
    gap: 1rem;
    width: 100%;
    padding-top: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--primary-color);
    .money-holder {
      width: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: row;
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
        flex-direction: row;
        gap: 0.5rem;
      }
    }
  }
  .inventories {
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    gap: 1rem;
    width: 100%;
    padding-top: 1rem;
    padding-bottom: 1rem;
    .inventory-border {
      width: 1px;
      height: 100%;
      background-color: var(--primary-color);
    }
    .inventory {
      width: 100%;
      min-height: 100%;
      height: 100%;
      flex-grow: 1;
      display: flex;
      overflow-x: hidden;
      overflow-y: auto;
      padding: 1rem;
      flex-direction: column;
      gap: 0.5rem;
      .item {
        padding-left: 1rem;
        padding-right: 1rem;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        flex-direction: row;
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
      width: 50%;
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
      .add-forms {
        width: 100%;
        flex-grow: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: row;
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
          .addtitle {
            font-size: 1.1rem;
            color: #fff;
            text-align: center;
            border-bottom: 1px solid var(--primary-color);
          }
          button {
            font-size: 1.1rem;
          }
          input, select {
            font-size: 1.1rem;
          }
        }
      }
    }
  }
}
</style>