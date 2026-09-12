import {DarkborneData, type IDarkAnathemaLevel} from "@/libs/data/darkborne-data";
import {
  DbAnathemaSource,
  DbAnchorKind,
  DbAnchorState,
  DbAttribute,
  DbDamageKind,
  DbFormKind,
  DbHumanTrait,
  type IDbAnathema,
  type IDbSheet,
} from "@/@types/deathborne";

export const DB_MAX_HUNGER = 5;
export const DB_MAX_ANCHORS = 5;
export const DB_MAX_DEPTH = 5;
export const DB_MAX_HUMAN_TRAIT = 3;
export const DB_ESTABLISHED_FORM_MAX_LEVEL = 3;

export enum DbCruorState {
  Sated = 'sated',
  Cool = 'cool',
  Empty = 'empty',
  Hungry = 'hungry',
}

const CRUOR_STATE_NAME: Record<DbCruorState, string> = {
  [DbCruorState.Sated]: "Satt",
  [DbCruorState.Cool]: "Kühl",
  [DbCruorState.Empty]: "Leer",
  [DbCruorState.Hungry]: "Hungrig",
};

const CRUOR_STATE_HINT: Record<DbCruorState, string> = {
  [DbCruorState.Sated]: "Warm, mit Herzschlag. Als Mensch durchgehen ist Routine.",
  [DbCruorState.Cool]: "Kühl und blass. Ein Wurf nur, wenn jemand Verdacht schöpft.",
  [DbCruorState.Empty]: "Kalt, kaum Herzschlag. Als Mensch durchgehen nur mit Wurf.",
  [DbCruorState.Hungry]: "Menschen spüren instinktiv Gefahr. Blutwürfel, keine Routine.",
};

export function dbCruorMax(sheet: IDbSheet): number {
  return DarkborneData.bloodStrength(sheet.bloodStrength)?.reserve ?? 0;
}

export function dbUpkeep(sheet: IDbSheet): number {
  return DarkborneData.bloodStrength(sheet.bloodStrength)?.upkeep ?? 0;
}

export function dbMaxDepth(bloodStrength: number): number {
  return DarkborneData.bloodStrength(bloodStrength)?.maxDepth ?? 0;
}

export function dbFreeIncreases(bloodStrength: number): number {
  return DarkborneData.bloodStrength(bloodStrength)?.freeIncreases ?? 0;
}

export function dbCruorState(sheet: IDbSheet): DbCruorState {
  if (sheet.hunger > 0) {
    return DbCruorState.Hungry;
  }
  if (sheet.cruor <= 0) {
    return DbCruorState.Empty;
  }
  const max = dbCruorMax(sheet);
  return sheet.cruor * 2 >= max ? DbCruorState.Sated : DbCruorState.Cool;
}

export function dbCruorStateName(state: DbCruorState): string {
  return CRUOR_STATE_NAME[state];
}

export function dbCruorStateHint(state: DbCruorState): string {
  return CRUOR_STATE_HINT[state];
}

export function dbCruorValue(sheet: IDbSheet): number {
  return sheet.hunger > 0 ? -sheet.hunger : sheet.cruor;
}

export function dbSetCruorValue(sheet: IDbSheet, value: number) {
  const clamped = Math.max(-DB_MAX_HUNGER, Math.min(dbCruorMax(sheet), value));
  if (clamped < 0) {
    sheet.cruor = 0;
    sheet.hunger = -clamped;
    return;
  }
  sheet.cruor = clamped;
  sheet.hunger = 0;
}

export function dbArtDepth(sheet: IDbSheet, artKey: string): number {
  return sheet.arts.find(a => a.key === artKey)?.depth ?? 0;
}

export function dbTension(sheet: IDbSheet): { key: string, name: string, tension: number }[] {
  const out: { key: string, name: string, tension: number }[] = [];
  for (const pair of DarkborneData.content.artPairs) {
    const a = dbArtDepth(sheet, pair.artA);
    const b = dbArtDepth(sheet, pair.artB);
    if (a === 0 || b === 0) {
      continue;
    }
    out.push({
      key: pair.key,
      name: `${DarkborneData.artName(pair.artA)} und ${DarkborneData.artName(pair.artB)}`,
      tension: Math.min(a, b),
    });
  }
  return out;
}

export function dbBloodDice(sheet: IDbSheet, artKey?: string, effectLevel: number = 0): number {
  let dice = Math.min(sheet.hunger, DB_MAX_HUNGER);
  if (!artKey) {
    return dice;
  }
  const pair = DarkborneData.pairOf(artKey);
  if (pair) {
    const a = dbArtDepth(sheet, pair.artA);
    const b = dbArtDepth(sheet, pair.artB);
    if (a > 0 && b > 0) {
      dice += Math.min(a, b);
    }
  }
  const art = DarkborneData.art(artKey);
  if (art?.isPrimal && effectLevel > 2) {
    dice += effectLevel - 2;
  }
  return dice;
}

export function dbFormCost(kind: DbFormKind, level: number): number {
  if (kind === DbFormKind.Established) {
    return 1;
  }
  return Math.max(1, level - 1);
}

export function dbFormDifficulty(kind: DbFormKind, level: number): number {
  return Math.max(1, level - 1);
}

export function dbImprovisationCost(level: number): number {
  return Math.max(1, level);
}

export function dbImprovisationDifficulty(level: number): number {
  return Math.max(1, level);
}

export function dbHealth(sheet: IDbSheet): number {
  return (sheet.attributes[DbAttribute.Kraft] ?? 1) + 5;
}

export function dbWillePoolMax(sheet: IDbSheet): number {
  return sheet.wille;
}

export function dbHumanTraitCap(sheet: IDbSheet, trait: DbHumanTrait): number {
  if (sheet.bloodStrength >= 9) {
    return 1;
  }
  if (trait === DbHumanTrait.Essen && sheet.bloodStrength >= 4) {
    return 1;
  }
  return DB_MAX_HUMAN_TRAIT;
}

export function dbAnchorsOf(sheet: IDbSheet, kind: DbAnchorKind) {
  return sheet.anchors.filter(a => a.kind === kind);
}

export function dbIsDehumanized(sheet: IDbSheet): boolean {
  return dbAnchorsOf(sheet, DbAnchorKind.Human).filter(a => a.label.trim() !== "").length === 0;
}

export function dbIsAdrift(sheet: IDbSheet): boolean {
  return sheet.anchors.filter(a => a.label.trim() !== "").length === 0;
}

export function dbFirmAnchors(sheet: IDbSheet) {
  return sheet.anchors.filter(a => a.state === DbAnchorState.Firm && a.label.trim() !== "");
}

function levelOrder(level: string): number {
  return DarkborneData.anathemaLevel(level)?.order ?? 0;
}

function levelByOrder(order: number): IDarkAnathemaLevel | undefined {
  const levels = DarkborneData.content.anathemaLevels;
  const clamped = Math.max(0, Math.min(levels.length - 1, order));
  return levels.find(l => l.order === clamped);
}

export function dbShiftAnathemaLevel(level: string, steps: number): string {
  return levelByOrder(levelOrder(level) + steps)?.level ?? level;
}

export function dbAnathemaFor(sheet: IDbSheet): IDbAnathema[] {
  const entries = new Map<string, IDbAnathema>();

  for (const influence of DarkborneData.content.influences) {
    if (!influence.baseLevel || influence.baseLevel === "none") {
      continue;
    }
    entries.set(influence.key, {
      influence: influence.key,
      level: influence.baseLevel,
      source: DbAnathemaSource.Base,
      note: influence.note,
    });
  }

  const house = DarkborneData.house(sheet.bloodline || sheet.house);
  for (const entry of house?.anathema ?? []) {
    entries.set(entry.influenceKey, {
      influence: entry.influenceKey,
      level: entry.level,
      source: DbAnathemaSource.Inherited,
      note: entry.note,
    });
  }

  for (const entry of sheet.anathema) {
    if (entry.source === DbAnathemaSource.Personal) {
      entries.set(entry.influence, entry);
    }
  }

  const out: IDbAnathema[] = [];
  for (const entry of entries.values()) {
    let shift = 0;
    if (entry.source === DbAnathemaSource.Inherited && sheet.bloodStrength >= 3) {
      shift += 1;
    }
    if (entry.source === DbAnathemaSource.Base && sheet.bloodStrength >= 5) {
      shift += 1;
    }
    out.push(shift === 0 ? entry : {...entry, level: dbShiftAnathemaLevel(entry.level, shift)});
  }
  return out.sort((a, b) => levelOrder(b.level) - levelOrder(a.level));
}

export function dbDamageCount(sheet: IDbSheet, kind: DbDamageKind): number {
  return sheet.damage.filter(d => d === kind).length;
}

export function dbIsCollapsed(sheet: IDbSheet): boolean {
  const health = dbHealth(sheet);
  const filled = sheet.damage.filter(d => d === DbDamageKind.Wound || d === DbDamageKind.Devastation).length;
  return filled >= health;
}

export function dbWoundPenalty(sheet: IDbSheet): number {
  const health = dbHealth(sheet);
  const devastation = dbDamageCount(sheet, DbDamageKind.Devastation);
  if (devastation >= health - 1) {
    return 2;
  }
  if (devastation * 2 >= health) {
    return 1;
  }
  return 0;
}

export function dbAttributeCost(newValue: number): number {
  return newValue * 5;
}

export function dbSkillCost(newValue: number): number {
  return newValue * 3;
}

export function dbSpecializationCost(): number {
  return 3;
}

export function dbBackgroundCost(newLevel: number): number {
  return newLevel * 3;
}

export function dbWilleCost(newValue: number): number {
  return newValue * 5;
}

export function dbArtCost(newDepth: number, affinity: boolean): number {
  return newDepth * (affinity ? 5 : 7);
}

export function dbBloodTeachingCost(newDepth: number, isVaryss: boolean): number {
  return newDepth * (isVaryss ? 4 : 5);
}

export function dbEstablishedFormCost(): number {
  return 3;
}

export function dbOwnFormCost(level: number): number {
  return level * 3;
}

export function dbBloodStrengthCost(newValue: number, glied: number): number {
  return newValue * 10 + glied;
}

export function dbAlienationCost(): number {
  return 5;
}

export function dbAvailableExp(sheet: IDbSheet): number {
  return sheet.exp;
}

export function dbLearnStepsLeft(sheet: IDbSheet): number {
  const age = DarkborneData.startAge(sheet.startAge);
  const total = age?.learnSteps ?? 0;
  const spent = sheet.arts.reduce((sum, art) => sum + art.depth, 0);
  return total - spent;
}

export function dbFormSlots(sheet: IDbSheet): number {
  return sheet.arts.reduce((sum, art) => sum + art.depth, 0) + 1;
}

export function dbHasInheritance(sheet: IDbSheet): boolean {
  if (!sheet.sireArt) {
    return false;
  }
  const owned = sheet.arts.filter(a => a.depth > 0);
  if (owned.length === 0) {
    return false;
  }
  const sireDepth = owned.find(a => a.key === sheet.sireArt)?.depth ?? 0;
  if (sireDepth === 0) {
    return false;
  }
  const highest = Math.max(...owned.map(a => a.depth));
  if (sireDepth !== highest) {
    return false;
  }
  return owned.filter(a => a.depth === highest).length === 1;
}

export function dbPassingDifficulty(sheet: IDbSheet, traits: DbHumanTrait[]): number {
  let difficulty = 2;
  for (const trait of traits) {
    const value = sheet.humanTraits[trait] ?? 0;
    if (value === 2) {
      difficulty += 1;
    } else if (value === 1) {
      difficulty += 2;
    } else if (value <= 0) {
      difficulty += 3;
    }
  }
  return difficulty;
}

export function dbCanTakeRoutine(sheet: IDbSheet): boolean {
  return sheet.hunger === 0;
}
