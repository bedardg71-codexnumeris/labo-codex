// data.jsx — Données fictives partagées par les 3 variations
// Une même rétroaction pour permettre la comparaison visuelle directe.

const FEEDBACK = {
  // Identité élève
  student: {
    firstName: "Léa",
    lastName: "Tremblay",
    da: "9000145",
    group: "00123",
  },
  // Cours + artefact
  course: {
    code: "601-101-MQ",
    name: "Écriture et littérature",
    session: "Hiver 2026",
    teacher: "Grégoire Bédard",
  },
  artefact: {
    number: 6,
    total: 7,
    title: "Rédaction (Pow-pow-wow)",
    submitted: "2026-04-18",
    corrected: "2026-04-23",
    objective: "Démontrer ta capacité à développer une analyse littéraire structurée, argumentée et bien écrite.",
    task: "Rédiger une analyse littéraire à partir de ton plan détaillé.",
    context: "La rédaction est une étape terminale où il faut développer des paragraphes structurés, intégrer des preuves avec fluidité et assurer la progression logique des idées. C'est l'aboutissement de ton travail préparatoire.",
  },
  // Les 8 artefacts du trimestre — on garde les 4 meilleures + 2 obligatoires
  // Codes : remis (avec code IDME), à venir (avec date de remise)
  // flags : "obligatoire" = compté d'office, "best4" = retenu parmi les 4 meilleures (calculé)
  trimestre: [
    { n: 1, label: "Stratégies de lecture",  status: "done",    code: "M", obligatoire: false },
    { n: 2, label: "Carte mentale",           status: "done",    code: "D", obligatoire: false },
    { n: 3, label: "Plan de rédaction",       status: "done",    code: "M", obligatoire: true  },
    { n: 4, label: "Stratégies 2",            status: "done",    code: "M", obligatoire: false },
    { n: 5, label: "Carte mentale 2",         status: "done",    code: "M", obligatoire: false },
    { n: 6, label: "Rédaction (Pow-pow-wow)", status: "current", code: "M", obligatoire: true  },
    { n: 7, label: "Plan final",              status: "todo",    code: null, due: "2026-05-08" },
    { n: 8, label: "Analyse finale",          status: "todo",    code: null, due: "2026-05-22" },
  ],
  // Échelle IDME (associée à SOLO) — couleurs et bornes alignées sur l'application
  scale: [
    { code: "0", label: "Non recevable",   solo: "Préstructurel",     min: 0,  max: 0,   color: "#b8b8b8" }, // gris
    { code: "I", label: "Insuffisant",     solo: "Unistructurel",     min: 0,  max: 64,  color: "#f08c3a" }, // orange
    { code: "D", label: "En développement", solo: "Multistructurel",  min: 65, max: 74,  color: "#f0c83a" }, // jaune
    { code: "M", label: "Maîtrisé",         solo: "Relationnel",      min: 75, max: 84,  color: "#5fb84a" }, // vert
    { code: "E", label: "Étendu",           solo: "Abstrait étendu",  min: 85, max: 100, color: "#27b9e0" }, // cyan
  ],
  // Résultats par critère (5 critères permanents)
  criteria: [
    {
      key: "structure",
      name: "Structure",
      weight: 20,
      sub: "L'organisation logique et cohérente des idées",
      code: "M",
      comment: "Ton hypothèse d'objectif est précise et les mécanismes sont bien reliés à celle-ci. Les transitions entre paragraphes guident clairement la lecture.",
    },
    {
      key: "rigueur",
      name: "Rigueur",
      weight: 20,
      sub: "L'exactitude et l'exhaustivité du travail d'analyse",
      code: "D",
      comment: "Plusieurs procédés littéraires sont identifiés, mais leurs effets restent parfois trop généraux. Pousse l'explication d'un cran de plus.",
    },
    {
      key: "plausibilite",
      name: "Plausibilité",
      weight: 15,
      sub: "La cohérence du raisonnement à partir d'une preuve rigoureuse",
      code: "M",
      comment: "Tes citations sont pertinentes et bien intégrées. Les liens avec ton argumentation sont clairement établis.",
    },
    {
      key: "nuance",
      name: "Nuance",
      weight: 25,
      sub: "La capacité à percevoir et exprimer les subtilités du texte",
      code: "D",
      comment: "Tu dépasses le niveau descriptif par endroits, mais certaines inférences restent près du sens littéral. Ose interpréter davantage.",
    },
    {
      key: "francais",
      name: "Français écrit",
      weight: 20,
      sub: "La maîtrise de la langue et la qualité de l'expression",
      code: "D",
      comment: "Plusieurs erreurs d'accord et de syntaxe parsèment ton texte. Une relecture ciblée des GV et GN serait payante.",
    },
  ],
  // Code global (lettre unique hors tableau, en bas de la rétroaction générale)
  overall: "D",
  overallNote: "Tu as franchi un palier important sur la structure et l'usage des citations. Le prochain saut se jouera sur la profondeur d'interprétation et la relecture de la langue.",

  // Tampons apposés sur la copie, groupés par famille
  // Familles : Action / Observations / Compréhension
  stamps: {
    Action: [
      { n: 1, stamp: "Repérage", comment: "Tu reprends ici l'hypothèse de départ — bonne décision, ça ancre le paragraphe." },
      { n: 4, stamp: "Liaison",  comment: "La transition entre Jean-Louis et la Sirène est efficace : tu fais dialoguer les deux figures." },
      { n: 9, stamp: "Ouverture", comment: "Belle amorce de paragraphe : tu poses clairement l'angle d'analyse." },
    ],
    Observations: [
      { n: 2,  stamp: "Mécanisme",  comment: "Belle identification du mécanisme de contraste village / Sirène." },
      { n: 5,  stamp: "Procédé",    comment: "Tu nommes le procédé et son effet — continue dans cette direction pour tes autres paragraphes." },
      { n: 7,  stamp: "Approfondir", comment: "La citation sur le pied gauche mérite une seconde phrase d'interprétation." },
      { n: 10, stamp: "Confusion",  comment: "Ici la figure de la Sirène et celle du village sont mélangées. Reprends la distinction." },
    ],
    Compréhension: [
      { n: 3, stamp: "Multistructurel", comment: "Tu identifies plusieurs éléments, mais ils restent juxtaposés. L'étape suivante : les faire dialoguer." },
      { n: 6, stamp: "Relationnel",     comment: "Excellent : ici tu relies la métaphore au thème global. Reproduis ce geste ailleurs." },
      { n: 8, stamp: "Unistructurel",   comment: "Un seul élément est analysé dans ce paragraphe. Densifie l'observation." },
    ],
  },

  // 3 catégories d'erreurs les plus fréquentes
  errors: [
    { code: 5, name: "Accord GN", count: 17 },
    { code: 2, name: "Accord GV", count: 14 },
    { code: 1, name: "Syntaxe / subordonnée seule", count: 8 },
  ],
  errorsTotal: 48,

  // Bilan prospectif
  bilan: {
    forces: [
      "Ton hypothèse est claire et soutenue avec cohérence d'un paragraphe à l'autre.",
      "Tu intègres tes citations avec fluidité, sans coupure syntaxique.",
    ],
    defis: [
      "Pousser l'interprétation au-delà du descriptif — chaque procédé mérite une phrase qui dit ce qu'il PRODUIT.",
      "Réviser systématiquement les accords GN et GV avant la remise.",
    ],
    pistes: [
      "Pour le prochain artefact : après chaque citation, ajoute une phrase qui commence par « Cet effet révèle que… »",
      "Prévois 15 minutes de relecture dédiée uniquement aux accords, texte en main, avant de remettre.",
    ],
  },
};

// Métadonnées des tampons : lettre-code (visible sur le tampon) + glyphe d'icône + famille
// Lettres-codes telles qu'elles apparaissent sur les vrais tampons de l'application
const STAMP_META = {
  // Action
  "Repérage":     { code: "E", glyph: "✓",  family: "Action" },        // sceau plein
  "Liaison":      { code: "B", glyph: "✓",  family: "Action" },        // sceau cranté
  "Ouverture":    { code: "T", glyph: "✓",  family: "Action" },        // sceau étoilé
  "Incertain":    { code: "?", glyph: "?",  family: "Action" },
  "Incomplet":    { code: "—", glyph: "⌃",  family: "Action" },
  "Inexact":      { code: "—", glyph: "✕",  family: "Action" },
  // Observations
  "HOC":          { code: "H", glyph: "⌬",  family: "Observations" },
  "Mécanisme":    { code: "M", glyph: "⚙",  family: "Observations" },
  "Procédé":      { code: "P", glyph: "⚙",  family: "Observations" },
  "Relation":     { code: "—", glyph: "⇌",  family: "Observations" },
  "Rupture":      { code: "—", glyph: "⌇",  family: "Observations" },
  "Approfondir":  { code: "A", glyph: "↧",  family: "Observations" },
  "Confusion":    { code: "C", glyph: "≋",  family: "Observations" },
  "Répétition":   { code: "R", glyph: "↻",  family: "Observations" },
  "Preuve":       { code: "—", glyph: "⊘",  family: "Observations" },
  "Intégration":  { code: "I", glyph: "❝",  family: "Observations" },
  "Attention":    { code: "—", glyph: "△",  family: "Observations" },
  "Soupçon":      { code: "—", glyph: "⌖",  family: "Observations" },
  // Compréhension (niveaux SOLO)
  "Préstructurel":    { code: "0",  glyph: "0",  family: "Compréhension" },
  "Unistructurel":    { code: "1",  glyph: "I",  family: "Compréhension" },
  "Multistructurel":  { code: "2",  glyph: "II", family: "Compréhension" },
  "Relationnel":      { code: "3",  glyph: "III", family: "Compréhension" },
  "Étendu":           { code: "4",  glyph: "IV", family: "Compréhension" },
};

// Métadonnées de famille : couleurs alignées sur l'app (cyan / orange / vert)
const FAMILY_META = {
  Action:         { label: "Action",         color: "#27b9e0", hint: "Gestes d'écriture" },
  Observations:   { label: "Observations",   color: "#b85a3a", hint: "Procédés repérés" },
  "Compréhension":{ label: "Compréhension",  color: "#5fb84a", hint: "Niveau SOLO" },
};

Object.assign(window, { FEEDBACK, STAMP_META, FAMILY_META });
