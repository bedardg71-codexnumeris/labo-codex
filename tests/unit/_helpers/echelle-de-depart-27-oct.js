// L'« Échelle de départ (IDME) » TELLE QU'ELLE A ÉTÉ SEMÉE du 27 oct. au 22 nov. 2026 : « PS – Préstructurel » en tête.
//
// Le 22 nov. 2026 (décision de Grégoire, 12 h 27), la source sème « 0 – Aucun » à sa place et « I » commence à 0 %.
// TARIR, PAS RÉPARER : les trimestres déjà installés GARDENT cette échelle-ci, et les deux lecteurs de « PS » (le
// tableau de bord, l'archive d'un trimestre) la lisent encore. Les bancs qui jugeaient ces lecteurs sur ce que semait
// la source les jugent désormais sur ce STOCK, recopié ici tel que `niveauxDefaut` le portait (js/echelles.js,
// jusqu'au commit `a440e7ae`). Une copie profonde à chaque appel : aucun banc ne peut salir celui d'un autre.

const NIVEAUX_27_OCT = [
    { code: 'PS', nom: 'Préstructurel', description: 'Préstructurel', niveauSOLO: 'prestructurel', min: 0, max: 39.99, valeurCalcul: 0, couleur: 'var(--gris-moyen)' },
    { code: 'I', nom: 'Incomplet', description: 'Unistructurel', niveauSOLO: 'unistructurel', min: 40, max: 64.99, valeurCalcul: 40, couleur: 'var(--niveau-attention-critique)' },
    { code: 'D', nom: 'Développement', description: 'Multistructurel', niveauSOLO: 'multistructurel', min: 65, max: 74.99, valeurCalcul: 65, couleur: 'var(--niveau-attention-modere)' },
    { code: 'M', nom: 'Maîtrise', description: 'Relationnel', niveauSOLO: 'relationnel', min: 75, max: 84.99, valeurCalcul: 75, couleur: 'var(--niveau-attention-minimal)' },
    { code: 'E', nom: 'Étendu', description: 'Abstrait étendu', niveauSOLO: 'abstrait_etendu', min: 85, max: 100, valeurCalcul: 100, couleur: 'var(--niveau-attention-nul)' }
];

export function niveauxEchelleDeDepart27Oct() {
    return JSON.parse(JSON.stringify(NIVEAUX_27_OCT));
}

export function echelleDeDepart27Oct() {
    return {
        id: 'ECHELLE_IDME_DEPART',
        nom: 'Échelle de départ (IDME)',
        description: 'Cinq niveaux — Préstructurel, Incomplet, Développement, Maîtrise, Étendu. '
            + 'Les valeurs ponctuelles sont un point de départ : modifie-les, ou remplace '
            + 'l\'échelle entière. Rien ici n\'est une norme du projet.',
        niveaux: niveauxEchelleDeDepart27Oct(),
        verrouille: false,
        dansBibliotheque: true
    };
}

// Les quatre commentaires de la colonne « PS » de la « Cartouche de départ », mots de Grégoire (27 oct., 18 h 38).
// Retirés de la source le 22 nov. (B5) ; une cartouche de départ déjà semée les garde.
export const COMMENTAIRES_PS_27_OCT = {
    CR_COMPREHENSION_PS: 'La réponse ne traite pas encore du sujet demandé. Relis la consigne et repère ce qu\'elle te demande.',
    CR_APPLICATION_PS: 'Les connaissances ne sont pas encore appliquées à la tâche demandée. Repars d\'un exemple vu en classe.',
    CR_ANALYSE_PS: 'Aucun élément de l\'analyse demandée n\'est encore présent. Commence par nommer les éléments à examiner.',
    CR_SYNTHESE_PS: 'La synthèse demandée n\'est pas encore amorcée. Commence par dégager l\'idée principale.'
};
