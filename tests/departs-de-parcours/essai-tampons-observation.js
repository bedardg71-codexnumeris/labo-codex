// ⚠ ESSAI SEULEMENT (25 nov. 2026, tampons d'observation, étape 3 ; consigne de Cowork de 9 h 45) — À RETIRER AVANT LA FUSION.
// Ce que partagent la fabrique (essai-tampons-observation.spec.js) et le banc qui ouvre le fichier
// (tests/integration/essai-tampons-observation-depart.spec.js). Un module, pas un fichier d'essais : l'importer ne lance rien.
// ⛔ Tout est fictif, et le dit.
export const FICHIER_ESSAI = 'ESSAI-tampons-observation-lot-3.zip';
export const NOM_ESSAI = 'ESSAI, tampons d’observation (fictif)';
export const PRATIQUE = 'Par standards (fictive, essai)';

/** Deux cibles, deux critères chacune ; aucun texte de critère n'est commun aux deux. */
export const CIBLES = [
    { id: 'cible_essai_a', etiquette: 'Cible fictive A', criteres: [
        { id: 'crit_essai_a1', texte: 'Critère fictif A1', essentiel: true },
        { id: 'crit_essai_a2', texte: 'Critère fictif A2', essentiel: false }] },
    { id: 'cible_essai_b', etiquette: 'Cible fictive B', criteres: [
        { id: 'crit_essai_b1', texte: 'Critère fictif B1', essentiel: true },
        { id: 'crit_essai_b2', texte: 'Critère fictif B2', essentiel: false }] }
];

export const CAT_OBSERVATION = { id: 'cat-essai-observation', nom: 'Catégorie fictive (observation)' };
export const CAT_AUTRE = { id: 'cat-essai-autre', nom: 'Catégorie fictive (autre)' };
/** Trois tampons d'observation : le premier déclare le premier critère de la cible A, mot pour mot. Un quatrième, ailleurs. */
export const TAMPONS = [
    { id: 'custom-essai-1', nom: 'Tampon fictif 1 (critère A1)', categorie: CAT_OBSERVATION.id, marque: '1', critere: CIBLES[0].criteres[0].texte },
    { id: 'custom-essai-2', nom: 'Tampon fictif 2', categorie: CAT_OBSERVATION.id, marque: '2' },
    { id: 'custom-essai-3', nom: 'Tampon fictif 3', categorie: CAT_OBSERVATION.id, marque: '3' },
    { id: 'custom-essai-autre', nom: 'Tampon fictif hors observation', categorie: CAT_AUTRE.id, marque: '×' }
];

/** Trois productions : leur nom dit ce qu'elles renseignent. `cibles` : les ids cochés dans leur fiche. */
export const PRODUCTIONS = [
    { cle: 'une', titre: 'Production fictive : une cible', cibles: [CIBLES[0].id] },
    { cle: 'deux', titre: 'Production fictive : deux cibles', cibles: [CIBLES[0].id, CIBLES[1].id] },
    { cle: 'aucune', titre: 'Production fictive : aucune cible déclarée', cibles: [] }
];
/** Les deux premières personnes du groupe ont une image importée pour chacune des trois productions. */
export const NB_PERSONNES = 4;
export const NB_AVEC_IMAGES = 2;
