/**
 * Custom Skill Tree System.
 *
 * GMs erstellen Skill Trees in einem Editor und teilen sie über einen eindeutigen
 * Bonus Code. Spieler lösen den Code ein, schalten Skills frei und wenden so
 * Modifikatoren auf ihre Charakterwerte an.
 *
 * Konzept: siehe `Custom_SkillTree.md`, Plan: `Custom_SkillTree_Plan.md`.
 */

/**
 * Welche Ressource zum Freischalten/Leveln der Skills eines Trees genutzt wird.
 */
export enum SkillTreeResourceType {
  /** Nutzt die Charakter-Erfahrung (`character.exp`). */
  Experience = "experience",
  /** Eine frei benannte, eigene Variable pro Charakter (siehe `resourceName`). */
  Custom = "custom",
  /** Spieler braucht einen aktiven Bonus Code (`resourceBonusCode`) zum Leveln. */
  BonusCode = "bonus_code",
}

/**
 * Operatoren, mit denen ein Skill einen Charakterwert verändert.
 */
export enum ModifierOperator {
  Add = "add",
  Subtract = "subtract",
  Multiply = "multiply",
  Divide = "divide",
  /** Setzt den Wert (letztes Set gewinnt). */
  Set = "set",
  /** Setzt den Wert und verhindert Erhöhen/Verringern durch andere Quellen. */
  Lock = "lock",
  /** Untergrenze, die nicht unterschritten werden darf. */
  Min = "min",
  /** Obergrenze, die nicht überschritten werden darf. */
  Max = "max",
}

/**
 * Worauf ein Modifikator wirkt.
 */
export enum ModifierTargetType {
  /** Attribut – `key` ist ein `AttributeKeys`-Wert (z.B. "str"). */
  Attribute = "attribute",
  /** Fähigkeit – `key` ist ein `SkillKeys`-Wert (z.B. "ath"). */
  Skill = "skill",
  /** Vorteil (Merit/Background) – `key` referenziert Pack/Trait (`packId:traitId`). */
  Advantage = "advantage",
  /** Nachteil (Flaw) – `key` referenziert Pack/Trait (`packId:traitId`). */
  Disadvantage = "disadvantage",
  /** Anderer Charakterwert – `key` ist ein Feldname (z.B. "hunger", "humanity", "bloodPotency", "health", "willpower"). */
  CharacterValue = "character_value",
}

export interface ISkillModifier {
  target: ModifierTargetType;
  /** Zielschlüssel je nach `target` (Attribut-/Skill-Key, Charakterfeld oder Trait-Referenz). */
  key: string;
  operator: ModifierOperator;
  value: number;
}

/**
 * Visueller Stil der Verbindungslinie zwischen zwei Skills.
 */
export enum DependencyStyle {
  Square = "square",
  Diagonal = "diagonal",
  Bezier = "bezier",
}

/**
 * Verknüpfungslogik der Eltern-Abhängigkeiten eines Skills.
 */
export enum ParentGate {
  /** Alle Eltern müssen freigeschaltet sein (Standard). */
  And = "and",
  /** Mindestens ein Elternteil muss freigeschaltet sein. */
  Or = "or",
  /** Genau ein Elternteil darf/muss freigeschaltet sein. */
  Xor = "xor",
}

/**
 * Art der Abhängigkeit zwischen zwei Skills.
 */
export enum DependencyKind {
  /** Nur eine visuelle Linie zur Übersicht – keine Auswirkung auf die Freischaltung. */
  Cosmetic = "cosmetic",
  /** Der Quell-Skill muss freigeschaltet sein, bevor dieser Skill freigeschaltet werden kann. */
  Parent = "parent",
}

/**
 * Eine eingehende Abhängigkeit eines Skills (die Linie kommt von `fromSkillId`).
 */
export interface ISkillDependency {
  fromSkillId: string;
  style: DependencyStyle;
  kind: DependencyKind;
}

/**
 * Zusätzliche Einschränkungen, die das Freischalten eines Skills gaten,
 * ohne dass eine Linie gezogen werden muss.
 */
export enum SkillConstraintType {
  /** Ein Charakterwert muss mindestens `value` betragen. data = { key: string, value: number } */
  MinCharacterValue = "min_character_value",
  /** Ein anderer Skill (im selben Tree) muss freigeschaltet sein. data = { skillId: string } */
  RequiresSkill = "requires_skill",
  /** Ein anderer Skill schließt diesen aus (gegenseitig). data = { skillId: string } */
  ExcludesSkill = "excludes_skill",
  /** Aus einer Gruppe darf nur ein Skill gewählt werden. data = { groupId: string } */
  ExclusiveGroup = "exclusive_group",
}

export interface ISkillConstraint {
  type: SkillConstraintType;
  data: any;
}

/**
 * Ein einzelner Skill (Knoten) im Grid eines Skill Trees.
 */
export interface ISkillNode {
  /** Eindeutige ID innerhalb des Trees (UUID). */
  id: string;
  name: string;
  description: string;
  /** FontAwesome-Klassen-String oder base64-Bild. */
  icon: string;
  /** Kosten in der gewählten Ressource des Trees. */
  cost: number;
  row: number;
  col: number;
  modifiers: ISkillModifier[];
  dependencies: ISkillDependency[];
  /** Verknüpfung der Eltern-Abhängigkeiten (Standard: AND). */
  parentGate?: ParentGate;
  constraints: ISkillConstraint[];
  /**
   * Optionaler Sub-Tree-Portal: Bonus Code eines anderen Skill Trees.
   * Beim Freischalten dieses Knotens wird der referenzierte Tree eingelöst
   * und als weiterer Baum am Charakter eingebettet.
   */
  subTreeBonusCode?: string;
}

/**
 * Eine GM-erstellte Skill-Tree-Definition (zentral gespeichert, per Bonus Code geteilt).
 */
export interface ISkillTree {
  /** Backend-ID. Leer/undefined vor dem ersten Speichern. */
  id: string;
  /** Eindeutiger Freischalt-Code. */
  bonusCode: string;
  name: string;
  description: string;
  /** FontAwesome-Klassen-String oder base64-Bild. */
  icon: string;
  resourceType: SkillTreeResourceType;
  /** Nur bei `SkillTreeResourceType.Custom`: Anzeigename der eigenen Ressource. */
  resourceName?: string;
  /** Nur bei `SkillTreeResourceType.BonusCode`: benötigter Bonus Code zum Leveln. */
  resourceBonusCode?: string;
  rows: number;
  cols: number;
  nodes: ISkillNode[];
  /** Alias/ID des Erstellers. */
  creator: string;
  /** Erhöht sich bei jeder Bearbeitung – ermöglicht "Update verfügbar" für Spieler. */
  version: number;
  /** Optionales Hintergrundbild (CDN-URL). */
  backgroundImage?: string;
  /** Darstellungsart des Hintergrunds. */
  backgroundSize?: "cover" | "contain" | "auto" | "tile";
  /** Ausrichtung des Hintergrunds (CSS background-position, z.B. "center", "top left"). */
  backgroundPosition?: string;
  /** Deckkraft des Hintergrunds in Prozent (0–100). */
  backgroundOpacity?: number;
}

/**
 * Der pro-Charakter gespeicherte Zustand eines eingelösten Skill Trees.
 * Wird im schemalosen Charakter-Blob gespeichert (keine Backend-Migration nötig).
 */
export interface ICharacterSkillTreeState {
  treeId: string;
  /** Snapshot beim Einlösen – GM-Edits/Löschungen brechen keine bestehenden Builds. */
  treeSnapshot: ISkillTree;
  /** IDs der freigeschalteten Skills. */
  unlockedSkillIds: string[];
  /** Aktueller Stand der Custom-Ressource (nur bei `SkillTreeResourceType.Custom`). */
  customResource?: number;
}

export function defaultSkillNode(id: string): ISkillNode {
  return {
    id,
    name: "",
    description: "",
    icon: "",
    cost: 0,
    row: 0,
    col: 0,
    modifiers: [],
    dependencies: [],
    parentGate: ParentGate.And,
    constraints: [],
  };
}

export function defaultSkillTree(): ISkillTree {
  return {
    id: "",
    bonusCode: "",
    name: "",
    description: "",
    icon: "",
    resourceType: SkillTreeResourceType.Experience,
    rows: 5,
    cols: 5,
    nodes: [],
    creator: "",
    version: 1,
    backgroundImage: "",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundOpacity: 100,
  };
}

export function getResourceTypeName(type: SkillTreeResourceType): string {
  switch (type) {
    case SkillTreeResourceType.Experience:
      return "Erfahrung";
    case SkillTreeResourceType.Custom:
      return "Eigene Ressource";
    case SkillTreeResourceType.BonusCode:
      return "Bonus Code";
    default:
      return type;
  }
}
