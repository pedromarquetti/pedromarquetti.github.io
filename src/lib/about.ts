import type { Locale } from "../i18n/locales";
import { link, type ProseParagraph } from "./prose";

export interface AboutSection {
  id: string;
  title: Record<Locale, string>;
  paragraphs: Record<Locale, ProseParagraph[]>;
}

const tryHackMe = "https://tryhackme.com/";
const johnHammond = "https://www.youtube.com/channel/UCVeW9qkBjo3zosnqUbG7CFw";
const sb = "https://en.wikipedia.org/wiki/Microsoft_Small_Basic";
const soloLearn = "https://www.sololearn.com/";
const univesp = "https://univesp.br/";

/**
 * Long-form copy for the about page, migrated from the previous site's
 * `/about` and `/about/biomedicine` pages.
 */
export const aboutSections: AboutSection[] = [
  {
    id: "biomedicine",
    title: {
      en: "Biomedicine and PAX6",
      "pt-br": "Biomedicina e o PAX6",
    },
    paragraphs: {
      en: [
        "Before software, I studied biomedicine for five years and graduated with a bachelor's degree. I am fascinated by how the human body works in general: how each system is self sufficient but at the same time work togheter to keep it all togheter",
        "I have low vision, and that is part of why I became fascinated by how the human body develops. I did research on the role of PAX6 during eye development.",
        "PAX6 coordinates retina development, mutations in this gene can cause eye deformation or, in my case, retina mutations with high myopia. I have a PAX6 mutation myself, so my field of view is reduced and my focus is not centred the way it is for someone without the mutation.",
      ],
      "pt-br": [
        "Antes do software, passei cinco anos na faculdade e me formei em biomedicina. Sou fascinado por como o corpo humano funciona no geral: como cada sistema é auto suficiente mas ao mesmo tempo trabalham juntos para manter o sistema funcionando.",
        "Tenho baixa visão, e isso faz parte do motivo pelo qual me fascinei por como o corpo humano se desenvolve. Fiz pesquisa sobre o papel do PAX6 durante o desenvolvimento dos olhos.",
        "O PAX6 coordena o desenvolvimento da retina e estruturas similares, portanto, mutações no gene podem causar deformidades na retina, ou, como no meu caso, má formação do nervo ótico e alto grau de miopia. Tenho uma mutação nesse gene, então meu campo de visão é reduzido e meu foco não é centralizado como o de alguém sem a mutação.",
      ],
    },
  },
  {
    id: "tech-phase",
    title: {
      "pt-br": "Fase tecnológica",
      en: "Tech Phase",
    },
    paragraphs: {
      en: [
        "I always loved tech in general: from software and logic to hardware and fixing PCs.",
        [
          "When I was younger I used to learn logic basics with ",
          link("Small Basics", sb),
        ],
        "But only in more recent years I really started coding bigger projects",
      ],
      "pt-br": [
        "Sempre amei tecnologia no geral: desde software e lógica de programação até hardware e conserto de PCs",
        [
          "Quando era mais novo, aprendi muito sobre lógica de programação com ",
          link("Small Basics", sb),
        ],
        "Mas só ultimamente tenho focado em desenvolviemnto de projetos maiores",
      ],
    },
  },
  {
    id: "code",
    title: {
      en: "How I got into code",
      "pt-br": "Como cheguei ao código",
    },
    paragraphs: {
      en: [
        "I got into programming through curiosity: I was watching Mr. Robot and wanted to understand what was happening on screen. That led me to Python, which I learned on my own, for fun.",
        [
          "Then I spent time on ",
          link("TryHackMe", tryHackMe),
          " and followed ",
          link("John Hammond", johnHammond),
          "'s walkthroughs, which taught me the basics of security and how systems are attacked and defended.",
        ],
        [
          "From there I moved to the web: JavaScript, React, and TypeScript, studied through ",
          link("SoloLearn", soloLearn),
          " and a lot of small projects. Later I studied Information Technology at ",
          link("UNIVESP", univesp),
          ", which gave my self-taught practice a formal foundation.",
        ],
        "These days I am more interested in what runs under the interface: Rust, Go, PostgreSQL, Linux, and the automation that keeps everything reproducible.",
      ],
      "pt-br": [
        "Entrei na programação pela curiosidade: estava assistindo Mr. Robot e queria entender o que acontecia na tela. Isso me levou ao Python, que aprendi sozinho, por diversão.",
        [
          "Depois passei um tempo no ",
          link("TryHackMe", tryHackMe),
          " e acompanhei as walkthroughs do ",
          link("John Hammond", johnHammond),
          ", que me ensinaram os fundamentos de segurança e como sistemas são atacados e defendidos.",
        ],
        [
          "Daí passei para a web: JavaScript, React e TypeScript, estudados no ",
          link("SoloLearn", soloLearn),
          " e em muitos projetos pequenos. Mais tarde estudei Tecnologia da Informação na ",
          link("UNIVESP", univesp),
          ", o que deu base formal à minha prática autodidata.",
        ],
        "Hoje me interesso mais pelo que roda por baixo da interface: Rust, Go, PostgreSQL, Linux e as automações que mantêm tudo reproduzível.",
      ],
    },
  },
];
