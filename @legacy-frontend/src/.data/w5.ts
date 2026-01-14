import {
  convertTalismansIntoTraits,
  IW5Auspice,
  IW5Gift,
  IW5Rite,
  IW5Talisman,
  IW5Tribe,
  IWerewolfW5Sheet,
  W5GiftCategory,
  W5RenownKey
} from "@/types/w5";
import {ITraitPack, TraitSpecialRules} from "@/types/data";

export function getAvailableGiftsForCharacter(char: IWerewolfW5Sheet): IW5Gift[] {
  const ret: IW5Gift[] = gifts.filter(x => x.category === W5GiftCategory.Native || (x.category === W5GiftCategory.Auspice && x.onlyFor && char.auspice?.id === x.onlyFor));
  if (char.tribe) {
    for (const tribeGift of char.tribe.availableGifts) {
      if (Array.isArray(tribeGift)) {
        const gift = gifts.find(x => x.id === tribeGift[0]);
        if (gift && !ret.find(x => x.id === gift.id)) {
          ret.push({
            ...gift,
            totalRenown: tribeGift[1]
          });
        }
      } else {
        const gift = gifts.find(x => x.id === tribeGift);
        if (gift && !ret.find(x => x.id === gift.id)) {
          ret.push(gift);
        }
      }
    }
  }
  return ret;
}

export const auspices: IW5Auspice[] = [
  {
    id: 1,
    key: "ragabash",
    name: "Ragabash",
    description: "Neumond - Als Ragabash bist du der Trickster des Rudels: Fragesteller, Regelbrecher und Unruhestifter. Du stellst Autoritäten in Frage, deckst Schwächen auf und zeigst neue Wege. Deine Aufgabe ist es, sicherzustellen, dass niemand zu starr oder arrogant wird.",
  },
  {
    id: 2,
    key: "theurge",
    name: "Theurge",
    description: "Halbmond (zunehmend/abnehmend) - Als Theurge bist du der Mystiker und Schamane. Du hast einen besonderen Draht zu den Geistern, kennst Rituale und suchst die Nähe der spirituellen Welt. Deine Aufgabe ist es, die Verbindung zur Umbra zu pflegen und das Rudel bei spirituellen Fragen zu führen.",
  },
  {
    id: 3,
    key: "philodox",
    name: "Philodox",
    description: "Halbmond (genau halb) - Als Philodox bist du der Richter und Vermittler. Du stehst für Ausgleich, Gesetz und Tradition. Du schlichtest Streit, erinnerst das Rudel an seine Pflichten und triffst schwere Entscheidungen, wenn Moral und Pflicht kollidieren.",
  },
  {
    id: 4,
    key: "galliard",
    name: "Galliard",
    description: "Dreiviertelmond - Als Galliard bist du der Skalde und Erzähler. Du führst das Rudel mit Geschichten, Liedern und Leidenschaft. Du bewahrst die Legenden der Garou, erinnerst an ihre Siege – und gibst ihnen mit Worten Mut und Feuer.",
  },
  {
    id: 5,
    key: "ahroun",
    name: "Ahroun",
    description: "Vollmond - Als Ahroun bist du der Krieger. Du führst an vorderster Front, bist im Kampf unerschütterlich und gibst dem Rudel Stärke. Deine Aufgabe ist es, den Feind zu stellen, Gefahren nicht zu scheuen und in der Schlacht den Takt anzugeben.",
  }
];

export const tribes: IW5Tribe[] = [
  {
    id: 1,
    name: "Black Furies",
    description: "Die Black Furies sind ein Stamm, der dafür bekannt ist, Hindernisse zu umgehen oder zu überwinden, seien es physische Barrieren oder metaphorische wie die „gläserne Decke“. Sie legen im Allgemeinen großen Wert auf Gerechtigkeit, insbesondere für diejenigen, die aufgrund der Handlungen anderer benachteiligt sind. Für die Black Furies gibt es nichts Abstoßenderes als Menschen, die ihre Position ausnutzen, um weniger Glücklichen zu schaden. Sie wollen das Gleichgewicht wiederherstellen und gehen dafür bis zum Äußersten, was den Namen „Furies” (Wutgeister) in ihrem Namen rechtfertigt. Selbst innerhalb der Garou haben sie den Ruf, Situationen zu eskalieren, wenn ein Kompromiss ihnen kein sofortiges Ergebnis bringt. Wenn sie zu sehr provoziert werden, könnten sie um jeden Preis Gerechtigkeit suchen. Beispielsweise sehen sie keinen Sinn darin, ein Chemieunternehmen davon zu überzeugen, weniger Schadstoffe ins Wasser zu leiten, wenn sie stattdessen das gesamte Gebäude niederbrennen könnten.",
    patron: {
      name: "Gorgone",
      description: "Der Schutzgeist der Black Furies ist die Gorgone. Die Gorgone, die von einem mächtigeren Geist ungerecht behandelt wurde, begab sich auf einen Weg der Rache, und diejenigen, die ihre Gunst suchen, müssen gegen einen vermeintlichen Machtmissbrauch vorgehen. Die Gorgone wird mit Ruhm in Verbindung gebracht, insbesondere mit dem Ruhm, den man erlangt, wenn man jemanden oder etwas in einer Position systemischer Macht zu Fall bringt."
    },
    ban: "Wenn ein Black Fury eine Ungerechtigkeit zulässt, obwohl er sie hätte verhindern oder angehen können, kann er zu Beginn der nächsten Sitzung nur einen einzigen Willenskraftpunkt wiederherstellen.",
    favor: "Ein Spieler der Black Furies kann einen Würfel zu einem Pool hinzufügen, der dazu dient, jemanden oder etwas in einer Machtposition (im Verhältnis zu ihm selbst oder einer ihm anvertrauten Person) zu bekämpfen oder zu umgehen.",
    status: "nation",
    availableGifts: [73, 74, 75, 76, 77, [61, 3], [39, 3], [58, 9], [34, 9], [24, 9]],
    renown: W5RenownKey.Glory
  },
  {
    id: 2,
    name: "Bone Gnawers",
    description: "Die Bone Gnawers versuchen, alles Verborgene aufzudecken, seien es Geheimnisse, Abkürzungen oder alles, was sie zu ihrem Vorteil nutzen können. Sie sind geschickt darin, sich in aller Öffentlichkeit zu verstecken, leben in der Regel in Gruppen mit niedrigem sozioökonomischem Status und sind für diejenigen, die sich über diese Gruppen erhaben fühlen, meist unsichtbar. Da sie sich unbemerkt unter der Masse bewegen, werden sie oft als Ausgestoßene betrachtet, was sogar innerhalb der Garou-Kultur zutrifft. Es ist keine Überraschung, dass sie sich oft als Teil der Gegenkulturen oder der benachteiligten Teile der Gesellschaft wiederfinden.",
    patron: {
      name: "Ratte",
      description: "Der Schutzgeist der Knochenknacker ist die Ratte – klug und gewitzt, oft unerwünscht, wo immer sie auch hingeht, unsichtbar unterwegs. Die Ratte wird mit Ehre in Verbindung gebracht."
    },
    ban: "Wenn ein Bone Gnawer eine wichtige Gelegenheit verpasst, Benachteiligten zu helfen, erhält er zu Beginn der nächsten Sitzung nur einen einzigen Willenskraftpunkt zurück.",
    favor: "Bone Gnawer kann einen Würfel zu einem Pool hinzufügen, der dazu dient, etwas Verlorenes oder Übersehenes zu finden.",
    status: "nation",
    availableGifts: [78, 79, 80, 81, 82, [13, 3], [62, 3], [28, 3], [44, 6], [59, 9]],
    renown: W5RenownKey.Honor
  },
  {
    id: 3,
    name: "Children of Gaia",
    description: "Die Children of Gaia bemühen sich in der Regel, das große Geheimnis von Gaia zu verstehen, weshalb sie sich oft zur Umbra hingezogen fühlen. Existentialistische Fragen, beispielsweise zur Natur des Dienstes der Werwölfe an Gaia, prägen den Stamm und sein Streben nach Wissen. Die Children of Gaia sehen sich häufig als das Gewissen, das die Wut der Garou begleiten muss, da die Garou ohne dieses Gewissen zu Monstern würden, wie sie die Welt sieht, wenn Delirium nachlässt. Das bedeutet nicht, dass sie Pazifisten sind – stattdessen betrachten sie die Wut in der Regel als eine Kraft der Natur, wie einen Hurrikan oder eine Flut – eine Kraft, die zerstören kann, aber diese Zerstörung könnte letztendlich positive Auswirkungen auf das Gleichgewicht der Welt und auf Gaia selbst haben.",
    status: "nation",
    patron: {
      name: "Einhorn",
      description: "Das Einhorn, ein Schutzgeist der Children of Gaia, wird selbst als Mysterium und Wunder für die moderne Welt und die Menschen, die sie bewohnen, wahrgenommen. Als Geist mysteriöser und schwer fassbarer Orte symbolisiert es das Streben nach Wunderbarem und Geheimnisvollem, für das sein Stamm bekannt ist. Das Einhorn ist bekannt für seine Weisheit."
    },
    ban: "Wenn Children of Gaia lügen, irreführen oder auf andere Weise die Wahrheit verbergen müssen, um einen persönlichen Vorteil zu erlangen, erhalten sie zu Beginn der nächsten Sitzung nur einen Willenskraftpunkt.",
    favor: "Children of Gaia können einen Würfel zu den Würfelpools für Bewusstsein oder Menschenkenntnis hinzufügen, wenn es darum geht, etwas über eine bestimmte Person, ein Tier oder einen Geist zu erfahren.",
    availableGifts: [83, 84, 85, 86, 87, [26, 3], [40, 3], [52, 3], [18, 6], [71, 9]],
    renown: W5RenownKey.Wisdom
  },
  {
    id: 4,
    name: "Galestalkers",
    description: "Der Name „Galestalker“ leitet sich vom Wind ab, der über die Tundra weht. Galestalker sind in der Regel als unermüdliche Fährtenleser bekannt, die ihr Ziel niemals aus den Augen verlieren. Auch wenn alle Garou Raubtiere sind, die Beute jagen können, sind Galestalker im Vergleich zu anderen Werwölfen besonders gut darin, ihre Beute zu verfolgen und zu töten Sie scheuen in der Regel keine Mühen, um das, was sie bei der Jagd verfolgen, zurückzubringen, und das Rudel weiß, dass man sich auf sie verlassen kann, wenn es um die ihnen übertragenen Aufgaben geht. Ihr Wort ist ihr Band, und obwohl die Kernkompetenz der Galestalker das Jagen und Töten ist, bringen sie eine gefangene Beute zurück, wenn sie dies versprochen haben.",
    status: "nation",
    patron: {
      name: "Nordwind",
      description: "Der Schutzgeist der Galestalker ist der Nordwind, der ebenso unermüdlich, geduldig und unaufhaltsam ist. Der damit verbundene Ansehenstyp ist Ehre – wenn sich Galestalker zu einer Handlung verpflichten, können sich andere darauf verlassen."
    },
    ban: "An jedem Tag, an dem der Galestalker keine frische Beute verspeist (unabhängig davon, ob es sich um seine Beute handelt oder nicht), erhält er zu Beginn der nächsten Sitzung nur einen Willenskraftpunkt.",
    favor: "Galestalker können einen Würfel zu einem Pool hinzufügen, der in direktem Zusammenhang mit der Verfolgung ihrer Beute steht.",
    availableGifts: [88, 89, 90, 91, 92, [28, 3], [53, 6], [19, 6], [68, 6], [46, 9]],
    renown: W5RenownKey.Honor
  },
  {
    id: 5,
    name: "Ghost Council",
    description: "Der Ghost Council ist auf der Suche nach Geheimnissen, wobei seine Identität eng mit einer Reise (entweder physisch oder metaphorisch) auf der Suche nach der nächsten großen Entdeckung verbunden ist. Ghosts (wie sie einzeln genannt werden) verfolgen ihre Ziele aus starken persönlichen Gründen, die oft missverstanden werden, da sie von der allgemeinen Garou-Gesellschaft als geheimnisvoll und sogar verdächtig angesehen werden. In ihrem Streben nach Wissen sammeln sie Geheimnisse, um bessere Ergebnisse in ihrem Kampf für Gaia zu erzielen. Für viele Geister besteht das Ziel darin, ein tieferes Verständnis für ihre Bestimmung und die Natur der Garou und der Welt um sie herum zu erlangen. Die Reise ist ein entscheidender Teil davon, da sie Entdeckungen auf dem Weg ermöglicht. Gleichzeitig ist es für Ghost Council eine Chance, Wege zu finden, die von anderen Stämmen gemieden werden, Tabus aufzudecken und Dinge zu entdecken, die von anderen Werwölfen absichtlich zurückgelassen wurden – was dazu führt, dass die Garou-Gesellschaft ihnen oft verdächtige Motive unterstellt, darunter auch das Streben nach Macht. Da manche Geheimnisse besser unberührt bleiben sollten, könnte die Überzeugung der Geister, dass der Zweck die Mittel heiligt, wenn es um das Streben nach Wissen geht, für Garou, denen es wichtig ist, das Gleichgewicht auf konventionellere Weise aufrechtzuerhalten, subversiv erscheinen.",
    status: "nation",
    patron: {
      name: "Gehörnte Schlange",
      description: "Die Gehörnte Schlange, der Schutzgeist des Ghost Council, ist ein Experte für dunkle Orte und verborgene Wahrheiten. Die Beziehung zwischen der Gehörnten Schlange und den Geistern ist transaktionaler Natur und gleicht in ihrer Form einer formellen Anerkennung des Gebens und Nehmens, fast wie in einem Märchen. Andere Stämme mögen diese Beziehung angesichts ihrer unterschiedlichen Erfahrungen mit ihrem Schutzgeist als fast unheimlich empfinden."
    },
    ban: "Wenn es eine Szene gibt, in der der Ghost Council die Gelegenheit hat, seine Neugier zu befriedigen, dies aber nicht tut, erhält er zu Beginn der nächsten Sitzung nur einen Willenskraftpunkt.",
    favor: "Ghost Council kann einen Würfel zu den Würfelpools für Ermittlungen, Okkultismus oder Täuschung hinzufügen, wenn es darum geht, ein gehütetes Geheimnis zu lüften.",
    availableGifts: [93, 94, 95, 96, 97, [64, 3], [31, 6], [60, 9], [48, 9], [22, 9]],
    renown: W5RenownKey.Wisdom
  },
  {
    id: 6,
    name: "Glass Walkers",
    description: "Während die meisten Garou gut darin sind, Dinge zu zerstören, glänzen die Glass Walkers dort, wo etwas von Grund auf neu aufgebaut werden muss. Bekannt für ihre Kompetenz in angewandter Wissenschaft und ihre Vertrautheit mit Technologie (und den Geistern, die sie bewohnen), sind Glass Walkers hervorragend im Lösen von Problemen und Basteln, insbesondere wenn es um moderne technologische Fragen geht. Ihre Fähigkeit, eine Maschine zum Laufen zu bringen, beruht oft darauf, dass sie die Geister, die sie bewohnen, beschwichtigen, was anderen Garou fremd ist. Unter den Stammesmitgliedern gibt es viele Ingenieure, Techniker und Erfinder.",
    status: "nation",
    patron: {
      name: "Spinne",
      description: "Spider, ein Schutzgeist der Glass Walkers, baut seine Netze so, dass sie effektiv und langlebig sind, ähnlich wie die Konstruktionen der Glass Walkers. Andere Garou sehen die Unterwerfung unter Spider oft als ein Gelübde an Weaver statt an Gaia und stehen dieser Verbindung skeptisch gegenüber, was es den Glass Walkers erschwert, eine Bindung aufzubauen und das Vertrauen ihrer Werwolfgefährten zu gewinnen. Spider und sein Stamm werden mit dem Ansehenstyp „Weisheit” in Verbindung gebracht."
    },
    ban: "Wenn Glass Walkers komplexe Maschinen wie Fahrzeuge, Computer oder Montageanlagen zerstören, erhalten sie zu Beginn der nächsten Sitzung nur einen Willenskraftpunkt.",
    favor: "Glass Walkers können einen Würfel zu den Technologie- oder Wissenschaftswürfelpools hinzufügen, die mit dem Bauen oder Reparieren von Dingen zu tun haben.",
    availableGifts: [98, 99, 100, 101, 102, [49, 3], [38, 3], [16, 3], [30, 6], [66, 6]],
    renown: W5RenownKey.Wisdom
  },
  {
    id: 7,
    name: "Hart Wardens",
    description: "Die Hart Wardens sind in der Regel die Beschützer und Hüter der Natur. Sie konzentrieren sich möglicherweise darauf, die abgelegeneren und unentdeckten Orte der Welt zu bewahren, oder sie pflegen einen Ort, der für sie oder eine Kultur, mit der sie sich verbunden fühlen, wichtig ist, wie beispielsweise einen Bauernhof, ein Stück Land oder einen Caern und dessen Umgebung. Die Hart Wardens können das Potenzial jedes Gebiets ausschöpfen und es zu neuem Leben erwecken, sei es ein kleiner, gepflegter Garten oder ein weitläufiger Wald. Mit großer Leidenschaft für das, was ihnen am Herzen liegt, und ihre eigene Mythologie, werden ihre Zusammenkünfte oft zu Feierlichkeiten der Geschichte ihres Stammes und der Garou im Allgemeinen.",
    status: "nation",
    patron: {
      name: "Hirsch",
      description: "Der Hirsch bevorzugt die Hart Wardens, obwohl er allen Garou die Wege der Natur näherbringt. Ihr zugehöriger Ansehenstyp ist „Ruhm“, und die Hart Wardens verehren besonders ihre Galliards, die Geschichten über ihre Taten singen."
    },
    ban: "Wenn jemandem unter der Obhut des Hart Wardens Schaden zugefügt wird, erhält dieser Hart Warden zu Beginn der nächsten Sitzung nur einen Willenskraftpunkt.",
    favor: "Hart Wardens können mit Überleben, Tierkenntnis oder naturbezogenen Fertigkeiten einen Würfel zum Würfelpool hinzufügen.",
    availableGifts: [103, 104, 105, 106, 107, [14, 3], [41, 6], [56, 6], [70, 9], [36, 9]],
    renown: W5RenownKey.Glory
  },
  {
    id: 8,
    name: "Red Talons",
    description: "Die Red Talons sind der einzige moderne Stamm, bei dem ein Großteil der ersten Verwandlungen unter Wölfen stattfindet. Da die Wolfspopulation weltweit durch menschliche Gier und Anspruchsdenken zerstört wird und ihr natürliches Territorium nach und nach schwindet, fühlen sich die Red Talons in eine metaphorische (oder manchmal auch buchstäbliche) Ecke gedrängt. Dies führt zu Wut, die sich in Energie verwandelt, die die Roten Krallen einsetzen, um denen eine Stimme zu geben, die keine Worte haben, oder um sich für diejenigen einzusetzen, die keine Mittel der Menschheit zur Verfügung haben. Manchmal ist es auch Energie, um menschliche Konstrukte niederzureißen, die sie als Schändung von Gaia betrachten. Als einer der radikalsten Stämme können sie so weit gehen, dass sie Menschen ausrotten, wenn sie deren wachsende Zahl als Bedrohung für das natürliche Gleichgewicht ansehen.",
    status: "nation",
    patron: {
      name: "Greif",
      description: "Der Greif, der sich entschlossen gegen die Übergriffe der Weber wehrt und stets die Interessen der Tiere über die der Menschen stellt, ist der Schutzgeist der Roten Krallen. Der ihnen zugeordnete Ansehenstyp ist Ehre, obwohl dessen Kontext den Garou, die ihn hauptsächlich aus der menschlichen Gesellschaft kennen, oft verloren geht."
    },
    ban: "Wenn ein Red Talon während einer Sitzung einen Würfelpool für Geisteswissenschaft, Fahren, Finanzen, Schusswaffen, Naturwissenschaften oder Technologie einsetzt, um etwas zu reparieren oder zu nutzen, anstatt es zu untergraben oder zu zerstören, erhält er zu Beginn der nächsten Sitzung nur einen Willenskraftpunkt.",
    favor: "Red Talon kann einen Würfel zu einem Handgemenge-Test hinzufügen, wenn seine Gesundheit unter der Hälfte liegt.",
    availableGifts: [108, 109, 110, 111, 112, [63, 3], [51, 3], [43, 6], [35, 9], [23, 9]],
    renown: W5RenownKey.Honor
  },
  {
    id: 9,
    name: "Shadow Lords",
    description: "Das Credo der Shadow Lords besteht aus Dominanz und Unterwerfung. Die Rolle der Starken ist es, zu dominieren, die Rolle der Schwachen ist es, sich zu unterwerfen und ihre Kehle zu zeigen – und wahre Stärke liegt darin, herauszufinden, wie man die Schwächen seiner Feinde ausnutzen kann. Es überrascht nicht, dass der Stamm aus einigen der besten Strategen und Kriegsherren unter den Garou besteht. Ihre pragmatische (wenn nicht sogar rücksichtslose) Herangehensweise an die Planung führt sie zu großen Erfolgen, macht aber auch andere Garou in der Nähe ihrer Stammesmitglieder oft nervös, da sie sich fragen, ob diese ständig nach Schwachstellen Ausschau halten oder sie auf ihre Fehler hin untersuchen.",
    status: "nation",
    patron: {
      name: "Donner",
      description: "Thunder, der Schutzgeist der Shadow Lords, ist oft distanziert, aber immer furchterregend als wütender Herold des Handelns und des Wandels. Ähnlich wie Thunder bevorzugen Shadow Lords einen kalkulierten, langsamen Vorstoß, um dann einen mächtigen Schlag zu führen. Sie werden mit dem Ansehenstyp „Ruhm“ in Verbindung gebracht."
    },
    ban: "Wenn Shadow Lord in einem Konflikt gegen einen Garou mit geringerer Gesamtberühmtheit eine Niederlage erleidet, erhält er zu Beginn der nächsten Sitzung nur einen Willenskraftpunkt.",
    favor: "Shadow Lord können einen Würfel zu den Würfelpools für Tierkenntnis, Einschüchterung oder List hinzufügen, wenn es um Bedrohungen geht oder wenn sie Schwächen ausnutzen.",
    availableGifts: [113, 114, 115, 116, 117, [27, 3], [17, 6], [54, 6], [67, 6], [45, 9]],
    renown: W5RenownKey.Glory
  },
  {
    id: 10,
    name: "Silent Striders",
    description: "Die Silent Striders sind unter den Garou als Reisende und Nachrichtenüberbringer bekannt. Unter Wölfen folgen sie oft dorthin, wo die Beute das Rudel hinführt, während sie unter Menschen historisch mit wandernden oder diasporischen Kulturen in Verbindung gebracht werden. Vor langer Zeit wurden sie von einem mächtigen Geist „verflucht“ – ein Ereignis, das heute weitgehend vergessen und nicht vollständig verstanden ist –, was sie zu einem wandernden Lebensstil als Werwolf-Boten führte. Das macht ihr Leben nicht gerade einfach, insbesondere nach dem Zerfall der Garou-Nation und angesichts der immer näher rückenden Apokalypse, aber die Silent Striders sind Meister des Reisens – sie sind wie geschaffen dafür, ihren Weg dorthin zu finden, wo andere sie nicht haben wollen, und sicher wieder zurückzufinden.",
    status: "nation",
    patron: {
      name: "Eule",
      description: "Die Eule, der Schutzgeist der Silent Striders, ermutigt ihre Anhänger, Dinge nach ihren eigenen Vorstellungen und in ihrem eigenen Tempo anzugehen. Die Eule beobachtet ihre Umgebung zunächst sorgfältig von einem hohen Aussichtspunkt aus und handelt erst, wenn sie die gesamte Umgebung eingeschätzt hat. Erst dann wagt sie den Sprung. Der mit der Eule und den Silent Striders verbundene Ansehenstyp ist Weisheit."
    },
    ban: "Wenn Silent Striders den Tod verursachen, daran beteiligt sind oder sogar Zeugen davon werden, aber keine Gedenkzeremonie durchführen, um ihn anzuerkennen, erhalten sie zu Beginn der nächsten Sitzung nur einen Willenskraftpunkt.",
    favor: "Stille Wanderer können einen Würfel zu den Würfelpools für Athletik oder Heimlichkeit hinzufügen, wenn es um Fortbewegung, Flucht oder Infiltration geht.",
    availableGifts: [118, 119, 120, 121, 122, [20, 6], [32, 6], [57, 9], [69, 9], [47, 9]],
    renown: W5RenownKey.Wisdom
  },
  {
    id: 11,
    name: "Silver Fangs",
    description: "Die Silver Fangs sind das, was einer adeligen Abstammung in der Garou-Kultur am nächsten kommt, und übernehmen oft die Rolle der Anführer in der Werwolfgesellschaft. Mit ihrem Erbe von Aristokratie, Entschlossenheit und der Vereinigung verfeindeter Garou in Zeiten der Not kann kaum jemand ihre Fähigkeiten als Anführer anzweifeln, auch wenn andere Stämme dies nur ungern zugeben. Mit großer Macht geht jedoch auch große Verantwortung einher – und wenn positive Errungenschaften in der Geschichte der Garou den Silberzähnen zugeschrieben werden können, so können sie auch für die weniger glücklichen Ereignisse verantwortlich gemacht werden, wobei einige Werwölfe sie offen für den Zusammenbruch der Garou-Nation und das Scheitern der Abwendung der Apokalypse verantwortlich machen.",
    status: "nation",
    patron: {
      name: "Falke",
      description: "Falcon ist der Schutzgeist der Silberzähne. Sein scharfer Blick und sein edles Auftreten inspirieren den Stamm, seine Ziele zu verfolgen und wiederum andere zu inspirieren. Der ihnen zugeordnete Ansehenstyp ist Ehre."
    },
    ban: "Wenn Silver Fangs eine Aktion ausführt, die sie der Gefahr aussetzt, sich zu blamieren oder Ansehen zu verlieren, erhalten sie zu Beginn der nächsten Sitzung nur einen Willenskraftpunkt.",
    favor: "Silberzähne können einen Würfel zu den Würfelpools für Überzeugungskraft oder Führungsstärke hinzufügen, wenn es darum geht, andere dazu zu bringen, ihren Vorschlägen oder Befehlen zu folgen.",
    availableGifts: [123, 124, 125, 126, 127, [50, 3], [42, 6], [33, 9], [21, 9], [72, 9]],
    renown: W5RenownKey.Honor
  },
];

export const gifts: IW5Gift[] = [
  {
    id: 1,
    category: W5GiftCategory.Native,
    totalRenown: 1,
    name: "Katzenfüße",
    description: "Der Garou erlangt übernatürliche Balance und Beweglichkeit sowie die Fähigkeit, Stürze aus großer Höhe zu überleben. Schmale, rutschige oder sich bewegende Oberflächen stellen für ihn kaum ein Hindernis dar, und der Werwolf kann sie mit gleicher Leichtigkeit überqueren. Diese Gabe wird ihm von einem Katzengeist verliehen.",
    renown: W5RenownKey.Honor,
    cost: "1 Willenskraft",
    action: "frei",
    pool: "- (Geistesschärfe + Überleben, um reflexartig zu aktivieren)",
    system: "Die Garou gelingt automatisch jeder Versuch, auf jeder Oberfläche das Gleichgewicht zu halten, solange diese Oberfläche ihr Gewicht tragen kann. Sie werden immun gegen Fallschaden aus Höhen von bis zu zehn mal ihrer Ehre in Metern. Wenn sie überrascht werden, können die Garou diese Gabe reflexartig mit einem Geistesschärfe + Überleben Test mit Schwierigkeitsgrad 3 aktivieren. Diese Gabe kann in jeder Form eingesetzt werden.",
    duration: "eine Szene"
  },
  {
    id: 2,
    category: W5GiftCategory.Native,
    totalRenown: 1,
    name: "Augen der Eule",
    description: "Mit ihren unheimlich gelb leuchtenden Augen erhalten Werwölfe die Fähigkeit, in völliger Dunkelheit zu sehen. Diese Gabe wird ihnen von einem Eulen- oder Katzengeist verliehen.",
    renown: W5RenownKey.Wisdom,
    cost: "1 Willenskraft",
    action: "frei",
    pool: "-",
    system: "Der Benutzer kann in jeder natürlichen Dunkelheit ohne Nachteile sehen. Wenn die Dunkelheit übernatürlichen Ursprungs ist, erhält er seine Weisheit als Bonuswürfel bei jedem Versuch, ihr zu widerstehen, sofern Widerstand möglich ist.",
    duration: "eine Szene"
  },
  {
    id: 3,
    category: W5GiftCategory.Native,
    totalRenown: 1,
    name: "Hasensprung",
    description: "Der Garou kann große Entfernungen horizontal und vertikal überspringen. Diese Gabe wird von einem springenden Tiergeist gewährt, beispielsweise einem Hasen-, Frosch- oder Känguru-Geist.",
    renown: W5RenownKey.Glory,
    cost: "1 Rage-Test",
    action: "voll",
    pool: "Stärke + Ruhm",
    system: "Der Spieler testet Stärke + Ruhm und springt für jeden Erfolg im Test drei Meter horizontal oder zwei Meter vertikal.",
    duration: "-",
  },
  {
    id: 4,
    category: W5GiftCategory.Native,
    totalRenown: 1,
    name: "Tiefensinne",
    description: "Die Sinne der Garou werden gleichzeitig auf die physische Welt und die Umbra abgestimmt, sodass sie beide Welten ohne Einschränkungen wahrnehmen können. Diese Gabe wird von einer Muster-Spinne gewährt.",
    renown: W5RenownKey.Wisdom,
    cost: "1 Willenskraft",
    action: "frei",
    pool: "Intelligenz + Weisheit",
    system: "Der Spieler testet Intelligenz + Weisheit gegen den Schwierigkeitsgrad des lokalen Gauntlet (normalerweise 2-5). Bei Erfolg kann der Garou nach Ermessen des Spielleiters die Bewohner beider Aspekte der Existenz ohne Nachteile wahrnehmen und mit ihnen interagieren. Obwohl diese Fähigkeit sie für physische Wesen nicht sichtbar macht, wenn sie aus der Umbra heraus eingesetzt wird, macht sie einige Geister auf ihre Anwesenheit aufmerksam, wenn sie in der physischen Welt eingesetzt wird.",
    duration: "eine Szene"
  },
  {
    id: 5,
    category: W5GiftCategory.Native,
    totalRenown: 1,
    name: "Wütender Schlag",
    description: "Der Garou kanalisieren seine Wut direkt in seine Schläge. Ein schrecklicher Wolfsgeist gewährt ihnen diese Gabe.",
    renown: W5RenownKey.Glory,
    cost: "1 Rage-Test",
    action: "frei",
    pool: "-",
    system: "Der Spieler führt einen Rage-Test durch, um Bonuswürfel in Höhe seines Ruhms für einen einzelnen Nahkampfangriff zu erhalten.",
    duration: "eine Attacke"
  },
  {
    id: 6,
    category: W5GiftCategory.Native,
    totalRenown: 1,
    name: "Blickduell",
    description: "Mit seinem unerbittlichen Blick etabliert sich der Garou als Spitzenprädator, der Menschen und Tiere in die Knie zwingt oder unterwirft. Andere übernatürliche Wesen lassen sich zwar weniger leicht einschüchtern, doch selbst sie können durch den brennenden Blick eines Werwolfs erschüttert werden. Diese Gabe wird von einem legendären Wolfsgeist verliehen.",
    renown: W5RenownKey.Honor,
    cost: "1 Rage-Test",
    action: "voll",
    pool: "Charisma + Ruhm vs Fassung + Entschlossenheit",
    system: "Diese Gabe kann auf jeden Menschen oder jedes Tier innerhalb von zwei Metern angewendet werden, mit dem der Garou Augenkontakt herstellen kann. Die Gabe wirkt automatisch auf normale Menschen und Tiere und bewirkt, dass das Ziel dem Werwolf aus dem Weg geht und den Blick abwendet, wenn nicht sogar regelrecht kriecht. Übernatürliche Wesen und Menschen, die sich der Garou und ihrer Kräfte bewusst sind, bleiben unbeeindruckt, es sei denn, der Spieler gewinnt einen Charisma + Ehre gegen Gelassenheit + Entschlossenheit-Test. Ein Ziel kann nur einmal pro Szene von dieser Gabe beeinflusst werden, und die Gabe kann nicht während eines physischen Konflikts eingesetzt werden. Diese Gabe kann in jeder Form eingesetzt werden.",
    duration: "eine Szene"
  },
  {
    id: 7,
    category: W5GiftCategory.Native,
    totalRenown: 4,
    name: "Geschärfte Sinne",
    description: "Der Werwolf schärft seine Sinne auf ein Niveau, das die empfindlichsten Eigenschaften von Wolf und Mensch vereint. In der Homid- und Glabro-Form erlangt er die Sinne eines Wolfes, während sich seine anderen Sinne in der Crinos-, Hispo- oder Lupus-Form auf das Niveau eines Menschen schärfen. Diese Gabe wird ihm von einem Wolfsgeist verliehen.",
    renown: W5RenownKey.Wisdom,
    cost: "1 Willenskraft",
    action: "frei",
    pool: "-",
    system: "Bei Aktivierung dieser Gabe wird die Schwierigkeit aller vom Spieler durchgeführten Bewusstseinsproben um den Wert der Weisheit des Charakters auf mindestens 2 gesenkt. Diese Gabe kann in jeder Form eingesetzt werden.",
    duration: "eine Szene"
  },
  {
    id: 8,
    category: W5GiftCategory.Native,
    totalRenown: 4,
    name: "Kampfgeist",
    description: "Der Garou bewegt sich blitzschnell und kann mit seinen Klauen und Muskeln mehrere Gegner in Reichweite angreifen. Diese Gabe wird ihm von einem Vielfraß- oder Dachsgeist verliehen.",
    renown: W5RenownKey.Glory,
    cost: "1 Rage-Test pro weiterem Gegner",
    action: "frei",
    pool: "-",
    system: "Die Gabe ermöglicht es dem Garou, zusätzliche Gegner in Reichweite bis zur Höhe seines Ruhmes ohne Strafe anzugreifen. Führe einen einzigen Angriffswurf durch und wende ihn auf jeden Gegner an, der im Kampf verwickelt ist und unter den Einsatz von Rage fällt (siehe Kosten). Jeder zusätzliche Bonus auf den Angriff gilt für alle Gegner.",
    duration: "eine Attacke"
  },
  {
    id: 9,
    category: W5GiftCategory.Native,
    totalRenown: 4,
    name: "Den Pfeil abwehren",
    description: "Die Garou verbinden ihre Natur als Werkzeug benutzende Menschen mit den unvorhersehbaren Nuancen des Geistes und üben so eine Dominanz über herannahende Projektile aus – Speere, Pfeile und sogar Kugeln –, sodass diese in ihrer Flugbahn schwanken und dem Benutzer keinen Schaden zufügen können. Ein Weaver-Vektorgeist gewährt diese Gabe.",
    renown: W5RenownKey.Honor,
    cost: "1 Willenskraft",
    action: "klein",
    pool: "-",
    system: "Die Garou erhalten ihre Ehre als Bonuswürfel für alle Tests, um Projektilwaffen auszuweichen. Diese Gabe kann nur in der Crinos-Form eingesetzt werden.",
    duration: "eine Szene"
  },
  {
    id: 10,
    category: W5GiftCategory.Native,
    totalRenown: 7,
    name: "Körperveränderung",
    description: "Der Garou ist in der Lage, durch fein abgestimmte Gestaltwandlung die Beschaffenheit seines physischen Körpers zu verändern und nach Belieben kleiner, stärker oder dichter zu werden, ohne dabei seine Form vollständig zu verändern. Diese Gabe wird von einem Wassergeist verliehen.",
    renown: W5RenownKey.Glory,
    cost: "1 Rage-Test",
    action: "klein",
    pool: "Ausdauer + Ruhm",
    system: "Der Spieler testet Ausdauer + Ruhm mit einem Schwierigkeitsgrad von 2. Jeder Erfolg innerhalb der Spanne ermöglicht es ihm, einen einzelnen Punkt von einem körperlichen Attribut auf ein anderes umzuverteilen. Durch den Einsatz dieser Gabe kann kein Attribut unter O fallen oder 5 Punkte überschreiten. Nach Ermessen des Spielleiters kann diese Gabe dem Benutzer auch ermöglichen, seinen Körper so zu verrenken, dass er in Räume passt, die für einen normalen Körper zu eng sind, wie z. B. gewöhnliche Luftkanäle oder Wasserleitungen. In diesem Fall richtet sich der Schwierigkeitsgrad nach den Abmessungen des Zielraums.",
    duration: "eine Szene"
  },
  {
    id: 11,
    category: W5GiftCategory.Native,
    totalRenown: 7,
    name: "Technologie stören",
    description: "Als Wesen von Natur aus unbeständig können Garou, die diese Gabe erlernen, die Energien des Wyld, die in ihnen selbst existieren, ausdehnen, um die winzigen Ordnungsgesetze, die die Technologie beherrschen – jedes Gerät, das auf Elektronik oder bewegliche Teile angewiesen ist –, so weit zu zerstören, dass sie nicht mehr funktionieren. Computer frieren ein, Autos springen nicht mehr an und Kameras zeigen nur noch Bildrauschen. Der Effekt ist nur vorübergehend, und die Geräte nehmen nach Ablauf der Dauer ihren Betrieb wieder auf. Ein Wyld-Geist der Zwietracht gewährt diese Gabe.",
    renown: W5RenownKey.Honor,
    cost: "1 Rage-Test",
    action: "voll",
    pool: "Entschlossenheit + Ruhm",
    system: "Der Garou bittet den Geist um eine Chance und sein Spieler testet seine Entschlossenheit + Ehre anhand der Tabelle auf Seite 148 (Grundregelwerk). Alle Geräte im Umkreis von 20 Metern, deren Schwierigkeitsgrad der Anzahl der gewürfelten Erfolge entspricht oder darunter liegt (siehe Tabelle), funktionieren für die Dauer der Gabe nicht mehr. Beachte, dass es durchaus möglich ist, das Ziel zu überschreiten und eine weitaus größere Anzahl von Geräten als beabsichtigt außer Betrieb zu setzen, aber so sind nun einmal die Launen der Wildnis.",
    duration: "eine Szene"
  },
  {
    id: 12,
    category: W5GiftCategory.Native,
    totalRenown: 7,
    name: "Zunge der Bestie",
    description: "Der Garou hat eine der geheimen Sprachen der Tierwelt gelernt und kann mit wilden Tieren kommunizieren und ihnen sogar Befehle erteilen. Ein Löwen- oder Elchgeist gewährt ihm diese Gabe.",
    renown: W5RenownKey.Wisdom,
    cost: "1 Willenskraft",
    action: "voll",
    pool: "Manipulation + Weisheit, Charisma + Weisheit",
    system: "Der Werwolf kann sich mit jedem Tier frei unterhalten und versteht es wie einen Menschen, wobei er durch die Perspektive und den Verstand des Tieres eingeschränkt ist. Die Tiere sind im Allgemeinen nicht geneigt, dem Garou zu helfen, können aber mit einem Manipulation + Weisheit Test dazu gebracht werden, Informationen preiszugeben, oder mit Charisma + Weisheit dazu überredet werden, eine Aufgabe oder einen Dienst zu verrichten. Die Schwierigkeitsgrade reichen von 2 (einen Waschbären fragen, wo die Fabrik ihren Müll entsorgt) bis 5 (ein Haustier-Stabheuschrecke dazu bringen, sich zu opfern, indem es einen alten Sicherungskasten kurzschließt). Im Allgemeinen gilt: Je weiter das Tier von Säugetieren entfernt ist und je wichtiger die Information oder Dienstleistung ist, desto höher ist der Schwierigkeitsgrad.",
    duration: "eine Szene"
  },
  {
    id: 13,
    category: W5GiftCategory.Auspice,
    onlyFor: 1,
    totalRenown: 2,
    name: "Glückselige Unwissenheit",
    description: "Indem sie vollkommen still stehen, können sich die Garou für alle Beobachter unsichtbar machen, einschließlich Überwachungsgeräten und den meisten Geistern. Ein Chamäleongeist gewährt ihnen diese Gabe.",
    renown: W5RenownKey.Wisdom,
    cost: "1 Willenskraft",
    action: "klein",
    pool: "-",
    system: "Der Garou wird praktisch unsichtbar, solange er still und leise bleibt. Jeder Versuch, ihn zu entdecken, erfolgt mit einer Schwierigkeit von 2 + der Weisheit1 des Gebrauchs der Gabe. Jede Bewegung hebt den Effekt auf, und Versuche, die Gabe für einen Hinterhalt zu nutzen, unterliegen den normalen Hinterhaltsregeln, da das Ziel die Chance hat, den Angreifer zu entdecken, bevor der Angriff landet. (Teste Geistesschärfe + Wahrnehmung gegen die Fassung + Verstecken des Angreifers.)",
    duration: "eine Szene"
  },
  {
    id: 14,
    category: W5GiftCategory.Auspice,
    onlyFor: 1,
    totalRenown: 2,
    name: "Das Lachen der Krähe",
    description: "Der Werwolf reißt sein Maul weit auf und lacht sein Opfer so höhnisch aus, dass dieses seine ganze Willenskraft aufbieten muss, um nicht die Beherrschung zu verlieren. Alle Unsicherheiten, die das Ziel in sich trägt, treten in den Vordergrund, und seine Selbstbeherrschung bröckelt in seinem Wunsch, den Störenfried zum Schweigen zu bringen. Garou können die Gabe nutzen, um einen Feind abzulenken, indem sie seine Aufmerksamkeit auf sich lenken, oder als verzweifeltes Mittel, um Rudelmitglieder oder andere Verbündete zu ermutigen. Ein Krähengeist gewährt diese Gabe.",
    renown: W5RenownKey.Honor,
    cost: "1 Rage-Test",
    action: "voll",
    pool: "Manipulation + Ruhm vs Fassung + Menschenkenntnis",
    system: "Die Gabe muss auf ein Ziel gerichtet sein, das sich in Sicht- und Hörweite des Anwenders befindet. Der Ragabash greift das Ziel in einem Konflikt zwischen Gabe und Gelassenheit + Menschenkenntnis an, um oberflächlichen Willenskraftschaden zu verursachen. Ein Ziel, das dieser Gabe erfolgreich ausgesetzt ist, muss dann seine Aufmerksamkeit und seine Angriffe auf den Anwender richten, es sei denn, es gibt einen Willenskraftpunkt aus, um diesem Drang zu widerstehen. Diese Gabe kann auch in menschlicher Gestalt eingesetzt werden.",
    duration: "eine Szene oder bis widerstanden"
  },
  {
    id: 15,
    category: W5GiftCategory.Auspice,
    onlyFor: 1,
    totalRenown: 2,
    name: "Kobolde",
    description: "Indem sie den Geist in einem technischen Gerät einschüchtern, können die Garou dafür sorgen, dass dieses Gerät Fehlfunktionen aufweist oder dauerhaft ausfällt. Ein Chaosgeist gewährt diese Gabe.",
    renown: W5RenownKey.Glory,
    cost: "1 Rage-Test",
    action: "voll",
    pool: "Charisma + Ruhm",
    system: "Der Spieler testet Entschlossenheit + Ehre gegen den Schwierigkeitsgrad des Geräts (normalerweise 2-5). Bei Erfolg funktioniert das Gerät für die Dauer der Gabe nicht mehr. Diese Gabe kann nur in der Crinos-Form eingesetzt werden.",
    duration: "eine Szene oder permanent"
  },
  {
    id: 16,
    category: W5GiftCategory.Auspice,
    onlyFor: 1,
    totalRenown: 2,
    name: "Spinnenlied",
    description: "Indem er den Schwingungen des Netzes des Weaver lauscht, kann der Werwolf jede Art von verbaler Fernkommunikation belauschen, egal ob diese über Luftsignale oder eine Kabelverbindung übertragen wird. Der Garou muss sich bewusst sein, dass ein Gespräch stattfindet, um es mithören zu können, muss jedoch nicht die Identität aller Teilnehmer kennen. Diese Gabe wird von einem Spinnengeist gewährt.",
    renown: W5RenownKey.Wisdom,
    cost: "1 Willenskraft",
    action: "voll",
    pool: "Entschlossenheit + Weisheit",
    system: "Der Spieler des Garou führt einen Entschlossenheit + Weisheit-Test durch, wobei die Anzahl der Erfolge angibt, wie viel von dem Gespräch er mitbekommt. Ein einziger Erfolg bringt nur ein paar vereinzelte Wörter, während fünf oder mehr (oder ein kritischer Erfolg) es dem Benutzer ermöglichen, jedes Wort zu verstehen und möglicherweise sogar zu erkennen, wer am anderen Ende der Leitung ist. Bei Gesprächen über Festnetzanschlüsse muss der Werwolf sein Ohr an die Telefonleitung oder das Kabel halten; um Handygespräche mitzuhören, muss er lediglich eines der verwendeten Geräte sehen. Jede Verschlüsselung erhöht die Schwierigkeit um 1 oder mehr. Diese Gabe kann auch in menschlicher Gestalt eingesetzt werden.",
    duration: "eine Szene"
  },
  {
    id: 17,
    category: W5GiftCategory.Auspice,
    onlyFor: 1,
    totalRenown: 5,
    name: "Trübheit des Milchauges",
    description: "Die Gestalt des Werwolfs wird zu einem schimmernden, undeutlichen Fleck, als würde man ihn durch dichten Nebel oder eine verzerrte Linse betrachten, selbst bei Tageslicht. Der Garou wird dadurch nicht unsichtbar, aber diese Gabe macht es viel schwieriger, ihn zu entdecken oder einen physischen Angriff auf ihn zu landen. Ein Chamäleon-Geist gewährt diese Gabe.",
    renown: W5RenownKey.Wisdom,
    cost: "1 Willenskraft",
    action: "klein",
    pool: "-",
    system: "Der Ragabash erhält für den Rest der Szene seinen Weisheitsbonus auf alle Verstecken-Proben sowie auf Verteidigungsproben gegen physische Angriffe. Die Gabe erlischt, sobald der Anwender direkt mit einem Ziel interagiert, beispielsweise indem er es angreift oder ein Gespräch mit ihm beginnt.",
    duration: "eine Szene"
  },
  {
    id: 18,
    category: W5GiftCategory.Auspice,
    onlyFor: 1,
    totalRenown: 5,
    name: "Offenes Siegel",
    description: "Der Werwolf überredet einen Geist, einen physisch verschlossenen oder verriegelten Deckel, eine Tür oder ein Siegel zu öffnen. Elektronische Schlösser stellen zunehmend größere Schwierigkeiten dar, ebenso wie durch mystische Mittel versiegelte Vorrichtungen. Ein Waschbärgeist gewährt diese Gabe.",
    renown: W5RenownKey.Honor,
    cost: "1 Rage-Test",
    action: "voll",
    pool: "Manipulation + Ruhm",
    system: "Rein mechanische Schlösser oder Gitter öffnen sich automatisch, wenn diese Gabe eingesetzt wird. Elektronische oder übernatürliche Vorrichtungen erfordern einen Manipulation + I-Ionor-Test gegen einen vom Spielleiter festgelegten Schwierigkeitsgrad (2 für ein normales elektronisches Schloss, 5 für einen durch Zauberei verstärkten Fingerabdruckscanner). Einige extrem fortschrittliche Schlösser können nach Ermessen des Spielleiters sogar außerhalb der Öffnungsmöglichkeiten dieser Gabe liegen. Diese Gabe kann auch in menschlicher Gestalt eingesetzt werden.",
    duration: "-"
  },
  {
    id: 19,
    category: W5GiftCategory.Auspice,
    onlyFor: 1,
    totalRenown: 5,
    name: "Der Puls der Beute",
    description: "Der Werwolf kann sich auf jede beliebige Person konzentrieren und diese verfolgen, solange der Anwender den Namen und das Gesicht des Ziels kennt. Ziele, die sich aktiv verstecken, sind schwieriger aufzuspüren, aber selbst sie können mit genügend Zeit und Mühe gefunden werden. Ein Hundegeist gewährt diese Gabe.",
    renown: W5RenownKey.Wisdom,
    cost: "1 Willenskraft",
    action: "voll",
    pool: "Intelligenz + Weisheit",
    system: "Es ist kein Würfelwurf erforderlich, um einen Menschen aufzuspüren, der sich nicht versteckt. Um ein übernatürliches Wesen oder einen Menschen aufzuspüren, der sich aktiv versteckt, ist ein Intelligenz + Weisheit-Wurf gegen Intelligenz + Szenekenntnis (für Verstecke in der Stadt) oder Intelligenz + Überleben (in ländlichen Gebieten) erforderlich. Die Schwierigkeit steigt, wenn das Ziel über übernatürliche Fähigkeiten verfügt, sich zu verbergen. Die benötigte Zeit hängt sowohl von der Entfernung zum Ziel als auch vom Ergebnis des Würfels ab. Je höher der Vorsprung, desto schneller kann das Ziel ausfindig gemacht werden. Diese Gabe kann auch in Lupus forn1 verwendet werden.",
    duration: "eine Session"
  },
  {
    id: 20,
    category: W5GiftCategory.Auspice,
    onlyFor: 1,
    totalRenown: 5,
    name: "Duft von fließendem Wasser",
    description: "Die Verwendung dieser Gabe ermöglicht es den Garou, sich mit weltlichen Mitteln unauffindbar zu machen und auch übernatürliche Ortungsversuche zu erschweren. Ein Fuchsgeist gewährt diese Gabe.",
    renown: W5RenownKey.Wisdom,
    cost: "frei / 1 Willenskraft",
    action: "klein",
    pool: "-",
    system: "Nach Aktivierung dieser Gabe hinterlässt der Garou keine physischen Spuren seines Vorbeikommens (Fußabdrücke, zerstörte Vegetation, DNA-Spuren usw.). Der Garou erhält außerdem seine Weisheit als Bonus auf alle Tests, um übernatürliche Verfolgung zu vermeiden. Die Aktivierung dieser Gabe ist für den Nutzer kostenlos, aber durch den Einsatz von Willenskraft kann der Spieler die Wirkung der Gabe für eine Szene auf das Rudel seines Charakters ausweiten. Diese Gabe kann auch in Wolfsgestalt genutzt werden.",
    duration: "eine Szene"
  },
  {
    id: 21,
    category: W5GiftCategory.Auspice,
    onlyFor: 1,
    totalRenown: 8,
    name: "Lunas Segen",
    description: "Indem sie ein Gebet an Luna richten, während sie am Himmel zu sehen ist, können Garou sie davon überzeugen, ihren Silberfluch vorübergehend aufzuheben. Bis zum nächsten Sonnenaufgang, solange der Anwender den Mond am Himmel sehen kann, ist der Garou nicht mehr anfällig für Silber, und das Mondmetall wird wie jedes andere behandelt. Eine Lune gewährt diese Gabe.",
    renown: W5RenownKey.Wisdom,
    cost: "1 Rage-Test + 1 Willenskraft",
    action: "voll",
    pool: "-",
    system: "Um dieses Geschenk zu aktivieren, muss der Mond für die Garou sichtbar sein. Nach der Aktivierung durch ein flehendes Heulen, das an Luna gerichtet ist, wird Silberschaden bis zur Weisheit des Anwenders (pro Schadensquelle) als leichter behandelt.",
    duration: "eine Nacht"
  },
  {
    id: 22,
    category: W5GiftCategory.Auspice,
    onlyFor: 1,
    totalRenown: 8,
    name: "Diebeskrallen der Elster",
    description: "Die Garou können die übernatürlichen Kräfte anderer – Werwolf-Gaben, Blutflüche von Vampiren oder andere Äquivalente – stehlen und für ihre eigenen Zwecke nutzen. Solange sich diese Kräfte im Besitz des Anwenders befinden, stehen sie ihrem ursprünglichen Besitzer nicht zur Verfügung. Ein Elstergeist gewährt diese Gabe.",
    renown: W5RenownKey.Honor,
    cost: "1 Willenskraft",
    action: "voll",
    pool: "Intelligenz + Ruhm",
    system: "Diese Gabe kann auf eine übernatürliche Kraft oder Fähigkeit einer beliebigen Person in Sichtweite des Anwenders abzielen, der lediglich Zeuge der Anwendung dieser Kraft durch das Ziel gewesen sein muss. Die Fähigkeit muss vom Ziel erlernt worden sein und darf nicht angeboren sein. (Die Gabe eines Garou kann gestohlen werden, seine Fähigkeit zur Gestaltwandlung jedoch nicht, zum Beispiel. Der Spieler testet Intelligenz + Ehre gegen den Wert der Kraft: den Rang einer Gabe oder einen angemessenen Wert für ein anderes übernatürliches Ziel. (Wenn kein Wert vorhanden ist, sollte der Geschichtenerzähler eine angemessene Schwierigkeit festlegen.) Bei Erfolg verliert das Ziel die Kraft, und alle daraus resultierenden Effekte erlöschen sofort. Ab der nächsten Runde kann der Werwolf die Kraft so einsetzen, als wäre sie eine Gabe, die er bereits besitzt, wobei Ehre alle nicht-Garou-Eigenschaften ersetzt, die dafür erforderlich sind. Zu Beginn jeder folgenden Runde muss ein Willenskraftpunkt ausgegeben werden, sonst kehrt die Kraft zu ihrem ursprünglichen Besitzer zurück.",
    duration: "eine Runde für jeden verbrauchten Willenskraftpunkt"
  },
  {
    id: 23,
    category: W5GiftCategory.Auspice,
    onlyFor: 1,
    totalRenown: 8,
    name: "Die tausend Formen",
    description: "Diese Gabe ermöglicht es den Garou, die Grenzen ihrer Werwolfnatur zu überwinden und die Gestalt jedes beliebigen gewöhnlichen Tieres anzunehmen, dessen Größe von einem Huhn bis zu einem Grizzlybären reichen kann. Die Garou erhalten die Sinne des Tieres, in das sie sich verwandeln, unterliegen jedoch denselben Einschränkungen hinsichtlich der Kommunikation wie in ihrer Wolfsgestalt. Diese Gabe wird von einem Wyld-Geist gewährt.",
    renown: W5RenownKey.Glory,
    cost: "1 oder mehr Rage-Test",
    action: "klein",
    pool: "Geschicklichkeit + Ruhm",
    system: "Der Spieler testet Geschicklichkeit + Ruhm. Wenn die gewünschte Gestalt besonders groß, klein oder exotisch ist, kann sich der Schwierigkeitsgrad nach Ermessen des Spielleiters um 1 oder mehr erhöhen. Bei einem Fehlschlag kann der Benutzer den Versuch wiederholen, indem er einen weiteren Rage-Test durchführt und die Erfolge zum vorherigen Test hinzufügt. Der Nutzer der Gabe behält seine mentalen Attribute, aber seine anderen Pools hängen von der angenommenen Gestalt ab. (Beispiele finden Sie unter „Tiere” auf Seite 291.) Diese Gabe kann in jeder Gestalt genutzt werden.",
    duration: "eine Szene"
  },
  {
    id: 24,
    category: W5GiftCategory.Auspice,
    onlyFor: 1,
    totalRenown: 8,
    name: "Welpenkörper",
    description: "Dieser schreckliche Fluch lässt den Körper eines Gegners schrumpfen und schwächen, seine Arme zittern vor Anstrengung und seine Beine geben unter ihm nach. Nur diejenigen, die über ausreichende Kenntnisse der beteiligten Geister verfügen, sind in der Lage, sich wirksam gegen die Auswirkungen zu verteidigen. Die Anwendung dieser Gabe auf andere Garou gilt als schwere Beleidigung, und schon wegen weniger wurde bis zum Tod gekämpft. Ein Krankheitsgeist gewährt diese Gabe.",
    renown: W5RenownKey.Honor,
    cost: "1 Rage-Test",
    action: "voll",
    pool: "Entschlossenheit + Ruhm vs Ausdauer + Okkultismus",
    system: "Dieses Geschenk kann auf jede Person innerhalb von fünf Metern und in Sichtweite des Benutzers angewendet werden, deren Spieler seine Entschlossenheit + Ehre gegen die Ausdauer + Okkultismus des Ziels testen muss. Für jeden Erfolg in der Marge verliert das Ziel einen einzigen Punkt von einem seiner physischen Attribute (bis zu einem Minimum von null), da sein Körper von einer vernichtenden spirituellen Qual heimgesucht wird. Die Auswirkungen halten für den Rest der Geschichte an, können jedoch nach Ermessen des Erzählers manchmal dauerhaft werden.",
    duration: "eine Geschichte"
  },
  {
    id: 25,
    category: W5GiftCategory.Auspice,
    onlyFor: 2,
    totalRenown: 2,
    name: "Geist einfangen",
    description: "Unter Berufung auf die von Gaia in legendären Zeiten erteilten Aufträge hält der Garou einen Geist in seinen Spuren auf und schwächt dessen Abwehrkräfte gegen weitere Gaben. Ein Webergeist des Gesetzes gewährt diese Gabe.",
    renown: W5RenownKey.Honor,
    cost: "1 Willenskraft",
    action: "voll",
    pool: "Geistesschärfe + Ruhm vs Macht",
    system: "Der Geist muss anwesend sein und sich im selben Bereich (physisch oder spirituell) wie der Anwender befinden. Der Zielgeist unterliegt einer Strafe von zwei Würfeln bei jedem Versuch, sich zu widersetzen, oder bei jedem Versuch des Anwenders, mit ihm zu verhandeln oder ihm Befehle zu erteilen (einschließlich der Verwendung von „Geist befehligen“). Der Geist ist außerdem gezwungen, an seinem Platz zu bleiben, es sei denn, er befreit sich durch einen Macht-Test (mit einem Malus von zwei Würfeln) gegen die Geistesschärfe + Ruhm des Anwenders. Diese Gabe kann nicht auf einen bereits feindseligen Geist angewendet werden, und jeder Versuch, dem Geist Schaden zuzufügen, führt zum Erlöschen der Gabe.",
    duration: "eine Szene"
  },
  {
    id: 26,
    category: W5GiftCategory.Auspice,
    onlyFor: 2,
    totalRenown: 2,
    name: "Mutterliebe",
    description: "Der Theurge kanalisiert spirituelle Kraft durch sein Land, um die Wunden aller anderen Lebewesen zu heilen. Diese Gabe kann weder den Anwender selbst noch Geister oder Untote heilen. Ein Bärengeist gewährt diese Gabe.",
    renown: W5RenownKey.Glory,
    cost: "1 Willenskraft",
    action: "voll",
    pool: "Intelligenz + Ruhm",
    system: "Führe einen Gaben-Test durch. Das Ziel heilt oberflächliche physische Schäden in Höhe der Anzahl der Erfolge. Wenn die Anzahl der Erfolge die aktuelle Wut des Ziels übersteigt, kann anstelle eines oberflächlichen Schadens ein einzelner Grad schwerer Schaden geheilt werden. Diese Gabe kann in jeder Form eingesetzt werden.",
    duration: "-"
  },
  {
    id: 27,
    category: W5GiftCategory.Auspice,
    totalRenown: 2,
    onlyFor: 2,
    name: `Schattensinn`,
    description: `Diese Gabe ermöglicht es dem Nutzer, die übernatürliche Welt um sich herum wahrzunehmen und übernatürliche Täuschungen zu durchschauen. Sie ermöglicht es einem Garou jedoch nicht automatisch, Absichten oder Loyalitäten zu erkennen, und vieles, was er sieht, wird von seinen eigenen Vorurteilen beeinflusst. Ein Rabengeist gewährt diese Gabe.`,
    renown: W5RenownKey.Wisdom,
    cost: `1 Willenskraft`,
    action: `frei`,
    pool: `Geistesschärfe + Weisheit`,
    system: `Bei einem erfolgreichen Geistesschärfe + Weisheit warnt diese Gabe den Garou, wenn übernatürliche Elemente oder Kreaturen in der Nähe sind, ohne jedoch deren genauen Standort oder Identität anzugeben. Die Schwierigkeit für den Test beträgt 2, kann jedoch durch Kräfte modifiziert werden, die es übernatürlichen Kreaturen ermöglichen, ihre Anwesenheit zu verbergen, wie beispielsweise die Fähigkeit von Vampiren, sich der Beobachtung zu entziehen.`,
    duration: `ein Zug`
  },

  {
    id: 28,
    category: W5GiftCategory.Auspice,
    totalRenown: 2,
    onlyFor: 2,
    name: `Blick aus dem Jenseits`,
    description: `Der Träger dieser Gabe empfängt prophetische Visionen – Einblicke in die Landschaft der Umbra!, in die Zukunft oder die Vergangenheit, manchmal in Form von Träumen, manchmal im Wachzustand. Die Visionen sind selten klar und erscheinen traumhaft oder symbolisch, aber sie können vor unmittelbarer Gefahr warnen oder als Wegweiser bei schwierigen Entscheidungen dienen. Ein Traumgeist gewährt diese Gabe.`,
    renown: W5RenownKey.Wisdom,
    cost: `1 Willenskraft oder frei`,
    action: `voll oder frei`,
    pool: `Intelligenz + Weisheit`,
    system: `Die prophetischen Visionen können unaufgefordert auftreten. In diesem Fall entscheidet der Geschichtenerzähler, wann und wie sie sich manifestieren. Auf Wunsch kann der Geschichtenerzähler den Spieler eine Intelligenz + Weisheitsprobe ablegen lassen, um Hinweise auf die Geschichte zu erhalten oder vor Gefahren zu warnen, deren Ausmaß und Klarheit von der Anzahl der Erfolge abhängt. Einmal pro Szene kann ein Spieler auch versuchen, diese Visionen absichtlich hervorzurufen, indem er einen Willenskraftpunkt einsetzt. Es wird dann ein ähnlicher Test durchgeführt, wobei der Geschichtenerzähler je nach Anzahl der Erfolge Hinweise auf die Deutlichkeit und das Ausmaß der Visionen gibt.`,
    duration: `-`
  },

  {
    id: 29,
    category: W5GiftCategory.Auspice,
    totalRenown: 5,
    onlyFor: 2,
    name: `Geist verbannen`,
    description: `Unter Berufung auf ihre Rolle als spirituelle Wächter entfesseln die Garou ihre Wut auf einen Geist, der einen Gegenstand oder eine Person besessen hat, und versuchen, ihn zurück in die Wildnis der Geister zu treiben. Ein Incarna-Avatar gewährt diese Gabe.`,
    renown: W5RenownKey.Glory,
    cost: `1 Rage`,
    action: `voll`,
    pool: `Entschlossenheit + Ruhm vs Macht`,
    system: `Der Geist muss anwesend sein und sich im selben Bereich (physisch oder spirituell) wie der Anwender befinden. Bei einem erfolgreichen Test auf Entschlossenheit + Ruhm gegen Macht wird der Geist gezwungen, das besessene Objekt oder die besessene Person zu verlassen und sich vollständig in die Umbra zurückzuziehen. Beim Verlassen kann ein bösartiger Geist seinem besessenen Subjekt Schaden in Höhe seiner Macht minus der Marge des Gabe-Tests als verschärften Schaden zufügen. Einmal verbannt, können die meisten Geister während der gesamten Szene kein anderes Subjekt bewohnen, obwohl einige dies nach Ermessen des Erzählers tun können. Bei Verwendung in der Umbra zwingt diese Gabe den Geist stattdessen zum Rückzug oder zur Flucht.`,
    duration: `eine Szene`
  },

  {
    id: 30,
    category: W5GiftCategory.Auspice,
    totalRenown: 5,
    onlyFor: 2,
    name: `Griff aus dem Jenseits`,
    description: `Diese Gabe ermöglicht es dem Benutzer, Objekte in die Umbra hinein- und herauszubringen, vorausgesetzt, sie haben eine physische Form, auch wenn sie nicht dem Benutzer geweiht sind. (Siehe Ritus der Hingabe, S. 183). Ein Elster-, Biber- oder Opossumgeist gewährt diese Gabe.`,
    renown: W5RenownKey.Wisdom,
    cost: `1-3 Willenskraft`,
    action: `frei`,
    pool: `Entschlossenheit + Weisheit`,
    system: `Als Teil des Durchquerens des Gauntlet (siehe Seite 230) oder beim Blick in die physische Welt aus der Umbra heraus greift der Benutzer das physische Objekt fest und zieht es in die Spirit Wilds hinein – oder heraus, wobei er einen Entschlossenheit + Weisheits-Test gegen den lokalen Gauntlet durchführen muss. Wenn der Test fehlschlägt, bleibt das Objekt an seinem Platz, der Benutzer bleibt jedoch unbeeinträchtigt. Die Willenskraftkosten hängen von der Größe des Objekts ab, wobei ein kleiner Gegenstand (ein Buch oder ein Laptop) einen einzigen Punkt erfordert und ein großer Gegenstand (ein Auto oder ein Zelt) drei Punkte.`,
    duration: `-`
  },

  {
    id: 31,
    category: W5GiftCategory.Auspice,
    totalRenown: 5,
    onlyFor: 2,
    name: `Gespräch im Verstand`,
    description: `Der Werwolf kann Gedanken an eine einzelne Person senden und von dieser empfangen und so auf Wunsch eine wechselseitige Kommunikation herstellen. Diese Gabe wird von einem Traumgeist gewährt.`,
    renown: W5RenownKey.Wisdom,
    cost: `1 Willenskraft`,
    action: `voll`,
    pool: `Entschlossenheit + Weisheit`,
    system: `Der Anwender konzentriert sich und sendet eine mentale Botschaft an das ausgewählte Subjekt. Wenn der Anwender das Subjekt nicht persönlich getroffen hat, muss sich das Ziel in Sichtweite befinden. Wenn das Subjekt dem Anwender bekannt ist, aber nicht anwesend ist, ist ein Test auf Entschlossenheit + Weisheit erforderlich, um Kontakt herzustellen. (Der Schwierigkeitsgrad hängt von der Entfernung und davon ab, ob der Anwender mit dem Aufenthaltsort des Subjekts vertraut ist. Eine Person, die sich zu Hause entspannt, hat einen Schwierigkeitsgrad von 2, während eine Person, die sich auf einem anderen Kontinent versteckt, einen Schwierigkeitsgrad von 5 hat.) Sobald der Kontakt hergestellt ist, können Gedanken in beide Richtungen fließen, solange beide Teilnehmer dazu bereit sind. Diese Gabe kann nicht dazu verwendet werden, die Gedanken einer Person zu lesen; es können nur Gedanken wahrgenommen werden, die für die andere Partei bestimmt sind. Jede größere Ablenkung, wie z. B. eine Verletzung einer der beiden Parteien, unterbricht die Verbindung. Diese Gabe kann in jeder Form eingesetzt werden.`,
    duration: `eine Szene oder bis der Kontakt abbricht`
  },

  {
    id: 32,
    category: W5GiftCategory.Auspice,
    totalRenown: 5,
    onlyFor: 2,
    name: `Umbralische Leine`,
    description: `Das Betreten der Umbra ist immer gefährlich, nicht zuletzt wegen ihrer sich verändernden spirituellen Geografie, die in einem Moment der physischen Welt entspricht und im nächsten Moment wie etwas völlig anderes erscheint. Diese Gabe ermöglicht es dem Nutzer, den Weg zurück zu seinem Einstiegspunkt zu finden, indem er einen silbernen Faden erzeugt, der ihn mit dem Punkt verbindet, an dem er zum ersten Mal die Gauntlet überquert hat. Ein Taubengeist gewährt diese Gabe.`,
    renown: W5RenownKey.Wisdom,
    cost: `1 Willenskraft`,
    action: `frei`,
    pool: `-`,
    system: `Der Benutzer muss diese Gabe aktivieren, sobald er die Umbra betritt. Von diesem Zeitpunkt an bis zum Verlassen der Umbra kann er jederzeit seinen Weg zurückfinden, indem er der silbernen Schnur folgt, die nur für ihn sichtbar ist. Außerdem erhält er seine Weisheit1 als Bonuswürfel für jeden Versuch, sich in den Spirit Wilds zurechtzufinden, da die Schnur ihm hilft, nicht im Kreis zu laufen oder seine Schritte zurückzuverfolgen. Diese Gabe kann in jeder Form genutzt werden.`,
    duration: `bis der Umbra verlassen wird`
  },

  {
    id: 33,
    category: W5GiftCategory.Auspice,
    totalRenown: 8,
    onlyFor: 2,
    name: `Geist befehligen`,
    description: `Diese Gabe ermöglicht es dem Werwolf, einen Geist zu beherrschen, indem er Befehle erteilt, die befolgt werden müssen. Die Gabe erlaubt es einem Garou jedoch nicht, Geister nach Belieben zu beschwören. Die meisten Geister empfinden es als Beleidigung, dieser Gabe unterworfen zu sein, und kluge Geister versuchen oft, die Absicht zu unterlaufen, indem sie das Wort des Befehls zu ihrem Vorteil – oder zum Unglück des Anwenders – verdrehen. Ein Incarna-Avatar gewährt diese Gabe.`,
    renown: W5RenownKey.Honor,
    cost: `1 Willenskraft`,
    action: `voll`,
    pool: `Charisma + Ehre vs Macht`,
    system: `Der Geist muss anwesend sein und sich im selben Bereich (physisch oder spirituell) wie der Benutzer befinden. Für jeden Befehl muss der Spieler den Geist in einem Charisma + Ehre gegen Macht-Test besiegen. Geistern kann nicht befohlen werden, sich selbst oder etwas, an das sie gebunden sind oder das sie besitzen, Schaden zuzufügen, und sie können auch nicht befohlen werden, sich von einem gebundenen oder besessenen Objekt oder Wesen zu entfernen.`,
    duration: `eine Szene`
  },

  {
    id: 34,
    category: W5GiftCategory.Auspice,
    totalRenown: 8,
    onlyFor: 2,
    name: `Geist aussaugen`,
    description: `Der Garou ist in der Lage, einem Geist die Essenz zu entziehen und ihn wie ein Blutegel auszutrocknen, um seine eigenen mentalen Reserven aufzufüllen. Die meisten Werwölfe sind nicht bereit, diese Kraft einzusetzen, außer als letztes Mittel gegen bereits feindselige Geister, aber einige skrupellose Geisterbeschwörer haben sich die gefühllose Angewohnheit angeeignet, jeden Geist als potenzielle Energiequelle zu betrachten. Es versteht sich von selbst, dass die Anwendung dieser Gabe den betroffenen Geist dauerhaft verärgert. Ein Blutegel- oder Neunaugen-Geist gewährt diese Gabe.`,
    renown: W5RenownKey.Glory,
    cost: `1 Rage`,
    action: `voll`,
    pool: `Entschlossenheit + Ruhm vs Macht`,
    system: `Der Geist muss anwesend sein und sich im selben Bereich (physisch oder spirituell) wie der Benutzer befinden. Durch einen Test von Entschlossenheit + Ruhm gegen Macht kann der Werwolf für jeden Erfolg einen Punkt oberflächlichen Willenskraftschadens wiederherstellen, wodurch der Geist um denselben Betrag geschwächt wird. Bei einem Fehlschlag erleidet der Anwender einen Punkt schweren Willenskraftschadens. Ein Geist kann nur einmal pro Szene von dieser Gabe beeinflusst werden.`,
    duration: `-`
  },

  {
    id: 35,
    category: W5GiftCategory.Auspice,
    totalRenown: 8,
    onlyFor: 2,
    name: `Wilde Regression`,
    description: `Indem sie die Kraft des Wyld auf ein Subjekt lenken, verwandeln die Garou den Geist ihres Ziels in den eines Tieres. Die Anwendung dieser Gabe auf andere Garou gilt als abscheuliche Verletzung, und Vergeltungsmaßnahmen erfolgen in der Regel schnell und grausam. Nur diejenigen, die über ausreichende Kenntnisse der beteiligten Geister verfügen, sind in der Lage, sich wirksam gegen die Auswirkungen zu verteidigen. Verschiedene Wyld-Gaffiings lehren diese Gabe.`,
    renown: W5RenownKey.Glory,
    cost: `1 Rage`,
    action: `voll`,
    pool: `Intelligenz + Ruhm vs Entschlossenheit + Okkultismus`,
    system: `Die Gabe kann auf jeden angewendet werden, der sich in Sichtweite des Anwenders befindet. Der Spieler des Anwenders muss dabei seine Intelligenz + Ruhm gegen die Entschlossenheit + Okkultismus des Ziels testen. Für jeden Erfolg in der Differenz verliert das Ziel einen Punkt von einem seiner mentalen Attribute, wobei kein Attribut unter 0 fallen kann. Die Auswirkungen halten für den Rest der Geschichte an, können jedoch nach Ermessen des Spielleiters manchmal dauerhaft werden.`,
    duration: `eine Geschichte`
  },

  {
    id: 36,
    category: W5GiftCategory.Auspice,
    totalRenown: 8,
    onlyFor: 2,
    name: `Lebendiger Schutz`,
    description: `Durch Konzentration können sich die Garou in einen Schutzschild gegen Geister verwandeln, der alle außer den mächtigsten Umbra!-Wesen abwehrt. Solange sie diesen Schutzschild aufrechterhalten, können sie jedoch keine anderen Aktionen ausführen, und seine Aufrechterhaltung über einen längeren Zeitraum hinweg fordert einen hohen Tribut von ihrem Geist. Ein legendärer Wolfsgeist gewährt diese Gabe.`,
    renown: W5RenownKey.Honor,
    cost: `1 Rage-Test`,
    action: `voll`,
    pool: `Entschlossenheit + Ehre vs Macht`,
    system: `Solange sich der Anwender konzentriert, kann sich kein Geist dem lebenden Schutzkreis auf weniger als drei Meter nähern, ohne den Werwolf-Spieler in einem Test auf Macht gegen Entschlossenheit + Ehre zu besiegen. Wenn der Garou, der diese Gabe einsetzt, diesen Test nicht besteht, muss er seinen Schutzkreis sofort aufheben oder Willenskraft in Höhe des Wertes aufwenden, um den er den Test nicht bestanden hat.`,
    duration: `eine Szene, sofern sie nicht zuvor abgesenkt wurde`
  },

  {
    id: 37,
    category: W5GiftCategory.Auspice,
    totalRenown: 2,
    onlyFor: 3,
    name: `Überzeugung der Ahnen`,
    description: `Der Philodox nutzt die Überzeugung der Garou als Volk und verleiht ihren Worten Gewicht und Glaubwürdigkeit. Ein legendärer Wolfsgeist gewährt diese Gabe.`,
    renown: W5RenownKey.Honor,
    cost: `1 Willenskraft`,
    action: `frei`,
    pool: `-`,
    system: `Die Garou erhalten ihre Ehre als Bonuswürfel bei Überzeugungsfertigkeitsproben gegenüber anderen Garou. Diese Gabe kann in jeder Form eingesetzt werden.`,
    duration: `eine Szene`
  },

  {
    id: 38,
    category: W5GiftCategory.Auspice,
    totalRenown: 2,
    onlyFor: 3,
    name: `Gaias Offenheit`,
    description: `Der Nutzer dieser Gabe beugt sich über die Person und stellt ihr eine Frage, wobei seine Stimme von Drohung und der Androhung schneller Bestrafung geprägt ist. Anhand des Geruchs der Person kann der Nutzer erkennen, ob diese ihrer eigenen Antwort glaubt oder nicht. (Beachten Sie, dass das Opfer die Antwort weiterhin verweigern kann.) Ein trt1th-Geist gewährt diese Gabe.`,
    renown: W5RenownKey.Glory,
    cost: `1 Rage-Test`,
    action: `voll`,
    pool: `Charisma + Ruhm vs Fassung + Ausflüchte`,
    system: `Für Menschen, die nichts über die Garou oder ihre Kräfte wissen, ist kein Test erforderlich. Andere übernatürliche Wesen oder Menschen, die bereits Erfahrungen mit den Garou gemacht haben, können versuchen, sich dem Effekt zu widersetzen. In diesem Fall muss der Spieler des Anwenders einen Charisma + Ruhm-Test gegen Gelassenheit + Ausflüchte bestehen.`,
    duration: `eine Frage`
  },

  {
    id: 39,
    category: W5GiftCategory.Auspice,
    totalRenown: 2,
    onlyFor: 3,
    name: `Die Rache des Stachelschweins`,
    description: `Schaden, den die Garou im Nahkampf erleiden, fällt auf ihren Angreifer zurück und sorgt für sofortige Gerechtigkeit. Ein Igelgeist gewährt diese Gabe.`,
    renown: W5RenownKey.Glory,
    cost: `1 Rage-Test`,
    action: `frei`,
    pool: `-`,
    system: `Wenn der Benutzer durch eine Schlägerei oder einen Nahkampfangriff Schaden erleidet, kann er einen Rage-Test durchführen, um dem Angreifer sofort oberflächlichen Schaden in Höhe seines Ruhms zuzufügen. Der Schaden darf den durch den ursprünglichen Angriff erlittenen Schaden nicht überschreiten.`,
    duration: `-`
  },

  {
    id: 40,
    category: W5GiftCategory.Auspice,
    totalRenown: 2,
    onlyFor: 3,
    name: `Wahre Form spüren`,
    description: `Der Garou kann die wahre Natur jedes Menschen, dem er begegnet, erschnüffeln, indem er buchstäblich die wahre Gestalt einer Person aufspürt und alles erkennt, was kein gewöhnlicher Mensch ist. Hat er die Kreatur jedoch noch nie zuvor gesehen, kann er ihren Geruch möglicherweise nicht erkennen. Diese Gabe wird von einem Geiergeist verliehen.`,
    renown: W5RenownKey.Wisdom,
    cost: `1 Willenskraft`,
    action: `frei`,
    pool: `Geistesschärfe + Weisheit`,
    system: `Der Spieler führt einen Geistesschärfe + Weisheit-Test gegen einen Schwierigkeitsgrad durch, der von der jeweiligen Kreatur abhängt: Das Aufspüren eines anderen Garou hat den Schwierigkeitsgrad 2, Verwandte vor ihrer ersten Verwandlung haben den Schwierigkeitsgrad 3, während etwas, das von einem gewöhnlichen Menschen kaum zu unterscheiden ist, wie beispielsweise ein Zauberer, den Schwierigkeitsgrad 5 haben könnte. Vampire liegen irgendwo zwischen Schwierigkeitsgrad 2 und 4, je nachdem, ob sie sich aktiv als Sterbliche tarnen und wie monströs sie im Allgemeinen sind. Diese Gabe kann in jeder Form eingesetzt werden.`,
    duration: `-`
  },

  {
    id: 41,
    category: W5GiftCategory.Auspice,
    totalRenown: 5,
    onlyFor: 3,
    name: `Die Treue der Bestie`,
    description: `Die Autorität der Garou erstreckt sich auch auf gewöhnliche Tiere, sodass sie jedes einzelne Tier zu ihrer Treue verpflichten können. Das Tier folgt ihren Befehlen bedingungslos. Ein Löwen- oder Falkengeist gewährt diese Gabe.`,
    renown: W5RenownKey.Honor,
    cost: `1 Rage-Test`,
    action: `voll`,
    pool: `Charisma + Ehre`,
    system: `Der Garou wählt ein Tier in Sichtweite aus, und der Spieler würfelt Charisma + Ehre gegen Schwierigkeitsgrad 3. Bei Erfolg kann der Anwender mit dem Tier kommunizieren und ihm Befehle erteilen, denen das Tier bis zum Tod gehorcht. Die Kraft hält an, bis der Garou das Tier von seiner Verpflichtung gegenüber ihm befreit oder bis das Tier stirbt. Diese Gabe kann jeweils nur auf ein Tier gleichzeitig angewendet werden.`,
    duration: `bis ausgelaufen`
  },

  {
    id: 42,
    category: W5GiftCategory.Auspice,
    totalRenown: 5,
    onlyFor: 3,
    name: `Befehlige die Versammlung`,
    description: `Die Worte des Benutzers dieser Gabe erhalten eine göttliche Qualität, und ihre Anziehungskraft zieht die Aufmerksamkeit von Menschen und Wesen in Hör- und Sichtweite auf sich. Dieser Effekt gilt auch für Tiere und Menschen, die nicht dieselbe Sprache sprechen, daher muss darauf geachtet werden, keine unerwünschte Aufmerksamkeit auf sich zu ziehen. Ein Paradiesvogelgeist oder ein anderer aufmerksamkeitsstarker Tiergeist kann diese Gabe lehren.`,
    renown: W5RenownKey.Glory,
    cost: `1 Rage-Test`,
    action: `frei`,
    pool: `-`,
    system: `Sobald diese Gabe aktiv ist, wird der Nutzer zum Mittelpunkt der Aufmerksamkeit aller Personen in Hör- oder Sichtweite, und der Spieler kann den Ruhm des Charakters als Würfelbonus zu jeder öffentlichen Rede oder Präsentation hinzufügen, bei der es um Überzeugungskraft oder Darbietung geht. Gewöhnliche Menschen und Tiere fühlen sich vom Nutzer angezogen, und es ist unmöglich, diese Gabe zu nutzen und dabei auch nur den Anschein von Diskretion zu wahren. Körperliche Auseinandersetzungen in Anwesenheit des Benutzers brechen den Effekt, und die Gabe kann nicht verwendet werden, während der Werwolf in einen physischen Konflikt oder einen offenen Kampf verwickelt ist.`,
    duration: `eine Szene oder bis der Effekt unterbrochen wird oder vergeht`
  },

  {
    id: 43,
    category: W5GiftCategory.Auspice,
    totalRenown: 5,
    onlyFor: 3,
    name: `Fangzähne des Urteils`,
    description: `Der Nutzer dieser Gabe verurteilt einen Feind zum Tode und erklärt dessen Leben für verwirkt. Die Mitglieder des Rudels des Nutzers schärfen ihre Krallen und Zähne gegen den bestimmten Feind, um ihn besser ins Jenseits befördern zu können. Diese Gabe wird von einer beliebigen Anzahl von Raubtiergeistern gewährt.`,
    renown: W5RenownKey.Honor,
    cost: `1 Willenskraft`,
    action: `voll`,
    pool: `Entschlossenheit + Ehre`,
    system: `Der Nutzer der Gabe wählt ein sichtbares Ziel aus, das zuvor einem Mitglied seines Rudels Schaden zugefügt hat, und der Spieler führt einen Entschlossenheit + Ehre-Test mit Schwierigkeitsgrad 3 durch. Bei Erfolg erhalten die natürlichen Waffen des Rudels +1 Schaden gegen das ausgewählte Ziel. Nur ein Gegner kann von einem einzelnen Garou markiert werden, und die Effekte sind nicht kumulativ, wenn das Ziel von anderen Garou mit derselben Gabe ausgewählt wird. Die Gabe hält so lange an, bis dieser Feind tot ist oder das Urteil aufgehoben wird, wobei Letzteres nur in Anwesenheit des Ziels geschehen kann.`,
    duration: `bis der ausgewählte Gegner stirbt oder das Urteil aufgehoben wird`
  },

  {
    id: 44,
    category: W5GiftCategory.Auspice,
    totalRenown: 5,
    onlyFor: 3,
    name: `Der Duft der Vergangenheit`,
    description: `Wenn die Garou den Geruch von einem Gegenstand oder Ort einatmen, können sie einen kurzen Einblick in Ereignisse bekommen, die in der Nähe des Ziels passiert sind. Dramatischere Ereignisse hinterlassen stärkere Gerüche, und um Details und kleinere Ereignisse herauszufiltern, braucht man echt viel Geschick. Ein Krähengeist oder ein anderer Tiergeist, der in verschiedenen Umgebungen lebt und viele Ereignisse mitbekommt, kann diese Gabe verleihen.`,
    renown: W5RenownKey.Wisdom,
    cost: `1 Willenskraft`,
    action: `voll`,
    pool: `Intelligenz + Weisheit`,
    system: `Mach einen Intelligenz- + Weisheits-Test gegen einen Schwierigkeitsgrad, der von den gesuchten Infos abhängt. Die Umstände eines Duells zu erahnen, das letzte Woche mit einer bestimmten Waffe ausgetragen wurde, hat einen Schwierigkeitsgrad von 2, aber Infos über die Teilnehmer eines geheimen Treffens in einem Park vor Jahren zu bekommen, hat einen Schwierigkeitsgrad von 6 oder höher. Jeder Punkt Vorsprung beim Würfeln ermöglicht es dem Nutzer, immer detailliertere Infos zu bekommen. Diese Gabe kann auch in der Lupusform genutzt werden.`,
    duration: `ein Zug`
  },

  {
    id: 45,
    category: W5GiftCategory.Auspice,
    totalRenown: 8,
    onlyFor: 3,
    name: `Fluch`,
    description: `Der Garou kann einer einzelnen Person einen unumstößlichen Befehl erteilen und sie zwingen, eine Handlung auszuführen, die der Nutzer der Gabe wählt. Die Gabe erlaubt es aber nicht, auf irgendeine Weise Informationen zu bekommen, und Handlungen, die gegen die Natur oder das Selbsterhaltungstrieb des Opfers verstoßen, werden oft abgelehnt. Webergeister und Geister, die strenge Hierarchien einhalten, geben diese Gabe.`,
    renown: W5RenownKey.Glory,
    cost: `1 Rage-Test`,
    action: `voll`,
    pool: `Manipulation + Ruhm vs Fassung + Entschlossenheit`,
    system: `Der Garou muss den Befehl laut und in Anwesenheit des Subjekts geben. Andere übernatürliche Wesen und Menschen, die mit den Garou vertraut sind, können sich widersetzen (siehe Pool oben), ebenso wie jeder andere, wenn der Befehl gegen seine Natur verstößt oder denjenigen schaden würde, die das Subjekt liebt. Ein Befehl, der dem Opfer direkt schaden würde, wie sich selbst zu erschießen oder ins Feuer zu springen, geht automatisch daneben, genauso wie Befehle, die Unmögliches verlangen. Bis das Ziel die Handlung ausführt oder der Garou es aus dem Fluch befreit, versucht das Ziel für den Rest der Szene, die Handlung auszuführen.`,
    duration: `bis der Akt erledigt ist, die Szene vorbei ist oder der Fluch aufgehoben wird.`
  },

  {
    id: 46,
    category: W5GiftCategory.Auspice,
    totalRenown: 8,
    onlyFor: 3,
    name: `Der Fluch des Eidbrechers`,
    description: `Der Garou kann jemanden dazu bringen, ein Versprechen zu geben, und wird dann irgendwie übernatürlich darauf eingestellt, dass es eingehalten wird. Sobald es gebrochen wird, weiß der Garou das sofort. Ein Elefanten- oder Schlangengeist gibt diese Gabe.`,
    renown: W5RenownKey.Honor,
    cost: `1 Willenskraft`,
    action: `voll`,
    pool: `-`,
    system: `Der Betreffende muss den Eid persönlich vor dem Nutzer ablegen. Der Eid muss etwas sein, das der Eidleistende versteht und akzeptiert. Er kann so kurz oder ausführlich sein, wie der Nutzer der Gabe es will, aber das Versprechen bleibt so lange gültig, wie sich sowohl der Eidschmied als auch der Eidleistende daran erinnern. Daher ist es nicht ungewöhnlich, dass der Eidschmied den Eidleistenden aufsucht, um ihn an sein Versprechen zu erinnern. Der Garou spürt sofort, wenn der Eid gebrochen wird, egal wie weit weg er ist oder wie viel Zeit vergangen ist. Danach bekommt der Spieler für jeden Versuch, den Eidbrecher aufzuspüren, Bonuswürfel in Höhe der Ehre des Garou.`,
    duration: `auf unbestimmte Zeit oder bis der Schwur gebrochen wird`
  },

  {
    id: 47,
    category: W5GiftCategory.Auspice,
    totalRenown: 8,
    onlyFor: 3,
    name: `Ziellust`,
    description: `Die Nutzer dieser Gabe schöpfen Kraft aus ihrer Verantwortung als Beschützer von Gaia und können ihre mentale Stärke aus ihrer Wut wieder auffüllen. Diese Gabe wird von einem Stein- oder Feuergeist gewährt.`,
    renown: W5RenownKey.Honor,
    cost: `1 Rage-Test`,
    action: `klein`,
    pool: `Ehre`,
    system: `Der Spieler des Garou würfelt für jeden Punkt Ehre, den der Charakter hat, und heilt für jeden Erfolg einen Punkt oberflächlichen Willenskraftschaden oder für zwei Erfolge einen Punkt schweren Willenskraftschaden. Diese Gabe kann nur einmal pro Sitzung benutzt werden und ist in jeder Form einsetzbar.`,
    duration: `-`
  },

  {
    id: 48,
    category: W5GiftCategory.Auspice,
    totalRenown: 8,
    onlyFor: 3,
    name: `Nimm die wahre Form an`,
    description: `Der Garou zwingt ein Gestaltwandlerwesen, zu seiner „natürlichen” Form zurückzukehren. Dazu gehören Garou, einige Vampire und andere, noch seltsamere Wesen, die ihre Gestalt verändern können. Ein Flussgeist gewährt diese Gabe und spült so Schmuck und Täuschung weg.`,
    renown: W5RenownKey.Honor,
    cost: `1 Willenskraft`,
    action: `voll`,
    pool: `Manipulation + Ehre vs Ausdauer + Entschlossenheit`,
    system: `Der Garou sagt dem Typen, er soll wieder seine normale Gestalt annehmen, und der Spieler muss Manipulation + Ehre gegen die Ausdauer + Entschlossenheit des Ziels ausprobieren. Wenn er gewinnt, wird der Typ wieder normal, wie es normalerweise vorgesehen ist, und kann dann für eine Anzahl von Runden, die dem Vorsprung entspricht, seine Gestalt nicht mehr ändern. Diese Gabe kann in der Gestalt eines Menschen oder eines Wolfes benutzt werden und hört auf zu wirken, wenn der Benutzer während ihrer Wirkungsdauer seine Gestalt ändert.`,
    duration: `Randzahl der Umdrehungen oder der Benutzer ändert die Form`
  },

  {
    id: 49,
    category: W5GiftCategory.Auspice,
    totalRenown: 2,
    onlyFor: 4,
    name: `Tierischer Magnetismus`,
    description: `Der Werwolf ist irgendwie abstoßend und anziehend zugleich und hat diese wilde Ausstrahlung, die die Leute auf ihn aufmerksam macht. Ein Pfauengeist oder ein Geist, der mit Anziehungskraft zu tun hat (egal ob imaginär oder nicht), gibt ihm diese Gabe.`,
    renown: W5RenownKey.Glory,
    cost: `1 Rage-Test`,
    action: `frei`,
    pool: `-`,
    system: `Der Spieler des Garou kriegt seine Ehre als Bonuswürfel bei Sozialfertigkeitsproben gegen menschliche Gegner. Diese Gabe kann auch in Menschengestalt genutzt werden.`,
    duration: `eine Szene`
  },

  {
    id: 50,
    category: W5GiftCategory.Auspice,
    totalRenown: 2,
    onlyFor: 4,
    name: `Heulen der Versammlung`,
    description: `Der Garou lässt sein Heulen weit über die normale Reichweite hinaus schallen und füllt es mit großer Emotion, was die Herzen seiner Werwolfkameraden bewegt. Diejenigen, die dem Ruf folgen, werden in ihrer Entschlossenheit bestärkt. Ein Gesangsgeist oder der Geist eines Tieres, das für seinen einzigartigen Ruf bekannt ist, gewährt diese Gabe.`,
    renown: W5RenownKey.Honor,
    cost: `1 Rage-Test`,
    action: `klein`,
    pool: `Charisma + Ehre`,
    system: `Der Garou testet Charisma + Ehre gegen eine Schwierigkeit von 2. Wenn das klappt, heilen andere Garou, die das Heulen hören und sich dem Nutzer der Gabe anschließen, einen Punkt Willenskraft. Für jeden Erfolg in der Marge erreicht der Klang zusätzliche 100 Meter. Ein Charakter kann nur einmal pro Sitzung von dieser Gabe beeinflusst werden. Diese Gabe kann auch in Lupus-Form genutzt werden.`,
    duration: `-`
  },

  {
    id: 51,
    category: W5GiftCategory.Auspice,
    totalRenown: 2,
    onlyFor: 4,
    name: `Lied der Wut`,
    description: `Der Garou singt ein Lied über alte Missstände, aktuelle Gefahren und zukünftige Schmerzen, gibt der Qual von Gaia eine Stimme und schürt die Wut seiner Rudelkameraden.`,
    renown: W5RenownKey.Glory,
    cost: `1 Rage-Test`,
    action: `voll`,
    pool: `Charisma + Ruhm`,
    system: `Mach einen Gaben-Test mit Schwierigkeitsgrad 3. Wenn du ihn schaffst, kriegen alle anderen Mitglieder deines Rudels, die das hören können, einen Punkt Wut oder zwei Punkte bei einem kritischen Erfolg. Ein Charakter kann pro Sitzung nur einmal von dieser Gabe beeinflusst werden.`,
    duration: `-`
  },

  {
    id: 52,
    category: W5GiftCategory.Auspice,
    totalRenown: 2,
    onlyFor: 4,
    name: `Lied der Gelassenheit`,
    description: `Der Garou singt ein sanftes Lied, das an friedliche Zeiten und geliebte Menschen erinnert und das lodernde Feuer in den Herzen des Rudels beruhigt.`,
    renown: W5RenownKey.Honor,
    cost: `1 Willenskraft`,
    action: `voll`,
    pool: `Fassung + Ehre`,
    system: `Mach einen Gaben-Test mit Schwierigkeitsgrad 3. Wenn du ihn schaffst, verlieren alle Mitglieder deines Rudels, die das hören können, einen Punkt Wut oder bei einem kritischen Erfolg zwei Punkte, mindestens aber 1 Punkt. Rudelmitglieder, die gerade total ausflippen, können einen Gelassenheit+Entschlossenheit-Test mit Schwierigkeitsgrad 3 machen, um wieder runterzukommen und wie gewohnt aus der Crinos-Form rauszukommen (siehe S. 139). Ein Charakter kann nur einmal pro Szene von dieser Gabe beeinflusst werden.`,
    duration: `-`
  },

  {
    id: 53,
    category: W5GiftCategory.Auspice,
    totalRenown: 5,
    onlyFor: 4,
    name: `Ruf der Berittenen`,
    description: `Diese Gabe zieht von Geistern besessene Wesen an und kann sie in Fallen locken oder einfach aus ihrem Versteck vertreiben. Jeder Geist, der die Fähigkeit besitzt, von jemandem Besitz zu ergreifen, kann diese Gabe lehren.`,
    renown: W5RenownKey.Honor,
    cost: `1 Willenskraft`,
    action: `klein`,
    pool: `Fassung + Ehre vs Entschlossenheit + Menschenkenntnis`,
    system: `Der Spieler des Garou macht einen Gaben-Test gegen die Entschlossenheit + Menschenkenntnis aller besessenen Kreaturen, die den Ruf hören können. Die Besessenen, die dem Ruf nicht widerstehen können, versuchen mit aller Kraft, zur Quelle des Rufs zu gelangen, solange das keine offensichtliche Gefahr für ihr körperliches Wohlbefinden darstellt (wie zum Beispiel durch giftigen Abfluss zu laufen oder ohne Hilfe in eine tiefe Schlucht zu springen).`,
    duration: `eine Szene`
  },

  {
    id: 54,
    category: W5GiftCategory.Auspice,
    totalRenown: 5,
    onlyFor: 4,
    name: `Augen der Kobra`,
    description: `Der Garou kann mit seinem Blick das Opfer anziehen, einfach durch seine starke Persönlichkeit. Diese Gabe kommt von einem Schlangengeist.`,
    renown: W5RenownKey.Glory,
    cost: `1 Willenskraft`,
    action: `klein`,
    pool: `Charisma + Ruhm vs Fassung + Entschlossenheit`,
    system: `Solange der Nutzer Augenkontakt mit dem Opfer hält, bewegt sich das Opfer wie in Trance auf den Garou zu und macht nichts anderes, bis es in Reichweite ist. Dann hört der Effekt auf. Andere übernatürliche Wesen und Menschen, die den Garou und seine Kräfte kennen, können versuchen, dem Charisma + Ruhm des Nutzers mit Gelassenheit + Entschlossenheit zu widerstehen, aber sobald sie unter dem Einfluss der Gabe stehen, können sie nicht mehr wegsehen. Um den Blick von jemandem zu erhaschen, der aktiv versucht, dem Blick des Anwenders auszuweichen, braucht es einen Wettstreit zwischen der Entschlossenheit + Einschüchterung des Anwenders und dem Verstand + Bewusstsein des Ziels. Jeder Versuch, Gewalt gegen das Opfer anzuwenden, bricht den Effekt, ebenso wie andere lebensbedrohliche Situationen, und das Opfer kann wie gewohnt versuchen, Angriffen auszuweichen.`,
    duration: `eine Szene oder bis der Effekt vorbei ist, zum Beispiel wenn das Opfer den Nutzer erreicht.`
  },

  {
    id: 55,
    category: W5GiftCategory.Auspice,
    totalRenown: 5,
    onlyFor: 4,
    name: `Lied der Tapferkeit`,
    description: `Indem der Nutzer der Gabe von den Heldentaten der alten Garou singt, motiviert er seine Rudelkameraden. Die Zuhörer spüren, wie eine Welle der Kraft in ihnen aufsteigt, als würde Gaia sie dazu ermutigen, in die Fußstapfen der legendären Werwölfe zu treten.`,
    renown: W5RenownKey.Honor,
    cost: `1 Rage-Test`,
    action: `voll`,
    pool: `Charisma + Ehre`,
    system: `Mach einen Gaben-Test auf Schwierigkeitsgrad 3. Wenn du ihn schaffst, werden alle Mitglieder deines Rudels, die das hören können, zu größeren Taten inspiriert. Wenn deine Spieler Willenskraft ausgeben, um Würfel neu zu werfen, können sie alle Würfel in einem Pool neu werfen, nicht nur drei (brutale Ergebnisse können trotzdem nicht neu gewürfelt werden, siehe S. 133). Diese Gabe kann nur einmal pro Sitzung benutzt werden.`,
    duration: `eine Szene`
  },

  {
    id: 56,
    category: W5GiftCategory.Auspice,
    totalRenown: 5,
    onlyFor: 4,
    name: `Lied der Inspiration`,
    description: `Der Garou singt eine Ballade, die den kreativen Einsatz eines bestimmten Wissens oder einer bestimmten Fähigkeit feiert. Mitglieder des Rudels, die sich in diesem Bereich versuchen, merken, dass ihre Fähigkeiten über das übliche Maß hinaus verbessert werden.`,
    renown: W5RenownKey.Wisdom,
    cost: `1 Willenskraft`,
    action: `voll`,
    pool: `Manipulation + Weisheit`,
    system: `Der Spieler des Garou wählt eine soziale oder geistige Fertigkeit und macht einen Begabungstest mit Schwierigkeitsgrad 3 oder 2, wenn er selbst die Fertigkeit mit 2 oder mehr Punkten hat. Bei einem Erfolg kriegen die anderen Mitglieder des Rudels einen Bonuswürfel für Tests dieser Fertigkeit. Ein kritischer Erfolg beim Gaben-Test bringt stattdessen einen Bonus von zwei Würfeln.`,
    duration: `eine Szene`
  },

  {
    id: 57,
    category: W5GiftCategory.Auspice,
    totalRenown: 8,
    onlyFor: 4,
    name: `Gegen alle Wetten`,
    description: `Am Rande der Niederlage mobilisieren die Garou ihre innere Stärke, machen ihr Rudel mutig und drehen in den dunkelsten Stunden den Spieß um. Ein Warzenschwein- oder Dachsgeist gibt ihnen diese Gabe.`,
    renown: W5RenownKey.Glory,
    cost: `1 Rage-Test`,
    action: `voll`,
    pool: `Ruhm`,
    system: `Der Spieler würfelt einen Pool, der dem Ruhm des Garou entspricht. Jeder Erfolg lässt jedes Rudelmitglied (auch den Nutzer der Gabe) einen Punkt leichten Willenskraftschaden wiederherstellen. Diese Gabe kann nur einmal pro Geschichte benutzt werden.`,
    duration: `-`
  },

  {
    id: 58,
    category: W5GiftCategory.Auspice,
    totalRenown: 8,
    onlyFor: 4,
    name: `Die Fesseln sprengen`,
    description: `Ein Garou kann diese Gabe nutzen, um übernatürlichen Zwang oder direkte Gedankenkontrolle zu durchbrechen und die Fesseln zu lösen, die den Geist einer anderen Person binden. Jeder geflügelte Geist kann diese Gabe gewähren, ebenso wie Geister, die mit Gorgonen in Verbindung stehen.`,
    renown: W5RenownKey.Glory,
    cost: `1 Rage-Test`,
    action: `voll`,
    pool: `Entschlossenheit + Ruhm`,
    system: `Der Nutzer der Gabe schaut dem Opfer in die Augen und brüllt kurz und scharf, und der Spieler macht einen Gaben-Test. Die Schwierigkeit hängt davon ab, was für ein Effekt das Opfer beeinflusst und wie stark die Kreatur dahinter ist, aber normalerweise ist sie 3. Der Spielleiter kann dem Opfer erlauben, seine Entschlossenheit zum Gaben-Test-Pool hinzuzufügen, wenn es aktiv versucht, dem Effekt zu widerstehen.`,
    duration: `-`
  },

  {
    id: 59,
    category: W5GiftCategory.Auspice,
    totalRenown: 8,
    onlyFor: 4,
    name: `Dem Tod trotzen`,
    description: `Wie Garou aus der Legende kann der Nutzer dieser Gabe dem Tod ein Schnippchen schlagen, weil sein Körper sich schnell erholt, wenn er am Rande der Niederlage steht. Ein Wolf oder ein Bärengeist gibt ihm diese Gabe.`,
    renown: W5RenownKey.Honor,
    cost: `frei`,
    action: `frei`,
    pool: `Ehre`,
    system: `Wenn die Gesundheit der Garou durch schweren Schaden komplett aufgebraucht ist, würfelt der Spieler sofort einen Pool, der der Ehre des Charakters entspricht. Jeder Erfolg hilft ihm, einen Punkt Gesundheit wiederherzustellen. Diese Gabe kann nur einmal pro Sitzung benutzt werden. Diese Gabe kann in jeder Form eingesetzt werden.`,
    duration: `-`
  },

  {
    id: 60,
    category: W5GiftCategory.Auspice,
    totalRenown: 8,
    onlyFor: 4,
    name: `Traumwanderung`,
    description: `Der Garou kann einen Geist über seltsame Pfade durch die Tiefen der Umbra in die Träume anderer schicken, um diese Träume zu verändern oder einfach an ihrer geheimnisvollen Geschichte teilzunehmen. Die Gabe kann genutzt werden, um Nachrichten zu hinterlassen, den Träumenden zu verunsichern oder ein besseres Verständnis für die Gedanken eines Fremden zu bekommen. Ein Traumgeist gewährt diese Gabe.`,
    renown: W5RenownKey.Wisdom,
    cost: `1 Willenskraft`,
    action: `ganze Szene`,
    pool: `Geistesschärfe + Weisheit`,
    system: `Der Spieler, der die Gabe nutzt, macht einen Gaben-Test gegen einen vom Geschichtenerzähler festgelegten Schwierigkeitsgrad, je nachdem, was er erreichen will: 2, um einfach nur zu beobachten, 3, um eine Nachricht zu hinterlassen, und bis zu 4 oder mehr, um die Traumlandschaft komplett zu verändern und den Träumenden irgendwie zu beeinflussen. Wenn die Fähigkeit dazu benutzt wird, den Träumenden zu verunsichern oder auf andere Weise zu erschrecken, kann der Träumende für den Rest der Sitzung keine Willenskraft auf natürliche Weise zurückgewinnen und verliert für jeden Erfolg in der Marge einen zusätzlichen Willenskraftpunkt. Die Fähigkeit kann genutzt werden, solange der Nutzer den Aufenthaltsort des Träumenden kennt, wobei extreme Entfernungen (z. B. über einen Kontinent hinweg) die Schwierigkeit um 1 erhöhen. Diese Fähigkeit kann in jeder Form genutzt werden.`,
    duration: `eine Szene`
  },

  {
    id: 61,
    category: W5GiftCategory.Auspice,
    totalRenown: 1,
    onlyFor: 5,
    name: `Halt den Feigling auf!`,
    description: `Der Garou kann ein flüchtendes Ziel verlangsamen, indem er seine Beine zum Knicken bringt, seinen Halt schwächt und seine Reifen zum Durchdrehen bringt. Diese Gabe wird von einem Sumpfgeist gewährt.`,
    renown: W5RenownKey.Honor,
    cost: `1 Rage-Test`,
    action: `voll`,
    pool: `Entschlossenheit + Ehre vs Fassung + Überleben`,
    system: `Der Garou stößt ein furchterregendes Heulen aus, das sich gegen ein sichtbares Ziel richtet, das vor ihm oder einem Mitglied seines Rudels flieht und sich noch in einer Entfernung von bis zu 50 Metern befindet. Ein Opfer dieser Gabe wird in seiner Bewegungsgeschwindigkeit auf Schrittgeschwindigkeit reduziert, solange es versucht, dem Anwender zu entkommen. Ziele in der Luft werden zu Boden gezogen. Die Gabe wirkt automatisch bei normalen Menschen, Fahrzeugen und Tieren. Übernatürliche Opfer, wie Vampire oder andere Werwölfe, müssen in einem Test von Entschlossenheit + Ehre gegen Gelassenheit + Überleben besiegt werden. (Nach Ermessen des Spielleiters können extrem motivierte oder anderweitig vorbereitete Menschen auf ähnliche Weise Widerstand leisten.)`,
    duration: `eine Szene`
  },

  {
    id: 62,
    category: W5GiftCategory.Auspice,
    totalRenown: 1,
    onlyFor: 5,
    name: `Schneller Wechsel`,
    description: `Der Werwolf kann sich im Handumdrehen verwandeln. Das ist aber riskant, weil Garou sich schwer verletzen kann, wenn es nicht klappt. Jeder Geist von Gaia kann diese Gabe geben.`,
    renown: W5RenownKey.Glory,
    cost: `frei (Verwandlungskosten fallen dennoch an)`,
    action: `frei`,
    pool: `Geschicklichkeit + Ruhm`,
    system: `Der Nutzer verwandelt sich, und der Spieler macht einen Gaben-Test gegen die Schwierigkeit der Gestalt: 1 für Hornid und Lupus, 2 für Glabro und Hispo und 3 für Crinos. Bei einem Erfolg wird die Strafe für die Nebenaktion für die Verwandlung ignoriert. Wenn der Test fehlschlägt, erleidet der Benutzer oberflächlichen Schaden in Höhe der Fehlschlagmarge, wobei die Strafe für den Verwandlungswürfel jedoch weiterhin aufgehoben wird. Diese Gabe kann in jeder Form eingesetzt werden.`,
    duration: `-`
  },

  {
    id: 63,
    category: W5GiftCategory.Auspice,
    totalRenown: 1,
    onlyFor: 5,
    name: `Messerscharfe Klauen`,
    description: `Die natürlichen Krallen der Garou werden übernatürlich scharf und gefährlich, sodass sie ihren Feinden noch mehr Schaden zufügen können. Der Geist eines Raubtiers verleiht ihnen diese Gabe.`,
    renown: W5RenownKey.Glory,
    cost: `frei / 1 Rage-Test`,
    action: `frei / klein`,
    pool: `-`,
    system: `Diese Gabe ist kostenlos und wirkt sofort, wenn du in der Crinos-Form bist. Leg die Hälfte der Garou-Ruhm-Punkte (aufgerundet) zum Schaden deiner Klauenangriffe dazu. Wenn deine aktuelle Form keine Klauen hat, bekommst du einen Klauenangriff mit der Hälfte des Ruhm-Schadens, weil deine Fingernägel länger und härter werden.`,
    duration: `eine Szene`
  },

  {
    id: 64,
    category: W5GiftCategory.Auspice,
    totalRenown: 1,
    onlyFor: 5,
    name: `Gefahr spüren`,
    description: `Der Garou wird übernatürlich wachsam gegenüber Gefahren und kann auf plötzliche Bedrohungen, wie zum Beispiel ambt1sh, mit unheimlicher Schnelligkeit reagieren. Der Geist eines Beutetiers verleiht ihm diese Gabe.`,
    renown: W5RenownKey.Wisdom,
    cost: `-`,
    action: `frei`,
    pool: `-`,
    system: `Der Spieler des Garou kann seine Weisheit bei jedem Versuch, Fallen, Hinterhalte oder Überraschungsangriffe zu entdecken, dazunehmen. Diese Würfel solltest du nur dazunehmen, wenn ein Fehlschlag eine unmittelbare Gefahr für den Nutzer der Gabe bedeuten würde, nicht aber, wenn er einen Bereich aktiv absucht. Diese Gabe kann in jeder Form genutzt werden.`,
    duration: `-`
  },

  {
    id: 65,
    category: W5GiftCategory.Auspice,
    totalRenown: 5,
    onlyFor: 5,
    name: `Urwut`,
    description: `Diese Gabe wird als letzter Ausweg benutzt und lässt die Garou ihre Wut mit ihrem eigenen Körper nähren, indem sie Fleisch, Blut und Knochen als Treibstoff für ihre übernatürliche Wut verbrauchen. Ein legendärer Wolfsgeist gibt diese Gabe.`,
    renown: W5RenownKey.Glory,
    cost: `-`,
    action: `klein`,
    pool: `-`,
    system: `Wenn du diese Gabe aktivierst, verursacht das dem Opfer einen einzigen Punkt verschlimmerten Schaden, der sich für das Opfer wie ein existenzielles Brennen anfühlt. Dafür kriegst du Wut, die der Anzahl der Erfolge bei einem direkten Ruhm-Test entspricht. Diese Gabe kannst du nur einmal pro Sitzung benutzen.`,
    duration: `-`
  },

  {
    id: 66,
    category: W5GiftCategory.Auspice,
    totalRenown: 5,
    onlyFor: 5,
    name: `Knurrendes Herausfordern`,
    description: `Die Garou fordern alle ihre Feinde heraus und machen sich bereit für die Angriffe ihrer Gegner. Ein Bärengeist gibt ihnen diese Gabe.`,
    renown: W5RenownKey.Honor,
    cost: `1 Rage-Test`,
    action: `klein`,
    pool: `Charisma + Ehre vs Fassung + Menschenkenntnis`,
    system: `Der Spieler des Garou macht einen Gabe-Test gegen alle Gegner, die ihn hören und sehen können. Für den Garou wird nur ein Wurf gemacht, während jeder Gegner mit seiner Fassung + Menschenkenntnis dagegen ankämpft. Diejenigen, die sich nicht wehren können, müssen bei Angriffen auf andere außer dem Nutzer dieser Gabe einen Malus von zwei Würfeln hinnehmen. Der Nutzer bekommt zusätzliche Gesundheitsstufen in Höhe seiner Ehre, wenn mindestens ein Gegner den Effekten erliegt. Diese Gesundheitsstufen fangen jeweils einen Punkt leichten Schadens ab, schützen aber nicht vor schwerem Schaden.`,
    duration: `eine Szene`
  },

  {
    id: 67,
    category: W5GiftCategory.Auspice,
    totalRenown: 5,
    onlyFor: 5,
    name: `Wahre Furcht`,
    description: `Der Werwolf macht seinen Gegnern Angst, indem er seine Zähne oder Krallen zeigt, heult oder sich einfach bedrohlich über sie beugt und knurrt. Die Geister der Angst bringen ihm diese Gabe bei.`,
    renown: W5RenownKey.Glory,
    cost: `1 Rage-Test`,
    action: `voll`,
    pool: `Charisma + Ruhm vs Fassung + Entschlossenheit`,
    system: `Diese Gabe kann bei einem einzelnen Ziel innerhalb von fünf Metern eingesetzt werden und wirkt automatisch bei normalen Menschen und Tieren, während übernatürliche Wesen und Menschen, die die Garou und ihre Kräfte kennen, in einem Charisma + Ruhm gegen Gelassenheit + Entschlossenheit-Test besiegt werden müssen. Ein von dieser Gabe betroffenes Ziel ist entweder vor Angst wie gelähmt oder von solcher Furcht erfasst, dass es alles tut, um der Gegenwart des Werwolfs zu entkommen. Übernatürliche Wesen können den Effekt nach einer Runde abschütteln, indem sie einen Punkt Willenskraft ausgeben.`,
    duration: `eine Szene`
  },

  {
    id: 68,
    category: W5GiftCategory.Auspice,
    totalRenown: 5,
    onlyFor: 5,
    name: `Windklauen`,
    description: `Die Klauen der Garou werden kurzzeitig körperlos, sodass sie jede Art von Rüstung, die das Ziel trägt, ignorieren können. Diese Gabe wird von einem Windgeist gewährt.`,
    renown: W5RenownKey.Wisdom,
    cost: `frei / 1 Willenskraft`,
    action: `frei / klein`,
    pool: `Geistesschärfe + Weisheit`,
    system: `Diese Gabe ist kostenlos und wirkt sofort, wenn du in der Crinos-Form bist. Angriffe mit den Klauen des Garou ignorieren normale Rüstungen oder Schadensreduzierungen in Höhe des Weisheitswerts des Benutzers. Übernatürliche Rüstungen werden nach Ermessen des Spielleiters ignoriert und erfordern möglicherweise einen Geistesschärfe + Weisheits-Test mit angemessener Schwierigkeit, um ignoriert zu werden. Dieser Test sollte nur einmal durchgeführt werden, und das Ergebnis gilt für den Rest der Szene.`,
    duration: `eine Szene`
  },

  {
    id: 69,
    category: W5GiftCategory.Auspice,
    totalRenown: 8,
    onlyFor: 5,
    name: `Die Lücke schließen`,
    description: `Entweder mit Hilfe von Geistern oder indem du geschickt der Umbra ausweichst, legst du sofort eine Distanz zurück, um den Kampf zu deinen Feinden zu bringen. Ein Heuschrecken- oder Mantisgeist gewährt dir diese Gabe.`,
    renown: W5RenownKey.Glory,
    cost: `1 Rage-Test`,
    action: `klein`,
    pool: `-`,
    system: `Der Garou bewegt sich sofort in Nahkampfreichweite eines Gegners in Sichtweite und überwindet dabei eine Entfernung von bis zu drei Metern pro Punkt Ruhm, während er im selben Zug einen Angriff ausführen kann. (Beachte, dass es dem Benutzer immer noch möglich sein muss, die Entfernung physisch zu überwinden – er kann sich nicht durch Felswände oder Gefängnisgitter bewegen.) Der Benutzer gilt zu Beginn des Zuges für die Zwecke der Kampfpriorität als bereits im Kampf befindlich.`,
    duration: `ein Zug`
  },

  {
    id: 70,
    category: W5GiftCategory.Auspice,
    totalRenown: 8,
    onlyFor: 5,
    name: `Kuss des Helios`,
    description: `Der Werwolf ruft den Sonnengott Helios an und wird mit übernatürlicher Hitze erfüllt, die ihn fast immun gegen Feuer und andere Hitze-basierte Schäden macht. Ein Sonnenstrahlgeist gibt ihm diese Gabe.`,
    renown: W5RenownKey.Glory,
    cost: `1 Rage-Test`,
    action: `klein`,
    pool: `-`,
    system: `Der Werwolf nimmt während der Dauer dieser Gabe keinen Schaden durch Feuer und ähnliche Hitzequellen und reduziert den Schaden durch stärkere Quellen um einen Betrag, der seiner Ehre pro Runde entspricht. Außerdem erleidet jeder, der den Nutzer mit bloßer Haut angreift, oberflächlichen Schaden in Höhe der Ehre des Nutzers, da der Angreifer durch die glühende Haut des Werwolfs verbrannt wird.`,
    duration: `eine Szene`
  },

  {
    id: 71,
    category: W5GiftCategory.Auspice,
    totalRenown: 8,
    onlyFor: 5,
    name: `Lunas Rüstung`,
    description: `Der Werwolf ist von einem silbernen Nebel umhüllt, der ihn vor Schaden durch Feuer und Silber schützt. Diese Gabe wird von einer Lune gewährt.`,
    renown: W5RenownKey.Honor,
    cost: `1 Willenskraft`,
    action: `klein`,
    pool: `-`,
    system: `Wenn der Werwolf Schaden (normalerweise schweren Schaden) durch Feuer oder Silber erleidet, wird ein Betrag in Höhe seiner Ehre stattdessen in leichten Schaden umgewandelt (der aber nicht halbiert wird).`,
    duration: `eine Szene`
  },

  {
    id: 72,
    category: W5GiftCategory.Auspice,
    totalRenown: 8,
    onlyFor: 5,
    name: `Silberne Klauen`,
    description: `In einer qualvollen Verwandlung werden die natürlichen Klauen der Garou silbern, wodurch sie anderen Garou dauerhaften Schaden zufügen können. Ein Rachegeist oder Elementargeist aus Silber gewährt diese Gabe.`,
    renown: W5RenownKey.Honor,
    cost: `frei / 1 Willenskraft`,
    action: `frei / klein`,
    pool: `-`,
    system: `Diese Gabe ist kostenlos und wirkt sofort, wenn du in der Crinos-Form bist. Die Klauenangriffe des Garou verursachen anderen Garou schweren Schaden. Wenn deine aktuelle Form keine Klauen hat, bekommst du zusätzlich einen Klauenangriff mit +0 Schaden, da sich deine Fingernägel verlängern, verhärten und eine silberne Beschichtung bekommen. Die silbernen Klauen verursachen pro Runde einen Punkt schweren Schadens gemäß den normalen Silberregeln, und der Nutzer muss jede Runde einen Fassung + Ehre-Test mit Schwierigkeitsgrad 3 bestehen, um diese Gabe aufrechtzuerhalten, da die durch das Silber verursachten Schmerzen unerträglich werden können.`,
    duration: `eine Szene`
  },

  {
    id: 73,
    category: W5GiftCategory.Tribal,
    totalRenown: 3,
    onlyFor: null,
    name: `Der Fluch des Äolus`,
    description: `Der Garou beschwört einen dichten, unheimlichen Nebel herauf, der die Sicht verschleiert und seine Gegner verunsichert. Ein Nebelgeist gewährt ihm diese Gabe.`,
    renown: W5RenownKey.Glory,
    cost: `1 Willenskraft`,
    action: `voll`,
    pool: `Entschlossenheit + Ruhm`,
    system: `Der Spieler macht einen Entschlossenheit + Ruhm-Test gegen Schwierigkeitsgrad 2. Mit jedem Erfolg in der Marge kannst du einen Bereich von ungefähr der Größe eines Hauses mit Nebel bedecken. Alle im Nebel haben einen Malus von zwei Würfeln auf ihre Aufmerksamkeit- und Schusswaffentests. Diese Gabe kannst du in jeder Form einsetzen.`,
    duration: `eine Szene`
  },

  {
    id: 74,
    category: W5GiftCategory.Tribal,
    totalRenown: 6,
    onlyFor: null,
    name: `Coup de Grâce`,
    description: `Die Garou setzen all ihre Kraft und ihr Können ein, um einen entscheidenden Schlag auszuführen, der den Gegner mit einem Schlag erledigen soll. Jeder Geist, der mit Stolz verbunden ist, gewährt diese Gabe.`,
    renown: W5RenownKey.Glory,
    cost: `1 Willenskraft`,
    action: `voll`,
    pool: `-`,
    system: `Der Garou konzentriert sich voll auf einen Gegner und nutzt einen ganzen Zug, um seine Kraft zu sammeln. Der nächste Nahkampf- oder Nahkampfangriff des Benutzers erhöht den Schaden um seinen Ruhm, aber nur, wenn dadurch die physische Gesundheit des Gegners auf null sinkt. In jedem Fall hört der Effekt nach dem Angriff auf.`,
    duration: `nächster Handgemenge- oder Nahkampfangriff, oder die Szene ist vorbei`
  },

  {
    id: 75,
    category: W5GiftCategory.Tribal,
    totalRenown: 6,
    onlyFor: null,
    name: `Kalis Narbe`,
    description: `Die Wunden, die die Garou mit ihren Klauen und Reißzähnen verursachen, sind zerfetzt und eitern, und der Schaden kann nicht geheilt werden, solange die Gabe aktiv ist. Außerdem kann der Nutzer das Opfer anhand des Geruchs der offenen Wunde aufspüren, falls es flüchtet. Ein Fäulnisgeist gewährt diese Gabe.`,
    renown: W5RenownKey.Glory,
    cost: `1 Rage-Test`,
    action: `klein`,
    pool: `-`,
    system: `Solange die Gabe aktiv ist, kann kein Schaden, den die Krallen oder Zähne des Benutzers verursachen, geheilt oder repariert werden, auch nicht mit anderen Gaben oder übernatürlichen Fähigkeiten. Außerdem bekommt der Spieler des Benutzers bei jedem Versuch, das Opfer aufzuspüren oder zu finden, während die Gabe wirkt, Würfelboni in Höhe der Ehre des Charakters. (In seltenen Fällen kann ein Geschichtenerzähler extrem mächtigen Gegnern erlauben, sich mit einem entsprechenden Pool, wie z. B. Macht, gegen die Ausdauer + Ehre des Benutzers zu wehren und den Effekt nach einer Runde aufzuheben.)`,
    duration: `eine Nacht und ein Tag`
  },

  {
    id: 76,
    category: W5GiftCategory.Tribal,
    totalRenown: 6,
    onlyFor: null,
    name: `Krallen der Wespe`,
    description: `Die Garou können ihre Klauen wie Pfeile abschießen und so einem weit entfernten Gegner Schaden zufügen, als wären sie direkt vor ihm. Dabei werden ihre Hände oder Pfoten blutig und sie haben keine Klauen mehr, bis die selbst zugefügte Wunde verheilt ist. Diese Gabe wird von einem Wespengeist gewährt.`,
    renown: W5RenownKey.Glory,
    cost: `-`,
    action: `voll`,
    pool: `Geschicklichkeit + Ruhm`,
    system: `Der Nutzer macht einen Fernangriff mit Geschicklichkeit + Ruhm und bekommt alle Schadensmodifikatoren für seine Klauen. (Wenn er in seiner aktuellen Form keine Klauen hat, bekommt er nur während der Nutzung dieser Gabe einen Klauenangriff mit +0 Schaden.) Außerdem erleidet er oberflächlichen Schaden, weil seine Klauen aus den Pfoten gerissen werden, und kann keine Klauenangriffe mehr machen, bis der Schaden geheilt oder regeneriert ist.`,
    duration: `-`
  },

  {
    id: 77,
    category: W5GiftCategory.Tribal,
    totalRenown: 9,
    onlyFor: null,
    name: `Gorgonens Anblick`,
    description: `Diese gruselige Gabe aus der Legende lässt jeden erstarren, der das Gesicht des Garou sieht. Die Opfer sind wie festgefroren; sie werden zwar nicht wirklich zu Stein, können sich aber nicht mehr wehren und sind dem Anwender völlig ausgeliefert. Ein Avatar der Gorgone gibt diese Gabe.`,
    renown: W5RenownKey.Glory,
    cost: `1 Willenskraft`,
    action: `voll`,
    pool: `Charisma + Ruhm vs Geistesschärfe + Okkultismus`,
    system: `Der Spieler macht einen Charisma + Ruhm-Test gegen Geistesschärfe + Okkultismus von allen, die nicht wegschauen. Opfer, die den Test nicht bestehen, sind für den Rest der Szene komplett gelähmt, aber übernatürliche Wesen können sich nach einer Runde Lähmung befreien, indem sie einen Punkt Willenskraft ausgeben. Ein Opfer, das sich befreit, kann für den Rest der Szene nicht erneut gelähmt werden. Beachte, dass der Effekt langsam genug ist, um Zuschauern die Möglichkeit zu geben, wegzuschauen, obwohl dumme Personen oder solche, die versuchen, dem Benutzer Schaden zuzufügen, es trotzdem wagen könnten.`,
    duration: `eine Szene`
  },

  {
    id: 78,
    category: W5GiftCategory.Tribal,
    totalRenown: 3,
    onlyFor: null,
    name: `Ekelhafter Geruch`,
    description: `Die Garou verstärken ihren natürlichen Geruch und verströmen einen Gestank, der stark genug ist, um alle außer den entschlossensten Gegnern abzuschrecken. Ein Stinktiergeist gewährt diese Gabe.`,
    renown: W5RenownKey.Honor,
    cost: `1 Rage-Test`,
    action: `klein`,
    pool: `-`,
    system: `Jeder und alles, was einen Geruchssinn hat, außer anderen Knochenknabbern, muss einen Willenskraftpunkt ausgeben und einen Test in Fassung + Überleben gegen die Ausdauer + Ehre des Benutzers bestehen, sonst muss er aufhören, bevor er den Benutzer erreicht. Diese Gabe gilt nur außerhalb von Kämpfen, obwohl dank ihr schon viele physische Konflikte vermieden werden konnten. Diese Gabe kann in jeder Form genutzt werden.`,
    duration: `eine Szene`
  },

  {
    id: 79,
    category: W5GiftCategory.Tribal,
    totalRenown: 6,
    onlyFor: null,
    name: `Gesicht in der Menge`,
    description: `Ein Wimpernschlag, und schon sind sie weg. Die Garou können sich in einer Menschenmenge verstecken und nach einer kleinen Veränderung ihres Aussehens scheinbar verschwinden. Ein Kakerlakengeist gibt ihnen diese Gabe.`,
    renown: W5RenownKey.Honor,
    cost: `1 Willenskraft`,
    action: `klein`,
    pool: `-`,
    system: `Einmal pro Szene kannst du diese Gabe aktivieren, wenn du dich in einer Menschenmenge versteckst, um Verfolger abzuschütteln. Dadurch wird deine Ehre zur Schwierigkeit jedes Versuchs addiert, dich zu entdecken oder zu verfolgen, solange du dich in der Menschenmenge befindest. Diese Gabe kann nur in menschlicher Gestalt oder (inmitten von Hunden oder Wölfen) in Wolfsgestalt eingesetzt werden.`,
    duration: `eine Szene`
  },

  {
    id: 80,
    category: W5GiftCategory.Tribal,
    totalRenown: 6,
    onlyFor: null,
    name: `Straßen erzählen Geschichten`,
    description: `Die Garou können ihr Ohr auf den Boden legen und so alle Gespräche mithören, die auf einer bestimmten Straße oder in deren Nähe stattfinden. Diese Gabe wird von einem Stadtgeist gewährt.`,
    renown: W5RenownKey.Honor,
    cost: `1 Willenskraft`,
    action: `voll`,
    pool: `Fassung + Ehre`,
    system: `Der Garot1 hört sich auf der Straße um, und der Spieler macht einen Gaben-Test mit einem Schwierigkeitsgrad, den der Geschichtenerzähler festlegt, je nachdem, wie viele Leute auf (oder neben) der Straße sind und wie weit weg das gesuchte Gespräch ist. (Das Belauschen eines Gesprächs, das zwei Blocks entfernt auf einem ansonsten leeren Bürgersteig stattfindet, wäre 2, während das Aufschnappen eines Gesprächs im 50. Stock während der Rushhour fast 5 wäre. Wenn das klappt, kann der Garou alles hören, als stünde er direkt neben dem Sprecher, aber nur die tatsächliche Sprache einer lebenden Person ist zu hören, also keine Umgebungsgeräusche oder die andere Seite eines Telefongesprächs zum Beispiel. Diese Gabe kann in jeder Form genutzt werden.`,
    duration: `eine Szene`
  },

  {
    id: 81,
    category: W5GiftCategory.Tribal,
    totalRenown: 9,
    onlyFor: null,
    name: `Tausend Augen`,
    description: `Wenn die Garou ihre Augen schließen und sich konzentrieren, können sie durch die Augen jedes Tieres in der Nähe sehen, solange das Tier mindestens so groß wie eine Kakerlake ist. Ein Ameisengeist gewährt diese Gabe.`,
    renown: W5RenownKey.Honor,
    cost: `1 Willenskraft`,
    action: `voll`,
    pool: `Geistesschärfe + Ehre`,
    system: `Der Garou schließt die Augen, und der Spieler macht einen Gabe-Test mit einem Schwierigkeitsgrad, den der Geschichtenerzähler festlegt, je nachdem, wie viele Tiere in der Nähe sind und wonach der Gabe-Nutzer sucht. (Das Erkunden einer Farm wäre 2, während das Finden eines bestimmten Wissenschaftlers in einem städtischen medizinischen Zentrum eher 5 wäre.) Einige übernatürliche Wesen können das übernatürliche Eindringen und das Tier, das als Augen fungiert, erkennen. Wenn dieses Tier getötet wird, während die Gabe eingesetzt wird (absichtlich oder durch Zufall), erleidet der Anwender durch den mentalen Schock einen schweren Willenskraftschaden.`,
    duration: `eine Szene`
  },

  {
    id: 82,
    category: W5GiftCategory.Tribal,
    totalRenown: 9,
    onlyFor: null,
    name: `Zwischen den Rissen`,
    description: `Im Handumdrehen kann der Garou in jeder Spalte verschwinden, solange die Spalte mindestens eine J1-Breite hat, und aus einer anderen Spalte wieder auftauchen, die gerade außer Sichtweite oder weit genug entfernt ist, um einer Verfolgung zu entgehen. Ein Geist der Schatten, des Verfalls oder der Zerstörung gewährt diese Gabe.`,
    renown: W5RenownKey.Honor,
    cost: `1 Rage-Test`,
    action: `voll`,
    pool: `-`,
    system: `Der Garou kann in einen Riss (eine durch Abnutzung oder Beschädigung entstandene Spalte, nicht irgendeine Lücke) in der Landschaft oder einem Gebäude flüchten und eine Runde später aus einem anderen Riss wieder auftauchen, solange er den Riss erreichen kann, beide Risse mindestens eine Handbreit lang sind und die Risse sowohl für den Nutzer sichtbar als auch innerhalb von zehn Metern pro Ehre des Nutzers liegen. Der Geschichtenerzähler entscheidet letztendlich, ob es passende Ein- und Ausgänge gibt, und der Garou kann diese Gabe nicht nutzen, wenn kein Ausgang in Reichweite ist.`,
    duration: `ein Zug`
  },

  {
    id: 83,
    category: W5GiftCategory.Tribal,
    totalRenown: 3,
    onlyFor: null,
    name: `Der Duft meines Bruders`,
    description: `Der Werwolf kann sich in jede beliebige Gruppe einfügen, egal wie der Nutzer aussieht. Diejenigen, die keinen Grund haben, die Anwesenheit des Garou zu vermuten, übersehen ihn einfach, während misstrauischere Personen es schwerer finden, den Betrüger zu entdecken. Ein Avatar von Unicorn gewährt diese Gabe.`,
    renown: W5RenownKey.Wisdom,
    cost: `1 Willenskraft`,
    action: `voll`,
    pool: `-`,
    system: `Solange der Nutzer in einer Form ist, die zum Sammeln von Zielen passt, bleibt die Anwesenheit des Garou in einer Gruppe von Fremden (wie einem High-Society-Club, einer eng verbundenen kriminellen Bande oder einem unbekannten Caern) unbemerkt, es sei denn, die Personen suchen aktiv nach einem Eindringling. In diesem Fall bekommt der Nutzer der Gabe seine Weisheit als Bonus auf Täuschungs- oder Darbietungsversuche, um unentdeckt zu bleiben. Diese Gabe verhindert nicht, dass er durch unpassendes Verhalten auffällt, wie zum Beispiel, wenn er sich in dem oben genannten Club nackt auszieht, aber solange er seine Tarnung aufrechterhält, wird der Garou als Mitglied der Gruppe behandelt. Beachte, dass jeder, der den Nutzer vom Sehen kennt, ihn erkennen wird, im Guten wie im Schlechten. Diese Gabe kann nur in menschlicher Gestalt genutzt werden, es sei denn, es handelt sich um eine Versammlung der Garou.`,
    duration: `eine Szene`
  },

  {
    id: 84,
    category: W5GiftCategory.Tribal,
    totalRenown: 6,
    onlyFor: null,
    name: `Beruhige das wütende Biest`,
    description: `Der Nutzer kann einen wütenden Gegner beruhigen oder einem anderen Garou, der total durchgedreht ist, helfen, seinen wilden Impulsen zu widerstehen. Diese Gabe wird von einem legendären Wolfsgeist verliehen.`,
    renown: W5RenownKey.Wisdom,
    cost: `1 Willenskraft`,
    action: `voll`,
    pool: `Fassung + Weisheit`,
    system: `Der Spieler gibt einen Willenskraftpunkt aus und macht einen Test auf Fassung + Weisheit gegen die aktuelle Wut eines Ziels, das in Raserei ist, oder gegen einen Schwierigkeitsgrad von 3 bei anderen übernatürlichen Kreaturen. Wenn der Spieler erfolgreich ist, kommt das Ziel aus der Raserei raus und kehrt zu seiner natürlichen Form zurück (wenn es ein Garou ist), wie es bei den normalen Regeln für das Verlassen der Crinos-Form vorgesehen ist. Diese Gabe kann in jeder Form benutzt werden.`,
    duration: `-`
  },

  {
    id: 85,
    category: W5GiftCategory.Tribal,
    totalRenown: 6,
    onlyFor: null,
    name: `Trauma offenbaren`,
    description: `Der Garou kann Lebewesen, Geister oder sogar Geräte untersuchen und so herausfinden, was mit dem Ziel los ist. Die Gabe hilft zwar nicht, das Problem direkt zu lösen, aber Wissen ist der erste Schritt zur Heilung. Ein leidender Geist gibt diese Gabe.`,
    renown: W5RenownKey.Wisdom,
    cost: `1 Willenskraft`,
    action: `voll`,
    pool: `Intelligenz + Weisheit`,
    system: `Der Spieler macht einen Geschenktest gegen einen Schwierigkeitsgrad, der vom Gegenstand abhängt: 2 für ein Lebewesen, 3 für einen Geist und 4 für eine Maschine oder ein Gerät. (Ein unwilliger Gegenstand kann versuchen, sich zu wehren, anstatt einen festgelegten Schwierigkeitsgrad anzuwenden, indem er seine Fassung + Ausflüchte einsetzt.) Bei einem Erfolg bekommt der Nutzer ein bisschen Ahnung von der größten Verletzung oder dem größten Trauma, das das Ziel gerade hat. Das kann körperlich, übernatürlich oder sogar mental sein. Jeder Versuch des Nutzers, den Schaden zu heilen oder zu reparieren, bekommt einen Bonus von zwei Würfeln. Diese Gabe kann in jeder Form genutzt werden.`,
    duration: `-`
  },

  {
    id: 86,
    category: W5GiftCategory.Tribal,
    totalRenown: 9,
    onlyFor: null,
    name: `Die Präsenz des Lebens`,
    description: `Der Nutzer der Gabe wird sensibler für das Leben um ihn herum und nimmt alles Lebendige in seiner unmittelbaren Umgebung wahr. Die Gabe liefert zwar keine detaillierten Infos, aber sie hilft dem Werwolf, Gegner auszukundschaften oder einen Hinterhalt zu entdecken. Ein Geist der Erde gewährt diese Gabe.`,
    renown: W5RenownKey.Wisdom,
    cost: `1 Willenskraft`,
    action: `voll`,
    pool: `Fassung + Weisheit`,
    system: `Der Nutzer nimmt automatisch alles wahr, was in seinem Umfeld passiert – Pflanzen, Tiere und Menschen – sowie alle (lebenden) übernatürlichen Wesen in einem Bereich, der ungefähr so groß ist wie ein zweistöckiges Haus. Übernatürliche Wesen, die ihre Kräfte nutzen, um sich zu verstecken, können nur durch einen Test auf Fassung + Weisheit mit einem Schwierigkeitsgrad gefunden werden, der von der Kreatur und der verwendeten Fähigkeit abhängt. Geister werden überhaupt nicht wahrgenommen, es sei denn, sie besitzen einen lebenden Körper. Vampire und andere Untote werden nicht entdeckt, es sei denn, sie täuschen Leben vor. In diesem Fall kann ein Test auf Gabe mit einem Schwierigkeitsgrad von 3 die Täuschung durchschauen.`,
    duration: `eine Szene`
  },

  {
    id: 87,
    category: W5GiftCategory.Tribal,
    totalRenown: 9,
    onlyFor: null,
    name: `Den Schmerz teilen`,
    description: `Der Garou kann einen Teil der körperlichen Schäden, die ein anderes Rudelmitglied erleidet, auf sich nehmen. Sein Körper oder Geist übernimmt die Last eines Rudelkameraden. Ein Bienengeist verleiht ihm diese Gabe.`,
    renown: W5RenownKey.Wisdom,
    cost: `1 Rage-Test`,
    action: `frei`,
    pool: `-`,
    system: `Der Garou wählt eine Anzahl von Rudelmitgliedern, die seiner Weisheit entspricht. Immer wenn eines dieser Mitglieder irgendeinen physischen Schaden abbekommt, wird der Schaden halbiert und der Nutzer der Gabe bekommt die andere Hälfte als Gesundheitsschaden oder Willenskraftschaden. Alle aktiven Verteidigungsgaben des Nutzers gelten wie immer.`,
    duration: `eine Szene`
  },

  {
    id: 88,
    category: W5GiftCategory.Tribal,
    totalRenown: 3,
    onlyFor: null,
    name: `Camouflage`,
    description: `Die Garou können sich in die Wildnis einfügen und wie ein Haufen Blätter, ein mit Gras bewachsenes Stück Land oder ein mit Flechten bedeckter Steinhaufen aussehen, um besser einen Hinterhalt vorzubereiten oder Verfolgern zu entkommen. Ein Hirschgeist gewährt diese Gabe.`,
    renown: W5RenownKey.Honor,
    cost: `frei / 1 Willenskraft`,
    action: `frei / voll`,
    pool: `-`,
    system: `Jeder Versuch, den Werwolf nur mit den Augen zu entdecken, wird um die Ehre des Benutzers der Gabe schwieriger. Wenn der Benutzer der Gabe einen Willenskraftpunkt und einen ganzen Zug opfert, kann er die Wirkung auf Mitglieder seines Rudels in Reichweite ausweiten. Die Gabe verliert ihre Wirkung, wenn der Benutzer sich bewegt oder Geräusche macht. Diese Gabe kann in jeder Form genutzt werden.`,
    duration: `eine Szene`
  },

  {
    id: 89,
    category: W5GiftCategory.Tribal,
    totalRenown: 3,
    onlyFor: null,
    name: `Zerreißender Wind`,
    description: `Der Werwolf beschwört einen eiskalten Wind herauf und lenkt ihn auf seine Feinde. Der Wind lässt seine Opfer bis auf die Knochen frieren, macht sie langsam und träge, und wer davon überrascht wird, kann zu Boden oder von Vorsprüngen gestoßen werden. Ein Avatar des Nordwinds gewährt diese Gabe.`,
    renown: W5RenownKey.Honor,
    cost: `1 Rage-Test`,
    action: `voll`,
    pool: `Fassung + Ehre vs Ausdauer + Überleben oder Geschicklichkeit + Sportlichkeit`,
    system: `Der Garou kann eine Gruppe von Gegnern angreifen, die sich innerhalb von ein paar Metern voneinander und in einer Entfernung von bis zu 20 Metern befinden. Jeder, der den Gift-Test nicht besteht, bekommt einen Malus von zwei Würfeln auf seine physischen Angriffspools. Der Wind kann auch genutzt werden, um ein Ziel aus dem Gleichgewicht zu bringen, aber nur gegen jemanden, der nicht auf die Böe vorbereitet ist, und nur gegen ein einzelnes Ziel. In diesem Fall wird der Gegner zu Boden geworfen (oder von dem, worauf er stand), wenn er den Widerstand mit Geschicklichkeit + Sportlichkeit nicht schafft, anstatt den Würfelmalus durch die Kälte zu erleiden.`,
    duration: `Rand`
  },

  {
    id: 90,
    category: W5GiftCategory.Tribal,
    totalRenown: 6,
    onlyFor: null,
    name: `Kühler Umhang`,
    description: `Der Werwolf kann seine Körperwärme und andere Signale verstecken, sodass er für moderne Überwachungssysteme schwer zu entdecken oder sogar komplett unsichtbar ist. Ein Alligatorgeist oder ein anderer kaltblütiger Raubtiergeist gibt ihm diese Fähigkeit.`,
    renown: W5RenownKey.Honor,
    cost: `frei / 1 Willenskraft`,
    action: `frei / voll`,
    pool: `-`,
    system: `Füge die Ehre des Begabten zu jedem Versuch in Heimlichkeit, Überleben oder Diebstahl hinzu, um nicht von elektronischen Überwachungsgeräten wie Infrarotkameras, Bewegungsmeldern und Lichtsensoren erwischt zu werden. Normale Kameras können sie immer noch sehen, wenn jemand die Bilder live beobachtet, und mechanische Geräte (wie Stolperdrähte) funktionieren wie gewohnt. Wenn der Begabte einen Willenskraftpunkt und eine ganze Runde opfert, kann er den Effekt auf Mitglieder seines Rudels in Reichweite ausweiten.`,
    duration: `eine Szene`
  },

  {
    id: 91,
    category: W5GiftCategory.Tribal,
    totalRenown: 9,
    onlyFor: null,
    name: `Blut der Ödlande`,
    description: `Der Garou wird eins mit den Elementen und kann in der kargsten Tundra oder im tödlichsten Schneesturm überleben. Der Geist eines robusten, Winterschlaf haltenden oder brumierenden Tieres verleiht ihm diese Gabe, zum Beispiel der Geist eines Bären oder einer Schildkröte.`,
    renown: W5RenownKey.Honor,
    cost: `frei`,
    action: `voll`,
    pool: `-`,
    system: `Der Nutzer kann mit den extremsten Umweltbedingungen umgehen und lange Zeit ohne Schutz überleben oder reisen. Der Spieler des Nutzers kann seine Ehre zu jedem Überlebenstest hinzufügen, um Essen oder Wasser zu finden. Der Nutzer ist widerstandsfähig gegen Umweltstrafen und reduziert diese um seinen Ehrenwert. Diese Gabe kann in jeder Form genutzt werden.`,
    duration: `-`
  },

  {
    id: 92,
    category: W5GiftCategory.Tribal,
    totalRenown: 9,
    onlyFor: null,
    name: `Klauen des gefrorenen Todes`,
    description: `Die Klauen des Werwolfs werden mit Frost überzogen, der jedem, den der Nutzer verletzt, eine tödliche Kälte in die Knochen treibt. Während der Wirkung wird das Opfer träge, was weitere Angriffe einfacher macht. Ein Eis- oder Wintergeist gewährt diese Gabe.`,
    renown: W5RenownKey.Honor,
    cost: `frei / 1 Rage`,
    action: `frei / klein`,
    pool: `Geistesschärfe + Ehre vs Ausdauer + Überleben`,
    system: `Diese Gabe ist kostenlos und wirkt sofort, wenn du in der Crinos-Form bist. Wenn ein Ziel zum ersten Mal Schaden durch die Klauen des Garou erleidet, während diese Gabe aktiv ist, machst du einen Geistesschärfe + Ehre-Test gegen die Ausdauer + Überleben des Ziels. Wenn du gewinnst, wird das Ziel unterkühlt und bekommt einen Malus von zwei Würfeln, um sich gegen zukünftige physische Angriffe zu verteidigen oder ihnen auszuweichen.`,
    duration: `eine Szene`
  },

  {
    id: 93,
    category: W5GiftCategory.Tribal,
    totalRenown: 3,
    onlyFor: null,
    name: `Augur`,
    description: `Wenn der Garou in eine spiegelnde Oberfläche guckt, kann er einen anderen Ort aus der Ferne sehen, solange es dort auch eine spiegelnde Oberfläche gibt. Diese Gabe wird von einem Wassergeist oder einem Geist, der mit Wissen verbunden ist, gegeben.`,
    renown: W5RenownKey.Wisdom,
    cost: `1 Willenskraft`,
    action: `voll`,
    pool: `Intelligenz + Weisheit`,
    system: `Der Spieler des Garou macht einen Intelligenz + Weisheit-Test mit einem vom Spielleiter festgelegten Schwierigkeitsgrad, der von der Entfernung und der Art des gewünschten Ortes abhängt. (Eine nahegelegene Bushaltestelle mit einem Spiegel und einer Pfütze daneben könnte einen Schwierigkeitsgrad von 2 haben, während eine Höhle auf der anderen Seite der Erde vielleicht einen Schwierigkeitsgrad von 6 braucht, um den einzigen Wassertropfen zu finden, von dem aus man spionieren kann.) Der Garou kann nur sehen, aber nicht hören oder riechen, was an dem beobachteten Ort vor sich geht, und wenn die Beobachteten über übernatürliche Mittel verfügen, um Eindringlinge zu entdecken, könnten sie die Überwachung bemerken. Diese Gabe kann in jeder Form eingesetzt werden.`,
    duration: `eine Szene`
  },

  {
    id: 94,
    category: W5GiftCategory.Tribal,
    totalRenown: 3,
    onlyFor: null,
    name: `Blackout`,
    description: `Mit dieser Gabe können die Garou Lichtquellen um sich herum löschen und so die Dunkelheit zu ihrem Verbündeten machen. Der Geist eines nachtaktiven Tieres oder ein mit der Dunkelheit verbundener Geist verleiht diese Gabe.`,
    renown: W5RenownKey.Wisdom,
    cost: `1 Rage-Test`,
    action: `voll`,
    pool: `-`,
    system: `Der Nutzer dieser Gabe kann pro Punkt Weisheit eine Lichtquelle in seiner Sichtlinie löschen. Wer keine Nachtsicht hat oder keine zusätzlichen Lichtquellen, muss bei allen Tests, die auf Sehvermögen angewiesen sind, mit einem Malus von einem bis drei Würfeln rechnen (je nach Umgebungslicht). Diese Gabe kann in jeder Form eingesetzt werden.`,
    duration: `eine Szene`
  },

  {
    id: 95,
    category: W5GiftCategory.Tribal,
    totalRenown: 6,
    onlyFor: null,
    name: `Schlangenkreis`,
    description: `Der Garou beschwört eine nebelartige Schlange, die sich um Gegner wickeln und sie festhalten kann. Die Schlange ist 10 Meter lang und kann auf schwächere Gegner aufgeteilt werden, wenn der Nutzer das will. Ein Würgeschlangen-Geist gibt diese Gabe.`,
    renown: W5RenownKey.Wisdom,
    cost: `1 Rage-Test`,
    action: `klein`,
    pool: `Geistesschärfe + Weisheit`,
    system: `Durch das Herbeirufen eines Umweltnebels kann der Nutzer Grappling-Angriffe gegen weit entfernte Ziele bis zu einer Entfernung von 10 Metern ausführen. Durch Aufteilen des Würfelpools kann der Spieler zusätzliche Spulen erzeugen, wodurch der Nutzer mehrere Gegner angreifen kann (siehe S. 125). Der Nebel nutzt die Werte Geistesschärfe + Weisheit des Garou, um zu greifen. Die Schlangen haben drei Gesundheitsstufen und nutzen die Werte Geistesschärfe + Weisheit ihres Besitzers, um Angriffen auszuweichen und sie zu ertragen, obwohl sie nur durch Feuer oder übernatürliche Angriffe verletzt werden können, die immaterielle Ziele beschädigen können.`,
    duration: `eine Szene oder bis zum Ende oder bis zur Zerstörung`
  },

  {
    id: 96,
    category: W5GiftCategory.Tribal,
    totalRenown: 6,
    onlyFor: null,
    name: `Hände der Erde`,
    description: `Mit dieser Gabe kann der Werwolf Sachen aus der Ferne bewegen, heben, ziehen und werfen, indem er Geister einsetzt. Ein Erd- oder Steingeist gibt ihm diese Gabe.`,
    renown: W5RenownKey.Wisdom,
    cost: `1 Rage-Test`,
    action: `voll`,
    pool: `Fassung + Weisheit, Geistesschärfe + Weisheit`,
    system: `Der Garou muss sich eine ganze Runde lang konzentrieren, um diese Gabe zu nutzen, und kann währenddessen nichts anderes machen. Das ausgewählte Objekt kann frei bewegt werden, aber für schwere Objekte braucht man einen Entschlossenheit + Weisheit-Test statt eines Stärke-Tests (siehe „Kraftakte“, S. 130). Leichtere Gegenstände können geworfen werden, wobei Verstand + Weisheit als Fernkampfangriffspool verwendet werden. Die Gabe kann auf jeden Gegenstand angewendet werden, den der Garou sehen kann, aber für jede 10 Meter über die ersten 10 hinaus erhöht sich der Schwierigkeitsgrad um 1.`,
    duration: `bis zu einer Szene`
  },

  {
    id: 97,
    category: W5GiftCategory.Tribal,
    totalRenown: 9,
    onlyFor: null,
    name: `Verhülter Aspekt`,
    description: `Der Garou kann sich nicht nur verstecken, sondern auch komplett unsichtbar werden, sowohl für die Augen von Zuschauern als auch für Kameras, allerdings nur im sichtbaren Lichtspektrum. (Infrarotkameras können ihn zum Beispiel immer noch erkennen.) Ein Rauchgeist gibt ihm diese Gabe.`,
    renown: W5RenownKey.Wisdom,
    cost: `1 Willenskraft`,
    action: `voll`,
    pool: `-`,
    system: `Der Garou kann weder mit bloßem Auge noch mit einer normalen Kamera entdeckt werden. Solange diese Gabe aktiv ist, kann sich der Garou nur im Schritttempo fortbewegen, da jede plötzliche Bewegung den Effekt aufhebt. Versuche, ein Ziel mit dieser Gabe zu überfallen, scheitern, wenn das Ziel einen Geistesschärfe + Wahrnehmung-Test gegen den Geistesschärfe + Weisheit-Wert des Gabenbenutzers gewinnt.`,
    duration: `eine Anzahl von Runden (oder ungefähr zehn Sekunden in einer längeren Szene), die der Weisheit des Benutzers entspricht.`
  },

  {
    id: 98,
    category: W5GiftCategory.Tribal,
    totalRenown: 3,
    onlyFor: null,
    name: `Hautbindung`,
    description: `Die Garou können ihre Haut als mystischen Behälter nutzen und Sachen darin in Form von temporären Tattoos oder Brandzeichen aufbewahren. Diese Gabe wird von einem Mottengeist oder einem Geist verliehen, der mit Schreiben oder Zeichnen zu tun hat.`,
    renown: W5RenownKey.Wisdom,
    cost: `1 Willenskraft`,
    action: `voll / klein`,
    pool: `-`,
    system: `Die Garou können jeden gewöhnlichen Gegenstand in ein tätowierungsähnliches Bild von sich selbst verwandeln, das auf ihre Haut gebrannt wird. Der Gegenstand darf nicht größer sein, als dass der Benutzer ihn in seinen Händen tragen könnte, da die Garou sein Gewicht auf mystische Weise spüren, während er auf sie tätowiert wird. Das Verstauen eines Gegenstands dauert eine ganze Runde (in der die Willenskraft verbraucht wird), aber das Herausholen gilt als kleine Aktion. Der Garou kann eine Anzahl von Gegenständen bis zu seiner Weisheitsstufe verstauen. Nicht alltägliche Gegenstände können nach Ermessen des Erzählers auf diese Weise verstaut werden, und das Tragen dieser Gegenstände auf der Haut kann unvorhersehbare Nebenwirkungen haben. Diese Gabe kann in jeder Form genutzt werden.`,
    duration: `auf unbestimmte Zeit`
  },

  {
    id: 99,
    category: W5GiftCategory.Tribal,
    totalRenown: 6,
    onlyFor: null,
    name: `Antreiben`,
    description: `Indem der Garou seine eigene Wut in das Gerät steckt, kann er jedes funktionierende Gerät so antreiben, als wäre es angeschlossen oder vollgetankt. Damit kann er zwar keine komplett kaputte Maschine reparieren, aber er kann sogar beschädigte Geräte zum Laufen bringen, wenn auch nur für kurze Zeit.`,
    renown: W5RenownKey.Wisdom,
    cost: `1+ Rage-Tests`,
    action: `voll`,
    pool: `Entschlossenheit + Weisheit`,
    system: `Um Geräte wie Laptops oder Autos zu betreiben, musst du einen Wut-Check machen. Je nach Größe des Geräts kann der Spielleiter noch mehr Checks verlangen. Wenn das Gerät kaputt ist, musst du einen Entschlossenheit + Weisheit-Check machen, dessen Schwierigkeit vom Ausmaß des Schadens abhängt. Das Gerät läuft dann so viele Runden, wie du Erfolge hast. Beachte aber, dass diese Gabe keine Fachkenntnisse über die Bedienung des Zielgeräts vermittelt.`,
    duration: `eine Szene / Randnummer von Zügen`
  },

  {
    id: 100,
    category: W5GiftCategory.Tribal,
    totalRenown: 9,
    onlyFor: null,
    name: `Maschinen kontrollieren`,
    description: `Der Werwolf kann den kleinen Geistern, die in den meisten Maschinen wohnen, einfache Befehle geben, sodass die Garou kurzzeitig die Kontrolle über viele Geräte übernehmen können. Diese Gabe wird von einem Maschinengeist gewährt.`,
    renown: W5RenownKey.Wisdom,
    cost: `1 Rage-Test`,
    action: `voll`,
    pool: `Manipulation + Weisheit`,
    system: `Der Spieler des Garou macht einen Manipulation + Weisheit-Test und wählt irgendein elektronisches oder mechanisches Gerät aus, das der Benutzer sehen kann und das bis zu 10 Meter entfernt ist. (Ein mechanisches Gerät sollte irgendeine Art von Mechanismus haben, um in Frage zu kommen: Ein Fahrrad wäre okay, eine Schubkarre nicht.) Die Gabe kann nicht benutzt werden, um Befehle zu geben, die das Gerät beschädigen würden. Die Schwierigkeit hängt von der Komplexität des Befehls und der Größe des Ziels ab und steigt, wenn das Gerät etwas tun soll, das seinem Hauptzweck widerspricht, z. B. wenn ein Schloss (das den Zutritt verhindern soll) aufgefordert wird, sich zu öffnen. Die Schwierigkeit liegt in keinem Fall unter 3, da diese Gabe bekanntermaßen kompliziert ist und viele Garou das Gerät lieber zerstören würden, als mit ihm zu kommunizieren.`,
    duration: `bis zu eine Szene`
  },

  {
    id: 101,
    category: W5GiftCategory.Tribal,
    totalRenown: 9,
    onlyFor: null,
    name: `Doppelgänger`,
    description: `Die Garou können das Aussehen jedes anderen bestimmten Humanoiden oder Wolfes annehmen oder sich zumindest diesem annähern. Die Gabe erlaubt jedoch nicht das Kopieren von Manieren, und nur wenige menschlich geborene Garou beherrschen die Kunst, ihren Geruch so weit zu verändern, dass sie echte Wölfe oder wolfsgeborene täuschen können, was diese Gabe zu einer gefährlichen macht, wenn man sie unter anderen Werwölfen einsetzt. Ein Schatten- oder Spottdrosselgeist gewährt diese Gabe.`,
    renown: W5RenownKey.Wisdom,
    cost: `1 Willenskraft`,
    action: `voll`,
    pool: `Manipulation + Weisheit`,
    system: `Der Nutzer von „The Gift“ muss das kopierte Subjekt vom Aussehen her kennen. Der Spieler des Nutzers macht einen Manipulation + Weisheit-Test mit Schwierigkeitsgrad 3. Jeder Erfolg in der Marge gibt einen zusätzlichen Würfelbonus für spätere Versuche, sich als das kopierte Subjekt auszugeben (normalerweise mit Darbietung oder Ausflüchte), da sich das Aussehen des Nutzers an das der kopierten Person anpasst. Nach Ermessen des Erzählers wird dieser Bonus halbiert, wenn die kopierte Person ein Wolf oder ein Wolfsmensch ist und andere Wolfsmenschen anwesend sind. Diese Gabe kann in jeder Form genutzt werden.`,
    duration: `eine Szene`
  },

  {
    id: 102,
    category: W5GiftCategory.Tribal,
    totalRenown: 9,
    onlyFor: null,
    name: `Erinnerung wiederherstellen`,
    description: `Indem sie die spirituellen Überreste eines beschädigten oder zerstörten Buches oder eines anderen Objekts, das Infos speichert, herbeirufen, können die Garou einen Teil der verlorenen Infos wahrnehmen. Erfahrene Nutzer dieser Gabe können sogar Infos aus modernen digitalen Medien lesen, auch wenn es eine andere Sache ist, sie zu verstehen. Ein Datengeist gewährt diese Gabe.`,
    renown: W5RenownKey.Wisdom,
    cost: `1 Willenskraft`,
    action: `voll`,
    pool: `Intelligenz + Weisheit`,
    system: `Der Garou, der diese Gabe nutzt, muss das Zielobjekt sehen, berühren und beschwören können. Das Objekt kann in jedem Zustand sein – von einer teilweise entmagnetisierten Diskette bis hin zu den Überresten eines verbrannten Buches ist alles okay –, aber je schlechter der Zustand des Objekts und je länger es schon in diesem Zustand ist, desto schwieriger wird der Intelligenz + Weisheit-Test. Das Erfassen alter Bilder von einem schlampig neu formatierten Speicherstick könnte eine Schwierigkeit von 2 haben, während der Inhalt eines zu Fetzen verbrannten Tagebuchs aus dem 17. Jahrhundert eine Schwierigkeit von 5 oder mehr hat. Beachte auch, dass die Gabe nicht automatisch die Fähigkeit verleiht, die gewonnenen Informationen zu verstehen, und dass zusätzliche Tests (wie Intelligenz + Technologie, um den Zweck eines Computercodes zu verstehen) erforderlich sein können. Diese Gabe kann in jeder Form genutzt werden.`,
    duration: `-`
  },

  {
    id: 103,
    category: W5GiftCategory.Tribal,
    totalRenown: 3,
    onlyFor: null,
    name: `Heilige Grenze`,
    description: `Diese Gabe lässt einen Werwolf schnell eine Grenze markieren (mit Weihwasser aus einem Caern, Blut oder seinem eigenen Urin), über die jeder, der sie überschreitet, dem Nutzer bekannt wird. Junge Garou nennen diese Gabe manchmal respektlos „Spurband“. Ein Hundegeist gibt diese Gabe.`,
    renown: W5RenownKey.Glory,
    cost: `frei`,
    action: `voll`,
    pool: `-`,
    system: `Mit einem passenden Material markiert man eine Grenze zwischen zwei Objekten oder in einem Kreis. Die Länge dieser Grenze ist auf 10 Meter pro Punkt des Ruhmes des Benutzers begrenzt. Alle Bewegungen über diese Grenze werden dem Benutzer angezeigt, als hätte er sie gesehen, egal wo er sich gerade befindet, solange die Grenze aktiv ist. Jede übernatürliche Verdeckung erfordert einen Geistesschärfe + Ruhm-Test, um bemerkt zu werden, wobei die Schwierigkeit von der Macht und der Art des Eindringlings abhängt. Die Grenze bleibt einen Tag und eine Nacht lang aktiv oder bis die Objekte, die sie verankern, bewegt oder zerstört werden. Ein Nutzer dieser Gabe kann zu jedem Zeitpunkt nur eine Grenze aktiv haben. Diese Gabe kann in jeder Form genutzt werden.`,
    duration: `einen Tag oder eine Nacht oder bis es kaputt geht (siehe oben)`
  },

  {
    id: 104,
    category: W5GiftCategory.Tribal,
    totalRenown: 3,
    onlyFor: null,
    name: `Gesegnetes Gebräu`,
    description: `Der Garou kann ein Getränk mit spiritueller Kraft aufladen, sodass es die mentale Stärke derjenigen, die es trinken, stärkt und ihnen Mut macht. Ein Herd- oder Kräutergeist gewährt diese Gabe.`,
    renown: W5RenownKey.Glory,
    cost: `1 Willenskraft`,
    action: `voll`,
    pool: `-`,
    system: `Jeder, der so viel von einer Flüssigkeit trinkt, die von dieser Gabe beeinflusst ist, wie ein Glas, kriegt folgenden Vorteil: Beim nächsten Test, um irgendeiner Art von Angst oder feindseliger übernatürlicher mentaler Fähigkeit zu widerstehen, kannst du eine Anzahl Würfel hinzufügen, die der Herrlichkeit des Gabenbenutzers entspricht. Der Nutzer der Gabe kann bis zu einer Flasche Flüssigkeit verwenden, genug für eine ganze Gruppe, und das Gebräu und seine Wirkung bleiben aktiv, bis es verbraucht ist oder die Sitzung endet. Diese Gabe kann nur einmal pro Sitzung genutzt werden und ist in jeder Form einsetzbar.`,
    duration: `bis zu einer Session`
  },

  {
    id: 105,
    category: W5GiftCategory.Tribal,
    totalRenown: 6,
    onlyFor: null,
    name: `Territoriale Dominanz`,
    description: `In ihrem eigenen markierten Gebiet sind die Garou stärker, weil sie Kraft aus dem Land ziehen. Sie müssen dieses Gebiet aber verteidigen, weil jede Verletzung daran sich auf den Geist des Benutzers auswirkt. Ein Löwen- oder anderer Wildkatzengeist gibt diese Gabe.`,
    renown: W5RenownKey.Glory,
    cost: `1 Rage-Test`,
    action: `-`,
    pool: `-`,
    system: `Der Spieler markiert Stellen an der Grenze eines Territoriums (mit Wasser aus einem Caern, Blut oder seinem eigenen Urin) und bindet so seinen Geist an das Land. Er kann ein Territorium nur bei Vollmond markieren, und die Größe des Territoriums ist unbegrenzt, solange der Garou in einer einzigen Nacht mindestens fünf Stellen entlang seines Umfangs markieren kann. Innerhalb dieses Territoriums bekommt der Spieler des Garou einen Bonuswürfel auf alle körperlichen Proben. Jeder Schaden am Territorium fügt dem Nutzer aber Willenskraftschaden zu, dessen Ausmaß vom Spielleiter festgelegt wird. (Der Spielleiter entscheidet letztendlich, was Schaden darstellt und welche Auswirkungen dieser hat. Ein gefällter Baum verursacht vielleicht nur einen einzigen oberflächlichen Willenskraftschaden, während eine katastrophale Ölpest mehrere Stufen schweren Schadens verursachen würde.) Wenn das Gebiet bereits beschädigt ist, kann der Garou allein durch die Nutzung der Gabe Willenskraftschaden erleiden, sodass die meisten Werwölfe es vermeiden, sie zu nutzen, außer in unberührten Gebieten, die sie gut kennen.`,
    duration: `eine Anzahl an Nächten, die der Ruhm des Benutzers entspricht`
  },

  {
    id: 106,
    category: W5GiftCategory.Tribal,
    totalRenown: 9,
    onlyFor: null,
    name: `Balors Blick`,
    description: `Eines der Augen des Werwolfs leuchtet blutrot, und alle Feinde, die von diesem Blick getroffen werden, werden von schrecklichen Qualen heimgesucht. Ein Schmerzgeist oder ein Geist des Alters oder der Zeit gewährt diese Gabe.`,
    renown: W5RenownKey.Glory,
    cost: `1 Willenskraft`,
    action: `voll`,
    pool: `Charisma + Ruhm vs Fassung + Okkultismus`,
    system: `Jemand, der vom Blick des Benutzers der Gabe getroffen wird, muss sich gegen dessen Charisma + Ruhm vs. die Fassung + Okkultismus des Ziels wehren oder sein Körper wird von schrecklichen Schmerzen geplagt und er kriegt für den Rest der Szene einen Malus von 2 Würfeln auf alle Tests. Es kann immer nur eine Person gleichzeitig vom Benutzer der Gabe beeinflusst werden.`,
    duration: `eine Szene`
  },

  {
    id: 107,
    category: W5GiftCategory.Tribal,
    totalRenown: 9,
    onlyFor: null,
    name: `Der lebendige Baum`,
    description: `Der Garou ruft die Bäume und Pflanzen zu Hilfe. Die Bäume in der Nähe bewegen sich und versuchen, den Garou zu beschützen, und Äste und Ranken halten diejenigen auf, blockieren sie und kämpfen sogar gegen diejenigen, die dem Nutzer Schaden zufügen wollen. Ein Waldkind gewährt diese Gabe.`,
    renown: W5RenownKey.Glory,
    cost: `1 Rage-Test`,
    action: `voll`,
    pool: `Manipulation + Ruhm`,
    system: `Jeder, der dem Nutzer der Gabe Schaden zufügen will, wird von Bäumen und Pflanzen in der Nähe angegriffen (maximal eine Vergeltungsmaßnahme pro Runde). Wenn Bäume in der Nähe sind, entspricht ihr Pool der Manipulation + Ruhm des Nutzers. Wenn nur Büsche oder andere kleinere Pflanzen da sind, wird ihr Pool auf den Ruhm des Nutzers reduziert. Wenn keine Pflanzen in passender Größe da sind, hat die Gabe keine Wirkung. Nach Ermessen des Erzählers sind auch andere Effekte wie Würfelpool-Malusse möglich, je nach Flora und Vegetation, und die Gabe wird manchmal als Teil von Ritualen verwendet, bei denen Pflanzen oder Bäume wachsen.`,
    duration: `eine Szene`
  },

  {
    id: 108,
    category: W5GiftCategory.Tribal,
    totalRenown: 3,
    onlyFor: null,
    name: `Versteckter Mörder`,
    description: `Der Werwolf kann seine Morde oder die seiner Meute vertuschen, indem er alle verdächtigen Todesursachen und andere Spuren beseitigt, die einen Ermittler auf seine Fährte bringen könnten. Ein Käfer- oder Spinnengeist gewährt diese Gabe.`,
    renown: W5RenownKey.Honor,
    cost: `1 Willenskraft`,
    action: `voll`,
    pool: `-`,
    system: `Der Werwolf verbringt eine Szene damit, die Wunden der Getöteten zu lecken, sowie alle Stellen, an denen Spuren ihrer Anwesenheit zurückgeblieben sind. Die Verletzungen der Opfer heilen auf übernatürliche Weise, und es sieht so aus, als seien sie ohne erkennbaren Grund gestorben. (Die moderne Medizin würde den Tod wahrscheinlich auf Herzversagen zurückführen, obwohl der große Blutverlust sie mysteriös ausgeblutet erscheinen lässt, eine Ironie, die den städtischen Garou nicht entgeht, die die lokalen Blutsauger in ein schlechtes Licht rücken wollen.) Weltliche Versuche, Beweise wie DNA am Tatort zu sichern, scheitern automatisch, aber Ermittler, die mit Garou vertraut sind, können normale Versuche unternehmen, allerdings mit einem Würfelmalus in Höhe der Ehre des Gift-Anwenders.`,
    duration: `-`
  },

  {
    id: 109,
    category: W5GiftCategory.Tribal,
    totalRenown: 3,
    onlyFor: null,
    name: `Verrotten`,
    description: `In Sekundenschnelle kann der Werwolf jedes Material, das er berührt, zerfressen, verrotten oder auf andere Weise zersetzen, als wäre es jahrzehntelang den Elementen ausgesetzt gewesen. Diese Gabe wird von einem Insektengeist oder einem Geist, der mit Aas in Verbindung steht, verliehen.`,
    renown: W5RenownKey.Honor,
    cost: `1 Rage-Test`,
    action: `voll`,
    pool: `Fassung + Ehre`,
    system: `Der Werwolf muss das gewünschte Objekt berühren. Der Spieler macht einen Entschlossenheit+Ehre-Test, dessen Schwierigkeitsgrad von der Größe und dem Material des Objekts abhängt. Natürliche Materialien wie Holz oder Stein sind widerstandsfähiger, während künstliche Materialien (vor allem Kunststoffe) leichter zu zerstören sind. Legierungen sind ebenfalls anfälliger für diese Kraft als reine Metalle. Die Schwierigkeitsgrade reichen daher von 2 für etwas wie eine Handfeuerwaffe bis zu 5 für eine geschnitzte Steinsäule. Die Größenbeschränkung für die Kraft liegt bei etwa einer Tonne oder einem durchschnittlichen Auto, und die Wirkung gilt für ein gesamtes Objekt. (Sie kann nicht verwendet werden, um ein Loch in eine Tür zu ätzen, aber es kann versucht werden, die gesamte Tür zu beeinflussen. Der Vorgang dauert ein paar Minuten, während denen der Anwender mit dem Objekt in Kontakt bleiben muss, was den Einsatz im physischen Kampf erschwert, es sei denn, man ringt mit dem Gegner.`,
    duration: `-`
  },

  {
    id: 110,
    category: W5GiftCategory.Tribal,
    totalRenown: 6,
    onlyFor: null,
    name: `Gaias Umarmung`,
    description: `Nichts kann lange in der Luft bleiben, denn die Garou nutzen die Anziehungskraft der Erde gegen ihre Gegner. Alles, was in ihrer Nähe fliegt, hat Probleme, in der Luft zu bleiben, und sogar Kugeln fliegen krumm, weil ihre Flugbahn durch unregelmäßige Schwankungen der Schwerkraft verzerrt wird. Ein Felsgeist oder Berggeist gewährt diese Gabe.`,
    renown: W5RenownKey.Honor,
    cost: `1 Rage-Test`,
    action: `voll`,
    pool: `-`,
    system: `Alles, was in einer Höhe von weniger als 50 Metern und in einem Umkreis von 100 Metern um den Werwolf fliegt, muss sofort landen oder riskiert eine Bruchlandung. (Die Schwierigkeit, in der Luft zu bleiben, beträgt 1 + die Ehre des Gabenanwenders.) Dieser Effekt gilt auch für Hubschrauber, Drohnen oder andere Fluggeräte, die das Gebiet durchqueren. Projektile und geworfene Gegenstände sind auch von der Anziehungskraft betroffen und bekommen einen Angriffswürfelmalus in Höhe der Ehre des Benutzers, wenn ihre Flugbahn in die Zone hinein- oder aus ihr herausführt. Alles, was auf dem Boden steht, ist davon nicht betroffen, aber Sprünge und andere akrobatische Einlagen bekommen einen ähnlichen Malus. Um diesen Effekt aufrechtzuerhalten, muss der Nutzer der Gabe seine ganze Aufmerksamkeit darauf richten, und der Effekt hört auf, sobald er eine andere Aktion ausführt oder eine andere Gabe einsetzt.`,
    duration: `bis zu eine Szene`
  },

  {
    id: 111,
    category: W5GiftCategory.Tribal,
    totalRenown: 6,
    onlyFor: null,
    name: `Treibsand`,
    description: `Der Werwolf kann den Boden in einen klebrigen Sumpf verwandeln, der Gegner festhält und sie daran hindert, zu fliehen oder auszuweichen. Ein Erdelementar gibt ihm diese Fähigkeit.`,
    renown: W5RenownKey.Honor,
    cost: `1 Rage-Test`,
    action: `voll`,
    pool: `Intelligenz + Ehre`,
    system: `Der Nutzer von Gabe zielt auf einen Bereich auf dem Boden, der ungefähr fünf Meter im Durchmesser ist, in Sichtweite und zehn Meter entfernt. Der Spieler macht einen Gaben-Test mit einer Schwierigkeit von 2. (Die Schwierigkeit erhöht sich um 1 pro weiteren zehn Metern Entfernung.) Alle in diesem Bereich haben einen Malus von 2 Würfeln auf ihre physische Verteidigung und können sich innerhalb der Reichweite der Gabe nicht schneller als im langsamen Schritttempo bewegen, da sich der Boden in einen Sumpf verwandelt. Beachte, dass die Gabe nur auf natürlichem Boden eingesetzt werden kann und in Innenräumen oder auf gepflasterten Flächen keine Wirkung zeigt.`,
    duration: `eine Szene`
  },

  {
    id: 112,
    category: W5GiftCategory.Tribal,
    totalRenown: 9,
    onlyFor: null,
    name: `Schild der Wildnis`,
    description: `Die Garou können sich in die sich ständig verändernden Energien der Wyld hüllen, wodurch sie Waffen und andere Werkzeuge des Weavers stören. Der Werwolf bekommt eine begrenzte Immunität gegen die meisten Arten von gewöhnlichen Waffen. Eine Serpentine gewährt diese Gabe.`,
    renown: W5RenownKey.Honor,
    cost: `1 Willenskraft`,
    action: `klein`,
    pool: `-`,
    system: `Solange diese Gabe aktiv ist, kann der Nutzer pro Runde so viele physische Schadensstufen ignorieren, wie er Ehre hat, solange der Schaden durch normale Waffen verursacht wird. Natürliche Waffen wie Krallen und Reißzähne sind davon nicht betroffen, genauso wenig wie Silber und Angriffe spiritueller oder übernatürlicher Art, wie sie bei den meisten Talismanen vorkommen. Während diese Gabe aktiv ist, kann der Nutzer keine Werkzeuge oder technischen Geräte benutzen.`,
    duration: `eine Szene`
  },

  {
    id: 113,
    category: W5GiftCategory.Tribal,
    totalRenown: 3,
    onlyFor: null,
    name: `Fataler Fehler`,
    description: `Der Garou beobachtet sein Ziel genau und findet mit seinem Spionagegeist eine Schwäche bei seiner Beute. Das kann entweder eine übernatürliche Schwäche sein, wie die Anfälligkeit der Werwölfe gegenüber Silber, oder, wenn das nicht da ist, eine Schwachstelle, die die Verteidigung des Gegners beeinträchtigt. Ein Termitengeist gewährt diese Gabe.`,
    renown: W5RenownKey.Glory,
    cost: `1 Willenskraft`,
    action: `voll`,
    pool: `Intelligenz + Ruhm vs Fassung + Ausflüchte`,
    system: `Der Garou, der diese Gabe nutzt, muss eine ganze Runde (oder so ähnlich) damit verbringen, sein Ziel zu checken, und kann in der Zeit nichts anderes machen. Wenn der Spieler einen erfolgreichen Intelligenz + Ruhm-Test gegen die Fassung + Ausflüchte des Ziels schafft, findet er einen neuen Weg, dem Ziel schweren physischen Schaden zuzufügen, den er vorher nicht kannte. (Einzigartige Schadensquellen wie benannte Waffen und Ähnliches zählen nicht.) Wenn er bereits alle Schwächen des Ziels kennt, erhält er einen Bonus von einem Würfel auf Angriffe, da er eine kleine Schwäche entdeckt, wie z. B. „die Tendenz, mit der linken Hand zu führen”. Diese Gabe kann in jeder Form eingesetzt werden.`,
    duration: `-`
  },

  {
    id: 114,
    category: W5GiftCategory.Tribal,
    totalRenown: 3,
    onlyFor: null,
    name: `Eisige Kälte der Verzweiflung`,
    description: `Der Garou scheint größer und imposanter zu werden und verwandelt sich in eine schreckliche, schattenhafte Version seiner selbst, während alle um den Werwolf herum von lähmender Hoffnungslosigkeit überwältigt werden. Ein Sturmkrähe gewährt diese Gabe.`,
    renown: W5RenownKey.Glory,
    cost: `1 Rage-Test`,
    action: `klein`,
    pool: `-`,
    system: `Solange diese Gabe aktiv ist, kriegt der Garou seine Herrlichkeit als Bonus für alle Einschüchterungs-Proben, und alle außer seinen Rudelkameraden im Umkreis von 10 Metern können ihre Willenskraft nicht nutzen, um Würfel neu zu werfen oder Willenskraft zurückzugewinnen, außer durch mystische Mittel.`,
    duration: `eine Szene`
  },

  {
    id: 115,
    category: W5GiftCategory.Tribal,
    totalRenown: 6,
    onlyFor: null,
    name: `Schreckliche Ablenkung`,
    description: `Der Werwolf kann eine Ablenkung erzeugen, die so gut ist, dass sie selbst die einfachste Aufgabe schwierig und eine schwierige Herausforderung unüberwindbar macht. Ein Schattengeist gibt ihm diese Gabe.`,
    renown: W5RenownKey.Glory,
    cost: `1 Willenskraft`,
    action: `voll`,
    pool: `Fassung + Ruhm vs Geistesschärfe + Okkultismus (oder Weisheit)`,
    system: `Das Ziel verliert bei seiner nächsten Aktion so viele Würfel aus seinem Pool, wie der Nutzer der Gabe an Ruhm hat, solange diese Aktion einen Zug oder weniger dauert. Die Nutzung dieser Gabe ist fast nicht zu merken, und weil die Ablenkung spirituell ist, wird der Nutzer der Gabe nicht entdeckt, es sei denn, sein Spieler scheitert bei einem Test der Fassung + Ruhm des Charakters gegen die Geistesschärfe + Okkultismus (oder Weisheit, wenn das Ziel ein Garou ist) des Ziels. Mach diesen Test aber nur, wenn es wichtig ist, wer die Ablenkung gemacht hat. Ein Ziel kann nur einmal pro Szene von dieser Gabe beeinflusst werden. Diese Gabe kann in jeder Festung benutzt werden.`,
    duration: `eine Aktion`
  },

  {
    id: 116,
    category: W5GiftCategory.Tribal,
    totalRenown: 9,
    onlyFor: null,
    name: `Donnerknall`,
    description: `Die Garou schlagen ihre Hände zusammen und erzeugen einen mächtigen Donnerschlag, der alle, die ihn hören, betäubt. Eine Incarna des Donners gewährt diese Gabe.`,
    renown: W5RenownKey.Glory,
    cost: `1 Rage-Test`,
    action: `voll`,
    pool: `Stärke + Ruhm vs Ausdauer + Geistesschärfe`,
    system: `Der Spieler des Benutzers testet die Stärke + Ruhm seines Charakters gegen die Ausdauer + Geistesschärfe aller Leute im Umkreis von 20 Metern und haut jeden um, der sich nicht wehren kann. Diejenigen, die sich erfolgreich wehren, kriegen trotzdem für die nächste Runde einen Malus von zwei Würfeln auf alle Aktionen außer Verteidigen, es sei denn, ihr Test war ein kritischer Sieg.`,
    duration: `ein Zug / eine Szene`
  },

  {
    id: 117,
    category: W5GiftCategory.Tribal,
    totalRenown: 9,
    onlyFor: null,
    name: `Unter Druck`,
    description: `Der Garou verflucht jemanden, sodass dieser auf übernatürliche Weise leicht von Geschossen getroffen werden kann. Solange der spirituelle Fluch wirkt, werden Kugeln (sowie Pfeile, Messer und alle anderen Wurfwaffen) auf seltsame Weise vom Ziel angezogen. Ein Rabengeist gewährt diese Gabe.`,
    renown: W5RenownKey.Glory,
    cost: `1 Willenskraft`,
    action: `voll`,
    pool: `-`,
    system: `Der Garou, der diese Gabe nutzt, muss das Ziel nur berühren, um sie zu aktivieren. (Wenn sie im Kampf eingesetzt wird, muss der Nutzer zuerst einen Nahkampfangriff erfolgreich ausführen.) Solange die Gabe wirkt, kann das Opfer keine Vorteile aus Gaben ziehen, die es vor Projektilwaffen schützen würden, und alle Fernangriffe gegen es bekommen einen Bonus von zwei Würfeln. Der Fluch hält einen Tag pro Punkt Ruhm des Benutzers an, kann aber vorher durch einen Ritus der Abkehr (S. 180) aufgehoben werden. Diese Gabe kann in jeder Form benutzt werden.`,
    duration: `ein Tag pro einen Punkt Ruhm des Anwenders`
  },

  {
    id: 118,
    category: W5GiftCategory.Tribal,
    totalRenown: 3,
    onlyFor: null,
    name: `Kopfgeld holen`,
    description: `Mit Hilfe lokaler Geister kann der Garou jeden beliebigen alltäglichen Gegenstand finden, den er sucht, indem er sich anhand des Geruchs zum nächstgelegenen Exemplar dieses Gegenstands leiten lässt. Obwohl diese Gabe nur unbelebte Gegenstände aufspüren kann, ist sie nützlich, wenn der Garou Nahrung, ein Fahrzeug oder neue Kleidung braucht. Ein Elstergeist gewährt diese Gabe.`,
    renown: W5RenownKey.Wisdom,
    cost: `1 Willenskraft`,
    action: `voll`,
    pool: `Geistesschärfe + Weisheit`,
    system: `Der Werwolf sucht sich einen Gegenstand aus, und der Spieler muss einen Geistesschärfe + Weisheit-Test machen, dessen Schwierigkeitsgrad davon abhängt, wie selten der Gegenstand in der Gegend ist und wie genau sie ihn haben wollen. „Ein Auto“ zu finden könnte Schwierigkeitsgrad 2 sein, während „eine 75er Chevrolet Corvette“ schon eher 4 oder 5 ist und vielleicht Stunden dauern könnte. Wenn der Gegenstand in der Gegend nicht verfügbar ist, scheitert die Gabe natürlich automatisch, genauso wie Versuche, einen zu spezifischen Gegenstand zu finden, wie zum Beispiel ein Auto in einer bestimmten Farbe. (Im Allgemeinen können bei der Suche keine Adjektive verwendet werden, ebenso wenig wie Dinge wie Kennzeichen oder Seriennummern.) Was eine „Gegend” ausmacht, ist absichtlich vage gehalten, da es mehr auf die Menge an Unordnung als auf ein festgelegtes geografisches Gebiet ankommt. Es kann sich um ein einzelnes Stadtviertel in New York handeln, aber auch um mehrere Quadratkilometer Wald. Diese Gabe kann in jeder Form genutzt werden.`,
    duration: `eine Szene`
  },

  {
    id: 119,
    category: W5GiftCategory.Tribal,
    totalRenown: 3,
    onlyFor: null,
    name: `Rede der Welt`,
    description: `Der Garou kann jede lebende Sprache sprechen und lesen, die er trifft, auch wenn er sie wahrscheinlich mit einem deutlichen Akzent spricht. Mit der Zeit kann er auch Teile toter Sprachen verstehen, aber er kann keine absichtlichen Codes oder andere Verschleierungsformen knacken. Ein Papageiengeist gibt ihm diese Gabe.`,
    renown: W5RenownKey.Wisdom,
    cost: `1 Willenskraft`,
    action: `voll`,
    pool: `Intelligenz + Weisheit`,
    system: `Wenn der Werwolf auf eine Sprache stößt, die er normalerweise nicht spricht, kannst du einen Intelligenz + Weisheit-Test machen, wobei die Schwierigkeit davon abhängt, wie verbreitet die Sprache ist. (Chinesisch oder eine Variante des Arabischen wäre zum Beispiel 2, eine Tafel in einem obskuren sumerischen Dialekt 4 und Runen, die von einer unbekannten Hand vor Anbeginn der Menschheit eingraviert wurden, 5 und mehr.) Diese Gabe kann in jeder Form genutzt werden (allerdings ist verständliche Sprache nur in L1omid oder Glabro möglich).`,
    duration: `eine Szene`
  },

  {
    id: 120,
    category: W5GiftCategory.Tribal,
    totalRenown: 3,
    onlyFor: null,
    name: `Geflüstertes Zitat`,
    description: `Alles um den Werwolf herum scheint still zu werden, wenn er diese Gabe einsetzt, da seine Bewegungen komplett lautlos werden und andere Geräusche um ihn herum fast komplett gedämpft werden. Ein Katzengeist gewährt diese Gabe.`,
    renown: W5RenownKey.Wisdom,
    cost: `1 Willenskraft`,
    action: `klein`,
    pool: `-`,
    system: `Alle natürlichen Geräusche, die der Werwolf macht, werden unhörbar, und Geräusche in einem Umkreis von 10 Metern werden gedämpft. Es ist unmöglich, den Nutzer dieser Gabe allein anhand von Geräuschen zu entdecken, und jeder Versuch, Geräusche von Personen innerhalb des Wirkungsbereichs wahrzunehmen, wird mit einem Malus in Höhe der Weisheit des Nutzers bestraft. Diese Gabe kann in jeder Form eingesetzt werden.`,
    duration: `eine Szene`
  },

  {
    id: 121,
    category: W5GiftCategory.Tribal,
    totalRenown: 6,
    onlyFor: null,
    name: `Durchdringen`,
    description: `Der Werwolf kann sich schnell durch die Erde graben, um Hindernisse oder Barrieren zu umgehen oder um vor Verfolgern oder gefährlichen Situationen vorübergehend Schutz zu suchen. Die Tunnel können von allen Mitgliedern des Rudels genutzt werden, solange sie dicht beieinander bleiben. Ein Maulwurfgeist gewährt diese Gabe.`,
    renown: W5RenownKey.Wisdom,
    cost: `1 Rage-Test`,
    action: `voll`,
    pool: `Stärke + Weisheit`,
    system: `Um sich in die Erde zu graben, musst du einen Stärke + Weisheit-Test machen, wobei der Schwierigkeitsgrad von der Härte des Bodens abhängt. (Weicher Boden hat eine Schwierigkeit von 2, während harter, felsiger Boden eine Schwierigkeit von 4 hat.) Mit jeder Anwendung der Gabe wird ein zwei Meter langer Tunnel gegraben, plus zwei Meter für jeden Erfolg in der Marge, und jeder zwei Meter kosten einen Zug. Die maximale Entfernung beträgt 20 Meter, aber mit jeder weiteren Anwendung dieser Gabe können immer längere Tunnel gegraben werden. Unabhängig von ihrer Länge sind die Tunnel von Natur aus instabil und halten nur eine Szene lang.`,
    duration: `eine Szene`
  },

  {
    id: 122,
    category: W5GiftCategory.Tribal,
    totalRenown: 9,
    onlyFor: null,
    name: `Der goldene Pfad`,
    description: `Der Werwolf kann den sichersten Weg durch gefährliche Gebiete wie Minenfelder oder verwinkelte, unbekannte Straßen finden, indem er den Anweisungen der lokalen Geister folgt. Diese Gabe zeigt keinen Weg, wenn es keinen gibt, kann aber die Chancen für die Garou und ihr Rudel verbessern. Ein Ameisengeist gibt diese Gabe.`,
    renown: W5RenownKey.Wisdom,
    cost: `1 Weisheit`,
    action: `voll`,
    pool: `-`,
    system: `Wenn du diesen Test aktivierst, kannst du die Weisheit deines Charakters zu jedem Test hinzufügen, der mit der Navigation in einem Gebiet mit statischen Gefahren oder Hindernissen zu tun hat. Das kann dir helfen, Fallen, Stolperdrähte, Kameras oder instabiles Gelände zu vermeiden oder dich durch ein Labyrinth zu bewegen, aber es gibt keinen Bonus, wenn du versuchst, Wachen oder anderen bewussten Wesen auszuweichen. Wenn du mit deinen Rudelmitgliedern reden kannst, können sie diesen Bonus auch bekommen. Diese Gabe kann in jeder Form genutzt werden.`,
    duration: `eine Szene`
  },

  {
    id: 123,
    category: W5GiftCategory.Tribal,
    totalRenown: 3,
    onlyFor: null,
    name: `Rudelinstinkt`,
    description: `Der Garou bekommt ein instinktives Wissen über den körperlichen und geistigen Zustand sowie den ungefähren Aufenthaltsort jedes einzelnen Mitglieds des Rudels. Diese Gabe wird von einem Bienen- oder einem anderen lebenden Insektengeist verliehen.`,
    renown: W5RenownKey.Honor,
    cost: `frei / 1 WIllenskraft`,
    action: `frei`,
    pool: `Fassung + Ehre`,
    system: `Der Nutzer dieser Gabe hat immer ein allgemeines Gespür für das körperliche und geistige Wohlbefinden seiner Rudelmitglieder. Wenn er einen Willenskraftpunkt ausgibt und einen Test auf Fassung + Ehre mit Schwierigkeitsgrad 2 macht, kann er genaue Infos über ein einzelnes Mitglied bekommen, wie zum Beispiel dessen aktuellen Gesundheitswert und wo sich die Person gerade befindet, solange sie sich in einem Umkreis von 10 Kilometern um den Nutzer befindet. Diese Gabe kann in jeder Form genutzt werden.`,
    duration: `eine Szene`
  },

  {
    id: 124,
    category: W5GiftCategory.Tribal,
    totalRenown: 3,
    onlyFor: null,
    name: `Der silberne Pakt`,
    description: `Viele Geister sind immer noch durch alte Verträge an die mittlerweile legendären Garou gebunden. Wer diese Gabe hat, kann so einen Vertrag anrufen und wird dann vor bösen Geistern geschützt, die ihm sonst was antun würden. Ein Avatar von Falken gibt diese Gabe.`,
    renown: W5RenownKey.Honor,
    cost: `1 Rage-Test`,
    action: `klein`,
    pool: `-`,
    system: `Solange diese Gabe aktiv ist, greifen Geister und besessene Wesen den Nutzer der Gabe nicht an, wenn sie andere Gegner angreifen können. Diese Gabe lässt den Nutzer außerdem pro Runde den durch Geister und besessene Wesen verursachten Schaden in Höhe seines Ehrenwerts an Gesundheit oder Willenskraft ignorieren. Diese Gabe kann in jeder Form genutzt werden.`,
    duration: `eine Szene`
  },

  {
    id: 125,
    category: W5GiftCategory.Tribal,
    totalRenown: 6,
    onlyFor: null,
    name: `Blut der Meute`,
    description: `Der Garou wird zu einem Kanal für Wut – er verbindet die Wut seiner Mitglieder miteinander und lässt sie alle an den Wutreserven der anderen teilhaben. Ein Wespengeist gibt diese Gabe.`,
    renown: W5RenownKey.Honor,
    cost: `1 Rage-Test`,
    action: `frei`,
    pool: `-`,
    system: `Solange diese Gabe aktiv ist, können Mitglieder des Rudels gegenseitig Wutproben machen. Die Gesamtzahl der Wutproben, die so gemacht werden können, ist gleich der Ehre des Gabenbenutzers. „Blut des Rudels” kann nicht benutzt werden, wenn „Einheit des Rudels” (siehe unten) in derselben Szene benutzt wurde. Diese Gabe kann in jeder Form benutzt werden.`,
    duration: `ein Zug`
  },

  {
    id: 126,
    category: W5GiftCategory.Tribal,
    totalRenown: 6,
    onlyFor: null,
    name: `Einheit der Meute`,
    description: `Der Garou wird zu einem verbindenden Punkt, der es den Rudelmitgliedern ermöglicht, die mentale Last der anderen zu übernehmen und sich gegenseitig in ihrer inneren Stärke zu unterstützen. Jeder familiäre Geist gewährt diese Gabe.`,
    renown: W5RenownKey.Honor,
    cost: `1 Willenskraft`,
    action: `frei`,
    pool: `-`,
    system: `Solange diese Gabe aktiv ist, können Mitglieder des Rudels Willenskraft füreinander ausgeben. Die Gesamtzahl der Willenskraft, die so ausgegeben werden kann, entspricht der Ehre des Gabenbenutzers. Die Einheit des Rudels kann nicht benutzt werden, wenn Blut des Rudels in derselben Szene benutzt wurde. Diese Gabe kann in jeder Form benutzt werden.`,
    duration: `ein Zug`
  },

  {
    id: 127,
    category: W5GiftCategory.Tribal,
    totalRenown: 9,
    onlyFor: null,
    name: `Lunas Rache`,
    description: `Die Garou werden immer mutiger, wenn ihr Rudel Schaden nimmt und Verluste erleidet, was ihnen ermöglicht, die Verletzten zu beschützen und die Gefallenen zu rächen. Eine Lune gewährt diese Gabe.`,
    renown: W5RenownKey.Honor,
    cost: `1 Rage-Test`,
    action: `frei`,
    pool: `-`,
    system: `Solange diese Gabe aktiv ist, kriegt der Spieler des Garou einen Bonus auf alle physischen Kampf-Angriffs- und Verteidigungswürfe: einen Würfel für jedes Rudelmitglied, das beeinträchtigt ist, und zwei Bonuswürfel für jedes Mitglied, das kurz vor dem Tod steht (dessen Gesundheitsanzeige mit schweren Verletzungen gefüllt ist). Dieser Würfelbonus kann nicht höher sein als die Ehre des Gabenbenutzers.`,
    duration: `eine Szene`
  }
];

export const rites: IW5Rite[] = [
  {
    id: 1,
    name: `Ritus der Abkehr`,
    description: `Dieser Ritus reinigt eine Person, einen Ort oder einen Gegenstand und befreit sie von jeglicher spirituellen Besessenheit. Anwesende Geister werden vertrieben und mystische Eigenschaften eines Gegenstands, wie zum Beispiel eines Talismans, werden entfernt. Es gibt viele Varianten dieses Ritus, bei denen manchmal der böse Einfluss mit Feuer verbrannt wird, manchmal die Ausführenden das Ziel anbrüllen, um die Besessenheit zu vertreiben, und manchmal komplizierte Inschriften und Schutzzeichen verwendet werden. Bei allen Varianten wird das Zielobjekt aber irgendwie beschädigt. Wenn ein Lebewesen dem Ritus unterzogen werden soll, muss es dazu bereit oder handlungsunfähig sein.`,
    pool: `Ehre + Okkultismus`,
    system: `Wie schwer es ist, einen Gegenstand zu reinigen, hängt von ein paar Sachen ab, wie zum Beispiel der Größe des Gegenstands, wie lange er schon besessen ist und wie stark der Geist ist, der ihn besessen hat. Ein Baum, der gerade von einem fiesen Bane bewohnt wurde, könnte Schwierigkeitsgrad 3 haben, während ein Berg, der seit Jahrtausenden die Ruhestätte eines alten Geistes ist, Schwierigkeitsgrad 6 oder mehr hat. Ein brutaler Fehlschlag bei diesem Ritus verärgert den besitzergreifenden Geist, der entweder den Gegenstand belebt und angreifen lässt oder etwas Gefährlicheres in der Nähe besetzt, um seine Rache besser ausüben zu können.`
  },

  {
    id: 2,
    name: `Ritus der Wut`,
    description: `Der Ritus der Wut, der in den einzelnen Clans und Rudeln viele Namen hat, hat nur ein Ziel: die Wut des Rudels anzufachen, bevor es sich in Gefahr und Gewalt stürzt. Feuertanz, Trommeln, ritualisierte Duelle oder einfach nur Schlägereien bei einem Fußballspiel sind alles legitime Ausdrucksformen dieses Ritus.`,
    pool: `Ruhm + Einschüchterung`,
    system: `Die Grundschwierigkeit des Rituals ist gleich der Anzahl der Teilnehmer, aber nie weniger als 3. Bei einem Sieg erhöht jeder Teilnehmer seine Wut um einen Punkt. (Der Ritualmeister kann entscheiden, dass jedes Mitglied stattdessen 2 Punkte bekommt, was die Schwierigkeit um 2 erhöht.) Ein brutales Ergebnis führt nicht zum Scheitern des Ritus, aber jedes brutale Ergebnis führt dazu, dass alle Teilnehmer einen Punkt oberflächlichen Schadens erleiden, da die Aggression nach außen explodiert – der Feuertanz gerät außer Kontrolle und breitet sich aus, das ritualisierte Duell endet in einem echten Blutbad und das Fußballspiel verwandelt sich in eine Schlägerei, da die Darsteller zum Mittelpunkt eines Aufruhrs werden.`
  },

  {
    id: 3,
    name: `Ritus der Ruhe`,
    description: `Das Gegenteil vom Ritus der Wut ist der Ritus der Ruhe, mit dem Garou ihre Wut auf harmlose Weise loswerden können, um sich besser auf soziale Events, das Zusammensein mit Menschen oder andere Riten vorzubereiten. Dieser Ritus kann düster oder beruhigend, ernst oder spielerisch sein und von fast chorähnlichen, harmonischen Heulern bis hin zu cleveren Wortspielen reichen, die dazu dienen, Missstände zu mildern.`,
    pool: `Weisheit + Darbietung`,
    system: `Die Grundschwierigkeit des Ritus ist gleich der Anzahl der Teilnehmer, aber nie weniger als 3. Bei einem Sieg senkt jeder Teilnehmer seine Wut auf 1. Bei einem brutalen Ergebnis scheitert der Ritus und alle Teilnehmer erleiden einen Punkt oberflächlichen Willenskraftschaden, da ihre Frustrationen die Oberhand gewinnen.`
  },

  {
    id: 4,
    name: `Ritus der Reue`,
    description: `Dieser Ritus ist Teil und oft auch der Höhepunkt einer Buße, die von Garou gemacht wird, entweder um einen beleidigten oder verletzten Geist zu entschädigen oder um den Mantel der Schmach abzulegen (siehe 142). Um den Ritus durchzuführen, muss der Garou entweder den beleidigten Parteien ein kleines Geschenk machen oder, im Falle eines Geistes, einen Aspekt des betreffenden Geistes bei sich haben (zum Beispiel einen Tonfalken, wenn der Garou den Schutzgeist Falke anruft), dem sie huldigen. (Dieser Aspekt des Ritus ersetzt natürlich nicht die erforderliche Buße.)`,
    pool: `Ehre + Etikette`,
    system: `Die Schwierigkeit dieses Ritus ist gleich 2 + der durch Enttäuschung erlittenen Ansehensstrafe oder, im Fall eines Geistes, der Hälfte seiner Macht (aufgerundet). Wer den Ritus nicht schafft, kann es am nächsten Tag nochmal versuchen, und wer um Vergebung bittet, muss den Ritus oft mehrmals wiederholen, bevor er erfolgreich ist. Ein brutales Ergebnis führt zum Scheitern und bedeutet, dass zusätzliche Kränkung verursacht wurde und weitere Buße geleistet werden muss, bevor der Ritus erneut versucht werden kann. (Die Art dieser Buße hängt von der Kränkung und den gekränkten Parteien ab und liegt im Ermessen des Erzählers.)`
  },

  {
    id: 5,
    name: `Ritus der vergesslichen Aufzeichnung`,
    description: `So wie die Welt ist, geraten Garou oft in Konflikte mit dem Gesetz und brechen es öfter als ihnen lieb ist. Gesichter werden von Überwachungskameras erfasst, Fingerabdrücke landen in gefährlichen Datenbanken und DNA wird markiert und katalogisiert. Diese Gabe schickt eine Menge kleiner Wyld-Geister los, um alle aufgezeichneten Infos über die beteiligten Garou zu zerstören. Sie kann zwar keinen Lebenden etwas vergessen lassen, sorgt aber für eine Menge beschädigter Daten, verlorener Proben und falsch abgelegter Berichte über das Rudel, das den Ritus durchführt.`,
    pool: `Weisheit + Ermitteln`,
    system: `Die Schwierigkeit, diesen Ritus durchzuführen, hängt von der Anzahl der Leute ab. Wenn es klappt, wird es um 3 schwieriger, die Leute über irgendwelche Datenbanken oder Aufzeichnungen zu finden oder zu erkennen, aber die Erinnerungen der einzelnen Leute bleiben davon unberührt. Das bleibt so, solange die Leute keinen Ärger machen – wenn jemand später ein Verbrechen begeht oder auf andere Weise registriert wird, muss der Ritus nochmal gemacht werden, sonst geht der Effekt verloren. Ein brutales Ergebnis bedeutet, dass die Geister zu nahe an den Verstand von jemandem gelangt sind, der den Charakteren zuvor begegnet ist (z. B. ein FBI-Ermittler), der die Ermittlungen wieder aufnehmen oder neu starten wird, da er die Gesichter der Charaktere nicht aus seinem Kopf bekommt.`
  },

  {
    id: 6,
    name: `Ritus des Lebenden Caern`,
    description: `Dieser Ritus hilft den Ausführenden, einen Caern zu beleben, ihre Verbindung zu ihm zu erneuern und seine Verbindung zur Umbra zu stärken. Ohne regelmäßige Durchführung dieses Ritus werden Caerns schwächer und verblassen oder geraten aus dem Gleichgewicht und werden so zu Leuchtfeuern für feindliche Geister und unheilvolle Energien. Dieser Ritus muss jeden Monat zur gleichen Zeit durchgeführt werden, sonst fängt das Caern an – oder macht weiter – sich zu verschlechtern. Manchmal machen Septs diesen Ritus zu einem großen Ereignis und legen ihn so, dass er mit einem großen Moot oder einem anderen wichtigen sozialen Treffen zusammenfällt.`,
    pool: `Weisheit + Handwerk`,
    system: `Die Schwierigkeit, diesen Ritus durchzuführen, ist gleich 2 + dem Caern-Wert. Wenn der Ritus-Test erfolgreich ist, behält das Caern seine Bewertung, zumindest bis zur nächsten monatlichen Wiederholung. Wenn er scheitert, muss es in der folgenden Nacht erneut versucht werden, und wenn der Ritus während der gesamten Vollmondperiode scheitert (oder die Garou ihn vernachlässigen), sinkt der Caern-Wert um 1 (siehe 191). Jedes brutale Ergebnis führt zu einer Komplikation (z. B. ein kleiner böser Geist, der den Spießrutenlauf durchläuft, oder ein Besuch von örtlichen Strafverfolgungsbehörden, die Beschwerden über einen Tumult erhalten haben), führt aber nicht automatisch zum Scheitern.`
  },

  {
    id: 7,
    name: `Ritus des Übergangs in die Dunkelheit`,
    description: `Garou sind einzigartige Wesen aus Fleisch und Geist. Mit diesem Ritus kann ein Rudel kurz einen Weg zwischen der physischen Welt und der Umbra öffnen, sodass die Werwölfe hin und her gehen können. Da es hier vor allem darum geht, einen bestimmten Geisteszustand zu erreichen, gibt es so viele Arten, diesen Ritus durchzuführen, wie es Rudel gibt – von komplexen geometrischen Zeichnungen über Spiegelanordnungen bis hin zum Konsum von Halluzinogenen.`,
    pool: `irgendein Ansehenswert + Okkultismus`,
    system: `Die Schwierigkeit des Ritus entspricht der lokalen Gauntlet-Bewertung: Ein aktiver Caern könnte 2 sein, eine städtische Gasse 3 oder 4, während eine sterile Laborumgebung bis zu 6 erreichen könnte. Die Schwierigkeit, mit diesem Ritus aus der Umbra in die physische Welt zurückzukehren, wird um 2 reduziert. Wenn der Test erfolgreich ist, können alle Teilnehmer den Gauntlet passieren, allerdings dürfen sie nur ihre geweihten Kleider (siehe unten) mitnehmen, es sei denn, die nicht geweihten Gegenstände werden durch Gaben oder andere übernatürliche Effekte unterstützt. Jedes brutale Ergebnis führt dazu, dass die Teilnehmer beim Überqueren einen Grad an verschlimmertem Schaden erleiden, führt aber nicht automatisch zum Scheitern des Ritus.`
  },

  {
    id: 8,
    name: `Ritus der Weihe`,
    description: `Dieser Ritus verbindet eine Reihe von Kleidungsstücken spirituell mit einem Werwolf, sodass der Garou seine Gestalt ändern kann, ohne dass die dafür bestimmten Kleidungsstücke zerreißen. Stattdessen verwandeln sich die Kleidungsstücke in einen unsichtbaren spirituellen Zustand und kehren zurück, wenn der Garou eine Gestalt annimmt, die sie tragen kann. Obwohl die Details von Rudel zu Rudel variieren, muss sich der Empfänger oft nackt ausziehen und das ausgewählte Outfit Stück für Stück anziehen. Nur ein Kleidungsstück kann gleichzeitig einem bestimmten Garou gewidmet sein, was oft dazu führt, dass jeder Werwolf wochen-, wenn nicht sogar monatelang einen bestimmten „Look” trägt.`,
    pool: `-`,
    system: `Der Meister dieses Ritus kann ihn bei sich selbst oder einem anderen Garou durchführen. Einmal geweiht, bleiben die Kleidungsstücke vom Garou getragen – egal, ob der Werwolf seine Gestalt ändert oder in die Umbra eintritt – und scheinen zu verschwinden und wieder aufzutauchen, je nachdem, ob sie zur aktuellen Gestalt des Werwolfs passen oder nicht. Nur Kleidung oder Schmuckstücke können auf diese Weise geweiht werden, nicht Taschen oder andere Aufbewahrungsgegenstände, aber kleine Gegenstände, die in Taschen oder ähnlichem aufbewahrt werden, erhalten denselben Vorteil, obwohl die Kleidung physisch vorhanden sein muss, damit solche Gegenstände verfügbar sind. Ein Kleidungsstück behält diese Eigenschaft, bis entweder der Träger ein anderes Outfit weiht oder die Kleidung – von Hand – in etwas anderem als fließendem Bach- oder Flusswasser gewaschen wird. (Theurgen vermuten, dass die Wyld-Energien, die erforderlich sind, um die Kleidungsstücke in einem Zustand spiritueller Veränderung zu halten, empfindlich auf Weaver-Verunreinigungen reagieren; andere machen chemische Verunreinigungen im Leitungswasser dafür verantwortlich.)`
  },

  {
    id: 9,
    name: `Ritus der Verwandtschaftssuche`,
    description: `Einen jungen Garou zu finden, vor allem bevor er sich selbst oder anderen was antut, ist echt nicht einfach. Während viele Kinseekers normale Ermittlungsmethoden anwenden, wie zum Beispiel Berichten über „Angriffe durch wilde Tiere” oder regelrechten Mord nachzugehen, gibt ihnen dieser Ritus die Chance, Kin zu finden, bevor was Schlimmes passiert. Der Ritus verleiht die Fähigkeit, Kin anhand ihres Geruchs aufzuspüren, und beinhaltet oft das Verbrennen von Kräutern und Weihrauch, um widersprüchliche Gerüche zu erzeugen, was dazu führt, dass alle Tiere mit einem ausgeprägten Geruchssinn, einschließlich Hunde, im Umkreis von etwa einem Kilometer von der Stelle, an der der Ritus durchgeführt wird, verschreckt werden.`,
    pool: `Weisheit + Ermitteln`,
    system: `Der Bereich des Ritus ist ungefähr so groß wie eine kleine Stadt oder ein großer Stadtbezirk, wobei die Schwierigkeit von der Entfernung zum nächsten Verwandten abhängt. (Schwierigkeitsgrad 2 für nebenan, 4 für auf der anderen Seite der Stadt.) Die Anwesenheit anderer Werwölfe macht die Sache komplizierter und erhöht den Schwierigkeitsgrad um 1, wenn sich andere Garou als die des Ritus-Durchführenden in der Gegend aufhalten. Ein Erfolg bei der Prüfung bringt zwei zusätzliche Würfel bei allen zukünftigen relevanten Fertigkeitsprüfungen, um diesen bestimmten Kin einen ganzen Monat lang nach der Durchführung des Ritus durch den Ritusmeister zu finden.`
  },

  {
    id: 10,
    name: `Ritus der Geisterbeschwörung`,
    description: `Mit diesem Ritus kann ein Garot1 einen abwesenden, ahnungslosen oder sogar unwilligen Geist herbeirufen. Der Geist muss dem Meister des Ritus aber nicht gehorchen, und wenn der Garou keine freundliche Unterhaltung erwartet, folgt er diesem Ritus normalerweise mit passenden Gaben oder einem anderen Ritus, wie zum Beispiel dem Ritus der Bindung (siehe unten). Um diesen Ritus durchzuführen, muss der Ausführende die Aufmerksamkeit des Geistes auf sich ziehen, entweder indem er sich in dessen Reich oder in der Nähe einer Person oder eines Gegenstands befindet, die bzw. der von dem Geist besessen ist, oder indem er den Namen des Geistes kennt, wenn er ihn aus den tieferen Bereichen der Umbra beschwört.`,
    pool: `Ehre + Überzeugen`,
    system: `Der Ritus muss an einem Ort stattfinden, den der Geist erreichen kann. Wenn der Geist an einen Gegenstand oder einen Ort gebunden ist, muss der Ritus dort oder in dessen Nähe stattfinden. Wenn der Geist nicht an eine bestimmte physische Eigenschaft gebunden ist, muss der Ausführende stattdessen seinen Namen kennen. Der Widerstandspool entspricht der Macht des Geistes, modifiziert durch den lokalen Gauntlet (-2 Würfel, wenn er sich in einem Caern befindet; +2 Würfel, wenn der Gauntlet ungewöhnlich hoch ist). Die Beziehung des Ritualmeisters zum Geist kann ebenfalls eine Rolle spielen und die beteiligten Pools modifizieren. Wenn der Geist erfolgreich beschworen wurde, muss er für eine Szene bleiben, danach kann er gehen. Bei einem brutalen Ergebnis ist der Geist schwer beleidigt und unternimmt alle ihm möglichen feindseligen Handlungen gegen die Ausführenden des Rituals.`
  },

  {
    id: 11,
    name: `Ritus der Bindung`,
    description: `Dieser Ritus bindet einen Geist an ein physisches Merkmal. Je mächtiger der Geist ist, desto schwieriger ist der Prozess. Geister haben meistens was dagegen, gebunden zu werden, es sei denn, sie kommen gut mit dem Ritusmeister und ihrem Schutzgeist klar. Geister können an Gegenstände, Orte und sogar Menschen gebunden werden, obwohl die meisten Garou das letzte nur machen, wenn sie besonders gefühllos sind. Geister für zu lange Zeit zu binden, wird auch oft als unnötiger Missbrauch derer gesehen, die eigentlich Verbündete der Garou sein sollten, obwohl das nicht unumstritten ist, zum Beispiel bei einigen Theurgen des Geisterrats.`,
    pool: `Ruhm + Okkultismus`,
    system: `Wenn der Geist nicht super gut mit dem Ritualmeister befreundet ist – was das Ritual automatisch erfolgreich macht –, wird das Ritual von der Macht des Geistes abgewehrt. Wenn der Test bestanden wird, ist der Geist für eine Woche gebunden, und für jeden Erfolg in der Marge kommt eine weitere Woche dazu. Ein brutales Ergebnis beim Ritualtest verärgert den Geist (falls er nicht schon verärgert war) und ermöglicht es ihm, einen der Teilnehmer für eine Szene zu besetzen (sofern der Geist sich dafür entscheidet – viele wollen einfach nur aus der Gegend fliehen). Die genaue Art der Besetzung hängt vom Geist und den Launen des Erzählers ab, aber mehr als ein Rudel ist bei dem Versuch, einen Diener aus ihrem Herrn zu machen, verloren gegangen.`
  },

  {
    id: 12,
    name: `Ritus der Schande`,
    description: `Die Garou-Gesellschaft ist hart, und wer aus der Reihe tanzt, muss mit Konsequenzen rechnen. Dieser Ritus ist eine der härteren Strafen, aber trotzdem nicht so selten. Der Ritus macht das Leid der betroffenen Garou noch schlimmer und senkt ihren Status und ihren Wert in den Augen ihrer Artgenossen, der Geister und sogar ihrer selbst. Trotzdem fügen sich die Betroffenen meistens still, weil Widerstand zu Ausgrenzung oder Schlimmerem führen kann. Der Ritus ist daher eine feierliche Angelegenheit, ähnlich einer Urteilsverkündung, bei der die betroffene Person oder das Rudel ihre Fehler bekennen und schwören, dafür zu büßen. Am Ende des Ritus muss sich jede betroffene Person kennzeichnen, beispielsweise indem sie eine Handvoll sichtbarer Strähnen in ihre Mähne oder ihr Fell flechtet, und diese Kennzeichnung behalten, bis sie für ihre Verbrechen oder Verfehlungen gebüßt hat. Bis dahin zeugt die Kennzeichnung allen von ihrer Schande.`,
    pool: `-`,
    system: `Das Subjekt Garou oder Rudel bekommt einen erhöhten Ärger-Malus von 2 (siehe S. 142). Die Bedingungen für das Verfallen des Ritus hängen mit dem Entfernen des Ärgers zusammen und werden bei der Durchführung des Ritus festgelegt. Wenn das Mal vor diesem Zeitpunkt entfernt wird, folgt dem betreffenden Garou ein übler Gestank, bis er das Mal erneut anwendet. Der Gestank führt zu einem Malus von drei Würfeln bei allen sozialen Proben.`
  },

  {
    id: 13,
    name: `Ritus der Schirmherrschaft`,
    description: `Viele Garou-Rudel haben einen Schutzgeist, der sie in ihren Kämpfen zusammenhält und ihnen einen Segen gibt. Mit diesem Ritus nehmen die Werwölfe einen Rudel-Schutzgeist an, den sie aus den Schutzgeistern der Stämme im Rudel aussuchen. Bei dem Ritus geht es nicht nur darum, den neuen Schutzgeist bei Laune zu halten, sondern auch dem alten für seine Hilfe zu danken, damit es später keine Probleme gibt. Einige Rudel wechseln regelmäßig den Schutzgeist, ähnlich wie sie auch den Anführer wechseln. Andere gehen pragmatischer vor und bitten den Schutzgeist um Hilfe, der für ihre aktuelle Aufgabe am nützlichsten ist. Auch Schutzgeister, die nicht mit einzelnen Stämmen verbunden sind, können ihre Gunst anbieten, wenn das Rudel solche spezifische Hilfe von außen sucht, obwohl diese Geister oft schwieriger anzusprechen und zu bitten sind. Eine solche Entscheidung erfordert fast immer eine Reise, um den Geist zu finden und um ihn zu werben, und vielleicht auch einen Beweis der Kompetenz.`,
    pool: `Ansehen (die Art, die mit dem neuen Paket „Patron Spirit“ verbunden ist) + Etikette`,
    system: `Alle Mitglieder des Rudels müssen bei diesem Ritus mitmachen, aber der Ritusmeister muss nicht unbedingt mit dem gesuchten Schutzgeist verbunden sein. Die Grundschwierigkeit ist 4, abzüglich der Anzahl der Sitzungen seit der Wahl des letzten Schutzgeistes, bis zu einem Minimum von 1. Bei Erfolg können alle Mitglieder des Rudels während der Dauer der Schutzherrschaft zusätzlich zu ihrer Stammesgunst die Gunst dieses Schutzgeistes genießen, und jedes Rudelmitglied, das bereits zum Stamm des neuen Rudelschutzgeistes gehört, erhält den doppelten Gunstbonus. Infos zu Schutzgeistern und den Gunstbezeugungen, die sie gewähren, findest du im Kapitel über Stämme. Ein brutales Ergebnis führt nicht zum Scheitern des Rituals, verärgert aber den bisherigen Schutzgeist, der durch die Erfüllung einer Aufgabe oder einer Buße sowie durch ein Reuegeständnis besänftigt werden muss, bevor er erneut angerufen werden kann.`
  },

  {
    id: 14,
    name: `Ritus der Feier`,
    description: `Im Zeitalter der Apokalypse muss Garou sich Zeit nehmen, um kleine Siege zu feiern, auch wenn der große Krieg vielleicht schon verloren ist. Dieser Ritus ist ein organisiertes Fest, das vom Ritusmeister so geleitet wird, dass es nicht in wilde Ausschweifungen oder gewalttätige Ausschreitungen ausartet, und dass sich Zeit genommen wird, um jedes Mitglied des Rudels und die Geister, von denen sie Hilfe bekommen haben, zu würdigen. Richtig durchgeführt, stärkt dieser Ritus die mentale Stärke der Mitglieder und bereitet sie auf die bevorstehenden Herausforderungen vor.`,
    pool: `Ehre + Darbietung`,
    system: `Dieser Ritus kann nur durchgeführt werden, nachdem das Rudel einen Sieg errungen hat. Er kann nur einmal pro Geschichte versucht werden, um dem Rudel zu ermöglichen, seine Willenskraft über das normale Maß hinaus wiederherzustellen. Der Ritualmeister entscheidet, wie viele Stufen Willenskraftschaden die Rudelmitglieder wiederherstellen wollen. Die Schwierigkeit entspricht dieser Zahl. Bei Erfolg stellt jedes Rudelmitglied die festgelegte Anzahl an Stufen oberflächlichen Willenskraftschadens wieder her. Sie können sich auch dafür entscheiden, schweren Willenskraftschaden im Verhältnis 1:2 wiederherzustellen. Bei einem Fehlschlag, einschließlich eines brutalen Ergebnisses, wird keine Willenskraft wiederhergestellt, aber es gibt keine weiteren Auswirkungen, es sei denn, der Geschichtenerzähler entscheidet anders.`
  },

  {
    id: 15,
    name: `Ritus des Caern-Baus`,
    description: `Dieser Ritus ist einer der schwierigsten, aber auch wichtigsten unter den Werwölfen, weil er die Kraft hat, einen ruhenden Caern zu erwecken oder die Kontrolle über einen feindlichen Caern zu erlangen. Normalerweise braucht man ganze Septen, um das zu schaffen, was noch schwieriger wird, weil viele Caerns sich aktiv dagegen wehren, von gegnerischen spirituellen Kräften beansprucht zu werden. Die Durchführung dieses Ritus dauert viele Tage und Nächte. Ein Großteil dieser Zeit wird damit verbracht, die physische Manifestation des Caerns zu errichten und zu reparieren sowie die lokalen Geister zu besänftigen, indem man 186 angemessene Behausungen für ihre spirituellen Formen baut. Vorbereitende Rituale müssen während jeder Mondphase durchgeführt werden, und nach Abschluss eines gesamten Mondzyklus tritt der Ritus in seine letzte Phase ein. In dieser Phase leitet der Ritusmeister eine gemeinsame Zeremonie, wobei er die Hilfe des gesamten Rudels oder sogar der gesamten Sippe in Anspruch nimmt. Ein erfolgreicher Ritus endet mit der Eröffnung eines neuen Caerns, während ein Misserfolg zu umfangreichen spirituellen Schäden und sogar zum Tod führen kann.`,
    pool: `Weisheit + Handwerk`,
    system: `Die Schwierigkeit, einen neuen Caern zu gründen, ist 5. Wenn du versuchst, den Caern-Wert zu erhöhen, ist die Schwierigkeit 4 + die aktuelle Bewertung. Der Test wird am Ende des Mondzyklus gemacht, nachdem alle Vorbereitungen abgeschlossen sind. Ein erfolgreicher Ritus bringt einen neuen Caern mit einem Caern-Wert von 1 hervor; eine erfolgreiche Stärkung erhöht den Caern-Wert um 1. Bei einem Fehlschlag muss der Ritusmeister (oder jemand anderes) die monatlichen Vorbereitungen von vorne beginnen. Jedes brutale Ergebnis (Paar brutaler Ergebnisse) beschwört einen feindlichen Geist herauf oder verärgert einen bereits anwesenden, und alle diese Geister müssen beseitigt werden, bevor der Ritus als abgeschlossen betrachtet werden kann. Beachte, dass Spielercharaktere, die diesen Ritus im Caern ihres Rudels anwenden, Erfahrungspunkte ausgeben müssen, um das neue Caern oder den Caern-Wert gültig zu machen (siehe „Caerns” weiter unten).`
  },

  {
    id: 16,
    name: `Ritus des wiedergeborenen Wolfes`,
    description: `Den Wolf zu verlieren kann für einen Garou mitten in einem riskanten Abenteuer echt schlimm sein, vor allem wenn der Werwolf ihn nicht vom Mond zurückholen kann. Mit diesem Ritus kann ein Rudel seine Wut auf einen Rudelkameraden lenken, der den Wolf verloren hat (siehe S. 133), und ihn so wecken, als wäre er im Licht der Luna. Einige junge Garou nennen diesen Ritus respektlos „Jumpstarting”.`,
    pool: `Ansehen (höchster Wert des Ziels) + Anführen`,
    system: `Dieser Ritus muss auf ein Mitglied eines Rudels abzielen, das den Wolf verloren hat. Nur Mitglieder des Rudels des Ziels können mitmachen, und die Schwierigkeit ist 3. Die Teilnehmer müssen insgesamt 3 Wutpunkte opfern; wenn der Ritus klappt, bekommt das Ziel einen Wutpunkt und seinen Wolf zurück. Bei einem normalen Fehlschlag geht die Wut an die Teilnehmer zurück, aber bei einem brutalen Fehlschlag wird sie geopfert, auch wenn der Ritus nicht klappt.`
  },

  {
    id: 17,
    name: `Ritus des flüsternden Feldes`,
    description: `Dieser Ritus wird in einem Caern gemacht und hilft den Leuten, sich auf die Umgebung einzustimmen und total aufmerksam zu sein für alles, was sie sehen, riechen und hören können (oder auch nicht), was einen Eindringling verraten könnte. Selbst das Gras wird für die Teilnehmer zu einem Teil davon, aber ein brutaler Fehlschlag opfert es, auch wenn der Ritus scheitert. Ritus des flüsternden Feldes Dieser Ritus wird in einem Caern durchgeführt und lässt die Teilnehmer sich auf die Umgebung einstimmen und jedes Geräusch, jeden Geruch und jeden Anblick (oder deren Fehlen) wahrnehmen, die einen Eindringling verraten würden. Das Gras des Feldes und die Vögel in den Bäumen werden zu ihrem lebenden Überwachungssystem. Der Ritus wird oft von den Wächtern eines Caerns zusammen mit dem Ritus des Lebendigen Caerns (siehe oben) durchgeführt.`,
    pool: `Weisheit + Überleben`,
    system: `Die Schwierigkeit des Rituals ist 2 plus 1 für jeden, der mitmacht, außer dem Ritualmeister. Wenn das Ritual klappt, kriegen alle 2 normale Würfel, die ihnen bei jedem Bewusstseinstest helfen, um Eindringlinge im Bawn, dem Gebiet um das Caern-Territorium (wenn die genaue Region nicht bekannt ist, ungefähr ein Kilometer in alle Richtungen), zu entdecken, sowie einen ähnlichen Bonus bei anderen Tests, um Eindringlinge zu verfolgen oder zu untersuchen. Der Vorteil hält einen Mondmonat lang an. Bei einem brutalen Fehlschlag werden die Geister und Tiere des Gebiets um das Caern herum verschreckt, und niemand kann das Ritual vor Ablauf eines Mondmonats erneut versuchen.`
  },

  {
    id: 18,
    name: `Ritus der verhüllten Schlucht`,
    description: `Septs nutzen diesen Ritus, um ein Caern vor den Augen von normalen Leuten zu verstecken, egal ob es sich um Feinde oder Passanten handelt. Auch wenn er keine echten Illusionen oder Unsichtbarkeit erzeugt, lenkt er die Aufmerksamkeit der Besucher ab, sodass nur diejenigen, die entschlossen sind, das Caern zu finden, dies auch schaffen. Der Ritus kann zum Beispiel darin bestehen, ein großes, kompliziertes Netz aus Ranken, Seilen, Kabeln oder Drähten zwischen Baumkronen oder Felsvorsprüngen zu spinnen, aber jede Sippe hat ihre eigene Variante.`,
    pool: `Weisheit + Handwerk`,
    system: `Die Schwierigkeit, diesen Ritus durchzuführen, ist 2 plus der Caern-Wert des Caerns. Wenn es klappt, bekommst du zwei Würfel mehr bei jedem Versuch, das Caern zu verbergen oder zu tarnen, und es gibt einen Malus von zwei Würfeln bei jedem Versuch, das Caern aus Versehen zu entdecken. Der Effekt hält einen Mondmonat lang an. Bei einem brutalen Fehlschlag muss die ganze Netzkonstruktion (oder was auch immer der Ritus ist) abgerissen und neu gemacht werden, und niemand darf das Ritual vor Ablauf eines Mondmonats erneut versuchen.`
  },

  {
    id: 19,
    name: `Ritus der Überfahrt`,
    description: `Bevor sie Garou genannt werden können, müssen Kin oft eine gefährliche Aufgabe erledigen, um zu zeigen, dass sie den Mut, die Ehre und die Weisheit haben, die zu einem echten Werwolf passen. Nur wenige machen diesen Ritus alleine durch, meistens werden sie von ihrem zukünftigen Rudel begleitet, das manchmal auch neu in der Welt der Garou ist. Der Ritenmeister schickt die angehenden Garou – oder sogar das ganze Rudel – mit einem Ziel los, und sie dürfen nicht zurückkommen, bevor sie dieses Ziel erreicht haben. (Storyteller, das ist ein super Mittel für die erste Sitzung einer neuen Chronik!)`,
    pool: null,
    system: null
  },

  {
    id: 20,
    name: `Satire-Ritus`,
    description: `Ein Satire-Ritus ist ein spezielles Lied, ein Tanz oder ein Theaterstück, das nur dazu da ist, jemanden lächerlich zu machen. Dieser Ritus wird normalerweise bei einer Versammlung gemacht, während der Garou, der verspottet wird, vor allen Sept-Mitgliedern sitzt. Weil die Garou viele (oft bunte ...) mündliche Überlieferungen haben, wird die Satire über die Jahre hinweg in Erinnerung bleiben und weitergegeben werden. Ein Werwolf, der diesem Ritus unterzogen wird, verliert normalerweise nicht an Ansehen, aber er dient als Warnung an einen Garou oder ein Rudel, das kurz davor steht, dem weitaus strengeren Ritus der Schande unterzogen zu werden. Junge Garou nennen den Satire-Ritus manchmal respektlos „Breaking Balls” (Eier brechen) oder ähnliches.`,
    pool: null,
    system: null
  },

  {
    id: 21,
    name: `Ritus der Vollendung`,
    description: `Dieser Ritus dient dazu, einen Werwolf zu ehren und die Prüfungen anzuerkennen, die er durchgemacht hat, um seinen aktuellen Status zu erreichen. Ein Ältester kann die Ehrung vornehmen, oder der Garou selbst kann die Gelegenheit nutzen, um von seinen vergangenen Heldentaten zu erzählen. Wer auch immer die Rede hält, erzählt alles, was der Garou getan hat, um Anerkennung zu erlangen. Auch wenn es für menschliche Ohren vielleicht prahlerisch klingt, wenn ein Garou seine eigenen Errungenschaften aufzählt, ist es bei Versammlungen von Werwölfen völlig okay, sich so zu präsentieren, solange der Garou dies als Teil des Ritus betrachtet. Zu diesem Zeitpunkt können auch alle, die mit den Behauptungen nicht einverstanden sind, ihre Meinung sagen, und zwar innerhalb des Ritus, ohne sofortige Vergeltungsmaßnahmen befürchten zu müssen.`,
    pool: null,
    system: null
  },

  {
    id: 22,
    name: `Zusammenkunft der Verstorbenen`,
    description: `Dieser Ritus ehrt die kürzlich Verstorbenen. Normalerweise führt ein Galliard oder ein Rudelmitglied des verstorbenen Werwolfs den Ritus durch. Die Einzelheiten des Ritus können je nach Region oder sogar Rudel stark variieren. Zum Beispiel ein I-Iart-Warden-Ritualmeister die Sippe beim Erzählen von Geschichten über den gefallenen Garou an, die sowohl lautstark als auch heldenhaft sind, während der berühmteste Garou einer Sippe im Hoia-Wald einen feierlichen Ritus leitet, bei dem die Darsteller und alle Rudelkameraden des Gefallenen auf den Hängen stehen, ihre Schwänze in den Wind strecken und ihren Stolz und ihre Trauer herausheulen, um ihren Gefährten weiterzuschicken, idealerweise in ein Dasein als legendärer Geist.`,
    pool: null,
    system: null
  },

  {
    id: 23,
    name: `Ritus des Winterwolfs`,
    description: `Wenn manche Werwölfe zu verletzt oder zu alt sind, um noch mit ihren Rudelkameraden zu kämpfen, machen sie diesen düsteren und ernsten Ritus. Der Garou sitzt in der Mitte einer Versammlung seiner Rudel- und Septkameraden. Die Galliarden singen vom Leben und den Taten des Feiernden und rufen die Geister an, um ihn in der nächsten Welt willkommen zu heißen. Der Feiernde geht dann langsam und stolz durch die geschlossenen Reihen der versammelten Garou. Während sie an ihren Leuten vorbeigehen, heulen sie eine Totenklage, ähnlich der, die während der Versammlung für die Verstorbenen gesungen wird. Der Feiernde begibt sich dann an einen abgelegenen Ort. Dort beendet er sein Leben, normalerweise mit einem Klaive. In seltenen Fällen führen zwei Rudelmitglieder diesen Ritus gemeinsam durch und töten sich gegenseitig in einem rituellen Kampf. Unmittelbar nach dem Tod des Feiernden führen die versammelten Garou das Fest für die Verstorbenen durch.`,
    pool: null,
    system: null
  }
];

export const talismans: IW5Talisman[] = [
  {
    id: 1,
    name: `Affenfell`,
    description: `Dieser Talisman sieht aus wie ein Stück Haut, entweder von einem Affen oder einem Menschen. Wenn man ihn direkt auf der Haut trägt, macht er einen immun gegen Silber, solange man in der Glabro- oder L1ispo-Form ist, aber er macht es auch echt schwer, sich zu regenerieren. Nur wenige der heute lebenden Garou wissen, wie man diese Talismane herstellt, aber ihre Herstellung soll besonders grausam sein. Diejenigen, die sie benutzen, werden mit Misstrauen, wenn nicht sogar mit offener Feindseligkeit behandelt.`,
    system: `Solange dieser Talisman getragen wird und der Träger sich in seiner Glabro- oder Po-Form befindet, behandelt er Silber so, als wäre er in seiner Homid- oder Lupus-Form. Außerdem kann er in dieser Zeit und noch einen ganzen Tag und eine ganze Nacht, nachdem er den Talisman abgelegt hat, keine Schäden regenerieren.`,
    cost: 4,
    talenCost: 3
  },

  {
    id: 2,
    name: `Gaias Träne`,
    description: `Garou finden manchmal komische, steinige Fossilien in der Umbra, die mit der spirituellen Energie von Gaia, dem Geist der Welt, vollgepackt sind. Diese Dinger können wie Edelsteine aussehen und glänzen oder auch stumpf und biegsam sein, fast wie der Madstone aus der Folklore, und wenn man sie benutzt, können sie Trauer oder Wut hervorrufen. Sie sind extrem selten – niemand kann mit Sicherheit sagen, woher sie kommen (oder ob sie überhaupt von Gaia stammen ...) – und einzigartig, weil sie tatsächlich in die physische Welt gelangen und dabei ihre Form behalten können. Wenn ein Gatou mit einer von Gaias Tränen in Kontakt kommt, stellt er fest, dass sie sein Zielbewusstsein erneuert und vielleicht sogar seine spirituelle Verfassung selbst belebt.`,
    system: `Wenn du eine Szene (oder eine Auszeit) damit verbringst, über eine von Gaias Tränen nachzudenken, kannst du entweder Hauglosk oder Harano um eine Stufe senken. Dann verliert die Träne ihren Glanz und sieht wieder ganz normal aus, wie ein Mineral.`,
    cost: 0,
    talenCost: 0
  },

  {
    id: 3,
    name: `Harmonieflöte`,
    description: `Die ruhigen Klänge dieser Flöte, auf der Luna und Helios beim Tanzen abgebildet sind, können sogar die aggressivsten Wesen beruhigen. Sogar Garou, die von Wut gepackt sind, können besänftigt werden, vorausgesetzt, der Nutzer des Talismans überlebt länger als ein paar Takte. Flöten sind zwar die häufigste Form dieses Talismans, aber es gibt auch andere Varianten, wie zum Beispiel andere (meist tragbare) Musikinstrumente.`,
    system: `Der Nutzer der Flöte muss zwei Runden und einen Willenskraftpunkt investieren und dann einen Test auf Fassung + Darbietung gegen die aktuelle Wut eines Ziels in Raserei oder gegen einen Schwierigkeitsgrad von 3 bei anderen Kreaturen machen. Wenn der Nutzer erfolgreich ist, wird das Ziel aus der Raserei befreit und kehrt zu seiner natürlichen Form zurück (wenn es sich um einen Garou handelt), gemäß den normalen Regeln für das Verlassen der Crinos-Form.`,
    cost: 3,
    talenCost: 0
  },

  {
    id: 4,
    name: `Klaive`,
    description: `Die Klaive ist die typische Waffe der Garou-Kultur. Es ist ein verstärkter Silberdolch, der bei rituellen Kämpfen benutzt wird. Die Leute, die ihn benutzen oder herstellen, können ihn mit allen möglichen einzigartigen Verzierungen schmücken. In bestimmten Situationen, wie zum Beispiel bei Versammlungen, ist eine Klaive ein Statussymbol, das den Besitzer dazu einlädt, zu erzählen, wie er sie bekommen hat oder welche tollen Kämpfe er damit bestritten hat. Klaives werden besonders mit der Garou-Nation in Verbindung gebracht und wirken daher etwas altmodisch oder sogar veraltet. Trotzdem kann man die Wirksamkeit eines Klaives kaum bestreiten, wenn ein Rivale dir einen ins Gesicht rammt und er hinten aus deinem Kopf wieder rauskommt.`,
    system: `Ein Klaive verursacht +2 Silber-basierten schweren Gesundheitsschaden und kann in der Homid- oder Glabro-Form benutzt werden.`,
    cost: 3,
    talenCost: 1
  },

  {
    id: 5,
    name: `Rebhuhnflügel`,
    description: `Ein Rebhuhnflügel vertreibt die uralte Angst, die Menschen empfinden, wenn sie den Garou begegnen. Er kann aus einem echten Rebhuhngeist in der Umbra geformt werden oder eher metaphorisch sein und aus einem Geist der Vergesslichkeit oder sogar der Angst entstehen. Er kann die Form eines echten Flügels oder einer Feder haben oder wieder etwas Metaphorischeres sein, wie ein Schleier oder sogar ein Spinnennetz, das über die Augen gelegt wird.`,
    system: `Der Rebhuhnflügel verhindert, dass eine einzelne Person das Delirium erlebt, solange sie seinem Einfluss ausgesetzt ist. Ein einzelner Rebhuhnflügel „schützt“ immer nur eine Person vor dem Delirium, und die Person muss den Flügel bei sich tragen, egal ob sie es weiß oder nicht. Wenn jemand den Flügel verliert, wird er wie sonst vom Delirium beeinflusst, vergisst nach und nach alle Erinnerungen, in denen er Delirium-auslösende Effekte gesehen hat, und zweifelt an allen Erinnerungen, die später wieder auftauchen könnten.`,
    cost: 2,
    talenCost: 0
  },

  {
    id: 6,
    name: `Schattensplitter`,
    description: `Ein Schattensplitter ist ein Stück vom spirituellen Spiegelbild der Welt, ein echtes Stück der Umbra. Er sieht aus wie ein Stück Glas oder ein anderes halbtransparentes Material, scheint aber Schatten selbst zu enthalten, entweder als brodelnde, unruhige Dunkelheit oder als dichte, nebelartige Finsternis. Ein Garou kann den Schattensplitter zerbrechen, den Schatten darin befreien und den Werwolf über den Gat1ntlet in die Umbra ziehen.`,
    system: `Schattensplitter gibt's nur als Talismane. Mit ihnen kann ein einzelner Nutzer die Umbra betreten, solange die Gauntlet-Bewertung 3 oder weniger ist. Dieser Übergang verbraucht den Talisman, wenn er kaputtgeht, und zählt als volle Aktion. Es gibt auch größere Schattensplitter, mit denen der Nutzer seine ganze Gruppe durch den Gauntlet bringen kann. Schattensplitter funktionieren nur für Garou; sie können keine Menschen oder andere Individuen in die Umbra bringen, vermutlich weil ihnen die teilweise spirituelle Zusammensetzung der Werwölfe fehlt.`,
    cost: 0,
    talenCost: 1
  },

  {
    id: 7,
    name: `Geisterfänger`,
    description: `Ein Geistfänger ist so ein Talisman, den Geister total faszinierend finden, sodass sie sich weigern, sich davon zu entfernen, wenn ein Garou ihn ihnen zeigt. Sie können so ziemlich jedes Aussehen haben, egal ob es sich um übernatürliche „Fossilien” längst verstorbener Geister handelt, die vom Geisterrat der Garou nach ihren Reisen in die Geisterwildnis mitgebracht wurden, oder um technische Spielereien, die von den Glaswanderern geweiht wurden.`,
    system: `Ein Geistfänger sorgt dafür, dass pro Szene ein Geist nicht von dem Garot1 weggehen kann, der ihn schwingt, solange beide im selben Bereich sind (Umbra oder physisch). Der Garou kann normalerweise den Geist auswählen, aber wenn viele Geister anwesend sind, entscheidet der Spielleiter, welchen Geist er genau fängt – es ist nicht so präzise, dass man es „zielen” kann. Wenn der Geist gehen will, muss er einen Test seiner Kraft gegen den Wert des Geisterfängers bestehen. Wenn der Geist den Test nicht besteht, muss er in der Nähe des Geisterfängers bleiben, kann sich aber verstecken, ausweichen usw., und wenn er verletzt wird, kann er fliehen. Wenn er zusammen mit Gaben oder Riten verwendet wird, die Geister binden oder zurückhalten, kann der Geisterfänger die Hälfte seines Wertes als Bonuswürfel bereitstellen, nach Ermessen des Spielleiters.`,
    cost: 5,
    talenCost: 4
  },

  {
    id: 8,
    name: `Windpfeife`,
    description: `Wenn man auf dieser Pfeife pfeift, kommt ein Windstoß, der Staub, Schnee oder anderen lokalen Abfall mit sich reißt, der die Spuren des Benutzers und seines Rucksacks verdeckt. Verfolger haben es schwer, eine Spur zu finden, und alle Spuren sehen älter aus, als sie sein sollten. Um diese Pfeife herzustellen, muss man mehrere Verträge mit den Geistern des Landes und des Himmels abschließen, und die Pfeife selbst muss aus dem Knochen eines Tieres gemacht werden, das an Kälte oder einer anderen Form von Umwelteinwirkung gestorben ist.`,
    system: `Der Spieler macht einen Geistesschärfe + Okkultismus-Test, wobei die Schwierigkeit, ihn und seine Gruppe aufzuspüren, um die Hälfte der gewürfelten Erfolge erhöht wird, aufgerundet. Der Windpfeil kann nur draußen benutzt werden und nur einmal pro Sitzung. Der Effekt gilt nur für Verfolgungen, die den Ort betreffen, an dem der Talisman benutzt wurde.`,
    cost: 3,
    talenCost: 1
  }
];

export const traits: ITraitPack[] = [
  {
    id: 1,
    type: "merits",
    name: "Caern",
    description: "Caerns sind echt wichtig für die Garou-Gesellschaft und ihre Bräuche. Sie sind wie Knotenpunkte spiritueller Energie, und es wird viel Mühe reingesteckt, um diese Orte zu finden, zu pflegen und zu verteidigen. Rudel gehören oft zu einer Caern-Sippe oder sind ansonsten darauf aus, einen neuen Ort zu finden, den sie ihr Eigen nennen können. Während das Erwachen und die Pflege eines Caerns normalerweise Teil der Geschichte sind, gibt dieser Vorteil einem Charakter einen Vorsprung (oder einen Nachteil) bei diesen Bestrebungen. Mehr Infos findest du unter „Caerns” auf den Seiten 190–195.",
    advantages: [
      {
        id: 1,
        level: 1,
        name: "Caern Zugang",
        description: "Du darfst einen bestimmten Caern nutzen, der zu einem anderen Sept gehört, solange deine Aktionen deren Aktivitäten nicht stören oder die Sicherheit des Caerns gefährden. Du solltest dich mit dem Storyteller über die Art des Caerns und das schützende Sept einigen.",
        actions: [],
        isRepeatable: true
      },
      {
        id: 2,
        level: 5,
        name: "Erwachter Caern",
        description: "Du bist Teil eines Clans, der ein Caern bewacht, das schon ein bisschen erwacht ist, oder du stehst kurz davor, ein wichtiges Caern zu entdecken, das schon halb erwacht ist. Leg eins drauf zum Caern-Wert des ersten Caerns, dem du beitrittst oder das du entdeckst. Dieser Vorzug ist nicht stapelbar, aber mehrere Mitglieder können sich zusammenschließen, um die fünf Punkte zu sammeln, wenn der Spielleiter das okay findet.",
        actions: [],
        isRepeatable: false
      }
    ],
    disadvantages: [
      {
        id: 3,
        level: 1,
        name: "Caern Paria",
        description: "Du hast dich in allen Caerns in deinem Revier (Heimatstadt oder anderes Gebiet, das für die Chronik wichtig ist) unbeliebt gemacht. Du musst entweder viel für das Privileg des Zugangs bezahlen, normalerweise durch gefährliche Dienste, oder dich heimlich reinmogeln. Wenn du erwischt wirst, kann es schnell zu Gewalt kommen. Das gilt nicht für das Caern, zu dessen Sept du gehörst, aber es kann als Ausrede dienen, wenn jemand aus deinem Sept dich loswerden will.",
        actions: [],
        isRepeatable: false
      }
    ],
    specialRules: TraitSpecialRules.None
  },
  {
    id: 2,
    type: "merits",
    name: "Beruf",
    description: "Obwohl du ein verdammter Werwolf bist, schaffst du es irgendwie, einen festen Job zu behalten, oder zumindest so zu tun, als ob. Dieser Beitrag kann dir alles bieten, von einem Alibi für deinen Aufenthaltsort bis hin zum Schutz deines haarigen Geheimnisses. Er bringt dir nicht unbedingt ein nennenswertes Einkommen ein – dafür ist „Ressourcen“ zuständig –, aber eine Kombination aus einem Tagesjob und bedeutenden Ressourcen kann dich zu einem wirklich interessanten Werwolf machen.",
    advantages: [
      {
        id: 4,
        level: 1,
        name: "Hauptjob?",
        description: "Wenn du versuchst, deine Garou-Natur durch deinen Job zu verbergen, bekommst du einen Bonus von einem Würfel auf relevante Werte wie Ausflüchte („Ich war's nicht, ich war an dem Tag bei der Arbeit“) oder Überzeugungskraft („Was glaubst du, wie viele Werwölfe die Kabelgesellschaft für Installationen beschäftigt?“).",
        actions: [],
        isRepeatable: true
      },
      {
        id: 5,
        level: 2,
        name: "Bestätigter Hauptjob",
        description: "Wie bei „Hauptjob?“ oben, aber die Leute, mit denen du zusammenarbeitest (oder so tust, als ob du das tust), bestätigen deine Arbeitsansprüche und liefern mehr als nur die üblichen Arbeitsunterlagen. Leg zwei Würfel zu den gleichen Pools wie oben drauf.",
        actions: [],
        isRepeatable: true
      }
    ],
    disadvantages: [],
    specialRules: TraitSpecialRules.None
  },
  {
    id: 3,
    type: "merits",
    name: "Linguistik",
    description: "Jeder Charakter kann seine Muttersprache super und (es sei denn, der Spieler und der Spielleiter haben einen Grund, was anderes zu sagen) auch die Hauptsprache der Chronik. Zum Beispiel kann ein mexikanischer Werwolf in einer Chronik, die in den Badlands von Utah spielt, Spanisch und Englisch sprechen und lesen. Spielleiter können Garou, deren Muttersprache mit der der Chronik übereinstimmt, trotzdem eine zweite Sprache geben. Jeder Punkt in Linguistik ermöglicht es dem Charakter, zusätzlich zu diesen beiden Standardsprachen eine weitere Sprache fließend zu sprechen, zu schreiben und zu lesen. Beachte, dass das Lesen bestimmter alter Dokumente oder das Singen in einem fremden Dialekt zusätzliche Schwierigkeiten bei Prüfungen auf Naturwissenschaften oder Okkultismus mit sich bringen kann.",
    advantages: [],
    disadvantages: [
      {
        id: 6,
        level: 2,
        name: "Analphabet",
        description: "Du kannst weder lesen noch schreiben. Deine akademischen und wissenschaftlichen Fähigkeiten sind auf 1 begrenzt, und du kannst keine Spezialisierung in diesen Bereichen haben, die modernes Wissen beinhaltet.",
        actions: [],
        isRepeatable: false
      }
    ],
    specialRules: TraitSpecialRules.None
  },
  {
    id: 4,
    type: "merits",
    name: "Aussehen",
    description: "Nicht alle Werwölfe sehen aus wie ein Covermodel oder ein berühmter Schauspieler. Manche sehen sogar noch besser aus. Und manche sehen natürlich viel schlimmer aus. Aussehensmodifikatoren gelten nur, wenn du gesehen werden kannst. Der Storyteller entscheidet, ob diese Modifikatoren bei sozialen Konflikten auf Einzelfallbasis (oder sogar poolweise) gelten.",
    advantages: [
      {
        id: 7,
        level: 1,
        name: "Klemens Lupus",
        description: "Deine Lupusform sieht eher wie ein Hund als wie ein Wolf aus, und wenn sie keinen Grund haben, das zu glauben, denkt keiner, der dich in deiner Lupusform sieht, dass du ein Wolf bist.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 8,
        level: 2,
        name: "Schön",
        description: "Du fügst einen zusätzlichen Würfel zu allen entsprechenden sozialen Würfelpools hinzu.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 9,
        level: 4,
        name: "Atemberaubend",
        description: "Du fügst zwei zusätzliche Würfel zu allen entsprechenden sozialen Würfelpools hinzu.",
        actions: [],
        isRepeatable: false
      }
    ],
    disadvantages: [
      {
        id: 10,
        level: 1,
        name: "Hässlich",
        description: "Du ziehst einen Würfel von allen entsprechenden sozialen Würfelpools ab.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 11,
        level: 2,
        name: "Widerlich",
        description: "Du ziehst zwei Würfel von allen entsprechenden sozialen Würfelpools ab.",
        actions: [],
        isRepeatable: false
      }
    ],
    specialRules: TraitSpecialRules.None
  },
  {
    id: 5,
    type: "merits",
    name: "Unterschlupf",
    description: "Ein sicherer Unterschlupf ist mehr als nur ein Ort zum Schlafen und Essen. Es kann eine Wohnung, ein Haus, ein Loft, eine Blockhütte, eine Höhle oder eine Höhle sein – egal was, solange die Garou es für sicher halten. Ein Charakter kann beide „Sicherer Unterschlupf”-Vorteile nehmen, wenn er will.",
    advantages: [
      {
        id: 12,
        level: 2,
        name: "Unbekannter Unterschlupf",
        description: "Die Suche nach den Garou und allen, die mit ihnen im Unterschlupf sind, wird mit einem Malus von 2 Würfeln erschwert.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 13,
        level: 2,
        name: "Sicherer Unterschlupf",
        description: "Leg 2 Würfel in die entsprechenden Pools, um von unbefugtem Betreten deines Unterschlupfs zu erfahren oder dich dagegen zu wehren.",
        actions: [],
        isRepeatable: false
      }
    ],
    disadvantages: [],
    specialRules: TraitSpecialRules.None
  },
  {
    id: 6,
    type: "merits",
    name: "Drogenmissbrauch",
    description: "Leider greifen viele Garou zu Substanzen, um mit der andauernden Apokalypse und ihrem Gefühl der Verpflichtung, sich damit auseinanderzusetzen, fertig zu werden. Mit einem dieser Schwachpunkte bist du süchtig nach einer Substanz, vielleicht sogar nach einer übernatürlichen. Denk daran, die Substanz anzugeben, die du konsumierst. Der Spieler und der Geschichtenerzähler entscheiden, welche Wirkung die Droge deiner Wahl hat, aber nur wenige Drogen bewirken mehr als eine vorübergehende Strafe für bestimmte Pools, egal wie gut sich der Konsument dadurch in Bezug auf sich selbst oder seine Fähigkeiten fühlt. Beachte, dass Drogenmissbrauch ein echtes Gesundheitsproblem ist und hier aufgeführt wird, um die systemischen und narrativen Nachteile darzustellen, die sich daraus für die Garou ergeben. Die Einstufung als Schwachstelle ist hier keine Wertung.",
    advantages: [],
    disadvantages: [
      {
        id: 14,
        level: 1,
        name: "Sucht",
        description: "Verlier einen Würfel aus allen Pools, wenn du in der letzten Szene nicht deiner Lieblingsdroge nachgegangen bist, außer bei Pools für Aktionen, die dir sofort deine Droge verschaffen.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 15,
        level: 2,
        name: "Hoffnungslos süchtig",
        description: "Verlier zwei Würfel aus allen Pools, wenn du in der letzten Szene nicht deiner Sucht nachgegeben hast, außer aus Pools für Aktionen, die dir sofort deine Droge verschaffen.",
        actions: [],
        isRepeatable: false
      }
    ],
    specialRules: TraitSpecialRules.None
  },
  {
    id: 7,
    type: "merits",
    name: "Übernatürliche Situationen",
    description: "Auch wenn die Garou selbst übernatürlich sind, gibt's manchmal noch größere Geheimnisse, die sich den Werwölfen auf ungewöhnliche Weise zeigen. Diese Vorzüge und Schwächen ändern nichts an der Werwolfnatur der Garou, aber sie deuten auf Situationen hin, in denen die Grenzen zwischen Werwölfen und anderen Elementen der geheimen Welt nicht so klar sind.",
    advantages: [
      {
        id: 16,
        level: 1,
        name: "Mondbeschleunigt",
        description: "Der Mond inspiriert dich mehr als andere Werwölfe. Wenn du zum ersten Mal in einer beliebigen Nacht den Mond anheulst, kannst du einen Punkt leichten Willenskraftschadens wiederherstellen.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 17,
        level: 3,
        name: "Mondverrückt",
        description: "Der Mond macht dich noch wütender als die meisten anderen Werwölfe. Du bekommst einen zusätzlichen Wutpunkt, wenn du jede Nacht zum ersten Mal den Mond anheulst.",
        actions: [],
        isRepeatable: false
      }
    ],
    disadvantages: [
      {
        id: 18,
        level: 1,
        name: "Folkloristischer Fluch",
        description: "Du erleidest schweren Schaden durch einen folkloristischen Fluch. Zu den folkloristischen Flüchen gehören: Heiliges Wasser (Schaden wie Feuer), eine Waffe, die von jemandem benutzt wird, der voll und ganz an seinen Glauben festhält, eine Waffe mit Mondstein (Hekatolith) oder einfach nur ein Mondstein (der Schaden ist wie bei einer Waffe; wenn man einen Mondstein oder ein Schmuckstück mit Mondstein nur anfasst, gibt's einen Punkt schweren Schadens), ein anderer Fluch, auf den du und der Geschichtenerzähler euch geeinigt habt.",
        actions: [],
        isRepeatable: true
      },
      {
        id: 19,
        level: 1,
        name: "Folkloristischer Block",
        description: "Wenn du auf einen folkloristischen Block stößt, musst du ihm ausweichen oder einen Willenskraftpunkt ausgeben, um ihn zu überwinden oder zu durchbrechen. Jede folkloristische Blockade, die du auf dich nimmst, zählt als separater Ein-Punkt-Fehler. Zu den folkloristischen Blockaden gehören: Wolfskraut oder andere Kräuter, denen mystische Eigenschaften zugeschrieben werden, heilige Symbole, die von Gläubigen präsentiert werden, die Anwesenheit einer Jungfrau im volljährigen Alter oder älter, das Sehen von Silber (über die normale Abneigung der Garou gegen Silber hinaus – siehe S. 134), dreimal hintereinander mit dem Namen angesprochen zu werden, den du vor deiner ersten Verwandlung hattest (auch wenn er mit deinem jetzigen Namen übereinstimmt), einige andere Blockaden, auf die du dich mit dem Geschichtenerzähler einigst.",
        actions: [],
        isRepeatable: true
      },
      {
        id: 20,
        level: 1,
        name: "Folkloristische Erzählung",
        description: "Du hast irgendwas an dir, das die Leute denken lässt, dass mit dir was nicht stimmt, egal ob sie das jetzt direkt mit Werwölfen verbinden oder nicht. Diejenigen, die dein folkloristisches Merkmal erkennen, trauen dir nicht und geben dir einen Malus von -1 auf alle sozialen Proben, außer denen, die auf Einschüchterung basieren. (Bei diesem Makel kommt es auf die Reaktion an, nicht auf das spezifische Merkmal.) Jedes folkloristische Zeichen, das du annimmst, zählt als separater Ein-Punkt-Fehler. Zu den folkloristischen Zeichen gehören: Leute hören Heulen in deiner Nähe (egal, ob tatsächlich etwas heult oder nicht), dein Schatten ist der eines Wolfes, wenn du in menschlicher Gestalt bist, und der eines Menschen, wenn du in Wolfsgestalt bist, Milch verdirbt und Pflanzen verwelken, wenn du auftauchst, oder ein anderes Zeichen, auf das du dich mit dem Spielleiter einigst.",
        actions: [],
        isRepeatable: true
      },
      {
        id: 21,
        level: 2,
        name: "Fluch der Alten Hexe",
        description: "Entweder hat dich irgendein spiritueller Fluch getroffen und dich schnell altern lassen, wie zum Beispiel die Ungnade eines Bane oder irgendein prophetischer Umstand, oder du hast einfach die Erste Veränderung weit nach deiner Blütezeit erlebt. Deine Gesundheit hat gelitten, und du hast einen Punkt weniger auf deiner Gesundheitsskala, als du sonst hättest.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 22,
        level: 2,
        name: "Sklave des Monds",
        description: "Der Mond hat einen unangemessenen Einfluss auf yot1. Immer wenn du den Mond zum ersten Mal in einer bestimmten Nacht siehst, musst du deine Gestalt in glabro oder hispo verwandeln (und alle damit verbundenen Rage-Tests ablegen).",
        actions: [],
        isRepeatable: false
      }
    ],
    specialRules: TraitSpecialRules.None
  },
  {
    id: 8,
    type: "backgrounds",
    name: "Verbündete & Feinde",
    description: "Verbündete sind Leute, die dich unterstützen und dir helfen: Familie, Freunde oder sogar eine Organisation, die dir irgendwie verpflichtet ist. Auch wenn Verbündete dir normalerweise freiwillig helfen, ohne dass du sie dazu überreden oder zwingen musst, sind sie nicht immer da, um dir zu helfen. Sie haben ihre eigenen Probleme und tun nur so viel, weil sie mit dir befreundet sind. Normalerweise tauchen Verbündete etwa einmal pro Geschichte auf. Sie gehören nicht zur Meute und sind keine Garou oder Geister. Verbündete können fast jeder sein, der eine vernünftige Verbindung zu dir hat, je nachdem, was dein Spielleiter zulässt. Du hast vielleicht Freunde in der Leichenhalle des Polizeireviers, bei einer Boulevardzeitung oder einem Klatschblog, unter Eisenbahnnomaden oder in einem ländlichen E-Commerce-Fulfillment-Center. Verbündete sind in der Regel vertrauenswürdig (obwohl sie wahrscheinlich nichts von deiner Werwolfnatur wissen oder sogar davon, dass es übernatürliche Wesen gibt). Allerdings gibt es nichts umsonst. Wenn du deinen Freund bei der Grenzpolizei um einen Gefallen bittest, wird er dich wahrscheinlich bitten, ihm in Zukunft einen Gefallen zu tun. Feinde sind das Gegenteil von Verbündeten und werden als Schwächen betrachtet. Du kannst die Regeln für Nebencharaktere nutzen, um Verbündete oder Feinde zu erstellen, wenn du sie kaufst oder zum ersten Mal aufrufst, und du kannst sie auf der Beziehungskarte notieren (siehe S. 111), obwohl viele Gruppen diesen Prozess dem Geschichtenerzähler überlassen. Erstelle Verbündete oder Feinde aus einem Punktebudget, das auf ihrer Effektivität und ihrer Zuverlässigkeit basiert. Die maximale Punktzahl für einen Verbündeten beträgt sechs. Verbündete oder Feindesgruppen treten in einer Anzahl auf, die der Anzahl der Spielercharaktere entspricht. Alle Feinde werden mit zwei Punkten weniger bewertet als ihre Effektivität. Zum Beispiel kostet eine begabte Person als Verbündeter drei Punkte, liefert aber nur einen Punkt als Schwachstelle. Feinde haben alle die gleiche Zuverlässigkeit: Immer dann, wenn der Spielleiter meint, dass sie auftauchen sollten, aber wahrscheinlich mindestens einmal pro Geschichte (auch wenn es nur indirekt ist).",
    advantages: [
      {
        id: 23,
        level: 1,
        name: "Effizienz (V) 1",
        description: "Schwacher Mensch, wahrscheinlich nutzlos in einer gewalttätigen oder potenziell gewalttätigen Situation.",
        actions: [],
        isRepeatable: true
      },
      {
        id: 24,
        level: 2,
        name: "Effizienz (V) 2",
        description: "Durchschnittlicher Einzelner oder eine eng verbundene Gruppe von schwachen Personen (launische Hafenarbeiter, eine schlecht organisierte Gewerkschaft, NGO-Ortsgruppe).",
        actions: [],
        isRepeatable: true
      },
      {
        id: 25,
        level: 3,
        name: "Effizienz (V) 3",
        description: "Ein begabter Einzelner oder eine gefährliche Gruppe von Durchschnittsmenschen (eine Straßengang, das Gefolge eines Prominenten, eine gut organisierte Gewerkschaft für Arbeiter).",
        actions: [],
        isRepeatable: true
      },
      {
        id: 26,
        level: 4,
        name: "Effizienz (V) 4",
        description: "Ein echt krasser Typ, jemand mit besonderen Fähigkeiten, vielleicht sogar mit übernatürlichen Kräften, oder eine gut ausgerüstete Gruppe von Leuten mit besonderen Fähigkeiten (eine private Sicherheitsgruppe, ein Team von Anwälten, eine Gruppe von trainierten Sportlern).",
        actions: [],
        isRepeatable: true
      },
      {
        id: 27,
        level: 1,
        name: "Zuverlässigkeit (V) 1",
        description: "Wenn du sie rufst, kommen sie nur manchmal.",
        actions: [],
        isRepeatable: true
      },
      {
        id: 28,
        level: 2,
        name: "Zuverlässigkeit (V) 2",
        description: "Wenn du sie rufst, kommen sie innerhalb von 1 bis 10 Stunden (wirf einen Würfel).",
        actions: [],
        isRepeatable: true
      },
      {
        id: 29,
        level: 3,
        name: "Zuverlässigkeit (V) 3",
        description: "Wenn du sie anrufst, kommen sie so schnell wie möglich vorbei.",
        actions: [],
        isRepeatable: true
      }
    ],
    disadvantages: [
      {
        id: 30,
        level: 1,
        name: "Effizienz (F) 1",
        description: "Schwacher Mensch, wahrscheinlich nutzlos in einer gewalttätigen oder potenziell gewalttätigen Situation.",
        actions: [],
        isRepeatable: true
      },
      {
        id: 31,
        level: 2,
        name: "Effizienz (F) 2",
        description: "Durchschnittlicher Einzelner oder eine eng verbundene Gruppe von schwachen Personen (launische Hafenarbeiter, eine schlecht organisierte Gewerkschaft, NGO-Ortsgruppe).",
        actions: [],
        isRepeatable: true
      },
      {
        id: 32,
        level: 3,
        name: "Effizienz (F) 3",
        description: "Ein begabter Einzelner oder eine gefährliche Gruppe von Durchschnittsmenschen (eine Straßengang, das Gefolge eines Prominenten, eine gut organisierte Gewerkschaft für Arbeiter).",
        actions: [],
        isRepeatable: true
      },
      {
        id: 33,
        level: 4,
        name: "Effizienz (F) 4",
        description: "Ein echt krasser Typ, jemand mit besonderen Fähigkeiten, vielleicht sogar mit übernatürlichen Kräften, oder eine gut ausgerüstete Gruppe von Leuten mit besonderen Fähigkeiten (eine private Sicherheitsgruppe, ein Team von Anwälten, eine Gruppe von trainierten Sportlern).",
        actions: [],
        isRepeatable: true
      },
      {
        id: 34,
        level: 1,
        name: "Zuverlässigkeit (F) 1",
        description: "Wenn du sie rufst, kommen sie nur manchmal.",
        actions: [],
        isRepeatable: true
      },
      {
        id: 35,
        level: 2,
        name: "Zuverlässigkeit (F) 2",
        description: "Wenn du sie rufst, kommen sie innerhalb von 1 bis 10 Stunden (wirf einen Würfel).",
        actions: [],
        isRepeatable: true
      },
      {
        id: 36,
        level: 3,
        name: "Zuverlässigkeit (F) 3",
        description: "Wenn du sie anrufst, kommen sie so schnell wie möglich vorbei.",
        actions: [],
        isRepeatable: true
      },
      {
        id: 37,
        level: 1,
        name: "Stalker",
        description: "Du ziehst oft Leute an, die ein bisschen zu vernarrt in dich sind, was nicht unbedingt gut für dich ist. Ein Stalker hat ungesunde Gefühle für dich und will eine ernsthaftere Beziehung, egal ob du das willst oder nicht. Diese Leute können eifersüchtig, liebestoll, verzweifelt, opportunistisch oder eine Mischung aus all dem sein. Wenn du einen loswirst, taucht bald der nächste auf.",
        actions: [],
        isRepeatable: false
      }
    ],
    specialRules: TraitSpecialRules.Allies
  },
  {
    id: 9,
    type: "backgrounds",
    name: "Kontakte",
    description: "Du kennst Leute – hilfsbereite Leute – aus vielen verschiedenen Bereichen. Kontakte versorgen dich hauptsächlich mit Infos aus ihren Fachgebieten und möchten vielleicht verschiedene Gefälligkeiten mit dir austauschen. Für andere Arten von Hilfe wende dich an deine Verbündeten (S. 101) oder deinen Mentor (S. 104). Ein Kontakt ist jemand, der super Informationen beschaffen kann. Das kann ein Polizeibeamter sein, statt eines Mordkommissars, oder ein Mitarbeiter des Kongresses, statt eines Senators. Informationsvermittler, Reporter, Unterwelt-Vermittler und Transportfahrer sind super Kontakte. Du kannst deine Kontakte beim Kauf dieses Hintergrunds oder bei Bedarf im Spiel definieren. Egal wann du sie erstellst, denk dran, sie zur Beziehungskarte hinzuzufügen (siehe S. 111).",
    advantages: [
      {
        id: 38,
        level: 1,
        name: "Kontakt 1",
        description: "Ein Ansprechpartner, der dir allgemeine, aber auch spezielle Infos geben kann, wie zum Beispiel ein Grasdealer oder ein Autoverkäufer.",
        actions: [],
        isRepeatable: true
      },
      {
        id: 39,
        level: 2,
        name: "Kontakt 2",
        description: "Ein Kontakt, der dir ungewöhnliche und vertrauliche Infos geben kann, wie zum Beispiel ein kleiner Waffenhändler oder ein Psychiater.",
        actions: [],
        isRepeatable: true
      },
      {
        id: 40,
        level: 3,
        name: "Kontakt 3",
        description: "Ein Kontakt, der dir wichtige und sogar geheime Infos geben kann, wie zum Beispiel ein Experte für Sicherheitssysteme, ein Drogenfahnder oder ein Top-Lobbyist.",
        actions: [],
        isRepeatable: true
      }
    ],
    disadvantages: [],
    specialRules: TraitSpecialRules.None
  },
  {
    id: 10,
    type: "backgrounds",
    name: "Ruhm",
    description: "Die Leute kennen deinen Namen und sind total gespannt auf Neuigkeiten über deine Aktivitäten. Du bist vielleicht ein Filmstar, Rockstar oder eine andere Berühmtheit. Ruhm bringt dir Aufmerksamkeit in den Massenmedien und sozialen Medien; du hast mehr Möglichkeiten als die meisten Leute, die Meinung bestimmter Gruppen (meistens) von Menschen zu beeinflussen. Du hast wahrscheinlich Möglichkeiten, wie zum Beispiel ein Double, um zu verbergen, dass du in Dinge verwickelt bist, die du lieber geheim halten möchtest. Unter bestimmten Umständen kann der Spielleiter dir erlauben, Ruhm in einem sozialen Test-Würfelpool zu verwenden, anstatt eine andere Eigenschaft, insbesondere um Zugang zu einem ansonsten exklusiven Ort oder einer Veranstaltung zu erhalten. „Weißt du, wer ich bin?“ funktioniert nicht überall, aber es funktioniert. Jede Stufe von Ruhm reduziert die Schwierigkeit von Sozialtests, an denen dein Publikum oder deine Unterstützer beteiligt sind, um eins, solange der Test nichts allzu Ausgefallenes beinhaltet. (Wenn doch, hat das sicher Konsequenzen.) Ruhm hat natürlich auch seine Schattenseiten – es ist zum Beispiel schwieriger für dich, jemanden unauffällig zu verfolgen, und wenn Groupies anfangen, sich um den Caern herum aufzuhalten, wird dieser Caern wahrscheinlich durch etwas völlig Alltägliches wie Instagram kompromittiert. Du solltest dir überlegen, „Verkleidung” als Spezialfertigkeit zu wählen. Standardmäßig gilt Ruhm unter Menschen, aber du könntest argumentieren, dass es sich um eine Art Sonderfall von Wolfsruhm handelt. Einige übernatürliche Wesen sind besonders aufmerksam gegenüber Neuigkeiten und Trends und könnten auch dich kennen, einschließlich Garou, sodass der Spielleiter entscheidet, ob die Vorteile des Ruhms für bestimmte übernatürliche Wesen gelten.",
    advantages: [
      {
        id: 41,
        level: 1,
        name: "Ruhm 1",
        description: "Eine bestimmte Subkultur weiß, wer du bist, und mag dich.",
        actions: [],
        isRepeatable: true
      },
      {
        id: 42,
        level: 2,
        name: "Ruhm 2",
        description: "Du bist eine lokale Berühmtheit, die fast jeder in der Stadt kennt.",
        actions: [],
        isRepeatable: true
      },
      {
        id: 43,
        level: 3,
        name: "Ruhm 3",
        description: "Die meisten Leute hier kennen wenigstens deinen Namen.",
        actions: [],
        isRepeatable: true
      },
      {
        id: 44,
        level: 4,
        name: "Ruhm 4",
        description: "Jeder, der sich auch nur ein bisschen für gesellschaftliche Trends oder dein Fachgebiet interessiert, weiß irgendwas über dich.",
        actions: [],
        isRepeatable: true
      },
      {
        id: 45,
        level: 5,
        name: "Ruhm 5",
        description: "Dein Ruhm erreicht ein großes nationales oder sogar globales Publikum. Du bist ein großer Filmstar, ein Rockstar, der Stadien füllt, oder eine Internet-Persönlichkeit.",
        actions: [],
        isRepeatable: true
      }
    ],
    disadvantages: [
      {
        id: 46,
        level: 1,
        name: "Dunkles Geheimnis",
        description: "Der dunkle geheime Makel ist ähnlich wie „Schande“, aber deine dunklen Taten bleiben für alle außer dir und vielleicht ein oder zwei echt motivierten Feinden unbekannt. Er ist auch leichter aufzudecken als ein wirklich lebensbedrohliches Geheimnis. Beispiele sind zum Beispiel eine große Schuld bei einem Kriminellen oder eine Akte bei einer staatlichen Werwolfjagd-Behörde.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 47,
        level: 1,
        name: "Berüchtigter Partner",
        description: "Dein Partner, Liebhaber oder jemand anderes, der dir wichtig ist, hat einen schlechten Ruf (wie oben beschrieben), der dich manchmal mit reinzieht.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 48,
        level: 2,
        name: "Schande",
        description: "Du bist für etwas Schreckliches bekannt. Im besten Fall steigt die Schwierigkeit der meisten Reaktionstests um den Wert des Makels; im schlimmsten Fall versuchen die Behörden, dich sofort zu töten oder zu fangen. Du stehst vielleicht auf der Liste der meistgesuchten Personen einer Regierung, oder die Pentex Group verbreitet dein Aussehen als gefährliche Person über ihre verschiedenen Fronten.",
        actions: [],
        isRepeatable: false
      }
    ],
    specialRules: TraitSpecialRules.None
  },
  {
    id: 11,
    type: "backgrounds",
    name: "Überlieferung: Umbralischer Wanderer",
    description: "Überlieferungen sind besondere Hintergrundvorteile, die die Verbindungen der Garou zu wichtigen Ereignissen, Fraktionen oder Traditionen ihrer Gesellschaft darstellen; sie müssen stufenweise einzeln gekauft und in die Charaktergeschichte eingebunden werden, wobei man normalerweise nur eine wählen darf. - Die Spirit Wilds sind sogar für die Garou ein Rätsel, obwohl sie mit ihrer animistischen Weltanschauung mit der Geisterwelt vertraut sind, aber nicht wirklich dazugehören. Obwohl es ein Ort ist, der sich ständig in Gedanken, Gefühlen und Emotionen verändert, bleiben einige Wahrheiten und sogar Orte in seinen Spiegelbildern bis zu einem gewissen Grad immer gleich. Sicherlich können sich die Dinge jederzeit ändern, besonders in der Ära der Apokalypse, aber für jene Garou, die sich auf die Erforschung der Umbra spezialisiert haben, ist es möglich, die Regeln der Geisterwelt zu verstehen, wenn man weiß, wonach man suchen muss – zumindest im Moment.",
    advantages: [
      {
        id: 49,
        level: 1,
        name: "Schritte aus Silber",
        description: "In der Umbra hinterlässt der Garou silberne Fußspuren, die nur er selbst sehen kann. Das hilft ihm, den Weg zurück durch den Gauntlet zu finden, wenn es Zeit ist, zurückzukehren. Die Schwierigkeit, mit dem Ritus der Schattenpassage aus der Umbra in die physische Welt zurückzukehren, wird um 1 reduziert, wenn du der Meister des Ritus bist (siehe S. 180).",
        actions: [],
        isRepeatable: false
      },
      {
        id: 50,
        level: 2,
        name: "Webmusik",
        description: "Du hast die Bewegungen von Muster-Spinnen beobachtet (siehe S. 254) und kannst einmal pro Szene, wenn ihre Netze da sind, an diesen Fäden wie an Saiten zupfen und die Aufmerksamkeit einer einzelnen Muster-Spinne auf dich lenken, egal ob sie sichtbar ist oder nicht. Dieses Signal macht die Spinne nicht unbedingt freundlich zu dir, aber es zieht die Aufmerksamkeit des Geistes auf jeden Fall auf dich.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 51,
        level: 3,
        name: "Neuling der Unterwelt",
        description: "Du weißt, dass es Teile der Umbra gibt – glaubst du zumindest –, die zu einer anderen Art von Geist gehören und eine andere Klangfarbe haben, den Garou-Geist, der dir vom vorherigen Hüter des Geheimnisses und so weiter in der Kette der spirituellen Pflichten übergeben wurde. Was du mit diesem Wissen machst, ist deine Sache, aber was auch immer es ist, du kannst sehen, was man nur als „Geister” beschreiben kann, wenn du weißt, was du weißt. Du solltest den Geschichtenerzähler in diese Geschichte einbeziehen. Sie können sich nicht vor dir verstecken, es sei denn, sie nutzen bestimmte übernatürliche Kräfte, die ihnen dies ermöglichen.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 52,
        level: 4,
        name: "Spirituelle Nahrung",
        description: "Du bist besonders auf die Geisterwelt eingestellt und erleidest nur leichten Gesundheitsschaden, wenn du keine Willenskraft aufwendest, um dich über einen längeren Zeitraum in der Umbra aufzuhalten (siehe S. 230, wobei leichter Schaden wie üblich irgendwann zu schwerem Schaden wird).",
        actions: [],
        isRepeatable: false
      },
      {
        id: 53,
        level: 5,
        name: "Chthonisches Geheimnis",
        description: "Du bist der aktuelle Hüter eines monumentalen Umbra!-Geheimnisses, wie zum Beispiel der Standort des Reiches eines mächtigen Geistes oder das Jagdgebiet eines legendären Garou-Geistes, das dir vom vorherigen Hüter des Geheimnisses übergeben wurde, und so weiter in der Kette der spirituellen Pflichten. Was du mit diesem Wissen machst, liegt ganz bei dir, aber was auch immer der Geist ist, um den es in dem Geheimnis geht, weiß, dass du Bescheid weißt. Du solltest den Geschichtenerzähler in diese Sache einbeziehen.",
        actions: [],
        isRepeatable: false
      }
    ],
    disadvantages: [],
    specialRules: TraitSpecialRules.None
  },
  {
    id: 12,
    type: "backgrounds",
    name: "Überlieferung: Fenris' Entsagung",
    description: "Überlieferungen sind besondere Hintergrundvorteile, die die Verbindungen der Garou zu wichtigen Ereignissen, Fraktionen oder Traditionen ihrer Gesellschaft darstellen; sie müssen stufenweise einzeln gekauft und in die Charaktergeschichte eingebunden werden, wobei man normalerweise nur eine wählen darf. - Das Schicksal des Fenris-Kults ist unter den Garou ein heiß diskutiertes Thema. Der Kult selbst meint natürlich, dass seine Leute wissen, was sie tun, und dass nur ein vom Wyrm geschwächter Feigling ihre Bereitschaft in Frage stellen würde, sich mit gezückten Reißzähnen auf den Großen Schänder zu stürzen – vor allem von einem sicheren Ort am Rande aus. Außerhalb des Kults selbst ist weniger klar, was genau passiert ist. Eine Theorie besagt, dass der Incarna-Wolf von einem Aspekt des Wyrm getäuscht wurde und nun als Sklave dieses Geistes dient. Eine andere Theorie lautet, dass ein Aspekt des Wyrm den Wolf tatsächlich auf irgendeine Weise getötet hat und der Stamm nun unwissentlich dem Schutz dieses unbekannten Geistes folgt. Die wahrscheinlichste Theorie ist auch die einfachste: Hauglosk hat den Kult tatsächlich für sich beansprucht, und Wolf duldet keine Meinungsverschiedenheiten unter seinen Anhängern. Aber natürlich bleibt diese Wahrheit eines der Geheimnisse der Geisterwelt, bis Wolf oder ein anderer großer Geist einen nachprüfbaren Beweis für die Wahrheit liefert. Nicht alle Mitglieder des Kultes von Fenris folgten ihren Gefährten auf den Pfad von Hauglosk. Einige brachen ihren Pakt mit Wolf, als sie sahen, in welche Richtung sich der Stamm bewegte, und schworen einem anderen Stamm die Treue.",
    advantages: [
      {
        id: 54,
        level: 1,
        name: "Arschkriecher",
        description: "Selbst unter Werwölfen hat der Kult von Fenris einen gewalttätigen Ruf und eine Vorliebe für starke Anführer. Als Speichellecker findest du deinen Sinn darin, von den echten Autokraten auf eine „Bedrohung” hingewiesen zu werden. Einmal pro Spielsitzung bekommst du einen Willenskraftpunkt zurück, wenn ein Garou mit höherem Ansehen als du dich in einen Konflikt schickt, in dem du Willenskraft für einen erneuten Wurf ausgegeben hast.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 55,
        level: 2,
        name: "Ausgestoßener Kultist",
        description: "Die angesehenen Garou waren dabei, als du Fenris abgeschworen hast, und haben dich ein bisschen zum Exempel für andere gemacht. Dein Ansehen wird bei sozialen Interaktionen auf Versammlungen als einen Punkt niedriger als sein tatsächlicher Wert angesehen. Allerdings kann niemand deine Wildheit in Frage stellen – wenn du jemals in eine Situation gerätst, in der du aufgrund eines fehlgeschlagenen Rage-Tests den Wolf verlieren würdest, kannst du einen zusätzlichen Rage-Test machen; wenn dieser erfolgreich ist, bleibt deine Rage bei 1, anstatt auf 0 zu fallen.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 56,
        level: 3,
        name: "Unbezwungen",
        description: "Obwohl du Wolf abgeschworen hast, hat dir die Fürsorge des großen Geistes eine Furchtlosigkeit beigebracht, die in dir weiterlebt. Wenn eine Gabe oder ein anderer übernatürlicher Effekt Angst in dir auslösen würde, kannst du zwei Würfel bekommen, um dich dagegen zu wehren, wenn das möglich ist. Wenn du das machst, verlierst du aber einen Würfel, um dich für den Rest der Szene gegen Raserei zu wehren.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 57,
        level: 4,
        name: "Kanalisierte Wut",
        description: "Die Härte von Fenris ist in dir immer noch stark. Einmal pro Szene kannst du dich dafür entscheiden, automatisch einen beliebigen Wut-Check zu bestehen, um eine Gabe mit einem Pool-Wurf zu aktivieren, aber du bekommst auch ein zusätzliches brutales Ergebnis bei diesem Pool-Wurf.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 58,
        level: 5,
        name: "Letztes Heulen",
        description: "Du hast die Auswirkungen von Hauglosk hautnah miterlebt, als du gesehen hast, wie der fanatische Eifer in den Augen deiner Landsleute aufgeflammt ist – aber nicht in deinen. Einmal pro Chronik kannst du, wenn du dein letztes Hauglosk-Kästchen markierst, einen Wut-Check machen; wenn dieser Rage-Test nicht klappt, mach das letzte Hauglosk-Kästchen wieder frei. Glückwunsch: Du hast dich vom Abgrund zurückgekämpft.",
        actions: [],
        isRepeatable: false
      }
    ],
    disadvantages: [],
    specialRules: TraitSpecialRules.None
  },
  {
    id: 13,
    type: "backgrounds",
    name: "Überlieferung: Die schwarze Spirale",
    description: "Überlieferungen sind besondere Hintergrundvorteile, die die Verbindungen der Garou zu wichtigen Ereignissen, Fraktionen oder Traditionen ihrer Gesellschaft darstellen; sie müssen stufenweise einzeln gekauft und in die Charaktergeschichte eingebunden werden, wobei man normalerweise nur eine wählen darf. - Viele Garou denken, dass die Schwarze Spirale irgendwo tief in der Umbra versteckt ist – wahrscheinlich in einem Teil, der dem Wyrm besonders nah ist, oder irgendwie in seinem Fokus, wenn man das so sagen kann. Andere Garou denken, dass das „Schwarze Labyrinth” ein Ort in der physischen Welt ist oder sogar ein metaphorischer Ort, der sich durch die physische Welt bewegt, zu Orten, an denen die Verunreinigung durch Menschen für den Wyrm am befriedigendsten ist ... wieder, wenn man sagen kann, dass der Wyrm Dinge „bevorzugt”. Wie auch immer, die Schwarze Spirale ist ein wichtiger Ort für die Wyrm-Anhänger des gleichnamigen Stammes (siehe 277). Eine Mischung aus höllischem Caern und Schmelztiegel, in dem angehende Tänzer der Schwarzen Spirale gebrochen und neu geschmiedet werden, ist sie zugleich ein Ort, ein spiritueller Schrecken und eine unerbittlich grausame Sicht auf die Welt. Sie könnte der Ort des letzten Krebsgeschwürs sein, das Gaia selbst verzehrt.",
    advantages: [
      {
        id: 59,
        level: 1,
        name: "Glyphe der schwarzen Spirale",
        description: "Jeder Garou, der das Symbol kennt, kann die Schwarze Spirale darstellen, aber unter den Dienern des Wyrm hat das Symbol selbst Nuancen, die die meisten Garou nicht kennen. Du weißt, wie man die echte Glyphe der Schwarzen Spirale überzeugend nachmacht, die du als Köder oder zum Irreführen anderer nutzen kannst, aber die, die wissen, dass du diese Fähigkeit hast, sind dir gegenüber misstrauisch, wenn nicht sogar feindselig, und du bekommst einen Malus von -2 auf alle Sozialwürfel-Pools, wenn du mit diesen Garou interagierst, außer mit deinem aktuellen Rudel.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 60,
        level: 2,
        name: "Schlechte Gesellschaft",
        description: "Du hast Kontakt und vielleicht sogar eine Art seltsames Vertrauen zu einem Black Spiral Dancer, einem bemerkenswert stabilen Fomor, oder sogar zu einem Vampir oder einem anderen übernatürlichen Wesen, das irgendwie mit der Abscheulichkeit des Wyrm zu tun hat. Einmal pro Geschichte kannst du diesen ... nun ja, nicht gerade „Freund” um Hilfe bitten, aber er kann dir Infos über andere Wyrm-Kreaturen geben, insbesondere über die Black Spiral Dancers oder über Okkultes im Allgemeinen. Deine Bekanntheit für soziale Interaktion sinkt um 2 für den Rest der Sitzung, in der du dies tust, oder für die gesamte nächste Sitzung, je nach Entscheidung des Spielleiters.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 61,
        level: 3,
        name: "Spiralzyste",
        description: "Abscheuliche Höhlen oder Zufluchtsorte, die mit dem Symbol der Schwarzen Spirale gezeichnet sind, verunstalten die Welt und dienen den Agenten des Wyrm als Verstecke. Du kennst einen solchen Ort in deinem Gebiet und kannst ihn vorübergehend als sicheren Unterschlupf (siehe S. 98) nutzen, in dem du Zeroed (siehe S. 103) bist, während du dich dort versteckst. Wenn die Garou von diesem Ort erfahren, wirst du wahrscheinlich einiges zu erklären haben.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 62,
        level: 4,
        name: "Unverletzlich",
        description: "Ein bestimmter Wyrm-verbündeter Geist weigert sich, dir etwas anzutun, auch wenn er nicht weiß, wer du bist, weil es einen geheimen Pakt gibt, der in längst vergessenen Zeiten geschlossen wurde. So cool diese Vereinbarung auch sein mag, wenn jemand sieht, wie der Geist dir aus dem Weg geht oder dir Respekt zollt ... du weißt schon. Leg mit dem Geschichtenerzähler fest, wer dieser Wyrm-Geist ist (und welchen Rang er in der Hierarchie hat).",
        actions: [],
        isRepeatable: false
      },
      {
        id: 63,
        level: 5,
        name: "Das Labyrinth lösen",
        description: "Einmal pro Geschichte kannst du versuchen, einen Black Spiral Dancer davon zu überzeugen, sich von den Schrecken der Herrschaft von Bat zu befreien. Dazu musst du die Person komplett isolieren und einen Test machen (Intelligenz oder Charisma + Einsicht), weit weg vom Einfluss der bösen Geister, die diesen Garou lieber so lassen würden, wie er ist. Wirf einmal pro drei Nächte, in denen du Bats Einfluss brichst; du gewinnst, wenn du eine Anzahl von Erfolgen erzielst, die doppelt so hoch ist wie die Willenskraft der Person. Wie sie auf eine solche Deprogrammierung reagieren oder wie gut sie in einer späteren Gesellschaft funktionieren, ist ein großes Fragezeichen. Wollen sie überhaupt einen neuen Schutzgeist?",
        actions: [],
        isRepeatable: false
      }
    ],
    disadvantages: [],
    specialRules: TraitSpecialRules.None
  },
  {
    id: 14,
    type: "backgrounds",
    name: "Maske",
    description: "Als Leute, die manchmal heimlich oder mit einer gewissen Glaubwürdigkeit arbeiten müssen, finden Garou es echt wichtig, sich mit falschen Identitäten schützen zu können oder sogar komplett „unsichtbar“ zu werden. Standardmäßig (ohne Punkte) braucht ein Werwolf entweder keine Maske, wie zum Beispiel diejenigen, die noch nicht mit dem Gesetz oder anderen Behörden in Konflikt geraten sind, um solche Aufzeichnungen zu generieren, oder er hat einen brauchbaren gefälschten Ausweis, der einer Verkehrskontrolle oder ähnlichen oberflächlichen Überprüfungen standhält. Eine Maske mit null Punkten kann eine Hintergrundüberprüfung nicht bestehen, geschweige denn eine ordnungsgemäße Untersuchung durch die Behörden.",
    advantages: [
      {
        id: 64,
        level: 1,
        name: "Maske 1",
        description: "Du hast eine gute gefälschte Identität, einschließlich Kreditkarte, Bankkonto, Bonitätsauskunft, Geburtsurkunde usw., alles auf den Namen deiner Maske. Du kannst eine Hintergrundüberprüfung auf Landes- oder Provinzebene bestehen.",
        actions: [],
        isRepeatable: true
      },
      {
        id: 65,
        level: 2,
        name: "Maske 2",
        description: "Deine Maske kann eine Hintergrundüberprüfung durch die nationale Polizei bestehen: FBI, Scotland Yard oder so was Ähnliches. Wenn du eine Militär- oder Geheimdienstakte hast, ist die geheim.",
        actions: [],
        isRepeatable: true
      },
      {
        id: 66,
        level: 1,
        name: "Auf Null gesetzt",
        description: "Nur einsetzbar wenn du eine Maske 2 hast. - Jemand in einer hohen Position hat deine echten Unterlagen gelöscht. Du existierst offiziell nicht mehr.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 67,
        level: 1,
        name: "Maskenmacher",
        description: "Nur einsetzbar wenn du eine Maske 2 hast. - Du kannst Masken basteln oder besorgen. Das Basteln einer Maske dauert drei Tage pro Punkt und kann dich online auffliegen lassen; das Besorgen von Masken dauert einen Tag pro Punkt, kostet aber was. Wie viel mt1ch du brauchst, hängt von deinem Einfluss, deiner Marge beim Sozialtest oder was auch immer der Storyteller entscheidet, ab.",
        actions: [],
        isRepeatable: false
      }
    ],
    disadvantages: [
      {
        id: 68,
        level: 1,
        name: "Serieller Fehler",
        description: "Irgendwo hat jemand einen Fehler gemacht, der dir schadet. Deshalb wird jeder, der deine Vergangenheit checkt, erfahren, dass du kürzlich gestorben bist, auf einer Liste als gefährlich stehst oder aus anderen Gründen (zu Unrecht) festgenommen oder bei der Polizei gemeldet werden solltest. (Klar, vielleicht solltest du festgenommen werden, aber nicht aus diesem Grund.) Dieser Fehler gilt auch für alle Datenbankabfragen zu deiner Identität.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 69,
        level: 2,
        name: "Person of Interest",
        description: "Deine biometrischen Daten, dein Name, deine Vergangenheit, bekannte Bekannte und Aliasnamen tauchen in mehreren Datenbanken von Geheimdiensten auf, was dich wahrscheinlich als potenziellen Terroristen kennzeichnet. Jeder Mitarbeiter einer Regierungsbehörde (oder ein vergleichbarer Analyst) kann wahrscheinlich eins und eins zusammenzählen und erkennen, was du vorhast.",
        actions: [],
        isRepeatable: false
      }
    ],
    specialRules: TraitSpecialRules.Mask
  },
  {
    id: 15,
    type: "backgrounds",
    name: "Mentor & Kontrahent",
    description: "Diese Eigenschaft steht für einen einsamen Garou oder sogar ein ganzes Rudel, der/das auf dich aufpasst, indem er/es dir ab und zu Ratschläge, Infos oder Hilfe gibt. Diese Rolle kann jemand übernehmen, der dir geholfen hat, dich in die Bräuche deines Stammes oder deiner Schutzmacht einzuführen, oder jemand, der dich nach deiner ersten Verwandlung vor einem schlimmen Ende bewahrt hat. Oder sie haben vielleicht eine ganz andere Perspektive; vielleicht weißt du gar nicht, dass du einen Mentor hast, wenn er der Typ ist, der aus der Ferne und im Verborgenen für dich eintritt. Die Beziehung kann sogar umstritten oder rein pragmatisch sein. Dein Mentor könnte Informationen zum gegenseitigen Nutzen austauschen oder dir sogar zu Hilfe kommen, wenn du die Beziehung respektiert hast. Ein Mentor mag mächtig sein, aber seine Macht muss nicht direkt sein. Je nach der Anzahl der Punkte in diesem Hintergrund könnte dein Mentor nicht mehr als ein verbitterter alter Mann mit einem bemerkenswerten Informationsnetzwerk sein, oder er könnte eine fast schon legendäre Persönlichkeit der Apokalypse mit enormem Einfluss und Ansehen unter denen sein, die sich um die Moot-Feuer versammeln. Er kann dir Ratschläge geben, in deinem Namen mit einem mächtigen Sept verhandeln, die Strafverfolgungsbehörden von dir fernhalten und wird dich mit ziemlicher Sicherheit warnen, wenn du dich in Situationen begibst, die du nicht verstehst. Ein Mentor kann sogar ein Geist sein, was diese Beziehung von der zu deinem Stammesgeist unterscheidet (obwohl es sich um einen Avatar oder eine geringere Inkarnation handeln könnte). Siehe S. 232 für weitere Infos zur Hierarchie der Geister. Dein Mentor erwartet möglicherweise Gegenseitigkeit oder eine Art Gegenleistung für seine persönliche Investition in dich. Wer auch immer er ist, schreib ihn in deine Beziehungskarte, wenn du ihn kaufst (siehe S. 111). In der Regel geben Mentoren hilfreiche Ratschläge und gelegentlich politische Unterstützung oder Deckung, aber sie kämpfen nicht deine Kämpfe und nehmen keine wertvollen Gefälligkeiten in Anspruch. Wenn sie dies aus eigenem Interesse tun müssen, um dir zu helfen, verlierst du wahrscheinlich einen oder mehrere Punkte dieses Hintergrunds, nachdem du ihren Zorn erregt hast.",
    advantages: [
      {
        id: 70,
        level: 1,
        name: "Mentor 1",
        description: "Ansehen 1 Garou in ihrer bekanntesten Kategorie / jungling",
        actions: [],
        isRepeatable: true
      },
      {
        id: 71,
        level: 2,
        name: "Mentor 2",
        description: "Ansehen 2 Garou in ihrer bekanntesten Kategorie / etabliert",
        actions: [],
        isRepeatable: true
      },
      {
        id: 72,
        level: 3,
        name: "Mentor 3",
        description: "Ansehen 3 Garou in ihrer bekanntesten Kategorie / angesehen",
        actions: [],
        isRepeatable: true
      },
      {
        id: 74,
        level: 4,
        name: "Mentor 4",
        description: "Ansehen 4 Garou in ihrer bekanntesten Kategorie / ehrenwert",
        actions: [],
        isRepeatable: true
      },
      {
        id: 75,
        level: 5,
        name: "Mentor 5",
        description: "Ansehen 5 Garou in ihrer bekanntesten Kategorie / legendär oder weniger bekannte und geheimnisvolle Incarna, die in deinem Namen auf eine Weise handeln, die interpretiert werden muss",
        actions: [],
        isRepeatable: true
      }
    ],
    disadvantages: [
      {
        id: 76,
        level: 1,
        name: "Kontrahent 1",
        description: "Ansehen 1 Garou in ihrer bekanntesten Kategorie / jungling | Kontrahenten liegen 2 Punkte über einem gleichwertigen Mentor",
        actions: [],
        isRepeatable: true
      },
      {
        id: 77,
        level: 2,
        name: "Kontrahent 2",
        description: "Ansehen 2 Garou in ihrer bekanntesten Kategorie / etabliert | Kontrahenten liegen 2 Punkte über einem gleichwertigen Mentor",
        actions: [],
        isRepeatable: true
      },
      {
        id: 78,
        level: 3,
        name: "Kontrahent 3",
        description: "Ansehen 3 Garou in ihrer bekanntesten Kategorie / angesehen | Kontrahenten liegen 2 Punkte über einem gleichwertigen Mentor",
        actions: [],
        isRepeatable: true
      },
      {
        id: 79,
        level: 4,
        name: "Kontrahent 4",
        description: "Ansehen 4 Garou in ihrer bekanntesten Kategorie / ehrenwert | Kontrahenten liegen 2 Punkte über einem gleichwertigen Mentor",
        actions: [],
        isRepeatable: true
      },
      {
        id: 80,
        level: 5,
        name: "Kontrahent 5",
        description: "Ansehen 5 Garou in ihrer bekanntesten Kategorie / legendär oder weniger bekannte und geheimnisvolle Incarna, die in deinem Namen auf eine Weise handeln, die interpretiert werden muss | Kontrahenten liegen 2 Punkte über einem gleichwertigen Mentor",
        actions: [],
        isRepeatable: true
      }
    ],
    specialRules: TraitSpecialRules.None
  },
  {
    id: 16,
    type: "backgrounds",
    name: "Ressourcen",
    description: "Dieser Hintergrund beschreibt eine abstrakte Form von Reichtum oder anderen Vermögenswerten, die du in vielen Situationen zu deinem Vorteil nutzen kannst. Diese Vorteile sind nicht unbedingt finanzieller Natur und selten komplett liquide. (Die World of Darkness-Spiele verwenden nicht viele „Preislisten”, da solche kleinen Details für die Erzählung oft nicht wichtig sind.) Vor allem da das moderne Bankwesen fast vollständig digitalisiert ist, können gut vernetzte Rivalen und übernatürliche Feinde Bankkonten einfrieren oder plündern, sodass Garou ihre Ressourcen als Bargeld, Gold, Kunst, Material oder sogar Schmuggelware horten können. Um diesen Hintergrund zu nutzen, addiere einmal pro Sitzung deinen Ressourcenwert als Bonus zu einem geeigneten Würfelpool. Diese Formel steht für den schnellen Kauf eines Schnellbootes, Verhandlungen oder Bestechung, soll aber nicht Dinge wie „den Kauf eines Unternehmens“ oder „die Finanzierung meiner eigenen verdammten Jägerorganisation“ abbilden. Beispiele sind Manipulation + Ausflüchte + Ressourcen für eine subtile Bestechung, Charisma + Politik + Ressourcen, um eine lokale Wahl zu beeinflussen, Intelligenz + Szenenkenntnisse + Ressourcen für einen bedeutenden Drogeneinkauf usw. Garou zu sein, steht oft im Widerspruch zu einer traditionellen Beschäftigung oder sogar zu Geschäftszeiten. Punkte in Ressourcen bieten dir ein Einkommen, um deinen Lebensstandard aufrechtzuerhalten, aber du musst die Quelle deines Einkommens und die Form dieses Hintergrunds detailliert beschreiben. Schließlich könnte es während der Chronik versiegen, gestohlen werden oder auf andere Weise verschwinden. Beachte auch, dass bei hohen Rängen in Ressourcen der Charakter möglicherweise in die Art von Ausbeutung und Profitgier verwickelt ist, die das Zeitalter der Apokalypse eingeläutet hat, was zumindest zu offensichtlicher Heuchelei und wahrscheinlich zur Feindschaft der Garou führt, die ein Problem mit der Herkunft des Reichtums des Charakters haben.",
    advantages: [
      {
        id: 81,
        level: 1,
        name: "Ressourcen 1",
        description: "Leben von Gehaltsscheck zu Gehaltsscheck",
        actions: [],
        isRepeatable: false
      },
      {
        id: 82,
        level: 2,
        name: "Ressourcen 2",
        description: "Lebensstil der Mittelschicht",
        actions: [],
        isRepeatable: false
      },
      {
        id: 83,
        level: 3,
        name: "Ressourcen 3",
        description: "Lebensstil der Oberschicht",
        actions: [],
        isRepeatable: false
      },
      {
        id: 84,
        level: 4,
        name: "Ressourcen 4",
        description: "Lebensstil der Reichen",
        actions: [],
        isRepeatable: false
      },
      {
        id: 85,
        level: 5,
        name: "Ressourcen 5",
        description: "Lebensstil der Superreichen",
        actions: [],
        isRepeatable: false
      }
    ],
    disadvantages: [
      {
        id: 86,
        level: 1,
        name: "Mittellos",
        description: "Du hast kein Geld und kein Haus.",
        actions: [],
        isRepeatable: false
      }
    ],
    specialRules: TraitSpecialRules.None
  },
  {
    id: 17,
    type: "backgrounds",
    name: "Pakt mit einem Geist",
    description: "Du hast einen Pakt mit einem niederen Geist geschlossen und seine Loyalität gewonnen. Der Geist ist dein Verbündeter und hilft dir nach besten Kräften, wenn du ihn beschwörst, normalerweise mit dem Ritus der Geisterbeschwörung (S. 183). Die genaue Art des Geistes sollte mit dem Spielleiter abgesprochen werden, aber die verschiedenen Geister im Kapitel „Verbündete und Gegner” (S. 239) können einen guten Ausgangspunkt bieten. Die meisten Garou schließen lieber Pakte mit Geistern von Gaia oder Wyld, obwohl einige, wie die Knochenknacker und Glasläufer, auch mit Dienern des Webers Geschäfte machen können. Einige wenige, oft aus den Stämmen des Geisterrats und der Roten Klaue, schließen sogar Pakte mit Banes und anderen Wyrm-Geistern, allerdings sehr vorsichtig und unter strengster Geheimhaltung. Die Art der Hilfe, die du von einem Geist erwarten kannst, hängt vom jeweiligen Geist ab. Gaffiings und die meisten niederen Jagglings haben eine sehr begrenzte Sicht auf die Existenz. Wenn du zum Beispiel einen Tiergeist fragst, was sich nebenan befindet, erhältst du möglicherweise nur Antworten darauf, ob dort etwas Essbares oder Beängstigendes zu finden ist, während ein Maschinengeist nur Informationen über die Wirksamkeit und den Funktionsgrad der dort befindlichen Objekte liefert. Trotzdem haben die meisten Geister ein oder zwei Fähigkeiten oder Fertigkeiten, die nützlich sein können, und sie können immer als Ansprechpartner für die Vermittlung von Gaben in Betracht gezogen werden, sollten sie welche gewähren.",
    advantages: [
      {
        id: 87,
        level: 1,
        name: "Macht 1",
        description: "kleiner Gaffling (kleines Geisterwesen)",
        actions: [],
        isRepeatable: false
      },
      {
        id: 88,
        level: 2,
        name: "Macht 2",
        description: "mittlerer Gaffling (kleines Geisterwesen)",
        actions: [],
        isRepeatable: false
      },
      {
        id: 89,
        level: 3,
        name: "Macht 3",
        description: "großer Gaffling (kleines Geisterwesen) oder niedere Jaggling (selbstbewusstes Geisterwesen)",
        actions: [],
        isRepeatable: false
      },
      {
        id: 90,
        level: 4,
        name: "Macht 4",
        description: "kleiner Jaggling (selbstbewusstes Geisterwesen)",
        actions: [],
        isRepeatable: false
      },
      {
        id: 91,
        level: 5,
        name: "Macht 5",
        description: "mittlerer Jaggling (selbstbewusstes Geisterwesen)",
        actions: [],
        isRepeatable: false
      },
      {
        id: 92,
        level: 1,
        name: "Wirt",
        description: "Der Geist hat einen dauerhaften Wirt, zum Beispiel ein Tier, oder die Fähigkeit, andere wiederkehrende Objekte wie Bäume oder Monitore zu besitzen. Dadurch kann er mit yot1 und allen anderen in der physischen Welt interagieren. (Beachte, dass Geister ohne „Begleiter” trotzdem beschworen werden müssen.)",
        actions: [],
        isRepeatable: false
      },
      {
        id: 93,
        level: 2,
        name: "Begleiter",
        description: "Der Geist kann dich überallhin begleiten, solange du nicht auf spirituelle Schutzzauber oder andere Gegenmaßnahmen stößt. Wenn der Geist keinen physischen Wirt hat (siehe unten), kannst du nur über die Umbra oder durch den Zugang zur Geisterwelt mithilfe der Penumbral-Sinne (siehe S. 147) mit ihm kommunizieren. Bereiche mit einem starken Gauntlet können daher die Kommunikation mit dem Geist unterbrechen, selbst wenn er auf der anderen Seite noch anwesend ist.",
        actions: [],
        isRepeatable: false
      }
    ],
    disadvantages: [
      {
        id: 94,
        level: 1,
        name: "Paktbedingung",
        description: "Dein Pakt hängt davon ab, dass du bestimmte Handlungen machst oder vermeidest, um dafür eine Dienstleistung zu bekommen, wie zum Beispiel, dass ein Feuergeist von dir verlangt, in jedem Gebäude, das du betrittst, eine Kerze anzuzünden, oder dass ein Käfergeist dir verbietet, Insekten absichtlich zu verletzen. Wenn du diese Bedingung nicht einhältst, verärgert das den Geist und er gilt erst dann wieder als Verbündeter, wenn du eine angemessene Buße geleistet hast, wie vom Geschichtenerzähler entschieden.",
        actions: [],
        isRepeatable: true
      }
    ],
    specialRules: TraitSpecialRules.None
  },
  {
    id: 18,
    type: "backgrounds",
    name: "Talisman",
    description: "Du hast was, das andere Garou als wichtig ansehen, egal ob es spirituell, kriegerisch oder sonst irgendwie besonders ist. Beispiele sind ein Klaive, eine Geisterfalle oder ein Meditationsfokus. Manchmal ist ein Talisman genauso eine Belastung wie ein Vorteil, weil neidische Rivalen oder blutrünstige Gegner ihn dir vielleicht wegnehmen wollen. Schau dir den Abschnitt „Talismane” auf S. 188 an, um bestimmte Talismane zu finden, oder arbeite mit dem Geschichtenerzähler zusammen, um einen neuen zu erschaffen.",
    advantages: convertTalismansIntoTraits(talismans),
    disadvantages: [],
    specialRules: TraitSpecialRules.None
  }
];