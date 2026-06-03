import type {ICharacter} from "@/@types/models";
import {
  type ICharacterSkillTreeState,
  type ISkillModifier,
  type ISkillNode,
  ModifierOperator,
  ModifierTargetType,
} from "@/@types/skilltree";

/**
 * Nicht-destruktive Modifier-Schicht für Custom Skill Trees.
 *
 * Die Basiswerte des Charakters (`categories[].attributes[].value` etc.) bleiben
 * unangetastet. Effektive Werte werden hier aus Basis + den Modifikatoren aller
 * freigeschalteten Skills berechnet. Da der Resolver auf den reaktiven
 * `editingCharacter` zugreift, rechnen `computed`-Properties in den Views
 * automatisch neu, sobald sich `unlockedSkillIds` ändern.
 */

export interface ResolvedValue {
  value: number;
  /** true, wenn ein Lock-Modifikator den Wert fixiert (UI sollte +/- sperren). */
  locked: boolean;
  /** true, wenn überhaupt ein Modifikator gewirkt hat. */
  modified: boolean;
}

export interface ActiveModifierEntry {
  treeId: string;
  treeName: string;
  node: ISkillNode;
  modifier: ISkillModifier;
}

/** Top-Level-Charakterfelder, die als CharacterValue-Ziel zulässig sind. */
const CHARACTER_VALUE_FIELDS: (keyof ICharacter)[] = [
  "hunger", "humanity", "stains", "bloodPotency", "health", "willpower", "exp", "generation",
];

class SkillTreeResolver {

  /** Liefert alle eingelösten Tree-Zustände eines Charakters. */
  private states(char: ICharacter): ICharacterSkillTreeState[] {
    return char.skillTrees ?? [];
  }

  /** Sammelt alle Modifikatoren freigeschalteter Skills, die auf (target, key) zielen. */
  private collect(char: ICharacter, target: ModifierTargetType, key: string): ISkillModifier[] {
    const result: ISkillModifier[] = [];
    for (const state of this.states(char)) {
      const nodes = state.treeSnapshot?.nodes ?? [];
      for (const node of nodes) {
        if (!state.unlockedSkillIds.includes(node.id)) continue;
        for (const mod of node.modifiers ?? []) {
          if (mod.target === target && mod.key === key) {
            result.push(mod);
          }
        }
      }
    }
    return result;
  }

  /**
   * Wendet eine Liste von Modifikatoren auf einen Basiswert an.
   * Feste Reihenfolge: Add/Sub → Mul/Div → Set (letztes) → Lock (letztes) → Min/Max-Clamp.
   */
  private apply(base: number, mods: ISkillModifier[]): ResolvedValue {
    if (mods.length === 0) {
      return {value: base, locked: false, modified: false};
    }

    let value = base;

    for (const m of mods) {
      if (m.operator === ModifierOperator.Add) value += m.value;
      else if (m.operator === ModifierOperator.Subtract) value -= m.value;
    }
    for (const m of mods) {
      if (m.operator === ModifierOperator.Multiply) value *= m.value;
      else if (m.operator === ModifierOperator.Divide && m.value !== 0) value /= m.value;
    }

    const sets = mods.filter(m => m.operator === ModifierOperator.Set);
    if (sets.length > 0) {
      value = sets[sets.length - 1]!.value;
    }

    let locked = false;
    const locks = mods.filter(m => m.operator === ModifierOperator.Lock);
    if (locks.length > 0) {
      value = locks[locks.length - 1]!.value;
      locked = true;
    }

    for (const m of mods) {
      if (m.operator === ModifierOperator.Min) value = Math.max(value, m.value);
      else if (m.operator === ModifierOperator.Max) value = Math.min(value, m.value);
    }

    return {value, locked, modified: true};
  }

  /** Effektiver Wert für ein beliebiges Modifikator-Ziel. */
  public resolve(char: ICharacter, target: ModifierTargetType, key: string, base: number): ResolvedValue {
    return this.apply(base, this.collect(char, target, key));
  }

  // --- Basiswert-Lookups -----------------------------------------------------

  public findAttributeBase(char: ICharacter, key: string): number | undefined {
    for (const cat of char.categories ?? []) {
      const attr = cat.attributes.find(a => a.key === key);
      if (attr) return attr.value;
    }
    return undefined;
  }

  public findSkillBase(char: ICharacter, key: string): number | undefined {
    for (const cat of char.categories ?? []) {
      const skill = cat.skills.find(s => s.key === key);
      if (skill) return skill.value;
    }
    return undefined;
  }

  // --- Komfort-Getter --------------------------------------------------------

  public getEffectiveAttribute(char: ICharacter, key: string): ResolvedValue {
    return this.resolve(char, ModifierTargetType.Attribute, key, this.findAttributeBase(char, key) ?? 0);
  }

  public getEffectiveSkill(char: ICharacter, key: string): ResolvedValue {
    return this.resolve(char, ModifierTargetType.Skill, key, this.findSkillBase(char, key) ?? 0);
  }

  public getEffectiveCharacterValue(char: ICharacter, field: keyof ICharacter, base: number): ResolvedValue {
    return this.resolve(char, ModifierTargetType.CharacterValue, field as string, base);
  }

  /**
   * Effektiver Wert anhand eines generischen Schlüssels – erkennt automatisch,
   * ob es sich um ein Attribut, eine Fähigkeit oder ein Top-Level-Feld handelt.
   * Genutzt von der Einschränkungs-Auswertung (MinCharacterValue).
   */
  public getEffectiveValueByKey(char: ICharacter, key: string): number {
    const attrBase = this.findAttributeBase(char, key);
    if (attrBase !== undefined) {
      return this.resolve(char, ModifierTargetType.Attribute, key, attrBase).value;
    }

    const skillBase = this.findSkillBase(char, key);
    if (skillBase !== undefined) {
      return this.resolve(char, ModifierTargetType.Skill, key, skillBase).value;
    }

    if (CHARACTER_VALUE_FIELDS.includes(key as keyof ICharacter)) {
      const base = Number((char as any)[key] ?? 0);
      return this.resolve(char, ModifierTargetType.CharacterValue, key, base).value;
    }

    return 0;
  }

  public isLocked(char: ICharacter, target: ModifierTargetType, key: string): boolean {
    return this.collect(char, target, key).some(m => m.operator === ModifierOperator.Lock);
  }

  /**
   * Flache Liste aller aktiven Modifikatoren (für die "aufgereihte" Skill-Übersicht
   * im Viewer-Tab).
   */
  public getActiveModifiers(char: ICharacter): ActiveModifierEntry[] {
    const result: ActiveModifierEntry[] = [];
    for (const state of this.states(char)) {
      const tree = state.treeSnapshot;
      if (!tree) continue;
      for (const node of tree.nodes ?? []) {
        if (!state.unlockedSkillIds.includes(node.id)) continue;
        for (const mod of node.modifiers ?? []) {
          result.push({treeId: tree.id, treeName: tree.name, node, modifier: mod});
        }
      }
    }
    return result;
  }
}

export const skillTreeResolver = new SkillTreeResolver();
