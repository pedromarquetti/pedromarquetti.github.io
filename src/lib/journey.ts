import type { Locale } from "../i18n/locales";

export type JourneyKind = "past" | "present" | "goal";

export type InlineNode = string | { text: string; href: string };

// One body entry is one paragraph. Use a string for plain text, or an array of
// inline nodes when the paragraph contains links.
export type JourneyParagraph = string | InlineNode[];

export interface JourneyStep {
  id: string;
  kind: JourneyKind;
  title: Record<Locale, string>;
  body: Record<Locale, JourneyParagraph[]>;
}

const link = (text: string, href: string): InlineNode => ({ text, href });

export const journeySteps: JourneyStep[] = [
  {
    id: "biomedicine",
    kind: "past",
    title: {
      en: "A degree in biomedicine",
      "pt-br": "Graduação em biomedicina",
    },
    body: {
      en: [
        "I studied biomedicine for five years as I am fascinated by how the human body works and develops.",
        "I did research on PAX6, a gene involved in eye development.",
        "The interest is personal: I have a PAX6 mutation myself, which affects my field of view and causes severe myopia.",
      ],
      "pt-br": [
        "Estudei biomedicina por cinco anos, pois sou fascinado por como o corpo humano funciona e se desenvolve.",
        "Fiz pesquisa sobre o PAX6, um gene envolvido no desenvolvimento dos olhos.",
        "O interesse é pessoal: tenho uma mutação nesse gene, que afeta meu campo de visão e causa miopia severa.",
      ],
    },
  },
  {
    id: "first-code",
    kind: "past",
    title: {
      en: "Python, for fun",
      "pt-br": "Python, por diversão",
    },
    body: {
      en: [
        "Mr. Robot was the push. I watched the entire show and was fascinated by what hacking and cyber security looked like.",
        "I started learning Python on my own by watching videos on YouTube and using SoloLearn.",
        [
          "Then I discovered ",
          link("TryHackMe", "https://tryhackme.com/"),
          " and followed the walkthroughs from ",
          link(
            "John Hammond",
            "https://www.youtube.com/channel/UCVeW9qkBjo3zosnqUbG7CFw",
          ),
          " to pick up the basics of security.",
        ],
      ],
      "pt-br": [
        "O Mr. Robot foi o empurrão. Assisti à série inteira e fiquei fascinado por como hacking e segurança cibernética funcionavam.",
        "Comecei a aprender Python por conta própria, assistindo a vídeos no YouTube e usando o SoloLearn (um aplicativo para programação básica).",
        [
          "Depois descobri o ",
          link("TryHackMe", "https://tryhackme.com/"),
          " e acompanhei as walkthroughs do ",
          link(
            "John Hammond",
            "https://www.youtube.com/channel/UCVeW9qkBjo3zosnqUbG7CFw",
          ),
          " para aprender fundamentos de segurança.",
        ],
      ],
    },
  },
  {
    id: "web",
    kind: "past",
    title: {
      en: "JavaScript, React, and TypeScript",
      "pt-br": "JavaScript, React e TypeScript",
    },
    body: {
      en: [
        "I moved from scripts to interfaces, learning JavaScript, React, and TypeScript through SoloLearn and small projects of my own.",
        [
          "I also studied Information Technology at ",
          link(
            "UNIVESP (Universidade Virtual do Estado de São Paulo)",
            "https://univesp.br/",
          ),
          ", where I gained technical knowledge of how software and computers work, which filled the gaps in my self-taught learning.",
        ],
      ],
      "pt-br": [
        "Passei dos scripts para as interfaces, aprendendo JavaScript, React e TypeScript com o SoloLearn e com projetos pequenos meus.",
        [
          "Também estudei Tecnologia da Informação na ",
          link(
            "UNIVESP (Universidade Virtual do Estado de São Paulo)",
            "https://univesp.br/",
          ),
          ", onde ganhei mais conhecimento técnico sobre como programas e computadores funcionam, o que completou as lacunas do meu conhecimento autodidata.",
        ],
      ],
    },
  },
  {
    id: "systems",
    kind: "present",
    title: {
      en: "Rust, Go, PostgreSQL and the terminal",
      "pt-br": "Rust, Go, PostgreSQL e o terminal",
    },
    body: {
      en: [
        "My recent work is more focused on systems, databases, and tooling: a terminal browser and a messaging TUI in Rust, a price-history API in Go, and the automation around them.",
      ],
      "pt-br": [
        "Meus trabalhos recentes são mais focados em sistemas, banco de dados e ferramentas: um navegador de terminal e uma TUI de mensagens em Rust, uma API de histórico de preços em Go e as automações em volta disso.",
      ],
    },
  },
  {
    id: "goal",
    kind: "goal",
    title: {
      en: "Working as a software developer",
      "pt-br": "Trabalhar como desenvolvedor de software",
    },
    body: {
      en: [
        "The goal is to move into software development full time, building backend systems, automation, and terminal tools with the same care I put into these projects.",
        "I strive to always ship good quality code and improve my abilities.",
      ],
      "pt-br": [
        "O objetivo é migrar de vez para o desenvolvimento de software, construindo sistemas back-end, automações e ferramentas de terminal com o mesmo cuidado que coloco nesses projetos.",
        "Sou apaixonado por desenvolver código de qualidade e sempre melhorar minhas habilidades.",
      ],
    },
  },
];
