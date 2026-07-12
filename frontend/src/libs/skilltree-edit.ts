import type {ICharacter} from "@/@types/models";
import {
  type ICharacterSkillTreeState,
  type ISkillNode,
  SkillTreeResourceType,
} from "@/@types/skilltree";
import {skillTreeConstraintResolver} from "@/libs/resolvers/skilltree-constraint-resolver";
import SkillTreeStorage from "@/libs/io/skilltree-storage";

/**
 * Editier- und Sync-Operationen für die pro-Charakter gespeicherten Skill Trees.
 *
 * Diese Funktionen laufen nur im vollen Editiermodus (`character.fullCustomization`)
 * bzw. beim manuellen Synchronisieren und mutieren den reaktiven `editingCharacter`
 * direkt. Das Speichern übernimmt der Aufrufer (z. B. via `CharacterStorage`).
 */

export interface RevertCascade {
  /** Alle zu entfernenden Skill-IDs inkl. des angeklickten (in Reihenfolge der Freischaltung). */
  removeIds: string[];
  /** Zusätzlich betroffene Kinder (ohne den angeklickten Skill) – für die Warnung. */
  cascaded: ISkillNode[];
  /** Summe der Ressourcen, die beim Rückbau erstattet werden. */
  refund: number;
}

/**
 * Bestimmt, welche freigeschalteten Skills entfernt werden müssen, wenn `seedId`
 * rückgängig gemacht wird. Ein Kind-Skill verliert seine Grundlage, sobald seine
 * Eltern-Abhängigkeiten (unter Berücksichtigung von AND/OR/XOR) oder eine
 * `RequiresSkill`-Voraussetzung nicht mehr erfüllt sind. Die Auswertung läuft
 * transitiv, bis sich nichts mehr ändert.
 */
export function collectRevertCascade(state: ICharacterSkillTreeState, seedId: string): RevertCascade {
  const nodes = state.treeSnapshot?.nodes ?? [];
  const nodeById = new Map(nodes.map(n => [n.id, n]));

  const removed = new Set<string>([seedId]);

  let changed = true;
  while (changed) {
    changed = false;
    // Verbleibende freigeschaltete Skills nach bisher entfernten.
    const remaining = new Set(state.unlockedSkillIds.filter(id => !removed.has(id)));

    for (const id of state.unlockedSkillIds) {
      if (removed.has(id)) continue;
      const node = nodeById.get(id);
      if (!node) continue; // Verwaiste ID (nicht mehr im Baum) – nicht kaskadieren.
      if (!skillTreeConstraintResolver.dependenciesMet(state, node, remaining)) {
        removed.add(id);
        changed = true;
      }
    }
  }

  // Reihenfolge der ursprünglichen Freischaltung beibehalten.
  const removeIds = state.unlockedSkillIds.filter(id => removed.has(id));
  const cascaded = removeIds
    .filter(id => id !== seedId)
    .map(id => nodeById.get(id))
    .filter((n): n is ISkillNode => !!n);

  const refund = removeIds.reduce((sum, id) => sum + (nodeById.get(id)?.cost ?? 0), 0);

  return {removeIds, cascaded, refund};
}

/**
 * Erstattet die Ressourcen für eine Menge zu entfernender Skills anhand des
 * Ressourcen-Typs des Trees. Bei Bonus-Code-Bäumen wurde nichts abgebucht.
 */
function refundResources(char: ICharacter, state: ICharacterSkillTreeState, refund: number) {
  if (refund <= 0) return;
  switch (state.treeSnapshot?.resourceType) {
    case SkillTreeResourceType.Experience:
      char.exp = (char.exp ?? 0) + refund;
      char.usedExp = Math.max(0, (char.usedExp ?? 0) - refund);
      break;
    case SkillTreeResourceType.Custom:
      state.customResource = (state.customResource ?? 0) + refund;
      break;
    default:
      break;
  }
}

/**
 * Macht eine Freischaltung (und alle davon abhängigen Kinder) rückgängig und
 * erstattet die aufgewendeten Ressourcen. Der Aufrufer muss vorher via
 * {@link collectRevertCascade} die betroffenen Skills ermittelt (und ggf. eine
 * Warnung gezeigt) haben.
 */
export function revertSkills(char: ICharacter, state: ICharacterSkillTreeState, cascade: RevertCascade) {
  if (cascade.removeIds.length === 0) return;

  const removeSet = new Set(cascade.removeIds);
  state.unlockedSkillIds = state.unlockedSkillIds.filter(id => !removeSet.has(id));

  refundResources(char, state, cascade.refund);
}

export interface TreeSyncResult {
  status: "ok" | "up_to_date" | "not_found" | "error";
  /** Freigeschaltete Skills, die es in der neuen Version nicht mehr gibt (wurden entfernt/erstattet). */
  removedSkills: ISkillNode[];
  fromVersion: number;
  toVersion: number;
}

/**
 * Synchronisiert den Charakter-Snapshot eines eingelösten Skill Trees mit der
 * aktuellen GM-Version (Best-Effort-Migration).
 *
 * Vorgehen:
 * - Neuesten Baum per Bonus Code aus dem Snapshot nachladen.
 * - Snapshot durch die neue Version ersetzen.
 * - Freigeschaltete Skills anhand ihrer (stabilen) IDs übernehmen; Skills, die es
 *   nicht mehr gibt, werden entfernt und – falls möglich – erstattet.
 * - Bestehende Builds bleiben so weit wie möglich erhalten; geänderte
 *   Abhängigkeiten brechen keine bereits verdienten Skills auf.
 */
export async function syncCharacterTree(
  char: ICharacter,
  state: ICharacterSkillTreeState,
): Promise<TreeSyncResult> {
  const fromVersion = state.treeSnapshot?.version ?? 0;
  const code = state.treeSnapshot?.bonusCode?.trim();

  if (!code) {
    return {status: "error", removedSkills: [], fromVersion, toVersion: fromVersion};
  }

  const result = await SkillTreeStorage.redeemByCode(code);
  if (result.status === "not_found") {
    return {status: "not_found", removedSkills: [], fromVersion, toVersion: fromVersion};
  }
  if (result.status !== "ok") {
    return {status: "error", removedSkills: [], fromVersion, toVersion: fromVersion};
  }

  const latest = result.tree;
  const toVersion = latest.version ?? 0;

  const newIds = new Set((latest.nodes ?? []).map(n => n.id));
  const oldNodeById = new Map((state.treeSnapshot?.nodes ?? []).map(n => [n.id, n]));

  // Freigeschaltete Skills, die im neuen Baum fehlen -> entfernen + erstatten
  // (anhand des ALTEN Snapshots, da Kosten/Ressourcen-Typ sich geändert haben könnten).
  const vanishedIds = state.unlockedSkillIds.filter(id => !newIds.has(id));
  const removedSkills = vanishedIds
    .map(id => oldNodeById.get(id))
    .filter((n): n is ISkillNode => !!n);

  const refund = removedSkills.reduce((sum, n) => sum + (n.cost ?? 0), 0);
  refundResources(char, state, refund);

  // Snapshot ersetzen, gültige Freischaltungen (per ID) behalten.
  state.unlockedSkillIds = state.unlockedSkillIds.filter(id => newIds.has(id));
  state.treeSnapshot = latest;

  if (toVersion === fromVersion && removedSkills.length === 0) {
    return {status: "up_to_date", removedSkills: [], fromVersion, toVersion};
  }

  return {status: "ok", removedSkills, fromVersion, toVersion};
}
