import DataManager from "@/libs/data/data-manager";
import type { IClan } from "@/@types/models";
import type { IDiscipline, IPredatorType, IPTAction, IRestriction } from "@/@types/data";
import { PTActionType, RestrictionType } from "@/@types/data";

export interface IClanFinderOptions {
  excludeCaitiff: boolean;
  includePredators: boolean;
}

/** Ein Jagdverhalten, das eine dem Clan fehlende Wunsch-Disziplin schenken kann. */
export interface IPredatorSuggestion {
  predator: IPredatorType;
  adds: IDiscipline[];
}

export interface IClanMatch {
  clan: IClan;
  matched: IDiscipline[];
  missing: IDiscipline[];
  isPerfect: boolean;
  /** Nur befuellt, wenn includePredators aktiv ist und der Clan Luecken hat. */
  suggestions: IPredatorSuggestion[];
  /** Abdeckung inkl. bestem Jagdverhalten (fuer die Sortierung). */
  effectiveMatchCount: number;
}

/** Alle V5-Disziplinen (fuer die Auswahl). */
export function getAllDisciplines(): IDiscipline[] {
  return DataManager.normalDisciplinesAsArray();
}

function getAllClans(): IClan[] {
  const byId = new Map<number, IClan>();
  for (const book of DataManager.selectedLanguage.books) {
    for (const clan of book.clans) {
      if (clan.id < 0) {
        continue;
      }
      if (!byId.has(clan.id)) {
        byId.set(clan.id, clan);
      }
    }
  }
  return [...byId.values()];
}

function getAllPredatorTypes(): IPredatorType[] {
  const byId = new Map<number, IPredatorType>();
  for (const book of DataManager.selectedLanguage.books) {
    for (const predator of (book.predatorTypes || [])) {
      if (!byId.has(predator.id)) {
        byId.set(predator.id, predator);
      }
    }
  }
  return [...byId.values()];
}

/** Caitiff (und jeder Wildcard-Clan) hat Zugriff auf alle Disziplinen. */
function isWildcardClan(clan: IClan, totalDisciplineCount: number): boolean {
  return clan.disciplines.length >= totalDisciplineCount;
}

/** Prueft, ob eine Disziplin-Wahl eines Jagdverhaltens fuer diesen Clan erlaubt ist. */
function isChoiceAllowedForClan(restriction: IRestriction | undefined, clanId: number): boolean {
  if (!restriction) {
    return true;
  }
  if (restriction.type === RestrictionType.SpecificClans) {
    return Array.isArray(restriction.data) && restriction.data.includes(clanId);
  }
  if (restriction.type === RestrictionType.ExcludeClans) {
    return !(Array.isArray(restriction.data) && restriction.data.includes(clanId));
  }
  // Nicht-Clan-Restriktionen (Buch, Generation, ...) werden hier als erfuellbar behandelt.
  return true;
}

/** Disziplin-IDs, die ein Jagdverhalten einem bestimmten Clan schenken kann. */
function predatorDisciplineIdsForClan(predator: IPredatorType, clanId: number): Set<number> {
  const ids = new Set<number>();
  for (const action of (predator.actions || []) as IPTAction[]) {
    if (action.type !== PTActionType.DisciplinePoint) {
      continue;
    }
    const choices = (action.data?.choices || []) as { id: number; restriction?: IRestriction }[];
    for (const choice of choices) {
      if (isChoiceAllowedForClan(choice.restriction, clanId)) {
        ids.add(choice.id);
      }
    }
  }
  return ids;
}

/**
 * Regelbasierter "Klan-Finder": bewertet alle Clans danach, wie viele der
 * gewuenschten Disziplinen sie als Clan-Disziplinen abdecken. Optional werden
 * Clan+Jagdverhalten-Kombinationen mitgesucht (ein Jagdverhalten schenkt genau
 * einen Disziplinpunkt, kann also eine fehlende Disziplin ergaenzen).
 */
export function findClanMatches(desiredIds: number[], options: IClanFinderOptions): IClanMatch[] {
  const desiredSet = new Set(desiredIds);
  if (desiredSet.size === 0) {
    return [];
  }

  const allDisciplines = getAllDisciplines();
  const disciplineById = new Map(allDisciplines.map(d => [d.id, d]));
  const totalDisciplineCount = allDisciplines.length;
  const predators = options.includePredators ? getAllPredatorTypes() : [];

  const matches: IClanMatch[] = [];

  for (const clan of getAllClans()) {
    if (options.excludeCaitiff && isWildcardClan(clan, totalDisciplineCount)) {
      continue;
    }

    const clanDisciplineIds = new Set(clan.disciplines.map(d => d.id));
    const matched: IDiscipline[] = [];
    const missing: IDiscipline[] = [];
    for (const id of desiredIds) {
      const discipline = disciplineById.get(id);
      if (!discipline) {
        continue;
      }
      if (clanDisciplineIds.has(id)) {
        matched.push(discipline);
      } else {
        missing.push(discipline);
      }
    }

    const suggestions: IPredatorSuggestion[] = [];
    if (options.includePredators && missing.length > 0) {
      for (const predator of predators) {
        const grantable = predatorDisciplineIdsForClan(predator, clan.id);
        const adds = missing.filter(d => grantable.has(d.id));
        if (adds.length > 0) {
          suggestions.push({ predator, adds });
        }
      }
      suggestions.sort((a, b) => b.adds.length - a.adds.length || a.predator.name.localeCompare(b.predator.name));
    }

    // Ein Jagdverhalten kann genau eine fehlende Disziplin ergaenzen.
    const effectiveMatchCount = matched.length + (suggestions.length > 0 ? 1 : 0);

    matches.push({
      clan,
      matched,
      missing,
      isPerfect: missing.length === 0,
      suggestions,
      effectiveMatchCount: Math.min(effectiveMatchCount, desiredSet.size),
    });
  }

  matches.sort((a, b) => {
    if (options.includePredators && b.effectiveMatchCount !== a.effectiveMatchCount) {
      return b.effectiveMatchCount - a.effectiveMatchCount;
    }
    if (b.matched.length !== a.matched.length) {
      return b.matched.length - a.matched.length;
    }
    const da = a.clan.difficulty ?? 99;
    const db = b.clan.difficulty ?? 99;
    if (da !== db) {
      return da - db;
    }
    return a.clan.name.localeCompare(b.clan.name);
  });

  return matches;
}
