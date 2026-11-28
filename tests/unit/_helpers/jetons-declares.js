/**
 * SANS DÉCLARATION, PAS DE JETONS (décision de Grégoire, 28 nov. 2026, 8 h 42) — LA DÉCLARATION DE JETONS QU'UN BANC POSE
 * LUI-MÊME dans sa mise en place, quand il accorde ou lit un jeton. Avant, ces bancs s'appuyaient sur le défaut que le
 * moteur prêtait à toute pratique sans réglage (actifs, 2 / 2 / 2) : il ne le prête plus.
 *
 * Les valeurs sont celles de l'ancien défaut, et ce sont celles que les trois pratiques de la démo porteront dans
 * `js/pack-demo-10.js` à la release (troisième amendement, 9 h 05) : la démo se comportera exactement comme avant.
 */
export const JETONS_DECLARES = Object.freeze({
    actif: true,
    delai: { nombre: 2, dureeJours: 2 },
    reprise: { nombre: 2, maxParProduction: 1, archiverOriginale: true },
    repriseCiblee: { actif: true, nombre: 2, plafondNote: null }
});

/** Une pratique (bloc `jetons` à la racine, que le moteur lit) qui porte cette déclaration. */
export function pratiqueQuiDeclareSesJetons(id = 'PR_JETONS', extra = {}) {
    return Object.assign({ id, nom: 'Pratique du banc', type: 'sommative', jetons: JSON.parse(JSON.stringify(JETONS_DECLARES)) }, extra);
}

/**
 * L'ancien réglage explicite du trimestre (`modalitesEvaluation.configurationJetons`), aux mêmes valeurs : une
 * déclaration aussi, qui continue de valoir, et qui sert une pratique codée sans entrée de bibliothèque.
 */
export const ANCIEN_REGLAGE_DU_TRIMESTRE = Object.freeze({
    jetonsActif: true, nombreParEleve: 2, dureeDelaiJours: 2, gestionOriginale: 'archiver', repriseCibleeActif: true
});
