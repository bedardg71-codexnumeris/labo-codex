#!/usr/bin/env node

/**
 * Générateur de pack de démarrage complet
 * Génère des données fictives réalistes avec les formats exacts de l'app
 */

const fs = require('fs');

// Charger le pack de base
const packBase = JSON.parse(fs.readFileSync('pack-demarrage.json', 'utf8'));

// ============================================
// CARTOUCHES
// ============================================
packBase.cartouches_GRILLE1759243306842 = {
  "id": "CART_DEMO_2025",
  "grilleId": "GRILLE1759243306842",
  "nom": "Rétroactions Global-5",
  "contexte": "Voici quelques observations sur ton travail.",
  "criteres": [
    {"id": "CR1759243306842", "nom": "Structure"},
    {"id": "CR1759243331050", "nom": "Rigueur"},
    {"id": "CR1759243365467", "nom": "Plausibilité"},
    {"id": "CR1759243379949", "nom": "Nuance"},
    {"id": "CR1759243428715", "nom": "Français écrit"}
  ],
  "niveaux": [
    {"code": "I", "nom": "Incomplet"},
    {"code": "D", "nom": "En Développement"},
    {"code": "M", "nom": "Maîtrisé"},
    {"code": "E", "nom": "Étendu"}
  ],
  "commentaires": {
    "CR1759243306842_I": "La structure manque de clarté. Travaille sur l'organisation logique de tes idées.",
    "CR1759243306842_D": "La structure est en développement. On perçoit une organisation, mais elle pourrait être plus explicite.",
    "CR1759243306842_M": "La structure est claire et efficace. Bonne organisation logique.",
    "CR1759243306842_E": "Excellente structure ! Organisation remarquable et transitions fluides.",

    "CR1759243331050_I": "L'analyse manque de rigueur. Approfondis tes observations et ajoute des preuves textuelles.",
    "CR1759243331050_D": "L'analyse est en développement. Certains éléments sont bien identifiés, d'autres moins.",
    "CR1759243331050_M": "Analyse rigoureuse avec preuves textuelles pertinentes.",
    "CR1759243331050_E": "Rigueur exemplaire ! Observations méthodiques et bien étayées.",

    "CR1759243365467_I": "L'interprétation manque de plausibilité. Assure-toi que tes liens sont logiques.",
    "CR1759243365467_D": "Interprétation en développement. Certains liens sont pertinents, d'autres moins solides.",
    "CR1759243365467_M": "Interprétation plausible et bien construite.",
    "CR1759243365467_E": "Interprétation éclairante ! Liens cohérents et convaincants.",

    "CR1759243379949_I": "L'analyse manque de nuance. Évite les simplifications et explore les subtilités.",
    "CR1759243379949_D": "L'analyse gagne en nuance mais certains aspects restent simplistes.",
    "CR1759243379949_M": "Bonne capacité à percevoir les nuances du texte.",
    "CR1759243379949_E": "Sensibilité remarquable aux nuances ! Analyse fine et subtile.",

    "CR1759243428715_I": "Nombreuses erreurs de français. Consacre plus de temps à la révision.",
    "CR1759243428715_D": "Plusieurs erreurs persistent. Améliore ta méthode de révision.",
    "CR1759243428715_M": "Français de bonne qualité. Quelques erreurs mineures.",
    "CR1759243428715_E": "Français impeccable ! Expression soignée et précise."
  },
  "verrouille": false
};

// ============================================
// PRÉSENCES (15 sessions échantillon)
// ============================================
const etudiants = packBase.groupeEtudiants;
const presences = [];

// Dates de sessions (échantillon sur 15 semaines)
const datesSessions = [
  "2026-01-19", "2026-01-20",  // Semaine 1
  "2026-01-27", "2026-01-28",  // Semaine 2  "2026-02-03", "2026-02-04",  // Semaine 3
  "2026-02-10", "2026-02-11",  // Semaine 4
  "2026-02-24", "2026-02-25",  // Semaine 6
  "2026-03-10", "2026-03-11",  // Semaine 8
  "2026-03-24", "2026-03-25",  // Semaine 10
  "2026-04-07", "2026-04-08"   // Semaine 12
];

// Patterns d'assiduité par étudiant
const patternsAssiduité = {
  "2234567": 1.0,    // Émilie - 100%
  "2234568": 0.70,   // Antoine - 70% (absences)
  "2234569": 1.0,    // Léa - 100%
  "2234570": 0.65,   // Thomas - 65% (absences)
  "2234571": 1.0,    // Camille - 100%
  "2234572": 1.0,    // Gabriel - 100%
  "2234573": 1.0,    // Juliette - 100%
  "2234574": 1.0,    // Samuel - 100%
  "2234575": 1.0,    // Rosalie - 100%
  "2234576": 0.75    // Alexandre - 75% (quelques absences)
};

datesSessions.forEach(date => {
  etudiants.forEach(etudiant => {
    const tauxPresence = patternsAssiduité[etudiant.da];
    const present = Math.random() < tauxPresence;

    presences.push({
      date: date,
      da: etudiant.da,
      heures: present ? 2 : 0,
      notes: ""
    });
  });
});

packBase.presences = presences;

console.log(`✅ Généré ${presences.length} entrées de présences`);

// ============================================
// ÉVALUATIONS (5 artefacts × 10 étudiants)
// ============================================
const evaluations = [];

// Profils de performance par étudiant (moyenne générale)
const profilsPerformance = {
  "2234567": {nom: "Émilie Tremblay", moy: 80, progression: 5},      // Bonne, progression
  "2234568": {nom: "Antoine Gagnon", moy: 68, progression: 2},        // Fragile
  "2234569": {nom: "Léa Roy", moy: 93, progression: 3},               // Excellente
  "2234570": {nom: "Thomas Côté", moy: 60, progression: 8},           // À risque, amélioration
  "2234571": {nom: "Camille Bouchard", moy: 82, progression: 4},      // Bonne
  "2234572": {nom: "Gabriel Lavoie", moy: 77, progression: 3},        // Solide
  "2234573": {nom: "Juliette Bergeron", moy: 88, progression: 3},     // Excellente
  "2234574": {nom: "Samuel Morin", moy: 75, progression: 4},          // Solide
  "2234575": {nom: "Rosalie Pelletier", moy: 80, progression: 5},     // Bonne
  "2234576": {nom: "Alexandre Gauthier", moy: 70, progression: 6}     // Amélioration
};

// Artefacts à évaluer
const artefactsEvalues = ["A1", "A2", "A3", "A4", "A5"];
const criteres = packBase.grillesTemplates[0].criteres;

let evalId = 1;
artefactsEvalues.forEach((artefactId, indexArtefact) => {
  etudiants.forEach(etudiant => {
    const profil = profilsPerformance[etudiant.da];

    // Progression: note augmente avec chaque artefact
    const noteBase = profil.moy + (indexArtefact * profil.progression);
    const variation = (Math.random() - 0.5) * 10; // ±5%
    const noteFinal = Math.max(40, Math.min(100, noteBase + variation));

    // Déterminer niveau IDME
    let niveauFinal;
    if (noteFinal < 65) niveauFinal = "I";
    else if (noteFinal < 75) niveauFinal = "D";
    else if (noteFinal < 85) niveauFinal = "M";
    else niveauFinal = "E";

    // Générer notes par critère (proportionnelles à la note finale)
    const criteresevals = criteres.map(critere => {
      const noteCritere = noteFinal + (Math.random() - 0.5) * 10;
      let niveau;
      if (noteCritere < 65) niveau = "I";
      else if (noteCritere < 75) niveau = "D";
      else if (noteCritere < 85) niveau = "M";
      else niveau = "E";

      return {
        critereId: critere.id,
        critereNom: critere.nom,
        niveauSelectionne: niveau,
        retroaction: "",
        ponderation: critere.ponderation
      };
    });

    // Antoine (2234568) a un travail non remis pour A3
    const statutRemise = (etudiant.da === "2234568" && artefactId === "A3") ? "non-remis" : "remis";

    // Date d'évaluation progressive
    const dateEval = new Date(2026, 0, 19 + (indexArtefact * 14)); // +2 semaines par artefact

    evaluations.push({
      id: `EVAL_DEMO_${evalId++}`,
      etudiantDA: etudiant.da,
      etudiantNom: profil.nom,
      groupe: "01",
      productionId: artefactId,
      productionNom: packBase.productions.find(p => p.id === artefactId).titre,
      grilleId: "GRILLE1759243306842",
      grilleNom: "Global-5 FR-HOLIS",
      echelleId: "ECH1759264511178",
      cartoucheId: "CART_DEMO_2025",
      dateEvaluation: dateEval.toISOString(),
      statutRemise: statutRemise,
      criteres: criteresevals,
      noteFinale: Math.round(noteFinal),
      niveauFinal: niveauFinal,
      retroactionFinale: `Évaluation de ${artefactId} pour ${profil.nom}. Niveau global: ${niveauFinal}`,
      optionsAffichage: {
        description: true,
        objectif: true,
        tache: true,
        adresse: true,
        contexte: true
      },
      verrouillee: true
    });
  });
});

packBase.evaluationsSauvegardees = evaluations;

console.log(`✅ Généré ${evaluations.length} évaluations`);

// ============================================
// SAUVEGARDER LE PACK COMPLET
// ============================================
fs.writeFileSync(
  'pack-demarrage-complet.json',
  JSON.stringify(packBase, null, 2),
  'utf8'
);

console.log('');
console.log('✅ Pack de démarrage complet généré !');
console.log('📄 Fichier: pack-demarrage-complet.json');
console.log('');
console.log('Contenu:');
console.log(`  - ${etudiants.length} étudiants`);
console.log(`  - ${packBase.productions.length} productions`);
console.log(`  - ${presences.length} entrées de présences (${datesSessions.length} sessions)`);
console.log(`  - ${evaluations.length} évaluations (${artefactsEvalues.length} artefacts)`);
console.log('  - 1 grille de critères (Global-5 FR-HOLIS)');
console.log('  - 1 échelle (IDME)');
console.log('  - 1 cartouche avec 20 commentaires');
