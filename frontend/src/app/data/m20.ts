import {type IM20Archetype, type IM20Tradition, M20Sphere, M20TraditionType} from "@/@types/m20.ts";
import {type ITraitPack, TraitSpecialRules} from "@/@types/data.ts";

export const archetypes: IM20Archetype[] = [
  {
    id: 1,
    name: `Aktivist`,
    description: `Du bringst eine kaputte Welt wieder in Ordnung.`
  },

  {
    id: 2,
    name: `Wohltäter`,
    description: `Du kannst helfen, und das tust du auch.`
  },

  {
    id: 3,
    name: `Gegensatz`,
    description: `Du kehrst die Reihenfolge um, um tiefere Wahrheiten aufzudecken.`
  },

  {
    id: 4,
    name: `Kreuzritter`,
    description: `Du bist ein Kämpfer an vorderster Front für eine bessere Zukunft.`
  },

  {
    id: 5,
    name: `Hacker`,
    description: `Man verbessert Dinge, indem man sie auseinander nimmt.`
  },

  {
    id: 6,
    name: `Idealist`,
    description: `Eine größere Wahrheit wartet auf uns, und du weißt, was das ist.`
  },

  {
    id: 7,
    name: `Innovator`,
    description: `Deine Fantasie treibt den Fortschritt voran.`
  },

  {
    id: 8,
    name: `Kind`,
    description: `Du bist unschuldig und verspielt und bringst andere dazu, sich um dich zu kümmern.`
  },

  {
    id: 9,
    name: `Einsamer Wolf`,
    description: `Du brauchst sonst niemanden.`
  },

  {
    id: 10,
    name: `Maschine`,
    description: `Schwäche ist was für kleinere Leute.`
  },

  {
    id: 11,
    name: `Verrückter Wissenschaftler`,
    description: `Echte Wissenschaft kennt keine Grenzen!`
  },

  {
    id: 12,
    name: `Märtyrer`,
    description: `Es ist mir eine Freude, dir zu dienen.`
  },

  {
    id: 13,
    name: `Monster`,
    description: `Du bist der unapologetische Schatten im Spiegel deiner Welt.`
  },

  {
    id: 14,
    name: `Prophet`,
    description: `Der Macht die Wahrheit zu sagen, ist dein Lebenswerk.`
  },

  {
    id: 15,
    name: `Abtrünniger`,
    description: `Rebellion ist dein Credo und dein Ruhm.`
  },

  {
    id: 16,
    name: `Sinnlicher Mensch`,
    description: `Das ist dein Ding.`
  },

  {
    id: 17,
    name: `Überlebender`,
    description: `Egal, was passiert, du hältst durch.`
  },

  {
    id: 18,
    name: `Traditionalist`,
    description: `Für dich sind die alten Methoden einfach am besten.`
  },

  {
    id: 19,
    name: `Trickster`,
    description: `Du machst dir die Welt zu deinem Spielzeug.`
  },

  {
    id: 20,
    name: `Visionär`,
    description: `Du siehst über das Offensichtliche hinaus und verfolgst eine größere Vision für uns alle.`
  }
];

export const traditions: IM20Tradition[] = [
  {
    id: 1,
    type: M20TraditionType.Tradition,
    name: `Akashic Brotherhood`,
    description: `Die Akashic Brotherhood, auch bekannt als Akashayana Sangha („Orden des Fahrzeugs von Akasha“) oder einfach nur Akashayana, ist eine Tradition von Magiern, die Meister von Geist, Körper und Seele sind und die Kunst der persönlichen Disziplin verfolgen. Sie glauben, dass Geist, Körper und Seele alle Teil eines größeren Ganzen sind, genauso wie der Mensch Teil des gesamten Universums ist. Mit anderen Worten: Konflikte sind eine Illusion, und dasselbe gilt für Identität und Streitigkeiten. Wenn also Geist und Körper im Einklang sind, folgt ihnen auch die Seele. Indem sie ihren Körper trainieren, schaffen diese Magier einen Tempel für den Geist, der letztendlich zum Verständnis des Geistes führt. Die Bruderschaft nutzt einfache Mittel – Bewegung, Meditation, Übung und Studium –, um den einfachen Menschen zu einem Bruder des Wissens zu machen.`,
    organization: `Die Bruderschaft wird im Grunde von den Kannagara geleitet, das sind klösterliche Asketen der Phoenix-Robe-Sekte. Heutzutage liegt die Macht aber bei den Shi-Ren („wohlwollende Aristokratie“), einer Gruppe politisch aktiver Traditionalisten, die den Einfluss der Akasha in der Weltpolitik ausbauen wollen. Traditionelle Magier im Westen treffen meistens auf Krieger der Vajrapani (spöttisch „Kriegende Fäuste“ genannt) und die vielseitigen Bilderstürmer der Li-Hai, die durch heldenhafte Erfahrungen Erleuchtung suchen.`,
    initiation: `In Tempeln, Ashrams und Dojos auf der ganzen Welt nehmen Sifus (Meister) und Sihings (Adepten) Schüler auf, die offen und ernsthaft sind. Normalerweise unterrichtet jeder Lehrer nur einen Schüler auf einmal. Die Akasha-Lehre sagt, dass jeder seinen eigenen Weg zur Erleuchtung finden muss; deshalb bekommen Akashayana nur wenig Anleitung oder Unterstützung. Viele frustrierte Schüler geben diesen Weg auf; diejenigen, die durchhalten, entwickeln jedoch eine makellose Fitness von Geist, Herz und Körper.`,
    affinitySpheres: [M20Sphere.Mind, M20Sphere.Life],
    focus: `„Magie“ ist eigentlich Selbstvervollkommnung und kosmische Harmonie. Um solche Künste richtig zu meistern, muss man sein Bewusstsein für alles erweitern, seine Gedanken klären, seinen Körper fokussieren und emotionale Verwirrung überwinden. Asiatische Alchemie, Handwerk, Glaube, Yoga, soziale Dominanz und Kampfsporttraining ermöglichen es einem Bruder, Lebensenergie (Chi) für erstaunliche körperliche, geistige und energetische Leistungen zu kanalisieren. Daraus ergeben sich gängige Paradigmen wie „Bringt das Goldene Zeitalter zurück“, „Alles ist Illusion“, „Alles ist gut“ und gelegentlich „Macht ist Recht“.`,
    stereotypes: {
      fellowTraditions: "Die fesselnden Illusionen, die sie sich ausdenken, lenken sie von der Transzendenz ab, die sie eigentlich erreichen wollen.",
      technocracy: "Metallene Drachen in einer stickigen Kiste.",
      disparates: "Verlorene Kinder und kaputte Beziehungen ... aber da steckt mehr dahinter, als man auf den ersten Blick denkt."
    }
  },

  {
    id: 2,
    type: M20TraditionType.Tradition,
    name: `Cult of Ecstasy`,
    description: `Der Cult of Ecstasy (auch bekannt als Sahajiya, ein Begriff, der vom Sanskrit-Wort Sahaja kommt, was wörtlich „spontan“ oder „natürlich“ bedeutet) ist eine Tradition von Magiern und visionären Sehern, die durch heilige Erfahrungen Grenzen und Beschränkungen überwinden. Um das zu erreichen, nutzt der Cult Sachen wie Drogen, Musik und Sex, aber das sind nur Mittel zum Zweck. Das Ziel ist es, einen mentalen Zustand zu erreichen, der über die physische Welt hinausgeht, eine Trance, die es dem Magier ermöglicht, über seine normale Erfahrung hinauszusehen und alle Grenzen zu überschreiten, die die meisten Menschen und Magier einschränken. Die Kultisten verstehen das Wort „Ekstase” in seiner ursprünglichen Bedeutung: ein plötzlicher, intensiver Gefühlsrausch, der den Betroffenen in einen veränderten Zustand versetzt. Es muss kein angenehmes Gefühl sein, aber wenn sie die Wahl haben, bevorzugen die meisten Kultisten definitiv diese Variante. Der Kult der Ekstase bricht Barrieren und selbst auferlegte Grenzen auf, um den Menschen eine überwältigende Erfahrung zu ermöglichen, die ihnen die Augen öffnet.`,
    organization: `Diese Tradition ist locker organisiert und nomadisch und zeigt, dass es ihr vor allem um die persönliche Transzendenz geht. Sie hat mehrere Untergruppen, aber nur wenige echte Anführer. Die Anhänger treffen sich oft auf Festivals, Raves, Konzerten und anderen Treffen, wo sie sich unter die „Schlafwandler” mischen, die zwischen der Sleeper-Kultur und dem vollständigen Erwachen schwanken. Meistens ist dieser Gruppe Einfluss wichtiger als Organisation. Jeder Ekstatiker wird ermutigt, seinem eigenen Weg zu folgen, solange dieser Weg nicht die Heiligkeit anderer Menschen verletzt. Das einzige starre Element auf dem Sahajiya-Weg ist der Kodex von Ananda und seine Betonung des mitfühlenden Respekts. Alles andere ist verhandelbar.`,
    initiation: `Fünf Schritte zur Ekstase: 1: Lass deine Angst los; 2: Konzentrier dich auf deine Absichten; 3. Öffne dich; 4. Bring dich in Einklang; 5: Wiederhol Schritt 1. Um einem neuen Ekstatiker bei Schritt 1 zu helfen, fordert ein Mentor diese Person auf, ihre Ängste zu überwinden und dann ihre Absichten zu nutzen, um zu fliegen, anstatt zu fallen. Diksham – der Pakt zwischen Mentor und Schüler – bietet dem Eingeweihten einen sicheren Raum, um Magie und Kontrolle zu erlernen. Oft werden Mentoren und Schüler zu Liebenden und öffnen einen Kanal der Intimität und des Vertrauens, der über bloßen Sex hinausgeht. Das ist jedoch keine Regel, und Zwang gilt als die schlimmste Sünde, die ein Ekstatiker begehen kann. Nach der Initiation und der ersten Ausbildung zieht sich ein Mentor oft von seinem Schüler zurück und vertraut darauf, dass dieser seinen eigenen Weg findet. Sie gibt Ratschläge oder vermittelt sekundäre Helfer, weigert sich aber, zur Krücke zu werden. Um auf diesem Weg zu wachsen, muss ein Magier seine eigenen Triumphe und Fehler gestalten.`,
    affinitySpheres: [M20Sphere.Time, M20Sphere.Life, M20Sphere.Mind],
    focus: `„Steh dir nicht selbst im Weg“ fasst das ekstatische Paradigma zusammen. Um den Lakashim („göttlichen Puls“) zu berühren, muss man die Türen der Hemmung und Angst aufstoßen. Magie ist die Verbindung zwischen einem fokussierten Geist und dem Lakashim – ein Tanz der Möglichkeiten, geleitet von verrückter Weisheit. Um ihn auszuführen, lenkt ein Ekstatiker die Ojas-Energie (Lebenskraft) mit bewussten, aber flexiblen Absichten. Im Idealfall agiert ein Magier in einem Zustand des Flusses, in dem weder Zeit noch Hemmungen die Lebenskraft blockieren – sich dessen bewusst, was er tut, und doch offen genug, um alles zu tun. Die berüchtigten Substanzen und Stimulanzien des Kultes sollen mentale Türen aufstoßen und Hindernisse auf dem Weg zur Erleuchtung wegblasen. Das ist jedenfalls die Theorie. In Wirklichkeit können dieselben Werkzeuge selbst zu Hindernissen werden. Kluge Ekstatiker wechseln daher ständig ihre Werkzeuge, um Stagnation und Abhängigkeit von „dem gleichen alten Mist” zu vermeiden. Verrückte Weisheit ist der Kern der vielen Praktiken dieser Gruppe, die alles von Gossenmagie, Yoga und Kampfkunst bis hin zu kybernetischer Hypertechnologie umfassen. Zu den Paradigmen gehören daher „Die Schöpfung ist göttlich und lebendig”, „Alles ist Chaos”, „Alles ist gut” und ziemlich oft „Alles ist eine Illusion”.`,
    stereotypes: {
      fellowTraditions: "Ein Haufen verklemmter Akademiker, die oft Angst haben, über die offensichtlichen Grenzen ihrer Fachgebiete hinauszugehen und alles anzunehmen, was jenseits dieser Erwartungen liegen könnte.",
      technocracy: "Die Abscheulichkeiten der menschlichen Natur und die Ursache für fast alles, was heute schief läuft.",
      disparates: "Ich kann echt verstehen, dass sie ihre Freiheit wollen. Schade nur, dass sie dafür fast alles andere aufgegeben haben..."
    }
  },

  {
    id: 3,
    type: M20TraditionType.Tradition,
    name: `Dreamspeakers`,
    description: `Die Dreamspeakers (oder Kha'vadi) sind eine Tradition von Magiern, die Schamanismus betreiben, mit Geistern kommunizieren und als Vermittler zwischen der Welt der Sterblichen und der Geisterwelt fungieren. Es ist eine der vielfältigsten Traditionen, zu der Vertreter der alten Kulturen Afrikas, der amerikanischen Ureinwohner, der Inuit und der australischen Aborigines ebenso gehören wie Anhänger des Shintoismus, unabhängige spirituelle Gelehrte und Nachkommen anderer vergessener Stämme und Zivilisationen. Obwohl sie ursprünglich von den anderen, eurozentrischen Traditionen in eine einzige Gruppe zusammengefasst wurden, haben die unterschiedlichen Kulturen innerhalb der Traumsprecher eine gemeinsame Basis gefunden in ihrem Respekt und ihrem Engagement für das Gleichgewicht zwischen physischer und spiritueller Realität. Da der Gauntlet immer dichter und die Geisterwelt immer gefährlicher geworden ist, sind die Aufgaben der Schamanen immer schwieriger geworden. Aber während andere Magier dazu neigen, spirituelle Angelegenheiten zu übersehen, und die Schlafenden sie ganz vergessen, wurden die Traumsprecher geboren, um einen Mittelweg zu gehen, um zu sehen und zu hören, was andere nicht sehen und hören, und um Rollen zu erfüllen, die in der modernen Welt nach wie vor dringend benötigt werden.`,
    organization: `Auch wenn der schamanische Weg eher ein einsamer ist, können Medizinleute echt gesellig sein. Diese Tradition verbindet also den Respekt vor der Autonomie mit dem unterstützenden Netzwerk eines Stammes. Über Jahrhunderte zogen es viele Traumsprecher vor, ihre eigenen Wege zu gehen; in den letzten Jahren hat sich die Gruppe jedoch wieder dem gemeinschaftsorientierten Fokus vieler vorimperialer Kulturen zugewandt. Schließlich war die Isolation ein Nachteil. Durch stärkere Bindungen untereinander haben die Sprecher mehr Einfluss. In früheren Zeiten trafen sich die Traumsprecher in entlegenen Winkeln der Geisterwelt und bildeten sogar Reiche, in denen die alten Bräuche unberührt blieben. In letzter Zeit haben die Unbroken Folk ihren Fokus aber auf die materielle Welt gerichtet und treffen sich sowohl in ländlichen als auch in städtischen Umgebungen, oft bei Powwows, Hip-Hop-Shows, Blockpartys und neotribalen Festivals. Auch Social-Media-Gruppen bieten Treffpunkte für die neue Generation von Traumsprechern. In allen Fällen hat sich die frühere Einsamkeit zu einer stärkeren sozialen Ausrichtung gewandelt. Trotzdem bleiben die Kha'vadi ausgesprochen informell. Ältere werden von ihren jüngeren Kollegen respektiert, aber jugendliche Energie nährt die Zukunft und verdient ihren eigenen Respekt. Die langatmigen Titel, die vom „Weißen Rat” bevorzugt werden, klingen für den durchschnittlichen Sprecher albern. Taten und Weisheit sagen mehr als Gesetze.`,
    initiation: `Wie seine Tradition überlebt auch ein Traumsprecher den scheinbaren Tod. Zu seiner Initiation gehört ein ritueller (manchmal buchstäblicher) Tod; dieser Übergang bringt den Schamanen in die Geisterwelt, wo er Prüfungen und Herausforderungen gegenübersteht. Wenn er diese Tortur überlebt, wird der Kaimi („Initiierte”) zu einem So-cha („Schüler”) und kehrt mit neuen Erkenntnissen und einer größeren Vision in die Welt der Sterblichen zurück.`,
    affinitySpheres: [M20Sphere.Spirit, M20Sphere.Forces, M20Sphere.Life, M20Sphere.Matter],
    focus: `Medizin, nicht Magie, ist das Herzstück der Traumsprecher-Künste. Ein Avatar ist Howahkan: die geheimnisvolle Stimme, die zu denen spricht, die bereit sind, sie zu hören. Zauberei ist ein egoistischer und letztendlich zerstörerischer Weg, der die Menschen vom guten Weg der Harmonie mit dem Weltgeist wegführt. Um über die Illusionen des sterblichen Lebens hinauszugelangen, muss man auf den Herzschlag der Schöpfung hören, sich dem Tod stellen und offen bleiben für die Stimme, durch die alles Leben spricht. In der Praxis bevorzugen die Sprecher Medizin, Handwerk, Schamanismus, verrückte Weisheit und Glauben. Einige wenige beschäftigen sich mit Kybernetik, Yoga, Voudoun und Hexerei, aber ihre Begleiter meiden sie oft. Zu den gängigen Paradigmen gehören „Eine Welt der Götter und Monster“, „Die Schöpfung ist göttlich und lebendig“, „Bringt das Goldene Zeitalter zurück“ und manchmal „Macht ist Recht“.`,
    stereotypes: {
      fellowTraditions: "Trotz all ihrer tollen Eigenschaften vertraue ich nur denen, denen ich vertrauen muss, sehe nur ganz wenige von ihnen als meine Freunde an und halte die Augen offen für den nächsten unvermeidlichen Reinfall.",
      technocracy: "Die lebendige Essenz der weißen Stute.",
      disparates: "Ich hab das Gefühl, dass hier ein Trick dahintersteckt, und ich glaube, der gefällt mir..."
    }
  },

  {
    id: 4,
    type: M20TraditionType.Tradition,
    name: `Euthanatos`,
    description: `Die Euthanatoi, auch bekannt als die Chakravanti („Volk des Rades“) oder die Niyamavanti („Volk unserer Herrschaft“), sind eine Gruppe von Magiern, die sich voll und ganz den Kräften des Todes, der Wiedergeburt, des Schicksals und des Karmas in der Welt verschrieben haben. Sie sind eine Mischung aus Thanatologen, Nekromanten, Schicksalspriestern, Attentätern, Gelehrten, Spielern und Heilern. Euthanatos-Magier sehen den Tod in der Welt als etwas, das reinigt und Platz für zukünftiges Wachstum schafft. Die meisten glauben an die Reinkarnation der Seelen, was bedeutet, dass der Tod in einem Leben nicht zu fürchten ist und sogar entscheidend für die spirituelle Entwicklung eines Menschen sein kann. Selbst diejenigen, die diesen Glauben nicht teilen, erkennen einen kontinuierlichen Kreislauf von Tod und Wiedergeburt im Laufe des Lebens an und akzeptieren, dass der Tod manchmal notwendig sein kann, um Leiden zu beenden. Diese Magier bewachen den Moment zwischen Leben und Tod. Als ketzerische Reinkarnationisten sehen sie die Schöpfung als ein sich drehendes Rad von Tod und Wiedergeburt. Wenn etwas – oder jemand – die Bewegung des Rades stört, sollte das Hindernis beseitigt werden. Die Methode der Beseitigung kann so einfach wie ein freundliches Wort oder so endgültig wie Mord sein. Am umstrittensten ist, dass viele Euthanatos es als ihre Pflicht ansehen, diesen Kreislauf voranzutreiben und Quellen von Krankheit, Korruption und Elend aus der Welt zu schaffen, um die Drehung des Rades der Zeitalter zu beschleunigen. Das bedeutet, zu beurteilen, wann die moralische Verkommenheit eines Menschen für ihn selbst oder andere zu schädlich geworden ist, um weiterbestehen zu dürfen, und wann es angebracht ist, ihm den guten Tod zu bringen. Euthanatos nehmen diese Verantwortung nicht auf die leichte Schulter und sind sich der Gefahr von Jhor schmerzlich bewusst, aber sie wissen, dass ihre Arbeit notwendig ist und dass sie die Einzigen sind, die sie ausführen können. Für die Euthanatoi ist ihre Aufgabe eine heilige Pflicht, die erfüllt werden muss, aber so anstrengend und schrecklich ist, dass nur die Willensstärksten sie ausführen können. Es ist weniger so, dass sie ein Recht übernehmen, sondern eher eine Last: die Verantwortung für Schmerz, für Befreiung und für Erneuerung.`,
    organization: `Genau wie ihre Verbündeten, die Verbena und Ecstatic, gehen die Chakravanti manchmal einen unheimlichen Weg, den andere Magier oft fürchten und selten verstehen. Trotzdem sind sie unter den Traditionen vielleicht die ethischsten. Ihre riesige Verantwortung verlangt nicht weniger. Der strenge Kodex der Gruppe – der Dharmachakra oder „Achtstrahliges Rad des Gesetzes“ – betont den Kreislauf (Samsara), die Einheit aller Dinge (Advaita), die Akzeptanz der Sterblichkeit (Kala), verantwortungsvolle Vormundschaft (Pravitra), Selbstbeherrschung (Dama), Mitgefühl (Daya), die Vermeidung von Versuchungen (Tapas) und die persönliche Erfahrung von Tod und Wiedergeburt (Punarjanman). Obwohl die Gruppe selbst keine starren Hierarchien kennt, wird von allen Mitgliedern dieser Tradition erwartet, dass sie diesen Kodex kennen und befolgen, sonst droht ihnen der endgültige Tod und der Ausschluss aus dem Rad. Dieser strenge Kodex erfordert starke Bindungen zwischen Mentoren und Initiierten. Obwohl die Todestradition viele verschiedene Sekten umfasst, ist daher die Beziehung zwischen einem Lehrer (Acarya) und seinem Schüler (Chatra) von entscheidender Bedeutung. Der Chatra schwört sowohl seinem Mentor als auch der Tradition als Ganzes einen Vrata („Lebenseid“) ab. Der Bruch dieses Eides bringt nicht nur Schande über den Schüler, sondern auch über den Lehrer ... und zwingt den Acarya, seinen Schüler zur Bestrafung aufzuspüren.  `,
    initiation: `Jeder Thanatoic-Magier macht das Diksha durch: einen rituellen physischen Tod. Wenn er aus den Schattenlanden zurückkommt, macht er eine lange Ausbildung durch, bei der er sich die Niyama merken und die vielen Künste der Heilung, des Schicksals und des Mordes lernen muss. Solche Lehrzeiten können Jahre dauern und beinhalten normalerweise Aufgaben, Prüfungen und Herausforderungen, bei denen der Schüler mit den schrecklichen Folgen seines Weges konfrontiert wird. Ohne dieses Bewusstsein ist ein „Todesmagier” schließlich genau das, was die Leute denken: ein Monster, das alles verkörpert, was diese Tradition zu vernichten geschworen hat.`,
    affinitySpheres: [M20Sphere.Entropy, M20Sphere.Life, M20Sphere.Spirit],
    focus: `Als Meister über Leben, Tod, Schicksal und Glück sehen die Euthanatoi Magie als Teil des Kreislaufs. Indem sie das Rad drehen, kontrollieren diese Magier die Wahrscheinlichkeit und die Kräfte der Sterblichkeit. Dieses Drehen konzentriert sich auf die zyklische Natur der Existenz, und so nutzt ein Chakravat Praktiken und Instrumente wie verrückte Weisheit, Glauben, hohe Rituale, Medizin, Reality Hacking, Kampfkunst, Schamanismus und gelegentlich Voudoun, um diese Energien auf das gewünschte Ziel zu lenken. Yoga hat einen wichtigen Platz in den Künsten dieser Tradition. Göttliche Ordnung und irdisches Chaos sind vielleicht das häufigste Paradigma der Gruppe; andere sind „Alles ist Illusion“, „Die Schöpfung ist göttlich und lebendig“ und sogar, ob du es glaubst oder nicht, „Alles ist gut – habe Vertrauen“.`,
    stereotypes: {
      fellowTraditions: "Die coolste Truppe von Visionären, Außenseitern, Bastarden und Helden, die je auf der Erde gelebt hat und das Ganze auch noch überlebt hat.",
      technocracy: "Schlaue, arrogante Typen, die auf dem Riesenrad einen metallischen Haufen machen.",
      disparates: "Die meisten denken, sie sind tot ... aber tote Sachen kommen manchmal wieder zurück."
    }
  },

  {
    id: 5,
    type: M20TraditionType.Tradition,
    name: `Order of Hermes`,
    description: `Der Orden des Hermes ist einer der Grundpfeiler der Traditionen. Als Bruderschaft während des dunklen Zeitalters hat er einen riesigen Fundus an magischem Wissen und die Geschichte des Okkultismus stark geprägt. Seine Schwächen sind aber genauso groß. In dem elitären Orden herrscht große Hybris, und mit der Abrechnung werden viele ihrer traditionellen Wege infrage gestellt. Alte, sorgfältig gehütete Geheimnisse sind in vielen Fällen für immer verloren, während mystische Gegenstände und mächtige Gönner zerstört oder hinter dem feindlichen Gauntlet weggeschlossen wurden. Die Überlebenden auf der Erde können nur hoffen, sich an ihre Lehren zu erinnern und so viel wie möglich zu lernen. Der Orden wird überleben, aber er wird vielleicht nicht mehr derselbe sein wie früher.`,
    organization: `Der Orden ist streng hierarchisch, diszipliniert und geregelt. Der Kodex des Hermes und seine Peripheral Corrigenda bestimmen das Verhalten, das Protokoll, die Regeln für Certámen-Herausforderungen und die richtigen Inschriften für die Türen der Chantry. Dreizehn Häuser existieren noch immer als Fraktionen in den endlosen, brutalen internen Machtkämpfen des Ordens. Einige Häuser sind älter als die normannische Eroberung (Bonisagus, Flambeau, Quaesitor, Tytalus, Verditius und die Sammelbezeichnung Ex Miscellanea); andere sind jünger, sogar recht neu (Fortunae, Hong Lei, Ngoma, Shaea, Skopos, Solificati und Xaos).`,
    initiation: `Studenten, die aus der Wissenschaft, esoterischen Orden, der Wissenschaft oder dem Militär kommen, müssen eine harte Ausbildung unter einem strengen Mentor (einem Mater oder Pater) überstehen. Der Orden kennt neun Stufen mystischer Weiterentwicklung: Neuling, Zelator, Practicus, Eingeweihter, Eingeweihter Exemptus, Adept, Adept Major, Magister Scholae und Magister Mundi. Das Training zielt darauf ab, bis zum Abschluss der dritten Stufe ein allmähliches Erwachen zu provozieren, das eher einem Prozess als einem einzigen erschütternden Moment gleicht.`,
    affinitySpheres: [M20Sphere.Forces],
    focus: `Ein hermetischer Magier hat die Schlüssel zum Universum in der Hand. Deshalb lernen diese super Gelehrten durch ständiges Studieren und intensives Üben alte und geheimnisvolle Rituale. Hermetiker nutzen Elementarkräfte durch Beschwörungsformeln, Zeichen, Siegel, Utensilien und geheime Sprachen und sind deshalb – aus Notwendigkeit – geheimnisvoll und misstrauisch. Schließlich haben sie enorme Macht, und ihre Rivalen lauern überall. Alchemie, Herrschaft und Hohe Rituale bilden die Kernpraktiken innerhalb der Reihen des Ordens. Kein hermetischer Magier kommt ohne diese Ausbildung aus. Einige Hermetiker ergänzen diesen Kern um Chaosmagie, die Kunst des Verlangens, Hypertech, Handwerkskunst, seltsame Wissenschaft, Yoga und gelegentlich Malficia und verfolgen Paradigmen wie „Ein mechanistischer Kosmos“, „Göttliche Ordnung und irdisches Chaos“, „Macht ist Recht“, „Technologie hat alle Antworten“ und natürlich „Bringt das Goldene Zeitalter zurück“.`,
    stereotypes: {
      fellowTraditions: "Trotz bewährter Praktiken und gelegentlicher Einsichten fehlt es unseren Verbündeten an der nötigen Disziplin, um dauerhafte Macht oder Kontrolle zu erlangen. Trotzdem stehen sie seit Jahrhunderten an unserer Seite und sind daher nach wie vor wertvolle Partner.",
      technocracy: "Am Ende wird nur einer von uns überleben.",
      disparates: "Talentierte Amateure, die sich in ihrer eigenen Trennung verloren haben."
    }
  },

  {
    id: 6,
    type: M20TraditionType.Tradition,
    name: `Sons of Ether`,
    description: `Die Söhne des Äthers (oder „Gesellschaft des Äthers” umbenannt) sind eine Gruppe von Technomagiern, die mit dem Rat der Neun zusammenarbeiten. Früher waren sie Teil des Ordens der Vernunft und der Technokratie, aber nachdem die Union dabei half, den leuchtenden Äther aus dem Konsens zu verbannen, haben sie ihre alten Kumpels im Stich gelassen. Seitdem haben die Söhne ein paar veraltete Technologien übernommen und in ihr Paradigma eingebaut. Der Schlüssel zum Paradigma der Söhne ist die Wissenschaft (das Wort wird immer großgeschrieben, um es von der Wissenschaft der Schläfer zu unterscheiden). Exotische Theorien über Orgonfelder, Hyperverbrennungskammern und ätherische Übertragungsmatrizen ermöglichen es den Ätheriten, noch seltsamere und wunderbarere Geräte zu erschaffen. Ihre Wissenschaft hat fast immer einen barocken Charakter, als wäre sie den Seiten von Groschenromanen oder viktorianischer Science-Fiction entsprungen – Todesstrahlen, aus Messing gefertigte und mit Uhrwerken angetriebene Roboter-Diener und fantastische Weltraum- oder Wasserfahrzeuge kommen einem in den Sinn, wenn andere über die Söhne des Äthers sprechen. Die Söhne des Äthers betrachten die Wissenschaft der Technokratie mit Verachtung und verabscheuen ihre statische Sichtweise auf die Natur der Dinge. Wissenschaftliche Praktiken sind keine vorhersehbaren Mechanismen, die in nahezu unendlicher Geschwindigkeit neu kombiniert werden können, sondern ein dynamischer und chaotischer Prozess. Wie das Kitab Al-Alacir lehrt: Alles ist wahr. Alles ist möglich. Die Söhne glauben, dass die Sphären eigentlich verschiedene Aspekte des Äthers sind: Korrespondenz ist der zusammenhängende Äther, Entropie beschreibt die Dynamik des Äthers, Kräfte sind die energetische Physik des Äthers, Leben ist ätherische Biologie, Materie ist ätherische Chemie und Technik, Geist ist noetische Wissenschaft, Prime ist metaphysischer Äther, Geist beschreibt die ätherischen und memetischen Dimensionen und Zeit ist das Studium der Kausalität. Alle Söhne des Äthers arbeiten daran, den wahren Äther, die legendäre zehnte Sphäre, zu berühren.`,
    organization: `Etheriten reden zwar viel über die Gesellschaft, sind aber oft streitlustig und wetteifernd. Gemeinschaft ist für sie ein Weg, um Anerkennung zu bekommen; Kritik spornt sie nur an, zurück ins Labor zu gehen und es beim nächsten Mal besser zu machen. Auch wenn viele Etheriten sich wochenlang in die Forschung stürzen und kaum Kontakt zu anderen haben, suchen sie irgendwann doch die Gesellschaft ihrer Kollegen, egal wie sehr sie in ihre Arbeit vertieft sind.`,
    initiation: `Potenzielle Etheriten werden meistens von echten Wissenschaftlern ausgewählt, wenn sie Anzeichen oder Beweise für verstecktes Genie zeigen. Diese potenziellen Neulinge müssen einen Test machen, der sie dazu bringt, sich mit den Auswirkungen ihrer Ideen auseinanderzusetzen. Meistens muss der angehende Wissenschaftler selbst eine Kopie des Kitab-al-Alacir finden, dessen Ideen oft dazu dienen, den Funken für größere und bessere Errungenschaften in der Zukunft zu entfachen.`,
    affinitySpheres: [M20Sphere.Matter, M20Sphere.Forces, M20Sphere.Prime],
    focus: `Wissenschaft! Oder genauer gesagt, ein fantasievolles Verständnis der Naturgesetze, das durch bewährte physikalische und energetische Technologien umgesetzt wird. Diese Technomanten sind bodenständiger als ihre Kollegen, die virtuellen Adepten, und setzen lieber auf Wissenschaft, die man sehen, anfassen, zeigen und sogar mit bloßem Auge bestätigen kann. Deshalb ist die Wissenschaft der Ätheriten auffällig, romantisch und elegant futuristisch, auch wenn diese Zukunft eher wie klassische Science-Fiction als wie banale wissenschaftliche Fakten aussieht. In der Praxis kann ein Etherit alles verwenden, was zu funktionieren scheint. Die meisten Wissenschaftler bevorzugen jedoch herrlich esoterische Variationen von Alchemie, Handwerkskunst, Kybernetik, Hypertech, Reality Hacking und natürlich seltsamer Wissenschaft. Paradigmen konzentrieren sich weitgehend auf Konzepte wie „Ein mechanistischer Kosmos“, „Alles ist Daten“, „Macht ist Recht“ und „Alles ist eine Illusion“, aber sie laufen in der Regel darauf hinaus, dass „Technologie alle Antworten hat“.`,
    stereotypes: {
      fellowTraditions: "Faszinierende Verbündete, denke ich ... aber sie nennen uns verrückt?",
      technocracy: "Das ist echt uncool für die Wissenschaft, weil es das Staunen in Kontrolle verwandelt.",
      disparates: "Fußzerrer. Aber echt mysteriöse Fußzerrer. Auf jeden Fall einen genaueren Blick wert..."
    }
  },

  {
    id: 7,
    type: M20TraditionType.Tradition,
    name: `Verbena`,
    description: `Die Verbena ist eine Tradition von Magiern in der Welt der Dunkelheit, die sich der Bewahrung der alten Künste und Weisheiten verschrieben hat, die über die Jahrhunderte von Hexen und Zauberern, Druiden und Druidinnen, Schamanen, Mystikern sowie Priestern und Priesterinnen der Alten Götter weitergegeben wurden. Obwohl die modernen Verbena einige Ähnlichkeiten mit den Wiccans haben, sind sie die Erben weitaus älterer Traditionen aus unterschiedlichen Kulturen aus aller Welt. Ungeachtet ihrer vielen unterschiedlichen Glaubensrichtungen und Bräuche teilen die Verbena viele gemeinsame Prinzipien. Dazu gehören ein tiefer Respekt vor der Erde und der natürlichen Ordnung, eine ganzheitliche Sichtweise auf die Menschen und die Welt als untrennbar miteinander verbunden und der Glaube, dass Macht und Verständnis gefunden werden können, indem man das Leben mit all seinen Leidenschaften und Schmerzen annimmt. Von allen Traditionen sind die Verbena vielleicht am stärksten von den Veränderungen herausgefordert, die der technologische Fortschritt und die expandierenden Zivilisationen mit sich bringen. Jedes Mitglied muss einen Weg finden, die Lehren und Praktiken der alten Wege auf die moderne Welt anzuwenden, oder es wird sowohl von Magiern als auch von Sterblichen lediglich als Randfigur einer aussterbenden Kunst angesehen.`,
    organization: `Covens – oft 13, neun, sieben oder drei Mitglieder stark – bilden die Basis dieser Gruppe. Es gibt auch Einzelgänger, aber die meisten Mitglieder dieser Tradition arbeiten lieber in Gruppen. Frauen sind wahrscheinlich insgesamt in der Überzahl und werden hier mehr respektiert als in den meisten anderen Gruppen. Viele weibliche Magier fühlen sich aus diesem Grund zu dieser Tradition hingezogen. Zwei Anführer (die die Rollen von Priester und Priesterin übernehmen, wobei beide männlich, weiblich oder transgender sein können) leiten die größeren Coven, während eine einzelne Hexe für Dreiergruppen verantwortlich ist. Coven bevorzugen eher ältere Mitglieder gegenüber jüngeren, und Coven der alten Schule können ziemlich autokratisch sein. Obwohl Streitigkeiten oft durch Abstimmungen gelöst werden, können diese Abstimmungen Prüfungen, Tests oder Kämpfe beinhalten. Diese Tradition respektiert starke Blutlinien. Deshalb folgen Verbena-Zirkel, wann immer möglich, der Familienlinie. Jeder Zirkel hat einen Hain, auch wenn dieser Hain ein Garten im Hinterhof des Anführers sein kann. Achtmal im Jahr gibt's große Treffen, während der beiden Tagundnachtgleichen, der beiden Sonnenwenden und an Imbolc (2. Februar), Beltane (1. Mai), Lammas (1. August) und Samhain (31. Oktober). Viele Verbenae versammeln sich auch zu Weihnachten (25. Dezember) und am 1. Juli, vor allem weil Klimawandel und kulturelle Veränderungen die Unterscheidung zwischen den Jahreszeiten der Natur verwischen.`,
    initiation: `Neulinge bei den Verbena machen ein Ritual durch, bei dem sie sterben und wiedergeboren werden. Eine intensive Zeit mit Lernen, Prüfungen und Meditation endet in einer stressigen Prüfung – manchmal nur vorgetäuscht, oft echt. Wenn die Mitglieder des Zirkels von der Zuverlässigkeit und Hingabe des Neulings überzeugt sind, rufen sie die Elemente als Zeugen. Wie schon in den Zeiten der Hexenverfolgung bleiben die meisten Verbenae bis zum Tod treu.`,
    affinitySpheres: [M20Sphere.Life, M20Sphere.Forces],
    focus: `Verbena -Künste konzentrieren sich darauf, mit wenig viel zu erreichen. Ihre Werkzeuge sind sowohl praktisch als auch symbolisch und ihre Verwendung reicht bis in die Antike zurück. Diese Magie ist im wahrsten Sinne des Wortes „heidnisch“ und tief mit der Natur verbunden. Gestaltwandlung, Transformation, Heilung und Verletzung, Wahrsagerei, Reinigung, Wachstum und Verwelken, natürliche Zyklen und die tückischen Wege des Schicksals sind die Spezialgebiete der Hexen. Für alle Verbenae ist die Schöpfung göttlich und lebendig. Weil die Schöpfung, das Leben und die Göttlichkeit nicht besonders nett sind, gehören zu den anderen gängigen Verbena-Paradigmen „Eine Welt der Götter und Monster“, „Macht ist Recht“, „Bringt das Goldene Zeitalter zurück“ und „Alles ist Chaos“. Hexerei ist die Kernpraxis der Gruppe, wobei bestimmte Personen Voudoun, Herrschaft, seltsame Wissenschaft, Chaosmagie, Yoga, Kampfkunst, Hohe Rituale, Kybernetik, die Kunst des Verlangens, Handwerkskunst, Medizin und sogar organische Hypertechnologie bevorzugen.`,
    stereotypes: {
      fellowTraditions: "Wir sind Geschwister – wir zanken uns, sind dysfunktional, hassen uns oft abgrundtief... aber wir machen jeden fertig, der sich mit uns anlegt. Einer für alle, in guten wie in schlechten Zeiten.",
      technocracy: "Ganz einfach, sie sind eine Krankheit.",
      disparates: "In den neuen Zeiten der Verbrennungen fürchte ich, dass sie verbrannt wurden."
    }
  },

  {
    id: 8,
    type: M20TraditionType.Tradition,
    name: `Virtual Adepts`,
    description: `Die Virtuellen Adepten (auch bekannt als die Merkurianische Elite) sind die jüngsten Mitglieder der Traditionen. Die Adepten konzentrieren sich auf das digitale Netz und suchen nach einem Weg, um die Singularität zu erreichen, den Punkt, an dem die Menschheit zu etwas Posthumanem werden kann. Das Paradigma der Virtuellen Adepten ist eines der schwierigeren Konzepte, weil viele der im Spiel vorkommenden Begründungen theoretische Physik und komplexe Mathematik beinhalten, aber auch, weil es eine Sichtweise auf die Realität erfordert, die den meisten fremd ist. Im Mittelpunkt ihrer Magie steht die Idee der Information als metaphysischer Bestandteil der Existenz. Es gibt Informationen, die alle Objekte, Menschen, Orte und Ideen beschreiben; wenn man die Informationen verändert, verändert man die Realität. Nach der Sichtweise der Virtual Adepts auf das Universum existieren die Informationen für alle Dinge in Raum und Zeit im Korrespondenzpunkt. Magie wird dann ausgeübt, indem sie ihr Bewusstsein in den virtuellen Raum senken, um diese Informationen wahrzunehmen, und sie dann durch Willenskraft verändern. So einfach ist das aber nicht. Die VAs wissen, dass der Kosmos ein unglaublich komplexes System ist, das Gesetze und Mathematik beinhaltet, die das Verständnis des menschlichen Verstandes übersteigen. Man kann die Realität nicht mit roher Gewalt verändern, genauso wenig wie man einen Automotor durch Treten starten kann. Um Informationen so zu verändern, dass Magie wirkt, muss man verstehen, wie diese Daten verarbeitet werden, und komplexe Berechnungen durchführen, um festzustellen, welche genauen Änderungen erforderlich sind.`,
    organization: `Adepten sind Anarchisten, die Leistung echt schätzen. Sie meiden normale Organisationen und können konventionelle Hierarchien nicht ausstehen. In den 90ern war Respekt bei ihnen eine Frage der Elite: eine Art Anerkennung unter Gleichgesinnten, die man durch seine Einstellung und Leistung bekam. Auch wenn sich diese Tradition seitdem weiterentwickelt und verändert hat, sind es immer noch die persönlichen Leistungen eines Adepten – und nicht Titel oder Dienstalter –, die in dieser Gruppe echt wichtig sind. Klugheit, Witz, technologische Kreativität und ein ausgeprägtes Gespür für soziologische Reformen sind wichtiger als ein cooler Spitzname oder ein cooles Online-Symbol. Adepten, die unterdrückerische soziale Strukturen abbauen, wird besondere Ehrfurcht entgegengebracht ... und diejenigen, die solche Strukturen in der realen Welt oder in der Online-Welt unterstützen, werden heftig verachtet.`,
    initiation: `Virtuelle Adepten haben einen sozial ziemlich harten Initiationsprozess. Die Idee von körperlicher Entbehrung, Meister-Lehrling-Herausforderungen oder meditativen spirituellen Suchen kommt ihnen total absurd vor. Stattdessen geben Adepten ihren Anwärtern und Initiierten meist kryptische Missionen, um autoritäre Strukturen zu sabotieren, geheime Daten zu klauen und lustige Streiche zu spielen, die korrupte Typen untergraben und aufgeblasene Schwätzer bloßstellen. An einem kritischen Punkt wird die Initiantin sich selbst überlassen; eine angemessen einfallsreiche (und hoffentlich stilvolle) Lösung des Problems bringt ihr die Anerkennung ihrer Kollegen und einen Platz unter den Adepten ein. Kurz gesagt, die meisten Adepten treten der Gruppe durch die große Internet-Tradition des Trollings bei.`,
    affinitySpheres: [M20Sphere.Correspondence, M20Sphere.Forces],
    focus: `Alles ist Daten. In diesem mechanistischen Kosmos dreht sich also jedes Tool oder jede Praxis, die ein Adept einsetzt, darum, Infos zu formen, zu verändern, zu manipulieren, zu sammeln, zu speichern, zu sortieren, zu beeinflussen oder zu zerstören. Diese Werkzeuge reichen von offensichtlicher Computerausrüstung (die der herkömmlichen Technologie um Generationen voraus ist), Clouds, Hologrammen, Implantaten, Nanotechnologie, Energy-Drinks und sinnesverändernden Reizen bis hin zu dezent schicken dunklen Hoodies, von Mangas beeinflussten Frisuren, modischer Androgynität und provokativen Masken. Alle Adepten halten ihre technomagischen Werkzeuge jedoch griffbereit. Für viele Adepten sind Computer ein wichtigerer Teil ihrer Identität als Kleidung oder Accessoires. Die persönlichen Geräte eines Adepten sind fast immer die am stärksten individualisierten und stilisierten Elemente seines Outfits. Als vielleicht versierteste Reality-Hacker, die es gibt, nutzt diese Merkurianische Elite auch verschiedene Formen der Kybernetik, Hypertech, seltsame Wissenschaft, Kampfkünste, Chaosmagie, Guttermagie und manchmal Schamanismus, Voudoun, verrückte Weisheit oder Hexerei mit technologischem Flair.`,
    stereotypes: {
      fellowTraditions: "Geister in der Maschine – laut, launisch, verdammt alt, aber trotzdem eindringlich. Sie können uns so viel beibringen und müssen selbst noch so viel lernen.",
      technocracy: "Wir kämpfen um die Herzen dieser Welt ... und der nächsten. Also, respektiert die Verbündeten, aber macht keine Gefangenen.",
      disparates: "*singend* Ich weiß ein Geheimnis..."
    }
  },

  {
    id: 9,
    type: M20TraditionType.Tradition,
    name: `Celestial Chorus`,
    description: `Der Celestial Chorus ist eine Gruppe von Magiern, die sich zusammengetan haben, um das Göttliche zu berühren und an den Einen und Ursprung zu glauben, von dem alles kommt. Der Eine ist eng mit dem Gott der abrahamitischen Religionen verbunden (auch wenn seine Überzeugungen eigentlich vom alten ägyptischen monotheistischen Gott Aton kommen) und steht für die Quelle aller Schöpfung, die als Teil des Einen angesehen wird. Vor allem Menschen tragen Teile des Göttlichen in sich, auch wenn es viele Namen hat: die göttliche Flamme, die Seele, der Avatar. Der Himmlische Chor glaubt, dass es diese Verbindung ist, die es ihnen ermöglicht, das Lied des Einen klar zu hören und die Schöpfung zu formen. Obwohl ihr Glaube im Wesentlichen monotheistisch ist, wird akzeptiert, dass das Göttliche viele Facetten hat und durch eine Vielzahl von Namen, Religionen und Glaubensbekenntnissen ausgedrückt werden kann. Anhänger vieler Glaubensrichtungen und Konfessionen (einschließlich einer Vielzahl von moderaten Polytheisten) kommen zusammen, um den Einen zu verehren und ihm zu dienen, und akzeptieren, dass jeder Mensch seinen eigenen Weg zum Einen hat. Natürlich ist dieses Ideal noch in Arbeit, und die Geschichte der Sänger ist geprägt von Spaltungen und Kompromissen, heiligen Kriegen und Märtyrern, Opfern und Erneuerung.`,
    organization: `Der Chorus ist seit der römischen Republik hierarchisch aufgebaut und wird von seiner Curia geleitet, einer 17-köpfigen Versammlung aus Kanzlern und Finanzbeamten, Tribunen, Notaren und Liturgiebeauftragten. Der angesehenste (oder am besten vernetzte) Kanzler hat die zeremonielle Position des Pontifex Maximus inne. Jeder Kanzler hat ein Team von Exarchen, manchmal auch Bischöfe genannt, unter sich. Die Exarchen leiten die lokalen Führer, die Presbyter (Priester oder Älteste) genannt werden und das menschliche Gesicht dieser Tradition sind.`,
    initiation: `Presbyter suchen neue Leute über soziale Aktivitäten in Kirchenorganisationen. Manche Gläubige werden durch starke religiöse Erlebnisse, vor allem solche mit Musik, spontan erweckt. Jeder neue Lehrling, oder Katechumene, bekommt eine strenge Ausbildung von einem erfahrenen Magier, einem sogenannten Præcept. Wie bei vielen religiösen Ausbildungen geht es dabei um Glaubensfragen, persönliche Disziplin und – klar – jede Menge Gesangsunterricht.`,
    affinitySpheres: [M20Sphere.Prime, M20Sphere.Forces, M20Sphere.Spirit],
    focus: `Die Künste kommen nicht von persönlichen Errungenschaften oder Absichten, sondern von Glauben, Einheit und Harmonie mit dem göttlichen Willen. Singen – vor allem viele Stimmen, die sich zu einer Harmonie vereinen – ist das älteste und wichtigste Instrument dieser Tradition. Die Magie der Chorsänger zeigt sich oft in Licht, Feuer, Wärme, harmonischen Schwingungen und erhabener Musik. Glaube und hohe Rituale sind das Herzstück der Praktiken des Celestial Chorus, daher gehören zu den Paradigmen der Gruppe „Die Schöpfung ist göttlich und lebendig“, „Göttliche Ordnung und irdisches Chaos“ und natürlich „Alles ist gut – hab Vertrauen“.`,
    stereotypes: {
      fellowTraditions: "„Das Haus meines Vaters hat viele Räume.“ Auch wenn ich vielleicht nicht alle verstehe … vielleicht sogar, Gott vergib mir, einige hasse … entscheide ich mich dafür, daran zu denken, dass wir alle göttliche Gnade bekommen.",
      technocracy: "Verräter an der Anmut, die die Welt mit mechanischer Kakophonie einsperren.",
      disparates: "Verlorene Seelen, alle miteinander."
    }
  },
  {
    id: 10,
    type: M20TraditionType.Technocracy,
    name: `Iteration X`,
    description: `Iteration X ist eine der fünf Konventionen der Technokratie und beschäftigt sich mit anorganischen Wissenschaften wie Physik, Technik und Kybernetik. Die Iteratoren stehen voll hinter dem Motto „Stärker, schneller, besser”. Iteration X ist hauptsächlich auf Kräfte spezialisiert und vielleicht am besten für ihre Fähigkeiten in Kybernetik, Informatik und Robotik bekannt. Das übergeordnete Ziel der Konvention ist es aber, bessere Werkzeuge zu entwickeln, um der Menschheit zu helfen. Die Clockwork Convention sagt, dass sie danach streben, den Menschen nachzueifern, die als Erste das Feuer und das Rad entdeckt haben und damit die Menschheit zu neuen Höhen geführt haben.`,
    organization: `Iteratoren nutzen Befehlsketten, die Missionen mit mathematischer Präzision festlegen. Im Idealfall arbeiten die Agenten und ihre Konvention wie Teile einer großen Maschine zusammen und lassen ihre Eigenständigkeit und ihr Ego beiseite. Sowohl von Agenten als auch von Vorgesetzten wird erwartet,  dass sie ihr Bestes geben und sich, wenn nötig, für das Allgemeinwohl opfern . Unter den unteren Rängen arbeiten sozial konditionierte Iteratoren ausschließlich miteinander, verfeinern ihre Teamarbeit und beweisen ihren Wert. Erfolgreiche Agenten erlangen nach und nach freien Willen, größeres Vertrauen, Upgrades, Verbesserungen und konventionsübergreifende Aufgaben, die effiziente Flexibilität belohnen. Erfahrene Iteratoren lernen, ihre Vorgesetzten zu kritisieren und in Frage zu stellen, aber auch, bis zum richtigen Moment zu warten, um dies zu tun . Für die meisten Iteratoren sind Grauzonen inakzeptabel; stattdessen wird jede Handlung zu einer binären Entscheidung, die schnell als Erfolg oder Misserfolg bewertet wird. Wiederholte Misserfolge verurteilen einen Iterator dazu, als Teil einer geistlosen Maschine zu dienen. Die niedrigsten Ränge sind kaum mehr als Werkzeuge, und ein mächtiger Cyborg, der seine Ressourcen nicht verwalten kann,  muss vorübergehend seine Autonomie an ein effizienteres externes Management abgeben.`,
    initiation: `Ausgeklügelte Berechnungen (also zeitbasierte Verfahren) helfen den Rekrutierern von Iteration X dabei, geeignete Leute zu finden, bevor diese die Erleuchtung erreichen. Soldaten, Wissenschaftler, Mathematiker, Philosophen und sogar Leute mit schweren körperlichen Behinderungen sind alle geeignet, solange sie eine wichtige Rolle in einem größeren Ganzen annehmen können. Bisher sind erweckte Rekruten selten, aber sie können sozial konditioniert werden, um die Assimilation zu akzeptieren. Sobald ein potenzieller Anwärter von den ablenkenden Unvollkommenheiten der Massen entfernt wurde, beginnt ein komplizierter Prozess der Indoktrination, der mit einer Operation beginnt, bei der die Gehirnaktivität des Anwärters auf ein optimales Niveau gebracht wird.   Zuvor erweckte Rekruten sind selten, aber sie können sozial konditioniert werden, um die Assimilation zu akzeptieren. Sobald ein potenzieller Initiand aus den ablenkenden Unvollkommenheiten der Massen entfernt wurde, formt ein komplexer Prozess aus Indoktrination, Chirurgie und Verbesserung jeden Iterator zu einem effektiven und oft erleuchteten Agenten.  Gescheiterte Experimente werden derweil in Kamrads und Ciphers umgewandelt, wodurch eine Armee von gehorsamen Arbeitern und Soldaten entsteht, die gemeinsam auf programmierte Ziele hinarbeiten.`,
    affinitySpheres: [M20Sphere.Forces, M20Sphere.Matter, M20Sphere.Time],
    focus: `Der Kern der Wissenschaft von Iteration X kommt von der Synergie zwischen organischen, mechanischen, sozialen, mathematischen und psychologischen Elementen. Also bilden Kybernetik, Handwerkskunst und Hypertech die Basis für die Praktiken dieser Gruppe. Innovative Iteratoren nutzen Kampfsport, soziale Dominanz, Hyperökonomie und Reality Hacking – schließlich muss auch Perfektion flexibel sein! Einige glauben sogar fast religiös an das ultimative Potenzial der Maschine; heutzutage sprechen sie jedoch nicht mehr oft darüber. Ein mechanistischer Kosmos stellt das offensichtliche Paradigma für Iteration X dar. Es ist klar, dass die Technik alle Antworten bereithält. Mathematisch orientierte Mitglieder dieser Konvention versichern ihren Kameraden, dass alles Daten sind. Diese Gruppe hat keine Verwendung für „unscharfe” Paradigmen, daher ist die Sphäre der dimensionalen Wissenschaft eine äußerst seltene Disziplin in ihren Reihen.`,
    stereotypes: {
      fellowTraditions: "Da ihnen unser Streben nach Perfektion fehlt, geben sie ihr Bestes. Trotzdem wäre unsere Union effizienter,  wenn unsere Genossen unsere Erfolge anstelle ihrer eigenen Grenzen übernehmen würden.",
      technocracy: "Kräfte des visionären Chaos, die dazu bestimmt sind, ersetzt zu werden.",
      disparates: "Traurige Überbleibsel primitiver Evolutionsstadien. Die Menschheit hat ihre Art bereits hinter sich gelassen."
    }
  },

  {
    id: 11,
    type: M20TraditionType.Technocracy,
    name: `New World Order`,
    description: `Die New World Order, oft abgekürzt als N.W.O., ist die Geheimdienstorganisation innerhalb der Technokratie, die sich dafür einsetzt, Informationen im Einklang mit dem kollektiven Willen der Massen zu formen und zu lenken. Die New World Order ist für einen Großteil der Verarbeitung von Reality Deviants und die Förderung der Ziele des Time Table verantwortlich. Es gibt „Dinge, die der Mensch nicht wissen sollte”. Deine Aufgabe ist es, die Menschen davon abzuhalten, von den Dingen zu erfahren, die die Menschheit zerstören könnten. Du hältst diese Fiktion aufrecht, nicht weil du grausam bist oder weil du ein Feind der Wahrheit bist, sondern weil diese Dinge der gesamten Gesellschaft schaden könnten. Es ist viel besser, wenn die Massen stattdessen an deine Wahrheit (mit großem „T”) glauben. Das ist sicherer, einfacher und das Beste daran ist, dass es, wenn genug Menschen es akzeptieren, genauso gut real sein könnte. Jage Dinge, die nicht sein sollten, lösche Verstöße gegen deine Wahrheit, erziehe diejenigen, die zu stur oder zu dumm sind, um sie zu akzeptieren. Vor allem aber denk daran, dass du es zu ihrem eigenen Besten tust. Jeder hat Potenzial und ist es wert, gerettet zu werden.`,
    organization: `Im Einklang mit dieser dreigliedrigen Strategie nutzt die NWO drei Hauptmethoden, um ihre Ziele zu erreichen. Die operative Gruppe schickt Agenten – meistens die Black Suits, aber auch weniger auffällige Agenten – vor Ort, um Bedrohungen zu bekämpfen und Informationen zu sammeln. Der Ivory Tower kümmert sich um die Verwaltung und Umsetzung in der gesamten Technokratie und verbreitet kontrollierte Wahrheiten über die Sleeper-Akademiker. Währenddessen sammeln die Beobachter Informationen und verbreiten gleichzeitig Botschaften der Kontrolle und Selbstzufriedenheit unter den Massen, um Chaos und Dissens zu minimieren. Alle drei Behörden berichten an hochrangige Vorgesetzte, die die Operationen aus sicherer Entfernung leiten. Zwei weitere Methoden – die Q-Division und der Feed – unterstützen die anderen Operationen. Technisch gesehen  ist die Q Division eine konventionsübergreifende Einrichtung, die die Ausrüstung für technokratische Agenten (NWO und andere) bereitstellt, während der Feed die wachsende Macht des Internets und seiner vielen sozialen Technologien bewertet und lenkt. Innerhalb aller NWO-Abteilungen spiegelt eine aufsteigende Rangordnung (Black Suits/ Gray Suits/ White Suits) wider, was der Orden`,
    initiation: `Durch die Überprüfung standardisierter akademischer und beruflicher Tests, das Durchsuchen von Datenbanken und die Koordination verdeckter Überwachungsmaßnahmen wählt der Elfenbeinturm potenzielle Rekruten aus. Im Allgemeinen stirbt ein neuer Rekrut seinem alten Leben ab und beginnt ein neues Leben als NWO-Auszubildender. Andere Rekruten werden aus den Reihen der Feinde der Union durch die ausgeklügelten sozialen Konditionierungstechniken des Ordens konvertiert. Da diese Taktiken sehr ressourcenintensiv sein können, verstärkt die NWO ihre Reihen mit Klonen: unaufgeklärte Konstrukte, die darauf trainiert sind, im Einklang zu handeln, mit einem telepathischen Schwarmbewusstsein ausgestattet sind und chemisch so verändert wurden, dass sie sich nach dem Tod auflösen. Selbstverständlich unterzieht die NWO ihre Agenten je nach individueller Leistung und ihrer Rolle im Einsatz unterschiedlichen Graden der Indoktrination und sozialen Konditionierung.`,
    affinitySpheres: [M20Sphere.Mind, M20Sphere.Correspondence],
    focus: `In einer Welt voller Götter und Monster ist Macht alles und Technik hat alle Antworten drauf. Soziale Herrschaft und die Kontrolle über das Bewusstsein – also der Einfluss, die Nutzung, die Programmierung und die Neuprogrammierung des Geistes des Homo sapiens – bilden die Basis der Techniken dieser Neuen Weltordnung .   Zu diesem Zweck sind psychisches Training, Informationsmanipulation, Wahrnehmungskonditionierung und symbolische Verbindungen (wie ein Mann, der einen formellen schwarzen Anzug trägt und ein Abzeichen bei sich hat) die wichtigsten Werkzeuge für die Verfahren der NWO. Physische Medien bilden die zweite Ebene der Manipulation, während die dritte und brutalste Ebene – Gewalt – durch Waffen, Rüstungen, Gadgets, Hypertech-Fahrzeuge, fortschrittliche Waffen und das Kampfsporttraining, das alle Agenten erhalten, kanalisiert wird. Parano   Physische Medien bilden die zweite Ebene der Manipulation, während die dritte und brutalste Ebene – Gewalt – durch Waffen, Rüstungen, Gadgets, Hypertech-Fahrzeuge, fortschrittliche Waffen und das Kampfsporttraining, das alle Agenten erhalten, kanalisiert wird. Paranoia ist jedoch die stärkste Waffe der Ordnung. Wenn die Menschen glauben,  dass man etwas tun kann, verzerrt ihr Glaube schließlich die Realität zu Ihren Gunsten, noch bevor Sie überhaupt zu handeln beginnen.`,
    stereotypes: {
      fellowTraditions: "Wir wissen, was sie so treiben; sie machen ihren Job... sonst gibt's Ärger.",
      technocracy: "Ein vielversprechendes Feld potenzieller Rekruten, das von giftigen Ideologien und zerstörerischen Tendenzen vergiftet ist. Wenn möglich, bekehrt sie, sonst vernichtet sie.",
      disparates: "Die hartnäckigen Erben primitiver Kulturen. Konvertiert sie oder vernichtet sie, wenn nötig."
    }
  },

  {
    id: 12,
    type: M20TraditionType.Technocracy,
    name: `Progenitors`,
    description: `Die Progenitors sind Ärzte und Mediziner innerhalb der Technokratie, die sich den Biowissenschaften verschrieben haben. Als Meister der Sphäre des Lebens nutzen sie die Werkzeuge der Genmanipulation, hochmoderne Operationstechniken und ausgefeilte Medikamente, um die Grenzen der Medizin immer weiter zu verschieben. Manchmal arbeiten sie eng mit Iteration X zusammen, vor allem in den Bereichen Cybertechnologie und künstliche Körperteile. Die Stärksten müssen überleben. Die Evolution hat uns gelehrt, dass ein besser angepasster Organismus immer einen weniger geeigneten verdrängt. Der Unterschied zwischen Neandertalern und Menschen war winzig. Die Neandertaler stellten Werkzeuge her, hatten eine komplexe soziale Struktur und sogar eine Sprache. Aber die Großhirnrinde unserer Vorfahren war einfach ein bisschen effizienter. Wie viele Neandertaler hast du in letzter Zeit auf der Erde gesehen? Jetzt haben wir die Macht, Menschen besser anzupassen, fitter zu machen und damit ihre Überlebenschancen zu erhöhen. Es liegt an uns, diese Macht weise einzusetzen, um der Menschheit die Unsterblichkeit, Perfektion und Einheit zu schenken, die sie braucht. Das Leben selbst ist unser Zuständigkeitsbereich. Alles, was wächst, verändert sich und betrachtet das Universum mit Staunen. Unter den Technokraten sind die Progenitors vielleicht die vehementesten Gegner der Reality Deviants. Unter Berufung auf New-Age-Heilmethoden, Homöopathie, Holistik und andere Aberglauben sehen die Progenitors in ihnen eine Gefahr nicht nur für die gesamte Menschheit, da sie die Massen lehren, sich auf die Kräfte elitärer Magier und Scharlatane zu verlassen, anstatt auf verständliche Kräfte, die für alle zugänglich sein sollten – und auch sein werden.`,
    organization: `Mit all ihren verschiedenen Methoden (Pharmakopöisten, Geningenieure, FACADE-Ingenieure und die fachübergreifende Schadensbegrenzung) folgt diese Konvention einer akademischen Hierarchie. Nicht aufgeklärte Helfer (Hausmeister, Laborassistenten, Rezeptionisten) unterstützen die aufsteigenden Kapitel Fünf: Aufstiegskrieger 191 Ränge von Studenten, wissenschaftlichen Mitarbeitern, Hauptforschern, Forschungsdirektoren und den mysteriösen Verwaltungsangestellten. Eine skrupellose, aber unaufgeklärte Gruppe von Feld- und Straßenagenten (unterstützt durch die deutlich fähigeren Klone, Konstrukte, Sieger, biomodifizierten Agenten und bestialischen Projekte der Konvention) sorgt bei Bedarf für die nötige Muskelkraft. Die vielseitigsten Progenitor-Agenten lernen Techniken und Verfahren aus all diesen Disziplinen und entwickeln so ein beeindruckendes Arsenal an wissenschaftlichem Wissen. Der Aufstieg in diesen Rängen erfordert ständiges Lernen, Forschen und Innovation. Die Studenten müssen viele Prüf Die vielseitigsten Progenitor-Agenten lernen Techniken und Verfahren aus all diesen Disziplinen und entwickeln so ein beeindruckendes Arsenal an wissenschaftlichen Kenntnissen. Der Aufstieg durch diese Ränge erfordert ständiges Lernen, Forschen und Innovationen. Studenten müssen viele Prüfungen bestehen und schließlich eine Abschlussarbeit vorlegen und verteidigen, die ihre Beherrschung der erleuchteten Wissenschaft Erfolg bedeutet Beförderung in immer höhere Ebenen, in denen die verschiedenen Wissenschaftler um Stipendien und Ressourcen konkurrieren. Die Forscher verbringen viel Zeit damit, mit Teams anderer Agenten zusammenzuarbeiten, um ihre Loyalität und Nützlichkeit für die Technokratie zu beweisen. Wie zu erwarten ist, könnten sie für ihr Versagen sterben, wenn sie keine erfolgreichen Ergebnisse für die Union veröffentlichen können.`,
    initiation: `Diese Konvention sucht lieber potenzielle Rekruten, bevor sie erwacht sind. In Zusammenarbeit mit dem Elfenbeinturm analysieren die Vorgesetzten von Progenitor standardisierte Tests und durchsuchen Datenbanken, um kluge Wissenschaftler mit vielversprechendem Potenzial zu finden. (Die Rekrutierung von Progenitoren nach ihrem Erwachen ist schwieriger ... aber die Union bietet Antworten für unruhige Gemüter.) Vielversprechende Rekruten werden vor dem Medizinstudium ausgewählt,  mit Stipendien gefördert und bekommen die Chance auf etwas mehr. Wenn eine Rekrutin zusagt, bekommt sie eine Ausbildung, die weit über das hinausgeht, was die Massen bieten können; wenn sie ablehnt, wird die ganze Sache aus ihrem Gedächtnis gelöscht und sie hat einfach ein schlechtes Quartal, geprägt von vagen Erinnerungen und dem Gefühl, etwas Großartiges verpasst zu haben . Im schlimmsten Fall nimmt die Studentin eine Überdosis Freizeitdrogen oder begeht aus Stress Selbstmord. Die Progenitoren hassen es, gutes Material zu verschwenden, aber das Leben ist nicht immer fair.`,
    affinitySpheres: [M20Sphere.Life, M20Sphere.Entropy, M20Sphere.Mind],
    focus: `Die komplexen Rätsel und das Potenzial des organischen Lebens bilden die Grundlage der Progenitor-Techniken. Auf dieser Basis kann ein einzelner Progenitor eine Vielzahl von Innovationen entwickeln. Obwohl spezifische Anwendungen wissenschaftlich begründet sein müssen (siehe „Warte – ich kann das erklären!“ im Kasten „WISSENSCHAFT!!!“ in Kapitel 6, S. 290 Obwohl bestimmte Anwendungen wissenschaftlich vertretbar sein müssen (siehe „Warte – ich kann das erklären!“ im Kapitel Sechs, Randbemerkung WISSENSCHAFT!!!, S. 290), nutzen die Progenitoren eine verwirrende Vielfalt an Theorien und Verfahren. Allerdings brauchen diese seltsamen wissenschaftlichen Techniken normalerweise ein gut ausgestattetes Labor und komplizierte, oft zeitaufwändige Arbeit. Jedes Werkzeug, das ein Heiler, Wissenschaftler oder Naturforscher verwenden würde, kann in den geschickten Händen eines ausgebildeten Technokraten wundersame Ergebnisse erzielen,  aber die Progenitoren brauchen in der Regel Zeit und Raum, um ihre Wunder zu vollbringen. Für bestimmte Evolutionisten gilt das Paradigma „Macht ist Recht“ . Die meisten Progenitoren bevorzugen jedoch den agnostischen Ansatz der Gaia-Hypothese in Bezug auf das Göttliche und Lebendige der Schöpfung. Kybernetik verschmilzt mit einem hypertechnologischen Ansatz in der Medizin, und die eklektischen Methoden der Konvention wirken oft wie Weird Science nach den Maßstäben anderer Konventionen.`,
    stereotypes: {
      fellowTraditions: "Die starken rechten Arme unserer Körperwissenschaft.",
      technocracy: "Ein mit Schlamm beschmiertes Rudel evolutionärer Fehlschläge.",
      disparates: "Anscheinend und zum Glück ausgestorben."
    }
  },

  {
    id: 13,
    type: M20TraditionType.Technocracy,
    name: `Syndicate`,
    description: `Das Syndikat, ein politischer Block, der sich zu einer Konvention entwickelt hat, ist eine der am meisten gehassten Konventionen, sogar innerhalb der Technokratie. Sie kontrollieren den Geldfluss und den Handel sowohl unter den Massen als auch innerhalb der Union. Das macht sie ziemlich unbeliebt und sie werden oft für vermeintliche Mängel verantwortlich gemacht. Das Syndikat weiß aber, dass es der Klebstoff ist, der die Union zusammenhält, und dass die Technokratie ohne sie nicht funktionieren könnte. Geld regiert die Welt – das ist das Hauptmotto des Syndikats. Beim Syndikat geht es um den allmächtigen Gewinn, aber der Gewinn ist folgender: Die Massen wollen eine konsensuelle Realität, in der sie mitbestimmen können, was passiert. Die Union hat den Massen genau das gegeben, was sie wollten, und das Syndikat macht das auch heute noch so. Abgesehen von der Propaganda der Traditionalisten will der normale Mensch nicht für das Erwachen kämpfen. Die Massen wollen was Einfaches: Sie wollen leben. Was das Syndikat den Massen verkauft, ist Kontrolle – ein stabiles System, in dem sie ohne Angst ihre Ziele verfolgen können.  Sie können ihre Nische finden und arbeiten, ihre Familien großziehen und ihren Mitmenschen ihren ganzen Wert zur Verfügung stellen. Bei dieser Kontrolle geht es um Vertrauen: in die Regierung, in Unternehmen, in Banken und auch in sich selbst. Sie müssen nur ihre Kreativität annehmen, und das Syndikat übernimmt die harte Arbeit, sie für sie zu verkaufen. Das Syndikat glaubt an die Menschheit. Es sieht den absoluten Wert und die Würde jedes Menschen auf diesem Planeten.  Jeder hat seinen Platz in der Bilanz. Jeder CEO braucht einen Vorstand. Jeder Manager braucht ein Team. Auch wenn sie nicht an die Erleuchtung für alle glauben, will das Syndikat trotzdem Vorreiter für Fortschritt und Wohlstand sein. Sie schaffen ein System, in dem jeder die Chance hat, erfolgreich zu sein, in dem jeder auf sein Bankkonto, sein Haus und sein Auto schauen und sagen kann, dass er sich das mit seiner Arbeit verdient hat.`,
    organization: `Das Syndikat ist wie ein Unternehmen aufgebaut (oder vielleicht ist es umgekehrt ...) und hat eine Pyramidenstruktur. An der Spitze stehen ein CEO und 10 Vizepräsidenten (VPOs), die den Vorstand leiten. Von dort aus sind die verschiedenen Vorsitzenden (oder Visionäre) dem Vorstand unterstellt und überwachen jedes Konstrukt und Symposium.  Manager sind diesen Vorsitzenden unterstellt, und Associates (oder „Magic Men“) sind den Managern unterstellt. Diese Associates bilden die unterste Ebene der nicht erleuchteten Syndikat-Operationen, während Provider (auch bekannt als „Our Friends“ oder einfach „Staples“) die niedrigsten Aufgaben übernehmen und den Großteil der Routinearbeiten am unteren Ende der Pyramide erledigen. Die Mitglieder des Syndikats sind in der Regel nicht öffentlich bekannt, da sie oft in verschiedenen Rollen innerhalb des Syndikats tätig sind. Das Syndikat ist in der Regel nicht öffentlich bekannt, da seine Mitglieder oft in verschiedenen Rollen innerhalb des Syndikats tätig sind.`,
    initiation: `Talent, harte Arbeit, fleißige Fantasie und die Fähigkeit, hart zu verhandeln, sind das A und O in dieser Konvention. Die Rekruten kommen oft aus Büros oder Business Schools, wo Talentsucher nach aufstrebenden Stars Ausschau halten ... vor allem nach solchen, die hoch verschuldet, unglaublich talentiert oder beides sind. Nach einer Reihe von Vorstellungsgesprächen wird der angehende Rekrut getestet, als Provider eingestellt und auf rücksichtsloses Geschick und persönliche Verantwortung vorbereitet. Wenn eine potenzielle Mitarbeiterin zeigt, dass sie das Geld kontrolliert, anstatt sich vom Geld kontrollieren zu lassen, wird sie in die Leitungsabteilung befördert. Dort lernt sie die Geheimnisse des Verlangens und die Mittel zur Manipulation der Realität kennen.`,
    affinitySpheres: [M20Sphere.Entropy, M20Sphere.Mind, M20Sphere.Prime],
    focus: `Ars Cupiditae, die Kunst der Begierde, ist das Herzstück der Syndikat-Methodik. Diese Techniken wurden im Mittelalter von der Hohen Gilde weiterentwickelt und konzentrieren sich auf Selbstbeherrschung und Sozialpsychologie. Im Grunde genommen trainiert der Praktizierende seinen Körper und Geist, verfeinert Beziehungstechniken und baut um sich herum ein Reich auf,  das er nach und nach zu einem Imperium subtiler, aber überzeugender Einflussnahme ausbaut. Außer in den verzweifeltsten Situationen greift ein Vertreter des Syndikats nie zu vulgären Methoden; selbst dann werden bei diesen Anpassungen Hightech-Waffen, Kampfsportarten oder andere stilvolle technologische Methoden eingesetzt. Meistens manipuliert ein Syndikatsmitglied Menschen und Systeme mit subtilen, aber effektiven Anstößen – Telefonanrufen,  Bestechungsgeldern, Händeschütteln, Parfüms, Verführungen, Power-Lunches,  PowerPoint-Präsentationen, Hyperökonomie,  sozialer Dominanz und so weiter –, die andere Menschen dazu bringen,  den Abzug zu betätigen, während das Mitglied die Gewinne zusammenrechnet. In der Welt des Syndikats ist Macht Recht; ohne sie ist die Zivilisation,  wie wir sie kennen, auf einer Einbahnstraße ins Verderben.`,
    stereotypes: {
      fellowTraditions: "Wir haben ein super Team, solange die wissen, wo ihr Brot herkommt, und vergessen, wer das Messer hat.",
      technocracy: "Manche Spieler wissen einfach nicht, wann sie ihre Karten ablegen und nach Hause gehen sollten. Wenn das heißt, dass sie alles verlieren müssen,  dann ist das eben so.",
      disparates: "Mit roter Tinte auf dem Huf sind sie wie obdachlose Säufer, die mit halb geladenen 45ern in deinem Casino rumlaufen. Kurz gesagt, sie sind so pleite, dass sie gefährlich sind."
    }
  },

  {
    id: 14,
    type: M20TraditionType.Technocracy,
    name: `Void Engineers`,
    description: `Die Void Engineers sind Entdecker, die sich der Erforschung der Geheimnisse des Weltraums verschrieben haben. Der Platz der Menschheit ist unter den Sternen. Die Erde ist nicht nur viel zu klein, sondern sie stirbt auch, schaut euch nur um, dann könnt ihr das sehen. Umweltverschmutzung, Kriminalität, Krieg: Die Gesellschaft zerreißt sich selbst und reißt unsere Welt mit sich. Das macht nichts, denn wir haben die Herrlichkeit des Universums gesehen. Die Menschheit (oder zumindest der bessere Teil davon) kann sich dort niederlassen, wo wir schon waren. Wir haben schon einfache Raketentechnologie für die Massen freigegeben; bald werden wir auch alltägliche Versionen unserer Deep Universe-Schiffe fördern. Wenn sich Menschen auf einem Dutzend Welten niedergelassen haben, werden die Probleme der Erde nicht mehr so wichtig sein. Was werden wir dann tun? Wir waren schon immer Entdecker. Noch bevor unsere Arbeit zur Besiedlung der nahen Welten abgeschlossen ist, werden wir wieder fort sein und die Grenzen des Wissens erweitern. Wir hoffen, dass ein Teil der Massen uns begleiten wird, denn Einheit liegt im Suchen.`,
    organization: `Besonders nach der Dimensionsanomalie haben die Gruppen der Void Engineers militärische Ränge: Techniker, Marines und Kadetten sind die unterste Stufe, von der aus man zu Enforcers (die die Grenzen bewachen),  Explorers (die neue Gebiete erkunden), Investigators (die wissenschaftliche Untersuchungen durchführen) oder Researchers (die neue Technologien entwickeln) aufsteigen kann. Höherrangige Leute innerhalb dieser Ebenen übernehmen das Kommando über einzelne Einheiten. Auf der höchsten Ebene kümmert sich eine Reihe von Koordinatoren um die logistischen und administrativen Aufgaben und überwacht die Konvention als Ganzes. (Hinweis: In einem Avatar Storm-Metaplot ändert sich diese Konvention drastisch; Details findest du im Convention Book: Void Engineers .)`,
    initiation: `Die Ingenieure suchen Leute aus der Spitzenforschung, Technikfreaks, die ein Auge für unkonventionelle Anwendungen der Wissenschaft haben, und Leute,  die von den Kürzungen im Wissenschaftsprogramm enttäuscht sind. Sie bringen ihre Kadetten zu speziell entwickelten Trainings- und Forschungseinrichtungen außerhalb der Welt. Ab diesem Zeitpunkt gilt eine Kadettin als eingeweiht, egal ob sie jemals die Erleuchtung erreicht – sie hat zu viel gesehen, um jemals wieder als gewöhnlich angesehen zu werden.`,
    affinitySpheres: [M20Sphere.Spirit, M20Sphere.Correspondence, M20Sphere.Forces],
    focus: `Wie jeder Ingenieur weiß, hat nur die Technik alle Antworten in einer Welt voller Götter und Monster. Ohne eine festgelegte Ordnung ist alles Chaos. Deshalb verbindet sich Hypertech mit Kybernetik, Handwerkskunst, kosmischem Reality Hacking und einer formalisierten Art von verrückter Wissenschaft. Verblüffende Quantenphysik und die Maschinen, die geschaffen wurden, um diese Physik zu kanalisieren, bilden den Kern des Glaubens der Wanderer. Zu diesem Zweck passen sie außerirdische Technologien und bereinigte Versionen alter spiritueller Künste an, die durch Versöhnungstheorien integriert werden, die diese Ideen und Energien mit wissenschaftlichen Methoden verbinden. In den Reichen jenseits der begrenzten Realitätssphäre der Erde haben die Technologien der Void Engineers die ganze Raffinesse eines Science-Fiction-Films mit großem Budget .  Blaster gleiten aus Holstern, Power-Rüstungen werden unverzichtbar und titanische Universal-Fluggeräte (also Raumschiffe) sind an der Tagesordnung.`,
    stereotypes: {
      fellowTraditions: "Eine zerbrochene Gruppe nützlicher Verbündeter, die man führen, beschwichtigen, fürchten, ignorieren und manchmal auch vernichten muss, wenn es nötig ist.",
      technocracy: "Eine unberechenbare Bande kosmischer Gesindel, deren Streiche die Menschheit mehr gefährdet haben als alle aufstrebenden Nephandi zusammen.",
      disparates: "Die letzten Überbleibsel von quasi ausgestorbenen Primitiven. Echt traurig. Ihre Blütezeit ist schon seit Jahrhunderten vorbei, und trotzdem tun sie immer noch so, als würden sie in zusammenhängenden Sätzen reden."
    }
  },

  {
    id: 15,
    type: M20TraditionType.Disparate,
    name: `Ahl-i-Batin`,
    description: `Die Ahl al'adl wa 'l-tawhad – auch bekannt als Ahl-i-Batin oder Batini – sind eine Gruppe arabischer Magier, die sich hauptsächlich mit subtiler Magie beschäftigen. Als ehemalige Inhaber des Sitzes der Korrespondenz und Gründungsmitglieder des Rates der Neun haben sie ihre Mitgliedschaft Anfang des 20. Jahrhunderts aufgegeben, um sich auf die Pflege des Netzes des Glaubens und den Schutz des Nahen Ostens vor dem Ansturm der Technokraten zu konzentrieren.`,
    organization: `Einheit entsteht aus Struktur; deshalb legen die Batini Wert auf Ordnung in ihrer Organisation. Es gibt fünf Khanate in verschiedenen Teilen der Welt, jedes wird von einem Meister geleitet, der als Qtub oder „Pol“ bezeichnet wird. Jedes Khanat besteht aus etwa einem Dutzend Kabalen, die sich aus ein paar Murshids, mehreren Murids und 10 bis 20 Eingeweihten zusammensetzen Murshid, der Qtub oder „Pol“ genannt wird. Jedes Khanat besteht aus etwa einem Dutzend Kabalen, die sich aus einigen Murshids, mehreren Murids und 10 bis 20 Eingeweihten zusammensetzen. Jede Kabale weiß, dass es die anderen gibt,  aber sie haben selten Kontakt zu anderen Ahl-i-Batin außerhalb ihres unmittelbaren Kreises.`,
    initiation: `Um dieser Sekte beizutreten, braucht man viel Geheimhaltung und Geduld. Oft wird eine Kandidatin für die Initiation jahrelang beobachtet, bevor sie von einem Murid angesprochen wird. Wenn die Kandidatin Interesse an den Ahl-i-Batin zeigt, durchläuft sie einen langsamen und stetigen Prozess, in dem sie sich von der Welt (und den damit verbundenen Besitztümern und Luxusgütern) löst und strenge Askese praktiziert. Diese sukzessive Beseitigung von Ablenkungen und Versuchungen trennt die Initiantin von ihrem Ego und ihren Anhaftungen und bereitet sie darauf vor, die größere Freiheit der Einheit anzunehmen.  Diese sukzessive Entfernung von Ablenkungen und Versuchungen trennt die Initiierte von ihrem Ego und ihren Anhaftungen und bereitet sie darauf vor, die größere Freiheit der Einheit anzunehmen.`,
    affinitySpheres: [M20Sphere.Correspondence, M20Sphere.Mind],
    focus: `Wie ihr Name schon sagt, sind die Batini eher zurückhaltend. Der Spruch „Hinterlasse keine Spuren“ ist für alles, was sie machen, echt wichtig. Eine Batini-Magierin verbringt oft Wochen, Monate oder sogar Jahre damit, eine Situation zu beobachten, zu überdenken und zu kontemplieren, bevor sie schließlich ihre Künste einsetzt, um die Dinge in die gewünschte Richtung zu lenken. Der Glaube ist ein wesentlicher Bestandteil der Batini-Praktiken, mit einem zentralen Glauben an die göttliche Ordnung und das irdische Chaos. Einige Batini behaupten, dass alles gut ist, andere sind der düsteren Überzeugung, dass alles eine Illusion ist. Verrückte Weisheit, Alchemie und hohe rituelle Magie behalten ihren traditionellen Platz in den Batini-Künsten, während Yoga, Gutter Magick, Reality Hacking und sogar Chaosmagie in den Praktiken bestimmter Anhänger auftauchen. Trotz ihrer mystischen Scharfsinnigkeit können Batini die Entropiekünste überhaupt nicht erlernen. Dieser mystische blinde Fleck wirft ein interessantes Rätsel auf: Wenn alle Dinge vereint sind, dann hat sicherlich auch der Verfall einen Platz in dieser heiligen Ordnung? Das ist eine Frage, die die Sekte noch nicht beantwortet hat.`,
    stereotypes: {
      fellowTraditions: "Vielleicht kann Unity mit unterschiedlichen Stimmen klarer sprechen als mit den üblichen!",
      technocracy: "Durchdrungen von nephandischer Verderbnis. Jetzt müssen wir mehr denn je ihre Hülle knacken und ihr Gift beseitigen.",
      disparates: "Sie weigern sich, die Verbindungen zwischen allen Dingen zu sehen, die uns zu einem Ganzen machen, und trotzdem halten sie sich für Experten in allen mystischen Fragen!"
    }
  },

  {
    id: 16,
    type: M20TraditionType.Disparate,
    name: `Bata'a`,
    description: `Die Anhänger von Voudun, Santería, Candomblé, Obeah, Hoodoo und anderen afro-karibischen Religionen, die Bata'a, waren mal ein eigenständiger Zirkel, dessen Mitgliederzahl mit der einiger Traditionen mithalten konnte. Ihr Einfluss in Haiti und New Orleans war besonders stark, obwohl sie nicht zwischen Mitgliedern unterschieden, die wahre Magie praktizierten, und anderen, die Zauberei oder Wahren Glauben praktizierten oder mit den Eshu und Nunnehi blutsverwandt waren. Da sie kein Interesse am Ascension War hatten, behielten die Bata'a ihre Position bis zum 20. Jahrhundert, als die Technokratie ihre Pogrome verstärkte. Da ihre Kultur und ihre Heimat bedroht waren, schlossen sich die überlebenden Bata'a größtenteils den Dreamspeakers, Verbena und anderen an, da sie den Tod ihres Glaubens als notwendigen Schritt für ihre Wiedergeburt als Mitglieder der Traditionen betrachteten.`,
    organization: `Die Bata'a sind eine bewusst lockere Gruppe, die meist lokal unterwegs sind und nur wenige Titel haben, außer mae-de-santos (Mutter Heilige) und pae-de-santos (Vater Heiliger), die beide an angesehene Mitglieder vergeben werden. Weil die Bata'a keinen Unterschied zwischen Heckenzauberern und echten Magiern machen, hat die Gruppe eine riesige Anzahl von Mitgliedern aus verwandten Glaubensrichtungen auf der ganzen Welt. Ronde des Ames – die „Kette der Seelen“ – verbindet alle  lokalen Verbindungen zu einem spirituellen Netzwerk; verbunden durch Klatsch, Geistboten und – heutzutage – Telefonanrufe und das Internet, verbreiten diese Verbindungen Informationen, Rituale und Neuigkeiten.  Zu Beginn des 21. Jahrhunderts unterstützt die Kette einen wachsenden politischen Aktivismus. Obwohl sich die Bata'a einst auf die sieben Rangi („Farben“ oder Familien) und lokale Marassas (männlich-weibliche Partnerschaften, die die Vater- und Mutterfiguren einer bestimmten Gruppe repräsentieren) konzentrierten, verfolgt die Sekte nun eine einheitlichere globale Agenda.  Vor allem  seit der technokratischen Säuberung und der schrecklichen Tempéte – dem Avatar-Sturm – erkennen die Bata'a jetzt, dass Spaltung das Aus bedeutet ... oder, wie die Geschichte gezeigt hat, sogar noch Schlimmeres.`,
    initiation: `Um für die Mitgliedschaft in Frage zu kommen, muss man wirklich den Loa ergeben sein. Der Kandidat muss ein bekanntes Mitglied der Bata'a aufsuchen und ihn um Unterweisung bitten. Sehr oft, vor allem bei weißen Schülern, wird dieser Wunsch nur erfüllt, wenn der angehende Initiierte Verbindungen oder Empfehlungen von seriösen Quellen hat.  Sobald sie angenommen ist, verspricht die Kandidatin, ein Jahr lang all ihre Zeit und ihr Geld für den Dienst an ihrem Lehrer und dem Handwerk zu opfern. Am Ende dieser Zeit wird sie, wenn sie Talent, Hingabe und gesunden Menschenverstand zeigt, zur Hounsis (Initiierten) und beginnt,  über Les Invisibles zu lernen, was zu ihrer ersten Besessenheit führt. Nach einer langen Zeit der Abgeschiedenheit mit Gebeten, Fasten und Reinigung bekommt die Initiantin eine starke Mischung aus Alkohol und halluzinogenen Kräutern und wird den Les Mysteres ausgeliefert. Wenn sie überlebt, wird sie zur Bata'a.  Nach einer  langen Zeit der Abgeschiedenheit, geprägt von Gebeten, Fasten und Reinigung, bekommt die Initiantin eine starke Mischung aus Alkohol und halluzinogenen Kräutern und wird der Gnade von Les Mysteres überlassen. Wenn sie das überlebt, wird sie Bata'a.`,
    affinitySpheres: [M20Sphere.Spirit, M20Sphere.Life],
    focus: `Basierend auf der großartigen Verbindung zwischen Körper und Geist braucht man für die Bata'a-Künste zwei Sachen: ein Ritual, bei dem man Legba, den Wächter der Kreuzungen, anruft, und einen Ritus, der einen Trancezustand auslöst und Verbindungen zwischen Geist, Körper und Seele herstellt. Manchmal kann ein Praktizierender auch ein Gris-Gris machen: einen Gegenstand, der von einem Loa gesegnet und mit seiner Energie erfüllt ist. Solche Sachen benutzt man nur in echten Notfällen und wenn die Zeit knapp ist. Der Glaube ist das Herz dieser unsichtbaren Familie, mit gemeinsamen Paradigmen wie „Die Schöpfung lebt“, „Alles ist Chaos“ und „Diese Welt der Götter und Monster braucht gute Freunde“. Die Bata'a-Künste sind ein Teil der afrikanisch-karib Solche Gegenstände werden nur in Fällen von äußerster Dringlichkeit und begrenzter Zeit verwendet. Der Glaube ist das Herzstück dieser unsichtbaren Familie, mit gemeinsamen Paradigmen, die darauf bestehen, dass die Schöpfung lebendig ist, alles Chaos ist und diese Welt der Götter und Monster gute Freunde und willige Verbündete erfordert. Voudoun, Glaube, Medizin, Handwerk, hohe Rituale und verrückte Weisheit bilden den Kern der Praktiken innerhalb der Bata'a. Einige Mitglieder mögen auch Gutter Magick, Schamanismus, seltsame Wissenschaft, Herrschaft, Maleficia und verschiedene Kampfkünste. Man arbeitet mit dem, was gerade da ist. Solange die Geister respektvoll behandelt werden,  kann sich eine Praktizierende auf ihre Hilfe verlassen .`,
    stereotypes: {
      fellowTraditions: "Unsere Verbündeten wissen, wie schwer es ist, wenn jemand mit dem Stiefel auf deinem Kopf steht. Trotzdem würden zu viele von ihnen selbst zu Eroberern werden, wenn sie könnten … und einige von ihnen waren schon mal Eroberer. Im Moment ist es ein nützliches Bündnis, aber ich glaube nicht, dass es lange hält.",
      technocracy: "Neue Ketten, immer noch die gleichen Sklavenhalter.",
      disparates: "Nützliche Verbündete, aber zu sehr auf ihre eigenen Interessen fixiert, um für uns zuverlässige Freunde zu sein."
    }
  },

  {
    id: 17,
    type: M20TraditionType.Disparate,
    name: `Children of Knowledge`,
    description: `Die Solificati, auch bekannt als die Children of Knowledge (neben vielen anderen Namen), sind eine Gruppe von Magiern, die als Gründungsmitglieder sowohl des Ordens der Vernunft als auch des Rates der neun mystischen Traditionen bekannt sind. Ihre Zeit in beiden Fraktionen beträgt zusammen nur 15 Jahre. Während viele getrennte Wege gingen, schlossen sich einige von ihnen wieder zusammen und nannten sich „Children of Knowledge”, in der Hoffnung, ihre Herkunft als Solificati zu verbergen. Seitdem leben sie zurückgezogen, sind aus Angst vor Vergeltungsmaßnahmen geheimnisvoll und halten sich aus dem Konflikt zwischen den Traditionen und der heutigen Technokratischen Union raus. Da die Zeit aber gegen sie arbeitet, mussten sie sich bald entscheiden, auf welcher Seite sie stehen, oder untergehen.[1] Heute Abend beanspruchen zwei Gruppen den Titel der Solificati für sich: die, die mit dem Haus Solificati des Ordens des Hermes verbunden sind, und die, die mit den Disparates verbunden sind.[2]`,
    organization: `Wie schon seit der Gründung der Gruppe treffen sich die Solificati am liebsten in kleinen Gruppen, die sich um ein oder zwei Meisteralchemisten, zwei oder drei Adepten und eine Handvoll potenzieller Lehrlinge drehen. Die Meister legen die  Agenda für das Studium und die Aktivitäten fest, die Adepten verfeinern den Prozess und die Lehrlinge lernen durch Praxis, Versuch und Irrtum. Akademisches Studium ist entscheidend und Geheimhaltung noch wichtiger. Angesichts ihrer schwierigen Geschichte mit sowohl den Traditionen als auch der Technokratie hat diese Gruppe jedes Recht, paranoid zu sein. Vielleicht wird diese disparate Allianz endlich Sicherheit für das fortlaufende Große Werk der Gruppe bieten.`,
    initiation: `Um ihre wissenschaftlichen Vorurteile abzuschütteln, fangen die neu Erwachten Solificati (die wegen des alchemistischen Symbols für Schwangerschaft „Eier” genannt werden) ihre Ausbildung mit der altbewährten Aufgabe an, unedle Metalle in Silber oder Gold zu verwandeln. Sobald sie diese Aufgabe geschafft hat, wird das Ei von ihrem Meister getestet, um zu sehen, ob sie die Lektion hinter der Aufgabe verstanden hat.  Die richtige Antwort ist natürlich, dass sie selbst das unedle Material ist und dass Gold ihr ultimatives Potenzial symbolisiert.`,
    affinitySpheres: [M20Sphere.Matter, M20Sphere.Forces, M20Sphere.Prime, M20Sphere.Entropy],
    focus: `Weil das Universum eine riesige Symphonie vibrierender Energie ist, ist Magie einfach die Anwendung des eigenen Willens, um die Schwingungen zwischen einer Sache und einer anderen zu beeinflussen und zu verändern. Die Werkzeuge, die diese Schwingungen symbolisieren und kanalisieren – und die die Wahrnehmung eines Betrachters so verändern, dass er seine eigenen Erwartungen darüber, was möglich ist und was nicht, neu ausrichten kann – machen diese höhere Alchemie möglich. Für ein Kind des Wissens ist alles entweder Daten, Chaos oder eine Illusion, ein Gefängnis oder ein Fehler. Für ein Kind des Wissens ist alles entweder Daten, Chaos oder eine Illusion, ein Gefängnis oder ein Fehler. Für ein Kind des Wissens ist alles Daten, Chaos oder eine Illusion, Gefängnis oder Fehler. Wissen – geschärft durch Alchemie, Handwerkskunst, verrückte  Weisheit, die Kunst des Verlangens, Chaosmagie und gelegentliche Hypertechnologie – vermittelt die Wahrheit hinter den Illusionen des Lebens. Magie ist für einen Solificatus die Kunst der Transmutation; sie verändert, verfeinert, zerlegt und setzt vorhandene Materialien zu neu gebildeten Energien wieder zusammen.`,
    stereotypes: {
      fellowTraditions: "Unsere neuen Freunde haben eine Vision, die man nur durch Ausdauer in schwierigen Zeiten erreichen kann. Ja, davon wissen wir ein bisschen was.",
      technocracy: "Ihre Version von Einheit ist total verkorkst, böse, manipulativ und traurig.",
      disparates: "Wir haben versucht, ihnen Einheit zu zeigen. Sie haben uns rausgeschmissen. Scheiß auf sie. Wir haben Besseres zu tun ... und zu denken."
    }
  },

  {
    id: 18,
    type: M20TraditionType.Disparate,
    name: `Hollow Ones`,
    description: `Die Hollow Ones sind eine Gruppe von Magiern, die entweder Waisen sind oder die Traditionen abgelehnt haben, sich aber geweigert haben, sich der Technokratie anzuschließen. Stattdessen sind sie eine Subkultur von Rebellen und Systemkritikern, die sich aus jeder Tradition das herauspicken, was ihnen gefällt, und es miteinander vermischen. Deshalb haben sie keine vorherrschende Sphäre. Obwohl sie sehr unterschiedlich sind und kein einheitliches Paradigma haben, widmen sich die Hollowers größtenteils dem Ideal der Romantik. Sie betonen, dass es sich dabei nicht um die Art von Romantik handelt, die man aus dem Supermarkt kennt, mit einem Bild von Fabio auf dem Cover, sondern um Geschichten voller gotischem Horror, tragischer Romantik und mysteriöser Launenhaftigkeit. Hollow Ones beschwören ihre Magie wahrscheinlich mit „abgeschwächten” Versionen klassischer Zaubersprüche oder mit auswendig gelernten Zaubersprüchen, die sie aus anderen Traditionen übernommen haben. Während zum Beispiel ein hermetischer Magier sein ordnungsgemäß geweihtes Pentagramm des Merkur in einem Ritual verwenden würde, könnte ein Hollow One einfach mit Eyeliner einen Stern auf eine Münze zeichnen und diese verwenden.`,
    organization: `Traditionell mögen die Darklings kleine, familienähnliche Cliquen ; innerhalb dieser Gruppen sorgen soziale Anerkennung und Stigmatisierung dafür, dass die Mitglieder dieser Gruppe sich benehmen. Angesichts der gefährlichen Natur ihrer Welt legen diese Cliquen Wert auf Loyalität und bestrafen Verrat mit der ganzen Härte der Straße. Die Regeln innerhalb solcher Gruppen sind einfach: Verarscht euch nicht gegenseitig, respektiert die Autonomie des anderen und bleibt schön angesichts der Hässlichkeit. Bis vor kurzem galten die Hollowers als die verlorene Tradition; sie hatten sogar einen zehnten Sitz im Rat der Neun in Betracht gezogen und waren dafür in Betracht gezogen worden. Diese Pläne scheiterten, als verschiedene Katastrophen den Rat erschütterten. Die Ältesten der Hollows, angewidert von den ständigen Scharadenspielen, beschlossen, dass die Traditionen eine verlorene Sache waren. Obwohl einige Hollow Ones sich den Verbena, Ecstatics oder sogar den Etherites anschlossen, entschied sich die Mehrheit, ihre Ambitionen im Rat aufzugeben. Die Gespräche, die den Grundstein für die Disparate Alliance legten, trugen maßgeblich zu dieser Entscheidung bei... und jetzt gewöhnen sich die Darklings – von Natur aus rebellische Stämme – an die Idee, Anführer statt Unzufriedene zu sein.`,
    initiation: `Obwohl sie normalerweise mit der Goth-Rock-Szene in Verbindung gebracht werden, stehen Hollow Ones auf jede Mode, die von schöner Rebellion geprägt ist. Punk, Metal, Hip-Hop, Techno-Industrial und sogar klassische Musik haben Fans unter den Hollow Ones. In letzter Zeit haben die Subkulturen Neo-Jazz, Steampunk, Fae-Punk, Gothic Lolita und androgyner Visual Kei den alten Bauhaus-Stil aufgemischt. Trotzdem mögen viele Hollowers immer noch den Old-School-Goth-Look, schon allein, weil er heutzutage so unmodern ist. In der Gesellschaft der Darklings muss immer ein Element von Anmut vorhanden sein. Wenn ein angemessen anmutiges Mitglied auffällt, beginnt eine Clique, seine Eignung für den Club zu prüfen. Aus diskreter Entfernung sticheln sie ihn und beobachten, wie er reagiert. Wenn er ihre Tests besteht, nähern sie sich dem potenziellen Mitglied mit Freundschaftsangeboten. Wenn er cool wirkt,  darf er immer weiter in die Clique hinein, bis die Mitglieder ihn für geeignet halten ... zu diesem Zeitpunkt ist er in der Regel automatisch Mitglied.`,
    affinitySpheres: [M20Sphere.Correspondence, M20Sphere.Entropy, M20Sphere.Forces, M20Sphere.Life, M20Sphere.Matter, M20Sphere.Mind, M20Sphere.Prime, M20Sphere.Spirit, M20Sphere.Time],
    focus: `Darklings nutzen alles, was ihnen zur Verfügung steht – meistens Dinge, die von der Gesellschaft weggeworfen wurden. Kaputtes Spielzeug, okkulte Gegenstände und Symbole sowie Verhaltensweisen, die von sogenannten anständigen Menschen gemieden werden, sind in den Händen eines Hollow-Magiers mächtige Werkzeuge.   Was ihre Weltanschauung angeht, ist dieses hohle Bild ziemlich symbolisch: Diese Leute sehen sich oft als Gefäße des Lebens und des Todes, die ihre Künste ausgießen oder diese kosmischen Kräfte von Ort zu Ort tragen. Magie kommt also vom richtigen Verständnis und der bewussten Nutzung der Energien, die bei den meisten Leuten einfach verschwendet werden. Alles ist Chaos, eine Illusion oder ein Fehler, wahrscheinlich auf dem Weg ins Nichts. Einige Hollowers sagen, dass alles gut ist, aber sie sind in der Minderheit. Magie und Guttermagie kommen von der richtigen Erkenntnis und dem bewussten Einsatz der Energien, die bei den meisten Leuten einfach verschwendet werden.   Alles ist Chaos, eine Illusion oder ein Fehler, wahrscheinlich auf einer Einbahnstraße ins Vergessen. Einige Hollowers behaupten, dass alles gut ist, aber sie sind in der Minderheit. Chaos und Gutter Magick sind unter den Hollow Ones fast allgegenwärtig. Obwohl solche Künste das Chaos nicht wirklich fördern, gedeihen sie im Chaos unserer Zeit.`,
    stereotypes: {
      fellowTraditions: "Ist es perfekt? Auf keinen Fall. Ist es eine Verbesserung? Auf jeden Fall.",
      technocracy: "Der faule Kern einer verrotteten Zeit.",
      disparates: "Wir haben ihnen eine Chance gegeben – eigentlich sogar viele Chancen. Sie haben uns abgewimmelt, also scheiß auf sie. Wir haben einen neuen Ball und spielen ein neues Spiel."
    }
  },

  {
    id: 19,
    type: M20TraditionType.Disparate,
    name: `Kopa Loei`,
    description: `Die Kopa Loei sind ein Zauberer-Handwerk. Als eines der ältesten magischen Handwerke wurden die Kopa Loei, auch Kahunas genannt, über 200 Jahre lang von der Technokratie angegriffen und fast vernichtet. Dieses Handwerk ist über die polynesischen Inseln verstreut und am weitesten verbreitet im hawaiianischen Archipel. Sie halten die alten polynesischen schamanistischen Zauberkünste am Leben, indem sie sie wie ihre Vorfahren weiter praktizieren. Trotz vielfältiger Druckversuche weigern sich die Kopa Loei, sich an das sich wandelnde Paradigma anzupassen; die Ältesten des Handwerks bestehen darauf, dass dies einen Verrat an allem bedeuten würde, wofür sie gearbeitet haben. Die ursprünglichen Kopa Loei, ehemals Mitglieder der Priester- und Königskasten, stammten aus der Elite der Elite – erwachte Adlige, die ihre Magie nicht nur zum Wohle ihres Volkes und ihres Landes einsetzten, sondern auch, um ihre soziale Stellung zu sichern. Ein System religiöser Gesetze, kapu, sorgte dafür, dass die reichhaltigen natürlichen Ressourcen der Inseln weiterhin gedeihen konnten und dass die Kopa Loei die dominierende Kraft in der lokalen Regierung blieben. Nach Tausenden von Jahren der Vorherrschaft der Kopa Loei stürzte die Technokratie diese Mystiker. Die einheimische Regierung gehört der Vergangenheit an; die soziale Ordnung der Inselbewohner wurde weitgehend zerstört und westliche Ideen wurden, wo immer möglich, an ihre Stelle gesetzt. Die Kopa Loei, die nun gezwungen sind, heimlich innerhalb der einheimischen Gemeinschaften zu arbeiten, sind nur noch ein blasser Abklatsch ihrer einstigen Macht. Obwohl die Hawaiianer dominieren, glaubt die Zunft an die Einheit aller polynesischen Völker, die sie als bayanihan spirit bezeichnet.  `,
    organization: `Die Kopa Loei bilden lockere Gruppen von Kadugos (Blutsverwandtschaftsgruppen) mit zwei bis 20 Mitgliedern pro Gruppe. Ein Kupuna (Ältester oder Mentor) unterrichtet sein Keiki (Kind), und obwohl es sich hierbei nicht um „offizielle” Titel handelt,  gelten diese Begriffe als grundlegende Säulen der Hierarchie der Kopa Loei. Innerhalb der Gruppe werden alle Kanaka respektiert. Die Kopa Loei glauben nicht an Unsinn wie „Erwachen”; bestimmte Kanakakahunas sind einfach besser aufeinander abgestimmt und mächtiger als andere. Die Kopa Loei folgen drei traditionellen Spezialisierungen: den Ali'i, Zauberpriestern, die mit dem Land verbunden sind und sich auf Prime spezialisiert haben; den Kahuna, Magier-Schamanen, die mit einer Vielzahl von Künsten arbeiten; und den oft weiblichen He Ho'okele Moana („Wegfinderinnen”), die über die offenen Ozeane navigieren und die verschiedenen Inseln und Unterwasserfestungen der Kanaka Maoli verbinden. In der Vergangenheit genossen die Ali'i den größten Respekt, mit einem System von  religiösen Regeln (Kapu), um die Fruchtbarkeit und den Wohlstand des Landes zu erhalten und die diesen Anführern gebührende Ehrerbietung zu unterstreichen. Auch die Kahuna wurden mit Ehrfurcht behandelt, während die Wegfinder (ob erwacht oder nicht) die niedrigste Stufe der Ehrerbietung einnahmen. Heutzutage genießen die He Ho’okele Moana jedoch weitaus mehr Respekt, dank ihrer Fähigkeit,  unberührte Inseln im stark ausgebeuteten Pazifik zu finden.`,
    initiation: `Anders als bei anderen Traditionen oder Gruppen sehen die Kopa Loei die Initiation ihrer neuen Ho'omaka als eine private Sache zwischen jedem einzelnen Kupuna und Keiki. Potenzielle Schüler und Initianden sind ausschließlich Einheimische – Ha'oles sind nicht erlaubt! – die durch ihre Teilnahme an politischen Veranstaltungen, den sozialen Medien der Inselbewohner und Empfehlungen anderer Mitglieder ihres Kadugo ausgewählt wurden. Unabhängig von ihrer Herkunft muss eine potenzielle Kandidatin in der Lage sein, ihr Kanaenae (Gebet der Verehrung an die Götter) zu singen, um ihre Verbindungen zum polynesischen Volk`,
    affinitySpheres: [],
    focus: `Ho’omana kommt durch die Verbindung mit der Natur, heiligen Absichten und der Reinheit des Selbst. Deshalb benutzen die Kopa Loei auf keinen Fall Dinge, die sie als unnatürlich oder technologisch ansehen, um ihre Magie zu wirken.  Die Schöpfung ist göttlich und lebendig, geteilt zwischen göttlicher Ordnung und irdischem Chaos. Unbedachte, auffällige Magie stört und schädigt das Gleichgewicht der natürlichen Wege – kapuhuna – und verärgert oft die Götter. In allen Dingen sind das Gleichgewicht mit der Natur und der Segen der Götter unerlässlich.`,
    stereotypes: {
      fellowTraditions: "Ha'ole Kahuna, klar, aber wenigstens versuchen sie nicht, uns zu sagen, was wir tun sollen, oder uns unser Land wegzunehmen. Sie kämpfen wie wir gegen die Ke aka nui, und deshalb sind sie im Moment Freunde.",
      technocracy: "Die Tupa Nui? Die kennen wir nur zu gut. Lügner und Zerstörer, sie und die Ke aka nui, die Großen Schatten, sind eins geworden.",
      disparates: "Kein Wunder, dass die Ha'ole Kahuna verstreut und gespalten sind und ums Überleben kämpfen. Ohne Kapu, der ihren Krieg gegen die Tupa Nui leitet, kämpfen sie mit stumpfen Waffen."
    }
  },

  {
    id: 20,
    type: M20TraditionType.Disparate,
    name: `Ngoma`,
    description: `Die Ngoma sind eine Handwerkskunst von Magiern, die von der Kultur südlich der Sahara in Simbabwe abstammen. Im Gegensatz zu vielen eher schamanistischen Methoden afrikanischer Magier sind die Ngoma stolze Ritualisten und Wissenssuchende, die sich bemühen, die Geheimnisse des Kosmos zu entschlüsseln. Obwohl sie von den Traditionen lange Zeit als ausgestorben galten, wurden sie 2001 nach der Feuersbrunst als kleines Haus Ngoma in den Orden des Hermes aufgenommen. Ein großer Teil von ihnen gehört auch zur Disparate Alliance. Magie ist ein Geschenk der Götter an ihre menschlichen Kinder. Aber nicht jeder kann dieses Geschenk nutzen, und so verstummen manchmal die Worte der Götter. Es ist die Aufgabe der Ngoma, den Willen der Götter und Vorfahren zu entschlüsseln, indem sie ihre Magie richtig einsetzen, um ihrem Volk zu Wohlstand zu verhelfen. Die Ngoma studierten Astrologie und Geomantie, um die Wünsche der Götter in den natürlichen Zyklen zu erkennen. Viele waren auch geschickt darin, die Geisterwelten zu durchqueren und Umbrood sowie ihre Ahnengeister um Hilfe zu bitten.`,
    organization: `Die Ngoma, die die Plagen des Sklavenhandels und der kolonialen Ausbeutung überstanden haben, haben die magischen Schulen, für die sie bekannt waren, wieder aufgebaut. Aus der Not heraus sind diese Schulen heute versteckter als früher.   Da die Ngoma wissen, wie wichtig es ist, ihr verlorenes Wissen, ihre Rituale und Traditionen zu bewahren, gibt es diese Schulen jetzt überall auf der Welt. Dort lernen die Leute wichtige Sachen über verschiedene magische Praktiken wie Geistergespräche, Kräuterkunde, Zaubersprüche, Geschichtenerzählen und Geomantie. Wie bei den meisten Teilen der afrikanischen Kultur bringen die Älteren den Jüngeren alles bei. Alter und Erfahrung sind in der Ngoma-Gesellschaft immer noch echt wichtig. Ein Ältester namens Kitjito („Oase“) unterrichtet seine Kuwaneko („Dürstende“, also Leute, die nach Wissen dürsten) und gibt ihnen Unterricht in Magie, Wissenschaft, afrikanischer Geschichte und Überlieferungen. Ngoma-Gesellschaft hochgeschätzt. Ein älterer Kitjito („Oase”) unterrichtet seinen Kuwaneko („der Durstige”, im Sinne von „durstig nach Wissen”) und gibt ihm Unterricht in Magie, Wissenschaft, afrikanischer Geschichte und Überlieferungen sowie den alten Sprachen der nubischen Arkanen – insbesondere Ufungoto, der „Schlüsselsprache”, in der Geister angeblich sprechen.  Kitujita schicken ihre Kuwanakada oft auch zu anderen Ältesten, um dort zu lernen, und vermitteln ihnen so ein breites Spektrum an Disziplinen und Fachgebieten. Wie bei den hermetischen Magiern sind Wissen und Gelehrsamkeit wesentliche Elemente der Ngoma-Ausbildung. Die Ngoma glauben, dass ein großes Gefäß mehr Wasser fasst, sodass ein breites Spektrum an Wissen auch ein größeres Spektrum an Möglichkeiten mit sich bringt.`,
    initiation: `Auf dem afrikanischen Kontinent kann ein frisch erweckter Magier vielleicht ganz alleine eine Ngoma-Schule finden; außerhalb Afrikas muss ein potenzieller Anwärter normalerweise einen Kitjito finden (oder von ihm gefunden werden), der seine erste Ausbildung beginnt und ihn dann an eine Schule weiterleitet... oft bezahlt sie selbst die Aufnahme- und Reisekosten, damit sich der Kuwaneko ganz auf sein Studium konzentrieren kann , ohne sich um die Finanzen zu sorgen. Die Ausbildung dauert in der Regel mehrere Jahre und umfasst Visionssuchen und magische Prüfungen. Nicht erwachte Schüler, die außergewöhnliches Potenzial zeigen, werden ermutigt, so viel wie möglich zu lernen; selbst wenn ein solcher Schüler niemals erwacht, könnte er einen Platz in den weitreichenden geheimen Unterstützungsnetzwerken finden, auf die sich die Ngoma stützen.`,
    affinitySpheres: [M20Sphere.Life, M20Sphere.Mind, M20Sphere.Prime, M20Sphere.Spirit],
    focus: `Wissen öffnet die verschiedenen Kammern der Kunst und der Möglichkeiten. Weil Geister und verstorbene Vorfahren Antworten auf viele Geheimnisse geben, denken Außenstehende oft, die Ngoma seien Schamanen. Das ist aber nicht so; die Geister geben zwar Ratschläge, aber das Wissen und die Künste hängen von jedem einzelnen Ngoma ab, nicht von der Hilfe aus der anderen Welt. Geleitet von Paradigmen der göttlichen Ordnung und des irdischen Chaos, wo die Technik alle Antworten bereithält, wenden die Ngoma hohe rituelle Magie mit einer tiefen Komponente des Glaubens und modernen Anwendungen der Alchemie, Hypertech, Medizin, Handwerkskunst, Reality Hacking und Hyperökonomie und der damit verbundenen Kunst des Begehrens an. Obwohl  einige Ngoma sich dafür entscheiden, mit den traditionellen Werkzeugen ihrer Vorfahren zu arbeiten, verwenden die meisten Suktamke („diejenigen, die einen Anstoß geben “) eine Mischung aus alten und technologischen Werkzeugen. Wissen ist schließlich nicht an eine einzige Epoche gebunden.`,
    stereotypes: {
      fellowTraditions: "Was für eine bunte Truppe potenzieller Verbündeter! Zumindest könnten wir ihre Geheimnisse erfahren und von ihrem Wissen profitieren.",
      technocracy: "Zerstörer, Schänder, Mörder und Ausbeuter.",
      disparates: "Hätten sie sich nicht von ihren Vorurteilen blenden lassen, wären wir vielleicht mächtige Verbündete geworden. Andererseits haben die Ahnen vielleicht in ihrer Weitsicht den jetzigen erbärmlichen Zustand des Rates vorausgesehen."
    }
  },

  {
    id: 21,
    type: M20TraditionType.Disparate,
    name: `Orphans`,
    description: `„Orphan“ ist ein Begriff für Magier, die keiner formellen Tradition, Kunst oder Konvention angehören. Die meisten sind frisch erwacht und von der neuen Welt, die sich ihnen offenbart hat, überwältigt.`,
    organization: `Normalerweise übt ein Waisenkind entweder alleine oder gehört zu einer kleinen Gruppe. Auch hier gibt es keinen gemeinsamen Nenner zwischen diesen Gruppen. Eine könnte eine Rockband sein, eine andere ein Kirchenchor,  eine dritte könnte eine Hexenfamilie sein und eine vierte könnte jeden Samstagabend auf einem Friedhof Tarotkarten legen. Wie üblich dominieren die Ältesten die Gruppe; in diesem Fall wird der Begriff „Ältester” jedoch eher durch mystische Errungenschaften oder persönliches Charisma definiert als durch das Alter oder einen ernannten Titel. Die Anführer einer verwaisten Sekte können brillant, brutal, verführerisch oder überzeugend sein. Der eine könnte seinen Stamm durch Sex, Drogen und okkultes Geschwätz dominieren, der andere könnte ein Händchen dafür haben,  sich in Obdachlosenheimen kostenlose Mahlzeiten zu erschleichen. Mit wenigen Ausnahmen hängen die Regeln der Gruppe von den Launen des Anführers und seiner Fähigkeit ab,  sie innerhalb dieser Gruppe durchzusetzen.`,
    initiation: `Früher hatten die meisten Gesellschaften Initiationsriten, die die Leute ins Erwachsenenalter, in einen Beruf oder in eine mystische Tätigkeit einführten. Unter Anleitung der Älteren lernten die Initiierten alles, was sie wissen mussten, um in dieser neuen Rolle zu funktionieren. Magische und spirituelle Initiationen waren Teil der meisten vorindustriellen Gesellschaften, und einige dieser Gruppen wurden zu den Traditionen und Handwerken, die wir heute kennen (oder schlossen sich ihnen an). In bestimmten Regionen gibt es solche Gruppen auch heute noch, aber in der industrialisierten Welt sind sie schwer zu finden. Meistens trifft ein verwaister Magier auf andere Leute wie ihn selbst ... Häufiger trifft ein verwaister Magier auf andere Menschen wie sich selbst ... meist in Straßenkulturen, Neotribalisten, Transhumanisten, Fantasy-Fans, New-Age-Anhängern, okkulten Gruppen und so weiter. Daher kann die Initiation eine äußerst gemischte Angelegenheit sein, die mehr von den Verantwortlichen der Gruppe als von gemeinsamen Formalitäten abhängt. In der Regel muss die Waise ihre Vertrauenswürdigkeit unter Beweis stellen, ein gewisses Maß an Treue gegenüber der Gruppe und ihren Anführern schwören und ihre Fähigkeiten im Dienst dieser Gruppe demonstrieren. Folglich kann eine Waise in einer christlichen Randgruppe,  einem satanistischen Zirkel, einer Burning-Man-Kunstgruppe, einer Bande von Straßenkindern, einem New-Age-Ashram oder einer anderen Gruppe landen, die einen Platz für Menschen bietet, die an Magie glauben.`,
    affinitySpheres: [M20Sphere.Correspondence, M20Sphere.Entropy, M20Sphere.Forces, M20Sphere.Life, M20Sphere.Matter, M20Sphere.Mind, M20Sphere.Prime, M20Sphere.Spirit, M20Sphere.Time],
    focus: `Waisenkinder sind offen für fast jede Weltanschauung, die Platz für magische Kräfte lässt. Manche Waisenkinder werden auch zu Technomagiern und nutzen ihre Künste mit technischen Hilfsmitteln und Überzeugungen. Religiöse Glaubenssätze, transhumanistische Ideen, okkulte Praktiken und ethnische Bräuche sind die häufigsten Themen der Waisenmagie und der Populärkultur, die oft  Religiöse Glaubensbekenntnisse, transhumanistische Philosophie, okkulte Beschäftigungen und ethnische Praktiken sind die häufigsten Schwerpunkte der Waisenzauberkunst, und die Populärkultur, die mehrere davon integriert (oft als „Gutter Magick“ oder „High Eclecticism“ bezeichnet), ist in der technologischen Welt besonders verbreitet.`,
    stereotypes: {
      fellowTraditions: "Ich halte mich mit meinem Urteil über die Gruppen, die ich kenne, noch zurück, aber sie scheinen die Dinge besser im Griff zu haben als die anderen Leute.",
      technocracy: "Scheiß auf diese Typen, diese unterdrückenden, bösen Mistkerle!",
      disparates: "Ein Haufen selbstgerechter Zauberer, die nicht nur denken, dass sie den Mond aufgehängt haben, sondern auch darauf bestehen, dass du dort mit ihm hängen musst."
    }
  },

  {
    id: 22,
    type: M20TraditionType.Disparate,
    name: `Sisters of Hippolyta`,
    description: `Die Sisters of Hippolyta sind ein Handwerk, das bis zu den Amazonenköniginnen des alten Griechenlands zurückreicht. Entstanden aus der mythischen Spaltung innerhalb der Amazonen darüber, ob sie am Trojanischen Krieg teilnehmen sollten oder nicht, sind die Sisters of Hippolyta die spirituellen (und in einigen Fällen auch buchstäblichen) Nachfahren derjenigen, die sich entschieden hatten, nicht an den Kriegen der Männer teilzunehmen. Heute weigern sich die Schwestern, sich den Traditionen anzuschließen, da sie diese als hemmende Kraft für das ungebundene Potenzial der Magie betrachten, und verabscheuen die dogmatische und unterdrückende Technokratie. Da sie sich nicht auf den Aufstiegskrieg einlassen wollten und stets auf die Geheimhaltung ihrer Gruppe bedacht waren, haben die Schwestern überlebt, während andere militante oder öffentlichere Handwerksgemeinschaften untergingen.`,
    organization: `Die meisten Hippolytoi leben zusammen in Gemeinschaften, in denen es nur Frauen und Kinder gibt. Schwestern, die sich für Beziehungen mit Männern entscheiden, müssen diese außerhalb der Gemeinschaft treffen. Ein gewählter Rat aus sieben Schwestern, bekannt als die Epitropi, leitet und regiert jede Gemeinschaft. Innerhalb einer Gruppe hat dieser Rat das letzte Wort über alles,  von der langfristigen Ausrichtung der Gemeinschaft bis hin zur Rolle ihres jüngsten Mitglieds. Im Gegensatz zu den meisten Gemeinschaften der Erwachten machen die Hippolytoi keinen Unterschied zwischen Erwachten und nicht Erwachten. Jeder hat eine Stimme, und alle Stimmen werden respektiert.`,
    initiation: `Der Beitritt zu einer so geheimnisvollen Gemeinschaft wie den Schwestern von Hippolyta ist weder schnell noch einfach.  Eine Schwester kann Wochen oder Monate damit verbringen, eine potenzielle Anwärterin kennenzulernen. Manchmal wird eine Frau zur Heilung oder als Zufluchtsort in ein Konklave gebracht. Wenn die Persönlichkeit und die Weltanschauung der Anwärterin zur Schwesternschaft passen, kann die Epitropi beschließen, ihr die Mitgliedschaft anzubieten. Wenn sie das Angebot annimmt, lebt sie einen Monat lang im Konklave.  Während dieser Zeit lernt die Frau die guten und schlechten Seiten des Lebens innerhalb des Ordens kennen (allerdings keine Geheimnisse), während die Schwestern das Engagement und die Vertrauenswürdigkeit der Anwärterin beurteilen. Wenn am Ende dieser Probezeit alle Parteien zufrieden sind, beginnt die Anwärterin ihr neues Leben in einer kurzen Zeremonie, in der sie den Schwestern von Hippolyta einen Eid schwört.`,
    affinitySpheres: [M20Sphere.Life, M20Sphere.Mind],
    focus: `Obwohl alle Schwestern, egal ob erwacht oder nicht, die magischen Künste lernen, sehen sie Magie eher als eine intuitive Verbindung und nicht als eine metaphysische Disziplin. Die Schöpfung ist göttlich und lebendig, und obwohl Macht (oft) Recht ist, ist alles gut, wenn man Mut, Glauben und Schwesternschaft hat. Im Wesentlichen handelt es sich um eine heidnische Form der Heilkunst mit modernen Anwendungen. Die Praktiken der Hippolytaner ähneln Hexerei, Schamanismus, hohen Ritualen, Handwerkskunst und Kampfkünsten, obwohl nur wenige Schwestern ihre Künste mit diesen Begriffen beschreiben würden. Wann immer möglich, ziehen es die Hippolytoi vor, ihre Willensarbeit durch Gruppenrituale zu vollziehen. In der Regel führen sie diese Riten in ihrer Muttersprache durch, obwohl formelle Schwestern Rituale in Altgriechisch durchführen.`,
    stereotypes: {
      fellowTraditions: "Ich hab Zweifel – VIELE Zweifel. Trotzdem können wir vielleicht was von diesen Männerklubs lernen... oder ihnen was beibringen... oder wenigstens den Schaden begrenzen, den sie sonst anrichten würden. Und wenn nicht, machen wir das, was wir schon immer gemacht haben: verschwinden.",
      technocracy: "Wenn das Patriarchat ein Gesicht hätte, würde es wie eine Maschine aussehen ... genauer gesagt, wie diese Maschine.",
      disparates: "Vielleicht gut gemeint, aber heimtückisch und verloren."
    }
  },

  {
    id: 23,
    type: M20TraditionType.Disparate,
    name: `The Taftâni`,
    description: `Die Taftâni, oder Weavers, sind eine Handwerksgilde persischer Magier, die sich über den Konsens hinwegsetzen, indem sie regelmäßig vulgäre Magie praktizieren. Das Paradigma der Taftâni ist im Grunde dualistisch und basiert auf dem Glauben an Asha, die universelle Wahrheit, und ihr verachtetes Gegenteil Druj, „die Lüge“. Ein Magier kann Wunder vollbringen, indem er Asha durch Schöpfungsakte manifestiert. Dies kann materiell sein, wie zum Beispiel das Herstellen eines Gegenstands, oder eher vergänglich, wie zum Beispiel das Verfassen von Gedichten, Liedern oder sogar einem ausgeklügelten und komplizierten Fluch. Dies ähnelt den Handwerkspraktiken des Ordens der Vernunft, aber es handelt sich nicht um echtes Handwerk oder Technomagie, da die Taftâni der Ansicht sind, dass es die Inspiration und der Wille des Magiers sind, die die Magie hervorbringen, und nicht etwa eine dem Handwerk selbst innewohnende Tugend.`,
    organization: `Die Weavers sind ein ziemlich unabhängiger Haufen und treffen sich nicht in Häusern, Familien, Geheimgesellschaften oder so. Es gibt Schulen, wo frisch erweckte Ashavanti die alten Traditionen lernen können. Aber meistens bilden Taftâni-Meister nur einen Lehrling auf einmal aus und selten mehr als drei in ihrem ganzen Leben. Außerhalb dieser Lehrlingsbeziehungen haben sich die Weavers bis vor kurzem nur alle sechs Monate in Bagha („Gärten“) getroffen. In den letzten Jahren hat diese Isolation jedoch einer pragmatischen Zusammenarbeit Platz gemacht. Nur Narren weigern sich, sich angesichts des Aussterbens zu ändern ... und dieses Aussterben ist tatsächlich sehr nahe gekommen. Konfrontiert mit den verrückten Dschinns des Technokratischen Ordens – und schlimmer noch, mit der giftigen Korruption der gefallenen Meister dieses Ordens – haben die Weber ihre alte Tradition der internen Konflikte aufgegeben. Obwohl die Taftâni-Gesellschaft sehr locker strukturiert ist, ist sie weitaus stabiler ... und subtiler ... als je zuvor. Und in dieser stillen Stabilität ist sie zu Wohlstand gelangt.`,
    initiation: `Künstlerische Vision, gepaart mit praktischem Geschick und Anwendung, ist den Taftâni wichtiger als starre Zeremonien. Ein Weber, der nicht weben kann, einer, der die Muster nicht sehen kann, bevor sie sich unter seinen Händen formen, ist kein echter Weber. Eine Meisterin findet ihre Lehrlinge also, wo immer sie sie findet, bildet sie intensiv aus, testet sie ständig und legt größten Wert darauf, sie gut zu unterrichten. Einen Lehrling aufzunehmen ist für die Ashavanti eine heilige Ehre und Verantwortung. Schließlich kann die Wahrheit leicht durch Unwissenheit oder Korruption verdrängt werden. Diese Verantwortung ist ein zweischneidiges Schwert: Ein Lehrling eines Webers muss eine brutale Arbeitslast von Aufgaben ertragen. Einen Lehrling aufzunehmen ist für die Ashavanti eine heilige Ehre und Verantwortung. Schließlich kann die Wahrheit leicht durch Unwissenheit oder Korruption verdrängt werden. Diese Verantwortung ist zweischneidig: Ein Lehrling eines Webers muss eine brutale Arbeitslast an Aufgaben und Diensten ertragen.  Nach langer Tradition nimmt ein Taftâni-Meister einen Lehrling im Alter zwischen 11 und 16 Jahren auf, lehrt ihn die wesentlichen Künste, bis er stirbt, erfolgreich ist oder seinen Mentor im mystischen Kampf besiegt, und führt ihn dann in die Welt der Dschinn und die vielen Möglichkeiten ein, solche Wesen zu kontrollieren. Wenn der Schüler stirbt, trauert der Meister ... aber nicht übermäßig. Wenn jemand sich anmaßt,  göttliches Feuer zu weben, weiß sie, dass dieser Weber die Kraft des Willens und der Kunst besitzen muss, um solche Majestät zu überleben!`,
    affinitySpheres: [M20Sphere.Forces, M20Sphere.Matter, M20Sphere.Prime, M20Sphere.Spirit],
    focus: `Ashas Flamme wird nur durch den Willen und die Vision eines Webers eingeschränkt. Doch so wie ein schöner Teppich einer Welle folgt und ein Feuer den Strömungen der Luft und dem Brennholz folgt, so folgen auch die Segnungen von Asha den leuchtenden Entwürfen der Absicht und des Bewusstseins. Der Fokus eines Taftâni-Magiers liegt darauf,  Gedanken und Materialien zu einem großartigen, kunstvollen Entwurf zu formen – einem,  der die Schönheit der Wahrheit und die Kunstfertigkeit des Magiers demonstriert. Macht ist Recht in einem Reich der göttlichen Ordnung und des irdischen Chaos, und so nutzen die Ashavanti Alchemie, Handwerkskunst, hohe rituelle Magie, verrückte Weisheit, die Kunst des Verlangens, einen Hauch von Hypertech und die Herrschaft über Menschen und Geister gleichermaßen.`,
    stereotypes: {
      fellowTraditions: "Zu vielen von ihnen fehlt es an Kunst oder Mut; trotzdem stehen sie gegen die Gefallenen, und dafür – vorerst – stehen wir zusammen.",
      technocracy: "Unser Wort für sie – Dregvanti, die Anhänger der Täuschung – zeigt, wem sie wirklich treu sind: den Teufelskönigen. Wir werden ihnen ihr Spielzeug wegnehmen und ihre Schatten mit unseren Flammen verbrennen.",
      disparates: "In ihren Werken fehlt jede poetische Vision. Sie gestalten Magie ohne Freude und Herausforderung und verfehlen damit die Wahrheit bei weitem."
    }
  },

  {
    id: 24,
    type: M20TraditionType.Disparate,
    name: `Templar Knights`,
    description: `Die Ritter vom Tempel Salomos, oft kurz als Templer bezeichnet, offiziell aber als Militärorden der Armen Ritter vom Tempel Salomos bekannt, sind ein magischer Ritterorden, der sich Gott verschrieben hat. Die Templer zeichnen sich durch ihren unerschütterlichen Glauben an Gott aus. Im Gegensatz zu dem vagen und undefinierten Einen, den der Chor verehrt, ist der Gott, den die Templer verehren, eindeutig und kompromisslos christlich. Einzelne Konfessionen spielen vielleicht nicht mehr so eine große Rolle wie früher, aber kein Muslim, Hindu oder Jude hat jemals Zugang zu den Tempelrittern gefunden. Darüber hinaus gibt es einen großen Spielraum hinsichtlich dessen, was die Templer als richtiges Christentum akzeptieren.`,
    organization: `Die heutigen Templer sind ein Netzwerk kleiner Logen, die jeweils von einem Ehrwürdigen Meister geleitet werden, der von den eingeweihten Mitgliedern der Loge gewählt wird. Diese Ehrwürdigen Meister berichten direkt an eine kleinere Gruppe regionaler Glanzvoller Meister, die auch aus ihren Reihen gewählt werden. Die Glanzvollen Meister bekommen Anweisungen von einem kleinen Rat von Generälen, die die größeren, globalen Aufgaben dieser geheimen Ritter leiten.  Das Netzwerk funktioniert hauptsächlich über das Internet, wobei die Kommunikation in geheimen Schriften verschlüsselt ist, die nur die Templer verstehen.Jede Loge hat Brüder und Schwestern, Anwärter und Ritter verschiedener Grade und Ränge. Brüder und Schwestern haben ihren Glauben und Mut gezeigt, aber noch nicht das Heilige Feuer des Erwachens bekommen. Anwärter haben die Heilige Vision bekommen, müssen aber noch eine Ausbildung und Prüfung vor der Initiation durchlaufen. Viele Logen sind entweder dem Frieden (Heilung, Wohltätigkeit und Bildung) oder dem Krieg (bewaffnete Konflikte) gewidmet; die ersteren sind nur für Frauen, die letzteren nur für Männer. Andere Logen heißen beide Geschlechter und Ritter willkommen. Die Kommunikation ist in geheimen Schriften verschlüsselt, die nur die Templer verstehen. Jede Loge hat Brüder und Schwestern, Anwärter und Ritter verschiedener Grade und Ränge. Brüder und Schwestern haben ihren Glauben und Mut gezeigt, aber noch nicht  Viele Logen haben sich entweder dem Frieden (Heilung, Wohltätigkeit und Bildung) oder dem Krieg (bewaffnete Konflikte) verschrieben; erstere bestehen ausschließlich aus Frauen, letztere ausschließlich aus Männern. Andere Logen heißen beide Geschlechter und Ritter beider Wege willkommen; diese seltenen Logen konzentrieren sich auf Ausbildung, Rekrutierung und Vorbereitung auf den letzten Krieg.`,
    initiation: `Genau wie beim Militär suchen die Templer immer nach ein paar guten Leuten. Ein potenzieller Kandidat könnte eingeladen werden, bei den Projekten und Initiativen einer Loge mitzumachen. Wenn jemand gut passt, könnte er gefragt werden, ob er der Loge als Bruder oder Schwester beitreten will. Diejenigen, die das Heilige Feuer zeigen, werden bald einem Ritter zugeteilt, der den potenziellen Neuling in die Rituale des Gebets, der Reinigung und der Hingabe einführt, die nötig sind, um ein Aspirant zu werden. Die Templer sind eine Gemeinschaft von Menschen, die sich der Suche nach der inneren Wahrheit und der Verwirklichung des göttlichen Potenzials verschrieben haben. Sie glauben, dass jeder Mensch ein Teil des Universums ist und dass die Verwirklichung des göttlichen Potenzials der Weg ist, um die Welt zu verbessern. Die Templer glauben, dass jeder Mensch ein Teil des`,
    affinitySpheres: [M20Sphere.Forces, M20Sphere.Life, M20Sphere.Mind, M20Sphere.Prime],
    focus: `Ein Tempelritter ist nur ein Werkzeug für Gottes Willen, nicht für seinen eigenen. Trotz einer Welt voller Götter und Monster gibt es eine göttliche Ordnung und irdisches Chaos. Also gilt: Macht ist Recht, wenn Gott deine Seele leitet. Glaube und Kampfkunst sind das Herzstück der Ausbildung jedes Tempelritters. Und obwohl Herrschaft, Handwerk und Hypertech in den modernen Praktiken der Gruppe vorkommen, ist jedes Werkzeug eine Verlängerung von Gottes H`,
    stereotypes: {
      fellowTraditions: "Sie sind zielstrebig, wenn auch nicht unbedingt rein im Herzen. Sie kennen unsere höllischen Feinde und kämpfen mutig gegen sie.",
      technocracy: "Von den Gefallenen verwüstet, von Gier regiert, der ganzen Menschheit gegenüber verräterisch, ist die Technokratische Union das Gesicht des Tieres auf Erden. Am Tag des Jüngsten Gerichts haben sie viel zu verantworten ... und ich freue mich auf dieses Treffen. Sehr sogar.",
      disparates: "Diejenigen, die Magie für ihren eigenen Ruhm statt für Gottes Ruhm machen, sind zum Scheitern verurteilt."
    }
  },

  {
    id: 25,
    type: M20TraditionType.Disparate,
    name: `Wu Lung`,
    description: `Die Wu Lung waren mal die Chefs unter den Chi'n Ta in China und hielten sich für die Nachfahren des Gelben Kaisers. Als Meister der Alchemie, der himmlischen Bürokratie und einer speziellen Kampftechnik namens Kuei Lung Chuan konnten die Wu Lung trotzdem nicht verhindern, dass der Kommunismus und das technokratische Paradigma kamen und ihre Macht in China zerstörten. Die modernen Wu Lung haben sich in die Arme der Traditionen geflüchtet und sind entweder der Akashic Brotherhood oder dem Order of Hermes beigetreten.`,
    organization: `Auch wenn die Wu Lung nicht mehr die gleiche soziale Struktur haben wie früher, gibt es noch ein paar Überbleibsel davon. Alle Wu Lung sehen den T’ien Kung te Huang Ti Wu Lung (Himmlischer Kaiser der Drachenzauberer) immer noch als ihren obersten Chef an und seine Partnerin, die Feng Huan Hou Wu (Phönix-Zauberin), als fast gleichwertig. Auch wenn die meisten modernen Drachenzauberer diese beiden nie gesehen haben, wissen sie, dass der rote Faden der Tradition durch diese ehrwürdigen Ältesten weitergeht. Die obersten Chefs ernennen Regionalminister, die die Auswahl der Sifu überwachen. Die meisten modernen Drachenzauberer haben diese beiden Persönlichkeiten nie gesehen, erkennen aber trotzdem an, dass der rote Faden der Tradition durch diese ehrwürdigen Ältesten weitergeht.   Obwohl die meisten modernen Drachenmagier diese beiden Persönlichkeiten noch nie gesehen haben, erkennen sie dennoch an, dass der rote Faden der Tradition und des Erbes durch diese ehrwürdigen Ältesten bewahrt und aufrechterhalten wird. Die obersten Anführer ernennen regionale Minister, die die Auswahl der Sifu oder Lehrer unter der Autorität der Drachenschule (Herrschaft), der Phönixschule (Heilung und Barmherzigkeit) und der Tigerschule (Kampf und Strategie) überwachen. Die Sifu wiederum bilden ihre Schüler und fortgeschrittenen Schüler aus und wählen potenzielle Kandidaten für die Initiation aus. Auf allen Ebenen ist sich ein Drachenmagier sehr bewusst, wo er auf der Leiter der Wu-Lung-Gesellschaft steht und wem er zu dienen hat. Die Sifu bilden ihre Schüler und fortgeschrittenen Schüler aus und wählen potenzielle Kandidaten für die Initiation aus. Auf allen   Die Sifu wiederum bilden ihre Adepten und älteren Schüler aus und wählen potenzielle Kandidaten für die Initiation aus. Auf allen Ebenen ist sich ein Drachenmagier stets bewusst, wo er auf der Leiter der Wu-Lung-Gesellschaft steht, wem er Gehorsam schuldet und welche Verantwortlichkeiten er innerhalb dieser Hierarchie hat.`,
    initiation: `Wu Lung Sifu nutzt Wahrsagerei und Kommunikation mit Vorfahren und Geistführern, um potenzielle neue Rekruten zu finden, die kurz vor dem Erwachen stehen. Diese Sifu kontaktieren dann die potenziellen Initianden durch Visionen und Träume, in der Hoffnung, ein Erwachen auszulösen. Ein idealer Kandidat ist entweder vollständig chinesischer Abstammung oder hat enge chinesische Wurzeln. Junge Menschen mit einer Affinität für internationales Geschäft und Finanzen sind besonders wertvoll.  Wenn sie nicht mit den Traditionen und Werten der vorkommunistischen chinesischen Kultur aufgewachsen ist, macht die Kandidatin eine Zeit lang eine Ausbildung, Tests und Training durch. Wenn die Sifu zufrieden ist, dass die Kandidatin in ihrer Ausbildung genug Fortschritte gemacht und bei ihren Tests gut abgeschnitten hat, wird sie offiziell als Ch'uang Shih oder ältere Schülerin der Wu Lung aufgenommen.`,
    affinitySpheres: [M20Sphere.Spirit, M20Sphere.Forces, M20Sphere.Matter, M20Sphere.Life],
    focus: `Eine erwachte Seele ist ein spirituelles Erbe – der Shih oder göttliche Vorfahr. Magie ist eine Pflicht gegenüber der Tradition, eine Ehre für die Vorfahren und der Schlüssel zur vergangenen und zukünftigen Größe Chinas. Rituale sind super wichtig, und schlampige Improvisationen sollten man auf jeden Fall vermeiden. Chinesische Alchemie und hohe rituelle Magie bilden den Kern der Wu Lung-Praktiken, verstärkt durch soziale Herrschaft und die Kampfkunst des Kuei Lung Chuan – auch bekannt als Dragon Spirit Kung Fu. (Siehe Kapitel Neun, S. 427.) Diese Kraft kommt durch Li – die Gerechtigkeit des Himmels und das Festhalten an seiner Vollkommenheit. Exquisite Zeremonien spiegeln die himmlische Vollkommenheit wider. Die göttliche Ordnung wird es den Wu Lung ermöglichen, das Goldene Zeitalter zurückzubringen und das Chaos für immer zu verbannen.`,
    stereotypes: {
      fellowTraditions: "Unsere Vergangenheit hat uns gezeigt, dass Isolation eine Schwäche ist ... und dass sogar ungewaschene Mischlinge den Willen des Himmels unterstützen können.",
      technocracy: "Unter den Klauen und Zähnen der Drachen werden sie ihre Seelen an die Höllen der Yama-Könige verkaufen.",
      disparates: "Sie haben die natürliche Ordnung der Dinge ignoriert und sind jetzt nur noch eine zankende Gruppe von unerfahrenen Neulingen, die über ein Chaos herrschen. Unser Bündnis mit ihnen wird bestimmt kurz und fruchtbar sein ... zumindest für uns."
    }
  }
];

export const traits: ITraitPack[] = [
  {
    id: 1,
    type: "backgrounds",
    name: "Verbündete",
    description: "Wenn du Hilfe brauchst, gibt's Leute, die dir den Rücken freihalten. Diese Verbündeten können coole Freunde, hilfsbereite Tiere, Leute mit Beziehungen, die dir helfen können, Boten oder vielleicht sogar kleine Geister sein, die dir ab und zu einen Gefallen tun, wenn sie gerade Lust dazu haben. Im Allgemeinen bezieht sich dieser Hintergrund auf nicht erwachte Menschen oder ziemlich intelligente Tiere (wie ein Wolfsrudel oder eine Affenbande). Sie wissen wahrscheinlich um die seltsameren Seiten deines Lebens, aber sie kennen weder die Details der Magiergesellschaft noch deine wahren Kräfte, es sei denn, du beschließt, sie zu gefährden, indem du ihnen diese Geheimnisse verrätst. Unabhängig von ihrer Natur oder ihrer Beziehung zu dir sind diese Verbündeten eigenständige Charaktere mit Bedürfnissen, Ängsten, Motivationen und Absichten, die mit den Zielen deines Magiers übereinstimmen, aber gelegentlich auch mit ihnen kollidieren können. Jeder Punkt in diesem Hintergrund gibt dir einen Verbündeten mit einigermaßen nützlichen Fähigkeiten oder zwei Verbündete, die im Wesentlichen Besorgungen machen und Routinearbeiten erledigen. Ab zwei Punkten kannst du die Fähigkeiten deiner moderaten Verbündeten verbessern oder eine größere Anzahl von geringfügigen und moderaten Verbündeten kaufen. Wenn du zum Beispiel zwei Punkte bekommst, könntest du zwei moderate Verbündete auswählen, vier Sidekicks bekommen oder einen einzigen wichtigen Verbündeten schaffen, der fähiger ist als die geringfügigen. Magieanwendende Verbündete zählen als wichtige Verbündete. Wenn deine Verbündeten getötet werden oder auf andere Weise aus deiner Gruppe ausscheiden, verliert dieser Hintergrund die Punkte, die diese Charaktere repräsentierten, bis du neue Verbündete rekrutierst, um die ausgeschiedenen zu ersetzen. In bestimmten Fällen kann dieser Hintergrund mehr als fünf Punkte erreichen – siehe „Hintergrundeigenschaften über fünf“ (S. 301). Eine Reihe von Charakteren findest du in Anhang I.",
    specialRules: TraitSpecialRules.None,
    advantages: [
      {
        id: 1,
        level: 1,
        name: "Verbündeter 1",
        description: "Ein Verbündeter mit mittlerer Stärke oder zwei kleinere Kumpels.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 2,
        level: 2,
        name: "Verbündeter 2",
        description: "Zwei mittelmäßige Verbündete, vier Kumpels oder ein einziger, stärkerer.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 3,
        level: 3,
        name: "Verbündeter 3",
        description: "Drei mittelgroße Verbündete oder eine Mischung aus kleineren und größeren.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 4,
        level: 4,
        name: "Verbündeter 4",
        description: "Vier moderate Verbündete, sechs kleinere Begleiter oder eine Mischung aus allen drei Typen.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 5,
        level: 5,
        name: "Verbündeter 5",
        description: "Fünf moderate Verbündete oder eine Mischung aus kleineren und größeren.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 6,
        level: 6,
        name: "Verbündeter 6",
        description: "Sechs ganz normale Verbündete, eine kleine Gruppe von Kumpels oder ein oder zwei echt mächtige Freunde.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 7,
        level: 7,
        name: "Verbündeter 7",
        description: "Sieben gemäßigte Leute, ein paar Handlanger oder eine Handvoll starker Kumpels.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 8,
        level: 8,
        name: "Verbündeter 8",
        description: "Acht gemäßigte Leute, ein Haufen Anhänger oder ein paar echt harte Typen.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 9,
        level: 9,
        name: "Verbündeter 9",
        description: "Neun gemäßigte Leute, eine private Miliz oder eine Gruppe wichtiger Freunde.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 10,
        level: 10,
        name: "Verbündeter 10",
        description: "Zehn fähige Verbündete, eine kleine Armee oder eine echt tödliche Bande.",
        actions: [],
        isRepeatable: false
      }
    ],
    disadvantages: []
  },
  {
    id: 2,
    type: "backgrounds",
    name: "Alternative Identität",
    description: "Manchmal muss man einfach bereit sein, unterzutauchen. Besonders für Gestaltwandler, Klone oder Leute in riskanten Jobs (Spione, Informanten, Attentäter usw.) kann die Fähigkeit, eine andere Identität anzunehmen, den Unterschied zwischen einem neuen Leben und einem anonymen Grab ausmachen. Mit diesem Hintergrund kannst du dich hinter einer falschen Identität verstecken; je höher die Bewertung, desto mehr Unterstützung hast du für die Existenz dieser Identität. Jeder Punkt in „Alternative Identität” sorgt für ein gewisses Maß an offizieller Anerkennung, das einer zunehmenden Überprüfung standhält. Mit einem billigen gefälschten Ausweis kommst du vielleicht an einem Türsteher vorbei, aber die Autobahnpolizei lässt sich davon nicht täuschen! Eine alternative Identität ist an sich nützlich, aber nicht extrem. Du kannst einen neuen Ausweis für kurze Zeit verwenden, aber dann musst du von vorne anfangen, es sei denn, du planst, dein Leben komplett neu aufzubauen. Andere Hintergrundmerkmale können jedoch mit einer alternativen Identität verknüpft werden. Du kannst natürlich keinen neuen Avatar bekommen, aber du hast vielleicht Verbündete, Ressourcen, Spione usw., die mit deinem neuen Ich in Verbindung stehen. Für jeden Punkt im Hintergrund „Alternative Identität” kannst du deinem anderen Ich einen Punkt anderer Hintergrundmerkmale hinzufügen. Natürlich musst du für diese Hintergründe trotzdem Punkte bezahlen – sie sind nicht kostenlos mit dieser Eigenschaft verbunden. Wenn du jedoch deine bisherige Identität aufgeben musst, könnten neue Ressourcen auf dich warten. (Weitere Details findest du in der Seitenleiste „Differenzielle Hintergründe”.) Starke Identitäten halten einer genauen Beobachtung stand. Um eine alternative Identität zu durchschauen, müsste ein Charakter einen Mental-Eigenschaftswert + Untersuchung gegen eine Schwierigkeit deiner alternativen Identität + 3 würfeln. Du kannst diese Eigenschaft mehrmals erwerben, um eine Reihe von alternativen Identitäten widerzuspiegeln. Trotzdem solltest du eine Form von Magie oder Verkleidung einsetzen, um deinen verschiedenen Identitäten ein unterschiedliches Aussehen zu verleihen. Klar, in deinem Führerschein steht vielleicht „Jane Palmer“, aber wenn du immer noch wie Eva Morrissey aussiehst, dich so verhältst und so klingst, wirst du wahrscheinlich als Letztere erkannt.",
    specialRules: TraitSpecialRules.None,
    advantages: [
      {
        id: 11,
        level: 1,
        name: "Alternative Identität 1",
        description: "Ein gefälschter Führerschein, der dir irgendwie ähnlich sieht.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 12,
        level: 2,
        name: "Alternative Identität 2",
        description: "Ein passabler gefälschter Ausweis und ein paar Begleitdokumente.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 13,
        level: 3,
        name: "Alternative Identität 3",
        description: "Seriöse Ausweispapiere und Unterlagen, die bei einer zufälligen Kontrolle durchgehen.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 14,
        level: 4,
        name: "Alternative Identität 4",
        description: "Eine etablierte alternative Identität.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 15,
        level: 5,
        name: "Alternative Identität 5",
        description: "Eine komplett gefälschte Identität mit der ganzen Geschichte, Belegen, Zeugen, gefälschten Familienfotos, anderen Wohnsitzen und so weiter.",
        actions: [],
        isRepeatable: false
      }
    ],
    disadvantages: []
  },
  {
    id: 3,
    type: "backgrounds",
    name: "Arkan/Tarnung",
    description: "Du bist ein Meister im Verschwinden. Ob das nun einen nicht ganz so einfachen Trick, die Fähigkeit, die Gedanken von Männern zu vernebeln, nanotechnologische Sinnesstörer oder eine namenlose Kraft der Verschleierung beinhaltet – du hast ein Talent dafür, dich zu verstecken. Besonders im Zeitalter von Handykameras, globalen Datenbanken, elektronischen Ortungsgeräten, DNA-Proben und Überwachungskameras an jeder Ecke ist „Arkan“ – oder seine technokratische Version „Tarnung“ – eine nützliche Eigenschaft. Aufzeichnungen gehen verloren, Kameras funktionieren nicht richtig oder nehmen unscharfe Bilder von dir auf, Leute erinnern sich an „irgendeinen Typen ... oder eine Frau, ich bin mir nicht sicher“. Auch wenn dieses Talent nicht wirklich Unsichtbarkeit ist, hilft es dir, dich in Menschenmengen zu verstecken, deine Gesichtszüge vor der Kamera zu verwischen und dich in einer zunehmend überwachten Welt durchzuschlängeln. Für mystische Magier ist Arkan eine Verzerrung der Realität, die durch Schwankungen metaphysischer Energie verursacht wird, wie Echos oder Resonanz. Für die Technokratie ist das ein vollkommen erklärbares Phänomen ... und sie wird dir eine vernünftige Erklärung liefern, sobald diese die strengen Kriterien für die Weitergabe von Informationen erfüllt. Die Union zieht es vor, mysteriöse Personen wie den Geheimagenten John Courage, die diesen Cloaking-Effekt zeigen, im Auge zu behalten; das ist aber leichter gesagt als getan. Im Spiel addierst du deine Arkan-/Cloaking-Punkte als zusätzliche Würfel zu allen Würfen, die mit Heimlichkeit zu tun haben. Deine Gegner reduzieren ihre Wahrnehmungs- oder Ermittlungswürfel um denselben Betrag, wenn jemand versucht, dich aufzuspüren. Dieser Vorteil bleibt bestehen, solange du unauffällig bleibst. Im Kampf können dich die Leute normal sehen, aber Videos oder Bilder von diesem Kampf bleiben verschwommen. Ein getarnter Charakter, der herumrennt, schreit und auffällt, wird auffallen, auch wenn sich die Zeugen nach dem Ereignis wahrscheinlich nicht über seine genaue Beschreibung einig sein werden. Der Arkane/Tarnungseffekt verbirgt keine wirklich einprägsamen Merkmale. Ein Typ mit lila Haaren und Gesichtstätowierungen wird auffallen, auch wenn sich die Leute vielleicht nicht über den Lilaton oder die Muster seiner Tätowierungen einig sind.",
    specialRules: TraitSpecialRules.None,
    advantages: [
      {
        id: 21,
        level: 1,
        name: "Arkan/Tarnung 1",
        description: "Du verschwindest in der Menge.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 22,
        level: 2,
        name: "Arkan/Tarnung 2",
        description: "Deine Anwesenheit verblasst in der Erinnerung.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 23,
        level: 3,
        name: "Arkan/Tarnung 3",
        description: "Du bist die Person, an die sich niemand so leicht erinnert.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 24,
        level: 4,
        name: "Arkan/Tarnung 4",
        description: "Aufzeichnungen, Bilder, sogar Erinnerungen an dich sind rar und schwer zu finden.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 25,
        level: 5,
        name: "Arkan/Tarnung 5",
        description: "Du bist wie ein Geist in dieser Welt, den nur die Leute kennen, denen du vertraust.",
        actions: [],
        isRepeatable: false
      }
    ],
    disadvantages: []
  },
  {
    id: 4,
    type: "backgrounds",
    name: "Avatar/Genie",
    description: "Das Erwachen macht den Magier aus. Egal, ob sie es als mystischen inneren Gott oder als wissenschaftlich erklärbare Erleuchtung des höheren Bewusstseins sieht, der Avatar oder Genius lässt einen Willensarbeiter das tun, was er tut. Manche Avatare sind aber stärker und effektiver als andere. Diese Eigenschaft misst dein erwachtes Selbst, zeigt, wie gut es Quintessenz verschieben und halten kann, und sagt, wie echt es in der Wahrnehmung deines Charakters ist. Jeder Magiercharakter hat eine Art Avatar; wenn du jedoch nicht mindestens einen Punkt in dieser Eigenschaft kaufst, ist deine Fähigkeit, tatsächlich viel mit deiner Magie zu erreichen, extrem eingeschränkt. Obwohl deine Zauberwürfe auf Arete basieren und nicht auf dem Avatar, kann dein Charakter keine Quintessenz einsetzen, um seine Zauber zu unterstützen. Die Fähigkeit eines Magiers, Quintessenz zu absorbieren oder einzusetzen, basiert auf der Eigenschaft Avatar. (Siehe den Eintrag zum Merkmal Quintessenz, S. 331-333.) Auch ihr höheres Selbst ist schwach – eher eine Glut als ein Lagerfeuer. Eine hohe Avatar-/Genius-Wertung spiegelt jedoch ein höheres Selbst wider, dessen ausgeprägte Persönlichkeit für den betreffenden Magier sehr real erscheint.",
    specialRules: TraitSpecialRules.None,
    advantages: [
      {
        id: 31,
        level: 0,
        name: "Avatar/Genie X",
        description: "Ein flüchtiger Avatar, der kaum Magie beherrscht.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 32,
        level: 1,
        name: "Avatar/Genie 1",
        description: "Eine bemerkenswerte Präsenz, mit der du einen Punkt Quintessenz aufnehmen oder verbrauchen kannst.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 33,
        level: 2,
        name: "Avatar/Genie 2",
        description: "Eine dynamische Präsenz, mit der du zwei Punkte Quintessenz aufnehmen oder verbrauchen kannst.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 34,
        level: 3,
        name: "Avatar/Genie 3",
        description: "Eine erkennbare Entität, mit der du drei Punkte Quintessenz aufnehmen oder verbrauchen kannst.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 35,
        level: 4,
        name: "Avatar/Genie 4",
        description: "Ein mächtiger Geist, mit dem du vier Punkte Quintessenz aufnehmen oder verbrauchen kannst.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 36,
        level: 5,
        name: "Avatar/Genie 5",
        description: "Eine mächtige Kraft der Erleuchtung, mit der du fünf Punkte Quintessenz aufnehmen oder verbrauchen kannst.",
        actions: [],
        isRepeatable: false
      }
    ],
    disadvantages: []
  },
  {
    id: 5,
    type: "backgrounds",
    name: "Backup",
    description: "Du kannst die Kavallerie rufen und bei Bedarf Hilfe erwarten ... allerdings nur in begrenztem Umfang. Dank deiner Mitgliedschaft in einer Organisation kannst du Verstärkung anfordern und ein kleines Team nützlicher Leute schicken lassen, die sich um die Angelegenheit kümmern. Im Gegensatz zu Verbündeten sind diese Leute weitgehend anonym, haben begrenzte Fähigkeiten und sind mehr oder weniger entbehrlich. Im Wesentlichen kommen sie, um einfache Aufgaben zu erledigen, und kehren dann zu der Organisation zurück, der ihr alle angehört. Backup-Charaktere kommen aus einem großen Pool von fähigen, aber nicht erweckten Leuten. Ihre Beziehung zu den Spielercharakteren ist eher eine Frage der Zweckmäßigkeit, ohne besondere Loyalität. Auch wenn sie ihr Leben für den Magier riskieren, ist die Hilfe nicht persönlich. Diese Leute machen einfach nur ihren Job. Verstärkung kommt in der Regel in Form einer Gruppe bewaffneter Soldaten, die herbeieilen, um die Flucht eines Magiers zu decken. Alle wichtigen Aufgaben (oder Opfer) liegen in der Verantwortung des Magiers – die Verstärkung ist nicht da, um schwere Arbeit zu verrichten. In anderen Situationen kann der Hintergrund auch andere Arten von Hilfspersonal darstellen: Rezeptionisten, Studenten, Roadies, Fahrer, Sanitäter, sogar Prostituierte. Ein König oder eine Königin des Dschungels könnte um Hilfe rufen und eine passende Gruppe von Tieren anlocken, vorausgesetzt, dass der Charakter einen storybasierten Grund für diese Loyalität hat. Die Art der Hilfe hängt von der Organisation, der Situation und der Rolle des Magiers innerhalb dieser Gruppe ab. Ein ekstatischer Rockstar könnte Prostituierte und Roadies herbeirufen, während ein Black Suit Polizisten, Reporter oder eine Reinigungstruppe herbeirufen könnte. Und obwohl es leicht ist, die Bedeutung von Studenten, Rezeptionisten oder Bloggern zu unterschätzen, sollte man auch bedenken, dass die Gesellschaft insgesamt mehr auf Informationen als auf Gewalt angewiesen ist. Ein eloquenter Reporter kann im Großen und Ganzen mehr bewirken als ein Dutzend Typen mit Waffen. Typisches Backup-Personal hat Eigenschaften im Bereich von 1 bis 3 und ein oder zwei bemerkenswerte Fähigkeiten. Tiere sind klein (Vögel, Ratten, Fledermäuse, Haushunde oder -katzen usw.), und Geister sind unbedeutende Wesen mit einem einzigen Zweck (Botengeister, Windelementare und so weiter). Elitäre Backup-Agenten – zum Beispiel Söldner, Ninjas, Cyborgs, unbedeutende Geister oder große Raubtiere – kosten doppelt so viel wie typische Agenten, haben aber Eigenschaften im Bereich von 3 bis 5, ungewöhnliche Fähigkeiten oder ernstzunehmendes Kampfpotenzial. Im Grunde genommen werden diese Elite-„Zeitarbeitsagenten” für die Dauer einer einzigen Mission zu Verbündeten und verschwinden dann wieder dorthin, woher sie gekommen sind. Um diesen Hintergrund zu erhalten, muss ein Charakter Teil einer größeren Organisation sein – einer Gang, der Polizei, einer Streitkraft, der Technokratie usw. Unabhängig davon, wie seine Verbindung zu dieser Gruppe aussieht, muss der Magier gelegentlich Aufgaben für die Gruppe erledigen, die ihm Hilfe schickt. Wenn er seinen Teil der Abmachung nicht einhält, wenn seine Verstärkung schwere Verluste erleidet oder wenn er die Agenten und ihre Gruppe auf andere Weise missbraucht, kann dieser Hintergrund reduziert oder entzogen werden.",
    specialRules: TraitSpecialRules.None,
    advantages: [
      {
        id: 41,
        level: 1,
        name: "Backup 1",
        description: "Zwei typische Leute",
        actions: [],
        isRepeatable: false
      },
      {
        id: 42,
        level: 2,
        name: "Backup 2",
        description: "Vier einfache Leute oder zwei Aushilfen",
        actions: [],
        isRepeatable: false
      },
      {
        id: 43,
        level: 3,
        name: "Backup 3",
        description: "Sechs Leute",
        actions: [],
        isRepeatable: false
      },
      {
        id: 44,
        level: 4,
        name: "Backup 4",
        description: "Acht Leute oder vier Aushilfen",
        actions: [],
        isRepeatable: false
      },
      {
        id: 45,
        level: 5,
        name: "Backup 5",
        description: "10 Leute",
        actions: [],
        isRepeatable: false
      },
      {
        id: 46,
        level: 6,
        name: "Backup 6",
        description: "12 Leute oder sechs Aushilfen",
        actions: [],
        isRepeatable: false
      },
      {
        id: 47,
        level: 7,
        name: "Backup 7",
        description: "14 Leute",
        actions: [],
        isRepeatable: false
      },
      {
        id: 48,
        level: 8,
        name: "Backup 8",
        description: "16 Leute oder acht Aushilfen",
        actions: [],
        isRepeatable: false
      },
      {
        id: 49,
        level: 9,
        name: "Backup 9",
        description: "18 Leute",
        actions: [],
        isRepeatable: false
      },
      {
        id: 50,
        level: 10,
        name: "Backup 10",
        description: "20 Leute oder 10 Aushilfen.",
        actions: [],
        isRepeatable: false
      }
    ],
    disadvantages: []
  },
  {
    id: 6,
    type: "backgrounds",
    name: "Segen",
    description: "Jemand da draußen hat seine Spuren bei dir hinterlassen. Diese Spuren sind meistens gut, haben aber auch komische Nebenwirkungen. Vielleicht findest du immer ein paar zusätzliche Euro, wenn du sie brauchst, musst aber die Rechnung übernehmen, wenn du mit den Mädels was trinken gehst. Vielleicht hast du Glück in der Liebe, findest aber keine dauerhafte Partnerschaft. Dieser Hintergrund gibt dir einen kleinen Vorteil, aber auch eine damit verbundene Eigenart. Im Spiel bedeutet „Segen”, dass du einen einzigen, kleinen, storybasierten Vorteil bekommst. Dieser Vorteil scheint aus einem Element deiner Charaktergeschichte zu kommen, das mit den Überzeugungen zusammenhängt, die deine Magie beeinflussen. Eine Akashic könnte sich zum Beispiel als von dem Windgott Fei Lian gesegnet betrachten, weil sie immer von einer leichten Brise gekühlt wird; eine Schwester von Hippolyta verirrt sich nie (ein Segen von Athene), während ein einäugiger Syndikat-Boss mit einem beunruhigenden Gefühl von körperlicher und energetischer Androgynität auch kleine Dinge zu wissen scheint, die niemand wissen sollte. (Niemand nennt den Boss tatsächlich Odin, aber das Bild von zwei Raben an der Wand des Bosses deutet auf eine gewisse Vertrautheit hin ...) Gleichzeitig wirkt dieser Vorteil ein wenig ... seltsam. Warum weht eine Brise in dieser verschlossenen Wohnung? Wie hast du den Weg durch dieses Labyrinth gefunden? Ist dieser Boss „er“ ... oder „sie“ ... oder ... ähm, ich glaube, ich nenne ihn einfach „Boss“. Dieses Gefühl der Seltsamkeit könnte als ständiger Teil der Resonanz angesehen werden, als Augenzwinkern deines Schutzgottes, als eine Eigenart lokaler Realitätsströme oder was auch immer sonst passend erscheint. Die naheliegende Erklärung ist, dass es ein Zeichen der Gestalt ist, die dich gesegnet hat, aber so etwas passiert in der realen Welt nicht, oder? Wie die unten aufgeführten Hintergründe „Traum“, „Legende“, „Frühes Leben“ und „Totem“ verbindet „Segen“ deinen Magier mit Kräften, die größer sind als er selbst. Obwohl diese Kräfte in den Augen deines Magiers aus seinen tiefen Überzeugungen zu stammen scheinen (und somit eine latente Form unkontrollierter Magie sein könnten), bleiben sie letztlich mysteriös. Odin wird nicht an der Tür des Chefs auftauchen und sagen: „Hey, rate mal, wer dich androgyn gemacht hat“, obwohl bestimmte storybasierte Eigenheiten die Antwort für jemanden, der mit der nordischen Mythologie vertraut ist, offensichtlich machen könnten. (Das Rabenbild, das eine Auge, die Art und Weise, wie Krähen immer vorbeifliegen, wenn der Chef spazieren geht, solche Dinge.) Der Charakter gibt vielleicht nicht zu, dass er oder sie an den Segen glaubt („Alte Wikingergötter? Lächerlich!“), aber es gibt eine anhaltende Verbindung, die tiefer geht, als irgendjemand ahnt. (Der Boss erinnert sich noch immer gerne an das Buch über nordische Mythologie aus der dritten Klasse ...) Wähle im Spiel eine nicht kampfbezogene, storybasierte Fähigkeit, die deinen Charakter mit einem ungewöhnlichen Talent segnet. Je höher die Bewertung, desto nützlicher wird dieses Talent. Im Gegensatz zum ursprünglichen Eintrag zu Segnungen im Leitfaden zu den Traditionen wird dieses Talent NICHT aus Sphäreneffekten, Vorzügen oder Schwächen ausgewählt, sondern ist eine kleine Wendung des Schicksals, die das Leben des Charakters in Bezug auf die Geschichte beeinflusst – siehe die Beispiele unten. (Der Hintergrund „Segnungen“ – eine offene Reihe von Superkräften mit widersprüchlichen Ursachen, Auswirkungen und Systemen – wurde für diese Ausgabe überarbeitet. Dein Segen-Talent muss bestimmten Richtlinien folgen: • Es basiert auf den Weltanschauungen des Charakters – kurz gesagt, seinem magischen Paradigma. • Es ist mit der persönlichen Geschichte deines Magiers verbunden, wahrscheinlich irgendwo in seiner Kindheit. • Es steht in Verbindung mit einer mächtigen übernatürlichen/mythischen/paranormalen Figur – einem Gott, einem Helden, einem Archetyp, einer Feenkönigin –, deren Gunst zu deinem Charakterkonzept passt. • Es hat keinen Einfluss auf den Kampf, außer vielleicht auf indirekte Weise (deine Messer bleiben scharf, du hast immer eine Kugel in der Kammer, deine Schläge haben filmreife Soundeffekte und so weiter). • Es hat auch keinen Einfluss auf Zauberwürfe. Obwohl ein Segen die Wahl der Sphären des Charakters beeinflussen kann und mit seinem Fokus verbunden sein sollte, ändert er nichts an der Schwierigkeit von Arete-Würfen beim Wirken von Zaubern. • Es ist kein offensichtliches Zeichen für übermenschliche oder unmögliche Phänomene (kein Fliegen, eiserne Haut, feurige Hände usw.) und könnte eine rationale, wissenschaftliche Erklärung haben. • Es hat eine entsprechende seltsame Eigenart, die ebenfalls auf der Geschichte basiert und deren Auswirkungen dem Segen folgen oder ihn widerspiegeln (eine seltsame Brise, ein Auge und eine Vorliebe für Raben, die Tendenz, immer die Richtung zu verwechseln, obwohl man sich nie verirrt, usw.). • Wenn der Charakter das Vertrauen seines offensichtlichen Schutzpatrons missbraucht – zum Beispiel durch eine schwere Beleidigung oder einen Religionswechsel – verschwindet der Segen. (Götter hassen Undankbarkeit ...) Diese Segnungen haben eine klare Verbindung zu der Figur, die deinen Charakter offenbar begünstigt: Ein Typ, der von Pan gesegnet ist, geht immer mit der attraktivsten Frau (oder dem attraktivsten Mann) im Club nach Hause, obwohl er ziemlich behaart ist und stark riecht; die von Allah gesegnete Frau hat ein Händchen für improvisierte Poesie, schreibt aber nie etwas davon auf; die von der Dame des Sees gesegnete Frau hat immer scharfe Messer dabei ... und sie schwimmt wirklich gerne; der Typ mit dem Spitznamen „Luzifer”? Nun, er ist eigentlich kein Teufel oder so, aber er scheint Leute zu allem überreden zu können ... und sieht seine Haut nicht ein bisschen ... rot aus? Segnungen sind nicht unfehlbar. In Situationen mit hohem Einsatz muss der gesegnete Charakter möglicherweise trotzdem würfeln, um erfolgreich zu sein. Wenn zum Beispiel der Typ Luzifer einen wichtigen Charakter zu einem wirklich verrückten Plan überreden will, muss sein Spieler dafür würfeln. Bei solchen Würfen zieht der Geschichtenerzähler pro Punkt in diesem Hintergrund einen Schwierigkeitsgrad von der üblichen Schwierigkeit der Aufgabe ab. Unser Luzifer hat zum Beispiel Segen 4 und zieht daher -4 vom Schwierigkeitsgrad seines Wurfs ab. Auch hier gilt: Ein Segen hat keinen Einfluss auf Kampfaktionen oder Zauberwürfe, also ändert er nichts an solchen Würfen. Wie schon erwähnt, passt dieser Hintergrund gut zu Schicksal, Legende, Vorleben und vor allem Totem. Der Spielleiter hat das letzte Wort über die Auswirkungen und Ausprägungen des Segens und kann einen Segen ablehnen, der nicht in seine Chronik passt, zu mächtig erscheint oder das Spiel zu sehr zugunsten dieses Charakters beeinflusst.",
    specialRules: TraitSpecialRules.None,
    advantages: [
      {
        id: 51,
        level: 1,
        name: "Segen 1",
        description: "Das Leben macht dir kleine Geschenke: Deine Klamotten sehen immer sauber und gebügelt aus, deine Küche wird nie richtig dreckig, du findest Geldscheine auf der Straße usw.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 52,
        level: 2,
        name: "Segen 2",
        description: "Kleine Dinge laufen wie von selbst: Du findest immer einen Parkplatz, gewinnst kleine Beträge, wenn du Lotto spielst, bekommst die Telefonnummer von Leuten, wenn du danach fragst, usw.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 53,
        level: 3,
        name: "Segen 3",
        description: "Du hast eine seltsame Affinität zu bestimmten Dingen: Dein Essen schmeckt immer gut, du verirrst dich nie und verlierst nie deine Schlüssel, Babys schlafen ein, sobald du anfängst, sie zu wiegen, usw.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 54,
        level: 4,
        name: "Segen 4",
        description: "Deine Begabung wird geradezu unheimlich: Kinder halten den Mund, sobald du es ihnen sagst, deine Vorschläge klingen immer vernünftig, du hast Erfolg bei jedem, der dir gefällt, usw.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 55,
        level: 5,
        name: "Segen 5",
        description: "Ein großer Segen begleitet dich: In deinem Portemonnaie und auf deinem Bankkonto ist immer noch ein Dollar übrig, in deiner Waffe ist noch eine letzte Kugel, du kennst Geheimnisse, die niemand wissen dürfte usw.",
        actions: [],
        isRepeatable: false
      }
    ],
    disadvantages: []
  },
  {
    id: 7,
    type: "backgrounds",
    name: "Zertifizierung",
    description: "In einer Zeit, in der man für alles Mögliche eine Genehmigung braucht, können die richtigen Zertifizierungen einem eine Menge Ärger ersparen. Vor diesem Hintergrund hat dein Charakter offizielle Papiere, die es ihm erlauben, bestimmte regulierte Tätigkeiten auszuüben: Jagen, Autofahren, Bedienen schwerer Maschinen, Ausüben eines medizinischen Berufs, Besitz bestimmter Waffen und so weiter. Im Allgemeinen sind solche Tätigkeiten mit Risiken verbunden, erfordern eine spezielle Ausbildung, wirken sich auf die Gesellschaft insgesamt aus oder sind eine Kombination aus allen dreien. Einfache Zertifizierungen, wie z. B. ein Angelschein, sind leicht zu bekommen, während wirklich gefährliche oder komplexe Tätigkeiten höhere Zertifizierungsstufen erfordern. Sofern dein Charakter nicht ohne entsprechende Ausbildung eine Genehmigung erhalten hat, benötigst du mindestens einen Punkt in einer entsprechenden Fähigkeit für jeden Punkt in diesem Hintergrund; eine ärztliche Zulassung würde beispielsweise mindestens vier Punkte in Medizin erfordern. Wenn dein Charakter die entsprechenden Fähigkeiten hat (oder die entsprechenden Bestechungsgelder gezahlt hat), kannst du Zertifizierungen für alternative Identitäten bekommen (siehe „Alternative Identität” oben), um einen Charakter mit den richtigen Papieren unter verschiedenen Namen darzustellen. Offizielle Zertifizierungen haben eine gewisse Sichtbarkeit. Zertifizierungen können von den Behörden überprüft werden, und obwohl eine Genehmigung für schwere Waffen dir den Besitz von schwerem Gerät ermöglicht, sorgt sie auch dafür, dass du einer der ersten bist, nach denen die Polizei sucht, wenn jemand mit solchen Waffen ein Verbrechen begeht!",
    specialRules: TraitSpecialRules.None,
    advantages: [
      {
        id: 61,
        level: 1,
        name: "Zertifizierung 1",
        description: "Jagdschein, Gewerbeschein, Reisepass für ein offenes Land usw. ",
        actions: [],
        isRepeatable: false
      },
      {
        id: 62,
        level: 2,
        name: "Zertifizierung 2",
        description: "Lehrbefähigungsnachweis, Karosseriebau-Lizenz, PADI-Zertifizierung, CPA, Lkw- oder Motorradführerschein, Grundgenehmigung für Schusswaffen usw.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 63,
        level: 3,
        name: "Zertifizierung 3",
        description: "Waffenschein, Gefahrgutentsorgungslizenz, kirchlich ordinierter Geistlicher, Rettungsschwimmer-Zertifizierung, Privatdetektiv-Lizenz, Privatpilotenlizenz usw.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 64,
        level: 4,
        name: "Zertifizierung 4",
        description: "Waffenschein der Klasse C, staatlich geprüfter Arzt oder Jurist, Berufspilotenlizenz, Geheimdienstmitarbeiter usw.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 65,
        level: 5,
        name: "Zertifizierung 5",
        description: "Diplomatische Immunität, Lizenz zum Töten.",
        actions: [],
        isRepeatable: false
      }
    ],
    disadvantages: []
  },
  {
    id: 8,
    type: "backgrounds",
    name: "Kapelle/Konstruktion",
    description: "In der gefährlichen Welt der Erwachten ist es immer gut, ein paar Gleichgesinnte und eine sichere Basis zu haben. Seit dem Goldenen Zeitalter der Magie nennt man solche Orte „Covenants“: Zentren, wo sich eine Gruppe verbündeter Magier ein Gebiet sichert, Ressourcen zusammenlegt und sich hilft und verteidigt, wenn es nötig ist. In späteren Jahren hat der Orden der Vernunft diese Idee übernommen und die Technokratische Union nach diesem Prinzip aufgebaut. Im 20. Jahrhundert nennen Magier der Tradition diese Orte „Chantries“, die Union nennt sie „Konstrukte“ und andere Magier nennen sie so, wie es kulturell angemessen klingt (Tempel, Loge, Moschee usw.). Im Spiel ist eine Chantry oder ein Konstrukt eine Operationsbasis. Ein Charakter mit diesem Hintergrund gehört zu einer solchen Basis und hat bestimmte Vorteile und Pflichten gegenüber der Gruppe, die diese Basis unterhält. Die meisten Agenten der Technokratie gehören standardmäßig zu einem Konstrukt – so funktioniert die Union nun einmal. Mystische Magier haben in dieser Hinsicht mehr Wahlmöglichkeiten, aber viele von ihnen gehören aus praktischen Gründen zu Chantries. Schließlich liegt in der Zahl die Stärke. Da die Regeln zur Charaktererstellung in Mage davon ausgehen, dass Anfänger neu im Spiel der Erwachten sind, beginnt ein Charakter mit diesem Hintergrund als rangniedriges Mitglied einer etablierten Festung. Sie profitiert davon, zu einer Gruppe älterer und erfahrenerer Kollegen zu gehören (die wahrscheinlich vom Spielleiter gespielte Charaktere sind), beginnt aber auch ganz unten in der Hackordnung. Die Älteren lassen sie Besorgungen und Aufgaben in der Chantry erledigen, und sie hat keinen politischen Einfluss innerhalb der Gruppe. Über dieses Stadium hinauszuwachsen, ist einer der Schlüssel zur Entwicklung eines jungen Magiers. Eine Gruppe mystischer Magier kann auch ihre eigene Chantry gründen, eine Option, die Technokraten nicht offensteht. (Die Union sieht solchen Individualismus nicht gerne.) Durch das Sammeln von Punkten unter den Mitgliedern kann die Gruppe die notwendigen Ressourcen zusammenbringen, um einen eigenen Ort zu errichten. Im Spiel spiegeln diese Baupunkte Zeit, Geld, Gefälligkeiten, Arbeit und andere Dinge wider, die für den Aufbau der Festung aufgewendet werden. (Ein punktebasiertes Bausystem war in „The Book of Chantries” enthalten, aber dieses System wurde inzwischen verworfen.) Je mehr Punkte die Gruppe sammelt, desto größer kann die Chantry werden. Sicherer Squat 10-20 Punkte Pool Kleiner Zufluchtsort 21-30 Punkte Pool Mystische Chantry 30-70 Punkte Pool Festung 71-100 Punkte Pool Machtzentrum 101+ Punkte Pool Eine Chantry oder ein Konstrukt kann jede Form annehmen, die angemessen erscheint. Eine könnte ein ländlicher Waldhain sein, eine andere ein verlassenes Kino, eine dritte ein abgelegenes verrücktes Labor und eine vierte könnte sich in einem Bürogebäude, einem Wikinger-Langhaus, einer Anwaltskanzlei oder einer Maschinenwerkstatt einrichten. Chantries und Konstrukte niedriger Stufen verfügen über einige weltliche Ressourcen – einige magische Schutzvorrichtungen, ein Sicherheitssystem, vielleicht eine Handvoll nicht erweckter Helfer, Kommunikationsdienste und so weiter. Auf der Ebene der Mystischen Chantry kann der Ort ein paar paranormale Ausstattungsmerkmale haben: Kristallkugeln, Portale zu Horizon Realms, Geistwächter und so weiter. Festungen und Machtzentren haben umfangreiche weltliche und magische/hypertechnologische Ressourcen; solche Orte sollten im Detail mit dem Storyteller ausgearbeitet werden und erfordern einen enormen Aufwand an Zeit, Macht, Arbeit und Materialien. Die Stabilität dieses Pools hängt von der fortgesetzten Zusammenarbeit und dem Überleben der Mitwirkenden ab. Wenn ein Magier aussteigt oder getötet wird, gehen seine Punkte verloren. Wenn die ganze Gruppe auseinanderbricht, gehen alle Punkte verloren und die Chantry löst sich auf. Überlebende Mitglieder können einige Erfahrungspunkte zusammenlegen und den Unterschied für den verlorenen Beitrag ausgleichen. Andernfalls reiht sich diese Chantry in die vielen zerbrochenen Gemeinschaften und Festungen ein, die in der Geschichte der Magier verstreut sind. Übrigens müssen andere Hintergründe, die mit der Chantry zusammenhängen, separat gekauft werden. Die folgenden Hintergründe können einer Chantry hinzugefügt werden: Verbündete, Arkanes, Verstärkung, Kult, Vertrauter, Einfluss, Bibliothek, Mentor, Knotenpunkt, Gönner, Gefolgsleute, Ressourcen, Spione und Wunder.",
    specialRules: TraitSpecialRules.None,
    advantages: [
      {
        id: 71,
        level: 2,
        name: "Kapelle 1",
        description: "Ein Poolpunkt oder Mitgliedschaft in einem winzigen Squat.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 72,
        level: 4,
        name: "Kapelle 2",
        description: "Zwei Poolpunkte oder Mitgliedschaft in einem kleinen\n" +
          "Refugium.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 73,
        level: 6,
        name: "Kapelle 3",
        description: "Drei Poolpunkte oder Mitgliedschaft in einer durchschnittlichen Kapelle oder Konstruktion.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 74,
        level: 8,
        name: "Kapelle 4",
        description: "Vier Poolpunkte oder Mitgliedschaft in einer Festung.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 75,
        level: 10,
        name: "Kapelle 5",
        description: "Fünf Poolpunkte oder Mitgliedschaft in einem Power Center.",
        actions: [],
        isRepeatable: false
      }
    ],
    disadvantages: []
  },
  {
    id: 9,
    type: "backgrounds",
    name: "Kontakte",
    description: "Du kennst Leute, die Sachen wissen. Auch wenn solche Kontakte nicht so hilfreich oder zuverlässig sind wie Verbündete, können sie dir dabei helfen, Infos zu sammeln, Nachrichten zu verbreiten, Fäden zu ziehen und kleine Gefälligkeiten einzulösen (Tickets für ein ausverkauftes Konzert zu ergattern, eine günstige Wohnung zu finden, ein Treffen mit dem Polizeichef zu organisieren und so weiter). Natürlich werden diese Leute auch gelegentlich deine Hilfe brauchen. Solange ihr euch gegenseitig helft, können diese Leute jedoch sehr nützlich sein. Die Art deiner Kontakte hängt vom Charakterkonzept und der Hintergrundgeschichte deines Charakters ab. Die Ausreißerin Jinx hätte zum Beispiel Kontakte in der Straßengemeinschaft, während der Manager Malcolm Kontakte in der Geschäftswelt hat. Innerhalb ihres Erfahrungsbereichs können Kontakte in der Regel geeignete Informationen finden oder weitergeben; Jinx könnte lernen, wie man ein Auto kurzschließt, und Malcolm könnte Daten über Automobilaktien beschaffen, aber weder Jinx noch Malcolm kennen wahrscheinlich jemanden, der ein Autokennzeichen zurückverfolgen könnte. Wenn du Kontakte außerhalb deines Fachgebiets suchst, kannst du jederzeit neue Kontakte knüpfen oder deine bestehenden Kontakte nutzen, um das zu finden, was du brauchst. (Im Spiel erhöht diese zweite Option die Schwierigkeit deines Wurfs um +2 oder mehr.) Wenn du deine Kontakte in Anspruch nimmst, würfle eine entsprechende soziale Eigenschaft + Kontakte. Die Schwierigkeit hängt von der Art der Informationen ab, die du verbreiten möchtest, oder von der Gefälligkeit, um die du bittest. Bei Erfolg bekommst du, was du brauchst, bei Misserfolg bekommst du fehlerhafte Daten, eine verstümmelte Nachricht oder gar keinen Nutzen. Ein Reinfall bedeutet, dass du jemanden verärgert hast; entweder verrät dich dein Kontakt oder er sagt dir, du sollst zur Hölle fahren, und entfernt sich dann für eine Weile aus deinem Netzwerk. Jeder Punkt in dieser Eigenschaft steht für einen wichtigen Kontakt, einen ausgearbeiteten Charakter wie einen Verbündeten. Du kannst auch zwanglose Kontakte knüpfen, wenn du einen erfolgreichen Wurf für Soziales oder Mentales + Kontakte machst, aber diese Quellen sind schwieriger zu handhaben (d. h. der Wurf hat einen höheren Schwierigkeitsgrad) und bei sensiblen Informationen nicht zuverlässig. Dieser Hintergrund kann mehr als fünf Punkte haben. Für Informationsnetzwerke, die mit sensiblen oder geheimen Informationen handeln, siehe Hintergrund: Spione.",
    specialRules: TraitSpecialRules.None,
    advantages: [
      {
        id: 81,
        level: 1,
        name: "Kontakte 1",
        description: "Ein Kontakt",
        actions: [],
        isRepeatable: false
      },
      {
        id: 82,
        level: 2,
        name: "Kontakte 2",
        description: "Zwei Kontakte",
        actions: [],
        isRepeatable: false
      },
      {
        id: 83,
        level: 3,
        name: "Kontakte 3",
        description: "Drei Kontakte",
        actions: [],
        isRepeatable: false
      },
      {
        id: 84,
        level: 4,
        name: "Kontakte 4",
        description: "Vier Kontakte",
        actions: [],
        isRepeatable: false
      },
      {
        id: 85,
        level: 5,
        name: "Kontakte 5",
        description: "Fünf Kontakte",
        actions: [],
        isRepeatable: false
      },
      {
        id: 86,
        level: 6,
        name: "Kontakte 6",
        description: "Sechs Kontakte",
        actions: [],
        isRepeatable: false
      },
      {
        id: 87,
        level: 7,
        name: "Kontakte 7",
        description: "Sieben Kontakte",
        actions: [],
        isRepeatable: false
      },
      {
        id: 88,
        level: 8,
        name: "Kontakte 8",
        description: "Acht Kontakte",
        actions: [],
        isRepeatable: false
      },
      {
        id: 89,
        level: 9,
        name: "Kontakte 9",
        description: "Neun Kontakte",
        actions: [],
        isRepeatable: false
      },
      {
        id: 90,
        level: 10,
        name: "Kontakte 10",
        description: "Zehn Kontakte",
        actions: [],
        isRepeatable: false
      }
    ],
    disadvantages: []
  },
  {
    id: 10,
    type: "backgrounds",
    name: "Kult",
    description: "Jeder Magier mit Charisma kann Freunde haben; dieser Kult geht aber über bloße Freundschaft hinaus. Diese Anhänger vertrauen und verehren dich so sehr, dass sie, wenn sie versammelt und angeleitet werden, ihren Glauben in deine Rituale einbringen können. Die Art deines Kults ist nicht wichtig. Du könntest eine religiöse Persönlichkeit mit einer Gemeinde sein, ein Künstler mit besonders treuen Fans, ein Professor, dessen Studenten ihn regelrecht verehren, oder etwas Ähnliches. Was zählt, ist der Glaube: Dein Kult sieht dich als jemanden, der Wunder vollbringt, und sie wollen Teil dieser Magie sein ... und das sind sie auch. Wie unter „Verbündete, Assistenten und Kulte“ und „Gemeinsam handeln“ (Kapitel 10, S. 532 und S. 542–543) beschrieben, erhöht eine Gruppe von Assistenten, die einen gemeinsamen Glauben teilen, den Würfelpool des Zauberers bei einem Ritual, das mit ihrer Hilfe durchgeführt wird. Solche Rituale können entweder mystische Künste oder Technomagie beinhalten, solange alle mitmachen. In den meisten Fällen müssen alle beteiligten Charaktere während des Rituals denselben physischen Raum einnehmen; eine mögliche Ausnahme könnte für eine vernetzte Gruppe gemacht werden, die durch Gedankenzauber oder Konferenztechnologie (eine LAN-Party, Videokonferenz usw.) verbunden ist. Auch hier müssen die Helfer jedoch absolut überzeugt sein und – zumindest für den Moment – frei von äußeren Ablenkungen sein. Kultmitglieder sind typische Schläfer: Sie sind nicht besonders geschickt oder versiert, abgesehen von ihrem absoluten Vertrauen in dich. Mächtige Helfer sind Verbündete, Unterstützer, Gefolgsleute oder andere wichtige Charaktere. Diese Leute haben aber einen wichtigen Grund, an das zu glauben, was du tust. Du musst also ihr Vertrauen rechtfertigen. Wenn du ihr Vertrauen willst, dann musst du zumindest so wirken, wie sie es von dir erwarten. Wenn ihr Glaube ins Wanken gerät, verlierst du die Vorteile dieses Hintergrunds. Natürlich kann ein Kult auch größer sein – ein beliebter Evangelist kann Hunderte von Anhängern haben. Ab einem bestimmten Punkt können sie dir aber nur noch begrenzt helfen. Der Rang mit fünf Punkten in diesem Hintergrund bietet den maximalen Vorteil für einen Kult.",
    specialRules: TraitSpecialRules.None,
    advantages: [
      {
        id: 91,
        level: 1,
        name: "Kult 1",
        description: "Kleiner Kult: 3–7 Leute. Leg einen Würfel zum Würfelvorrat eines Rituals dazu, das mit der Hilfe dieser Gruppe gewirkt wird.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 92,
        level: 2,
        name: "Kult 2",
        description: "Kleiner Kult: 8–12 Leute. Wenn diese Gruppe zusammenkommt, kannst du bei Ritualen zwei Würfel mehr werfen.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 93,
        level: 3,
        name: "Kult 3",
        description: "Kleine Kult: 13–17 Leute. Bei Ritualen, die mit der ganzen Gruppe gemacht werden, kannst du drei Würfel dazuwerfen.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 94,
        level: 4,
        name: "Kult 4",
        description: "Große Kult: 18–22 Leute. Leg vier Würfel zu den Ritualen dazu, die mit dieser Gruppe gemacht werden.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 95,
        level: 5,
        name: "Kult 5",
        description: "Riesiger Kult mit 23 bis 30 Leuten. Wenn der ganze Kult zusammen ist, kannst du fünf Würfel zu den Ritualen hinzufügen.",
        actions: [],
        isRepeatable: false
      }
    ],
    disadvantages: []
  },
  {
    id: 11,
    type: "backgrounds",
    name: "Lehnsgut",
    description: "Der Geist einer Magierin ist ihre Burg. Dort kann sie allem entfliehen und sich in eine Welt zurückziehen, die sie selbst erschaffen hat. In klassischen und Renaissance-Abhandlungen wird von Gedächtnispalästen gesprochen, in denen eine Person in ihrem Geist eine Struktur aufbaut, die ihr bei der Meditation, beim Lernen, beim Nachdenken und natürlich beim Erinnern hilft. Diese Konstrukte, die aus dem Bewusstsein des Erbauers entstehen, haben keine physische Form, bieten aber dennoch eine Art Zufluchtsort. Mit diesem Hintergrund hast du einen solchen Ort. Kosmologisch gesehen existiert ein Demesne in der Maya als ein semipermanentes Traumreich, das von deinem träumenden Geist inspiriert ist. Dieses Reich könnte etwas sein, das du absichtlich mit dem Talent „Klarträumen” erschaffen hast, oder es könnte an einem Ort existieren, der von deiner unterbewussten Vorstellungskraft heraufbeschworen wurde. So oder so folgt es den Vorgaben deines Bewusstseins und enthält Elemente, die für dich persönlich von Bedeutung sind. Dein Geist könnte einen Tempel errichten, den niemand entweihen kann, ein Blumenfeld zu Ehren deiner Geliebten, eine Bildergalerie, die Menschen oder Orte verewigt, an die du dich erinnern möchtest ... wenn du es träumen kannst, kannst du es erschaffen ... auch wenn du deine Schöpfung vielleicht nicht mehr kontrollieren kannst, sobald das Demesne existiert. Dieses Demesne ist vielleicht kein angenehmer Ort. Auch Alpträume, Stille, Selbstmordgedanken oder andere dunkle Neurosen können ein Demesne hervorbringen. Vielleicht möchtest du ein Albtraumreich erschaffen, entweder als Testgelände, als Fegefeuer oder als Spiegelbild deiner Liebe zu Horrorfilmen. Ob angenehm oder nicht, das Reich kann klein, beeindruckend oder riesig sein. Du selbst weißt vielleicht nicht, wie weitläufig es sein kann. Schließlich steckt unser Geist voller Überraschungen ... Im Spiel spiegelt der Hintergrundwert den Grad deiner Kontrolle über diesen Ort wider, sobald er einmal geschaffen ist. Bei niedrigen Werten kannst du das Reich besuchen, aber nicht beherrschen, während du bei höheren Werten fast jedes Detail deines Reiches bestimmen kannst. (Siehe auch den Eintrag „Klarträumen” auf Seite 294.) Leg das Aussehen und die Beschaffenheit deines Herrschaftsgebiets fest, wahrscheinlich in Zusammenarbeit mit deinem Spielleiter ... der sicherlich einige eigene Elemente hinzufügen wird. Wenn dein Charakter träumt oder meditiert, kann er sein Herrschaftsgebiet mit einem erfolgreichen Wurf auf Wahrnehmung + Herrschaftsgebiet besuchen. Die Schwierigkeit hängt von deiner Situation ab: Unter normalen Umständen wäre die Schwierigkeit 5 oder 6, während der Versuch, es unter schwierigen Umständen (z. B. während einer Folter oder anderen Herausforderungen) zu erreichen, eine Schwierigkeit von 7 bis 9 hätte. Sobald er angekommen ist, kann das Bewusstsein des Charakters frei im Herrschaftsgebiet umherwandern. Obwohl körperliche oder seelische Belastungen das Reich stören können, ist es dennoch ein vertrauter – wenn auch nicht immer einladender – Ort. Ein Demesne hat nichts Physisches an sich. Man begibt sich nicht physisch dorthin und kann auch nichts Physisches aus diesem Reich mitnehmen. Stattdessen schickt ein Reisender seine Astralform in dieses Demesne und lässt seinen Körper zurück. Details dazu findest du unter „Astralreisen” in den Kapiteln Vier und Neun (S. 87) und (S. 476–478). Allerdings brauchst du keine Geistesstärke 3 oder höher, um dein persönliches Demesne zu betreten – die Hintergrundeigenschaft kümmert sich um die Reisevorbereitungen. Ein Magier, der astral reisen kann, kann jedoch aus dem Demesne hinauswandern und von dort aus andere Traum- oder Astralwelten erreichen. Im Demesne spiegelt dein Aussehen deinen Geisteszustand wider. Wenn du ruhig bist, luzid träumst oder es geschafft hast, deine ideale Astralform zu projizieren, siehst du so aus, wie du willst. Unter anderen Umständen könnte deine Besucherform Stress, Angst oder Unsicherheiten verraten, mit denen du in der physischen Welt zu kämpfen hast. Mit einem erfolgreichen Wits + Demesne (oder Lucid Dreaming)-Wurf kannst du dein Aussehen an diesem Punkt anpassen ... und ähnliche Würfe können dir helfen, auch die Traumlandschaft zu verändern. Große Veränderungen erfordern natürlich mehrere Erfolge – siehe oben für mögliche Schwierigkeiten. Da das Demesne selbst den mentalen Zustand seines Schöpfers widerspiegelt, kannst du dich auch mit inneren Problemen innerhalb der Grenzen des Traumreichs auseinandersetzen. Ein erfolgreicher Wurf auf Wahrnehmung + Demesne ermöglicht es dir, unbewusste Konflikte zu entschlüsseln und herauszufinden, was unter der Oberfläche vor sich geht. In diesem Zusammenhang kannst du auch versuchen, auf Erinnerungen zuzugreifen, die im gesamten Demesne versteckt sein könnten. In diesem Fall würfelst du Intelligenz + Meditation oder Demesne (je nachdem, welcher Wert höher ist), wobei die Schwierigkeit und die Anzahl der Erfolge von der Unklarheit dieser Informationen abhängen. Der Name deiner letzten Freundin wäre leicht zu finden, aber der Name des Kindes, das in der dritten Klasse neben dir saß, wäre deutlich schwieriger zu erinnern. Ein geschickter Gedankenzauberer (d. h. Gedankenkontrolle 3 für eine schlafende Person, Gedankenkontrolle 4 für eine wache Person) kann auch das Bewusstsein anderer Menschen in sein Demesne ziehen. Wenn diese Person nicht in das Demesne eintreten möchte, kommt es zu einem Willenskraft-gegen-Willenskraft-Wettstreit (siehe „Widerstand geleistete Aktionen” in Kapitel 8, S. 390), wobei der Gewinner sein Ziel erreicht. Jemand, der gegen den Traum ankämpft, kann alle paar Runden würfeln, um das Reich zu verlassen; bis der Wurf gelingt, ist dieser Charakter aber gefangen. Auch hier geht's nicht um eine physische Falle, obwohl es ziemlich schrecklich sein kann, im Albtraum von jemand anderem festzustecken ... Wenn dein Magier in eine Stille fällt, kannst du seine Willenskraft (Schwierigkeitsgrad 9) würfeln, um in dein Demesne zu gelangen; dort ist er zwar immer noch in der Gedankenwelt gefangen, aber zumindest ist es vertrautes Terrain. Ein paar erfolgreiche Wahrnehmungs- + Demesne-Würfe könnten ihn wieder herausführen. Siehe „Stille” in Kapitel 10 (S. 554-561).",
    specialRules: TraitSpecialRules.None,
    advantages: [
      {
        id: 101,
        level: 1,
        name: "Lehnsgut 1",
        description: "Du kommst ab und zu mal ins Reich. Du kennst den Namen und ein paar wichtige Sachen.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 102,
        level: 2,
        name: "Lehnsgut 2",
        description: "Als regelmäßiger Besucher hast du das Anwesen schon oft bereist.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 103,
        level: 3,
        name: "Lehnsgut 3",
        description: "In deinen Träumen kennst du diesen Ort ziemlich gut.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 104,
        level: 4,
        name: "Lehnsgut 4",
        description: "Das ist dein Reich, und auch wenn du nicht über alles und jeden darin bestimmen kannst, kennen und erkennen dich die Leute dort als jemanden mit Autorität an.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 105,
        level: 5,
        name: "Lehnsgut 5",
        description: "Herr oder Herrin des Lehens, du kennst und regierst dieses Reich, als wäre es dein Königreich ... denn das ist es auch.",
        actions: [],
        isRepeatable: false
      }
    ],
    disadvantages: []
  },
  {
    id: 12,
    type: "backgrounds",
    name: "Schicksal",
    description: "Du bist ein Auserwählter, dazu bestimmt, eine wichtige Rolle im kosmischen Drama zu spielen. Prophezeiungen deuten auf deine zukünftige Größe hin, statistische Analysen weisen auf deine Bedeutung hin. Vor allem aber weißt du, dass du dazu bestimmt bist, etwas Besonderes zu sein. Wenn die Lage düster erscheint, kannst du dich auf dieses Wissen berufen, um sie zu meistern. Einmal pro Spielsitzung kannst du dich auf dieses Schicksalsgefühl berufen, wenn du vor einer schwierigen Herausforderung oder in einer schwierigen Lage stehst. Wenn du vor dieser Krise alle deine Willenskraftpunkte verbraucht hast, kannst du deinen Schicksalswürfelpool gegen Schwierigkeitsgrad 8 würfeln. Mit jedem Erfolg, den du würfelst, bekommst du sofort einen Willenskraftpunkt zurück. Mit diesem wiedergewonnenen Selbstvertrauen kannst du der Niederlage oder dem Tod entgehen und einen weiteren Tag leben, um die Pläne des Schicksals für dich zu verwirklichen. Irgendwann wirst du aber doch deinem endgültigen Schicksal gegenüberstehen. An diesem Tag sagt der Spielleiter: „Es ist dein Moment des Schicksals. Stell dich dieser Krise ganz allein!“ In diesem Moment hast du keine Sonderwürfe mehr. Was auch immer das Schicksal für dich bereithält, es liegt an dir, dieses Schicksal zu erfüllen. Wenn du diese Begegnung überlebst und etwas Denkwürdiges erreichst, verschwindet dieser Hintergrund und wird vielleicht durch einen anderen Hintergrund ersetzt (Entscheidung des Spielleiters), der die dramatische Veränderung deines Lebens widerspiegelt. Wenn du scheiterst, bleibst du mit dem Wissen zurück, dass das Schicksal dich herausgefordert hat und du der Aufgabe nicht gewachsen warst.",
    specialRules: TraitSpecialRules.None,
    advantages: [
      {
        id: 111,
        level: 1,
        name: "Schicksal 1",
        description: "Ein kleines Schicksal; wirf einen Würfel.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 112,
        level: 2,
        name: "Schicksal 2",
        description: "Du bist wichtig; wirf zwei Würfel.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 113,
        level: 3,
        name: "Schicksal 3",
        description: "Du bist wichtig; wirf drei Würfel.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 114,
        level: 4,
        name: "Schicksal 4",
        description: "Du bist für Großes bestimmt; wirf vier Würfel.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 115,
        level: 5,
        name: "Schicksal 5",
        description: "Bald wirst du 'ne Legende sein; wirf fünf Würfel.",
        actions: [],
        isRepeatable: false
      }
    ],
    disadvantages: []
  },
  {
    id: 13,
    type: "backgrounds",
    name: "Traum/Hypercram",
    description: "Wissen ist für einen Magier das Wichtigste. Weil sie eine Art Verbindung zum kosmischen Bewusstsein haben, können manche Magier auf Infos zugreifen, die sie nicht selbst gelernt oder geübt haben. Nachdem sie sich ein bisschen Zeit zum Meditieren genommen haben (oder, im Fall von Technokraten und anderen wissenschaftlich denkenden Willensarbeitern, zum Hypercram), können solche Magier vorübergehend auf den Reichtum an Wissen und Erfahrung zugreifen, der da draußen vorhanden ist, und so Fähigkeiten kanalisieren, die sie normalerweise nicht besitzen. In der Geschichte nimmt sich dein Charakter eine kurze Zeit, um sich auf eine bestimmte Situation zu konzentrieren. Je komplexer die Situation ist, desto länger dauert es, darüber zu meditieren. Die Form der Konzentration hängt vom Fokus des Magiers ab und kann von einer BDSM-Sitzung bis zu einer anstrengenden Nacht in der Bibliothek reichen. Ein Gelehrter könnte sich in die Bücher vertiefen und sich in das Studium für eine bevorstehende Prüfung verlieren; ein heidnischer Seher könnte durch den Wald spazieren und sich den Geistern dieses Ortes zuwenden. Spider Chase könnte Feuer spinnen, während Zafira Angelita um die Führung Gottes betet. Im Spiel würfelst du Wahrnehmung + Traum (Schwierigkeitsgrad 6), um Einblicke in die jeweilige Frage zu gewinnen. Solange dein Charakter während seiner Meditationsübung nicht unterbrochen wurde, kann er auf ein gewisses Maß an frei verfügbarem Wissen zurückgreifen, das sich mit der Situation befasst. Wenn der Wurf auf Wahrnehmung + Traum erfolgreich war, kannst du deinen Traumwert durch eine andere Fähigkeit ersetzen, die mit dem Thema deiner Konzentration zusammenhängt. Wenn der Charakter diese Fähigkeit normalerweise nicht hat, kann er sie trotzdem für eine einzige ununterbrochene Aufgabe nutzen, vorausgesetzt, er hat an diesem Tag über ein verwandtes Thema meditiert; wenn er diese Fähigkeit hat, kann er den Traumwert anstelle dieser Fähigkeit verwenden – eine Eigenschaft addiert sich nicht zur anderen. Nehmen wir zum Beispiel an, Spider steht vor einem großen Kampf gegen einen Gegner, der wirklich weiß, was er tut. Ihre geringe Fähigkeit „Schlägerei” reicht dafür nicht aus, also meditiert sie, während sie Feuer wirbelt. In ihrer Vorstellung fliegt Spider mit atemberaubender Geschwindigkeit durch komplexe Katas. Spiders Spieler würfelt vier Erfolge auf den Wurf „Wahrnehmung + Traum” und so verfügt Spider während dieses Kampfes – und nur für die Dauer dieses Kampfes – über vier Punkte „Kampfkunst”, eine Fähigkeit, die sie normalerweise nicht besitzt. Nach dem Kampf verschwindet Spiders Fähigkeit wieder; sie kann sich beim besten Willen nicht daran erinnern, was sie gerade getan hat. Dieser Hintergrund ist nicht zuverlässig. Man bekommt vielleicht eine Fähigkeit, die man nicht erwartet hat, und man kann sich nicht an das festhalten, was man weiß – es ist eher ein Gefühl als eine Gewissheit. Die durch den Traum verliehene Fähigkeit hält für die Dauer einer notwendigen Aufgabe an – einen Kampf, eine Prüfung, eine Vorstandssitzung, ein Rennen und so weiter – und kann nur zur Erfüllung dieser Aufgabe eingesetzt werden. Der Traum kann nur einmal pro Tag genutzt werden, und obwohl die Spielerin angeben kann, was sie lernen möchte, trifft der Spielleiter die endgültige Entscheidung über die durch diesen Traum verliehene Fähigkeit.",
    specialRules: TraitSpecialRules.None,
    advantages: [
      {
        id: 121,
        level: 1,
        name: "Traum/Hypercram 1",
        description: "In Trance kommen einem echt hilfreiche Ideen. Zwei Würfel für die Aufgabe.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 122,
        level: 2,
        name: "Traum/Hypercram 2",
        description: "In Trance kommen einem echt hilfreiche Ideen. Zwei Würfel für die Aufgabe.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 123,
        level: 3,
        name: "Traum/Hypercram 3",
        description: "Deine Meditationen bringen echt was. Drei Würfel für die Aufgabe.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 124,
        level: 4,
        name: "Traum/Hypercram 4",
        description: "Aus einer Trance kannst du echt coole Infos ziehen. Vier Würfel für die Aufgabe.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 125,
        level: 5,
        name: "Traum/Hypercram 5",
        description: "Du hast direkten Zugang zum kollektiven Bewusstsein. Wenn du dich konzentrierst, kannst du unglaubliche Dinge wahrnehmen. Fünf Würfel für diese Aufgabe.",
        actions: [],
        isRepeatable: false
      }
    ],
    disadvantages: []
  },
  {
    id: 14,
    type: "backgrounds",
    name: "Berühmtheit",
    description: "Aus irgendeinem Grund bist du in der Sleeper-Welt echt bekannt. Vielleicht bist du ein Hip-Hop-Star, Politiker, Sportler oder Teil der schnelllebigen Promi-Szene, die durch YouTube und Reality-TV entstanden ist. Unter Leuten, die sich auskennen, giltst du als Berühmtheit; je höher deine Bewertung, desto größer dein Ruhm. Diese Eigenschaft ist echt ein zweischneidiges Schwert, macht dich aber ziemlich bekannt. Die Behörden werden dich eher in Ruhe lassen (es sei denn, sie wollen ein Exempel an dir statuieren ...), Fans werden dir eine gewisse Ehrerbietung entgegenbringen, und die Leute werden Dinge von dir glauben, die sie von einer normalen Person nicht akzeptieren würden. Klar, diese Kung-Fu-Superstarin kann ein Loch in eine Ziegelmauer treten – hast du nicht ihren letzten Film gesehen? Und hey, wenn dieser Typ mich so ansehen würde, würde ich auch ohnmächtig werden! Ruhm verleiht Status auf Kosten der Sichtbarkeit und lässt dich mit Zufällen davonkommen, die nur wenige andere Leute schaffen würden. Dieser Hintergrund ergänzt auch soziale Eigenschaften, wenn du versuchst, Dinge zu erledigen. Ein erfolgreicher Charisma-, Manipulation- oder Aussehen + Ruhm-Wurf kann dir viele Türen öffnen. Natürlich werden dich die Leute auch erkennen, also rechne nicht damit, dass du diese kostenlosen Flugtickets erschwindeln oder an den Sicherheitsleuten vorbeikommen kannst, ohne dass sich jemand daran erinnert, dass du das getan hast. Im Zeitalter von Handykameras, YouTube und Überwachungskameras ist es für eine berühmte Person schwer, mit solchen Dingen davonzukommen. Wenn du in der Öffentlichkeit einen Zauber wirkst, gibt es im Handumdrehen Videos davon im Internet. Ruhm ist auch vergänglich, besonders in dieser Zeit der Wegwerf-Prominenten. In der Geschichte musst du immer wieder große Taten vollbringen, um in Erinnerung zu bleiben. Und genauso wie es Leute gibt, die dich für das, was du tust, lieben, gibt es auch Leute, die dich dafür hassen. Ruhm bringt Stalker, Hasser, Kritiker und Diebe mit sich ... und wenn du die nicht in deinem Leben haben willst, warum hast du dich dann entschieden, BERÜHMT zu werden ...?",
    specialRules: TraitSpecialRules.None,
    advantages: [
      {
        id: 126,
        level: 1,
        name: "Berühmtheit 1",
        description: "Innerhalb einer bestimmten Subkultur kennen die Leute deinen Namen. Vielleicht warst du mal bekannter, aber diese Zeiten sind längst vorbei.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 127,
        level: 2,
        name: "Berühmtheit 2",
        description: "Als lokale Berühmtheit kennst du alle wichtigen Leute in deiner Gemeinde.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 128,
        level: 3,
        name: "Berühmtheit 3",
        description: "Jemand, der bekannt ist, wird von vielen Leuten erkannt.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 129,
        level: 4,
        name: "Berühmtheit 4",
        description: "Als nationale oder vielleicht sogar internationale Persönlichkeit bist du bei vielen Leuten bekannt.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 130,
        level: 5,
        name: "Berühmtheit 5",
        description: "Du bist fast überall bekannt.",
        actions: [],
        isRepeatable: false
      }
    ],
    disadvantages: []
  },
  {
    id: 15,
    type: "backgrounds",
    name: "Einfluss",
    description: "Du genießt in der Welt der Schläfer Aufmerksamkeit und Respekt. Vielleicht bist du eine Berühmtheit, ein Bandenchef, ein Politiker oder ein Sektenführer ... oder vielleicht hast du einfach nur viele einflussreiche Freunde. So oder so, wenn du sprichst, hören dir die Leute zu und gehorchen dir oft. Im Allgemeinen spiegelt dieser Hintergrund ein gewisses Maß an sozialer Ehrerbietung wider, die dir auch ohne Würfelwurf zuteilwird. Wenn eine einflussreiche Person einen Raum betritt, wird das bemerkt; die Leute benehmen sich entsprechend, kleine Gefälligkeiten werden angeboten, unmögliche Vereinbarungen werden plötzlich zu deinen Gunsten getroffen ... solche Sachen eben. Durch die Kombination von sozialen Attributen mit diesem Hintergrund (z. B. Manipulation + Einfluss) kannst du dein Mojo bei den entsprechenden Parteien einsetzen. Mentale Attribute (wie Wahrnehmung + Einfluss) helfen dir, Informationen über dein soziales Netzwerk zu finden oder zu sichern. Und obwohl körperliche Eigenschaften dir nicht dabei helfen, durch deinen Einfluss etwas zu erreichen, kann eine auffällige sportliche Leistung (z. B. Ausdauer + Einfluss, um eine dieser „Niemand könnte DAS überleben!“-Stunts widerzuspiegeln) eine große Anzahl von Menschen beeindrucken, wenn du etwas tust, das viele Menschen sehen können. Um den Ruhm bestimmter Personen widerzuspiegeln, kann dieser Hintergrund bis zu 10 betragen. Denk aber daran, dass berühmte und einflussreiche Leute leicht zu erkennen sind und oft Verantwortung für viele Leute tragen (und dafür zur Rechenschaft gezogen werden). Einfluss ist in dieser Hinsicht ein zweischneidiges Schwert, und unkluge Handlungen können deinen Einflusswert senken. Klar, du kannst in ein Restaurant gehen und Leute wie Dreck behandeln – rechne aber mit einigen unangenehmen Reaktionen in den sozialen Medien, sobald du dich umdrehst ...",
    specialRules: TraitSpecialRules.None,
    advantages: [
      {
        id: 131,
        level: 1,
        name: "Einfluss 1",
        description: "Leute in deinem Beruf erkennen dich an.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 132,
        level: 2,
        name: "Einfluss 2",
        description: "Du hast ein paar Leute, die dir helfen, und ein bisschen Einfluss.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 133,
        level: 3,
        name: "Einfluss 3",
        description: "Die Leute in deinem Bereich finden deine Fähigkeiten echt gut.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 134,
        level: 4,
        name: "Einfluss 4",
        description: "Du hast echt viel Einfluss.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 135,
        level: 5,
        name: "Einfluss 5",
        description: "Du bist echt stark.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 136,
        level: 6,
        name: "Einfluss 6",
        description: "Du hast Einfluss auf die Politik deines Landes.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 137,
        level: 7,
        name: "Einfluss 7",
        description: "Deine Handlungen beeinflussen verschiedene verbündete Nationen.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 138,
        level: 8,
        name: "Einfluss 8",
        description: "Du genießt in ganzen Kulturregionen großen Respekt.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 139,
        level: 9,
        name: "Einfluss 9",
        description: "Deine Macht reicht über ganze gesellschaftspolitische Bereiche. (Die EU, die UNO, der ANC usw.)",
        actions: [],
        isRepeatable: false
      },
      {
        id: 140,
        level: 10,
        name: "Einfluss 10",
        description: "Dein Einfluss erstreckt sich über die Welt der Sterblichen, und sogar in den Anderswelten wird dir Respekt entgegengebracht.",
        actions: [],
        isRepeatable: false
      }
    ],
    disadvantages: []
  },
  {
    id: 16,
    type: "backgrounds",
    name: "Legende",
    description: "Die kollektive Vorstellungskraft der Menschheit dreht sich um dich. Auch wenn du vielleicht nicht wirklich die Reinkarnation von König Artus oder Biggie Smalls bist, erinnerst du auf einer ursprünglichen Ebene an diese Figuren. Die Leute sehen dich als Legende und erwarten deshalb Legendäres von dir. So fungierst du als wandelnder Knotenpunkt, der seine eigene Quintessenz – und möglicherweise auch die Quintessenz anderer Menschen – aufladen kann, indem er der mit ihm verbundenen Legende gerecht wird. Wähle für deine Geschichte eine Legende aus und gestalte deinen Charakter dann nach einigen bekannten Elementen dieser Figur. Rotkäppchen würde einen purpurroten Kapuzenpulli tragen und sich dorthin verirren, wo sie nicht hingehen sollte; Popeye würde seltsam reden, Spinat essen und sich in viele Kämpfe verwickeln lassen. Unser Medienzeitalter schafft Legenden, daher könnte dein Vorbild eine Figur aus der Popkultur sein, auch wenn die Kraft solcher Legenden nicht sehr tiefgreifend ist. Je mehr du der Legende gerecht wirst, desto mehr Energie verleiht sie dir. Im Spiel kannst du deinen Legendenhintergrund nicht mehr als einmal pro Geschichte würfeln. Jeder Erfolg füllt einen Punkt Quintessenz in deinem Pool auf. (Es ist ratsam, einen hohen Avatar-Wert zu wählen, wenn du diesen Hintergrund hast.) Die Schwierigkeit dieses Wurfs hängt davon ab, wie bekannt diese Legende an deinem aktuellen Standort ist; wenn du Sun Tzu verkörperst, könntest du in einer chinesischen Militärakademie viel Anerkennung bekommen, aber der durchschnittliche US-Bürger würde sagen: „Sun WER?“ Die Mindestschwierigkeit des Wurfs ist 6; wenn deine Legende unbekannt ist, kann sie bis zu 9 betragen. Einmal pro Geschichte kannst du auch Gegenstände mit Quintessenz versehen – sie in Tass verwandeln –, wenn sie etwas damit zu tun haben, dass du deiner Legende gerecht wirst. Eine Colt .45, die von einem modernen Jesse James benutzt wurde, würde zum Beispiel durch diese Verbindung eine gewisse Energie bekommen. Solche Gegenstände haben eine starke Ausstrahlung; selbst Schläfer spüren etwas Besonderes an Jimi Hendrix' Gitarre. Charaktere, die Quintessenz nutzen können, können diese Tass für ihre eigenen Zwecke nutzen. Jeder Punkt in diesem Hintergrund ermöglicht es dir, entweder einen einzelnen Gegenstand mit der gesamten Quintessenz des Hintergrundwertes zu versehen oder einen Gegenstand mit einem einzigen Punkt Tass pro Punkt im Hintergrund zu versehen. Legende 5 würde also entweder einen einzelnen Gegenstand mit fünf Punkten Quintessenz füllen oder fünf verschiedene Gegenstände mit jeweils einem Punkt Quintessenz versehen. Sobald diese Tass verbraucht ist, ist sie bis zur nächsten Geschichte weg. Andere erweckte Charaktere können ihre Avatare auch von dir aufladen, wenn sie eine aktive Rolle in deiner Legende spielen. Ein Fan von James Dean, ein Trinkkumpel von Janis Joplin, ein Magier, der mit dem wiedergeborenen Lancelot an der Tafelrunde sitzt – diese Charaktere können auch von diesem wandelnden Knotenpunkt-Effekt profitieren, solange sie im Laufe dieser bestimmten Geschichte an der Legende teilgenommen haben. (Technokraten können diesen Hintergrund auch haben; der wiedergeborene Lancelot könnte ein Cyborg mit einer besonders edlen Persönlichkeit und einem wirklich aktiven Traumleben sein.) Gegenstände oder Tiere können den Hintergrund „Legende” haben, mit denselben Kräften wie die Legende eines Charakters. In diesem Fall erfordert das Element „der Legende gerecht werden”, dass andere Menschen an ihre Verbindung zu dieser Legende glauben. Hendrix' Sunburst Stratocaster könnte eine Legende für sich sein, ein Objekt der Verehrung für Musikliebhaber überall. Eine Magierin, die diese Gitarre in die Hände bekommt, könnte ihren Avatar aufladen, indem sie das Instrument spielt ... was erklärt, warum bestimmte Objekte unter Leuten, die wissen, was sie sind, so begehrt sind und warum Menschen immer wieder weiße Büffel und Der Hirsch töten, wenn sie auftauchen. Legendäre Objekte und Tiere sollten aber Eigentum des Erzählers bleiben. Wenn der Erzähler einem Charakter erlaubt, dieses Objekt oder Tier zu erwerben, wird es zu einem Schatz oder Verbündeten. In allen Fällen hat diese Quintessenz auch eine legendäre Resonanz. Der Rauch eines Joints, den Monsieur Zig Zag herumgereicht hat, wird auch 2015 noch Erinnerungen an die 1960er Jahre wecken, und leise Echos von „Ahiii-ahiii-ahhhh!!!“ folgen den Spuren eines Mannes ohne Namen. Lizzie Bordens Beil macht den Leuten Angst, obwohl die echte Lizzie Borden damit niemanden umgebracht hat. Diese Kraft des Glaubens haftet an der Essenz einer Legenden-Eigenschaft. Menschen, die von einer Legende berührt wurden, wissen, dass sie Teil von etwas Außergewöhnlichem waren. Dieser Hintergrund passt gut zu den folgenden Hintergründen: Schicksal, Frühere Leben und Totem sowie zu bestimmten Vorzügen und Schwächen. Natürlich brauchst du einen überzeugenden Grund, um den Hintergrund „Legende” zu beanspruchen. Es reicht nicht aus, einfach nur wie Jim Morrison auszusehen – du musst in jeder Hinsicht, die zählt, Jim Morrison sein. Viele Leute behaupten, „die neuen Beatles” oder „der nächste Jesus Christus” zu sein, aber die Verbindung muss tiefer gehen als das. Dieser Hintergrund schöpft aus der erhabenen Kraft des Reiches der Archetypen. Wenn diese Kraft nicht echt ist und sich nicht in klarer und beständiger Form zeigt, bist du nur ein weiterer Hochstapler, nicht der echte McCoy.",
    specialRules: TraitSpecialRules.None,
    advantages: [
      {
        id: 141,
        level: 1,
        name: "Legende 1",
        description: "Eine obskure Legende (Clever Gretel, Abou Hassan) oder eine kleine Popkultur-Figur (Betty Boop, Grumpy Cat).",
        actions: [],
        isRepeatable: false
      },
      {
        id: 142,
        level: 2,
        name: "Legende 2",
        description: "Eine kleine Legende (Sindbad der Seefahrer, Don Quijote) oder eine bekannte Popkultur-Figur (Janis Joplin, die Grinsekatze).",
        actions: [],
        isRepeatable: false
      },
      {
        id: 143,
        level: 3,
        name: "Legende 3",
        description: "Eine bekannte Legende (Guy Fawkes, Shaka Zulu) oder eine Popkultur-Ikone (Batman, Elvis).",
        actions: [],
        isRepeatable: false
      },
      {
        id: 144,
        level: 4,
        name: "Legende 4",
        description: "Eine große Legende (George Washington, Geronimo, Rotkäppchen).",
        actions: [],
        isRepeatable: false
      },
      {
        id: 145,
        level: 5,
        name: "Legende 5",
        description: "Eine echt beliebte Legende (Aschenputtel, König Artus, die Mona Lisa).",
        actions: [],
        isRepeatable: false
      }
    ],
    disadvantages: []
  },
  {
    id: 17,
    type: "backgrounds",
    name: "Bibliothek",
    description: "Wow... braucht man im Internetzeitalter überhaupt noch Bücher? Ja, eigentlich schon. Obwohl das Internet eine nahezu unendliche Menge an Infos bietet, gibt es immer noch viele Infos, die nur in Büchern zu finden sind. Besonders wenn es um esoterische, mystische, historische oder akademische Infos geht, kann eine gute Bibliothek Daten bieten, die keine Internetsuche aufdecken kann. So sehr die Magier des neuen Jahrtausends auch lernen, das Internet zu schätzen (oder sonst unter dem Mangel dieser Wertschätzung zu leiden), sind gedruckte Archive für ernsthafte Studenten der magischen Künste und erleuchteten Hyperwissenschaften immer noch unverzichtbar. Im späten 20. und frühen 21. Jahrhundert spiegelt diese Hintergrundeigenschaft den Zugang zu einem Multimedia-Archiv wider, das für diesen bestimmten Magier von entscheidender Bedeutung ist. Ein altmodischer Magier mag angesichts all dieser Internet-Torheiten den grauen Kopf schütteln, aber selbst er wird wahrscheinlich noch Fotos, Schallplatten, Filmrollen und vielleicht sogar *huch!* DVDs, CDs oder MP3s in seinem Archiv haben, schon allein deshalb, weil so viel aus dem letzten Jahrhundert auf solchen Medien festgehalten wurde. Ein urbaner Hexer könnte eine kleine, aber bedeutende Sammlung klassischer Magiebücher oder alter psychedelischer Magazine aus den 60er Jahren besitzen, die seine Breitbandverbindung ergänzen, und selbst die erhabenste Transhumanistin hat ein paar zerlesene Exemplare von Mondo 2000 oder Piss Clear in ihrer Sammlung. Die genaue Beschaffenheit deiner Bibliothek hängt also von deiner Persönlichkeit ab und bietet dir dennoch uneingeschränkten Zugriff auf eine beeindruckende Menge an Informationen, wenn du sie brauchst. Da dein Bibliothekshintergrund auf einer Sammlung nützlicher Infos für deinen Magier basiert, enthält er Material, das dir bei der Erforschung deiner gewählten Fähigkeiten und Sphären hilft. Du musst deine Sammlung von Zeit zu Zeit erweitern, wenn du dich mit neuen Themen beschäftigst (kein Wunder, dass Magier oft eingefleischte Datenjäger sind), aber dann kannst du Themen recherchieren, die mit diesen Eigenschaften zu tun haben, indem du erfolgreiche Mental-Eigenschaft + Bibliothekswürfe machst. Solche Recherchen erfordern natürlich Zeit und Mühe ... und bei größeren Archiven können sowohl Zeit als auch Mühe erheblich sein! Um riesige Archive widerzuspiegeln, kann dieser Hintergrund über 5 liegen. Eine eng verbundene und vertrauensvolle Gruppe kann diesen Hintergrund auch bündeln und so wirklich beeindruckende Archive schaffen. In diesem Fall entspricht der Bibliothekshintergrund der Gruppe dem Bibliothekshintergrund des Mitglieds mit der höchsten Bewertung in dieser Gruppe, plus einem Punkt für jeden weiteren Mitwirkenden. (Eine Gruppe, deren Mitglieder jeweils eine Bibliotheksbewertung von 3, 2, 2 und 1 haben, hätte einen kombinierten Bibliothekshintergrund von insgesamt 6.) Schließlich wird ein kombiniertes Archiv redundantes Material enthalten ... und wie viele Exemplare von „Harry Potter und der Gefangene von Askaban“ braucht man wirklich?",
    specialRules: TraitSpecialRules.None,
    advantages: [
      {
        id: 151,
        level: 1,
        name: "Bibliothek 1",
        description: "Du hast ein paar New-Age-Taschenbücher.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 152,
        level: 2,
        name: "Bibliothek 2",
        description: "Viel Fiktion, wenig Substanz.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 153,
        level: 3,
        name: "Bibliothek 3",
        description: "Wenn du dich damit beschäftigst, findest du da ein paar nützliche Sachen.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 154,
        level: 4,
        name: "Bibliothek 4",
        description: "Deine Sammlung geheimnisvoller Daten ist echt beeindruckend.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 155,
        level: 5,
        name: "Bibliothek 5",
        description: "Du hast eine ziemlich gute Sammlung von unterschiedlichem Wissen.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 156,
        level: 6,
        name: "Bibliothek 6",
        description: "Du hast ein riesiges persönliches Archiv.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 157,
        level: 7,
        name: "Bibliothek 7",
        description: "Deine Datenbank hat jede Menge schriftliche, aufgezeichnete und virtuelle Infos.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 158,
        level: 8,
        name: "Bibliothek 8",
        description: "Du hast vollen Zugriff auf ein nationales Archiv.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 159,
        level: 9,
        name: "Bibliothek 9",
        description: "Du hast uneingeschränkten Zugriff auf persönliche, nationale und geheime Datenbanken.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 160,
        level: 10,
        name: "Bibliothek 10",
        description: "Mit genug Zeit (und Hilfe) kannst du auf fast alles zugreifen, was jemals geschrieben und gespeichert wurde. Du verstehst es vielleicht nicht (verdammte Codes, verlorene Sprachen und fremde Sprachen!), aber du könntest es wahrscheinlich finden.",
        actions: [],
        isRepeatable: false
      }
    ],
    disadvantages: []
  },
  {
    id: 18,
    type: "backgrounds",
    name: "Mentor",
    description: "Ein „älterer“ Magier hat Interesse an dir gezeigt und bietet dir Training, Anleitung und gelegentliche Hilfe an. Beachte, dass dieser Ältere vielleicht in deinem Alter oder sogar jünger ist, dass das Training darin bestehen könnte, dich von Dächern zu werfen, dass die Anleitung mehr Yoda-Zitate als eine Karate Kid-Marathon enthalten könnte und dass die Hilfe darauf hinauslaufen könnte, dir auf den Kopf zu schlagen, sobald du diesen Abschnitt im fleischgebundenen Grimoire gelesen hast. Die Bewertung dieses Hintergrunds zeigt, wie hilfreich dein Mentor für dich ist, unabhängig von seiner persönlichen Macht. Schließlich nützt ein hermetischer Großmeister seinen Schülern nicht viel, wenn er ihnen nur erlaubt, auf seinem Boden zu schlafen. Die Beziehung zwischen Mentor und Schüler ist oft eine der prägendsten Erfahrungen im Leben eines Magiers. In vielen Fällen entdeckt der Mentor ein interessantes Talent in einem noch nicht erwachten Schlafwandler, weiht den potenziellen Schüler ein und fördert und leitet dann diese Begabung, bis sie zu voller Entfaltung gelangt. Dies gilt insbesondere für Technokraten, die oft kurz vor oder kurz nach ihrer Erleuchtung rekrutiert werden ... oder aber von einem effektiven technokratischen Agenten von ihrer früheren Karriere als Realitätsabweichler bekehrt werden. Mentoren haben natürlich ihre eigenen Ziele, und diese Ziele sind nicht immer offensichtlich. Viele Magier bekommen ihren ersten Eindruck von der Erwachten Gesellschaft durch Mentoren, die distanziert, missbräuchlich, manipulativ, gleichgültig, ineffektiv oder geradezu verrückt sind. Andere lernen natürlich von Ältesten, die sich als liebevoll, fürsorglich, einfühlsam und weise erweisen. Es hängt wirklich von der Persönlichkeit, der Hintergrundgeschichte und der Zugehörigkeit deines Magiers ab. Technokratische Mentoren sind oft (wenn auch nicht immer) kalt und effizient, während Mystiker albern, exzentrisch, distanziert oder eine beliebige Kombination von magischen Eigenschaften sein können, die man sich vorstellen kann. Im Spiel bietet ein Mentor soziale Unterstützung, magische oder technologische Ausbildung, gelegentliche Ressourcen und vielleicht auch Interventionen oder Hilfe, wenn dein Magier wirklich Hilfe braucht. Im Gegenzug erwartet er ein gewisses Maß an Respekt, Gehorsam und Hilfe in der Werkstatt. Das Verhalten eines Schülers, ob gut oder schlecht, wirkt sich auf seinen Mentor aus, daher ist es nicht ratsam, diese Beziehung zu missbrauchen. Besonders für einen jungen und unerfahrenen Magier kann ein wütender Mentor eine schreckliche Sache sein. Wie bei Verbündeten und Vertrauten repräsentiert dieser Hintergrund Storyteller-Charaktere mit ihren eigenen Hintergründen, Persönlichkeiten, Motivationen und Beziehungen zur Welt im Allgemeinen. Dein Geschichtenerzähler kann (und sollte) viel Spaß dabei haben, solche Charaktere zu spielen und Pläne zu verfolgen, die den Schülern oft verborgen bleiben. Denk an die verschiedenen Spiele, die von den Ältesten in der Harry-Potter-Saga gespielt werden – Spiele, bei denen die Schüler selten verstanden, was wirklich vor sich ging. Mentoren geben nichts umsonst; wenn sich jemand für deinen Magier interessiert, steckt immer mehr als nur Freundlichkeit oder Pflichtbewusstsein dahinter!",
    specialRules: TraitSpecialRules.None,
    advantages: [
      {
        id: 161,
        level: 1,
        name: "Mentor 1",
        description: "Ein unzuverlässiger oder unerfahrener Mentor.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 162,
        level: 2,
        name: "Mentor 2",
        description: "Ein hilfreicher, aber auch etwas schräger Ratgeber.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 163,
        level: 3,
        name: "Mentor 3",
        description: "Ein guter und bemerkenswerter Lehrer.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 164,
        level: 4,
        name: "Mentor 4",
        description: "Ein weiser, hilfsbereiter und angesehener Ältester.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 165,
        level: 5,
        name: "Mentor 5",
        description: "Ein mächtiger Ältester, der sich echt für deinen Erfolg einsetzt.",
        actions: [],
        isRepeatable: false
      }
    ],
    disadvantages: []
  },
  {
    id: 19,
    type: "backgrounds",
    name: "Knotenpunkt",
    description: "In einer Welt, in der Magie selten zu sein scheint, hast du Zugang zu einem Wunder: einem Knotenpunkt, an dem du meditieren kannst, um deine innere Quintessenz wiederherzustellen oder feste Energie in verschiedenen Formen zu sammeln. Allerdings musst du möglicherweise kämpfen, um diesen Ort für dich zu behalten – Werwölfe, Geister und rivalisierende Magier sind immer darauf aus, solche Orte ihrer Sammlung hinzuzufügen. Der Knotenpunkt ist vielleicht nicht offensichtlich als magischer Ort erkennbar; die meisten von ihnen sind es nicht. Für Leute, die sich damit auskennen, sind Knotenpunkte aber wie Leuchtfeuer der Energie, die sowohl von Mystikern als auch von Technokraten begehrt sind. In der großen Tradition von Religionen und Imperien überall werden Knotenpunkte oft umgewandelt, um den Zwecken der Gruppen zu dienen, die sie für sich beanspruchen. Die Technokratie schickt Teams, um mystische Knotenpunkte zu säubern, und baut dann Festungen, Labore oder Kraftwerke auf den früheren Anlagen. Mystische Magier weihen solche Gebiete auf ihre eigene Weise, indem sie Tempel über Schluchten, Kirchen über Brunnen und Einkaufszentren oder Computerlabore über dem heiligen Boden errichten, der einst von einer rivalisierenden Gruppe verehrt wurde. Kurz gesagt, Knotenpunkte stellen eine der unangenehmeren Fronten des Aufstiegskrieges dar. Selbst verbündete Magier wie Celestial Choristers und Verbena scheuen sich nicht, die heiligen Stätten der anderen für ihre eigenen Zwecke zu nutzen ... natürlich alles für das größere Wohl! Wie in Kapitel Drei erwähnt, haben Knotenpunkte eine Resonanz, die von der Art der Energie herrührt, aus der sie entstanden sind. Das Tass eines bestimmten Ortes trägt diese Resonanz ebenfalls in sich, und die Form, die das Tass annimmt, folgt der Natur des Knotenpunkts. Ein durch eine Schlacht geschaffener Knoten kann Wut und Traurigkeit ausstrahlen, verkörpert durch Blut, Knochen und Asche; eine Quelle der Hoffnung fühlt sich erfrischend und rein an, mit reinem Wasser-Tass; aber ein Frankenstein-ähnliches Labor fühlt sich gotisch und unheilvoll an, mit Blitz-Quintessenz, die zwischen Generatoren hin und her springt und in Batterien als Tass für den späteren Gebrauch gespeichert wird. Der Gauntlet wird um mystische Knotenpunkte herum tendenziell dünner, verdichtet sich jedoch in technokratischen Knotenpunkten, es sei denn, du verwendest dimensionale wissenschaftliche Verfahren anstelle von Geistermagie. Als Hintergrundmerkmal repräsentiert dieser Knotenpunkt einen Ort, der von deinem Charakter und vielleicht einigen Freunden gehalten wird. Du kannst Hintergrundpunkte sammeln, um einen größeren Knotenpunkt zu kaufen, aber deine Gruppe braucht einen vernünftigen, storybasierten Grund, wenn du die Chronik mit einem Ort großer Macht beginnen willst. Dein Knotenpunkt produziert eine bestimmte Menge an ungenutzter Quintessenz, die dein Avatar aufnehmen kann, während du eine Weile an diesem Ort meditierst, sowie ein bisschen Tass, das in fester Form gesammelt und später an anderer Stelle verwendet werden kann. Die genauen Mengen an Tass und freier Quintessenz hängen von der Art deiner Chronik ab: Der Knotenpunkt einer High-Fantasy-Saga kann bis zu fünf oder zehn Quintessenzpunkte pro Woche für jeden Punkt in der Hintergrundwertung produzieren, während eine Chronik, in der „die Magie stirbt“, Knotenpunkte hat, die nur ein oder zwei Quintessenzpunkte pro Woche für jeden Punkt in dieser Eigenschaft produzieren. Letztendlich bestimmt der Geschichtenerzähler den wöchentlichen Wert eines Knotens. Für Chroniken aus dem Industriezeitalter empfehlen wir zwei Punkte pro Woche und Punkt in der Eigenschaft – die Hälfte davon in freier Quintessenz, die andere Hälfte in Tass. Unabhängig von ihrer Form ist diese Versorgung mit Quintessenz begrenzt. Wenn du sie vollständig in deinen Avatar aufnimmst oder als Tass sammelst, muss dieser Knoten seine Energie wieder auffüllen, bevor er erneut genutzt werden kann. Werwölfe betrachten Knotenpunkte als Caerns: heilige Orte, die von ihrer ursprünglichen Mondgöttin gesegnet sind. Angetrieben von religiöser Inbrunst neigen sie dazu, Knotenpunkte für sich zu beanspruchen, wann immer sie können. Obwohl solche Kreaturen die kalten Fabriken der technokratischen Macht meiden, könnte ein Magier oder eine Kabale mit einem mystischen Knotenpunkt einige große, pelzige Besucher haben, die eine Immobilientransaktion besprechen möchten ...",
    specialRules: TraitSpecialRules.None,
    advantages: [
      {
        id: 171,
        level: 1,
        name: "Knotenpunkt 1",
        description: "Ein kleiner Ort von geringer Bedeutung. (Caern der Stufe 1.)",
        actions: [],
        isRepeatable: false
      },
      {
        id: 172,
        level: 2,
        name: "Knotenpunkt 2",
        description: "Ein kleines bisschen metaphysische Energie. (Caern der Stufe Eins.)",
        actions: [],
        isRepeatable: false
      },
      {
        id: 173,
        level: 3,
        name: "Knotenpunkt 3",
        description: "Ein stetiger Fluss von Quintessenz. (Level-Zwei-Caern.)",
        actions: [],
        isRepeatable: false
      },
      {
        id: 174,
        level: 4,
        name: "Knotenpunkt 4",
        description: "Ein Energieschub und jede Menge materialisierter Tass. (Level-Zwei-Caern.)",
        actions: [],
        isRepeatable: false
      },
      {
        id: 175,
        level: 5,
        name: "Knotenpunkt 5",
        description: "Eine mächtige Quelle voller Energie. (Stufe-Drei-Caern.)",
        actions: [],
        isRepeatable: false
      },
      {
        id: 176,
        level: 6,
        name: "Knotenpunkt 6",
        description: "Ein fokussierter Knotenpunkt, bei dem sowohl Tass- als auch Umgebungsenergie durch Prime Arts oder Wissenschaften verfeinert werden. (Caern der Stufe drei.)",
        actions: [],
        isRepeatable: false
      },
      {
        id: 177,
        level: 7,
        name: "Knotenpunkt 7",
        description: "Eine echt starke metaphysische Kraft. (Level-Vier-Caern.)",
        actions: [],
        isRepeatable: false
      },
      {
        id: 178,
        level: 8,
        name: "Knotenpunkt 8",
        description: "Ein seltener und wundersamer Ort, voller verkörperter Urkraft. (Caern der Stufe Vier.)",
        actions: [],
        isRepeatable: false
      },
      {
        id: 179,
        level: 9,
        name: "Knotenpunkt 9",
        description: "Einer der beeindruckendsten heiligen Orte oder mächtigsten Raffinerien in der materiellen Welt. (Caern der Stufe Fünf.)",
        actions: [],
        isRepeatable: false
      },
      {
        id: 180,
        level: 10,
        name: "Knotenpunkt 10",
        description: "Einer der seltensten und wertvollsten Orte auf der Erde … und ein sicherer Schauplatz für Kämpfe zwischen den Mächten, die seine Kraft nutzen wollen. (Level Five Caern.)",
        actions: [],
        isRepeatable: false
      }
    ],
    disadvantages: []
  },
  {
    id: 20,
    type: "backgrounds",
    name: "Frühere Leben",
    description: "Reinkarnation ist immer noch ein Thema, über das man diskutiert, sogar unter Magiern. Akashics und Chakravanti bauen ihre ganze Sicht auf die Realität auf dieser Idee auf, aber ihre Verbündeten vom Chorus (ganz zu schweigen von den atheistischen Technokraten) lehnen das Konzept der wiederverwerteten Seelen ab ... oder manchmal sogar die ganze Idee einer Seele! Trotzdem scheint da was zu sein ... eine vertraute Essenz, auf die bestimmte Leute in schwierigen Zeiten zurückgreifen können. Mit diesem Hintergrund kannst du über ein vergangenes Leben meditieren (oder, nach Ermessen des Spielleiters, einen plötzlichen Geistesblitz erleben), um Hilfe in einer aktuellen Situation zu bekommen. Vielleicht erinnert dich der Blick eines imposanten Gegners an die Zeit, als du Stalins Chefagent gegenüberstandest, oder dieses seltsame Buch erinnert dich an die alchemistische Schriftrolle, die du in Byzanz studiert hast. Wenn der Hintergrund „Vergangene Leben” zum Tragen kommt, helfen dir deine Erinnerungen bei deinem aktuellen Dilemma. Spieltechnisch kann der Würfelpool dieses Hintergrunds zum Würfelpool einer anderen Aufgabe hinzugefügt werden. Einmal pro Spielsitzung kannst du auf diesen Erinnerungsschatz zurückgreifen. Jeder Punkt in „Frühere Leben” gibt dir einen Würfel, den du gegen Schwierigkeitsgrad 8 würfeln kannst; jeder Erfolg bei diesem Wurf gibt dir einen zusätzlichen Würfel, den du bei einem späteren Wurf mit einer anderen Fähigkeit verwenden kannst. Diese Würfel können entweder zum Würfelpool einer Fähigkeit hinzugefügt werden, die du bereits besitzt, oder – wie der Hintergrund „Traum” – dir einen temporären Würfelpool für eine Fähigkeit geben, die du normalerweise nicht auf deinem Charakterblatt hast. „Frühere Leben” garantiert keinen Erfolg, kann dir aber ein bisschen zusätzliche Expertise verleihen. Wenn du einen Wurf für „Frühere Leben” vermasselst, landest du mitten in der nächsten Situation. „Traum“ – einen temporären Würfelpool für eine Fähigkeit geben, die du normalerweise nicht auf deinem Charakterblatt hast. „Vergangene Leben“ garantiert keinen Erfolg, kann aber ein bisschen zusätzliche Expertise verleihen. Wenn du einen „Vergangene Leben“-Wurf vermasselst, landest du mitten in einem Trauma aus einem früheren Leben; für einen entscheidenden Moment überwältigen die Erinnerungen deinen Charakter und zerstören jede Chance auf Erfolg im Hier und Jetzt. Das ist besonders beunruhigend, wenn dein Magier nicht an Reinkarnation glaubt! („Was zum Teufel war DAS denn…?“) Für eine Extraportion Awesome Sauce notiere dir Details aus deinem früheren Leben, wenn du diese Eigenschaft erfolgreich einsetzt. Solche Erinnerungen werden dir wahrscheinlich irgendwann wieder nützlich sein…",
    specialRules: TraitSpecialRules.None,
    advantages: [
      {
        id: 181,
        level: 1,
        name: "Frühere Leben 1",
        description: "Leichte Spuren einer früheren Inkarnation.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 182,
        level: 2,
        name: "Frühere Leben 2",
        description: "Oft habe ich dieses Déjà-vu-Gefühl.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 183,
        level: 3,
        name: "Frühere Leben 3",
        description: "Klare Erinnerungen an andere Leben.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 184,
        level: 4,
        name: "Frühere Leben 4",
        description: "Klare Erinnerung an frühere Erfahrungen und andere Leben.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 185,
        level: 5,
        name: "Frühere Leben 5",
        description: "Welches Leben ist das nochmal?",
        actions: [],
        isRepeatable: false
      }
    ],
    disadvantages: []
  },
  {
    id: 21,
    type: "backgrounds",
    name: "Patron",
    description: "In der Schachbrettpolitik der Ascension-Fraktionen halten sich manche Spieler aus dem Hintergrund raus. Einer von ihnen kümmert sich um dein Wohl ... zumindest im Moment. Wahrscheinlich hast du keine Ahnung, wer dieser Gönner ist, was er will oder wie hoch die Rechnung für seine Dienste am Ende sein wird. Selbst wenn du glaubst zu wissen, wer hinter dieser Freundlichkeit steckt, bleibt die Wahrheit unklar. Diese Person ist kein Mentor oder Verbündeter, sondern ein geheimnisvoller Wohltäter, dessen wahre Ziele dir zumindest im Moment verborgen bleiben. Im Spiel spiegelt der Gönner eine mächtige Partei wider, die die Interessen deines Charakters im Auge hat. Nur der Geschichtenerzähler weiß, was diese Partei vorhat und welches Interesse sie an deinem Charakter hat. Zumindest zu Beginn der Chronik übt dieser Wohltäter auf mysteriöse Weise Einfluss aus: Befehle werden rückgängig gemacht, Verträge abgeschlossen oder gekündigt, Geschenke überreicht, Hinweise gegeben und Fäden gezogen. Magick wird den Grund für diese Gefälligkeiten nicht verraten – der Gönner ist viel zu clever, um sich so leicht erwischen zu lassen. Es gibt eindeutig eine Allianz oder Gemeinsamkeiten, aber die Art dieser Verbindung bleibt unklar. Besonders in paranoiden Labyrinthen wie den hermetischen oder technokratischen Orden kann diese mysteriöse Großzügigkeit sehr beunruhigend sein. Eines Tages, das weißt du, wird der Gönner seine Forderungen einfordern ...",
    specialRules: TraitSpecialRules.None,
    advantages: [
      {
        id: 191,
        level: 1,
        name: "Patron 1",
        description: "Ein zwielichtiger Typ, der ab und zu die Fäden zieht.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 192,
        level: 2,
        name: "Patron 2",
        description: "Ein hilfsbereiter Gönner, der lieber anonym bleiben will.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 193,
        level: 3,
        name: "Patron 3",
        description: "Ein Vorgesetzter oder Älterer, der dir aus mysteriösen Gründen hilft.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 194,
        level: 4,
        name: "Patron 4",
        description: "Eine mächtige Partei, die dich zu mögen scheint.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 195,
        level: 5,
        name: "Patron 5",
        description: "Ein hochrangiger Magier oder Technokrat, der sich um dein Wohlergehen zu kümmern scheint … zumindest im Moment.",
        actions: [],
        isRepeatable: false
      }
    ],
    disadvantages: []
  },
  {
    id: 22,
    type: "backgrounds",
    name: "Rang",
    description: "Du hast einen Titel, der dir in der Gesellschaft etwas Besonderes macht – vielleicht einen militärischen Rang, ein religiöses Amt, eine Führungsposition in einem großen Unternehmen oder einen ähnlich einflussreichen Posten. Diese Position bringt dir Respekt, bestimmte Vorteile, die mit dem Job zusammenhängen, und wahrscheinlich auch die sofortige Ehrerbietung (und Gehorsamkeit) von Leuten, die weniger Macht haben. Natürlich bringt dieser Rang auch Verantwortung mit sich; ein Staatsoberhaupt kann nicht einfach losziehen und Abenteuer erleben, wann immer es ihm gefällt! Es gibt natürlich noch höhere Ränge als die unten aufgeführten, aber die sind für Spielercharaktere nicht geeignet, weil sie zu viel Zeit und Verantwortung erfordern. Dieser Hintergrund ist besonders bei Technokraten verbreitet und verleiht Einfluss – gemäß dieser Hintergrundeigenschaft – in Höhe des Rangwerts. Dieser Einfluss wirkt aber nur auf Leute, die dem Rang unterstehen (z. B. Mitarbeiter eines Managers oder Bürger, die einem Adligen unterstehen), und in Situationen, in denen der Charakter im Rahmen seines Amtes handelt. Andere Leute sind vielleicht nicht so leicht zu beeindrucken. In diesem Fall zählt der Einfluss nur halb so viel wie der Rang oder ein Wert, den der Spielleiter festlegt. (Ein Mullah hat immer noch einen gewissen Einfluss auf Nicht-Muslime, aber nicht so viel wie auf die Gläubigen.) Denk auch daran, dass der Finanzvorstand eines Fortune-500-Unternehmens zwar Einfluss auf Leute hat, die den Kapitalismus leben und atmen, aber eine Gruppe von Occupy-Wall-Street-Demonstranten könnte sehr negativ auf den Rang des Charakters reagieren ... Wenn dein Charakter in offizieller Funktion handelt, kann er auch auf Ressourcen (wiederum als Hintergrund) in Höhe der Hälfte seines Ranges oder einer vom Spielleiter gewählten Stufe als Vorteil seines Amtes zugreifen ... obwohl er sich wahrscheinlich gegenüber seinen Vorgesetzten dafür verantworten muss, wie diese Ressourcen ausgegeben werden! Er könnte auch Ruhm in Höhe der Hälfte seines Ranges unter den Menschen haben, denen er befehligt. Wenn sie aber Einfluss, Ressourcen oder Ruhm unabhängig von diesem Rang haben will, muss sie diese separat erwerben; ein Drill-Sergeant kann durch das Vermögen seiner Familie reich sein, aber dieser Geldfluss kommt nicht über militärische Kanäle zustande. Der Rang kann je nach Amt auch andere Vorteile mit sich bringen. Ein Priester könnte nicht die beste Limousine eines Unternehmens requirieren, aber der Vizepräsident dieses Unternehmens kann das verdammt noch mal sehr wohl! Beachte, dass der Rang den Status innerhalb der Sleeper-Institutionen widerspiegelt. Der Status als Magier hat nichts mit diesem Hintergrund zu tun, obwohl ein Vizepräsident, Priester oder Drill-Sergeant aufgrund seiner Position in der Welt der Sterblichen dennoch bestimmte Erweckte beeindrucken kann.",
    specialRules: TraitSpecialRules.None,
    advantages: [
      {
        id: 201,
        level: 1,
        name: "Rang 1",
        description: "Niedriger Rang: Sergeant, Knappe, Diakon, Schulratsmitglied, Nachwuchsjournalist, Juniormanager, Universitätsdozent.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 202,
        level: 2,
        name: "Rang 2",
        description: "Niedriger Rang: Unteroffizier, Ritter, Prior, Stadtrat, Redakteur, leitender Angestellter, Professor.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 203,
        level: 3,
        name: "Rang 3",
        description: "Mittlere Position: Kapitän, Baron, Abt, Bürgermeister, lokaler Kolumnist, mittleres Management in Unternehmen, festangestellter Professor.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 204,
        level: 4,
        name: "Rang 4",
        description: "Hoher Rang: Major, Graf, Bischof, Gouverneur, Kolumnist, Junior-Vizepräsident, Abteilungsleiter.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 205,
        level: 5,
        name: "Rang 5",
        description: "Führungskräfte: General, Prinz, Erzbischof, Senator, internationaler Korrespondent, Vizepräsident eines Unternehmens, Dekan.",
        actions: [],
        isRepeatable: false
      }
    ],
    disadvantages: []
  },
  {
    id: 23,
    type: "backgrounds",
    name: "Ressourcen",
    description: "Wie jeder Syndikatsvertreter dir sagen kann, lässt sich mit Magie gutes Geld verdienen – richtig gutes Geld, wenn du deine Karten richtig ausspielst. Natürlich nennt das Syndikat das, was es tut, nicht Magie – es ist einfach die Kunst des Begehrens, die zu einer Wissenschaft verfeinert wurde. Wie auch immer du es nennen magst, dieser Hintergrund bedeutet, dass du über Bargeld und Güter verfügst ... in den oberen Stufen sogar über sehr viel Bargeld und Güter. Angesichts des unglaublichen Reichtums, den manche Magier ansammeln können, geht dieser Hintergrund bis 10. Dieser Reichtum ist auch nicht nur das Revier des Syndikats. Hermetische Zauberer sind bekannt für ihren Luxus, Choristen können über riesige Ressourcen verfügen und ekstatische Rockstars können mehr Geld verdienen, als irgendjemand genießen darf. Die wahren Finanzgenies sind aber die sogenannten Geldmänner (und -frauen), deren Tradition mit der mittelalterlichen Hochgilde begann und seitdem stark ist. Einige Magier kommen aus solchen alten Geldadel-Familien, andere machen ihr Vermögen selbst. Angesichts des wirtschaftlichen Potenzials von Sphären wie Entropie, Materie, Geist und Leben – warum sollte man nicht nach dem großen Geld streben? Natürlich ist es oft gefährlich, sich zu sehr auf magische Einkünfte zu verlassen. Transaktionen werden heutzutage meist mit virtuellem Geld durchgeführt: Debitkarten, Kreditkarten, Bankabhebungen, Online-Einzahlungen und so weiter. Wenn man mit viel Bargeld herumwirft, fällt man auch auf ... warum sonst haben so viele Papiergeldscheine diese Tracking-Streifen? Eine kluge Magierin verzaubert die Menschen, damit sie ihr Bankkonto füllen; Blei in Gold zu verwandeln ist zu verdächtig (und arbeitsintensiv), um effektiv zu sein. Wie bei so vielen anderen Dingen in dieser techniklastigen Welt ist es für einen Technokraten viel einfacher, solche Hindernisse zu umgehen, als für einen mystischen Magier. Allerdings gibt es in hermetischen Kreisen und bestimmten Hexenzirkeln eine ganze Menge altes Geld. Manche mutige Magier verdienen sogar ihr Vermögen mit dem Schreiben von New-Age-Büchern, Fantasy-Romanen oder Rollenspielen! Hohe Ressourcenwerte erfordern, wie andere hohe Hintergrundwerte auch, Zeit und Mühe, um sie zu kontrollieren. Wenn man nicht aufpasst, ist es einfacher, ein Vermögen zu verlieren, als es zu verdienen. Angesichts der virtuellen Natur des modernen Handels hast du wahrscheinlich keine Stapel von Papiergeld und Edelmetallen herumliegen ... obwohl, wenn du altmodisch genug bist, könnte es sein, dass du das doch tust ...",
    specialRules: TraitSpecialRules.None,
    advantages: [
      {
        id: 211,
        level: 1,
        name: "Ressourcen 1",
        description: "Du bist ein bisschen besser dran: Du hast 'ne kleine Wohnung und vielleicht 'n günstiges Auto. Nach den örtlichen Maßstäben hast du 'ne Arbeiterklasse-Einkommenssituation.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 212,
        level: 2,
        name: "Ressourcen 2",
        description: "Unterer Mittelstand: Du hast 'ne Eigentumswohnung oder 'ne Mietwohnung, dazu 'n Auto, ein paar Ersparnisse und genug Kohle für gelegentliche Extras.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 213,
        level: 3,
        name: "Ressourcen 3",
        description: "Mittlere Klasse mit Vermögen: Du hast entweder eine Immobilie oder ordentlich Eigenkapital in einer Immobilie, dazu ein Auto, Investitionen und Ersparnisse. Du könntest deinen Lebensstandard auf unbestimmte Zeit halten.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 214,
        level: 4,
        name: "Ressourcen 4",
        description: "Wohlhabend: Du hast ein großes Haus, ein paar Grundstücke und mindestens zwei Autos, dazu noch ordentlich Ersparnisse und Investitionen. Nach lokalen Maßstäben bist du Millionär, und auch wenn das nicht mehr so viel wert ist wie früher, ist es trotzdem nicht zu verachten.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 215,
        level: 5,
        name: "Ressourcen 5",
        description: "Willkommen bei den 1 %: Als Multimillionär hast du ordentlich Vermögen, Investitionen und Ersparnisse.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 216,
        level: 6,
        name: "Ressourcen 6",
        description: "Hollywood-Geld: Was auch immer du willst, du kriegst es.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 217,
        level: 7,
        name: "Ressourcen 7",
        description: "Der Club der Milliardäre. Du kannst ein ganzes Unternehmen oder eine ganze Branche beeinflussen.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 218,
        level: 8,
        name: "Ressourcen 8",
        description: "Reichtum wie Bruce Wayne. Du hast Firmen.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 219,
        level: 9,
        name: "Ressourcen 9",
        description: "So reich wie Tony Stark. Du hast ganze Industrien im Griff.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 220,
        level: 10,
        name: "Ressourcen 10",
        description: "Reichtum wie Bill Gates. Du hast Regierungen in der Hand.",
        actions: [],
        isRepeatable: false
      }
    ],
    disadvantages: []
  },
  {
    id: 24,
    type: "backgrounds",
    name: "Knappe",
    description: "„Was darf es heute Abend sein, Chef?“ Wenn die Schlacht vorbei ist (oder kurz bevor sie losgeht), kann ein treuer Gefolgsmann deine Wunden versorgen, deine Waffen schärfen, die Leichen wegschaffen und dafür sorgen, dass du es pünktlich zu deinem Termin um 8 Uhr morgens schaffst. Im Gegensatz zu Verbündeten oder Vertrauten sind solche Gefolgsleute nicht in den mystischen Künsten oder im Kampf bewandert; im Gegensatz zu Verstärkung oder Spionen sind sie keine gesichtslosen Schützen oder Informationsquellen. Jeder Gefolgsmann ist ein treuer Diener, Angestellter, gedankengesteuerter Diener, im Labor erschaffene Konstruktion oder sogar ein sehr unbedeutender Geist, der Ihre Befehle mit einem angemessenen Maß an Loyalität ausführt. Er kümmert sich um Ihr Haus, Ihre Ausrüstung und Ihre gesamten Routinearbeiten. Vielleicht ist er ein erbärmlicher Laborassistent, ein gewöhnlicher Lehrling, ein Liebhaber oder ein treuer Freund. Er ist dein Igor, sie ist deine Moneypenny. Solange du solche Charaktere mit Respekt behandelst (und vielleicht sogar, wenn du das nicht tust), gibt dir dieser Hintergrund zusätzliche Hilfe. Wie bei den oben genannten Hintergründen ist jeder Gefolgsmann ein eigenständiger Storyteller-Charakter. Die Loyalität dieser Figur hängt stark von den Umständen ab, aber im Allgemeinen kann man sich auf sie verlassen, es sei denn, die Lage wird wirklich schlimm. Mit wenigen Ausnahmen sind die Fähigkeiten eines Gefolgsmanns rein alltäglich. Er kann vielleicht etwas Yoga oder hat Büroerfahrung, aber er wird so schnell keine Maschinenpistole in die Hand nehmen! Wenn du eine Gefolgsmann-Figur ausbildest, wird diese Figur stattdessen zu einem Verbündeten. Im Labor erschaffene Konstrukte und Geistdiener sind im Grunde normale Menschen mit einer bestimmten besonderen Fähigkeit und Herkunft, aber ohne außergewöhnliche Kräfte, abgesehen vielleicht von ungewöhnlicher Stärke oder der Fähigkeit, in der Villa herumzuschweben. Ansonsten sind sie ganz normale Leute. Reiche Leute haben mehrere Diener in ihrem Stab, aber man muss nicht reich sein, um diesen Hintergrund zu haben. Eine obdachlose Magierin könnte trotzdem die Loyalität des Kindes genießen, das sie vor seinem gewalttätigen Vater gerettet hat.",
    specialRules: TraitSpecialRules.None,
    advantages: [
      {
        id: 221,
        level: 1,
        name: "Knappe 1",
        description: "Ein Knappe",
        actions: [],
        isRepeatable: false
      },
      {
        id: 222,
        level: 2,
        name: "Knappe 2",
        description: "Zwei Knappen",
        actions: [],
        isRepeatable: false
      },
      {
        id: 223,
        level: 3,
        name: "Knappe 3",
        description: "Drei Knappen",
        actions: [],
        isRepeatable: false
      },
      {
        id: 224,
        level: 4,
        name: "Knappe 4",
        description: "Vier Knappen",
        actions: [],
        isRepeatable: false
      },
      {
        id: 225,
        level: 5,
        name: "Knappe 5",
        description: "Fünf Knappen",
        actions: [],
        isRepeatable: false
      }
    ],
    disadvantages: []
  },
  {
    id: 25,
    type: "backgrounds",
    name: "Spion",
    description: "Eine Gruppe kleiner Vögel in verschiedenen Nestern hält dich auf dem Laufenden. Diese Informanten sind nicht unbedingt deine Freunde – vielleicht hassen sie dich sogar mit der glühenden Intensität von tausend feurigen Sonnen. Im Moment hast du aber etwas, das sie wollen: Geld, Sex, Drogen, Magie, was auch immer. Als Gegenleistung für diese Gefälligkeit erzählen sie dir, was sie wissen. Spione gibt es in vielen verschiedenen Formen: verärgerte Mitarbeiter, enttäuschte Angestellte, abgestumpfte Groupies, verzweifelte Süchtige, treue Anhänger deiner Sache, Leute, die dir einen Gefallen schulden, Menschen, die ohne dich in großen Schwierigkeiten wären, Opportunisten, die dein Geld mögen, Liebhaber, die sich mit dir gut stellen wollen ... Bestimmte verrückte Wissenschaftler und Technokraten haben sogar spezielle Kreaturen oder winzige Roboter, die ihnen Bericht erstatten. Wie auch immer deine Beziehung zu diesen Spionen sein mag, sie könnten sich gegen dich wenden, wenn du nicht aufpasst. Geld, Magie, bessere Drogen, die Androhung von Folter – all diese Dinge und mehr könnten deine Spione dazu bringen, sich in den Dienst eines anderen zu stellen. Und selbst wenn sie dir treu bleiben, können deine Spione durch falsche Daten oder falsche Eindrücke von dem, was wirklich vor sich geht, in die Irre geführt werden. Sie wissen nur, was sie sehen können. Systemtechnisch gesehen kannst du mit dieser Eigenschaft Informationen ausfindig machen (Intelligenz + Spione), Fehlinformationen, Ablenkungen und Lügen verbreiten (Manipulation + Spione), Menschen aus der Ferne beeindrucken (Charisma + Spione) oder potenzielle Bedrohungen erkennen, bevor sie sich konkretisieren (Wahrnehmung + Spione). Ein echter Spionagechef kann weit über fünf Punkte in dieser Eigenschaft haben, was den beängstigenden Einfluss bestimmter Hermetiker, Technokraten, Selbstjustizler und krimineller Köpfe erklärt.",
    specialRules: TraitSpecialRules.None,
    advantages: [
      {
        id: 231,
        level: 1,
        name: "Spion 1",
        description: "Ein oder zwei Spione an nützlichen Orten – bei der Polizei, der Mafia, der Wall Street usw.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 232,
        level: 2,
        name: "Spion 2",
        description: "Vier bis sechs Leute, die in verschiedenen Bereichen helfen können.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 233,
        level: 3,
        name: "Spion 3",
        description: "Ein paar Spione an nützlichen Orten, dazu ein paar in schwer zugänglichen Bereichen (Pentagon, CIA, UNO usw.) oder ein oder zwei in hochsicheren Bereichen (ein technokratisches Symposium, eine Tradition Chantry, ein geheimes Regierungsbüro usw.).",
        actions: [],
        isRepeatable: false
      },
      {
        id: 234,
        level: 4,
        name: "Spion 4",
        description: "Infiltratoren in einem ganzen Einflussbereich (der Unterwelt, der Regierung eines Landes, dem internationalen Aktienmarkt usw.) oder eine Handvoll in einem Konstrukt, einer Chantry, einem Vampirclan, einem Werwolfstamm und so weiter.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 235,
        level: 5,
        name: "Spion 5",
        description: "Augen und Ohren in der ganzen Sleeper-Welt oder ein paar Kontakte in der übernatürlichen Welt.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 236,
        level: 6,
        name: "Spion 6",
        description: "Du hast eine kleine Nachrichtenagentur oder einen Geheimdienst auf deiner Gehaltsliste, und die haben auch ein paar Einblicke in übernatürliche Angelegenheiten.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 237,
        level: 7,
        name: "Spion 7",
        description: "Neben den vielen Leuten, die du in der Welt der Sterblichen kennst, hast du auch jede Menge „Freunde” im übernatürlichen Reich.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 238,
        level: 8,
        name: "Spion 8",
        description: "Du hast einen ganzen Geheimdienst, der Infos für dich sammelt und verarbeitet.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 239,
        level: 9,
        name: "Spion 9",
        description: "Big Brother",
        actions: [],
        isRepeatable: false
      },
      {
        id: 240,
        level: 10,
        name: "Spion 10",
        description: "Big Brother auf globaler Ebene.",
        actions: [],
        isRepeatable: false
      }
    ],
    disadvantages: []
  },
  {
    id: 26,
    type: "backgrounds",
    name: "Status",
    description: "Respekt ist wichtig. Zum Glück genießt du in deiner Gruppe einen gewissen Respekt. Dieser Hintergrund zeigt, wie du bei deinen erweckten Freunden – Virtuellen Adepten, Templern, Progenitoren usw. – insgesamt angesehen bist. Auf den höchsten Status-Stufen (4 und 5) erstreckt sich dieser Ruf auch auf verbündete Gruppen (alle Traditionen, Disparate Crafts, Technocracy Conventions) und vielleicht sogar über deine Fraktion hinaus. („Ich habe viel von Ihnen gehört, Mister Leonard – sogar hier haben wir von Ihnen gehört ...“) Was die Geschichte angeht, verschafft Ihnen der Status ein gewisses Maß an Respekt bei verbundenen Magiern. Dies wiederum verschafft Ihnen eine gewisse Ehrerbietung: Die Leute öffnen Ihnen Türen, sprechen Sie mit Ihrem gewünschten Namen und Titel an, schicken Ihnen Einladungen zu besonderen Veranstaltungen und so weiter. Wenn du einen kleinen Gefallen brauchst oder in einen Streit verwickelt bist, verleiht Status deiner Sache ein wenig Gewicht. Im Spiel kannst du diesen Hintergrund zu deinem Würfelpool hinzufügen, wenn du mit Gleichgesinnten zu tun hast; eine bewunderte Virtuelle Adeptin würde zum Beispiel vier Würfel zu ihren Sozialwürfen unter den Adepten hinzufügen. Dieser Bonus wird unter Magiern aus einer anderen, aber verbündeten Sekte halbiert (aufgerundet); dieselbe Adeptin würde unter anderen Traditionen einen Bonus von zwei Würfeln erhalten. Du bekommst diesen Bonus nicht bei Feinden oder Fremden, auch wenn sie dich in der Geschichte vielleicht anerkennen. („Unsere Akten über Sie, Frau Vasquez – oder sollte ich Sie vielleicht ‚Voodoo‘ nennen – sind höchst ... beeindruckend ...“) Natürlich muss der Status auf etwas basieren, was du tust oder getan hast. Eine brandneue Magierin wird keinen Status 5 haben – sie muss ihn sich erst verdienen. Dieser Hintergrund spiegelt den Ruf unter Magiern wider, nicht unter Schlafenden oder anderen Wesen, obwohl bestimmte Wesen, die Bescheid wissen (wie Vampire oder Geistfürsten), einen Magier mit Status 4 oder 5 erkennen könnten. Im Idealfall wird dieser Hintergrund vom Geschichtenerzähler als Belohnung für deine Handlungen während der Chronik gewährt. Du kannst Status auch verlieren, wenn du ihm nicht gerecht wirst; ein Agent, der für seine Feigheit bekannt ist, wird nicht lange Respekt einflößen ...",
    specialRules: TraitSpecialRules.None,
    advantages: [
      {
        id: 241,
        level: 1,
        name: "Status 1",
        description: "Verstanden; deine Kollegen kennen deinen Namen, wenn er auftaucht.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 242,
        level: 2,
        name: "Status 2",
        description: "Glaubwürdig; du wirst als bemerkenswert angesehen.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 243,
        level: 3,
        name: "Status 3",
        description: "Respektiert; dein Wort hat Gewicht.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 244,
        level: 4,
        name: "Status 4",
        description: "Bewundert; die meisten Leute in deiner Gruppe schauen zu dir auf.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 245,
        level: 5,
        name: "Status 5",
        description: "Verehrt; du wirst als Vorbild für die Prinzipien deiner Gruppe angesehen.",
        actions: [],
        isRepeatable: false
      }
    ],
    disadvantages: []
  },
  {
    id: 27,
    type: "backgrounds",
    name: "Wunder (Gerät/Fetisch/Talisman usw.)",
    description: "Ein Wunder ist immer ein Wunder, egal wie man es nennt ... und du hast eins. Was ist ein Wunder? Vielleicht ist es ein mystischer Talisman mit magischer Kraft, ein Fetisch, dessen seltsame Eigenschaften von einem Geist kommen, der in seiner Form gefangen ist, oder ein technokratisches oder seltsames wissenschaftliches Gerät, das von der aufgeklärten Wissenschaft zu etwas geformt wurde, das die Technologie der Sterblichen übersteigt. Im Spiel ist ein Wunder einfach ein Gegenstand mit eigenen Sphären-Effekten. Obwohl solche Gegenstände, mit wenigen Ausnahmen, normalerweise nur für Magier funktionieren, hängen die Form und Funktion des Wunders von den Menschen ab, die es geschaffen haben, und von den Methoden, die bei seiner Herstellung angewendet wurden. Solange dein Spielleiter einverstanden ist, kann ein Wunder alles Mögliche sein: ein mit nordischen Runen verzierter Eichenast, eine Plasmakanone, ein Roboter-SUV, eine Bankkarte, die Geld von jedem Konto dieser Bank abhebt, eine verzauberte Gitarre, eine Feder aus Eulenfeder, die in jeder menschlichen Sprache schreiben kann ... Die Form und Funktion des Wunders kann innerhalb gewisser Grenzen alles sein, was du willst. Bestimmte Begriffe (Fetisch, Gerät usw.) definieren bestimmte Arten von Gegenständen. Der Abschnitt „Spielzeugkiste” in Anhang II (siehe S. 651–653) enthält Details, Regeln und eine Reihe von Beispielen für Wunder. Wunder können launisch sein ... insbesondere Fetische, deren Leitgeister eine eigene Persönlichkeit haben. Aber auch Geräte können unheimlich stur sein, wie jeder mit einem pingeligen Auto oder Computer bestätigen kann. Sie haben oft seltsame Auswirkungen auf die Leute, die sie benutzen, vor allem auf Magier, die sich auf Wunder verlassen, so wie Elric von Melniboné sich auf sein Schwert Stormbringer verlässt. In vielen Fällen haben Wunder ausgefeilte Hintergrundgeschichten über ihre Entstehung, Geschichte und Taten. Wenn dein Charakter mit einem Wunder ins Spiel kommt, denk dir eine spannende Geschichte und Beschreibung für diesen Gegenstand aus und gib sie dann deinem Storyteller zur Genehmigung und weiteren Ausarbeitung. Wahrscheinlich hat dein Wunder Geheimnisse, von denen du nichts weißt. Im Idealfall ist ein Wunder mehr als nur ein einfacher „magischer Gegenstand“, sondern ein Wunder in materieller Form – ein fester Beweis für die Realität der Magie.",
    specialRules: TraitSpecialRules.None,
    advantages: [
      {
        id: 251,
        level: 1,
        name: "Wunder 1",
        description: "Ein Wunder mit einer kleinen Kraft – also ein Wunder, das 1 bis 3 Punkte wert ist.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 252,
        level: 2,
        name: "Wunder 2",
        description: "Ein Wunder mit einer oder zwei Fähigkeiten, wahrscheinlich mit etwas Quintessenz und einer eigenen Arete. (4–6 Punkte.)",
        actions: [],
        isRepeatable: false
      },
      {
        id: 253,
        level: 3,
        name: "Wunder 3",
        description: "Ein Wunder mit ein paar coolen Fähigkeiten oder einer richtig beeindruckenden. (7–9 Punkte.)",
        actions: [],
        isRepeatable: false
      },
      {
        id: 254,
        level: 4,
        name: "Wunder 4",
        description: "Ein Wunder mit beeindruckenden Kräften oder einer starken Wirkung. (10–12 Punkte.)",
        actions: [],
        isRepeatable: false
      },
      {
        id: 255,
        level: 5,
        name: "Wunder 5",
        description: "Ein Wunder mit mächtigen Kräften oder einem einzigen vernichtenden Effekt. (13–15 Punkte.)",
        actions: [],
        isRepeatable: false
      }
    ],
    disadvantages: []
  }
];