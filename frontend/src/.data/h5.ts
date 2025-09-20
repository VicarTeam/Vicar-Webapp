import {H5EdgeCategory, IH5Creed, IH5Drive, IH5Edge} from "@/types/h5";
import {ITraitPack, TraitSpecialRules} from "@/types/data";

export const creeds: IH5Creed[] = [
  {
    id: 1,
    name: `Unternehmerisch`,
    description: `Das Credo der Unternehmer bringt eine innovative Perspektive in die Jagd und die Möglichkeiten, Monster als Ressourcen zu nutzen. Die Toolbox der Unternehmer umfasst alles von proprietären Protokollen für die Monsterjagd über experimentelle Technologien bis hin zu seltsamen Derivaten übernatürlicher Reagenzien. Unternehmerische Jäger können sogar produktähnliche Forschung und Entwicklung nutzen, um den Bedrohungen durch übernatürliche Kreaturen zu begegnen. Natürlich hat dieser Ansatz seine Vor- und Nachteile. Was die Vorteile angeht, können unternehmerische Jäger einen Vorteil gegenüber ihrer Beute erlangen, indem sie neue Technologien und Ansätze entwickeln, die manchmal die traditionelleren und sogar folkloristischen übernatürlichen Bedrohungen übertrumpfen. Was die Nachteile angeht, besteht ein Risiko darin, dass die neue Technologie selbst keine normale Ausrichtung hat, was bedeutet, dass die zur Bekämpfung der Nachtwesen entwickelten Werkzeuge auch von den Nachtwesen selbst oder sogar für andere, während der Entwicklung nicht vorhersehbare Zwecke verwendet werden können. Ein unternehmerischer Jäger könnte beispielsweise eine innovative Methode entwickeln, um Vampir-Blutgerinnungsmittel gegen Untote einzusetzen, aus den seltsamen Techno-Fetischen im Heiligtum des Zauberers eine wirksame Waffe zu improvisieren, sich in eine private Datenbank zu hacken, in der die Vermögenswerte und Verbündeten eines Hexenmeisters aufgelistet sind, sich mit Kontakten zu vernetzen, die wertvolle Informationen über den vermuteten Aufenthaltsort der Werwolfhöhle liefern können, und die Hierarchie der ahnungslosen menschlichen Diener der Beute zu stören.`,
    personality: `Am offensichtlichsten ist, dass Leute, die gerne Risiken eingehen, neue Tools entwickeln und denen ein bisschen mehr, sagen wir mal, handlungsfreier Spielraum gefällt, sich eher zum Unternehmertum hingezogen fühlen. Problemlösung ist der Weg dieses Credos, sei es durch bewährte und effiziente Mittel oder durch Ausprobieren mit viel Raum für Spontaneität. Einige Anhänger des unternehmerischen Credos haben vielleicht einen Hintergrund in disziplinierten Umgebungen wie dem Militär oder durch ihre Geschäftserfahrung mit umfangreichen Protokollen. Andere sind die klassischen „verrückten Wissenschaftler” oder Garagenerfinder. Viele sagen, dass sie das Gefühl haben, die Welt entgleite ihnen, und halten an einer Vision fest, die ihnen das zurückgibt, was sie ihrer Meinung nach verloren haben. Clevere Menschen haben sogar einen Weg gefunden, von der Jagd ihren Lebensunterhalt zu bestreiten. Für diejenigen, die die hässliche Wahrheit über die Existenz des Übernatürlichen entdeckt haben, ist es eine befriedigende Übereinstimmung von Interessen, dafür bezahlt zu werden, die Welt zu einem besseren Ort zu machen. Zumindest solange, bis diese hässlichen Wahrheiten den Optimismus in eine Tragödie verwandeln.`,
    tactics: `Unternehmerische Jäger gehen vielleicht auf die Jagd, um zu fangen oder sogar zu beobachten, anstatt zu töten, außer wenn sie es mit bekannten mörderischen Wesen zu tun haben. Ein Teil der opportunistischen Natur der Jagd eines Unternehmers besteht darin, mit einer wichtigen Ressource zurückzukehren, die experimentell genutzt werden kann. Dies wiederum führt zu spezieller Ausrüstung, die in einem Konflikt helfen kann, oder sogar zu einem Produkt, das synthetisiert oder reproduziert und verkauft werden kann. Das kann etwas so Einfaches wie Silberkugeln oder etwas so Subjektives wie Schutzamulette sein, je nachdem, was der Unternehmer als gerechtfertigt ansieht, um die Kosten wieder hereinzuholen. Jäger-„Unternehmen” mit unternehmerisch denkenden Mitgliedern können ungetestete Ansätze verfolgen. In manchen Fällen wissen diese Jäger gar nicht, dass sie ein Risiko eingehen, und in manchen Zellen müssen Jäger improvisieren, weil es kein eigentliches Spielbuch gibt und jede Erfahrung buchstäblich lebensrettend ist. Leider macht das auch die Ergebnisse unvorhersehbar. Wenn jemand bei einer Pizzeria eine Pizza bestellt, bekommt er in der Regel eine Pizza. Wenn jemand bei einer schwächelnden Unternehmerzelle eine Exorzismus-Dienstleistung bestellt, kann das zu einer Katastrophe führen.`,
    dangers: `Abgesehen von den persönlichen moralischen Risiken der Jagd auf das Übernatürliche besteht immer die Gefahr, dass die Beute wertvolle Prototypen erbeutet – und sogar die Werkzeuge und Waffen der Jäger gegen sie selbst einsetzt. Der unternehmerische Jäger verlässt sich stark auf seine Gadgets, Basteleien, Ausrüstung und Waffen; gelangt eines davon in die Hände des Feindes, verliert der Jäger es nicht nur, sondern womöglich gewinnt die Beute diese Fähigkeit hinzu – vorausgesetzt, das Monster findet heraus, wie man es benutzt. Der Ansatz, Kreaturen zu fangen, ist ein riskantes Unterfangen, da er die Jäger den bösartigen Kräften der übernatürlichen Beute aussetzen kann. Ein zerstörter Vampir kann einem nicht den Geist verdrehen – aber wer weiß schon, was ein gefangener Vampir vermag? Ob er einem in die Augen sieht, einen durch schiere Persönlichkeit emotional in Ketten legt oder irgendeine blutverfluchte Gemeinheit nutzt, um einem die Augen im Kopf zum Sieden zu bringen. Ganz zu schweigen davon, dass er sich schneller bewegt, härter zuschlägt und zäher ist als die Jäger selbst.`
  },

  {
    id: 2,
    name: `Gläubig`,
    description: `In Kirchen, Pagoden, Moscheen und Tempeln treffen sich Jäger des Glaubens. Sie tun sich zusammen, um sich gegen Dinge zu wehren, die in ihren heiligen Schriften nur angedeutet werden. Einige haben gemerkt, dass unerschütterlicher Glaube ein starkes Mittel gegen die Monster sein kann, die in der Nacht herumstreifen. Nur wenige brennen mit einer so starken Rechtschaffenheit wie die Anhänger des Glaubensbekenntnisses, das sie als spirituelle Waffe oder anderes Werkzeug für die Jagd nutzen können. Für den Gläubigen Jäger prägt der Glaube an eine höhere Macht seine Sichtweise, die Welt von Monstern zu befreien. Übernatürliche Wesen könnten Vorstellungen von Todsünden verkörpern, die gesandt wurden, um zu verführen oder zu schikanieren, oder sie könnten Mitglieder unheiliger Heerscharen sein, die im Widerspruch zur Existenz der Welt stehen. Gläubige Jäger können auch eine dualistische Weltanschauung haben und sich selbst als Vertreter des spirituellen Lichts im ewigen Kampf gegen die Mächte der Dunkelheit sehen. Gläubige Jäger könnten erwarten, einen unreinen Lieferanten jenseitiger Versuchungen in seiner fleischlichen Höhle zu züchtigen, den profanen Flüchen eines murmelnden Hierophanten entgegenzuwirken, die anderen Jäger in der Zelle mit ihrem eigenen Eifer zu stärken, die entarteten Nachkommen eines untoten Brandstifters abzuwehren und ihre Heimatstadt von übernatürlichem Bösen in weltlicher Gestalt zu befreien.`,
    personality: `Das Klischee vom gläubigen Jäger ist der Feuer-und-Schwefel-Fanatiker, der den Ruf dieser Glaubensrichtung geprägt hat. In Wirklichkeit ist der Glaube der Gläubigen viel umfassender und nicht unbedingt so gewalttätig und unnachgiebig. Ein Gläubiger kann ein Tempelmönch sein, der aus seinem Kloster kommt, um die Harmonie einer natürlichen Ordnung wiederherzustellen, die von einem blutrünstigen Unhold zerstört wurde. Andererseits kann er auch ein selbsternannter „Missionar” sein, der seine Überzeugungen an einem Ort aufzwingt, an dem er nicht willkommen ist. Zu den Gläubigen gehören auch diejenigen, die still und unerbittlich gegen das Übernatürliche kämpfen oder sich eher als Schild der Gerechtigkeit denn als deren Schwert sehen und diejenigen beschützen, die sich auf sie verlassen, anstatt eine Feuersbrunst der Unreinen zu entfachen. Das Endergebnis mag dasselbe sein, aber in Berufen, in denen seelenzermürbende Schrecken und der Preis des Sieges einen dazu bringen können, sich mit der ewigen Verdammnis abzufinden, machen ein reines Herz und gute Absichten den Unterschied. Vom Exorzistenpriester in seiner Soutane bis zum esoterischen Ton-Erforscher suchen treue Jäger nach dem, was ihrer spirituellen Weltanschauung zufolge falsch ist, und bringen es in Ordnung. Außerdem teilt nicht jeder Gläubige oder Faithful Jäger die selbstgerechte Weltanschauung, die ihren überheblichsten Mitgliedern zugeschrieben wird. Viele Faithful Jägers sind weltlich, pragmatisch, wohltätig – und haben viele weitere Eigenschaften, die von Vorbildern ihres Glaubens vertreten werden. Ein Katastrophenhelfer, der einer betroffenen Gemeinde nach einem Tornado beim Wiederaufbau helfen will, könnte ein Faithful Jäger sein, oder sogar ein skrupelloser Geschäftsmann mit besonders starken Überzeugungen. Außerdem haben viele von ihnen Mitgefühl für die erbärmlicheren ihrer Beute, weil sie wissen, dass jedes Monster aus einem bestimmten Grund zum Monster geworden ist und die Schuld nicht immer bei ihnen liegt.`,
    tactics: `Mehr als andere Gruppen setzen sich die Faithful Jägers für den wahren Glauben und eine Reihe mächtiger Reliquien ein (in Form von Endownments – siehe S. 97). Wahrer Glaube und Glaube sind aber zwei ganz verschiedene Sachen. Tatsächlich haben einige Mitglieder des Glaubens der Gläubigen weder den wahren Glauben noch Zugang zu Reliquien selbst – sie sind Teil des Volksglaubens, der sich trotzdem gegen das Okkulte stellt, und einige haben das Glück, Reliquien zu entdecken, die in die Hände von bösartigen Kreaturen gefallen sind. Zu diesem Zweck verbringen Gläubige Jäger einen Großteil ihrer Zeit mit der Erforschung, Beobachtung oder Rückeroberung von Reliquien und danach mit Kontemplation, dem Studium heiliger Rubriken oder anderen Erbauungen des heiligen Selbst. Auf der Jagd handeln Gläubige oft konservativ und „nach Vorschrift”, was auch immer ihre persönliche Glaubenspraxis vorsieht. Aber natürlich gibt es auch rebellische Gläubige, die wahrscheinlich durch Katechismus geschützt sind, der als Bollwerk gegen Versuchungen und andere Laster der Bösen dient. All dies variiert jedoch stark je nach den Werten und dem Hintergrund des jeweiligen Glaubens. Ein Gläubiger kämpft vielleicht im geordneten Stil seliger Kriegermönche, während ein anderer Jäger verbotene Guerillataktiken anwendet, die aus jahrzehntelanger Verfolgung durch unterdrückerische Kulturen entstanden sind.`,
    dangers: `Manchmal versucht ein treuer Jäger, die Agenda einer Religion oder sogar einer glaubensbasierten Organisation umzusetzen. Das ist echt gefährlich, weil die Strukturen, die vorgeben, höhere Mächte zu repräsentieren, oft wenig mit den erklärten Ansichten dieser höheren Mächte zu tun haben. In extremen Fällen ist das Hauptziel von Faithful Jägers die Aufrechterhaltung der Macht der Organisation oder der kulturellen Dominanz – ähnlich wie bei einer Organisation. „Liebe deinen Nächsten“? Eher „Verfolge den Abweichler“. Dies gilt jedoch nicht für alle Glaubensrichtungen und ist am riskantesten bei 38 Religionen, die in ihren Kulturen vorherrschende Glaubensrichtungen sind und die auch kulturell gesehen besonders aggressiv sind. Eine Glaubenskrise ist ein Konzept, das über Glaubensbekenntnisse hinausgeht, aber auch einen Jäger untergraben kann, dessen Entschlossenheit ansonsten unerschütterlich ist. Dies kann das Ergebnis einer unnachgiebigen Dogmatik oder sogar einer Neigung sein, den eigenen Antrieb hinter einer persönlichen Mythologie eines höheren Gutes zu rechtfertigen.`
  },

  {
    id: 3,
    name: `Neugierig`,
    description: `Nicht alle Jäger sind neu in den Geheimnissen des Okkulten. Einige wissen schon was über die geheime Welt um sie herum und wollen immer tiefer in die Metaphysik des Übernatürlichen eintauchen. Diejenigen, die dem Credo der Neugierigen folgen, zerstören ihre Beute eher nicht sofort, sondern versuchen, okkultes Wissen von ihnen zu sammeln oder sogar riskante Beschwichtigungen zu arrangieren, in der Hoffnung, dass die jetzt gesammelten Infos in Zukunft mehr Schutz bringen. Für viele Neugierige ist Wissen seine eigene Belohnung. Neugierige Jäger sehen eine Welt, die in übernatürlicher Dunkelheit gehüllt ist, und versuchen, diesen Schatten zurückzudrängen, indem sie das Licht des Wissens darauf werfen. Das Ausmaß und die Funktionsweise der geheimen Welt und der Wesen, die sie bewohnen, zu entdecken, ist der Schwerpunkt der Bemühungen der Inquisitoren. Sie können technisch versierte Informationsjäger, geschickte Infiltratoren vor Ort oder introvertierte Archivare sein, aber alle glauben an und teilen den Wunsch, mehr zu wissen. Neugierige Jäger könnten die Geschichte ihrer Stadt in Bezug auf unaussprechliche Kulte erforschen, den Standort der Höhle des Opfers durch die Indizierung arkaner Telemetriedaten entdecken, eine Scheinfirma infiltrieren, die dazu dient, die Vermögenswerte einer mysteriösen Person zu verbergen, die wichtigsten Details des Eindringens in die Höhle eines Ungeheuers aufzeichnen und die Methoden und Ergebnisse einer erfolgreichen Jagd archivieren.`,
    personality: `Viele Neugierige gehen die Jagd echt pragmatisch an und wollen unbedingt mehr über ein Problem wissen, bevor sie versuchen, es zu lösen. Das sind die Leute, die Uhren auseinandernehmen, Sprachen lernen, um unübersetzte Bücher zu lesen, oder sich nach Ladenschluss ins Labor schleichen. Zeigt man ihnen ein Schloss, verlangen sie den Schlüssel; zeigt man ihnen eine Mauer mit einem fehlenden Ziegelstein, finden sie etwas, das sie in das Loch stecken können. Individuell unterscheiden sich die Motive und Methoden der Neugierigen stark voneinander. Einige sind clever und haben persönliche Befriedigung daran, nicht nur die Monster, sondern auch die Ergs (oder sogar die weniger subtilen Jäger) zu überlisten. Oder sie sind furchtlose Informationssammler, vielleicht mit militärischem Hintergrund in der Aufklärung, Spionageausbildung oder roher Charisma, die es ihnen ermöglicht, sich in beliebigen Subkulturen zu bewegen, die alle übernatürliche Eindringlinge verbergen könnten. Wieder andere sehen sich als Meister der Geheimnisse, Organisatoren von Wissen oder sogar als prosaischere Faktenfinder in einer Welt, die sich selbst schützt, indem sie nicht weiß, was sie entdecken. Einige Neugierige sind frustriert über den scheinbar unendlichen Tisch des Lernaufwands, der das Markenzeichen des Glaubens sein kann. Viele Beobachter des Okkulten scheinen keine Dringlichkeit zu zeigen – Monster jagen Menschen, und, ratet mal, die Jäger wissen das bereits, sodass irgendwann der Impuls, tatsächlich etwas dagegen zu unternehmen, in den Vordergrund treten könnte. Es überrascht nicht, dass gerade diese Personen am ehesten bereit sind, sich zu engagieren und sich der Sache der Inquisitoren anzuschließen, auch wenn der Glaube selbst den Ruf hat, altmodisch und verstaubt zu sein.`,
    tactics: `Das Klischee vom neugierigen Jäger ist der intellektuelle Typ mit Brille, der von muskulöseren oder besser ausgerüsteten Jägern locker übertrumpft wird. Neugierige wissen das natürlich und gehören daher zu den kenntnisreichsten und am besten vorbereiteten Jägergruppen. Sie nehmen sich die Weisheit zu Herzen, dass das Verständnis des Feindes die beste Waffe gegen ihn ist, und sind oft am besten darüber informiert, worauf sie sich einlassen, oder kennen zumindest die „bekannten Unbekannten”. Lasst die Hooahs die Türen eintreten und das Feuer eröffnen – der kluge Inquisitor wird sich bereits durch das Kellerfenster hereingeschlichen und wieder hinausgeschlichen haben, nachdem er die Tagebücher der Beute und die aufschlussreichsten Kleinigkeiten aus ihrem Versteck mitgenommen hat. Dies steht im Widerspruch zu den Motiven der Inquisitoren. Das tatsächliche Vernichten von Monstern steht oft ganz unten auf der Prioritätenliste – das Wichtigste ist, zu lernen, und der beste Weg, dieses Wissen weiterzugeben, ist, es mit anderen zu teilen. Kein Wunder also, dass neugierige Jäger Überlebenstaktiken gegenüber Angriffstaktiken bevorzugen. Das heißt auch, dass die meisten neugierigen Jäger sich mehr auf Aufklärung als auf die Neutralisierung ihres Ziels konzentrieren und daher vergleichsweise leicht bewaffnet sind. Die okkulte Natur des Übernatürlichen bedeutet, dass Inquisitive sich bewusst sind, wie wenig sie über ihre Ziele wissen, sodass ein Rückzug fast immer sinnvoller ist als ein anhaltender Konflikt. Im Allgemeinen gilt dies auch für die Art von Jagden, die Inquisitive in der Regel gegen übernatürliche Feinde unternehmen. Inquisitoren sind viel eher bereit, ein Opfer zu retten, einen Artefakt zu finden, der ihnen Erkenntnisse bringt, eine „Probe” von einem leblosen oder handlungsunfähigen Ziel zu sammeln oder zuvor beobachtete Daten über eine übernatürliche Kreatur zu bestätigen, als eine Werwolfhöhle mit extremer Voreingenommenheit zu vernichten. Und der Inquisitor ist wahrscheinlich der Erste, der sagt: „Vielleicht sollten wir das mutmaßliche Vampirnest nicht nachts angreifen, da sie dann aktiv sind.” Lerne zu jagen, Anfänger.`,
    dangers: `Die vielleicht größte Gefahr für neugierige Jäger ist, dass sie nach Wissen über Dinge suchen, die aktiv versuchen, Infos über ihre Existenz zu verschleiern. Und die zweitgrößte Gefahr ist, dass viele dieser übernatürlichen Wesen sowohl mächtig als auch aktiv feindselig gegenüber denen sind, die ihre Existenz aufdecken oder ihre Geheimnisse lüften wollen. Neugierige gehören nicht zu den unparteiischsten Mitgliedern der Organisation, und die Kombination dieser drei Faktoren führt oft zu kurzen, grausam endenden Karrieren unter den Jägern. Ohne das Arsenal oder die taktischen Fähigkeiten, über die andere Glaubensrichtungen verfügen, haben Inquisitoren oft nicht den Luxus, „die großen Geschütze“ aufbieten zu können, sobald sie ihre Karten auf den Tisch gelegt haben. Erschwerend kommt hinzu, dass Inquisitoren oft nur grobe Vorbereitungen treffen, sich dann aber für bestimmte Eventualitäten unvorbereitet wiederfinden. Eine von Inquisitoren angeführte Zelle weiß vielleicht, dass sie es mit einem Vampir zu tun hat und dass Knoblauch und Kreuze gegen Vampire nicht wirken, Feuer aber schon – und dann wäre die Zelle völlig unvorbereitet, wenn der Vampir aus einer schattigen Nische hinter ihnen hervortritt, denn wer hätte gedacht, dass Vampire durch Schatten gehen können? Die unpraktischen Inquisitoren werden oft zu ihrem eigenen ungewollten Gegenspieler.`
  },

  {
    id: 4,
    name: `Kriegerisch`,
    description: `Die Leute vom kriegerischen Credo stehen auf direkte, kämpferische und sogar ziemlich gewalttätige Methoden bei der Jagd. Sie denken, dass Zerstörung der kleinste gemeinsame Nenner bei der Monsterjagd ist und dass die beste Verteidigung gegen das Übernatürliche ein entschlossener Angriff ist. Die meisten sind natürlich schlau genug, um zu erkennen, dass sie gegenüber dem Übernatürlichen immer im Nachteil sind, und versuchen, diese Chancen durch intensives Training und Feuerkraft auszugleichen. Andere Jäger mögen sie als unnötiges Risiko betrachten, aber wenn es hart auf hart kommt und das Monster nicht genau dort ist, wo sie es erwartet haben, oder nicht so verwundbar ist, wie sie dachten, will jeder einen Martial-Jäger an seiner Seite haben. Das ist natürlich ein Credo, das zu bestimmten Klischees führt, aber für jeden ehemaligen Scharfschützen gibt es ein Dutzend Schraubenzieher schwingende Klempner, die genug haben, Magazinredakteure, die ihre Selbstverteidigungskurse nutzen, und Technikfreaks, die wissen, dass selbst ein Vampir nicht mehr aufsteht, wenn er von einem schweren und schnellen Auto überfahren wird. Ein Martial Jäger kann damit rechnen, gegen einen ausgetrockneten Vampir in dessen schäbiger Villa zu kämpfen, einen Werwolf zu überfallen, der durch die Slums streift, die korrupten Kultisten eines wahnsinnigen Hexenmeisters anzugreifen, sich aus einer Killbox der Koalition herauszuschießen oder den Blutsauger zu schlagen, der dachte, er hätte ein wehrloses Opfer gefunden.`,
    personality: `Das Credo der Krieger klingt einfach, aber in Wirklichkeit gibt's da viele Jäger, die aus ganz unterschiedlichen Gründen dabei sind. Manche sind idealistische Neulinge, die klare Aktionen mögen, andere haben beim Militär gedient und sind ausgebildet, und wieder andere wollen einfach nur die übernatürlichen Wesen um jeden Preis ausschalten. Jäger, die dem kriegerischen Credo folgen, stehen vielleicht nicht selbst an vorderster Front, sondern arbeiten eher im technischen oder unterstützenden Bereich ihrer Zelle, bevorzugen aber trotzdem die konfrontative Lösung. Andere Credos sehen das kriegerische Credo manchmal als voreilig oder sogar stur an, aber die Nuancen des Credos bestätigen das nicht. Mehr als Tollkühnheit suchen die kriegerischen Jäger in der Regel nach Endgültigkeit. Was auch immer sie zur Jagd gebracht hat, sie wollen nicht riskieren, dass andere Menschen das gleiche Schicksal erleiden, und sie jagen, um so viel wie möglich zu schützen, und nicht aus einer angeborenen Sturheit heraus. Das einzige gute Monster ist ein totes Monster, und am besten eines, das sie selbst getötet haben, damit es keine Unklarheiten über den Ausgang gibt.`,
    tactics: `Finde die Beute; vernichte die Beute. Das ist der Kern des kriegerischen Credos. In der Praxis gibt's zwar mehr Nuancen, aber im Grunde geht's darum, dem Biest einen Pfahl ins Herz zu rammen oder ihm eine Silberkugel in den Kopf zu jagen. Martial-Glaubensbekenntnis Jäger wissen, wie wichtig es ist, Infos zu sammeln und sich vorzubereiten, aber der Fokus ihrer Jagd liegt darauf, die Beute so zu erledigen, dass sie keine Opfer mehr machen kann. Das kann alles Mögliche sein, vom brutalen Aufbrechen einer Tür und Köpfen des Untoten bis hin zu einer nächtlichen Überwachung, bei der jede Bewegung der Beute verfolgt wird, um schließlich aus fast einem Kilometer Entfernung von einem Scharfschützenstand auf dem Dach einer Fabrik aus den Abzug zu betätigen, während sich das Monster in einer verlassenen Maschinenhalle versteckt. Angesichts der weit gefassten Haltung der Martial Jägers ist das Spielbuch riesig und deckt alles ab, vom „Betreten Transsilvaniens” und der Eliminierung von Zielen bis hin zu umfangreichen Vorab-Aufklärungen und dem Umgang mit Vertraulichkeitsverletzungen im Nachhinein. Die umfangreiche Ausrüstung und das strenge Training, das viele Martial Jägers mitbringen, tragen dazu bei, dass die Ergebnisse ihrer Operationen den Wünschen der Zelle entsprechen. Je nach Zelle kann das eine fast militärische Durchbrechung und Säuberung sein oder ein forensischer Durchbruch oder sogar ein PR-Erfolg. Es hängt alles vom Ziel ab. Viele Martial-Strategien vermeiden verständlicherweise den Umgang mit lebenden Zielen, weil sie Gedankenkontrolle, emotionale Nötigung und übernatürliche Gewalt fürchten, sodass fast alle Infos auf einer gewissen Entfernungsebene an den Jäger weitergegeben werden. Übernatürliche Wesen sind komplex und vielfältig, und was für einen Fledermausgesichtigen Vampir gilt, unterscheidet sich von dem, was über diesen Werwolf bekannt ist, ganz zu schweigen von den Fraktionen, die offenbar in den Gesellschaften der Monster existieren.`,
    dangers: `Vielleicht mehr als bei jedem anderen Glaubensbekenntnis wird der Unterschied zwischen kriegerischen Jägern und Extremisten deutlich. Der Unterschied zwischen Jägern, deren Drang 46 sie zum Martial-Glaubensbekenntnis treibt, und einem Extremisten, der falsche Schlussfolgerungen über die Natur des Übernatürlichen zieht, ist riesig: Der getriebene Jäger weiß, dass Vampire echt sind und unschuldige Menschen jagen, während der radikalisierte Einzelne vielleicht glaubt, dass „Blankbodies Teil eines geheimen Plans sind, um dem Kernland den Sozialismus aufzuzwingen”. Der Unterschied besteht natürlich darin, dass das eine wahr ist (da es tatsächlich persönlich erlebt wurde) und das andere eine unbegründete Spekulation im Stil eines Murderboards oder absichtliche Fehlinformation ist. Außerdem sind Martial-Jäger am ehesten mit einer doppelten Bedrohung durch Situationen konfrontiert, die ihr Privatleben beeinträchtigen. Einerseits kann, wie bei allen Jägern, die Geheimhaltung der Jagd persönliche Beziehungen zerstören und die Lebensumstände destabilisieren. Darüber hinaus kann die Belastung, die eine Reaktion an vorderster Front für ihr Privatleben mit sich bringt, in dieser Hinsicht mit der Bedeutung des Übernatürlichen konkurrieren. Ob sie nun ihre Familie verprellen, weil sie sagen: „Ich sage euch, Werwölfe gibt es wirklich“ oder „Wir müssen wieder umziehen, 3.000 Meilen weit weg in eine Boomtown in der Nähe der Teersande“ – eine Sache zu haben, die größer ist als sie selbst und die das Sagen hat, gibt vielen das Gefühl, keine Kontrolle über ihr eigenes Leben zu haben.`
  },

  {
    id: 5,
    name: `Untergrund`,
    description: `Manche Jäger starten auf der falschen Seite der gesellschaftlichen Normen – und das gibt ihnen eine einzigartige Perspektive, wie sie diese verdammten zotteligen Nachtgestalten erledigen können, die sich an etwas vergreifen, das ihrer Meinung nach ihnen gehört. Für diese Jäger sind konventionelle Methoden entweder nicht verfügbar oder unerwünscht. Jäger des Untergrund-Glaubens bekämpfen das Okkulte durch das Bewusstsein für Gegenkulturen, die Nähe zum Übernatürlichen durch kriminelle Unternehmungen oder durch List und Sabotage. Mit einem Credo, das teils aus Straßenjustiz, teils aus rivalisierender Außenseiterhaltung besteht, halten Underground-Jäger ihre Ohren offen in den Randbereichen der Gesellschaft, wo Monster oft leichte, verletzliche Beute finden, wo aber auch Widerstand geschürt werden kann unter denen, die wissen, dass der offizielle Schutz sie wahrscheinlich nicht einschließt. Außerdem besteht der Underground nicht nur aus städtischen Gebieten. Untergrundjäger finanzieren sich vielleicht mit einem Schwarzbrennerei-Betrieb im ländlichen Appalachengebiet, arbeiten mit dem antiimperialistischen Widerstand in Venezuela zusammen oder schmuggeln Menschen über die bergigen Grenzen des Balkans an den Ort ihrer Wahl. Jäger, die dem Credo des Untergrunds folgen, organisieren vielleicht eine Gruppe rachsüchtiger Hafenarbeiter, einen Flammenwerfer aus Chemikalien zu basteln, die „vom LKW gefallen sind“, eine rivalisierende Bande auszuspionieren, die offensichtlich mit Vampiren unter einer Decke steckt, eine verschlossene Einwanderer-Nachbarschaft zu schützen und mit dem „Schirmherrn“ des Bezirks zusammenzuarbeiten.`,
    personality: `Die Reihen der Underground-Glaubensgemeinschaft umfassen eine Vielzahl von Jägern, von denen, die zur falschen Zeit am falschen Ort waren und etwas Unnatürliches gesehen haben, bis zu denen, die, ehrlich gesagt, einfach nur die ganze Zeit sauwütig sind und das Niederbrennen der Verstecke von Monstern zumindest eine Art positives Ergebnis hat. Vielleicht ist das Einzige, was die Underground-Jäger verbindet, dass sie genug haben – sie sind Jäger geworden, um zu jagen. Untergrundjäger sind oft vielseitig begabt und gehen alles, was sie im Leben tun, mit einer Do-it-yourself-Einstellung an. Sie mögen optimistische Dilettanten sein, die Schnellsten in ihrem Büro oder verschlagene Prepper, aber sie sind sehr stolz darauf, dass sie alles selbst erledigen können, ohne einen Spezialisten hinzuziehen zu müssen, egal um was es sich handelt (und oft mit unterschiedlichem Erfolg bei der Lösung). Ein Teil der Underground-Persönlichkeit ist ein zynischer Blick nicht nur auf die Organisationen, sondern auch auf die vorherrschenden sozialen Strukturen, die den Status quo ausmachen. Ob es nun der Wunsch ist, die sozioökonomischen Strukturen zu zerstören, die die linearen Räume der Armut und Verzweiflung schaffen, in denen Monster gedeihen, oder der Wunsch, das System mit kriminellen (aber nicht unbedingt böswilligen) Absichten gegen sich selbst zu verwenden – der Underground-Jäger weiß, dass niemand auf ihn und seinesgleichen achtet außer er selbst und seine Zelle.`,
    tactics: `Passend zu ihrer einfallsreichen Weltanschauung sind die gemeinsamen Taktiken der Untergrundbewegung ein Sammelsurium von Sachen, die funktionieren. Obwohl sie sofortiges Handeln bevorzugen, sehen die Untergrundkämpfer keinen Sinn darin, sich auf unbekannte Feinde zu stürzen – das ist ein guter Weg, um schnell zu sterben oder, schlimmer noch, in der unheiligen Armee eines Monsters zu landen. Aber jede verlorene Nacht kann Menschenleben kosten, daher arbeiten die Underground-Jäger eher sparsam und erkunden das Terrain, um ihre menschliche Schwäche auszugleichen. Die einzelnen Mitglieder bringen viel persönliche Erfahrung in die Jagd ein, und so reichen die Taktiken der Underground-Jäger von Vergiftungen über Einbrüche und Attentate bis hin zu organisierten kriminellen Machenschaften. Aus der Perspektive eines Underground Jägers geht es um Fallen, Tricks und schmutzige Kämpfe, da die Zellen oft ohne die überlegenen finanziellen Mittel und die Feuerkraft etablierter Organisationen auskommen müssen. Das bedeutet viel Improvisation, viel Irreführung und viel Arbeit mit Stellvertretern und Spähern. Die gleichen Kids, die an der Straßenecke rumhängen und nach Polizisten Ausschau halten, können genauso gut nach dem Sedan eines Vampirs oder einem seltsamen, formlosen Ding Ausschau halten, das über die Dächer springt. Die Unorthodoxie eines Underground-Jägers kann sicherlich ein Vorteil sein. Übernatürliche Feinde können den Untergrund als unberechenbar empfinden, da sie selten kodifizierte Prozesse oder beobachtbare Verfahren außerhalb ihrer eigenen Vorstellung von „bewährten Praktiken” anwenden. Der Do-it-yourself-Charakter der Jagd ist oft Ausdruck der Philosophie hinter den Untergrundjägern – töte die Monster und halte sie im Ungewissen. Das soll nicht heißen, dass der Untergrund dumm, töricht oder unkoordiniert ist. Vielmehr gibt es eine Offenheit in ihrer Herangehensweise, die nur mit dem martialischen Credo vergleichbar ist, nur ohne den direkten Kampf. Monster bereuen zu lassen, ist der Sinn der Jagd.`,
    dangers: `Das Problem für Underground Jägers ist, dass sie oft nicht genug langfristig planen und deshalb nicht richtig auf übernatürliche Ereignisse vorbereitet sind. Die Leidenschaft, die sie im Moment antreibt, ist keine Garantie dafür, dass sie zukünftige Gefahren erkennen. Viele im Untergrund haben einen ersten Erfolg, indem sie ihre Beute aus heiterem Himmel mit dem Überraschungsmoment angreifen, weil das Ziel nicht weiß, dass es beobachtet wird. Wenn die Beute aber überlebt oder Kumpels hat, die nach dem Angriff eins und eins zusammenzählen können, sind die Untergrundjäger oft in der Defensive, obwohl sie nur einen einzigen, überwältigenden Angriff geplant hatten. Das macht die Leute aus dem Untergrund oft zu den Jägern mit der kürzesten Lebensdauer. Die Anhänger des Untergrund-Credo werden manchmal hart und verlieren ihr Mitgefühl. In diesen Fällen sehen sie ihren Widerstand gegen Monster als eine persönliche Mythologie, die an sich schon heuchlerisch ist, da sie lautstark vom „Schutz der Menschheit” sprechen, aber diejenigen verachten, die sich nicht selbst für die Sache einsetzen.`
  }
];

export const drives: IH5Drive[] = [
  {
    id: 1,
    name: `Neugier`,
    description: `Was machen Monster im Dunkeln? Der Jäger will unbedingt alles über seine Beute wissen und gräbt unermüdlich immer tiefer, um neue Infos zu finden.`,
    redemption: `Die Zelle muss neue Infos über ihre Beute finden.`
  },

  {
    id: 2,
    name: `Rache`,
    description: `Der Jäger oder jemand, der ihm nahesteht, wurde von der Beute oder anderen ihrer Art verletzt. Die Waage muss ausgeglichen werden.`,
    redemption: `Die Zelle muss ihrer Beute (oder einem ähnlichen Wesen) entweder direkt oder indirekt Schaden zufügen.`
  },

  {
    id: 3,
    name: `Eid`,
    description: `Der Jäger hat den Kreaturen der Nacht was geschworen und wird alles tun, um das zu schaffen – sein Wort ist sein Gebot.`,
    redemption: `Die Zelle soll den Jägern helfen, ihren Schwur aktiv einzuhalten oder ihn näher an die Erfüllung zu bringen.`
  },

  {
    id: 4,
    name: `Gier`,
    description: `Ein gieriger Typ will das haben, was ein übernatürlicher Gegner hat, und findet es unfair, dass nächtliche Kreaturen von ihrer Monstrosität profitieren.`,
    redemption: `Sammeln von Ressourcen aus ihrem Steinbruch oder von ähnlichen Kreaturen.`
  },

  {
    id: 5,
    name: `Stolz`,
    description: `Die Begegnung mit dem Übernatürlichen und Übermenschlichen hat in den Jägern den brennenden Wunsch geweckt, sich gegen Wesen zu beweisen, die Kräfte haben, die sie nicht verdient haben. Ob sie nun den unerschütterlichen menschlichen Geist repräsentieren oder einfach nur wahnsinnig ehrgeizig sind – die Jäger werden jede Chance nutzen, um ihre Beute zu überwältigen.`,
    redemption: `Die Beute in irgendeiner Art von Herausforderung direkt oder indirekt besiegen.`
  },

  {
    id: 6,
    name: `Neid`,
    description: `Warum haben Monster so coole Vorteile? Der Jäger wird sich der Nacht anschließen oder dabei sterben.`,
    redemption: `Versuche, dich bei den Steinbrucharbeitern beliebt zu machen, oder besorg dir Proben von dem Zeug, das ihnen ihre Kraft gibt.`
  },

  {
    id: 7,
    name: `Sühne`,
    description: `Der Jäger hat früher mal einem Monster geholfen, egal ob er es wusste oder nicht, und will jetzt für seine Taten büßen. Er weiß, dass Unschuldige wegen seiner Handlungen gelitten haben, und stellt sich freiwillig in Gefahr, um seine Schuld zu begleichen.`,
    redemption: `Die Zelle muss jemanden vor dem Steinbruch (oder einem ähnlichen Wesen) beschützen, entweder direkt oder durch einen Stellvertreter, indem sie sich ihm in den Weg stellt und sprichwörtlich eine Kugel für ihn abfängt. Alternativ kann sich der Jäger selbst rehabilitieren, indem er dasselbe für einen Zellengenossen tut.`
  }
];

export const traits: ITraitPack[] = [
  {
    id: 51,
    type: "merits",
    name: "Ernährungsberater",
    description: "Du hast echt ein Händchen dafür, leckere und gesunde Mahlzeiten zuzubereiten, die nicht nur satt machen, sondern auch alles haben, was der Körper braucht. Genau wie in einer Feuerwache wird ein guter Koch von seinen Kollegen geschätzt, und die „Familienzeit” am Tisch hilft dabei, dass viele Zellen nicht aus dem Takt geraten, vor allem angesichts der Herausforderungen, denen sie jede Nacht gegenüberstehen.",
    advantages: [
      {
        id: 51,
        level: 1,
        name: "Alleine kochen",
        description: "Du bekommst zu Beginn einer Sitzung, in der du vor Beginn die Möglichkeit hattest, eine Mahlzeit zu dir zu nehmen, einen zusätzlichen Punkt oberflächlicher Gesundheit zurück.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 52,
        level: 2,
        name: "Zellkoch",
        description: "Deine ganze Zelle bekommt zu Beginn einer Sitzung, in der du die Chance hattest, dich vorher vorzubereiten, einen zusätzlichen Punkt oberflächliche Gesundheit zurück. (Wer zur Essenszeit nicht bei der Zelle war, zum Beispiel weil er von einem Vampir gefangen gehalten wurde, während der Rest der Zelle im sicheren Haus war, kriegt diesen Vorteil nicht.)",
        actions: [],
        isRepeatable: false
      }
    ],
    disadvantages: [],
    specialRules: TraitSpecialRules.None
  },
  {
    id: 52,
    type: "merits",
    name: "Psychologische Eigenschaften",
    description: "Die Abrechnung ist echt stressig und die Jagd ist ein ziemlich anstrengender Lebensstil. Die Risiken gehen auf die Psyche oder Persönlichkeit eines Jägers, ganz zu schweigen von den Leuten, deren Persönlichkeit sie schon in Gefahr bringt, bevor sie überhaupt ihre Bestimmung und ihren Antrieb entdeckt haben.",
    advantages: [],
    disadvantages: [
      {
        id: 53,
        level: 1,
        name: "Leben am Limit",
        description: "Du gehörst zu den Leuten, die einfach jede Chance nutzen müssen, um das Leben voll auszukosten. Wenn du vor der Entscheidung stehst, dich auf ein riskantes Abenteuer einzulassen, das du noch nie gemacht hast (wie zum Beispiel eine neue Droge zu probieren, Vampirblut zu trinken oder einen Wechselbalg als Liebhaber zu nehmen), musst du bei allen Aktionen einen Malus von zwei Würfeln hinnehmen, bis du die neue Erfahrung gemacht hast oder die Szene vorbei ist. Dieser Makel zwingt dich nicht zu selbstmörderischen Handlungen ... aber du bist möglicherweise nicht immer in der Lage, die Folgen deiner Handlungen genau vorherzusagen.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 54,
        level: 2,
        name: "Willensschwach",
        description: "Du hast Schwierigkeiten, deine eigene Persönlichkeit durchzusetzen, wenn du mit dem Willen eines anderen konfrontiert wirst. Du bist nicht unbedingt unterwürfig, sondern fühlst dich vielleicht sicherer, wenn du dich an andere anpasst. Selbst wenn du dir übernatürlicher Versuche bewusst bist, dich mental oder emotional zu beeinflussen (z. B. durch Charme-, Konnektions- oder Schreckens-Effekte – siehe S. 167–168), kannst du das aktive Widerstandssystem nicht nutzen, um diese Effekte zu vermeiden.",
        actions: [],
        isRepeatable: false
      }
    ],
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
        level: 2,
        name: "Unpassende Aura",
        description: "Es ist irgendwie anders, wie manche übernatürliche Wesen dich sehen. Monster denken manchmal, du gehörst zu ihnen oder bist ein ganz anderes (und vielleicht feindseliges) übernatürliches Wesen. Das kann zwar dazu führen, dass dein Gegner dich überschätzt, aber später auch zu unangenehmen Situationen führen.",
        actions: [],
        isRepeatable: false
      },
    ],
    disadvantages: [
      {
        id: 18,
        level: 1,
        name: "Stigmata",
        description: "Du blutest aus offenen Wunden an deinen Händen, Füßen und deiner Stirn, wenn du körperliche Verletzungen oder Willenskraftschaden erleidest (aber nicht, wenn du Willenskraft einsetzt). Das zieht Aufmerksamkeit auf dich, hinterlässt Spuren und kann nach Ermessen des Spielleiters zu Strafen bei einigen Würfelpools führen. Entscheide dich bei der Charaktererstellung entweder für Gesundheitsschaden oder Willenskraftschaden; dieser Makel kann ein zweites Mal für die andere Schadensart gewählt werden, aber dann machst du dich wirklich auffällig.",
        actions: [],
        isRepeatable: true
      },
      {
        id: 19,
        level: 1,
        name: "Der Fluch der Hexe",
        description: "Eine übernatürliche Krankheit hat dich erwischt und dich schnell altern lassen, wie zum Beispiel der „böse Blick” eines Zauberers oder das Trinken von abnormem Vampirblut. Du siehst mindestens zehn Jahre älter aus, als du bist. Außerdem hat deine Gesundheit gelitten, und du hast ein Feld weniger auf deinem Gesundheitsanzeiger, als du sonst hättest.",
        actions: [],
        isRepeatable: true
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
    name: "Einfluss",
    specialRules: TraitSpecialRules.None,
    description: "Du hast Einfluss in deiner Community, egal ob durch Reichtum, Ansehen, ein politisches Amt, Erpressung oder irgendwie unsichtbare übernatürliche Manipulation zu deinen Gunsten. Jäger mit viel Einfluss können die Politik und Gesellschaft ihrer Community beeinflussen und in seltenen Fällen sogar kontrollieren, manchmal sogar die Polizei und die Stadtverwaltung ... und sogar die Organisationen. Standardmäßig wirkt sich Einfluss am stärksten innerhalb einer Gruppe oder Region deiner Stadt aus. Gruppen können groß und sogar diffus sein: organisierte Kriminalität, Medien, Religion, Polizei, Stadtverwaltung usw. Regionen sollten größer sein als Stadtteile oder alle außer den größten einzelnen Gebieten: Brooklyn, die Rive Gauche, die South Side, die Ginza usw. Dein Einfluss gilt für die Stadt als Ganzes mit einem Punkt weniger als innerhalb deiner Gruppe oder Region. Die Nutzung des lokalen Einflusses in einer anderen Stadt in derselben Region, demselben Bundesstaat oder derselben Provinz ist möglicherweise mit einem zusätzlichen Punkt Abzug möglich, und so weiter. So kann ein Jäger in Hollywood mächtig (••••) sein, in ganz Los Angeles fest etabliert (•••), in San Diego oder San Francisco kaum einflussreich (••) und in Chicago oder New York nur gut vernetzt (•). Der Storyteller kann von dir verlangen, dass du Einfluss anstelle einer Eigenschaft in bestimmten Würfelpools einsetzt, insbesondere bei sozialen Tests, bei denen du versuchst, kleinere Bürokraten oder Ähnliches in deiner Gruppe zu beeinflussen. Dieser Hintergrund hilft dir dabei, ein „verlassenes” Gebäude abreißen (oder erhalten) zu lassen, nicht aber, globale Kriege zu beginnen. Beachte, dass Einfluss für Jäger ein heikler Vorteil ist. Je mehr sie ihren Einfluss nutzen, desto mehr Aufmerksamkeit ziehen sie auf sich, und selbst wenn übernatürliche Feinde sich im Verborgenen halten müssen, könnten verärgerte Organisationen ihre Aufmerksamkeit auf diesen Emporkömmling richten. Theoretisch sollten Jäger schließlich Außenseiter bleiben (siehe S. 152), auch wenn sie in ihren Gemeinschaften über einen gewissen Spielraum verfügen. Die Geschichte ist voll von Leuten, die ihren Einfluss überschritten haben oder sich zu oft darauf verlassen haben und dann in einem einzigen verzweifelten Moment untergegangen sind.",
    advantages: [
      {
        id: 87,
        level: 1,
        name: "Gut vernetzt",
        description: "Du kannst sicher sein, dass du respektvoll angehört wirst.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 88,
        level: 2,
        name: "Einflussreich",
        description: "Die Leute wollen dir einen Gefallen tun.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 89,
        level: 3,
        name: "Verwurzelt",
        description: "Mächtige Leute und Gruppen trauen sich kaum, sich gegen dich zu stellen.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 90,
        level: 4,
        name: "Machtvoll",
        description: "Wenn es keinen guten Grund gibt, was anderes zu machen, machen die Leute einfach mit.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 91,
        level: 5,
        name: "Dominant",
        description: "Die weniger wichtigen Leute versuchen rauszufinden, was du willst, und machen es als Erstes.",
        actions: [],
        isRepeatable: false
      }
    ],
    disadvantages: [
      {
        id: 92,
        level: 1,
        name: "Nicht gemocht",
        description: "Zieh einen Würfel von den Sozialtest-Würfelpools ab, die irgendeine Gruppe in der Stadt betreffen, außer deinen Kontakten und Verbündeten oder anderen Leuten, die dir ganz klar treu sind.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 93,
        level: 2,
        name: "Verachtet",
        description: "Eine Gruppe oder ein Stadtteil will dich und deine Zelle nur ärgern. Nimm zwei Würfel von deinem Würfelpool ab, wenn du versuchst, jemanden, der neutral ist, dazu zu bringen, dich politisch zu unterstützen oder dir einen Gefallen zu tun. Der Spielleiter sollte jede Chance nutzen, um deine Gegner in die Geschichte einzubauen.",
        actions: [],
        isRepeatable: false
      }
    ]
  },
  {
    id: 18,
    type: "backgrounds",
    name: "Diener",
    specialRules: TraitSpecialRules.None,
    description: "Du hast einen oder mehrere loyale und treue Diener oder Assistenten. Diese können bezahlte Angestellte sein, langjährige Verwalter von dir oder deiner Familie oder sogar Opfer irgendeines unschönen Schicksals, das sie an dich bindet. (Obwohl das Letztere natürlich deine Moral in Frage stellt.) Du hast immer auf irgendeine Weise Kontrolle über deine Gefolgsleute: durch ein Gehalt, eine Art rechtlichen Einfluss oder sogar übernatürliche Zwangsmaßnahmen. Obwohl sie normalerweise loyal sind, können Gefolgsleute dich verraten, wenn die Belohnung das Risiko überwiegt oder wenn du sie schlecht behandelt hast. Der Geschichtenerzähler kann jederzeit eine Szene zwischen dir und einem Gefolgsmann einbauen. Gefolgsleute sollten wie Menschen mit eigenen Zielen und Wünschen handeln, nicht wie Marionetten. Tatsächlich könnte es sein, dass sie sich nichts sehnlicher wünschen als die Rückkehr zu ihrer eigenen Autonomie oder einfach nur eine fette Prämie am Jahresende. Geschichtenerzähler können Gefolgsleute nutzen, um die Chronik spannender zu machen; lass nicht zu, dass sie oder ihr Missbrauch die Geschichte ruinieren. Sie werden sich nicht selbstmörderisch in den sicheren Tod stürzen, und sie sind keine hirnlosen Handlanger, die man in dumme Gefahren schicken kann.",
    advantages: [
      {
        id: 94,
        level: 1,
        name: "Diener 1",
        description: "Enttäuschender Gehilfe: Ein Kind, ein krimineller Abschaum oder ein gruseliger Nerd hängt an deinen Fersen und „hilft“ dir, wenn du es anweist. Erstelle ihn als schwachen Sterblichen.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 95,
        level: 2,
        name: "Diener 2",
        description: "Ein Diener, ein Familienangehöriger, ein Liebhaber oder ein „Kumpel“, der dir vielleicht aus dem Wunsch heraus hilft, sich dem Übernatürlichen zu widersetzen: Gib ihm eine Hintergrundgeschichte. Mach ihn zu einem ganz normalen Sterblichen.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 96,
        level: 3,
        name: "Diener 3",
        description: "Ein Retainer, der so gut ist, dass er selbstständig handeln und kleinere Probleme lösen kann. Er ist mindestens ein begabter Sterblicher und hat vielleicht sogar Fähigkeiten, von denen du nichts weißt.",
        actions: [],
        isRepeatable: false
      }
    ],
    disadvantages: [
      {
        id: 97,
        level: 1,
        name: "Stalker",
        description: "Du ziehst oft Leute an, die ein bisschen zu vernarrt in dich sind, was nicht unbedingt gut für dich ist. Ein Stalker hat ungesunde Gefühle für dich und will eine ernsthaftere Beziehung, egal ob du das willst oder nicht. Diese Leute können eifersüchtig, liebestoll, verzweifelt, opportunistisch oder eine Mischung aus all dem sein. Wenn du einen loswirst, taucht bald der nächste auf.",
        actions: [],
        isRepeatable: false
      }
    ]
  },
  {
    id: 19,
    type: "backgrounds",
    name: "Status",
    specialRules: TraitSpecialRules.None,
    description: "",
    advantages: [
      {
        id: 98,
        level: 1,
        name: "Bekannt",
        description: "Ein anerkannter Jäger, der willkommen ist und als aufstrebender Star angesehen wird.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 99,
        level: 2,
        name: "Respektiert",
        description: "Du hast jetzt Verantwortung, und die Neulinge schauen zu dir auf.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 100,
        level: 3,
        name: "Einflussreich",
        description: "Du hast die Verantwortung für einen Teil deiner Fraktion.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 101,
        level: 4,
        name: "Machtvoll",
        description: "Du hast einen angesehenen Titel in deiner angegebenen Fraktion.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 102,
        level: 5,
        name: "Koryphäe",
        description: "Du sitzt mit am Tisch der Macht in der Gruppe, ein Vorbild für deine Überzeugung oder Fraktion.",
        actions: [],
        isRepeatable: false
      }
    ],
    disadvantages: [
      {
        id: 103,
        level: 2,
        name: "Gemieden",
        description: "Aus irgendeinem Grund bist du bei einer bestimmten Gruppe total unbeliebt. Du hast sie verraten, dich mit einem lokalen Anführer angelegt oder sogar mal mit ihnen geschossen. Die Leute aus dieser Gruppe werden alles tun, um dir das Leben schwer zu machen, wenn sie die Chance dazu kriegen.",
        actions: [],
        isRepeatable: false
      },
      {
        id: 104,
        level: 2,
        name: "Verdächtigter",
        description: "Du kommst mit dieser Gruppe überhaupt nicht klar. Du hast dich aus einer Vereinbarung herausgewunden, eine Grenze überschritten oder was Ähnliches gemacht. Du kannst versuchen, dich unauffällig zu verhalten, aber wenn du nicht irgendwie Freunde findest, bekommst du einen Malus von zwei Würfeln auf alle Sozialtests, die mit der beleidigten Gruppe zu tun haben.",
        actions: [],
        isRepeatable: false
      }
    ]
  }
];

export const edges: IH5Edge[] = [
  {
    id: 1,
    category: H5EdgeCategory.Asset,
    name: "Arsenal",
    description: "Der Jäger hat Zugang zu – oder kann sich notdürftig zusammenbasteln – eine große Bandbreite an Waffen, die der Öffentlichkeit normalerweise nicht zur Verfügung stehen. Dazu zählen sowohl Schusswaffen als auch Nahkampfwaffen, jedoch keine Bomben, Minen oder sonstige Munition. Ob von einem alten Kontakt geliehen oder in der Garage zusammengeschraubt: Die Waffen sind ansonsten profan und nur für eine begrenzte Zeit verfügbar. Danach müssen sie entweder an die Quelle zurückgegeben werden, benötigen umfangreiche Wartung oder gehen schlicht kaputt, weil sie improvisiert wurden (je nachdem, was zur Szene passt).",
    pool: "Jäger, die ihr eigenes Arsenal behalten und warten, würfeln Intelligenz + Handwerk. Wer sich auf Kontakte verlässt, würfelt stattdessen Manipulation + Szenekenntnis.",
    system: "Bei einem gewonnenen Test mit Schwierigkeit 4 kann der Jäger eine einzelne persönliche Schuss- oder Nahkampfwaffe bereitstellen, etwa ein Scharfschützengewehr, eine Handfeuerwaffe oder eine hochwertige Kampfklinge. Der Test erfolgt zu Beginn einer Szene, und der Jäger muss vernünftigen Zugang zu seinem Vorratslager oder Kontakt haben. (Kein Erfolg, so kritisch er auch sein mag, zaubert mitten in der Sahara eine Waffe her.) Der Test kann pro Szene nur einmal versucht werden, und die Waffe kann nur in dieser Szene verwendet werden. In späteren Szenen können durch erneute Tests die gleiche oder eine ähnliche Waffe bereitgestellt werden.",
    perks: [
      {
        id: 1,
        name: "Teamausstattung",
        description: "Der Jäger kann zusätzliche Exemplare derselben Waffe bis zur Höhe der Erfolge im Gewinn bereitstellen. Alle bereitgestellten Waffen haben dieselben Perks (falls vorhanden) und unterliegen derselben begrenzten Dauer."
      },
      {
        id: 2,
        name: "Spezielle Merkmale",
        description: "Die bereitgestellte Waffe verfügt über eine Anzahl spezieller Merkmale bis zur Höhe der Erfolge im Gewinn. Merkmale können von Wärmebildvisieren bis zu getarnten Koffern reichen; die Erzählerin hat das letzte Wort, was als Merkmal gilt. Spezielle Merkmale können aus den Ausrüstungsauflistungen (siehe S. 101) entlehnt werden; Spieler*innen sollten aber auch kreative, einzigartige Lösungen vorschlagen dürfen, basierend auf dem, was sie über die Beute ihrer Zelle in einer bestimmten Jagd gelernt haben."
      },
      {
        id: 3,
        name: "Exoten",
        description: "Seltene oder einzigartige Waffen und Munition können beschafft werden – von Silberkugeln bis zu vorsintflutlichen Obsidian-Dolchen. Die Schwierigkeit des Tests steigt bei wirklich seltenen oder einzigartigen Waffen, wie von der Erzählerin bestimmt. Die Waffen sind nicht von Natur aus übernatürlich, können aber besondere Verwundbarkeiten der Beute ausnutzen (wie eben Silberkugeln)."
      },
      {
        id: 4,
        name: "Unverfolgbar",
        description: "Die beschafften Waffen sind vollständig unverfolgbar und führen für sich genommen niemals die Behörden oder die Beute zu den Jägern."
      }
    ]
  },
  {
    id: 2,
    name: "Fuhrpark",
    category: H5EdgeCategory.Asset,
    description: "Ob aus der eigenen Garage heraus oder über loyale, verlässliche Kontakte – der Jäger kann kurzfristig eine große Bandbreite an privaten oder gewerblichen Fahrzeugen bereitstellen. Das kann vom klapprigen Volvo 242 der 70er bis zum Sikorsky-Helikopter reichen, jedoch keine Militärfahrzeuge wie Panzer oder Kampfjets.",
    pool: "Jäger, die ihren eigenen Fuhrpark warten, würfeln Intelligenz + Technologie. Wer sich auf Kontakte verlässt, würfelt stattdessen Manipulation + Überzeugen.",
    system: "Bei einem gewonnenen Test mit Schwierigkeit 4 kann der Jäger ein einzelnes Fahrzeug bereitstellen, das öffentlich oder gewerblich genutzt wird, einschließlich Boote und Flugzeuge. (Die Erzählerin hat hier das letzte Wort; wirklich abwegige Wünsche sollten mindestens eine erhöhte Schwierigkeit erhalten.) Der Test erfolgt zu Beginn einer Szene, und der Jäger muss vernünftigen Zugang zu seiner Garage oder seinem Kontakt haben. Pro Szene ist nur ein Versuch möglich, und das Fahrzeug kann nur in dieser Szene genutzt werden. In späteren Szenen können durch erneute Tests die gleichen oder ähnliche Fahrzeuge bereitgestellt werden. Beachte: Die Gabe verleiht nicht automatisch die Fähigkeit, die Fahrzeuge zu steuern; welche Fertigkeiten und Spezialisierungen nötig sind, entscheidet die Erzählerin.",
    perks: [
      {
        id: 5,
        name: "Panzerung",
        description: "Die bereitgestellten Fahrzeuge können so gepanzert sein, dass sie kleinkalibrigem Beschuss standhalten – effektiv immun gegen alles unterhalb von Minen oder RPGs. Fluggeräte profitieren weniger von Panzerung, bieten Passagieren jedoch zusätzlichen Schutz und geben zwei Würfel auf ihre Verteidigungspools gegen Fernkampfangriffe."
      },
      {
        id: 6,
        name: "Leistung",
        description: "Fahrzeuge mit diesem Perk haben überlegene Fahr- und Handlingeigenschaften und gewähren einen Bonus in Höhe des Gewinns der Gabenprobe auf Verfolgungs-Proben mit Fahren. Dieser Bonus beträgt maximal drei Würfel."
      },
      {
        id: 7,
        name: "Überwachung",
        description: "Das Fahrzeug verfügt über ein breites Spektrum versteckter Überwachungsgeräte, darunter Richtmikrofone, Funkscanner und Wärmebildvisiere. Die Ausrüstung gewährt einen Würfelbonus in Höhe des Gewinns der Gabenprobe für alle, die aus dem Wagen heraus observieren (z. B. bei Wahrnehmung oder Technologie). Dieser Bonus beträgt maximal drei Würfel."
      },
      {
        id: 8,
        name: "Unverfolgbar",
        description: "Die beschafften Fahrzeuge sind vollständig unverfolgbar und führen für sich genommen niemals die Behörden oder die Beute zu den Jägern."
      }
    ]
  },
  {
    id: 3,
    name: "Sprengmittel",
    category: H5EdgeCategory.Asset,
    description: "Der Jäger kann verschiedene Arten zeit- oder ferngesteuerter Sprengsätze herstellen oder anderweitig beschaffen – zum Beispiel Panzerabwehrminen, C4 oder Abrissladungen. Diese Werkzeuge werden entweder vom Jäger selbst gebaut oder sind über Verbindungen verfügbar, etwa alte Kollegen oder eine Waffenhändlerin mit lebenslanger Schuld.",
    pool: "Jäger, die ihre Sprengmittel selbst bauen, würfeln Fassung + Naturwissenschaften. Wer sich auf Kontakte verlässt, würfelt stattdessen Fassung + Szenekenntnis.",
    system: "Bei einem gewonnenen Test mit Schwierigkeit 4 kann der Jäger eine einzelne Mine oder einen Sprengsatz bereitstellen. Der Test erfolgt zu Beginn einer Szene, und der Jäger muss vernünftigen Zugang zu seinem Vorratslager oder Kontakt haben. Pro Szene ist nur ein Versuch möglich; die Ladung kann nur in dieser Szene verwendet werden.",
    perks: [
      {
        id: 9,
        name: "Mehrere Ladungen",
        description: "Der Jäger kann zusätzliche Exemplare desselben Sprengmittels bis zur Höhe der Erfolge im Gewinn bereitstellen. Alle Geräte haben dieselben Perks (falls vorhanden) und dieselbe begrenzte Dauer."
      },
      {
        id: 10,
        name: "Nichttödliche Munition",
        description: "Dieser Perk stellt verschiedene Arten nichttödlicher Mittel bereit – von Blendgranaten über Tränengas bis hin zu sogenanntem „Knockout-Gas“ (das in einer realistischeren Chronik dennoch lebensgefährlich sein kann). Die Erzählerin bestimmt die genauen Auswirkungen auf Zivilist*innen sowie auf Beute und deren Diener. Als Faustregel gelten Würfelabzüge auf alle Proben der Betroffenen in Höhe des Gewinns der Gabenprobe (maximal drei Würfel)."
      },
      {
        id: 11,
        name: "Exoten",
        description: "Seltene oder maßgeschneiderte Substanzen können beschafft und als Waffen eingesetzt werden – etwa Bomben, die geweihte Wassernebel freisetzen, oder Minen mit Sandelholzsplittern. Die Schwierigkeit steigt bei wirklich seltenen oder einzigartigen Substanzen, wie von der Erzählerin bestimmt. Die Geräte sind nicht von Natur aus übernatürlich, können aber besondere Schwächen der Beute ausnutzen."
      },
      {
        id: 12,
        name: "Getarnte Lieferung",
        description: "Die beschafften Geräte sind als Alltagsgegenstände passender Größe getarnt – von Feuerzeugen bis zu mobilen Klimageräten. Die Schwierigkeit, sie zu entdecken, steigt um den Gewinn der Gabenprobe (maximal drei Würfel)."
      }
    ]
  },
  {
    id: 4,
    name: "Bibliothek",
    category: H5EdgeCategory.Asset,
    description: "Ob als staubige Bibliothek mit jahrhundertealten Texten oder als gut verschlüsselte Datenbank mit der neuesten Forschung zu paranormalen Wesen – der Jäger hat Zugang zu einem großen Fundus an Informationen. Mit genügend Zeit kann er daraus wichtige Hinweise zu Verhalten, Stärken und Schwächen seiner Beute gewinnen.",
    pool: "Entschlossenheit + Geisteswissenschaft",
    system: "Verbringt ein Jäger etwa einen Tag mit Nachforschungen über seine Beute, kann er eine Gabenprobe ablegen. Ein Gewinn liefert einen Hinweis auf die Natur oder das Verhalten der Kreaturenart – oder sogar dieser spezifischen Beute. Die Erzählerin entscheidet über Art und Genauigkeit des Hinweises; das Ergebnis sollte mit dem Gewinn skalieren: Mehr Gewinn bedeutet mehr bzw. genauere Informationen. Pro Szene ist höchstens ein Versuch möglich; nach einem Erfolg kann die Gabe bis zur nächsten Sitzung nicht erneut genutzt werden.",
    perks: [
      {
        id: 13,
        name: "Wo sie sich verbergen",
        description: "Zusätzlich zum Hinweis gewährt die Information einen Bonus in Höhe des Gewinns auf jeden Versuch, den Unterschlupf der Beute zu lokalisieren. Dieser Bonus verfällt nach der Nutzung und beträgt maximal drei Würfel."
      },
      {
        id: 14,
        name: "Wer sie sind",
        description: "Zusätzlich zum Hinweis gewährt die Information einen Bonus in Höhe des Gewinns auf jeden Versuch, die Beute zu identifizieren (falls sie als „normal“ durchgehen kann, etwa als Mensch oder Tier). Dieser Bonus verfällt nach der Nutzung und beträgt maximal drei Würfel."
      },
      {
        id: 15,
        name: "Wie man sie aufhält",
        description: "Zusätzlich zum Hinweis gewährt die Information einen Bonus in Höhe des Gewinns auf jeden Versuch, ein Gebiet oder eine Person zu schützen, zu bannen oder zu verbergen – vor der Beute. Gilt nicht für direkte Angriffe. Der Bonus verfällt nach der Nutzung und beträgt maximal drei Würfel."
      },
      {
        id: 16,
        name: "Wie man sie verletzt",
        description: "Zusätzlich zum Hinweis gewährt die Information einen Bonus in Höhe des Gewinns auf jeden Versuch, die Beute durch Ausnutzen einer übernatürlichen Anfälligkeit zu schädigen. Der Bonus verfällt nach der Nutzung und beträgt maximal drei Würfel."
      }
    ]
  },
  {
    id: 5,
    name: "Improvisierte Ausrüstung",
    category: H5EdgeCategory.Aptitude,
    description: "Durch Nutzung von Objekten und Materialien in unmittelbarer Nähe ist der Jäger in der Lage, eine Vielzahl nützlicher – wenn auch kurzlebiger – Werkzeuge für sich oder seine Kamerad*innen zu basteln. Möglich ist alles von einem 1,20 m langen Periskop bis zum Umleiten eines Kamera-Feeds auf einen entfernten Bluetooth-Sender, solange das Werkzeug plausibel aus verfügbaren Gegenständen zusammengesetzt werden kann.",
    pool: "Intelligenz + Handwerk, Technologie oder Naturwissenschaften – je nach gewünschtem Werkzeug bzw. Stoff.",
    system: "Bei einer gewonnenen Gabenprobe mit Schwierigkeit 4 kann der Jäger aus gewöhnlichen Dingen kurzfristig hilfreiche Ausrüstung herstellen. Diese Ausrüstung kann bei der Verwendung einer einzelnen Fertigkeit unterstützen und gewährt dabei einen Bonus von zwei Würfeln. (Die Erzählerin hat das letzte Wort, welche Fertigkeiten auf diese Weise unterstützt werden können und unter welchen Umständen.) Außerdem kann sie Handlungen ermöglichen, die sonst nicht möglich wären – etwa Kameramaterial in eine Cloud laden oder über ein Hindernis hinwegsehen. Die Herstellung dauert je nach Entscheidung der Erzählerin wenige Minuten bis ein paar Stunden und nicht unter akuter Bedrohung wie einem laufenden Feuergefecht. Die Gegenstände funktionieren nur bis zum Ende der Szene, und der Jäger kann pro Szene nur einen Gegenstand herstellen – außer mit entsprechendem Perk.",
    perks: [
      {
        id: 17,
        name: "Genügsam",
        description: "Der Jäger kann die meisten Gegenstände aus den Krimskrams- und Werkzeugen herstellen, die er mitführt – unabhängig davon, wie karg der Ort ist. Dafür braucht er eine Tasche o. ä. mit verschiedenstem Kleinzeug; solange er sie dabeihat, kann er die Gabe überall einsetzen."
      },
      {
        id: 18,
        name: "Massenproduktion",
        description: "Der Jäger kann zusätzliche Exemplare in Anzahl des Gewinns herstellen. Die Gegenstände sind identisch, unterstützen dieselbe Fertigkeit, und alle übrigen Beschränkungen und Perks gelten."
      },
      {
        id: 19,
        name: "Spezialisierung",
        description: "Der Jäger kann sich auf die Unterstützung einer bestimmten Fertigkeit spezialisieren und gewährt dann +3 Würfel statt der üblichen +2. Dieser Perk kann mehrfach erlernt werden, aber nur einmal pro Fertigkeit."
      },
      {
        id: 20,
        name: "Schnellbau",
        description: "Normalerweise kann diese Gabe nicht unter starkem Druck (z. B. während eines laufenden Kampfes) eingesetzt werden. Mit diesem Perk kann der Jäger ein Werkzeug in drei Runden minus Gewinn der Probe (mindestens eine Runde) herstellen – ungeachtet äußerer Umstände wie umherfliegender Kugeln."
      }
    ]
  },
  {
    id: 6,
    name: "Globaler Zugriff",
    category: H5EdgeCategory.Aptitude,
    description: "Der Jäger ist in der Lage, normale Barrieren der Systemintrusion zu umgehen und selbst die sichersten digitalen Systeme zu penetrieren. Vielleicht arbeitete er für eine Behörde und hat Hintertüren auswendig gelernt, vielleicht hat er ein Brute-Force-Chipset perfektioniert oder einen Prototyp-Wurm gestartet, der nun latent auf jedem vernetzten Rechner der westlichen Hemisphäre liegt. Wie auch immer: Der Jäger vollbringt digitale Raubzüge weit jenseits normalen „Hackings“.",
    pool: "Intelligenz + Technologie",
    system: "Indem er etwa eine Szene (ein paar Minuten bis einen Tag, nach Ermessen der Erzählerin) aufwendet und eine Gabenprobe mit Schwierigkeit 4 besteht, kann der Jäger Zugriff auf beliebige Daten zu beliebigen Themen oder Personen in denkbaren Systemen erlangen – von Überwachung über Strafverfolgung bis zu vergrabenen Transaktionsdatensätzen. Ohne Perks erlaubt diese Fähigkeit jedoch keine Manipulation der Daten; bei nicht vernetzten Systemen braucht der Jäger physischen Zugang zum lokalen Netzwerk.",
    perks: [
      {
        id: 21,
        name: "Big Brother beobachten",
        description: "Der Jäger kann digitale Überwachungsaufnahmen nicht nur einsehen, sondern auch manipulieren – Personen heraus- oder hineineditieren."
      },
      {
        id: 22,
        name: "All-Access-Pass",
        description: "Der Jäger kann elektronische Schlösser umgehen und Alarmanlagen sowie andere Sicherheitsmaßnahmen deaktivieren oder manipulieren. Die Schwierigkeit legt die Erzählerin fest und sie hängt von der Raffinesse der Sicherheit ab (meist 3–5)."
      },
      {
        id: 23,
        name: "Geldhahn",
        description: "Der Jäger kann Finanzdaten manipulieren und Geld bewegen – ideal, um der Beute Vermögenswerte zu entziehen oder Behördenverdacht zu wecken, was zu Ermittlungen führt. (Letzteres ist auch das typische Ergebnis, wenn Jäger versuchen, sich zu bereichern …) Die Erzählerin hat hier das letzte Wort, und jeder Versuch der Selbstbereicherung sollte mindestens ein erhöhtes Gefahr-Niveau riskieren. Offensiv genutzt, senkt dies den Hintergrund „Ressourcen“ des Ziels um eins pro Erfolg im Gewinn – für einen Monat."
      },
      {
        id: 24,
        name: "Wortlaut des Gesetzes",
        description: "Der Jäger kann Strafregister national wie international manipulieren. Feinde können zu gesuchten Verbrechern werden, und eigene Fehler verschwinden „zufällig“ aus Datenbanken. Schwierigkeit reicht von 3 (lokale Vergehen) bis 5+ (weltweite Straftaten), egal ob Einträge platziert oder gelöscht werden."
      }
    ]
  },
  {
    id: 7,
    name: "Drohnenpilot",
    category: H5EdgeCategory.Aptitude,
    description: "Der Jäger ist nicht nur Expert*in in Steuerung und Wartung ferngesteuerter mobiler Überwachungs- und Sicherheitsgeräte, sondern besitzt auch eine Drohne, die die Leistung der meisten kommerziellen Modelle übertrifft – und die Ressourcen, sie nach Schäden zu reparieren. Die Art variiert von ultraschnellen Flugaufklärern über robuste Vierbeiner, die sich im Kampf behaupten, bis zu Schwärmen aus Mikrodrohnen, fast unsichtbar fürs bloße Auge.",
    pool: "Geistesschärfe + Technologie zum Steuern, Intelligenz + Handwerk zum Reparieren oder Wiederaufbauen.",
    system: "Bei Erwerb ist die Drohne mit zwei Fertigkeiten ausgerüstet. Ein robuster Läufer besitzt etwa Sportlichkeit und Handgemenge, ein verdeckter Aufklärer Heimlichkeit und Wahrnehmung. (Die Erzählerin hat das letzte Wort; z. B. braucht es viel Kreativität, um „Etikette“ auf einer Drohne zu rechtfertigen.) Der Drohnentyp wird beim Erwerb festgelegt; weitere Varianten sind über Perks möglich. Die Drohne wird über ein Handgerät oder verkabelten Computer gesteuert. Wenn der/die Controller*in die Fertigkeit der Drohne würfelt, nutzt er/sie stattdessen Geistesschärfe + Technologie. Muss die Drohne eine Fertigkeit testen, die sie nicht besitzt, wird mit einem Würfel gewürfelt. Die Drohne hat de facto unbegrenzte Reichweite und bleibt einen Tag plus eine Anzahl Tage in Höhe des Gewinns einer Intelligenz + Naturwissenschaften-Probe (Schwierigkeit 2) aktiv. Drohnen haben fünf Gesundheitsstufen. Flugdrohnen behandeln sämtlichen Schaden als Schwere Wunden (Aggravated), bodengebundene als Oberflächlich – bis der Schaden „überläuft“ wie üblich. Indem der Jäger etwa eine Szene aufwendet, kann er mit Intelligenz + Handwerk (Schwierigkeit 3) eine beschädigte oder zerstörte Drohne um eine Anzahl Gesundheitsstufen in Höhe des Gewinns reparieren. Eine zerstörte Drohne muss vollständig wiederhergestellt werden und ist dann wieder dasselbe Modell.",
    perks: [
      {
        id: 25,
        name: "Autonom",
        description: "Der Jäger kann der Drohne einfache Verhaltensweisen einprogrammieren – etwa Patrouillen-/Angriffsmuster oder einen Verfolgungsalgorithmus, der unbemerktes Beschatten erlaubt. Komplexere Entscheidungsbäume benötigen eine erfolgreiche Entschlossenheit + Technologie-Probe mit angemessener Schwierigkeit. In diesem Modus werden Fertigkeiten mit einem festen Pool von fünf Würfeln statt Geistesschärfe + Technologie gewürfelt."
      },
      {
        id: 26,
        name: "Varianten",
        description: "Jede Kopie dieses Perks erlaubt eine zusätzliche Drohnenvariante (mit zwei Fertigkeiten, die zwischen den Varianten variieren können). Es kann immer nur eine aktive Drohne gleichzeitig betrieben werden, außer mit dem Perk „Autonom“, der zusätzliche Drohnen im Automodus erlaubt. Dieser Perk ist mehrfach erlernbar."
      },
      {
        id: 27,
        name: "Spezialfertigkeit",
        description: "Die Drohne kann eine zusätzliche Fertigkeit nutzen. Mit Zustimmung der Erzählerin können auch Werkzeuge dazugehören, die Tragen oder Umgebungsmanipulation erlauben. Beispiele reichen von Diebeshandwerk (Satz elektronischer Picks) bis Naturwissenschaften (automatisiertes Bordlabor). Dieser Perk gilt nur für ein einzelnes Drohnenmodell, ist aber mehrfach erlernbar."
      },
      {
        id: 28,
        name: "Bewaffnung",
        description: "Eine Drohnenvariante kann mit der Entsprechung einer Maschinenpistole oder eines Tasers bewaffnet werden und nutzt dafür einen festen Fünf-Würfel-Pool. Mit dem Perk „Spezialfertigkeit“ kann der/die Controller*in bei direkter Steuerung stattdessen Geistesschärfe + Technologie verwenden."
      },
      {
        id: 29,
        name: "Nutzlast",
        description: "Die Drohne kann ein Vielfaches dessen tragen, was ihre Größe vermuten lässt. Größere Lasten als die Drohne selbst verlangsamen sie und machen sie auffälliger; Beobachter*innen erhalten +2 Würfel auf Versuche, ihre Präsenz oder Bewegung zu entdecken. Der Perk „Nutzlast“ überwältigt keine sich wehrende „Ladung“. Die tatsächliche Drohnengröße sollte vorab zwischen Erzählerin und Spieler*in abgestimmt sein."
      }
    ]
  },
  {
    id: 8,
    name: "Bestienflüsterer",
    category: H5EdgeCategory.Aptitude,
    description: "Der Jäger hat ein Händchen für Tiere, um das ihn Tierärzt*innen und Trainer beneiden. Er kann bestimmte Tierarten verstehen, mit ihnen „sprechen“ und Loyalität wecken – als verlässliche Begleiter, vielleicht sogar Freunde. Hunde sind verbreitet, manche Jäger arbeiten mit Vögeln oder sogar selten domestizierten Tieren wie Menschenaffen – je nach Verfügbarkeit.",
    pool: "Charisma + Tierkunde für Befehle, Fassung + Tierkunde fürs Training.",
    system: "Beim Erwerb dieser Gabe muss der Jäger eine Tierart wählen und welche wichtigsten Aktionspools sie besitzt. (Die Erzählerin hat das letzte Wort; Beispiele siehe S. 272.) Das Tier gilt als absolut loyal und begleitet den Jäger praktisch überallhin, wenn gewünscht. Es befolgt einfache Befehle wie „Bleib“, „Angriff“ oder „Versteck dich“. Befehle, die es oder den Jäger in Gefahr bringen, erfordern eine gewonnene Charisma + Tierkunde-Probe (Schwierigkeit 4). Der Jäger gilt als im Besitz mehrerer ähnlich weit ausgebildeter Tiere; stirbt eines, kann er durch Aufwenden etwa einer Szene (und etwas Downtime) und einer gewonnenen Fassung + Tierkunde-Probe (Schwierigkeit 4) rasch ein neues nachziehen.",
    perks: [
      {
        id: 30,
        name: "Unbestechlich",
        description: "Durch Konditionierung, Medikamente oder unbeirrbare Loyalität ist das Tier immun gegen übernatürliche Kräfte, die es sonst vom/zur Herr*in abbringen würden."
      },
      {
        id: 31,
        name: "Menagerie",
        description: "Der Jäger kann eine weitere Tierart wählen und seinem verfügbaren Pool hinzufügen. Mehr als ein Tier gleichzeitig ins Feld zu führen, erregt jedoch zunehmend Aufmerksamkeit; die meisten Jäger nehmen daher selten mehr als eines mit."
      },
      {
        id: 32,
        name: "Komplexe Befehle",
        description: "Das Tier versteht und führt komplexere Befehle aus – z. B. gezieltes Bringen bestimmter Gegenstände, Wache halten nach bestimmten Personen oder dem/der Herr*in Bericht erstatten. Manche können sogar bis wenige Ziffern zählen. Charisma + Tierkunde dient zum Erteilen komplexer Befehle (Schwierigkeit nach Komplexität), Intelligenz + Tierkunde zum Verstehen des Tieres."
      },
      {
        id: 33,
        name: "Inkognito",
        description: "Das Tier kann meisterhaft unauffällig bleiben – knapp außerhalb der Sicht oder perfekt eingeblendet; wer nicht gezielt sucht, bemerkt es nicht. Die Erzählerin entscheidet, welche Tiere dies plausibel einsetzen können – ein Pferd bleibt z. B. im Büro wohl kaum unbemerkt."
      }
    ]
  },
  {
    id: 9,
    name: "Das Unnatürliche erspüren",
    category: H5EdgeCategory.Endowment,
    description: "Indem er einen Fokusgegenstand hält, kann der Jäger die Anwesenheit übernatürlicher Wesen in unmittelbarer Nähe spüren – etwa im selben Raum. Jede*r Jäger erlebt das anders: vom Schwefelgeruch bis zur positiven Anzeige auf dem Double-V-Meter. Die Fähigkeit zeigt nicht, wer oder was das Wesen ist, nur dass es nahe ist; mit aufeinanderfolgenden Messungen lässt sich die Quelle eingrenzen, dabei erregt der Jäger aber wahrscheinlich Aufmerksamkeit.",
    pool: "Geistesschärfe + Okkultismus oder Naturwissenschaften – je nach Art der Gabe.",
    system: "Der Jäger muss eine Gabenprobe gewinnen; die Schwierigkeit liegt je nach Art und Macht des Wesens bei 3–5. Die Nutzung ist willentlich und offensichtlich (siehe Perk „Freihändig“) und erfordert das Halten (und ggf. Ablesen) des Fokusgegenstands. Mehrfaches Einsetzen in derselben Szene erfordert für jeden weiteren Versuch den Einsatz eines Willenskraftpunkts.",
    perks: [
      {
        id: 34,
        name: "Kreaturenspezialisierung",
        description: "Der Jäger erhält +2 Würfel, um eine spezifische Kreaturenart zu erspüren – etwa einen Vampir oder einen Chupacabra. Dieser Perk ist mehrfach erlernbar, aber nur einmal pro Kreaturentyp."
      },
      {
        id: 35,
        name: "Reichweite",
        description: "Die Reichweite der Fähigkeit erstreckt sich auf etwa die Größe eines Häuserblocks. Der Jäger erkennt, ob die Kreatur im selben Raum oder darüber hinaus ist, jedoch nicht genauer."
      },
      {
        id: 36,
        name: "Präzision",
        description: "Der Jäger kann exakt bestimmen, wer von den Anwesenden im Raum ein übernatürliches Wesen ist. Der genaue Typ lässt sich nur bestimmen, wenn gleichzeitig eine passende Kreaturenspezialisierung vorliegt."
      },
      {
        id: 37,
        name: "Freihändig",
        description: "Der Jäger benötigt keinen Fokusgegenstand mehr, um die Gabe zu nutzen. Entweder kanalisiert er seine übernatürliche Sensibilität nun ohne Hilfsmittel, oder er hat die Technologie auf Ohrstöpselgröße miniaturisiert."
      }
    ]
  },
  {
    id: 10,
    name: "Das Unnatürliche bannen",
    category: H5EdgeCategory.Endowment,
    description: "Der Jäger kann mittels seines Fokusgegenstands übernatürliche Wesen abschrecken und in Furcht versetzen. Indem er den Fokus hervorhebt oder anderweitig aktiviert, kann er Wesen vertreiben, die ihm eigentlich weit überlegen wären – allein durch die Kraft von Glauben oder Wissenschaft.",
    pool: "Entschlossenheit + Okkultismus oder Naturwissenschaften – je nach Art der Gabe.",
    system: "Der Jäger muss seinen Fokusgegenstand erheben und eine Gabenprobe gegen eine von der Erzählerin festgelegte Schwierigkeit bestehen (Standard ist die Hälfte aus Fassung + Entschlossenheit der Kreatur oder einfach deren Standard-Schwierigkeit). Das Wesen kann dann so lange in Schach gehalten werden, wie der Jäger stationär bleibt und den Fokus führt. Während es gebannt ist, kann das Wesen sich dem Jäger nicht nähern oder ihn im Handgemenge/Nahkampf angreifen; es kann sich aber verteidigen und andere Kräfte einsetzen. Bewegt sich der Jäger, muss er pro Runde Bewegung eine weitere Gabenprobe mit demselben Pool und derselben Schwierigkeit bestehen. Misslingt einer dieser Tests, endet der Bann, und die Gabe kann gegen dieselbe Kreatur in dieser Szene nicht erneut eingesetzt werden.",
    perks: [
      {
        id: 38,
        name: "Schutzkreis",
        description: "Der Jäger kann den Schutzbereich auf etwa zwei Meter um sich herum ausweiten, plus einen weiteren Meter pro Erfolg im Gewinn. Betroffene Kreaturen können sich niemandem in diesem Bereich nähern oder diese im Handgemenge/Nahkampf angreifen."
      },
      {
        id: 39,
        name: "Schaden",
        description: "Während die Gabe aktiv ist, kann der Jäger seinen Fokusgegenstand als Nahkampfwaffe mit +0 Schaden führen und dabei dem gebannten Wesen Schwere Wunden (Aggravated) zufügen. Bei Einsatz als Waffe muss der Jäger sofort die Gabenprobe erneut ablegen, sonst endet der Schutz."
      },
      {
        id: 40,
        name: "Kreaturenspezialisierung",
        description: "Der Jäger erhält +2 Würfel, um eine spezifische Kreaturenart zu bannen – etwa einen Werwolf oder einen Gremmlin. Dieser Perk ist mehrfach erlernbar, aber nur einmal pro Kreaturentyp."
      },
      {
        id: 41,
        name: "Freihändig",
        description: "Der Jäger benötigt keinen Fokusgegenstand mehr, um die Gabe zu nutzen. Entweder kanalisiert er seine Sensibilität nun ohne Hilfsmittel oder er hat die Technologie auf Fingernagelgröße miniaturisiert."
      }
    ]
  },
  {
    id: 11,
    name: "Das Unnatürliche vereiteln",
    category: H5EdgeCategory.Endowment,
    description: "Mit dieser Gabe kann der Jäger einer Vielzahl übernatürlicher Fähigkeiten widerstehen und ist damit gegen viele schädliche mentale Effekte hochresistent – wenn nicht gar immun. Solange er sich mit seinem Fokusgegenstand schützt, ist er weitgehend gegen unnatürlichen Einfluss gefeit.",
    pool: "Fassung + Okkultismus oder Naturwissenschaften – je nach Art der Gabe.",
    system: "Solange der Fokusgegenstand gehalten wird, ist der Jäger immun gegen übernatürliche Fähigkeiten, die sonst eine Widerstandsprobe erfordern würden. Bei Fähigkeiten, die automatisch wirken würden, darf der Jäger stattdessen mit einer Gabenprobe widerstehen. In beiden Fällen muss der Jäger einen Willenskraftpunkt ausgeben, um den Vorteil zu erhalten. Dies gilt nur für Effekte, die den Jäger direkt anvisieren – nicht für rein physische Angriffe oder Verstärkungen. Beispiel: Die Gabe schützt vor vampirischer Gedankenkontrolle, nicht aber vor einem rasenden Werwolf, der versucht, den Kopf abzureißen. (Bei Streitfällen entscheidet die Erzählerin.)",
    perks: [
      {
        id: 42,
        name: "Kreaturenspezialisierung",
        description: "Der Jäger erhält +2 Würfel, um den Einfluss eines spezifischen Kreaturentyps zu widerstehen – etwa eines Geists oder einer Hulder. Dieser Perk ist mehrfach erlernbar, aber nur einmal pro Kreaturentyp."
      },
      {
        id: 43,
        name: "Schutzkreis",
        description: "Der Jäger kann den Widerstandsbereich auf etwa zwei Meter um sich herum ausweiten, plus einen Meter pro Erfolg im Gewinn. Alle innerhalb dieses Bereichs erhalten den Nutzen der Gabe; die/der Jäger mit der Gabe führt die Widerstandsproben und gibt die Willenskraft aus."
      },
      {
        id: 44,
        name: "Erkenntnis",
        description: "Bei erfolgreichem Widerstand wird der Jäger sich des Versuchs bewusst und erfährt, was die Kraft bewirkt hätte. Er erhält keine Regelwerte, aber Hinweise zu Funktion und eventuell Grenzen der Fähigkeit (letzteres nach Ermessen der Erzählerin, z. B. bei hohem Gewinn)."
      },
      {
        id: 45,
        name: "Freihändig",
        description: "Der Jäger benötigt keinen Fokusgegenstand mehr, um die Gabe zu nutzen. Entweder kanalisiert er seine Sensibilität nun ohne Hilfsmittel oder er hat die Technologie auf Brillengröße miniaturisiert."
      }
    ]
  },
  {
    id: 12,
    name: "Artefakt",
    category: H5EdgeCategory.Endowment,
    description: "Manche seltene Jäger besitzen ein Werkzeug, das – ob wissenschaftlich, übernatürlich, spirituell oder was auch immer – Eigenschaften hat, die es über ähnliche Gegenstände erheben. Oft stammen sie aus Folklore oder Legenden, werden weitervererbt oder zufällig entdeckt. Mitunter werden sie sogar vom Jäger selbst gebaut – unter Verwendung verbotenen Wissens oder einmaliger Komponenten, die sich nicht replizieren lassen. Ob ein Talwar aus dem 11. Jahrhundert, in Blut eines Heiligen gehärtet, eine Urne mit einer ewig blühenden Orchidee oder ein Gewehr, in dem der Geist des toten Zwillings wohnt: Das Artefakt ist Macht an sich und macht seine/n Träger*in zur ernstzunehmenden Größe.",
    pool: "Intelligenz + Okkultismus oder Naturwissenschaften – je nach Art des Artefakts.",
    system: "Auf Basisebene gewährt die Reliquie der/dem Jäger beim Einsatz einen +1-Würfel-Bonus auf eine einzelne damit verbundene Fertigkeit. Ein gesegneter Krummsäbel gäbe den Bonus auf Nahkampf, eine prismatisch augmentierte Lupe denselben Bonus auf Wahrnehmung. Dieser Bonus gilt nie für Gabenproben des Artefakts selbst. Das Artefakt kann als Fokusgegenstand (siehe vorherige Endowment-Gaben) dienen, sofern es die Anforderungen erfüllt. Geht es verloren oder wird zerstört, kann der Jäger es immer wiedererlangen – allerdings wahrscheinlich nur durch eine prüfungsreiche, geschichtenlange Odyssee.",
    perks: [
      {
        id: 46,
        name: "Ermächtigen",
        description: "Einmal pro Szene kann der Jäger eine Gabenprobe mit Schwierigkeit 4 ablegen, um den Würfelbonus des Artefakts auf +3 zu erhöhen. Misslingt der Test, erleidet der Jäger oberflächlichen Willenskraftschaden in Höhe der negativen Erfolge (der fehlenden Erfolge zum Bestehen)."
      },
      {
        id: 47,
        name: "Anziehung",
        description: "Das Artefakt wird von allerlei übernatürlichen Parteien begehrt. Es kann als Köder dienen und gewährt +2 Würfel auf Hinterhaltsversuche, da die Beute von Begierde geblendet wird. Der Jäger kann es geheim halten, um Aufmerksamkeit zu vermeiden; ist es einmal bekannt, lockt es weiter jene an, die um seinen Aufenthaltsort wissen. Alternativ kann der/die Spieler*in wählen, dass das Artefakt die Aufmerksamkeit der Organisation auf sich zieht, von der es gestohlen/„befreit“ wurde – etwa bei einem High-Tech-Prototyp oder einer mächtigen religiösen Reliquie."
      },
      {
        id: 48,
        name: "Detektion",
        description: "Das Artefakt reagiert auf die Präsenz des Übernatürlichen – ähnlich der Gabe „Das Unnatürliche erspüren“. Der Jäger muss eine Gabenprobe gewinnen; die Schwierigkeit liegt je nach Art und Macht des Wesens bei 3–5. Die Nutzung ist willentlich und erfordert das Halten (und ggf. Ablesen) des Artefakts. Mehrfaches Einsetzen in derselben Szene erfordert für jeden weiteren Versuch den Einsatz eines Willenskraftpunkts."
      },
      {
        id: 49,
        name: "Schild",
        description: "Das Artefakt schützt die/den Jäger vor Schaden durch übernatürliche Kräfte. Solange es sich an seiner/ihrer Person befindet, wird jeglicher physischer Schaden aus übernatürlichen Quellen halbiert (bzw. Oberflächlicher Schaden erneut halbiert)."
      }
    ]
  }
];