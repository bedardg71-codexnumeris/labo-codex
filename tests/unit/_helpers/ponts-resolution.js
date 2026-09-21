/**
 * Lot N1a (21 sept. 2026) — LES NOMS DE LA RÉSOLUTION DE LA PRATIQUE ACTIVE, POUR UN BANC.
 *
 * Depuis ce lot, tout ce qui calcule ou écrit une note passe par `resoudrePratiqueActive`
 * (pratique-registre.js), qui lit le pointeur du groupe-cours par `window.lirePointeurPratiqueGroupeCours`
 * (modes.js). Un banc qui charge le VRAI registre dans un bac (`win`) et bouchonne le pointeur
 * pose ici, en une ligne, le pointeur sur le bac et les noms nus que les autres modules appellent.
 *
 * ⚠ Le pointeur est rendu TEL QU'IL EST ÉCRIT : null quand rien n'est assigné. Aucun repli ici non plus.
 *
 * @param {Object} win - le bac qui a chargé (ou chargera) pratique-registre.js
 * @param {function(): (string|null)} lirePointeur - le bouchon du pointeur du groupe-cours actif
 * @returns {Object} à étaler dans les globaux passés à `chargerScript`
 */
export function pontsResolution(win, lirePointeur) {
    win.lirePointeurPratiqueGroupeCours = lirePointeur;
    return {
        lirePointeurPratiqueGroupeCours: lirePointeur,
        resoudrePratiqueActive: (...a) => win.resoudrePratiqueActive(...a),
        designerPratiqueActive: (...a) => win.designerPratiqueActive(...a),
        trouverPratiqueEnBibliotheque: (...a) => win.trouverPratiqueEnBibliotheque(...a)
    };
}
