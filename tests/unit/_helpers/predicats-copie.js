import { chargerScript } from './charger-script.js';

/**
 * Les DEUX prédicats RÉELS de `js/pratiques/pratique-registre.js`, posés sur le bac `win` d'un banc :
 *   · `evaluationEntreDansLaNote` (#706) — la copie COMPTE (enregistrée, non remplacée, avec note) ;
 *   · `evaluationNonRemise` (lot A du 16 sept. 2026) — la copie est NON REMISE (« non-remis » ou « non-recu »).
 *
 * Depuis le lot A, les calculs du profil (`profil-etudiant-calculs.js`), les complétions des familles,
 * `snapshots.js`, `profil-etudiant-rapport.js` et `profil-etudiant-sections-affichage.js` les appellent
 * par `window.…` : un banc qui charge l'un de ces modules SANS le registre tombe en TypeError avant de
 * mesurer quoi que ce soit. Le registre est chargé dans un bac jetable et seuls les deux prédicats sont
 * recopiés : le banc garde ses propres stubs pour tout le reste (`designerPratiqueActive`…).
 * Pas une copie de la règle — le code de js/, pour que la sentinelle rougisse si la règle change.
 *
 * @param {object} win - le bac à sable du banc (l'objet `window` vu par les modules chargés)
 * @returns {object} le même `win`
 */
export function chargerPredicatsCopie(win) {
    const registre = chargerScript('js/pratiques/pratique-registre.js', {}, {});
    win.evaluationEntreDansLaNote = registre.evaluationEntreDansLaNote;
    win.evaluationNonRemise = registre.evaluationNonRemise;
    win.evaluationNonRecevable = registre.evaluationNonRecevable;   // lot 30 (17 sept. 2026)
    // 28 oct. 2026 — ce que vaut une copie non recevable dans la note (la règle par défaut du registre)
    win.valeurCopieNonRecevable = registre.valeurCopieNonRecevable;
    win.noteRetenueParLeCalcul = registre.noteRetenueParLeCalcul;
    // Statut « Incomplet ; travail en cours » (25 oct. 2026) — la règle de la remise pour C, et le statut
    win.evaluationCompteCommeRemise = registre.evaluationCompteCommeRemise;
    win.evaluationTravailEnCours = registre.evaluationTravailEnCours;
    return win;
}
