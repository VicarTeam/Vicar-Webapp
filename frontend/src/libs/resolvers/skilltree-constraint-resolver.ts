import type {ICharacter} from "@/@types/models";
import {
  DependencyKind,
  type ICharacterSkillTreeState,
  type ISkillNode,
  ParentGate,
  SkillConstraintType,
  SkillTreeResourceType,
} from "@/@types/skilltree";
import {skillTreeResolver} from "@/libs/resolvers/skilltree-resolver";
import {getAttributeName} from "@/@types/models";

/**
 * Wertet Abhängigkeiten und Einschränkungen für das Freischalten von Skills aus.
 * Spiegelt das Registry-Muster aus `restriction-resolver.ts`, arbeitet aber auf
 * dem Tree-Snapshot eines eingelösten Skill Trees.
 */

export interface UnlockCheck {
  ok: boolean;
  /** Menschlich lesbare Gründe, warum (noch) nicht freischaltbar. */
  reasons: string[];
}

class SkillTreeConstraintResolver {

  private nodeName(state: ICharacterSkillTreeState, skillId: string): string {
    const node = state.treeSnapshot?.nodes.find(n => n.id === skillId);
    return node?.name || "ein anderer Skill";
  }

  private isUnlocked(state: ICharacterSkillTreeState, skillId: string): boolean {
    return state.unlockedSkillIds.includes(skillId);
  }

  /** Verfügbare Ressource im jeweiligen Resource-Typ des Trees. */
  public availableResource(char: ICharacter, state: ICharacterSkillTreeState): number {
    const tree = state.treeSnapshot;
    switch (tree?.resourceType) {
      case SkillTreeResourceType.Experience:
        return char.exp ?? 0;
      case SkillTreeResourceType.Custom:
        return state.customResource ?? 0;
      case SkillTreeResourceType.BonusCode:
        return tree.resourceBonusCode && (char.activeBonusCodes ?? []).includes(tree.resourceBonusCode)
          ? Number.POSITIVE_INFINITY
          : 0;
      default:
        return 0;
    }
  }

  public resourceLabel(state: ICharacterSkillTreeState): string {
    const tree = state.treeSnapshot;
    switch (tree?.resourceType) {
      case SkillTreeResourceType.Experience:
        return "Erfahrung";
      case SkillTreeResourceType.Custom:
        return tree.resourceName || "Ressource";
      case SkillTreeResourceType.BonusCode:
        return "Bonus Code";
      default:
        return "Ressource";
    }
  }

  /**
   * Prüft, ob ein Skill aktuell freigeschaltet werden kann.
   * Berücksichtigt Ressourcen, Eltern-Abhängigkeiten und alle Einschränkungen.
   */
  public canUnlock(char: ICharacter, state: ICharacterSkillTreeState, node: ISkillNode): UnlockCheck {
    const reasons: string[] = [];

    if (this.isUnlocked(state, node.id)) {
      return {ok: false, reasons: ["Bereits freigeschaltet"]};
    }

    if (this.isBlocked(char, state, node)) {
      reasons.push("Durch einen ausschließenden Skill blockiert");
    }

    const available = this.availableResource(char, state);
    if (available < node.cost) {
      reasons.push(`Nicht genug ${this.resourceLabel(state)} (${node.cost} benötigt)`);
    }

    const parentDeps = (node.dependencies ?? []).filter(d => d.kind === DependencyKind.Parent);
    if (parentDeps.length > 0) {
      const gate = node.parentGate ?? ParentGate.And;
      const unlockedCount = parentDeps.filter(d => this.isUnlocked(state, d.fromSkillId)).length;
      const names = parentDeps.map(d => this.nodeName(state, d.fromSkillId)).join(", ");

      if (gate === ParentGate.Or) {
        if (unlockedCount < 1) {
          reasons.push(`Mindestens einer von: ${names}`);
        }
      } else if (gate === ParentGate.Xor) {
        if (unlockedCount !== 1) {
          reasons.push(`Genau einer von: ${names}`);
        }
      } else {
        // AND: alle Eltern nötig
        for (const dep of parentDeps) {
          if (!this.isUnlocked(state, dep.fromSkillId)) {
            reasons.push(`Voraussetzung: ${this.nodeName(state, dep.fromSkillId)}`);
          }
        }
      }
    }

    for (const c of node.constraints ?? []) {
      switch (c.type) {
        case SkillConstraintType.MinCharacterValue: {
          const effective = skillTreeResolver.getEffectiveValueByKey(char, c.data?.key);
          if (effective < (c.data?.value ?? 0)) {
            reasons.push(`${this.valueLabel(c.data?.key)} muss mindestens ${c.data?.value} betragen`);
          }
          break;
        }
        case SkillConstraintType.RequiresSkill: {
          if (!this.isUnlocked(state, c.data?.skillId)) {
            reasons.push(`Benötigt: ${this.nodeName(state, c.data?.skillId)}`);
          }
          break;
        }
        case SkillConstraintType.ExcludesSkill: {
          if (this.isUnlocked(state, c.data?.skillId)) {
            reasons.push(`Schließt sich mit ${this.nodeName(state, c.data?.skillId)} aus`);
          }
          break;
        }
        case SkillConstraintType.ExclusiveGroup:
          // Wird über isBlocked() (oben) abgedeckt.
          break;
      }
    }

    return {ok: reasons.length === 0, reasons};
  }

  /**
   * Prüft, ob die reinen Freischalt-Voraussetzungen eines Skills (Eltern-
   * Abhängigkeiten + `RequiresSkill`-Einschränkungen) durch die gegebene Menge
   * freigeschalteter IDs erfüllt sind. Ressourcen und Ausschlüsse werden bewusst
   * ignoriert – dient dem Kaskaden-Rückbau im vollen Editiermodus (welche bereits
   * freigeschalteten Skills verlieren ihre Grundlage, wenn ein Skill entfernt wird?).
   */
  public dependenciesMet(state: ICharacterSkillTreeState, node: ISkillNode, unlockedIds: Set<string>): boolean {
    const nodeIds = new Set((state.treeSnapshot?.nodes ?? []).map(n => n.id));

    const parentDeps = (node.dependencies ?? [])
      .filter(d => d.kind === DependencyKind.Parent && nodeIds.has(d.fromSkillId));
    if (parentDeps.length > 0) {
      const gate = node.parentGate ?? ParentGate.And;
      const unlockedCount = parentDeps.filter(d => unlockedIds.has(d.fromSkillId)).length;

      if (gate === ParentGate.Or) {
        if (unlockedCount < 1) return false;
      } else if (gate === ParentGate.Xor) {
        if (unlockedCount !== 1) return false;
      } else if (unlockedCount !== parentDeps.length) {
        return false;
      }
    }

    for (const c of node.constraints ?? []) {
      if (c.type === SkillConstraintType.RequiresSkill) {
        const reqId = c.data?.skillId;
        // Nur Voraussetzungen berücksichtigen, die auf einen existierenden Skill zeigen.
        if (reqId && nodeIds.has(reqId) && !unlockedIds.has(reqId)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Ob ein Skill durch eine bereits getroffene Wahl ausgeschlossen ist
   * (gegenseitiger Ausschluss oder bereits vergebene exklusive Gruppe).
   * Für visuelles Verblassen gedacht.
   */
  public isBlocked(char: ICharacter, state: ICharacterSkillTreeState, node: ISkillNode): boolean {
    if (this.isUnlocked(state, node.id)) {
      return false;
    }

    // Gegenseitiger Ausschluss: ein freigeschalteter Skill schließt diesen aus.
    for (const c of node.constraints ?? []) {
      if (c.type === SkillConstraintType.ExcludesSkill && this.isUnlocked(state, c.data?.skillId)) {
        return true;
      }
    }

    // Symmetrie: ein anderer freigeschalteter Skill listet diesen als ausgeschlossen.
    for (const other of state.treeSnapshot?.nodes ?? []) {
      if (!this.isUnlocked(state, other.id)) continue;
      if ((other.constraints ?? []).some(c =>
        c.type === SkillConstraintType.ExcludesSkill && c.data?.skillId === node.id)) {
        return true;
      }
    }

    // Exklusive Gruppen: ist bereits ein anderer Skill derselben Gruppe gewählt?
    const myGroups = (node.constraints ?? [])
      .filter(c => c.type === SkillConstraintType.ExclusiveGroup)
      .map(c => c.data?.groupId)
      .filter(Boolean);

    if (myGroups.length > 0) {
      for (const other of state.treeSnapshot?.nodes ?? []) {
        if (other.id === node.id || !this.isUnlocked(state, other.id)) continue;
        const otherGroups = (other.constraints ?? [])
          .filter(c => c.type === SkillConstraintType.ExclusiveGroup)
          .map(c => c.data?.groupId);
        if (otherGroups.some(g => myGroups.includes(g))) {
          return true;
        }
      }
    }

    return false;
  }

  private valueLabel(key: string): string {
    const attr = getAttributeName(key);
    if (attr !== key) return attr;
    switch (key) {
      case "humanity": return "Menschlichkeit";
      case "hunger": return "Hunger";
      case "bloodPotency": return "Blutmacht";
      case "willpower": return "Willenskraft";
      case "health": return "Gesundheit";
      default: return key;
    }
  }
}

export const skillTreeConstraintResolver = new SkillTreeConstraintResolver();
