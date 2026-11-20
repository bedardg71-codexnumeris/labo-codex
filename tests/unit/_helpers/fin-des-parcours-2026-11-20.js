// LA FIN D'UN PARCOURS, DEPUIS LE 20 NOV. 2026 (plans de travail/CONSIGNE-2026-11-20-essai-parcours.md, A3) : le bouton
// « Parcours suivant » (ou « Voir le parcours suivant ») ne lance plus rien d'office ; il s'appelle « Voir le
// parcours N » et ouvre le panneau « Assistance » devant ce parcours. Les sentinelles des parcours lisent ICI ce que
// la consigne en dit et ce que le moteur et le panneau en écrivent, une seule fois.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');

export const CONSIGNE_20_NOV = lire('plans de travail/CONSIGNE-2026-11-20-essai-parcours.md');
const MOTEUR = lire('js/parcours-moteur.js');
const ASSISTANCE = lire('js/assistance.js');

/** La section d'une lettre de la consigne (« A3. », « B1. », …), jusqu'à la suivante. */
export function sectionDeLaConsigne(repere) {
    const i = CONSIGNE_20_NOV.indexOf('\n' + repere + ' ');
    if (i === -1) throw new Error('consigne du 20 nov. : « ' + repere + ' » introuvable');
    const reste = CONSIGNE_20_NOV.slice(i + 1);
    const fin = reste.slice(1).search(/\n(?:[A-H]\d?\. |[A-H]\. )/);
    return fin === -1 ? reste : reste.slice(0, fin + 1);
}

/** Ce que le panneau écrit pour la suite du parcours de rang n − 1 : le libellé du bouton, la phrase qui le nomme. */
export function suiteEcrite(n, titre) {
    // Écrits une seule fois, dans `suiteDe` (js/assistance.js) ; la consigne de la fin, une seule fois, dans le moteur.
    if (!ASSISTANCE.includes("libelle: 'Voir le parcours ' + n,")) throw new Error('js/assistance.js : le libellé de la suite a changé');
    if (!ASSISTANCE.includes("phrase: 'Suite suggérée : le parcours ' + n + ', « ' + s.titre + ' ».',")) throw new Error('js/assistance.js : la phrase de la suite a changé');
    if (!MOTEUR.includes("function consigneDesDeuxSuites(suite) { return 'Touche « ' + suite.libelle + ' », ou « Terminer »'; }")) throw new Error('js/parcours-moteur.js : la consigne des deux suites a changé');
    return {
        libelle: 'Voir le parcours ' + n,
        phrase: 'Suite suggérée : le parcours ' + n + ', « ' + titre + ' ».',
        consigne: 'Touche « Voir le parcours ' + n + ' », ou « Terminer »'
    };
}

/** Une suite factice pour les fichiers chargés hors du navigateur (`window.Assistance.suiteDe`). */
export const suiteFactice = (n) => () => ({ id: 'suivant', rang: n, titre: 'Suivant', libelle: 'Voir le parcours ' + n, phrase: '', voir: () => {} });
