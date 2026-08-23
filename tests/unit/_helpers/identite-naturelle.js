import { chargerScript } from './charger-script.js';

/**
 * Les VRAIES fonctions de `js/identite-naturelle.js`, prêtes à être injectées
 * comme globaux dans `chargerScript`.
 *
 * CT-15 (23 août 2026) — trois modules du cadre (cours, enseignants,
 * groupes-cours) s'appuient désormais dessus. On injecte les vraies, jamais
 * des faux : un faux permissif ferait passer chaque banc À CÔTÉ de la garde
 * qu'il est censé traverser — c'est exactement le mode d'échec que
 * `sentinelle-452` documente pour `identite-item.js`.
 *
 * @returns {{cleNaturelle: Function, cleNaturelleCours: Function,
 *            cleNaturelleEnseignant: Function, cleNaturelleGroupeCours: Function,
 *            trouverDoublonNaturel: Function}}
 */
export function globauxIdentiteNaturelle() {
    const n = chargerScript('js/identite-naturelle.js');
    return {
        cleNaturelle: n.cleNaturelle,
        cleNaturelleCours: n.cleNaturelleCours,
        cleNaturelleEnseignant: n.cleNaturelleEnseignant,
        cleNaturelleGroupeCours: n.cleNaturelleGroupeCours,
        trouverDoublonNaturel: n.trouverDoublonNaturel
    };
}
