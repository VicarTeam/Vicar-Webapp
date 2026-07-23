import { vdzDisciplines } from "@/app/data/vdz"
import type { IVdzDiscipline } from "@/@types/vdz"

export type VdzDisciplineKind = "linear" | "pathbased" | "none"

export interface VdzDisciplineResolution {
  kind: VdzDisciplineKind
  entries: IVdzDiscipline[]
}

/**
 * Löst einen Disziplin-Namen vom Charakterbogen (oft ein Oberbegriff wie
 * "Nekromantie", "Valeren", "Aizina (Schattenspiele)") gegen den Katalog auf.
 *
 * - "linear": klassische Disziplin, ein Eintrag mit Kräften Stufe 1-5 (kumulativ).
 * - "pathbased": Blutmagie über mehrere Pfade + Rituale (Nekromantie, Thaumaturgie,
 *   Koldunische Hexerei, Mystik des Abgrunds) — mehrere Katalog-Einträge.
 * - "none": kein Katalogeintrag (z.B. Platzhalter "zwei Disziplinen des Ursprungsclans").
 */
export function resolveVdzDiscipline(name: string, clanName?: string): VdzDisciplineResolution {
  const exact = vdzDisciplines.find(d => d.name === name)
  if (exact) return { kind: "linear", entries: [exact] }

  // Valeren: Kaste bestimmt die Variante (Heiler/Krieger/Wächter)
  if (name === "Valeren") {
    const caste = clanName?.includes("Krieger")
      ? "Krieger"
      : clanName?.includes("Wächter")
        ? "Wächter"
        : "Heiler"
    const e = vdzDisciplines.find(d => d.name === `Valeren (${caste})`)
    return e ? { kind: "linear", entries: [e] } : { kind: "none", entries: [] }
  }

  // Basisname ohne Klammerzusatz, z.B.
  // "Nekromantie (hauptsächlich ...)" -> "Nekromantie", "Aizina (Schattenspiele)" -> "Aizina"
  const base = name.replace(/\s*\(.*\)\s*$/, "").trim()

  // Pfadbasierte Familie: Einträge "Basis" oder "Basis: ..."
  const family = vdzDisciplines.filter(d => d.name === base || d.name.startsWith(base + ":"))
  if (family.length > 0) {
    if (family.length === 1 && !family[0]!.name.includes(":")) return { kind: "linear", entries: family }
    return { kind: "pathbased", entries: family }
  }

  // Klammer-Inhalt als eigentlicher Name, z.B. "Aizina (Schattenspiele)" -> "Schattenspiele"
  const inner = name.match(/\(([^)]+)\)/)?.[1]?.trim()
  if (inner) {
    const byInner = vdzDisciplines.find(d => d.name === inner)
    if (byInner) return { kind: "linear", entries: [byInner] }
  }

  return { kind: "none", entries: [] }
}

/** Kurze Zusammenfassung einer Disziplin fürs Tooltip (aus dem Katalog). */
export function vdzDisciplineSummary(name: string, clanName?: string): string {
  const res = resolveVdzDiscipline(name, clanName)
  return res.entries[0]?.summary ?? ""
}

/** Erklärtext zu einer konkreten Tugend (nach ihrem aufgelösten Namen). */
export function vdzVirtueHelp(virtueName: string): string {
  switch (virtueName) {
    case "Gewissen":
      return VDZ_HELP.virtueConscience
    case "Überzeugung":
      return VDZ_HELP.virtueConviction
    case "Selbstbeherrschung":
      return VDZ_HELP.virtueSelfControl
    case "Instinkt":
      return VDZ_HELP.virtueInstinct
    case "Mut":
      return VDZ_HELP.virtueCourage
    default:
      return ""
  }
}

// ---------------------------------------------------------------------------
// Zentrale Erklärtexte (an mehreren Stellen wiederverwendet, damit sie
// konsistent bleiben).
// ---------------------------------------------------------------------------

export const VDZ_HELP = {
  disciplinesGeneral:
    "Disziplinen sind die übernatürlichen Kräfte, die im Blut der Kainiten schlummern. " +
    "Jeder Clan beherrscht drei davon besonders leicht. Anders als bei manchen moderneren " +
    "Systemen wählst du keine einzelnen Kräfte aus: Sobald du eine Disziplin auf Stufe X " +
    "steigerst, beherrschst du automatisch ALLE Kräfte der Stufen 1 bis X. Jede Stufe bringt " +
    "genau eine neue Kraft (auf hohen Stufen manchmal mehrere zur Auswahl). Der Wert einer " +
    "Disziplin gibt also zugleich an, wie viele ihrer Kräfte du bereits gemeistert hast.",

  disciplineBloodMagic:
    "Blutmagie (Thaumaturgie, Nekromantie, Koldunische Hexerei, Mystik des Abgrunds) " +
    "funktioniert anders als gewöhnliche Disziplinen: Dein Wert steht für deinen HAUPTPFAD, " +
    "dessen Kräfte Stufe 1 bis X du beherrschst. Zusätzliche Pfade beginnst du bei 1 und " +
    "steigerst sie separat; Rituale erlernst du einzeln, unabhängig vom Disziplinwert. " +
    "Unten sind alle Pfade und Rituale dieser Tradition als Nachschlagewerk aufgeführt.",

  virtueConscience:
    "Gewissen misst dein Gespür für Recht und Unrecht und deine Fähigkeit, echte Reue zu " +
    "empfinden. Es bewahrt dich auf den menschlicheren Wegen vor dem moralischen Verfall: " +
    "Wenn du eine Sünde begehst, entscheidet eine Gewissensprobe, ob dein Wegwert sinkt. " +
    "Charaktere mit hohem Gewissen ringen mit Schuld — sie fühlen den Preis ihrer Taten.",

  virtueConviction:
    "Überzeugung tritt auf den finstereren Wegen an die Stelle des Gewissens. Statt Reue zählt " +
    "die eiserne Hingabe an die eigenen Prinzipien: Du bereust nicht, du rechtfertigst. " +
    "Überzeugung erlaubt es, Gräuel zu begehen, ohne innerlich zu zerbrechen — solange sie " +
    "deinem Kodex dienen. Ob dein Weg Gewissen oder Überzeugung nutzt, legt der Weg fest.",

  virtueSelfControl:
    "Selbstbeherrschung ist die Kontrolle über die Bestie und die eigenen Triebe. Sie " +
    "bestimmt, wie gut du der Raserei widerstehst, wenn Hunger, Wut oder Angst dich überkommen. " +
    "Hohe Selbstbeherrschung bedeutet einen kühlen Kopf, selbst wenn das Blut ruft.",

  virtueInstinct:
    "Instinkt tritt auf den tierhafteren Wegen an die Stelle der Selbstbeherrschung. Statt die " +
    "Bestie zu unterdrücken, reitet der Vampir die Welle seiner Triebe und lenkt sie bewusst. " +
    "Auch Instinkt hilft gegen die Raserei — nicht durch Zurückhaltung, sondern durch Hingabe. " +
    "Ob dein Weg Selbstbeherrschung oder Instinkt nutzt, legt der Weg fest.",

  virtueCourage:
    "Mut ist die Kraft, Furcht zu widerstehen — vor allem dem Rötschreck, der panischen Angst " +
    "vor Feuer, Sonnenlicht und wahrem Glauben. Mut gilt auf jedem Weg gleichermaßen und bildet " +
    "zugleich die Grundlage deiner Willenskraft (Willenskraft startet in Höhe deines Muts).",

  roadRating:
    "Der Wegwert (1-10) misst, wie fest dein Kainit seinem Weg folgt — er ist das Gegenstück zur " +
    "Menschlichkeit, nur auf den gewählten Weg gemünzt. Er beginnt als Summe deiner beiden " +
    "Weg-Tugenden. Begehst du eine Handlung, die deinem Weg widerspricht (siehe die " +
    "Sündenhierarchie deines Wegs), droht Verfall: Eine Probe entscheidet, ob der Wegwert sinkt. " +
    "Je niedriger er wird, desto stärker beherrscht dich die Bestie; bei 0 bist du für immer an " +
    "sie verloren. Ein hoher Wegwert hält dich gefasst und diszipliniert auf deinem Pfad.",

  bloodPool:
    "Der Blutvorrat ist das Vitæ, das du in dir speicherst. Deine Generation bestimmt, wie groß " +
    "der Vorrat maximal ist und wie viele Punkte du pro Runde einsetzen kannst. Blut gibst du " +
    "aus, um Wunden zu heilen, Disziplinen zu wirken, deine körperlichen Attribute kurzzeitig zu " +
    "steigern, jede Nacht zu erwachen sowie um Ghule und Blutsbande zu erschaffen. Aufgefüllt " +
    "wird er nur durchs Trinken. Läuft er leer, drohen Raserei und schließlich die Starre.",
}
