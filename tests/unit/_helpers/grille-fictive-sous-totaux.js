/**
 * Lot « étiquette Sous-total » (13 nov. 2026) : la FORME de la grille étiquetée par Grégoire sur l'iPad (quatre tableaux
 * fermés chacun par un sous-total, un grand total, une conversion), avec des textes INVENTÉS. La première section tient
 * deux tableaux et deux sous-totaux. Partagée par le banc Vitest et la spec WebKit du lot.
 * ⛔ Aucun texte de la grille réelle, aucun nom d'élève ni de collègue.
 *
 * Même format que `grilles-fictives-dissection.js` : des rangées de cases { cs?, l: [[texte, étiquette], …] }.
 */
const critere = (nom, sur) => [{ l: [[nom, 'critere']] }, { l: [['/' + sur, 'ponderation']] }];
const section = (nom) => [{ cs: 2, l: [[nom, 'section']] }];
const sousTotal = (sur, etiquette) => [{ l: [['Sous-total', 'ignorer']] }, { l: [['/' + sur, etiquette]] }];

/**
 * @param {object} [o]
 * @param {string} [o.sousTotal='soustotal'] - l'étiquette posée sur les quatre sous-totaux
 * @param {boolean} [o.total=true] - la rangée du grand total (« /58,5 », « Total »)
 * @param {string|null} [o.conversion=null] - l'étiquette posée sur « Résultat sur 80 » (null : sans étiquette)
 * @param {string} [o.premier='18'] - ce qu'écrit le premier sous-total (ses critères donnent 18)
 */
export function grilleSousTotaux(o = {}) {
    const st = o.sousTotal || 'soustotal';
    return [
        [{ cs: 2, l: [['Grille fictive à sous-totaux', 'titre']] }],
        section('PLAN FICTIF'),
        critere('Idée fictive A', '10'), critere('Idée fictive B', '8'), sousTotal(o.premier || '18', st),
        critere('Idée fictive C', '10'), critere('Idée fictive D', '7,5'), sousTotal('17,5', st),
        section('RÉDACTION FICTIVE'),
        critere('Phrase fictive E', '9'), critere('Phrase fictive F', '8'), sousTotal('17', st),
        section('LANGUE FICTIVE'),
        critere('Accord fictif G', '6'), sousTotal('6', st),
        ...(o.total === false ? [] : [[{ l: [['Grand total', 'ignorer']] }, { l: [['/58,5', 'total']] }]]),
        [{ cs: 2, l: [['Résultat sur 80', o.conversion || null]] }]
    ];
}
