import {GameLine, type IBaseSheet} from "@/@types/gameline";
import {DamageType, type IUsingTraitPacks, Sex} from "@/@types/models";

export type RequestLevelFn = (type: 'attribute'|'ability'|'sphere'|'arete'|'willpower', subject?: M20Ability|M20Attribute|M20Sphere) => void;

export enum M20Sphere {
  None = 'none',
  Correspondence = 'correspondence',
  Entropy = 'entropy',
  Forces = 'forces',
  Life = 'life',
  Matter = 'matter',
  Mind = 'mind',
  Prime = 'prime',
  Spirit = 'spirit',
  Time = 'time',
}

export enum M20Essence {
  None = 'none',
  Dynamic = 'dynamic',
  Static = 'static',
  Primordial = 'primordial',
  Questing = 'questing',
}

export enum M20TraditionType {
  Tradition = 'tradition',
  Technocracy = 'technocracy',
  Disparate = 'disparate',
}

export enum M20AttributeCategory {
  Physical = 'physical',
  Social = 'social',
  Mental = 'mental',
}

export enum M20AbilityCategory {
  Talents = 'talents',
  Skills = 'skills',
  Knowledges = 'knowledges',
}

export enum M20Attribute {
  // Physical
  Strength = 'strength',
  Dexterity = 'dexterity',
  Stamina = 'stamina',
  // Social
  Charisma = 'charisma',
  Manipulation = 'manipulation',
  Appearance = 'appearance',
  // Mental
  Perception = 'perception',
  Intelligence = 'intelligence',
  Wits = 'wits',
}

export enum M20Ability {
  // Talents
  Alertness = 'alertness',
  Art = 'art',
  Athletics = 'athletics',
  Awareness = 'awareness',
  Brawl = 'brawl',
  Empathy = 'empathy',
  Expression = 'expression',
  Intimidation = 'intimidation',
  Leadership = 'leadership',
  Streetwise = 'streetwise',
  Subterfuge = 'subterfuge',
  // Skills
  Crafts = 'crafts',
  Drive = 'drive',
  Etiquette = 'etiquette',
  Firearms = 'firearms',
  MartialArts = 'martial_arts',
  Mediation = 'meditation',
  Melee = 'melee',
  Research = 'research',
  Stealth = 'stealth',
  Survival = 'survival',
  Technology = 'technology',
  // Knowledges
  Academics = 'academics',
  Computer = 'computer',
  Cosmology = 'cosmology',
  Enigmas = 'enigmas',
  Esoterica = 'esoterics',
  Investigation = 'investigation',
  Law = 'law',
  Medicine = 'medicine',
  Occult = 'occult',
  Politics = 'politics',
  Science = 'science',
}

const SPHERE_NAME: Record<M20Sphere, string> = {
  [M20Sphere.None]: "—",
  [M20Sphere.Correspondence]: "Korrespondenz",
  [M20Sphere.Entropy]: "Entropie",
  [M20Sphere.Forces]: "Kräfte",
  [M20Sphere.Life]: "Leben",
  [M20Sphere.Matter]: "Materie",
  [M20Sphere.Mind]: "Verstand",
  [M20Sphere.Prime]: "Urkraft",
  [M20Sphere.Spirit]: "Geist",
  [M20Sphere.Time]: "Zeit",
}

const SPHERE_DESC: Record<M20Sphere, string> = {
  [M20Sphere.None]: "",
  [M20Sphere.Correspondence]:
    "Raum ist nur eine Illusion, ein Schleier über der wahren Natur des Seins. Die Sphäre der Korrespondenz erlaubt es, Orte zu sehen, Distanzen zu überwinden und selbst die Gesetze von Nähe und Ferne zu beugen. Ein Meister dieser Kunst kann sich von einem Ort zum anderen bewegen, als wären sie nur einen Schritt entfernt, oder durch Wände hindurch blicken, als wären sie Luft. In Verbindung mit Kräften kann ein Blitz aus weiter Ferne einschlagen, oder mit Leben Heilung aus der Distanz geschehen.",
  [M20Sphere.Entropy]:
    "Alles vergeht, alles fällt ins Chaos – und alles wird neu geboren. Die Sphäre der Entropie ist die Kunst, Wahrscheinlichkeit, Schicksal und Zerfall zu beherrschen. Mit ihr kann man das Glück auf die eigene Seite ziehen, einen Würfelwurf entscheiden lassen oder den Lauf des Schicksals verändern. Man kann Waffen versagen lassen, Herzen erkranken oder Feinde ins Unglück stürzen. In den Händen eines Meisters ist Entropie sowohl die Klinge des Verfalls als auch das Werkzeug der Erneuerung.",
  [M20Sphere.Forces]:
    "Feuer, Licht, Elektrizität, Gravitation – all die Energien des Kosmos sind nur Strömungen, die geformt werden wollen. Die Sphäre der Kräfte erlaubt es, Naturgesetze zu lenken: Flammen zu entfachen, Schatten zu zerreißen, Stürme zu rufen oder die Luft selbst zum Beben zu bringen. In Kombination mit Korrespondenz können Energieblitze über große Distanzen gelenkt werden, und mit der Urkraft lassen sich Waffen aus reiner, strahlender Macht erschaffen.",
  [M20Sphere.Life]:
    "Alles Leben pulsiert, wächst und wandelt sich. Mit der Sphäre des Lebens lernt der Magus, den Körper zu verstehen und zu formen – Wunden zu heilen, Krankheiten zu lindern oder selbst den eigenen Körper in eine andere Gestalt zu verwandeln. Sie kann Menschen stärken, Tiere verwandeln oder Fleisch in tödliche Waffen verwandeln. Zusammen mit Materie kann man Fleisch zu Stein oder Stein zu Fleisch machen, und mit Geist lassen sich sogar die Seelen an Körper binden.",
  [M20Sphere.Matter]:
    "Stein, Metall, Holz – all das sind nur Muster, die man neu ordnen kann. Die Sphäre der Materie erlaubt es, Stoffe zu verwandeln, Metalle zu schmelzen oder Gold aus Schutt zu erschaffen. Ein geübter Magus kann Objekte reparieren oder Waffen aus reiner Fantasie entstehen lassen. Mit Kräften erschafft man Bomben, mit Leben unnatürliche Hybride, und mit Urkraft lassen sich dauerhafte Wunder in die Welt rufen.",
  [M20Sphere.Mind]:
    "Jeder Gedanke, jedes Gefühl ist ein Faden im Netz des Bewusstseins. Die Sphäre des Verstands eröffnet den Weg in den Kopf eines jeden Wesens – Telepathie, Illusion, Kontrolle und Inspiration. Sie erlaubt es, Emotionen zu formen, Gedanken zu lesen oder Illusionen so real erscheinen zu lassen, dass die Sinne sich täuschen lassen. Verbunden mit Korrespondenz kann man telepathisch über jede Distanz sprechen, und mit Zeit lassen sich Erinnerungen ändern oder löschen.",
  [M20Sphere.Prime]:
    "Die Quelle aller Magie, die rohe Essenz des Seins: Quintessenz. Mit der Sphäre Urkraft wird aus Magie Wirklichkeit. Sie erlaubt es, Energie aus dem Nichts zu formen, Zauber zu nähren und Muster zu stärken. Urkraft ist der Funke, der allen anderen Sphären die Dauer und Kraft gibt. Ohne sie sind erschaffene Dinge nur Illusionen – mit ihr werden sie real. Zusammen mit Kräften entsteht reines, brennendes Feuer, mit Materie beständige Objekte, mit Geist göttliche Manifestationen.",
  [M20Sphere.Spirit]:
    "Jenseits des Spiegels liegt die Umbra, die Welt der Geister. Mit der Sphäre des Geistes kann man mit diesen Wesen sprechen, sie rufen, bannen oder ihnen folgen. Man öffnet Tore in andere Welten, verhandelt mit Totems oder ruft Ahnengeister herbei. Zusammen mit Korrespondenz lassen sich Portale zwischen den Welten erschaffen, und mit Urkraft kann man Geister stärken oder vernichten. Geist ist das Tor zum Unsichtbaren – und zum Unheimlichen.",
  [M20Sphere.Time]:
    "Die große Strömung, in der wir alle schwimmen. Die Sphäre der Zeit erlaubt es, den Fluss der Sekunden zu fühlen, in die Zukunft zu blicken oder die Bewegung zu beschleunigen. Ein Magus kann sein eigenes Handeln schneller machen, den Lauf einer Schlacht verzögern oder einen Blick in kommende Gefahren werfen. In Verbindung mit Entropie kann man Schicksal über Jahrhunderte weben, und mit Korrespondenz an verschiedenen Orten zu unterschiedlichen Zeiten erscheinen.",
}

const ESSENCE_NAME: Record<M20Essence, string> = {
  [M20Essence.None]: "—",
  [M20Essence.Dynamic]: "Dynamisch",
  [M20Essence.Static]: "Statisch",
  [M20Essence.Primordial]: "Ursprünglich",
  [M20Essence.Questing]: "Suchend",
}

const ESSENCE_DESC: Record<M20Essence, string> = {
  [M20Essence.None]: "",
  [M20Essence.Dynamic]: "Eine leidenschaftliche Kraft für Fortschritt und Veränderung.",
  [M20Essence.Static]: "Ein zuverlässiger Garant für sichere Stabilität.",
  [M20Essence.Primordial]: "Eine schwer zu fassende Gestalt voller Urgeheimnisse.",
  [M20Essence.Questing]: "Träumer auf der Suche nach neuen Horizonten.",
}

const TRADITION_TYPE_NAME: Record<M20TraditionType, string> = {
  [M20TraditionType.Tradition]: "Rat der neun mystischen Traditionen",
  [M20TraditionType.Technocracy]: "Technokratische Union",
  [M20TraditionType.Disparate]: "Ungleiche Allianz",
}

const TRADITION_TYPE_SUBNAME: Record<M20TraditionType, string> = {
  [M20TraditionType.Tradition]: "Tradition",
  [M20TraditionType.Technocracy]: "Bündnis",
  [M20TraditionType.Disparate]: "Gruppe",
}

const TRADITION_TYPE_DESC: Record<M20TraditionType, string> = {
  [M20TraditionType.Tradition]:
    "Der Rat ist die lose Allianz jener Magi, die sich der Freiheit des Willens, der Vielfalt des Glaubens und der Macht des Erwachens verschrieben haben. Hier versammeln sich Hexen, Schamanen, Alchemisten, Ekstatiker und Hermetiker gleichermaßen, vereint im Widerstand gegen die Technokratie und ihre starre Weltsicht. Jede Tradition folgt ihrem eigenen Weg, doch im Rat kämpfen sie Seite an Seite für das Recht, die Welt nach vielen Wahrheiten zu formen.",
  [M20TraditionType.Technocracy]:
    "Die Union sieht sich als Hüterin der Menschheit – oder als ihre Architekten. Sie glaubt an eine Welt, die von Wissenschaft, Ordnung und Konsens beherrscht wird, in der Wunder durch Technologie erklärt und gebändigt werden. Ihre Agenten tragen Anzüge, führen Implantate, bauen Waffen und Netze, die das Schicksal der Welt formen. Für sie sind Magi der Traditionen gefährliche Anarchisten, die die Menschheit zurück ins Chaos stürzen würden.",
  [M20TraditionType.Disparate]:
    "Die Ungleiche Allianz besteht aus jenen Magi, die keinem der beiden großen Lager folgen wollen – weder Rat noch Union. Es sind verstreute Kulte, vergessene Orden, Solitär-Magi und Randgruppen, die sich in einem lockeren Bündnis gegenseitig schützen. Sie suchen ihre eigenen Wege, jenseits der großen Konflikte, und verkörpern die Vielfalt der kleinen Wahrheiten. Manchmal idealistisch, manchmal opportunistisch, stellen sie das unberechenbare Dritte im Krieg um die Wirklichkeit dar.",
}

const ATTRIBUTE_CATEGORY_NAME: Record<M20AttributeCategory, string> = {
  [M20AttributeCategory.Physical]: "Körperlich",
  [M20AttributeCategory.Social]: "Sozial",
  [M20AttributeCategory.Mental]: "Geistig",
}

const ABILITY_CATEGORY_NAME: Record<M20AbilityCategory, string> = {
  [M20AbilityCategory.Talents]: "Talente",
  [M20AbilityCategory.Skills]: "Fertigkeiten",
  [M20AbilityCategory.Knowledges]: "Kenntnisse",
}

const ATTRIBUTE_NAME: Record<M20Attribute, string> = {
  [M20Attribute.Strength]: "Stärke",
  [M20Attribute.Dexterity]: "Geschicklichkeit",
  [M20Attribute.Stamina]: "Widerstandskraft",
  [M20Attribute.Charisma]: "Charisma",
  [M20Attribute.Manipulation]: "Manipulation",
  [M20Attribute.Appearance]: "Auftreten",
  [M20Attribute.Perception]: "Wahrnehmung",
  [M20Attribute.Intelligence]: "Intelligenz",
  [M20Attribute.Wits]: "Geistesschärfe",
}

const ABILITY_NAME: Record<M20Ability, string> = {
  [M20Ability.Alertness]: "Aufmerksamkeit",
  [M20Ability.Art]: "Kunst",
  [M20Ability.Athletics]: "Sportlichkeit",
  [M20Ability.Awareness]: "Bewusstsein",
  [M20Ability.Brawl]: "Raufen",
  [M20Ability.Empathy]: "Empathie",
  [M20Ability.Expression]: "Selbstdarstellung",
  [M20Ability.Intimidation]: "Einschüchtern",
  [M20Ability.Leadership]: "Führung",
  [M20Ability.Streetwise]: "Straßenwissen",
  [M20Ability.Subterfuge]: "Täuschung",
  [M20Ability.Crafts]: "Handwerk",
  [M20Ability.Drive]: "Fahren",
  [M20Ability.Etiquette]: "Etikette",
  [M20Ability.Firearms]: "Schusswaffen",
  [M20Ability.MartialArts]: "Kampfkünste",
  [M20Ability.Mediation]: "Meditation",
  [M20Ability.Melee]: "Nahkampfwaffen",
  [M20Ability.Research]: "Recherche",
  [M20Ability.Stealth]: "Heimlichkeit",
  [M20Ability.Survival]: "Überleben",
  [M20Ability.Technology]: "Technologie",
  [M20Ability.Academics]: "Geisteswissenschaften",
  [M20Ability.Computer]: "Computer",
  [M20Ability.Cosmology]: "Kosmologie",
  [M20Ability.Enigmas]: "Mysterien",
  [M20Ability.Esoterica]: "Esoterik",
  [M20Ability.Investigation]: "Ermittlung",
  [M20Ability.Law]: "Rechtskunde",
  [M20Ability.Medicine]: "Medizin",
  [M20Ability.Occult]: "Okkultismus",
  [M20Ability.Politics]: "Politik",
  [M20Ability.Science]: "Naturwissenschaften",
}

export function getSphereName(sphere: M20Sphere): string {
  return SPHERE_NAME[sphere];
}

export function getSphereDescription(sphere: M20Sphere): string {
  return SPHERE_DESC[sphere];
}

export function getEssenceName(essence: M20Essence): string {
  return ESSENCE_NAME[essence];
}

export function getEssenceDescription(essence: M20Essence): string {
  return ESSENCE_DESC[essence];
}

export function getTraditionTypeName(type: M20TraditionType): string {
  return TRADITION_TYPE_NAME[type];
}

export function getTraditionTypeSubname(type: M20TraditionType): string {
  return TRADITION_TYPE_SUBNAME[type];
}

export function getTraditionTypeDescription(type: M20TraditionType): string {
  return TRADITION_TYPE_DESC[type];
}

export function getAttributeName(attr: M20Attribute): string {
  return ATTRIBUTE_NAME[attr];
}

export function getAttributeCategoryName(category: M20AttributeCategory): string {
  return ATTRIBUTE_CATEGORY_NAME[category];
}

export function getAbilityName(ability: M20Ability): string {
  return ABILITY_NAME[ability];
}

export function getAbilityCategoryName(category: M20AbilityCategory): string {
  return ABILITY_CATEGORY_NAME[category];
}

export interface IM20TraditionStereotypes {
  fellowTraditions: string;
  technocracy: string; // if the character is a technomancer, this is used for the normal traditions
  disparates: string; // if the character is a disparate, this is used for the normal traditions
}

export interface IM20Tradition {
  id: number; /** autoIncrement **/
  type: M20TraditionType; /** defaultToBefore **/
  name: string;
  description: string;
  organization: string;
  initiation: string;
  affinitySpheres: M20Sphere[];
  focus: string;
  stereotypes: IM20TraditionStereotypes;
}

export interface IM20Archetype {
  // can be 0 for custom archetypes
  id: number; /** autoIncrement **/
  name: string;
  description: string;
}

export interface IMageSheet extends IBaseSheet {
  freebiePoints: number;
  concept: string;
  chronicle: string;
  backstory: string;
  wonders: string;
  notes: string;
  focus: string;
  tradition: IM20Tradition;
  nature: IM20Archetype;
  demeanor: IM20Archetype;
  essence: M20Essence;
  arete: number;
  quintessence: number;
  paradox: number;
  willpower: number;
  willpowerDamage?: DamageType[];
  spheres: {
    [M20Sphere.Correspondence]: number;
    [M20Sphere.Entropy]: number;
    [M20Sphere.Forces]: number;
    [M20Sphere.Life]: number;
    [M20Sphere.Matter]: number;
    [M20Sphere.Mind]: number;
    [M20Sphere.Prime]: number;
    [M20Sphere.Spirit]: number;
    [M20Sphere.Time]: number;
  };
  attributes: { [key in M20Attribute]: number };
  abilities: { [key in M20Ability]: number };
  merits: IUsingTraitPacks;
  backgrounds: IUsingTraitPacks;
}

export function NewMageSheet(): IMageSheet {
  return {
    freebiePoints: 15,
    avatar: "",
    chronicle: "",
    backstory: "",
    willpower: 5,
    concept: "",
    wonders: "",
    directory: "",
    arete: 1,
    usedExp: 0,
    exp: 0,
    game: GameLine.Mage,
    id: "",
    focus: "",
    inventory: {
      carriedItems: [],
      ownedItems: [],
      cash: 0,
      bank: 0
    },
    justViewing: false,
    name: "",
    sex: Sex.Divers,
    spheres: {
      [M20Sphere.Correspondence]: 0,
      [M20Sphere.Entropy]: 0,
      [M20Sphere.Forces]: 0,
      [M20Sphere.Life]: 0,
      [M20Sphere.Matter]: 0,
      [M20Sphere.Mind]: 0,
      [M20Sphere.Prime]: 0,
      [M20Sphere.Spirit]: 0,
      [M20Sphere.Time]: 0,
    },
    tradition: undefined!,
    demeanor: undefined!,
    nature: undefined!,
    essence: M20Essence.None,
    paradox: 0,
    quintessence: 0,
    attributes: {
      // Physical
      [M20Attribute.Strength]: 0,
      [M20Attribute.Dexterity]: 0,
      [M20Attribute.Stamina]: 0,
      // Social
      [M20Attribute.Charisma]: 0,
      [M20Attribute.Manipulation]: 0,
      [M20Attribute.Appearance]: 0,
      // Mental
      [M20Attribute.Perception]: 0,
      [M20Attribute.Intelligence]: 0,
      [M20Attribute.Wits]: 0,
    },
    abilities: {
      // Talents
      [M20Ability.Alertness]: 0,
      [M20Ability.Art]: 0,
      [M20Ability.Athletics]: 0,
      [M20Ability.Awareness]: 0,
      [M20Ability.Brawl]: 0,
      [M20Ability.Empathy]: 0,
      [M20Ability.Expression]: 0,
      [M20Ability.Intimidation]: 0,
      [M20Ability.Leadership]: 0,
      [M20Ability.Streetwise]: 0,
      [M20Ability.Subterfuge]: 0,
      // Skills
      [M20Ability.Crafts]: 0,
      [M20Ability.Drive]: 0,
      [M20Ability.Etiquette]: 0,
      [M20Ability.Firearms]: 0,
      [M20Ability.MartialArts]: 0,
      [M20Ability.Mediation]: 0,
      [M20Ability.Melee]: 0,
      [M20Ability.Research]: 0,
      [M20Ability.Stealth]: 0,
      [M20Ability.Survival]: 0,
      [M20Ability.Technology]: 0,
      // Knowledges
      [M20Ability.Academics]: 0,
      [M20Ability.Computer]: 0,
      [M20Ability.Cosmology]: 0,
      [M20Ability.Enigmas]: 0,
      [M20Ability.Esoterica]: 0,
      [M20Ability.Investigation]: 0,
      [M20Ability.Law]: 0,
      [M20Ability.Medicine]: 0,
      [M20Ability.Occult]: 0,
      [M20Ability.Politics]: 0,
      [M20Ability.Science]: 0,
    },
    notes: "",
    merits: {
      packs: []
    },
    backgrounds: {
      packs: []
    },
  };
}

export const physicalAttributes: M20Attribute[] = [
  M20Attribute.Strength,
  M20Attribute.Dexterity,
  M20Attribute.Stamina,
];

export const socialAttributes: M20Attribute[] = [
  M20Attribute.Charisma,
  M20Attribute.Manipulation,
  M20Attribute.Appearance,
];

export const mentalAttributes: M20Attribute[] = [
  M20Attribute.Perception,
  M20Attribute.Intelligence,
  M20Attribute.Wits,
];

export function getAttributeCategory(attr: M20Attribute): M20AttributeCategory {
  if (physicalAttributes.includes(attr)) return M20AttributeCategory.Physical;
  if (socialAttributes.includes(attr)) return M20AttributeCategory.Social;
  return M20AttributeCategory.Mental;
}

export const talentAbilities: M20Ability[] = [
  M20Ability.Alertness,
  M20Ability.Art,
  M20Ability.Athletics,
  M20Ability.Awareness,
  M20Ability.Brawl,
  M20Ability.Empathy,
  M20Ability.Expression,
  M20Ability.Intimidation,
  M20Ability.Leadership,
  M20Ability.Streetwise,
  M20Ability.Subterfuge,
];

export const skillAbilities: M20Ability[] = [
  M20Ability.Crafts,
  M20Ability.Drive,
  M20Ability.Etiquette,
  M20Ability.Firearms,
  M20Ability.MartialArts,
  M20Ability.Mediation,
  M20Ability.Melee,
  M20Ability.Research,
  M20Ability.Stealth,
  M20Ability.Survival,
  M20Ability.Technology,
];

export const knowledgeAbilities: M20Ability[] = [
  M20Ability.Academics,
  M20Ability.Computer,
  M20Ability.Cosmology,
  M20Ability.Enigmas,
  M20Ability.Esoterica,
  M20Ability.Investigation,
  M20Ability.Law,
  M20Ability.Medicine,
  M20Ability.Occult,
  M20Ability.Politics,
  M20Ability.Science,
];

export function getAbilityCategory(ability: M20Ability): M20AbilityCategory {
  if (talentAbilities.includes(ability)) return M20AbilityCategory.Talents;
  if (skillAbilities.includes(ability)) return M20AbilityCategory.Skills;
  return M20AbilityCategory.Knowledges;
}