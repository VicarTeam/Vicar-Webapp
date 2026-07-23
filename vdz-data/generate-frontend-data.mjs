#!/usr/bin/env node
// Generiert frontend/src/app/data/vdz.ts aus den JSON-Entwürfen in vdz-data/.
// Nach jeder Daten-Review erneut ausführen: node vdz-data/generate-frontend-data.mjs
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

function load(name) {
  const file = join(root, name);
  if (!existsSync(file)) {
    console.warn(`WARN: ${name} fehlt – leeres Array wird generiert.`);
    return [];
  }
  return JSON.parse(readFileSync(file, "utf8").replace(/^﻿/, ""));
}

// VDZ-Clan/Blutlinien-Name -> V5-Clan-Symbol-ID (public/img/clans/<id>.png).
// Wiederverwendung der vorhandenen V5-Symbole für konzeptgleiche Clans;
// alles ohne Eintrag fällt im Frontend auf das Ankh-Symbol zurück.
const SYMBOL_BY_NAME = {
  "Assamiten": 1,          // Banu Haqim
  "Brujah": 2,
  "Gangrel": 3,
  "Jünger des Set": 7,     // Die Priesterschaft / Ministry
  "Kappadozianer": 4,      // Hecata (Cappadocians)
  "Lasombra": 5,
  "Malkavianer": 6,
  "Nosferatu": 8,
  "Ravnos": 9,
  "Toreador": 11,
  "Tremere": 12,
  "Tzimisce": 13,
  "Ventrue": 14,
  // Blutlinien mit V5-Symbolentsprechung
  "Giovanni": 4,           // Hecata
  "Salubri (Heilerkaste)": 10,
  "Salubri (Kriegerkaste)": 10,
  "Salubri (Wächterkaste)": 10,
  "Wahre Brujah": 2,
};

function withSymbol(entry) {
  const symbolId = SYMBOL_BY_NAME[entry.name];
  return symbolId ? { ...entry, symbolId } : entry;
}

const clans = load("clans.json").map(withSymbol);
const roads = load("wege.json");
const archetypes = load("archetypen.json");
const backgrounds = load("hintergruende.json");
const bloodlines = load("blutlinien.json").map(withSymbol);
const traits = load("vorzuege.json");

const disciplines = [
  ...load("disziplinen-1.json"),
  ...load("disziplinen-2.json"),
  ...load("disziplinen-3.json"),
].map((d, i) => ({ id: i + 1, ...d }));

const out = `// AUTO-GENERIERT aus vdz-data/*.json – nicht von Hand editieren!
// Regenerieren mit: node vdz-data/generate-frontend-data.mjs
import type {IVdzArchetype, IVdzBackground, IVdzClan, IVdzDiscipline, IVdzRoad, IVdzTraitDef} from "@/@types/vdz";

export const vdzClans: IVdzClan[] = ${JSON.stringify(clans, null, 2)};

export const vdzBloodlines: IVdzClan[] = ${JSON.stringify(bloodlines, null, 2)};

export const vdzRoads: IVdzRoad[] = ${JSON.stringify(roads, null, 2)};

export const vdzArchetypes: IVdzArchetype[] = ${JSON.stringify(archetypes, null, 2)};

export const vdzBackgrounds: IVdzBackground[] = ${JSON.stringify(backgrounds, null, 2)};

export const vdzDisciplines: IVdzDiscipline[] = ${JSON.stringify(disciplines, null, 2)};

export const vdzTraitDefs: IVdzTraitDef[] = ${JSON.stringify(traits, null, 2)};
`;

const target = join(root, "..", "frontend", "src", "app", "data", "vdz.ts");
writeFileSync(target, out);
console.log(`OK: ${target} generiert (${clans.length} Clans, ${roads.length} Wege, ${archetypes.length} Archetypen, ${backgrounds.length} Hintergründe).`);
