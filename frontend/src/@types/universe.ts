import {GameLine} from "@/@types/gameline";

export enum Universe {
  WorldOfDarkness = 'wod',
  Darkborne = 'darkborne',
}

export interface IGameLineInfo {
  id: GameLine;
  label: string;
  name: string;
  description: string;
}

export interface IUniverseInfo {
  id: Universe;
  name: string;
  tagline: string;
  description: string;
  gamelines: IGameLineInfo[];
}

export const universes: IUniverseInfo[] = [
  {
    id: Universe.WorldOfDarkness,
    name: "World of Darkness",
    tagline: "Die Welt der Dunkelheit",
    description: "Die klassischen Regelwerke: Vampire, Werwölfe, Magier und Jäger in der modernen und der dunklen Vergangenheit.",
    gamelines: [
      {
        id: GameLine.Vampire,
        label: "V5",
        name: "Vampire: Die Maskerade",
        description: "Vampire der 5. Edition: Clans, Disziplinen, Hunger und Menschlichkeit.",
      },
      {
        id: GameLine.Werewolf,
        label: "W5",
        name: "Werwolf: Die Apokalypse",
        description: "Garou der 5. Edition: Stämme, Auspizien, Gaben und Ruhm.",
      },
      {
        id: GameLine.Mage,
        label: "M20",
        name: "Magus: Die Erleuchtung",
        description: "Magier der 20th Anniversary Edition: Traditionen, Sphären und Arete.",
      },
      {
        id: GameLine.Hunter,
        label: "H5",
        name: "Jäger: Die Vergeltung",
        description: "Jäger der 5. Edition: Credos, Antriebe und Edges.",
      },
      {
        id: GameLine.DarkAges,
        label: "VDZ",
        name: "Vampire: Dark Ages",
        description: "Kainiten des dunklen Mittelalters: Clans, Wege und Tugenden.",
      },
    ],
  },
  {
    id: Universe.Darkborne,
    name: "Darkborne",
    tagline: "Solange Nacht der Nacht folget",
    description: "Ein eigenes Universum der Nacht. Kreaturen mit einem gemeinsamen Regelkern, die ihre Macht jede auf ihre Weise bezahlen.",
    gamelines: [
      {
        id: GameLine.Deathborne,
        label: "Deathborne",
        name: "Deathborne",
        description: "Die Vesperi: Menschen, die gestorben sind und durch Cruor zurückkehrten. Blutkünste, Hunger und der Bund der Schweigenden Nacht.",
      },
    ],
  },
];

const GAMELINE_UNIVERSE: Record<GameLine, Universe> = {
  [GameLine.Vampire]: Universe.WorldOfDarkness,
  [GameLine.Werewolf]: Universe.WorldOfDarkness,
  [GameLine.Mage]: Universe.WorldOfDarkness,
  [GameLine.Hunter]: Universe.WorldOfDarkness,
  [GameLine.DarkAges]: Universe.WorldOfDarkness,
  [GameLine.Deathborne]: Universe.Darkborne,
};

export function getUniverse(gameline: GameLine): Universe {
  return GAMELINE_UNIVERSE[gameline] ?? Universe.WorldOfDarkness;
}

export function getUniverseInfo(universe: Universe): IUniverseInfo {
  const found = universes.find(u => u.id === universe);
  if (found) {
    return found;
  }
  return universes[0]!;
}

export function getGameLineInfo(gameline: GameLine): IGameLineInfo | undefined {
  for (const universe of universes) {
    const info = universe.gamelines.find(gl => gl.id === gameline);
    if (info) {
      return info;
    }
  }
  return undefined;
}

export function getGameLineLabel(gameline?: GameLine): string {
  return getGameLineInfo(gameline ?? GameLine.Vampire)?.label ?? "V5";
}

export function getGameLineName(gameline?: GameLine): string {
  return getGameLineInfo(gameline ?? GameLine.Vampire)?.name ?? "Vampire: Die Maskerade";
}
