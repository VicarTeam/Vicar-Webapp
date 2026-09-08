import type {
  IBloodPotencyData,
  IBloodRitual,
  IDiscipline,
  IDisciplineAbility,
  IOblivionCeremony,
  IPredatorType,
  IPTAction,
  ITrait,
  ITraitPack
} from "@/@types/data";
import type {ISectionatedCustomLexicon} from "@/@types/custom-lexicon";
import type {ICharacterSkillTreeState} from "@/@types/skilltree";
import {AvatarOrientation, type IEdition5Sheet} from "@/@types/gameline";

export enum LevelType {
  Attribute,
  Skill,
  NewSpecialization,
  ClanDiscipline,
  OtherDiscipline,
  Trait,
  BloodPotency,
  CaitiffDiscipline
}

export enum CategoryKeys {
  Physical = "physical",
  Social = "social",
  Mental = "mental"
}

const CATEGORY_NAME: Record<CategoryKeys, string> = {
  [CategoryKeys.Physical]: "Körperlich",
  [CategoryKeys.Social]: "Gesellschaftlich",
  [CategoryKeys.Mental]: "Geistig",
}

export function getCategoryName(cat: CategoryKeys | string): string {
  return CATEGORY_NAME[cat] ?? cat
}

export enum AttributeKeys {
  Strength = "str",
  Dexterity = "dex",
  Stamina = "sta",
  Charisma = "cha",
  Manipulation = "man",
  Composure = "com",
  Intelligence = "int",
  Wits = "wit",
  Resolve = "res"
}

const ATTRIBUTE_NAME: Record<AttributeKeys, string> = {
  [AttributeKeys.Strength]: "Körperkraft",
  [AttributeKeys.Dexterity]: "Geschicklichkeit",
  [AttributeKeys.Stamina]: "Widerstandsfähigkeit",
  [AttributeKeys.Charisma]: "Charisma",
  [AttributeKeys.Manipulation]: "Manipulation",
  [AttributeKeys.Composure]: "Fassung",
  [AttributeKeys.Intelligence]: "Intelligenz",
  [AttributeKeys.Wits]: "Geistesschärfe",
  [AttributeKeys.Resolve]: "Entschlossenheit",
}

const ATTRIBUTE_DESC: Record<AttributeKeys, string> = {
  [AttributeKeys.Strength]:
    "Körperkraft bestimmt, wie hoch du einen Sterblichen anheben kannst, wie hart ihn dein Schlag trifft und wie viel Kraft du deinen toten Körper ausüben lassen kannst.",
  [AttributeKeys.Dexterity]:
    "Geschicklichkeit bestimmt deine Beweglichkeit und Anmut, wie schnell du diesem auf dein Herz zielenden Pflock ausweichen kannst und über wie viel Feinmotorik du verfügst, wenn du gegen die Zeit arbeiten musst.",
  [AttributeKeys.Stamina]:
    "Deine körperliche Widerstandskraft: Widerstandsfähigkeit absorbiert körperliche Schäden, wie z. B. eine heranrasende Kugel oder die Klinge eines Jägers und lässt dich Gefahren und mühsame Anstrengungen durchstehen. Deine Widerstandsfähigkeit + 3 entspricht deiner Gesundheit.",
  [AttributeKeys.Charisma]:
    "Charisma bemisst deinen natürlichen Charme, deine Anmut und deinen Sexappeal. Wenn du darüber verfügst, zieht es Personen an, was dir das Trinken um einiges einfacher macht. Charisma hängt nicht mit gutem Aussehen zusammen, denn dies ist ein eigener Vorzug (siehe Erscheinungsbild, S. 179).",
  [AttributeKeys.Manipulation]:
    "Manipulation bezeichnet deine Fähigkeit, andere für deinen Standpunkt zu gewinnen, überzeugend zu lügen und Ahnungslose übers Ohr hauen, ohne dass sich jemand einen Reim darauf machen kann.",
  [AttributeKeys.Composure]:
    "Fassung erlaubt es dir, ruhig zu bleiben, deine Gefühle zu lenken und andere trotz Angst zu beruhigen. Es steht auch für deine Fähigkeit, jederzeit, vom Feuergefecht bis hin zu intimen Begegnungen, gelassen zu bleiben. Deine Fassung + Entschlossenheit ergeben deine Willenskraft (S. 157).",
  [AttributeKeys.Intelligence]:
    "Intelligenz bemisst deine Fähigkeit, zu denken, zu forschen und die Regeln der Logik anzuwenden. Du kannst dich an Informationen aus Büchern oder aus Sinneseindrücken erinnern und sie analysieren. Dem wahrlich Intelligenten kann kein Rätsel oder Geheimnis entgehen.",
  [AttributeKeys.Wits]:
    "Geistesschärfe hilft dabei, schnell zu denken und die richtige Reaktion anhand nur weniger Informationen zu treffen. „Du hörst ein Geräusch“ beschreibt Geistesschärfe; „Du hörst zwei Wachen kommen“ trifft auf Intelligenz zu. Mit Geistesschärfe kannst du einen Hinterhalt erahnen oder die Harpyie am Hof mit einer bissigen Antwort kontern, anstatt erst in der nächsten Nacht auf die bestmögliche Antwort zu kommen.",
  [AttributeKeys.Resolve]:
    "Entschlossenheit steht für Fokus sowie Zielstrebigkeit und misst deine Konzentration und mentale Stärke. Entschlossenheit ist die Grundlage für nächtelange Observationen und blendet Ablenkungen aus. Deine Fassung + Entschlossenheit ergeben deine Willenskraft.",
}

export function getAttributeName(attr: AttributeKeys | string): string {
  return ATTRIBUTE_NAME[attr] ?? attr
}

export function getAttributeDescription(attr: AttributeKeys | string): string {
  return ATTRIBUTE_DESC[attr] ?? ""
}

export function isHumanInteractionAttribute(attr: AttributeKeys | string): boolean {
  return attr === AttributeKeys.Charisma || attr === AttributeKeys.Manipulation;
}

export enum SkillKeys {
  Athletics = "ath",
  Brawl = "bra",
  Craft = "cra",
  Drive = "dri",
  Firearms = "fir",
  Melee = "mel",
  Larceny = "lar",
  Stealth = "ste",
  Survival = "sur",
  AnimalKen = "ken",
  Etiquette = "eti",
  Insight = "ins",
  Intimidation = "int",
  Leadership = "lea",
  Performance = "per",
  Persuasion = "pes",
  Streetwise = "stw",
  Subterfuge = "sub",
  Academics = "aca",
  Awareness = "awa",
  Finance = "fin",
  Investigation = "inv",
  Medicine = "med",
  Occult = "occ",
  Politics = "pol",
  Science = "sci",
  Technology = "tec"
}

const SKILL_NAME: Record<SkillKeys, string> = {
  [SkillKeys.Athletics]: "Sportlichkeit",
  [SkillKeys.Brawl]: "Handgemenge",
  [SkillKeys.Craft]: "Handwerk",
  [SkillKeys.Drive]: "Fahren",
  [SkillKeys.Firearms]: "Schusswaffen",
  [SkillKeys.Melee]: "Nahkampf",
  [SkillKeys.Larceny]: "Diebeshandwerk",
  [SkillKeys.Stealth]: "Heimlichkeit",
  [SkillKeys.Survival]: "Überleben",
  [SkillKeys.AnimalKen]: "Tierkunde",
  [SkillKeys.Etiquette]: "Etikette",
  [SkillKeys.Insight]: "Menschenkenntnis",
  [SkillKeys.Intimidation]: "Einschüchtern",
  [SkillKeys.Leadership]: "Anführen",
  [SkillKeys.Performance]: "Darbietung",
  [SkillKeys.Persuasion]: "Überzeugen",
  [SkillKeys.Streetwise]: "Szenekenntnis",
  [SkillKeys.Subterfuge]: "Ausflüchte",
  [SkillKeys.Academics]: "Geisteswissenschaft",
  [SkillKeys.Awareness]: "Wahrnehmung",
  [SkillKeys.Finance]: "Finanzen",
  [SkillKeys.Investigation]: "Ermitteln",
  [SkillKeys.Medicine]: "Medizin",
  [SkillKeys.Occult]: "Okkultismus",
  [SkillKeys.Politics]: "Politik",
  [SkillKeys.Science]: "Naturwissenschaften",
  [SkillKeys.Technology]: "Technologie",
}

const SKILL_DESC: Record<SkillKeys, string> = {
  [SkillKeys.Athletics]:
    "Mit Sportlichkeit kannst du jemanden bei einer Verfolgung einholen, einem entgegenkommenden Auto aus dem Weg springen und wie ein gesunder, kräftiger Mensch klettern und schwimmen. Ein Charakter kann anstelle einer körperlichen Kampffähigkeit in einem Konflikt auch auf Sportlichkeit würfeln, doch in diesem Fall werden dem Gegner keine Treffer zugefügt, egal wie viele Erfolge erwürfelt werden.",
  [SkillKeys.Brawl]:
    "Handgemenge stellt sicher, dass die Charaktere ihr Ziel treffen, wenn sie mit der Faust, dem Stiefel oder der Kralle angreifen. Solange du keine Waffe in der Hand hast, stellt der Angriff ein Handgemenge dar, vom elegantem Aikijūjutsu bis hin zu schmutzigen Straßenkämpfen.",
  [SkillKeys.Craft]:
    "Handwerk umfasst im Großen und Ganzen Kunstfertigkeit, die Herstellung von Gegenständen und Hilfsmitteln von schön bis funktional und Kunsthandwerk von der gedrehten Feinkeramik bis hin zum Bau und der Verstärkung der eigenen Zuflucht. Wenn du diese Fertigkeit auswählst, bekommst du eine kostenfreie Spezialisierung. Im Gegensatz zu den meisten Fertigkeiten, kannst du bei Handwerk mehr Spezialisierungen haben als Punkte.",
  [SkillKeys.Drive]:
    "Jeder (außer vielleicht ein 500 Jahre alter Vampir) kann lernen, ein Auto zu fahren. Fahren bezeichnet die Fähigkeit, unter widrigen Bedingungen oder in Stresssituationen schnell und sicher zu fahren: im Gelände fahren, mit hoher Geschwindigkeit aus einem Hinterhalt entkommen, Straßenrennen gewinnen und die Zweite Inquisition bei einer Verfolgungsjagd abhängen.",
  [SkillKeys.Firearms]:
    "Ein Opfer mit Löchern im Hals zurücklassen: eine schonungslose Ermittlung der Zweiten Inquisition. Ein Opfer mit Löchern im Kopf zurücklassen: nur ein weiterer Samstagabend in Baltimore. Kainiten benutzen Schusswaffen nicht nur aus menschlichen Gründen (Effizienz und Nervenkitzel), sondern auch, um die Maskerade aufrechtzuerhalten. Diese Fertigkeit umfasst die Vertrautheit mit Handfeuerwaffen, von kleinkalibrigen Pistolen bis hin zu Sturmgewehren. Dazu gehören auch andere Waffen mit Abzug wie Armbrüste und geschulterte Panzerabwehrgranaten. Zudem beinhaltet es das Reinigen, das Beheben von Ladehemmungen und schnelle erneute Laden solcher Waffen.",
  [SkillKeys.Melee]:
    "Du benötigst Nahkampf, um tragbare Waffen wie Messer, Ketten und Baseballschläger mit Geschick einsetzen zu können. Ein Pflock ist eine Nahkampfwaffe, die oft in den Händen von Möchtegernjägern zu finden ist.",
  [SkillKeys.Survival]:
    "Überleben vermittelt die Fähigkeit, in der Wildnis und unter anderen widrigen Umständen zu leben und wieder in die Zivilisation zurückzukehren: mithilfe der Sterne navigieren, der Bau einer provisorischen Zuflucht und das Erkennen von Anzeichen von Werwölfen, ehe es zu spät ist. Einige der damit verbundenen Fähigkeiten, lassen sich auch auf Parks, Industriegebiete und anderes Ödland des Großstadtdschungels anwenden.",
  [SkillKeys.Larceny]:
    "Diese Fähigkeit beinhaltet die Vertrautheit mit den notwendigen Werkzeugen und Techniken zum Öffnen von Schlössern, zum Einsetzen von Wanzen, zum Deaktivieren von Standard-Gebäudesicherungen und Autoalarmanlagen, zum handwerklichen Fälschen, zum Kurzschließen von Fahrzeugen oder sogar zum Aufbrechen von Tresoren sowie unzähligen Formen des Einbruchs. Charaktere verwenden diese Fähigkeit auch, um „unüberwindbare“ Sicherheitssysteme einzurichten oder festzustellen, wie und wo Systeme beim Einbruch versagt haben. Ventrue nennen diese Fähigkeit höchstwahrscheinlich nur „Sicherheit“. Heutzutage verfügen die meisten HighEndSicherheitssysteme über Computersteuerungen, Videoüberwachung oder elektronische Alarme, sodass zur Überwindung dieser Systeme auch die Fähigkeit Technologie notwendig sein könnte.",
  [SkillKeys.Stealth]:
    "Mit Heimlichkeit kann ein Charakter sein Ziel beschatten, was aus Vampiren mit dieser Fertigkeit unübertreffliche Jäger macht. Du profitierst von dieser Fähigkeit beim Spionieren , Schleichen und wenn du in der Menge untertauchen möchtest.",
  [SkillKeys.AnimalKen]:
    "Mit Tierkunde kannst du Tiere zähmen, beruhigen und sogar Freundschaft mit ihnen schließen. Mit dieser Fertigkeit kannst du vorhersehen, wie ein Tier in einer bestimmten Situation reagieren könnte, eine gezähmtes Tier abrichten, trainieren oder sogar versuchen, Tiere zu beruhigen oder wild zu machen. Ohne diese Fähigkeiten meiden die meisten Kreaturen die Nähe von Vampiren gezielt oder werden sogar aggressiv.",
  [SkillKeys.Etiquette]:
    "Etikette stellt die Fähigkeit dar, gesellschaftliche Konventionen in der aktuellen Szene zu erkennen und darauf einzugehen, neue Protokolle aufzusetzen und dein Umfeld mit deinen guten Umgangsformen zu erfreuen. Nutze diese Fähigkeit sowohl in der Blutsverwandtenals auch in der Sterblichen High Society.",
  [SkillKeys.Insight]:
    "Mithilfe von Menschenkenntnis kannst du die Körpersprache anderer interpretieren, auf subtile Hinweise in ihrem Ausdruck und Tonfall achten und Lüge von Wahrheit unterscheiden. Sie erlaubt dir auch, die Motive hinter den Handlungen eines anderen zu sehen und zu verstehen.",
  [SkillKeys.Intimidation]:
    "Einschüchtern ist die notwendige Fähigkeit, um mit Mobbing, Schikane, Drohungen und Zwang zum gesellschaftlichen Erfolg zu gelangen. Vampire, die auf Einschüchtern setzen, zögern nicht, den Willen — und gelegentlich auch die Finger — ihrer Widersacher zu brechen.",
  [SkillKeys.Leadership]:
    "Anführen verleiht dir die Fähigkeit, eine Menge zu lenken, eine Abteilung zu leiten, die Moral deiner Anhänger zu steigern oder einen Aufstand zu unterbinden. Ein starker Prinz oder Baron muss über Anführen verfügen oder er riskiert, seinen Thron zu verlieren.",
  [SkillKeys.Performance]:
    "Darbietung umfasst eine Reihe von Künsten, von Tanz über Poesie und Komödie bis hin zum Geschichtenerzählen. Du könntest ein inspirierter Künstler sein, der sein Glück in die eigene Hand nimmt oder einfach nur ein sehr enthusiastischer Studierender der Künste. Wenn du diese Fertigkeit auswählst, bekommst du eine kostenfreie Spezialisierung.",
  [SkillKeys.Persuasion]:
    "Dies ist die Fähigkeit, um andere davon zu überzeugen, dass du weißt, was gut für sie ist und dass dieser kleine Biss schon nicht weh tun wird. Ist diese Fähigkeit ausgeprägt, kann man mit den Emotionen des Opfers spielen und an anderer Leute Vernunft appellieren. Überzeugen braucht es bei Gericht und an Prinzenhöfen, in Sitzungssälen, Bars und im Schlafzimmer.",
  [SkillKeys.Streetwise]:
    "Szenekenntnis ermöglicht es den Charakteren, auf der Straße und in der Unterwelt den richtigen Ton anzuschlagen und zu verhandeln. Du verstehst Codewörter und Slang, kannst GraffitiTags interpretieren und Erkennungszeichen von Banden nachahmen.",
  [SkillKeys.Subterfuge]:
    "Ausflüchte sind die Kunst der überzeugenden Lügen, des Fabulierens und der guten Ausreden für böse Taten. Diese Fähigkeit beschreibt dein Talent für Intrige, Geheimnisse und Betrügereien. Ausflüchte kann auch zur Verführung und der Nachahmung sterblichen Verhaltens eingesetzt werden.",
  [SkillKeys.Academics]:
    "Geisteswissenschaften spiegeln Verständnis, höhere Bildung und die Fähigkeit der Recherche in humanistischen und freuen Künsten wider. Historische Studien sind beispielsweise kaum als „ausschließlich geisteswissenschaftlich“ zu betrachten, wenn deine unsterblichen Feinde zu dieser Zeit gelebt und ihre Spuren zu der Zeit hinterlassen haben. Wenn du diese Fertigkeit auswählst, bekommst du eine kostenfreie Spezialisierung. Für Fremdsprachen verwende den Vorzug Linguistik (S. 179).",
  [SkillKeys.Awareness]:
    "Wahrnehmung bezeichnet die Schärfe deiner Sinne. Du könntest ein Kind Haqims entdecken, ehe es zuschlägt, einen Schlüssel in einem Haufen Müll finden oder den letzten Hauch eines Parfums wahrnehmen.",
  [SkillKeys.Finance]:
    "Mit Finanzen kannst du Trends am Markt erkennen, richtig investieren, Aktien manipulieren und vorhersehen, wann der Einbruch eintritt. Du kannst damit auch das Vermögen anderer einschätzen — und es zurückverfolgen — und bei finanziellen Transaktionen vermitteln. Du kannst im allgemeinen Kunst, Vermögen und andere nicht kriminelle Güter bewerten. Ventrue schätzen diese Fähigkeit höher als manche Disziplinen.",
  [SkillKeys.Investigation]:
    "Mit Hilfe von Ermitteln kannst du alltägliche mysteriöse Fälle aufdecken, Hinweise entdecken, sie deuten und vermisste Personen aufspüren. Vampire schätzen diese Fähigkeit immer dann besonders, wenn ein Gefäß entkommt.",
  [SkillKeys.Medicine]:
    "Mit Medizin kannst du verletzte Menschen behandeln und die Ursachen von Tod oder Krankheit bei einem Opfer diagnostizieren. Sie ermöglicht dir auch, medizinische Geräte zu verwenden, Medikamente zu verschreiben und einen schnellen Blutverlust zu stoppen (oder zu verstärken). Charaktere verwenden Medizin, um Schweren Schaden bei Sterblichen zu heilen (siehe S. 127).",
  [SkillKeys.Occult]:
    "Okkultismus steht für das Wissen um die mystische Welt, das von den Riten und Praktiken der Freimaurer und Rosenkreuzer bis hin zu noddistischen Gelehrten und echten Magiern reicht. Du kannst okkulte Siegel und heidnische Praktiken der Magie erkennen, ob sie nun wirken oder nicht.",
  [SkillKeys.Politics]:
    "Politik schließt Bürokratie und Diplomatie ein: sowohl menschliche als auch Blutsverwandte. Du kannst solide mit der Stadtverwaltung zusammenarbeiten, vielleicht auch mit höheren Ebenen, und möglicherweise sogar Druck auf sie ausüben. Bei den Blutsverwandten kennst du die aktuellen InsiderInformationen, welche Sekten wo dominieren, wer mit wem im Krieg liegt und wo die Leichen begraben liegen. Buchstäblich.",
  [SkillKeys.Science]:
    "Naturwissenschaften sind ein weites Feld, sie decken die einfachen Prinzipien des Lebens ab, reichen aber auch bis zum Verständnis der Entropie des Universums. Die Gesetze der Wissenschaft regieren die sterbliche Welt, weshalb Vampire, die gerne über diese Welt herrschen wollen, sie genauer studieren. Die Stufen der naturwissenschaftlichen Fähigkeiten entsprechen in etwa denen der Geisteswissenschaften, und gehen von „irgendeiner Universität“ bis hin zu „weltberühmten Gelehrten“ Ebenso wie Geisteswissenschaften erhalten Charaktere mit einem Wert in Naturwissenschaften eine kostenlose Spezialisierung.",
  [SkillKeys.Technology]:
    "Die Grenzen der Fähigkeit Technologie sind eher fließend: sie umfasst den Umgang mit und das Verständnis von „technischen Entwicklungen, die die meisten Vampire für unerklärlich halten“. Im Jahr 1870 könnte sie Dampfmaschinen und Elektrizität betroffen haben; in den heutigen Nächten geht es eher um Computer und Computersysteme. Natürlich regeln heute Computer nahezu alles, einschließlich Dampfturbinen in Kraftwerken und elektrischen Systemen in Bürogebäuden.",
}

const SKILL_SPEC: Record<SkillKeys, string> = {
  [SkillKeys.Athletics]: "Akrobatik, Bogenschießen, Klettern, Ausdauer, Springen, Parkour, Schwimmen, Werfen",
  [SkillKeys.Brawl]:
    "Tiere, Bewaffnete Sterbliche, Kneipenschlägereien, Ringen, Blutsverwandte, Sportlicher Kampf, Unbewaffnete Sterbliche, Werwölfe, in verwandelter Tiergestalt",
  [SkillKeys.Craft]: "Tischlerei, Schnitzen, Design, Malerei, Bildhauerei, Nähen, Waffenschmiedekunst",
  [SkillKeys.Drive]: "Geländefahrzeuge, Ausweichen, Motorräder, Straßenrennen, Stunts, Beschatten, Lastwagen, VintageModelle",
  [SkillKeys.Firearms]: "Armbrüste, Waffenhandel, Büchsenmacher, Munition Wiederladen, Schnell Ziehen, Scharfschütze, Trickschießen",
  [SkillKeys.Melee]: "Äxte, Ketten, Keulen, Fechten, Entwaffnen, Garrote, Improvisierte Waffen, Messer, Pflöcke, Schwerter",
  [SkillKeys.Survival]: "Wüste, Jagd, Dschungel, Spurensuche, Fallen, Unterschlupf, Erkundung der Stadt, Wälder",
  [SkillKeys.Larceny]: "Alarme, Fälschung, Autodiebstahl, Einbruch, Schlösser knacken, Taschendiebstahl, Tresorknacken, Sicherheitsanalyse",
  [SkillKeys.Stealth]: "Hinterhalte, Menschenmassen, Verkleidung, Verstecken, Beschatten, Leise Bewegung, Stadt, Wildnis",
  [SkillKeys.AnimalKen]: "Abrichten, Katzen, Hunde, Falknerei, Pferde, Besänftigen, Ratten, Schlangen, Stunt Training, Wölfe",
  [SkillKeys.Etiquette]: "Anarchen, Camarilla, Prominente, Unternehmen, Elysium, Feudal, Die oberen 10.000, Geheimgesellschaft",
  [SkillKeys.Insight]: "Ambitionen, Wünsche, Lügen erkennen, Emotionen, Empathie, Verhör, Motive, Phobien, Laster",
  [SkillKeys.Intimidation]: "Erpressung, Beleidigungen, Verhöre, Körperliche Nötigung, Niederstarren, Verschleierte Drohungen",
  [SkillKeys.Leadership]: "Kommandieren, Inspiration, Rhetorik, Praxis, Gruppendynamiken, Kriegsrudel",
  [SkillKeys.Performance]:
    "Komödie, Tanz, Drama, Schlagzeug, Gitarre, Keyboards, Poesie, Öffentliche Ansprachen, Rap, Gesang, Geige, Blasinstrumente",
  [SkillKeys.Persuasion]: "Verhandeln, Schnellreden, Verhör, Juristische Argumentation, Verhandlung, Rhetorik",
  [SkillKeys.Streetwise]:
    "Waffenhandel, Schwarzmarkt, Bestechung, Drogen, Hehlerei, Gangs, Graffiti, Vormund, Menschenhandel, Überleben in der Stadt",
  [SkillKeys.Subterfuge]: "Bluff, Sterblichkeit vortäuschen, Tadelloses Lügen, Unschuld, Von langer Hand geplant, Verführung",
  [SkillKeys.Academics]:
    "Architektur, Englische Literatur, Kunstgeschichte, Geschichte (spezifisches Fachgebiet oder Periode), Journalismus, Philosophie, Forschung, Lehre, Theologie",
  [SkillKeys.Awareness]: "Hinterhalte, Tarnung, Verborgene Gegenstände, Hören, Instinkte, Geruch, Sicht, Fallen, Wildnis",
  [SkillKeys.Finance]:
    "Gutachten, Bankwesen, Schwarzmärkte, Unternehmensfinanzen, Manipulation von Währungen, Kunst, Wirtschaftsprüfung, Geldwäsche, Aktienmarkt",
  [SkillKeys.Investigation]: "Kriminologie, Schlussfolgerungen, Forensik, Vermisste Personen, Mord, paranormale Geheimnisse, Verkehrsanalyse",
  [SkillKeys.Medicine]: "Erste Hilfe, Hämatologie, Pathologie, Pharmazie, Phlebotomie, Chirurgie, Unfallhilfe, Tiermedizin",
  [SkillKeys.Occult]: "Alchemie, Blutmagie, Feen, Geister, Grimoires, Infernalismus, Magi, Nekromantie, Noddismus, Parapsychologie, Voudun, Werwölfe",
  [SkillKeys.Politics]: "Anarchen, Camarilla, Stadtverwaltung, Clan (spezifisch), Diplomatie, Medien, Nationale Politik, Landesund Kommunalpolitik",
  [SkillKeys.Science]: "Astronomie, Biologie, Chemie, Gebäudeabriss, Ingenieurwesen, Genetik, Geologie, Mathematik, Physik",
  [SkillKeys.Technology]:
    "Artillerie, Coden, Aufbau von Computern, Data Mining, Hacking, Netzwerke, Telefone, Überwachungssysteme",
}

export function getSkillName(skill: SkillKeys | string): string {
  return SKILL_NAME[skill] ?? skill
}

export function getSkillDescription(skill: SkillKeys | string): string {
  return SKILL_DESC[skill] ?? ""
}

export function getSkillSpecializations(skill: SkillKeys | string): string {
  return SKILL_SPEC[skill] ?? ""
}

export function isHumanInteractionSkill(skill: SkillKeys): boolean {
  return skill === SkillKeys.Persuasion
    || skill === SkillKeys.Intimidation
    || skill === SkillKeys.Subterfuge
    || skill === SkillKeys.Leadership
    || skill === SkillKeys.Performance
    || skill === SkillKeys.Etiquette
    || skill === SkillKeys.Insight;
}

export enum Sex {
  Male = 'm',
  Female = 'f',
  Divers = 'd'
}

export function getSexName(sex: Sex | string): string {
  switch (sex) {
    case Sex.Male:
      return "männlich";
    case Sex.Female:
      return "weiblich";
    default:
      return "divers";
  }
}

export enum Generation {
  Children = "children",
  Newborn = "newborn",
  Ancillae = "ancillae",
  Older = "older",
  Elder = "elder",
  CainesInheritance = "cainesinheritance"
}

export function getGenerationName(gen: Generation | string): string {
  switch (gen) {
    case Generation.Children:
      return "Kinder";
    case Generation.Newborn:
      return "Neugeborene";
    case Generation.Ancillae:
      return "Ancillae";
    case Generation.Older:
      return "älter/benutzerdefiniert";
    case Generation.Elder:
      return "Methusa/Antediluvian";
    case Generation.CainesInheritance:
      return "Kains Erbe";
    default:
      return gen;
  }
}

export enum DamageType {
  None = "none",
  Superficial = "superficial",
  Heavy = "heavy",
  Full = "full"
}

export const SortedSkillsAndAttribute = {
  [CategoryKeys.Physical]: {
    attributes: [AttributeKeys.Strength, AttributeKeys.Dexterity, AttributeKeys.Stamina],
    skills: [
      SkillKeys.Athletics,
      SkillKeys.Brawl,
      SkillKeys.Craft,
      SkillKeys.Drive,
      SkillKeys.Firearms,
      SkillKeys.Melee,
      SkillKeys.Larceny,
      SkillKeys.Stealth,
      SkillKeys.Survival
    ]
  },
  [CategoryKeys.Social]: {
    attributes: [AttributeKeys.Charisma, AttributeKeys.Manipulation, AttributeKeys.Composure],
    skills: [
      SkillKeys.AnimalKen,
      SkillKeys.Etiquette,
      SkillKeys.Insight,
      SkillKeys.Intimidation,
      SkillKeys.Leadership,
      SkillKeys.Performance,
      SkillKeys.Persuasion,
      SkillKeys.Streetwise,
      SkillKeys.Subterfuge
    ]
  },
  [CategoryKeys.Mental]: {
    attributes: [AttributeKeys.Intelligence, AttributeKeys.Wits, AttributeKeys.Resolve],
    skills: [
      SkillKeys.Academics,
      SkillKeys.Awareness,
      SkillKeys.Finance,
      SkillKeys.Investigation,
      SkillKeys.Medicine,
      SkillKeys.Occult,
      SkillKeys.Politics,
      SkillKeys.Science,
      SkillKeys.Technology
    ]
  }
};

export function fillDefaults<T extends object>(given: T, defaults: T): T {
  for (let key in given) {
    given[key] = given[key] || defaults[key];
  }
  return given;
}

export interface ILanguage {
  readonly key: string;
  readonly books: IBook[];
  readonly bloodPotencyTable: IBloodPotencyData[];
  readonly bloodRituals: IBloodRitual[];
  readonly oblivionCeremonies: IOblivionCeremony[];
  readonly customLexicon: ISectionatedCustomLexicon;
  readonly items: IGroupItems[];
}

export interface IBook {
  readonly id: number;
  readonly clans: IClan[];
  readonly merits: ITraitPack[];
  readonly backgrounds: ITraitPack[];
  readonly predatorTypes: IPredatorType[];
}

export interface IClan {
  readonly id: number;
  readonly name: string;
  readonly slogan: string;
  readonly description: string;
  readonly curse: string;
  readonly disciplines: IDiscipline[];
  readonly actions: IPTAction[];
  symbol?: string;
  readonly difficulty?: number;
  readonly tips?: string[];
}

export interface IUsingTraitPack {
  pack: ITraitPack;
  traits: ILockableTrait[];
  flawTraits: ILockableTrait[];
}

export interface IUsingTraitPacks {
  packs: IUsingTraitPack[];
}

export interface ILockableTrait extends ITrait {
  isLocked: boolean;
  isManual: boolean;
  customLevel?: number;
  suffix?: string;
}

export interface ILeveledDisciplineAbility extends IDisciplineAbility {
  level: number;
  usedLevel: number;
}

export interface IDisciplineSelection {
  discipline: IDiscipline;
  points: number;
  currentLevel: number;
  abilities: ILeveledDisciplineAbility[];
}

export interface IRequiredPointSpread {
  type: "backgrounds" | "merits";
  isFlaw: boolean;
  points: number;
  packId: number;
}

export interface ICharacterDirectory {
  id: string;
  name: string;
  open: boolean;
}

/**
 * Ein echter, verschachtelbarer Charakter-Ordner. Anders als die alte
 * `directory`-Zeichenkette am Charakter ist ein Ordner eine eigene Entitaet:
 * er kennt seinen Elternordner (Verschachtelung), seine Geschwister-Position
 * (freie Sortierung) und die geordneten IDs der enthaltenen Charaktere. Der
 * Charakter selbst wird davon nicht veraendert. `open` ist reiner UI-Zustand.
 */
export interface IFolder {
  id: string;
  name: string;
  parentId: string;
  position: number;
  characters: string[];
  open?: boolean;
}

export const CurrentCharacterVersion = 2;

export enum V5Resonance {
  Empty = "", // none
  Choleric = "choleric",
  Melancholic = "melancholic",
  Phlegmatic = "phlegmatic",
  Sanguine = "sanguine",
  AnimalBlood = "animalblood",
  Void = "void",
}

export function getResonanceByIndex(index: number): V5Resonance {
  switch (index) {
    case 1:
      return V5Resonance.Choleric;
    case 2:
      return V5Resonance.Melancholic;
    case 3:
      return V5Resonance.Phlegmatic;
    case 4:
      return V5Resonance.Sanguine;
    case 5:
      return V5Resonance.AnimalBlood;
    case 6:
      return V5Resonance.Void;
    default:
      return V5Resonance.Empty;
  }
}

export enum V5ResonanceTemperament {
  Negligible = "negligible",
  Fleeting = "fleeting",
  Intense = "intense",
  Acute = "acute",
  Dyscrasia = "dyscrasia"
}

export function getResonanceTemperamentByIndex(index: number): V5ResonanceTemperament {
  switch (index) {
    case 1:
      return V5ResonanceTemperament.Negligible;
    case 2:
      return V5ResonanceTemperament.Fleeting;
    case 3:
      return V5ResonanceTemperament.Intense;
    case 4:
      return V5ResonanceTemperament.Acute;
    case 5:
      return V5ResonanceTemperament.Dyscrasia;
    default:
      return V5ResonanceTemperament.Negligible;
  }
}

export function getResonanceTemperamentName(temperament: V5ResonanceTemperament | string): string {
  switch (temperament) {
    case V5ResonanceTemperament.Negligible:
      return "vernachlässigbar";
    case V5ResonanceTemperament.Fleeting:
      return "flüchtig";
    case V5ResonanceTemperament.Intense:
      return "intensiv";
    case V5ResonanceTemperament.Acute:
      return "akut";
    case V5ResonanceTemperament.Dyscrasia:
      return "Dyskrasie";
    default:
      return temperament;
  }
}

export interface ICharacter extends IEdition5Sheet {
  books: number[];
  predatorType: IPredatorType;
  chronicle: string;
  ambition: string;
  clan: IClan;
  disciplines: IDisciplineSelection[];
  sire: string;
  desire: string;
  generationEra: Generation;
  generation: number;
  hunger: number;
  humanity: number;
  stains?: number;
  resonance?: V5Resonance;
  resonanceTemperament?: V5ResonanceTemperament;
  bloodPotency: number;
  chroniclePrinciples: string;
  anchorsAndBeliefs: string;
  backstory: string;
  notes: string;
  bloodRituals: IBloodRitual[];
  oblivionCeremonies: IOblivionCeremony[];
  useAdavancedDisciplines: boolean;
  allowLearningOfAllPowers: boolean;
  fullCustomization: boolean;
  version: number;
  usedExp: number;
  connectedFoundryId?: string;
  cache?: { [key: string]: any };
  hasCainsMark?: boolean;
  cainsMarkLevel?: -5 | -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5;
  /** Eingelöste Custom Skill Trees mit Freischalt-Zustand (siehe @/@types/skilltree). */
  skillTrees?: ICharacterSkillTreeState[];
  /** Generische Wallet eingelöster Bonus Codes (verallgemeinert das frühere KAINS_MAL-Sonderverhalten). */
  activeBonusCodes?: string[];
}

export interface ICategory {
  readonly name: CategoryKeys;
  readonly attributes: IAttributeData[];
  readonly skills: ISkillData[];
}

export interface IAttributeData {
  key: AttributeKeys;
  value: number;
}

export interface ISkillData {
  key: SkillKeys;
  value: number;
  specialization: string[];
}

export interface IInventory {
  carriedItems: IItemStack[];
  ownedItems: IItemStack[];
  bank: number;
  cash: number;
}

export interface IItemStack {
  item: IItem;
  amount: number;
}

export interface IItem {
  isCustom: boolean;
  name: string;
  description: string;
  category: string;
}

export interface IGroupItems {
  category: string;
  items: IItem[];
}

export const DefaultDamageArray: () => DamageType[] = () => {
  const arr: DamageType[] = [];
  for (let i = 0; i < 10; i++) {
    arr.push(DamageType.None);
  }
  return arr;
};

export const DefaultCharacter: () => ICharacter = () => ({
  id: "",
  requiredPointSpreads: [],
  bloodRituals: [],
  ambition: "",
  avatar: "",
  bloodPotency: 0,
  books: [],
  categories: Object.values(CategoryKeys).map(key => {
    const category: ICategory = {
      name: key,
      attributes: [],
      skills: []
    };

    SortedSkillsAndAttribute[key].attributes.forEach(attribute => {
      category.attributes.push({key: attribute, value: 0});
    });

    SortedSkillsAndAttribute[key].skills.forEach(skill => {
      category.skills.push({key: skill, value: 0, specialization: []});
    });

    return category;
  }),
  avatarOrientation: AvatarOrientation.Center,
  disciplines: [],
  chronicle: "",
  clan: undefined!,
  concept: "",
  desire: "",
  generationEra: Generation.Children,
  generation: 0,
  health: 0,
  healthDamage: DefaultDamageArray(),
  humanity: 7,
  hunger: 0,
  name: "",
  stains: 0,
  predatorType: undefined!,
  skillspread: undefined!,
  resonance: V5Resonance.Empty,
  sire: "",
  willpower: 0,
  willpowerDamage: DefaultDamageArray(),
  sex: Sex.Divers,
  exp: 0,
  merits: {
    packs: []
  },
  backgrounds: {
    packs: []
  },
  oblivionCeremonies: [],
  chroniclePrinciples: "",
  anchorsAndBeliefs: "",
  backstory: "",
  notes: "",
  useAdavancedDisciplines: false,
  allowLearningOfAllPowers: false,
  fullCustomization: false,
  version: CurrentCharacterVersion,
  usedExp: 0,
  inventory: {
    carriedItems: [],
    ownedItems: [],
    cash: 0,
    bank: 0
  },
  skillTrees: [],
  activeBonusCodes: []
});

export function getHumanInteractionMalus(char: ICharacter): number {
  if (char.humanity === 0) {
    return Number.MIN_SAFE_INTEGER;
  }
  if (char.humanity === 1) {
    return 8;
  }
  if (char.humanity === 2) {
    return 6;
  }
  if (char.humanity === 3) {
    return 4;
  }
  if (char.humanity === 4) {
    return 2;
  }
  if (char.humanity === 5) {
    return 1;
  }
  return 0;
}