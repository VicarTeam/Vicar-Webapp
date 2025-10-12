import type {IDiscipline} from "@/types/data";

export const LightOfTheRenegade: IDiscipline = {
  id: -3009,
  name: "Licht des Abtrünnigen",
  summary:
    "Licht des Abtrünnigen ist die Disziplin jener, die sich Kains Willen widersetzt und im Feuer der Rebellion wiedergeboren wurden. Ihr Blut glüht wie flüssige Glut – reinigend und vernichtend zugleich. Es bannt Kains Stimme, zerreißt Manipulationen und trotzt selbst heiligem Feuer. Wo dieses Licht aufflammt, schmelzen Lügen und die Nacht weicht für einen Atemzug zurück.",
  levels: {
    1: [
      {
        id: -300901,
        name: "Blutserenade",
        summary:
          "Du senkst das Tier in dir zu Stille: Angst, Hunger und Raserei verkümmern, während dein Wille wie glühendes Eisen formbar bleibt. Selbst am Rand des Wahns hält dein Herz den Takt.",
        costs: "—",
        system:
          "1× pro Szene kannst du Hunger, Angst und Raserei vollständig ignorieren und dich bei Hunger 5 übermenschlich kontrollieren.",
        alternatives: [],
        duration: "Bis zu 1 Szene (einmalig pro Szene aktivierbar)",
      },
    ],
    2: [
      {
        id: -300902,
        name: "Glut im Herzen",
        summary:
          "Dein Trotz wird zum Schild. Die Blicke der Herrscher prallen ab, und wenn du dich schützend vor andere stellst, brennt dein Blut heller als dein Name.",
        costs: "—",
        system:
          "+2 Würfel auf alle Würfe gegen Dominanz, Präsenz oder geistige Kontrolle. Stellst du dich schützend vor jemanden, erhältst du temporär Blutmacht 5 für die ganze Szene.",
        alternatives: [],
        duration: "Anhaltend; der Blutmacht-Bonus gilt 1 Szene, wenn du beschützt",
      },
    ],
    3: [
      {
        id: -300903,
        name: "Feuer der Wahrheit",
        summary:
          "Du wandelst Vitae in heiliges Brandmal: Deine Schläge sengen wie Sonnenfeuer, und für einen Augenblick flieht die Lüge vor deinem Blick.",
        costs:
          "Pro Sonnenfeuer-Angriff: 1 Hunger. Aura der Wahrheit: 1 Willenskraft (max. 1× pro Session).",
        system:
          "Du kannst Vitae in göttliches Feuer wandeln: 1 Hunger = 1 Angriff mit Sonnenfeuer (schwerer/aggr. Schaden, hellrot leuchtend). Zusätzlich 1× pro Session eine Aura der Wahrheit erschaffen; alle Lügen in deiner Nähe werden sofort bemerkt.",
        alternatives: [],
        duration:
          "Sonnenfeuer: jeweils 1 Angriff. Aura der Wahrheit: 1 Szene (max. 1× pro Session)",
      },
    ],
    4: [
      {
        id: -300904,
        name: "Reinheit der Nacht",
        summary:
          "Dein Licht bricht den Fluch wie Morgengrauen: Für kurze Zeit schlägt ein toter Herzschlag wieder, die Haut wird warm – und die Nacht vergisst ihren Anspruch.",
        costs:
          "Aktivierung: 1 Willenskraft. Nachwirkung: +2 Hunger nach Ende der Wirkung.",
        system:
          "Einmal pro Nacht kannst du einen Vampir für 10 Minuten vollständig menschlich machen (Herzschlag, Wärme, kein Hunger, keine Wallungschecks). Danach erhältst du +2 Hunger.",
        alternatives: [],
        duration: "10 Minuten (einmal pro Nacht)",
      },
    ],
    5: [
      {
        id: -300905,
        name: "Häresie",
        summary:
          "Du erhebst dich als heiliger Ketzer gegen Schicksal und Blut: Sonne, Feuer, Hunger und Herrschaft weichen dir; dein Wort brennt wie Gesetz, und fremde Mächte erlöschen in deinem Licht.",
        costs:
          "Aktivierung: 1 Willenskraft. Nach der Szene: Blutmacht −1 dauerhaft (Opfer des Lichts).",
        system:
          "Für 1 Szene wirst du zum heiligen Ketzer: Immun gegen Sonne, Feuer, Kontrolle und Hunger; du kannst Disziplinen anderer temporär neutralisieren. Deine Worte gelten als Wahrheit – jedem Vampir, der dir widerspricht, steigt sofort der Hunger um +1. Für die gesamte Szene zählst du als Blutmacht 10.",
        alternatives: [],
        duration: "1 Szene",
      },
    ],
  },
};
